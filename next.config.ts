import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendPort = process.env.PORT || '5001';
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
