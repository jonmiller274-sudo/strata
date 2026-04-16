import JSZip from "jszip";

interface SlideData {
  index: number;
  title: string;
  body: string;
  notes: string;
}

export interface PptxParseResult {
  slides: SlideData[];
  totalSlides: number;
  text: string;
}

/** Extract text runs from OOXML content (shared between slides and notes) */
function extractTextFromXml(xml: string): string[] {
  const paragraphs: string[] = [];
  // Match each <a:p> paragraph element
  const pMatches = xml.match(/<a:p\b[^>]*>[\s\S]*?<\/a:p>/g) || [];

  for (const p of pMatches) {
    // Extract all <a:t> text runs within this paragraph
    const textRuns: string[] = [];
    const tMatches = p.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
    for (const t of tMatches) {
      const content = t.replace(/<a:t[^>]*>/, "").replace(/<\/a:t>/, "");
      if (content.trim()) {
        textRuns.push(decodeXmlEntities(content));
      }
    }
    if (textRuns.length > 0) {
      paragraphs.push(textRuns.join(""));
    }
  }

  return paragraphs;
}

/** Check if a shape element is a title placeholder */
function isTitleShape(shapeXml: string): boolean {
  // Look for placeholder type="title" or type="ctrTitle"
  const phMatch = shapeXml.match(/<p:ph\b[^>]*type="([^"]*)"[^>]*\/?>/);
  if (phMatch) {
    const phType = phMatch[1];
    return phType === "title" || phType === "ctrTitle";
  }
  return false;
}

/** Decode common XML entities */
function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"');
}

/** Parse a single slide's XML and extract title + body text */
function parseSlideXml(xml: string): { title: string; body: string } {
  let title = "";
  const bodyParts: string[] = [];

  // Match each shape element <p:sp>...</p:sp>
  const shapes = xml.match(/<p:sp\b[\s\S]*?<\/p:sp>/g) || [];

  for (const shape of shapes) {
    const paragraphs = extractTextFromXml(shape);
    if (paragraphs.length === 0) continue;

    if (isTitleShape(shape)) {
      title = paragraphs.join(" ");
    } else {
      bodyParts.push(...paragraphs);
    }
  }

  // If no title was found via placeholder, use the first non-empty text as title
  if (!title && bodyParts.length > 0) {
    title = bodyParts.shift()!;
  }

  return { title: title.trim(), body: bodyParts.join("\n").trim() };
}

/** Parse a PPTX file buffer and extract text from all slides */
export async function parsePptx(buffer: Buffer): Promise<PptxParseResult> {
  const zip = await JSZip.loadAsync(buffer);

  // Find all slide files (ppt/slides/slide1.xml, slide2.xml, etc.)
  const slideFiles: { index: number; path: string }[] = [];
  zip.forEach((path) => {
    const match = path.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) {
      slideFiles.push({ index: parseInt(match[1], 10), path });
    }
  });

  // Sort by slide number
  slideFiles.sort((a, b) => a.index - b.index);

  const slides: SlideData[] = [];

  for (const { index, path } of slideFiles) {
    const slideXml = await zip.file(path)!.async("string");
    const { title, body } = parseSlideXml(slideXml);

    // Try to extract speaker notes
    let notes = "";
    const notesPath = `ppt/notesSlides/notesSlide${index}.xml`;
    const notesFile = zip.file(notesPath);
    if (notesFile) {
      const notesXml = await notesFile.async("string");
      const noteParagraphs = extractTextFromXml(notesXml);
      // Filter out slide number placeholders (often just a number)
      notes = noteParagraphs
        .filter((p) => !/^\d+$/.test(p.trim()))
        .join("\n")
        .trim();
    }

    slides.push({ index, title, body, notes });
  }

  // Build formatted text output
  const textParts: string[] = [];
  for (const slide of slides) {
    const parts: string[] = [];
    parts.push(`=== Slide ${slide.index}: ${slide.title || "(Untitled)"} ===`);
    if (slide.body) parts.push(slide.body);
    if (slide.notes) parts.push(`[Speaker Notes: ${slide.notes}]`);
    textParts.push(parts.join("\n"));
  }

  return {
    slides,
    totalSlides: slides.length,
    text: textParts.join("\n\n"),
  };
}
