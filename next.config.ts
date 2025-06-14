import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 基本配置
  experimental: {
    optimizePackageImports: ['highlight.js'],
  },
}

export default nextConfig
