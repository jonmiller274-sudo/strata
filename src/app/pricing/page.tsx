"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  Minus,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

// All tiers have the same feature rows for horizontal alignment
const featureNames = [
  "Published artifacts",
  "AI structuring",
  "Watermark",
  "Custom branding",
  "Export & embed",
  "Viewer analytics",
  "Team members",
  "Priority support",
  "SSO / SAML",
  "Custom domains",
];

const tiers = [
  {
    name: "Free",
    description: "Try Strata with no commitment",
    monthlyPrice: 0,
    annualPrice: 0,
    cta: "Start creating",
    ctaHref: "/create",
    ctaStyle: "outline" as const,
    features: {
      "Published artifacts": "2",
      "AI structuring": "3/month",
      Watermark: { value: "Included", negative: true },
      "Custom branding": false,
      "Export & embed": false,
      "Viewer analytics": { value: "Coming soon", disabled: true },
      "Team members": "1",
      "Priority support": false,
      "SSO / SAML": false,
      "Custom domains": false,
    } as Record<string, string | boolean | { value: string; disabled?: boolean; negative?: boolean }>,
  },
  {
    name: "Pro",
    description: "For professionals who need to impress",
    monthlyPrice: 79,
    annualPrice: 63,
    highlighted: true,
    badge: "Most Popular",
    foundingPrice: 49,
    cta: "Get Pro",
    ctaHref:
      "mailto:jon@sharestrata.com?subject=Strata%20Pro%20-%20Founding%20Member",
    ctaStyle: "primary" as const,
    features: {
      "Published artifacts": "15",
      "AI structuring": "Unlimited",
      Watermark: "Removed",
      "Custom branding": "Logo, colors, palette",
      "Export & embed": true,
      "Viewer analytics": { value: "Coming soon", disabled: true },
      "Team members": "1",
      "Priority support": false,
      "SSO / SAML": false,
      "Custom domains": false,
    } as Record<string, string | boolean | { value: string; disabled?: boolean; negative?: boolean }>,
  },
  {
    name: "Team",
    description: "For teams that share strategy",
    monthlyPrice: 199,
    annualPrice: 159,
    cta: "Get started",
    ctaHref: "mailto:jon@sharestrata.com?subject=Strata%20Team%20Plan",
    ctaStyle: "outline" as const,
    features: {
      "Published artifacts": "Unlimited",
      "AI structuring": "Unlimited",
      Watermark: "Removed",
      "Custom branding": "Full brand kit",
      "Export & embed": true,
      "Viewer analytics": { value: "Coming soon", disabled: true },
      "Team members": "5 seats",
      "Priority support": true,
      "SSO / SAML": false,
      "Custom domains": { value: "Coming soon", disabled: true },
    } as Record<string, string | boolean | { value: string; disabled?: boolean; negative?: boolean }>,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: null,
    annualPrice: null,
    cta: "Contact us",
    ctaHref: "mailto:jon@sharestrata.com?subject=Strata%20Enterprise",
    ctaStyle: "outline" as const,
    features: {
      "Published artifacts": "Unlimited",
      "AI structuring": "Unlimited",
      Watermark: "Removed",
      "Custom branding": "Full brand kit",
      "Export & embed": true,
      "Viewer analytics": { value: "Coming soon", disabled: true },
      "Team members": "Custom",
      "Priority support": "Yes + SLA",
      "SSO / SAML": true,
      "Custom domains": { value: "Coming soon", disabled: true },
    } as Record<string, string | boolean | { value: string; disabled?: boolean; negative?: boolean }>,
  },
];

