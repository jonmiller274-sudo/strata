import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role, use_case, source, referrer } = body as {
      email: string;
      role?: string;
      use_case?: string;
      source?: string;
      referrer?: string;
    };

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("waitlist").upsert(
      {
        email: email.trim().toLowerCase(),
        role: role?.trim() || null,
        use_case: use_case || null,
        source: source || "direct",
        referrer: referrer || null,
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("[Waitlist] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Waitlist] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
