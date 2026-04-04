export default function ArtifactLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar skeleton */}
      <div className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-surface p-4 hidden lg:flex flex-col gap-3">
        <div className="h-6 w-3/4 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse mt-1" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="lg:ml-64 px-6 py-12 max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-3">
          <div className="h-9 w-2/3 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-5 w-1/2 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Section placeholders */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-6 space-y-4">
            <div className="h-5 w-1/3 rounded bg-white/10 animate-pulse" />
            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="h-20 rounded-lg bg-white/5 animate-pulse" />
              <div className="h-20 rounded-lg bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
