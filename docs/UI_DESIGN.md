# UI design

Fixed by the roadmap: the character sheet and daily quests on the phone and home screen, offline check-ins, alerts for attacks and strong job matches, and the signature home-screen widget where health and stamina change with the real day. Quality bar: "jaw-dropping", never childish or template-looking. Native feel: as native as SwiftUI.

Everything below (art directions, palette, fonts, screen layouts, widget sizes) is **proposed, confirm with Nour in Phase 1**. Phase 2 turns the chosen direction into the design system; Phase 3 builds the screens on seed data, approved one at a time.

## 1. Signature moment: the living widget

A home-screen widget that is the character's vital signs, drawn, not a list of numbers.

**Medium widget (iOS systemMedium, Android 4x2):**
- Left: the character's sigil (an original line-drawn emblem, custom painted, no avatar face) inside a ring. The ring is two arcs: **stamina** (outer, ember-coloured) and **health** (inner, bone-coloured). Arcs are drawn as engraved strokes, with a faint tick every 10% of the server's max.
- Right: level and title in display type; the next open daily quest with its progress ("Walk 20 min, 1 of 2"); a one-line status from Darb Budokai's copy ("Rested", "Worn down", "Exhausted").
- Bottom edge: a hairline sparkline of stamina since local midnight, so you see the day's shape (morning refill from posture, afternoon slide).
- When stamina is below the Exhausted threshold (from Darb Budokai), the ring dims and the sigil's lines thin out. When health is low, the inner arc shows a hairline crack. No red flashing.
- Stale data (last sync older than the threshold in config) shows a small clock glyph and "as of 14:10". Never pretend to be live.

**Small widget (systemSmall, 2x2):** ring and sigil only, level in the centre, status word below.

**Lock screen / accessory (iOS accessoryCircular, accessoryRectangular):** stamina gauge (`Gauge` with `.accessoryCircular` style) and the next quest line. Monochrome by design.

**How it moves with the day:** Darb Budokai sends `vitals` plus a short `staminaTrend` (projected values for the next hours from its rulebook). The iOS `TimelineProvider` turns that into entries every 15 minutes, so the bar drifts down through the afternoon without the app running. New real events (posture session, check-in) republish the snapshot and the widget reloads. On iOS 17+ the ring change animates with WidgetKit's built-in content transition (`.contentTransition(.numericText())` for numbers); on Android Glance, it redraws.

**Interactive check-in (iOS 17+ App Intents, Android Glance `actionRunCallback`):** tapping the quest line's check circle checks it in from the widget. The intent writes to the outbox through the shared App Group (proposed: a tiny shared JSON queue the app drains on next launch or background task), so it works offline too. If this proves fragile in Phase 7, it becomes "tap opens the Today screen" and is logged as a ruling.

## 2. Screens (tight scope: three tabs and two sheets)

Bottom tab bar with three tabs. Nothing else in the first release.

### 2.1 Today (default tab)
- Large collapsing title: the date in display type, status word under it.
- Vitals card: the same ring as the widget, larger, with the stamina sparkline. Tap opens the Vitals sheet.
- Today's quests as a native grouped list. Each row: quest glyph, title, progress, check circle (44pt). **Swipe right to check in, swipe left to add a note** (native swipe actions). Long press shows a context menu (iOS `CupertinoContextMenu`): Check in, Add note, Open in Darb Budokai web.
- Pending sync shows a small hollow-circle glyph on the row; when acked, the glyph fills with a spring.
- Pull to refresh (`CupertinoSliverRefreshControl`).
- Empty state: a line drawing of a quiet camp, copy from config ("No quests today. Darb Budokai generates them at 05:00." with the hour from Darb Budokai).

### 2.2 Character
- Large title: character name. Under it: level, title, XP bar to next level.
- The four stats (names from Darb Budokai: Vigor, Craft, Lore, Resolve, proposed by Darb Budokai) as engraved rows with rank and a 7-day stat-XP sparkline (`dataviz` skill for the sparkline rules).
- Recent effects: a native list of the last 20 effects, each with a glyph per effect type and the cause ("Posture session, 48 good minutes"). Tap opens the Effect sheet.
- Equipped items as a single row of small line-drawn glyphs (read-only).

