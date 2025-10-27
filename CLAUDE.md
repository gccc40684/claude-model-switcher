# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Claude Code AI Model Hub v2.0.0** - a cross-platform multi-model AI API switcher specifically designed for Claude Code. It provides both CLI and modern Web UI for switching between different AI providers (Claude, Gemini, DeepSeek, Qwen, Kimi, GLM 4.5, and Ollama local models).

**Key Architecture**: The system works by updating Claude Code's settings.json file directly, allowing Claude Code to use different AI providers while maintaining full compatibility across platforms (macOS, Windows, Linux).

## Common Commands

### Development & Testing
```bash
# Install dependencies
npm install

# Run CLI tool
npm run cli

# Start development server
npm start

# Start Web UI (recommended for user interaction)
./claude web
# or
npm run web

# Install globally for system-wide use
npm run install-global
```

### CLI Operations
```bash
# macOS/Linux
./claude claude      # Switch to Claude
./claude gemini      # Switch to Gemini
./claude deepseek    # Switch to DeepSeek
./claude qwen        # Switch to Qwen
./claude kimi        # Switch to Kimi
./claude glm         # Switch to GLM 4.5
./claude ollama      # Switch to Ollama (local)

# Windows
claude.bat claude    # Switch to Claude
claude.bat gemini    # Switch to Gemini
claude.bat deepseek  # Switch to DeepSeek
claude.bat qwen      # Switch to Qwen
claude.bat kimi      # Switch to Kimi
claude.bat glm       # Switch to GLM 4.5
claude.bat ollama     # Switch to Ollama (local)

# Model management (all platforms)
./claude list / claude.bat list        # List all available models
./claude current / claude.bat current     # Show current active model
./claude custom / claude.bat custom      # List custom models only

# Custom model operations
./claude myapi / claude.bat myapi       # Create custom model "myapi"
./claude myapi -e / claude.bat myapi -e  # Edit custom model configuration
./claude delete myapi / claude.bat delete myapi # Delete custom model

# Edit built-in model configurations
./claude kimi -e / claude.bat kimi -e     # Edit Kimi API key/URL and model version
```

**Model Version Management:**
- Built-in models use recommended versions by default (e.g., Claude uses "sonnet" alias)
- When editing a model, you can specify a custom model version
- Custom model versions are stored in settings.json as `ANTHROPIC_MODEL`
- If no custom version is specified, `ANTHROPIC_MODEL` is removed from settings.json
- Model versions can be set via CLI edit mode or Web UI

```bash
# Example: Set custom model version for Claude
./claude claude -e    # Then enter "claude-3-5-sonnet-20241022" when prompted
```

## Architecture & Code Structure

### Core Components

**Main Entry Points:**
- `src/index.js` - Main CLI application entry point
- `src/cli.js` - CLI wrapper script
- `web-start.js` - Web UI launcher

**Core Classes:**
- `src/config.js` - **ModelConfig** class manages all model configurations, API keys, and settings.json updates
- `src/switcher.js` - **ModelSwitcher** class handles CLI interactions and model switching logic
- `src/web-server.js` - **WebServer** class provides RESTful API and serves Web UI
- `src/platform.js` - **Platform** class handles cross-platform detection and configuration paths

**Web Frontend:**
- `web/` directory contains modern cross-platform Web UI with PWA support
- Static files served by Express server from `src/web-server.js`

### Configuration System

**Model Definitions** (in `src/config.js`):
- 7 built-in models with pre-configured API endpoints
- Each model has: name, baseUrl, apiKeyName, defaultModel
- Custom models stored with same schema + `isCustom: true` flag

**Persistence:**
- Configuration stored in `~/.claude-model-switcher/config.json`
- Active model in `~/.claude-model-switcher/active.json`
- Claude Code settings updated directly in platform-specific locations:
  - Windows: `%APPDATA%\Anthropic\Claude\settings.json` or `%USERPROFILE%\.claude\settings.json`
  - macOS/Linux: `~/.claude/settings.json`

**Environment Management:**
- All models map their API keys to `ANTHROPIC_API_KEY` in Claude Code settings
- `ANTHROPIC_BASE_URL` set to model's API endpoint
- `ANTHROPIC_MODEL` only set when user specifies a custom model version
- Platform-specific shell config updates (macOS/Linux only):
  - Shell configs (`~/.zshrc`, `~/.bashrc`) updated with sourcing block
  - Windows: Direct settings.json updates, no shell configuration needed
- Model version intelligently selected: Claude models use aliases (sonnet, opus, haiku), other providers use specific model names

### API Endpoints (Web Server)

**Model Management:**
- `GET /api/models` - List all models with active status
- `POST /api/models/:modelName/switch` - Switch to specific model
- `PUT /api/models/:modelName` - Update model configuration
- `PUT /api/models/:modelName/version` - Set custom model version for a model
- `DELETE /api/models/:modelName` - Delete custom model
- `POST /api/models/custom` - Create custom model

**Status & Testing:**
- `GET /api/models/active` - Get current active model
- `POST /api/models/:modelName/test` - Test model connection
- `GET /api/status` - System status with all model connections

### Key Design Patterns

**1. Unified API Interface**: All models (built-in and custom) share the same configuration schema and switching mechanism.

**2. Environment Variable Isolation**: Each model's API key is stored separately but mapped to `ANTHROPIC_API_KEY` when active, preventing conflicts.

**3. Graceful Fallbacks**: Configuration loading includes migration logic for old formats and defaults to built-in models if config is corrupted.

**4. Dual Interface**: Both CLI and Web UI operate on the same core configuration system through shared classes.

## Important Notes

### API Key Security
- API keys stored in plaintext in `~/.claude-model-switcher/config.json`
- Keys are written to Claude Code settings.json when model is active
- Shell configuration files contain environment variable exports (macOS/Linux only)

### Model Compatibility
- Built-in models use specific API formats (Claude API, OpenAI-compatible, etc.)
- Custom models must be OpenAI-compatible
- Ollama runs locally and doesn't require API key

### System Integration
- Cross-platform support: macOS, Windows 10/11, Linux
- Platform-specific configuration handling:
  - macOS/Linux: Modifies shell configuration files automatically
  - Windows: Direct settings.json updates, no shell configuration needed
- Updates Claude Code settings directly
- Changes take effect immediately on Windows, restart terminal on macOS/Linux

### Error Handling
- Connection testing available for all models
- Graceful degradation when API endpoints are unavailable
- Configuration validation and migration handling
- Comprehensive error messages in both CLI and Web UI

## Development Context

This is a v2.0.0 rewrite that consolidated a dual-Node.js project architecture into a single unified codebase with both CLI and Web UI capabilities. The project focuses on providing a seamless cross-platform user experience while maintaining powerful CLI functionality for power users.

**Windows Support Added**: The latest version includes full Windows compatibility through platform detection, direct settings.json manipulation, and a dedicated Windows batch script (claude.bat).