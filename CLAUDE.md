# UniPath — CLAUDE.md

Памятка для Claude и разработчиков. Читать перед любой работой в репозитории.

## О проекте

**UniPath** — образовательный стартап: подготовка учеников 9–10 классов к поступлению в зарубежные вузы.
Четыре направления: **SAT**, **IELTS**, **EC** (внеклассные активности, extracurriculars) и **эссе**.

- Язык интерфейса: **только русский**. Валюта цен: тенге (₸).
- Аудитория: школьники 14–16 лет и их родители. Мы храним телефоны несовершеннолетних → нужно согласие родителя.
- Сайт = лендинг + бесплатные инструменты (лид-магниты) + CRM заявок + личные кабинеты (ученик / учитель / админ).

## Стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 16 (App Router, Turbopack, `cacheComponents: true`) + TypeScript (strict) |
| Стили | Tailwind CSS v4, дизайн-токены в `@theme` (`src/app/globals.css`) |
| UI | Свои базовые компоненты (`src/components/ui`), иконки `lucide-react` |
| Анимации | `motion` (бывший framer-motion), всегда с учётом `prefers-reduced-motion` |
| БД / Auth / файлы | Supabase: Postgres, Auth (magic link по email), Storage, RLS |
| ИИ | Claude API, модель `claude-haiku-5-5`, SDK `@anthropic-ai/sdk`, **только на сервере** |
| Валидация | `zod` (общие схемы для клиента и сервера) |
| Деплой | Vercel + Vercel Analytics |
| Пакетный менеджер | npm |

## Структура (целевая)

```
/
├─ CLAUDE.md
├─ README.md
├─ .env.example              # все переменные окружения, без значений
├─ content/                  # данные лендинга: курсы, пакеты, наставники, FAQ (потом → БД)
│  ├─ site.ts                # контакты, соцсети, тексты hero
│  ├─ directions.ts          # 4 направления и 8 курсов с ценами «от»
│  ├─ mentors.ts
│  └─ faq.ts
├─ public/                   # фото наставников, og-image
├─ supabase/
│  ├─ migrations/            # SQL-миграции (таблицы, RLS-политики, функции)
│  └─ seed.sql               # оригинальные вопросы SAT и т.п.
└─ src/
   ├─ app/
   │  ├─ (marketing)/        # лендинг /, политика конфиденциальности
   │  ├─ tools/              # essay-check, sat-mini, chances
   │  ├─ dashboard/          # кабинет ученика
   │  ├─ teacher/            # панель учителя
   │  ├─ admin/              # панель админа
   │  ├─ report/[token]/     # отчёт для родителя (только чтение)
   │  ├─ auth/               # вход по magic link, callback
   │  └─ api/                # route handlers (лиды, ИИ, экспорт CSV)
   ├─ components/
   │  ├─ ui/                 # Button, Card, GlassCard, Input, Textarea, Select, Badge, Section, …
   │  └─ sections/           # секции лендинга (Hero, Route, Directions, …)
   ├─ lib/
   │  ├─ supabase/           # client.ts (browser), server.ts (SSR), admin.ts (service role, server-only)
   │  ├─ ai/                 # клиент Claude, системные промпты (server-only)
   │  ├─ validation/         # zod-схемы
   │  ├─ rate-limit.ts
   │  └─ utils.ts
   └─ styles/                # globals.css с токенами
```

## Особенности Next.js 16 (важно!)

Версия новее, чем данные обучения ИИ. Перед кодом сверяться с документацией в `node_modules/next/dist/docs/` (см. `AGENTS.md`).

- Включён `cacheComponents`: сегментные конфиги вроде `dynamicParams`/`dynamic` несовместимы — не использовать.
- `params`/`searchParams`/`cookies()`/`headers()` — асинхронные (`await`). Типы `PageProps<"/route">`, `LayoutProps<"/">` генерируются (`npx next typegen`).
- `next/image`: `priority` устарел → для LCP-картинки `fetchPriority="high"` + `loading="eager"`.
- `middleware` переименован в `proxy`.

## Дизайн-система

Стиль: тёплый, почти монохромный, премиальный, много воздуха.

- **Цвета**: фон `#F5F4F0` (тёплый off-white), текст — почти чёрный, серые оттенки, белый. Цвет допускается **только** в маленьких пастельных иконках/бейджах направлений.
- **Шрифты**: заголовки — serif с кириллицей (Playfair Display / Cormorant Garamond через `next/font`), второе ключевое слово заголовка — *курсивом*. Основной текст — Inter / Manrope.
- **Кнопки**: капсулы (`rounded-full`). Primary — чёрная, secondary — белая с тонкой рамкой.
- **Карточки**: стеклянные (glassmorphism: полупрозрачный белый + `backdrop-blur` + тонкая светлая рамка), мягкие тени.
- Все токены (цвета, шрифты, отступы, радиусы, тени) — в `globals.css` / конфиге Tailwind. **Хардкод цветов и размеров в компонентах запрещён.**
- Базовые компоненты (`src/components/ui`): `Button` (капсула; с `href` — ссылка), `Card`, `GlassCard`, `Badge`, `IconTile` (пастельная иконка), `Input`, `Textarea`, `Select`, `Checkbox`, `Section`, `Container`, `Heading` (serif + курсив), `Accordion` (на `<details>`), `AvatarStack`, `Reveal` (анимация появления).
- Пастельные тона направлений: `sat`, `ielts`, `ec`, `essay` (утилиты `bg-sat`, `text-sat-ink` и т.д.).
- Hero: «пазл поступления» — SVG (`AdmissionPuzzle.tsx`, геометрия в `src/lib/puzzle.ts`). Подписи деталей — `content/site.ts → hero.puzzle`.
- Страницы собираются **только** из базовых компонентов `src/components/ui`. Нужен новый вариант — расширяем компонент, а не пишем разметку с нуля.

