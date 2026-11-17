// Salo Local Hub - AI Chatbot
// Initialize on page load

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiEndpoint: '/.netlify/functions/chat',
    detectArabic: true,
    maxCharsPerMessage: 500,
  };

  // State
  let state = {
    isOpen: false,
    isLoading: false,
    messages: [],
    captureMode: null, // null, 'lead-capture', or 'form-field'
    captureData: {},
  };

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    injectHTML();
    attachEventListeners();
    displayWelcomeMessage();
  }

  // Inject HTML
  function injectHTML() {
    const chatbotHTML = `
      <button id="chatbot-button" aria-label="Open AI Assistant Chat" title="Chat with our AI assistant">
        💬
      </button>

      <div id="chatbot-window" aria-label="AI Assistant Chat Window" role="dialog">
        <div class="chatbot-header">
          <h3>Togba Local Hub Assistant</h3>
          <div class="chatbot-header-actions">
            <button id="chatbot-new-chat" aria-label="Start new conversation" title="New chat">New</button>
            <button id="chatbot-close" aria-label="Close chat" title="Close">✕</button>
          </div>
        </div>

        <div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite" aria-atomic="false"></div>

        <div class="chatbot-quick-actions" id="chatbot-quick-actions">
          <button class="chatbot-quick-btn" data-action="services">
            What services do you offer?
          </button>
          <button class="chatbot-quick-btn" data-action="consultation">
            Get a free consultation
          </button>
          <button class="chatbot-quick-btn" data-action="tips">
            Digital marketing tips for Dubai
          </button>
        </div>

        <div class="chatbot-actions" id="chatbot-actions" style="display: none;">
          <button class="chatbot-action-btn" id="chatbot-whatsapp" aria-label="Contact on WhatsApp">
            WhatsApp
          </button>
          <button class="chatbot-action-btn secondary" id="chatbot-contact-form" aria-label="Contact form">
            Contact Form
          </button>
        </div>

        <div class="chatbot-input-area">
          <textarea
            id="chatbot-input"
            placeholder="Type your message..."
            aria-label="Message input"
            maxlength="500"
            rows="1"
          ></textarea>
          <button id="chatbot-send" aria-label="Send message">Send</button>
        </div>

        <div class="chatbot-footer">
          ⚠️ AI assistant. Answers may contain errors.
        </div>
      </div>
    `;

    // Inject styles if not already present
    if (!document.querySelector('link[href*="chatbot.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/chatbot.css';
      document.head.appendChild(link);
    }

    // Inject HTML
    const container = document.createElement('div');
    container.id = 'chatbot-container';
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container);
  }

  // Event Listeners
  function attachEventListeners() {
    const button = document.getElementById('chatbot-button');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const newChatBtn = document.getElementById('chatbot-new-chat');
    const quickButtons = document.querySelectorAll('.chatbot-quick-btn');
    const whatsappBtn = document.getElementById('chatbot-whatsapp');
    const contactFormBtn = document.getElementById('chatbot-contact-form');

    // Toggle window
    button.addEventListener('click', toggleWindow);
    closeBtn.addEventListener('click', toggleWindow);

    // Send message
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', autoResizeTextarea);

    // New chat
    newChatBtn.addEventListener('click', clearChat);

    // Quick actions
    quickButtons.forEach(btn => {
      btn.addEventListener('click', handleQuickAction);
    });

    // Action buttons
    whatsappBtn.addEventListener('click', openWhatsApp);
    contactFormBtn.addEventListener('click', openContactForm);
  }

  // Toggle chat window
  function toggleWindow() {
    state.isOpen = !state.isOpen;
    const window = document.getElementById('chatbot-window');
    if (state.isOpen) {
      window.classList.add('open');
      document.getElementById('chatbot-input').focus();
      setDirection();
    } else {
      window.classList.remove('open');
    }
  }

  // Set direction (RTL for Arabic)
  function setDirection() {
    const window = document.getElementById('chatbot-window');
    const isArabic = CONFIG.detectArabic && /[\u0600-\u06FF]/.test(state.messages.map(m => m.content).join(''));
    window.dir = isArabic ? 'rtl' : 'ltr';
  }

  // Send message
  async function sendMessage() {
    if (state.isLoading) return;
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (!message) return;
    if (message.length > CONFIG.maxCharsPerMessage) {
      alert(`Message too long. Maximum ${CONFIG.maxCharsPerMessage} characters.`);
      return;
    }

    // Add user message to UI
    addMessageToUI('user', message);
    input.value = '';
    input.style.height = 'auto';

    state.isLoading = true;
    updateSendButton();

    try {
      // Prepare messages for API
      const messagesToSend = state.messages
        .filter(m => m.role !== 'system')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content.slice(0, CONFIG.maxCharsPerMessage) }));

      // Call backend
      const response = await fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        addMessageToUI('assistant', error.error || 'Unable to process your request. Please try again.');
        state.isLoading = false;
        updateSendButton();
        return;
      }

      const data = await response.json();
      const assistantMessage = data.content;

      // Add to UI with typing indicator
      showTypingIndicator();
      removeTypingIndicator();
      addMessageToUI('assistant', assistantMessage);
      setDirection();
      detectLeadCaptureIntent(assistantMessage);

    } catch (error) {
      console.error('Chat error:', error);
      addMessageToUI('assistant', 'Connection error. Please try again.');
    }

    state.isLoading = false;
    updateSendButton();
  }

  // Add message to UI
  function addMessageToUI(role, content) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${role}`;
    messageDiv.setAttribute('role', 'article');

    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message-bubble';
    bubble.textContent = content;

    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);

    // Add to state if not system message
    if (role !== 'system') {
      state.messages.push({ role, content });
    }

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const indicator = document.createElement('div');
    indicator.className = 'chatbot-message assistant';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  // Display welcome message
  function displayWelcomeMessage() {
    setTimeout(() => {
      if (state.messages.length === 0) {
        addMessageToUI('system', 'Welcome to Togba Local Hub! How can I help you today? 👋');
      }
    }, 500);
  }

  // Handle quick actions
  function handleQuickAction(e) {
    const action = e.target.getAttribute('data-action');
    const quickMessages = {
      services: 'What services do you offer?',
      consultation: 'I\'d like to get a free consultation',
      tips: 'Can you give me some digital marketing tips for Dubai?',
    };

    const message = quickMessages[action];
    if (message) {
      const input = document.getElementById('chatbot-input');
      input.value = message;
      sendMessage();
    }
  }

  // Detect lead capture intent
  function detectLeadCaptureIntent(message) {
    const keywords = ['consultation', 'quote', 'contact', 'proposal', 'package', 'pricing'];
    const lowerMsg = message.toLowerCase();

    if (keywords.some(kw => lowerMsg.includes(kw))) {
      showActions();
    }
  }

  // Show action buttons
  function showActions() {
    const actions = document.getElementById('chatbot-actions');
    actions.style.display = 'flex';
  }

  // Open WhatsApp
  function openWhatsApp() {
    window.open('https://wa.me/971562411885', '_blank');
  }

  // Open contact form
  function openContactForm() {
    window.location.href = '/contact';
  }

  // Clear chat
  function clearChat() {
    if (state.isLoading) return;
    state.messages = [];
    document.getElementById('chatbot-messages').innerHTML = '';
    document.getElementById('chatbot-actions').style.display = 'none';
    displayWelcomeMessage();
  }

  // Update send button state
  function updateSendButton() {
    document.getElementById('chatbot-send').disabled = state.isLoading;
  }

  // Auto-resize textarea
  function autoResizeTextarea(e) {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  }

})();
