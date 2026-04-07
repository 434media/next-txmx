import type { Metadata } from 'next'
import LockerClient from './locker-client'

export const metadata: Metadata = {
  title: 'Locker',
  description: 'View and equip your avatar frames, titles, badges, and collectibles.',
}

export default function LockerPage() {
  return <LockerClient />
}
