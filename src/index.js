#!/usr/bin/env node

import { ModelSwitcher } from './switcher.js';

const switcher = new ModelSwitcher();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await switcher.showHelp();
    return;
  }

  const command = args[0].toLowerCase();
  const editFlag = args.includes('-e') || args.includes('--edit');

  switch (command) {
    case 'list':
    case 'ls':
      await switcher.listModels();
      break;

    case 'custom':
      await switcher.listCustomModels();
      break;

    case 'delete':
      if (args.length < 2) {
        console.log('❌ Please specify a model to delete');
        console.log('Usage: claude delete <model-name>');
        return;
      }
      await switcher.deleteCustomModel(args[1]);
      break;

    case 'current':
    case 'c':
      await switcher.getCurrentModel();
      break;

    case 'help':
    case 'h':
    case '--help':
      await switcher.showHelp();
      break;

    case 'claude':
    case 'gemini':
    case 'deepseek':
    case 'qwen':
    case 'kimi':
    case 'glm':
    case 'ollama':
      if (editFlag) {
        await switcher.editModel(command);
      } else {
        await switcher.switchModel(command);
      }
      break;

    default:
      if (editFlag) {
        await switcher.editModel(command);
      } else {
        await switcher.switchModel(command);
      }
      break;
  }
}

main().catch(console.error);