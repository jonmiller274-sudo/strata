# Strata Competitive Deep Dive

**Date:** April 6, 2026
**Analyst:** Claude (competitive research agent)
**Scope:** Gamma, Canva, Google Slides, ChatGPT/Claude AI, Notion

---

## 1. Executive Summary

None of the five major competitors occupy Strata's exact category: **AI-structured, interactive HTML strategy documents with non-linear navigation, progressive disclosure, and shareable URLs**. Gamma comes closest with its card-based scrollable format and expandable toggles, but it is fundamentally a presentation tool optimized for decks and websites, not purpose-built for strategy documents that need to stand alone without the author present. Canva and Google Slides are slide-based tools that produce linear, one-direction-at-a-time outputs with no meaningful interactivity beyond animations. ChatGPT and Claude can generate raw HTML, but the output requires technical skill to host, lacks analytics, has no persistent editing workflow, and produces inconsistent quality at document scale. Notion can publish pages to the web with toggles and databases, but its output looks like a wiki page, not a polished strategy deliverable, and it has no AI structuring from uploaded content. The core gap across all five: **none of them take existing strategic content (a PDF, a doc, a brain dump) and transform it into a self-navigating, interactive document that a board member or investor can explore at their own pace without the author walking them through it.** That is Strata's lane.

---

## 2. Competitor-by-Competitor Analysis

---

### 2.1 Gamma (gamma.app)

**$2.1B valuation | 70M+ users | $100M ARR**

#### A. Creation Experience

- **How do you start?** Three paths: (1) AI prompt — describe what you want and Gamma generates a full deck in ~60 seconds, (2) Import & Transform — upload a PDF, PPTX, Word doc, or paste a URL and Gamma restructures it into its card-based format, (3) Blank canvas with templates.
- **Time to shareable link:** 1-3 minutes for AI-generated content. Import path is similarly fast but requires more manual cleanup of AI restructuring.
- **AI capabilities:** The Gamma Agent (launched 2025-2026) is an AI design partner that researches the web, refines content, restyles entire decks, and provides design feedback through natural language conversation. It can turn bullets into visual timelines, suggest layouts, and generate images. Uses 20+ AI models under the hood.
- **Learning curve:** Low. Designed for non-designers. Card-based editor is intuitive. The AI agent reduces the need to learn the tool's mechanics.

#### B. Output Quality & Interactivity

- **Non-linear navigation:** Partial. Cards are scrollable sections that viewers can jump between, but there is no persistent sidebar navigation or section-level deep linking equivalent to Strata's navigation sidebar.
- **Progressive disclosure:** Yes. Nested cards, collapsible toggles, and footnotes allow "choose your own adventure" exploration. This is Gamma's strongest interactive feature.
- **Animated timelines:** Partial. Smart layouts include timeline views with basic animation. The Gamma Agent can convert bullets into visual timelines. However, these are not the rich, animated, Framer Motion-style timelines Strata offers.
- **Data-rich layouts:** Limited native charting. Supports embedded Airtable, Power BI, Figma, and other tools for data visualization, but these are embeds, not native. No built-in metric dashboard component.
- **Mobile viewing:** Responsive by default since output is web-native HTML cards. Performs well on mobile.
- **Self-navigating:** Moderate. The scrollable card format works asynchronously, but lacks the structural navigation cues (persistent sidebar, section progress indicators) that make a complex strategy document truly self-navigating.

#### C. Sharing & Distribution

- **URL sharing without login:** Yes. Shareable links with view/edit permissions. No viewer login required.
- **Analytics:** Yes (Pro plan). Shows unique viewers, card views, time spent per card, percentage of views per card, and how far viewers scrolled. Anonymous viewers show as "Anonymous Viewer."
- **Embedding:** Yes. Embeddable in websites and other platforms.
- **Viral loop:** Minimal. "Made with Gamma" branding on free plan, but no strong viewer-to-creator conversion mechanism built into the viewing experience.

#### D. Pricing & Target User

| Plan | Price | Key Features |
|------|-------|-------------|
| Free | $0 | 400 AI credits, Gamma branding |
| Plus | $8/mo (annual) | Unlimited AI, no branding, advanced images |
| Pro | $15/mo (annual) | Analytics, custom branding, API, 10 custom domains |
| Ultra | TBD | Most advanced AI, 100 custom domains, early access |

