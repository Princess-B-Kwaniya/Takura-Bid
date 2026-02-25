'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/components/providers/AuthProvider'

interface JobConversation {
  type: 'job'
  jobId: string
  loadTitle: string
  otherPartyId: string
  otherPartyName: string
  status: string
  unreadCount?: number
}

interface DmConversation {
  type: 'dm'
  recipientId: string
  otherPartyName: string
  otherPartyRole: string
  lastMessage: string
  lastSentAt: string
  unreadCount: number
}

type Conversation = JobConversation | DmConversation

interface Message {
  message_id?: string
  dm_id?: string
  job_id?: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  sent_at: string
}

export default function DriverChat() {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Wait for auth to finish before fetching so the cookie is guaranteed to be set
  useEffect(() => {
    if (authLoading) return
    async function loadConversations() {
      try {
        const [jobRes, dmRes] = await Promise.all([
          fetch('/api/conversations'),
          fetch('/api/direct-messages'),
        ])
        const [jobData, dmData] = await Promise.all([jobRes.json(), dmRes.json()])

        const jobConvs: Conversation[] = (jobData.conversations ?? []).map((c: JobConversation) => ({
          ...c,
          type: 'job' as const,
        }))
        const dmConvs: Conversation[] = (dmData.conversations ?? []).map((c: DmConversation) => ({
          ...c,
          type: 'dm' as const,
        }))

        setConversations([...dmConvs, ...jobConvs])
      } catch {
        // ignore
      }
      setLoadingConvs(false)
    }
    loadConversations()
  }, [authLoading])

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selected) return
    setLoadingMsgs(true)

    const url = selected.type === 'job'
      ? `/api/conversations/${(selected as JobConversation).jobId}`
      : `/api/direct-messages/${(selected as DmConversation).recipientId}`

    fetch(url)
      .then(r => r.json())
      .then(d => { setMessages(d.messages ?? []); setLoadingMsgs(false) })
      .catch(() => setLoadingMsgs(false))
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !selected || !user) return
    setSending(true)
    setSendError('')

    let url: string
    let body: Record<string, string>

    if (selected.type === 'job') {
      const jobConv = selected as JobConversation
      url = '/api/messages'
      body = { jobId: jobConv.jobId, recipientId: jobConv.otherPartyId, content: text.trim() }
    } else {
      const dmConv = selected as DmConversation
      url = '/api/direct-messages'
      body = { recipientId: dmConv.recipientId, content: text.trim() }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSending(false)
    if (res.ok) {
      setMessages(prev => [...prev, data.message])
      setText('')
    } else {
      setSendError(data.error ?? 'Failed to send message')
    }
  }

  function getConversationKey(conv: Conversation): string {
    return conv.type === 'job' ? `job-${(conv as JobConversation).jobId}` : `dm-${(conv as DmConversation).recipientId}`
  }

  function getSelectedKey(): string | null {
    return selected ? getConversationKey(selected) : null
  }

  function getOtherPartyName(conv: Conversation): string {
    return conv.otherPartyName
  }

  return (
    <DashboardLayout userType="driver">
      <div className="content-area">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(100vh-200px)] min-h-[500px] rounded-xl overflow-hidden border border-gray-200">
          {/* Conversation list */}
          <div className="bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm text-gray-500">No conversations yet. Accept a job or wait for client messages.</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const key = getConversationKey(conv)
                  const name = getOtherPartyName(conv)
                  const unread = conv.type === 'job'
                    ? (conv as JobConversation).unreadCount ?? 0
                    : (conv as DmConversation).unreadCount ?? 0
                  const isSelected = getSelectedKey() === key

                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(conv)}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-[#3f2a52]/5 border-l-2 border-l-[#3f2a52]' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-[#3f2a52] rounded-full flex items-center justify-center text-white font-semibold">
                            {name[0]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-gray-900 truncate">{name}</p>
                            {unread > 0 && (
                              <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{unread}</span>
                            )}
                          </div>
                          {conv.type === 'job' ? (
                            <>
                              <p className="text-xs text-gray-500 truncate">{(conv as JobConversation).loadTitle}</p>
                              <p className="text-xs text-gray-400">Job: {(conv as JobConversation).jobId}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-gray-500 truncate">{(conv as DmConversation).lastMessage}</p>
                              <p className="text-xs text-[#3f2a52] font-medium">Direct Message</p>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat window */}
          <div className="lg:col-span-2 bg-white flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500 text-sm">Choose a conversation to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#3f2a52] rounded-full flex items-center justify-center text-white font-semibold">
                      {getOtherPartyName(selected)[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{getOtherPartyName(selected)}</h3>
                      {selected.type === 'job' ? (
                        <p className="text-xs text-gray-500">{(selected as JobConversation).loadTitle}</p>
                      ) : (
                        <p className="text-xs text-[#3f2a52] font-medium">Direct Message</p>
                      )}
                    </div>
                  </div>
                  {selected.type === 'job' && (
                    <span className="px-2.5 py-1 bg-[#3f2a52]/10 text-[#3f2a52] text-xs font-semibold rounded-full">Job: {(selected as JobConversation).jobId}</span>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="text-center text-gray-400 text-sm">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender_id === user?.user_id
                      return (
                        <div key={msg.message_id ?? msg.dm_id ?? idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isMe ? 'bg-[#3f2a52] text-white' : 'bg-gray-100 text-gray-900'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                              {new Date(msg.sent_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Send error */}
                {sendError && (
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600 flex items-center justify-between">
                    <span>{sendError}</span>
                    <button onClick={() => setSendError('')} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex items-center space-x-3">
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#3f2a52]/20 focus:border-[#3f2a52] transition-all text-sm"
                  />
                  <button type="submit" disabled={sending || !text.trim()} className="btn-primary disabled:opacity-50 px-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