## Правила разработки

1. **Работаем по этапам** (см. ниже). После каждого этапа — остановка, отчёт (что сделано, как запустить, как проверить) и ожидание «ок» от заказчика.
2. **Коммит после каждого рабочего шага.** Сообщения коммитов — по-русски или по-английски, в повелительном наклонении, кратко по сути.
3. **Никаких выдуманных данных.** Цены, отзывы, баллы, вузы наставников, количество учеников, статистика — только `[ЗАГЛУШКА]` (в `content/` — константа с пометкой). Нельзя придумывать «98% поступивших» и т.п.
4. **Вопросы SAT — только оригинальные**, в стиле SAT. Копировать материалы College Board запрещено.
5. **ИИ не пишет эссе за ученика.** Только обратная связь. Это закреплено в системном промпте и не обходится пользовательским вводом.
6. Mobile-first: каждую страницу проверяем на ширине 360px.
7. Доступность: семантические `<button>` / `<a>`, `label` у каждого поля, видимый focus, контраст текста ≥ 4.5:1, `alt` у изображений, анимации отключаются при `prefers-reduced-motion`.
8. TypeScript strict, без `any`. Перед коммитом: `npm run lint` и `npm run build` без ошибок.
9. Серверные компоненты по умолчанию; `"use client"` — только где нужна интерактивность.

## Безопасность (на всех этапах)

- `ANTHROPIC_API_KEY` и `SUPABASE_SERVICE_ROLE_KEY` — **только на сервере**. Модули с ними импортируют `server-only`. Никаких `NEXT_PUBLIC_` для секретов.
- **RLS включён на всех таблицах.** Новая таблица без политик не мержится.
- Роли: `student`, `teacher`, `admin` (в `profiles.role`). Ученик видит только своё; учитель — своих учеников и свою секцию; админ — всё.
- **Rate limit** на все API-роуты / server actions, особенно на ИИ (эссе: 3 проверки в день на телефон/IP).
- Ввод пользователя всегда валидируется `zod` на сервере (клиентская валидация — только для UX).
- Антиспам форм: honeypot-поле + rate limit.
- У вызовов Claude ограничен `max_tokens`, обрабатываются таймауты и ошибки API; пользователю — понятное сообщение, без стектрейсов.
- Ссылки-отчёты для родителей — по случайному неугадываемому токену, только чтение, с возможностью отозвать.

## Переменные окружения

См. `.env.example`. Локально — `.env.local` (в git не попадает).

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only
ANTHROPIC_API_KEY=                # server-only
NEXT_PUBLIC_SITE_URL=
```

Контакты (телефон/WhatsApp, Instagram, email) — в `content/site.ts`.

## Курсы и цены (утверждено, ноябрь 2026)

- 8 курсов, по 2 на направление: SAT Intensive / SAT Pro, IELTS Base / IELTS 7.0+, EC Roadmap / Project Lab, Storytelling / Essay Review. Данные — `content/directions.ts`.
- На сайте цены показываются как «от» (нижняя граница утверждённой вилки).
- Формат: **только онлайн**. Групповые курсы (SAT, IELTS, Storytelling) — потоки до 15–20 учеников; EC и Essay Review — индивидуально.
- Пакетов (годовых наборов курсов) нет — убраны по решению заказчика.

## Этапы

| # | Этап | Статус |
|---|---|---|
| 0 | CLAUDE.md, план, уточняющие вопросы | готово |
| 1 | Дизайн-токены, базовые компоненты, лендинг `/` | готово |
| 2 | Заявки (Supabase `leads`) + `/admin` для заявок | готово |
| 3 | Бесплатные инструменты: эссе (ИИ), мини-тест SAT, калькулятор шансов | — |
| 4 | Личный кабинет ученика `/dashboard` | — |
| 5 | Панели учителя и админа, отчёт для родителя | — |
| 6 | Запуск: SEO, аналитика, политика, README, Lighthouse 90+ | — |

## Supabase

- Миграции — `supabase/migrations/*.sql`, применяются через SQL Editor (инструкция — `supabase/README.md`).
- Клиенты: `src/lib/supabase/server.ts` (сессия пользователя, RLS), `admin.ts` (service role, только сервер), `proxy.ts` (обновление сессии в `src/proxy.ts`).
- Проверка роли — только через `getAuth()` из `src/lib/auth.ts` (страницы, server actions, route handlers).
- Заявки создаются только сервером: `POST /api/leads` → `insertLead()` (`src/lib/leads.ts`). Инструменты этапа 3 используют тот же путь с `source`.
- Rate limit — `rateLimit()` из `src/lib/rate-limit.ts` (Postgres-функция `rate_limit_hit`).
- Доступ к кабинету: `profiles.access` (`free` после регистрации → `active` выдаёт админ). Блокировка: `profiles.blocked_at` + бан в Supabase Auth.
- Действия админа над пользователями — `src/app/admin/users/actions.ts`, каждое пишет в `admin_audit_log` через `audit()`.
- Шаблоны писем Auth — `supabase/templates/*.html`, вставляются вручную: Authentication → Emails → Templates.

## Деплой

- Прод: https://unimax-fawn.vercel.app
- Vercel, проект `unimax`, сборка из ветки `claude/elegant-johnson-ei5w5l` (сейчас основная ветка репозитория).
- Переменные окружения задаются в Vercel → Settings → Environment Variables (см. `.env.example`).
- После получения домена добавить `https://<домен>/auth/callback` в Supabase → Authentication → URL Configuration.

## Команды

```
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```
