-- =====================================================================
-- UniPath · Управление пользователями: доступ, блокировка, заметки,
-- связь заявки с аккаунтом, журнал действий админов.
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PROFILES: email (для поиска), доступ к кабинету, блокировка
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists email      text,
  add column if not exists access     text not null default 'free',
  add column if not exists blocked_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_access_check') then
    alter table public.profiles
      add constraint profiles_access_check check (access in ('free', 'active'));
  end if;
end $$;

-- email из auth.users для уже существующих пользователей
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is distinct from u.email;

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_role_idx on public.profiles (role);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Новый пользователь: профиль с email, именем, классом, согласием.
-- Роль ВСЕГДА student, доступ ВСЕГДА free — повышает только админ.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_name text := nullif(left(trim(coalesce(v_meta ->> 'full_name', '')), 120), '');
  v_grade text := nullif(left(trim(coalesce(v_meta ->> 'grade', '')), 20), '');
  v_consent boolean := (v_meta ->> 'consent') = 'true';
begin
  insert into public.profiles (id, role, access, email, full_name, grade, consent_at)
  values (new.id, 'student', 'free', new.email, v_name, v_grade, case when v_consent then now() end)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Смена email в auth.users → обновить профиль
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

-- ---------------------------------------------------------------------
-- Заметки админа о пользователе — отдельная таблица, чтобы ученик
-- не мог прочитать их через свой профиль. Доступ только у админа.
-- ---------------------------------------------------------------------
create table if not exists public.profile_admin_notes (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  notes      text not null default '' check (char_length(notes) <= 5000),
  updated_at timestamptz not null default now()
);

alter table public.profile_admin_notes enable row level security;
revoke all on public.profile_admin_notes from anon, authenticated;
grant select, insert, update, delete on public.profile_admin_notes to authenticated;
grant all on public.profile_admin_notes to service_role;

drop policy if exists profile_admin_notes_admin on public.profile_admin_notes;
create policy profile_admin_notes_admin on public.profile_admin_notes
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- LEADS: связь заявки с созданным из неё аккаунтом
-- ---------------------------------------------------------------------
alter table public.leads
  add column if not exists profile_id uuid references public.profiles (id) on delete set null;

-- ---------------------------------------------------------------------
-- ЖУРНАЛ ДЕЙСТВИЙ АДМИНОВ. Пишет только сервер (service role),
-- читает только админ. Записи не редактируются.
-- ---------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  actor_id     uuid references auth.users (id) on delete set null,
  actor_email  text,
  action       text not null check (char_length(action) <= 50),
  target_type  text not null check (target_type in ('user', 'lead')),
  target_id    text,
  target_label text check (char_length(target_label) <= 200),
  details      jsonb not null default '{}'::jsonb
);

create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon, authenticated;
grant select on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;
grant usage, select on sequence public.admin_audit_log_id_seq to service_role;

drop policy if exists admin_audit_log_select on public.admin_audit_log;
create policy admin_audit_log_select on public.admin_audit_log
  for select to authenticated
  using ((select public.is_admin()));
