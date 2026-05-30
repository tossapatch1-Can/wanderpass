// Email via Resend (server-only). No-ops gracefully if RESEND_API_KEY is unset,
// so the app works before email is configured.

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM ?? "Wanderpass <onboarding@resend.dev>";

export const emailEnabled = Boolean(apiKey);

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!apiKey) return { skipped: true as const };
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: FROM, ...opts });
    return { ok: true as const };
  } catch (e) {
    console.error("resend error", e);
    return { ok: false as const };
  }
}

function shell(title: string, body: string) {
  return `<div style="font-family:'Noto Sans Thai',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#23303f">
    <div style="font-size:32px">🛂</div>
    <h1 style="color:#1f3a5f;font-size:22px;margin:8px 0 16px">${title}</h1>
    ${body}
    <p style="margin-top:24px;font-size:12px;color:#8a8472">Wanderpass × Wanvela</p>
  </div>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#1f3a5f;color:#f7f3ea;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">${label}</a>`;

export function welcomeEmail(name: string, siteUrl: string) {
  return {
    subject: "ยินดีต้อนรับสู่ Wanderpass! 🛂",
    html: shell(
      `สวัสดี ${name} 👋`,
      `<p style="line-height:1.6">ยินดีต้อนรับสู่ Wanderpass — สมุดพาสปอร์ตการเดินทางของคุณ!</p>
       <p style="line-height:1.6">เริ่มต้นด้วยการเพิ่มประเทศแรกที่เคยไป อัปโหลดรูปจริง แล้วระบบจะสร้างแสตมป์น่ารักให้คุณเก็บไว้</p>
       <p style="margin:20px 0">${btn(`${siteUrl}/passport/add`, "เพิ่มทริปแรก →")}</p>`
    ),
  };
}

export function wishlistReminderEmail(name: string, destination: string, siteUrl: string) {
  return {
    subject: "พร้อมออกเดินทางหรือยัง? ✈️",
    html: shell(
      `${name} ทริปไป${destination}ยังรออยู่นะ`,
      `<p style="line-height:1.6">คุณเคยวางแผนทริปไป <strong>${destination}</strong> ไว้ใน Wishlist —
       พร้อมออกเดินทางหรือยัง? หรือยังอยากปรับแผนอีกนิด?</p>
       <p style="margin:20px 0">${btn(`${siteUrl}/plan`, "ดู Wishlist ของฉัน →")}</p>`
    ),
  };
}
