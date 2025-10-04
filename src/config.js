import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export class ModelConfig {
  constructor() {
    this.configDir = path.join(os.homedir(), '.claude-model-switcher');
    this.configFile = path.join(this.configDir, 'config.json');
    this.activeConfigFile = path.join(this.configDir, 'active.json');

    this.models = {
      claude: {
        name: 'Claude (Anthropic)',
        baseUrl: 'https://api.anthropic.com',
        apiKeyName: 'ANTHROPIC_API_KEY',
        apiKey: '',
        defaultModel: 'claude-3-5-sonnet-20241022'
      },
      gemini: {
        name: 'Gemini (Google)',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        apiKeyName: 'GEMINI_API_KEY',
        apiKey: '',
        defaultModel: 'gemini-2.0-flash-exp'
      },
      deepseek: {
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com/anthropic',
        apiKeyName: 'DEEPSEEK_API_KEY',
        apiKey: '',
        defaultModel: 'deepseek-chat'
      },
      qwen: {
        name: 'Qwen (Alibaba)',
        baseUrl: 'https://dashscope.aliyuncs.com/apps/anthropic',
        apiKeyName: 'QWEN_API_KEY',
        apiKey: '',
        defaultModel: 'qwen3-coder-plus'
      },
      kimi: {
        name: 'Kimi (Moonshot)',
        baseUrl: 'https://api.moonshot.cn/anthropic',
        apiKeyName: 'MOONSHOT_API_KEY',
        apiKey: '',
        defaultModel: 'kimi-k2-0905-preview'
      },
      glm: {
        name: 'GLM 4.5 (ZhipuAI)',
        baseUrl: 'https://open.bigmodel.cn/api/anthropic',
        apiKeyName: 'GLM_API_KEY',
        apiKey: '',
        defaultModel: 'glm-4.5'
      },
      ollama: {
        name: 'Ollama (Local)',
        baseUrl: 'http://localhost:11434/v1',
        apiKeyName: null,
        apiKey: 'ollama',
        defaultModel: 'llama3.2'
      }
    };
  }

  async ensureConfigDir() {
    await fs.ensureDir(this.configDir);
  }

  async loadConfig() {
    try {
      await this.ensureConfigDir();
      if (await fs.pathExists(this.configFile)) {
        const config = await fs.readJson(this.configFile);

        // Migrate old config format to new format if needed
        const migratedConfig = this.migrateConfig(config);

        // Merge with default models, preserving user data
        const mergedConfig = { ...this.models };
        Object.keys(migratedConfig).forEach(key => {
          if (mergedConfig[key]) {
            mergedConfig[key] = { ...mergedConfig[key], ...migratedConfig[key] };
          } else {
            mergedConfig[key] = migratedConfig[key];
          }
        });

        return mergedConfig;
      }
      return this.models;
    } catch (error) {
      console.error('Error loading config:', error);
      return this.models;
    }
  }

  migrateConfig(config) {
    const migratedConfig = {};

    Object.keys(config).forEach(modelName => {
      const model = config[modelName];

      // Check if it's old format (has envVars)
      if (model.envVars) {
        // Migrate from old format
        const apiKeyName = Object.keys(model.envVars).find(key => key !== 'ANTHROPIC_BASE_URL');
        migratedConfig[modelName] = {
          name: model.name,
          baseUrl: model.baseUrl,
          apiKeyName: apiKeyName,
          apiKey: apiKeyName ? model.envVars[apiKeyName] || '' : null,
          defaultModel: model.defaultModel
        };
      } else {
        // Already new format or partial config
        migratedConfig[modelName] = model;
      }
    });

    return migratedConfig;
  }

  async saveConfig(config) {
    try {
      await this.ensureConfigDir();
      await fs.writeJson(this.configFile, config, { spaces: 2 });
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  async getActiveModel() {
    try {
      if (await fs.pathExists(this.activeConfigFile)) {
        return await fs.readJson(this.activeConfigFile);
      }
      return { model: 'claude', timestamp: Date.now() };
    } catch (error) {
      console.error('Error loading active model:', error);
      return { model: 'claude', timestamp: Date.now() };
    }
  }

  async setActiveModel(modelName) {
    try {
      await this.ensureConfigDir();
      const activeConfig = {
        model: modelName,
        timestamp: Date.now()
      };
      await fs.writeJson(this.activeConfigFile, activeConfig, { spaces: 2 });
      return true;
    } catch (error) {
      console.error('Error setting active model:', error);
      return false;
    }
  }

  async updateEnvironment(modelName) {
    const models = await this.loadConfig();
    if (!models[modelName]) {
      throw new Error(`Unknown model: ${modelName}`);
    }

    const model = models[modelName];

    // Set environment variables for current process
    process.env.ANTHROPIC_BASE_URL = model.baseUrl;

    // Always use ANTHROPIC_API_KEY for Claude Code compatibility
    if (model.apiKey) {
      process.env.ANTHROPIC_API_KEY = model.apiKey;
    }

    // Update Claude Code settings.json directly
    await this.updateClaudeCodeSettings(model);

    // Also update shell configuration files for future sessions
    await this.updateShellConfig(model);

    // Create a temporary env file that can be sourced
    await this.createTempEnvFile(model);

    // Create a global env file that can be sourced by new terminals
    await this.createGlobalEnvFile(model);

    return true;
  }

  async updateShellConfig(model) {
    // Add sourcing of our global env file to shell configs
    const globalEnvFile = path.join(os.homedir(), '.claude-env');
    const sourceBlock = [
      '',
      '# Claude Model Switcher - Auto Generated',
      `if [ -f "${globalEnvFile}" ]; then`,
      `  source "${globalEnvFile}"`,
      'fi'
    ];

    const shells = ['~/.zshrc', '~/.bashrc', '~/.bash_profile'];

    for (const shellFile of shells) {
      const expandedPath = shellFile.replace('~', os.homedir());

      try {
        let envContent = '';
        if (await fs.pathExists(expandedPath)) {
          envContent = await fs.readFile(expandedPath, 'utf8');
        }

        const lines = envContent.split('\n');

        // Remove ALL old Claude Model Switcher entries and orphaned fi statements
        const filteredLines = lines.filter(line =>
          !line.includes('ANTHROPIC_BASE_URL') &&
          !line.includes('ANTHROPIC_API_KEY') &&
          !line.includes('# Claude Model Switcher') &&
          !line.includes('.claude-env') &&
          line.trim() !== 'fi' // Remove standalone fi
        );

        // Remove any trailing empty lines
        while (filteredLines.length > 0 && filteredLines[filteredLines.length - 1].trim() === '') {
          filteredLines.pop();
        }

        // Add our source block if not already present
        const hasOurBlock = filteredLines.some(line => line.includes('.claude-env'));
        if (!hasOurBlock) {
          filteredLines.push(...sourceBlock);
        }

        await fs.writeFile(expandedPath, filteredLines.join('\n') + '\n');
      } catch (error) {
        // Ignore errors for shell files that don't exist
        continue;
      }
    }
  }

  async createTempEnvFile(model) {
    const tempEnvFile = path.join(this.configDir, 'current-env.sh');

    const envLines = [
      '#!/bin/bash',
      '# Claude Model Switcher - Current Environment',
      `export ANTHROPIC_BASE_URL="${model.baseUrl}"`
    ];

    if (model.apiKey) {
      envLines.push(`export ANTHROPIC_API_KEY="${model.apiKey}"`);
    }

    await fs.writeFile(tempEnvFile, envLines.join('\n') + '\n');
    await fs.chmod(tempEnvFile, '755');

    return tempEnvFile;
  }

  async createGlobalEnvFile(model) {
    const globalEnvFile = path.join(os.homedir(), '.claude-env');

    const envLines = [
      '#!/bin/bash',
      '# Claude Model Switcher - Global Environment',
      '# Source this file in your shell startup script',
      `export ANTHROPIC_BASE_URL="${model.baseUrl}"`
    ];

    if (model.apiKey) {
      envLines.push(`export ANTHROPIC_API_KEY="${model.apiKey}"`);
    }

    await fs.writeFile(globalEnvFile, envLines.join('\n') + '\n');
    await fs.chmod(globalEnvFile, '755');

    return globalEnvFile;
  }

  async updateClaudeCodeSettings(model) {
    const claudeSettingsFile = path.join(os.homedir(), '.claude', 'settings.json');

    try {
      // Check if Claude Code settings file exists
      if (!(await fs.pathExists(claudeSettingsFile))) {
        console.log('Claude Code settings.json not found, skipping sync...');
        return false;
      }

      // Read current settings
      const settings = await fs.readJson(claudeSettingsFile);

      // Ensure env object exists
      if (!settings.env) {
        settings.env = {};
      }

      // Update environment variables
      settings.env.ANTHROPIC_BASE_URL = model.baseUrl;

      if (model.apiKey) {
        settings.env.ANTHROPIC_API_KEY = model.apiKey;
      }

      // Write back to file with proper formatting
      await fs.writeJson(claudeSettingsFile, settings, { spaces: 2 });

      return true;
    } catch (error) {
      console.error('Error updating Claude Code settings:', error);
      return false;
    }
  }

  async readClaudeCodeSettings() {
    const claudeSettingsFile = path.join(os.homedir(), '.claude', 'settings.json');

    try {
      if (await fs.pathExists(claudeSettingsFile)) {
        return await fs.readJson(claudeSettingsFile);
      }
      return null;
    } catch (error) {
      console.error('Error reading Claude Code settings:', error);
      return null;
    }
  }

  async testConnection(modelName) {
    const models = await this.loadConfig();
    if (!models[modelName]) {
      throw new Error(`Unknown model: ${modelName}`);
    }

    const model = models[modelName];

    try {
      if (modelName === 'ollama') {
        const response = await fetch(`${model.baseUrl.replace('/v1', '')}/api/tags`);
        return response.ok;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}