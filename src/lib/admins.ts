// Simple email allowlist for admin access.
// Teacher: replace this with your own email before deploying.
//
// For the classroom: keep it simple — no roles table, no permissions system.
// In production you'd use Supabase Row Level Security with a `role` column.

export const ADMIN_EMAILS = [
  "tossapat.ch1@gmail.com",
  "can@wanvela.com",
];

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
