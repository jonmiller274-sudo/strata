import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 50_000; // matches AI structuring limit

/** Clean common PDF extraction artifacts that waste tokens and confuse the AI */
function cleanPdfText(raw: string): string {
  let text = raw;

  // Remove page markers: "-- 1 of 11 --", "— 3 of 15 —", etc.
  text = text.replace(/[-—–]{1,2}\s*\d+\s*of\s*\d+\s*[-—–]{1,2}/gi, "");

  // Remove spaced-out uppercase text: "C O N F I D E N T I A L" → "CONFIDENTIAL"
  // Add a space after the collapsed word to prevent merging with the next word
  text = text.replace(
    /\b([A-Z])((?:\s[A-Z]){2,})\b/g,
    (_, first, rest) => first + rest.replace(/\s/g, "") + " "
  );

  // Remove numbered page headers like "2 CONFIDENTIAL — Nexar Intelligence Platform Strategy"
  text = text.replace(/^\d+\s+CONFIDENTIAL\b.*$/gm, "");

  // Detect and remove repeated headers/footers (same line appearing 3+ times)
  const lines = text.split("\n");
  const lineCounts = new Map<string, number>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 15) {
      // Normalize leading numbers to catch "2 HEADER", "3 HEADER" as same line
      const normalized = trimmed.replace(/^\d+\s+/, "");
      lineCounts.set(normalized, (lineCounts.get(normalized) || 0) + 1);
    }
  }
  const repeatedPatterns = new Set<string>();
  for (const [pattern, count] of lineCounts) {
    if (count >= 3) repeatedPatterns.add(pattern);
  }
  if (repeatedPatterns.size > 0) {
    text = lines
      .filter((l) => {
        const normalized = l.trim().replace(/^\d+\s+/, "");
        return !repeatedPatterns.has(normalized);
      })
      .join("\n");
  }

  // Collapse excessive whitespace
  text = text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ");

  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large (max 10MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const pageCount = result.pages.length;

    let text = result.text.trim();

    await parser.destroy();

    if (!text) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. It may be image-based or scanned." },
        { status: 400 }
      );
    }

    // Clean PDF extraction noise
    text = cleanPdfText(text);

    const rawLength = text.length;
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH);
    }

    return NextResponse.json({
      text,
      pageCount,
      charCount: text.length,
      truncated: rawLength > MAX_TEXT_LENGTH,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("PDF parse error:", message);
    return NextResponse.json(
      { error: "Failed to parse PDF. The file may be corrupted or password-protected." },
      { status: 500 }
    );
  }
}
