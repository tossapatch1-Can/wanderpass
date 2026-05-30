// Country Detail (PRD screen E) — /passport/<username>/country/<code>.
// Owner sees edit/delete/privacy controls; visitors see a read-only public view.

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  createServerClient,
  createAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { SetupNeeded } from "@/components/setup-needed";
import { CountryActions } from "@/components/passport/country-actions";
import { CONTINENTS_TH } from "@/lib/continents";
import type { Continent, Profile } from "@/lib/types";

function formatThaiDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ username: string; code: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNeeded what="หน้ารายละเอียดประเทศ" />;
  const { username, code } = await params;
  const countryCode = code.toUpperCase();

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /passport/me/country/xx → resolve to the real username
  if (username === "me") {
    if (!user) redirect(`/login?next=/passport/me/country/${code}`);
    const { data: p } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    redirect(`/passport/${p?.username ?? "me"}/country/${code}`);
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (!profileData) return <NotFound />;
  const profile = profileData as Profile;
  const isOwner = user?.id === profile.id;

  // RLS returns the trip only if it's the viewer's own, or public & not hidden.
  const { data: trip } = await supabase
    .from("trips")
    .select(
      "id, country_code, travel_date, comment, is_public, countries(name_th, name_en, continent, flag_emoji, stamp_svg_url)"
    )
    .eq("user_id", profile.id)
    .eq("country_code", countryCode)
    .maybeSingle();

  if (!trip) return <NotFound isPrivate />;

  const country = (Array.isArray(trip.countries) ? trip.countries[0] : trip.countries) as
    | {
        name_th: string;
        name_en: string;
        continent: Continent;
        flag_emoji: string | null;
        stamp_svg_url: string | null;
      }
    | null;

  const { data: photoRows } = await supabase
    .from("trip_photos")
    .select("id, storage_path")
    .eq("trip_id", trip.id)
    .order("created_at", { ascending: true });

  const photos = photoRows ?? [];

  // Sign photo URLs (private bucket). Owner can sign with their own session;
  // public viewing by visitors needs the service role.
  const signer = isOwner ? supabase : createAdminClient();
  const signed: { id: string; url: string }[] = [];
  for (const p of photos) {
    const { data } = await signer.storage
      .from("trip-photos")
      .createSignedUrl(p.storage_path, 3600);
    if (data?.signedUrl) signed.push({ id: p.id, url: data.signedUrl });
  }

  const stampSrc = country?.stamp_svg_url ?? `/stamps/${countryCode.toLowerCase()}.svg`;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-8 pb-28 sm:pb-10">
      <Link href={`/passport/${username}`} className="text-sm text-accent hover:underline">
        ← กลับไปพาสปอร์ต
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Image src={stampSrc} alt={country?.name_th ?? countryCode} width={96} height={96} />
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {country?.flag_emoji} {country?.name_th ?? countryCode}
          </h1>
          <p className="text-sm text-muted-foreground">
            {country?.name_en}
            {country && ` · ${CONTINENTS_TH[country.continent]}`}
          </p>
          {trip.travel_date && (
            <p className="mt-1 text-sm text-ink/70">📅 {formatThaiDate(trip.travel_date)}</p>
          )}
        </div>
      </div>

      {/* Comment */}
      {trip.comment && (
        <p className="rounded-2xl border border-border bg-card px-4 py-3 text-ink">
          {trip.comment}
        </p>
      )}

      {/* Photo gallery */}
      {signed.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {signed.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.url}
              alt=""
              className="aspect-square w-full rounded-xl border border-border object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">ยังไม่มีรูปในประเทศนี้</p>
      )}

      {/* Actions */}
      <CountryActions
        tripId={trip.id}
        code={countryCode}
        username={username}
        isOwner={isOwner}
        initialIsPublic={trip.is_public}
        initialComment={trip.comment ?? ""}
        initialTravelDate={trip.travel_date ?? ""}
        firstPhotoId={photos[0]?.id ?? null}
      />
    </div>
  );
}

function NotFound({ isPrivate = false }: { isPrivate?: boolean }) {
  return (
    <div className="mx-auto max-w-xl space-y-3 px-6 py-20 text-center">
      <p className="text-6xl">{isPrivate ? "🔒" : "🧳"}</p>
      <h1 className="text-2xl font-semibold text-primary">
        {isPrivate ? "แสตมป์นี้เป็นส่วนตัว" : "ไม่พบหน้านี้"}
      </h1>
      <p className="text-muted-foreground">
        {isPrivate
          ? "เจ้าของยังไม่ได้เปิดให้สาธารณะดูประเทศนี้"
          : "ลองกลับไปที่พาสปอร์ตอีกครั้ง"}
      </p>
      <Link href="/passport/me" className="inline-block text-accent hover:underline">
        ไปพาสปอร์ตของฉัน →
      </Link>
    </div>
  );
}
