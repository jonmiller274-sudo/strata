import type { Metadata } from "next";
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import type { Artifact } from "@/types/artifact";

export const metadata: Metadata = {
  title: "Strata Demo — Interactive Strategy Artifact",
  description:
    "See what a Strata artifact looks like. This demo showcases all 7 section types — built with Strata, pitching Strata.",
  openGraph: {
    title: "Strata Demo — Interactive Strategy Artifact",
    description:
      "See what a Strata artifact looks like. This demo showcases all 7 section types — built with Strata, pitching Strata.",
  },
};

const DEMO_ARTIFACT: Artifact = {
  id: "demo",
  slug: "strata-demo",
  title: "Strata",
  subtitle: "Where strategy gets built before it becomes a slide deck, a video, or a PDF.",
  author_name: "Strata Team",
  theme: "dark",
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sections: [
    {
      id: "format-crisis",
      type: "rich-text",
      title: "The Format Crisis",
      subtitle: "Why every strategy document ends in the same argument",
      content: {
        summary:
          "A CEO asks two senior leaders to explain how the company's strategy ties together. Both independently open AI coding tools and build interactive HTML files — not slides, not docs, not dashboards. Something new.\n\nThe results are stunning. But then the format debate starts:\n\n\"Make this a video\" — the CEO wants to text it to investors.\n\"I'll convert it to PDF\" — the VP wants a polished deliverable.\n\"It should stay interactive\" — the builder knows the format is right.\n\nNobody can agree on what to call it or how to deliver it. The artifact is powerful. The delivery infrastructure doesn't exist.",
        detail:
          "This isn't a hypothetical. It happened. Two senior executives at a growth-stage tech company independently built interactive strategy documents on the same day, for the same CEO brief, without consulting each other. Neither considered PowerPoint, Google Slides, or Gamma.\n\nThe job — synthesizing complex, multi-dimensional strategy into something a C-suite audience can navigate on their own — is one that existing tools don't even attempt.\n\nSlides compress too much. Documents are too linear. Dashboards are too operational. Custom HTML is too much work to deliver confidently.\n\nStrata exists because this artifact class has no home.",
        callout: {
          type: "insight",
          text: "The format debate itself is the product opportunity. When nobody can agree whether it should be a video, PDF, or link — the answer is: all three, from the same source.",
        },
      },
    },
    {
      id: "building-blocks",
      type: "expandable-cards",
      title: "The 8 Building Blocks",
      subtitle: "Every strategic artifact is composed from these opinionated section types",
      content: {
        columns: 2,
        cards: [
          {
            id: "rich-text",
            title: "Rich Text + Progressive Disclosure",
            summary: "Executive summary visible by default. Supporting evidence revealed on expand.",
            detail: "The core UX pattern that makes complex strategy consumable. Readers get the headline immediately. They choose when to go deeper. No more 60-slide decks where the insight is buried on slide 47.",
            tags: ["Foundation"],
          },
          {
            id: "cards",
            title: "Expandable Card Grids",
            summary: "Personas, case studies, competitor profiles — each as a card with click-to-expand detail.",
            detail: "Cards show the summary view by default. Click to reveal supporting data, quotes, or evidence. Perfect for displaying 4-8 items that each deserve their own space without overwhelming the reader.",
            tags: ["Visual"],
          },
          {
            id: "timelines",
            title: "Animated Timelines",
            summary: "Customer journeys, roadmaps, 30/60/90 plans — step by step with motion.",
            detail: "Steps animate into view as the reader scrolls, creating a sense of progression and narrative. Each step has a label, title, and description. Status indicators show completed, current, and upcoming.",
            tags: ["Narrative"],
          },
          {
            id: "tiers",
            title: "Tier & Comparison Tables",
            summary: "Pricing, feature matrices, plan comparisons — clean, responsive, highlighted.",
            detail: "One column can be highlighted as 'Recommended'. Features show checkmarks, X marks, or custom values. Responsive layout adapts from side-by-side on desktop to stacked on mobile.",
            tags: ["Decision"],
          },
          {
            id: "metrics",
            title: "Metric Dashboards",
            summary: "KPI cards with animated counters that count up as they scroll into view.",
            detail: "Numbers animate from 0 to their target value using an eased cubic function. Each metric can show a trend indicator (up/down/neutral) and a description. Tabular number formatting keeps everything aligned.",
            tags: ["Data"],
          },
          {
            id: "dataviz",
            title: "Data Visualizations",
            summary: "Bar charts, funnel charts, and custom SVG diagrams — animated on scroll.",
            detail: "Built-in chart types handle the most common strategy visuals: bar charts for comparisons, funnel charts for conversion flows, with extensibility for custom SVG when needed.",
            tags: ["Data"],
          },
          {
            id: "hub",
            title: "Hub & Product Mockups",
            summary: "Interconnected diagrams showing how products, features, or teams connect.",
            detail: "A central node surrounded by connected nodes, with labeled relationships between them. Perfect for platform visions, org structures, or product suite overviews.",
            tags: ["Architecture"],
          },
          {
            id: "nav",
            title: "Navigation Sidebar",
            summary: "Non-linear browsing with scroll-spy, progress indicators, and section jumping.",
            detail: "The sidebar tracks reading progress automatically using IntersectionObserver. Readers can jump to any section non-linearly. The progress bar shows how far through the document they are.",
            tags: ["Navigation"],
          },
        ],
      },
    },
    {
      id: "customer-journey",
      type: "timeline",
      title: "The Customer Journey",
      subtitle: "From format crisis to strategic superpower",
      content: {
        steps: [
          {
            id: "discover",
            label: "Day 0",
            title: "The Format Crisis",
            description: "A CEO asks you to explain something complex. You open Claude Code and build an interactive HTML file. It's amazing. But you can't send it confidently — PDF? Video? Link? Nobody knows.",
            status: "completed",
          },
          {
            id: "find-strata",
            label: "Day 1",
            title: "Discover Strata",
            description: "You see a colleague's interactive strategy document with 'Made with Strata' at the bottom. You click 'Create your own.' You paste your content, pick a template, and the AI structures it in seconds.",
            status: "completed",
          },
          {
            id: "first-artifact",
            label: "Day 2",
            title: "Ship Your First Artifact",
            description: "You publish a shareable link. Your CEO opens it on their phone — instant load, sidebar navigation, expandable sections. They forward it to three board members. No PDF conversion needed.",
            status: "current",
          },
          {
            id: "check-stats",
            label: "Week 1",
            title: "Check Your Stats",
            description: "You see who opened it, which sections they spent time on, and when they forwarded it. Your CEO spent 4 minutes on the customer journey section. The CFO skipped straight to pricing. You learn what lands.",
            status: "upcoming",
          },
          {
            id: "team-adopts",
            label: "Month 1",
            title: "Your Team Adopts",
            description: "Your VP Sales starts using Strata for quarterly business reviews. The QBR link replaces the 40-slide deck. Clients engage with it asynchronously. Win rates tick up because the proposal works when the sales rep isn't in the room.",
            status: "upcoming",
          },
          {
            id: "strategic-layer",
            label: "Month 3",
            title: "Strata Becomes Your Strategic Layer",
            description: "Board decks, product roadmaps, investor updates, GTM strategies — all built in Strata, all shareable as links, all tracked. You export video for the board meeting and PDF for the filing cabinet. Same source artifact.",
            status: "upcoming",
          },
        ],
      },
    },
    {
      id: "how-it-connects",
      type: "hub-mockup",
      title: "How It All Connects",
      subtitle: "Strata is where strategy gets built — everything else is a delivery format",
      content: {
        center: {
          id: "strata-core",
          label: "Strata Artifact",
          description: "The single source of truth for your strategy — interactive, structured, navigable",
          color: "#6366f1",
        },
        nodes: [
          {
            id: "link",
            label: "Shareable Link",
            description: "Instant load, no login, any device",
            color: "#34d399",
          },
          {
            id: "video",
            label: "Video Export",
            description: "Structured video with chapter markers",
            color: "#f59e0b",
          },
          {
            id: "pdf",
            label: "PDF Export",
            description: "Polished layout, not a static dump",
            color: "#f87171",
          },
          {
            id: "analytics",
            label: "Viewer Analytics",
            description: "Who opened, which sections, time spent",
            color: "#8b5cf6",
          },
          {
            id: "ai",
            label: "AI Structuring",
            description: "Paste content, get structured artifact",
            color: "#38bdf8",
          },
          {
            id: "templates",
            label: "Templates",
            description: "Board Deck, QBR, Roadmap, GTM, Vision",
            color: "#ec4899",
          },
        ],
        connections: [
          { from: "strata-core", to: "link", label: "Publish" },
          { from: "strata-core", to: "video", label: "Export" },
          { from: "strata-core", to: "pdf", label: "Export" },
          { from: "strata-core", to: "analytics", label: "Track" },
          { from: "ai", to: "strata-core", label: "Generate" },
          { from: "templates", to: "strata-core", label: "Scaffold" },
        ],
        description: "Build once in Strata. Deliver as a link for async consumption, export to video for investor emails, or generate a PDF for the board package. Same artifact, every format.",
      },
    },
    {
      id: "pricing",
      type: "tier-table",
      title: "Pricing",
      subtitle: "No free tier. 14-day trial with full functionality.",
      content: {
        columns: [
          {
            name: "Solo",
            price: "$79",
            price_period: "month",
            description: "For individual strategists and founders",
            cta: "Start free trial",
            features: [
              { name: "1 creator seat", included: true },
              { name: "Up to 10 active artifacts", included: true },
              { name: "All 8 section types", included: true },
              { name: "Viewer analytics", included: true },
              { name: "Video + PDF export", included: true },
              { name: "Basic brand customization", included: true },
              { name: "Team collaboration", included: false },
              { name: "Advanced analytics", included: false },
            ],
          },
          {
            name: "Team",
            price: "$199",
            price_period: "month",
            description: "For teams building strategy together",
            cta: "Start free trial",
            is_highlighted: true,
            features: [
              { name: "5 creator seats", included: true },
              { name: "Unlimited active artifacts", included: true },
              { name: "All 8 section types", included: true },
              { name: "Advanced viewer analytics", included: true },
              { name: "Priority video + PDF export", included: true },
              { name: "Full brand kit", included: true },
              { name: "Team collaboration", included: true },
              { name: "Co-authorship with AI mediation", included: "Soon" },
            ],
          },
        ],
      },
    },
    {
      id: "the-business",
      type: "metric-dashboard",
      title: "The Business",
      subtitle: "The math behind $1M ARR as a bootstrapped, no-employee SaaS",
      content: {
        metrics: [
          {
            id: "arr-target",
            label: "ARR Target",
            value: "$1M",
            prefix: "$",
            numeric_value: 1000000,
            suffix: "",
            description: "Bootstrapped. No investors. No employees. PLG distribution.",
          },
          {
            id: "accounts",
            label: "Paying Accounts Needed",
            value: "900",
            numeric_value: 900,
            description: "At 60% Team ($199) / 40% Solo ($79) mix",
          },
          {
            id: "timeline",
            label: "Timeline to $1M",
            value: "20-24 months",
            description: "From first line of code to $83K MRR",
          },
          {
            id: "margin",
            label: "SaaS Margin",
            value: "85%+",
            description: "Infrastructure costs are minimal — Vercel + Supabase + AI API calls",
          },
        ],
      },
    },
    {
      id: "why-now",
      type: "rich-text",
      title: "Why Now",
      subtitle: "Three forces converging to create this category",
      content: {
        summary:
          "AI coding tools have collapsed the skill barrier between business leaders and technical output. For the first time, a CBO can build an interactive HTML artifact in a day. But the delivery infrastructure hasn't caught up.\n\nThe gap between what executives can BUILD and what they can confidently SEND is the entire product opportunity.\n\nNo existing tool — not Gamma, not Notion, not PowerPoint — even attempts to solve this job. They optimize for creation speed, not delivery trust. Strata optimizes for both.",
        detail:
          "Three forces are converging:\n\n1. AI coding tools (Claude Code, Cursor, etc.) mean non-technical executives can build sophisticated interactive documents — but they can't deliver them.\n\n2. Remote/async work means more strategy is consumed without a presenter. The document must be self-navigating and self-convincing.\n\n3. The rise of the 'strategic artifact' as a distinct category — not a deck, not a doc, not a dashboard. Something new that combines depth with accessibility.\n\nGamma won't build this because their 70M users want fast first drafts, not deep strategy artifacts. Notion won't build this because their architecture is block-based, not narrative-based. Claude Code won't productize the delivery layer because they're a development tool, not a communication platform.\n\nThe window is open. The job exists. The category is forming.",
        callout: {
          type: "quote",
          text: "\"Strata is where strategy gets built before it becomes a slide deck, a video, or a PDF.\"",
        },
      },
    },
  ],
};

export default function DemoPage() {
  return <ArtifactViewer artifact={DEMO_ARTIFACT} />;
}
