(function() {
  'use strict';
  
  // Note: Previously we blocked loading on certain hostnames.
  // Now we always allow loading and just log context for debugging.
  try {
    console.log('[QueryWing widget] Host:', window.location.hostname, 'Path:', window.location.pathname)
  } catch {}
  
  // Get the base URL for API calls
  const getApiBaseUrl = () => {
    const script = document.currentScript || document.querySelector('script[data-bot-id]');
    const apiUrl = script?.getAttribute('data-api-url');
    if (apiUrl) return apiUrl;
    return 'https://app.querywing.com';
  };
  
  const API_BASE_URL = getApiBaseUrl();
  const ACTUAL_API_BASE = API_BASE_URL;
  
  // Get bot configuration from script tag
  const script = document.currentScript || document.querySelector('script[data-bot-id]');
  const botId = script?.getAttribute('data-bot-id') || '';
  const botName = script?.getAttribute('data-bot-name') || 'AI Assistant';
  const primaryColor = script?.getAttribute('data-primary-color') || '#6366f1';
  const position = script?.getAttribute('data-position') || 'bottom-right';
  const overrideTheme = script?.getAttribute('data-theme');
  const overrideWelcome = script?.getAttribute('data-welcome-message');
  
  // Configuration
  if (!botId) {
    console.error('QueryWing widget: data-bot-id is required on the script tag.');
  }

  const config = {
    botId: botId,
    botName: botName,
    primaryColor: primaryColor,
    position: position,
    brandName: 'QueryWing'
  };

  // Beautiful Animated Chat Widget Class
  class BeautifulChatWidget {
    constructor() {
      this.isOpen = false;
      this.messages = [];
      this.isTyping = false;
      this.conversationId = null;
      this.visitorId = this.generateVisitorId();
      this.botDeleted = false;
      this.unreadCount = 0;
      this.init();
    }

    generateVisitorId() {
      let visitorId = localStorage.getItem('querywing_visitor_id');
      if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('querywing_visitor_id', visitorId);
      }
      return visitorId;
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.bindEvents();
      this.fetchBotDetails();
      this.initializeConversation();
      this.trackPageView();
      this.startVisitorTracking();
    }

    trackPageView() {
      // Track page view
      this.trackEvent('page_view', {
        botId: config.botId,
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      });

      // Track if this is a returning visitor
      const lastVisit = localStorage.getItem('querywing_last_visit');
      const isReturning = !!lastVisit;
      
      if (isReturning) {
        this.trackEvent('returning_visitor', {
          botId: config.botId,
          lastVisit: lastVisit,
          timestamp: new Date().toISOString()
        });
      } else {
        this.trackEvent('new_visitor', {
          botId: config.botId,
          timestamp: new Date().toISOString()
        });
      }

      // Update last visit timestamp
      localStorage.setItem('querywing_last_visit', new Date().toISOString());
    }

    startVisitorTracking() {
      // Track time spent on page
      let startTime = Date.now();
      
      // Track when visitor leaves the page
      window.addEventListener('beforeunload', () => {
        const timeSpent = Date.now() - startTime;
        this.trackEvent('page_exit', {
          botId: config.botId,
          timeSpent: timeSpent,
          timestamp: new Date().toISOString()
        });
      });

      // Track scroll depth
      let maxScrollDepth = 0;
      window.addEventListener('scroll', () => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
          
          // Track significant scroll milestones
          if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
            this.trackEvent('scroll_25_percent', { botId: config.botId, timestamp: new Date().toISOString() });
          } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
            this.trackEvent('scroll_50_percent', { botId: config.botId, timestamp: new Date().toISOString() });
          } else if (maxScrollDepth >= 75) {
            this.trackEvent('scroll_75_percent', { botId: config.botId, timestamp: new Date().toISOString() });
          }
        }
      });

      // Track chat widget interactions
      this.on('chat-opened', () => {
        this.trackEvent('chat_widget_opened', {
          botId: config.botId,
          timestamp: new Date().toISOString()
        });
      });

      this.on('chat-closed', () => {
        this.trackEvent('chat_widget_closed', {
          botId: config.botId,
          timestamp: new Date().toISOString()
        });
      });
    }

    injectStyles() {
      if (document.getElementById('querywing-beautiful-styles')) return;

      const styles = document.createElement('style');
      styles.id = 'querywing-beautiful-styles';
      styles.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes popIn {
          0% { transform: scale(0.95) translateY(6px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
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
          --qw-primary: ${config.primaryColor};
          --qw-primary-dark: ${this.adjustColor(config.primaryColor, -20)};
          --qw-primary-light: ${this.adjustColor(config.primaryColor, 20)};
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
          ${config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
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
          visibility: visible;
          pointer-events: auto;
          position: fixed;
        }

        .qw-launcher:hover {
          transform: scale(1.15) rotate(5deg);
          box-shadow: var(--qw-shadow-lg);
          animation-play-state: paused;
        }

        .qw-launcher:active {
          transform: scale(0.95);
        }

        .qw-unread-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ef4444;
          color: #fff;
          border-radius: 9999px;
          padding: 2px 6px;
          font-size: 11px;
          line-height: 1;
          box-shadow: 0 6px 14px rgba(239,68,68,0.35);
          border: 2px solid #fff;
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
          ${config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
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
          animation: popIn 240ms cubic-bezier(0.22,1,0.36,1);
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

        .qw-error-message {
          text-align: center;
          padding: 40px 24px;
          color: #ef4444;
          font-size: 14px;
          line-height: 1.6;
        }

        .qw-error-message .qw-error-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.7;
        }

        .qw-error-message h3 {
          margin: 0 0 8px 0;
          color: #ef4444;
          font-size: 18px;
          font-weight: 600;
        }

        .qw-error-message p {
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
      `;
      
      document.head.appendChild(styles);
    }

    adjustColor(color, amount) {
      const hex = color.replace('#', '');
      const num = parseInt(hex, 16);
      const r = Math.min(255, Math.max(0, (num >> 16) + amount));
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
      const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
      return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    }

    createWidget() {
      // Create launcher button
      this.launcher = document.createElement('div');
      this.launcher.className = `qw-launcher qw-position-${config.position}`;
      this.launcher.innerHTML = `
        <div class="qw-launcher-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="qw-launcher-pulse"></div>
        <div class="qw-unread-badge" style="display:none;">0</div>
      `;
      
      // Create chat container
      this.chatContainer = document.createElement('div');
      this.chatContainer.className = `qw-chat-container qw-position-${config.position}`;
      this.chatContainer.innerHTML = `
        <div class="qw-chat-header">
          <div class="qw-chat-title">
            <div class="qw-bot-avatar">
              <div class="qw-bot-avatar-icon">🤖</div>
            </div>
            <div>
              <span>${config.botName}</span>
              <div class="qw-status-indicator">
                <span class="qw-status-dot"></span>
                <span class="qw-status-text">Online</span>
              </div>
            </div>
          </div>
          <button class="qw-close-btn" aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="qw-message-container">
          <div class="qw-welcome-message">
            <div class="qw-welcome-icon">🤖</div>
            <h3>Hello! I'm ${config.botName}</h3>
            <p>${overrideWelcome || 'Ask me anything and I\'ll do my best to assist you.'}</p>
            <div class="qw-quick-replies">
              <button data-q="Tell me about pricing">💲 Pricing</button>
              <button data-q="Can I see a demo?">🎥 Demo</button>
              <button data-q="I want to talk to a human">🧑‍💼 Talk to human</button>
            </div>
          </div>
        </div>
        
        <div class="qw-input-container">
          <div class="qw-input-wrapper">
            <textarea 
              class="qw-input" 
              placeholder="Type your message here..."
              rows="1"
            ></textarea>
            <button class="qw-send-btn" aria-label="Send message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0L20 10L10 20L8.5 18.5L16.5 10.5H0V9.5H16.5L8.5 1.5L10 0Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div class="qw-live-agent-handoff" style="display: none;">
            <button class="qw-handoff-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Connect to Live Agent
            </button>
          </div>
        </div>
        
        <div class="qw-typing-indicator" style="display: none;">
          <div class="qw-typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="qw-typing-text">AI is typing...</span>
        </div>
      `;
      
      // Add to page
      document.body.appendChild(this.launcher);
      document.body.appendChild(this.chatContainer);
      
      // Store references
      this.messageContainer = this.chatContainer.querySelector('.qw-message-container');
      this.input = this.chatContainer.querySelector('.qw-input');
      this.sendButton = this.chatContainer.querySelector('.qw-send-btn');
      this.handoffButton = this.chatContainer.querySelector('.qw-handoff-btn');
      this.liveAgentHandoff = this.chatContainer.querySelector('.qw-live-agent-handoff');
      this.unreadBadge = this.launcher.querySelector('.qw-unread-badge');
      // Quick replies
      this.messageContainer.querySelectorAll('.qw-quick-replies button')
        .forEach(btn => btn.addEventListener('click', () => {
          this.input.value = btn.getAttribute('data-q') || ''
          this.sendMessage()
        }))
      
      // Initialize
      this.adjustInputHeight();
    }

    bindEvents() {
      if (!this.chatContainer || !this.input || !this.sendButton) return;

      // Launcher button
      this.launcher?.addEventListener('click', () => this.toggleChat());

      // Close button
      const closeBtn = this.chatContainer.querySelector('.qw-close-btn');
      closeBtn?.addEventListener('click', () => this.closeChat());

      // Send button
      this.sendButton.addEventListener('click', () => this.sendMessage());

      // Input events
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      this.input.addEventListener('input', () => {
        this.adjustInputHeight();
      });
    }

    adjustInputHeight() {
      if (!this.input) return;
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    }

    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    }

    openChat() {
      if (!this.chatContainer) return;
      
      this.isOpen = true;
      this.chatContainer.style.display = 'flex';
      this.chatContainer.classList.add('open');
      this.resetUnread();
      
      // Focus input after animation
      setTimeout(() => {
        this.input?.focus();
      }, 400);
      
      // Emit event
      this.emit('chat-opened');
    }

    closeChat() {
      if (!this.chatContainer) return;
      
      this.isOpen = false;
      this.chatContainer.classList.remove('open');
      
      setTimeout(() => {
        if (this.chatContainer) {
          this.chatContainer.style.display = 'none';
        }
      }, 400);
      
      // Emit event
      this.emit('chat-closed');
    }

    showTypingIndicator() {
      const typingIndicator = this.chatContainer?.querySelector('.qw-typing-indicator');
      if (typingIndicator) {
        typingIndicator.style.display = 'flex';
      }
    }

    hideTypingIndicator() {
      const typingIndicator = this.chatContainer?.querySelector('.qw-typing-indicator');
      if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
    }

    emit(eventName, data) {
      // Simple event emitter
      if (this.events && this.events[eventName]) {
        this.events[eventName].forEach(callback => callback(data));
      }
    }

    on(eventName, callback) {
      if (!this.events) this.events = {};
      if (!this.events[eventName]) this.events[eventName] = [];
      this.events[eventName].push(callback);
    }

    async sendMessage() {
      if (!this.input || !this.sendButton) return;
      
      const content = this.input.value.trim();
      if (!content) return;

      // Disable input and button
      this.input.disabled = true;
      this.sendButton.disabled = true;

      try {
        // Add user message
        const userMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content
        };
        
        this.addMessage(userMessage);
        this.input.value = '';
        this.adjustInputHeight();

        // Show typing indicator
        this.showTypingIndicator();

        // Send to API
        const response = await this.sendToAPI(content);
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Add AI response
        const aiResponse = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.content || 'I apologize, but I encountered an error. Please try again.'
        };
        
        this.addMessage(aiResponse);

        // Check if live agent was requested
        if (response.liveAgentRequested) {
          this.showLiveAgentHandoff();
        }

        // Track successful chat interaction
        this.trackEvent('chat_interaction', {
          botId: config.botId,
          conversationId: this.conversationId,
          userMessageLength: content.length,
          aiResponseLength: response.content?.length || 0,
          timestamp: new Date().toISOString()
        });

        // Check if this might be a lead (user asking about pricing, demo, contact, etc.)
        if (this.isLeadIntent(content)) {
          this.trackEvent('lead_intent_detected', {
            botId: config.botId,
            conversationId: this.conversationId,
            intent: this.detectLeadIntent(content),
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Failed to send message:', error);
        this.hideTypingIndicator();
        
        const errorResponse = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: this.getErrorMessage(error)
        };
        
        this.addMessage(errorResponse);
        
        // Track error event
        this.trackEvent('chat_error', {
          botId: config.botId,
          conversationId: this.conversationId,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        // Re-enable input and button
        if (this.input && this.sendButton) {
          this.input.disabled = false;
          this.sendButton.disabled = false;
          this.input.focus();
        }
      }
    }

    showLiveAgentHandoff() {
      if (this.liveAgentHandoff && this.botSettings?.enableLiveAgents) {
        this.liveAgentHandoff.style.display = 'block';
        
        // Add handoff button event listener
        if (this.handoffButton) {
          this.handoffButton.onclick = () => this.requestLiveAgent();
        }
      }
    }

    async requestLiveAgent() {
      try {
        if (!this.conversationId) return;
        
        // Show loading state
        if (this.handoffButton) {
          this.handoffButton.disabled = true;
          this.handoffButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Connecting...
          `;
        }
        
        // Create live agent request
        const response = await fetch(`${ACTUAL_API_BASE}/api/v1/live-agent-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: this.botSettings?.tenantId || this.botTenantId || '',
            conversationId: this.conversationId,
            visitorId: this.visitorId,
            botId: config.botId,
            requestType: 'chat_handoff',
            priority: 'normal'
          })
        });
        
        if (response.ok) {
          // Show success message
          this.addMessage({
            id: `system-${Date.now()}`,
            role: 'assistant',
            content: '🔄 **Live Agent Requested**: I\'ve requested a live agent to assist you. They will join this conversation shortly. Please wait while I connect you.'
          });
          
          // Hide handoff button
          if (this.liveAgentHandoff) {
            this.liveAgentHandoff.style.display = 'none';
          }
          
          // Track live agent request
          this.trackEvent('live_agent_requested', {
            botId: config.botId,
            conversationId: this.conversationId,
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('Failed to request live agent');
        }
      } catch (error) {
        console.error('Error requesting live agent:', error);
        
        // Show error message
        this.addMessage({
          id: `system-${Date.now()}`,
          role: 'assistant',
          content: '❌ **Live Agent Request Failed**: I\'m sorry, but I couldn\'t connect you to a live agent at the moment. Please try again later or continue chatting with me.'
        });
        
        // Reset handoff button
        if (this.handoffButton) {
          this.handoffButton.disabled = false;
          this.handoffButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Connect to Live Agent
          `;
        }
      }
    }

    async sendToAPI(content) {
      try {
        // Primary path: bot-aware API
        let response = await fetch(`${ACTUAL_API_BASE}/api/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            botId: config.botId,
            conversationId: this.conversationId,
            visitorId: this.visitorId,
            metadata: {
              url: window.location.href,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Handle specific error cases
          if (response.status === 404) {
            if (errorData.error?.includes('deleted') || errorData.error?.includes('not found')) {
              this.handleBotDeleted();
              throw new Error('Bot not found or deleted');
            }
          }
          
          // Fallback: basic public chat that only needs OpenAI key server-side
          response = await fetch(`${ACTUAL_API_BASE}/api/public-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: content, history: this.messages })
          })
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
          }
        }

        const data = await response.json();
        
        // Update conversation ID if provided
        if (data.conversationId) {
          this.conversationId = data.conversationId;
        }
        
        return {
          content: data.response || data.content || 'I apologize, but I encountered an error. Please try again.',
          conversationId: data.conversationId,
          metadata: data.metadata
        };
        
      } catch (error) {
        console.error('Chat API error:', error);
        
        // If it's a network error, try to provide helpful response
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
          throw new Error('Network error - please check your connection');
        }
        
        throw error;
      }
    }

    addMessage(message) {
      if (!this.messageContainer) return;

      // Remove welcome message if it's the first real message
      const welcomeMessage = this.messageContainer.querySelector('.qw-welcome-message');
      if (welcomeMessage && this.messages.length === 0) {
        welcomeMessage.remove();
      }

      const messageElement = document.createElement('div');
      messageElement.className = `qw-message ${message.role}`;
      messageElement.textContent = message.content;
      
      this.messageContainer.appendChild(messageElement);
      this.messages.push(message);
      
      // Scroll to bottom
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
      
      // Track message events
      if (message.role === 'user') {
        this.trackEvent('message_sent', {
          botId: config.botId,
          conversationId: this.conversationId,
          messageLength: message.content.length,
          timestamp: new Date().toISOString()
        });
      } else if (message.role === 'assistant') {
        this.trackEvent('message_received', {
          botId: config.botId,
          conversationId: this.conversationId,
          messageLength: message.content.length,
          timestamp: new Date().toISOString()
        });
        if (!this.isOpen) this.bumpUnread();
      }
    }

    bumpUnread() {
      this.unreadCount = Math.min(99, this.unreadCount + 1);
      if (this.unreadBadge) {
        this.unreadBadge.textContent = String(this.unreadCount);
        this.unreadBadge.style.display = 'block';
      }
    }

    resetUnread() {
      this.unreadCount = 0;
      if (this.unreadBadge) this.unreadBadge.style.display = 'none';
    }

    async fetchBotDetails() {
      try {
        const response = await fetch(`${ACTUAL_API_BASE}/api/v1/bots/${config.botId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            this.handleBotDeleted();
            return;
          }
          throw new Error(`Failed to fetch bot: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.bot) {
          // Update bot name if different from config
          if (data.bot.name && data.bot.name !== config.botName) {
            config.botName = data.bot.name;
            this.updateBotName();
          }
          
          // Check bot status
          if (data.bot.status === 'inactive' || data.bot.status === 'deleted') {
            this.handleBotDeleted();
            return;
          }
          
          // Update bot description if available
          if (data.bot.description) {
            this.updateBotDescription(data.bot.description);
          }
          
          // Update bot settings
          if (data.bot.settings) {
            this.updateBotSettings(data.bot.settings);
          }

          // Store tenantId for subsequent requests
          if (data.bot.tenantId) {
            this.botTenantId = data.bot.tenantId;
          }
          
          // Check if bot has any conversations or usage data
          if (data.bot.conversations && data.bot.conversations.length > 0) {
            this.updateWelcomeMessage(data.bot);
          }
        }
        
        // Emit bot loaded event
        this.emit('bot-loaded', data.bot);
        
      } catch (error) {
        console.error('Failed to fetch bot details:', error);
        
        // If we can't fetch bot details, assume it might be deleted
        if (error.message.includes('fetch') || error.message.includes('network')) {
          this.handleBotDeleted();
        }
      }
    }

    updateBotName() {
      const botNameElement = this.chatContainer?.querySelector('.qw-chat-title span');
      if (botNameElement) {
        botNameElement.textContent = config.botName;
      }
    }

    updateBotDescription(description) {
      const welcomeMessage = this.messageContainer?.querySelector('.qw-welcome-message p');
      if (welcomeMessage && description) {
        welcomeMessage.textContent = description;
      }
    }

    updateWelcomeMessage(bot) {
      if (!this.messageContainer) return;
      
      const welcomeMessage = this.messageContainer.querySelector('.qw-welcome-message');
      if (welcomeMessage && bot) {
        // Update welcome message based on bot data
        const iconElement = welcomeMessage.querySelector('.qw-welcome-icon');
        const titleElement = welcomeMessage.querySelector('h3');
        const descElement = welcomeMessage.querySelector('p');
        
        if (iconElement) iconElement.textContent = '🤖';
        if (titleElement) titleElement.textContent = `Hello! I'm ${bot.name}`;
        if (descElement && bot.description) {
          descElement.textContent = bot.description;
        } else if (descElement) {
          descElement.textContent = 'Ask me anything and I\'ll do my best to assist you.';
        }
      }
    }

    updateBotSettings(settings) {
      if (!settings) return;
      
      // Update theme
      if ((overrideTheme || settings.theme) && (overrideTheme || settings.theme) !== 'auto') {
        this.updateTheme(overrideTheme || settings.theme);
      }
      
      // Update position
      if (settings.position && settings.position !== config.position) {
        this.updatePosition(settings.position);
      }
      
      // Update welcome message
      if (settings.welcomeMessage || overrideWelcome) {
        const welcomeMessage = this.messageContainer?.querySelector('.qw-welcome-message p');
        if (welcomeMessage) {
          welcomeMessage.textContent = overrideWelcome || settings.welcomeMessage;
        }
      }
      
      // Store settings for later use
      this.botSettings = settings;
      // If live agents are enabled, reveal handoff control after first AI reply
      if (this.botSettings && this.botSettings.enableLiveAgents && this.liveAgentHandoff) {
        this.liveAgentHandoff.style.display = 'none';
      }
    }

    updateTheme(theme) {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('qw-dark-theme');
      } else {
        root.classList.remove('qw-dark-theme');
      }
    }

    updatePosition(position) {
      if (this.launcher) {
        this.launcher.className = `qw-launcher qw-position-${position}`;
      }
      if (this.chatContainer) {
        this.chatContainer.className = `qw-chat-container qw-position-${position}`;
      }
    }

    handleBotDeleted() {
      this.botDeleted = true;
      // Keep launcher visible so site owners can notice and debug
      if (this.launcher) {
        this.launcher.style.filter = 'grayscale(1)';
        this.launcher.style.opacity = '0.9';
        this.launcher.title = 'Chatbot unavailable';
      }
      // Show an error panel instead of hiding the widget entirely
      if (this.messageContainer && this.chatContainer) {
        this.chatContainer.style.display = 'flex';
        this.chatContainer.classList.add('open');
        this.messageContainer.innerHTML = `
          <div class="qw-error-message">
            <div class="qw-error-icon">⚠️</div>
            <h3>Chatbot Unavailable</h3>
            <p>Could not load this bot. Please verify the data-bot-id and API URL.</p>
          </div>
        `;
      }
    }

    async initializeConversation() {
      try {
        // First check if bot exists and is active
        await this.fetchBotDetails();
        
        // Create a new conversation for this visitor
        const response = await fetch(`${ACTUAL_API_BASE}/api/v1/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botId: config.botId,
            visitorId: this.visitorId,
            metadata: {
              url: window.location.href,
              userAgent: navigator.userAgent,
              referrer: document.referrer,
              timestamp: new Date().toISOString(),
              pageTitle: document.title
            }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          this.conversationId = data.conversation?.id;
          
          // Log conversation start for analytics
          this.trackEvent('conversation_started', {
            botId: config.botId,
            conversationId: this.conversationId,
            visitorId: this.visitorId
          });
          
          console.log('Conversation initialized:', this.conversationId);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to create conversation:', errorData);
          
          // If bot not found, handle deletion
          if (response.status === 404 && errorData.error?.includes('bot')) {
            this.handleBotDeleted();
          }
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        
        // If we can't create conversation, still allow chat but log the issue
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.warn('Network issue - chat may not be fully functional');
        }
      }
    }

    trackEvent(eventName, data) {
      try {
        // Send analytics event to API
        fetch(`${ACTUAL_API_BASE}/api/v1/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: eventName,
            botId: config.botId,
            conversationId: this.conversationId,
            visitorId: this.visitorId,
            data: data,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.log('Analytics tracking failed:', err));
        
        // Also emit local event
        this.emit(eventName, data);
      } catch (error) {
        console.log('Analytics tracking error:', error);
      }
    }

    isLeadIntent(message) {
      const leadKeywords = [
        'pricing', 'price', 'cost', 'how much', 'demo', 'trial', 'contact', 'sales',
        'quote', 'estimate', 'buy', 'purchase', 'subscription', 'plan', 'package'
      ];
      
      const lowerMessage = message.toLowerCase();
      return leadKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    detectLeadIntent(message) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return 'pricing_inquiry';
      } else if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
        return 'demo_request';
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('sales')) {
        return 'contact_request';
      } else if (lowerMessage.includes('quote') || lowerMessage.includes('estimate')) {
        return 'quote_request';
      }
      
      return 'general_inquiry';
    }

    getErrorMessage(error) {
      if (error.message.includes('Bot not found') || error.message.includes('deleted')) {
        return 'This chatbot is no longer available. Please contact the website administrator.';
      } else if (error.message.includes('Network error')) {
        return 'I\'m having trouble connecting right now. Please check your internet connection and try again.';
      } else if (error.message.includes('HTTP 500')) {
        return 'I\'m experiencing technical difficulties. Please try again in a moment.';
      } else if (error.message.includes('HTTP 429')) {
        return 'I\'m receiving too many requests. Please wait a moment and try again.';
      }
      
      return 'I apologize, but I encountered an error. Please try again.';
    }
  }

  // Initialize the widget
  const boot = () => {
    try {
      const widget = new BeautifulChatWidget();
      window.QueryWingWidget = widget;
      console.log('🚀 QueryWing Chatbot Widget initialized!', { botId: config.botId, api: ACTUAL_API_BASE });
      widget.on('bot-loaded', (bot) => console.log('✅ Bot loaded:', bot?.id))
    } catch (error) {
      console.error('❌ Failed to initialize QueryWing Widget:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})();