### 2.3 Alerts
- Native inset grouped list grouped by day.
- Alert types (proposed): **Invasion** (honeypot attack burst, from Darb Ki through Darb Budokai), **Strong match** (job match above threshold, from Darb Scouter / Job Radar through Darb Budokai), **Raid** (interview stage change), **Exhausted** (stamina below threshold), **Battle log ready**.
- Swipe left to dismiss, swipe right to mark read. Top-right "Settings" button opens the Settings sheet.

### 2.4 Sheets
- **Vitals sheet** (medium and large detents, drag to dismiss): stamina and health over 7 days, the events that moved them, Darb Budokai's explanation copy.
- **Effect sheet** (medium detent): one effect, its cause event and evidence tier, "Open in Darb Budokai web".
- **Settings sheet** (large detent): account, per-alert-type toggles, quiet hours, widget theme (if the direction offers light and dark), Reduce Motion override, demo mode banner, version and licences.
- **Sign-in** is a full-screen route before the tabs: server URL (dev only), email, password, nothing else.

## 3. Native feel (Rule 11)

Nour: "the apps must feel as native as a SWIFT UI when it comes to mobile apps... use only modern elements and icons and SVGs ... emojis and low quality icons are forbidden".

**iOS (Cupertino-quality, not stock Material):**
- `CupertinoApp`-level theming on iOS via an adaptive shell; `CupertinoSliverNavigationBar` large titles that collapse into the inline bar on scroll; `CupertinoTabScaffold`-style bottom tab bar with translucent blurred background.
- Sheets via `CupertinoSheetRoute` / `showCupertinoSheet` (Flutter 3.29+) or `modal_bottom_sheet`-style detents (medium, large), with drag-to-dismiss and the background scale-down effect.
- Lists: `CupertinoListSection.insetGrouped`, `CupertinoListTile`; swipe actions via `flutter_slidable` styled to iOS (full-swipe triggers the primary action, haptic on threshold).
- Context menus: `CupertinoContextMenu`. Switches, pickers, alerts and action sheets: Cupertino widgets.
- Safe-area insets on every screen (`SafeArea`, `MediaQuery.paddingOf`), including the home indicator and Dynamic Island.
- Materials: translucent bars use `BackdropFilter(ImageFilter.blur(sigma 20–30))` over a tinted fill, matching iOS "regular material".
- SF Pro is the system font on iOS and cannot be redistributed; the brand display face comes from Google Fonts (see §5) and body text uses the platform system font so Dynamic Type behaves natively (proposed).

**Android:** Material 3 components with the same tokens, predictive back gesture, Material motion. Never iOS chrome on Android.

**Both:**
- Touch targets at least 44x44pt (iOS) / 48x48dp (Android).
- Pressed state: scale to 0.97 with a spring. Scale and spring values are motion tokens in the design system (`lib/design/tokens/motion.dart` generated from `design/tokens.json`), never inline literals.
- Haptics: `selectionClick` on toggles and tab changes, `mediumImpact` on check-in, `heavyImpact` never.
- Icons: **one** modern SVG set (proposed: **Solar** via Iconify, skill `solar-duotone-bold`, or **Lucide**; Nour picks in Phase 1) plus custom-drawn SVG glyphs for game concepts (stat marks, quest kinds, sigils). Rendered with `vector_graphics` (precompiled SVG). No `Icons.*`, no `CupertinoIcons` mixed in, no raster icons. Company logos in alerts (e.g. a job match at a company) only via Iconify Simple Icons (skill `company-logos`) and only if the licence allows.
- **No emoji anywhere**: UI, notifications, widget, alerts, copy YAML, docs, commits. Enforced by `tools/check_no_emoji.py`.

## 4. Interaction and motion rules

