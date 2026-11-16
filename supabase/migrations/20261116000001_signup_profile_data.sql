-- =====================================================================
-- UniPath · Регистрация учеников: данные профиля из формы регистрации
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
-- =====================================================================

-- Когда родитель/законный представитель дал согласие на обработку данных
alter table public.profiles add column if not exists consent_at timestamptz;

-- Профиль создаётся при регистрации. Имя, класс и согласие берутся из
-- user_metadata (форма /register). Роль ВСЕГДА 'student' — повысить
-- может только админ, метаданные пользователя на роль не влияют.
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
  -- без приведения типов: любое значение, кроме true, — нет согласия
  v_consent boolean := (v_meta ->> 'consent') = 'true';
begin
  insert into public.profiles (id, role, full_name, grade, consent_at)
  values (new.id, 'student', v_name, v_grade, case when v_consent then now() end)
  on conflict (id) do nothing;
  return new;
end;
$$;
