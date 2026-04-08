"use client";

import { motion } from "framer-motion";
import type { HeroStatsSection, HeroStat } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

function StatCard({
  stat,
  index,
  stacked,
}: {
  stat: HeroStat;
  index: number;
  stacked: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl border border-border bg-card p-6",
        stacked && "w-full"
      )}
    >
      <span
        className="text-4xl md:text-5xl font-bold tabular-nums leading-none"
        style={stat.color ? { color: stat.color } : undefined}
      >
        {stat.value}
      </span>
      <span className="mt-2 text-sm text-muted font-medium">{stat.label}</span>
      {stat.sublabel && (
        <span className="mt-1 text-xs text-muted/70">{stat.sublabel}</span>
      )}
    </motion.div>
  );
}

export function HeroStats({ section }: { section: HeroStatsSection }) {
  const { stats, layout } = section.content;
  const stacked = layout === "stacked";

  // Responsive column count: 2 on mobile always, then match stat count on md+
  // Never use dynamic Tailwind classes — compute the static class from count
  const colClass = (() => {
    if (stacked) return "grid-cols-1";
    const count = stats.length;
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2 md:grid-cols-3";
    if (count === 4) return "grid-cols-2 md:grid-cols-4";
    // 5+ falls back to wrapping 2-col mobile, 3-col desktop
    return "grid-cols-2 md:grid-cols-3";
  })();

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className={cn("mt-8 grid gap-4", colClass)}>
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} stacked={stacked} />
        ))}
      </div>
    </div>
  );
}
