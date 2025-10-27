# Claude Code AI Model Hub

🤖 专为Claude Code设计的多模型AI API切换器，支持Claude、Gemini、DeepSeek、Qwen、Kimi、GLM 4.5和Ollama本地模型。

## 🌟 项目亮点

**✨ 跨平台现代化界面** - 采用现代化设计语言的Web UI，支持PWA应用
**🎯 一键模型切换** - 命令行和可视化界面双重操作方式
**🔐 智能密钥管理** - 每个模型独立保存API密钥，切换时不会覆盖
**📱 移动端优化** - 响应式设计，完美适配手机、平板、桌面设备
**🚀 零干扰设计** - Claude原生API密钥完全保留，切换回来时自动恢复

## ⚠️ 系统支持

**✅ 当前支持：**
- **macOS 10.14+** - 完整功能支持
- **Windows 10/11** - 核心功能支持 🆕
- **Linux** - 基础功能支持

> 🎉 Windows版本现已发布！支持完整的模型切换和配置管理功能。

## 🚀 快速上手

### 1. 安装依赖
```bash
git clone <repository-url>
cd claude-model-switcher
npm install
chmod +x claude
```

### 2. 启动Web界面（推荐）
```bash
# macOS/Linux
./claude web

# Windows
claude.bat web
# 或双击 claude.bat 文件

# 浏览器自动打开 http://localhost:3000
```

### 3. 或使用命令行
```bash
# macOS/Linux
./claude claude
./claude kimi
./claude deepseek
./claude qwen

# Windows
claude.bat claude
claude.bat kimi
claude.bat deepseek
claude.bat qwen

# 查看所有模型
./claude list    # macOS/Linux
claude.bat list  # Windows
```

## 📸 界面预览

### 🖥️ Web界面（Apple风格设计）
```
🤖 Claude Code AI Model Hub
├── 🔍 智能搜索框 + ➕ 添加模型
├── 💬 Claude (Anthropic) - 已连接
│   ├── 🔮 模型图标 + 提供商信息
│   ├── 🏷️ API地址: https://api.anthropic.com
│   ├── ⚙️ 默认模型: claude-3-5-sonnet-20241022
│   └── 🎯 操作按钮（切换/测试/配置）
├── ♊ Gemini (Google) - 未连接
├── 🎯 DeepSeek (DeepSeek) - 已连接
└── ➕ 浮动添加按钮
```

### 📱 移动端界面
- **PWA应用**：可添加到主屏幕，全屏运行
- **触控优化**：按钮大小适合触摸，防止误触
- **手势支持**：流畅的滑动和动画效果

### 🌙 深色模式
- **自动切换**：根据系统主题自动切换
- **护眼配色**：精心调校的深色配色方案

### 🪟 Windows 专用功能
- **原生配置**：直接更新Claude Code settings.json文件
- **无需环境变量**：Windows下不需要配置系统环境变量
- **批处理脚本**：提供完整的命令行支持
- **跨终端兼容**：支持CMD、PowerShell、Windows Terminal

## 🎯 核心特性

### 🔐 智能API管理
- **独立密钥存储**：每个模型API密钥单独保存，切换时不会互相覆盖
- **即时生效**：切换模型后立即在当前终端会话生效，无需重启
- **持久化配置**：配置一次永久保存，重启后自动恢复

### 🎨 Apple风格界面
- **现代化设计**：采用macOS设计语言，毛玻璃效果，精致动画
- **响应式布局**：完美适配手机、平板、桌面设备
- **PWA支持**：可添加到手机主屏幕，像原生应用一样使用
- **深色模式**：自动检测系统主题，支持深色模式

### 🚀 便捷操作体验
- **一键切换**：命令行和Web界面双重切换方式
- **可视化编辑**：图形化界面编辑API密钥和模型配置
- **实时状态**：显示各模型连接状态和系统概览
- **智能搜索**：支持模型名称、标识、API地址全文搜索

