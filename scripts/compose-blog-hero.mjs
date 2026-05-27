#!/usr/bin/env node
// Compose the Elfsight blog hero — a 2x2 grid of PageSpeed Insights screenshots.
//
// Usage:
//   1. Save four PageSpeed screenshots (PNG or JPG) to ./scripts/blog-hero-inputs/
//      with these exact names:
//        - before-mobile.png    (the /contact/ mobile run with Elfsight, Perf 90)
//        - before-desktop.png   (the /contact/ desktop run with Elfsight, Perf 70)
//        - after-mobile.png     (the /contact/ mobile run, Perf 100)
//        - after-desktop.png    (the /contact/ desktop run, Perf 100)
//      Crop each to just the four-circle score row at the top of the report.
//      A reasonable crop is around 1240 wide × 320 tall.
//   2. Run: node scripts/compose-blog-hero.mjs
//   3. Output lands at public/assets/blog/elfsight-lighthouse-before-after.jpg
//
// Sharp is already a transitive dep on this site via @astrojs/cloudflare etc.
// If it isn't installed top-level, run `npm install --save-dev sharp` first.

import sharp from 'sharp';
import { readFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUTS = resolve(__dirname, 'blog-hero-inputs');
const OUTPUT = resolve(ROOT, 'public/assets/blog/elfsight-lighthouse-before-after.jpg');

// Output canvas. 1240 × 720 hits the agency's existing blog inline-image width
// (used by the H&Co hero) and keeps the file size sensible.
const W = 1240;
const H = 720;
const PAD = 32;          // outer padding
const GUTTER = 24;       // gap between tiles
const HEADER = 60;       // height of the row labels at the top of each row

// Tile size: (W - 2*PAD - GUTTER) / 2 wide, ((H - 2*PAD - 2*HEADER) / 2) tall.
const TILE_W = Math.floor((W - 2 * PAD - GUTTER) / 2);
const TILE_H = Math.floor((H - 2 * PAD - 2 * HEADER - GUTTER) / 2);

async function ensureInputs() {
  try {
    await access(INPUTS);
  } catch {
    await mkdir(INPUTS, { recursive: true });
    console.log(`Created ${INPUTS}. Drop the four PageSpeed screenshots there with the names listed in this script, then re-run.`);
    process.exit(2);
  }
  const required = ['before-mobile', 'before-desktop', 'after-mobile', 'after-desktop'];
  const paths = {};
  for (const name of required) {
    let found = null;
    for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
      const candidate = resolve(INPUTS, `${name}.${ext}`);
      try {
        await access(candidate);
        found = candidate;
        break;
      } catch {}
    }
    if (!found) {
      console.error(`Missing input: ${name}.{png,jpg,jpeg,webp} in ${INPUTS}`);
      process.exit(2);
    }
    paths[name] = found;
  }
  return paths;
}

async function loadTile(filepath) {
  return sharp(await readFile(filepath))
    .resize(TILE_W, TILE_H, { fit: 'cover', position: 'top' })
    .toBuffer();
}

function labelSvg(text, eyebrow) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W - 2 * PAD}" height="${HEADER}">
    <text x="0" y="20" font-family="DM Sans, system-ui, sans-serif" font-size="13" font-weight="600" fill="#d6262a" letter-spacing="2">${eyebrow}</text>
    <text x="0" y="48" font-family="DM Sans, system-ui, sans-serif" font-size="22" font-weight="700" fill="#ffffff">${text}</text>
  </svg>`);
}

async function main() {
  const inputs = await ensureInputs();

  const [beforeMobile, beforeDesktop, afterMobile, afterDesktop] = await Promise.all([
    loadTile(inputs['before-mobile']),
    loadTile(inputs['before-desktop']),
    loadTile(inputs['after-mobile']),
    loadTile(inputs['after-desktop']),
  ]);

  const rowOneY = PAD + HEADER;
  const rowTwoY = rowOneY + TILE_H + HEADER + GUTTER;

  const composite = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 7, g: 6, b: 48, alpha: 1 } },
  })
    .composite([
      // Row 1: before
      { input: labelSvg('Before — Elfsight widget loaded', 'BEFORE'), top: PAD, left: PAD },
      { input: beforeMobile,  top: rowOneY, left: PAD },
      { input: beforeDesktop, top: rowOneY, left: PAD + TILE_W + GUTTER },
      // Row 2: after
      { input: labelSvg('After — in-house forms-kit', 'AFTER'), top: rowTwoY - HEADER, left: PAD },
      { input: afterMobile,   top: rowTwoY, left: PAD },
      { input: afterDesktop,  top: rowTwoY, left: PAD + TILE_W + GUTTER },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  await sharp(composite).toFile(OUTPUT);
  const stats = await sharp(OUTPUT).metadata();
  console.log(`✓ Wrote ${OUTPUT}`);
  console.log(`  ${stats.width}×${stats.height}, ${stats.size ? Math.round(stats.size / 1024) + 'KB' : 'size unknown'}`);
}

main().catch((e) => {
  console.error('Compose failed:', e.message);
  process.exit(1);
});
