// Admin dashboard (PRD §4) — users, popular countries + shares, report queue,
// stamp library. Access gated by the email allowlist in src/lib/admins.ts;
// data read via the service-role client (bypasses RLS).

import { redirect } from "next/navigation";
import { createServerClient, createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admins";
import { SetupNeeded } from "@/components/setup-needed";
import { AdminReports, type ReportItem } from "./admin-reports";
import { AdminStampEditor } from "./admin-stamp-editor";
import type { Country } from "@/lib/types";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <SetupNeeded what="หน้าผู้ดูแล" />;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdmin(user.email)) redirect("/");

  const admin = createAdminClient();

  // Parallel reads
  const [{ data: profiles }, { data: trips }, { data: shares }, { data: countries }, { data: reports }] =
    await Promise.all([
      admin.from("profiles").select("id, username, display_name"),
      admin.from("trips").select("id, user_id, country_code"),
      admin.from("share_stats").select("trip_id, platform"),
      admin.from("countries").select("code, name_th, name_en, continent, flag_emoji, stamp_svg_url").order("name_th"),
      admin.from("reports").select("id, photo_id, reason, created_at").eq("status", "open").order("created_at", { ascending: false }),
    ]);

  const allTrips = trips ?? [];
  const allShares = shares ?? [];
  const allCountries = (countries as Country[] | null) ?? [];
  const countryName = new Map(allCountries.map((c) => [c.code, c]));

  // Trip counts per user
  const tripsByUser = new Map<string, number>();
  for (const t of allTrips) tripsByUser.set(t.user_id, (tripsByUser.get(t.user_id) ?? 0) + 1);
  const users = (profiles ?? [])
    .map((p) => ({ ...p, trips: tripsByUser.get(p.id) ?? 0 }))
    .sort((a, b) => b.trips - a.trips);

  // Country → trip id set, for mapping shares back to a country
  const tripIdToCountry = new Map(allTrips.map((t) => [t.id, t.country_code]));
  const tripCountByCountry = new Map<string, number>();
  for (const t of allTrips)
    tripCountByCountry.set(t.country_code, (tripCountByCountry.get(t.country_code) ?? 0) + 1);
  const shareCountByCountry = new Map<string, number>();
  for (const s of allShares) {
    const code = s.trip_id ? tripIdToCountry.get(s.trip_id) : null;
    if (code) shareCountByCountry.set(code, (shareCountByCountry.get(code) ?? 0) + 1);
  }
  const popular = Array.from(tripCountByCountry.entries())
    .map(([code, count]) => ({
      code,
      name: countryName.get(code)?.name_th ?? code,
      flag: countryName.get(code)?.flag_emoji ?? "",
      trips: count,
      shares: shareCountByCountry.get(code) ?? 0,
    }))
    .sort((a, b) => b.trips - a.trips || b.shares - a.shares)
    .slice(0, 15);

  // Reports queue — resolve photo → trip → country + signed thumbnail
  const reportItems: ReportItem[] = [];
  for (const r of reports ?? []) {
    const { data: photo } = await admin
      .from("trip_photos")
      .select("id, storage_path, trip_id, trips(country_code)")
      .eq("id", r.photo_id)
      .maybeSingle();
    let thumb: string | null = null;
    if (photo?.storage_path) {
      const { data } = await admin.storage
        .from("trip-photos")
        .createSignedUrl(photo.storage_path, 3600);
      thumb = data?.signedUrl ?? null;
    }
    const cc = photo?.trips
      ? Array.isArray(photo.trips)
        ? photo.trips[0]?.country_code
        : (photo.trips as { country_code: string }).country_code
      : undefined;
    reportItems.push({
      id: r.id,
      photoId: r.photo_id,
      reason: r.reason,
      createdAt: r.created_at,
      thumb,
      country: cc ? countryName.get(cc)?.name_th ?? cc : "—",
    });
  }

  const totalShares = allShares.length;

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-5 py-8 pb-28 sm:pb-10">
      <div>
        <h1 className="text-2xl font-bold text-primary">หน้าผู้ดูแล</h1>
        <p className="text-sm text-muted-foreground">เข้าสู่ระบบในชื่อ {user.email}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="ผู้ใช้" value={users.length} icon="👥" />
        <Stat label="ทริปทั้งหมด" value={allTrips.length} icon="🛂" />
        <Stat label="ยอดแชร์" value={totalShares} icon="📤" />
      </div>

      {/* Reports queue */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary">
          คิวรูปที่ถูกรายงาน {reportItems.length > 0 && `(${reportItems.length})`}
        </h2>
        <AdminReports initial={reportItems} />
      </section>

      {/* Popular countries */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary">ประเทศยอดฮิต</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">ประเทศ</th>
                <th className="px-4 py-2 text-right font-medium">ทริป</th>
                <th className="px-4 py-2 text-right font-medium">แชร์</th>
              </tr>
            </thead>
            <tbody>
              {popular.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                popular.map((c) => (
                  <tr key={c.code} className="border-t border-border">
                    <td className="px-4 py-2">{c.flag} {c.name}</td>
                    <td className="px-4 py-2 text-right">{c.trips}</td>
                    <td className="px-4 py-2 text-right">{c.shares}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary">ผู้ใช้</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">ชื่อ</th>
                <th className="px-4 py-2 font-medium">username</th>
                <th className="px-4 py-2 text-right font-medium">ทริป</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-2">{u.display_name || "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{u.username}</td>
                  <td className="px-4 py-2 text-right">{u.trips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stamp library */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary">คลังดีไซน์แสตมป์</h2>
        <p className="text-sm text-muted-foreground">
          เปลี่ยนรูปการ์ตูนของแต่ละประเทศ (ใส่ path เช่น <code>/stamps/jp.svg</code> หรือ URL)
        </p>
        <AdminStampEditor countries={allCountries} />
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-4 text-center">
      <div className="text-xl">{icon}</div>
      <div className="mt-1 text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
