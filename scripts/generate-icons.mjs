/**
 * Génère tous les assets icônes PWA depuis le nouveau logo Motion Finance (éclair).
 * Usage : node scripts/generate-icons.mjs
 */

import { writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = join(__dirname, "../public/icons")
const PUBLIC_DIR = join(__dirname, "../public")
const APP_DIR    = join(__dirname, "../app")

/* ── Couleurs ────────────────────────────────────────────────────────────────── */
const FROM_COLOR = "#4f55e8"  // primary (oklch 0.52 0.26 258 → indigo-bleu)
const TO_COLOR   = "#6d28d9"  // violet-700

/* ── SVG builder ─────────────────────────────────────────────────────────────── */
/**
 * Génère le SVG 512×512 de l'éclair.
 * boltScale : 1 pour regular, 0.68 pour maskable (safe zone 80%)
 * rounded   : true = coins arrondis rx=96 (icônes "any"), false = plein bord (maskable/apple)
 */
function buildSvg(boltScale = 1, rounded = true) {
  // Éclair défini dans un repère local 220×310
  // Points extérieurs (sens horaire à partir du sommet)
  const bolt = [
    [160,   0],   // sommet
    [  0, 180],   // extrême gauche
    [ 98, 180],   // échancrure gauche
    [ 60, 310],   // pointe basse
    [220, 130],   // extrême droite
    [122, 130],   // échancrure droite
  ]

  // Reflet intérieur (en retrait, même forme réduite)
  const inner = [
    [135,  28],
    [ 40, 168],
    [ 94, 168],
    [ 72, 282],
    [182, 142],
    [128, 142],
  ]

  // Centre local de l'éclair
  const lcx = 110, lcy = 155

  // Centre du canvas 512×512
  const ccx = 256, ccy = 256

  function pt([x, y]) {
    const sx = ccx + (x - lcx) * boltScale
    const sy = ccy + (y - lcy) * boltScale
    return `${sx.toFixed(1)},${sy.toFixed(1)}`
  }

  const boltPath  = bolt.map((p, i)  => (i === 0 ? "M" : "L") + pt(p)).join(" ") + " Z"
  const innerPath = inner.map((p, i) => (i === 0 ? "M" : "L") + pt(p)).join(" ") + " Z"

  const rx = rounded ? 96 : 0

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${FROM_COLOR}"/>
      <stop offset="100%" stop-color="${TO_COLOR}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
  <path d="${boltPath}" fill="white"/>
  <path d="${innerPath}" fill="white" opacity="0.18"/>
</svg>`
}

/* ── Utilitaires ─────────────────────────────────────────────────────────────── */

async function generatePng(svg, destPath, size) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(destPath)
  const name = destPath.split("/").slice(-2).join("/")
  console.log(`✓  ${name} (${size}×${size})`)
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
  dir.writeUInt8(0,  2)
  dir.writeUInt8(0,  3)
  dir.writeUInt16LE(1,  4)
  dir.writeUInt16LE(32, 6)
  dir.writeUInt32LE(pngBuffer.length, 8)
  dir.writeUInt32LE(dataOffset, 12)
  return Buffer.concat([header, dir, pngBuffer])
}

/* ── Génération ──────────────────────────────────────────────────────────────── */

// Regular (purpose: "any") — fond arrondi + éclair pleine taille
const regularSvg = buildSvg(1, true)
await generatePng(regularSvg, join(ICONS_DIR, "icon-192.png"), 192)
await generatePng(regularSvg, join(ICONS_DIR, "icon-512.png"), 512)

// Apple Touch Icon — 180×180, fond plein bord (iOS gère les coins)
const appleSvg = buildSvg(1, false)
await generatePng(appleSvg, join(ICONS_DIR, "apple-touch-icon.png"), 180)

// Maskable (purpose: "maskable") — fond plein bord, éclair réduit à 68%
// pour rester dans la safe zone (cercle inscrit = 80% du bord)
const maskableSvg = buildSvg(0.68, false)
await generatePng(maskableSvg, join(ICONS_DIR, "icon-192-maskable.png"), 192)
await generatePng(maskableSvg, join(ICONS_DIR, "icon-512-maskable.png"), 512)

// Next.js app/icon.png (onglet navigateur + og-image fallback) — 512×512
await generatePng(regularSvg, join(APP_DIR, "icon.png"), 512)

// favicon.ico — 32×32 PNG encapsulé dans .ico
const faviconPng = await sharp(Buffer.from(buildSvg(1, false)))
  .resize(32, 32)
  .png()
  .toBuffer()
await writeFile(join(PUBLIC_DIR, "favicon.ico"), wrapInIco(faviconPng))
console.log("✓  public/favicon.ico (32×32)")

console.log("\n🎉  Toutes les icônes sont générées.")
