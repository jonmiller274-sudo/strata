const ADJECTIVES = [
  "bold", "bright", "clear", "crisp", "deep", "fast", "fresh", "grand",
  "keen", "lean", "prime", "sharp", "smart", "swift", "true", "vivid",
  "agile", "clean", "dense", "fluid", "lucid", "solid", "stark", "vital",
];

const NOUNS = [
  "arc", "axis", "beam", "core", "edge", "flow", "grid", "helm",
  "lens", "link", "loop", "mesh", "node", "path", "peak", "plan",
  "pulse", "ridge", "scope", "shift", "spark", "stack", "surge", "wave",
];

export function generateSlug(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}-${noun}-${num}`;
}
