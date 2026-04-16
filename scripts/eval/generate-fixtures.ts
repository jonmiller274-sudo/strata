/**
 * generate-fixtures.ts — Content Generator for Visual Eval
 *
 * Creates synthetic test artifacts that exercise all 11 section types
 * across 5 content profiles. Outputs JSON fixture files that the
 * eval test route renders.
 *
 * Usage:
 *   npx tsx scripts/eval/generate-fixtures.ts
 *   npx tsx scripts/eval/generate-fixtures.ts --profile overflow
 *   npx tsx scripts/eval/generate-fixtures.ts --section expandable-cards
 *
 * Output: scripts/eval/fixtures/<profile>-<section-type>.json
 */

import * as fs from "fs";
import * as path from "path";
import { CONTENT_PROFILES, getItemCount, getTextLength, type ContentProfile } from "./content-profiles";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

// ---------------------------------------------------------------------------
// Word generators — deterministic fake content
// ---------------------------------------------------------------------------

const BUSINESS_WORDS = [
  "revenue", "growth", "pipeline", "retention", "churn", "ARR", "MRR",
  "conversion", "engagement", "activation", "expansion", "enterprise",
  "strategic", "operational", "quarterly", "performance", "benchmark",
  "opportunity", "competitive", "differentiation", "positioning", "market",
  "customer", "acquisition", "lifecycle", "onboarding", "integration",
];

function words(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(BUSINESS_WORDS[i % BUSINESS_WORDS.length]);
  }
  return result.join(" ");
}

function sentence(wordCount: number): string {
  const w = words(wordCount);
  return w.charAt(0).toUpperCase() + w.slice(1) + ".";
}

function paragraph(wordCount: number): string {
  const sentences: string[] = [];
  let remaining = wordCount;
  while (remaining > 0) {
    const len = Math.min(remaining, 8 + (sentences.length % 5) * 2);
    sentences.push(sentence(len));
    remaining -= len;
  }
  return sentences.join(" ");
}