- **Who it's really for:** Marketing teams, educators, startup founders creating pitch decks, anyone who needs "good enough" presentations fast. Broad horizontal tool.
- **Where it falls short for VP Sales making a board deck:** Generic layouts and repetitive designs become apparent for high-stakes, scrutinized documents. No native metric dashboards or comparison tables purpose-built for QBRs. Export to PDF/PPTX has quality issues. The card format, while flexible, doesn't provide the structured, data-dense layouts a board expects.

#### E. The Gap

- **What Gamma does BETTER than Strata:** Massive template library, 20+ AI models, embeddable third-party apps (Figma, Airtable, Power BI), established ecosystem with API, 70M users providing social proof, web/site builder functionality beyond documents.
- **What Strata does BETTER than Gamma:** Purpose-built section types for strategy documents (metric dashboards, tier/comparison tables, animated timelines), persistent sidebar navigation for complex documents, AI structuring from uploaded content into specific interactive patterns (not just "cards"), dark/light theme polish, and focus on the "document that speaks for itself" use case rather than the "deck I present live" use case.
- **Feature gap Strata should consider closing:** Gamma's embed ecosystem (letting users embed Figma, Airtable, YouTube, etc. inside Strata documents) would significantly increase the data richness of Strata outputs. The Gamma Agent's conversational refinement workflow is also compelling — "make section 3 more visual" as a natural language command.

---

### 2.2 Canva (canva.com)

**$26B valuation | 190M+ monthly active users**

#### A. Creation Experience

- **How do you start?** Templates (thousands of presentation templates), blank canvas, or increasingly AI-assisted generation via Magic Design. Upload existing content or start from scratch.
- **Time to shareable link:** 5-15 minutes for a polished presentation from a template. Longer for custom work. AI can accelerate but Canva is still fundamentally a manual design tool.
- **AI capabilities:** Magic Design generates presentations from prompts. Magic Write generates text. Magic Animate adds animations in one click. Flourish integration provides animated, interactive data visualizations. AI image generation and background removal. However, AI is an assistant layer on top of a manual design workflow, not the primary creation path.
- **Learning curve:** Low-medium. Drag-and-drop is intuitive, but achieving professional quality requires design sensibility. The sheer number of options can overwhelm.

#### B. Output Quality & Interactivity

- **Non-linear navigation:** No. Presentations are strictly linear slide-by-slide. No sidebar, no section jumping. Viewers go forward or backward.
- **Progressive disclosure:** No. Each slide shows everything at once. On-click animations can stage reveals within a slide, but this is presentation-mode only (requires the author to click through) — not available in async viewing.
- **Animated timelines:** No native component. Can be designed manually using shapes and animations, but this is labor-intensive and not a structured feature.
- **Data-rich layouts:** Partial. Flourish integration provides animated charts (bar races, heatmaps, etc.) that are best-in-class for visual impact. But these require the Flourish integration and are more suited to visual storytelling than dense data dashboards.
- **Mobile viewing:** Problematic. Presentations designed for desktop don't reflow well. Three-column layouts compress to single columns on mobile, often resulting in squished, hard-to-read content. Limited designer control over responsive behavior.
- **Self-navigating:** No. Presentations are designed to be walked through by a presenter. Async viewing works (view link plays like a slideshow), but the linear format means viewers must go slide-by-slide without the ability to jump to what matters.

#### C. Sharing & Distribution

- **URL sharing without login:** Yes. Public view links available. No login required for viewers.
- **Analytics:** Basic. Pro/Team subscribers can see average time spent on public view links and time per page. No individual viewer tracking, no section-level engagement data.
- **Embedding:** Yes. Designs can be embedded in websites. Edits auto-update embedded versions.
- **Viral loop:** Moderate. "Designed in Canva" branding on free tier. Massive brand recognition drives organic discovery, but no in-document conversion mechanism.

#### D. Pricing & Target User

| Plan | Price | Key Features |
|------|-------|-------------|
| Free | $0 | Basic templates, 5GB storage |
| Pro | $15/mo ($120/yr) | Premium templates, Brand Kit, 100GB, stock images |
| Teams | ~$10/user/mo | Collaboration, shared brand assets |
| Enterprise | Custom ($2K-30K/yr) | SSO, SCIM, admin controls |

