# Integration with the universe

Source of truth for Darb Budokai's side: `../darb-budokai/docs/EVENT_CONTRACTS.md` (§3.6 Darb Capsule, §4 effect events) and `../darb-budokai/docs/ARCHITECTURE.md`. Capsule copies a snapshot of the parts it uses into `contracts/budokai/` in Phase 4 and records the Darb Budokai commit or doc date it was taken from.

Darb Budokai already fixes: Capsule uses the **public GraphQL API** for normal actions and sends **`habit.checked` v1** events only for offline batches. Everything else here is **proposed, confirm with Nour in Phase 1** (and some items need a change in Darb Budokai, listed in §5).

Capsule must never depend on Darb Budokai existing. Phases 0 to 10 run fully against `tools/mock_budokai`. Switching to the real Darb Budokai is the optional Phase 11.

## 1. What Capsule consumes

### 1.1 GraphQL operations (proposed shape; Darb Budokai's `contracts/graphql/schema.graphqls` wins once it exists)

```graphql
query PocketSnapshot {
  me { id displayName timezone }
  character {
    id name level title xp xpToNext
    stats { key rank xp xpToNext }               # vigor, craft, lore, resolve
    vitals {
      stamina staminaMax staminaStatus           # normal | exhausted
      health healthMax healthStatus              # see open question Q4
      staminaTrend { at value }                  # projected next hours, from rulebook
      asOf
    }
    equipped { itemId slot glyphKey name }
  }
  todayQuests { id kind title objective progress target dueAt habitId }
  recentEffects(limit: 20) { id type at causationId summary payload }
  pocketAlerts(since: $since) { id kind title body at deepLink }
  capsuleConfig { key value }                     # server overrides for client behaviour
}

mutation SubmitCheckIns($input: [CheckInInput!]!) {
  submitCheckIns(input: $input) { clientEventId status reason }  # ACCEPTED | DUPLICATE | REJECTED
}
input CheckInInput { clientEventId: ID! habitId: ID! checkedAt: DateTime! note: String }
```

### 1.2 Live effects (STOMP, while the app is open)

Subscribed destinations: `/user/queue/effects`, `/user/queue/battlelog`. Effect types Capsule handles (from Darb Budokai §4.2): `character.xp.awarded`, `character.level.reached`, `character.stamina.changed`, `character.skill.unlocked`, `quest.created`, `quest.progressed`, `quest.completed`, `quest.failed`, `raid.started`, `raid.cleared`, `boss.engaged`, `boss.defeated`, `loot.dropped`, `battlelog.compiled`. Unknown types are stored and ignored (forward compatible).

### 1.3 Alerts from sibling projects (always through Darb Budokai)

Capsule never talks to Darb Ki or Darb Scouter directly. Darb Budokai turns their events into Capsule alerts:

| Alert kind | Origin | Darb Budokai source (proposed) |
|---|---|---|
| `invasion` | Darb Ki | new event `ki.attack.burst` v1 (needs Darb Budokai + Darb Ki contract) |
| `strong_match` | Darb Scouter / Job Radar | new event `job.match.found` v1 with `score` (needs a Darb contract) |
| `raid` | Darb Scouter | existing `stage.changed` mapped to `raid.started` |
| `exhausted` | Darb Budokai | `character.stamina.changed` with `status: exhausted` |
| `battlelog_ready` | Darb Budokai | `battlelog.compiled` |

Thresholds (what counts as a "strong" match, attack burst size) live in Darb Budokai's rulebook or in Capsule's `config/alerts.yaml` (proposed: Darb Budokai decides what is an alert; Capsule decides whether to notify, using quiet hours and per-kind toggles).

## 2. What Capsule emits

### `habit.checked` v1 (fixed by Darb Budokai's contract)

```json
{ "habitId": "uuid", "checkedAt": "date-time", "note": "string?", "evidenceUrl": "uri?" }
```

