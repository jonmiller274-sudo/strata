import type { Persona } from "./index.js";

export const rushedExec: Persona = {
  id: "rushed-exec",
  name: "Rushed Executive",
  description:
    "A VP Sales who has a board presentation in 2 hours. Has a PDF deck, " +
    "needs it turned into something interactive FAST. Low patience for friction — " +
    "will bail if anything takes too long or is confusing.",
  viewport: { width: 1440, height: 900 },
  behavior: {
    readSpeed: "fast",
    tolerance: "low",
    techSavvy: "medium",
  },
};
