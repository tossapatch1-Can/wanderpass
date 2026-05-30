// Trip Planner (PRD screen D) — plan a future trip with a budget slider and an
// AI-generated daily itinerary, save it as a Wishlist.

import { redirect } from "next/navigation";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupNeeded } from "@/components/setup-needed";
import { PlanForm } from "@/components/plan/plan-form";
import { WishlistItems } from "@/components/plan/wishlist-items";
import type { Wishlist } from "@/lib/types";

export default async function PlanPage() {
  if (!isSupabaseConfigured()) return <SetupNeeded what="การแพลนทริป" />;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/plan");

  const { data: wishlists } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-xl space-y-10 px-5 py-8 pb-28 sm:pb-10">
      <div>
        <h1 className="text-2xl font-bold text-primary">แพลนทริปใหม่</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          พิมพ์ปลายทาง เลื่อนงบ แล้วให้ AI ช่วยร่างแผนเที่ยวให้
        </p>
      </div>

      <PlanForm />

      <WishlistItems initial={(wishlists as Wishlist[]) ?? []} />
    </div>
  );
}
