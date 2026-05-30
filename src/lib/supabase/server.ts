// Supabase client for use on the SERVER (Server Components, API routes, Server Actions)
//
// Use this in page.tsx (default = Server Component) or in app/api/.../route.ts.
// It reads the user's session from cookies automatically.
//
// Example (Server Component):
//   const supabase = await createServerClient();
//   const { data } = await supabase.from('destinations').select('*');

import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// True once .env.local has the Supabase URL + anon key.
// Pages use this to show a friendly "set up Supabase" screen instead of a 500
// when a beginner runs `npm run dev` before configuring their project.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignore. Middleware will refresh.
          }
        },
      },
    }
  );
}

// Admin client: bypasses RLS. ONLY use in API routes for admin actions
// (e.g. updating booking status). Never expose to the browser.
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
