import { writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = join(__dirname, "../public/icons")
const PUBLIC_DIR = join(__dirname, "../public")
const APP_DIR = join(__dirname, "../app")

// Barres du BarChartSvg (viewBox 32×32, contenu de (5,6)→(27,28) = 22×22 px)
// Couleurs light mode exactes de sidebar.tsx
function barsGroup(scale, rx) {
  const r = (rx / scale).toFixed(2)
  return `
    <rect x="5"  y="18" width="4" height="10" rx="${r}" fill="#6d28d9"/>
    <rect x="11" y="10" width="4" height="18" rx="${r}" fill="#7c3aed"/>
    <rect x="17" y="14" width="4" height="14" rx="${r}" fill="#6d28d9"/>
    <rect x="23" y="6"  width="4" height="22" rx="${r}" fill="#8b5cf6"/>`
}

/**
 * Icône "any" et apple-touch-icon : fond blanc + barres violettes centrées.
 * Design identique au logo de la page de connexion (auth layout).
 * ratio : barres à 59% du canvas (= BarChartSvg 38px dans container 64px).
 */
function buildIcon(size, barRatio = 0.59) {
  const barsW = size * barRatio
  const scale = barsW / 22
  const barsH = 22 * scale
  const tx = (size - barsW) / 2 - 5 * scale
  const ty = (size - barsH) / 2 - 6 * scale
  const rx = Math.max(1, scale * 1.5)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="white"/>
  <g transform="translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">${barsGroup(scale, rx)}
  </g>
</svg>`
}

/**
 * Icône maskable : fond violet + barres blanches centrées dans la zone safe (≤ 80%).
 * Android clippe cette icône en cercle/squircle : le fond violet est visible aux coins.
 */
function buildMaskableIcon(size) {
  // Barres à 46% du canvas = contenu bien dans la zone safe (80%)
  const barsW = size * 0.46
  const scale = barsW / 22
  const barsH = 22 * scale
  const tx = (size - barsW) / 2 - 5 * scale
  const ty = (size - barsH) / 2 - 6 * scale
  const rx = Math.max(1, scale * 1.5)
  const r = (rx / scale).toFixed(2)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#7c3aed"/>
  <g transform="translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">
    <rect x="5"  y="18" width="4" height="10" rx="${r}" fill="white"/>
    <rect x="11" y="10" width="4" height="18" rx="${r}" fill="rgba(255,255,255,0.85)"/>
    <rect x="17" y="14" width="4" height="14" rx="${r}" fill="white"/>
    <rect x="23" y="6"  width="4" height="22" rx="${r}" fill="rgba(255,255,255,0.9)"/>
  </g>
</svg>`
}

async function generatePng(svg, dest) {
  await sharp(Buffer.from(svg)).png().toFile(dest)
  console.log(`✓ ${dest.split("/").pop()}`)
}

function wrapInIco(pngBuffer) {
  const dataOffset = 22
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const dir = Buffer.alloc(16)
  dir.writeUInt8(32, 0)
  dir.writeUInt8(32, 1)
  dir.writeUInt8(0, 2)
  dir.writeUInt8(0, 3)
  dir.writeUInt16LE(1, 4)
  dir.writeUInt16LE(32, 6)
  dir.writeUInt32LE(pngBuffer.length, 8)
  dir.writeUInt32LE(dataOffset, 12)
  return Buffer.concat([header, dir, pngBuffer])
}

// ── Icônes "any" : fond blanc + barres violettes (= logo auth layout) ─────────
await generatePng(buildIcon(192), join(ICONS_DIR, "icon-192.png"))
await generatePng(buildIcon(512), join(ICONS_DIR, "icon-512.png"))
await generatePng(buildIcon(180), join(ICONS_DIR, "apple-touch-icon.png"))

// ── Icônes maskable : fond violet + barres blanches (Android adaptive icons) ──
await generatePng(buildMaskableIcon(192), join(ICONS_DIR, "icon-192-maskable.png"))
await generatePng(buildMaskableIcon(512), join(ICONS_DIR, "icon-512-maskable.png"))

// ── Favicon (onglet navigateur) ───────────────────────────────────────────────
await generatePng(buildIcon(512), join(APP_DIR, "icon.png"))

const faviconPng = await sharp(Buffer.from(buildIcon(32))).png().toBuffer()
await writeFile(join(PUBLIC_DIR, "favicon.ico"), wrapInIco(faviconPng))
console.log("✓ favicon.ico")

console.log("\nToutes les icônes sont générées.")
