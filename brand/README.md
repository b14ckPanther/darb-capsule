# Darb Capsule brand

Capsule is a Darb product. It wears Darb's colours (night, forest, gold, ivory) and has its own mark: **the living widget, a home-screen tile with your character's two vitals.** Health is the outer ring, stamina the inner one; in the mark, stamina has run low because you have been slouching since lunch. It is the app's signature, and the capsule idea in miniature: a whole character carried in your pocket.

The hero image is the Dragon Ball moment: a capsule thrown, a burst of vapour, and your vitals unfolding out of it. Open the app and your whole sheet is there, even with no signal.

Chosen by Nour from four meaning-led directions (B "The Living Widget" for the icon, C "Press and Throw" for the hero; A "The World Inside" and D "No Signal Needed" are kept in `concepts/`). A was set aside because a two-tone capsule on its own reads as a medicine pill.

## See it

```sh
cd brand && npm install
node scripts/serve.mjs          # http://127.0.0.1:4180/ : brand sheet with every asset
```

## Rebuild every asset

```sh
npm run build                   # renders the three masters in Blender Cycles, then cuts everything
RENDER=0 npm run build          # reuses masters/ (no Blender needed) and rebuilds the flat assets
BLENDER=/path/to/blender npm run build   # when blender is not on PATH
```

Nothing is drawn by hand and nothing is hardcoded in the build:

| File | Holds |
|---|---|
| `src/tokens.json` | colours and roles (vigor for health, ember for stamina), type, the widget (size, corner, each ring's radius and fill, camera), render samples, icon sizes, copy |
| `src/render.py` | Blender scenes: the widget face-on (`tile`, and `safe` for maskable icons) and press-and-throw (`hero`) |
| `scripts/build.mjs` | renders the masters, cuts every icon, draws the flat marks from the same `tokens.widget` rings, writes wordmarks, social cards, manifest and CSS tokens |
| `masters/` | the three Blender renders, committed so the flat assets rebuild without Blender |
| `concepts/` | the four directions and `blender/capsule.py`, the script that rendered them |

## What's in `exports/`

| Path | Use |
|---|---|
| `icons/icon-192.png`, `icon-512.png` | PWA icons, purpose `any` (squircle cut) |
| `icons/icon-maskable-192.png`, `-512.png` | PWA maskable (widget inside the 80% safe zone) |
| `icons/apple-touch-icon.png` | iOS home screen, 180 px, opaque |
| `icons/icon-desktop-1024.png` | Desktop: macOS grid, 824 px body with system shadow |
| `icons/favicon.ico`, `favicon.svg`, `favicon-16/32/48.png` | Browser tab: thicker rings and no core, so both vitals read at 16 px |
| `icons/badge-96.png` | Notification badge and Android monochrome icon |
| `svg/mark-on-night.svg` | The flat widget on its tile, rings in vitals colours |
| `svg/mark-gold.svg`, `mark-ivory.svg`, `mark-ink.svg` | The rings alone, for any background |
| `svg/wordmark-on-dark.svg`, `-on-light.svg` | Lockup: mark, Darb, Capsule, カプセル (text outlined, no font needed) |
| `social/og-image.png`, `social/hero.png` | 1200 x 630 sharing card and 2400 x 1260 README hero |
| `manifest.webmanifest`, `head.html`, `tokens.css` | Drop-in PWA manifest, `<head>` tags and CSS tokens |

## Rules

- Vigor green is health and ember is stamina, always in that order (outer, inner). Seal red is only for an alert worth your attention. Never use them as decoration, and never show colour as the only signal.
- The capsule appears in motion (thrown, opening), never alone and still, so it never reads as a pill.
- No Capsule Corp-style logos, numbers on capsules, or anything copied from the show.
- Darb's doorway outline belongs to Darb itself; Capsule never uses it.
- Every visual is original and made in code. No official Dragon Ball art, logos, characters or audio.
- Fonts: Zen Antique (display), Geist (interface) and Yuji Boku (カプセル only), all under the SIL Open Font License (`fonts/`).
