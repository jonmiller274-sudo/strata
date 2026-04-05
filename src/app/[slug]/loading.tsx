export default function ArtifactLoading() {
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Sidebar skeleton — desktop only */}
      <aside
        className="hidden lg:flex flex-col shrink-0 border-r"
        style={{
          width: "var(--sidebar-width, 240px)",
          borderColor: "rgba(255,255,255,0.10)",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          padding: "24px 16px",
          gap: "8px",
        }}
      >
        {/* Logo / title block */}
        <div className="space-y-2 mb-6">
          <div
            className="h-4 rounded animate-pulse"
            style={{ width: "70%", backgroundColor: "rgba(255,255,255,0.08)" }}
          />
          <div
            className="h-3 rounded animate-pulse"
            style={{ width: "50%", backgroundColor: "rgba(255,255,255,0.05)" }}
          />
        </div>
        {/* Nav item skeletons */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 rounded-lg animate-pulse"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </aside>

      {/* Main content skeleton */}
      <main
        className="flex-1 flex flex-col items-center justify-start px-6 py-16 lg:ml-[var(--sidebar-width,240px)]"
        style={{ maxWidth: "100%" }}
      >
        <div className="w-full" style={{ maxWidth: "900px" }}>
          {/* Section title */}
          <div
            className="h-8 rounded-lg animate-pulse mb-3"
            style={{ width: "55%", backgroundColor: "rgba(255,255,255,0.08)" }}
          />
          {/* Section subtitle */}
          <div
            className="h-4 rounded animate-pulse mb-12"
            style={{ width: "38%", backgroundColor: "rgba(255,255,255,0.05)" }}
          />

          {/* Content block 1 */}
          <div
            className="h-48 rounded-xl animate-pulse mb-6"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", animationDelay: "100ms" }}
          />

          {/* Content block 2 */}
          <div
            className="h-32 rounded-xl animate-pulse mb-6"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", animationDelay: "180ms" }}
          />

          {/* Content block 3 */}
          <div
            className="h-40 rounded-xl animate-pulse"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", animationDelay: "260ms" }}
          />
        </div>
      </main>
    </div>
  );
}
