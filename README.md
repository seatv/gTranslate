# Auto Page Translator - Chrome Extension

A powerful Chrome/Chromium browser extension that automatically translates web pages with customizable language settings and domain-based auto-translation.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Chrome](https://img.shields.io/badge/chrome-compatible-brightgreen)

## Features

- 🌐 **One-click translation** of any web page
- 🔄 **Auto-translate** specific domains automatically on page load
- 🎨 **Visual status indicators**:
  - Gray icon: Extension installed and ready
  - Red icon: Foreign language detected
  - Green icon: Page translated
- 🌍 **Multiple languages** supported (Korean, Japanese, Chinese, Spanish, French, German, and more)
- ⚙️ **Customizable settings** for source and target languages
- 🎯 **Domain filtering** - Specify exact domains (e.g., `naver.com`) or TLDs (e.g., `.kr`, `.jp`)
- ♻️ **Re-translation support** - Click translate multiple times to handle dynamic content
- 🔌 **Works on Chromium browsers** - Chrome, Brave, Edge, and potentially Meta Quest browsers

## Why This Extension?

Unlike Chrome's built-in translation that relies on page language attributes, this extension:
- Works on sites that don't set language attributes correctly
- Allows domain-based auto-translation regardless of detected language
- Provides full control over when and what to translate
- Supports re-translation for dynamically loaded content

## Installation

### Method 1: Load Unpacked (Development/Testing)

1. **Download this repository**
   ```bash
   git clone https://github.com/yourusername/auto-page-translator.git
   cd auto-page-translator
   ```

2. **Open Chrome Extensions page**
   - Chrome: Navigate to `chrome://extensions/`
   - Brave: Navigate to `brave://extensions/`
   - Edge: Navigate to `edge://extensions/`

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the extension folder
   - The extension icon should appear in your toolbar

5. **Pin the extension** (recommended)
   - Click the puzzle piece icon in your toolbar
   - Find "Auto Page Translator"
   - Click the pin icon to keep it visible

### Method 2: Install from Release (Coming Soon)

Once published to the Chrome Web Store, you'll be able to install directly from there.

## Usage

### Quick Translation

1. Navigate to any web page
2. Click the extension icon in your toolbar
3. Select source and target languages (defaults: Korean → English)
4. Click **"Translate Page"**
5. The icon will turn green when translation is complete

### Auto-Translation Setup

Enable automatic translation for specific domains:

1. Click the extension icon
2. Check **"Always translate pages from:"**
3. Enter domains in the text field (examples below)
4. Click **"Save Settings"**

**Domain Format Examples:**
- Full domains: `naver.com`, `sooplive.co.kr`, `yahoo.co.jp`
- Top-level domains: `.kr`, `.jp`, `.cn`
- Multiple domains: `naver.com, .kr, example.jp` (comma-separated)

Now whenever you visit pages from those domains, they'll automatically translate on page load!

### Re-translating Dynamic Content

If a page loads new content after initial translation:
- Simply click **"Translate Page"** again
- The extension will find and translate any new text nodes

### Icon Status Indicators

- **Gray Icon** 🔘: Extension installed and ready
- **Red Icon** 🔴: Foreign language detected on current page
- **Green Icon** 🟢: Page has been translated

## Supported Languages

- Korean (ko)
- Japanese (ja)
- Chinese Simplified (zh-CN)
- Chinese Traditional (zh-TW)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Arabic (ar)
- Hindi (hi)
- English (en)
- Auto-detect (for source language)

## How It Works

### Translation Engine

The extension uses a dual-API approach for reliability:

1. **Google Translate API** (primary) - Free, unofficial endpoint
2. **MyMemory API** (fallback) - Free translation service

Text is translated in small batches to avoid rate limits and ensure reliability.

### Architecture

- **background.js** - Service worker that manages extension state, settings, and auto-translate logic
- **content.js** - Injected into web pages to perform translation and detect page language
- **popup.html/js/css** - User interface for settings and manual translation
- **icons/** - Visual indicators for extension status

## Settings

All settings are saved automatically via Chrome's sync storage:

- **From Language**: Source language for translation (default: Korean)
- **To Language**: Target language for translation (default: English)
- **Auto-translate**: Enable/disable automatic translation
- **Domains**: Comma-separated list of domains to auto-translate

## Troubleshooting

### Extension not working?

1. Refresh the page after installing the extension
2. Check that the extension has permission to access all websites
3. Reload the extension from `chrome://extensions/`

### Translation not appearing?

1. Wait a few seconds - translation takes time for large pages
2. Check your internet connection (requires access to translation APIs)
3. Open browser console (F12) to check for errors
4. Look for `[Translator]` prefixed log messages

### Auto-translate not working?

1. Verify domain format in settings (e.g., `naver.com` not `https://naver.com`)
2. Ensure "Always translate" checkbox is checked
3. Click "Save Settings" after making changes
4. Reload the page to trigger auto-translate
5. Check browser console for `[Translator BG]` messages

### Icons not changing color?

1. Refresh the page after enabling the extension
2. The extension detects page language from HTML `lang` attribute
3. For pages without proper language tags, use domain-based auto-translate instead

## Privacy & Permissions

### Required Permissions

- **storage**: Save your language preferences and domain settings
- **activeTab**: Translate the current page
- **scripting**: Inject translation scripts into web pages
- **tabs**: Detect page language and manage translations
- **host_permissions**: Access any website for translation

### Privacy Note

- Translation requests are processed by Google Translate and MyMemory servers
- No personal data is collected or stored by this extension
- All settings are stored locally in Chrome's sync storage
- No analytics or tracking

## Known Limitations

- Translation quality depends on Google Translate and MyMemory APIs
- Some websites may block translation due to Content Security Policy restrictions
- Dynamic content loaded after translation may need manual re-translation
- Rate limits may apply for very large pages with many text nodes
- Meta Quest browser support is experimental

## Development

### Project Structure

```
auto-page-translator/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (manages state & auto-translate)
├── content.js            # Page script (handles translation)
├── popup.html            # Extension popup UI
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── icons/                # Extension icons (gray, red, green states)
│   ├── icon-gray-*.png
│   ├── icon-red-*.png
│   └── icon-green-*.png
├── README.md             # This file
└── LICENSE              # License file
```

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Debug Logging

The extension includes comprehensive console logging:
- Open DevTools (F12) → Console tab
- Look for messages prefixed with `[Translator]` (content script) or `[Translator BG]` (background script)
- These show translation progress, API calls, and any errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Improvement

- [ ] Support for additional translation APIs
- [ ] Better handling of dynamic content (MutationObserver)
- [ ] Translation memory/caching to reduce API calls
- [ ] Keyboard shortcuts for quick translation
- [ ] Export/import settings
- [ ] Whitelist/blacklist specific elements from translation
- [ ] Translation history

## Future Enhancements

- **Chrome Native Translation Integration**: Exploring ways to trigger Chrome's built-in translator programmatically
- **Offline Translation**: Local translation models for basic translations
- **Context Menu**: Right-click translation options
- **Translation Memory**: Cache translated content to improve speed

## License

This project is licensed under the GNU Affero General Public License v3.0 - See [LICENSE](LICENSE) file for details.

**Key points of AGPL-3.0:**
- You can freely use, modify, and distribute this software
- If you modify and distribute this software, you must also distribute your source code
- If you run a modified version on a server and let others interact with it, you must make your modified source code available
- Any derivative works must also be licensed under AGPL-3.0

For full license text, see: https://www.gnu.org/licenses/agpl-3.0.en.html

## Acknowledgments

- Built for translating Korean streaming content and websites without proper language tags
- Uses Google Translate's unofficial API endpoint
- MyMemory Translation API for fallback support

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Open an issue on GitHub with details
3. Include browser version and example URL if possible

## Version History

### v1.0.0 (Current)
- Initial release
- One-click manual translation
- Auto-translate for specific domains
- Visual status indicators (gray/red/green icons)
- Multi-language support
- Domain filtering with validation
- Re-translation support for dynamic content
- Dual API system (Google Translate + MyMemory)

---

**Happy Translating!** 🌍✨

Made with ❤️ for seamless web browsing across languages