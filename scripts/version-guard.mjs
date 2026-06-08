#!/usr/bin/env node
/**
 * version-guard — blocks builds on a site whose core deps are a MAJOR behind.
 *
 * Why: sites silently drifted a full Astro major behind (5 while 6 shipped) and it
 * was painful to discover at build/deploy time. This catches it up front.
 *
 * Runs at `prebuild` (so an out-of-date site cannot build/deploy) and is also
 * exposed as `pnpm check:versions` for an at-the-start manual check.
 *
 * Behaviour:
 *   - For each tracked package, compare the INSTALLED major to the LATEST major
 *     published on npm (4s timeout). If a major behind -> fail (exit 1).
 *   - Offline / npm unreachable -> fall back to the pinned FLOOR below.
 *   - A package not installed in this site is skipped (e.g. a site with no adapter).
 *   - Minor/patch drift is reported as a hint, never blocks.
 *   - Override for deliberate cases: ALLOW_OUTDATED=1 pnpm build
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();

// Floors used only when npm is unreachable. Bump when the agency baseline moves.
const FLOOR = {
  astro: 6,
  '@astrojs/cloudflare': 13,
  '@astrojs/mdx': 6,
  '@astrojs/react': 5,
  wrangler: 4,
};

const major = (v) => (v ? Number.parseInt(String(v).split('.')[0], 10) : null);

function installed(pkg) {
  try {
    return major(JSON.parse(readFileSync(`${ROOT}/node_modules/${pkg}/package.json`, 'utf8')).version);
  } catch {
    return null; // not installed in this site
  }
}
function latest(pkg) {
  try {
    const v = execSync(`npm view ${pkg} version`, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 4000 })
      .toString()
      .trim();
    return major(v);
  } catch {
    return null; // offline / not found
  }
}

const C = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', bold: '\x1b[1m', inv: '\x1b[7m', off: '\x1b[0m' };
const blocking = [];

for (const pkg of Object.keys(FLOOR)) {
  const have = installed(pkg);
  if (have == null) continue;
  const want = latest(pkg) ?? FLOOR[pkg];
  const offline = latest(pkg) == null;
  if (have < want) blocking.push({ pkg, have, want, offline });
}

if (blocking.length === 0) {
  console.log(`${C.green}✓ version-guard: core dependencies are current.${C.off}`);
  process.exit(0);
}

console.error(`\n${C.bold}${C.inv}${C.red}  OUT-OF-DATE DEPENDENCIES — build blocked  ${C.off}\n`);
for (const b of blocking) {
  console.error(`  ${C.red}✗ ${b.pkg}: installed v${b.have}, ${b.offline ? 'agency floor' : 'latest'} v${b.want} (a major behind)${C.off}`);
}
console.error(`\n  Upgrade these before building. See the starter's CHANGELOG/upgrade notes.`);
console.error(`  Deliberate exception only: ${C.yellow}ALLOW_OUTDATED=1${C.off} <command>\n`);

if (process.env.ALLOW_OUTDATED) {
  console.error(`  ${C.yellow}ALLOW_OUTDATED set — continuing despite the above.${C.off}\n`);
  process.exit(0);
}
process.exit(1);
