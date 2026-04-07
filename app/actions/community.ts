'use server'

import { firestore } from '../../lib/firebase-admin'
import { isUserSuspended, checkCommunityRateLimit, addSpamPoints, scoreContent } from './abuse-prevention'
import { getUserByUid } from './users'

// ── Types ────────────────────────────────────────────────

export type PostCategory = 'general' | 'prediction' | 'event' | 'hype' | 'question'

export interface CommunityPost {
  id: string
  userId: string
  displayName: string
  photoURL: string | null
  rank: string
  subscriptionStatus: string
  /** Post body (plain text, max 500 chars) */
  body: string
  category: PostCategory
  /** Optional event or fighter reference */
  referenceId: string | null
  referenceLabel: string | null
  /** Engagement counters */
  likeCount: number
  replyCount: number
  /** Verified account */
  isVerified: boolean
  /** Moderation */
  flagged: boolean
  removed: boolean
  createdAt: string
}

export interface PostLike {
  userId: string
  postId: string
  createdAt: string
}

export interface PostReply {
  id: string
  postId: string
  userId: string
  displayName: string
  photoURL: string | null
  rank: string
  subscriptionStatus: string
  body: string
  isVerified: boolean
  flagged: boolean
  removed: boolean
  createdAt: string
}

// ── Feed ─────────────────────────────────────────────────

export async function getFeed(opts?: {
  category?: PostCategory
  limit?: number
  beforeId?: string
}): Promise<CommunityPost[]> {
  const limit = opts?.limit ?? 30

  let query = firestore
    .collection('communityPosts')
    .where('removed', '==', false)
    .orderBy('createdAt', 'desc')
    .limit(limit)

  if (opts?.category) {
    query = firestore
      .collection('communityPosts')
      .where('removed', '==', false)
      .where('category', '==', opts.category)
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }

  const snap = await query.get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as CommunityPost)
}

// ── Create Post ──────────────────────────────────────────

export async function createPost(
  userId: string,
  data: {
    displayName: string
    photoURL: string | null
    rank: string
    subscriptionStatus: string
    body: string
    category: PostCategory
    referenceId?: string | null
    referenceLabel?: string | null
  }
): Promise<CommunityPost> {
  if (!userId) throw new Error('Not authenticated')

  // Abuse prevention checks
  const suspCheck = await isUserSuspended(userId)
  if (suspCheck.suspended) throw new Error(`Account suspended: ${suspCheck.reason}`)

  const rateCheck = await checkCommunityRateLimit(userId, 'post')
  if (!rateCheck.allowed) {
    addSpamPoints(userId, 'rateLimitHit', 'Post rate limit hit').catch(() => {})
    throw new Error(rateCheck.reason || 'Post limit reached')
  }

  const body = data.body.trim().slice(0, 500)
  if (!body) throw new Error('Post body is required')

  const now = new Date().toISOString()

  // Resolve verified status from user record
  const userRecord = await getUserByUid(userId)
  const isVerified = userRecord?.isVerified ?? false

  const post = {
    userId,
    displayName: data.displayName || 'Anonymous',
    photoURL: data.photoURL || null,
    rank: data.rank || 'rookie',
    subscriptionStatus: data.subscriptionStatus || 'none',
    body,
    category: data.category || 'general',
    referenceId: data.referenceId || null,
    referenceLabel: data.referenceLabel || null,
    likeCount: 0,
    replyCount: 0,
    isVerified,
    flagged: false,
    removed: false,
    createdAt: now,
  }

  const ref = await firestore.collection('communityPosts').add(post)

  // Spam scoring — run async, don't block post creation
  scoreContent(userId, body).catch(() => {})

  return { id: ref.id, ...post }
}

// ── Delete Post ──────────────────────────────────────────

export async function deletePost(userId: string, postId: string): Promise<void> {
  const ref = firestore.collection('communityPosts').doc(postId)
  const snap = await ref.get()
  if (!snap.exists) throw new Error('Post not found')
  const post = snap.data()!
  if (post.userId !== userId) throw new Error('Not authorized')
  await ref.update({ removed: true })
}

// ── Admin remove ─────────────────────────────────────────

export async function adminRemovePost(postId: string): Promise<void> {
  await firestore.collection('communityPosts').doc(postId).update({ removed: true })
}

export async function adminRestorePost(postId: string): Promise<void> {
  await firestore.collection('communityPosts').doc(postId).update({ removed: false, flagged: false })
}

// ── Likes ────────────────────────────────────────────────

export async function likePost(userId: string, postId: string): Promise<boolean> {
  if (!userId || !postId) return false

  const likeId = `${userId}_${postId}`
  const likeRef = firestore.collection('postLikes').doc(likeId)
  const postRef = firestore.collection('communityPosts').doc(postId)

  return await firestore.runTransaction(async (tx) => {
    const likeSnap = await tx.get(likeRef)

    if (likeSnap.exists) {
      // Unlike
      tx.delete(likeRef)
      const postSnap = await tx.get(postRef)
      if (postSnap.exists) {
        const current = postSnap.data()!.likeCount || 0
        tx.update(postRef, { likeCount: Math.max(0, current - 1) })
      }
      return false
    } else {
      // Like
      tx.set(likeRef, {
        userId,
        postId,
        createdAt: new Date().toISOString(),
      })
      const postSnap = await tx.get(postRef)
      if (postSnap.exists) {
        tx.update(postRef, { likeCount: (postSnap.data()!.likeCount || 0) + 1 })
      }
      return true
    }
  })
}

