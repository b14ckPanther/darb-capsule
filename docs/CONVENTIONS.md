# Conventions

Proposed, confirm with Nour in Phase 1 (except commit rules, which are fixed).

## Code style

- Dart 3, `dart format` (default 80 columns, proposed), lints from `very_good_analysis` plus `custom_lint` + `riverpod_lint`.
- Null safety strict; `strict-casts`, `strict-inference`, `strict-raw-types` on in `analysis_options.yaml`.
- Riverpod: code-generated providers (`@riverpod`), `AsyncNotifier` for mutable state, no global singletons, no `StateProvider` in new code. UI reads providers; providers read repositories; repositories read Drift / API.
- Immutable models with `freezed` + `json_serializable`. Domain models do not import Flutter.
- No numeric literals in `features/**/domain/**` except 0 and 1 (lint). Durations, thresholds and sizes come from `AppConfig` or design tokens.
- Widgets: small, `const` where possible, one public widget per file. Platform-adaptive widgets live in `lib/design/components/adaptive/`.
- Strings: structural labels in ARB (`lib/l10n/app_en.arb`, `flutter gen-l10n`); changeable copy in `config/copy/en.yaml`. No user-facing literals in widgets. No emoji anywhere.
- Icons: only through `AppIcon(IconKey.x)`, which maps keys in `config/icons.yaml` to compiled SVGs. Never `Icons.*` or `CupertinoIcons.*`.
- Swift (widget extension): Swift 6, SwiftUI, `swift-format`. Kotlin (Glance widget): Kotlin 2, `ktlint`.

## Project layout

```
darb-capsule/
├── app/
│   ├── lib/
│   │   ├── main_demo.dart  main_dev.dart  main_prod.dart
│   │   ├── app/                 router, shell, theme switch
│   │   ├── core/                config, background, logging, result types
│   │   ├── design/              tokens (generated), components, icons
│   │   ├── data/                auth, budokai_api (ferry), live (stomp), db (drift), sync, demo
│   │   ├── features/
│   │   │   ├── today/           data/ domain/ presentation/
│   │   │   ├── character/
│   │   │   ├── alerts/
│   │   │   ├── settings/
│   │   │   └── widget/          snapshot builder and publisher
│   │   └── l10n/
│   ├── graphql/                 *.graphql operations (ferry)
│   ├── test/                    mirrors lib/, plus goldens/
│   ├── integration_test/        patrol tests
│   ├── ios/  (Runner, CapsuleWidget extension)
│   └── android/ (app, widget package)
├── tools/
│   ├── mock_budokai/              Dart shelf server, its own tests
│   ├── check_no_emoji.py
│   └── lints/
├── contracts/
│   ├── budokai/                   snapshot of Darb Budokai schema and event schemas + SOURCE.md
│   └── pocket/                  widget-snapshot schema
├── config/                      app.yaml, alerts.yaml, icons.yaml, copy/, seed/demo/, scenarios/
├── design/tokens.json
├── env/example.json
├── .githooks/commit-msg
├── .github/workflows/ci.yml  .github/pull_request_template.md
├── ASSETS.md  README.md  CLAUDE.md  AGENTS.md  LICENSE
└── docs/
```

## Testing conventions

- Test file mirrors source path: `lib/data/sync/outbox.dart` → `test/data/sync/outbox_test.dart`.
- Test names say behaviour: `test('rejected check-in reverts the quest step')`.
- Arrange with builders in `test/support/builders.dart`, never with copied JSON blobs inline.
- Fake time with `fake_async` / `clock`; never `Future.delayed` in tests.
- Goldens with `alchemist`: CI goldens generated on Linux are the reference; platform goldens for local review only. Updating goldens requires Nour's approval of the visual change, noted in the commit body.
- Integration tests use `patrol` and the mock server started by the test harness; tagged `@Tags(['integration'])`.
- No network in unit or widget tests (`HttpOverrides` that throws).

## Commits

- Imperative, plain English, first line under 72 characters, no type prefix required. Body explains why when it is not obvious.
- Good: `Throttle widget snapshot publishing to the configured interval`
- Bad: `fix stuff`, `WIP`, anything with an emoji.
- No AI attribution, ever: no `Co-Authored-By`, no "Generated with", never the words "claude" or "anthropic". Author and committer are always `Nour Alden Mousa <nmcryptoinvest@gmail.com>`.
- Small, honest, working commits. Never backdated, never squashed into one giant commit at the end.

## Branches

- `main`: always green, protected; merges only with Nour's yes.
- One branch per phase: `phase/NN-short-name` (`phase/06-offline-sync`).
- Optional short-lived task branches off the phase branch: `phase/06-offline-sync--outbox-backoff`, merged back locally.

## PR template (`.github/pull_request_template.md`)

```markdown
## What

<one paragraph: what this phase or change delivers>

## Why

<link to the spec in docs/specs/ and the phase in docs/PLAN.md>

## How to try it

- `fvm flutter run --flavor demo --dart-define-from-file=env/demo.json`
- <scenario or screen to look at>

## Screenshots

<simulator screenshots: iOS and Android, light/dark if relevant>

## Checks

- [ ] Tests written first; `flutter analyze` and `flutter test` green
- [ ] No hardcoded thresholds, copy or game rules
- [ ] No secrets, signing files or Firebase configs
- [ ] Emoji check passes; icons only from the chosen SVG set
- [ ] Native-feel check done on iOS simulator
- [ ] Accessibility: screen reader, 200% text, Reduce Motion, contrast
- [ ] `docs/PROGRESS.md` updated
```

The template contains no attribution line and none may be added.
