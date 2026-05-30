// Friendly "Supabase isn't set up yet" screen.
//
// Shown on pages that NEED a database (passport, admin, booking) when a beginner
// runs `npm run dev` before filling in .env.local. The landing page falls back
// to mock data instead — but these pages have nothing to show without real data,
// so we explain the one setup step rather than crash with a 500.

export function SetupNeeded({ what = "This page" }: { what?: string }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 space-y-5">
      <div className="text-center space-y-3">
        <p className="text-6xl">🔌</p>
        <h1 className="text-2xl font-semibold">Connect Supabase to continue</h1>
        <p className="text-stone-600">
          {what} needs your database. Set it up once and it&apos;ll work
          everywhere.
        </p>
      </div>
      <div className="rounded-xl bg-amber-100 border border-amber-200 px-5 py-4 text-sm text-amber-900 space-y-2">
        <p>
          <strong>👋 Hey beginner!</strong> Two quick steps:
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>
            Copy <code>.env.example</code> to <code>.env.local</code> and fill in
            your <code>NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </li>
          <li>
            Follow <code>supabase/SETUP.md</code> — run <code>schema.sql</code>,{" "}
            <code>seed-countries.sql</code>, <code>storage.sql</code>.
          </li>
        </ol>
        <p>Restart the dev server and refresh — you&apos;re in. ✨</p>
      </div>
    </div>
  );
}
