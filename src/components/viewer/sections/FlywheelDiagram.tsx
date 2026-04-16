"use client";

import { motion } from "framer-motion";

const LOOP_STEPS = [
  { label: "Discover\nBADAS", color: "#FF6B6B" },
  { label: "Gaps\nexposed", color: "#F7B731" },
  { label: "Buy\ndata", color: "#4ECDC4" },
  { label: "More gaps\nfound", color: "#FF6B6B" },
  { label: "Enrich\ndata", color: "#6C5CE7" },
];

const EXPAND_TEAMS = [
  { team: "ODD Expansion", product: "Risk Index", color: "#F7B731" },
  { team: "Mapping & Ops", product: "CityStream", color: "#A8E6CF" },
  { team: "Safety Team", product: "Atlas", color: "#4ECDC4" },
  { team: "Fleet Team", product: "3D Recon", color: "#6C5CE7" },
];

/** Place N items evenly around a circle, starting from top (–90°) */
function getCirclePos(index: number, total: number, radius: number, cx: number, cy: number) {
  const angle = ((2 * Math.PI) / total) * index - Math.PI / 2;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

/** SVG arc arrow between two points along the circle */
function ArcArrow({
  from,
  to,
  cx,
  cy,
  radius,
  color,
  index,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  cx: number;
  cy: number;
  radius: number;
  color: string;
  index: number;
}) {
  // Shorten the arc so arrows don't overlap with nodes
  const shrink = 24;
  const angleFrom = Math.atan2(from.y - cy, from.x - cx);
  const angleTo = Math.atan2(to.y - cy, to.x - cx);
  const fx = cx + radius * Math.cos(angleFrom) + shrink * Math.cos(angleTo);
  const fy = cy + radius * Math.sin(angleFrom) + shrink * Math.sin(angleTo);
  const tx = cx + radius * Math.cos(angleTo) - shrink * Math.cos(angleTo);
  const ty = cy + radius * Math.sin(angleTo) - shrink * Math.sin(angleTo);

  // Control point for a curved path (pull toward center slightly)
  const midAngle = (angleFrom + angleTo) / 2;
  // Handle angle wrapping for the last arc
  const adjustedMidAngle = index === LOOP_STEPS.length - 1
    ? midAngle + Math.PI
    : midAngle;
  const pullRadius = radius * 0.82;
  const cpx = cx + pullRadius * Math.cos(adjustedMidAngle);
  const cpy = cy + pullRadius * Math.sin(adjustedMidAngle);

  // Arrowhead direction
  const arrowAngle = Math.atan2(ty - cpy, tx - cpx);
  const aLen = 6;
  const a1x = tx - aLen * Math.cos(arrowAngle - 0.4);
  const a1y = ty - aLen * Math.sin(arrowAngle - 0.4);
  const a2x = tx - aLen * Math.cos(arrowAngle + 0.4);
  const a2y = ty - aLen * Math.sin(arrowAngle + 0.4);

  return (
    <g>
      <motion.path
        d={`M ${fx} ${fy} Q ${cpx} ${cpy} ${tx} ${ty}`}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 3"
        opacity="0.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
        viewport={{ once: true }}
      />
      <motion.polygon
        points={`${tx},${ty} ${a1x},${a1y} ${a2x},${a2y}`}
        fill={color}
        opacity="0.6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        transition={{ duration: 0.2, delay: 0.6 + index * 0.1 }}
        viewport={{ once: true }}
      />
    </g>
  );
}

function Flywheel() {
  const size = 230;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 85;
  const nodeRadius = 30;

  const positions = LOOP_STEPS.map((_, i) => getCirclePos(i, LOOP_STEPS.length, radius, cx, cy));

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Center label */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-muted text-[10px] font-medium uppercase tracking-wide">
          Spend
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
          compounds
        </text>

        {/* Arc arrows between nodes */}
        {LOOP_STEPS.map((step, i) => {
          const next = (i + 1) % LOOP_STEPS.length;
          return (
            <ArcArrow
              key={`arc-${i}`}
              from={positions[i]}
              to={positions[next]}
              cx={cx}
              cy={cy}
              radius={radius}
              color={step.color}
              index={i}
            />
          );
        })}

        {/* Nodes */}
        {LOOP_STEPS.map((step, i) => {
          const pos = positions[i];
          const lines = step.label.split("\n");
          return (
            <motion.g
              key={step.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
              viewport={{ once: true }}
            >
              {/* Node background */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill="var(--color-background, #0f1117)"
                stroke={step.color}
                strokeWidth="2"
                opacity="0.9"
              />
              {/* Glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius + 4}
                fill="none"
                stroke={step.color}
                strokeWidth="1"
                opacity="0.15"
              />
              {/* Label */}
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={pos.x}
                  y={pos.y + (li - (lines.length - 1) / 2) * 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground text-[10px] font-medium"
                  style={{ pointerEvents: "none" }}
                >
                  {line}
                </text>
              ))}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

export function FlywheelDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-40px" }}
      className="mt-6 rounded-2xl border border-white/[0.08] overflow-hidden"
      style={{ background: "var(--color-card, #1a1d28)" }}
    >
      {/* Gradient top border */}
      <div
        className="h-[3px] w-full"
        style={{ background: "linear-gradient(90deg, #FF6B6B, #F7B731, #4ECDC4, #6C5CE7)" }}
      />

      <div className="p-4">
        {/* Section label */}
        <p className="text-[10px] font-medium uppercase tracking-wide text-accent/70 mb-1">
          The Growth Engine
        </p>
        <h3 className="text-base font-bold tracking-tight mb-4">
          One Engineer → Enterprise Platform Deal
        </h3>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">

          {/* LEFT: Flywheel */}
          <div className="flex flex-col items-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#FF6B6B]/80 mb-3 self-start">
              The Addiction Loop
            </p>
            <Flywheel />
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted">Spend:</span>
              <span className="text-xs font-bold text-[#4ECDC4]">$10K/mo</span>
              <span className="text-xs text-muted">→</span>
              <span className="text-xs font-bold text-[#4ECDC4]">$100K/mo</span>
            </div>
          </div>

          {/* CENTER: Slack bridge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-2 px-2"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center max-w-[160px]">
              <div className="text-lg mb-1">💬</div>
              <p className="text-[10px] text-muted leading-snug italic">
                &ldquo;Look at this BADAS exposure gap&rdquo;
              </p>
              <p className="text-[10px] text-muted/60 mt-1">Shared via Slack</p>
            </div>
            <svg width="40" height="24" viewBox="0 0 40 24" className="text-accent/40 rotate-0 lg:-rotate-90 lg:w-6 lg:h-10">
              <line x1="20" y1="0" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
              <polygon points="15,16 20,23 25,16" fill="currentColor" />
            </svg>
          </motion.div>

          {/* RIGHT: Land & Expand */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#4ECDC4]/80 mb-3">
              The Land &amp; Expand
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXPAND_TEAMS.map((item, i) => (
                <motion.div
                  key={item.team}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-white/[0.08] p-3"
                  style={{ background: "var(--color-background, #0f1117)" }}
                >
                  <p className="text-[10px] text-muted mb-1">{item.team}</p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-sm font-medium">{item.product}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted">Teams:</span>
              <span className="text-xs font-bold text-[#6C5CE7]">1 engineer</span>
              <span className="text-xs text-muted">→</span>
              <span className="text-xs font-bold text-[#6C5CE7]">5 teams</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
