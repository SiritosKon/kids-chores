# Little Big Deals

A small offline-first PWA that helps parents motivate kids with daily chores. Kids tick off their
tasks, earn points, fill a piggy bank and trade points for rewards; days in a row with every task
done build a streak with its own prize. A parent PIN protects everything that changes the rules.
The interface speaks Russian, English and Spanish.

The app is in **alpha**. The deployed build has no backend: all data lives in the browser's
IndexedDB on the device, and nothing is sent anywhere. The backend in this repository adds a family
account and sync between devices; for now it runs only locally, in the containers described below.

Live build: <https://siritoskon.github.io/kids-chores/>

## Why

The project started as a tracker for the author's own kids on a shared iPad. It is also a
playground for building the product end to end: a local-only client first, then a backend,
sync between devices and accounts (see the roadmap in the `research` branch).

## Features

- **Daily board.** One row per task, one column per child, a button to confirm the day. A task
  can go to all kids or only some of them. Past days can be edited in parent mode.
- **Quests.** A one-off task with points and a deadline; it expires if not done in time.
- **Points and rewards.** Each task is worth points; rewards cost points and can live in the shop,
  be a streak-only prize or stay hidden as a surprise. Spends can be rolled back.
- **Piggy bank, goal and wallet.** A progress bar per child, an optional goal reward with its own
  bar, and a wallet history grouped by day on the child's page.
- **Streaks.** Days in a row with all tasks done earn a configurable prize (reward and/or points)
  every N days. Changing tasks or the rule never rewrites past streaks or prizes.
- **Bonus.** Optional extra points for a day with every task done.
- **Parent mode.** Six-digit PIN, closes by itself after five idle minutes. The PIN is kept only
  as a salted PBKDF2 hash, one per family when signed in, and five wrong tries in a row pause the
  PIN window. Children, tasks and rewards are edited on their own pages; settings cover the streak,
  the bonus and the PIN.
- **First launch.** Where the backend is available, the app first offers to sign in or continue
  without an account. The board opens with an editable example — a kid, three chores and three
  rewards — a PIN window over it and a four-step tour: kids, chores, rewards and the menu. A
  device that joins a family with data takes that data and skips the tour.
- **Backup.** JSON export and import in parent mode. This is the only backup, so export regularly.
- **PWA.** Installable, works offline, splash screens for iPhone and iPad, and an in-app guide for
  adding it to the iOS home screen.
- **Family account and sync** (local contour only). Sign in with Google, then with Face ID or
  Touch ID. Kids, chores, rewards, marks and purchases go to the server and on to the family's
  other devices; offline changes wait on the device. Signing in is optional, and photos never
  leave the device.

## Repository

An npm workspaces monorepo:

| Folder | What is inside |
|---|---|
| `apps/web` | The PWA: Vue 3, Quasar, Dexie |
| `apps/api` | The backend: NestJS on Fastify, Prisma, Valkey; the HTTP API and the outbox relay |
| `apps/notifications` | The notifications service, reads events from Valkey; a skeleton for now |
| `packages/contracts` | zod schemas shared by the front end and the services |
| `infra/`, `compose.yaml` | The local contour: Postgres, Valkey, the services and nginx in containers |

## Tech stack

