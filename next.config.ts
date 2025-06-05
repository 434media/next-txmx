import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

   eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ampd-asset.s3.us-east-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
