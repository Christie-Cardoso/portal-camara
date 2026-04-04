import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.camara.leg.br',
        pathname: '/internet/deputado/bandep/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api-camara/:path*',
        destination: 'https://dadosabertos.camara.leg.br/api/v2/:path*',
      },
    ];
  },
};

export default nextConfig;
