import type { Metadata } from 'next'
import RewardsStoreClient from './rewards-client'

export const metadata: Metadata = {
  title: 'Rewards Store',
  description: 'Redeem TX-Credits and Loyalty Points for exclusive TXMX rewards.',
}

export default function RewardsPage() {
  return <RewardsStoreClient />
}
