# Master plan (0 to 100%)

Phase order and the UI-first rule come from Nour's rules. Weights, task lists and branch names are **proposed, confirm with Nour in Phase 1**. Every phase ends with the definition of done in `CLAUDE.md` §6 (including the emoji check and native-feel check) and Nour's approval before merging.

**Scope guard:** the shippable app is three tabs (Today, Character, Alerts), four sheets/routes (Vitals, Effect, Settings, Sign-in), the home-screen widgets and an offline outbox. Anything else goes to `docs/OPEN_QUESTIONS.md` under "Later".

| # | Phase | Weight | Cumulative | Branch |
|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 5% | 5% | `phase/00-bootstrap` |
| 1 | Confirm the spec with Nour | 5% | 10% | `phase/01-spec` |
| 2 | Design system | 12% | 22% | `phase/02-design-system` |
| 3 | Clickable prototype on seed data | 15% | 37% | `phase/03-prototype` |
| 4 | Contracts snapshot and mock Darb Budokai server | 8% | 45% | `phase/04-mock-budokai` |
| 5 | Data layer: auth, GraphQL, Drift, live feed | 12% | 57% | `phase/05-data-layer` |
| 6 | Offline check-ins and sync outbox | 10% | 67% | `phase/06-offline-sync` |
| 7 | Home-screen widgets (signature) | 13% | 80% | `phase/07-home-widgets` |
| 8 | Alerts and notifications | 7% | 87% | `phase/08-alerts` |
| 9 | Hardening | 6% | 93% | `phase/09-hardening` |
| 10 | Docs, demo video, public launch | 7% | 100% | `phase/10-launch` |
| 11 | Optional: connect to the real Darb Budokai | (outside 100%) | | `phase/11-budokai-live` |

---

## Phase 0: Repo bootstrap, CI, conventions (5%)

**Goal:** an empty but real repo that builds, tests and enforces the rules.

**Deliverables:** git repo (local only), `app/` Flutter project with flavors `demo` and `dev`, `tools/mock_budokai/` Dart package skeleton, `tools/check_no_emoji.py`, `.githooks/commit-msg`, `.claude/settings.json` with attribution off, `.fvmrc`, `analysis_options.yaml` (`very_good_analysis` or `flutter_lints` + strict casts, proposed), `.gitignore` (build, env, Firebase files, signing), `env/example.json`, `.env.example`, GitHub Actions `ci.yml`, these docs moved into the repo.

**Tasks (TDD order):**
1. `git init`, set `user.name` / `user.email` to Nour, `core.hooksPath .githooks`. First commit: the planning docs.
2. Test for the commit-msg hook (shell test with `bats` or a Python script): a message containing "Co-Authored-By" is rejected. Watch it fail. Write the hook. Pass.
3. Test for `check_no_emoji.py` (pytest): fixture file with an emoji fails, clean file passes, ZWJ sequence and U+FE0F caught. Implement. Pass.
4. `fvm flutter create --org dev.zangeel --project-name darb_capsule --platforms ios,android app`. Remove the counter demo. Add flavors (`flutter_flavorizr` or manual xcconfig + Gradle productFlavors, proposed manual).
5. Smoke widget test: app boots in demo flavor and shows a placeholder "Darb Capsule" title. Fail, implement, pass.
6. `tools/mock_budokai`: `dart create -t console`, a failing test for `GET /health` returning 200, implement with `shelf_router`.
7. CI: analyze, format check, `flutter test`, `dart test` in mock_budokai, emoji check, commit-message check on PR commits. macOS job builds iOS (`flutter build ios --no-codesign --flavor dev`) on `main` only.
8. `CONVENTIONS.md` items wired: PR template file, `CODEOWNERS` (Nour).

**Tests that prove it:** hook test, emoji checker tests, smoke widget test, mock health test, green CI run on the branch (local `act` run if no remote yet).

**Definition of done:** `fvm flutter test` and `dart test` green from a clean clone; hook blocks attribution; no emoji; ledger row.

**Skills:** `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:executing-plans`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`, `superpowers:using-git-worktrees`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`, `security-review` (gitignore and secrets setup).

---

## Phase 1: Confirm the spec with Nour (5%)

