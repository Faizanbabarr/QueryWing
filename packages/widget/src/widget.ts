import { EventEmitter } from 'events'

export interface WidgetConfig {
  botId: string
  primary?: string
  position?: 'bottom-right' | 'bottom-left'
  launcher?: 'icon' | 'button' | 'custom'
  gdpr?: boolean
  leadMode?: 'always' | 'on-intent' | 'never'
  collect?: ('name' | 'email' | 'phone' | 'company')[]
  playbook?: 'lead' | 'support' | 'docs' | 'custom'
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{
    title: string
    url: string
    snippet: string
  }>
  id?: string
}

interface ChatMessageWithId extends ChatMessage {
  id: string
}

export interface LeadData {
  name?: string
  email?: string
  phone?: string
  company?: string
  consent: boolean
}

class QueryWingWidget extends EventEmitter {
  private config: WidgetConfig
  private isOpen = false
  private conversationId?: string
  private messages: ChatMessageWithId[] = []
  private container?: HTMLDivElement
  private launcher?: HTMLButtonElement
  private chatContainer?: HTMLDivElement
  private messageContainer?: HTMLDivElement
  private inputContainer?: HTMLDivElement
  private input?: HTMLTextAreaElement
  private sendButton?: HTMLButtonElement
  private leadForm?: HTMLDivElement
  private typingIndicator?: HTMLDivElement

  constructor(config: WidgetConfig) {
    super()
    this.config = {
      position: 'bottom-right',
      launcher: 'icon',
      gdpr: true,
      leadMode: 'on-intent',
      collect: ['name', 'email'],
      playbook: 'support',
      ...config,
    }
    
    this.init()
  }

  private init() {
    this.createStyles()
    this.createLauncher()
    this.createChatContainer()
    this.createLeadForm()
    this.createTypingIndicator()
    this.attachEventListeners()
    
    // Emit ready event
    this.emit('ready')
  }

  private createStyles() {
    if (document.getElementById('querywing-styles')) return

    const styles = document.createElement('style')
    styles.id = 'querywing-styles'
    styles.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      
      @keyframes slideInUp {
        0% { transform: translateY(100px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes slideInDown {
        0% { transform: translateY(-100px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes typing {
        0%, 20% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        80%, 100% { transform: translateY(0); }
      }
      
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }

      .qw-widget {
        --qw-primary: ${this.config.primary || '#6366f1'};
        --qw-primary-dark: #4f46e5;
        --qw-primary-light: #a5b4fc;
        --qw-primary-contrast: #ffffff;
        --qw-bg: #ffffff;
        --qw-panel: #f8fafc;
        --qw-text: #0f172a;
        --qw-muted: #64748b;
        --qw-border: #e2e8f0;
        --qw-radius: 20px;
        --qw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        --qw-shadow-lg: 0 50px 100px -20px rgba(0, 0, 0, 0.25);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      }

      .qw-launcher {
        position: fixed;
        ${this.config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
        bottom: 20px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--qw-primary), var(--qw-primary-dark));
        color: var(--qw-primary-contrast);
        border: none;
        cursor: pointer;
        box-shadow: var(--qw-shadow);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: float 3s ease-in-out infinite;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .qw-launcher:hover {
        transform: scale(1.15) rotate(5deg);
        box-shadow: var(--qw-shadow-lg);
        animation-play-state: paused;
      }

      .qw-launcher:active {
        transform: scale(0.95);
      }

      .qw-launcher .qw-launcher-icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .qw-launcher .qw-launcher-icon::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--qw-primary-light), var(--qw-primary));
        opacity: 0.3;
        animation: pulse 2s ease-in-out infinite;
      }

      .qw-chat-container {
        position: fixed;
        ${this.config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
        bottom: 100px;
        width: 400px;
        height: 600px;
        background: var(--qw-bg);
        border-radius: var(--qw-radius);
        box-shadow: var(--qw-shadow-lg);
        z-index: 999998;
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--qw-border);
        backdrop-filter: blur(20px);
        animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .qw-chat-container.open {
        display: flex;
      }

      .qw-chat-header {
        padding: 20px 24px;
        background: linear-gradient(135deg, var(--qw-primary), var(--qw-primary-dark));
        color: var(--qw-primary-contrast);
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
      }

      .qw-chat-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
        animation: shimmer 3s ease-in-out infinite;
      }

      .qw-chat-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        z-index: 1;
        position: relative;
      }

      .qw-chat-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: bold;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .qw-chat-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 18px;
        padding: 8px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        z-index: 1;
        position: relative;
      }

      .qw-chat-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .qw-messages {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
      }

      .qw-messages::-webkit-scrollbar {
        width: 6px;
      }

      .qw-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .qw-messages::-webkit-scrollbar-thumb {
        background: var(--qw-border);
        border-radius: 3px;
      }

      .qw-message {
        max-width: 85%;
        padding: 16px 20px;
        border-radius: 24px;
        word-wrap: break-word;
        position: relative;
        animation: fadeIn 0.3s ease-out;
        line-height: 1.5;
        font-size: 14px;
      }

      .qw-message.user {
        align-self: flex-end;
        background: linear-gradient(135deg, var(--qw-primary), var(--qw-primary-dark));
        color: var(--qw-primary-contrast);
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        border-bottom-right-radius: 8px;
      }

      .qw-message.assistant {
        align-self: flex-start;
        background: var(--qw-bg);
        color: var(--qw-text);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--qw-border);
        border-bottom-left-radius: 8px;
      }