const faqs = [
  {
    question: "What\u2019s included in the free plan?",
    answer:
      "You can create and publish up to 2 interactive strategy briefs with full AI structuring (3 per month). Published content includes a \u201CMade with Strata\u201D watermark. No credit card required, no time limit.",
  },
  {
    question: "What\u2019s a founding member?",
    answer:
      "The first 50 Pro users get locked in at $49/month for life \u2014 even as the price goes up. It\u2019s our way of rewarding early adopters who believe in what we\u2019re building.",
  },
  {
    question: "Can I upgrade or downgrade later?",
    answer:
      "Yes. You can upgrade from Free to Pro at any time. Your existing content stays exactly as it is. Founding member pricing is locked for life once you\u2019re in.",
  },
  {
    question: "What happens to my content if I stop paying?",
    answer:
      "Your published content stays live and accessible. You just can\u2019t create new artifacts beyond the free tier limit until you resubscribe.",
  },
];

function FeatureValue({
  feature,
}: {
  feature: string | boolean | { value: string; disabled?: boolean; negative?: boolean };
}) {
  if (typeof feature === "object" && feature !== null && "value" in feature) {
    if (feature.disabled) {
      return (
        <span className="text-xs text-muted-foreground italic">
          {feature.value}
        </span>
      );
    }
    if (feature.negative) {
      return (
        <span className="text-xs text-muted-foreground">{feature.value}</span>
      );
    }
    return <span className="text-sm text-foreground">{feature.value}</span>;
  }
  if (typeof feature === "boolean") {
    return feature ? (
      <Check className="h-4 w-4 text-accent" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground/30" />
    );
  }
  return <span className="text-sm text-foreground">{feature}</span>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);
  const [annual, setAnnual] = useState(false);
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setMounted(true);
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
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
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

      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-muted"
          >
            Free to start. Upgrade when you&apos;re ready.
          </motion.p>

          {/* Annual/Monthly toggle */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1"
          >
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !annual
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                annual
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs opacity-70">Save 20%</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing cards */}
      <section className="pb-24 px-6">
        <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                tier.highlighted
                  ? "border-accent bg-card shadow-lg shadow-accent/10"
                  : "border-border bg-card"
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
                    <Sparkles className="h-3 w-3" />
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Tier header */}
              <div>
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <p className="mt-1 text-xs text-muted">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="mt-5 min-h-[60px]">
                {tier.monthlyPrice === null ? (
                  <span className="text-3xl font-bold">Custom</span>
                ) : tier.monthlyPrice === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-sm text-muted">/mo</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        ${annual ? tier.annualPrice : tier.monthlyPrice}
                      </span>
                      <span className="text-sm text-muted">/mo</span>
                    </div>
                    {annual && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Billed annually (${tier.annualPrice! * 12}/yr)
                      </p>
                    )}
                    {tier.foundingPrice && (
                      <p className="mt-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/5 px-2 py-0.5 text-accent font-medium">
                          <Sparkles className="h-2.5 w-2.5" />
                          ${tier.foundingPrice}/mo for founding members
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mt-6 flex-1 space-y-3 border-t border-border/50 pt-6">
                {featureNames.map((name) => {
                  const feature = tier.features[name];
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-xs text-muted">{name}</span>
                      <span className="shrink-0">
                        <FeatureValue feature={feature} />
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CTA at bottom */}
              <div className="mt-6">
                {tier.ctaHref.startsWith("mailto:") ? (
                  <a
                    href={tier.ctaHref}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                      tier.ctaStyle === "primary"
                        ? "bg-accent text-white hover:bg-accent-hover"
                        : "border border-border text-foreground hover:bg-card-hover"
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link
                    href={tier.ctaHref}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                      tier.ctaStyle === "primary"
                        ? "bg-accent text-white hover:bg-accent-hover"
                        : "border border-border text-foreground hover:bg-card-hover"
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Frequently asked questions
          </motion.h2>

          <div className="mt-12 space-y-8">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to make your strategy come alive?
          </h2>
          <p className="mt-4 text-lg text-muted">
            Start for free. No credit card. No trial countdown.
          </p>
          <div className="mt-8">
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
            >
              Start creating
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
              href="/"
              className="text-xs text-footer-text hover:text-foreground transition-colors"
            >
              Home
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
