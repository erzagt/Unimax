# Шаблоны писем Supabase Auth

Вставляются вручную: **Authentication → Emails → Templates** (нужен свой SMTP).

| Шаблон в Supabase | Файл | Тема письма (Subject) |
|---|---|---|
| Magic link or OTP | `magic-link.html` | `Код для входа в UniPath: {{ .Token }}` |
| Confirm signup | `confirm-signup.html` | `Добро пожаловать в UniPath — код {{ .Token }}` |

Кнопка ведёт на `{{ .SiteURL }}/auth/confirm?token_hash=…` — работает на любом
устройстве. Код `{{ .Token }}` можно ввести на странице входа.
**Site URL** в Authentication → URL Configuration должен быть адресом сайта.
