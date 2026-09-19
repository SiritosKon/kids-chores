# Архитектура фронта — Feature-Sliced Design

Слои сверху вниз; импорт разрешён **только вниз**, внутри слоя — не разрешён.

| Слой | Что лежит | Примеры |
|---|---|---|
| `app` | Точка сборки: провайдеры (pinia, Quasar), глобальные стили, корневой `App.vue` | `app/providers`, `app/styles` |
| `pages` | Экраны целиком | `pages/home` |
| `widgets` | Самостоятельные композиции для экрана | `tasks-board`, `goal-meter-board`, `rewards-panel`, `parent-menu` |
| `features` | Пользовательские действия | `parent-login`, `select-date`, `award-reward`, `rollback-spend`, `wallet-history`, `whats-new`, `backup` |
| `entities` | Предметные сущности: схема, состояние, доступ к данным | `child`, `task`, `reward`, `completion`, `spend`, `wallet`, `app-version`, `parent-session` |
| `shared` | Код без привязки к предметной области | `shared/api/db`, `shared/lib`, `shared/ui` |

## Правила, которые держим

- **Вход в слайс — только через `index.ts`.** Внутрь (`entities/child/model/defaults`) снаружи не ходим.
- **Сущность не импортирует сущность.** Единственное исключение — `wallet`, который считает баланс по
  отметкам и списаниям; он ходит через явные входы `entities/completion/@x/wallet` и `entities/spend/@x/wallet`.
- **Типы выводим из zod-схем** (`z.infer`), руками не дублируем. Схема стоит на границе:
  чтение из IndexedDB и импорт JSON — единственные места, где данные валидируются.
  Внутри слоёв дальше идут обычные типы.
- **Снимки не переписываем.** `completions.points` и `spends.cost` — цена на момент события;
  правка каталога задач или наград не двигает историю.
- **Строгий TypeScript.** `npm run typecheck` (vue-tsc) прогоняется в CI и внутри `npm run build`.

## Что изменится с приходом бэкенда

Точка подмены — `entities/*/api`. Репозитории меняют реализацию с Dexie на HTTP, схемы остаются
теми же (ими же валидируем ответы сервера), UI не трогаем.
