'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface ChatMessage {
  id: string
  sender: 'driver' | 'client'
  message: string
  timestamp: string
  read: boolean
}

interface Conversation {
  id: string
  driverName: string
  driverAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  jobId: string
  messages: ChatMessage[]
}

const mockConversations: Conversation[] = []

function ConversationList({ conversations, selectedConversation, onSelectConversation }: {
  conversations: Conversation[]
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
}) {
  return (
    <div className="card h-full flex flex-col">
      <div className="card-header">
        <h2 className="card-title">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-medium">
                  {conversation.driverAvatar}
                </div>
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {conversation.driverName}
                  </h4>
                  <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-gray-900 text-white text-xs rounded-full px-2 py-1 ml-2">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Job: {conversation.jobId}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">No conversations yet</h4>
            <p className="text-xs text-gray-500">Messages from drivers will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ChatWindow({ conversation }: { conversation: Conversation | null }) {
  if (!conversation) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-600">Choose a conversation to start messaging with drivers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card h-full flex flex-col">
      {/* Chat Header */}
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-medium">
              {conversation.driverAvatar}
            </div>
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{conversation.driverName}</h3>
            <p className="text-sm text-gray-600">
              {conversation.isOnline ? 'Online' : 'Offline'} • Job: {conversation.jobId}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'client'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'client' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Type your message..."
            className="input-field flex-1"
          />
          <button className="btn-primary px-4 py-2">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientChat() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const selectedConv = mockConversations.find(c => c.id === selectedConversation)

  return (
    <DashboardLayout userType="client">
      <div className="content-area">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Chat</h1>
              <p className="page-subtitle">Communicate with your drivers in real-time</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 h-96 lg:h-[600px]">
            <ConversationList
              conversations={mockConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 h-96 lg:h-[600px]">
            <ChatWindow conversation={selectedConv || null} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}