| Area | Choice |
|---|---|
| UI | [Vue 3](https://vuejs.org/) + [Quasar 2](https://quasar.dev/), [vue-i18n](https://vue-i18n.intlify.dev/) |
| Front-end storage | IndexedDB through [Dexie 4](https://dexie.org/) |
| Backend | [NestJS 11](https://nestjs.com/) on [Fastify](https://fastify.dev/), [Prisma 7](https://www.prisma.io/) |
| Data | [PostgreSQL 17](https://www.postgresql.org/), [Valkey 8](https://valkey.io/) for sessions and the event stream |
| Language | TypeScript in strict mode everywhere |
| Validation | [zod 4](https://zod.dev/) schemas at the boundaries; types are inferred from them |
| Build | [Vite 6](https://vite.dev/), [vite-plugin-pwa](https://vite-pwa-org.netlify.app/), Nest CLI |
| Tests | [Vitest](https://vitest.dev/) with [fake-indexeddb](https://github.com/dumbmatter/fakeIndexedDB) |
| Hosting | GitHub Pages for the PWA; the backend is not deployed yet |

## Getting started

Requirements: Node.js 24 (the version is in `.nvmrc`) and npm.

```sh
git clone https://github.com/SiritosKon/kids-chores.git
cd kids-chores
npm ci
npm run dev
```

The dev server prints the address, by default <http://localhost:5173/kids-chores/>. Add
`-- --host` to open it from a tablet or phone on the same network. A fresh browser profile starts
with the first-launch example; to load existing data, set a PIN and use the import in the side
menu.

| Command | What it does |
|---|---|
| `npm run dev` | Start the PWA dev server |
| `npm run typecheck` | Type-check every package |
| `npm test` | Run the tests in every package |
| `npm run build` | Type-check and build every package |
| `npm run splash` | Redraw the iOS splash screens from the art in `apps/web/art/` |

Local builds register a self-destroying service worker, so nothing gets stuck in the cache. The
caching service worker is enabled only in the deploy (`ENABLE_PWA=true`).

### The whole contour in containers

The same `compose.yaml` works with Podman and Docker:

```sh
cp .env.example .env              # once
podman compose up -d --build      # the app with the backend on http://localhost:8080
podman compose down -v            # stop and delete the data
```

It starts Postgres, Valkey, the migrations, `api`, `outbox-relay`, `notifications` and nginx
with the built PWA. The `migrate` container applies the migrations and stops with exit code 0;
`api` and `outbox-relay` start only after it. Host ports are set in `.env`; Valkey is on 6380 by
default because 6379 is often taken. While the contour is up, `npm run dev` proxies `/v1` to it.

To try sync, open <http://localhost:8080/kids-chores/> in two browsers (or a normal and a private
window), open the menu → **Sign in** in each and sign in the same way in both: both windows join
one family. A change is sent to the server a second after it is saved and shows up in the other
window when you switch back to it. Google sign-in needs `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` in `.env` and `http://localhost:8080/v1/auth/google/callback` as an
authorised redirect URI of that OAuth client. Without Google, set `DEV_LOGIN=true` in `.env` and
run `podman compose up -d api`: the account page gets a sign-in by any name, and the same name
means the same family.

The backend can also run on the host against the containers' Postgres and Valkey:

```sh
podman compose up -d postgres valkey
cp apps/api/.env.example apps/api/.env       # once
npm run dev -w apps/api                      # api with reload on http://localhost:3000
API_URL=http://localhost:3000 npm run dev    # the PWA on :5173, /v1 goes to the api on the host
npm run test:integration                     # integration tests on the real Postgres and Valkey
```

## Project structure

The front end follows [Feature-Sliced Design](https://feature-sliced.design/): `app` → `pages` →
`widgets` → `features` → `entities` → `shared`, imports only go down. The layer map and the
reasoning behind it are in [`apps/web/src/README.md`](apps/web/src/README.md). The backend keeps
shared infrastructure in `apps/api/src/platform` and domain modules in `apps/api/src/modules`.
The working rules (code style, schemas, versions, git) are in [`CLAUDE.md`](CLAUDE.md). Both
documents are in Russian.

```
apps/web/src/       PWA code, one folder per FSD layer
apps/web/tests/     shared test fixtures
apps/web/scripts/   splash screen generator and release notes builder
apps/web/public/    icons and splash screens
apps/web/art/       icon and splash art: SVG sources and the splash masters
apps/api/prisma/    database schema and migrations
```

## Releases and deployment

- Every push to `main` builds the PWA and deploys it to GitHub Pages.
- The version lives in the root `package.json`; each version also needs an entry in
  `apps/web/src/entities/app-version/model/changelog.ts` in all three languages, which the app
  shows as "What's new".
- CI tags every new version as `vX.Y.Z`. For minor and major versions (`X.Y.0`) it also publishes
  a GitHub release whose notes are collected from the changelog since the previous `X.Y.0`.
- Pull requests run type-checking, tests and a build.

Plans, the feature backlog, research notes and architecture decisions live in the `research`
branch, not in `main`.

## Data and privacy

In the deployed build everything, including a child's photo, stays in the browser storage of the
device the app runs on. On iOS a web app added to the home screen has its own storage, separate
from Safari, and removing the icon deletes that data — export first.

The backend is designed to keep as little personal data as possible: no passwords, no emails, only
a hash of the provider's account id and the name the parent sees in the app. Request limits count
by a keyed hash of the address and of the session, the counters live for a few minutes, and the
logs carry no addresses.
