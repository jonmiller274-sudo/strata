import Link from "next/link";

export default function ArtifactNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-[10px] font-medium text-[#6366f1]/60 uppercase tracking-widest mb-6">
          Strata
        </p>
        <h1 className="text-2xl font-bold text-[#e8eaf0] mb-3">
          This document doesn&apos;t exist
        </h1>
        <p className="text-sm text-[#8b92a8] mb-8">
          The link may be expired, mistyped, or the document was removed by its author.
        </p>
        <Link
          href="https://sharestrata.com"
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[#6366f1] text-white hover:bg-[#6366f1]/80 transition-colors"
        >
          Create your own
        </Link>
      </div>
    </div>
  );
}
