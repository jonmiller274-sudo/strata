import { ImageResponse } from "next/og";
import { getArtifactBySlug, getArtifactForEdit } from "@/lib/artifacts/actions";

export const runtime = "edge";
export const alt = "Strata — Interactive Strategy Artifact";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DEFAULT_PALETTE = [
  "#2fd8c8", // teal
  "#7c6df0", // purple
  "#f0b429", // amber
  "#f06460", // coral
  "#36d399", // green
];

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artifact = await getArtifactForEdit(slug);

  if (!artifact) {
    // Fallback: generic Strata card
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0d0e14",
            color: "#e8eaf0",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Strata
        </div>
      ),
      { ...size }
    );
  }

  const title = artifact.title || "Untitled";
  const subtitle = artifact.subtitle || "";
  const author = artifact.author_name || "";
  const sectionCount = artifact.sections?.length || 0;
  const palette = artifact.branding?.palette
    ? [
        artifact.branding.palette.accent1,
        artifact.branding.palette.accent2,
        artifact.branding.palette.accent3,
        artifact.branding.palette.accent4,
        artifact.branding.palette.accent5,
      ].filter(Boolean)
    : DEFAULT_PALETTE;

  // Ensure we always have 5 colors
  while (palette.length < 5) {
    palette.push(DEFAULT_PALETTE[palette.length % DEFAULT_PALETTE.length]);
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
          backgroundColor: "#0d0e14",
          border: "1px solid #2a2e3f",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left zone: text content (60%) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "60%",
            padding: "48px",
          }}
        >
          {/* Strata wordmark */}
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontWeight: 700,
              color: "#6b7280",
              letterSpacing: "4px",
              textTransform: "uppercase" as const,
              marginBottom: "32px",
            }}
          >
            STRATA
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 700,
              color: "#e8eaf0",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 400,
                color: "#8b92a8",
                lineHeight: 1.4,
                marginBottom: "24px",
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Meta line: section count + author */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Section count pill */}
            <div
              style={{
                display: "flex",
                fontSize: 13,
                color: "#6b7280",
                border: "1px solid #2a2e3f",
                borderRadius: "999px",
                padding: "4px 14px",
              }}
            >
              {sectionCount} sections
            </div>

            {/* Author */}
            {author && (
              <div
                style={{
                  display: "flex",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                By {author}
              </div>
            )}
          </div>
        </div>

        {/* Right zone: stacked palette bars (40%) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "40%",
            padding: "48px 56px",
          }}
        >
          {palette.slice(0, 5).map((color, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                height: "16px",
                backgroundColor: color,
                opacity: 0.85,
                borderRadius: "6px",
                marginBottom: i < 4 ? "10px" : "0px",
              }}
            />
          ))}

          {/* Domain */}
          <div
            style={{
              display: "flex",
              fontSize: 12,
              color: "#6b7280",
              marginTop: "24px",
            }}
          >
            sharestrata.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
