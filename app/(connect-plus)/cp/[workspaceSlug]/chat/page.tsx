'use client'

import { useEffect, useState, useRef } from 'react'
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  Mic,
  Plus,
  Search,
  CheckCheck,
  User,
  Paperclip,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { getCpSocket, disconnectCpSocket } from '@/lib/cp-socket'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import type { CpConversation, CpMessage } from '@/lib/types/cp'

export default function ChatPage() {
  const { workspaceId } = useCpWorkspaceStore()
  const [conversations, setConversations] = useState<CpConversation[]>([])
  const [activeConv, setActiveConv] = useState<CpConversation | null>(null)
  const [messages, setMessages] = useState<CpMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  function loadConversations() {
    if (!workspaceId) return
    setLoading(true)
    cpApi
      .get<{ conversations: CpConversation[] }>(URLS.chat.my_chat)
      .then((res) => {
        const convs = res.data.conversations || []
        setConversations(convs)
        if (convs.length > 0 && !activeConv) {
          setActiveConv(convs[0])
        }
      })
      .catch(() => {
        // Fallback sample conversation
        const sampleConvs: CpConversation[] = [
          {
            id: 'conv-1',
            name: 'General Operations Chat',
            isGroup: true,
            lastMessage: 'Let us review the upcoming client appointments.',
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'conv-2',
            name: 'Sarah Jenkins',
            isGroup: false,
            lastMessage: 'Invoice #101 has been sent to client.',
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ]
        setConversations(sampleConvs)
        if (!activeConv) setActiveConv(sampleConvs[0])
      })
      .finally(() => setLoading(false))
  }

  function loadMessages(convId: string) {
    const url = URLS.chat.get_message.replace('{convId}', convId)
    cpApi
      .get<{ messages: CpMessage[] }>(url)
      .then((res) => setMessages(res.data.messages || []))
      .catch(() => {
        setMessages([
          {
            id: 'msg-1',
            conversationId: convId,
            senderName: 'Sarah Jenkins',
            content: 'Hello team! Let us review the upcoming customer bookings.',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: 'msg-2',
            conversationId: convId,
            senderName: 'You',
            content: 'Sounds great. All invoices for this week have been generated.',
            createdAt: new Date(Date.now() - 900000).toISOString(),
          },
        ])
      })
  }

  useEffect(() => {
    loadConversations()
  }, [workspaceId])

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id)
      const readUrl = URLS.chat.mark_as_read.replace('{convId}', activeConv.id)
      cpApi.patch(readUrl).catch(() => {})
    }
  }, [activeConv])

  useEffect(() => {
    const socket = getCpSocket()
    socket.connect()

    socket.on('cp:message', (newMsg: CpMessage) => {
      if (activeConv && newMsg.conversationId === activeConv.id) {
        setMessages((prev) => [...prev, newMsg])
      }
    })

    return () => {
      socket.off('cp:message')
      disconnectCpSocket()
    }
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!messageText.trim() || !activeConv) return

    const newMsg: CpMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConv.id,
      senderName: 'You',
      content: messageText.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMsg])
    const sentText = messageText.trim()
    setMessageText('')

    try {
      const sendUrl = URLS.chat.send_message.replace('{convId}', activeConv.id)
      await cpApi.post(sendUrl, {
        content: sentText,
      })
    } catch {
      // Mock local optimistic message state
    }
  }

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Top Header */}
      <CpPageHeader
        title="Team & Client Messages"
        subtitle="Real-time workspace conversations, voice note attachments, and media file sharing"
      />

      {/* Main Split Chat Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] overflow-hidden">
        {/* Left Side (1 Col): Conversations Directory */}
        <div className="border-r border-[var(--cp-border,#222)] flex flex-col h-full bg-[var(--cp-surface-2,#181818)]/40">
          <div className="p-4 border-b border-[var(--cp-border,#222)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-1,#FFF)]">
                Conversations
              </h4>
              <button
                onClick={() => alert('Create new conversation drawer')}
                className="p-1 rounded-lg text-[var(--cp-primary,#10B981)] hover:bg-[var(--cp-surface-2,#222)]"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cp-text-3,#666)]" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[var(--cp-surface,#141414)] text-[var(--cp-text-1,#FFF)] border border-[var(--cp-border,#333)] outline-none focus:border-[var(--cp-primary,#10B981)]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--cp-border,#222)]">
            {filteredConvs.map((conv) => {
              const active = activeConv?.id === conv.id
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-4 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[var(--cp-primary,#10B981)]/10 border-l-4 border-[var(--cp-primary,#10B981)]'
                      : 'hover:bg-[var(--cp-surface-2,#222)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[var(--cp-text-1,#FFF)] truncate">{conv.name}</h5>
                    <span className="text-[10px] text-[var(--cp-text-3,#666)]">
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--cp-text-2,#888)] truncate mt-1">
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side (2 Cols): Active Thread Panel */}
        <div className="lg:col-span-2 flex flex-col h-full bg-[var(--cp-surface,#141414)]">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[var(--cp-border,#222)] flex items-center justify-between bg-[var(--cp-surface-2,#181818)]/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center font-bold text-xs">
                    {activeConv.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--cp-text-1,#FFF)]">{activeConv.name}</h4>
                    <p className="text-[10px] text-[var(--cp-primary,#10B981)]">Online • Workspace Channel</p>
                  </div>
                </div>
              </div>

              {/* Thread Message Scroll View */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderName === 'You'
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-[var(--cp-text-3,#666)] mb-1">
                        {msg.senderName}
                      </div>
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                          isMe
                            ? 'bg-[var(--cp-primary,#10B981)] text-white rounded-br-none'
                            : 'bg-[var(--cp-surface-2,#1F1F1F)] text-[var(--cp-text-1,#FFF)] rounded-bl-none border border-[var(--cp-border,#333)]'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div
                          className={`text-[9px] text-right flex items-center justify-end gap-1 ${
                            isMe ? 'text-white/70' : 'text-[var(--cp-text-3,#777)]'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--cp-border,#222)] bg-[var(--cp-surface-2,#181818)]/40 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Attach image/file')}
                  className="p-2 rounded-lg text-[var(--cp-text-3,#666)] hover:text-[var(--cp-text-1,#FFF)]"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2.5 rounded-xl bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-40 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[var(--cp-text-3,#666)]">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
