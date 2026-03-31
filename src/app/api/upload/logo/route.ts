import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/admin";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 500 * 1024; // 500KB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const artifactId = formData.get("artifactId");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!artifactId || typeof artifactId !== "string") {
      return NextResponse.json(
        { error: "artifactId is required" },
        { status: 400 }
      );
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Allowed types: PNG, JPEG, SVG, WebP",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds 500KB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const path = `${artifactId}/logo.${ext}`;

    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Logo upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload logo" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Logo upload route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { artifactId } = body;

    if (!artifactId || typeof artifactId !== "string") {
      return NextResponse.json(
        { error: "artifactId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: files, error: listError } = await supabase.storage
      .from("logos")
      .list(artifactId);

    if (listError) {
      console.error("Logo list error:", listError);
      return NextResponse.json(
        { error: "Failed to list logo files" },
        { status: 500 }
      );
    }

    if (files && files.length > 0) {
      const paths = files.map((f) => `${artifactId}/${f.name}`);
      const { error: removeError } = await supabase.storage
        .from("logos")
        .remove(paths);

      if (removeError) {
        console.error("Logo remove error:", removeError);
        return NextResponse.json(
          { error: "Failed to remove logo files" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Logo delete route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
