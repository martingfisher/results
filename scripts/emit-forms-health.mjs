#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

if (!process.env.PUBLIC_FORMS_SITE_SECRET) {
  // Self-load .env if present (prebuild runs before Astro's dotenv).
  for (const candidate of ['.env', '.env.local', '.dev.vars']) {
    try {
      const envFile = readFileSync(join(process.cwd(), candidate), 'utf8');
      for (const line of envFile.split('\n')) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
        if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
      if (process.env.PUBLIC_FORMS_SITE_SECRET) break;
    } catch {}
  }
}

const secret = process.env.PUBLIC_FORMS_SITE_SECRET;
if (!secret) {
  console.warn('[forms-health] PUBLIC_FORMS_SITE_SECRET unset — skipping (site will show unmonitored).');
  process.exit(0);
}

const siteId =
  process.env.PUBLIC_FORMS_SITE_ID ??
  process.env.FORMS_SITE_ID ??
  inferSiteIdFromPackageJson() ??
  'unknown';

const commit =
  process.env.COMMIT_SHA ??
  safe(() => execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()) ??
  null;

const fingerprint = 'sha256:' + createHash('sha256').update(secret).digest('hex');
const payload = {
  siteId,
  secretFingerprint: fingerprint,
  builtAt: new Date().toISOString(),
  commit,
};

const dir = join(process.cwd(), 'public', '.well-known');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const file = join(dir, 'forms-health.json');
writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');
console.log(`[forms-health] wrote ${file} (siteId=${siteId}, fp=${fingerprint.slice(0, 24)}...)`);

function safe(fn) { try { return fn(); } catch { return null; } }
function inferSiteIdFromPackageJson() {
  try {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    return pkg.formsServiceSiteId ?? null;
  } catch { return null; }
}
