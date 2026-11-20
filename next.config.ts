import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

// Security headers. The CSP lists only what the site loads: Google Analytics,
// the Meta Pixel, the Simpli.fi retargeting tag, Firebase Auth/Firestore (admin
// sign-in, client reads), Cloud/Firebase Storage media and same-origin BotID /
// Vercel Analytics. Scripts keep 'unsafe-inline' because the pages are static
// and Next's inline flight scripts, the GA / Pixel loaders and the admin recap
// preview's inline onload have no nonce; every other directive is locked down.
// Stripe.js is not listed: Stripe is retired and /checkout only loads it when
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set (it is not).
const isPreview = process.env.VERCEL_ENV === "preview";
const isDev = process.env.NODE_ENV === "development";
// The Vercel toolbar is injected on preview deployments only.
const toolbar = isPreview ? " https://vercel.live" : "";
// Firebase Auth's sign-in helper iframe is served from the auth domain.
const firebaseAuthOrigin = `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "groovy-ego-462522-v2.firebaseapp.com"}`;
// Simpli.fi's tag chains further scripts, pixels and sync frames across its
// own subdomains; allow all of *.simpli.fi rather than chase individual hosts.
const simplifi = "https://*.simpli.fi";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net https://tag.simpli.fi ${simplifi} https://apis.google.com${toolbar}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://storage.googleapis.com https://firebasestorage.googleapis.com https://images.unsplash.com https://lh3.googleusercontent.com https://picsum.photos https://fastly.picsum.photos https://www.facebook.com https://*.google-analytics.com https://www.googletagmanager.com ${simplifi}` +
    (isPreview ? " https://vercel.live https://vercel.com" : ""),
  "font-src 'self' data:" + (isPreview ? " https://vercel.live" : ""),
  "media-src 'self' https://storage.googleapis.com https://commondatastorage.googleapis.com",
  `connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net ${simplifi}` +
    (isPreview ? " https://vercel.live wss://ws-us3.pusher.com" : ""),
  `frame-src ${firebaseAuthOrigin} https://www.facebook.com ${simplifi}${toolbar}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

// Matches riseofachampion.com and www.riseofachampion.com.
const ROAC_HOST = "(?:www\\.)?riseofachampion\\.com";

const nextConfig: NextConfig = {
  /* config options here */

  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      // Both riseofachampion.com and www.riseofachampion.com point at this
      // project; every path on either host (including /admin) goes to the
      // Iconic Series page so the full site is never served under that name.
      {
        source: "/",
        has: [
          {
            type: "host",
            value: ROAC_HOST,
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
            value: ROAC_HOST,
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

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
  },
};

export default withBotId(nextConfig);