### 🔧 高级功能
- **零干扰设计**：Claude原生API密钥完全保留，切换回来时自动恢复
- **连接测试**：一键测试模型API连接状态
- **自定义模型**：支持添加任意OpenAI兼容的API服务
- **批量管理**：支持批量配置和状态监控

## 工作原理

程序通过以下方式确保API密钥不会互相覆盖：

1. **独立存储**：每个模型的API密钥单独保存在配置文件中
2. **动态映射**：切换时将当前模型的API密钥映射到 `ANTHROPIC_API_KEY`
3. **环境隔离**：Claude Code始终使用 `ANTHROPIC_API_KEY`，但实际指向不同模型的密钥
4. **即时应用**：环境变量在当前shell会话中立即生效

**示例场景：**
```bash
# 配置Claude原生API
./claude claude
? Enter API key: sk-ant-api-your-claude-key

# 切换到Kimi（会要求输入Kimi API密钥）
./claude kimi
? Enter API key: sk-moonshot-your-kimi-key

# 切换回Claude（自动使用之前保存的Claude API密钥）
./claude claude
✅ Claude API密钥自动恢复，无需重新输入！
```

## 支持的模型

### 内置模型

| 模型 | 提供商 | 类型 | API格式 |
|------|-------|------|---------|
| Claude | Anthropic | 云端API | Claude API |
| Gemini | Google | 云端API | Gemini API |
| DeepSeek | DeepSeek | 云端API | OpenAI兼容 |
| Qwen | 阿里巴巴 | 云端API | OpenAI兼容 |
| Kimi | Moonshot | 云端API | OpenAI兼容 |
| GLM 4.5 | 智谱AI | 云端API | OpenAI兼容 |
| Ollama | 本地 | 本地模型 | OpenAI兼容 |

### 自定义模型

**支持任何OpenAI兼容的API服务**，包括但不限于：
- 各种云端AI服务商的OpenAI兼容接口
- 私有部署的AI模型服务
- 本地运行的AI模型（如通过vLLM、Ollama等）
- 第三方AI代理服务

**自定义模型特性：**
- 🎯 **灵活配置**：自定义名称、描述、API端点
- 🔑 **独立密钥**：每个自定义模型独立保存API密钥
- ⚙️ **完整管理**：支持创建、编辑、删除自定义模型
- 🔄 **无缝切换**：与内置模型完全一致的切换体验

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd claude-model-switcher

# 安装依赖
npm install

# 全局安装（可选）
npm run install-global

# 或者直接运行
chmod +x claude
```

## 使用方法

### 快速切换命令

```bash
# 切换到不同模型 - 首次使用会自动提示输入API key
./claude claude      # 切换到Claude
./claude gemini      # 切换到Gemini
./claude deepseek    # 切换到DeepSeek (会提示输入API key)
./claude qwen        # 切换到Qwen (会提示输入API key)
./claude kimi        # 切换到Kimi (会提示输入API key)
./claude glm         # 切换到GLM 4.5 (会提示输入API key)
./claude ollama      # 切换到Ollama（本地，无需API key）
```

### 自定义模型

```bash
# 创建自定义模型（会引导你输入配置信息）
./claude myapi        # 创建名为"myapi"的自定义模型

# 列出所有自定义模型
./claude custom

# 编辑自定义模型配置
./claude myapi -e     # 编辑名为"myapi"的自定义模型

# 删除自定义模型
./claude delete myapi # 删除名为"myapi"的自定义模型
```

**自定义模型创建流程：**
```bash
$ ./claude myapi
❌ Unknown model: myapi
? Would you like to create a custom model named 'myapi'? Yes
🔧 Creating custom model: myapi

? Display name for this model: My Private API
? Description (optional): My company's private AI API
? API Base URL (must be OpenAI compatible): https://api.mycompany.com/v1
? API Key: sk-mycompany-api-key-xxx
✅ Custom model 'myapi' created successfully
```

### 编辑配置

```bash
# 编辑内置模型配置（API key和URL）
./claude kimi -e     # 编辑Kimi的API key和URL
./claude deepseek -e # 编辑DeepSeek的配置
./claude qwen -e     # 编辑Qwen的配置

