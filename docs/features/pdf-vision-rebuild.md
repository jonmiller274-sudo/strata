# Feature: PDF Vision Pipeline (Replace Text Extraction)

**Date:** 2026-04-02
**Priority:** After screenshot-to-section
**Depends on:** screenshot-to-section (reuses vision infrastructure)

## Business Outcome
Replace the current text-only PDF extraction with page-image-based vision processing. Each PDF page is rendered as an image and sent to Claude's vision API, producing faithful section output that captures charts, tables, diagrams, and visual hierarchy — not just raw text.

## Key Design Decisions (from brainstorm)
- **Page-picker UI:** After upload, show page thumbnails. User selects which pages to include.
- **Vision model:** Claude (same as screenshot-to-section, reuse the pipeline)
- **Faithful translation:** The goal is near-perfect interactive reproduction, not summarization

## What Changes from Current Pipeline
- Current: PDF → text extraction → text to AI → sections (lossy)
- New: PDF → page images → page picker → selected images to vision AI → sections (faithful)

## Open Questions
- Render PDF pages to images server-side (pdf2pic? sharp?) or client-side (pdf.js canvas)?
- Send all selected pages in one Claude call or one page per call?
- How to handle 20+ selected pages (token/cost limits)?