- Springs, never linear. Default tokens (proposed, in the design system): `spring.snappy` (response 0.3 s, damping ratio 0.85) for presses and toggles; `spring.smooth` (response 0.5 s, damping 1.0) for sheets and ring changes; `spring.bouncy` (response 0.45 s, damping 0.7) only for the check-in confirmation.
- Check-in moment: the check circle fills with ember ink from the tap point (custom painter), the row's progress number rolls, the vitals ring nudges. Total under 600 ms. Haptic at fill completion.
- Ring changes animate along the arc; never jump unless Reduce Motion.
- Lists: insert/remove with `SliverAnimatedList` and a short fade+slide (8pt).
- Nothing animates in a loop on screen except a very slow ember drift behind the vitals ring (shader, 0.1 Hz), which is off under Reduce Motion and when battery saver is on.
- **Reduce Motion** (`MediaQuery.disableAnimations`, iOS Reduce Motion, Android "Remove animations"): springs become 150 ms crossfades, no ember drift, ring values set without travel, sheets still slide (system behaviour) but without background scale. An in-app override in Settings.
- Sound: off by default and optional (proposed): a soft ink tap on check-in, made with `procedural-sfx`.

## 5. Art direction (pick one in Phase 1)

All three are original and stay consistent with Darb Budokai's own proposed direction (Ember Atlas: ink, brass, ember light), so Capsule feels like the same world.

### A. "Ember Atlas, pocket" (proposed default)
Darb Budokai's look shrunk to a pocket instrument. Deep ink background, fine brass hairlines, ember light for stamina, bone-white text. The vitals ring looks like an engraved brass dial; the sigil is drawn in thin contour lines. Dark only, with a high-contrast variant.
- Tokens (from Darb Budokai's proposal): `ink-950 #0B0E13`, `ink-900 #11161E`, `bone-100 #ECE6D8`, `bone-300 #B9B2A3`, `ember-400 #F08A4B`, `brass-400 #C9A45C`, `verdigris-400 #4FB3A0`, `blood-400 #E0645C`, `fog-500 #5B6676`.
- Type: **Cormorant** (display, large only), system font for UI and body, **JetBrains Mono** for numbers with tabular figures.

### B. "Field Journal"
A surveyor's notebook carried in the field. Warm paper light mode as the primary theme, ink drawings, pencil-grey hairlines, one ember accent. The ring is drawn like a hand-inked gauge on graph paper (subtle grid texture as a shader). Dark mode is "the same notebook by lamplight".
- Tokens (proposed): `paper-50 #F4EFE4`, `paper-200 #E3DCCB`, `ink-900 #1B1E24`, `graphite-500 #5C6170`, `ember-600 #B4552A` (AA on paper), `moss-600 #3F6B55`.
- Type: **Fraunces** (display), system font, **IBM Plex Mono** for numbers.

### C. "Lantern"
Almost black. The only light is a living flame: stamina is literally the size and steadiness of a lantern flame rendered with a fragment shader (`FragmentProgram`), health is the glass of the lantern (cracks when low). The widget shows a static, precomputed rendering of the same flame state. Very quiet, very cinematic, most risky to build.
- Tokens (proposed): `night-980 #070809`, `smoke-700 #23262B`, `flame-300 #FFB35C`, `flame-500 #E9772E`, `glass-200 #CFE3E6`, `ash-400 #8A8F98`.
- Type: **Instrument Serif** (display), system font, **Geist Mono** for numbers.

Avoid in every direction: cartoon characters, chibi avatars, rounded bubbly cards, rainbow rarity colours, confetti, gradient blobs, stock Material blue, emoji, mixed icon sets.

## 6. Accessibility requirements

- WCAG AA contrast: 4.5:1 body, 3:1 large text and UI parts, checked by an automated token-pair test in Phase 2 and `textContrastGuideline` in widget tests.
- Dynamic Type / font scale up to 200% with no clipped text; large titles wrap. The widget uses its own fixed sizes (as iOS allows) but keeps contrast.
- Every interactive element has a `Semantics` label and hint; the vitals ring reads "Stamina 62 of 100, worn down. Health 80 of 100." Custom painters wrap in `Semantics`.
- Colour is never the only signal: status words and glyphs accompany ember/blood colours.
- Swipe actions also reachable through the context menu and through VoiceOver custom actions (`CustomSemanticsAction`).
- Hardware keyboard and switch control: focus order matches visual order; check-in reachable with Space/Enter on iPad and Chromebook.
- Reduce Motion as in §4. Haptics respect the system setting.
- Notifications carry plain text that makes sense without the app open (no glyph-only text).
