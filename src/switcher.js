import chalk from 'chalk';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
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
          const modelInfo = models[key];
          const typeIndicator = modelInfo.isCustom ? chalk.magenta('[Custom]') : '';
          console.log(chalk.cyan(`  - ${key}: ${modelInfo.name} ${typeIndicator}`));
        });

        // Ask if user wants to create a custom model
        const { createCustom } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'createCustom',
            message: `Would you like to create a custom model named '${modelName}'?`,
            default: true
          }
        ]);

        if (createCustom) {
          const success = await this.createCustomModel(modelName);
          if (!success) {
            return false;
          }
          // Reload models after creating custom model
          const updatedModels = await this.config.loadConfig();
          Object.assign(models, updatedModels);
        } else {
          return false;
        }
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
      console.log(chalk.blue(`🔗 Base URL: ${models[modelName].baseUrl}`));

      // Check if Claude Code settings were updated
      const claudeSettings = await this.config.readClaudeCodeSettings();
      if (claudeSettings && claudeSettings.env) {
        console.log(chalk.green(`🔄 Claude Code settings.json updated:`));
        console.log(chalk.gray(`   ANTHROPIC_BASE_URL: ${claudeSettings.env.ANTHROPIC_BASE_URL}`));
        if (claudeSettings.env.ANTHROPIC_API_KEY) {
          const maskedKey = claudeSettings.env.ANTHROPIC_API_KEY.slice(-4);
          console.log(chalk.gray(`   ANTHROPIC_API_KEY: ***${maskedKey}`));
        }
      } else {
        console.log(chalk.yellow(`⚠️  Claude Code settings.json not found or not updated`));
      }

      // Check API key status
      if (updatedModels[modelName].apiKey) {
        console.log(chalk.green(`🔑 API Key configured`));
      }

      console.log(chalk.yellow('🚀 Environment updated! Claude Code is now ready to use with ' + models[modelName].name));
      console.log(chalk.green('💡 Run "claude" in your terminal to start using ' + models[modelName].name));

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

    // Ollama doesn't need API key
    if (!model.apiKeyName) {
      return true;
    }

    const currentApiKey = model.apiKey;

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
      models[modelName].apiKey = apiKey.trim();
      await this.config.saveConfig(models);
      console.log(chalk.green(`✅ API key saved for ${model.name}`));
    }

    return true;
  }

  async createCustomModel(modelName) {
    try {
      console.log(chalk.blue(`🔧 Creating custom model: ${modelName}\n`));

      const modelInfo = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Display name for this model:',
          default: modelName.charAt(0).toUpperCase() + modelName.slice(1),
          validate: (input) => input.trim() !== '' || 'Display name is required'
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description (optional):',
          default: `Custom ${modelName} model`
        },
        {
          type: 'input',
          name: 'baseUrl',
          message: 'API Base URL (must be OpenAI compatible):',
          validate: (input) => {
            if (!input.trim()) return 'Base URL is required';
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          }
        },
        {
          type: 'password',
          name: 'apiKey',
          message: 'API Key:',
          mask: '*',
          validate: (input) => input.trim() !== '' || 'API key is required'
        }
      ]);

      const models = await this.config.loadConfig();

      // Create custom model configuration
      models[modelName] = {
        name: modelInfo.name.trim(),
        description: modelInfo.description.trim() || `Custom ${modelName} model`,
        baseUrl: modelInfo.baseUrl.trim(),
        apiKeyName: 'ANTHROPIC_API_KEY',
        apiKey: modelInfo.apiKey.trim(),
        isCustom: true,
        defaultModel: 'gpt-3.5-turbo'
      };

      await this.config.saveConfig(models);
      console.log(chalk.green(`✅ Custom model '${modelName}' created successfully`));
      console.log(chalk.gray(`   Name: ${modelInfo.name}`));
      console.log(chalk.gray(`   URL: ${modelInfo.baseUrl}`));
      console.log(chalk.gray(`   Type: OpenAI Compatible API`));

      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Error creating custom model: ${error.message}`));
      return false;
    }
  }

  async listCustomModels() {
    try {
      const models = await this.config.loadConfig();
      const customModels = Object.entries(models).filter(([key, model]) => model.isCustom);

      if (customModels.length === 0) {
        console.log(chalk.yellow('📝 No custom models configured'));
        console.log(chalk.gray('Use: claude <custom-name> to create a new custom model'));
        return;
      }

      console.log(chalk.bold.magenta('\n🎨 Custom Models:\n'));

      customModels.forEach(([key, model]) => {
        console.log(chalk.magenta(`● ${key.padEnd(12)} ${model.name}`));
        console.log(chalk.gray(`  ${' '.repeat(14)} ${model.baseUrl}`));
        if (model.description && model.description !== model.name) {
          console.log(chalk.gray(`  ${' '.repeat(14)} ${model.description}`));
        }
        console.log();
      });
    } catch (error) {
      console.log(chalk.red(`❌ Error listing custom models: ${error.message}`));
    }
  }

  async deleteCustomModel(modelName) {
    try {
      const models = await this.config.loadConfig();

      if (!models[modelName]) {
        console.log(chalk.red(`❌ Model '${modelName}' not found`));
        return false;
      }

      if (!models[modelName].isCustom) {
        console.log(chalk.red(`❌ '${modelName}' is a built-in model and cannot be deleted`));
        return false;
      }

      const { confirmDelete } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmDelete',
          message: `Are you sure you want to delete custom model '${modelName}'?`,
          default: false
        }
      ]);

      if (!confirmDelete) {
        console.log(chalk.gray('🚫 Deletion cancelled'));
        return false;
      }

      delete models[modelName];
      await this.config.saveConfig(models);

      console.log(chalk.green(`✅ Custom model '${modelName}' deleted successfully`));

      // If this was the active model, switch to claude
      const active = await this.config.getActiveModel();
      if (active.model === modelName) {
        console.log(chalk.yellow('🔄 Switching to Claude as the deleted model was active'));
        await this.switchModel('claude');
      }

      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Error deleting custom model: ${error.message}`));
      return false;
    }
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

      const editPrompts = [
        {
          type: 'input',
          name: 'baseUrl',
          message: 'Base URL:',
          default: model.baseUrl
        }
      ];

      // Add model version selection for built-in models
      if (!model.isCustom) {
        editPrompts.push({
          type: 'input',
          name: 'customModel',
          message: 'Model version (leave empty to use recommended):',
          default: model.userSelectedModel || '',
          validate: (input) => {
            if (input && input.trim() === '') {
              return 'Model version cannot be empty if specified';
            }
            return true;
          }
        });
      }

      const { baseUrl, customModel } = await inquirer.prompt(editPrompts);

      if (model.isCustom) {
        // For custom models, allow editing all fields
        const editInfo = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Display name:',
            default: model.name
          },
          {
            type: 'input',
            name: 'description',
            message: 'Description:',
            default: model.description || ''
          },
          {
            type: 'input',
            name: 'baseUrl',
            message: 'Base URL:',
            default: model.baseUrl,
            validate: (input) => {
              try {
                new URL(input);
                return true;
              } catch {
                return 'Please enter a valid URL';
              }
            }
          },
          {
            type: 'password',
            name: 'apiKey',
            message: 'API Key:',
            mask: '*',
            default: model.apiKey || ''
          }
        ]);

        // Update custom model configuration
        models[modelName].name = editInfo.name.trim();
        models[modelName].description = editInfo.description.trim();
        models[modelName].baseUrl = editInfo.baseUrl.trim();
        if (editInfo.apiKey.trim()) {
          models[modelName].apiKey = editInfo.apiKey.trim();
        }
      } else {
        // For built-in models, handle API key and model version
        let apiKey = model.apiKey;
        if (model.apiKeyName) {
          const result = await inquirer.prompt([
            {
              type: 'password',
              name: 'apiKey',
              message: `API Key:`,
              mask: '*',
              default: model.apiKey || ''
            }
          ]);
          apiKey = result.apiKey;
        }

        // Update configuration
        models[modelName].baseUrl = baseUrl;
        if (apiKey) {
          models[modelName].apiKey = apiKey;
        }

        // Handle custom model version if provided
        if (customModel && customModel.trim()) {
          models[modelName].userSelectedModel = customModel.trim();
          console.log(chalk.blue(`🎯 Custom model version set: ${customModel.trim()}`));
        } else {
          // Clear custom model version if user left it empty
          delete models[modelName].userSelectedModel;
        }
      }

      await this.config.saveConfig(models);
      console.log(chalk.green(`✅ Configuration updated for ${model.name}`));

      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Error editing model: ${error.message}`));
      return false;
    }
  }

  async launchClaudeApp(modelName) {
    try {
      console.log(chalk.blue(`🚀 Ready to launch Claude CLI with ${modelName}...`));
      console.log(chalk.yellow('💡 Run "claude" in your terminal to start the Claude CLI'));
      console.log(chalk.gray('   The environment is already configured for the new model'));

      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      return false;
    }
  }

  async showHelp() {
    console.log(chalk.bold.blue('\n🚀 Claude Model Switcher\n'));
    console.log(chalk.white('Usage:'));
    console.log(chalk.cyan('  claude <model>              ') + chalk.gray('Switch to specified model'));
    console.log(chalk.cyan('  claude <model> -e           ') + chalk.gray('Edit model configuration'));
    console.log(chalk.cyan('  claude <custom-name>        ') + chalk.gray('Create/switch to custom model'));
    console.log(chalk.cyan('  claude list                 ') + chalk.gray('List all available models'));
    console.log(chalk.cyan('  claude custom               ') + chalk.gray('List custom models only'));
    console.log(chalk.cyan('  claude delete <model>       ') + chalk.gray('Delete custom model'));
    console.log(chalk.cyan('  claude current              ') + chalk.gray('Show current active model'));
    console.log(chalk.cyan('  claude web                  ') + chalk.gray('Launch H5 web interface'));
    console.log(chalk.cyan('  claude ui                   ') + chalk.gray('Launch H5 web interface (alias)'));
    console.log(chalk.cyan('  claude help                 ') + chalk.gray('Show this help message'));
    console.log();
    console.log(chalk.white('Built-in models:'));
    console.log(chalk.cyan('  claude claude               ') + chalk.gray('Switch to Claude'));
    console.log(chalk.cyan('  claude gemini               ') + chalk.gray('Switch to Gemini'));
    console.log(chalk.cyan('  claude deepseek             ') + chalk.gray('Switch to DeepSeek'));
    console.log(chalk.cyan('  claude qwen                 ') + chalk.gray('Switch to Qwen'));
    console.log(chalk.cyan('  claude kimi                 ') + chalk.gray('Switch to Kimi'));
    console.log(chalk.cyan('  claude glm                  ') + chalk.gray('Switch to GLM 4.5'));
    console.log(chalk.cyan('  claude ollama               ') + chalk.gray('Switch to Ollama (local)'));
    console.log();
    console.log(chalk.white('Custom models:'));
    console.log(chalk.cyan('  claude myapi                ') + chalk.gray('Create custom model "myapi"'));
    console.log(chalk.cyan('  claude custom               ') + chalk.gray('List all custom models'));
    console.log(chalk.cyan('  claude delete myapi         ') + chalk.gray('Delete custom model "myapi"'));
    console.log();
    console.log(chalk.white('Edit configuration:'));
    console.log(chalk.cyan('  claude kimi -e              ') + chalk.gray('Edit Kimi API key and URL'));
    console.log(chalk.cyan('  claude myapi -e             ') + chalk.gray('Edit custom model configuration'));
    console.log();
    console.log(chalk.magenta('💡 Custom models must use OpenAI-compatible APIs'));
    console.log();
  }
}