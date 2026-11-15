-- Назначить пользователя администратором.
-- 1) Supabase → Authentication → Users → Add user → Create new user
--    (email, «Auto Confirm User» включить; пароль любой — входим по ссылке из письма).
-- 2) Заменить email ниже и выполнить в SQL Editor.

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'ВАШ_EMAIL@example.com');

-- Проверка:
select u.email, p.role
from auth.users u
join public.profiles p on p.id = u.id
where p.role = 'admin';