- **Who it's really for:** Marketers, social media managers, small business owners creating visual content across formats (social, print, video, presentations). Design-first, not content-first.
- **Where it falls short for VP Sales making a board deck:** No interactivity. Linear format forces viewers through every slide sequentially. No data dashboard components. No way to structure complex strategic content for self-guided exploration. It looks great but doesn't *work* as a standalone strategy document. A board member receiving a Canva link gets a slideshow, not an explorable document.

#### E. The Gap

- **What Canva does BETTER than Strata:** Visual design quality ceiling is higher (full creative control, millions of stock assets, Flourish data viz). Brand Kit ensures brand consistency across all content. Export to every format (PDF, PPTX, video, print). Massive template ecosystem.
- **What Strata does BETTER than Canva:** Non-linear navigation, progressive disclosure, purpose-built interactive section types, AI content structuring from uploads, mobile-responsive HTML output, self-navigating documents that work without a presenter. Strata produces *documents*; Canva produces *slides*.
- **Feature gap Strata should consider closing:** Brand Kit / brand consistency tooling. Canva's ability to enforce brand fonts, colors, and logos across all content is table-stakes for enterprise users. Strata should consider custom theme/brand settings.

---

### 2.3 Google Slides

**Free with Google Workspace | Ubiquitous in enterprise**

#### A. Creation Experience

- **How do you start?** Blank presentation, Google template, or (new as of March 2026) Gemini AI generation. Upload PPTX files. Tight integration with Google Docs, Sheets, and Drive.
- **Time to shareable link:** 2-5 minutes for a basic presentation. Gemini can generate slides from prompts but full multi-slide deck generation from a single prompt is still "coming soon" as of March 2026.
- **AI capabilities:** Gemini integration (March 2026 rollout) offers slide generation from prompts, image generation, content rewriting/summarization, and pulling information from Drive/Gmail. Still in beta, available first to AI Ultra and Pro subscribers. Notably behind Gamma's AI sophistication.
- **Learning curve:** Very low. Nearly everyone in a corporate environment already knows Google Slides.

#### B. Output Quality & Interactivity

- **Non-linear navigation:** No. Strictly linear. Slide numbers and thumbnail navigation in edit mode, but viewers in presentation mode go sequentially.
- **Progressive disclosure:** No. Each slide is a flat canvas. Animations can stage element appearance, but only in live presentation mode with manual clicks.
- **Animated timelines:** No. Must be manually designed with shapes and basic animations. No timeline component.
- **Data-rich layouts:** Basic. Can embed Google Sheets charts that update live. No native metric dashboards, comparison table components, or interactive data elements.
- **Mobile viewing:** Functional but not optimized. Slides maintain their aspect ratio on mobile, which means content is small and requires zooming. Not responsive.
- **Self-navigating:** No. Designed entirely for presenter-led delivery or sequential passive viewing. A board member opening a Google Slides link gets the same experience as sitting in a conference room without the presenter.

#### C. Sharing & Distribution

- **URL sharing without login:** Yes, with caveats. "Anyone with the link" sharing works, but viewers see the Google Slides interface (edit bar, slide thumbnails), which is not a polished viewing experience. No dedicated "published" view for external audiences.
- **Analytics:** No. Google Slides has zero viewer analytics. You cannot see who viewed, how long they spent, or which slides they looked at.
- **Embedding:** Yes. Can be embedded via iframe. Updates reflect automatically.
- **Viral loop:** None. No branding, no conversion mechanism.

#### D. Pricing & Target User

| Plan | Price | Key Features |
|------|-------|-------------|
| Free (personal) | $0 | Full functionality, 15GB Drive storage |
| Business Starter | $9.20/user/mo | Custom email, 30GB/user |
| Business Standard | $18.40/user/mo | 2TB/user, advanced Meet |
| Business Plus | $28.70/user/mo | Compliance, advanced security |
| Enterprise | Custom | Full Gemini, DLP, advanced admin |

