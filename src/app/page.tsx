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
} from "lucide-react";
import Link from "next/link";

const sectionTypes = [
  {
    icon: Type,
    name: "Rich Text",
    description: "Progressive disclosure — summary by default, evidence on expand",
  },
  {
    icon: LayoutGrid,
    name: "Card Grids",
    description: "Personas, case studies, competitor profiles — click to expand",
  },
  {
    icon: Clock,
    name: "Timelines",
    description: "Animated step-through journeys, roadmaps, and 30/60/90 plans",
  },
  {
    icon: Table2,
    name: "Tier Tables",
    description: "Pricing, feature matrices, and plan comparisons",
  },
  {
    icon: Activity,
    name: "Metric Dashboards",
    description: "KPI cards with animated counters that count up on scroll",
  },
  {
    icon: BarChart3,
    name: "Data Viz",
    description: "Bar charts, funnel charts, and custom visualizations",
  },
  {
    icon: GitBranch,
    name: "Hub Diagrams",
    description: "Interconnected nodes showing how products and teams connect",
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
      "Pick a template. AI maps your content to the right section types in seconds.",
  },
  {
    icon: Share2,
    step: "03",
    title: "Share a link",
    description:
      "Publish a shareable URL. No login to view. Works on any device.",
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
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background" />
    );
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
              href="/create"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Create artifact
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
            Now in early access
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
            Turn strategic content into interactive, shareable artifacts — in
            minutes, not days. No slides. No coding. Just a link.
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
              Create an artifact
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-card-hover"
            >
              See it in action
            </Link>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-xs text-muted-foreground"
          >
            Free during early access. No account required.
          </motion.p>
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
            Executives are building interactive strategy documents with AI coding
            tools. The results are stunning. But then the format debate
            starts:{" "}
            <span className="text-foreground font-medium">
              &ldquo;Make it a video.&rdquo; &ldquo;Convert it to PDF.&rdquo;
              &ldquo;Keep it interactive.&rdquo;
            </span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-lg font-medium text-foreground sm:text-xl"
          >
            Strata ends the debate. Build once, deliver everywhere.
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
              From raw content to shareable artifact in three steps.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
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
              7 opinionated building blocks
            </h2>
            <p className="mt-3 text-muted">
              Every strategic artifact is composed from these section types —
              designed for depth, not decoration.
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

      {/* CTA */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See it in action
          </h2>
          <p className="mt-4 text-lg text-muted">
            This demo artifact was built entirely with Strata — using the same
            tools you&apos;ll use. It pitches Strata, using Strata.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
            >
              View the demo artifact
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-card-hover"
            >
              Create your own
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-footer-bg py-12 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold">Strata</span>
          </div>
          <p className="text-xs text-footer-text text-center">
            Where strategy gets built before it becomes a slide deck, a video,
            or a PDF.
          </p>
        </div>
      </footer>
    </div>
  );
}
