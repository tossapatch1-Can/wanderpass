// OAuth callback — Google redirects here with ?code=... after sign-in.
// We exchange the code for a session (cookies), send a welcome email on first
// sign-in, then send the user on.

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendEmail, welcomeEmail } from "@/lib/resend";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/passport/me";

  if (code) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // First sign-in? (created and last-signed-in within a minute → new account)
      const user = data.user;
      const created = user?.created_at ? new Date(user.created_at).getTime() : 0;
      const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
      if (user?.email && created && Math.abs(lastSignIn - created) < 60_000) {
        const name =
          (user.user_metadata?.full_name as string | undefined) ??
          user.email.split("@")[0];
        // fire-and-forget; no-ops if Resend isn't configured
        void sendEmail({ to: user.email, ...welcomeEmail(name, origin) });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
