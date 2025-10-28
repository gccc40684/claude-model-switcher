# Claude Code AI Model Hub

专为 Claude Code 设计的多模型 AI API 切换器，支持 Claude、Gemini、DeepSeek、Qwen、Kimi、GLM 4.5 和 Ollama 本地模型。

## 项目特性

- **跨平台支持** - 支持 macOS、Windows 和 Linux
- **双重界面** - 命令行和现代化 Web UI
- **智能密钥管理** - 每个模型独立保存 API 密钥，切换时不会覆盖
- **零干扰设计** - Claude 原生 API 密钥完全保留，切换回来时自动恢复
- **移动端优化** - 响应式设计，支持 PWA 应用

## 系统支持

- **macOS 10.14+** - 完整功能支持
- **Windows 10/11** - 核心功能支持
- **Linux** - 基础功能支持

## 快速开始

### 1. 安装依赖

**macOS/Linux:**
```bash
git clone <repository-url>
cd claude-model-switcher
npm install
chmod +x claude
```

**Windows:**
```cmd
git clone <repository-url>
cd claude-model-switcher
npm install
```

### 2. 启动 Web 界面（推荐）

**macOS/Linux:**
```bash
./claude web
```

**Windows:**
```cmd
claude.bat web
```

浏览器将自动打开 http://localhost:3000

### 3. 使用命令行

**macOS/Linux:**
```bash
./claude claude      # 切换到 Claude
./claude kimi        # 切换到 Kimi
./claude list        # 查看所有模型
```

**Windows:**
```cmd
claude.bat claude    # 切换到 Claude
claude.bat kimi      # 切换到 Kimi
claude.bat list      # 查看所有模型
```

## 支持的模型

### 内置模型

| 模型 | 提供商 | 类型 | API 格式 |
|------|-------|------|---------|
| Claude | Anthropic | 云端 API | Claude API |
| Gemini | Google | 云端 API | Gemini API |
| DeepSeek | DeepSeek | 云端 API | OpenAI 兼容 |
| Qwen | 阿里巴巴 | 云端 API | OpenAI 兼容 |
| Kimi | Moonshot | 云端 API | OpenAI 兼容 |
| GLM 4.5 | 智谱 AI | 云端 API | OpenAI 兼容 |
| Ollama | 本地 | 本地模型 | OpenAI 兼容 |

### 自定义模型

支持任何 OpenAI 兼容的 API 服务，包括：
- 各种云端 AI 服务商的 OpenAI 兼容接口
- 私有部署的 AI 模型服务
- 本地运行的 AI 模型（如通过 vLLM、Ollama 等）
- 第三方 AI 代理服务

## 使用方法

### 模型切换

**macOS/Linux:**
```bash
./claude claude      # 切换到 Claude
./claude gemini      # 切换到 Gemini
./claude deepseek    # 切换到 DeepSeek
./claude qwen        # 切换到 Qwen
./claude kimi        # 切换到 Kimi
./claude glm         # 切换到 GLM 4.5
./claude ollama      # 切换到 Ollama（本地，无需 API key）
```

**Windows:**
```cmd
claude.bat claude    # 切换到 Claude
claude.bat gemini    # 切换到 Gemini
claude.bat deepseek  # 切换到 DeepSeek
claude.bat qwen      # 切换到 Qwen
claude.bat kimi      # 切换到 Kimi
claude.bat glm       # 切换到 GLM 4.5
claude.bat ollama    # 切换到 Ollama（本地，无需 API key）
```

### 自定义模型管理

**macOS/Linux:**
```bash
./claude myapi        # 创建自定义模型
./claude custom       # 列出自定义模型
./claude myapi -e     # 编辑自定义模型
./claude delete myapi # 删除自定义模型
```

**Windows:**
```cmd
claude.bat myapi        # 创建自定义模型
claude.bat custom       # 列出自定义模型
claude.bat myapi -e     # 编辑自定义模型
claude.bat delete myapi # 删除自定义模型
```

### 其他命令

**macOS/Linux:**
```bash
./claude list      # 查看所有模型
./claude current   # 查看当前激活的模型
./claude web       # 启动 Web 界面
./claude help      # 显示帮助信息
```

**Windows:**
```cmd
claude.bat list    # 查看所有模型
claude.bat current # 查看当前激活的模型
claude.bat web     # 启动 Web 界面
claude.bat help    # 显示帮助信息
```

