// Supabase client for use in BROWSER (Client Components, "use client" files)
//
// Use this when you need to fetch/insert data from a React Client Component,
// e.g. in event handlers like onClick.
//
// Example:
//   const supabase = createClient();
//   const { data } = await supabase.from('destinations').select('*');

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
