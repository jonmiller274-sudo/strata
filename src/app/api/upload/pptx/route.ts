import { NextRequest, NextResponse } from "next/server";
import { parsePptx } from "@/lib/parsers/pptx";

export const maxDuration = 60;

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (Vercel body limit ~4.5MB)
const MAX_TEXT_LENGTH = 50_000; // matches AI structuring limit
const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No PPTX file provided" },
        { status: 400 }
      );
    }

    if (file.type !== PPTX_MIME && !file.name.endsWith(".pptx")) {
      return NextResponse.json(
        { error: "File must be a PowerPoint (.pptx) file" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large (max 4MB). Try exporting as PDF instead." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parsePptx(buffer);

    if (!result.text.trim()) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from this presentation. It may be mostly images — try uploading a PDF export or screenshot instead.",
        },
        { status: 400 }
      );
    }

    let text = result.text;
    const rawLength = text.length;
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH);
    }

    return NextResponse.json({
      text,
      slideCount: result.totalSlides,
      charCount: text.length,
      truncated: rawLength > MAX_TEXT_LENGTH,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("PPTX parse error:", message);
    return NextResponse.json(
      {
        error:
          "Failed to parse presentation. The file may be corrupted or in an unsupported format.",
      },
      { status: 500 }
    );
  }
}
