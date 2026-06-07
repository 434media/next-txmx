'use server'

import { firestore } from '../../lib/firebase-admin'

export interface FightNightPollOption {
  label: string
  votes: number
}

export interface FightNightPoll {
  id: string
  question: string
  options: FightNightPollOption[]
  totalVotes: number
  status: 'open' | 'closed'
  /** Optional bout this poll relates to (e.g. "Will main event go to decision?") */
  boutNumber: number | null
  createdAt: string
  closedAt: string | null
}

export interface FightNightPollVote {
  userId: string
  pollId: string
  optionIndex: number
  votedAt: string
}

function pollsCol(fightNightId: string) {
  return firestore.collection('fightNights').doc(fightNightId).collection('polls')
}

function votesCol(fightNightId: string) {
  return firestore.collection('fightNights').doc(fightNightId).collection('pollVotes')
}

function voteDocId(userId: string, pollId: string) {
  return `${userId}_${pollId}`
}

// ── Poll CRUD ──────────────────────────────────────────────

export async function createPoll(
  fightNightId: string,
  data: {
    question: string
    options: string[]
    boutNumber?: number | null
  }
): Promise<FightNightPoll> {
  if (!fightNightId) throw new Error('Missing fightNightId')
  if (!data.question.trim()) throw new Error('Question is required')
  if (data.options.length < 2) throw new Error('At least 2 options required')

  const now = new Date().toISOString()
  const poll = {
    question: data.question.trim(),
    options: data.options.map((label) => ({ label: label.trim(), votes: 0 })),
    totalVotes: 0,
    status: 'open' as const,
    boutNumber: data.boutNumber ?? null,
    createdAt: now,
    closedAt: null,
  }
  const ref = await pollsCol(fightNightId).add(poll)
  return { id: ref.id, ...poll }
}

export async function closePoll(fightNightId: string, pollId: string): Promise<void> {
  await pollsCol(fightNightId).doc(pollId).update({
    status: 'closed',
    closedAt: new Date().toISOString(),
  })
}

export async function reopenPoll(fightNightId: string, pollId: string): Promise<void> {
  await pollsCol(fightNightId).doc(pollId).update({
    status: 'open',
    closedAt: null,
  })
}

/**
 * Edit a poll's content. Vote handling:
 *   - If option count is unchanged, vote tallies are preserved by index
 *     (admin can fix typos without losing votes).
 *   - If option count changes, ALL vote tallies reset to 0 and totalVotes
 *     resets to 0 — the question structure has changed, the old votes are
 *     no longer meaningful. Vote *docs* in pollVotes are NOT cleaned up
 *     (they're keyed by `${userId}_${pollId}` and would need a separate
 *     pass) — accept the orphan and move on; it just blocks affected users
 *     from re-voting on the new shape.
 */
export async function updatePoll(
  fightNightId: string,
  pollId: string,
  data: {
    question?: string
    options?: string[]
    boutNumber?: number | null
  }
): Promise<void> {
  if (!fightNightId || !pollId) throw new Error('Missing args')
  const ref = pollsCol(fightNightId).doc(pollId)
  const snap = await ref.get()
  if (!snap.exists) throw new Error('Poll not found')
  const current = snap.data() as Omit<FightNightPoll, 'id'>

  const update: Record<string, unknown> = {}

  if (data.question !== undefined) {
    const q = data.question.trim()
    if (!q) throw new Error('Question is required')
    update.question = q
  }

  if (data.boutNumber !== undefined) {
    update.boutNumber = data.boutNumber
  }

  if (data.options !== undefined) {
    const labels = data.options.map((l) => l.trim()).filter(Boolean)
    if (labels.length < 2) throw new Error('At least 2 options required')
    const sameCount = labels.length === current.options.length
    update.options = labels.map((label, i) => ({
      label,
      votes: sameCount ? current.options[i]?.votes ?? 0 : 0,
    }))
    if (!sameCount) update.totalVotes = 0
  }

  if (Object.keys(update).length === 0) return
  await ref.update(update)
}

export async function deletePoll(fightNightId: string, pollId: string): Promise<void> {
  await pollsCol(fightNightId).doc(pollId).delete()
}

export async function getPolls(
  fightNightId: string,
  status?: 'open' | 'closed' | 'all'
): Promise<FightNightPoll[]> {
  if (!fightNightId) return []
  let q: FirebaseFirestore.Query = pollsCol(fightNightId).orderBy('createdAt', 'desc')
  if (status && status !== 'all') {
    q = q.where('status', '==', status)
  }
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FightNightPoll)
}

// ── Voting ────────────────────────────────────────────────

export async function votePoll(
  fightNightId: string,
  userId: string,
  pollId: string,
  optionIndex: number
): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: 'Not signed in' }
  if (!fightNightId || !pollId) return { success: false, error: 'Missing args' }

  const pollRef = pollsCol(fightNightId).doc(pollId)
  const voteRef = votesCol(fightNightId).doc(voteDocId(userId, pollId))

  try {
    await firestore.runTransaction(async (tx) => {
      const [pollSnap, voteSnap] = await Promise.all([tx.get(pollRef), tx.get(voteRef)])
      if (!pollSnap.exists) throw new Error('Poll not found')
      const poll = pollSnap.data() as Omit<FightNightPoll, 'id'>
      if (poll.status !== 'open') throw new Error('Poll is closed')
      if (voteSnap.exists) throw new Error('You already voted')
      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        throw new Error('Invalid option')
      }

      const options = poll.options.map((opt, i) => ({
        ...opt,
        votes: i === optionIndex ? opt.votes + 1 : opt.votes,
      }))
      tx.update(pollRef, {
        options,
        totalVotes: (poll.totalVotes || 0) + 1,
      })
      tx.set(voteRef, {
        userId,
        pollId,
        optionIndex,
        votedAt: new Date().toISOString(),
      } as FightNightPollVote)
    })
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to vote',
    }
  }
}

export async function getUserVote(
  fightNightId: string,
  userId: string,
  pollId: string
): Promise<FightNightPollVote | null> {
  if (!userId || !pollId) return null
  const snap = await votesCol(fightNightId).doc(voteDocId(userId, pollId)).get()
  if (!snap.exists) return null
  return snap.data() as FightNightPollVote
}

export async function getUserVotesForFightNight(
  fightNightId: string,
  userId: string
): Promise<FightNightPollVote[]> {
  if (!userId) return []
  const snap = await votesCol(fightNightId).where('userId', '==', userId).get()
  return snap.docs.map((d) => d.data() as FightNightPollVote)
}