export async function getUserLikes(userId: string, postIds: string[]): Promise<Set<string>> {
  if (!userId || postIds.length === 0) return new Set()

  // Batch check: query likes for this user for given post IDs
  const likeIds = postIds.map(pid => `${userId}_${pid}`)
  const liked = new Set<string>()

  // Firestore getAll with doc refs
  const refs = likeIds.map(id => firestore.collection('postLikes').doc(id))
  const snaps = await firestore.getAll(...refs)

  snaps.forEach((snap, i) => {
    if (snap.exists) liked.add(postIds[i])
  })

  return liked
}

// ── Replies ──────────────────────────────────────────────

export async function getReplies(postId: string, limit = 50): Promise<PostReply[]> {
  const snap = await firestore
    .collection('communityPosts')
    .doc(postId)
    .collection('replies')
    .where('removed', '==', false)
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get()

  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as PostReply)
}

export async function createReply(
  userId: string,
  postId: string,
  data: {
    displayName: string
    photoURL: string | null
    rank: string
    subscriptionStatus: string
    body: string
  }
): Promise<PostReply> {
  if (!userId) throw new Error('Not authenticated')

  // Abuse prevention checks
  const suspCheck = await isUserSuspended(userId)
  if (suspCheck.suspended) throw new Error(`Account suspended: ${suspCheck.reason}`)

  const rateCheck = await checkCommunityRateLimit(userId, 'reply')
  if (!rateCheck.allowed) {
    addSpamPoints(userId, 'rateLimitHit', 'Reply rate limit hit').catch(() => {})
    throw new Error(rateCheck.reason || 'Reply limit reached')
  }

  const body = data.body.trim().slice(0, 300)
  if (!body) throw new Error('Reply body is required')

  const now = new Date().toISOString()

  // Resolve verified status from user record
  const userRecord = await getUserByUid(userId)
  const isVerified = userRecord?.isVerified ?? false

  const reply = {
    postId,
    userId,
    displayName: data.displayName || 'Anonymous',
    photoURL: data.photoURL || null,
    rank: data.rank || 'rookie',
    subscriptionStatus: data.subscriptionStatus || 'none',
    body,
    isVerified,
    flagged: false,
    removed: false,
    createdAt: now,
  }

  const postRef = firestore.collection('communityPosts').doc(postId)
  const replyRef = await postRef.collection('replies').add(reply)

  // Increment reply count
  const postSnap = await postRef.get()
  if (postSnap.exists) {
    await postRef.update({ replyCount: (postSnap.data()!.replyCount || 0) + 1 })
  }

  // Spam scoring — run async, don't block reply creation
  scoreContent(userId, body).catch(() => {})

  return { id: replyRef.id, ...reply }
}

export async function deleteReply(userId: string, postId: string, replyId: string): Promise<void> {
  const ref = firestore.collection('communityPosts').doc(postId).collection('replies').doc(replyId)
  const snap = await ref.get()
  if (!snap.exists) throw new Error('Reply not found')
  if (snap.data()!.userId !== userId) throw new Error('Not authorized')
  await ref.update({ removed: true })

  // Decrement reply count
  const postRef = firestore.collection('communityPosts').doc(postId)
  const postSnap = await postRef.get()
  if (postSnap.exists) {
    const current = postSnap.data()!.replyCount || 0
    await postRef.update({ replyCount: Math.max(0, current - 1) })
  }
}

// ── Flagging ─────────────────────────────────────────────

export async function flagPost(postId: string): Promise<void> {
  const ref = firestore.collection('communityPosts').doc(postId)
  const snap = await ref.get()
  await ref.update({ flagged: true })
  // Add spam points to post author
  if (snap.exists) {
    const post = snap.data()!
    addSpamPoints(post.userId, 'flagReceived', `Post flagged: "${(post.body || '').slice(0, 60)}"`).catch(() => {})
  }
}

export async function flagReply(postId: string, replyId: string): Promise<void> {
  const replyRef = firestore.collection('communityPosts').doc(postId).collection('replies').doc(replyId)
  const snap = await replyRef.get()
  await replyRef.update({ flagged: true })
  // Add spam points to reply author
  if (snap.exists) {
    const reply = snap.data()!
    addSpamPoints(reply.userId, 'flagReceived', `Reply flagged: "${(reply.body || '').slice(0, 60)}"`).catch(() => {})
  }
}

// ── Admin: Flagged Content ───────────────────────────────

export async function getFlaggedPosts(): Promise<CommunityPost[]> {
  const snap = await firestore
    .collection('communityPosts')
    .where('flagged', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get()

  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as CommunityPost)
}

export async function getRecentPosts(limit = 50): Promise<CommunityPost[]> {
  const snap = await firestore
    .collection('communityPosts')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as CommunityPost)
}
