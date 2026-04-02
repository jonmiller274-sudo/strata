# Feature: Screenshot → Section (Drop Image in Editor)

**Date:** 2026-04-02
**Priority:** Next up
**Goal:** Drop a screenshot/image into the editor, get a fully structured section

## Business Outcome
Users editing an artifact can drop a screenshot of a slide, chart, pricing page, or any visual content directly into the editor. Claude's vision reads the image and generates the right section type (tier table, metrics, timeline, etc.) with faithful content extraction. The section appears inline, fully editable.

This is Strata's most differentiated interaction — no competitor does "image in, structured interactive section out" inside an editor.

## The Interaction
1. User is editing an artifact
2. Drags an image onto the content area (or clicks "Add from Image" in sidebar)
3. Drop zone appears with insertion position indicator
4. Placeholder shows the image faded + shimmer + "Creating section from image..."
5. Claude Sonnet 4 vision reads the image, picks the best section type, extracts content
6. Placeholder replaced with real editable section
7. User can change section type if AI guessed wrong

## Technical Design

### API: `POST /api/ai/vision-to-section`
- Input: base64 image + mimeType + artifact context (title, existing section types)
- Output: complete Section object, ready to insert
- Model: Claude Sonnet 4 (vision) — ~$0.04-0.08 per image

### Prompt Strategy
- Reuse full section schema from structure.ts
- Instructions: "Look at this screenshot. Pick the best Strata section type. Extract all text, numbers, and relationships faithfully. Do not invent data."
- Pass existing section types so Claude varies its choices

### Editor Integration (EditorLayout.tsx)
- Drop target: entire `#editor-preview` area
- Insertion position: detect which section cursor is between, show horizontal line
- States: `isProcessingImage`, `pendingImageIndex`
- Placeholder section: faded image background + shimmer + cancel button
- Sidebar: add "Add from Image" button below existing "Add Section"

### New function in generate.ts
- `generateVision(task, systemPrompt, userMessage, imageBase64, mimeType, options)`
- New task type: `"vision-section"` routed to Claude Sonnet 4

### Files to Create
- `src/app/api/ai/vision-to-section/route.ts`
- `src/lib/ai/prompts/vision-section.ts`

### Files to Modify
- `src/components/editor/EditorLayout.tsx` — drop zone + placeholder
- `src/lib/ai/generate.ts` — generateVision function
- `src/hooks/useEditor.ts` — addSectionAtIndex if needed

## Constraints
- Max 5MB per image, PNG/JPEG/WebP only
- One image = one section (no batch)
- Image not stored — consumed by vision, structured data persists
- No changes to viewer — generated sections identical to manual ones

## Success Criteria
- Drop a screenshot of a pricing table → get a tier-table section with correct prices
- Drop a screenshot of a KPI dashboard → get a metric-dashboard section with correct numbers
- Drop a screenshot of a timeline/roadmap → get a timeline section with correct milestones
- Section type is correct >80% of the time
- Total time from drop to rendered section: <10 seconds
