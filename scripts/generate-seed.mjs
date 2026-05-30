// Generates supabase/seed-countries.sql from countries.mjs.
// Run with:  node scripts/generate-seed.mjs
// Then run the resulting SQL in Supabase → SQL Editor (after schema.sql).

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COUNTRIES, flagEmoji } from "./countries.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "supabase", "seed-countries.sql");

const sqlStr = (s) => "'" + String(s).replace(/'/g, "''") + "'";

const rows = COUNTRIES.map((c) => {
  const url = `/stamps/${c.code.toLowerCase()}.svg`;
  return `  (${sqlStr(c.code)}, ${sqlStr(c.nameTh)}, ${sqlStr(c.nameEn)}, ${sqlStr(
    c.continent
  )}, ${sqlStr(flagEmoji(c.code))}, ${sqlStr(url)})`;
}).join(",\n");

const sql = `-- =============================================================
-- Wanderpass — country stamp library seed (auto-generated)
-- Source: scripts/countries.mjs · regenerate: node scripts/generate-seed.mjs
-- Run AFTER schema.sql, in Supabase → SQL Editor.
-- =============================================================

insert into countries (code, name_th, name_en, continent, flag_emoji, stamp_svg_url) values
${rows}
on conflict (code) do update set
  name_th = excluded.name_th,
  name_en = excluded.name_en,
  continent = excluded.continent,
  flag_emoji = excluded.flag_emoji;
-- note: stamp_svg_url is NOT overwritten on conflict, so admin edits are preserved.
`;

writeFileSync(OUT, sql);
console.log(`✅ Wrote ${COUNTRIES.length} countries → supabase/seed-countries.sql`);
