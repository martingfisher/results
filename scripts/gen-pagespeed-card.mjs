import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const W = 1240, H = 460;
const NAVY = '#070630';
const GREEN = '#0cce6b';
const MUTED = '#6d6d7c';
const WHITE = '#ffffff';

const scores = [
  { label: 'Performance', score: 92 },
  { label: 'Accessibility', score: 93 },
  { label: 'Best Practices', score: 100 },
  { label: 'SEO', score: 100 },
];

function gauge(cx, cy, s, scale) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const track = circ * 0.75;
  const filled = (s / 100) * track;
  return `
    <g transform="translate(${cx - 60 * scale} ${cy - 60 * scale}) scale(${scale})">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(7,6,48,0.10)"
        stroke-width="8" stroke-dasharray="${track} ${circ - track}"
        stroke-linecap="round" transform="rotate(135 60 60)" />
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="${GREEN}"
        stroke-width="8" stroke-dasharray="${filled} ${circ - filled}"
        stroke-linecap="round" transform="rotate(135 60 60)" />
      <text x="60" y="60" text-anchor="middle" dominant-baseline="central"
        font-family="DM Sans, Helvetica, Arial, sans-serif" font-weight="800"
        font-size="34" fill="${GREEN}">${s}</text>
    </g>`;
}

const scale = 1.45;
const startX = 215;
const gap = 270;
const cy = 250;

const gauges = scores.map((sc, i) => {
  const cx = startX + i * gap;
  return `${gauge(cx, cy, sc.score, scale)}
    <text x="${cx}" y="${cy + 130}" text-anchor="middle"
      font-family="DM Sans, Helvetica, Arial, sans-serif" font-weight="600"
      font-size="26" fill="${NAVY}">${sc.label}</text>`;
}).join('\n');

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${WHITE}"/>
  <text x="${W / 2}" y="70" text-anchor="middle"
    font-family="DM Sans, Helvetica, Arial, sans-serif" font-weight="800"
    font-size="26" letter-spacing="1" fill="${NAVY}">H&amp;Co Hairdressing &#183; Google PageSpeed Insights</text>
  <text x="${W / 2}" y="104" text-anchor="middle"
    font-family="DM Sans, Helvetica, Arial, sans-serif" font-weight="600"
    font-size="19" letter-spacing="2" fill="${MUTED}">MEASURED ON A THROTTLED MOBILE CONNECTION</text>
  ${gauges}
</svg>`;

mkdirSync('public/assets/blog', { recursive: true });
await sharp(Buffer.from(svg))
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile('public/assets/blog/handco-pagespeed-mobile.jpg');

const meta = await sharp('public/assets/blog/handco-pagespeed-mobile.jpg').metadata();
console.log(`written ${meta.width}x${meta.height}`);
