"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Presentation,
  FileText,
  Palette,
  Sparkles,
  BookOpen,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { SectionRenderer } from "@/components/viewer/SectionRenderer";
import type { Section } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

// ─── Pain Cards Data ────────────────────────────────────────────────────────

const painCards = [
  {
    icon: Presentation,
    text: "You built a 47-slide Google Slides deck for the board. Three people skimmed it. Nobody made it past slide 20.",
  },
  {
    icon: FileText,
    text: 'You wrote a 12-page strategy doc in Google Docs. Your CEO said "can you just give me the summary?"',
  },
  {
    icon: Palette,
    text: "You made it beautiful in Canva. But it\u2019s still slides. Still one direction. Still linear.",
  },
  {
    icon: Sparkles,
    text: 'You tried Gamma and thought "close \u2014 but this still feels like a presentation, not a document."',
  },
  {
    icon: BookOpen,
    text: 'You published a Notion page. Your investor said "this looks like an internal wiki."',
  },
  {
    icon: MessageSquare,
    text: "You asked ChatGPT to build something interactive. You spent 3 hours fixing CSS. Then it broke on mobile.",
  },
];

// ─── Contrast Pairs Data ────────────────────────────────────────────────────

const contrastPairs = [
  { old: "Linear", strata: "Non-linear" },
  { old: "One direction", strata: "Explore any section" },
  { old: "Static", strata: "Interactive" },
  { old: "Presenter required", strata: "Self-navigating" },
  { old: "Emailed as a file", strata: "Shared as a link" },
  { old: "Hope they read it", strata: "Know they read it" },
];

// ─── Mini-Artifact Demo Data ────────────────────────────────────────────────

