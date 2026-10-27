# Vision

Status: the role, the "what" and the signature come from Nour's roadmap. The project is marked **[NEEDS REVIEW]**: Phase 1 first asks whether Nour still wants it and in what shape. Everything else here is **proposed, confirm with Nour in Phase 1**.

## Intent

Darb Budokai lives on a big screen: a 3D world map, a battle log, a skill tree. But real life happens away from the desk. Darb Capsule is the small, always-there part of Darb Budokai: one glance at the home screen tells you how your character (and so your day) is going, one tap checks off a habit even in a basement with no signal, and one notification tells you when something that matters happened.

It is a companion, not a second Darb Budokai. It does not show the 3D map and it does not run game rules.

## Goals

1. **The widget is the product.** A home-screen widget (iOS small and medium, Android 2x2 and 4x2) shows the character's health and stamina, level, and the next open daily quest. It updates through the day as real events land. This is the signature moment.
2. **Check in anywhere.** Daily quests can be checked off offline. Check-ins queue in a local outbox and sync when the network returns, without duplicates.
3. **Character sheet in your pocket.** Level, XP, the four stats, stamina and health with a 7-day trend, recent effects ("+12 stamina, posture session").
4. **Alerts that matter, and only those.** A strong job match, an interview stage change, honeypots under attack, low stamina. Each alert type can be turned off. Quiet hours from config.
5. **Feels native.** On an iPhone it should feel like a well-made SwiftUI app; on Android like a good Material 3 app.
6. **Finished.** Shipped as a public repo with a demo video, golden tests and integration tests. Finishing matters more than breadth.

## Non-goals

- The 3D world map, battle-log replay and skill-tree editing. Those are Darb Budokai web.
- Recall study sessions (spaced repetition) on the phone. Possible later; not in this plan.
- Creating or editing habits. Capsule checks them off; Darb Budokai web manages them (proposed, confirm in Phase 1).
- Any game rule computed on the device.
- App Store / Play Store publication. Distribution is simulator demo, sideloaded APK and optionally TestFlight (ask Nour).
- Tablet-specific layouts, watchOS, Wear OS, Live Activities (candidates for "later" only).

## Anti-goals (failure even if it works)

- It looks like a Flutter template: stock Material on iOS, default blue, Roboto, `Icons.star`.
- It grows a fourth and fifth screen, a chat, a social feed, and never ships. (The yellowshifts outcome.)
- The widget is a static image that is stale for hours.
- Offline check-ins are lost or doubled.
- Notifications become noise and Nour turns them all off within a week.
- It needs Darb Budokai to be running to demo anything.
- Any emoji, cartoon mascot or childish visual.

## Why this stack for the Israeli junior market

- Flutter is the main cross-platform mobile framework hiring in Israel next to React Native; product companies with one mobile team for both platforms (fintech, health, consumer apps) list it.
- Nour's profile has no public Dart. A finished Flutter app with Riverpod, Drift, native widget extensions (Swift + Kotlin) and real tests closes that gap and shows platform-native work, not just Dart.
- It reuses the event-driven, offline-sync thinking that backend listings value (outbox, idempotency keys), now on the client.
- It plugs into Darb Budokai (Java/Spring/GraphQL), so the portfolio shows one system with a web client, a mobile client and many producers, not isolated toys.
