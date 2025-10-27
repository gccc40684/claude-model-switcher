# Claude Code AI Model Hub - 开发任务分解

## 📋 项目概述

开发一款专为macOS设计的Claude Code模型API切换工具，支持命令行和可视化界面双重操作方式，集成主流AI模型API，实现一键切换和智能配置管理。

## 🔍 API兼容性调研结果

### 支持的AI模型及API端点

| 模型 | 提供商 | API端点 | 兼容性 | 模型ID |
|------|--------|---------|--------|--------|
| Claude | Anthropic | `https://api.anthropic.com` | 原生API | `claude-3-5-sonnet-20241022` |
| Gemini | Google | `https://generativelanguage.googleapis.com/v1beta` | OpenAI兼容 | `gemini-pro` |
| Kimi | Moonshot | `https://api.moonshot.cn/v1` | OpenAI兼容 | `kimi-latest`, `kimi-k2-0711-preview` |
| DeepSeek | DeepSeek | `https://api.deepseek.com/v1` | OpenAI兼容 | `deepseek-chat`, `deepseek-coder` |
| Qwen | Alibaba | `https://dashscope.aliyuncs.com/compatible-mode/v1` | OpenAI兼容 | `qwen-max-latest`, `qwen3-coder-32b` |
| GLM 4.5 | ZhipuAI | `https://open.bigmodel.cn/api/paas/v4` | OpenAI兼容 | `glm-4.5`, `glm-4.5-air` |
| Ollama | 本地 | `http://localhost:11434/v1` | OpenAI兼容 | 任意本地模型 |

### Claude Code配置机制

Claude Code使用以下环境变量进行配置：
- `ANTHROPIC_API_KEY`: API密钥
- `ANTHROPIC_BASE_URL`: API端点（关键配置项）
- `ANTHROPIC_MODEL`: 指定模型（可选）

## 🏗️ 系统架构设计

### 核心模块结构

```
claude-model-switcher/
├── src/
│   ├── cli.js              # 命令行接口
│   ├── config.js           # 配置管理
│   ├── switcher.js         # 模型切换逻辑
│   ├── web-server.js       # Web服务器
│   └── utils.js            # 工具函数
├── web/
│   ├── index.html          # Web界面
│   ├── app.js             # 前端逻辑
│   └── assets/            # 静态资源
├── config/
│   └── models.json        # 模型配置模板
├── scripts/
│   └── install.js         # 安装脚本
└── package.json
```

### 技术栈

- **后端**: Node.js + Express.js
- **前端**: Vue.js 3 + 原生CSS (Apple风格设计)
- **配置**: JSON配置文件 + 环境变量管理
- **存储**: 本地文件系统（~/.claude-model-switcher/）

## 📝 详细开发任务

### 第一阶段：核心功能开发（预计：3-4天）

#### 1.1 配置管理系统
- [ ] 创建配置文件结构（~/.claude-model-switcher/config.json）
- [ ] 实现配置文件的读写操作
- [ ] 设计模型配置数据结构
- [ ] 实现API密钥的安全存储（加密）
- [ ] 创建默认模型配置模板

#### 1.2 模型切换逻辑
- [ ] 实现环境变量管理（ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL）
- [ ] 创建模型切换算法
- [ ] 实现shell配置文件修改（~/.zshrc）
- [ ] 添加配置备份和恢复功能
- [ ] 实现当前活动模型检测

#### 1.3 命令行接口
- [ ] 创建主CLI入口文件（claude）
- [ ] 实现模型切换命令（claude [model_name]）
- [ ] 添加模型列表命令（claude list）
- [ ] 实现当前模型查看（claude current）
- [ ] 添加模型编辑命令（claude [model] -e）
- [ ] 实现自定义模型创建流程
- [ ] 添加帮助和版本信息

#### 1.4 内置模型支持
- [ ] 配置Claude (Anthropic) 默认设置
- [ ] 配置Gemini (Google) API端点
- [ ] 配置Kimi (Moonshot) API端点
- [ ] 配置DeepSeek API端点
- [ ] 配置Qwen (Alibaba) API端点
- [ ] 配置GLM 4.5 (ZhipuAI) API端点
- [ ] 配置Ollama本地API端点

### 第二阶段：Web界面开发（预计：2-3天）

#### 2.1 Web服务器
- [ ] 创建Express.js服务器
- [ ] 实现RESTful API端点
- [ ] 添加CORS支持
- [ ] 实现静态文件服务
- [ ] 添加错误处理和日志

#### 2.2 API接口实现
- [ ] GET /api/models - 获取所有模型配置
- [ ] POST /api/models/:name/switch - 切换模型
- [ ] PUT /api/models/:name - 更新模型配置
- [ ] POST /api/models/:name/test - 测试模型连接
- [ ] GET /api/models/active - 获取当前活动模型
- [ ] POST /api/models/custom - 创建自定义模型
- [ ] DELETE /api/models/:name - 删除自定义模型
- [ ] GET /api/status - 获取系统状态

#### 2.3 前端界面设计
- [ ] 创建Apple风格响应式界面
- [ ] 实现模型卡片网格布局
- [ ] 添加模型状态指示器
- [ ] 实现搜索和过滤功能
- [ ] 创建模型切换按钮
- [ ] 添加配置编辑表单
- [ ] 实现自定义模型添加界面

