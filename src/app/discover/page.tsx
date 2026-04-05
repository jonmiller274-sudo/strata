"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const capabilities = [
  "Interactive timelines and animated journeys",
  "Expandable card grids for personas and case studies",
  "Metric dashboards with animated counters",
  "Hub-and-spoke architecture diagrams",
  "Tier tables for pricing and comparisons",
  "Data visualizations and charts",
  "AI-powered content structuring",
  "Shareable via URL — no login to view",
];

export default function DiscoverPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);

    // Store in Supabase (waitlist table) — for now, log and show success
    // TODO: Wire to Supabase waitlist table when ready
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role: role || null,
          use_case: useCase || null,
          source: "discover",
          referrer: typeof window !== "undefined" ? document.referrer : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");
    } catch {
      // Silently succeed even if API isn't ready yet — don't block the UX
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Strata</span>
          </Link>
        </div>
      </nav>

      {/* Hero — the quiet reveal */}
      <main className="mx-auto max-w-3xl px-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pt-32 pb-16"
        >
          <p className="text-accent text-sm font-medium tracking-wide mb-6">
            You just experienced a Strata document
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-6">
            Strategy that speaks
            <br />
            for itself.
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-xl">
            Strata turns strategic content into interactive documents that
            navigate, animate, and communicate — without their author
            in the room.
          </p>
        </motion.section>

        {/* What it does — understated list */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-12 border-t border-white/5"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">
            What you experienced
          </p>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 py-1.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-sm text-muted">{cap}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* The soft ask */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="py-16 border-t border-white/5"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-6">
                <Check className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-3">
                You&apos;re on the list
              </h2>
              <p className="text-muted text-sm max-w-md mx-auto">
                We&apos;ll reach out when Strata is ready for you.
                In the meantime, the document you were viewing is
                still available at its original link.
              </p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Interested?
              </h2>
              <p className="text-muted text-sm mb-8 max-w-md">
                Strata is in early access. Leave your email and
                we&apos;ll let you know when it&apos;s ready.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/40 focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
                />

                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none text-muted-foreground focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors appearance-none"
                >
                  <option value="">What would you build? (optional)</option>
                  <option value="investor-deck">Investor deck</option>
                  <option value="board-update">Board update</option>
                  <option value="sales-proposal">Sales proposal</option>
                  <option value="qbr">Quarterly business review</option>
                  <option value="product-roadmap">Product roadmap</option>
                  <option value="strategy-doc">Strategy document</option>
                  <option value="other">Something else</option>
                </select>

                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Your role (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/40 focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!email.trim() || submitting}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Notify me"}
                  {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>
            </>
          )}
        </motion.section>

        {/* Footer — minimal */}
        <footer className="py-12 border-t border-white/5 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-xs">Strata</span>
            </div>
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Learn more about Strata
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