# 编辑自定义模型配置（支持修改所有字段）
./claude myapi -e    # 编辑自定义模型的名称、描述、URL、API key
```

### 其他命令

```bash
# 查看所有可用模型
./claude list

# 查看当前激活的模型
./claude current

# 启动H5可视化Web界面
./claude web         # 或 ./claude ui

# 显示帮助信息
./claude help
```

### Node.js API

```bash
# 使用完整的CLI工具
node src/cli.js interactive  # 交互式选择
node src/cli.js config      # 配置API密钥
```

## 📱 Apple风格Web界面

除了命令行操作，本项目还提供了专为Claude Code设计的Apple风格Web UI界面：

### 🚀 启动Web界面
```bash
# 启动H5可视化界面（两种命令均可）
./claude web
./claude ui
```

### 🎨 界面设计特色
- **Apple设计语言**：采用macOS风格的毛玻璃效果、精致圆角、系统字体
- **现代化布局**：卡片式网格布局，支持深色模式自动切换
- **流畅动画**：悬停效果、模态框过渡、按钮交互动画
- **响应式设计**：完美适配手机、平板、桌面设备

### 🎯 Web界面核心功能
- **📋 模型管理**：可视化查看所有模型状态，智能搜索过滤
- **🎯 一键切换**：点击即可切换AI模型，实时状态反馈
- **⚙️ 配置编辑**：图形化编辑API密钥、地址、默认模型
- **📊 状态监控**：实时显示各模型连接状态、系统概览
- **🧪 连接测试**：一键测试模型API连接，结果可视化展示
- **➕ 自定义管理**：添加、编辑、删除自定义模型，支持任意OpenAI兼容API

### 📱 移动端优化
- **PWA应用支持**：可添加到iPhone/Android主屏幕，像原生应用一样使用
- **触摸优化**：按钮大小适合触摸操作，防止误触
- **手势支持**：流畅的滑动和点击反馈
- **离线缓存**：支持Service Worker，提升加载速度

### 🔧 高级特性
- **智能搜索**：支持模型名称、标识、API地址全文搜索
- **批量操作**：支持批量测试连接、批量状态刷新
- **局域网访问**：启动后可通过本地IP供局域网内其他设备访问
- **实时同步**：Web界面与命令行操作实时同步，状态一致

### 🌐 访问方式
启动后可通过以下地址访问：
- **本地访问**：http://localhost:3000
- **局域网访问**：http://你的IP:3000 （需配置防火墙）

详细Web UI使用说明请参考 [WEB-UI.md](WEB-UI.md)

## 配置API密钥

### 自动配置（推荐）

首次切换到新模型时，程序会自动提示输入API密钥：

```bash
$ ./claude kimi
🔄 Switching to kimi...
🔑 Kimi (Moonshot) requires an API key
? Would you like to configure the API key for Kimi (Moonshot) now? (Y/n) y
? Enter API key for Kimi (Moonshot): ********
✅ API key saved for Kimi (Moonshot)
🔄 Switching to Kimi (Moonshot)...
✅ Successfully switched to Kimi (Moonshot)
```

### 手动编辑配置

使用 `-e` 标志可以随时编辑模型配置：

```bash
$ ./claude deepseek -e
🔧 Editing configuration for DeepSeek

? Base URL: https://api.deepseek.com/anthropic
? API Key (DEEPSEEK_API_KEY): ********
✅ Configuration updated for DeepSeek
```

### 批量配置

也可以手动编辑配置文件：`~/.claude-model-switcher/config.json`

## API端点配置

程序已预配置了所有主流AI模型的API端点：

- **Claude**: `https://api.anthropic.com`
- **Gemini**: `https://generativelanguage.googleapis.com/v1beta`
- **DeepSeek**: `https://api.deepseek.com/anthropic`
- **Qwen**: `https://dashscope.aliyuncs.com/apps/anthropic`
- **Kimi**: `https://api.moonshot.cn/anthropic`
- **GLM 4.5**: `https://open.bigmodel.cn/api/anthropic`
- **Ollama**: `http://localhost:11434/v1`

