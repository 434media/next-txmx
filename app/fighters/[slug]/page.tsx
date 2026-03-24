import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getFighterBySlug, getFighters } from "../../actions/fighters"
import FighterProfileClient from "./fighter-profile-client"

interface FighterPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const fighters = await getFighters()
  return fighters.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({
  params,
}: FighterPageProps): Promise<Metadata> {
  const { slug } = await params
  const fighter = await getFighterBySlug(slug)

  if (!fighter) {
    return { title: "Fighter Not Found" }
  }

  const name = `${fighter.firstName} ${fighter.lastName}`
  const record = `${fighter.record.wins}-${fighter.record.losses}-${fighter.record.draws}`
  const description = fighter.bio
    ? fighter.bio.slice(0, 155)
    : `${name} (${record}) — ${fighter.weightClass || "Boxing"} fighter from ${fighter.residence?.city || fighter.region}. Full record, stats, and profile on TXMX Boxing.`

  return {
    title: `${name} | ${record} | Fighter Profile`,
    description,
    openGraph: {
      title: `${name} — ${record} | TXMX Boxing`,
      description,
      url: `https://www.txmxboxing.com/fighters/${fighter.slug}`,
      siteName: "TXMX Boxing",
      locale: "en_US",
      type: "profile",
      ...(fighter.profileImageUrl && {
        images: [{ url: fighter.profileImageUrl, width: 600, height: 600 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | TXMX Boxing`,
      description,
    },
    alternates: {
      canonical: `https://www.txmxboxing.com/fighters/${fighter.slug}`,
    },
  }
}

export default async function FighterPage({ params }: FighterPageProps) {
  const { slug } = await params
  const fighter = await getFighterBySlug(slug)

  if (!fighter) {
    notFound()
  }

  return <FighterProfileClient fighter={fighter} />
}
