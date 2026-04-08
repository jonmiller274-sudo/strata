import { execSync } from "child_process";

export interface OpenPRsData {
  total: number;
  byTier: Record<string, number>;
  oldestPR: { number: number; title: string; daysOld: number } | null;
  reviewQueue: number; // tier-2 PRs awaiting Jon
}

export function collectOpenPRs(repo: string): OpenPRsData {
  const raw = execSync(
    `gh pr list --repo ${repo} --state open --limit 50 --json number,title,createdAt,labels`,
    { encoding: "utf-8" }
  );

  const prs: Array<{
    number: number;
    title: string;
    createdAt: string;
    labels: Array<{ name: string }>;
  }> = JSON.parse(raw);

  const byTier: Record<string, number> = {};
  let reviewQueue = 0;
  let oldestPR: OpenPRsData["oldestPR"] = null;
  const now = new Date();

  for (const pr of prs) {
    const tierLabel = pr.labels.find((l) => l.name.startsWith("tier-"));
    const tier = tierLabel ? tierLabel.name : "untiered";
    byTier[tier] = (byTier[tier] || 0) + 1;

    if (tier === "tier-2") {
      reviewQueue++;
    }

    const createdDate = new Date(pr.createdAt);
    const daysOld = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (!oldestPR || daysOld > oldestPR.daysOld) {
      oldestPR = { number: pr.number, title: pr.title, daysOld };
    }
  }

  return { total: prs.length, byTier, oldestPR, reviewQueue };
}
