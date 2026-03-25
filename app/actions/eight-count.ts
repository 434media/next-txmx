'use server'

import { firestore } from '../../lib/firebase-admin'

export interface EightCountPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string // HTML content from rich text editor
  coverImageUrl: string
  author: string
  status: 'draft' | 'published'
  tags: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

const COLLECTION = 'eightCountPosts'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export async function getEightCountPosts(
  status: 'draft' | 'published' | 'all' = 'all',
  limit = 50
): Promise<EightCountPost[]> {
  try {
    let query: FirebaseFirestore.Query = firestore.collection(COLLECTION)

    if (status !== 'all') {
      query = query.where('status', '==', status)
    }

    const snap = await query.orderBy('createdAt', 'desc').limit(limit).get()

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EightCountPost[]
  } catch {
    // Fallback if composite index is still building: fetch without orderBy
    let query: FirebaseFirestore.Query = firestore.collection(COLLECTION)

    if (status !== 'all') {
      query = query.where('status', '==', status)
    }

    const snap = await query.limit(limit).get()

    const posts = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EightCountPost[]

    return posts.sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    )
  }
}

export async function getEightCountPostBySlug(
  slug: string
): Promise<EightCountPost | null> {
  try {
    const snap = await firestore
      .collection(COLLECTION)
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get()

    if (snap.empty) return null

    const doc = snap.docs[0]
    return { id: doc.id, ...doc.data() } as EightCountPost
  } catch {
    // Fallback if composite index is still building: query by slug only, filter in memory
    const snap = await firestore
      .collection(COLLECTION)
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (snap.empty) return null

    const doc = snap.docs[0]
    const post = { id: doc.id, ...doc.data() } as EightCountPost
    return post.status === 'published' ? post : null
  }
}

export async function createEightCountPost(data: {
  title: string
  excerpt: string
  content: string
  coverImageUrl: string
  author: string
  tags: string[]
  status: 'draft' | 'published'
}): Promise<EightCountPost> {
  const now = new Date().toISOString()
  let slug = generateSlug(data.title)

  // Ensure slug uniqueness
  const existing = await firestore
    .collection(COLLECTION)
    .where('slug', '==', slug)
    .limit(1)
    .get()

  if (!existing.empty) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const post: Omit<EightCountPost, 'id'> = {
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.coverImageUrl,
    author: data.author,
    status: data.status,
    tags: data.tags,
    publishedAt: data.status === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
  }

  const ref = await firestore.collection(COLLECTION).add(post)

  return { id: ref.id, ...post }
}

export async function updateEightCountPost(
  id: string,
  data: Partial<Omit<EightCountPost, 'id' | 'createdAt'>>
): Promise<void> {
  const updates: Record<string, unknown> = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  // If publishing for the first time, set publishedAt
  if (data.status === 'published') {
    const doc = await firestore.collection(COLLECTION).doc(id).get()
    const existing = doc.data()
    if (existing && !existing.publishedAt) {
      updates.publishedAt = new Date().toISOString()
    }
  }

  // If title changed, regenerate slug
  if (data.title) {
    let slug = generateSlug(data.title)
    const existing = await firestore
      .collection(COLLECTION)
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (!existing.empty && existing.docs[0].id !== id) {
      slug = `${slug}-${Date.now().toString(36)}`
    }
    updates.slug = slug
  }

  await firestore.collection(COLLECTION).doc(id).update(updates)
}

export async function deleteEightCountPost(id: string): Promise<void> {
  await firestore.collection(COLLECTION).doc(id).delete()
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const snap = await firestore
    .collection(COLLECTION)
    .where('status', '==', 'published')
    .select('slug')
    .get()

  return snap.docs.map((doc) => doc.data().slug as string)
}
