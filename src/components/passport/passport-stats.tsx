// Stats row for the passport: countries / continents / stamps (PRD screen B).

export function PassportStats({
  countries,
  continents,
  stamps,
}: {
  countries: number;
  continents: number;
  stamps: number;
}) {
  const tiles = [
    { value: countries, label: "ประเทศ", icon: "📍" },
    { value: continents, label: "ทวีป", icon: "🌏" },
    { value: stamps, label: "แสตมป์", icon: "🛂" },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-2xl border border-border bg-card px-3 py-4 text-center"
        >
          <div className="text-xl">{t.icon}</div>
          <div className="mt-1 text-2xl font-bold text-primary">{t.value}</div>
          <div className="text-xs text-muted-foreground">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
