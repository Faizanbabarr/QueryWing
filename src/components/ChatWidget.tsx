"use client"

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
  primaryColor?: string
  title?: string
  botId?: string
  positioning?: 'fixed' | 'absolute'
  // Optional: limit number of assistant replies before showing upsell
  answerLimit?: number
  limitMessage?: string
  upgradeHref?: string
  upgradeCtaLabel?: string
}

export default function ChatWidget({ 
  position = 'bottom-right', 
  primaryColor = '#6366f1',
  title = 'AI Assistant',
  botId,
  positioning = 'absolute',
  answerLimit,
  limitMessage = "You've reached the demo limit. Please upgrade to continue.",
  upgradeHref = '/pricing',
  upgradeCtaLabel = 'See Pricing'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi there! How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [limitNoticeSent, setLimitNoticeSent] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Compute assistant answers excluding the initial greeting
  const assistantAnswers = messages.filter(m => m.role === 'assistant' && m.id !== '1').length
  const isAtLimit = false

  // Once limit is reached, append a one-time upsell message
  useEffect(() => {
    if (isAtLimit && !limitNoticeSent) {
      const upsell: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `${limitMessage} Visit ${upgradeHref} to upgrade.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, upsell])
      setLimitNoticeSent(true)
    }
  }, [isAtLimit, limitNoticeSent, limitMessage, upgradeHref])

  const sendMessage = async () => {
    const message = inputValue.trim()
    if (!message || isLoading) return
    if (isAtLimit) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          botId,
          conversationId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      if (data.response) {
        setConversationId(data.conversationId)
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isAtLimit) sendMessage()
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`${positioning} ${position === 'bottom-right' ? 'bottom-5 right-5' : 'bottom-5 left-5'} z-50 font-sans`}>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="Open chat"
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.45)'
        }}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10" style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35)' }}>
          <MessageCircle size={22} className="text-white" />
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`absolute ${position === 'bottom-right' ? 'bottom-20 right-0' : 'bottom-20 left-0'} w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-2 duration-300`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3 font-semibold">
              <MessageCircle size={20} />
              {title}
            </div>
            <button
              onClick={toggleChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl transition-transform duration-200 ease-out ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md shadow-lg animate-in fade-in zoom-in-95'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2'
                  }`}
                  style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isAtLimit && (
              <div className="flex justify-center">
                <a
                  href={upgradeHref}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
                >
                  {upgradeCtaLabel}
                </a>
              </div>
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                disabled={isLoading || isAtLimit}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim() || isAtLimit}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                aria-label="Send message"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  boxShadow: '0 8px 18px rgba(99, 102, 241, 0.35)'
                }}
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