- **Who it's really for:** Enterprise teams already in Google Workspace who need collaborative presentations with minimal friction. The "safe default" choice.
- **Where it falls short for VP Sales making a board deck:** Zero interactivity. No analytics. The viewing experience is utilitarian at best — a shared Google Slides link looks like a Google Slides link, not a polished deliverable. No way to make a strategy document that stands on its own. Gemini AI is far behind specialized tools. For board-level content, Google Slides is "fine" in the same way a plain text email is "fine" for a sales proposal.

#### E. The Gap

- **What Google Slides does BETTER than Strata:** Universal familiarity (zero learning curve for virtually every knowledge worker). Deep integration with Google Workspace ecosystem (Sheets, Docs, Drive, Gmail). Real-time multi-user collaboration. Export to PPTX. Free.
- **What Strata does BETTER than Google Slides:** Everything interactive — non-linear navigation, progressive disclosure, animated timelines, metric dashboards, comparison tables, mobile-responsive HTML, shareable URLs with analytics, AI content structuring. Strata and Google Slides are barely in the same category.
- **Feature gap Strata should consider closing:** Google Workspace integration for content import (pull from Google Docs/Sheets/Drive directly into Strata). Real-time collaboration (multiple editors). PPTX export as a fallback format for users who need to present in slide format.

---

### 2.4 ChatGPT / Claude (AI Chatbots Generating HTML)

**ChatGPT: 300M+ weekly users | Claude: Growing rapidly**

#### A. Creation Experience

- **How do you start?** Conversational prompt: "Create an interactive HTML document about our Q1 results with these sections..." Then iterate through conversation.
- **Time to shareable link:** 5-30 minutes to generate the HTML, but then you need to: (1) copy the code, (2) host it somewhere (Vercel, Netlify, GitHub Pages), (3) configure a domain or get a URL. This hosting step is a hard blocker for non-technical users. Claude Artifacts can be published with a shareable link, but the output is constrained to a single-page artifact, not a multi-section document.
- **AI capabilities:** Unlimited. The entire creation is AI-powered. GPT-4o/GPT-5 and Claude Opus 4.6 can generate sophisticated HTML/CSS/JS including animations, interactive elements, responsive design, and data visualizations. However, quality is inconsistent across iterations and there is no persistent editing environment (ChatGPT Canvas shows raw code; Claude Artifacts render live previews but have size/complexity limits).
- **Learning curve:** Medium-high. Requires prompt engineering skill to get good results. Technical knowledge needed for hosting. Iterating on complex documents through conversation is slow and error-prone.

#### B. Output Quality & Interactivity

- **Non-linear navigation:** Possible if prompted. Can generate sidebar navigation, anchor links, section jumping. But this needs to be explicitly requested and the quality varies.
- **Progressive disclosure:** Possible if prompted. Can generate expand/collapse sections, tabs, accordions. Again, requires explicit instruction and testing.
- **Animated timelines:** Possible if prompted. Can generate CSS/JS animations, even Framer Motion if React is used. Quality varies significantly.
- **Data-rich layouts:** Possible if prompted. Can generate charts (Chart.js, D3.js), metric cards, comparison tables. But the data needs to be provided — the AI doesn't structure your content into these layouts automatically based on content type.
- **Mobile viewing:** Depends entirely on the generated code. Can be responsive if prompted for responsive design, but this adds complexity and things break.
- **Self-navigating:** Depends on the prompt. Can be excellent if all interactive patterns are explicitly requested, but the burden is on the user to specify every interaction pattern.

#### C. Sharing & Distribution

- **URL sharing without login:** ChatGPT Canvas: No — code must be exported and hosted. Claude Artifacts: Yes — published artifacts get a public URL anyone can view. But artifacts are single-page, size-limited, and lack analytics.
- **Analytics:** None. Neither ChatGPT nor Claude provide viewer analytics for generated content. You would need to add Google Analytics or a tracking pixel to the raw HTML.
- **Embedding:** ChatGPT: No native embedding. Claude: Published artifacts can be embedded via iframe with allowed domains.
- **Viral loop:** Claude artifacts show "Made with Claude" which drives some awareness, but no structured viewer-to-creator conversion.

#### D. Pricing & Target User

