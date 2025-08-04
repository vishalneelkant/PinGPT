// Popup script for ChatGPT Pinner extension
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const contentElement = document.getElementById('content');
    const statsElement = document.getElementById('stats');
    const messageCountElement = document.getElementById('messageCount');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const minimalUIToggle = document.getElementById('minimalUIToggle');
    const settingsBtn = document.getElementById('settingsBtn');

    // Check if Chrome extension context is valid
    function isChromeContextValid() {
        try {
            return typeof chrome !== 'undefined' && 
                   chrome.runtime && 
                   chrome.runtime.id && 
                   !chrome.runtime.lastError;
        } catch (error) {
            return false;
        }
    }

    // Load user preferences
    function loadPreferences() {
        try {
            if (isChromeContextValid()) {
                chrome.storage.local.get(['darkMode', 'minimalUI'], function(result) {
                    const darkMode = result.darkMode || false;
                    const minimalUI = result.minimalUI || false;
                    
                    // Apply dark mode
                    if (darkMode) {
                        document.body.classList.add('dark-mode');
                        darkModeToggle.classList.add('active');
                    }
                    
                    // Apply minimal UI
                    if (minimalUI) {
                        document.body.classList.add('minimal-ui');
                        minimalUIToggle.classList.add('active');
                    }
                });
            } else {
                // Fallback to localStorage
                const darkMode = localStorage.getItem('chatgptPinner_darkMode') === 'true';
                const minimalUI = localStorage.getItem('chatgptPinner_minimalUI') === 'true';
                
                if (darkMode) {
                    document.body.classList.add('dark-mode');
                    darkModeToggle.classList.add('active');
                }
                
                if (minimalUI) {
                    document.body.classList.add('minimal-ui');
                    minimalUIToggle.classList.add('active');
                }
            }
        } catch (error) {
            console.error('ChatGPT Pinner: Error loading preferences:', error);
        }
    }

    // Save user preferences
    function savePreferences() {
        try {
            const darkMode = document.body.classList.contains('dark-mode');
            const minimalUI = document.body.classList.contains('minimal-ui');
            
            if (isChromeContextValid()) {
                chrome.storage.local.set({
                    darkMode: darkMode,
                    minimalUI: minimalUI
                });
            } else {
                // Fallback to localStorage
                localStorage.setItem('chatgptPinner_darkMode', darkMode.toString());
                localStorage.setItem('chatgptPinner_minimalUI', minimalUI.toString());
            }
        } catch (error) {
            console.error('ChatGPT Pinner: Error saving preferences:', error);
        }
    }

    // Initialize toggles
    function initializeToggles() {
        // Dark mode toggle
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            this.classList.toggle('active');
            savePreferences();
        });

        // Minimal UI toggle
        minimalUIToggle.addEventListener('click', function() {
            document.body.classList.toggle('minimal-ui');
            this.classList.toggle('active');
            savePreferences();
        });

        // Settings button
        settingsBtn.addEventListener('click', function() {
            try {
                if (isChromeContextValid()) {
                    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
                } else {
                    // Fallback: open settings in new window
                    window.open('settings.html', '_blank');
                }
            } catch (error) {
                console.error('ChatGPT Pinner: Error opening settings:', error);
            }
        });
    }

    // Load and display pinned messages
    function loadPinnedMessages() {
        try {
            if (isChromeContextValid()) {
                chrome.storage.local.get(['pinnedMessages'], function(result) {
                    const pinnedMessages = result.pinnedMessages || [];
                    displayMessages(pinnedMessages);
                    updateStats(pinnedMessages.length);
                });
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem('chatgptPinner_pinnedMessages');
                const pinnedMessages = stored ? JSON.parse(stored) : [];
                displayMessages(pinnedMessages);
                updateStats(pinnedMessages.length);
            }
        } catch (error) {
            console.error('ChatGPT Pinner: Error loading pinned messages:', error);
            showEmptyState();
        }
    }

    // Display messages in the popup
    function displayMessages(messages) {
        if (messages.length === 0) {
            showEmptyState();
            return;
        }

        // Sort messages by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const messagesHTML = messages.map(message => createMessageCard(message)).join('');
        contentElement.innerHTML = messagesHTML;

        // Add event listeners to buttons
        addEventListeners();
    }

    // Show empty state when no messages are pinned
    function showEmptyState() {
        contentElement.innerHTML = `
            <div class="empty-state">
                <div class="icon">📌</div>
                <h3>No pinned messages yet</h3>
                <p>Pin important ChatGPT conversations by clicking the pin button that appears when you hover over messages.</p>
            </div>
        `;
    }

    // Create message card HTML
    function createMessageCard(message) {
        const timestamp = formatTimestamp(message.timestamp);
        const authorClass = message.author.toLowerCase().includes('user') ? 'user' : 'assistant';
        const isExpanded = message.content.length <= 100;

        return `
            <div class="message-card" data-message-id="${message.id}">
                <div class="message-header">
                    <div class="author ${authorClass}">${message.author}</div>
                    <div class="timestamp">${timestamp}</div>
                </div>
                <div class="message-content ${isExpanded ? 'expanded' : ''}" data-content="${escapeHtml(message.content)}">
                    ${escapeHtml(message.preview)}
                    ${!isExpanded ? '<button class="expand-btn">Show more</button>' : ''}
                </div>
                <div class="message-actions">
                    <button class="action-btn copy-btn" title="Copy message">
                        📋 Copy
                    </button>
                    <button class="action-btn open-btn" title="Open in ChatGPT">
                        🔗 Open
                    </button>
                    <button class="action-btn delete-btn" title="Remove from pinned">
                        🗑️ Remove
                    </button>
                </div>
            </div>
        `;
    }

    // Add event listeners to buttons
    function addEventListeners() {
        // Expand/collapse buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const contentDiv = this.parentElement;
                const fullContent = contentDiv.getAttribute('data-content');
                
                if (contentDiv.classList.contains('expanded')) {
                    contentDiv.innerHTML = escapeHtml(fullContent.substring(0, 100) + '...') + '<button class="expand-btn">Show more</button>';
                    contentDiv.classList.remove('expanded');
                } else {
                    contentDiv.innerHTML = escapeHtml(fullContent) + '<button class="expand-btn">Show less</button>';
                    contentDiv.classList.add('expanded');
                }
            });
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const messageCard = this.closest('.message-card');
                const content = messageCard.querySelector('.message-content').getAttribute('data-content');
                
                navigator.clipboard.writeText(content).then(() => {
                    showToast('Message copied to clipboard!');
                }).catch(() => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = content;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showToast('Message copied to clipboard!');
                });
            });
        });

        // Open buttons
        document.querySelectorAll('.open-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const messageCard = this.closest('.message-card');
                const messageId = messageCard.getAttribute('data-message-id');
                
                try {
                    if (isChromeContextValid()) {
                        chrome.storage.local.get(['pinnedMessages'], function(result) {
                            const messages = result.pinnedMessages || [];
                            const message = messages.find(m => m.id === messageId);
                    
                            if (message && message.url) {
                                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                    const currentTab = tabs[0];
                                    chrome.tabs.update(currentTab.id, { url: message.url });
                    
                                    setTimeout(() => {
                                        chrome.scripting.executeScript({
                                            target: { tabId: currentTab.id },
                                            func: (msgId) => {
                                                // console.log("MSG  ", msgId);

                                                const highlightAndScroll = (el) => {
                                                    // console.log("el ", el);
                                                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                                                    el.style.background = "#fff7b2";
                                                    setTimeout(() => el.style.background = "", 1000);
                                                };
                                                let attempts = 0;
                                                const maxAttempts = 20;

                                                const tryFind = () => {
                                                    const el = document.querySelector(`[data-message-id="${msgId}"]`);
                                                    if (el) {
                                                        highlightAndScroll(el);
                                                    } else {
                                                        // console.log("failed el, retrying...", attempts);
                                                        attempts++;
                                                        if (attempts < maxAttempts) {
                                                            setTimeout(tryFind, 500);  // try again after 500ms
                                                        } else {
                                                            console.warn("Element not found after max retries");
                                                        }
                                                    }
                                                };

                                                tryFind();
                                            },
                                            args: [message.id]
                                        });
                                    }, 1000); // wait 10 seconds before scrolling
                                });
                            }
                        });
                    } else {
                        // fallback for non-Chrome context
                        const stored = localStorage.getItem('chatgptPinner_pinnedMessages');
                        const messages = stored ? JSON.parse(stored) : [];
                        const message = messages.find(m => m.id === messageId);
                    
                        if (message && message.url) {
                            window.location.href = message.url;
                        }
                    }                    
                } catch (error) {
                    console.error('ChatGPT Pinner: Error opening message:', error);
                }
            });
        });               
        
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const messageCard = this.closest('.message-card');
                const messageId = messageCard.getAttribute('data-message-id');
                
                removePinnedMessage(messageId);
            });
        });
    }

    // Remove pinned message
    function removePinnedMessage(messageId) {
        try {
            if (isChromeContextValid()) {
                chrome.storage.local.get(['pinnedMessages'], function(result) {
                    const messages = result.pinnedMessages || [];
                    const updatedMessages = messages.filter(m => m.id !== messageId);
                    
                    chrome.storage.local.set({ pinnedMessages: updatedMessages }, function() {
                        loadPinnedMessages();
                        showToast('Message removed from pinned');
                    });
                });
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem('chatgptPinner_pinnedMessages');
                const messages = stored ? JSON.parse(stored) : [];
                const updatedMessages = messages.filter(m => m.id !== messageId);
                
                localStorage.setItem('chatgptPinner_pinnedMessages', JSON.stringify(updatedMessages));
                loadPinnedMessages();
                showToast('Message removed from pinned');
            }
        } catch (error) {
            console.error('ChatGPT Pinner: Error removing pinned message:', error);
            showToast('Error removing message');
        }
    }

    // Update statistics
    function updateStats(count) {
        messageCountElement.textContent = count;
    }

    // Format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 168) { // 7 days
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10a37f;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Listen for storage changes
    try {
        if (isChromeContextValid()) {
            chrome.storage.onChanged.addListener(function(changes, namespace) {
                if (namespace === 'local' && changes.pinnedMessages) {
                    const newMessages = changes.pinnedMessages.newValue || [];
                    displayMessages(newMessages);
                    updateStats(newMessages.length);
                }
            });
        }
    } catch (error) {
        console.error('ChatGPT Pinner: Error setting up storage listener:', error);
    }

    // Initialize popup
    loadPreferences();
    initializeToggles();
    loadPinnedMessages();
});
