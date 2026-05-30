// My Passport (PRD screen B) — shareable at /passport/<username>.
// /passport/me resolves the current user and redirects to their username.
//
// Owner sees all their trips + action buttons; visitors see only public,
// non-hidden trips (enforced by RLS).

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Continent, Profile } from "@/lib/types";
import { SetupNeeded } from "@/components/setup-needed";
import { WorldMapBand } from "@/components/passport/world-map-band";
import { PassportStats } from "@/components/passport/passport-stats";
import { CountryStamp, type PassportTripCard } from "@/components/passport/country-stamp";
import { EmptyPassport } from "@/components/passport/empty-passport";

type CountryRel = {
  code: string;
  name_th: string;
  name_en: string;
  continent: Continent;
  flag_emoji: string | null;
  stamp_svg_url: string | null;
};

type TripRow = {
  id: string;
  country_code: string;
  travel_date: string | null;
  is_public: boolean;
  is_hidden: boolean;
  created_at: string;
  countries: CountryRel | CountryRel[] | null;
};

function one(rel: CountryRel | CountryRel[] | null): CountryRel | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export default async function PassportPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!isSupabaseConfigured()) return <SetupNeeded what="พาสปอร์ตของคุณ" />;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /passport/me → resolve to the current user's username
  if (username === "me") {
    if (!user) redirect("/login?next=/passport/me");
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.username) redirect(`/passport/${profile.username}`);
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profileData) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-6 py-20 text-center">
        <p className="text-6xl">🧳</p>
        <h1 className="text-2xl font-semibold text-primary">ไม่พบพาสปอร์ตนี้</h1>
        <p className="text-muted-foreground">
          ไม่มีนักเดินทางชื่อ <code>{username}</code> เข้าสู่ระบบเพื่อสร้างของคุณเอง
        </p>
        <Link href="/login" className="inline-block text-accent hover:underline">
          เข้าสู่ระบบ →
        </Link>
      </div>
    );
  }

  const profile = profileData as Profile;
  const isOwner = user?.id === profile.id;

  const { data: tripRows } = await supabase
    .from("trips")
    .select(
      "id, country_code, travel_date, is_public, is_hidden, created_at, countries(code, name_th, name_en, continent, flag_emoji, stamp_svg_url)"
    )
    .eq("user_id", profile.id)
    .order("travel_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const trips = (tripRows as TripRow[] | null) ?? [];

  const cards: PassportTripCard[] = trips.map((t) => {
    const c = one(t.countries);
    return {
      country_code: t.country_code,
      name_th: c?.name_th ?? t.country_code,
      stamp_svg_url: c?.stamp_svg_url ?? null,
      travel_date: t.travel_date,
      is_public: t.is_public,
    };
  });

  const flags = trips.map((t) => one(t.countries)?.flag_emoji).filter(Boolean) as string[];
  const visitedContinents = new Set(
    trips.map((t) => one(t.countries)?.continent).filter(Boolean) as string[]
  );

  const displayName = profile.display_name || profile.username;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-8 pb-28 sm:pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{profile.avatar_emoji || "🧳"}</span>
          <div>
            <h1 className="text-2xl font-bold text-primary">พาสปอร์ตของ {displayName}</h1>
            <p className="text-sm text-muted-foreground">
              สะสมแล้ว {cards.length} แสตมป์
            </p>
          </div>
        </div>
        {cards.length > 0 && (
          <Link
            href={`/passport/${profile.username}/share`}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-accent"
          >
            🔗 แชร์ทั้งเล่ม
          </Link>
        )}
      </div>

      <WorldMapBand flags={flags} visitedContinents={visitedContinents} />
      <PassportStats
        countries={cards.length}
        continents={visitedContinents.size}
        stamps={cards.length}
      />

      {/* Owner actions */}
      {isOwner && (
        <div className="flex flex-wrap gap-3">
          <Link
            href="/passport/add"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            + บันทึกทริป
          </Link>
          <Link
            href="/plan"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            🧭 แพลนทริป
          </Link>
        </div>
      )}

      {/* Grid / onboarding */}
      {cards.length === 0 ? (
        <EmptyPassport isOwner={isOwner} />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {cards.map((trip, i) => (
            <CountryStamp
              key={trip.country_code}
              trip={trip}
              username={profile.username}
              index={i}
              showPrivacy={isOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
