-- =====================================================================
-- UniPath · Этап 2: профили (роли), заявки, лимиты запросов
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
--
-- Права на таблицы выдаются ЯВНО (GRANT) — миграция работает и при
-- выключенной опции «Automatically expose new tables». Доступ к строкам
-- дополнительно ограничен RLS-политиками.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- PROFILES: роль пользователя (student / teacher / admin)
-- Расширяется на этапе 4 (кабинет ученика).
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  full_name    text check (char_length(full_name) <= 120),
  grade        text check (char_length(grade) <= 20),
  phone        text check (char_length(phone) <= 20),
  parent_phone text check (char_length(parent_phone) <= 20),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Права: читать (своё) и менять (только админ) — через RLS ниже.
revoke all on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Проверка «текущий пользователь — админ». security definer, чтобы не
-- зацикливаться на RLS самой таблицы profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Пользователь видит свой профиль, админ — все.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- Менять профили (в т.ч. роли) может только админ.
-- Редактирование своего профиля учеником добавим на этапе 4 без доступа к role.
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Профиль создаётся автоматически при появлении пользователя в auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- LEADS: заявки с лендинга и бесплатных инструментов
-- Вставка — только с сервера (service role, после zod-валидации и rate limit).
-- Чтение и изменение — только админ.
-- ---------------------------------------------------------------------
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 2 and 80),
  phone      text not null check (phone ~ '^[0-9]{10,15}$'),
  grade      text not null check (char_length(grade) <= 20),
  section    text not null check (char_length(section) <= 20),
  comment    text not null default '' check (char_length(comment) <= 1000),
  source     text not null default 'landing' check (char_length(source) <= 40),
  status     text not null default 'new'
             check (status in ('new', 'contacted', 'trial', 'paid', 'lost')),
  notes      text not null default '' check (char_length(notes) <= 5000),
  -- когда дано согласие родителя/законного представителя на обработку данных
  consent_at timestamptz not null
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_section_idx on public.leads (section);

alter table public.leads enable row level security;

drop policy if exists leads_admin_select on public.leads;
create policy leads_admin_select on public.leads
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists leads_admin_update on public.leads;
create policy leads_admin_update on public.leads
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists leads_admin_delete on public.leads;
create policy leads_admin_delete on public.leads
  for delete to authenticated
  using ((select public.is_admin()));

-- Права: anon — ничего; authenticated — только чтение/изменение/удаление
-- (и то лишь админ, см. политики). Создаёт заявки только сервер (service role).
revoke all on public.leads from anon, authenticated;
grant select, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RATE LIMITS: счётчики запросов (фиксированное окно)
-- Доступ только у сервера (service role) через функцию rate_limit_hit.
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  key          text primary key check (char_length(key) <= 200),
  window_start timestamptz not null default now(),
  count        integer not null default 0
);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;
grant all on public.rate_limits to service_role;

-- Засчитывает обращение и возвращает true, если лимит ещё не превышен.
create or replace function public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_window interval := make_interval(secs => p_window_seconds);
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    count        = case when r.window_start < now() - v_window then 1 else r.count + 1 end,
    window_start = case when r.window_start < now() - v_window then now() else r.window_start end
  returning count into v_count;

  -- изредка чистим старые записи
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