#### 2.4 前端功能实现
- [ ] 实现模型数据加载和显示
- [ ] 添加模型切换功能
- [ ] 实现模型连接测试
- [ ] 添加配置编辑功能
- [ ] 实现自定义模型管理
- [ ] 添加状态刷新功能
- [ ] 实现消息提示系统

### 第三阶段：高级功能（预计：2天）

#### 3.1 连接测试功能
- [ ] 实现模型API连接测试
- [ ] 添加连接状态缓存
- [ ] 实现批量状态检测
- [ ] 添加测试超时处理
- [ ] 实现状态自动刷新

#### 3.2 安全功能
- [ ] 实现API密钥加密存储
- [ ] 添加配置文件权限管理
- [ ] 实现密钥显示/隐藏功能
- [ ] 添加安全配置验证

#### 3.3 用户体验优化
- [ ] 实现加载状态指示
- [ ] 添加操作确认对话框
- [ ] 实现错误处理和恢复
- [ ] 添加快捷键支持
- [ ] 实现主题切换（深色/浅色）

### 第四阶段：部署和优化（预计：1-2天）

#### 4.1 安装和部署
- [ ] 创建安装脚本
- [ ] 实现全局安装支持
- [ ] 添加自动启动功能
- [ ] 创建卸载脚本
- [ ] 实现配置迁移

#### 4.2 性能优化
- [ ] 实现配置缓存
- [ ] 添加API响应缓存
- [ ] 优化界面加载速度
- [ ] 实现懒加载

#### 4.3 文档和测试
- [ ] 编写用户手册
- [ ] 创建API文档
- [ ] 添加单元测试
- [ ] 实现集成测试
- [ ] 创建演示视频

## 🔧 技术实现细节

### 配置管理策略

```json
{
  "models": {
    "claude": {
      "name": "Claude",
      "provider": "Anthropic",
      "baseUrl": "https://api.anthropic.com",
      "apiKey": "",
      "apiKeyName": "ANTHROPIC_API_KEY",
      "defaultModel": "claude-3-5-sonnet-20241022",
      "description": "Anthropic Claude API",
      "isCustom": false
    },
    "kimi": {
      "name": "Kimi",
      "provider": "Moonshot",
      "baseUrl": "https://api.moonshot.cn/v1",
      "apiKey": "",
      "apiKeyName": "ANTHROPIC_API_KEY",
      "defaultModel": "kimi-latest",
      "description": "Moonshot Kimi API",
      "isCustom": false
    }
  },
  "activeModel": "claude",
  "settings": {
    "autoTest": true,
    "theme": "auto"
  }
}
```

### API密钥安全存储

- 使用AES-256加密算法
- 密钥派生自系统用户信息和主密码
- 配置文件权限设置为600（仅所有者可读写）
- 支持密钥显示/隐藏切换

### 环境变量管理

```bash
# 切换模型时执行的shell操作
export ANTHROPIC_API_KEY="model-specific-api-key"
export ANTHROPIC_BASE_URL="model-specific-base-url"
# 可选：设置特定模型
export ANTHROPIC_MODEL="model-name"
```

### 错误处理机制

- API连接失败自动重试（最多3次）
- 配置错误提示和恢复建议
- 网络超时处理（默认30秒）
- 权限错误自动修复尝试

## 📱 界面设计规范

### Apple风格设计原则

- **色彩系统**: 使用Apple官方色彩规范
- **圆角设计**: 卡片圆角12-16px，按钮圆角8-12px
- **阴影效果**: 柔和的阴影层次，营造深度感
- **字体系统**: 使用-apple-system字体族
- **动画效果**: 流畅的过渡动画，0.2-0.3秒持续时间

### 响应式布局

- **桌面端**: 1200px最大宽度，网格布局
- **平板端**: 768px断点，双列布局
- **手机端**: 375px断点，单列布局
- **触摸优化**: 按钮最小44px，防止误触

## 🚀 开发优先级

### 高优先级（MVP）
1. 核心命令行功能（切换、列表、配置）
2. 内置模型支持（Claude、Kimi、DeepSeek）
3. 基础Web界面（模型显示和切换）
4. 配置管理和安全存储

### 中优先级
1. 完整模型支持（Gemini、Qwen、GLM、Ollama）
2. 高级Web界面功能（编辑、测试、搜索）
3. 自定义模型管理
4. 连接测试和状态监控

### 低优先级
1. 主题切换和个性化
2. 高级安全功能
3. 性能优化和缓存
4. 扩展插件支持

## 📊 预期开发时间线

- **总预计时间**: 8-11个工作日
- **第一阶段**: 3-4天（核心功能）
- **第二阶段**: 2-3天（Web界面）
- **第三阶段**: 2天（高级功能）
- **第四阶段**: 1-2天（部署优化）

## 🔍 风险评估和应对

### 技术风险
- **API兼容性问题**: 部分模型API可能不完全兼容
- **解决方案**: 实现适配层，处理API差异

### 安全风险
- **API密钥泄露**: 配置文件可能被未授权访问
- **解决方案**: 强加密存储，文件权限控制

### 用户体验风险
- **配置复杂性**: 用户可能觉得配置过程复杂
- **解决方案**: 提供配置向导和智能默认值

---

**下一步**: 等待用户确认开发方案，如无异议将按照此计划开始开发。有任何修改建议请提出，我会相应调整计划。