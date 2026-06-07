/**
 * PLACEHOLDER MEDIA — temporary assets for the redesigned Fight Nights hub.
 * Swap every value here for real TXMX boxing photography/video before launch.
 * Using plain <img>/<video> with these URLs (Picsum + a public sample MP4) so
 * nothing depends on next/image remote-domain config and nothing renders broken.
 */
export const PLACEHOLDER = {
  /** Looping hero background video. */
  heroVideo:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  /** Poster shown before the hero video loads (and on reduced-motion). */
  heroPoster: "https://picsum.photos/seed/txmx-fightnight-hero/1600/900",
  /** Bold prize-reveal image. */
  prizeImage: "https://picsum.photos/seed/txmx-prize/900/900",
  /** Winner spotlight portrait for the last-event recap. */
  winnerImage: "https://picsum.photos/seed/txmx-winner/600/600",
  /** In-app game preview (picking a fighter / live board). */
  gamePreview: "https://picsum.photos/seed/txmx-gameplay/1200/800",
} as const
