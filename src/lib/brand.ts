// 🎨 Brand config — แก้ที่นี่ที่เดียว เปลี่ยนทั่วทั้งแอป
//
// FOR BEGINNERS in Block 1 of the classroom:
// แก้ค่าด้านล่างให้เป็นแบรนด์ของคุณเอง แล้ว save → browser จะรีเฟรชอัตโนมัติ

export const BRAND = {
  /** ชื่อแอป — แสดงบน header, footer, browser tab */
  name: "Wanderpass",

  /** Emoji หน้าชื่อ — เปลี่ยนเป็น 🌍 ✈️ 🗺️ 🧭 หรืออะไรก็ได้ */
  emoji: "🛂",

  /** Tagline สั้นๆ — หัวข้อใหญ่ตรงหน้าแรก */
  tagline: "สมุดเดินทางของคุณ",

  /** คำอธิบายรองหัวข้อ — ใต้ tagline ในหน้าแรก */
  heroSubhead:
    "เก็บทุกประเทศที่เคยไป ให้เป็นแสตมป์น่ารักในพาสปอร์ตของตัวเอง เขียนบันทึก แล้วแชร์ลงโซเชียลได้เลย",

  /** Microcopy เหนือ tagline — คำที่ลูกค้าเห็นก่อน */
  heroEyebrow: "Wanderpass × Wanvela",

  /** Description สำหรับ <meta> tag — ขึ้นใน Google + preview link ที่แชร์ */
  metaDescription:
    "สมุดเดินทางดิจิทัล — เก็บประเทศที่เคยไปเป็นแสตมป์น่ารัก เขียนบันทึก แชร์ลงโซเชียล และแพลนทริปใหม่พร้อมงบประมาณ",

  /** ข้อความ footer */
  footer: "Wanderpass × Wanvela · เก็บทุกการเดินทางให้เป็นความทรงจำ",
} as const;

// 🌏 Nav labels (ภาษาไทย)
export const NAV = {
  plan: "แพลนทริป",
  passport: "พาสปอร์ตของฉัน",
  admin: "Admin",
} as const;
