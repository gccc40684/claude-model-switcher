import chalk from 'chalk';
import inquirer from 'inquirer';
import { ModelConfig } from './config.js';

export class ModelSwitcher {
  constructor() {
    this.config = new ModelConfig();
  }

  async switchModel(modelName) {
    try {
      const models = await this.config.loadConfig();

      if (!models[modelName]) {
        console.log(chalk.red(`❌ Unknown model: ${modelName}`));
        console.log(chalk.yellow('Available models:'));
        Object.keys(models).forEach(key => {
          console.log(chalk.cyan(`  - ${key}: ${models[key].name}`));
        });
        return false;
      }

      // Check if API key is configured
      const needsApiKey = await this.checkAndRequestApiKey(modelName, models);
      if (needsApiKey === false) {
        return false;
      }

      console.log(chalk.blue(`🔄 Switching to ${models[modelName].name}...`));

      // Reload models in case API key was updated
      const updatedModels = await this.config.loadConfig();

      // Set active model
      await this.config.setActiveModel(modelName);

      // Update environment variables
      await this.config.updateEnvironment(modelName);

      console.log(chalk.green(`✅ Successfully switched to ${models[modelName].name}`));
      console.log(chalk.yellow('📝 Please restart your terminal or run: source ~/.zshrc'));

      // Test connection
      console.log(chalk.blue('🔍 Testing connection...'));
      const isConnected = await this.config.testConnection(modelName);

      if (isConnected) {
        console.log(chalk.green('✅ Connection test passed'));
      } else {
        console.log(chalk.yellow('⚠️  Connection test failed (this might be normal for some models)'));
      }

      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Error switching model: ${error.message}`));
      return false;
    }
  }

  async getCurrentModel() {
    try {
      const active = await this.config.getActiveModel();
      const models = await this.config.loadConfig();

      if (models[active.model]) {
        console.log(chalk.green(`📍 Current model: ${models[active.model].name} (${active.model})`));
        console.log(chalk.blue(`🔗 Base URL: ${models[active.model].baseUrl}`));
        console.log(chalk.gray(`📅 Last switched: ${new Date(active.timestamp).toLocaleString()}`));
      } else {
        console.log(chalk.yellow('⚠️  No active model configured'));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error getting current model: ${error.message}`));
    }
  }

  async listModels() {
    try {
      const models = await this.config.loadConfig();
      const active = await this.config.getActiveModel();

      console.log(chalk.bold.blue('\n🤖 Available AI Models:\n'));

      Object.entries(models).forEach(([key, model]) => {
        const isActive = key === active.model;
        const marker = isActive ? chalk.green('●') : chalk.gray('○');
        const name = isActive ? chalk.green.bold(model.name) : chalk.white(model.name);
        const baseUrl = chalk.gray(model.baseUrl);

        console.log(`${marker} ${chalk.cyan(key.padEnd(8))} ${name}`);
        console.log(`  ${' '.repeat(10)} ${baseUrl}`);
        console.log();
      });
    } catch (error) {
      console.log(chalk.red(`❌ Error listing models: ${error.message}`));
    }
  }

  async configureModel(modelName, apiKey) {
    try {
      const models = await this.config.loadConfig();

      if (!models[modelName]) {
        console.log(chalk.red(`❌ Unknown model: ${modelName}`));
        return false;
      }

      // Update API key
      const keyName = Object.keys(models[modelName].envVars).find(key => key !== 'ANTHROPIC_BASE_URL');
      if (keyName) {
        models[modelName].envVars[keyName] = apiKey;
      }

      await this.config.saveConfig(models);
      console.log(chalk.green(`✅ API key configured for ${models[modelName].name}`));

      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Error configuring model: ${error.message}`));
      return false;
    }
  }

  async checkAndRequestApiKey(modelName, models) {
    const model = models[modelName];
    const apiKeyName = Object.keys(model.envVars).find(key => key !== 'ANTHROPIC_BASE_URL');

    if (!apiKeyName) {
      return true; // No API key needed (like Ollama)
    }

    const currentApiKey = model.envVars[apiKeyName];

    if (!currentApiKey || currentApiKey === '') {
      console.log(chalk.yellow(`🔑 ${model.name} requires an API key`));

      const { shouldConfigure } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldConfigure',
          message: `Would you like to configure the API key for ${model.name} now?`,
          default: true
        }
      ]);

      if (!shouldConfigure) {
        console.log(chalk.gray('❌ Skipping model switch - API key required'));
        return false;
      }

      const { apiKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: `Enter API key for ${model.name}:`,
          mask: '*',
          validate: (input) => {
            if (!input || input.trim() === '') {
              return 'API key cannot be empty';
            }
            return true;
          }
        }
      ]);

      // Update and save the API key
      models[modelName].envVars[apiKeyName] = apiKey.trim();
      await this.config.saveConfig(models);
      console.log(chalk.green(`✅ API key saved for ${model.name}`));
    }

    return true;
  }

  async editModel(modelName) {
    try {
      const models = await this.config.loadConfig();

      if (!models[modelName]) {
        console.log(chalk.red(`❌ Unknown model: ${modelName}`));
        return false;
      }

      const model = models[modelName];
      console.log(chalk.blue(`🔧 Editing configuration for ${model.name}\n`));

      const { baseUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'baseUrl',
          message: 'Base URL:',
          default: model.baseUrl
        }
      ]);

      const apiKeyName = Object.keys(model.envVars).find(key => key !== 'ANTHROPIC_BASE_URL');
      let apiKey = '';

      if (apiKeyName) {
        const result = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: `API Key (${apiKeyName}):`,
            mask: '*',
            default: model.envVars[apiKeyName] || ''
          }
        ]);
        apiKey = result.apiKey;
      }

      // Update configuration
      models[modelName].baseUrl = baseUrl;
      models[modelName].envVars.ANTHROPIC_BASE_URL = baseUrl;
      if (apiKeyName && apiKey) {
        models[modelName].envVars[apiKeyName] = apiKey;
      }

      await this.config.saveConfig(models);
      console.log(chalk.green(`✅ Configuration updated for ${model.name}`));

      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Error editing model: ${error.message}`));
      return false;
    }
  }

  async showHelp() {
    console.log(chalk.bold.blue('\n🚀 Claude Model Switcher\n'));
    console.log(chalk.white('Usage:'));
    console.log(chalk.cyan('  claude <model>              ') + chalk.gray('Switch to specified model'));
    console.log(chalk.cyan('  claude <model> -e           ') + chalk.gray('Edit model configuration'));
    console.log(chalk.cyan('  claude list                 ') + chalk.gray('List all available models'));
    console.log(chalk.cyan('  claude current              ') + chalk.gray('Show current active model'));
    console.log(chalk.cyan('  claude help                 ') + chalk.gray('Show this help message'));
    console.log();
    console.log(chalk.white('Quick switch commands:'));
    console.log(chalk.cyan('  claude claude               ') + chalk.gray('Switch to Claude'));
    console.log(chalk.cyan('  claude gemini               ') + chalk.gray('Switch to Gemini'));
    console.log(chalk.cyan('  claude deepseek             ') + chalk.gray('Switch to DeepSeek'));
    console.log(chalk.cyan('  claude qwen                 ') + chalk.gray('Switch to Qwen'));
    console.log(chalk.cyan('  claude kimi                 ') + chalk.gray('Switch to Kimi'));
    console.log(chalk.cyan('  claude glm                  ') + chalk.gray('Switch to GLM 4.5'));
    console.log(chalk.cyan('  claude ollama               ') + chalk.gray('Switch to Ollama (local)'));
    console.log();
    console.log(chalk.white('Edit configuration:'));
    console.log(chalk.cyan('  claude kimi -e              ') + chalk.gray('Edit Kimi API key and URL'));
    console.log(chalk.cyan('  claude deepseek -e          ') + chalk.gray('Edit DeepSeek configuration'));
    console.log();
  }
}