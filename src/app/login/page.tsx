// Login page (A) — single Google sign-in button (PRD screen A).

import { redirect } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { GoogleLoginButton } from "@/components/google-login-button";
import { SetupNeeded } from "@/components/setup-needed";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  if (!isSupabaseConfigured()) {
    return <SetupNeeded what="การเข้าสู่ระบบ" />;
  }

  // Already signed in → straight to the passport.
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next ?? "/passport/me");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <span className="text-6xl">{BRAND.emoji}</span>
      <h1 className="mt-5 text-3xl font-bold text-primary">{BRAND.name}</h1>
      <p className="mt-3 text-ink/70">{BRAND.heroSubhead}</p>

      <div className="mt-10 w-full">
        <GoogleLoginButton next={next ?? "/passport/me"} />
        {error && (
          <p className="mt-3 text-sm text-destructive">
            มีบางอย่างผิดพลาดระหว่างเข้าสู่ระบบ ลองอีกครั้งนะ
          </p>
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        เข้าสู่ระบบเพื่อเริ่มเก็บแสตมป์การเดินทางของคุณ
      </p>
    </div>
  );
}
