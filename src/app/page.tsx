// Landing page (A) — describes the app, then sends you to Google login.
// PRD screen A: "บอกว่าแอปทำอะไร · ปุ่มเดียว: เข้าสู่ระบบด้วย Google".

import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

const FEATURES = [
  {
    icon: "📷",
    title: "เก็บทริปจากรูปจริง",
    body: "อัปรูปประเทศที่เคยไป ระบบสร้างเป็นแสตมป์การ์ตูนน่ารักให้อัตโนมัติ พร้อมเขียนบันทึกความทรงจำ",
  },
  {
    icon: "🗺️",
    title: "พาสปอร์ตของคุณเอง",
    body: "ดูแผนที่โลกที่ระบายสีตามที่เคยไป นับจำนวนประเทศ ทวีป และแสตมป์ที่สะสมได้",
  },
  {
    icon: "📤",
    title: "แชร์อวดเพื่อนได้",
    body: "แชร์ทีละประเทศหรือทั้งเล่ม ติดลายน้ำ Wanvela ลง IG / Facebook / TikTok ได้เลย",
  },
  {
    icon: "🧭",
    title: "แพลนทริปถัดไป",
    body: "พิมพ์ปลายทาง เลื่อนงบประมาณ แล้วให้ AI ช่วยร่างแผนเที่ยวรายวัน เก็บไว้เป็น Wishlist",
  },
];

// A few sample stamps to show on the hero.
const SAMPLE_STAMPS = ["jp", "fr", "th", "it", "kr", "au"];

export default async function HomePage() {
  let signedIn = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      signedIn = Boolean(user);
    } catch {
      signedIn = false;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-6 py-12">
      {/* Hero */}
      <section className="space-y-6 pt-6 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-accent">
          {BRAND.heroEyebrow}
        </p>
        <h1 className="text-4xl font-bold leading-tight text-primary md:text-6xl">
          {BRAND.tagline}
        </h1>
        <p className="mx-auto max-w-xl text-lg text-ink/70">{BRAND.heroSubhead}</p>

        <div className="flex justify-center pt-2">
          <Link
            href={signedIn ? "/passport/me" : "/login"}
            className="rounded-full bg-primary px-7 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {signedIn ? "ไปที่พาสปอร์ตของฉัน →" : "เริ่มต้นด้วย Google →"}
          </Link>
        </div>

        {/* Sample stamps */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          {SAMPLE_STAMPS.map((code, i) => (
            <Image
              key={code}
              src={`/stamps/${code}.svg`}
              alt=""
              width={72}
              height={72}
              className="drop-shadow-sm"
              style={{ rotate: `${(i % 2 === 0 ? -1 : 1) * (3 + i)}deg` }}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-accent"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 text-lg font-semibold text-primary">{f.title}</h3>
            <p className="mt-1 text-sm text-ink/70">{f.body}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-primary px-8 py-12 text-center text-primary-foreground">
        <h2 className="text-2xl font-bold md:text-3xl">พร้อมเริ่มเก็บการเดินทางของคุณแล้วหรือยัง?</h2>
        <p className="mx-auto mt-2 max-w-md text-primary-foreground/80">
          ฟรี เข้าสู่ระบบด้วย Google แล้วเพิ่มทริปแรกได้เลย
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href={signedIn ? "/passport/me" : "/login"}
            className="rounded-full bg-accent px-7 py-3 font-medium text-accent-foreground transition hover:opacity-90"
          >
            {signedIn ? "เปิดพาสปอร์ตของฉัน" : "เข้าสู่ระบบด้วย Google"}
          </Link>
        </div>
      </section>
    </div>
  );
}
