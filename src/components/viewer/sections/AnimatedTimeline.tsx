"use client";

import { motion } from "framer-motion";
import { Check, Circle, ArrowRight } from "lucide-react";
import type { TimelineSection, TimelineStep } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLES = {
  completed: {
    dot: "bg-success border-success",
    iconClass: "text-white",
    icon: Check,
    line: "bg-success",
    text: "text-foreground",
  },
  current: {
    dot: "bg-accent border-accent",
    iconClass: "text-white",
    icon: ArrowRight,
    line: "bg-accent",
    text: "text-foreground",
  },
  upcoming: {
    dot: "bg-transparent border-accent/40",
    iconClass: "text-accent/70",
    icon: Circle,
    line: "bg-accent/20",
    text: "text-foreground/90",
  },
};

function VerticalStep({
  step,
  index,
  isLast,
}: {
  step: TimelineStep;
  index: number;
  isLast: boolean;
}) {
  const status = step.status ?? "upcoming";
  const styles = STATUS_STYLES[status];
  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative flex gap-6"
    >
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
            styles.dot
          )}
        >
          <Icon className={cn("h-4 w-4", styles.iconClass)} />
        </div>
        {!isLast && (
          <div className={cn("mt-2 w-0.5 flex-1", styles.line)} />
        )}
      </div>

      {/* Content */}
      <div className={cn("pb-8", isLast && "pb-0")}>
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {step.label}
        </span>
        <h3 className={cn("mt-1 text-lg font-semibold", styles.text)}>
          {step.title}
        </h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export function AnimatedTimeline({
  section,
}: {
  section: TimelineSection;
}) {
  const steps = section.content.steps;

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className="mt-8">
        {steps.map((step, index) => (
          <VerticalStep
            key={step.id}
            step={step}
            index={index}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>

      {section.content.evidence && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: steps.length * 0.15 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-8 border-l-4 pl-5 py-3"
          style={{
            borderColor:
              section.content.evidence.border_color ||
              "var(--palette-accent4, var(--color-danger))",
          }}
        >
          <p className="text-sm italic text-muted leading-relaxed">
            {section.content.evidence.text}
          </p>
        </motion.div>
      )}

      {section.content.pivot && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: steps.length * 0.15 + (section.content.evidence ? 0.2 : 0),
          }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-8 text-2xl md:text-3xl font-bold"
          style={{ color: "var(--palette-accent1, var(--color-accent))" }}
        >
          {section.content.pivot}
        </motion.p>
      )}
    </div>
  );
}
