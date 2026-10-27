// Builds every Darb Capsule brand asset from src/tokens.json.
//   npm run build              renders the masters in Blender (on PATH, or BLENDER=/path), then cuts everything
//   RENDER=0 npm run build     reuses masters/ and only rebuilds the flat assets
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = `${ROOT}exports/`
const MASTERS = `${ROOT}masters/`
const T = JSON.parse(await readFile(`${ROOT}src/tokens.json`, 'utf8'))
const C = Object.fromEntries(Object.entries(T.color).map(([k, v]) => [k, v.hex]))
const WG = T.widget
for (const d of ['icons', 'svg', 'social']) await mkdir(`${OUT}${d}`, { recursive: true })
await mkdir(MASTERS, { recursive: true })

const font = async (f) => opentype.parse((await readFile(`${ROOT}fonts/${f}`)).buffer)
const seal = await font(T.type.seal.file)
const display = await font(T.type.display.file)
const ui = await font(T.type.ui.file)

// ---------- 3D masters (Blender Cycles) ----------

const tileMaster = `${MASTERS}tile.png`, safeMaster = `${MASTERS}safe.png`, heroMaster = `${MASTERS}hero.png`
if (process.env.RENDER !== '0' || ![tileMaster, safeMaster, heroMaster].every(existsSync)) {
  const blender = process.env.BLENDER || 'blender'
  const run = (variant, out, w, h, samples) => {
    console.log(`rendering ${variant} ${w}x${h} at ${samples} samples`)
    execFileSync(blender, ['-b', '-P', `${ROOT}src/render.py`, '--', variant, out, String(w), String(h), String(samples)], { stdio: ['ignore', 'ignore', 'inherit'] })
  }
  run('tile', tileMaster, 2048, 2048, T.render.samples.icon)
  run('safe', safeMaster, 2048, 2048, T.render.samples.icon)
  run('hero', heroMaster, T.icons.hero[0], T.icons.hero[1], T.render.samples.hero)
}

// ---------- the flat marks: the same widget and rings as the render ----------

