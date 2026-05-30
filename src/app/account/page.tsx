// Account management (PRD §3 🆕 "จัดการบัญชี"). v1: show identity + sign out.

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupNeeded } from "@/components/setup-needed";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) return <SetupNeeded what="การจัดการบัญชี" />;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 py-10 pb-28 sm:pb-10">
      <h1 className="text-2xl font-bold text-primary">จัดการบัญชี</h1>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{profile?.avatar_emoji || "🧳"}</span>
          <div>
            <p className="font-medium text-ink">{profile?.display_name || profile?.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        {profile?.username && (
          <Link
            href={`/passport/${profile.username}`}
            className="inline-block text-sm text-accent hover:underline"
          >
            ดูพาสปอร์ตของฉัน →
          </Link>
        )}
      </div>

      <SignOutButton />
    </div>
  );
}