| Service | Plan | Price |
|---------|------|-------|
| ChatGPT | Free | $0 (ads, limited) |
| ChatGPT | Go | $8/mo |
| ChatGPT | Plus | $20/mo |
| ChatGPT | Pro | $200/mo |
| Claude | Free | $0 (limited) |
| Claude | Pro | $20/mo |
| Claude | Max | $100-200/mo |

- **Who it's really for:** Technical users who can prompt-engineer and host HTML. Developers and power users building one-off interactive pages. Prototyping. Not for recurring business document workflows.
- **Where it falls short for VP Sales making a board deck:** A VP Sales cannot: (1) consistently produce high-quality interactive documents without prompt engineering expertise, (2) host the output without technical help, (3) iterate on the design without re-prompting from scratch, (4) track engagement, (5) maintain brand consistency across documents, (6) share with a clean URL. It's a power tool for builders, not a product for business users.

#### E. The Gap

- **What ChatGPT/Claude do BETTER than Strata:** Unlimited flexibility — can generate literally any HTML/CSS/JS pattern. No constraints on layout, interaction, or design. Can incorporate any JavaScript library. Cost-effective for one-off projects. Can generate content AND structure simultaneously.
- **What Strata does BETTER than ChatGPT/Claude:** Purpose-built workflow (upload/paste -> structured preview -> publish), consistent output quality, no technical skill required, persistent editing environment, analytics, shareable URLs out of the box, brand-consistent theming, mobile-optimized output guaranteed, iteration without starting over. Strata is a *product*; ChatGPT/Claude is a *tool*.
- **Feature gap Strata should consider closing:** AI content generation depth. ChatGPT/Claude can generate original strategic content, not just structure existing content. Strata could expand its AI from "structuring" to "augmenting" — suggesting additional sections, filling gaps in the narrative, generating executive summaries, adding supporting data points.

---

### 2.5 Notion (notion.so)

**$10B+ valuation | 100M+ users**

#### A. Creation Experience

- **How do you start?** Blank page, template, or AI-assisted. Notion AI (on Business/Enterprise plans) can generate text, create outlines, summarize content, and draft pages. No "upload a PDF and restructure" workflow — content creation is manual or AI-assisted within the block editor.
- **Time to shareable link:** 3-10 minutes to write content and publish to web. Notion Sites allows one-click web publishing with a notion.site subdomain.
- **AI capabilities:** Notion AI (GPT-5, Claude Opus 4.1, o3 under the hood) can generate text, rewrite content, summarize, translate, change tone, create outlines, and extract action items. New AI agents can automate database queries and task management. However, AI does not structure content into interactive visual layouts — it assists with writing, not design.
- **Learning curve:** Medium. The block editor is powerful but has a learning curve. The database/relation system is powerful but complex. Non-technical users often struggle with Notion's flexibility.

#### B. Output Quality & Interactivity

- **Non-linear navigation:** Partial. Published Notion pages have breadcrumb navigation and a table of contents (via /toc block). Linked databases and sub-pages create hierarchical navigation. But there is no persistent sidebar navigation on published Sites.
- **Progressive disclosure:** Yes, partially. Toggle blocks (expand/collapse) are a core Notion feature and work on published pages. Callout blocks add visual hierarchy. But these are basic text toggles — not the rich, animated progressive disclosure Strata offers.
- **Animated timelines:** No. Notion has a timeline database view (Gantt-style) but it is not animated, not visually polished, and is designed for project management, not storytelling.
- **Data-rich layouts:** Limited. Notion recently added basic pie charts and bar graphs for database views. For richer visualization, users rely on third-party embeds (Superchart, Chart.io). No native metric dashboard component.
- **Mobile viewing:** Functional. Notion's published pages are responsive (single-column reflow), but the output looks like a Notion page on mobile — utilitarian, not polished.
- **Self-navigating:** Moderate. Toggle blocks and linked pages allow exploration, but published Notion pages look like wiki pages, not polished strategy documents. The aesthetic communicates "internal tool," not "external deliverable."

#### C. Sharing & Distribution

