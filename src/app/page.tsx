import { Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex items-center gap-3 mb-8">
        <Layers className="h-10 w-10 text-accent" />
        <h1 className="text-4xl font-bold tracking-tight">Strata</h1>
      </div>

      <p className="max-w-xl text-lg text-muted leading-relaxed">
        Turn strategic content into polished, interactive artifacts.
        Build once — deliver as link, video, or PDF.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Create an artifact
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card-hover"
        >
          See the demo
        </Link>
      </div>

      <p className="mt-16 text-xs text-muted-foreground">
        Where strategy gets built before it becomes a slide deck, a video, or a PDF.
      </p>
    </div>
  );
}