function title(wordCount: number): string {
  return words(wordCount).split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function kebab(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Section generators — one per section type
// ---------------------------------------------------------------------------

function generateRichText(profile: ContentProfile, idx: number) {
  const len = getTextLength(profile);
  return {
    id: `rich-text-${profile.id}-${idx}`,
    type: "rich-text" as const,
    title: title(len.title),
    content: {
      summary: paragraph(len.summary),
      ...(profile.includeOptionals && len.detail > 0
        ? { detail: paragraph(len.detail) }
        : {}),
      ...(profile.includeOptionals
        ? {
            callout: {
              type: "insight" as const,
              text: sentence(Math.max(8, Math.floor(len.summary / 3))),
            },
            tag: { label: "Strategy", color: "#1e3a5f" },
          }
        : {}),
    },
  };
}

function generateExpandableCards(profile: ContentProfile, idx: number) {
  const count = getItemCount(profile);
  const len = getTextLength(profile);
  const icons = ["target", "users", "trending-up", "shield", "globe", "zap", "bar-chart", "layers"];

  return {
    id: `expandable-cards-${profile.id}-${idx}`,
    type: "expandable-cards" as const,
    title: title(len.title),
    content: {
      columns: (count <= 2 ? 2 : count <= 4 ? 2 : 3) as 2 | 3,
      cards: Array.from({ length: count }, (_, i) => ({
        id: `card-${i}`,
        title: title(Math.min(len.title, 6)),
        icon: icons[i % icons.length],
        summary: paragraph(Math.floor(len.summary / 2)),
        ...(profile.includeOptionals
          ? { detail: paragraph(Math.floor(len.detail / 2)) }
          : {}),
        ...(profile.includeOptionals
          ? {
              tags: [`Tag ${i + 1}`, "Category"],
              metric: {
                value: profile.extremeValues ? "$12,345,678" : `$${(i + 1) * 25}K`,
                label: "Revenue impact",
              },
            }
          : {}),
      })),
      ...(profile.includeOptionals
        ? { callout: { type: "insight" as const, text: sentence(12) } }
        : {}),
    },
  };
}

function generateTimeline(profile: ContentProfile, idx: number) {
  const count = getItemCount(profile);
  const len = getTextLength(profile);
  const statuses: Array<"completed" | "current" | "upcoming"> = ["completed", "completed", "current", "upcoming"];

  return {
    id: `timeline-${profile.id}-${idx}`,
    type: "timeline" as const,
    title: title(len.title),
    content: {
      steps: Array.from({ length: count }, (_, i) => ({
        id: `step-${i}`,
        label: `Q${(i % 4) + 1} 2026`,
        title: title(Math.min(len.title, 5)),
        description: paragraph(Math.floor(len.summary / 3)),
        status: statuses[Math.min(i, statuses.length - 1)],
      })),
      ...(profile.includeOptionals
        ? {
            evidence: { text: sentence(15), border_color: "#f87171" },
            pivot: sentence(10),
          }
        : {}),
    },
  };
}

function generateTierTable(profile: ContentProfile, idx: number) {
  const colCount = Math.max(2, Math.min(getItemCount(profile), 4));
  const len = getTextLength(profile);
  const featureCount = profile.itemCount === "few" ? 3 : profile.itemCount === "normal" ? 6 : 10;

  return {
    id: `tier-table-${profile.id}-${idx}`,
    type: "tier-table" as const,
    title: title(len.title),
    content: {
      mode: "comparison" as const,
      highlight_column: 1,
      columns: Array.from({ length: colCount }, (_, i) => ({
        name: ["Starter", "Growth", "Enterprise", "Custom"][i] || `Tier ${i + 1}`,
        price: profile.extremeValues ? "$99,999/mo" : `$${(i + 1) * 49}/mo`,
        description: sentence(Math.floor(len.summary / 5)),
        is_highlighted: i === 1,
        features: Array.from({ length: featureCount }, (_, j) => ({
          name: `Feature ${j + 1}: ${words(3)}`,
          included: j <= i + 1 ? true : (i === colCount - 1 ? "Custom" : false),
        })),
      })),
      ...(profile.includeOptionals ? { kicker: sentence(12) } : {}),
    },
  };
}

function generateMetricDashboard(profile: ContentProfile, idx: number) {
  const count = getItemCount(profile);
  const len = getTextLength(profile);

  return {
    id: `metric-dashboard-${profile.id}-${idx}`,
    type: "metric-dashboard" as const,
    title: title(len.title),
    content: {
      metrics: Array.from({ length: count }, (_, i) => ({
        id: `metric-${i}`,
        label: title(3),
        value: profile.extremeValues
          ? `$${(i + 1) * 1234567}`
          : `${(i + 1) * 25}%`,
        numeric_value: profile.extremeValues ? (i + 1) * 1234567 : (i + 1) * 25,
        ...(i === 0 ? { prefix: "$" } : {}),
        ...(i > 0 ? { suffix: "%" } : {}),
        change: {
          direction: (i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "neutral") as "up" | "down" | "neutral",
          value: `${(i + 1) * 3}%`,
        },
        ...(profile.includeOptionals
          ? { description: sentence(Math.floor(len.summary / 5)) }
          : {}),
        highlight: i === 0,
      })),
    },
  };
}

function generateDataViz(profile: ContentProfile, idx: number) {
  const count = getItemCount(profile);
  const len = getTextLength(profile);
  const chartTypes = ["bar", "funnel", "staircase", "line"] as const;

  return {
    id: `data-viz-${profile.id}-${idx}`,
    type: "data-viz" as const,
    title: title(len.title),
    content: {
      chart_type: chartTypes[idx % chartTypes.length],
      x_key: "label",
      y_key: "value",
      data: Array.from({ length: count }, (_, i) => ({
        label: `Category ${i + 1}`,
        value: profile.extremeValues ? (i + 1) * 9999999 : (i + 1) * 150,
      })),
      ...(profile.includeOptionals
        ? { description: paragraph(Math.floor(len.summary / 2)) }
        : {}),
    },
  };
}

function generateHubMockup(profile: ContentProfile, idx: number) {
  const count = getItemCount(profile);
  const len = getTextLength(profile);
  const colors = ["#1e3a5f", "#0d9488", "#d97706", "#7c3aed", "#dc2626", "#059669", "#6366f1", "#f59e0b"];

  return {
    id: `hub-mockup-${profile.id}-${idx}`,
    type: "hub-mockup" as const,
    title: title(len.title),
    content: {
      center: {
        id: "center",
        label: title(3),
        icon: "layers",
        description: sentence(8),
      },
      nodes: Array.from({ length: count }, (_, i) => ({
        id: `node-${i}`,
        label: title(Math.min(len.title, 4)),
        icon: ["globe", "users", "database", "shield", "zap", "bar-chart", "target", "cpu"][i % 8],
        description: sentence(Math.floor(len.summary / 5)),
        color: colors[i % colors.length],
      })),
      connections: Array.from({ length: count }, (_, i) => ({
        from: "center",
        to: `node-${i}`,
        label: profile.includeOptionals ? words(3) : undefined,
      })),
      ...(profile.includeOptionals
        ? { description: paragraph(Math.floor(len.summary / 2)) }
        : {}),
    },
  };
}

function generateGuidedJourney(profile: ContentProfile, idx: number) {
  const eventCount = getItemCount(profile);
  const len = getTextLength(profile);

  const phases = [
    { id: "phase-1", name: "Foundation", color: "#1e3a5f", day_range: "Days 1-30" },
    { id: "phase-2", name: "Expansion", color: "#0d9488", day_range: "Days 31-60" },
    { id: "phase-3", name: "Scale", color: "#d97706", day_range: "Days 61-90" },
  ];

  const counters = [
    { id: "headcount", label: "Team Size", sublabel: "target: 12", icon: "users", start_value: 0, color: "#1e3a5f" },
    { id: "revenue", label: "Pipeline", prefix: "$", suffix: "K", icon: "trending-up", start_value: 0, color: "#0d9488" },
  ];

  return {
    id: `guided-journey-${profile.id}-${idx}`,
    type: "guided-journey" as const,
    title: title(len.title),
    content: {
      phases,
      counters,
      interval_ms: 3000,
      events: Array.from({ length: eventCount }, (_, i) => ({
        id: `event-${i}`,
        day: (i + 1) * Math.floor(90 / eventCount),
        label: `Day ${(i + 1) * Math.floor(90 / eventCount)}`,
        title: title(Math.min(len.title, 5)),
        description: paragraph(Math.floor(len.summary / 3)),
        phase_id: phases[Math.floor(i / Math.ceil(eventCount / 3)) % phases.length].id,
        counter_values: {
          headcount: i + 1,
          revenue: (i + 1) * (profile.extremeValues ? 999 : 50),
        },
        ...(profile.includeOptionals
          ? { trigger: { label: "Key Milestone", text: sentence(10) } }
          : {}),
      })),
    },
  };
}

function generateComparisonMatrix(profile: ContentProfile, idx: number) {
  const colCount = Math.max(2, Math.min(getItemCount(profile), 5));
  const rowCount = profile.itemCount === "few" ? 3 : profile.itemCount === "normal" ? 5 : 8;
  const len = getTextLength(profile);

  return {
    id: `comparison-matrix-${profile.id}-${idx}`,
    type: "comparison-matrix" as const,
    title: title(len.title),
    content: {
      columns: Array.from({ length: colCount }, (_, i) => ({
        id: `col-${i}`,
        label: i === 0 ? "Us" : `Competitor ${i}`,
        highlight: i === 0,
      })),
      rows: Array.from({ length: rowCount }, (_, j) => ({
        id: `row-${j}`,
        label: title(3),
        description: profile.includeOptionals ? sentence(8) : undefined,
        values: Array.from({ length: colCount }, (_, i) =>
          i === 0 ? true : j < rowCount / 2 ? false : words(2)
        ),
      })),
      ...(profile.includeOptionals
        ? { verdict: { label: "Winner", values: ["Us", ...Array(colCount - 1).fill("-")] } }
        : {}),
    },
  };
}

function generateHeroStats(profile: ContentProfile, idx: number) {
  const count = Math.max(2, Math.min(getItemCount(profile), 4));
  const len = getTextLength(profile);
  const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444"];

  return {
    id: `hero-stats-${profile.id}-${idx}`,
    type: "hero-stats" as const,
    title: title(len.title),
    content: {
      layout: "row" as const,
      stats: Array.from({ length: count }, (_, i) => ({
        id: `stat-${i}`,
        value: profile.extremeValues ? "$99,999,999" : `${(i + 1) * 25}%`,
        label: title(3),
        sublabel: profile.includeOptionals ? sentence(5) : undefined,
        color: colors[i % colors.length],
      })),
    },
  };
}

function generateCallToAction(profile: ContentProfile, idx: number) {
  const len = getTextLength(profile);

  return {
    id: `call-to-action-${profile.id}-${idx}`,
    type: "call-to-action" as const,
    title: title(len.title),
    content: {
      headline: sentence(Math.max(6, Math.floor(len.title * 1.5))),
      style: "the-ask" as const,
      ...(profile.includeOptionals
        ? {
            value: profile.extremeValues ? "$50,000,000" : "$2.5M",
            value_context: sentence(8),
            items: Array.from({ length: 3 }, (_, i) => sentence(6 + i * 2)),
          }
        : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Generator registry
// ---------------------------------------------------------------------------

type SectionGenerator = (profile: ContentProfile, idx: number) => Record<string, unknown>;

const GENERATORS: Record<string, SectionGenerator> = {
  "rich-text": generateRichText,
  "expandable-cards": generateExpandableCards,
  "timeline": generateTimeline,
  "tier-table": generateTierTable,
  "metric-dashboard": generateMetricDashboard,
  "data-viz": generateDataViz,
  "hub-mockup": generateHubMockup,
  "guided-journey": generateGuidedJourney,
  "comparison-matrix": generateComparisonMatrix,
  "hero-stats": generateHeroStats,
  "call-to-action": generateCallToAction,
};

const SECTION_TYPES = Object.keys(GENERATORS);

// ---------------------------------------------------------------------------
// Artifact assembly
// ---------------------------------------------------------------------------

function generateArtifact(profile: ContentProfile, sectionType?: string) {
  const types = sectionType ? [sectionType] : SECTION_TYPES;

  const sections = types.map((type, idx) => {
    const gen = GENERATORS[type];
    if (!gen) throw new Error(`Unknown section type: ${type}`);
    return gen(profile, idx);
  });

  const artifactId = sectionType
    ? `eval-${profile.id}-${sectionType}`
    : `eval-${profile.id}-all`;

  return {
    id: artifactId,
    slug: artifactId,
    title: sectionType
      ? `Eval: ${sectionType} (${profile.label})`
      : `Eval: All Sections (${profile.label})`,
    subtitle: `Content profile: ${profile.description}`,
    author_name: "Eval Generator",
    plan_tier: "pro",
    theme: profile.theme,
    layout_mode: "continuous",
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
Content Generator — Create eval fixture artifacts

Usage:
  npx tsx scripts/eval/generate-fixtures.ts                    Generate all profiles × all section types
  npx tsx scripts/eval/generate-fixtures.ts --profile overflow  Generate all sections for one profile
  npx tsx scripts/eval/generate-fixtures.ts --section timeline  Generate all profiles for one section type

Output: scripts/eval/fixtures/<slug>.json
`);
    process.exit(0);
  }

  fs.mkdirSync(FIXTURES_DIR, { recursive: true });

  const profileIdx = args.indexOf("--profile");
  const sectionIdx = args.indexOf("--section");

  const profiles = profileIdx !== -1
    ? CONTENT_PROFILES.filter(p => p.id === args[profileIdx + 1])
    : CONTENT_PROFILES;

  const sectionFilter = sectionIdx !== -1 ? args[sectionIdx + 1] : undefined;

  if (profiles.length === 0) {
    console.error(`Unknown profile: ${args[profileIdx + 1]}`);
    console.error(`Available: ${CONTENT_PROFILES.map(p => p.id).join(", ")}`);
    process.exit(1);
  }

  if (sectionFilter && !SECTION_TYPES.includes(sectionFilter)) {
    console.error(`Unknown section type: ${sectionFilter}`);
    console.error(`Available: ${SECTION_TYPES.join(", ")}`);
    process.exit(1);
  }

  let totalFiles = 0;

  for (const profile of profiles) {
    // Generate one "all sections" artifact per profile
    const allArtifact = generateArtifact(profile, sectionFilter);
    const filename = `${allArtifact.slug}.json`;
    const filepath = path.join(FIXTURES_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(allArtifact, null, 2));
    console.log(`  ${filename} (${allArtifact.sections.length} sections)`);
    totalFiles++;

    // Also generate individual section artifacts for focused testing
    if (!sectionFilter) {
      for (const type of SECTION_TYPES) {
        const singleArtifact = generateArtifact(profile, type);
        const singleFilename = `${singleArtifact.slug}.json`;
        const singleFilepath = path.join(FIXTURES_DIR, singleFilename);
        fs.writeFileSync(singleFilepath, JSON.stringify(singleArtifact, null, 2));
        totalFiles++;
      }
    }
  }

  console.log(`\nGenerated ${totalFiles} fixture files in ${FIXTURES_DIR}`);

  // Write manifest of all fixtures
  const manifestPath = path.join(FIXTURES_DIR, "manifest.json");
  const manifest = {
    generated_at: new Date().toISOString(),
    profiles: profiles.map(p => p.id),
    section_types: sectionFilter ? [sectionFilter] : SECTION_TYPES,
    fixture_count: totalFiles,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

main();
