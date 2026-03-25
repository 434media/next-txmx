'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { EightCountPost } from '../actions/eight-count'
import {
  getEightCountPosts,
  createEightCountPost,
  updateEightCountPost,
  deleteEightCountPost,
} from '../actions/eight-count'

type EditorMode = 'list' | 'create' | 'edit'

export default function EightCountManager() {
  const [posts, setPosts] = useState<EightCountPost[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<EditorMode>('list')
  const [editingPost, setEditingPost] = useState<EightCountPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [author, setAuthor] = useState('TXMX Boxing')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getEightCountPosts('all', 100)
      setPosts(all)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const resetForm = () => {
    setTitle('')
    setExcerpt('')
    setCoverImageUrl('')
    setAuthor('TXMX Boxing')
    setTags('')
    setStatus('draft')
    if (editorRef.current) editorRef.current.innerHTML = ''
    setEditingPost(null)
  }

  const handleCreate = () => {
    resetForm()
    setMode('create')
  }

  const handleEdit = (post: EightCountPost) => {
    setTitle(post.title)
    setExcerpt(post.excerpt)
    setCoverImageUrl(post.coverImageUrl)
    setAuthor(post.author)
    setTags(post.tags.join(', '))
    setStatus(post.status)
    setEditingPost(post)
    setMode('edit')
    // Set editor content after render
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = post.content
    }, 0)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const content = editorRef.current?.innerHTML || ''
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      if (mode === 'create') {
        const newPost = await createEightCountPost({
          title: title.trim(),
          excerpt: excerpt.trim(),
          content,
          coverImageUrl: coverImageUrl.trim(),
          author: author.trim(),
          tags: tagList,
          status,
        })
        setPosts((prev) => [newPost, ...prev])
      } else if (editingPost) {
        await updateEightCountPost(editingPost.id, {
          title: title.trim(),
          excerpt: excerpt.trim(),
          content,
          coverImageUrl: coverImageUrl.trim(),
          author: author.trim(),
          tags: tagList,
          status,
        })
        await loadPosts()
      }

      resetForm()
      setMode('list')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEightCountPost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
      setDeleteConfirm(null)
    } catch {
      // silent
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', '8count')

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setCoverImageUrl(data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleInsertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      // Basic URL validation
      try {
        new URL(url)
        execCmd('createLink', url)
      } catch {
        alert('Please enter a valid URL')
      }
    }
  }

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      try {
        new URL(url)
        execCmd('insertImage', url)
      } catch {
        alert('Please enter a valid URL')
      }
    }
  }

  // Toolbar button component
  const ToolbarBtn = ({
    onClick,
    active,
    children,
    title: btnTitle,
  }: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // Prevent losing selection
        onClick()
      }}
      title={btnTitle}
      className={`px-2 py-1.5 text-xs font-medium rounded transition-colors ${
        active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )

  // ── LIST VIEW ──
  if (mode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-[13px]">
            {posts.length} post{posts.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium tracking-wide rounded-md hover:bg-gray-800 transition-colors"
          >
            + New Post
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-[#FFB800] border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-300 text-4xl">📝</p>
            <p className="text-gray-400 text-sm">No posts yet</p>
            <button
              onClick={handleCreate}
              className="text-[#FFB800] text-sm font-medium hover:underline"
            >
              Create your first post
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group"
              >
                {/* Thumbnail */}
                {post.coverImageUrl && (
                  <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded ${
                        post.status === 'published'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-[#FFB800]'
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-300">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  >
                    Edit
                  </button>
                  {deleteConfirm === post.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(post.id)}
                      className="px-2 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── EDITOR VIEW ──
  return (
    <div className="space-y-6">
      {/* Back / Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            resetForm()
            setMode('list')
          }}
          className="text-gray-400 text-[13px] font-medium hover:text-gray-600 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to posts
        </button>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="text-[13px] border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:border-[#FFB800]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-5 py-2 bg-gray-900 text-white text-[13px] font-medium tracking-wide rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
        className="w-full text-2xl font-bold text-gray-900 tracking-[0.05em] placeholder:text-gray-300 border-0 border-b border-gray-100 pb-3 focus:outline-none focus:border-[#FFB800] transition-colors"
      />

      {/* Cover image upload */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 tracking-[0.2em] mb-1.5">
          COVER IMAGE
        </label>
        <div className="flex items-start gap-4">
          {/* Upload zone */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-[#FFB800] hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-[#FFB800] border-t-transparent rounded-full" />
                  <span className="text-[13px] font-medium">Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-[13px] font-medium">
                    {coverImageUrl ? 'Replace image' : 'Upload cover image'}
                  </span>
                </>
              )}
            </button>
            {uploadError && (
              <p className="mt-1.5 text-xs text-red-500">{uploadError}</p>
            )}
            <p className="mt-1.5 text-[10px] text-gray-300">JPEG, PNG, WebP, or AVIF — 5 MB max</p>

            {/* Fallback URL input */}
            <div className="mt-3">
              <label className="block text-[10px] text-gray-300 tracking-wider mb-1">or paste URL</label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-[12px] text-gray-500 border border-gray-100 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#FFB800] transition-colors"
              />
            </div>
          </div>

          {/* Inline preview */}
          {coverImageUrl && (
            <div className="relative w-24 h-30 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-[10px] hover:bg-black/80 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Author */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 tracking-[0.2em] mb-1.5">
          AUTHOR
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author name"
          className="w-full text-[13px] text-gray-700 border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-[#FFB800] transition-colors"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 tracking-[0.2em] mb-1.5">
          EXCERPT
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary for cards and SEO..."
          rows={2}
          className="w-full text-[13px] text-gray-700 border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-[#FFB800] transition-colors resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 tracking-[0.2em] mb-1.5">
          TAGS (comma separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="boxing, news, event recap"
          className="w-full text-[13px] text-gray-700 border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-[#FFB800] transition-colors"
        />
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 tracking-[0.2em] mb-1.5">
          CONTENT
        </label>
        <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#FFB800] transition-colors">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
            {/* Text formatting */}
            <ToolbarBtn onClick={() => execCmd('bold')} title="Bold (Ctrl+B)">
              <strong>B</strong>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('italic')} title="Italic (Ctrl+I)">
              <em>I</em>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('underline')} title="Underline (Ctrl+U)">
              <u>U</u>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('strikeThrough')} title="Strikethrough">
              <s>S</s>
            </ToolbarBtn>

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {/* Headings */}
            <ToolbarBtn onClick={() => execCmd('formatBlock', 'h2')} title="Heading 2">
              H2
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('formatBlock', 'h3')} title="Heading 3">
              H3
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('formatBlock', 'p')} title="Paragraph">
              P
            </ToolbarBtn>

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {/* Lists */}
            <ToolbarBtn onClick={() => execCmd('insertUnorderedList')} title="Bullet List">
              •&thinsp;List
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('insertOrderedList')} title="Numbered List">
              1.&thinsp;List
            </ToolbarBtn>

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {/* Block */}
            <ToolbarBtn onClick={() => execCmd('formatBlock', 'blockquote')} title="Blockquote">
              &ldquo;&thinsp;&rdquo;
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('insertHorizontalRule')} title="Horizontal Rule">
              ―
            </ToolbarBtn>

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {/* Insert */}
            <ToolbarBtn onClick={handleInsertLink} title="Insert Link">
              🔗
            </ToolbarBtn>
            <ToolbarBtn onClick={handleInsertImage} title="Insert Image">
              🖼️
            </ToolbarBtn>

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {/* Alignment */}
            <ToolbarBtn onClick={() => execCmd('justifyLeft')} title="Align Left">
              ≡
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('justifyCenter')} title="Align Center">
              ≡
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('justifyRight')} title="Align Right">
              ≡
            </ToolbarBtn>

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {/* Undo/Redo */}
            <ToolbarBtn onClick={() => execCmd('undo')} title="Undo">
              ↩
            </ToolbarBtn>
            <ToolbarBtn onClick={() => execCmd('redo')} title="Redo">
              ↪
            </ToolbarBtn>

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {/* Clear formatting */}
            <ToolbarBtn onClick={() => execCmd('removeFormat')} title="Clear Formatting">
              ✕
            </ToolbarBtn>
          </div>

          {/* Editable area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="min-h-[300px] max-h-[600px] overflow-y-auto px-4 py-3 text-[14px] text-gray-800 leading-relaxed focus:outline-none prose prose-sm max-w-none
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-5 [&_h3]:mb-2
              [&_p]:mb-3
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
              [&_li]:mb-1
              [&_blockquote]:border-l-4 [&_blockquote]:border-[#FFB800] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-4
              [&_a]:text-[#FFB800] [&_a]:underline
              [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4
              [&_hr]:border-gray-200 [&_hr]:my-6
            "
            onKeyDown={(e) => {
              // Tab for indent
              if (e.key === 'Tab') {
                e.preventDefault()
                execCmd(e.shiftKey ? 'outdent' : 'indent')
              }
            }}
          />
        </div>
      </div>

    </div>
  )
}
