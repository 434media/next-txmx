import type { Metadata } from 'next'
import FanCardClient from './fan-card-client'

export const metadata: Metadata = {
  title: 'Fan Card',
  description: 'Your TXMX Fan Card — rank, stats, badges, and quests all in one place.',
}

export default function FanCardPage() {
  return <FanCardClient />
}
