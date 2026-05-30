// Add Country (PRD screen C) — server wrapper: auth-gate + load the country
// catalog, then hand off to the client form.

import { redirect } from "next/navigation";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupNeeded } from "@/components/setup-needed";
import { AddCountryForm } from "@/components/passport/add-country-form";
import type { Country } from "@/lib/types";

export default async function AddCountryPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNeeded what="การบันทึกทริป" />;
  const { country } = await searchParams;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/passport/add");

  const { data: countries } = await supabase
    .from("countries")
    .select("code, name_th, name_en, continent, flag_emoji, stamp_svg_url")
    .order("name_th");

  const { data: trips } = await supabase
    .from("trips")
    .select("country_code")
    .eq("user_id", user.id);

  const visitedCodes = (trips ?? []).map((t) => t.country_code);

  return (
    <div className="mx-auto max-w-xl px-5 py-8 pb-28 sm:pb-10">
      <h1 className="mb-6 text-2xl font-bold text-primary">บันทึกทริปที่เคยไป</h1>
      <AddCountryForm
        countries={(countries as Country[]) ?? []}
        visitedCodes={visitedCodes}
        preselect={country?.toUpperCase() ?? null}
      />
    </div>
  );
}
