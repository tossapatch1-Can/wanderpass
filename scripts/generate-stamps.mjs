// Generates an SVG passport stamp for every country in countries.mjs.
// Run with:  node scripts/generate-stamps.mjs
// Output: /public/stamps/<code>.svg  (lowercase, e.g. /public/stamps/jp.svg)

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COUNTRIES, flagEmoji } from "./countries.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "stamps");
mkdirSync(OUT_DIR, { recursive: true });

// Wanderpass palette — cream base with a per-continent accent for variety.
const CREAM = "#f7f3ea";
const NAVY = "#1f3a5f";
const ACCENT = {
  Asia: "#c9a24b", // gold
  Europe: "#1f3a5f", // navy
  Africa: "#b9683a", // terracotta
  "North America": "#2f7d62", // green
  "South America": "#9c5db0", // violet
  Oceania: "#3d8a9a", // teal
};

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function stamp({ code, nameEn, continent }) {
  const border = ACCENT[continent] ?? NAVY;
  const flag = flagEmoji(code);
  const label = escapeXml(nameEn.toUpperCase());
  // Smaller font for long names so they fit one line
  const fontSize = label.length > 14 ? 12 : label.length > 10 ? 14 : 17;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse">
      <circle cx="4.5" cy="4.5" r="1" fill="${border}" opacity="0.12"/>
    </pattern>
  </defs>
  <rect x="6" y="6" width="188" height="188" rx="16" fill="${CREAM}" stroke="${border}" stroke-width="3" stroke-dasharray="7 5"/>
  <rect x="15" y="15" width="170" height="170" rx="9" fill="url(#dots)"/>
  <circle cx="100" cy="78" r="44" fill="#ffffff" stroke="${border}" stroke-width="2"/>
  <text x="100" y="96" font-size="46" text-anchor="middle">${flag}</text>
  <text x="100" y="148" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="${NAVY}">${label}</text>
  <text x="100" y="170" font-family="Georgia, serif" font-size="9" text-anchor="middle" fill="${border}" opacity="0.75" letter-spacing="2.5">WANDERPASS</text>
</svg>
`;
}

let n = 0;
for (const c of COUNTRIES) {
  const file = join(OUT_DIR, `${c.code.toLowerCase()}.svg`);
  writeFileSync(file, stamp(c));
  n++;
}

console.log(`✅ Generated ${n} country stamps in public/stamps/`);
