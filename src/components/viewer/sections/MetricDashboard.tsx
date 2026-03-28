"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricDashboardSection, MetricCard as MetricCardType } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();

          function animate(currentTime: number) {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * value));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{count}</span>;
}

function MetricCardComponent({
  metric,
  index,
}: {
  metric: MetricCardType;
  index: number;
}) {
  const changeIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };
  const changeColors = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-muted",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <p className="text-sm font-medium text-muted">{metric.label}</p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums">
          {metric.numeric_value != null && metric.numeric_value <= 9999 ? (
            <>
              {metric.prefix}
              <AnimatedCounter value={metric.numeric_value} />
              {metric.suffix}
            </>
          ) : (
            metric.value
          )}
        </span>
      </div>

      {metric.change && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-sm",
            changeColors[metric.change.direction]
          )}
        >
          {(() => {
            const Icon = changeIcons[metric.change.direction];
            return <Icon className="h-3.5 w-3.5" />;
          })()}
          <span>{metric.change.value}</span>
        </div>
      )}

      {metric.description && (
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          {metric.description}
        </p>
      )}
    </motion.div>
  );
}

export function MetricDashboard({
  section,
}: {
  section: MetricDashboardSection;
}) {
  const metricCount = section.content.metrics.length;
  const gridCols =
    metricCount <= 2
      ? "grid-cols-1 md:grid-cols-2"
      : metricCount === 3
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className={cn("mt-8 grid gap-4", gridCols)}>
        {section.content.metrics.map((metric, index) => (
          <MetricCardComponent key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </div>
  );
}
