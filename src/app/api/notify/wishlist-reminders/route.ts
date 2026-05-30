// GET /api/notify/wishlist-reminders
// Sends a gentle "ready to travel?" email for wishlists that have lingered.
// Protect with CRON_SECRET and call weekly (e.g. Vercel Cron). To avoid
// repeat-spam it only targets wishlists aged 7–21 days.

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, wishlistReminderEmail, emailEnabled } from "@/lib/resend";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("CRON_SECRET not configured", { status: 503 });

  const url = new URL(request.url);
  const auth = request.headers.get("authorization");
  const provided = auth?.replace("Bearer ", "") ?? url.searchParams.get("secret");
  if (provided !== secret) return new Response("unauthorized", { status: 401 });

  if (!emailEnabled) return Response.json({ skipped: "email not configured" });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const admin = createAdminClient();

  const now = Date.now();
  const newer = new Date(now - 7 * 86400_000).toISOString();
  const older = new Date(now - 21 * 86400_000).toISOString();

  const { data: wishlists } = await admin
    .from("wishlist")
    .select("user_id, destination, created_at")
    .lte("created_at", newer)
    .gte("created_at", older)
    .order("created_at", { ascending: false });

  // One reminder per user (most recent qualifying wishlist)
  const seen = new Set<string>();
  let sent = 0;
  for (const w of wishlists ?? []) {
    if (seen.has(w.user_id)) continue;
    seen.add(w.user_id);
    const { data } = await admin.auth.admin.getUserById(w.user_id);
    const email = data.user?.email;
    if (!email) continue;
    const name =
      (data.user?.user_metadata?.full_name as string | undefined) ?? email.split("@")[0];
    await sendEmail({ to: email, ...wishlistReminderEmail(name, w.destination, siteUrl) });
    sent++;
  }

  return Response.json({ sent });
}
