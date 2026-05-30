"use client";

import { useRef, useState } from "react";
import {
  processImageFile,
  ImageError,
  ACCEPT_ATTR,
  MAX_PHOTOS_PER_COUNTRY,
  type ProcessedPhoto,
} from "@/lib/image-upload";

export function PhotoUploader({
  value,
  onChange,
  existingCount = 0,
}: {
  value: ProcessedPhoto[];
  onChange: (photos: ProcessedPhoto[]) => void;
  existingCount?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_PHOTOS_PER_COUNTRY - existingCount - value.length;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = ""; // allow re-pick same file
    if (files.length === 0) return;

    setError(null);
    if (files.length > remaining) {
      setError(
        `เพิ่มได้อีก ${remaining} รูป (สูงสุด ${MAX_PHOTOS_PER_COUNTRY} รูปต่อประเทศ)`
      );
      return;
    }

    setBusy(true);
    const added: ProcessedPhoto[] = [];
    try {
      for (const f of files) {
        try {
          added.push(await processImageFile(f));
        } catch (err) {
          setError(err instanceof ImageError ? err.message : "เปิดไฟล์นี้ไม่ได้");
        }
      }
      if (added.length) onChange([...value, ...added]);
    } finally {
      setBusy(false);
    }
  }

  function removeAt(i: number) {
    const copy = [...value];
    const [removed] = copy.splice(i, 1);
    if (removed) URL.revokeObjectURL(removed.preview);
    onChange(copy);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((p, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-xs text-white"
              aria-label="ลบรูป"
            >
              ✕
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-accent disabled:opacity-50"
          >
            <span className="text-2xl">{busy ? "⏳" : "＋"}</span>
            <span className="text-[11px]">{busy ? "กำลังเตรียม…" : "เพิ่มรูป"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        onChange={onPick}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        รับ JPG · PNG · HEIC (iPhone) · WebP — สูงสุด 10 MB ต่อรูป, {MAX_PHOTOS_PER_COUNTRY} รูปต่อประเทศ
        {existingCount > 0 && ` (มีอยู่แล้ว ${existingCount} รูป)`}
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
