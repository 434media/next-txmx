import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '../../../../lib/firebase-admin'
import { settleEventMatchPicks } from '../../../actions/match-picks'

/**
 * Cron: Auto-settle match picks for past events.
 *
 * Finds events that:
 *  1. Have a date in the past
 *  2. Have unsettled match picks
 *  3. Have bout data (eventNumber exists)
 *
 * Then runs settleEventMatchPicks for each.
 *
 * Schedule: daily or after known event dates via Vercel cron.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Find all unsettled match picks, grouped by eventId
    const unsettledSnap = await firestore
      .collection('matchPicks')
      .where('settled', '==', false)
      .get()

    if (unsettledSnap.empty) {
      return NextResponse.json({ message: 'No unsettled picks', settled: 0 })
    }

    // Gather unique event IDs
    const eventIds = new Set<string>()
    for (const doc of unsettledSnap.docs) {
      const data = doc.data()
      if (data.eventId) eventIds.add(data.eventId)
    }

    // 2. For each event, check if it's past and has bout data
    const today = new Date().toISOString().slice(0, 10)
    const results: Array<{
      eventId: string
      eventNumber: string
      settled: number
      winners: number
      draws: number
      skipped: number
      errors: number
    }> = []

    for (const eventId of eventIds) {
      const eventDoc = await firestore.collection('events').doc(eventId).get()
      if (!eventDoc.exists) continue

      const eventData = eventDoc.data()!
      const eventDate = eventData.date as string
      const eventNumber = eventData.eventNumber as string

      // Only settle past events with bout data
      if (!eventDate || eventDate >= today || !eventNumber) continue

      const res = await settleEventMatchPicks(eventId, eventNumber)
      results.push({
        eventId,
        eventNumber,
        settled: res.settled,
        winners: res.winners,
        draws: res.draws,
        skipped: res.skipped,
        errors: res.errors,
      })
    }

    const totalSettled = results.reduce((sum, r) => sum + r.settled, 0)
    const totalWinners = results.reduce((sum, r) => sum + r.winners, 0)

    return NextResponse.json({
      message: `Settled ${totalSettled} picks across ${results.length} events`,
      totalSettled,
      totalWinners,
      events: results,
    })
  } catch (error) {
    console.error('Settlement cron error:', error)
    return NextResponse.json(
      { error: 'Settlement failed' },
      { status: 500 }
    )
  }
}
