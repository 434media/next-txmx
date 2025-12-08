import type { Metadata } from "next"
import GalleryClient from "./gallery-client"

export const metadata: Metadata = {
  title: "Event Gallery | Rise of a Champion | TXMX Boxing",
  description:
    "View, share and download exclusive photos from the Rise of a Champion event celebrating San Antonio's boxing legends.",
  openGraph: {
    title: "Event Gallery | Rise of a Champion | TXMX Boxing",
    description: "View, share and download exclusive photos from the Rise of a Champion event.",
    url: "https://www.txmxboxing.com/riseofachampion/gallery",
    siteName: "TXMX Boxing",
    type: "website",
  },
}

export default function GalleryPage() {
  return <GalleryClient />
}
