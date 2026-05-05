import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const navy = '#070630';
const outDir = join(root, 'public/assets/brand-logos');
const sources = [
  ['wordpress', '/Users/martingfisher/Downloads/wordpress-2.svg'],
  ['shopify', '/Users/martingfisher/Downloads/shopify-2.svg'],
  ['laravel', '/Users/martingfisher/Downloads/laravel-wordmark-1.svg'],
  ['webflow', '/Users/martingfisher/Downloads/webflow-logo-1.svg'],
  ['adobe-creative-cloud', '/Users/martingfisher/Downloads/adobe-Creative Cloud.svg'],
  ['openai', '/Users/martingfisher/Downloads/openai-wordmark.svg'],
  ['claude', '/Users/martingfisher/Downloads/claude-3.svg'],
  ['google-ads', '/Users/martingfisher/Downloads/google-adwords.svg'],
  ['google-analytics', '/Users/martingfisher/Downloads/google-analytics-2.svg'],
  ['google-cloud', '/Users/martingfisher/Downloads/google-cloud-3.svg'],
  ['cloudflare', '/Users/martingfisher/Downloads/cloudflare-1.svg'],
  ['aws', '/Users/martingfisher/Downloads/aws-2.svg'],
  ['figma', '/Users/martingfisher/Downloads/figma-icon.svg'],
  ['stripe', '/Users/martingfisher/Downloads/stripe-4.svg'],
];

const unsafePattern = /<script|foreignObject|on[a-zA-Z]+=|javascript:|data:|https?:\/\/|<iframe|<object|<embed|<link|@import/i;

function sanitiseSvg(name, input) {
  const checkableInput = input.replace(/\s+xmlns(:xlink)?="[^"]*"/gi, '');

  if (unsafePattern.test(checkableInput)) {
    throw new Error(`${name} contains potentially unsafe SVG content`);
  }

  let svg = input
    .replace(/\r\n/g, '\n')
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<title[\s\S]*?<\/title>/gi, '')
    .replace(/<desc[\s\S]*?<\/desc>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\s+xmlns:xlink="[^"]*"/gi, '')
    .replace(/\s+xlink:href="[^"]*"/gi, '')
    .replace(/\s+(id|version|baseProfile|xml:space|width|height)="[^"]*"/gi, '')
    .replace(/\s+(x|y)="0px"/gi, '');

  if (name === 'adobe-creative-cloud') {
    svg = svg
      .replace(/viewBox="0 0 192\.756 192\.756"/i, 'viewBox="8 72 180 48"')
      .replace(/<path\b[^>]*fill=["']#fff["'][^>]*d=["']M0 192\.756h192\.756V0H0v192\.756z["'][^>]*\/?>/i, '');
  }

  if (name === 'figma') {
    svg = svg.replace(/<path\b[^>]*d=["']M1\.466 2\.2h285\.068V429\.8H1\.466z["'][^>]*\/?>/i, '');
  }

  if (name === 'shopify') {
    svg = svg
      .replace(/\sclass="st2"/gi, ' fill="#F1F1F1"')
      .replace(/\sclass="st[013]"/gi, ` fill="${navy}"`);
  }

  svg = svg
    .replace(/\s(fill|stroke)="(?!none|transparent|url\()[^"]*"/gi, ` $1="${navy}"`)
    .replace(/(<path\b[^>]*d="M13,10[\s\S]*?<\/path>|<path\b[^>]*d="M13,10[^>]*\/>)/i, (match) =>
      name === 'shopify' ? match.replace(/\sfill="[^"]*"/i, ' fill="#F1F1F1"') : match
    )
    .replace(/\s+class="[^"]*"/gi, '')
    .replace(/<(path|polygon|polyline|rect|circle|ellipse)\b(?![^>]*(?:fill|stroke)=)/gi, `<$1 fill="${navy}"`)
    .replace(/<g\b(?![^>]*(?:fill|stroke)=)/gi, `<g fill="${navy}"`)
    .replace(/<svg\b(?![^>]*aria-hidden=)/i, '<svg aria-hidden="true" focusable="false"')
    .replace(/>\s+</g, '><')
    .trim();

  return svg.endsWith('\n') ? svg : `${svg}\n`;
}

mkdirSync(outDir, { recursive: true });

for (const [name, source] of sources) {
  const cleaned = sanitiseSvg(name, readFileSync(source, 'utf8'));
  writeFileSync(join(outDir, `${name}.svg`), cleaned);
  console.log(`wrote ${name}.svg`);
}
