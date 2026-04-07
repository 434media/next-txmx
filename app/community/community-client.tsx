'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFeatureFlag } from '@/lib/use-feature-flag'
import {
  getFeed,
  createPost,
  deletePost,
  likePost,
  getUserLikes,
  getReplies,
  createReply,
  deleteReply,
  flagPost,
  flagReply,
  type CommunityPost,
  type PostCategory,
  type PostReply,
} from '@/app/actions/community'
import {
  blockUser,
  unblockUser,
  muteUser,
  unmuteUser,
  getUserBlockList,
} from '@/app/actions/user-blocks'

const CATEGORIES: { value: PostCategory; label: string; emoji: string }[] = [
  { value: 'general', label: 'General', emoji: '💬' },
  { value: 'prediction', label: 'Prediction', emoji: '🔮' },
  { value: 'hype', label: 'Hype', emoji: '🔥' },
  { value: 'event', label: 'Event', emoji: '🥊' },
  { value: 'question', label: 'Question', emoji: '❓' },
]

const RANK_BADGE: Record<string, { color: string; label: string }> = {
  hall_of_fame: { color: 'text-purple-400', label: 'HOF' },
  champion: { color: 'text-amber-400', label: 'CHAMP' },
  contender: { color: 'text-blue-400', label: 'CONTENDER' },
  rookie: { color: 'text-white/40', label: 'ROOKIE' },
}

function timeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.max(0, now - then)
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CommunityClient() {
  const { user, profile } = useAuth()
  const isBlackCard = profile?.subscriptionStatus === 'active'
  const enabled = useFeatureFlag('community', { isBlackCard })

  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<PostCategory | 'all'>('all')
  const [loading, setLoading] = useState(true)

  // Block / mute state
  const [blockedSet, setBlockedSet] = useState<Set<string>>(new Set())
  const [mutedSet, setMutedSet] = useState<Set<string>>(new Set())
  const [actionMenuPost, setActionMenuPost] = useState<string | null>(null)

  // Post composer state
  const [composerOpen, setComposerOpen] = useState(false)
  const [newBody, setNewBody] = useState('')
  const [newCategory, setNewCategory] = useState<PostCategory>('general')
  const [posting, setPosting] = useState(false)

  // Reply state
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [replies, setReplies] = useState<Record<string, PostReply[]>>({})
  const [replyBody, setReplyBody] = useState('')
  const [replying, setReplying] = useState(false)
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null)

  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  // ── Load feed ──────────────────────────────────────────

  const loadFeed = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFeed({
        category: filter === 'all' ? undefined : filter,
        limit: 30,
      })
      setPosts(data)

      if (user?.uid) {
        const [liked, blockList] = await Promise.all([
          data.length > 0 ? getUserLikes(user.uid, data.map(p => p.id)) : new Set<string>(),
          getUserBlockList(user.uid),
        ])
        setLikedSet(liked)
        setBlockedSet(new Set(blockList.blocked))
        setMutedSet(new Set(blockList.muted))
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filter, user?.uid])

  useEffect(() => {
    if (enabled) loadFeed()
  }, [enabled, loadFeed])

  // ── Post ───────────────────────────────────────────────

  async function handleCreatePost() {
    if (!user || !profile || !newBody.trim()) return
    setPosting(true)
    try {
      const post = await createPost(user.uid, {
        displayName: profile.displayName || 'Anonymous',
        photoURL: profile.photoURL || null,
        rank: ((profile as unknown as Record<string, unknown>).rank as string) || 'rookie',
        subscriptionStatus: profile.subscriptionStatus || 'none',
        body: newBody,
        category: newCategory,
      })
      setPosts(prev => [post, ...prev])
      setNewBody('')
      setNewCategory('general')
      setComposerOpen(false)
    } catch {
      // silent
    } finally {
      setPosting(false)
    }
  }

  async function handleDeletePost(postId: string) {
    if (!user) return
    try {
      await deletePost(user.uid, postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch {
      // silent
    }
  }

  // ── Like ───────────────────────────────────────────────

  async function handleLike(postId: string) {
    if (!user) return
    try {
      const isNowLiked = await likePost(user.uid, postId)
      setLikedSet(prev => {
        const next = new Set(prev)
        if (isNowLiked) next.add(postId)
        else next.delete(postId)
        return next
      })
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likeCount: p.likeCount + (isNowLiked ? 1 : -1) }
            : p
        )
      )
    } catch {
      // silent
    }
  }

  // ── Replies ────────────────────────────────────────────

  async function handleExpand(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null)
      return
    }
    setExpandedPost(postId)
    setReplyBody('')
    if (!replies[postId]) {
      setLoadingReplies(postId)
      try {
        const data = await getReplies(postId)
        setReplies(prev => ({ ...prev, [postId]: data }))
      } catch {
        // silent
      } finally {
        setLoadingReplies(null)
      }
    }
    setTimeout(() => replyInputRef.current?.focus(), 100)
  }

  async function handleCreateReply(postId: string) {
    if (!user || !profile || !replyBody.trim()) return
    setReplying(true)
    try {
      const reply = await createReply(user.uid, postId, {
        displayName: profile.displayName || 'Anonymous',
        photoURL: profile.photoURL || null,
        rank: ((profile as unknown as Record<string, unknown>).rank as string) || 'rookie',
        subscriptionStatus: profile.subscriptionStatus || 'none',
        body: replyBody,
      })
      setReplies(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), reply],
      }))
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p
        )
      )
      setReplyBody('')
    } catch {
      // silent
    } finally {
      setReplying(false)
    }
  }

  async function handleDeleteReply(postId: string, replyId: string) {
    if (!user) return
    try {
      await deleteReply(user.uid, postId, replyId)
      setReplies(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(r => r.id !== replyId),
      }))
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, replyCount: Math.max(0, p.replyCount - 1) } : p
        )
      )
    } catch {
      // silent
    }
  }

  // ── Flag ───────────────────────────────────────────────

  async function handleFlagPost(postId: string) {
    try {
      await flagPost(postId)
    } catch {
      // silent
    }
  }

  async function handleFlagReply(postId: string, replyId: string) {
    try {
      await flagReply(postId, replyId)
    } catch {
      // silent
    }
  }

  // ── Block / Mute ────────────────────────────────────────

  async function handleBlock(targetId: string) {
    if (!user) return
    try {
      await blockUser(user.uid, targetId)
      setBlockedSet(prev => new Set(prev).add(targetId))
      setMutedSet(prev => { const next = new Set(prev); next.delete(targetId); return next })
    } catch { /* silent */ }
    setActionMenuPost(null)
  }

  async function handleUnblock(targetId: string) {
    if (!user) return
    try {
      await unblockUser(user.uid, targetId)
      setBlockedSet(prev => { const next = new Set(prev); next.delete(targetId); return next })
    } catch { /* silent */ }
    setActionMenuPost(null)
  }

  async function handleMute(targetId: string) {
    if (!user) return
    try {
      await muteUser(user.uid, targetId)
      setMutedSet(prev => new Set(prev).add(targetId))
      setBlockedSet(prev => { const next = new Set(prev); next.delete(targetId); return next })
    } catch { /* silent */ }
    setActionMenuPost(null)
  }

  async function handleUnmute(targetId: string) {
    if (!user) return
    try {
      await unmuteUser(user.uid, targetId)
      setMutedSet(prev => { const next = new Set(prev); next.delete(targetId); return next })
    } catch { /* silent */ }
    setActionMenuPost(null)
  }

  // ── Gated ──────────────────────────────────────────────

  if (!enabled) {
    return (
      <div className="text-center py-20">
        <p className="text-white/30 text-lg">Community is coming soon.</p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/50 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-colors ${
              filter === c.value
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      {user ? (
        <div className="border border-white/10 rounded-2xl bg-white/2">
          {!composerOpen ? (
            <button
              onClick={() => setComposerOpen(true)}
              className="w-full px-5 py-4 text-left text-white/30 text-sm hover:text-white/50 transition-colors"
            >
              What&apos;s on your mind?
            </button>
          ) : (
            <div className="p-5 space-y-4">
              <textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="Share your thoughts..."
                maxLength={500}
                rows={3}
                className="w-full bg-transparent text-white text-sm placeholder:text-white/20 resize-none focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setNewCategory(c.value)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                        newCategory === c.value
                          ? 'bg-white/15 text-white'
                          : 'text-white/30 hover:text-white/50'
                      }`}
                      title={c.label}
                    >
                      {c.emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/20 text-xs">{newBody.length}/500</span>
                  <button
                    onClick={() => {
                      setComposerOpen(false)
                      setNewBody('')
                    }}
                    className="text-white/30 text-xs hover:text-white/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={posting || !newBody.trim()}
                    className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold disabled:opacity-30 hover:bg-white/90 transition-colors"
                  >
                    {posting ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-white/10 rounded-2xl bg-white/2 p-5 text-center">
          <p className="text-white/30 text-sm">Sign in to join the conversation</p>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-white/5 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-full mb-2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/20 text-sm">No posts yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts
            .filter(post => !blockedSet.has(post.userId))
            .map(post => {
            const isMuted = mutedSet.has(post.userId)
            return (
            <article
              key={post.id}
              className={`border border-white/10 rounded-2xl bg-white/2 overflow-hidden ${isMuted ? 'opacity-40' : ''}`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {post.photoURL ? (
                      <img
                        src={post.photoURL}
                        alt=""
                        className="w-8 h-8 rounded-full shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium truncate">
                          {post.displayName}
                        </span>
                        {post.subscriptionStatus === 'active' && (
                          <span className="text-amber-400 text-[10px] font-bold tracking-wider">
                            BLACK CARD
                          </span>
                        )}
                        {post.isVerified && (
                          <span className="text-green-400 text-[10px] font-bold tracking-wider">
                            ✓
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold tracking-wider ${
                          RANK_BADGE[post.rank]?.color || 'text-white/40'
                        }`}>
                          {RANK_BADGE[post.rank]?.label || 'ROOKIE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/30 text-xs">
                        <span>{timeAgo(post.createdAt)}</span>
                        <span>·</span>
                        <span>
                          {CATEGORIES.find(c => c.value === post.category)?.emoji}{' '}
                          {CATEGORIES.find(c => c.value === post.category)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions menu */}
                  {user && (
                    <div className="relative flex items-center gap-1 shrink-0">
                      {post.userId === user.uid && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-white/20 hover:text-red-400 text-xs px-2 py-1 transition-colors"
                          title="Delete"
                        >
                          ✕
                        </button>
                      )}
                      {post.userId !== user.uid && (
                        <>
                          <button
                            onClick={() => handleFlagPost(post.id)}
                            className="text-white/20 hover:text-amber-400 text-xs px-2 py-1 transition-colors"
                            title="Report"
                          >
                            ⚑
                          </button>
                          <button
                            onClick={() => setActionMenuPost(actionMenuPost === post.id ? null : post.id)}
                            className="text-white/20 hover:text-white/60 text-xs px-2 py-1 transition-colors"
                            title="More"
                          >
                            ⋯
                          </button>
                          {actionMenuPost === post.id && (
                            <div className="absolute right-0 top-8 z-10 bg-neutral-900 border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
                              {blockedSet.has(post.userId) ? (
                                <button
                                  onClick={() => handleUnblock(post.userId)}
                                  className="w-full text-left px-4 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                  Unblock user
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlock(post.userId)}
                                  className="w-full text-left px-4 py-2 text-xs text-red-400/80 hover:bg-white/5 hover:text-red-400 transition-colors"
                                >
                                  Block user
                                </button>
                              )}
                              {mutedSet.has(post.userId) ? (
                                <button
                                  onClick={() => handleUnmute(post.userId)}
                                  className="w-full text-left px-4 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                  Unmute user
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleMute(post.userId)}
                                  className="w-full text-left px-4 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                  Mute user
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Body */}
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {post.body}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => user && handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      likedSet.has(post.id)
                        ? 'text-red-400'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                    disabled={!user}
                  >
                    {likedSet.has(post.id) ? '❤️' : '🤍'}{' '}
                    {post.likeCount > 0 && post.likeCount}
                  </button>
                  <button
                    onClick={() => handleExpand(post.id)}
                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                  >
                    💬 {post.replyCount > 0 && post.replyCount}
                  </button>
                </div>
              </div>

              {/* Replies panel */}
              {expandedPost === post.id && (
                <div className="border-t border-white/5 bg-white/1">
                  {loadingReplies === post.id ? (
                    <div className="p-5 text-white/20 text-xs">Loading replies…</div>
                  ) : (
                    <>
                      {(replies[post.id] || [])
                        .filter(reply => !blockedSet.has(reply.userId))
                        .map(reply => {
                        const isReplyMuted = mutedSet.has(reply.userId)
                        return (
                        <div
                          key={reply.id}
                          className={`px-5 py-3 border-b border-white/5 last:border-b-0 ${isReplyMuted ? 'opacity-40' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 mb-1">
                              {reply.photoURL ? (
                                <img
                                  src={reply.photoURL}
                                  alt=""
                                  className="w-5 h-5 rounded-full"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-white/10" />
                              )}
                              <span className="text-white text-xs font-medium">
                                {reply.displayName}
                              </span>
                              {reply.subscriptionStatus === 'active' && (
                                <span className="text-amber-400 text-[9px] font-bold tracking-wider">
                                  BC
                                </span>
                              )}
                              {reply.isVerified && (
                                <span className="text-green-400 text-[9px] font-bold tracking-wider">
                                  ✓
                                </span>
                              )}
                              <span className="text-white/20 text-xs">
                                {timeAgo(reply.createdAt)}
                              </span>
                            </div>
                            {user && (
                              <div className="flex gap-1">
                                {reply.userId === user.uid && (
                                  <button
                                    onClick={() => handleDeleteReply(post.id, reply.id)}
                                    className="text-white/20 hover:text-red-400 text-[10px] px-1 transition-colors"
                                  >
                                    ✕
                                  </button>
                                )}
                                {reply.userId !== user.uid && (
                                  <button
                                    onClick={() => handleFlagReply(post.id, reply.id)}
                                    className="text-white/20 hover:text-amber-400 text-[10px] px-1 transition-colors"
                                  >
                                    ⚑
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-white/60 text-xs leading-relaxed ml-7 whitespace-pre-wrap wrap-break-word">
                            {reply.body}
                          </p>
                        </div>
                        )
                      })}

                      {/* Reply input */}
                      {user ? (
                        <div className="p-4 flex gap-2">
                          <textarea
                            ref={replyInputRef}
                            value={replyBody}
                            onChange={e => setReplyBody(e.target.value)}
                            placeholder="Reply…"
                            maxLength={300}
                            rows={1}
                            className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-white/20"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleCreateReply(post.id)
                              }
                            }}
                          />
                          <button
                            onClick={() => handleCreateReply(post.id)}
                            disabled={replying || !replyBody.trim()}
                            className="px-3 py-2 rounded-lg bg-white/10 text-white text-xs font-medium disabled:opacity-30 hover:bg-white/15 transition-colors"
                          >
                            {replying ? '…' : '→'}
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 text-white/20 text-xs text-center">
                          Sign in to reply
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
