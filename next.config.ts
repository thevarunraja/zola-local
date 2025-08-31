import createBundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig: NextConfig = withBundleAnalyzer({
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  serverExternalPackages: ["shiki", "vscode-oniguruma"],
  // Removed Supabase image configuration since we're not using it
  eslint: {
    // @todo: remove before going live
    ignoreDuringBuilds: true,
  },
})

export default nextConfig
