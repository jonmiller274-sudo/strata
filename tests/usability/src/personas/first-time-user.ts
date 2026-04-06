import type { Persona } from "./index.js";

export const firstTimeUser: Persona = {
  id: "first-time-user",
  name: "First-Time User",
  description:
    "Someone who just discovered Strata — maybe from a shared link or LinkedIn post. " +
    "Desktop browser, reads at normal speed, moderate patience, not super technical.",
  viewport: { width: 1440, height: 900 },
  behavior: {
    readSpeed: "normal",
    tolerance: "medium",
    techSavvy: "low",
  },
};