## Web 界面

### 启动方式

**macOS/Linux:**
```bash
./claude web
./claude ui
```

**Windows:**
```cmd
claude.bat web
claude.bat ui
```

### 界面特性

- **现代化设计** - Apple 风格界面，支持深色模式
- **响应式布局** - 完美适配手机、平板、桌面设备
- **PWA 支持** - 可添加到主屏幕，像原生应用一样使用
- **实时状态** - 显示各模型连接状态和系统概览
- **智能搜索** - 支持模型名称、标识、API 地址全文搜索

### 访问地址

- **本地访问**: http://localhost:3000
- **局域网访问**: http://你的IP:3000 （需配置防火墙）

## API 密钥配置

### 自动配置（推荐）

首次切换到新模型时，程序会自动提示输入 API 密钥：

```bash
$ ./claude kimi
Switching to kimi...
Kimi (Moonshot) requires an API key
? Would you like to configure the API key for Kimi (Moonshot) now? (Y/n) y
? Enter API key for Kimi (Moonshot): ********
API key saved for Kimi (Moonshot)
Switching to Kimi (Moonshot)...
Successfully switched to Kimi (Moonshot)
```

### 手动编辑配置

使用 `-e` 标志可以随时编辑模型配置：

```bash
$ ./claude deepseek -e
Editing configuration for DeepSeek

? Base URL: https://api.deepseek.com/anthropic
? API Key (DEEPSEEK_API_KEY): ********
Configuration updated for DeepSeek
```

### 配置文件位置

**macOS/Linux:**
```bash
~/.claude-model-switcher/config.json
```

**Windows:**
```cmd
%USERPROFILE%\.claude-model-switcher\config.json
```

## API 端点配置

程序已预配置了所有主流 AI 模型的 API 端点：

- **Claude**: `https://api.anthropic.com`
- **Gemini**: `https://generativelanguage.googleapis.com/v1beta`
- **DeepSeek**: `https://api.deepseek.com/anthropic`
- **Qwen**: `https://dashscope.aliyuncs.com/apps/anthropic`
- **Kimi**: `https://api.moonshot.cn/anthropic`
- **GLM 4.5**: `https://open.bigmodel.cn/api/anthropic`
- **Ollama**: `http://localhost:11434/v1`

## 工作原理

程序通过以下方式确保 API 密钥不会互相覆盖：

1. **独立存储** - 每个模型的 API 密钥单独保存在配置文件中
2. **动态映射** - 切换时将当前模型的 API 密钥映射到 `ANTHROPIC_API_KEY`
3. **环境隔离** - Claude Code 始终使用 `ANTHROPIC_API_KEY`，但实际指向不同模型的密钥
4. **即时应用** - 环境变量在当前 shell 会话中立即生效

### 平台特定实现

**macOS/Linux:**
- 程序修改 shell 配置文件（~/.zshrc）中的环境变量
- 设置 `ANTHROPIC_BASE_URL` 指向选定模型的 API 端点
- 配置相应的 API 密钥环境变量
- Claude Code 会自动使用新的配置

**Windows:**
- 程序直接更新 Claude Code 的 settings.json 文件
- 无需修改系统环境变量
- 配置立即生效，无需重启终端
- 支持 CMD、PowerShell、Windows Terminal

## 系统要求

- **操作系统**:
  - macOS 10.14+ （完整功能支持）
  - Windows 10/11 （核心功能支持）
  - Linux （基础功能支持）
- **Node.js**: 14.0.0 或更高版本
- **Shell**:
  - macOS: zsh（默认）、bash
  - Windows: CMD、PowerShell、Windows Terminal
  - Linux: bash、zsh

## 使用限制

- **macOS/Linux**: 切换模型后需要重启终端或运行 `source ~/.zshrc`
- **Windows**: 配置立即生效，无需重启终端
- Ollama 需要本地安装并运行
- 各个云端模型需要有效的 API 密钥
- 程序会自动备份原有的环境变量配置

## 故障排除

### 常见问题

1. **权限错误**:
   - **macOS/Linux**: 确保脚本有执行权限 `chmod +x claude`
   - **Windows**: 确保可以执行批处理文件，检查文件关联

