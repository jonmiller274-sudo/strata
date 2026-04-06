import type { Persona } from "./index.js";

export const mobileUser: Persona = {
  id: "mobile-user",
  name: "Mobile User",
  description:
    "Someone who received a Strata link via text or Slack and is viewing it on their phone " +
    "(iPhone 15 viewport). Scrolls slowly, moderate patience, moderately technical.",
  viewport: { width: 390, height: 844 },
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  behavior: {
    readSpeed: "slow",
    tolerance: "medium",
    techSavvy: "medium",
  },
};