**Goal:** every "proposed" item is confirmed or changed, starting with whether Capsule should exist at all.

**Deliverables:** `docs/specs/YYYY-MM-DD-phase-01-spec.md`, updated `DECISIONS.md` (one ADR per answer), updated `OPEN_QUESTIONS.md` (answered items moved to a "Resolved" section), PLAN weights adjusted if scope changed.

**Tasks:**
1. Ask the questions in `docs/OPEN_QUESTIONS.md` **one at a time**, open-ended first, starting with Q1 (still wanted? in what shape?). If Nour drops or reshapes the project, stop and rewrite PLAN.md with them before anything else.
2. Show the three art directions in `UI_DESIGN.md` §5 as quick static boards (one Flutter screen and one widget mock per direction, rendered as golden PNGs or a Figma-free HTML board from the `frontend-design` skill), side by side. Record the pick.
3. Confirm the icon set (Solar or Lucide), widget sizes, alert kinds, and the Darb Budokai changes in `INTEGRATION.md` §5.
4. Write the spec; get Nour's approval; record it in the ledger.

**Tests that prove it:** none (documents). Ledger records approval with date.

**Definition of done:** spec approved; no question in OPEN_QUESTIONS marked "blocking".

**Skills:** `superpowers:brainstorming`, `writing-guidelines`, `frontend-design`, `design-taste-frontend`, `design:design-critique`, `audit-reference-originality`.

---

## Phase 2: Design system (12%)

**Goal:** tokens, type, motion and core components of the chosen direction, built in Flutter and approved by Nour side by side.

**Deliverables:** `design/tokens.json` (source of truth) and a generator to `lib/design/tokens/*.dart` (colors, type scale, spacing, radii, motion springs), `lib/design/components/` (AdaptiveScaffold, LargeTitleScaffold, VitalsRing, QuestRow, StatRow, EffectRow, AlertRow, Sheet with detents, PressableScale, SyncGlyph, EmptyState), SVG icon pipeline (`vector_graphics_compiler` in build), custom glyphs (stat marks, quest kinds, sigil), `ASSETS.md`, a `design_gallery` route in the demo flavor showing every component in every state.

**Tasks (TDD order):**
1. Contrast test over every text/background token pair (fails until tokens meet 4.5:1 / 3:1). Then tokens.
2. Token generator test: JSON in, Dart out, golden-compare generated file. Then generator.
3. For each component: golden test (light/dark if applicable, text scale 1.0/2.0, iOS/Android platform) plus a semantics test, then the component.
4. `PressableScale` and springs: `fake_async` tests that the spring settles to target and that Reduce Motion swaps to a crossfade.
5. `VitalsRing` custom painter: goldens at 0, 25, exhausted, full; semantics string from copy.
6. Icon pipeline: test that every icon key in `config/icons.yaml` resolves to a compiled SVG; no `Icons.` usage (a lint test greps `lib/`).
7. Side-by-side review with Nour in the gallery on iPhone and Pixel simulators; iterate; record approval per component group.

**Tests that prove it:** contrast test, generator golden, component goldens and semantics tests, motion tests, icon lint test.

**Definition of done:** Nour approved tokens, type, motion and components; emoji check clean; `ASSETS.md` lists fonts and their licences.

