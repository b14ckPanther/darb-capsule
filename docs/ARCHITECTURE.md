# Architecture

Status: Flutter 3, Riverpod, offline-first storage, push notifications, home-screen widgets on iOS and Android, and consuming Darb Budokai's GraphQL API and live events come from the roadmap. Package choices, layer names, table shapes and the sync protocol are **proposed, confirm with Nour in Phase 1**.

## 1. Shape in one paragraph

The Flutter app is a thin, offline-first client. **Riverpod** providers expose read models (character, today's quests, recent effects, alerts) that come from a local **Drift** database. A **sync engine** fills Drift from Darb Budokai's public **GraphQL** API (via `ferry`) and keeps it fresh from Darb Budokai's **STOMP** live channel while the app is open. User actions (check-ins) are written to Drift first and to an **outbox** table, then sent to Darb Budokai by the sync engine with an idempotency key. After every change to the character or quests, a **widget publisher** writes a compact snapshot into shared storage (`home_widget`: iOS App Group, Android SharedPreferences) and asks the OS to reload the **native widgets** (SwiftUI WidgetKit, Kotlin Glance). Background refresh (`workmanager` on Android, BGAppRefresh on iOS) and, optionally, silent pushes keep the widget fresh when the app is closed. Until Darb Budokai is live, every network call goes to **`tools/mock_budokai`**, a Dart server built from Darb Budokai's contracts.

## 2. Diagram

```
                        ┌──────────────────────────────────────────────┐
                        │ Darb Budokai (later)          or   tools/mock_budokai │
                        │ gateway  /graphql  (queries, mutations)      │
                        │ notification  /ws  (STOMP effects)           │
                        │ [optional] FCM sender for alerts             │
                        └──────▲──────────────────┬───────────▲────────┘
                     GraphQL   │        STOMP     │           │ FCM (optional phase)
                     (ferry)   │   (stomp_dart_   │           │
                               │     client)      │           │
┌──────────────────────────────┴──────────────────▼───────────┴─────────┐
│ Flutter app (app/)                                                     │
│                                                                        │
│  data/                                                                 │
│   BudokaiApi (ferry client, JWT link) ──┐   LiveFeed (STOMP) ──┐         │
│   AuthRepository (secure storage)     │                      │         │
│                                       ▼                      ▼         │
│   SyncEngine ── pulls, applies effects, drains outbox ──► Drift DB      │
│      ▲                                                 (characters,    │
│      │ connectivity, app lifecycle, background task     quests,        │
│      │                                                  effects,       │
│                                                         alerts,        │
│  features/ (Riverpod providers read Drift streams)      outbox,        │
│   character_sheet   today   alerts   settings           sync_state)    │
│        │                                                     │         │
│        ▼                                                     ▼         │
│  UI (Cupertino-quality on iOS)            WidgetPublisher ── snapshot  │
│                                                  │ home_widget         │
└──────────────────────────────────────────────────┼─────────────────────┘
                                                   ▼
         ┌─────────────────────────────┐   ┌──────────────────────────────┐
         │ iOS WidgetKit extension      │   │ Android Glance AppWidget      │
         │ (SwiftUI, App Group JSON)    │   │ (Kotlin, SharedPreferences)   │
         │ small / medium / lock screen │   │ 2x2 / 4x2                     │
         └─────────────────────────────┘   └──────────────────────────────┘
```

## 3. Components

| Component | Where | Responsibility |
|---|---|---|
| `AppConfig` | `lib/core/config/` | Loads `config/app.yaml` (bundled asset), merges env from `--dart-define-from-file`, then server overrides (`capsuleConfig` GraphQL query, cached in Drift). Validated against `config/app.schema.json` at startup; bad config fails fast in debug and falls back to bundled values in release. |
| `BudokaiApi` | `lib/data/budokai_api/` | `ferry` client generated from `contracts/budokai/schema.graphqls`. Auth link adds `Authorization: Bearer <jwt>`; refresh on 401. |
| `LiveFeed` | `lib/data/live/` | STOMP over WebSocket to `/ws`, subscribes to `/user/queue/effects` and `/user/queue/battlelog`. Reconnect with backoff from config. Only while app is foregrounded. |
| `AuthRepository` | `lib/data/auth/` | Login against Darb Budokai identity (or mock), stores refresh token in `flutter_secure_storage`. Capsule never holds a producer HMAC secret. |
| `CapsuleDatabase` | `lib/data/db/` | Drift schema, migrations (`drift_dev schema dump` + `schema steps`), DAOs returning `Stream`s. |
| `SyncEngine` | `lib/data/sync/` | Pull (full snapshot on first run, then `since:` cursor), apply live effects, drain outbox, record `sync_state`. Pure Dart, unit-testable with a fake clock and fake API. |
| `Outbox` | `lib/data/sync/outbox.dart` | Append-only rows with `clientEventId` (UUIDv7), status `pending / sending / acked / rejected`, attempts, next attempt time. |
| `WidgetPublisher` | `lib/features/widget/` | Builds `WidgetSnapshot` (versioned JSON, schema in `contracts/capsule/widget-snapshot.v1.schema.json`), writes it via `home_widget`, calls `HomeWidget.updateWidget`. Throttled (interval in config). |
| `AlertCenter` | `lib/features/alerts/` | Turns effects into local notifications using rules in `config/alerts.yaml` (which effect types alert, thresholds, quiet hours, per-type toggles from settings). |
| `BackgroundRefresh` | `lib/core/background/` | `workmanager` periodic task (Android minimum 15 min; iOS best effort via BGAppRefreshTask). Runs a light pull and republishes the widget snapshot. |
| iOS widget | `ios/CapsuleWidget/` | SwiftUI `TimelineProvider` reading the App Group JSON. Timeline entries interpolate stamina decay between refreshes using a rate Darb Budokai sends in the snapshot (no rule in Swift). |
| Android widget | `android/app/src/main/kotlin/.../widget/` | Jetpack Glance `GlanceAppWidget` reading the same JSON. |
| `mock_budokai` | `tools/mock_budokai/` | Dart `shelf` + `shelf_router` server. Serves `/graphql` (resolvers backed by YAML fixtures and an in-memory state machine), `/ws` STOMP, and a `/_scenario` control endpoint that replays a scenario (`config/scenarios/*.yaml`) at a chosen speed so the widget visibly changes during a demo. |

## 4. Data flow

**Cold start (online):** auth, `pocketSnapshot` query (character, vitals, today's quests, last N effects, alert settings, server config), write to Drift in one transaction, publish widget snapshot, open STOMP.

**Live effect:** STOMP message arrives, `SyncEngine.applyEffect` updates Drift (idempotent by effect `id`), Riverpod streams rebuild the UI, `AlertCenter` decides on a local notification, `WidgetPublisher` republishes (throttled).

**Offline check-in:**
1. User taps check on a quest. In one Drift transaction: mark quest step as `pendingSync`, insert outbox row with `clientEventId`.
2. UI shows the step done with a small "waiting to sync" glyph. Widget snapshot updates immediately (optimistic).
3. On connectivity or app resume, `SyncEngine` sends pending rows in batches (size in config) via `submitCheckIns` mutation. Darb Budokai turns each into a `habit.checked` CloudEvent with `id = clientEventId`, so retries are deduplicated by Darb Budokai's ingest.
4. On ack: row `acked`, quest step `synced`, effects that come back are applied. On permanent rejection (e.g. outside Darb Budokai's backdating window): row `rejected`, step reverted, a quiet in-app notice explains why.

**Widget refresh when the app is closed:** background task or (optional phase) silent push runs a short pull and republishes. Between refreshes, the iOS timeline renders precomputed entries (e.g. every 15 min) from the `staminaTrend` Darb Budokai sent, so the bar moves without the app running.

## 5. Storage choice

- **Drift (SQLite)**, proposed over Isar and Hive: relational queries for "today's quests with pending check-ins", typed migrations with generated step-by-step tests, `Stream` queries that fit Riverpod, and it is the package named in the roadmap's skills. Isar's maintenance status is uncertain; Hive has no real queries.
- Tables (proposed): `characters`, `vitals_history`, `quests`, `quest_steps`, `effects`, `alerts`, `outbox`, `sync_state`, `server_config`.
- The widget never reads SQLite; it reads one small JSON snapshot. This keeps native code tiny and avoids sharing a database across processes.

## 6. Config, not code

```
config/
├── app.yaml               endpoints per flavor (overridden by env), timeouts, backoff, batch sizes, widget refresh interval
├── app.schema.json        JSON Schema for app.yaml
├── alerts.yaml            which effect/alert types notify, thresholds, quiet hours default, grouping
├── copy/en.yaml           user-facing changeable copy (alert text templates, empty states); structural labels in ARB (lib/l10n/)
├── seed/demo/*.yaml       demo character, quests, effects, alerts (flavor demo only)
└── scenarios/*.yaml       mock_budokai scenarios: typical-day, rough-day, interview-week, offline-commute
```

Server-provided values (vitals max, stamina decay rate, quest targets) always win over anything bundled. The bundled config only holds client behaviour.

## 7. Local dev setup

1. Install FVM; `fvm install` (Flutter version from `.fvmrc`), Xcode 26+, Android Studio with an API 35+ emulator.
2. `cd tools/mock_budokai && dart run bin/server.dart --scenario config/scenarios/typical-day.yaml`.
3. `cd app && fvm flutter run --flavor dev --dart-define-from-file=env/dev.json` (points at `http://localhost:8080`; Android emulator uses `10.0.2.2`).
4. Add the widget to the simulator home screen. Use `curl -X POST localhost:8080/_scenario/speed?x=60` to fast-forward the day.
5. Demo flavor needs no server: `--flavor demo`.

When Darb Budokai exists locally, switch `env/dev.json` to Darb Budokai's gateway (`:8080`) and notification service (`:8088`); no code change.

## 8. Testing strategy

| Level | Tool | What |
|---|---|---|
| Unit | `flutter_test`, `mocktail`, `fake_async` | SyncEngine, outbox state machine, alert rules, config loader, snapshot builder. |
| Provider | `ProviderContainer` with overrides | Each feature's providers against an in-memory Drift and a fake API. |
| Drift | `NativeDatabase.memory()`, `drift_dev` schema tests | Migrations from every past schema version. |
| Widget | `flutter_test`, `alchemist` goldens | Every screen in light/dark, text scale 1.0 and 2.0, iOS and Android, demo seed. Goldens are approved by Nour in Phase 3. |
| Contract | `mock_budokai` tests + GraphQL schema snapshot test | Every operation in `lib/**.graphql` validates against `contracts/budokai/schema.graphqls`; fails CI when Darb Budokai's schema snapshot changes incompatibly. |
| Integration | `integration_test` + `patrol` | Offline check-in then reconnect (airplane mode toggled by Patrol), notification tap opens the right screen, widget snapshot written. Runs on simulator/emulator in CI (macOS runner for iOS, proposed: on `main` only to save minutes). |
| Native widget | XCTest (snapshot of SwiftUI view from fixture JSON), Glance `GlanceAppWidgetUnitTest` | Widget renders every state: normal, exhausted, stale, demo, signed out. |
| Accessibility | `flutter_test` `meetsGuideline(textContrastGuideline / androidTapTargetGuideline / iOSTapTargetGuideline / labeledTapTargetGuideline)` | On every screen test. |

CI (GitHub Actions, proposed): `ubuntu-latest` for analyze, format, unit, widget, goldens (Linux goldens as the reference), mock server tests, emoji check; `macos-15` for iOS build + XCTest + integration on `main` and release branches. No live services anywhere.
