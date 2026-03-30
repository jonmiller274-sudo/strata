"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  ArrowRight,
  FileText,
  Sparkles,
  Share2,
  LayoutGrid,
  Clock,
  BarChart3,
  Table2,
  Activity,
  GitBranch,
  Type,
  User,
  PenLine,
  Compass,
  Wand2,
  PanelLeft,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

const sectionTypes = [
  {
    icon: Type,
    name: "Rich Text",
    description:
      "Progressive disclosure — summary by default, evidence on expand",
  },
  {
    icon: LayoutGrid,
    name: "Card Grids",
    description:
      "Personas, case studies, competitor profiles — click to explore",
  },
  {
    icon: Clock,
    name: "Timelines",
    description:
      "Animated step-through journeys, roadmaps, and 30/60/90 plans",
  },
  {
    icon: Table2,
    name: "Tier Tables",
    description:
      "Pricing, feature matrices, and plan comparisons — side by side",
  },
  {
    icon: Activity,
    name: "Metric Dashboards",
    description:
      "KPI cards with animated counters that come alive on scroll",
  },
  {
    icon: BarChart3,
    name: "Data Viz",
    description: "Bar charts, funnel charts, and custom visualizations",
  },
  {
    icon: GitBranch,
    name: "Hub Diagrams",
    description:
      "Interconnected nodes showing how products and teams connect",
  },
  {
    icon: Compass,
    name: "Guided Journeys",
    description:
      "Multi-phase interactive walkthroughs with animated counters and autoplay",
  },
];

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Paste your content",
    description:
      "Notes, docs, bullet points — whatever you have. No specific format required.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI structures it",
    description:
      "Pick a template. AI maps your content to interactive sections — timelines, card grids, metric dashboards — in seconds.",
  },
  {
    icon: PenLine,
    step: "03",
    title: "Refine with AI",
    description:
      "Edit in a two-panel editor. Rewrite any section with AI, drag to reorder, toggle between layouts. Auto-saves as you go.",
  },
  {
    icon: Share2,
    step: "04",
    title: "Share a link",
    description:
      "Publish a shareable URL. Self-navigating, interactive, and polished. No login to view. Works on any device.",
  },
];

const editorFeatures = [
  {
    icon: Wand2,
    title: "Rewrite any section with AI",
    description:
      '\u201CMake it more concise.\u201D \u201CMore persuasive.\u201D \u201CSimplify the language.\u201D One click, instant rewrite — or type your own instructions.',
  },
  {
    icon: PanelLeft,
    title: "See changes as you make them",
    description:
      "Edit on the left, live preview on the right. Drag sections to reorder. Auto-saves every change.",
  },
  {
    icon: Maximize2,
    title: "Present it full-screen",
    description:
      "Switch to a full-screen, keyboard-navigable layout. Each section becomes a beat — like a presentation, but interactive and alive.",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if redirected here for signin
    const params = new URLSearchParams(window.location.search);
    if (params.get("signin") === "true") {
      setShowAuthModal(true);
      // Clean up URL
      window.history.replaceState({}, "", "/");
    }
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold tracking-tight">Strata</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="hidden sm:inline-flex text-sm text-muted hover:text-foreground transition-colors"
            >
              See demo
            </Link>
            <Link
              href="#pricing"
              className="hidden sm:inline-flex text-sm text-muted hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-card-hover transition-colors"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Sign in
              </button>
            )}
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Start creating
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-20">
        {/* Gradient orb background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-[120px]" />
          <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <motion.div
          className="relative z-10 mx-auto max-w-3xl text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Free to start — no credit card required
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Strategy that speaks{" "}
            <span className="bg-gradient-to-r from-accent via-purple-400 to-accent bg-clip-text text-transparent">
              for itself
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
          >
            Turn strategic content into something interactive, shareable, and
            alive — in minutes, not days. No slides. No coding. Just a link.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
            >
              Start creating
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-card-hover"
            >
              See it in action
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem statement */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-lg leading-relaxed text-muted sm:text-xl"
          >
            Your strategy is multi-dimensional — personas, timelines,
            competitive landscapes, pricing models. But your only options are{" "}
            <span className="text-foreground font-medium">
              compressing it into slides
            </span>{" "}
            or{" "}
            <span className="text-foreground font-medium">
              spending a day building something custom.
            </span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-lg font-medium text-foreground sm:text-xl"
          >
            Strata gives you a third option. Paste your content, let AI
            structure it, and share something interactive, polished, and alive —
            in minutes.
          </motion.p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-muted">
              From raw content to something shareable in four steps.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative rounded-2xl border border-border bg-card p-8"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <item.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-xs font-bold text-accent tracking-widest uppercase">
                    Step {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section types */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              8 interactive building blocks
            </h2>
            <p className="mt-3 text-muted">
              Mix and match to build something interactive, polished, and
              executive-ready — designed for depth, not decoration.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectionTypes.map((type, i) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex gap-4 rounded-xl border border-border/60 bg-card/50 p-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <type.icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{type.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {type.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor features */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Refine until it&apos;s exactly right
            </h2>
            <p className="mt-3 text-muted">
              AI gives you the starting point. The editor gives you full
              control.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {editorFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative rounded-2xl border border-border bg-card p-8"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing mention */}
      <section id="pricing" className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Free to start. Pro when you&apos;re ready.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Create and share up to 2 interactive strategy briefs — free,
            forever. When you need more, Pro plans start at{" "}
            <span className="text-foreground font-medium">
              $49/mo for founding members
            </span>
            .
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            No credit card required. No trial countdown.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            See all plans
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your strategy deserves more than slides
          </h2>
          <p className="mt-4 text-lg text-muted">
            See what interactive, self-navigating strategy looks like — then
            build your own in minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
            >
              Start creating
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-card-hover"
            >
              See the demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-footer-bg py-12 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold">Strata</span>
          </div>
          <p className="text-xs text-footer-text text-center sm:text-left">
            Where strategy gets built before it becomes a slide deck, a video,
            or a PDF.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs text-footer-text hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/demo"
              className="text-xs text-footer-text hover:text-foreground transition-colors"
            >
              Demo
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="text-xs text-footer-text hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-xs text-footer-text hover:text-foreground transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </footer>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo="/dashboard"
      />
    </div>
  );
}