- **URL sharing without login:** Yes. Notion Sites publishes pages to the web with a public URL. No viewer login required. Custom domains available on paid plans.
- **Analytics:** Minimal. Built-in analytics show total views and unique views over time. No data on who visited, time per section, scroll depth, or click behavior. Third-party tools (Notionlytics, NotionHits) provide more detail but require additional setup.
- **Embedding:** Yes. Published pages can be embedded via iframe. Notion embeds also work within Notion (embed other Notion pages, YouTube, Figma, etc.).
- **Viral loop:** Moderate. "Duplicate as template" feature lets viewers clone the page into their own workspace, which is a direct conversion path. "Made in Notion" attribution on published sites.

#### D. Pricing & Target User

| Plan | Price | Key Features |
|------|-------|-------------|
| Free | $0 | Basic features, limited blocks |
| Plus | $10/mo ($8/mo annual) | Unlimited blocks, file uploads |
| Business | $18/mo ($15/mo annual) | AI included, advanced permissions |
| Enterprise | Custom | SSO, SCIM, audit log, advanced security |

- **Who it's really for:** Teams managing knowledge, wikis, project documentation, internal processes. Product teams, engineering teams, operations. Content-first, collaboration-focused.
- **Where it falls short for VP Sales making a board deck:** Published Notion pages look like Notion pages, not polished deliverables. No visual design control — you get Notion's aesthetic or nothing. No animated interactions. No metric dashboards. No comparison table components. Sending a board member a Notion link communicates "here's our internal notes" not "here's our strategic vision." The output lacks the gravitas and visual authority that board-level communications require.

#### E. The Gap

- **What Notion does BETTER than Strata:** Full document workspace (Strata is publish-focused; Notion is workspace + publish). Database-backed content (relational data, filtered views, formulas). Team collaboration (real-time editing, comments, permissions). Massive template ecosystem. Notion AI for writing assistance across the full workspace.
- **What Strata does BETTER than Notion:** Visual output quality (Strata documents look like custom-designed web experiences; Notion pages look like Notion). Purpose-built interactive section types (animated timelines, metric dashboards, expandable card grids, tier comparison tables). AI structuring from uploaded content (PDF upload -> interactive document). Dark/light theme with polish. The output communicates "we invested in this" rather than "we wrote this in our project management tool."
- **Feature gap Strata should consider closing:** Notion's "Duplicate as template" feature is a brilliant viral mechanic — viewers can clone the document structure into their own workspace. Strata should consider a similar "Use this template" or "Remix this document" feature for viewers.

---

## 3. Feature Matrix

| Capability | Strata | Gamma | Canva | Google Slides | ChatGPT/Claude | Notion |
|---|---|---|---|---|---|---|
| **AI content structuring from upload** | Yes (core feature) | Yes (Import & Transform) | No | No | Manual prompting | No |
| **Non-linear navigation (sidebar)** | Yes | Partial (scrollable cards) | No | No | Possible if prompted | Partial (TOC block) |
| **Progressive disclosure (expand/collapse)** | Yes (animated) | Yes (toggles, nested cards) | No | No | Possible if prompted | Yes (basic toggles) |
| **Animated timelines** | Yes (native component) | Partial (smart layouts) | No | No | Possible if prompted | No |
| **Metric dashboards** | Yes (native component) | No (embed-only) | No | No | Possible if prompted | No (basic charts only) |
| **Comparison/tier tables** | Yes (native component) | No | No | No | Possible if prompted | Partial (database tables) |
| **Data visualization** | Yes (native) | Embedded (Power BI, etc.) | Flourish integration | Google Sheets charts | Possible (Chart.js, D3) | Third-party embeds |
| **Mobile-responsive output** | Yes | Yes | Problematic | No (fixed aspect ratio) | Varies | Yes (basic) |
| **Shareable URL (no viewer login)** | Yes | Yes | Yes | Yes (with caveats) | Claude Artifacts only | Yes |
| **Viewer analytics** | Planned | Yes (Pro) | Basic | No | No | Minimal |
| **Embedding** | Planned | Yes | Yes | Yes | Claude Artifacts only | Yes |
| **Third-party app embeds** | No | Yes (Figma, Airtable, etc.) | Limited | Limited | N/A | Yes (many) |
| **Dark/light theme** | Yes | Yes | No | No | Depends on code | Partial (Sites only) |
| **Custom branding** | Basic (attribution) | Yes (Pro+) | Yes (Brand Kit) | No | No | Partial |
| **Real-time collaboration** | No | Yes | Yes | Yes | No | Yes |
| **Export to PDF/PPTX** | No | Yes | Yes | Yes | Manual | Yes (PDF) |
| **Template library** | No | Extensive | Massive | Basic | N/A | Extensive |
| **Self-navigating (no presenter needed)** | Yes (core design goal) | Moderate | No | No | Varies | Moderate |
| **Learning curve** | Low | Low | Low-Medium | Very Low | Medium-High | Medium |
| **Price (individual)** | TBD | $0-15/mo | $0-15/mo | $0-9.20/mo | $0-200/mo | $0-18/mo |