**Skills:** `frontend-design`, `impeccable:impeccable`, `design-taste-frontend`, `design-first-ui-prompting`, `ui-implementer`, `design:design-system`, `design:design-critique`, `design:accessibility-review`, `animation-systems`, `solar-duotone-bold` (if Solar is picked), `audit-reference-originality`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`.

---

## Phase 3: Clickable prototype on seed data (15%)

**Goal:** the full app, every screen and sheet, running in the demo flavor on realistic seed data, approved by Nour screen by screen. No network.

**Deliverables:** `config/seed/demo/*.yaml` (a believable character and a week of effects), `DemoRepository` behind the same interfaces the real data layer will implement, go_router with `StatefulShellRoute` (three tabs), all screens and sheets from `UI_DESIGN.md` §2, a static widget preview screen (the widget layouts rendered in Flutter for approval before native work), "Demo data" banner, copy in `config/copy/en.yaml` and ARB files.

**Tasks (TDD order), one screen at a time, each ending with Nour's approval:**
1. Seed loader: test that YAML parses into domain models and rejects bad seed with a clear error. Implement.
2. Router: test deep links (`/today`, `/character`, `/alerts`, `/effect/:id`) resolve. Implement.
3. Today: widget tests (renders seeded quests, swipe right checks in, context menu present, empty state), goldens. Implement. Approval.
4. Character: tests and goldens. Implement. Approval.
5. Alerts: tests (grouped by day, swipe actions) and goldens. Implement. Approval.
6. Vitals, Effect, Settings sheets: detent and drag-to-dismiss tests, goldens. Implement. Approval.
7. Sign-in: validation tests, goldens. Implement. Approval.
8. Widget preview screen (small, medium, lock screen layouts in each state). Approval of the widget design before Phase 7.
9. Copy pass with `design:ux-copy`; accessibility pass with VoiceOver and TalkBack on simulators.

**Tests that prove it:** widget and golden tests per screen; navigation tests; accessibility guideline tests on every screen.

**Definition of done:** every screen approved and recorded with a screenshot path; native-feel check passed; prototype runs offline in demo flavor.

**Skills:** `frontend-design`, `impeccable:impeccable`, `design-taste-frontend`, `ui-implementer`, `design:design-critique`, `design:accessibility-review`, `design:ux-copy`, `design:design-handoff`, `dataviz` (sparklines), `writing-guidelines`, `run`, `superpowers:test-driven-development`, `superpowers:subagent-driven-development`.

---

## Phase 4: Contracts snapshot and mock Darb Budokai server (8%)

**Goal:** a local server that behaves like Darb Budokai for every operation Capsule needs, validated against Darb Budokai's contracts.

**Deliverables:** `contracts/budokai/schema.graphqls` (snapshot or proposed subset), `contracts/budokai/events/*.schema.json` (effect types and `habit.checked` v1), `contracts/capsule/widget-snapshot.v1.schema.json`, `contracts/budokai/SOURCE.md` (where and when copied), `tools/mock_budokai` with `/graphql` (using `package:graphql_schema2` + hand-written resolvers, proposed), `/ws` STOMP (minimal STOMP 1.2 frames over `shelf_web_socket`), `/_scenario` control, scenarios `typical-day`, `rough-day`, `interview-week`, `offline-commute`.

**Tasks (TDD order):**
1. Schema validation test: every example in `contracts/**/examples/` validates (`json_schema` package). Write schemas.
2. GraphQL: failing test per operation (`PocketSnapshot`, `SubmitCheckIns` with duplicate and rejected cases). Implement resolvers backed by YAML state.
3. Idempotency test: same `clientEventId` twice returns `DUPLICATE`, state changes once.
4. STOMP: test CONNECT with JWT, SUBSCRIBE, receive a scenario effect. Implement.
5. Scenario runner: test that a scenario at speed 60 emits effects in order with correct times (fake clock).
6. Every emitted effect validated against its schema in tests.
7. `docker` not required; document `dart run bin/server.dart` in README.

**Tests that prove it:** contract tests, resolver tests, idempotency test, STOMP test, scenario timing test.

**Definition of done:** mock server runs from a clean clone; all mock output schema-valid; `SOURCE.md` filled.

**Skills:** `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `simplify`.

---

## Phase 5: Data layer (12%)

**Goal:** the prototype's screens now read real data from Drift, filled from the mock server through GraphQL and STOMP.

**Deliverables:** `AuthRepository` (+ secure storage), `BudokaiApi` (ferry, codegen from snapshot), `CapsuleDatabase` (Drift schema v1 and migration tests), `SyncEngine` (pull, apply effect), `LiveFeed`, `AppConfig` (YAML + env + server overrides), repositories implementing the Phase 3 interfaces, dev flavor wired.

