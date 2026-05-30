"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Country } from "@/lib/types";

export function AdminStampEditor({ countries }: { countries: Country[] }) {
  const [code, setCode] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const selected = useMemo(() => countries.find((c) => c.code === code), [countries, code]);

  function pick(c: string) {
    setCode(c);
    setMsg(null);
    const found = countries.find((x) => x.code === c);
    setUrl(found?.stamp_svg_url ?? "");
  }

  async function save() {
    if (!code) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_stamp", code, stampUrl: url.trim() }),
      });
      setMsg(res.ok ? "บันทึกแล้ว ✓" : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  const preview = url.trim() || (code ? `/stamps/${code.toLowerCase()}.svg` : null);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={code}
          onChange={(e) => pick(e.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
        >
          <option value="">— เลือกประเทศ —</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag_emoji} {c.name_th}
            </option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/stamps/xx.svg หรือ https://…"
          className="rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
        />
      </div>

      {selected && preview && (
        <div className="flex items-center gap-3">
          <Image src={preview} alt="" width={64} height={64} className="rounded-lg bg-white" unoptimized />
          <span className="text-sm text-muted-foreground">{selected.name_en}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={!code || saving}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก…" : "บันทึกแสตมป์"}
        </button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </div>
  );
}
