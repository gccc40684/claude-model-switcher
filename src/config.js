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
        envVars: {
          ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
          ANTHROPIC_API_KEY: ''
        },
        defaultModel: 'claude-3-5-sonnet-20241022'
      },
      gemini: {
        name: 'Gemini (Google)',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        envVars: {
          ANTHROPIC_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
          GEMINI_API_KEY: ''
        },
        defaultModel: 'gemini-2.0-flash-exp'
      },
      deepseek: {
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com',
        envVars: {
          ANTHROPIC_BASE_URL: 'https://api.deepseek.com',
          DEEPSEEK_API_KEY: ''
        },
        defaultModel: 'deepseek-chat'
      },
      qwen: {
        name: 'Qwen (Alibaba)',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        envVars: {
          ANTHROPIC_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
          QWEN_API_KEY: ''
        },
        defaultModel: 'qwen-max'
      },
      kimi: {
        name: 'Kimi (Moonshot)',
        baseUrl: 'https://api.moonshot.cn/v1',
        envVars: {
          ANTHROPIC_BASE_URL: 'https://api.moonshot.cn/v1',
          MOONSHOT_API_KEY: ''
        },
        defaultModel: 'moonshot-v1-8k'
      },
      glm: {
        name: 'GLM 4.5 (ZhipuAI)',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        envVars: {
          ANTHROPIC_BASE_URL: 'https://open.bigmodel.cn/api/paas/v4',
          GLM_API_KEY: ''
        },
        defaultModel: 'glm-4-plus'
      },
      ollama: {
        name: 'Ollama (Local)',
        baseUrl: 'http://localhost:11434/v1',
        envVars: {
          ANTHROPIC_BASE_URL: 'http://localhost:11434/v1',
          OLLAMA_API_KEY: 'ollama'
        },
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
        return { ...this.models, ...config };
      }
      return this.models;
    } catch (error) {
      console.error('Error loading config:', error);
      return this.models;
    }
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
    const envFile = path.join(os.homedir(), '.zshrc');

    try {
      let envContent = '';
      if (await fs.pathExists(envFile)) {
        envContent = await fs.readFile(envFile, 'utf8');
      }

      const lines = envContent.split('\n');
      const filteredLines = lines.filter(line =>
        !line.includes('ANTHROPIC_BASE_URL') &&
        !line.includes('ANTHROPIC_API_KEY') &&
        !line.includes('# Claude Model Switcher')
      );

      filteredLines.push('');
      filteredLines.push('# Claude Model Switcher - Auto Generated');
      filteredLines.push(`export ANTHROPIC_BASE_URL="${model.baseUrl}"`);

      Object.entries(model.envVars).forEach(([key, value]) => {
        if (key !== 'ANTHROPIC_BASE_URL' && value) {
          filteredLines.push(`export ${key}="${value}"`);
        }
      });

      await fs.writeFile(envFile, filteredLines.join('\n'));
      return true;
    } catch (error) {
      console.error('Error updating environment:', error);
      return false;
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