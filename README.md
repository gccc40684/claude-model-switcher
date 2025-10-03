# Claude Model Switcher

多模型AI API切换器，支持Claude、Gemini、DeepSeek、Qwen、Kimi、GLM 4.5和Ollama本地模型。

## 核心特性

- 🔐 **智能API密钥管理**：每个模型独立保存API密钥，切换时不会覆盖
- ⚡ **即时生效**：切换后立即在当前终端会话中生效，无需重启
- 🔄 **无缝切换**：支持7个主流AI模型一键切换
- 💾 **持久化存储**：API密钥配置一次永久保存
- ⚙️ **灵活配置**：使用 `-e` 标志随时编辑任何模型的配置
- 🚀 **零干扰**：Claude原生API密钥完全保留，切换回来时自动恢复

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

| 模型 | 提供商 | 类型 |
|------|-------|------|
| Claude | Anthropic | 云端API |
| Gemini | Google | 云端API |
| DeepSeek | DeepSeek | 云端API |
| Qwen | 阿里巴巴 | 云端API |
| Kimi | Moonshot | 云端API |
| GLM 4.5 | 智谱AI | 云端API |
| Ollama | 本地 | 本地模型 |

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

### 编辑配置

```bash
# 编辑模型配置（API key和URL）
./claude kimi -e     # 编辑Kimi的API key和URL
./claude deepseek -e # 编辑DeepSeek的配置
./claude qwen -e     # 编辑Qwen的配置
```

### 其他命令

```bash
# 查看所有可用模型
./claude list

# 查看当前激活的模型
./claude current

# 显示帮助信息
./claude help
```

### Node.js API

```bash
# 使用完整的CLI工具
node src/cli.js interactive  # 交互式选择
node src/cli.js config      # 配置API密钥
```

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

? Base URL: https://api.deepseek.com
? API Key (DEEPSEEK_API_KEY): ********
✅ Configuration updated for DeepSeek
```

### 批量配置

也可以手动编辑配置文件：`~/.claude-model-switcher/config.json`

## API端点配置

程序已预配置了所有主流AI模型的API端点：

- **Claude**: `https://api.anthropic.com`
- **Gemini**: `https://generativelanguage.googleapis.com/v1beta`
- **DeepSeek**: `https://api.deepseek.com`
- **Qwen**: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- **Kimi**: `https://api.moonshot.cn/v1`
- **GLM 4.5**: `https://open.bigmodel.cn/api/paas/v4`
- **Ollama**: `http://localhost:11434/v1`

## 工作原理

1. 程序修改shell配置文件（~/.zshrc）中的环境变量
2. 设置`ANTHROPIC_BASE_URL`指向选定模型的API端点
3. 配置相应的API密钥环境变量
4. Claude Code会自动使用新的配置

## 注意事项

- 切换模型后需要重启终端或运行 `source ~/.zshrc`
- Ollama需要本地安装并运行
- 各个云端模型需要有效的API密钥
- 程序会自动备份原有的环境变量配置

## 故障排除

### 常见问题

1. **权限错误**: 确保脚本有执行权限 `chmod +x claude`
2. **模块未找到**: 运行 `npm install` 安装依赖
3. **API连接失败**: 检查API密钥和网络连接
4. **环境变量未生效**: 重启终端或手动source配置文件

### 手动重置

如果出现问题，可以手动清理配置：

```bash
rm -rf ~/.claude-model-switcher
# 手动编辑 ~/.zshrc 移除相关环境变量
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