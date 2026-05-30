// Top navigation bar — shown on every page.
// Server Component: reads the current user to decide whether to show the
// "เข้าสู่ระบบ" button or the signed-in nav + account menu.

import Link from "next/link";
import { BRAND, NAV } from "@/lib/brand";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admins";
import { AccountMenu } from "@/components/account-menu";

export async function SiteHeader() {
  let email: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      email = user?.email ?? null;
    } catch {
      email = null;
    }
  }

  const signedIn = Boolean(email);

  return (
    <header className="border-b border-border/70 bg-cream/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
          <span>{BRAND.emoji}</span>
          <span>{BRAND.name}</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4 text-sm">
          {signedIn ? (
            <>
              <Link
                href="/passport/me"
                className="hidden sm:inline px-2 py-1 text-ink/70 hover:text-primary transition"
              >
                {NAV.passport}
              </Link>
              <Link
                href="/plan"
                className="hidden sm:inline px-2 py-1 text-ink/70 hover:text-primary transition"
              >
                {NAV.plan}
              </Link>
              {isAdmin(email) && (
                <Link
                  href="/admin"
                  className="hidden sm:inline px-2 py-1 text-ink/70 hover:text-primary transition"
                >
                  {NAV.admin}
                </Link>
              )}
              <AccountMenu email={email!} isAdmin={isAdmin(email)} />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 font-medium hover:opacity-90 transition"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
