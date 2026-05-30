// Onboarding / empty state (PRD §customer journey step 3 🆕) — shown when the
// passport has no stamps yet. Invites the user to add their first trip.

import Link from "next/link";

export function EmptyPassport({ isOwner = true }: { isOwner?: boolean }) {
  if (!isOwner) {
    return (
      <div className="space-y-3 py-12 text-center text-muted-foreground">
        <p className="text-5xl">🧳</p>
        <p>นักเดินทางคนนี้ยังไม่ได้เปิดเผยแสตมป์ใดๆ</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-10 text-center">
      <p className="text-6xl">✈️</p>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-primary">เริ่มต้นการเดินทางของคุณ</h2>
        <p className="mx-auto max-w-sm text-sm text-ink/70">
          เพิ่มประเทศแรกที่เคยไป อัปโหลดรูปจริง แล้วระบบจะสร้างแสตมป์น่ารักให้คุณ
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/passport/add"
          className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
        >
          📍 บันทึกทริปแรก
        </Link>
        <Link
          href="/plan"
          className="rounded-full border border-border bg-white px-6 py-3 font-medium text-ink transition hover:border-accent"
        >
          🧭 แพลนทริปใหม่
        </Link>
      </div>
    </div>
  );
}
