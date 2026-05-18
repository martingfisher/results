import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const W = 1200, H = 630;
const NAVY = '#070630';
const RED = '#f83739';
const GREEN = '#0cce6b';
const WHITE = '#ffffff';

const scores = [
  { label: 'Performance', score: 92 },
  { label: 'Accessibility', score: 93 },
  { label: 'Best Practices', score: 100 },
  { label: 'SEO', score: 100 },
];

// Gauge geometry — identical to the on-site case-study restyle
function gauge(cx, cy, s) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const track = circ * 0.75;
  const filled = (s / 100) * track;
  const scale = 1.05; // 120 viewBox -> ~126px footprint
  const g = `
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
  return g;
}

const cardX = 660, cardY = 95, cardW = 470, cardH = 440;
const colA = cardX + 130, colB = cardX + 340;
const rowA = cardY + 130, rowB = cardY + 300;
const positions = [
  [colA, rowA], [colB, rowA],
  [colA, rowB], [colB, rowB],
];

const gauges = scores.map((sc, i) => {
  const [cx, cy] = positions[i];
  return `${gauge(cx, cy, sc.score)}
    <text x="${cx}" y="${cy + 80}" text-anchor="middle"
      font-family="DM Sans, Helvetica, Arial, sans-serif" font-weight="600"
      font-size="20" fill="${NAVY}">${sc.label}</text>`;
}).join('\n');

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect x="0" y="0" width="10" height="${H}" fill="${RED}"/>

  <text x="80" y="150" font-family="DM Sans, Helvetica, Arial, sans-serif"
    font-weight="700" font-size="22" letter-spacing="3" fill="${RED}">RESULTS YOU CAN MEASURE</text>

  <text x="78" y="250" font-family="DM Sans, Helvetica, Arial, sans-serif"
    font-weight="800" font-size="72" fill="${WHITE}">The need</text>
  <text x="78" y="330" font-family="DM Sans, Helvetica, Arial, sans-serif"
    font-weight="800" font-size="72" fill="${WHITE}">for speed.</text>

  <text x="80" y="400" font-family="DM Sans, Helvetica, Arial, sans-serif"
    font-weight="500" font-size="24" fill="rgba(255,255,255,0.78)">Why a fast website matters more</text>
  <text x="80" y="434" font-family="DM Sans, Helvetica, Arial, sans-serif"
    font-weight="500" font-size="24" fill="rgba(255,255,255,0.78)">for small businesses.</text>

  <text x="80" y="520" font-family="DM Sans, Helvetica, Arial, sans-serif"
    font-weight="700" font-size="20" fill="${GREEN}">Measured on mobile. Not claimed.</text>

  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="20" fill="${WHITE}"/>
  <text x="${cardX + cardW / 2}" y="${cardY + 46}" text-anchor="middle"
    font-family="DM Sans, Helvetica, Arial, sans-serif" font-weight="700"
    font-size="19" letter-spacing="1.5" fill="${NAVY}">REAL CLIENT, MOBILE</text>
  ${gauges}
</svg>`;

mkdirSync('public/assets/blog', { recursive: true });
await sharp(Buffer.from(svg))
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile('public/assets/blog/website-speed-feature.jpg');

const meta = await sharp('public/assets/blog/website-speed-feature.jpg').metadata();
console.log(`written ${meta.width}x${meta.height}`);