const MINI_ARTIFACT_SECTIONS: Section[] = [
  {
    id: "mini-exec-summary",
    type: "rich-text",
    title: "Executive Summary",
    subtitle: "Q3 Revenue Strategy",
    content: {
      tag: { label: "Q3 2026", color: "#6366f1" },
      summary:
        "Revenue grew 34% YoY to $1.2M ARR, driven by enterprise expansion and a 22% increase in average deal size. Net retention hit 118%, signaling strong product-market fit in our core segment.\n\nThis quarter\u2019s strategy focuses on three bets: expanding into mid-market with a self-serve motion, doubling down on the VP Sales persona through targeted content, and launching viewer analytics to create a daily engagement habit.",
      detail:
        "Our pipeline coverage sits at 3.8x, ahead of the 3.0x benchmark. However, sales cycle length increased from 28 to 36 days in Q2 \u2014 largely due to procurement friction at enterprise accounts. The self-serve tier is designed to capture teams that want to start without a procurement cycle.\n\nKey risk: mid-market ASPs may compress margins if support costs scale linearly. Mitigation: invest in self-serve onboarding and knowledge base before launching the tier.",
      callout: {
        type: "insight" as const,
        text: "Net retention above 110% means existing customers are growing faster than churn. This is the single strongest signal of product-market fit.",
      },
    },
  },
  {
    id: "mini-personas",
    type: "expandable-cards",
    title: "Target Personas",
    subtitle: "Who we\u2019re building for this quarter",
    content: {
      columns: 3 as const,
      cards: [
        {
          id: "persona-vp-sales",
          title: "VP Sales",
          summary:
            "Needs weekly pipeline reviews and QBR decks that tell a story, not just show data.",
          tags: ["Primary", "High frequency"],
          detail:
            "Uses Strata 2-3x per week for pipeline reviews, territory plans, and customer-facing proposals. Biggest pain: spending half a day building a QBR deck that gets skimmed in 10 minutes. Values speed and polish equally.",
          metric: { value: "3x/week", label: "Usage frequency" },
        },
        {
          id: "persona-cro",
          title: "CRO",
          summary:
            "Wants board-ready revenue narratives with interactive drill-downs.",
          tags: ["Expansion", "Board decks"],
          detail:
            "Quarterly board deck creator. Needs to show revenue trajectory, competitive landscape, and team performance in one artifact. Currently uses 60+ slide decks that take 2 days to build. Strata cuts this to 2 hours.",
          metric: { value: "4x/quarter", label: "Board decks" },
        },
        {
          id: "persona-ceo",
          title: "CEO",
          summary:
            "Consumes strategy async. Wants to explore, not be presented to.",
          tags: ["Consumer", "Viral loop"],
          detail:
            "Receives Strata docs from their VP Sales and CRO. The first time they see an interactive strategy doc instead of a PDF, they ask \u201Ccan I use this for our investor update?\u201D This is the viral loop \u2014 the viewer becomes the next creator.",
          metric: { value: "1st touch", label: "Discovery channel" },
        },
      ],
    },
  },
  {
    id: "mini-timeline",
    type: "timeline",
    title: "90-Day Timeline",
    subtitle: "Q3 milestones and ownership",
    content: {
      steps: [
        {
          id: "t-1",
          label: "Week 1\u20132",
          title: "Self-serve tier launch",
          description:
            "Ship free tier with 2-document limit. Onboarding flow, template picker, and Stripe billing integration.",
          status: "completed" as const,
        },
        {
          id: "t-2",
          label: "Week 3\u20134",
          title: "Viewer analytics MVP",
          description:
            'Track opens, section views, time spent, and device. Surface in creator dashboard as "who read your doc."',
          status: "completed" as const,
        },
        {
          id: "t-3",
          label: "Week 5\u20138",
          title: "VP Sales content campaign",
          description:
            "Publish 6 LinkedIn posts targeting revenue leaders. Launch QBR and proposal templates with real sample data.",
          status: "current" as const,
        },
        {
          id: "t-4",
          label: "Week 9\u201312",
          title: "Enterprise pilot program",
          description:
            "Onboard 5 design partners for team tier. Custom branding, shared workspace, and SSO integration.",
          status: "upcoming" as const,
        },
      ],
    },
  },
  {
    id: "mini-metrics",
    type: "metric-dashboard",
    title: "Key Metrics",
    subtitle: "Current quarter performance",
    content: {
      metrics: [
        {
          id: "m-1",
          label: "Annual Recurring Revenue",
          value: "$1.2M",
          numeric_value: 1200,
          prefix: "$",
          suffix: "K",
          change: { direction: "up" as const, value: "+34% YoY" },
        },
        {
          id: "m-2",
          label: "Net Revenue Retention",
          value: "118%",
          numeric_value: 118,
          suffix: "%",
          change: { direction: "up" as const, value: "+6pts" },
        },
        {
          id: "m-3",
          label: "Enterprise Deals in Pipeline",
          value: "12",
          numeric_value: 12,
          change: { direction: "up" as const, value: "+4 this quarter" },
        },
        {
          id: "m-4",
          label: "Customer NPS",
          value: "4.2",
          numeric_value: 42,
          suffix: "",
          change: { direction: "up" as const, value: "+0.3" },
          description: "Based on 200+ survey responses across all segments",
        },
      ],
    },
  },
  {
    id: "mini-pricing",
    type: "tier-table",
    title: "Pricing Tiers",
    subtitle: "Current plan structure and feature breakdown",
    content: {
      columns: [
        {
          name: "Starter",
          price: "$0",
          price_period: "month",
          description: "For individuals exploring interactive strategy docs",
          cta: "Start free",
          features: [
            { name: "2 active documents", included: true },
            { name: "All section types", included: true },
            { name: "Shareable links", included: true },
            { name: "Viewer analytics", included: false },
            { name: "Custom branding", included: false },
            { name: "Team workspace", included: false },
          ],
        },
        {
          name: "Pro",
          price: "$79",
          price_period: "month",
          description: "For revenue leaders who share strategy weekly",
          cta: "Start 14-day trial",
          is_highlighted: true,
          features: [
            { name: "Unlimited documents", included: true },
            { name: "All section types", included: true },
            { name: "Shareable links", included: true },
            { name: "Viewer analytics", included: true },
            { name: "Custom branding", included: true },
            { name: "Team workspace", included: false },
          ],
        },
        {
          name: "Team",
          price: "$199",
          price_period: "month",
          description: "For revenue teams that present together",
          cta: "Talk to us",
          features: [
            { name: "Unlimited documents", included: true },
            { name: "All section types", included: true },
            { name: "Shareable links", included: true },
            { name: "Advanced analytics", included: true },
            { name: "Full brand kit", included: true },
            { name: "5 team seats + SSO", included: true },
          ],
        },
      ],
    },
  },
];

