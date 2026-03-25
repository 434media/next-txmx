'use server'

import { firestore } from '../../lib/firebase-admin'
import { awardCredits } from './credits'

const POLL_VOTE_TC = 10

export interface PollOption {
  label: string
  votes: number
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
  status: 'open' | 'closed'
  category: 'event' | 'fighter' | 'general'
  eventId?: string
  createdAt: string
  closesAt?: string
}

export interface UserVote {
  pollId: string
  optionIndex: number
  votedAt: string
}

export async function getPolls(
  status: 'open' | 'closed' | 'all' = 'open',
  limit = 10
): Promise<Poll[]> {
  let query: FirebaseFirestore.Query = firestore.collection('polls')

  if (status !== 'all') {
    query = query.where('status', '==', status)
  }

  const snap = await query.orderBy('createdAt', 'desc').limit(limit).get()

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Poll[]
}

export async function getPoll(pollId: string): Promise<Poll | null> {
  const snap = await firestore.collection('polls').doc(pollId).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Poll
}

export async function getUserVotes(userId: string): Promise<UserVote[]> {
  const snap = await firestore
    .collection('users')
    .doc(userId)
    .collection('pollVotes')
    .get()

  return snap.docs.map((doc) => doc.data() as UserVote)
}

export async function votePoll(
  userId: string,
  pollId: string,
  optionIndex: number
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !pollId) return { success: false, error: 'Missing required fields' }

  const pollRef = firestore.collection('polls').doc(pollId)
  const voteRef = firestore.collection('users').doc(userId).collection('pollVotes').doc(pollId)

  try {
    await firestore.runTransaction(async (tx) => {
      const [pollSnap, voteSnap] = await Promise.all([tx.get(pollRef), tx.get(voteRef)])

      if (!pollSnap.exists) throw new Error('Poll not found')
      const poll = pollSnap.data() as Omit<Poll, 'id'>

      if (poll.status !== 'open') throw new Error('Poll is closed')
      if (poll.closesAt && new Date(poll.closesAt) < new Date()) throw new Error('Poll has expired')
      if (voteSnap.exists) throw new Error('Already voted')
      if (optionIndex < 0 || optionIndex >= poll.options.length) throw new Error('Invalid option')

      const updatedOptions = poll.options.map((opt, i) =>
        i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
      )

      tx.update(pollRef, {
        options: updatedOptions,
        totalVotes: (poll.totalVotes || 0) + 1,
      })

      tx.set(voteRef, {
        pollId,
        optionIndex,
        votedAt: new Date().toISOString(),
      })
    })

    // Award TC outside transaction (non-critical)
    const idempotencyKey = `poll_vote:${userId}:${pollId}`
    try {
      await awardCredits(userId, POLL_VOTE_TC, 'Fan poll vote', idempotencyKey, { pollId })
    } catch {
      // TC award failure shouldn't break voting
    }

    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function createPoll(poll: {
  question: string
  options: string[]
  category: 'event' | 'fighter' | 'general'
  eventId?: string
  closesAt?: string
}): Promise<string> {
  if (!poll.question.trim()) throw new Error('Question required')
  if (!poll.options || poll.options.length < 2) throw new Error('At least 2 options required')

  const now = new Date().toISOString()
  const ref = await firestore.collection('polls').add({
    question: poll.question.trim(),
    options: poll.options.map((label) => ({ label: label.trim(), votes: 0 })),
    totalVotes: 0,
    status: 'open',
    category: poll.category,
    eventId: poll.eventId || null,
    createdAt: now,
    closesAt: poll.closesAt || null,
  })

  return ref.id
}

export async function closePoll(pollId: string): Promise<void> {
  await firestore.collection('polls').doc(pollId).update({ status: 'closed' })
}
