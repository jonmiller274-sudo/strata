"use client";

import { motion } from "framer-motion";
import type { HubMockupSection, HubNode, HubMockupLayer } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

/** Fallback colors when palette vars aren't set */
const LAYER_COLORS = [
  "#6366f1", // indigo (accent)
  "#2fd8c8", // teal
  "#a78bfa", // violet
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
];

function getLayerColor(layerIndex: number): string {
  // Try palette CSS vars first, fall back to static colors
  return `var(--palette-accent${layerIndex + 1}, ${LAYER_COLORS[layerIndex % LAYER_COLORS.length]})`;
}

function NodeCard({
  node,
  index,
  accentColor,
  isCenter,
}: {
  node: HubNode;
  index: number;
  accentColor?: string;
  isCenter?: boolean;
}) {
  const borderColor = accentColor || node.color;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: isCenter ? 0 : 0.15 + index * 0.08 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "flex flex-col rounded-xl border-l-[3px] px-5 py-4 transition-all",
        isCenter
          ? "bg-accent-muted"
          : "bg-card hover:bg-card-hover"
      )}
      style={{
        borderLeftColor: borderColor || undefined,
        borderTopColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
      }}
    >
      <h3 className="text-sm font-bold">{node.label}</h3>
      {node.description && (
        <p className="mt-1 text-xs text-muted leading-relaxed">
          {node.description}
        </p>
      )}
    </motion.div>
  );
}

/** Arrow connector between layers, with optional transition label */
function LayerArrow({ index, label }: { index: number; label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 + index * 0.08 }}
      viewport={{ once: true }}
      className="flex flex-col items-center py-3 gap-1"
    >
      <svg width="32" height="48" viewBox="0 0 32 48" className="text-accent/50">
        <line
          x1="16" y1="0" x2="16" y2="38"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="4 3"
        />
        <polygon points="10,36 16,46 22,36" fill="currentColor" />
      </svg>
      {label && (
        <p className="text-xs italic text-muted-foreground opacity-70 text-center max-w-xs">
          {label}
        </p>
      )}
    </motion.div>
  );
}

/** Layered hierarchical rendering */
function LayeredView({ layers, description }: { layers: HubMockupLayer[]; description?: string }) {
  return (
    <div>
      {layers.map((layer, layerIndex) => {
        const color = getLayerColor(layerIndex);

        return (
          <div key={layer.label}>
            {/* Arrow between layers — label comes from the previous layer's transition field */}
            {layerIndex > 0 && (
              <LayerArrow index={layerIndex} label={layers[layerIndex - 1].transition} />
            )}

            {/* Layer label — above nodes */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: layerIndex * 0.12 }}
              viewport={{ once: true, margin: "-30px" }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wider mb-3"
                style={{ color }}
              >
                {layer.label}
              </p>

              {/* Layer nodes */}
              <div className="flex flex-wrap gap-3 justify-center">
                {layer.nodes.map((node, nodeIndex) => (
                  <div
                    key={node.id}
                    className={cn(
                      "flex-1",
                      layer.nodes.length === 1
                        ? "max-w-sm"
                        : "min-w-[140px] max-w-[220px]"
                    )}
                  >
                    <NodeCard
                      node={node}
                      index={nodeIndex}
                      accentColor={color}
                      isCenter={layerIndex === 0 && layer.nodes.length === 1}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        );
      })}

      {description && (
        <div className="mt-8 border-l-2 border-accent/20 pl-4">
          <p className="text-sm text-muted leading-relaxed italic">{description}</p>
        </div>
      )}
    </div>
  );
}

export function HubMockup({
  section,
}: {
  section: HubMockupSection;
}) {
  const { center, nodes, connections, layers, description } = section.content;

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className="mt-8">
        {/* Layered mode: render as hierarchical rows with arrows */}
        {layers && layers.length > 0 ? (
          <LayeredView layers={layers} description={description} />
        ) : (
          <>
            {/* Legacy flat mode: center + grid */}
            <div className="mb-6 flex justify-center">
              <div className="w-full max-w-xs">
                <NodeCard node={center} index={0} isCenter />
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <div className="flex items-center gap-2">
                {nodes.slice(0, 5).map((_, i) => (
                  <div key={i} className="h-8 w-px bg-border" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {nodes.map((node, index) => (
                <NodeCard key={node.id} node={node} index={index} />
              ))}
            </div>

            {connections && connections.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
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
          </>
        )}
      </div>

      {!layers && description && (
        <p className="mt-6 text-sm text-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
