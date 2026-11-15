# Supabase для UniPath — настройка

Один раз, примерно 10 минут. Всё делается в веб-интерфейсе supabase.com.

## 1. Проект
1. supabase.com → **New project**. Name: `unipath`, Region: **Central EU (Frankfurt)**.
2. Database password — придумать и сохранить у себя (в код и чат не нужен).

## 2. Таблицы и права (миграция)
1. **SQL Editor → New query**.
2. Вставить целиком файл `supabase/migrations/20261115000001_profiles_leads_rate_limits.sql` → **Run**.
   Миграцию можно запускать повторно — она ничего не сломает.

## 3. Ссылки для входа
**Authentication → URL Configuration**:
- **Site URL**: адрес сайта (сначала `http://localhost:3000`, после деплоя — домен).
- **Redirect URLs** — добавить:
  - `http://localhost:3000/auth/callback`
  - `https://<ваш-домен>/auth/callback` (после деплоя на Vercel)

## 4. Администратор
1. **Authentication → Users → Add user → Create new user**: ваш email, включить **Auto Confirm User**
   (пароль любой — входим по ссылке из письма).
2. **SQL Editor**: открыть `supabase/snippets/make-admin.sql`, вписать email, **Run**.

> Встроенная почта Supabase отправляет письма только на адреса участников
> вашей команды в Supabase и не больше нескольких в час. Для админа это
> подходит, если email совпадает с аккаунтом Supabase. Для учеников
> (этап 4) подключим свой SMTP, например Resend.

## 5. Переменные окружения
**Project Settings → API** (или **API Keys**):

| Переменная | Где взять | Секрет? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | нет |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ключ `anon` / `publishable` | нет (виден в браузере) |
| `SUPABASE_SERVICE_ROLE_KEY` | ключ `service_role` / `secret` | **ДА — только сервер** |

Локально — в `.env.local` (см. `.env.example`), на Vercel — **Settings → Environment Variables**.
Секретный ключ никогда не коммитить и не отправлять в чаты.

## Что где
- `leads` — заявки. Создаются только сервером (`/api/leads`), читать и менять может только админ.
- `profiles` — роли (`student` / `teacher` / `admin`), создаётся автоматически для каждого пользователя.
- `rate_limits` — счётчики антиспама, доступны только серверу.
