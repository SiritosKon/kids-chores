# Kids Chores

A small offline-first PWA that helps parents motivate kids with daily chores. Kids tick off their
tasks, earn points, fill a goal meter and trade points for rewards; days in a row with every task
done build a streak with its own prize. A parent PIN protects everything that changes the rules.

The app is in **alpha**. It has no backend: all data lives in the browser's IndexedDB on the
device, and nothing is sent anywhere. The interface is in Russian.

Live build: <https://siritoskon.github.io/kids-chores/>

## Why

The project started as a tracker for the author's own kids on a shared iPad. It is also a
playground for building the product end to end: a local-only client first, then a backend,
sync between devices and accounts (see the roadmap in the `research` branch).

## Features

- **Daily board.** One row per task, one column per child, "Принять" to confirm the day. Past
  days can be edited in parent mode.
- **Points and rewards.** Each task is worth points; rewards cost points and can live in the shop,
  be a streak-only prize or stay hidden as a surprise. Spends can be rolled back.
- **Goal meter and wallet.** A progress bar per child and a wallet history grouped by day.
- **Streaks.** Days in a row with all tasks done earn a configurable prize (reward and/or points)
  every N days. Changing tasks or the rule never rewrites past streaks or prizes.
- **Bonus.** Optional extra points for a day with every task done.
- **Parent mode.** Six-digit PIN. Children, tasks and rewards are added, edited and archived right
  on the home screen; general settings cover the streak, the bonus and the PIN.
- **Onboarding.** A fresh install asks for a PIN and walks the parent through setup with a guided
  tour.
- **Backup.** JSON export and import in parent mode. This is the only backup, so export regularly.
- **PWA.** Installable, works offline, splash screens for iPhone and iPad, and an in-app guide for
  adding it to the iOS home screen.

## Tech stack

| Area | Choice |
|---|---|
| UI | [Vue 3](https://vuejs.org/) + [Quasar 2](https://quasar.dev/) (Material icons) |
| Language | TypeScript in strict mode, checked with `vue-tsc` |
| Build | [Vite 6](https://vite.dev/), [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) |
| State | [Pinia](https://pinia.vuejs.org/) |
| Storage | IndexedDB through [Dexie 4](https://dexie.org/) |
| Validation | [zod 4](https://zod.dev/) schemas at the storage and import boundaries; types are inferred from them |
| Extras | [driver.js](https://driverjs.com/) for the tour, [canvas-confetti](https://github.com/catdad/canvas-confetti) for celebrations |
| Tests | [Vitest](https://vitest.dev/) with [fake-indexeddb](https://github.com/dumbmatter/fakeIndexedDB) |
| Hosting | GitHub Pages |

## Getting started

Requirements: Node.js 20 or newer and npm.

```sh
git clone https://github.com/SiritosKon/kids-chores.git
cd kids-chores
npm ci
npm run dev
```

The dev server prints the address, by default <http://localhost:5173/kids-chores/>. Add
`-- --host` to open it from a tablet or phone on the same network. A fresh browser profile starts
with the onboarding; to load existing data, set a PIN, skip the tour and use "Импорт данных" in the
parent menu.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run typecheck` | Type-check with `vue-tsc` |
| `npm test` | Run the unit tests once |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run splash` | Redraw the iOS splash screens from `public/pwa-512.png` |

Local builds register a self-destroying service worker, so nothing gets stuck in the cache. The
caching service worker is enabled only in the deploy (`ENABLE_PWA=true`).

## Project structure

The front end follows [Feature-Sliced Design](https://feature-sliced.design/): `app` → `pages` →
`widgets` → `features` → `entities` → `shared`, imports only go down. The layer map and the
reasoning behind it are in [`src/README.md`](src/README.md); the working rules (code style,
schemas, versions, git) are in [`CLAUDE.md`](CLAUDE.md). Both are in Russian.

```
src/        application code, one folder per FSD layer
tests/      shared test fixtures
scripts/    splash screen generator and release notes builder
public/     icons and splash screens
```

## Releases and deployment

- Every push to `main` builds the app and deploys it to GitHub Pages.
- The version lives in `package.json`; each version also needs an entry in
  `src/entities/app-version/model/changelog.ts`, which the app shows as "Что нового".
- CI tags every new version as `vX.Y.Z`. For minor and major versions (`X.Y.0`) it also publishes
  a GitHub release whose notes are collected from the changelog since the previous `X.Y.0`.
- Pull requests run type-checking, tests and a build.

Plans, the feature backlog and research notes live in the `research` branch, not in `main`.

## Data and privacy

Everything, including a child's photo, stays in the browser storage of the device the app runs
on. On iOS a web app added to the home screen has its own storage, separate from Safari, and
removing the icon deletes that data — export first.
