@echo off
REM Claude Model Switcher - Windows CLI Script
REM Usage: claude.bat <model_name> [-e]

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

REM Check if no arguments provided
if "%~1"=="" (
    echo.
    echo 🤖 Claude Code AI Model Hub - Windows Edition
    echo.
    echo Usage:
    echo   claude <model^>         Switch to specified model
    echo   claude <model^> -e      Edit model configuration
    echo   claude list            List all available models
    echo   claude current         Show current active model
    echo   claude custom          List custom models only
    echo   claude web             Start Web UI
    echo   claude help            Show this help message
    echo.
    echo Built-in models:
    echo   claude, gemini, deepseek, qwen, kimi, glm, ollama
    echo.
    goto :eof
)

REM Parse arguments
set "MODEL_NAME=%~1"
set "EDIT_FLAG="
if "%~2"=="-e" set "EDIT_FLAG=-e"
if "%~2"=="--edit" set "EDIT_FLAG=-e"

REM Handle different commands
if /i "%MODEL_NAME%"=="help" goto :show_help
if /i "%MODEL_NAME%"=="h" goto :show_help
if /i "%MODEL_NAME%"=="--help" goto :show_help
if /i "%MODEL_NAME%"=="list" goto :list_models
if /i "%MODEL_NAME%"=="ls" goto :list_models
if /i "%MODEL_NAME%"=="current" goto :current_model
if /i "%MODEL_NAME%"=="c" goto :current_model
if /i "%MODEL_NAME%"=="custom" goto :list_custom
if /i "%MODEL_NAME%"=="web" goto :start_web
if /i "%MODEL_NAME%"=="ui" goto :start_web
if /i "%MODEL_NAME%"=="--web" goto :start_web

REM Handle built-in models
for %%M in (claude gemini deepseek qwen kimi glm ollama) do (
    if /i "%MODEL_NAME%"=="%%M" goto :handle_model
)

REM Handle custom model or delete command
if /i "%MODEL_NAME%"=="delete" (
    if "%~2"=="" (
        echo ❌ Please specify a model to delete
        echo Usage: claude delete ^<model-name^>
        exit /b 1
    )
    node "%SCRIPT_DIR%src\index.js" delete "%~2"
    goto :eof
)

REM Handle as custom model
goto :handle_model

:handle_model
echo 🔄 Switching to %MODEL_NAME%...
if defined EDIT_FLAG (
    echo 🔧 Editing configuration for %MODEL_NAME%...
    node "%SCRIPT_DIR%src\index.js" "%MODEL_NAME%" %EDIT_FLAG%
) else (
    node "%SCRIPT_DIR%src\index.js" "%MODEL_NAME%"

    REM Display Windows-specific success message
    if !errorlevel! equ 0 (
        echo.
        echo ✅ Model switched successfully!
        echo 💻 Windows: Claude Code settings.json has been updated
        echo 🚀 You can now use Claude Code with %MODEL_NAME%
        echo.
        echo ▶️  Run 'claude' in your terminal to start Claude Code
    )
)
goto :eof

:list_models
echo 📋 Listing all available models...
node "%SCRIPT_DIR%src\index.js" list
goto :eof

:current_model
echo 📍 Showing current active model...
node "%SCRIPT_DIR%src\index.js" current
goto :eof

:list_custom
echo 🎨 Listing custom models...
node "%SCRIPT_DIR%src\index.js" custom
goto :eof

:start_web
echo 🚀 Starting Claude Model Switcher Web UI...
echo 📱 Opening interface at http://localhost:3000
echo.
node "%SCRIPT_DIR%web-start.js"
goto :eof

:show_help
echo.
    echo 🤖 Claude Code AI Model Hub - Windows Edition
    echo.
    echo 🔧 MODEL MANAGEMENT:
    echo   claude claude              Switch to Claude
    echo   claude gemini              Switch to Gemini
    echo   claude deepseek            Switch to DeepSeek
    echo   claude qwen                Switch to Qwen
    echo   claude kimi                Switch to Kimi
    echo   claude glm                 Switch to GLM 4.5
    echo   claude ollama              Switch to Ollama (local)
    echo.
    echo   claude myapi               Create/switch to custom model "myapi"
    echo   claude myapi -e            Edit custom model configuration
    echo   claude delete myapi        Delete custom model "myapi"
    echo.
    echo 📋 INFORMATION:
    echo   claude list                List all available models
    echo   claude current             Show current active model
    echo   claude custom              List custom models only
    echo.
    echo 🌐 WEB INTERFACE:
    echo   claude web                 Start Web UI
    echo   claude ui                  Start Web UI (alias)
    echo.
    echo ⚙️  CONFIGURATION:
    echo   claude claude -e           Edit Claude API key and model version
    echo   claude kimi -e             Edit Kimi configuration
    echo.
    echo 💡 WINDOWS NOTES:
    echo   • Updates Claude Code settings.json directly
    echo   • No system environment variables required
    echo   • Works with Windows Terminal, PowerShell, and CMD
    echo.
goto :eof