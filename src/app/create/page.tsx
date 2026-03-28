import { Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Placeholder — full creation flow in Sub-phase 1C
export default function CreatePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <Layers className="h-10 w-10 text-accent mb-6" />
      <h1 className="text-3xl font-bold tracking-tight">Create an Artifact</h1>
      <p className="mt-4 max-w-md text-muted">
        Paste your strategic content, pick a template, and let AI structure it
        into an interactive artifact. Coming in Sub-phase 1C.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
