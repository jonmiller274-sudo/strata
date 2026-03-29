import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * OAuth callback handler.
 * Flow: Your app → Supabase → Google → Supabase → HERE → redirect to destination.
 * Exchanges the auth code for a session, then redirects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Use the production URL if available, otherwise origin
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // Auth failed — redirect to home with error
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url;
  return NextResponse.redirect(`${new URL(baseUrl).origin}/?auth=error`);
}
