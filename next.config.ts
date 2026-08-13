import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
  async rewrites() {
    const backendPort = process.env.API_PORT || process.env.BACKEND_PORT || '5001';
    const backendHost = process.env.BACKEND_HOST || '127.0.0.1';
    return [
      {
        source: '/api/v1/:path*',
        destination: `http://${backendHost}:${backendPort}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
