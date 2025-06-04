import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "TXMX Boxing",
  description:
    "TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience. By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture.",
  keywords: ["boxing", "fitness", "Mexican boxing", "TXMX", "training", "equipment"],
  authors: [{ name: "TXMX" }],
  creator: "TXMX",
  publisher: "TXMX",
  openGraph: {
    title: "TXMX Boxing",
    description:
      "TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience. By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture.",
    url: "https://txmx-boxing.com",
    siteName: "TXMX Boxing",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TXMX Boxing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Levantamos Los Puños",
    description:
      "TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience. By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture.",
    images: ["/og-image.jpg"],
    creator: "@txmx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2997115723796668');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2997115723796668&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
