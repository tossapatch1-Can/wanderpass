"use client";

// Settings / account dropdown shown in the header for signed-in users.
// PRD §3: "ทุกหน้ามีปุ่ม ออกจากระบบ / จัดการบัญชี ในเมนูตั้งค่า"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AccountMenu({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
        aria-label="เมนูบัญชี"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground">เข้าสู่ระบบในชื่อ</p>
            <p className="text-sm font-medium truncate">{email}</p>
          </div>
          <nav className="flex flex-col py-1 text-sm sm:hidden">
            <Link href="/passport/me" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-secondary">
              พาสปอร์ตของฉัน
            </Link>
            <Link href="/plan" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-secondary">
              แพลนทริป
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-secondary">
                Admin
              </Link>
            )}
          </nav>
          <div className="flex flex-col py-1 text-sm border-t border-border sm:border-t-0">
            <Link href="/account" onClick={() => setOpen(false)} className="px-4 py-2 hover:bg-secondary">
              จัดการบัญชี
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-left text-destructive hover:bg-secondary"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
