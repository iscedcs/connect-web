'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Search, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpEmptyState } from '@/components/cp/shared/CpEmptyState'
import { CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import type { CpConversation } from '@/lib/types/cp'

function ConversationRow({ conv, slug }: { conv: CpConversation; slug: string }) {
  const router = useRouter()
  const other = conv.participants?.[0]

  return (
    <button
      onClick={() => router.push(`/cp/${slug}/chat/${conv.id}`)}
      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--cp-surface-2)] transition-colors text-left"
      style={{ borderBottom: '1px solid var(--cp-border)' }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-[var(--cp-primary-dim)] flex items-center justify-center">
          <span className="text-sm font-semibold text-[var(--cp-primary)]">
            {(other?.name ?? conv.name ?? 'G')[0]}
          </span>
        </div>
        {conv.type === 'WORKSPACE_GROUP' && (
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px] px-1 py-0.5 rounded bg-[var(--cp-primary)] text-white font-bold">
            GROUP
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--cp-text-1)] truncate">
          {conv.name ?? other?.name ?? 'Conversation'}
        </p>
        <p className="text-xs text-[var(--cp-text-2)] truncate mt-0.5">
          {conv.lastMessage ?? 'No messages yet'}
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {conv.lastMessageAt && (
          <span className="text-[10px] text-[var(--cp-text-3)]">
            {format(new Date(conv.lastMessageAt), 'HH:mm')}
          </span>
        )}
        {conv.unreadCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--cp-primary)] text-white text-[10px] font-bold flex items-center justify-center">
            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
          </span>
        )}
      </div>
    </button>
  )
}

export default function ChatListPage() {
  const params = useParams()
  const slug   = params?.slug as string
  const { workspaceId } = useCpWorkspaceStore()

  const [conversations, setConversations] = useState<CpConversation[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    if (!workspaceId) return
    cpApi
      .get<{ conversations: CpConversation[] }>(`/api/cp/workspaces/${workspaceId}/conversations`)
      .then((res) => setConversations(res.data.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  const filtered = conversations.filter((c) => {
    const name = c.name ?? c.participants?.[0]?.name ?? ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const pinned  = filtered.filter((c) => c.isPinned)
  const direct  = filtered.filter((c) => !c.isPinned && c.type === 'DIRECT')
  const client  = filtered.filter((c) => !c.isPinned && c.type === 'CLIENT_STAFF')

  return (
    <div className="lg:flex lg:h-[calc(100vh-60px)]">
      {/* Left panel — conversation list */}
      <div
        className="w-full lg:w-[320px] lg:flex-shrink-0 flex flex-col"
        style={{ borderRight: '1px solid var(--cp-border)' }}
      >
        {/* Search */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--cp-border)' }}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cp-text-3)]" />
            <input
              type="text"
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-[var(--cp-surface-2)] text-[var(--cp-text-1)] placeholder:text-[var(--cp-text-3)] border border-[var(--cp-border)] outline-none"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <CpSkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <CpEmptyState title="No conversations" description="Start a new conversation." />
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cp-text-3)]">Pinned</p>
                  {pinned.map((c) => <ConversationRow key={c.id} conv={c} slug={slug} />)}
                </>
              )}
              {direct.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cp-text-3)]">Direct messages</p>
                  {direct.map((c) => <ConversationRow key={c.id} conv={c} slug={slug} />)}
                </>
              )}
              {client.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cp-text-3)]">Client conversations</p>
                  {client.map((c) => <ConversationRow key={c.id} conv={c} slug={slug} />)}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right panel — placeholder on desktop when no conversation selected */}
      <div className="hidden lg:flex flex-1 items-center justify-center">
        <div className="text-center text-[var(--cp-text-3)]">
          <p className="text-sm">Select a conversation to start messaging</p>
        </div>
      </div>
    </div>
  )
}
