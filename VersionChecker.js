const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class VersionChecker {
    constructor(addonName, currentVersion, options = {}) {
        this.addonName = addonName;
        this.currentVersion = currentVersion;
        this.options = {
            repositoryUrl: options.repositoryUrl || 'https://raw.githubusercontent.com/Bali0531-RC/PlexAddons/main/versions.json',
            checkOnStartup: options.checkOnStartup !== false,
            timeout: options.timeout || 10000,
            retries: options.retries || 2,
            ...options
        };
    }

    /**
     * Parse version string to numbers for comparison
     */
    parseVersion(version) {
        return version.split('.').map(num => parseInt(num, 10));
    }

    /**
     * Compare two version strings
     * Returns: -1 if current < latest, 0 if equal, 1 if current > latest
     */
    compareVersions(current, latest) {
        const currentParts = this.parseVersion(current);
        const latestParts = this.parseVersion(latest);
        
        const maxLength = Math.max(currentParts.length, latestParts.length);
        
        for (let i = 0; i < maxLength; i++) {
            const currentPart = currentParts[i] || 0;
            const latestPart = latestParts[i] || 0;
            
            if (currentPart < latestPart) return -1;
            if (currentPart > latestPart) return 1;
        }
        
        return 0;
    }

    /**
     * Fetch version data from repository
     */
    async fetchVersionData() {
        for (let attempt = 1; attempt <= this.options.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
                
                const response = await fetch(this.options.repositoryUrl, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': `PlexAddons-${this.addonName}/1.0.0`,
                        'Accept': 'application/json'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                if (attempt === this.options.retries) {
                    throw new Error(`Failed to fetch version data after ${this.options.retries} attempts: ${error.message}`);
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    /**
     * Check for updates
     */
    async checkForUpdates() {
        try {
            const versionData = await this.fetchVersionData();
            
            if (!versionData.addons || !versionData.addons[this.addonName]) {
                return {
                    success: false,
                    error: `Addon '${this.addonName}' not found in PlexAddons registry`,
                    isOutdated: false
                };
            }
            
            const latestInfo = versionData.addons[this.addonName];
            const comparison = this.compareVersions(this.currentVersion, latestInfo.version);
            
            return {
                success: true,
                isOutdated: comparison < 0,
                isNewer: comparison > 0,
                isCurrent: comparison === 0,
                current: this.currentVersion,
                latest: latestInfo.version,
                releaseDate: latestInfo.releaseDate,
                downloadUrl: latestInfo.downloadUrl,
                description: latestInfo.description,
                urgent: latestInfo.urgent || false,
                breaking: latestInfo.breaking || false,
                repository: versionData.repository,
                supportServer: versionData.supportServer,
                lastUpdated: versionData.lastUpdated
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                isOutdated: false
            };
        }
    }

    /**
     * Generate colored console message for version status
     */
    formatVersionMessage(checkResult) {
        if (!checkResult.success) {
            return `   \x1b[33m[WARN]\x1b[0m Version Check: \x1b[33mFailed (${checkResult.error})\x1b[0m`;
        }
        
        const { isOutdated, isCurrent, isNewer, current, latest, urgent, breaking } = checkResult;
        
        if (isOutdated) {
            let urgencyIndicator = '';
            if (urgent) urgencyIndicator = ' \x1b[91m[URGENT]\x1b[0m';
            if (breaking) urgencyIndicator += ' \x1b[95m[BREAKING]\x1b[0m';
            
            return `   \x1b[31m[UPDATE]\x1b[0m Version Check: \x1b[31mOutdated\x1b[0m (v${current} → v${latest})${urgencyIndicator}`;
        } else if (isCurrent) {
            return `   \x1b[32m[OK]\x1b[0m Version Check: \x1b[32mUp to date\x1b[0m (v${current})`;
        } else if (isNewer) {
            return `   \x1b[36m[DEV]\x1b[0m Version Check: \x1b[36mDevelopment version\x1b[0m (v${current} > v${latest})`;
        }
        
        return `   \x1b[90m[INFO]\x1b[0m Version Check: \x1b[90mUnknown status\x1b[0m`;
    }

    /**
     * Generate detailed update information
     */
    getUpdateDetails(checkResult) {
        if (!checkResult.success || !checkResult.isOutdated) return '';
        
        let details = `\n\x1b[1m📦 PlexAddons Update Available for ${this.addonName}\x1b[0m\n`;
        details += `   Current: v${checkResult.current}\n`;
        details += `   Latest:  v${checkResult.latest} (${checkResult.releaseDate})\n`;
        
        if (checkResult.description) {
            details += `   Changes: ${checkResult.description}\n`;
        }
        
        if (checkResult.urgent) {
            details += `   \x1b[91m⚠️  URGENT UPDATE RECOMMENDED\x1b[0m\n`;
        }
        
        if (checkResult.breaking) {
            details += `   \x1b[95m🔄 BREAKING CHANGES - Review before updating\x1b[0m\n`;
        }
        
        details += `   Download: ${checkResult.downloadUrl}\n`;
        details += `   Repository: ${checkResult.repository}\n`;
        details += `   Support: ${checkResult.supportServer}\n`;
        
        return details;
    }
}

module.exports = VersionChecker;
