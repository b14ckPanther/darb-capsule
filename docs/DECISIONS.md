# Decisions (ADR log)

Format: one short ADR per decision. Status is **Accepted** (fixed by Nour's roadmap or rules), **Proposed** (confirm with Nour in Phase 1), or **Superseded by ADR-N**. Phase 1 turns every Proposed item into Accepted or rewrites it.

## Accepted (fixed by the roadmap and Nour's rules)

### ADR-001: Flutter 3 with Riverpod
Context: the roadmap's Flutter stack (Flutter 3, Riverpod, push notifications, home-screen widgets) and the gap of no public Dart once yellowshifts is gone. Decision: Flutter 3 stable, Dart 3, Riverpod for state. Consequence: native code only where Flutter cannot reach (home-screen widgets).

### ADR-002: Role and signature
Capsule is the mobile companion to Darb Budokai: character sheet and daily quests on phone and home screen, offline check-ins, alerts for attacks and strong job matches. Signature: a home-screen widget where health and stamina change with the real day.

### ADR-003: Offline-first local storage
Check-ins must work offline. Local storage is the source the UI reads.

### ADR-004: Darb Budokai via public GraphQL and live events; offline batches as `habit.checked` v1
From Darb Budokai's `EVENT_CONTRACTS.md` §3.6. Capsule never reads Darb Budokai's databases or Kafka.

### ADR-005: Mock server until Darb Budokai is live
Capsule runs against `tools/mock_budokai`, built from Darb Budokai's contracts. Integration with the real Darb Budokai is an optional later phase.

### ADR-006: No AI attribution, commits as Nour
Quote: "Never add "Co-Authored-By" or any other AI attribution line to commit messages, pull request descriptions, or any other text, in any project. Commit messages end with the last line of the actual description." Enforced by repo git config, commit-msg hook, agent settings and the push checklist.

### ADR-007: No hardcoded data
Thresholds, alert rules, copy and seed content in config, env or database. Game rules stay in Darb Budokai.

### ADR-008: UI/UX first
Design system (Phase 2) and an approved prototype on seed data (Phase 3) before any backend or native work.

### ADR-009: Native feel, modern SVG icons, no emoji
SwiftUI-grade feel on iOS with Cupertino-quality widgets, one modern SVG icon set, emoji forbidden everywhere, checked in the definition of done.

### ADR-010: TDD, no live services in CI
Failing test first. Mock server and recorded fixtures only.

### ADR-011: Ask before outward-facing actions; one branch per phase
Repo creation, visibility, pushes to `main`, merges, publishing builds, paid accounts and deletions need Nour's yes.

### ADR-012: Use installed skills
Agents check the skill list before each task and log skills used in the ledger.

### ADR-013: Original assets; secrets out of the repo and out of the binary
Google Fonts allowed; everything else original or licensed and logged in `ASSETS.md`.

## Proposed (confirm with Nour in Phase 1)

### ADR-101: Drift for local storage
Over Isar (maintenance uncertain) and Hive (no queries). Typed migrations, stream queries, named in the roadmap skills.

### ADR-102: ferry for GraphQL
Typed codegen and normalized cache. Alternative: `graphql_flutter` (less typing) or hand-written `http` + `json_serializable`.

### ADR-103: go_router with StatefulShellRoute, three tabs only
Today, Character, Alerts. Scope guard against the yellowshifts outcome.

### ADR-104: Native widgets with `home_widget`, WidgetKit (SwiftUI) and Glance (Kotlin)
The widget reads one JSON snapshot (`widget-snapshot` v1), never SQLite.

### ADR-105: Local notifications first, FCM optional
`flutter_local_notifications` driven by live effects and background refresh. Remote push needs Darb Budokai to send FCM and, for iOS devices, the paid Apple Developer Program.

### ADR-106: Check-ins through a `submitCheckIns` GraphQL mutation, not direct HMAC ingest
A public app cannot hold a producer secret. Darb Budokai's gateway turns check-ins into `habit.checked` with `id = clientEventId`.

### ADR-107: Capsule never computes game rules
Stamina projection (`staminaTrend`), statuses and thresholds come from Darb Budokai.

### ADR-108: Mock server in Dart (`shelf`)
Same language as the app, no Docker needed, runs in CI on Linux.

### ADR-109: FVM-pinned Flutter, `very_good_analysis` lints, `alchemist` goldens, `patrol` for native flows

### ADR-110: Art direction A "Ember Atlas, pocket" as default
Matches Darb Budokai's proposed look. Alternatives B "Field Journal" and C "Lantern" in `UI_DESIGN.md` §5.

### ADR-111: Distribution without paid accounts by default
Simulator demo, GitHub Release APK. TestFlight only if Nour pays for the Apple Developer Program (USD 99/year).
