import { NextRequest, NextResponse } from "next/server";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export const maxDuration = 60;

const MAX_TEXT_LENGTH = 50_000;
const FETCH_TIMEOUT = 10_000; // 10 seconds

/** Validate that the URL is safe to fetch (no private IPs, localhost, etc.) */
function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.") ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    if (!isAllowedUrl(url)) {
      return NextResponse.json(
        { error: "Invalid or private URL. Only public http/https URLs are supported." },
        { status: 400 }
      );
    }

    // Fetch the page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    let html: string;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Could not fetch URL (${res.status}). Make sure the page is publicly accessible.` },
          { status: 400 }
        );
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        return NextResponse.json(
          { error: "URL does not point to an HTML page. Try pasting the content directly." },
          { status: 400 }
        );
      }

      html = await res.text();
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return NextResponse.json(
          { error: "Page took too long to load. Try pasting the content directly." },
          { status: 400 }
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    // Parse HTML and extract readable content
    const { document } = parseHTML(html);
    const reader = new Readability(document as unknown as Document);
    const article = reader.parse();

    if (!article || !article.textContent?.trim()) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from this page. It may be a single-page app or require login. Try pasting the content directly.",
        },
        { status: 400 }
      );
    }

    let text = article.textContent.trim();
    // Clean up excessive whitespace
    text = text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ");

    const rawLength = text.length;
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH);
    }

    return NextResponse.json({
      text,
      title: article.title || "",
      charCount: text.length,
      truncated: rawLength > MAX_TEXT_LENGTH,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("URL extraction error:", message);
    return NextResponse.json(
      { error: "Failed to extract content from URL. Try pasting the content directly." },
      { status: 500 }
    );
  }
}
