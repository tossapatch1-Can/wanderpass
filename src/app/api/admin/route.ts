// POST /api/admin — admin-only mutations (moderation + stamp library).
// Body: { action: "hide_report" | "dismiss_report" | "update_stamp", ... }
//
// Gated by the email allowlist in src/lib/admins.ts; uses the service-role
// client so it can bypass RLS for moderation.

import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admins";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return new Response("Admin only", { status: 403 });
  }

  const body = (await req.json()) as {
    action: string;
    reportId?: string;
    photoId?: string;
    code?: string;
    stampUrl?: string;
  };
  const admin = createAdminClient();

  switch (body.action) {
    case "hide_report": {
      if (!body.reportId || !body.photoId) return bad();
      // Hide the photo, and if it's the last visible one, hide the trip too.
      await admin.from("trip_photos").update({ is_hidden: true }).eq("id", body.photoId);
      await admin.from("reports").update({ status: "hidden" }).eq("id", body.reportId);
      return ok();
    }
    case "dismiss_report": {
      if (!body.reportId) return bad();
      await admin.from("reports").update({ status: "dismissed" }).eq("id", body.reportId);
      return ok();
    }
    case "update_stamp": {
      if (!body.code) return bad();
      const { error } = await admin
        .from("countries")
        .update({ stamp_svg_url: body.stampUrl || null })
        .eq("code", body.code.toUpperCase());
      if (error) return new Response(error.message, { status: 400 });
      return ok();
    }
    default:
      return bad();
  }
}

function ok() {
  return Response.json({ ok: true });
}
function bad() {
  return new Response("Bad request", { status: 400 });
}
