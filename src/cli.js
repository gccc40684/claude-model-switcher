#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { ModelSwitcher } from './switcher.js';

const switcher = new ModelSwitcher();

program
  .name('claude-switcher')
  .description('Multi-model AI API switcher for Claude Code')
  .version('1.0.0');

program
  .command('switch')
  .aliases(['s'])
  .description('Switch to a specific model')
  .argument('<model>', 'Model name (claude, gemini, deepseek, qwen, kimi, glm, ollama)')
  .action(async (model) => {
    await switcher.switchModel(model.toLowerCase());
  });

program
  .command('list')
  .aliases(['ls', 'l'])
  .description('List all available models')
  .action(async () => {
    await switcher.listModels();
  });

program
  .command('current')
  .aliases(['c'])
  .description('Show current active model')
  .action(async () => {
    await switcher.getCurrentModel();
  });

program
  .command('config')
  .description('Configure API keys for models')
  .action(async () => {
    const models = await switcher.config.loadConfig();

    const { selectedModel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedModel',
        message: 'Select model to configure:',
        choices: Object.entries(models).map(([key, model]) => ({
          name: `${model.name} (${key})`,
          value: key
        }))
      }
    ]);

    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: `Enter API key for ${models[selectedModel].name}:`,
        mask: '*'
      }
    ]);

    await switcher.configureModel(selectedModel, apiKey);
  });

program
  .command('interactive')
  .aliases(['i'])
  .description('Interactive model selection')
  .action(async () => {
    const models = await switcher.config.loadConfig();
    const active = await switcher.config.getActiveModel();

    const { selectedModel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedModel',
        message: 'Select AI model:',
        choices: Object.entries(models).map(([key, model]) => ({
          name: `${model.name} ${key === active.model ? chalk.green('(current)') : ''}`,
          value: key
        }))
      }
    ]);

    if (selectedModel !== active.model) {
      await switcher.switchModel(selectedModel);
    } else {
      console.log(chalk.blue('🔄 Already using this model'));
    }
  });

// Handle direct model switching (for shortcuts like "claude gemini")
program
  .argument('[model]', 'Model name to switch to')
  .action(async (model) => {
    if (model) {
      await switcher.switchModel(model.toLowerCase());
    } else {
      await switcher.showHelp();
    }
  });

// Parse arguments
if (process.argv.length === 2) {
  await switcher.showHelp();
} else {
  program.parse();
}