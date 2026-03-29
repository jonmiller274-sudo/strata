import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback handler with diagnostic logging.
 * TEMPORARY: Extra logging to debug auth flow. Remove after fixing.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

  // DIAGNOSTIC: Log everything about the incoming request
  console.log("[auth/callback] === DIAGNOSTIC START ===");
  console.log("[auth/callback] Full URL:", request.url);
  console.log("[auth/callback] Code present:", !!code);
  console.log("[auth/callback] Code value:", code?.substring(0, 20) + "...");
  console.log("[auth/callback] Next param:", next);
  console.log("[auth/callback] All search params:", Object.fromEntries(searchParams.entries()));
  console.log("[auth/callback] All cookies:", request.cookies.getAll().map(c => c.name));
  console.log("[auth/callback] PKCE verifier cookie:",
    request.cookies.getAll().filter(c => c.name.includes('code-verifier') || c.name.includes('pkce')).map(c => c.name)
  );

  if (code) {
    const redirectUrl = `${baseUrl}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            console.log("[auth/callback] Setting cookies:", cookiesToSet.map(c => c.name));
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("[auth/callback] Exchange result - error:", error?.message ?? "none");

    if (!error) {
      console.log("[auth/callback] SUCCESS - redirecting to:", redirectUrl);
      return response;
    }

    console.log("[auth/callback] EXCHANGE FAILED:", JSON.stringify(error));
  } else {
    console.log("[auth/callback] NO CODE IN URL - OAuth flow may have failed");
    console.log("[auth/callback] Hash fragment note: hash fragments are not sent to the server");
  }

  console.log("[auth/callback] === REDIRECTING TO ERROR ===");
  return NextResponse.redirect(`${baseUrl}/?auth=error`);
}
