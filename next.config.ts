import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  /* config options here */

  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "riseofachampion.com",
          },
        ],
        destination: "https://www.txmxboxing.com/riseofachampion",
        permanent: true,
      },
      {
        source: "/(.*)",
        has: [
          {
            type: "host",
            value: "riseofachampion.com",
          },
        ],
        destination: "https://www.txmxboxing.com/riseofachampion",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/groovy-ego-462522-v2.firebasestorage.app/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    localPatterns: [
      {
        pathname: '/api/gallery/image**',
      },
    ],
  },
};

export default withBotId(nextConfig);
