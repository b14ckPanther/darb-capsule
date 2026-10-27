# AGENTS.md

This repo's full agent manual is **`CLAUDE.md`**. Every agent tool (Codex, Cursor, Copilot, Gemini, Aider, others) must read and follow it. The rules below are a summary; if anything differs, `CLAUDE.md` wins.

## Non-negotiable rules

1. **No AI contributors.** "Never add "Co-Authored-By" or any other AI attribution line to commit messages, pull request descriptions, or any other text, in any project. Commit messages end with the last line of the actual description." Every commit is authored and committed as `Nour Alden Mousa <nmcryptoinvest@gmail.com>` (`git config user.name/user.email` set in the repo). Never write the word "claude" in a commit message.
2. **No hardcoded data.** Thresholds, alert rules, copy, endpoints and seed content live in `config/*.yaml`, `--dart-define-from-file` env files or the database. Game numbers come from Darb Budokai's API. Fixtures only in tests and the labelled `demo` flavor.
3. **Secrets** only in env files / keychain; never in the app binary or the repo. Keep `env/example.json` and `.env.example` current.
4. **Original assets only.** No third-party IP. Google Fonts OK. Log third-party assets in `ASSETS.md`.
5. **Ask Nour first** before creating or publicising the GitHub repo, pushing `main`, merging, publishing builds, paid accounts or deleting. Commit locally freely, one branch per phase (`phase/NN-name`), small honest commits.
6. **TDD.** Failing test first, watch it fail, implement. No live services in tests or CI; use `tools/mock_budokai` and recorded fixtures.
7. **UI/UX first.** Design system (Phase 2), then prototype on seed data approved screen by screen (Phase 3), then data and native work. Dynamic Type, screen readers, Reduce Motion, WCAG AA contrast.
8. **Native feel, no emoji.** SwiftUI-grade feel on iOS (large titles, sheets with detents, springs, 44pt targets, translucent materials, swipe actions) with Cupertino-quality widgets, not stock Material. One modern SVG icon set (Solar or Lucide) or custom SVG. Emoji forbidden everywhere; `tools/check_no_emoji.py` must pass.
9. **Use installed skills.** Check the skill list before each task, invoke matching skills first, name them in the ledger. See `CLAUDE.md` §3.
10. **Workflow:** brainstorm, written spec (`docs/specs/`), plan (`docs/plans/`), execute with ledger (`docs/PROGRESS.md`), whole-branch review, ask before merge.
11. **Tight scope.** Only what the current phase in `docs/PLAN.md` lists.

## Push checklist

```bash
git log --format='%an %ae%n%cn %ce' | sort -u          # only: Nour Alden Mousa nmcryptoinvest@gmail.com
git log --format=%B | grep -ciE 'co-authored|claude|anthropic|generated with'   # must be 0
```

## Resume after a reset

Read `CLAUDE.md`, then `docs/PROGRESS.md`, then `git log --oneline -20`, then the current phase in `docs/PLAN.md`.