**Tasks (TDD order):**
1. `AppConfig` tests: merge order, schema validation failure, release fallback. Implement.
2. Drift: schema tests, DAO tests with in-memory DB. Implement tables.
3. Auth: token refresh on 401 (fake HTTP), logout clears secure storage. Implement.
4. `SyncEngine.pullSnapshot`: given a fake API response, Drift ends in the expected state in one transaction. Implement.
5. `SyncEngine.applyEffect`: idempotent by effect id; unknown types stored and ignored. Implement.
6. `LiveFeed` reconnect backoff with `fake_async`. Implement.
7. Swap `DemoRepository` for real repositories in dev flavor; existing screen tests run against both through provider overrides.
8. Integration test (Patrol) against mock_budokai: sign in, see seeded character, scenario effect updates the Today screen.

**Tests that prove it:** unit and provider tests above, Drift migration tests, one Patrol integration test.

**Definition of done:** dev flavor works end to end with mock_budokai; demo flavor still works without a server.

**Skills:** `superpowers:test-driven-development`, `superpowers:subagent-driven-development`, `superpowers:systematic-debugging`, `security-review` (token storage, auth), `superpowers:requesting-code-review`, `run`.

---

## Phase 6: Offline check-ins and sync outbox (10%)

**Goal:** check-ins never get lost or doubled, with or without network.

**Deliverables:** `outbox` table and state machine, `submitCheckIns` client, connectivity and lifecycle triggers, pending/acked/rejected UI states, `offline-commute` scenario demo.

**Tasks (TDD order):**
1. Outbox state machine tests: pending to sending to acked; sending to pending on network error with backoff from config; sending to rejected on `REJECTED`; app killed mid-send recovers to pending on start.
2. Optimistic update test: check-in updates quest progress and widget snapshot immediately in one transaction.
3. Batch test: N pending rows send in batches of size from config, in `checkedAt` order.
4. Duplicate test: server returns `DUPLICATE`, treated as acked.
5. Rejection revert test: UI reverts the step and shows the notice copy.
6. Patrol test: airplane mode on, check in twice, kill app, airplane mode off, relaunch, exactly two `habit.checked` reach mock_budokai.

**Tests that prove it:** state machine tests, batch and duplicate tests, Patrol offline test.

**Definition of done:** the Patrol offline test passes three runs in a row; no flakiness ruling open.

**Skills:** `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `design:ux-copy` (sync and rejection copy).

---

## Phase 7: Home-screen widgets, the signature (13%)

**Goal:** the living widget on iOS and Android, matching the approved Phase 3 design, moving with the day.

**Deliverables:** `WidgetPublisher`; iOS WidgetKit extension `CapsuleWidget` (systemSmall, systemMedium, accessoryCircular, accessoryRectangular) with App Group; Android Glance widgets (2x2, 4x2); `workmanager` background refresh; interactive check-in (iOS App Intent, Glance action) with a shared queue; XCTest and Glance tests; demo recording of a day at 60x speed.

**Tasks (TDD order):**
1. Snapshot builder tests: domain state in, JSON valid against `widget-snapshot.v1` out, including stale, exhausted, demo and signed-out cases.
2. Throttle test: many effects within the interval produce one publish.
3. iOS: XCTest decodes every fixture snapshot; timeline provider test produces entries every N minutes from `trend`; SwiftUI view snapshot tests per state (swift-snapshot-testing, proposed). Implement extension.
4. Android: Glance unit tests (`androidx.glance:glance-appwidget-testing`) per state. Implement widget.
5. Interactive check-in: test that the intent appends to the shared queue; app test drains the queue into the outbox exactly once. Implement on both platforms.
6. Background refresh test (Dart side with fake scheduler) and a manual check on devices, logged in the ledger.
7. Visual approval by Nour on iPhone and Pixel simulators against the Phase 3 widget preview.

**Tests that prove it:** snapshot builder tests, XCTest and Glance tests, queue drain test, a Patrol test that a check-in changes the stored snapshot.

**Definition of done:** widgets approved by Nour; widget updates within one publish of a mock scenario effect; widget never shows data older than `staleAfter` without the stale marker; emoji check covers native widget code.

**Skills:** `frontend-design`, `impeccable:impeccable`, `ui-implementer`, `design:design-critique`, `design:accessibility-review`, `animation-systems`, `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `superpowers:requesting-code-review`, `run`.

---

## Phase 8: Alerts and notifications (7%)

**Goal:** the few alerts that matter, delivered as local notifications, respectful of quiet hours and toggles.

