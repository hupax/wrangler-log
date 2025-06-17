import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 基本配置
  experimental: {
    optimizePackageImports: ['highlight.js'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
