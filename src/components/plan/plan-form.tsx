"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Itinerary } from "@/lib/types";

const BUDGET_MIN = 5000;
const BUDGET_MAX = 500000;
const BUDGET_STEP = 5000;

const baht = (n: number) => "฿" + n.toLocaleString("th-TH");

export function PlanForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budgetMin, setBudgetMin] = useState(20000);
  const [budgetMax, setBudgetMax] = useState(60000);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setMin(v: number) {
    setBudgetMin(Math.min(v, budgetMax));
  }
  function setMax(v: number) {
    setBudgetMax(Math.max(v, budgetMin));
  }

  async function generate() {
    if (!destination.trim()) return setError("พิมพ์ปลายทางก่อนนะ");
    setError(null);
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, budgetMin, budgetMax }),
      });
      if (!res.ok) throw new Error(await res.text());
      setItinerary((await res.json()) as Itinerary);
    } catch {
      setError("สร้างแผนไม่สำเร็จ ลองใหม่อีกครั้งนะ");
    } finally {
      setLoading(false);
    }
  }

  async function saveWishlist() {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login?next=/plan");
      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        destination: destination.trim(),
        days,
        budget_min_thb: budgetMin,
        budget_max_thb: budgetMax,
        ai_itinerary: itinerary,
      });
      if (error) throw error;
      setSaved(true);
      router.refresh();
    } catch {
      setError("บันทึก Wishlist ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Destination + days */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <label className="text-sm font-medium text-ink">ปลายทาง</label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="เช่น เกียวโต ญี่ปุ่น"
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink">กี่วัน</label>
          <input
            type="number"
            min={1}
            max={14}
            value={days}
            onChange={(e) => setDays(Math.min(Math.max(Number(e.target.value) || 1, 1), 14))}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
          />
        </div>
      </div>

      {/* Budget slider */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-medium text-ink">งบประมาณ (ประมาณการ)</label>
          <span className="text-sm font-semibold text-primary">
            {baht(budgetMin)} – {baht(budgetMax)}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={budgetMin}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full accent-[var(--gold)]"
          />
          <input
            type="range"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={budgetMax}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full accent-[var(--navy)]"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          * เป็นช่วงประมาณการเพื่อช่วยวางแผน ไม่ใช่ราคาขายจริง
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={generate}
          disabled={loading}
          className="flex-1 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "AI กำลังคิด…" : "✨ ให้ AI ร่างแผน"}
        </button>
        <a
          href={`mailto:hello@wanvela.com?subject=${encodeURIComponent("ปรึกษาจัดทริป: " + destination)}`}
          className="rounded-full border border-border px-6 py-3 font-medium text-ink transition hover:bg-secondary"
        >
          ปรึกษาทีมจัดทริป
        </a>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Itinerary preview */}
      {itinerary && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <p className="text-ink">{itinerary.summary}</p>
          <div className="space-y-3">
            {itinerary.days.map((d) => (
              <div key={d.day} className="rounded-xl bg-secondary/60 p-3">
                <p className="font-semibold text-primary">
                  วันที่ {d.day} · {d.title}
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink/80">
                  {d.activities.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button
            onClick={saveWishlist}
            disabled={saving || saved}
            className="w-full rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saved ? "✓ เก็บใน Wishlist แล้ว" : saving ? "กำลังบันทึก…" : "💾 เซฟเป็น Wishlist"}
          </button>
        </div>
      )}
    </div>
  );
}