Envelope (Darb Budokai's CloudEvents 1.0): `source = urn:budokai:producer:darb-capsule`, `id = clientEventId` (UUIDv7 generated on the device at tap time), `time = checkedAt`, `budokaievidence.tier = self_reported` (or `attested` with `evidenceUrl`), `budokaimode = live` (or `demo` in demo flavor, which never leaves the device anyway).

**Transport (proposed, needs Darb Budokai change):** Darb Budokai's ingest authenticates producers with an HMAC secret. A secret inside a public mobile app is not secret. So Capsule does **not** call `/ingest/v1/events:batch` directly. It calls the `submitCheckIns` GraphQL mutation with the user's JWT; the gateway forwards to quest-service, which publishes `habit.checked` through ingest's internal endpoint with `id = clientEventId`. Ingest's dedupe by `id` makes retries safe.

### Capsule-owned schema: `widget-snapshot` v1

Not a universe event; the contract between the Flutter app and the native widgets. File: `contracts/capsule/widget-snapshot.v1.schema.json` (JSON Schema 2020-12).

```json
{
  "schemaVersion": 1,
  "generatedAt": "date-time",
  "mode": "live|demo|signed_out",
  "character": { "name": "string", "level": 0, "title": "string" },
  "vitals": { "stamina": 0, "staminaMax": 0, "staminaStatus": "normal|exhausted",
              "health": 0, "healthMax": 0, "statusText": "string",
              "trend": [ { "at": "date-time", "stamina": 0 } ],
              "todaySoFar": [ { "at": "date-time", "stamina": 0 } ] },
  "nextQuest": { "id": "string", "title": "string", "progress": 0, "target": 0 },
  "staleAfter": "date-time"
}
```

Versioning: additive optional fields keep v1; anything else is `v2`, and the native widgets must read both until the app has migrated every install (the app rewrites the snapshot on launch).

## 3. Mock Darb Budokai server

`tools/mock_budokai` implements exactly the operations in §1 and the STOMP destinations, from:
- `contracts/budokai/schema.graphqls` (snapshot of Darb Budokai's schema, or the proposed subset above until Darb Budokai publishes one);
- `contracts/budokai/events/*.schema.json` (snapshots of the effect and `habit.checked` schemas) used to validate everything the mock emits;
- `config/scenarios/*.yaml`, timed scripts of effects ("08:40 posture session +18 stamina", "13:00 stage.changed to tech_interview").

A contract test runs every Capsule GraphQL document against the schema snapshot, and every mock-emitted payload against the event schemas. When Darb Budokai's real schema appears, refreshing the snapshot shows exactly what broke.

## 4. Optional Phase 11: connect to the real Darb Budokai

Not part of the 100%. Only when Darb Budokai's gateway and notification service run.

1. Replace `contracts/budokai/` snapshot with Darb Budokai's published schema and event schemas; fix contract test failures.
2. Point `env/dev.json` at Darb Budokai (`http://localhost:8080/graphql`, `ws://localhost:8088/ws`).
3. Run the Patrol suite against Darb Budokai with its simulator (`typical-week` scenario).
4. Agree the §5 changes with Darb Budokai and implement them there (in Darb Budokai's repo, its own phase).
5. Optional remote push: Darb Budokai's notification-service sends FCM messages (and APNs through FCM) for alert kinds; Capsule registers its FCM token with a `registerPushToken` mutation.

## 5. Changes Capsule needs from Darb Budokai (to raise in Darb Budokai's repo, not here)

1. A `health` value on the character (Darb Budokai has stamina, not health today). See open question Q4.
2. `submitCheckIns` mutation with per-item idempotency, as above (instead of HMAC ingest from the device).
3. `staminaTrend` projection in the API, computed from Darb Budokai's rulebook, so the widget can move between refreshes without Dart or Swift knowing game rules.
4. `pocketAlerts` query and the two new upstream event types (`ki.attack.burst`, `job.match.found`).
5. Optional: FCM sender in notification-service and a `registerPushToken` mutation.
