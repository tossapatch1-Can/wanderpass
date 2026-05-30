// "World map" band at the top of the passport (PRD screen B 🆕).
// v1: a stylised travel banner — visited countries as flag chips + continent
// progress. (Can be upgraded to a full SVG choropleth later.)

import { CONTINENTS_TH } from "@/lib/continents";

const CONTINENT_ORDER = [
  "Asia",
  "Europe",
  "Africa",
  "North America",
  "South America",
  "Oceania",
] as const;

export function WorldMapBand({
  flags,
  visitedContinents,
}: {
  flags: string[];
  visitedContinents: Set<string>;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-7 text-primary-foreground">
      {/* dotted-globe motif */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative space-y-4">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-primary-foreground/70">
          🗺️ <span>แผนที่การเดินทาง</span>
        </div>

        {flags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 text-2xl leading-none">
            {flags.slice(0, 28).map((f, i) => (
              <span key={i} title="">
                {f}
              </span>
            ))}
            {flags.length > 28 && (
              <span className="self-center text-sm text-primary-foreground/70">
                +{flags.length - 28}
              </span>
            )}
          </div>
        ) : (
          <p className="text-primary-foreground/80">
            ยังไม่มีหมุดบนแผนที่ — เพิ่มประเทศแรกของคุณกันเถอะ ✨
          </p>
        )}

        {/* continent progress */}
        <div className="flex flex-wrap gap-2 pt-1">
          {CONTINENT_ORDER.map((c) => {
            const visited = visitedContinents.has(c);
            return (
              <span
                key={c}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  visited
                    ? "bg-accent text-accent-foreground font-medium"
                    : "bg-white/10 text-primary-foreground/60"
                }`}
              >
                {visited ? "✓ " : ""}
                {CONTINENTS_TH[c]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