**Deliverables:** `AlertCenter` with rules from `config/alerts.yaml`, `flutter_local_notifications` channels (Android) and categories (iOS) per alert kind, deep links from notification tap, Alerts tab wired, Settings toggles persisted. Remote push (FCM) is prepared behind an interface but only enabled in Phase 11 or if Nour says yes now.

**Tasks (TDD order):**
1. Rule tests: which effects produce which alert kind; thresholds from config; quiet hours suppress but still list in the Alerts tab; per-kind toggle off suppresses.
2. Grouping test: five invasion alerts in ten minutes become one notification ("5 attacks in 10 minutes", copy from config).
3. Deep link test: tapping a notification payload routes to the right screen.
4. Permission flow test: denied permission shows an inline explanation in Settings, never a nag loop.
5. Patrol test: scenario `interview-week` produces a raid notification; tap opens Today.

**Tests that prove it:** rule, grouping, deep link and permission tests; Patrol notification test.

**Definition of done:** notification copy approved by Nour; no emoji in any template; alerts work with the app in background (local scheduling) and foreground.

**Skills:** `design:ux-copy`, `writing-guidelines`, `superpowers:test-driven-development`, `security-review` (notification payload contents), `superpowers:requesting-code-review`.

---

## Phase 9: Hardening (6%)

**Goal:** it survives real life: bad networks, old data, small phones, big text, long weeks.

**Tasks:**
1. Failure-injection tests on mock_budokai (`/_scenario/faults`: slow, 500, malformed, STOMP drop) and the client's behaviour for each.
2. Drift migration test from every released schema version.
3. Performance: `flutter run --profile`, DevTools timeline on Today scroll and check-in; target 60/120 fps with no jank frames over 16 ms on a mid-range Android emulator profile; record numbers in the ledger.
4. App size check (`flutter build apk --analyze-size`), budget from config in CI.
5. Accessibility audit of every screen and the widgets (VoiceOver, TalkBack, 200% text, Reduce Motion, contrast).
6. Security review: token storage, logs contain no tokens, deep link validation, no secrets in the binary (`strings` on the build).
7. `simplify` pass over the codebase; dead code removed.

**Tests that prove it:** fault tests, migration tests, size budget check in CI, accessibility tests green.

**Definition of done:** no open serious findings; performance numbers recorded.

**Skills:** `security-review`, `design:accessibility-review`, `performance-profiling`, `simplify`, `code-review`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`.

---

## Phase 10: Docs, demo video, public launch (7%)

**Goal:** a public repo that explains itself in 30 seconds. **Ask Nour before creating the GitHub repo, making it public, pushing `main` or publishing any build.**

**Deliverables:** README with hero image (the widget on a home screen), a 30-second demo video and GIF (simulator screen recording of `typical-day` at 60x: the widget ring sliding, an offline check-in syncing, an alert arriving), architecture diagram, "How to run" (demo flavor in one command), "AI workflow" section (how Nour works with coding agents, written by Nour's rules: honest, no attribution lines), test badges, licence (proposed MIT), release APK on GitHub Releases (if Nour agrees), optional TestFlight (only with Apple Developer Program, USD 99/year, Nour's call).

**Tasks:**
1. Record the demo (simulator recording, `xcrun simctl io booted recordVideo`), cut to 30 s, export GIF with `ffmpeg`.
2. README and docs pass with `writing-guidelines`.
3. Final push checklist (`CLAUDE.md` §8), contributor check.
4. Ask Nour: create repo `b14ckPanther/darb-capsule`? Public? Push? Release APK?
5. After yes: `publish-project-to-github`.

**Tests that prove it:** full CI green on `main`; push checks print only Nour and 0.

**Definition of done:** Nour approved and the repo is public with README, video and green CI.

**Skills:** `writing-guidelines`, `publish-project-to-github` (only after Nour's yes), `superpowers:finishing-a-development-branch`, `superpowers:verification-before-completion`, `code-review`.

---

## Phase 11 (optional, outside 100%): connect to the real Darb Budokai

See `INTEGRATION.md` §4. Starts only when Darb Budokai's gateway and notification service exist and Nour asks for it.

**Skills:** `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `security-review`.
