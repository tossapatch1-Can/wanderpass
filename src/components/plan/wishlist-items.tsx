"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Wishlist } from "@/lib/types";

const baht = (n: number | null) => (n == null ? "" : "฿" + n.toLocaleString("th-TH"));

export function WishlistItems({ initial }: { initial: Wishlist[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (initial.length === 0) {
    return (
      <div>
        <h2 className="mb-3 text-lg font-semibold text-primary">Wishlist ของฉัน</h2>
        <p className="text-sm text-muted-foreground">
          ยังไม่มีแผนที่บันทึกไว้ — ลองให้ AI ร่างแผนแล้วกดเซฟดู
        </p>
      </div>
    );
  }

  async function remove(id: string) {
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    setDeleting(null);
    if (!error) router.refresh();
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-primary">Wishlist ของฉัน</h2>
      {initial.map((w) => (
        <div key={w.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{w.destination}</p>
              <p className="text-sm text-muted-foreground">
                {w.days ? `${w.days} วัน` : ""}
                {w.budget_min_thb != null &&
                  ` · ${baht(w.budget_min_thb)}–${baht(w.budget_max_thb)}`}
              </p>
            </div>
            <button
              onClick={() => remove(w.id)}
              disabled={deleting === w.id}
              className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-50"
              aria-label="ลบ"
            >
              🗑
            </button>
          </div>

          {w.ai_itinerary?.summary && (
            <p className="mt-2 text-sm text-ink/70">{w.ai_itinerary.summary}</p>
          )}

          <div className="mt-3">
            <Link
              href="/passport/add"
              className="inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              ✈️ ไปจริงแล้ว — สร้างแสตมป์
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