/** An arc from 12 o'clock, clockwise, covering `frac` of the circle, in a 200 box centred on (100, 100). */
function arc(r, frac) {
  if (frac >= 0.999) return `M100 ${100 - r}A${r} ${r} 0 1 1 99.99 ${100 - r}`
  const a = -Math.PI / 2 + 2 * Math.PI * frac
  return `M100 ${100 - r}A${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`
}
/** The widget: a rounded tile (optional), the vitals rings with their dim tracks, and the gold core. */
function widgetSvg({ tile, track, colors, core, scale = 1, width = WG.ringWidth, core0 = 0.16 }) {
  const u = 72 * scale / WG.size
  const t = tile ? `<rect x="${100 - WG.size * u}" y="${100 - WG.size * u}" width="${2 * WG.size * u}" height="${2 * WG.size * u}" rx="${WG.corner * u}" fill="${tile}"/>` : ''
  const rings = WG.rings.map((g, i) => {
    const r = g.radius * u, w = width * u
    return `${track ? `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${track}" stroke-width="${w}"/>` : ''}<path d="${arc(r, g.fill)}" fill="none" stroke="${colors[i] ?? C[g.color]}" stroke-width="${w}" stroke-linecap="round"/>`
  }).join('')
  return `${t}${rings}<circle cx="100" cy="100" r="${core0 * u}" fill="${core}"/>`
}
const defs = `<radialGradient id="l" cx="50%" cy="34%" r="75%"><stop offset="0" stop-color="${C.forest}"/><stop offset="1" stop-color="${C.night}"/></radialGradient>`
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>${defs}</defs>${body}</svg>\n`

const svgs = {
  'mark-on-night.svg': svg(widgetSvg({ tile: 'url(#l)', track: '#0A2A1E', colors: [], core: C.gold, scale: 1.25 })),
  'mark-gold.svg': svg(widgetSvg({ track: C.goldDeep, colors: [C.gold, C.gold], core: C.gold, scale: 1.18 })),
  'mark-ivory.svg': svg(widgetSvg({ colors: [C.ivory, C.ivory], core: C.ivory, scale: 1.18 })),
  'mark-ink.svg': svg(widgetSvg({ colors: [C.ink, C.ink], core: C.ink, scale: 1.18 })),
  // small sizes: thicker rings and no core, so the two vitals still read at 16 px
  'favicon.svg': svg(widgetSvg({ tile: C.night, track: '#123d2d', colors: [], core: 'none', scale: 1.25, width: 0.2 })),
  'badge-mono.svg': svg(widgetSvg({ colors: ['#fff', '#fff'], core: 'none', scale: 1.18, width: 0.2 })),
}
for (const [f, s] of Object.entries(svgs)) await writeFile(`${OUT}svg/${f}`, s)

// ---------- wordmark (text outlined: no font needed to display it) ----------

const outline = (f, text, x, y, size, fill) => f.getPath(text, x, y, size).toSVG(2).replace('<path ', `<path fill="${fill}" `)
function lockup(ink, sub, accent) {
  const NAME = 196, DARB = 50, JP = 40, GAP = 26
  const nameB = display.getPath(T.shortName, 0, 0, NAME).getBoundingBox()
  const darbB = ui.getPath('Darb', 0, 0, DARB).getBoundingBox()
  const jpB = seal.getPath(T.japanese, 0, 0, JP).getBoundingBox()
  const base = -(nameB.y1 - GAP + darbB.y1)
  const H = base + Math.max(nameB.y2, 0)
  const x0 = H + 60
  const jpX = x0 + (nameB.x2 - nameB.x1) + 36 - jpB.x1
  const W = jpX + jpB.x2 + 4
  const mark = svgs['mark-on-night.svg'].replace(/<\/?svg[^>]*>/g, '').replace('id="l"', 'id="wl"').replaceAll('url(#l)', 'url(#wl)')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -8 ${Math.ceil(W)} ${Math.ceil(H + 16)}">
  <g transform="scale(${H / 200})">${mark}</g>
  ${outline(ui, 'Darb', x0 + 6 - darbB.x1, base + nameB.y1 - GAP, DARB, sub)}
  ${outline(display, T.shortName, x0 - nameB.x1, base, NAME, ink)}
  ${outline(seal, T.japanese, jpX, base, JP, accent)}
</svg>
`
}
await writeFile(`${OUT}svg/wordmark-on-dark.svg`, lockup(C.ivory, C.muted, C.gold))
await writeFile(`${OUT}svg/wordmark-on-light.svg`, lockup(C.ink, '#6f6357', C.goldDeep))

// ---------- icon set: the cast medallion on the night tile ----------

