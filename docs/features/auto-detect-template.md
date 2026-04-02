# Feature: Auto-Detect Template Type

**Date:** 2026-04-02
**Priority:** Quick win

## Business Outcome
For PDF uploads, skip the template selection step. The AI infers the best structure from the content itself instead of being constrained by a template choice the user made before the AI saw the document.

## What Changes
- PDF upload path: Step 1 (template) is skipped or optional
- AI prompt gets broader latitude: "Analyze this document and choose the best section structure"
- Paste path: template selection stays (it helps when starting from raw notes)

## Why It Matters
The Nexar strategy deck didn't fit any single template (Platform Vision, Customer Journey, GTM, Product Roadmap). Forcing a template choice before the AI sees the content constrains the output unnecessarily.
