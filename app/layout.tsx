import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
  metadataBase: new URL('https://www.txmxboxing.com'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}
