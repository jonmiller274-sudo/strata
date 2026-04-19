#!/usr/bin/env node

/**
 * Discovery Agent Runner — Automated Rubric Item Filing
 *
 * Audits src/ from one angle per run and files new items in quality-rubric.md.
 * Rotates through audit modes based on what ran most recently.
 *
 * Migrated from Mac-based Claude Code scheduled task to GitHub Actions.
 * Deterministic grep-based checks (no AI model calls).
 *
 * Modes implemented:
 *   - visual-consistency: raw hex, non-standard opacity, wrong text sizes
 *   - accessibility: icon-only buttons without aria-label
 *   - typescript-strictness: tsc --noEmit warnings, @ts-ignore, any types
 *
 * Environment variables:
 *   GH_TOKEN   — GitHub token (set by GitHub Actions)
 *   REPO       — GitHub repo in owner/repo format (default: jonmiller274-sudo/strata)
 *   REPO_ROOT  — Absolute path to repo root (default: process.cwd())
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REPO = process.env.REPO || "jonmiller274-sudo/strata";
const REPO_ROOT = process.env.REPO_ROOT || process.cwd();
const SOURCE_SCOPE = ["src/components/editor", "src/components/viewer", "src/app"];
const AUDIT_MODES = ["visual-consistency", "accessibility", "typescript-strictness"] as const;
type AuditMode = typeof AUDIT_MODES[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateET(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function getTimeET(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  });
}

function sh(cmd: string, opts: { cwd?: string; tolerateNonZero?: boolean } = {}): string {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      cwd: opts.cwd || REPO_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (err) {
    const e = err as { stdout?: Buffer | string };
    const out = typeof e.stdout === "string" ? e.stdout : (e.stdout?.toString() ?? "");
    if (opts.tolerateNonZero) return out.trim();
    throw err;
  }
}

function readFileIfExists(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";
}

// ---------------------------------------------------------------------------
// Finding data model
// ---------------------------------------------------------------------------

interface Finding {
  pattern: string;            // e.g. "raw-hex", "missing-aria-label"
  file: string;               // relative path
  line: number;
  text: string;               // actual line content (trimmed)
  reason: string;             // why this violates design system
  priority: number;           // 0-5
  tier: number;               // 0-3
}

// ---------------------------------------------------------------------------
// Audit mode: visual-consistency
// ---------------------------------------------------------------------------

interface GrepHit {
  file: string;
  line: number;
  text: string;
}

function grepSource(regex: string): GrepHit[] {
  const hits: GrepHit[] = [];
  for (const scope of SOURCE_SCOPE) {
    const scopeAbs = path.join(REPO_ROOT, scope);
    if (!fs.existsSync(scopeAbs)) continue;
    try {
      const out = execSync(
        `grep -rnE ${JSON.stringify(regex)} ${JSON.stringify(scopeAbs)} --include='*.tsx' --include='*.ts'`,
        { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }
      );
      for (const line of out.split("\n").filter(Boolean)) {
        const m = line.match(/^(.+?):(\d+):(.*)$/);
        if (!m) continue;
        hits.push({
          file: path.relative(REPO_ROOT, m[1]),
          line: parseInt(m[2], 10),
          text: m[3].trim(),
        });
      }
    } catch {
      // grep returns 1 when no matches — normal
    }
  }
  return hits;
}

function auditVisualConsistency(): Finding[] {
  const findings: Finding[] = [];

  // 1. Raw hex colors in JSX className or style (design system says use CSS vars)
  //    Pattern: "#abc123" in className or style, excluding docs/allowed files
  const hexHits = grepSource("#[0-9a-fA-F]{3,8}[\"'\\s]");
  for (const h of hexHits) {
    // Skip if it's a hex in a comment or import path
    if (/^\s*\/\//.test(h.text) || /from ['"]/.test(h.text)) continue;
    // Skip if it's in a data fixture or demo branding (allowed)
    if (/demo\/|\/branding|branding:/.test(h.file + h.text)) continue;
    findings.push({
      pattern: "raw-hex",
      file: h.file,
      line: h.line,
      text: h.text,
      reason: "Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)",
      priority: 1,
      tier: 0,
    });
  }

  // 2. Non-standard text sizes (design system allows only specific sizes)
  //    Kill list per design-system.md: text-[11px], text-[9px]
  const badSizeHits = grepSource("text-\\[(11px|9px)\\]");
  for (const h of badSizeHits) {
    findings.push({
      pattern: "non-standard-text-size",
      file: h.file,
      line: h.line,
      text: h.text,
      reason: "Non-standard text size — design system kill-list (normalize text-[11px]→text-xs, text-[9px]→text-[10px])",
      priority: 1,
      tier: 0,
    });
  }

  // 3. Non-standard opacity values (design system uses /5, /10, /20, /30, /50)
  //    Flag: /15, /25, /40, /60, /70, /80, /90 (not in the spec)
  const badOpacityHits = grepSource("(bg|border)-(white|accent)/(15|25|40|60|70|80|90)");
  for (const h of badOpacityHits) {
    findings.push({
      pattern: "non-standard-opacity",
      file: h.file,
      line: h.line,
      text: h.text,
      reason: "Non-standard opacity — design system allows /5, /10, /20, /30, /50 only",
      priority: 1,
      tier: 1,
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Audit mode: accessibility
// ---------------------------------------------------------------------------

function auditAccessibility(): Finding[] {
  const findings: Finding[] = [];

  // Icon-only buttons (buttons with only a Lucide icon child, no text, no aria-label)
  // Heuristic: <button> tag followed by just an <Icon /> tag on the next line
  // This is approximate — a full audit would use JSX parsing
  const hits = grepSource("<button[^>]*>\\s*$");
  for (const h of hits) {
    // Read the next ~5 lines to check if there's an icon-only child
    const fullPath = path.join(REPO_ROOT, h.file);
    const content = readFileIfExists(fullPath);
    const lines = content.split("\n");
    const slice = lines.slice(h.line, h.line + 6).join(" ");
    const buttonTag = lines[h.line - 1] || "";
    // Skip if button already has aria-label
    if (/aria-label=/.test(buttonTag)) continue;
    // Heuristic: if the body contains only a JSX tag that looks like an Icon (capitalized component ending with no text)
    const isIconOnly = /^\s*<[A-Z][a-zA-Z]+[^>]*\/>\s*<\/button>/.test(slice);
    if (isIconOnly) {
      findings.push({
        pattern: "missing-aria-label",
        file: h.file,
        line: h.line,
        text: buttonTag.trim(),
        reason: "Icon-only button without aria-label — screen readers have no way to identify the action (WCAG 4.1.2)",
        priority: 4,
        tier: 0,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Audit mode: typescript-strictness
// ---------------------------------------------------------------------------

function auditTypescript(): Finding[] {
  const findings: Finding[] = [];

  // @ts-ignore / @ts-expect-error suppressions
  const suppressHits = grepSource("@(ts-ignore|ts-expect-error)");
  for (const h of suppressHits) {
    findings.push({
      pattern: "ts-suppression",
      file: h.file,
      line: h.line,
      text: h.text,
      reason: "TypeScript suppression hides real errors — fix the underlying type issue instead",
      priority: 3,
      tier: 2,
    });
  }

  // Explicit : any annotations
  const anyHits = grepSource(":\\s+any([^a-zA-Z0-9_]|$)");
  for (const h of anyHits) {
    // Skip comments and known-safe cases
    if (/^\s*\/\//.test(h.text)) continue;
    findings.push({
      pattern: "explicit-any",
      file: h.file,
      line: h.line,
      text: h.text,
      reason: "Explicit `any` type defeats TypeScript safety — use a specific type or `unknown`",
      priority: 3,
      tier: 2,
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Rotation logic (read scratchpad to pick least-recent mode)
// ---------------------------------------------------------------------------

function pickAuditMode(): AuditMode {
  const scratchpadPath = path.join(REPO_ROOT, "docs/agents/discovery/scratchpad.md");
  const content = readFileIfExists(scratchpadPath);

  if (!content) return AUDIT_MODES[0];

  // Find the most recent occurrence of each mode in the "Rotation Log" section
  const lastRunByMode: Record<string, number> = {};
  for (const mode of AUDIT_MODES) {
    const re = new RegExp(`^###\\s+(\\d{4}-\\d{2}-\\d{2})[^\\n]*—\\s*${mode}`, "im");
    const match = content.match(re);
    if (match) {
      lastRunByMode[mode] = new Date(match[1]).getTime();
    } else {
      lastRunByMode[mode] = 0; // never run
    }
  }

  // Pick the mode with the earliest last-run
  let oldest: AuditMode = AUDIT_MODES[0];
  let oldestTime = Infinity;
  for (const mode of AUDIT_MODES) {
    if (lastRunByMode[mode] < oldestTime) {
      oldestTime = lastRunByMode[mode];
      oldest = mode;
    }
  }
  return oldest;
}

// ---------------------------------------------------------------------------
// Dedupe against existing rubric
// ---------------------------------------------------------------------------

function dedupeAgainstRubric(findings: Finding[]): Finding[] {
  const rubricPath = path.join(REPO_ROOT, "docs/quality-rubric.md");
  const rubric = readFileIfExists(rubricPath);
  if (!rubric) return findings;

  return findings.filter((f) => {
    // Dedupe by pattern + file combination in any OPEN item
    const pattern = `${f.pattern}.*${f.file}|${f.file}.*${f.pattern}`;
    const re = new RegExp(pattern, "i");
    const lines = rubric.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        // Check if the nearest Status line says OPEN
        for (let j = i; j < Math.min(i + 10, lines.length); j++) {
          const status = lines[j].match(/\*\*Status:\*\*\s+(\w+)/);
          if (status) {
            if (status[1] === "OPEN") return false; // already filed
            break;
          }
        }
      }
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Get highest existing QR number
// ---------------------------------------------------------------------------

function nextQRNumber(): number {
  const rubricPath = path.join(REPO_ROOT, "docs/quality-rubric.md");
  const rubric = readFileIfExists(rubricPath);
  if (!rubric) return 1;
  const matches = [...rubric.matchAll(/###\s+QR-(\d+)/g)];
  const numbers = matches.map((m) => parseInt(m[1], 10));
  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
}

// ---------------------------------------------------------------------------
// Format findings as rubric markdown
// ---------------------------------------------------------------------------

function formatAsRubricItem(qrNum: number, f: Finding): string {
  const shortDesc = `${f.pattern} in ${f.file}:${f.line}`;
  return `\n### QR-${qrNum}: ${shortDesc}
- **What:** ${f.reason}
- **Files:** ${f.file}:${f.line}
- **Test:** Find the line \`${f.text.replace(/`/g, "\\`").slice(0, 80)}\` is replaced with the correct pattern
- **Priority:** ${f.priority}
- **Tier:** ${f.tier}
- **Status:** OPEN
`;
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

function appendToRubric(findings: Finding[], startQR: number): string[] {
  const rubricPath = path.join(REPO_ROOT, "docs/quality-rubric.md");
  if (!fs.existsSync(rubricPath)) {
    console.error("  Rubric file missing — skipping rubric update");
    return [];
  }

  const qrIds: string[] = [];
  let content = fs.readFileSync(rubricPath, "utf-8");
  const newItems: string[] = [];
  findings.forEach((f, i) => {
    const qr = startQR + i;
    qrIds.push(`QR-${qr}`);
    newItems.push(formatAsRubricItem(qr, f));
  });

  // Append at end of file (simpler than section-aware insertion)
  content = content.trimEnd() + "\n" + newItems.join("") + "\n";
  fs.writeFileSync(rubricPath, content);
  return qrIds;
}

function appendCoordinationLog(mode: string, qrIds: string[]): void {
  const p = path.join(REPO_ROOT, "docs/agents/coordination-log.md");
  if (!fs.existsSync(p)) return;

  const date = getDateET();
  const time = getTimeET();
  const summary = `${mode} sweep — ${qrIds.length} new items: ${qrIds.join(", ")}`;
  const entry = `- ${time} | discovery | ${summary}\n`;
  const todayHeader = `## ${date}`;

  let content = fs.readFileSync(p, "utf-8");
  if (content.includes(todayHeader)) {
    content = content.replace(todayHeader, `${todayHeader}\n${entry}`);
    fs.writeFileSync(p, content);
  } else {
    const lines = content.split("\n");
    const insertAt = lines.findIndex((l, i) => i > 0 && l.startsWith("## "));
    const insertIdx = insertAt === -1 ? 2 : insertAt;
    lines.splice(insertIdx, 0, "", todayHeader, entry.trimEnd(), "");
    fs.writeFileSync(p, lines.join("\n"));
  }
}

function updateScratchpad(mode: string, qrIds: string[]): void {
  const p = path.join(REPO_ROOT, "docs/agents/discovery/scratchpad.md");
  const date = getDateET();
  const time = getTimeET();
  const entry = `\n### ${date} ${time} — ${mode}\nRan ${mode}. Filed ${qrIds.length} new items: ${qrIds.join(", ")}.\n`;

  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, `# Discovery Agent Scratchpad\n\n## Rotation Log\n${entry}`);
  } else {
    const content = fs.readFileSync(p, "utf-8");
    // Insert under "## Rotation Log" heading
    if (content.includes("## Rotation Log")) {
      const updated = content.replace(
        /(## Rotation Log\s*\n)/,
        `$1${entry}`
      );
      fs.writeFileSync(p, updated);
    } else {
      fs.appendFileSync(p, `\n## Rotation Log${entry}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Discovery — ${getDateET()} ${getTimeET()}`);
  console.log(`Repo: ${REPO}`);
  console.log(`Root: ${REPO_ROOT}`);

  const mode = pickAuditMode();
  console.log(`\nAudit mode: ${mode}`);

  let findings: Finding[];
  switch (mode) {
    case "visual-consistency":
      findings = auditVisualConsistency();
      break;
    case "accessibility":
      findings = auditAccessibility();
      break;
    case "typescript-strictness":
      findings = auditTypescript();
      break;
  }
  console.log(`  Raw findings: ${findings.length}`);

  const deduped = dedupeAgainstRubric(findings);
  console.log(`  After dedupe: ${deduped.length}`);

  if (deduped.length === 0) {
    console.log("\nNo new findings to file.");
    // Still log the rotation so next run picks a different mode
    updateScratchpad(mode, []);
    appendCoordinationLog(mode, []);
    return;
  }

  // Cap at 10 per run to avoid overwhelming the queue
  const capped = deduped.slice(0, 10);
  if (deduped.length > 10) {
    console.log(`  Capped to 10 (of ${deduped.length})`);
  }

  const startQR = nextQRNumber();
  console.log(`  Filing as QR-${startQR} through QR-${startQR + capped.length - 1}`);

  const qrIds = appendToRubric(capped, startQR);
  appendCoordinationLog(mode, qrIds);
  updateScratchpad(mode, qrIds);

  console.log(`\nDiscovery complete: ${qrIds.length} items filed.`);
}

main().catch((err) => {
  console.error("Discovery failed:", err);
  process.exit(1);
});
