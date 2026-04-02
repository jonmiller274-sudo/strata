// ===== Artifact Data Model =====
// Each artifact is a structured document composed of ordered sections.
// Sections are typed — each type has its own content shape.

export type PlanTier = "free" | "pro" | "team" | "enterprise";

export interface Artifact {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author_name?: string;
  author_id?: string;
  plan_tier: PlanTier;
  theme: "dark" | "light";
  layout_mode?: "continuous" | "beats";
  nav_style?: "sidebar" | "progress-bar";
  branding?: ArtifactBranding;
  sections: Section[];
  is_published: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ArtifactBranding {
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  palette?: {
    accent1?: string;
    accent2?: string;
    accent3?: string;
    accent4?: string;
    accent5?: string;
  };
}

// ===== Section Types =====

export type SectionType =
  | "rich-text"
  | "expandable-cards"
  | "timeline"
  | "tier-table"
  | "metric-dashboard"
  | "data-viz"
  | "hub-mockup"
  | "guided-journey";

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  "rich-text": "Rich Text",
  "expandable-cards": "Cards",
  timeline: "Timeline",
  "tier-table": "Tier Table",
  "metric-dashboard": "Metrics",
  "data-viz": "Chart",
  "hub-mockup": "Hub",
  "guided-journey": "Journey",
};

export type Section =
  | RichTextSection
  | ExpandableCardGridSection
  | TimelineSection
  | TierTableSection
  | MetricDashboardSection
  | DataVizSection
  | HubMockupSection
  | GuidedJourneySection;

// Base fields shared by all sections
interface SectionBase {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string; // Optional reference image (uploaded screenshot)
}

// ===== 1. Rich Text with Collapsible Detail =====
export interface RichTextSection extends SectionBase {
  type: "rich-text";
  content: {
    summary: string; // Visible by default (markdown)
    detail?: string; // Revealed on expand (markdown)
    callout?: {
      type: "insight" | "warning" | "quote";
      text: string;
    };
    tag?: {
      label: string;
      color?: string; // hex
    };
  };
}

// ===== 2. Expandable Card Grid =====
export interface ExpandableCardGridSection extends SectionBase {
  type: "expandable-cards";
  content: {
    columns?: 2 | 3 | 4;
    cards: ExpandableCard[];
  };
}

export interface ExpandableCard {
  id: string;
  title: string;
  icon?: string; // Lucide icon name
  summary: string;
  detail?: string; // Revealed on expand
  tags?: string[];
  metric?: {
    value: string;
    label: string;
  };
}

// ===== 3. Animated Timeline =====
export interface TimelineSection extends SectionBase {
  type: "timeline";
  content: {
    orientation?: "vertical" | "horizontal";
    steps: TimelineStep[];
    evidence?: {
      text: string;
      border_color?: string; // hex, defaults to coral/danger
    };
    pivot?: string; // Bold closing question/statement
  };
}

export interface TimelineStep {
  id: string;
  label: string; // e.g., "Day 1", "Week 2", "Q1 2026"
  title: string;
  description: string;
  icon?: string;
  status?: "completed" | "current" | "upcoming";
}

// ===== 4. Tier/Comparison Table =====
export interface TierTableSection extends SectionBase {
  type: "tier-table";
  content: {
    mode?: "pricing" | "comparison"; // defaults to "pricing"
    highlight_column?: number; // 0-indexed, which column to highlight
    columns: TierColumn[];
    kicker?: string; // Closing statement (comparison mode)
  };
}

export interface TierColumn {
  name: string;
  price?: string;
  price_period?: string;
  description?: string;
  cta?: string;
  features: TierFeature[];
  is_highlighted?: boolean;
}

export interface TierFeature {
  name: string;
  included: boolean | string; // boolean for checkmark, string for custom value
}

// ===== 5. Metric Dashboard =====
export interface MetricDashboardSection extends SectionBase {
  type: "metric-dashboard";
  content: {
    metrics: MetricCard[];
  };
}

export interface MetricCard {
  id: string;
  label: string;
  value: string; // Display value (e.g., "$1M", "900", "20-24 months")
  numeric_value?: number; // For animated counting
  prefix?: string; // e.g., "$"
  suffix?: string; // e.g., "%", " months"
  change?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  description?: string;
}

// ===== 6. Data Visualization =====
export interface DataVizSection extends SectionBase {
  type: "data-viz";
  content: {
    chart_type: "bar" | "line" | "pie" | "funnel" | "custom-svg" | "staircase" | "layers";
    data: Array<Record<string, string | number>>;
    x_key?: string;
    y_key?: string;
    description?: string;
    callout?: string; // Text box below chart (used by layers)
  };
}

// ===== 7. Hub/Product Mockup =====
export interface HubMockupLayer {
  label: string; // "Company", "Platform", "Products", etc.
  nodes: HubNode[];
}

export interface HubMockupSection extends SectionBase {
  type: "hub-mockup";
  content: {
    center: HubNode;
    nodes: HubNode[];
    connections?: HubConnection[];
    description?: string;
    layers?: HubMockupLayer[]; // When present, render as layered hierarchy instead of flat grid
  };
}

export interface HubNode {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  color?: string;
}

export interface HubConnection {
  from: string; // node id
  to: string; // node id
  label?: string;
}

// ===== 8. Guided Journey (Interactive Timeline + Counters) =====
export interface GuidedJourneySection extends SectionBase {
  type: "guided-journey";
  content: {
    phases: JourneyPhase[];
    counters: JourneyCounter[];
    events: JourneyEvent[];
    autoplay?: boolean;
    interval_ms?: number; // default 3000
  };
}

export interface JourneyPhase {
  id: string;
  name: string;
  color: string; // hex
  day_range: string; // "Days 0–14"
}

export interface JourneyCounter {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string; // Lucide icon name
  prefix?: string; // "$"
  suffix?: string;
  start_value: number;
  color?: string; // hex
}

export interface JourneyEvent {
  id: string;
  day: number;
  label: string;
  title: string;
  description: string;
  phase_id: string;
  personas?: string[];
  product?: string;
  trigger?: {
    label: string;
    text: string;
  };
  spend_delta?: string; // "+$120"
  counter_values: Record<string, number>; // counter_id → value
}

// ===== Template Types =====

export type TemplateType =
  | "platform-vision"
  | "customer-journey"
  | "gtm-strategy"
  | "product-roadmap";

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  "platform-vision": "Platform Vision",
  "customer-journey": "Customer Journey",
  "gtm-strategy": "Go-to-Market Strategy",
  "product-roadmap": "Product Roadmap",
};

export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  "platform-vision":
    "Show how all your products and capabilities tie together into a unified platform.",
  "customer-journey":
    "Walk through the experience from first touch to fully embedded, day by day.",
  "gtm-strategy":
    "Map out how you reach, convert, and expand with your target customers.",
  "product-roadmap":
    "Communicate what you're building, when, and why — across quarters and teams.",
};