---

## 4. Gap Analysis: Features Strata Should Consider

Prioritized by impact on the target user (VP Sales/Growth at Series B-C startups):

### Priority 1: Must-Have (Close within 3 months)

1. **Viewer Analytics** — Gamma and Storydoc have proven that "who viewed, which sections, how long" is a killer feature for sales and investor use cases. A VP Sales sending a board deck needs to know if the board actually read it, and which sections got attention. This is table-stakes for the target market.

2. **Custom Branding / Brand Kit** — Canva's Brand Kit and Gamma's custom branding (Pro) let teams enforce brand consistency. For Series B-C startups with established brand guidelines, the inability to set custom fonts, colors, and logos is a dealbreaker.

3. **Template Library** — Every competitor has templates. A curated set of templates for the target use cases (board deck, QBR, investor update, sales proposal, strategic plan) would dramatically reduce time-to-value for new users.

### Priority 2: Should-Have (Close within 6 months)

4. **Third-Party Embeds** — Gamma's ability to embed Figma, Airtable, YouTube, Loom, Typeform, and Calendly inside presentations makes them richer. Strata documents would benefit from embedding live data sources, video explainers, and interactive tools.

5. **Export to PDF** — Not every recipient will click a link. Board members, investors, and enterprise buyers often want a PDF. Strata should offer a high-quality PDF export as a fallback format, even if the interactive version is superior.

6. **AI Content Augmentation** — Move beyond structuring into generation. Suggest executive summaries, fill narrative gaps, generate supporting data visualizations, recommend additional sections based on document type. This is where ChatGPT/Claude's unlimited flexibility is a competitive pressure.

7. **Real-Time Collaboration** — Google Slides and Notion's multi-editor workflows are expected by teams. A VP Sales often builds a QBR with inputs from Product, Engineering, and Finance. At minimum, commenting and review workflows; ideally, multi-editor support.

### Priority 3: Nice-to-Have (Evaluate for roadmap)

8. **Remix / "Use This Template" for Viewers** — Notion's "Duplicate as template" is a viral growth mechanic. If a board member receives a Strata document and thinks "I want to make one like this," a one-click path to creation is a powerful PLG lever.

9. **Presentation Mode** — While Strata's core value is the *async, self-navigating* document, some users will want to present live. A presentation mode that walks through sections sequentially (like Gamma's present mode) would expand use cases.

10. **Google Workspace / Drive Integration** — For enterprise users, pulling content directly from Google Docs or Sheets into Strata would reduce friction. Lower priority because Strata's upload/paste flow already handles this content.

11. **API / Programmatic Generation** — Gamma's Generate API (GA since January 2026) allows programmatic content creation at scale. This is relevant for enterprises generating many documents, but premature for Strata's current stage.

---

## 5. "Why Strata?" Talking Points

When someone asks "Why can't I just use Gamma / ChatGPT / Google Slides?"

1. **"Strata builds documents that speak for themselves."** Every other tool assumes a presenter will walk the audience through the content. Strata builds interactive documents designed to be explored independently — with non-linear navigation, progressive disclosure, and section-level depth. Your board member explores what matters to them, not what your slide order dictates.

2. **"Upload your content, get an interactive document — not another slide deck."** Strata takes your existing PDF, doc, or rough content and AI-structures it into purpose-built interactive components: animated timelines, metric dashboards, comparison tables, expandable card grids. Gamma gives you cards. Canva gives you slides. Strata gives you a *strategy document*.

3. **"Slides are a 1990s format for a 2026 world."** Google Slides and Canva produce linear, one-direction-at-a-time content. Strategy documents are not linear — they have hierarchies, detail levels, and audiences with different interests. Strata's interactive format respects how executives actually consume information: scan, drill down, compare, skip.

