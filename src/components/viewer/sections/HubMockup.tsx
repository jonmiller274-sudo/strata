"use client";

import { motion } from "framer-motion";
import type { HubMockupSection, HubNode } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

function NodeCard({
  node,
  index,
  isCenter,
}: {
  node: HubNode;
  index: number;
  isCenter?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: isCenter ? 0 : 0.2 + index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "flex flex-col items-center rounded-2xl border p-5 text-center transition-all",
        isCenter
          ? "border-accent bg-accent-muted col-span-full md:col-span-1"
          : "border-border bg-card hover:border-accent/30 hover:bg-card-hover"
      )}
      style={node.color ? { borderColor: `${node.color}40` } : undefined}
    >
      {/* Icon placeholder — uses first 2 chars of label as avatar */}
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold",
          isCenter ? "bg-accent text-white" : "bg-surface text-accent"
        )}
        style={
          node.color
            ? { backgroundColor: `${node.color}20`, color: node.color }
            : undefined
        }
      >
        {node.label.slice(0, 2).toUpperCase()}
      </div>

      <h3 className="mt-3 text-sm font-semibold">{node.label}</h3>
      {node.description && (
        <p className="mt-1 text-xs text-muted leading-relaxed">
          {node.description}
        </p>
      )}
    </motion.div>
  );
}

export function HubMockup({
  section,
}: {
  section: HubMockupSection;
}) {
  const { center, nodes, connections } = section.content;

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className="mt-8">
        {/* Center node */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-xs">
            <NodeCard node={center} index={0} isCenter />
          </div>
        </div>

        {/* Connection lines (simplified visual) */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-2">
            {nodes.slice(0, 5).map((_, i) => (
              <div key={i} className="h-8 w-px bg-border" />
            ))}
          </div>
        </div>

        {/* Surrounding nodes */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {nodes.map((node, index) => (
            <NodeCard key={node.id} node={node} index={index} />
          ))}
        </div>

        {/* Connection labels */}
        {connections && connections.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Connections
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {connections.map((conn, index) => {
                const fromNode = [center, ...nodes].find(
                  (n) => n.id === conn.from
                );
                const toNode = [center, ...nodes].find(
                  (n) => n.id === conn.to
                );
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-muted"
                  >
                    <span className="font-medium text-foreground/80">
                      {fromNode?.label ?? conn.from}
                    </span>
                    <span className="text-accent">&rarr;</span>
                    <span className="font-medium text-foreground/80">
                      {toNode?.label ?? conn.to}
                    </span>
                    {conn.label && (
                      <span className="text-muted-foreground">
                        ({conn.label})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {section.content.description && (
        <p className="mt-6 text-sm text-muted leading-relaxed">
          {section.content.description}
        </p>
      )}
    </div>
  );
}
