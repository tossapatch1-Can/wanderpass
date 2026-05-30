// Mobile bottom navigation (PRD screen B). Shown only to signed-in users,
// only on small screens. Server component — reads auth like SiteHeader.

import Link from "next/link";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

const ITEMS = [
  { href: "/passport/me", label: "พาสปอร์ต", icon: "🛂" },
  { href: "/passport/add", label: "บันทึกทริป", icon: "➕" },
  { href: "/plan", label: "แพลนทริป", icon: "🧭" },
];

export async function BottomNav() {
  if (!isSupabaseConfigured()) return null;
  let signedIn = false;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  } catch {
    signedIn = false;
  }
  if (!signedIn) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-cream/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-ink/70 transition hover:text-primary"
          >
            <span className="text-xl">{it.icon}</span>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
