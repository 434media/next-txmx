"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { useState } from "react"
import Navbar from "./components/navbar"
import SlideOutModal from "./components/slide-out-modal"
import GlobalStyles from "./components/global-styles"
import "./globals.css"
import Footer from "./components/footer"
import { Analytics } from "@vercel/analytics/next"

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

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <html lang="en" className="scroll-smooth" translate="no">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* Google Analytics Tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-R7VB7PGM2J"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-R7VB7PGM2J');
            `,
          }}
        />

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

        <title>TXMX Boxing</title>
        <meta
          name="description"
          content="TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience. By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture."
        />
        <meta name="keywords" content="boxing, fitness, Mexican boxing, TXMX, training, equipment" />
        <meta name="author" content="TXMX" />
        <meta name="creator" content="TXMX" />
        <meta name="publisher" content="TXMX" />

        {/* Open Graph */}
        <meta property="og:title" content="TXMX Boxing" />
        <meta
          property="og:description"
          content="TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience. By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture."
        />
        <meta property="og:url" content="https://txmx-boxing.com" />
        <meta property="og:site_name" content="TXMX Boxing" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="TXMX Boxing" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Levantamos Los Puños" />
        <meta
          name="twitter:description"
          content="TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience. By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture."
        />
        <meta name="twitter:image" content="/og-image.jpg" />
        <meta name="twitter:creator" content="@txmx" />

        {/* Robots */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />

        {/* Verification */}
        <meta name="google-site-verification" content="your-google-verification-code" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-x-hidden`}>
        <Analytics />

        <GlobalStyles />
        <Navbar onMenuClick={openModal} />
        {children}        
        <Footer />
        
        {/* Universal Slide Out Modal */}
        <SlideOutModal isOpen={isModalOpen} onClose={closeModal} />
      </body>
    </html>
  )
}