// ─── Mini-Artifact Sidebar ──────────────────────────────────────────────────

function MiniSidebar({
  sections,
  activeId,
  onNavigate,
}: {
  sections: Section[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="hidden md:flex flex-col w-48 shrink-0 border-r border-white/10 bg-surface/50">
      <div className="px-4 py-4 border-b border-white/10">
        <p className="text-xs font-semibold text-foreground tracking-wide">
          Q3 Revenue Strategy
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Interactive Demo
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {sections.map((section, index) => (
            <li key={section.id}>
              <button
                onClick={() => onNavigate(section.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                  activeId === section.id
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-medium",
                    activeId === section.id
                      ? "bg-accent text-white"
                      : "bg-white/10 text-muted"
                  )}
                >
                  {index + 1}
                </span>
                <span className="truncate">{section.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Progress */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{
              width: `${((sections.findIndex((s) => s.id === activeId) + 1) / sections.length) * 100}%`,
            }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {sections.findIndex((s) => s.id === activeId) + 1} of{" "}
          {sections.length} sections
        </p>
      </div>
    </div>
  );
}

// ─── Mini-Artifact Mobile Nav ───────────────────────────────────────────────

function MiniMobileNav({
  sections,
  activeId,
  onNavigate,
}: {
  sections: Section[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="flex md:hidden overflow-x-auto border-b border-white/10 bg-surface/50 px-3 py-2 gap-1.5 no-scrollbar">
      {sections.map((section, index) => (
        <button
          key={section.id}
          onClick={() => onNavigate(section.id)}
          className={cn(
            "shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors whitespace-nowrap",
            activeId === section.id
              ? "bg-accent/15 text-accent"
              : "text-muted hover:text-foreground hover:bg-white/5"
          )}
        >
          {index + 1}. {section.title}
        </button>
      ))}
    </div>
  );
}

// ─── Embedded Mini-Artifact ─────────────────────────────────────────────────

function EmbeddedMiniArtifact() {
  const [activeId, setActiveId] = useState(MINI_ARTIFACT_SECTIONS[0].id);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback(
    (id: string) => {
      setActiveId(id);
      const el = document.getElementById(`mini-${id}`);
      const container = scrollContainerRef.current;
      if (el && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const scrollOffset = elRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({ top: scrollOffset, behavior: "smooth" });
      }
    },
    []
  );

  // Scroll-spy within the container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      let bestId = MINI_ARTIFACT_SECTIONS[0].id;
      let bestDistance = Infinity;

      for (const section of MINI_ARTIFACT_SECTIONS) {
        const el = document.getElementById(`mini-${section.id}`);
        if (!el) continue;
        const elRect = el.getBoundingClientRect();
        const distance = Math.abs(elRect.top - containerRect.top);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = section.id;
        }
      }

      setActiveId(bestId);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[500px] sm:h-[560px] md:h-[600px] overflow-hidden rounded-2xl border border-white/10 bg-background">
      <MiniSidebar
        sections={MINI_ARTIFACT_SECTIONS}
        activeId={activeId}
        onNavigate={handleNavigate}
      />
      <MiniMobileNav
        sections={MINI_ARTIFACT_SECTIONS}
        activeId={activeId}
        onNavigate={handleNavigate}
      />
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 md:py-8"
      >
        <div className="space-y-14 max-w-3xl">
          {MINI_ARTIFACT_SECTIONS.map((section) => (
            <div key={section.id} id={`mini-${section.id}`}>
              <SectionRenderer section={section} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function CompetitiveSection() {
  const prefersReducedMotion = useReducedMotion();

  // Animation helpers — respect reduced motion
  const fadeInUp = prefersReducedMotion
    ? { initial: {}, whileInView: {} }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
      };

  const fadeIn = prefersReducedMotion
    ? { initial: {}, whileInView: {} }
    : {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
      };

  return (
    <>
      {/* ═══════ Beat 1: "You've done this before." + Pain Cards ═══════ */}
      <section className="relative py-24 sm:py-32 px-6">
        <div className="mx-auto max-w-3xl">
          {/* Headline */}
          <motion.h2
            {...fadeInUp}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-16 sm:mb-20"
          >
            You&apos;ve done this before.
          </motion.h2>

          {/* Pain cards */}
          <div className="mx-auto max-w-[700px] space-y-4">
            {painCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  {...(prefersReducedMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 16 },
                        whileInView: { opacity: 1, y: 0 },
                      })}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: prefersReducedMotion ? 0 : i * 0.2,
                  }}
                  className="flex gap-4 rounded-xl border-l-[3px] border-white/20 bg-surface p-5"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/80 italic">
                    {card.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ Beat 2: "The problem was never the tool." ═══════ */}
      <section className="relative flex min-h-[60vh] sm:min-h-[70vh] items-center justify-center px-6">
        <motion.p
          {...fadeIn}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-2xl sm:text-3xl lg:text-4xl font-light leading-snug tracking-tight text-foreground/90 max-w-2xl"
        >
          The problem was never the tool.{" "}
          <span className="text-foreground font-medium">
            It was the format.
          </span>
        </motion.p>
      </section>

      {/* ═══════ Beat 3: Live Embedded Mini-Artifact ═══════ */}
      <section className="relative py-24 sm:py-32 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Headline */}
          <motion.div
            {...fadeInUp}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Strata is a new format for strategy.
            </h2>
            <p className="mt-3 text-muted text-base sm:text-lg max-w-xl mx-auto">
              Interactive. Self-navigating. Built to be explored without you in
              the room.
            </p>
          </motion.div>

          {/* Embedded artifact with accent glow */}
          <motion.div
            {...(prefersReducedMotion
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.98 },
                  whileInView: { opacity: 1, scale: 1 },
                })}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl"
            style={{
              boxShadow: "0 0 80px -20px var(--color-accent)",
            }}
          >
            {/* Subtle glow border via outline */}
            <div
              className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{
                border: "1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)",
              }}
            />
            <EmbeddedMiniArtifact />
          </motion.div>

          {/* Caption */}
          <motion.p
            {...fadeIn}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            This is a real Strata document. Click around.
          </motion.p>
        </div>
      </section>

      {/* ═══════ Beat 4: Contrast Pairs + CTA ═══════ */}
      <section className="relative py-24 sm:py-32 px-6">
        <div className="mx-auto max-w-2xl">
          {/* Contrast pairs */}
          <div className="space-y-5 sm:space-y-6">
            {contrastPairs.map((pair, i) => (
              <motion.div
                key={i}
                {...(prefersReducedMotion
                  ? {}
                  : {
                      initial: { opacity: 0 },
                      whileInView: { opacity: 1 },
                    })}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: prefersReducedMotion ? 0 : i * 0.1,
                }}
                className="grid grid-cols-2 gap-4 sm:gap-8 items-baseline"
              >
                <p className="text-right text-base sm:text-lg text-white/40 font-light">
                  {pair.old}
                </p>
                <p className="text-base sm:text-lg font-semibold text-accent">
                  {pair.strata}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            {...fadeInUp}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-14 sm:mt-16 text-center"
          >
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
            >
              Start creating &mdash; your first document is free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
