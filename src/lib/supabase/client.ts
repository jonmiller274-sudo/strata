import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser/client components.
 * Uses cookie-based auth — respects RLS policies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
