"use client"

import type React from "react"
import { Geist, Geist_Mono, Bebas_Neue, Orbitron } from "next/font/google"
import { GeistPixelSquare, GeistPixelGrid, GeistPixelCircle, GeistPixelTriangle, GeistPixelLine } from 'geist/font/pixel';
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Navbar from "../components/navbar"
import LiveRibbon from "../components/live-ribbon"
import SettlementToasts from "../components/settlement-toasts"
import NotificationPrompt from "../components/notification-prompt"
import SlideOutModal from "../components/slide-out-modal"
import { AuthProvider } from "../lib/auth-context"
import GlobalStyles from "../components/global-styles"
import "./globals.css"
import Footer from "../components/footer"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import type { FightNight } from "./actions/fightnight"

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

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
})

interface ClientLayoutProps {
  children: React.ReactNode
  activeFightNight?: FightNight | null
}

export default function ClientLayout({
  children,
  activeFightNight = null,
}: Readonly<ClientLayoutProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pathname = usePathname()

  // Register service worker for PWA + push notifications
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
  }, [])
  const isAdmin = pathname?.startsWith('/admin')

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <html lang="en" className="scroll-smooth">
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

        {/* Simpli.fi Retargeting Script */}
        <Script
          src="https://tag.simpli.fi/sifitag/5ea76a26-ff7f-46cf-b7d3-47031c857acb"
          strategy="afterInteractive"
          async
        />

        {/* Title, description, keywords, and OpenGraph/Twitter tags are owned by
            the Next.js Metadata API (app/layout.tsx + per-page metadata) — don't
            duplicate them here. */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${orbitron.variable} ${GeistPixelSquare.variable} ${GeistPixelGrid.variable} ${GeistPixelCircle.variable} ${GeistPixelTriangle.variable} ${GeistPixelLine.variable} antialiased bg-black text-white`} style={{ overflowY: 'auto', height: 'auto', minHeight: '100vh' }}>
        <Analytics />

        <AuthProvider>
          <GlobalStyles />
          <Navbar onMenuClick={openModal} activeFightNight={activeFightNight} />
          {!isAdmin && <LiveRibbon activeFightNight={activeFightNight} />}
          {!isAdmin && <SettlementToasts activeFightNight={activeFightNight} />}
          {!isAdmin && <NotificationPrompt activeFightNight={activeFightNight} />}
          {children}
          {!isAdmin && <Footer />}

          {/* Universal Slide Out Modal. No AuthModal is mounted — fan accounts
              are off (lib/feature-flags.ts), so there is no sign-in entry point. */}
          <SlideOutModal isOpen={isModalOpen} onClose={closeModal} activeFightNight={activeFightNight} />
        </AuthProvider>
      </body>
    </html>
  )
}
