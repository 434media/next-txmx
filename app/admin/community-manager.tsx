'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getFlaggedPosts,
  getRecentPosts,
  adminRemovePost,
  adminRestorePost,
  type CommunityPost,
} from '@/app/actions/community'

type ViewMode = 'flagged' | 'recent'

export default function CommunityManager() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [view, setView] = useState<ViewMode>('flagged')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = view === 'flagged'
        ? await getFlaggedPosts()
        : await getRecentPosts(50)
      setPosts(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [view])

  useEffect(() => {
    load()
  }, [load])

  async function handleRemove(postId: string) {
    try {
      await adminRemovePost(postId)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, removed: true } : p))
    } catch {
      // silent
    }
  }

  async function handleRestore(postId: string) {
    try {
      await adminRestorePost(postId)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, removed: false, flagged: false } : p))
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('flagged')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            view === 'flagged'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          ⚑ Flagged
          {view === 'flagged' && !loading && (
            <span className="ml-2 text-xs">({posts.length})</span>
          )}
        </button>
        <button
          onClick={() => setView('recent')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            view === 'recent'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          🕒 Recent Posts
        </button>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-400 text-sm py-8 text-center">
          {view === 'flagged' ? 'No flagged posts' : 'No posts yet'}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div
              key={post.id}
              className={`border rounded-lg p-4 ${
                post.removed
                  ? 'border-red-200 bg-red-50/50'
                  : post.flagged
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="font-medium text-gray-800">{post.displayName}</span>
                    {post.subscriptionStatus === 'active' && (
                      <span className="text-amber-600 font-bold text-[10px]">BC</span>
                    )}
                    <span>·</span>
                    <span>{post.category}</span>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    {post.flagged && (
                      <span className="text-red-500 font-semibold">⚑ FLAGGED</span>
                    )}
                    {post.removed && (
                      <span className="text-red-600 font-semibold">REMOVED</span>
                    )}
                  </div>

                  {/* Body */}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
                    {post.body}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>❤️ {post.likeCount}</span>
                    <span>💬 {post.replyCount}</span>
                    <span className="text-gray-300">ID: {post.id.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  {!post.removed ? (
                    <button
                      onClick={() => handleRemove(post.id)}
                      className="px-3 py-1.5 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestore(post.id)}
                      className="px-3 py-1.5 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
