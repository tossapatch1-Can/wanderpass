"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CONTINENTS_TH } from "@/lib/continents";
import type { Continent, Country } from "@/lib/types";
import { PhotoUploader } from "@/components/passport/photo-uploader";
import type { ProcessedPhoto } from "@/lib/image-upload";

const CONTINENT_ORDER: Continent[] = [
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania",
];
const DRAFT_KEY = "wanderpass:add-draft";
const COMMENT_MAX = 300;

function stampSrc(c: Country | undefined): string | null {
  if (!c) return null;
  return c.stamp_svg_url ?? `/stamps/${c.code.toLowerCase()}.svg`;
}

export function AddCountryForm({
  countries,
  visitedCodes,
  preselect,
}: {
  countries: Country[];
  visitedCodes: string[];
  preselect: string | null;
}) {
  const router = useRouter();
  const visited = useMemo(() => new Set(visitedCodes), [visitedCodes]);

  const [code, setCode] = useState(preselect ?? "");
  const [comment, setComment] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [photos, setPhotos] = useState<ProcessedPhoto[]>([]);
  const [existing, setExisting] = useState<{ id: string; photoCount: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => countries.find((c) => c.code === code), [countries, code]);

  const grouped = useMemo(() => {
    const map = new Map<Continent, Country[]>();
    for (const c of countries) {
      const arr = map.get(c.continent) ?? [];
      arr.push(c);
      map.set(c.continent, arr);
    }
    return map;
  }, [countries]);

  // Restore text draft (network-drop safety, PRD edge case)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      /* eslint-disable react-hooks/set-state-in-effect */
      if (!preselect && d.code) setCode(d.code);
      if (d.comment) setComment(d.comment);
      if (d.travelDate) setTravelDate(d.travelDate);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist text draft
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ code, comment, travelDate }));
    } catch {}
  }, [code, comment, travelDate]);

  // When a country is chosen, look up an existing trip (add-to-existing flow)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!code) {
        if (!cancelled) setExisting(null);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: trip } = await supabase
        .from("trips")
        .select("id, comment, travel_date")
        .eq("user_id", user.id)
        .eq("country_code", code)
        .maybeSingle();
      if (cancelled) return;
      if (trip) {
        const { count } = await supabase
          .from("trip_photos")
          .select("id", { count: "exact", head: true })
          .eq("trip_id", trip.id);
        if (cancelled) return;
        setExisting({ id: trip.id, photoCount: count ?? 0 });
        setComment((prev) => prev || trip.comment || "");
        setTravelDate((prev) => prev || trip.travel_date || "");
      } else {
        setExisting(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function save() {
    setError(null);
    if (!code) return setError("เลือกประเทศก่อนนะ");
    const totalPhotos = (existing?.photoCount ?? 0) + photos.length;
    if (totalPhotos < 1) {
      return setError("ต้องมีรูปจริงอย่างน้อย 1 รูป เพื่อสร้างแสตมป์");
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/passport/add");
        return;
      }

      // Upsert the trip (1 country = 1 stamp)
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .upsert(
          {
            user_id: user.id,
            country_code: code,
            comment: comment.trim() || null,
            travel_date: travelDate || null,
          },
          { onConflict: "user_id,country_code" }
        )
        .select("id")
        .single();
      if (tripErr || !trip) throw tripErr ?? new Error("save failed");

      // Upload each photo straight to Storage, then record it
      for (const p of photos) {
        const path = `${user.id}/${trip.id}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("trip-photos")
          .upload(path, p.blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { error: rowErr } = await supabase
          .from("trip_photos")
          .insert({ trip_id: trip.id, user_id: user.id, storage_path: path });
        if (rowErr) throw rowErr;
      }

      // Success — clear draft and go to the country page
      localStorage.removeItem(DRAFT_KEY);
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      const username = profile?.username ?? "me";
      router.push(`/passport/${username}/country/${code.toLowerCase()}`);
      router.refresh();
    } catch (e) {
      console.error(e);
      setError("บันทึกไม่สำเร็จ — ตรวจอินเทอร์เน็ตแล้วลองใหม่ (ข้อมูลที่พิมพ์ไว้ยังอยู่)");
      setSaving(false);
    }
  }

  const src = stampSrc(selected);

  return (
    <div className="space-y-6">
      {/* Country select */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">ประเทศ</label>
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
        >
          <option value="">— เลือกประเทศ —</option>
          {CONTINENT_ORDER.map((cont) => (
            <optgroup key={cont} label={CONTINENTS_TH[cont]}>
              {(grouped.get(cont) ?? []).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag_emoji} {c.name_th}
                  {visited.has(c.code) ? " ✓" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Stamp preview */}
      {selected && src && (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <Image src={src} alt={selected.name_th} width={88} height={88} />
          <div>
            <p className="font-semibold text-primary">
              {selected.flag_emoji} {selected.name_th}
            </p>
            <p className="text-sm text-muted-foreground">{selected.name_en}</p>
          </div>
        </div>
      )}

      {/* Already-visited notice (PRD edge case) */}
      {existing && (
        <div className="rounded-xl bg-accent/15 px-4 py-3 text-sm text-ink">
          คุณมีแสตมป์ประเทศนี้แล้ว ({existing.photoCount} รูป) — กำลังเพิ่มรูป/แก้ไขให้ทริปเดิม{" "}
          <Link
            href={`/passport/me`}
            className="font-medium text-accent hover:underline"
          >
            ดูในพาสปอร์ต
          </Link>
        </div>
      )}

      {/* Photos */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">รูปจริงจากทริป</label>
        <PhotoUploader
          value={photos}
          onChange={setPhotos}
          existingCount={existing?.photoCount ?? 0}
        />
      </div>

      {/* Travel date */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">วันที่เดินทาง (ถ้าจำได้)</label>
        <input
          type="date"
          value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
        />
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">บันทึกความทรงจำ</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
          rows={3}
          placeholder="เล่าถึงทริปนี้สั้นๆ…"
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
        />
        <p className="text-right text-xs text-muted-foreground">
          {comment.length}/{COMMENT_MAX}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก…" : "บันทึกแสตมป์"}
        </button>
        <Link
          href="/passport/me"
          className="rounded-full border border-border px-6 py-3 font-medium text-ink transition hover:bg-secondary"
        >
          ยกเลิก
        </Link>
      </div>
    </div>
  );
}
