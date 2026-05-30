"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/5"
    >
      ออกจากระบบ
    </button>
  );
}
