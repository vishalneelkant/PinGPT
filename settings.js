// Settings script for ChatGPT Pinner extension
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Get DOM elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const minimalUIToggle = document.getElementById('minimalUIToggle');
    const toastToggle = document.getElementById('toastToggle');
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    const previewLengthSelect = document.getElementById('previewLengthSelect');
    const dateFormatSelect = document.getElementById('dateFormatSelect');
    const exportBtn = document.getElementById('exportBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');

    // Default settings
    const defaultSettings = {
        darkMode: false,
        minimalUI: false,
        toastNotifications: true,
        autoRefresh: true,
        previewLength: 100,
        dateFormat: 'relative'
    };

    // Load settings
    function loadSettings() {
        chrome.storage.local.get(['darkMode', 'minimalUI', 'toastNotifications', 'autoRefresh', 'previewLength', 'dateFormat'], function(result) {
            const settings = { ...defaultSettings, ...result };
            
            // Apply dark mode
            if (settings.darkMode) {
                document.body.classList.add('dark-mode');
                darkModeToggle.classList.add('active');
            }
            
            // Apply minimal UI
            if (settings.minimalUI) {
                document.body.classList.add('minimal-ui');
                minimalUIToggle.classList.add('active');
            }

            // Set toggle states
            if (settings.toastNotifications) {
                toastToggle.classList.add('active');
            }
            if (settings.autoRefresh) {
                autoRefreshToggle.classList.add('active');
            }

            // Set dropdown values
            previewLengthSelect.value = settings.previewLength;
            dateFormatSelect.value = settings.dateFormat;
        });
    }

    // Save settings
    function saveSettings() {
        const settings = {
            darkMode: document.body.classList.contains('dark-mode'),
            minimalUI: document.body.classList.contains('minimal-ui'),
            toastNotifications: toastToggle.classList.contains('active'),
            autoRefresh: autoRefreshToggle.classList.contains('active'),
            previewLength: parseInt(previewLengthSelect.value),
            dateFormat: dateFormatSelect.value
        };
        
        chrome.storage.local.set(settings);
    }

    // Initialize toggles
    function initializeToggles() {
        // Dark mode toggle
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            this.classList.toggle('active');
            saveSettings();
        });

        // Minimal UI toggle
        minimalUIToggle.addEventListener('click', function() {
            document.body.classList.toggle('minimal-ui');
            this.classList.toggle('active');
            saveSettings();
        });

        // Toast notifications toggle
        toastToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            saveSettings();
        });

        // Auto-refresh toggle
        autoRefreshToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            saveSettings();
        });
    }

    // Initialize dropdowns
    function initializeDropdowns() {
        // Preview length dropdown
        previewLengthSelect.addEventListener('change', function() {
            saveSettings();
        });

        // Date format dropdown
        dateFormatSelect.addEventListener('change', function() {
            saveSettings();
        });
    }

    // Export pinned messages
    function exportPinnedMessages() {
        chrome.storage.local.get(['pinnedMessages'], function(result) {
            const pinnedMessages = result.pinnedMessages || [];
            
            if (pinnedMessages.length === 0) {
                showNotification('No pinned messages to export', 'warning');
                return;
            }

            const dataStr = JSON.stringify(pinnedMessages, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chatgpt-pinned-messages-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showNotification(`Exported ${pinnedMessages.length} pinned messages`, 'success');
        });
    }

    // Clear all data
    function clearAllData() {
        if (confirm('Are you sure you want to clear all pinned messages and reset settings? This action cannot be undone.')) {
            chrome.storage.local.clear(function() {
                // Reset UI to defaults
                document.body.classList.remove('dark-mode', 'minimal-ui');
                darkModeToggle.classList.remove('active');
                minimalUIToggle.classList.remove('active');
                toastToggle.classList.add('active'); // Default to true
                autoRefreshToggle.classList.add('active'); // Default to true
                previewLengthSelect.value = 100;
                dateFormatSelect.value = 'relative';
                
                showNotification('All data cleared successfully', 'success');
            });
        }
    }

    // Reset settings to defaults
    function resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            // Reset UI to defaults
            document.body.classList.remove('dark-mode', 'minimal-ui');
            darkModeToggle.classList.remove('active');
            minimalUIToggle.classList.remove('active');
            toastToggle.classList.add('active');
            autoRefreshToggle.classList.add('active');
            previewLengthSelect.value = 100;
            dateFormatSelect.value = 'relative';
            
            // Save default settings
            chrome.storage.local.set(defaultSettings);
            
            showNotification('Settings reset to defaults', 'success');
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            color: white;
            ${type === 'success' ? 'background: #10a37f;' : ''}
            ${type === 'warning' ? 'background: #f59e0b;' : ''}
            ${type === 'error' ? 'background: #dc3545;' : ''}
            ${type === 'info' ? 'background: #3b82f6;' : ''}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Initialize buttons
    function initializeButtons() {
        // Export button
        exportBtn.addEventListener('click', exportPinnedMessages);
        
        // Clear data button
        clearDataBtn.addEventListener('click', clearAllData);
        
        // Reset settings button
        resetSettingsBtn.addEventListener('click', resetSettings);
    }

    // Initialize settings page
    function init() {
        loadSettings();
        initializeToggles();
        initializeDropdowns();
        initializeButtons();
    }

    // Initialize when DOM is ready
    init();
}); 