"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Msg = { 
  role: 'user' | 'assistant'; 
  content: string;
  citations?: Array<{ title: string; url: string; snippet: string }>;
}

export default function DemoChat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [usedMessages, setUsedMessages] = useState(0)
  
  // Demo limit: limit the number of user messages
  const DEMO_LIMIT = 10
  const STORAGE_KEY = 'querywing-demo-user-messages'
  const remainingMessages = Math.max(0, DEMO_LIMIT - usedMessages)

  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem(STORAGE_KEY) || '0')
      if (!isNaN(stored)) {
        setUsedMessages(stored)
        if (stored >= DEMO_LIMIT) setShowUpgrade(true)
      }
    } catch {}
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    
    // Check demo limit (persisted)
    if (remainingMessages <= 0 || showUpgrade) {
      setShowUpgrade(true)
      return
    }
    
    const userMessage = { role: 'user' as const, content: text }
    setMessages(m => [...m, userMessage])
    setInput("")
    setLoading(true)
    
    try {
      const res = await fetch('/api/demo-chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }) 
      })
      
      if (!res.ok) throw new Error('API request failed')
      
      const data = await res.json()
      setMessages(m => [...m, { 
        role: 'assistant', 
        content: data.content,
        citations: data.citations || []
      }])
      
      // Increment usage after a successful exchange (count user messages)
      try {
        const newUsed = Math.min(DEMO_LIMIT, usedMessages + 1)
        setUsedMessages(newUsed)
        localStorage.setItem(STORAGE_KEY, String(newUsed))
        if (newUsed >= DEMO_LIMIT) setShowUpgrade(true)
      } catch {}
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(m => [...m, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="h-80 overflow-auto space-y-3 mb-3 p-2">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 text-sm py-8">
            👋 Hi! I'm QueryWing's AI assistant. Ask me about our features, pricing, or how to get started!
            <div className="mt-2 text-xs text-blue-600">
              Demo: {remainingMessages} messages remaining
            </div>
          </div>
        )}
        
        {showUpgrade && (
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-800 font-semibold mb-2">🎉 Demo Complete!</div>
            <div className="text-blue-600 text-sm mb-3">
              You've reached the demo limit. Upgrade to continue chatting and unlock all features!
            </div>
            <div className="space-y-2">
              <div className="text-xs text-blue-500">
                ✨ Unlimited conversations • Lead capture • Analytics • Custom branding
              </div>
              <a href="/pricing" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" target="_self" rel="noopener">
                Upgrade Now
              </a>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block px-3 py-2 rounded-lg max-w-[80%] text-left ${
              m.role === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-neutral-100 text-neutral-800'
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-neutral-200">
                  <div className="text-xs text-neutral-600 mb-1">Sources:</div>
                  {m.citations.map((citation, idx) => (
                    <a 
                      key={idx}
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:underline"
                    >
                      {citation.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <div className="inline-block px-3 py-2 rounded-lg bg-neutral-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100 disabled:text-gray-500"
          placeholder={showUpgrade ? "Upgrade to continue chatting" : "Ask about QueryWing features, pricing, or setup..."}
          disabled={loading || showUpgrade}
        />
        {showUpgrade ? (
          <a 
            href="/pricing"
            target="_self"
            rel="noopener"
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            Upgrade
          </a>
        ) : (
          <button 
            onClick={send} 
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        )}
      </div>
      
      {!showUpgrade && remainingMessages > 0 && (
        <div className="text-center text-xs text-gray-500 mt-2">
          Demo: {remainingMessages} messages remaining
        </div>
      )}
    </div>
  )
}


