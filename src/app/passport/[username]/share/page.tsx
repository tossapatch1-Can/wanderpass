// Share screen (PRD screen F) — /passport/<username>/share (whole passport)
// or ?country=<code> for a single country. Renders a watermarked card the user
// can share / download.

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupNeeded } from "@/components/setup-needed";
import { SharePanel } from "@/components/share/share-panel";
import { ShareStamp } from "@/components/share/share-card";
import type { Continent, Profile } from "@/lib/types";

type CountryRel = {
  code: string;
  name_th: string;
  continent: Continent;
  flag_emoji: string | null;
  stamp_svg_url: string | null;
};

function one(rel: CountryRel | CountryRel[] | null): CountryRel | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNeeded what="การแชร์" />;
  const { username } = await params;
  const { country } = await searchParams;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (username === "me") {
    if (!user) redirect("/login?next=/passport/me/share");
    const { data: p } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    const q = country ? `?country=${country}` : "";
    redirect(`/passport/${p?.username ?? "me"}/share${q}`);
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (!profileData) redirect("/");
  const profile = profileData as Profile;
  const displayName = profile.display_name || profile.username;

  const back = country
    ? `/passport/${username}/country/${country.toLowerCase()}`
    : `/passport/${username}`;

  // ---------- Single country ----------
  if (country) {
    const code = country.toUpperCase();
    const { data: trip } = await supabase
      .from("trips")
      .select(
        "id, travel_date, comment, countries(code, name_th, continent, flag_emoji, stamp_svg_url)"
      )
      .eq("user_id", profile.id)
      .eq("country_code", code)
      .maybeSingle();

    if (!trip) redirect(`/passport/${username}`);
    const c = one(trip.countries as CountryRel | CountryRel[] | null);
    const stamp: ShareStamp = {
      country_code: c?.code ?? code,
      name_th: c?.name_th ?? code,
      stamp_svg_url: c?.stamp_svg_url ?? null,
      flag_emoji: c?.flag_emoji ?? null,
    };

    return (
      <ShareLayout back={back}>
        <SharePanel
          mode="country"
          username={username}
          displayName={displayName}
          sharePath={`/passport/${username}/country/${code.toLowerCase()}`}
          tripId={trip.id}
          country={stamp}
          travelDate={trip.travel_date}
          comment={trip.comment}
        />
      </ShareLayout>
    );
  }

  // ---------- Whole passport ----------
  const { data: tripRows } = await supabase
    .from("trips")
    .select("country_code, countries(code, name_th, continent, flag_emoji, stamp_svg_url)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const trips = tripRows ?? [];
  const stamps: ShareStamp[] = trips.map((t) => {
    const c = one(t.countries as CountryRel | CountryRel[] | null);
    return {
      country_code: t.country_code,
      name_th: c?.name_th ?? t.country_code,
      stamp_svg_url: c?.stamp_svg_url ?? null,
      flag_emoji: c?.flag_emoji ?? null,
    };
  });

  if (stamps.length === 0) redirect(`/passport/${username}`);

  const continents = new Set(
    trips.map((t) => one(t.countries as CountryRel | CountryRel[] | null)?.continent).filter(Boolean)
  ).size;

  return (
    <ShareLayout back={back}>
      <SharePanel
        mode="passport"
        username={username}
        displayName={displayName}
        sharePath={`/passport/${username}`}
        tripId={null}
        avatarEmoji={profile.avatar_emoji || "🧳"}
        countries={stamps.length}
        continents={continents}
        stamps={stamps}
      />
    </ShareLayout>
  );
}

function ShareLayout({ back, children }: { back: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 py-8 pb-28 sm:pb-10">
      <Link href={back} className="text-sm text-accent hover:underline">
        ← กลับ
      </Link>
      <h1 className="text-2xl font-bold text-primary">แชร์การเดินทาง</h1>
      {children}
    </div>
  );
}