4. **"ChatGPT can make HTML, but it can't make a product."** Yes, you can prompt ChatGPT to generate an interactive HTML page. But you'll need prompt engineering skill, manual hosting, no analytics, no persistent editing, inconsistent quality, and zero brand consistency. Strata is the *product* that wraps all of that into a one-click workflow.

5. **"Notion is where you write. Strata is where you publish."** Notion is a fantastic workspace, but a published Notion page looks like a Notion page. It communicates "here are our internal notes," not "here is our strategic vision." Strata produces custom-designed interactive experiences that communicate investment and authority.

6. **"Every section type is purpose-built for strategy content."** Gamma has generic cards. Canva has generic slides. Strata has *metric dashboards* for KPIs, *animated timelines* for roadmaps, *tier comparison tables* for competitive positioning, *expandable card grids* for team or feature overviews. The section types match how strategy content is actually structured.

7. **"Your board deck should work as hard as you do."** With viewer analytics (coming), you'll know who read your board deck, which sections they spent time on, and what they skipped. Google Slides gives you zero data. Canva gives you basic page views. Strata gives you section-level engagement intelligence.

---

## Sources

- [Gamma Review 2026 (Max Productive)](https://max-productive.ai/ai-tools/gamma/)
- [Gamma Pricing](https://gamma.app/pricing)
- [Gamma Help Center — Analytics](https://help.gamma.app/en/articles/11047329-how-do-i-track-my-gamma-s-performance-using-analytics)
- [Gamma AI Explained (SketchBubble)](https://www.sketchbubble.com/blog/gamma-explained-a-comprehensive-deep-dive-into-the-ai-powered-presentation-platform/)
- [Gamma Tips & Tricks](https://gamma.app/docs/Gamma-Tips-Tricks-hldzbg304kbhnr1)
- [Chronicle vs Gamma Alternative](https://chroniclehq.com/gamma-ai-alternative)
- [Canva Presentations](https://www.canva.com/presentations/)
- [Canva Pricing](https://www.canva.com/en/pricing/)
- [Canva Live](https://www.canva.com/features/canva-live/)
- [Canva What's New February 2026](https://www.canva.com/newsroom/news/whats-new-february-2026/)
- [Canva Public View Link](https://www.canva.com/help/sharing-your-design-as-a-public-view-link/)
- [Canva Mobile Responsive Issues](https://www.canva.com/help/responsive-website-issues/)
- [Google Workspace Pricing](https://workspace.google.com/pricing)
- [Google Gemini in Workspace (March 2026)](https://blog.google/products-and-platforms/products/workspace/gemini-workspace-updates-march-2026/)
- [Google Slides Advantages/Disadvantages](https://www.magicslides.app/blog/advantages-disadvantages-google-slides)
- [Google Slides Capterra Reviews](https://www.capterra.com/p/178686/Google-Slides/reviews/)
- [ChatGPT Pricing Plans](https://chatgpt.com/pricing/)
- [Claude Artifacts Help Center](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- [Claude Artifacts Publishing](https://support.claude.com/en/articles/9547008-publishing-and-sharing-artifacts)
- [Claude Artifacts 2026 Limitations](https://p0stman.com/guides/claude-artifacts-limitations)
- [Claude Pricing](https://claude.com/pricing)
- [ChatGPT Canvas vs Claude Artifacts](https://xsoneconsultants.com/blog/chatgpt-canvas-vs-claude-artifacts/)
- [Notion Pricing 2026](https://userjot.com/blog/notion-pricing-2025-plans-ai-costs-explained)
- [Notion AI Review 2026](https://max-productive.ai/ai-tools/notion-ai/)
- [Notion Sites Publishing](https://www.notion.com/help/public-pages-and-web-publishing)
- [Notion Page Analytics](https://www.notion.com/help/page-analytics)
- [Notion Data Visualization Limitations](https://www.notionapps.com/blog/11-no-code-data-visualization-tools-for-notion)
- [Storydoc Pricing and Features](https://www.storydoc.com/pricing)
- [Storydoc G2 Reviews](https://www.g2.com/products/storydoc/reviews)
- [Zeck — Interactive Board Decks](https://www.zeck.app/)