      .qw-message.assistant::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--qw-primary-light), transparent);
      }

      .qw-typing-indicator {
        display: none;
        align-self: flex-start;
        padding: 16px 20px;
        background: var(--qw-bg);
        border-radius: 24px;
        border: 1px solid var(--qw-border);
        margin-bottom: 20px;
        animation: fadeIn 0.3s ease-out;
      }

      .qw-typing-indicator.show {
        display: flex;
      }

      .qw-typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .qw-typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--qw-primary);
        animation: typing 1.4s ease-in-out infinite;
      }

      .qw-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .qw-typing-dot:nth-child(3) { animation-delay: 0.4s; }

      .qw-input-container {
        padding: 24px;
        border-top: 1px solid var(--qw-border);
        background: var(--qw-bg);
        display: flex;
        gap: 12px;
        align-items: flex-end;
        position: relative;
      }

      .qw-input {
        flex: 1;
        border: 2px solid var(--qw-border);
        border-radius: 25px;
        padding: 16px 20px;
        font-size: 14px;
        resize: none;
        font-family: inherit;
        transition: all 0.3s ease;
        background: var(--qw-bg);
        color: var(--qw-text);
        line-height: 1.4;
        min-height: 50px;
        max-height: 120px;
      }

      .qw-input:focus {
        outline: none;
        border-color: var(--qw-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        transform: translateY(-1px);
      }

      .qw-input::placeholder {
        color: var(--qw-muted);
      }

      .qw-send-button {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--qw-primary), var(--qw-primary-dark));
        color: var(--qw-primary-contrast);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        flex-shrink: 0;
      }

      .qw-send-button:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      }

      .qw-send-button:active {
        transform: scale(0.95);
      }

      .qw-send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .qw-lead-form {
        display: none;
        padding: 24px;
        background: var(--qw-panel);
        border-top: 1px solid var(--qw-border);
        animation: slideInUp 0.3s ease-out;
      }

      .qw-lead-form.show {
        display: block;
      }

      .qw-lead-form h3 {
        margin: 0 0 16px 0;
        color: var(--qw-text);
        font-size: 16px;
        font-weight: 600;
      }

      .qw-lead-form input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--qw-border);
        border-radius: 12px;
        margin-bottom: 12px;
        font-size: 14px;
        transition: all 0.2s ease;
        background: var(--qw-bg);
        color: var(--qw-text);
      }

      .qw-lead-form input:focus {
        outline: none;
        border-color: var(--qw-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .qw-lead-form button {
        width: 100%;
        padding: 12px 16px;
        background: linear-gradient(135deg, var(--qw-primary), var(--qw-primary-dark));
        color: var(--qw-primary-contrast);
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .qw-lead-form button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
      }

      .qw-welcome-message {
        text-align: center;
        padding: 40px 24px;
        color: var(--qw-muted);
        font-size: 14px;
        line-height: 1.6;
      }

      .qw-welcome-message .qw-welcome-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .qw-welcome-message h3 {
        margin: 0 0 8px 0;
        color: var(--qw-text);
        font-size: 18px;
        font-weight: 600;
      }

      .qw-welcome-message p {
        margin: 0;
        opacity: 0.8;
      }

      @media (max-width: 480px) {
        .qw-chat-container {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          left: 20px;
          right: 20px;
          bottom: 100px;
        }
        
        .qw-launcher {
          width: 60px;
          height: 60px;
          font-size: 24px;
        }
      }
    `
    document.head.appendChild(styles)
  }

  private createLauncher() {
    this.launcher = document.createElement('button')
    this.launcher.className = 'qw-launcher'
    this.launcher.innerHTML = `
      <div class="qw-launcher-icon">
        💬
      </div>
    `
    this.launcher.addEventListener('click', () => this.toggleChat())
    document.body.appendChild(this.launcher)
  }

  private createChatContainer() {
    this.chatContainer = document.createElement('div')
    this.chatContainer.className = 'qw-chat-container'
    this.chatContainer.innerHTML = `
      <div class="qw-chat-header">
        <div class="qw-chat-title">
          <div class="qw-chat-avatar">🤖</div>
          <span>AI Assistant</span>
        </div>
        <button class="qw-chat-close" aria-label="Close chat">×</button>
      </div>
      <div class="qw-messages">
        <div class="qw-welcome-message">
          <div class="qw-welcome-icon">👋</div>
          <h3>Hello! I'm here to help</h3>
          <p>Ask me anything and I'll do my best to assist you.</p>
        </div>
      </div>
      <div class="qw-input-container">
        <textarea class="qw-input" placeholder="Type your message..." rows="1"></textarea>
        <button class="qw-send-button" aria-label="Send message">➤</button>
      </div>
    `
    document.body.appendChild(this.chatContainer)
    
    this.messageContainer = this.chatContainer.querySelector('.qw-messages')!
    this.inputContainer = this.chatContainer.querySelector('.qw-input-container')!
    this.input = this.chatContainer.querySelector('.qw-input')!
    this.sendButton = this.chatContainer.querySelector('.qw-send-button')!
  }

  private createTypingIndicator() {
    this.typingIndicator = document.createElement('div')
    this.typingIndicator.className = 'qw-typing-indicator'
    this.typingIndicator.innerHTML = `
      <div class="qw-typing-dots">
        <div class="qw-typing-dot"></div>
        <div class="qw-typing-dot"></div>
        <div class="qw-typing-dot"></div>
      </div>
    `
  }

  private createLeadForm() {
    this.leadForm = document.createElement('div')
    this.leadForm.className = 'qw-lead-form'
    this.leadForm.innerHTML = `
      <h3>Get in touch</h3>
      <input type="text" placeholder="Your name" id="qw-name">
      <input type="email" placeholder="Your email" id="qw-email">
      <button type="button" id="qw-submit-lead">Send Message</button>
    `
    this.chatContainer?.appendChild(this.leadForm)
  }

  private attachEventListeners() {
    if (!this.chatContainer || !this.input || !this.sendButton) return

    // Close button
    const closeBtn = this.chatContainer.querySelector('.qw-chat-close')
    closeBtn?.addEventListener('click', () => this.closeChat())

    // Send button
    this.sendButton.addEventListener('click', () => this.sendMessage())

    // Input events
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    this.input.addEventListener('input', () => {
      this.adjustInputHeight()
    })

    // Lead form
    const submitBtn = this.leadForm?.querySelector('#qw-submit-lead')
    submitBtn?.addEventListener('click', () => this.submitLead())
  }

  private adjustInputHeight() {
    if (!this.input) return
    this.input.style.height = 'auto'
    this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px'
  }

  private toggleChat() {
    if (this.isOpen) {
      this.closeChat()
    } else {
      this.openChat()
    }
  }

  private openChat() {
    if (!this.chatContainer) return
    
    this.isOpen = true
    this.chatContainer.style.display = 'flex'
    this.chatContainer.classList.add('open')
    
    // Focus input after animation
    setTimeout(() => {
      this.input?.focus()
    }, 400)
    
    this.emit('chat-opened')
  }

  private closeChat() {
    if (!this.chatContainer) return
    
    this.isOpen = false
    this.chatContainer.classList.remove('open')
    
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.style.display = 'none'
      }
    }, 400)
    
    this.emit('chat-closed')
  }

  private async sendMessage() {
    if (!this.input || !this.sendButton) return
    
    const content = this.input.value.trim()
    if (!content) return

    // Disable input and button
    this.input.disabled = true
    this.sendButton.disabled = true

    try {
      // Add user message
      const userMessage: ChatMessageWithId = {
        id: `user-${Date.now()}`,
        role: 'user',
        content
      }
      
      this.addMessage(userMessage)
      this.input.value = ''
      this.adjustInputHeight()

      // Show typing indicator
      this.showTypingIndicator()

      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        this.hideTypingIndicator()
        
        const aiResponse: ChatMessageWithId = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: this.generateAIResponse(content)
        }
        
        this.addMessage(aiResponse)
      }, 1500 + Math.random() * 1000)

    } finally {
      // Re-enable input and button
      if (this.input && this.sendButton) {
        this.input.disabled = false
        this.sendButton.disabled = false
        this.input.focus()
      }
    }
  }

  private addMessage(message: ChatMessageWithId) {
    if (!this.messageContainer) return

    // Remove welcome message if it's the first real message
    const welcomeMessage = this.messageContainer.querySelector('.qw-welcome-message')
    if (welcomeMessage && this.messages.length === 0) {
      welcomeMessage.remove()
    }

    const messageElement = document.createElement('div')
    messageElement.className = `qw-message ${message.role}`
    messageElement.textContent = message.content
    
    this.messageContainer.appendChild(messageElement)
    this.messages.push(message)
    
    // Scroll to bottom
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight
    
    // Emit message event
    this.emit('message', message)
  }

  private showTypingIndicator() {
    if (!this.messageContainer || !this.typingIndicator) return
    
    this.messageContainer.appendChild(this.typingIndicator)
    this.typingIndicator.classList.add('show')
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight
  }

  private hideTypingIndicator() {
    if (!this.typingIndicator) return
    
    this.typingIndicator.classList.remove('show')
    setTimeout(() => {
      if (this.typingIndicator?.parentNode) {
        this.typingIndicator.parentNode.removeChild(this.typingIndicator)
      }
    }, 300)
  }

  private generateAIResponse(userMessage: string): string {
    const responses = [
      "That's a great question! Let me help you with that.",
      "I understand what you're looking for. Here's what I can tell you...",
      "Thanks for asking! Based on your question, I think...",
      "I'd be happy to help with that. Here's what you need to know...",
      "That's an interesting point. Let me break this down for you...",
      "I can definitely assist with that. Here's my recommendation...",
      "Great question! Let me provide you with some insights...",
      "I'm here to help! Here's what I found for you..."
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private submitLead() {
    const nameInput = this.leadForm?.querySelector('#qw-name') as HTMLInputElement
    const emailInput = this.leadForm?.querySelector('#qw-email') as HTMLInputElement
    
    if (!nameInput || !emailInput) return
    
    const name = nameInput.value.trim()
    const email = emailInput.value.trim()
    
    if (!name || !email) {
      alert('Please fill in both name and email')
      return
    }
    
    // Emit lead event
    this.emit('lead', { name, email, phone: '', company: '', consent: true })
    
    // Hide lead form
    this.leadForm?.classList.remove('show')
    
    // Add confirmation message
    const confirmationMessage: ChatMessageWithId = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `Thanks ${name}! I've received your information and will get back to you soon.`
    }
    
    this.addMessage(confirmationMessage)
  }

  // Public methods
  public open() {
    this.openChat()
  }

  public close() {
    this.closeChat()
  }

  public addMessageFromExternal(message: ChatMessage) {
    const messageWithId: ChatMessageWithId = {
      ...message,
      id: message.id || `${message.role}-${Date.now()}`
    }
    this.addMessage(messageWithId)
  }

  public destroy() {
    this.launcher?.remove()
    this.chatContainer?.remove()
    this.emit('destroyed')
  }
}

// Export the widget class
export default QueryWingWidget

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.QueryWingWidget = QueryWingWidget
}
