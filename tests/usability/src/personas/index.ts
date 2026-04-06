// ── Persona interface ────────────────────────────────────────────────────────

export interface Persona {
  id: string;
  name: string;
  description: string;
  viewport: { width: number; height: number };
  userAgent?: string;
  behavior: {
    readSpeed: "fast" | "normal" | "slow";
    tolerance: "low" | "medium" | "high";
    techSavvy: "low" | "medium" | "high";
  };
}

// ── Registry ────────────────────────────────────────────────────────────────

import { firstTimeUser } from "./first-time-user.js";
import { rushedExec } from "./rushed-exec.js";
import { mobileUser } from "./mobile-user.js";

export const PERSONAS: Record<string, Persona> = {
  "first-time-user": firstTimeUser,
  "rushed-exec": rushedExec,
  "mobile-user": mobileUser,
};

export function getPersona(id: string): Persona {
  const persona = PERSONAS[id];
  if (!persona) {
    throw new Error(`Unknown persona: ${id}. Available: ${Object.keys(PERSONAS).join(", ")}`);
  }
  return persona;
}
