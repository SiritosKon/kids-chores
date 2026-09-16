# Фаза 3 — Будущие фичи и расширенная C4

Бэклог фич, которые могут появиться, и как они достраивают целевую архитектуру (фаза 2).
Оцениваем: что фича добавляет к системе (какие контейнеры/данные), приоритет и сложность.

## Бэклог фич

| Фича | Что добавляет | Приоритет | Сложность |
|---|---|---|---|
| **Мультиопекун** (оба родителя, бабушки) | роли/инвайты в семью | Высокий | S |
| **Магазин наград** (копить → тратить баллы) | `reward_catalog`, `purchases`, баланс баллов | Высокий | M |
| **Геймификация** (стрики, уровни, достижения) | правила/движок начислений, `achievements` | Средний | M |
| **Push-напоминания и расписания** | Notification-сервис, шаблоны, расписания | Высокий | M |
| **Аналитика для родителя** (тренды, дашборд) | Analytics-сервис + витрина данных | Средний | M |
| **Локализация** (несколько языков) | i18n на клиенте, локали на сервере | Средний | S |
| **Подписка Pro** (приватность, облако, семьи) | Billing (Stripe), тарифы, лимиты | Средний | M |
| **Нативная обёртка** (Capacitor) для норм. push на iOS | сборка iOS/Android, нативные каналы | Средний | M |
| **Интеграции** (календарь, школа, колонки) | внешние коннекторы | Низкий | L |
| **Роли/возрастные режимы** (ребёнок ≠ админ) | тонкие права в API | Высокий | S |

## Расширенная C4 — Container (после добрасывания фич)

```mermaid
C4Container
  title Container — Chores Platform (расширенная)
  Person(parent, "Родитель")
  Person(child, "Ребёнок")
  System_Boundary(sys, "Chores Platform") {
    Container(spa, "PWA / нативная обёртка", "Vue 3 + Quasar (+ Capacitor)", "Offline-first UI, синк, локали")
    Container(api, "Backend API / BFF", "NestJS", "REST/GraphQL + WebSocket, авторизация, правила")
    Container(gamify, "Движок начислений", "Node", "Баллы, стрики, уровни, достижения")
    Container(notify, "Notification-сервис", "Node", "Расписания, шаблоны, отправка push/email")
    Container(analytics, "Analytics-сервис", "Node", "Сбор событий, агрегаты, дашборды")
    Container(billing, "Billing", "Node + Stripe", "Тарифы, лимиты, подписки")
    Container(worker, "Воркеры/шедулер", "Node", "Роллаперы недели, джобы, рассылки")
    ContainerDb(db, "База данных", "PostgreSQL", "Семьи, дети, задачи, отметки, награды, покупки, роли")
    ContainerDb(warehouse, "Витрина аналитики", "ClickHouse/PG", "События и агрегаты для дашбордов")
    ContainerDb(cache, "Кеш/очереди", "Redis", "Сессии, rate limit, брокер задач")
    Container(storage, "Файлы", "S3/R2 + CDN", "Аватарки, выгрузки")
  }
  System_Ext(idp, "Identity Provider", "OAuth/JWT")
  System_Ext(push, "Push", "APNs/FCM")
  System_Ext(email, "Email", "SMTP/провайдер")
  System_Ext(pay, "Платёжный провайдер", "Stripe")

  Rel(parent, spa, "Пользуется", "HTTPS")
  Rel(child, spa, "Пользуется", "HTTPS")
  Rel(spa, api, "API + realtime", "HTTPS/WebSocket")
  Rel(spa, storage, "Аватарки/файлы", "HTTPS")
  Rel(api, db, "Читает/пишет", "SQL")
  Rel(api, cache, "Кеш/очередь")
  Rel(api, gamify, "Начисления")
  Rel(api, billing, "Тарифы/лимиты")
  Rel(api, analytics, "События")
  Rel(analytics, warehouse, "Пишет агрегаты")
  Rel(worker, db, "Роллаперы/джобы")
  Rel(worker, notify, "Триггерит рассылки")
  Rel(notify, push, "Push")
  Rel(notify, email, "Email")
  Rel(billing, pay, "Платежи/вебхуки")
  Rel(api, idp, "Аутентификация")
```

## Как читать таблицу и C4 вместе

- Каждая фича из бэклога = один или несколько **новых контейнеров/таблиц** на расширенной диаграмме.
- Начинаем с высокоприоритетных S/M (мультиопекун, роли, магазин наград, push) — они не тянут тяжёлых внешних систем.
- Тяжёлые (аналитика-витрина, billing, нативная обёртка, интеграции) — отдельными вехами.

## Открытые вопросы (решить перед фазой 2→3)

- Хостинг бэка (managed PG + контейнеры vs serverless).
- Auth: своё решение vs внешний (Clerk/Auth0/Supabase).
- Realtime: свой WebSocket vs готовый (Supabase Realtime / Ably).
- Нужен ли реально нативный клиент (из-за ограничений iOS PWA-push).
