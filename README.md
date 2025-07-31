# 📌 ChatGPT Pinner Chrome Extension

A beautiful Chrome extension that allows you to pin important ChatGPT conversations for quick access and reference.

## ✨ Features

- **Pin Important Messages**: Click the pin button that appears when hovering over ChatGPT messages
- **Beautiful UI**: Modern, attractive interface with smooth animations and gradients
- **Quick Access**: View all pinned messages in the extension popup
- **Copy Messages**: One-click copy of pinned messages to clipboard
- **Open in ChatGPT**: Direct link back to the original conversation
- **Smart Organization**: Messages are sorted by timestamp (newest first)
- **Cross-Tab Sync**: Pinned messages sync across all ChatGPT tabs
- **Responsive Design**: Works perfectly on different screen sizes

## 🚀 Installation

### Method 1: Load Unpacked Extension (Recommended for Development)

1. **Download the Extension**
   - Clone or download this repository
   - Extract the files to a folder on your computer

2. **Open Chrome Extensions Page**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or go to Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

5. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "ChatGPT Pinner" and click the pin icon to keep it visible

### Method 2: Install from Chrome Web Store (When Available)

*Coming soon! The extension will be available on the Chrome Web Store for easy installation.*

## 📖 How to Use

### Pinning Messages in ChatGPT

1. **Navigate to ChatGPT**
   - Go to [chat.openai.com](https://chat.openai.com)
   - Start or continue a conversation

2. **Pin Important Messages**
   - Hover over any message in the conversation
   - A pin button (📌) will appear in the top-right corner of the message
   - Click the pin button to pin the message
   - The button will change to a filled pin (📍) to indicate it's pinned

3. **Unpin Messages**
   - Click the filled pin button (📍) to unpin a message
   - The message will be removed from your pinned list

### Viewing Pinned Messages

1. **Open the Extension**
   - Click the ChatGPT Pinner icon in your Chrome toolbar
   - The popup will show all your pinned messages

2. **Interact with Messages**
   - **Copy**: Click the "📋 Copy" button to copy the full message to clipboard
   - **Open**: Click the "🔗 Open" button to open the original conversation in a new tab
   - **Remove**: Click the "🗑️ Remove" button to unpin the message
   - **Expand**: Click "Show more" to see the full message content

3. **Message Information**
   - Each message shows the author (👤 User or 🤖 Assistant)
   - Timestamp shows when the message was pinned
   - Message preview shows the first 100 characters

## 🎨 Features in Detail

### Smart Message Detection
- Automatically detects ChatGPT message elements
- Works with both user and assistant messages
- Handles dynamic content loading

### Beautiful UI Design
- Modern gradient background
- Glassmorphism effects with backdrop blur
- Smooth hover animations
- Responsive card layout
- Custom scrollbar styling

### Data Management
- Local storage for privacy (no data sent to external servers)
- Automatic synchronization across tabs
- Persistent storage between browser sessions

### User Experience
- Toast notifications for user actions
- Loading states and empty states
- Intuitive hover effects
- Keyboard-friendly interactions

## 🔧 Technical Details

### Files Structure
```
chromeExtension/
├── manifest.json      # Extension configuration
├── background.js      # Background service worker
├── content.js         # Content script for ChatGPT
├── popup.html         # Extension popup UI
├── popup.js          # Popup functionality
├── icon.png          # Extension icon
└── README.md         # This file
```

### Permissions Used
- `storage`: To save pinned messages locally
- `scripting`: To inject content scripts
- `activeTab`: To interact with ChatGPT tabs

### Browser Compatibility
- Chrome 88+ (Manifest V3)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## 🐛 Troubleshooting

### Extension Not Working on ChatGPT
1. **Refresh the Page**: Reload the ChatGPT page
2. **Check Permissions**: Ensure the extension has permission to access ChatGPT
3. **Reinstall Extension**: Try removing and re-adding the extension

### Pin Buttons Not Appearing
1. **Wait for Page Load**: Make sure the ChatGPT page is fully loaded
2. **Check Console**: Open Developer Tools (F12) and check for any errors
3. **Refresh Extension**: Go to `chrome://extensions/` and click the refresh icon

### Messages Not Syncing
1. **Check Storage**: Ensure you're not in incognito mode
2. **Clear Cache**: Try clearing browser cache and cookies
3. **Reinstall**: Remove and reinstall the extension

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Open an issue with detailed steps to reproduce
2. **Feature Requests**: Suggest new features or improvements
3. **Code Contributions**: Submit pull requests with improvements
4. **UI/UX Feedback**: Share design suggestions and feedback

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better ChatGPT conversation management
- Uses Chrome Extension Manifest V3 for better performance and security

## 📞 Support

If you need help or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the technical documentation

---

**Enjoy pinning your important ChatGPT conversations! 🎉** 