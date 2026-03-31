"use client";

import type { SectionType } from "@/types/artifact";

interface SectionTypePreviewProps {
  type: SectionType;
}

export function SectionTypePreview({ type }: SectionTypePreviewProps) {
  return (
    <div className="w-full h-[56px] rounded bg-white/5 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 120 56" className="w-full h-full" fill="none">
        {previews[type]}
      </svg>
    </div>
  );
}

const bar = "var(--color-accent, #6366f1)";
const muted = "rgba(255,255,255,0.12)";
const text = "rgba(255,255,255,0.25)";

const previews: Record<SectionType, React.ReactNode> = {
  "rich-text": (
    <>
      <rect x="16" y="10" width="60" height="4" rx="2" fill={text} />
      <rect x="16" y="18" width="88" height="3" rx="1.5" fill={muted} />
      <rect x="16" y="24" width="80" height="3" rx="1.5" fill={muted} />
      <rect x="16" y="30" width="85" height="3" rx="1.5" fill={muted} />
      <rect x="16" y="38" width="70" height="3" rx="1.5" fill={muted} />
      <rect x="16" y="44" width="40" height="3" rx="1.5" fill={muted} />
    </>
  ),
  "expandable-cards": (
    <>
      <rect x="10" y="8" width="46" height="18" rx="3" fill={muted} stroke={bar} strokeWidth="0.5" />
      <rect x="64" y="8" width="46" height="18" rx="3" fill={muted} />
      <rect x="10" y="30" width="46" height="18" rx="3" fill={muted} />
      <rect x="64" y="30" width="46" height="18" rx="3" fill={muted} />
      <rect x="14" y="12" width="24" height="3" rx="1.5" fill={text} />
      <rect x="14" y="18" width="36" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
    </>
  ),
  timeline: (
    <>
      <circle cx="24" cy="12" r="4" fill={bar} />
      <line x1="24" y1="16" x2="24" y2="22" stroke={muted} strokeWidth="1.5" />
      <circle cx="24" cy="28" r="4" fill={bar} opacity="0.6" />
      <line x1="24" y1="32" x2="24" y2="38" stroke={muted} strokeWidth="1.5" />
      <circle cx="24" cy="44" r="4" fill={bar} opacity="0.3" />
      <rect x="34" y="9" width="50" height="3" rx="1.5" fill={text} />
      <rect x="34" y="14" width="70" height="2" rx="1" fill={muted} />
      <rect x="34" y="25" width="40" height="3" rx="1.5" fill={text} />
      <rect x="34" y="41" width="45" height="3" rx="1.5" fill={text} />
    </>
  ),
  "tier-table": (
    <>
      <rect x="8" y="6" width="32" height="44" rx="3" fill={muted} />
      <rect x="44" y="6" width="32" height="44" rx="3" fill={bar} opacity="0.15" stroke={bar} strokeWidth="0.5" />
      <rect x="80" y="6" width="32" height="44" rx="3" fill={muted} />
      <rect x="14" y="11" width="20" height="3" rx="1.5" fill={text} />
      <rect x="50" y="11" width="20" height="3" rx="1.5" fill={bar} opacity="0.5" />
      <rect x="86" y="11" width="20" height="3" rx="1.5" fill={text} />
      <rect x="14" y="20" width="16" height="2" rx="1" fill={muted} />
      <rect x="50" y="20" width="16" height="2" rx="1" fill={muted} />
      <rect x="86" y="20" width="16" height="2" rx="1" fill={muted} />
    </>
  ),
  "metric-dashboard": (
    <>
      <rect x="8" y="10" width="30" height="36" rx="3" fill={muted} />
      <rect x="45" y="10" width="30" height="36" rx="3" fill={muted} />
      <rect x="82" y="10" width="30" height="36" rx="3" fill={muted} />
      <text x="23" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill={bar}>42</text>
      <text x="60" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill={bar}>8.5</text>
      <text x="97" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill={bar}>91</text>
      <rect x="13" y="36" width="20" height="2" rx="1" fill={text} />
      <rect x="50" y="36" width="20" height="2" rx="1" fill={text} />
      <rect x="87" y="36" width="20" height="2" rx="1" fill={text} />
    </>
  ),
  "data-viz": (
    <>
      <rect x="20" y="36" width="12" height="14" rx="1" fill={bar} opacity="0.4" />
      <rect x="36" y="24" width="12" height="26" rx="1" fill={bar} opacity="0.6" />
      <rect x="52" y="16" width="12" height="34" rx="1" fill={bar} opacity="0.8" />
      <rect x="68" y="28" width="12" height="22" rx="1" fill={bar} opacity="0.5" />
      <rect x="84" y="20" width="12" height="30" rx="1" fill={bar} />
      <line x1="14" y1="50" x2="106" y2="50" stroke={muted} strokeWidth="1" />
      <line x1="14" y1="10" x2="14" y2="50" stroke={muted} strokeWidth="1" />
    </>
  ),
  "hub-mockup": (
    <>
      <circle cx="60" cy="28" r="10" fill={bar} opacity="0.3" stroke={bar} strokeWidth="1" />
      <circle cx="28" cy="14" r="6" fill={muted} stroke={text} strokeWidth="0.5" />
      <circle cx="92" cy="14" r="6" fill={muted} stroke={text} strokeWidth="0.5" />
      <circle cx="28" cy="42" r="6" fill={muted} stroke={text} strokeWidth="0.5" />
      <circle cx="92" cy="42" r="6" fill={muted} stroke={text} strokeWidth="0.5" />
      <line x1="34" y1="17" x2="50" y2="24" stroke={muted} strokeWidth="0.8" />
      <line x1="86" y1="17" x2="70" y2="24" stroke={muted} strokeWidth="0.8" />
      <line x1="34" y1="39" x2="50" y2="32" stroke={muted} strokeWidth="0.8" />
      <line x1="86" y1="39" x2="70" y2="32" stroke={muted} strokeWidth="0.8" />
    </>
  ),
  "guided-journey": (
    <>
      <line x1="16" y1="28" x2="104" y2="28" stroke={muted} strokeWidth="2" />
      <circle cx="24" cy="28" r="5" fill={bar} />
      <circle cx="44" cy="28" r="5" fill={bar} opacity="0.7" />
      <circle cx="64" cy="28" r="5" fill={bar} opacity="0.5" />
      <circle cx="84" cy="28" r="5" fill={bar} opacity="0.3" />
      <circle cx="100" cy="28" r="3" fill={muted} stroke={text} strokeWidth="1" strokeDasharray="2 2" />
      <rect x="14" y="10" width="20" height="3" rx="1.5" fill={text} />
      <rect x="54" y="10" width="20" height="3" rx="1.5" fill={text} />
      <rect x="14" y="40" width="16" height="2" rx="1" fill={muted} />
      <rect x="54" y="40" width="16" height="2" rx="1" fill={muted} />
    </>
  ),
};
