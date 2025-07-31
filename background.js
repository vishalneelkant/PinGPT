// Background script for ChatGPT Pinner extension
(function() {
    'use strict';

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

    // Initialize extension when installed
    if (isChromeContextValid()) {
        chrome.runtime.onInstalled.addListener(function(details) {
            if (details.reason === 'install') {
                // Initialize storage with empty pinned messages array
                chrome.storage.local.set({ pinnedMessages: [] }, function() {
                    console.log('ChatGPT Pinner extension installed successfully');
                });
            }
        });
    }

    // Handle messages from content script and popup
    if (isChromeContextValid()) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            try {
                if (request.action === 'getPinnedMessages') {
                    chrome.storage.local.get(['pinnedMessages'], function(result) {
                        sendResponse({ pinnedMessages: result.pinnedMessages || [] });
                    });
                    return true; // Keep message channel open for async response
                }

                if (request.action === 'updatePinnedMessages') {
                    chrome.storage.local.set({ pinnedMessages: request.pinnedMessages }, function() {
                        sendResponse({ success: true });
                    });
                    return true;
                }

                if (request.action === 'removePinnedMessage') {
                    chrome.storage.local.get(['pinnedMessages'], function(result) {
                        const messages = result.pinnedMessages || [];
                        const updatedMessages = messages.filter(m => m.id !== request.messageId);
                        
                        chrome.storage.local.set({ pinnedMessages: updatedMessages }, function() {
                            sendResponse({ success: true });
                        });
                    });
                    return true;
                }
            } catch (error) {
                console.error('ChatGPT Pinner: Error handling message:', error);
                sendResponse({ error: 'Extension context invalid' });
            }
        });
    }

    // Handle extension icon click
    if (isChromeContextValid()) {
        chrome.action.onClicked.addListener(function(tab) {
            // This will open the popup automatically due to manifest configuration
            console.log('Extension icon clicked');
        });
    }

    // Handle tab updates to inject content script if needed
    if (isChromeContextValid()) {
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (changeInfo.status === 'complete' && tab.url && tab.url.includes('chatgpt.com')) {
                // Content script will be automatically injected via manifest
                console.log('ChatGPT tab updated, content script should be active');
            }
        });
    }

    // Handle storage changes to sync across tabs
    if (isChromeContextValid()) {
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            if (namespace === 'local' && changes.pinnedMessages) {
                // Broadcast changes to all tabs
                chrome.tabs.query({ url: 'https://chatgpt.com/*' }, function(tabs) {
                    tabs.forEach(function(tab) {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'pinnedMessagesUpdated',
                            pinnedMessages: changes.pinnedMessages.newValue
                        }).catch(function(error) {
                            // Ignore errors for tabs where content script is not loaded
                            console.log('Could not send message to tab:', tab.id);
                        });
                    });
                });
            }
        });
    }

    console.log('ChatGPT Pinner background script loaded');
})();