/** iOS-style superellipse ("squircle"), n = 5. */
function squircle(size, fill = '#fff') {
  const r = size / 2, pts = []
  for (let i = 0; i < 360; i++) {
    const t = (i / 360) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t)
    pts.push(`${(r + Math.sign(c) * Math.abs(c) ** 0.4 * r).toFixed(2)},${(r + Math.sign(s) * Math.abs(s) ** 0.4 * r).toFixed(2)}`)
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><polygon points="${pts.join(' ')}" fill="${fill}"/></svg>`)
}
const resized = (src, size) => sharp(src).resize(size, size, { kernel: 'lanczos3' }).png().toBuffer()
const cut = async (buf, size) => sharp(buf).composite([{ input: squircle(size), blend: 'dest-in' }]).png()

for (const s of T.icons.tile) await (await cut(await resized(tileMaster, s), s)).toFile(`${OUT}icons/icon-${s}.png`)
for (const s of T.icons.maskable) await sharp(await resized(safeMaster, s)).toFile(`${OUT}icons/icon-maskable-${s}.png`)
await sharp(await resized(tileMaster, T.icons.apple)).flatten({ background: C.night }).toFile(`${OUT}icons/apple-touch-icon.png`)
{
  // macOS / desktop: 824 px squircle on a 1024 canvas with the system drop shadow
  const size = T.icons.mac, body = Math.round(size * 0.805), off = Math.round((size - body) / 2)
  const art = await (await cut(await resized(tileMaster, body), body)).toBuffer()
  const shadow = await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: squircle(body, 'rgba(0,0,0,0.55)'), left: off, top: off + Math.round(size * 0.012) }])
    .blur(size * 0.012).png().toBuffer()
  await sharp(shadow).composite([{ input: art, left: off, top: off }]).png().toFile(`${OUT}icons/icon-desktop-${size}.png`)
}
for (const s of T.icons.favicon) await sharp(Buffer.from(svgs['favicon.svg'])).resize(s, s).png().toFile(`${OUT}icons/favicon-${s}.png`)
await writeFile(`${OUT}icons/favicon.ico`, await pngToIco(T.icons.favicon.map((s) => `${OUT}icons/favicon-${s}.png`)))
await sharp(Buffer.from(svgs['badge-mono.svg'])).resize(T.icons.badge, T.icons.badge).png().toFile(`${OUT}icons/badge-${T.icons.badge}.png`)
await writeFile(`${OUT}icons/favicon.svg`, svgs['favicon.svg'])

// ---------- social: the hero render with the copy set on its quiet left side ----------

/** Wraps `text` to lines no wider than `max` at `size` in font `f`. */
function wrap(f, text, size, max) {
  const lines = [''], words = text.split(' ')
  for (const w of words) {
    const next = lines.at(-1) ? `${lines.at(-1)} ${w}` : w
    if (f.getAdvanceWidth(next, size) > max && lines.at(-1)) lines.push(w)
    else lines[lines.length - 1] = next
  }
  return lines
}
async function social(w, h, file) {
  const u = h / 630, x = 72 * u
  const shade = `<linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="${C.night}" stop-opacity=".85"/><stop offset=".55" stop-color="${C.night}" stop-opacity="0"/></linearGradient>`
  const nameSize = 112 * u, nameY = 300 * u
  const desc = wrap(ui, T.description, 22 * u, 540 * u)
  const copy = [
    outline(ui, 'Darb', x + 4 * u, 196 * u, 34 * u, C.muted),
    outline(display, T.shortName, x, nameY, nameSize, C.ivory),
    outline(seal, T.japanese, x + display.getAdvanceWidth(T.shortName, nameSize) + 22 * u, nameY, 34 * u, C.gold),
    outline(ui, T.tagline, x + 2 * u, 372 * u, 34 * u, C.gold),
    ...desc.map((l, i) => outline(ui, l, x + 2 * u, (428 + i * 32) * u, 22 * u, C.muted)),
  ].join('')
  const over = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>${shade}</defs><rect width="${w}" height="${h}" fill="url(#s)"/>${copy}</svg>`)
  await sharp(heroMaster).resize(w, h, { kernel: 'lanczos3' }).composite([{ input: over }]).png().toFile(file)
}
await social(T.icons.og[0], T.icons.og[1], `${OUT}social/og-image.png`)
await social(T.icons.hero[0], T.icons.hero[1], `${OUT}social/hero.png`)

// ---------- manifest, tokens, head tags ----------

const manifest = {
  name: T.name,
  short_name: T.shortName,
  description: T.tagline,
  display: 'standalone',
  background_color: C.night,
  theme_color: C.night,
  icons: [
    ...T.icons.tile.map((s) => ({ src: `/icons/icon-${s}.png`, sizes: `${s}x${s}`, type: 'image/png', purpose: 'any' })),
    ...T.icons.maskable.map((s) => ({ src: `/icons/icon-maskable-${s}.png`, sizes: `${s}x${s}`, type: 'image/png', purpose: 'maskable' })),
    { src: `/icons/badge-${T.icons.badge}.png`, sizes: `${T.icons.badge}x${T.icons.badge}`, type: 'image/png', purpose: 'monochrome' },
  ],
}
await writeFile(`${OUT}manifest.webmanifest`, JSON.stringify(manifest, null, 2) + '\n')

await writeFile(`${OUT}tokens.css`, `/* Generated from src/tokens.json by scripts/build.mjs. Edit the JSON, not this file. */
:root {
${Object.entries(T.color).map(([k, v]) => `  --${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}: ${v.hex}; /* ${v.role} */`).join('\n')}
  --font-seal: '${T.type.seal.family}', 'Hiragino Mincho ProN', serif;
  --font-display: '${T.type.display.family}', 'Hiragino Mincho ProN', serif;
  --font-ui: '${T.type.ui.family}', system-ui, sans-serif;
}
`)

await writeFile(`${OUT}head.html`, `<link rel="icon" href="/icons/favicon.ico" sizes="48x48">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="${C.night}">
<meta property="og:title" content="${T.name}">
<meta property="og:description" content="${T.tagline}">
<meta property="og:image" content="/social/og-image.png">
<meta name="twitter:card" content="summary_large_image">
`)
console.log('built', OUT)
