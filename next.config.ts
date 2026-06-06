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
        destination: "https://www.txmxboxing.com/icon-talks/rise-of-a-champion",
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
        destination: "https://www.txmxboxing.com/icon-talks/rise-of-a-champion",
        permanent: true,
      },

      // /events/* consolidated → /fight-nights (the fan game) and
      // /icon-talks (the Iconic Series). Specific rules first; the
      // /events/:path* catch-all (legacy [eventId], etc.) must stay last.
      {
        source: "/events/fight-night",
        destination: "/fight-nights",
        permanent: true,
      },
      {
        source: "/events/rise-of-a-champion",
        destination: "/icon-talks/rise-of-a-champion",
        permanent: true,
      },
      {
        source: "/events/rise-of-a-champion/gallery",
        destination: "/icon-talks/rise-of-a-champion/gallery",
        permanent: true,
      },
      {
        source: "/events/rise-of-a-champion/rsvp",
        destination: "/icon-talks/rise-of-a-champion/rsvp",
        permanent: true,
      },
      {
        source: "/events",
        destination: "/fight-nights",
        permanent: true,
      },
      {
        source: "/events/:path*",
        destination: "/fight-nights",
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
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/groovy-ego-462522-v2.firebasestorage.app/**",
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
