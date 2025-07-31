// Content script for ChatGPT Pinner extension
(function() {
    'use strict';

    // Configuration
    const DEBUG_MODE = true;
    const PIN_BUTTON_CLASS = 'chatgpt-pinner-button';
    const PINNED_CLASS = 'pinned';
    const PIN_ICON = '📌';
    const UNPIN_ICON = '📍';

    // Global variables
    let pinnedMessages = [];
    let isInitialized = false;
    let storageMethod = 'chrome'; // 'chrome' or 'localStorage'

    // Initialize the extension
    function init() {
        try {
            if (isInitialized) {
                if (DEBUG_MODE) console.log('ChatGPT Pinner: Already initialized');
                return;
            }

            if (DEBUG_MODE) console.log('ChatGPT Pinner: Initializing extension...');
            
            // Initialize pinnedMessages array
            pinnedMessages = [];
            
            // Load pinned messages
            loadPinnedMessages();
            
            // Add styles
            addStyles();
            
            // Start observing chat changes
            observeChatChanges();
            
            // Start context check
            startContextCheck();
            
            isInitialized = true;
            if (DEBUG_MODE) console.log('ChatGPT Pinner: Extension initialized successfully');
        } catch (error) {
            console.error('ChatGPT Pinner: Error during initialization:', error);
            // Try to recover
            setTimeout(() => {
                console.log('ChatGPT Pinner: Attempting to reinitialize...');
                isInitialized = false;
                init();
            }, 2000);
        }
    }

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

    // Load pinned messages from storage
    function loadPinnedMessages() {
        try {
            if (isChromeContextValid() && storageMethod === 'chrome') {
                // Try Chrome storage first
                chrome.storage.local.get(['pinnedMessages'], function(result) {
                    if (chrome.runtime.lastError) {
                        console.warn('ChatGPT Pinner: Chrome storage failed, switching to localStorage');
                        storageMethod = 'localStorage';
                        loadFromLocalStorage();
                    } else {
                        pinnedMessages = result.pinnedMessages || [];
                        if (DEBUG_MODE) console.log('ChatGPT Pinner: Loaded', pinnedMessages.length, 'pinned messages from Chrome storage');
                    }
                });
            } else {
                // Use localStorage
                storageMethod = 'localStorage';
                loadFromLocalStorage();
            }
        } catch (error) {
            console.error('ChatGPT Pinner: Error loading pinned messages:', error);
            storageMethod = 'localStorage';
            loadFromLocalStorage();
        }
    }

    // Load from localStorage
    function loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('chatgptPinner_pinnedMessages');
            if (stored) {
                pinnedMessages = JSON.parse(stored);
                if (DEBUG_MODE) console.log('ChatGPT Pinner: Loaded', pinnedMessages.length, 'pinned messages from localStorage');
            } else {
                pinnedMessages = [];
                if (DEBUG_MODE) console.log('ChatGPT Pinner: No pinned messages found in localStorage');
            }
        } catch (error) {
            console.error('ChatGPT Pinner: Error loading from localStorage:', error);
            pinnedMessages = [];
        }
    }

    // Save pinned messages to storage
    function savePinnedMessages() {
        try {
            if (storageMethod === 'chrome' && isChromeContextValid()) {
                chrome.storage.local.set({ pinnedMessages: pinnedMessages }, function() {
                    if (chrome.runtime.lastError) {
                        console.warn('ChatGPT Pinner: Chrome storage failed, switching to localStorage');
                        storageMethod = 'localStorage';
                        saveToLocalStorage();
                    } else {
                        if (DEBUG_MODE) console.log('ChatGPT Pinner: Saved', pinnedMessages.length, 'pinned messages to Chrome storage');
                    }
                });
            } else {
                storageMethod = 'localStorage';
                saveToLocalStorage();
            }
        } catch (error) {
            console.error('ChatGPT Pinner: Error saving pinned messages:', error);
            storageMethod = 'localStorage';
            saveToLocalStorage();
        }
    }

    // Save to localStorage
    function saveToLocalStorage() {
        try {
            localStorage.setItem('chatgptPinner_pinnedMessages', JSON.stringify(pinnedMessages));
            if (DEBUG_MODE) console.log('ChatGPT Pinner: Saved', pinnedMessages.length, 'pinned messages to localStorage');
        } catch (error) {
            console.error('ChatGPT Pinner: Error saving to localStorage:', error);
        }
    }

    // Add CSS styles for pin buttons
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .${PIN_BUTTON_CLASS} {
                position: absolute !important;
                top: 8px !important;
                right: 8px !important;
                background: rgba(0, 0, 0, 0.1) !important;
                border: none !important;
                border-radius: 50% !important;
                width: 32px !important;
                height: 32px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 16px !important;
                transition: all 0.2s ease !important;
                z-index: 9999 !important;
                opacity: 0 !important;
                pointer-events: auto !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
            }

            /* Dark mode support for pin buttons */
            .dark .${PIN_BUTTON_CLASS},
            [data-theme="dark"] .${PIN_BUTTON_CLASS},
            .dark-mode .${PIN_BUTTON_CLASS} {
                background: rgba(255, 255, 255, 0.1) !important;
                color: #e0e0e0 !important;
            }

            .${PIN_BUTTON_CLASS}:hover {
                background: rgba(0, 0, 0, 0.2) !important;
                transform: scale(1.1) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
            }

            /* Dark mode hover */
            .dark .${PIN_BUTTON_CLASS}:hover,
            [data-theme="dark"] .${PIN_BUTTON_CLASS}:hover,
            .dark-mode .${PIN_BUTTON_CLASS}:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                box-shadow: 0 4px 12px rgba(255, 255, 255, 0.25) !important;
            }

            .${PIN_BUTTON_CLASS}.${PINNED_CLASS} {
                background: #10a37f !important;
                color: white !important;
                opacity: 1 !important;
            }

            /* Dark mode pinned button */
            .dark .${PIN_BUTTON_CLASS}.${PINNED_CLASS},
            [data-theme="dark"] .${PIN_BUTTON_CLASS}.${PINNED_CLASS},
            .dark-mode .${PIN_BUTTON_CLASS}.${PINNED_CLASS} {
                background: #4ade80 !important;
                color: #1a1a1a !important;
            }

            .chatgpt-pinner-message-container {
                position: relative !important;
            }

            .chatgpt-pinner-message-container:hover .${PIN_BUTTON_CLASS} {
                opacity: 1 !important;
            }

            /* Alternative hover detection for different ChatGPT layouts */
            .chatgpt-pinner-message-container:hover,
            .chatgpt-pinner-message-container:focus-within,
            .chatgpt-pinner-message-container:has(:hover) {
                .${PIN_BUTTON_CLASS} {
                    opacity: 1 !important;
                }
            }

            /* Force visibility for testing */
            .${PIN_BUTTON_CLASS}.force-visible {
                opacity: 1 !important;
            }

            .chatgpt-pinner-toast {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                background: #10a37f !important;
                color: white !important;
                padding: 12px 20px !important;
                border-radius: 8px !important;
                font-size: 14px !important;
                z-index: 10000 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                animation: slideIn 0.3s ease-out !important;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Show toast notification
    function showToast(message) {
        try {
            // Remove existing toast
            const existingToast = document.querySelector('.chatgpt-pinner-toast');
            if (existingToast) {
                existingToast.remove();
            }

            const toast = document.createElement('div');
            toast.className = 'chatgpt-pinner-toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            // Remove after 3 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 3000);
        } catch (error) {
            console.error('ChatGPT Pinner: Error showing toast:', error);
        }
    }

    // Extract message content
    function extractMessageContent(messageElement) {
        try {
            const contentSelectors = [
                '[data-message-author-role] + div',
                '.markdown',
                '.prose',
                '.whitespace-pre-wrap',
                'p',
                'div'
            ];
            
            for (const selector of contentSelectors) {
                const contentElement = messageElement.querySelector(selector);
                if (contentElement && contentElement.textContent.trim()) {
                    return contentElement.textContent.trim();
                }
            }
            
            const fallbackContent = messageElement.textContent.trim();
            return fallbackContent || 'Message content not available';
        } catch (error) {
            if (DEBUG_MODE) console.error('ChatGPT Pinner: Error extracting message content:', error);
            return 'Message content not available';
        }
    }

    // Extract message author
    function extractMessageAuthor(messageElement) {
        try {
            const authorSelectors = [
                '[data-message-author-role]',
                '[data-testid="conversation-turn-2"] [data-message-author-role]',
                '[data-testid="conversation-turn-3"] [data-message-author-role]',
                '.author',
                '.user',
                '.assistant'
            ];
            
            for (const selector of authorSelectors) {
                const authorElement = messageElement.querySelector(selector);
                if (authorElement && authorElement.textContent.trim()) {
                    const author = authorElement.textContent.trim();
                    if (author.toLowerCase().includes('user') || author.toLowerCase().includes('you')) {
                        return 'User';
                    } else if (author.toLowerCase().includes('assistant') || author.toLowerCase().includes('chatgpt')) {
                        return 'Assistant';
                    }
                    return author;
                }
            }
            
            // Try to determine from context
            const container = messageElement.closest('[data-testid="conversation-turn-2"]') || 
                             messageElement.closest('[data-testid="conversation-turn-3"]');
            if (container) {
                if (container.getAttribute('data-testid')?.includes('user')) {
                    return 'User';
                } else if (container.getAttribute('data-testid')?.includes('assistant')) {
                    return 'Assistant';
                }
            }
            
            // Fallback: try to determine from message position
            try {
                const allMessages = document.querySelectorAll('[data-testid*="conversation-turn"]');
                const messageIndex = Array.from(allMessages).indexOf(messageElement);
                
                if (messageIndex !== -1) {
                    return messageIndex % 2 === 0 ? 'User' : 'Assistant';
                }
            } catch (e) {
                if (DEBUG_MODE) console.log('ChatGPT Pinner: Error in message index detection:', e);
            }
            
            // Final fallback
            return 'Unknown';
        } catch (error) {
            if (DEBUG_MODE) console.error('ChatGPT Pinner: Error extracting message author:', error);
            return 'Unknown';
        }
    }

    // Create pin button
    function createPinButton(messageElement, messageId) {
        try {
            const button = document.createElement('button');
            button.className = PIN_BUTTON_CLASS;
            button.setAttribute('data-message-id', messageId);
            button.innerHTML = PIN_ICON;
            button.title = 'Pin this message';

            const isPinned = pinnedMessages.some(msg => msg.id === messageId);
            if (isPinned) {
                button.classList.add(PINNED_CLASS);
                button.innerHTML = UNPIN_ICON;
                button.title = 'Unpin this message';
            }

            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePin(messageElement, messageId);
            });

            return button;
        } catch (error) {
            console.error('ChatGPT Pinner: Error creating pin button:', error);
            return null;
        }
    }

    // Toggle pin status
    function togglePin(messageElement, messageId) {
        try {
            if (!messageElement || !messageId) {
                console.error('ChatGPT Pinner: Invalid inputs to togglePin');
                showToast('Error: Invalid message data');
                return;
            }

            const content = extractMessageContent(messageElement);
            const author = extractMessageAuthor(messageElement);
            const timestamp = new Date().toISOString();
            const url = window.location.href;

            if (!Array.isArray(pinnedMessages)) {
                pinnedMessages = [];
            }

            const existingIndex = pinnedMessages.findIndex(msg => msg.id === messageId);
            
            let button = document.querySelector(`.${PIN_BUTTON_CLASS}[data-message-id="${messageId}"]`);
            if (!button) {
                if (DEBUG_MODE) console.error('ChatGPT Pinner: Button not found for message:', messageId);
                showToast('Error: Button not found. Please try again.');
                return;
            }

            if (existingIndex !== -1) {
                // Unpin message
                pinnedMessages.splice(existingIndex, 1);
                button.classList.remove(PINNED_CLASS);
                button.innerHTML = PIN_ICON;
                button.title = 'Pin this message';
                showToast('Message unpinned');
            } else {
                // Pin message
                const pinnedMessage = {
                    id: messageId,
                    content: content,
                    author: author,
                    timestamp: timestamp,
                    url: url,
                    preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
                };
                pinnedMessages.push(pinnedMessage);
                button.classList.add(PINNED_CLASS);
                button.innerHTML = UNPIN_ICON;
                button.title = 'Unpin this message';
                showToast('Message pinned!');
            }

            // Save with error handling
            try {
                savePinnedMessages();
            } catch (saveError) {
                console.error('ChatGPT Pinner: Error saving after toggle:', saveError);
                showToast('Message updated (save failed)');
            }
        } catch (error) {
            console.error('ChatGPT Pinner: Error in togglePin:', error);
            showToast('Error pinning message');
        }
    }

    // Add pin buttons to messages
    function addPinButtons() {
        try {
            if (DEBUG_MODE) console.log('ChatGPT Pinner: Adding pin buttons...');
            
            const messageSelectors = [
                '[data-testid="conversation-turn-2"]',
                '[data-testid="conversation-turn-3"]',
                '[data-testid="conversation-turn-4"]',
                '[data-testid="conversation-turn-5"]',
                '[data-testid="conversation-turn-6"]',
                '[data-testid="conversation-turn-7"]',
                '[data-testid="conversation-turn-8"]',
                '[data-testid="conversation-turn-9"]',
                '[data-testid="conversation-turn-10"]',
                '[data-message-author-role]',
                '.markdown',
                '.prose',
                '.whitespace-pre-wrap',
                '.text-base',
                '.leading-6',
                '[class*="message"]',
                '[class*="chat"]',
                '[class*="conversation"]'
            ];
            
            let messages = [];
            let totalFound = 0;
            
            messageSelectors.forEach(selector => {
                try {
                    const found = document.querySelectorAll(selector);
                    totalFound += found.length;
                    if (DEBUG_MODE && found.length > 0) {
                        console.log(`ChatGPT Pinner: Found ${found.length} elements with selector: ${selector}`);
                    }
                    messages = messages.concat(Array.from(found));
                } catch (e) {
                    if (DEBUG_MODE) console.log(`ChatGPT Pinner: Invalid selector: ${selector}`);
                }
            });
            
            if (DEBUG_MODE) console.log(`ChatGPT Pinner: Total elements found: ${totalFound}`);
            
            // Remove duplicates and filter out invalid elements
            messages = [...new Set(messages)].filter(el => {
                return el && el.nodeType === Node.ELEMENT_NODE && 
                       el.textContent && el.textContent.trim().length > 0 &&
                       !el.querySelector(`.${PIN_BUTTON_CLASS}`);
            });
            
            if (DEBUG_MODE) console.log(`ChatGPT Pinner: Total unique messages to process: ${messages.length}`);
            
            if (messages.length === 0) {
                if (DEBUG_MODE) console.log('ChatGPT Pinner: No new messages found to add buttons to');
                return;
            }
            
            let buttonsAdded = 0;
            messages.forEach((messageElement, index) => {
                try {
                    let container = messageElement.closest('[data-testid*="conversation-turn"]') ||
                                  messageElement.closest('.markdown') ||
                                  messageElement.closest('.prose') ||
                                  messageElement.closest('[class*="message"]') ||
                                  messageElement.parentElement;

                    if (!container || container === document.body) {
                        container = messageElement;
                    }

                    if (container.querySelector(`.${PIN_BUTTON_CLASS}`)) {
                        if (DEBUG_MODE) console.log(`ChatGPT Pinner: Button already exists for message ${index}`);
                        return;
                    }

                    const messageId = generateMessageId(messageElement);
                    if (DEBUG_MODE) console.log(`ChatGPT Pinner: Generated ID for message ${index}: ${messageId}`);
                    
                    container.classList.add('chatgpt-pinner-message-container');
                    
                    const pinButton = createPinButton(messageElement, messageId);
                    if (pinButton) {
                        container.appendChild(pinButton);
                        buttonsAdded++;
                        if (DEBUG_MODE) console.log(`ChatGPT Pinner: Added pin button for message ${index}`);
                    } else {
                        if (DEBUG_MODE) console.log(`ChatGPT Pinner: Failed to create pin button for message ${index}`);
                    }
                } catch (error) {
                    if (DEBUG_MODE) console.log(`ChatGPT Pinner: Error processing message ${index}:`, error);
                }
            });
            
            if (DEBUG_MODE) console.log(`ChatGPT Pinner: Successfully added ${buttonsAdded} pin buttons`);
            
        } catch (error) {
            console.error('ChatGPT Pinner: Error in addPinButtons:', error);
        }
    }

    // Generate unique message ID
    function generateMessageId(messageElement) {
        try {
            const content = extractMessageContent(messageElement);
            const author = extractMessageAuthor(messageElement);
            const safeContent = content.replace(/[^\x00-\x7F]/g, '').replace(/[^a-zA-Z0-9\s\-_]/g, '').substring(0, 50).trim();
            const safeAuthor = author.replace(/[^\x00-\x7F]/g, '').replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
            const idString = `${safeAuthor}-${safeContent}`;
            let encodedId;
            try { 
                encodedId = btoa(idString); 
            } catch (e) { 
                encodedId = simpleHash(idString); 
            }
            return encodedId.replace(/[^a-zA-Z0-9]/g, '');
        } catch (error) {
            if (DEBUG_MODE) console.error('ChatGPT Pinner: Error generating message ID:', error);
            return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    // Simple hash function for fallback
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    // Observe chat changes
    function observeChatChanges() {
        try {
            const observer = new MutationObserver((mutations) => {
                let shouldUpdate = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.querySelector('[data-message-author-role]') || 
                                    node.hasAttribute('data-message-author-role')) {
                                    shouldUpdate = true;
                                }
                            }
                        });
                    }
                });

                if (shouldUpdate) {
                    setTimeout(addPinButtons, 500);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Initial scan
            setTimeout(addPinButtons, 1000);
        } catch (error) {
            console.error('ChatGPT Pinner: Error setting up observer:', error);
        }
    }

    // Periodic context check and recovery
    function startContextCheck() {
        setInterval(() => {
            try {
                if (storageMethod === 'chrome' && !isChromeContextValid()) {
                    console.warn('ChatGPT Pinner: Chrome context lost, switching to localStorage');
                    storageMethod = 'localStorage';
                    loadFromLocalStorage();
                }
            } catch (error) {
                console.error('ChatGPT Pinner: Error in context check:', error);
            }
        }, 30000); // Check every 30 seconds
    }

    // Listen for messages from popup
    try {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            try {
                if (request.action === 'getPinnedMessages') {
                    sendResponse({ pinnedMessages: pinnedMessages });
                }
            } catch (error) {
                console.error('ChatGPT Pinner: Error handling message:', error);
                sendResponse({ error: 'Extension context invalid' });
            }
        });
    } catch (error) {
        console.error('ChatGPT Pinner: Error setting up message listener:', error);
    }

    // Debug functions
    window.chatgptPinnerDebug = {
        addPinButtons: addPinButtons,
        forceAddPinButtons: () => {
            console.log('ChatGPT Pinner: Force adding pin buttons...');
            addPinButtons();
        },
        showAllButtons: () => {
            document.querySelectorAll(`.${PIN_BUTTON_CLASS}`).forEach(btn => {
                btn.classList.add('force-visible');
            });
        },
        hideAllButtons: () => {
            document.querySelectorAll(`.${PIN_BUTTON_CLASS}`).forEach(btn => {
                btn.classList.remove('force-visible');
            });
        },
        getStatus: () => {
            const buttons = document.querySelectorAll(`.${PIN_BUTTON_CLASS}`);
            const containers = document.querySelectorAll('.chatgpt-pinner-message-container');
            return {
                buttonsFound: buttons.length,
                containersFound: containers.length,
                pinnedMessages: pinnedMessages.length,
                storageMethod: storageMethod,
                isInitialized: isInitialized
            };
        },
        forceRefresh: () => {
            console.log('ChatGPT Pinner: Force refreshing...');
            document.querySelectorAll(`.${PIN_BUTTON_CLASS}`).forEach(btn => btn.remove());
            document.querySelectorAll('.chatgpt-pinner-message-container').forEach(container => {
                container.classList.remove('chatgpt-pinner-message-container');
            });
            setTimeout(() => {
                addPinButtons();
            }, 100);
        },
        testPin: () => {
            console.log('ChatGPT Pinner: Testing pin functionality...');
            const buttons = document.querySelectorAll(`.${PIN_BUTTON_CLASS}`);
            if (buttons.length > 0) {
                console.log(`Found ${buttons.length} buttons, clicking first one...`);
                buttons[0].click();
            } else {
                console.log('No buttons found');
            }
        },
        reloadMessages: () => {
            console.log('ChatGPT Pinner: Reloading pinned messages...');
            loadPinnedMessages();
        }
    };

    // Shorter alias
    window.chatgptpinner = window.chatgptPinnerDebug;

    // Initialize when DOM is ready
    function waitForChatGPT() {
        const checkInterval = setInterval(() => {
            const chatContainer = document.querySelector('[data-testid="conversation-turn-2"]') || 
                                document.querySelector('[data-testid="conversation-turn-3"]') ||
                                document.querySelector('[data-message-author-role]') ||
                                document.querySelector('.markdown') ||
                                document.querySelector('.prose') ||
                                document.querySelector('[class*="message"]');
            
            if (chatContainer) {
                clearInterval(checkInterval);
                if (DEBUG_MODE) console.log('ChatGPT Pinner: ChatGPT interface detected, initializing...');
                init();
            }
        }, 1000);

        // Fallback: initialize after 10 seconds regardless
        setTimeout(() => {
            clearInterval(checkInterval);
            if (DEBUG_MODE) console.log('ChatGPT Pinner: Fallback initialization...');
            init();
        }, 10000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForChatGPT);
    } else {
        waitForChatGPT();
    }
})();
