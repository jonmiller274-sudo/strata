import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    // Auth check: Supabase session OR edit key bypass
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    const editKey = process.env.STRATA_EDIT_KEY?.trim();
    const keyParam = request.nextUrl.searchParams.get("key");
    const hasValidKey = editKey && keyParam === editKey;

    if (!user && !hasValidKey) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const artifactId = formData.get("artifactId");
    const sectionId = formData.get("sectionId");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!artifactId || typeof artifactId !== "string") {
      return NextResponse.json(
        { error: "artifactId is required" },
        { status: 400 }
      );
    }

    if (!sectionId || typeof sectionId !== "string") {
      return NextResponse.json(
        { error: "sectionId is required" },
        { status: 400 }
      );
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPEG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const path = `${artifactId}/${sectionId}.${ext}`;

    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from("section-images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Section image upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("section-images").getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Image upload route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
