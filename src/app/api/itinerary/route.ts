// POST /api/itinerary
// Body: { destination: string, days: number, budgetMin: number, budgetMax: number }
// Returns: Itinerary { summary, days: [{ day, title, activities[] }] }
//
// Uses Claude tool_use to force a structured daily plan (Thai). Budget is a
// rough estimate only (PRD: mock data, no real pricing integration in v1).

import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const body = (await req.json()) as {
    destination?: string;
    days?: number;
    budgetMin?: number;
    budgetMax?: number;
  };
  const destination = body.destination?.trim();
  if (!destination) return new Response("destination is required", { status: 400 });

  const days = Math.min(Math.max(Math.round(body.days ?? 3), 1), 14);
  const budgetMin = Math.max(0, Math.round(body.budgetMin ?? 0));
  const budgetMax = Math.max(budgetMin, Math.round(body.budgetMax ?? 0));

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1600,
    system: `คุณเป็นนักวางแผนทริปท่องเที่ยวที่อบอุ่นและรู้จริง สำหรับแอป Wanderpass
ผู้ใช้บอกปลายทาง จำนวนวัน และช่วงงบประมาณโดยประมาณ (เป็นบาท ใช้เป็นค่าประมาณการเท่านั้น)
ให้คุณร่างแผนเที่ยวรายวันสั้นๆ กระชับ เป็นภาษาไทย โดยเรียก tool generate_itinerary

กติกา:
- ทำให้ครบทุกวันตามจำนวนที่ขอ (วันที่ 1 ถึง ${days})
- แต่ละวันมีหัวข้อสั้นๆ และกิจกรรม 2-4 อย่าง
- คำนึงถึงช่วงงบประมาณที่ให้มา แต่ไม่ต้องระบุราคาเป๊ะ
- summary เป็น 1-2 ประโยคที่ชวนให้อยากไป`,
    tools: [
      {
        name: "generate_itinerary",
        description: "สร้างแผนเที่ยวรายวันสำหรับผู้ใช้",
        input_schema: {
          type: "object",
          properties: {
            summary: { type: "string", description: "สรุปทริป 1-2 ประโยค (ภาษาไทย)" },
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  title: { type: "string", description: "หัวข้อของวันนั้น" },
                  activities: {
                    type: "array",
                    items: { type: "string" },
                    description: "กิจกรรม 2-4 อย่าง",
                  },
                },
                required: ["day", "title", "activities"],
              },
            },
          },
          required: ["summary", "days"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "generate_itinerary" },
    messages: [
      {
        role: "user",
        content: `ปลายทาง: ${destination}\nจำนวนวัน: ${days}\nช่วงงบประมาณ: ${budgetMin.toLocaleString()}–${budgetMax.toLocaleString()} บาท`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return new Response("AI did not return a plan", { status: 500 });
  }

  return Response.json(toolUse.input);
}
