import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
};

export default nextConfig;
