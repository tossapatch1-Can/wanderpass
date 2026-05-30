"use client";

import { useState } from "react";

export type ReportItem = {
  id: string;
  photoId: string;
  reason: string | null;
  createdAt: string;
  thumb: string | null;
  country: string;
};

export function AdminReports({ initial }: { initial: ReportItem[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function act(item: ReportItem, action: "hide_report" | "dismiss_report") {
    setBusy(item.id);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reportId: item.id, photoId: item.photoId }),
      });
      if (res.ok) setItems((xs) => xs.filter((x) => x.id !== item.id));
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        ไม่มีรูปที่ถูกรายงาน 🎉
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3"
        >
          {item.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumb}
              alt=""
              className="h-16 w-16 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-2xl">
              🖼️
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">{item.country}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString("th-TH")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => act(item, "dismiss_report")}
              disabled={busy === item.id}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-ink disabled:opacity-50"
            >
              ปล่อยผ่าน
            </button>
            <button
              onClick={() => act(item, "hide_report")}
              disabled={busy === item.id}
              className="rounded-full bg-destructive px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              ซ่อนรูป
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