2. **模块未找到**: 运行 `npm install` 安装依赖

3. **API 连接失败**: 检查 API 密钥和网络连接

4. **环境变量未生效**:
   - **macOS/Linux**: 重启终端或手动 source 配置文件
   - **Windows**: 配置应该立即生效，检查 Claude Code 安装路径

5. **Windows 下 Claude Code 找不到配置**:
   - 检查 `C:\Users\[用户名]\AppData\Roaming\Anthropic\Claude\settings.json`
   - 或 `C:\Users\[用户名]\.claude\settings.json`
   - 确保 Claude Code 已正确安装

6. **Windows 批处理文件无法运行**:
   - 检查文件关联：`.bat` 文件应关联到 `cmd.exe`
   - 尝试右键选择"以管理员身份运行"
   - 检查 Windows Defender 是否阻止了脚本执行

7. **Node.js 未找到**:
   - **Windows**: 确保 Node.js 已安装并添加到 PATH 环境变量
   - 运行 `node --version` 检查安装状态
   - 重新安装 Node.js 或修复 PATH 设置

### 手动重置

如果出现问题，可以手动清理配置：

**macOS/Linux:**
```bash
rm -rf ~/.claude-model-switcher
# 手动编辑 ~/.zshrc 或 ~/.bashrc 移除相关环境变量
```

**Windows:**
```cmd
rmdir /s "%USERPROFILE%\.claude-model-switcher"
# 手动删除 %APPDATA%\Anthropic\Claude\settings.json 中的相关配置
```

### Windows 特定重置步骤

1. **清理配置文件**:
   ```cmd
   rmdir /s "%USERPROFILE%\.claude-model-switcher"
   ```

2. **重置 Claude Code 设置**:
   - 删除 `%APPDATA%\Anthropic\Claude\settings.json`
   - 或删除 `%USERPROFILE%\.claude\settings.json`

3. **重新安装依赖**:
   ```cmd
   npm install
   ```

4. **测试安装**:
   ```cmd
   claude.bat help
   ```

## 开发

**macOS/Linux:**
```bash
npm start                    # 开发模式运行
npm run cli                  # 运行 CLI
node src/index.js <model>    # 测试特定模型
```

**Windows:**
```cmd
npm start                    # 开发模式运行
npm run cli                  # 运行 CLI
node src/index.js <model>    # 测试特定模型
claude.bat <model>           # 或使用批处理文件
```

### 开发环境设置

**跨平台开发注意事项**:
- 使用 `.gitattributes` 确保文件换行符正确
- Windows 开发者需要安装 Git for Windows
- 建议使用 VS Code 或其他支持跨平台的编辑器
- 测试时确保在目标平台上验证功能

## 更新日志

### v2.0.0 - 2025年10月 (当前版本)

**重大更新：Apple 风格 Web UI + 现代化界面**

#### 新增功能
- **Apple 风格 Web 界面** - 采用 macOS 设计语言的现代化 H5 界面
- **PWA 支持** - 可添加到手机主屏幕，像原生应用一样使用
- **深色模式** - 自动检测系统主题，支持深色/浅色模式切换
- **智能搜索** - 支持模型名称、标识、API 地址全文搜索
- **批量操作** - 支持批量测试连接、批量状态刷新
- **可视化状态** - 实时显示各模型连接状态和系统概览

#### 界面优化
- **现代化设计** - 毛玻璃效果、精致圆角、系统字体
- **响应式布局** - 完美适配手机、平板、桌面设备
- **流畅动画** - 悬停效果、模态框过渡、按钮交互动画
- **触控优化** - 按钮大小适合触摸操作，防止误触

#### 功能改进
- **统一品牌** - 系统标题更新为"Claude Code AI Model Hub"
- **架构优化** - 合并双 Node.js 项目为单项目架构
- **性能提升** - 优化 API 响应速度和界面加载性能
- **体验升级** - 改进删除按钮布局，避免卡片拥挤

#### 技术升级
- **模块化设计** - Web 服务器独立封装，代码更清晰
- **依赖优化** - 统一依赖管理，减少重复安装
- **错误处理** - 增强异常处理和用户反馈

### v1.0.0 - 初始版本
- 基础 CLI 功能：模型切换、配置管理
- 支持 7 个主流 AI 模型
- 智能 API 密钥管理系统