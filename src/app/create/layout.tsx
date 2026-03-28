import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Artifact — Strata",
  description:
    "Paste your strategic content, pick a template, and AI structures it into an interactive artifact in seconds.",
  openGraph: {
    title: "Create an Artifact — Strata",
    description:
      "Paste your strategic content, pick a template, and AI structures it into an interactive artifact in seconds.",
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
