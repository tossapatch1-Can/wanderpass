"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const COMMENT_MAX = 300;

export function CountryActions({
  tripId,
  code,
  username,
  isOwner,
  initialIsPublic,
  initialComment,
  initialTravelDate,
  firstPhotoId,
}: {
  tripId: string;
  code: string;
  username: string;
  isOwner: boolean;
  initialIsPublic: boolean;
  initialComment: string;
  initialTravelDate: string;
  firstPhotoId: string | null;
}) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(initialComment);
  const [travelDate, setTravelDate] = useState(initialTravelDate);
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goShare() {
    router.push(`/passport/${username}/share?country=${code}`);
  }

  async function togglePrivacy() {
    setBusy(true);
    setError(null);
    const next = !isPublic;
    const supabase = createClient();
    const { error } = await supabase.from("trips").update({ is_public: next }).eq("id", tripId);
    if (error) setError("เปลี่ยนสถานะไม่สำเร็จ");
    else {
      setIsPublic(next);
      router.refresh();
    }
    setBusy(false);
  }

  async function saveEdit() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("trips")
      .update({ comment: comment.trim() || null, travel_date: travelDate || null })
      .eq("id", tripId);
    if (error) setError("บันทึกไม่สำเร็จ");
    else {
      setEditing(false);
      router.refresh();
    }
    setBusy(false);
  }

  async function remove() {
    if (!confirm("ลบแสตมป์ประเทศนี้และรูปทั้งหมด? ทำแล้วย้อนกลับไม่ได้นะ")) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Best-effort: remove storage files first
    if (user) {
      const { data: files } = await supabase.storage
        .from("trip-photos")
        .list(`${user.id}/${tripId}`);
      if (files?.length) {
        await supabase.storage
          .from("trip-photos")
          .remove(files.map((f) => `${user.id}/${tripId}/${f.name}`));
      }
    }
    const { error } = await supabase.from("trips").delete().eq("id", tripId);
    if (error) {
      setError("ลบไม่สำเร็จ");
      setBusy(false);
      return;
    }
    router.push("/passport/me");
    router.refresh();
  }

  async function report() {
    if (!firstPhotoId) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("reports").insert({
      photo_id: firstPhotoId,
      reporter_id: user?.id ?? null,
      reason: "user_report",
    });
    setReported(true);
    setBusy(false);
  }

  if (!isOwner) {
    return (
      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <button
          onClick={goShare}
          className="rounded-full bg-green-share px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          📤 แชร์
        </button>
        <button
          onClick={report}
          disabled={busy || reported || !firstPhotoId}
          className="rounded-full border border-border px-5 py-2.5 text-sm text-ink transition hover:bg-secondary disabled:opacity-60"
        >
          {reported ? "ขอบคุณที่รายงาน" : "⚑ รายงานเนื้อหา"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-border pt-5">
      {/* privacy + share row */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={togglePrivacy}
          disabled={busy}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
            isPublic
              ? "bg-green-share text-white"
              : "border border-border bg-white text-ink"
          }`}
        >
          {isPublic ? "🌐 เปิดสาธารณะ" : "🔒 ส่วนตัว"}
        </button>
        <span className="text-xs text-muted-foreground">
          {isPublic ? "ใครก็ดูประเทศนี้ได้" : "เห็นเฉพาะคุณ"}
        </span>
      </div>

      {/* edit form */}
      {editing ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">วันที่เดินทาง</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">บันทึกความทรงจำ</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
              rows={3}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-ink"
            />
            <p className="text-right text-xs text-muted-foreground">
              {comment.length}/{COMMENT_MAX}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={busy}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              บันทึก
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-border px-5 py-2 text-sm text-ink"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/passport/add?country=${code}`}
            className="rounded-full border border-border bg-white px-5 py-2.5 text-sm text-ink transition hover:border-accent"
          >
            ➕ เพิ่มรูป
          </Link>
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-border bg-white px-5 py-2.5 text-sm text-ink transition hover:border-accent"
          >
            ✏️ แก้ไข
          </button>
          <button
            onClick={goShare}
            className="rounded-full bg-green-share px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            📤 แชร์ประเทศนี้
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="rounded-full border border-destructive/40 px-5 py-2.5 text-sm text-destructive transition hover:bg-destructive/5 disabled:opacity-60"
          >
            🗑 ลบ
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
