# Darb Capsule

**Your character, in your pocket.**

Darb Capsule is the mobile companion to [Darb Budokai](../darb-budokai/README.md), the RPG Nour's real life powers. It puts the character sheet and today's quests on the phone and on the home screen, lets you check in on habits with no signal, and warns you when something big happens in the universe (a strong job match, an attack on the honeypots).

**Signature moment:** a home-screen widget where the character's health and stamina change with your real day. Glance at the phone at 16:00 and see that the character is tired because you have been slouching since lunch.

> Status: **planning package, [NEEDS REVIEW]**. Phase 1 starts by asking Nour whether they still want this project and in what shape. Nothing is built yet.

Owner: Nour Alden Mousa ([@b14ckPanther](https://github.com/b14ckPanther), [zangeel.dev](https://zangeel.dev)).

## Why it exists

Nour's public GitHub is about 90% Next.js / Supabase / TypeScript, and once the old `yellowshifts` Flutter repo is gone, nothing public shows Dart. Darb Capsule proves Flutter with the parts mobile teams actually ask about: state management (Riverpod), offline-first storage (Drift), native home-screen widgets on both platforms, push notifications, and widget plus integration tests. It is deliberately small: three screens, a widget and an offline queue, finished to a very high polish. Nour abandoned a Flutter app before; this one is scoped so it can be finished. See `docs/VISION.md`.

## Stack (proposed versions, pinned in Phase 0)

| Layer | Choice |
|---|---|
| SDK | Flutter 3 stable (3.35 or newer at Phase 0), Dart 3.9+, managed with FVM (`.fvmrc`) |
| State | Riverpod 3 (`flutter_riverpod`, `riverpod_annotation`, `riverpod_generator`) |
| Navigation | `go_router` (StatefulShellRoute for the tab bar) |
| Look | Cupertino-quality widgets on iOS, matching adaptive widgets on Android; custom painters and fragment shaders for the character art |
| API | Darb Budokai public GraphQL via `ferry` + `ferry_generator` (typed, normalized cache); live effects via STOMP over WebSocket (`stomp_dart_client`) |
| Offline | Drift (SQLite) with an outbox table for check-ins; `connectivity_plus` for reachability hints |
| Widgets | `home_widget` bridge; iOS WidgetKit extension (SwiftUI), Android Glance app widget (Kotlin) |
| Notifications | `flutter_local_notifications` (MVP); `firebase_messaging` for remote push (optional phase) |
| Secrets on device | `flutter_secure_storage` (Keychain / Keystore) |
| Mock backend | Dart `shelf` server in `tools/mock_budokai/`, built from a snapshot of Darb Budokai's GraphQL schema and event contracts |
| Tests | `flutter_test`, `riverpod` overrides, `mocktail`, golden tests (`alchemist`), `integration_test`, `patrol` for native widget/notification flows |

## Folder map (this planning package)

```
Darb Capsule/
├── README.md               you are here
├── CLAUDE.md               agent operating manual (the law)
├── AGENTS.md               pointer for other agent tools
└── docs/
    ├── VISION.md           intent, goals, non-goals, anti-goals, why Flutter
    ├── ARCHITECTURE.md     layers, data flow, offline sync, mock server, testing
    ├── UI_DESIGN.md        signature widget, screens, motion, art directions
    ├── INTEGRATION.md      what Capsule reads from and sends to Darb Budokai
    ├── PLAN.md             phases 0 to 100%
    ├── PROGRESS.md         ledger
    ├── DECISIONS.md        ADR log
    ├── OPEN_QUESTIONS.md   what only Nour can decide
    └── CONVENTIONS.md      Dart style, layout, tests, commits, PR template
```

Phase 0 turns this folder into the repo (`darb-capsule`) and adds `app/`, `tools/mock_budokai/`, `contracts/`, `config/`, `ios/`, `android/` and CI.

## How to start

Open Claude Code in this folder and say:

> start Phase 0

The agent reads `CLAUDE.md`, then `docs/PLAN.md`, and works phase by phase. It asks Nour before anything outward-facing (creating the GitHub repo, pushing to `main`, publishing builds).

## How it fits the universe

Darb Budokai is the world; Capsule is the window you carry. Capsule reads the character, quests and effects through Darb Budokai's public GraphQL API and live STOMP channel, and sends offline `habit.checked` check-ins back. Until Darb Budokai is live, Capsule runs against `tools/mock_budokai`, built from Darb Budokai's contracts, so it never depends on Darb Budokai existing. Alerts about attacks (Darb Ki) and job matches (Darb Scouter / Job Radar) arrive through Darb Budokai, never directly. Details: `docs/INTEGRATION.md`.
