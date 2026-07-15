'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { format, isToday, isYesterday } from 'date-fns'
import { Paperclip, Smile, Send } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { getCpSocket, disconnectCpSocket } from '@/lib/cp-socket'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import type { CpMessage } from '@/lib/types/cp'

function dateDivider(date: Date) {
  if (isToday(date))     return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, d MMM')
}

export default function ConversationPage() {
  const params    = useParams()
  const slug      = params?.slug as string
  const convId    = params?.conversationId as string
  const { workspaceId, memberId } = useCpWorkspaceStore()

  const [messages, setMessages] = useState<CpMessage[]>([])
  const [loading, setLoading]   = useState(true)
  const [text, setText]         = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!workspaceId || !convId) return

    cpApi
      .get<{ messages: CpMessage[] }>(`/api/cp/workspaces/${workspaceId}/conversations/${convId}/messages`)
      .then((res) => {
        setMessages(res.data.messages ?? [])
        // mark as read
        cpApi.patch(`/api/cp/workspaces/${workspaceId}/conversations/${convId}/read`).catch(() => {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // Socket
    const socket = getCpSocket()
    socket.connect()
    socket.emit('cp:join-workspace', { workspaceId, conversationId: convId })
    socket.on('cp:message-received', (msg: CpMessage) => {
      if (msg.conversationId === convId) {
        setMessages((prev) => [...prev, msg])
      }
    })

    return () => {
      socket.off('cp:message-received')
      disconnectCpSocket()
    }
  }, [workspaceId, convId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    if (!text.trim() || !workspaceId) return
    const socket = getCpSocket()
    socket.emit('cp:message', { workspaceId, conversationId: convId, content: text.trim() })
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Group messages by date
  const grouped: { divider?: string; message: CpMessage }[] = []
  messages.forEach((msg, i) => {
    const msgDate = new Date(msg.createdAt)
    const prev    = messages[i - 1]
    const prevDate = prev ? new Date(prev.createdAt) : null
    if (!prevDate || !isSameDay(msgDate, prevDate)) {
      grouped.push({ divider: dateDivider(msgDate), message: msg })
    } else {
      grouped.push({ message: msg })
    }
  })

  const isSelf = (msg: CpMessage) => msg.senderId === memberId

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 64px - env(safe-area-inset-bottom))', maxHeight: '100vh' }}
    >
      <CpPageHeader title="Chat" backHref={`/cp/${slug}/chat`} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CpSkeletonRow key={i} />)
        ) : (
          grouped.map(({ divider, message: msg }) => (
            <div key={msg.id}>
              {divider && (
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-[var(--cp-border)]" />
                  <span className="text-[10px] text-[var(--cp-text-3)]">{divider}</span>
                  <div className="flex-1 h-px bg-[var(--cp-border)]" />
                </div>
              )}
              {msg.type === 'SYSTEM' ? (
                <div className="text-center text-xs italic text-[var(--cp-text-3)] my-2">
                  {msg.content}
                </div>
              ) : (
                <div className={`flex ${isSelf(msg) ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[80%] lg:max-w-[60%] rounded-2xl px-4 py-2.5"
                    style={{
                      background: isSelf(msg) ? 'var(--cp-primary-dim)' : 'var(--cp-surface-2)',
                    }}
                  >
                    {!isSelf(msg) && (
                      <p className="text-[10px] font-semibold text-[var(--cp-primary)] mb-1">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] text-[var(--cp-text-3)] mt-1 text-right">
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: 'var(--cp-surface)',
          borderTop: '1px solid var(--cp-border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <button className="p-2 text-[var(--cp-text-3)] hover:text-[var(--cp-text-2)]">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--cp-surface-2)] text-sm text-[var(--cp-text-1)] placeholder:text-[var(--cp-text-3)] border border-[var(--cp-border)] outline-none focus:border-[var(--cp-primary)] transition-colors"
        />
        <button className="p-2 text-[var(--cp-text-3)] hover:text-[var(--cp-text-2)]">
          <Smile size={20} />
        </button>
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-[var(--cp-primary)] text-white disabled:opacity-40 hover:bg-[var(--cp-primary)]/90 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

function isSameDay(a: Date, b: Date) {
  return format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd')
}
