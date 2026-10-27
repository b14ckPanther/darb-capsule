# Open questions (only Nour can decide)

Asked in Phase 1, **one at a time**, open-ended first. Record each answer as an ADR in `DECISIONS.md` and move the question to "Resolved" below with the date.

Blocking questions must be answered before Phase 2 starts.

## Open-ended (ask first)

**Q1 (blocking). This project is marked NEEDS REVIEW. Do you still want Darb Capsule, and in what shape?**
Options to offer only if Nour asks for them: (a) as planned: three tabs, widget, offline check-ins, alerts; (b) widget-first: only the widget plus a single Today screen, about half the work; (c) fold it into Darb Budokai web as an installable PWA and drop Flutter (loses the Dart proof); (d) drop it. If the answer is not (a), rewrite `PLAN.md` with Nour before continuing.

**Q2 (blocking). When you glance at your phone during the day, what do you want the character to tell you?**
This decides what the widget shows. The roadmap says health and stamina; is anything else essential (next quest, streak, level)?

**Q3. What made yellowshifts stall, and what would make you keep going on this one?**
Used to adjust scope, phase size and how often Nour sees visible progress.

**Q4 (blocking). What is "health" in Darb Budokai?**
Darb Budokai's game design has stamina but no health. Options: a new Darb Budokai stat (what drains and restores it?), a rename of stamina's status, or a composite (sleep, missed days, streaks). Capsule needs Darb Budokai to own it (INTEGRATION.md §5).

**Q5. Which alerts would you actually want on your lock screen, and which would annoy you?**
Proposed kinds: invasion (honeypot attacks), strong job match, raid (interview stage), exhausted, battle log ready.

## Specific choices

**Q6 (blocking). Art direction:** A "Ember Atlas, pocket" (default), B "Field Journal", or C "Lantern"? Shown side by side in Phase 1.

**Q7. Icon set:** Solar (Iconify, duotone bold) or Lucide?

**Q8. Platforms for the demo:** iOS and Android equally, or iOS-first with Android parity checked at the end? Which phone do you carry?

**Q9. Paid accounts:** Will you pay for the Apple Developer Program (USD 99/year) for TestFlight and real APNs push, or stay on simulator plus Android APK (USD 0)?

**Q10. Remote push:** Is local notification (works while Capsule refreshes in the background) enough, or do you want true server push via FCM (needs a change in Darb Budokai)?

**Q11. Widget check-in:** Should tapping a quest on the widget check it in directly (iOS 17+ and Android only), or just open the app?

**Q12. Habits:** Can Capsule create or edit habits, or only check them in? (Proposed: check in only.)

**Q13. Darb Budokai changes:** OK to add `health`, `submitCheckIns`, `staminaTrend`, `pocketAlerts`, `ki.attack.burst` and `job.match.found` to Darb Budokai's plan? (INTEGRATION.md §5)

**Q14. Repo name and licence:** `b14ckPanther/darb-capsule`, MIT?

**Q15. Sound:** none, or a soft procedural ink tap on check-in?

## Later (not in the 100%, park ideas here)

- Recall study sessions on the phone.
- Live Activities / Dynamic Island for a running raid.
- watchOS / Wear OS complication.
- Tablet layout.

## Resolved

| Date | Question | Answer | ADR |
|---|---|---|---|
| | | | |
