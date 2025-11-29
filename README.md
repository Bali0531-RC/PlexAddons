# THIS PROJECT IS NOT MAINTAINED ANYMORE! YOU SHOULD MIGRATE TO https://addons.plexdev.live !
# https://github.com/Bali0531-RC/Plexdev-Addons



# PlexAddons Version Checker

A lightweight, easy-to-use version checking utility for **Plex Development Discord bot addons**. Created by bali0531 (Plex Development moderator) as an **unofficial community project** to provide automatic update checking for all Plex Development addons.

## 💰 For Paid Addons

Community-made addons that have been **accepted to sell on PlexStore**. 👉 **[Contact bali0531](https://discord.com/users/1141211789552537691)** to add your paid addon to this registry.

## 🎁 For Free Addons

Free addons made by Plex Development community members! Anyone can submit their free addon to this registry. 👉 **[See the Community Guide](COMMUNITY_GUIDE.md)** for how to add your free addon!

## Features

- 🔍 Automatic version checking against a centralized registry
- 🎨 Colored console output with clear status indicators
- ⚠️ Support for urgent and breaking change notifications
- 🔄 Automatic retry logic with exponential backoff
- 💰 Support for paid addons (sold on PlexStore)
- 🎁 Support for free community addons
- 📦 Zero configuration for all Plex Development addons
- 🔧 Customizable for self-hosted registries

## Installation

```bash
npm install node-fetch
```

Then copy `VersionChecker.js` into your project.

## ✅ Backward Compatibility

**Important:** All old addons using previous versions of VersionChecker will continue to work! The new fields (`external`, `author`, `homepage`, `changelog`) are completely optional. Your existing code requires no changes.

## Quick Start (All Plex Development Addons)

For all Plex Development addons (both paid and community/free), the setup is simple:

```javascript
const VersionChecker = require('./VersionChecker');

// Initialize the version checker
const versionChecker = new VersionChecker('AiModeration', '1.3.0');

// Check for updates on startup
async function initialize() {
    const result = await versionChecker.checkForUpdates();
    
    // Display formatted message
    console.log(versionChecker.formatVersionMessage(result));
    
    // Show detailed update info if available
    if (result.isOutdated) {
        console.log(versionChecker.getUpdateDetails(result));
    }
}

initialize();
```

## Self-Hosted Registry (Optional)

If you prefer to host your own version registry instead of using the main registry:

### Step 1: Host Your Own `versions.json`

Create a `versions.json` file with your products:

```json
{
    "addons": {
        "YourAddonName": {
            "version": "2.0.1",
            "releaseDate": "2025-10-01",
            "downloadUrl": "https://yourdomain.com/downloads/your-addon",
            "breaking": false,
            "urgent": false,
            "description": "Bug fixes and performance improvements",
            "external": true,
            "author": "YourName",
            "homepage": "https://yourdomain.com"
        }
    },
    "lastUpdated": "2025-10-01T12:00:00Z",
    "repository": "https://github.com/yourusername/your-repo",
    "supportServer": "https://discord.gg/your-invite"
}
```

Host this file on GitHub (raw.githubusercontent.com), your own server, or any publicly accessible URL.

### Step 2: Initialize with Custom Repository URL

```javascript
const VersionChecker = require('./VersionChecker');

const versionChecker = new VersionChecker('YourAddonName', '1.5.0', {
    repositoryUrl: 'https://raw.githubusercontent.com/yourusername/your-repo/main/versions.json',
    checkOnStartup: true,
    timeout: 10000,
    retries: 2
});

// Check for updates
versionChecker.checkForUpdates().then(result => {
    console.log(versionChecker.formatVersionMessage(result));
    
    if (result.isOutdated) {
        console.log(versionChecker.getUpdateDetails(result));
    }
});
```

## Complete Example with Discord Bot

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const VersionChecker = require('./VersionChecker');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

// Initialize version checker
const versionChecker = new VersionChecker('MyBot', '1.2.3', {
    repositoryUrl: 'https://raw.githubusercontent.com/yourusername/bot-versions/main/versions.json'
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Check for updates
    const versionCheck = await versionChecker.checkForUpdates();
    console.log(versionChecker.formatVersionMessage(versionCheck));
    
    if (versionCheck.isOutdated) {
        console.log(versionChecker.getUpdateDetails(versionCheck));
        
        // Alert if urgent
        if (versionCheck.urgent) {
            console.error('\n⚠️  URGENT: Please update immediately!');
        }
        
        // Alert if breaking changes
        if (versionCheck.breaking) {
            console.warn('\n🔄 BREAKING CHANGES: Review changelog before updating!');
        }
    }
});

client.login('your-bot-token');
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `repositoryUrl` | string | This repo | URL to your versions.json file |
| `checkOnStartup` | boolean | `true` | Whether to check on initialization |
| `timeout` | number | `10000` | Request timeout in milliseconds |
| `retries` | number | `2` | Number of retry attempts on failure |

## API Reference

### `new VersionChecker(addonName, currentVersion, options)`

Creates a new version checker instance.

**Parameters:**
- `addonName` (string): Name of your addon/product
- `currentVersion` (string): Current version (semver format: "1.2.3")
- `options` (object): Optional configuration

### `checkForUpdates()`

Checks for available updates.

**Returns:** Promise resolving to an object:
```javascript
{
    success: true,           // Whether the check succeeded
    isOutdated: false,       // Current version is outdated
    isNewer: false,          // Current version is newer (dev build)
    isCurrent: true,         // Current version matches latest
    current: "1.2.3",        // Your current version
    latest: "1.2.3",         // Latest available version
    releaseDate: "2025-10-01",
    downloadUrl: "https://...",
    description: "...",
    urgent: false,           // Urgent update flag
    breaking: false,         // Breaking changes flag
    repository: "https://...",
    supportServer: "https://...",
    lastUpdated: "2025-10-01T12:00:00Z"
}
```

### `formatVersionMessage(checkResult)`

Generates a formatted console message with colors.

**Returns:** String with ANSI color codes

### `getUpdateDetails(checkResult)`

Generates detailed update information.

**Returns:** Multi-line string with update details

## Version JSON Schema

### Required Fields

```json
{
    "addons": {
        "AddonName": {
            "version": "1.0.0",              // Required: Semver version
            "releaseDate": "2025-10-01",     // Required: ISO date
            "downloadUrl": "https://...",    // Required: Download link
            "description": "Changes..."      // Required: Update description
        }
    }
}
```

### Optional Fields

```json
{
    "addons": {
        "AddonName": {
            "version": "1.0.0",
            "releaseDate": "2025-10-01",
            "downloadUrl": "https://...",
            "description": "Changes...",
            "breaking": false,               // Optional: Breaking changes flag
            "urgent": false,                 // Optional: Urgent update flag
            "external": true,                // Optional: Mark as external project
            "author": "Developer Name",      // Optional: Author/maintainer
            "homepage": "https://...",       // Optional: Project homepage
            "changelog": "https://..."       // Optional: Full changelog URL
        }
    },
    "lastUpdated": "2025-10-01T12:00:00Z",  // Optional but recommended
    "repository": "https://...",             // Optional: Repository URL
    "supportServer": "https://..."           // Optional: Support Discord/forum
}
```

## Examples

### Example 1: Basic Usage

```javascript
const VersionChecker = require('./VersionChecker');

const checker = new VersionChecker('MyAddon', '1.0.0');

checker.checkForUpdates().then(result => {
    if (result.success) {
        console.log(checker.formatVersionMessage(result));
    } else {
        console.error('Version check failed:', result.error);
    }
});
```

### Example 2: Custom Repository with Error Handling

```javascript
const VersionChecker = require('./VersionChecker');

const checker = new VersionChecker('CustomBot', '2.5.0', {
    repositoryUrl: 'https://api.mysite.com/versions.json',
    timeout: 5000,
    retries: 3
});

async function checkVersion() {
    try {
        const result = await checker.checkForUpdates();
        
        if (!result.success) {
            console.warn('⚠️  Could not check for updates:', result.error);
            return;
        }
        
        console.log(checker.formatVersionMessage(result));
        
        if (result.isOutdated) {
            console.log(checker.getUpdateDetails(result));
            
            // Send notification to admin
            if (result.urgent || result.breaking) {
                notifyAdmin(result);
            }
        }
    } catch (error) {
        console.error('Unexpected error during version check:', error);
    }
}

checkVersion();
```

### Example 3: Scheduled Version Checks

```javascript
const VersionChecker = require('./VersionChecker');

const checker = new VersionChecker('ScheduledBot', '3.1.4');

// Check every 6 hours
setInterval(async () => {
    const result = await checker.checkForUpdates();
    
    if (result.success && result.isOutdated) {
        console.log('\n' + '='.repeat(60));
        console.log('NEW UPDATE AVAILABLE!');
        console.log('='.repeat(60));
        console.log(checker.getUpdateDetails(result));
        console.log('='.repeat(60) + '\n');
    }
}, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
```

## Adding Your Addon to the Registry

### For Paid Addons (Accepted to PlexStore):
Contact bali0531 on Discord with your addon details. Community-made addons accepted to sell on PlexStore will be added with `external: false`.

### For Free Addons:
Submit a pull request to add your addon with `external: true`. See [COMMUNITY_GUIDE.md](COMMUNITY_GUIDE.md) for detailed instructions.

## Console Output Examples

**Up to date:**
```
   [OK] Version Check: Up to date (v1.2.3)
```

**Update available:**
```
   [UPDATE] Version Check: Outdated (v1.2.0 → v1.2.3)

📦 Paid Addon Update Available for MyAddon
   Current: v1.2.0
   Latest:  v1.2.3 (2025-10-01)
   Changes: Bug fixes and performance improvements
   Download: https://example.com/download
```

**Urgent update:**
```
   [UPDATE] Version Check: Outdated (v1.0.0 → v2.0.0) [URGENT]
   ⚠️  URGENT UPDATE RECOMMENDED
```

**Breaking changes:**
```
   [UPDATE] Version Check: Outdated (v1.5.0 → v2.0.0) [BREAKING]
   🔄 BREAKING CHANGES - Review before updating
```

## Support

- **Community Guide:** See [COMMUNITY_GUIDE.md](COMMUNITY_GUIDE.md) for adding your addon
- **Contact bali0531:** https://discord.com/users/1141211789552537691
- **Repository:** https://github.com/Bali0531-RC/PlexAddons
- **Issues:** https://github.com/Bali0531-RC/PlexAddons/issues

## License

GNU General Public License v3.0 - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by Bali0531-RC
