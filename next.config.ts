import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 基本配置
  experimental: {
    optimizePackageImports: ['highlight.js'],
  },
  // 启用standalone输出，用于Docker部署
  // output: 'standalone',
}

export default nextConfig