## 工作原理

1. 程序修改shell配置文件（~/.zshrc）中的环境变量
2. 设置`ANTHROPIC_BASE_URL`指向选定模型的API端点
3. 配置相应的API密钥环境变量
4. Claude Code会自动使用新的配置

## 注意事项

### 系统要求
- **操作系统**：
  - macOS 10.14+ （完整功能支持）
  - Windows 10/11 （核心功能支持）
  - Linux （基础功能支持）
- **Node.js**：14.0.0 或更高版本
- **Shell**：
  - macOS：zsh（默认）、bash
  - Windows：CMD、PowerShell、Windows Terminal
  - Linux：bash、zsh

### 使用限制
- **macOS/Linux**：切换模型后需要重启终端或运行 `source ~/.zshrc`
- **Windows**：配置立即生效，无需重启终端
- Ollama需要本地安装并运行
- 各个云端模型需要有效的API密钥
- 程序会自动备份原有的环境变量配置

## 故障排除

### 常见问题

1. **权限错误**:
   - macOS/Linux: 确保脚本有执行权限 `chmod +x claude`
   - Windows: 确保可以执行批处理文件

2. **模块未找到**: 运行 `npm install` 安装依赖

3. **API连接失败**: 检查API密钥和网络连接

4. **环境变量未生效**:
   - macOS/Linux: 重启终端或手动source配置文件
   - Windows: 配置应该立即生效，检查Claude Code安装路径

5. **Windows下Claude Code找不到配置**:
   - 检查 `C:\Users\[用户名]\AppData\Roaming\Anthropic\Claude\settings.json`
   - 或 `C:\Users\[用户名]\.claude\settings.json`

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

## 开发

```bash
# 开发模式运行
npm start

# 运行CLI
npm run cli

# 测试特定模型
node src/index.js <model_name>
```

## 📋 更新日志

### 🚀 v2.0.0 - 2024年10月 (当前版本)
**重大更新：Apple风格Web UI + 现代化界面**

#### ✨ 新增功能
- **🎨 Apple风格Web界面**：采用macOS设计语言的现代化H5界面
- **📱 PWA支持**：可添加到手机主屏幕，像原生应用一样使用
- **🌙 深色模式**：自动检测系统主题，支持深色/浅色模式切换
- **🔍 智能搜索**：支持模型名称、标识、API地址全文搜索
- **⚡ 批量操作**：支持批量测试连接、批量状态刷新
- **📊 可视化状态**：实时显示各模型连接状态和系统概览

#### 🎯 界面优化
- **现代化设计**：毛玻璃效果、精致圆角、系统字体
- **响应式布局**：完美适配手机、平板、桌面设备
- **流畅动画**：悬停效果、模态框过渡、按钮交互动画
- **触控优化**：按钮大小适合触摸操作，防止误触

#### 🔧 功能改进
- **统一品牌**：系统标题更新为"Claude Code AI Model Hub"
- **架构优化**：合并双Node.js项目为单项目架构
- **性能提升**：优化API响应速度和界面加载性能
- **体验升级**：改进删除按钮布局，避免卡片拥挤

#### 📝 文档更新
- **详细说明**：新增Apple风格界面使用指南
- **快速上手**：优化安装和使用流程说明
- **界面预览**：添加界面结构图和功能演示

#### 🏗️ 技术升级
- **模块化设计**：Web服务器独立封装，代码更清晰
- **依赖优化**：统一依赖管理，减少重复安装
- **错误处理**：增强异常处理和用户反馈

### 📦 v1.0.0 - 初始版本
- 基础CLI功能：模型切换、配置管理
- 支持7个主流AI模型
- 智能API密钥管理系统