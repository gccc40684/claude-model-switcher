import os from 'os';
import path from 'path';

/**
 * Platform detection and utilities for cross-platform support
 */
export class Platform {
  /**
   * Get current platform identifier
   * @returns {string} - 'win32', 'darwin', 'linux', etc.
   */
  static getPlatform() {
    return os.platform();
  }

  /**
   * Check if running on Windows
   * @returns {boolean}
   */
  static isWindows() {
    return os.platform() === 'win32';
  }

  /**
   * Check if running on macOS
   * @returns {boolean}
   */
  static isMacOS() {
    return os.platform() === 'darwin';
  }

  /**
   * Check if running on Linux
   * @returns {boolean}
   */
  static isLinux() {
    return os.platform() === 'linux';
  }

  /**
   * Get Claude Code configuration directory path for current platform
   * @returns {string} - Path to Claude config directory
   */
  static getClaudeConfigDir() {
    if (this.isWindows()) {
      // Windows: Prefer AppData, fallback to user home .claude
      const appDataPath = process.env.APPDATA;
      if (appDataPath) {
        return path.join(appDataPath, 'Anthropic', 'Claude');
      }
      // Fallback to user directory
      return path.join(os.homedir(), '.claude');
    } else {
      // macOS/Linux: Use .claude in user home
      return path.join(os.homedir(), '.claude');
    }
  }

  /**
   * Get Claude Code settings.json file path for current platform
   * @param {string} type - 'global' or 'project' (for future use)
   * @returns {string} - Path to settings.json file
   */
  static getClaudeSettingsPath(type = 'global') {
    // Claude Code uses ~/.claude/settings.json on all platforms
    return path.join(os.homedir(), '.claude', 'settings.json');
  }

  /**
   * Get user home directory with platform-specific handling
   * @returns {string}
   */
  static getUserHome() {
    return os.homedir();
  }

  /**
   * Get platform-specific newline character
   * @returns {string}
   */
  static getNewline() {
    return this.isWindows() ? '\r\n' : '\n';
  }

  /**
   * Check if platform supports shell configuration (for environment variables)
   * @returns {boolean}
   */
  static supportsShellConfig() {
    return !this.isWindows();
  }

  /**
   * Get platform-specific shell configuration files
   * @returns {string[]} - Array of shell config file paths
   */
  static getShellConfigFiles() {
    if (this.isWindows()) {
      return []; // Windows doesn't use shell configs in the same way
    }

    const homeDir = os.homedir();
    return [
      path.join(homeDir, '.zshrc'),
      path.join(homeDir, '.bashrc'),
      path.join(homeDir, '.bash_profile')
    ];
  }

  /**
   * Get platform-specific file permissions mask
   * @returns {string} - Octal permission string or null if not applicable
   */
  static getFilePermissions() {
    return this.isWindows() ? null : '755';
  }
}