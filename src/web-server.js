import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ModelConfig } from './config.js';
import { ModelSwitcher } from './switcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WebServer {
  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.configManager = new ModelConfig();
    this.modelSwitcher = new ModelSwitcher();
    this.server = null;

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // 静态文件服务 - 前端资源
    this.app.use(express.static(path.join(__dirname, '../web')));
  }

  setupRoutes() {
    // API路由
    this.setupAPIRoutes();

    // 前端应用路由
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../web/index.html'));
    });
  }

  setupAPIRoutes() {
    // 获取所有模型配置
    this.app.get('/api/models', async (req, res) => {
      try {
        const models = await this.configManager.loadConfig();
        const active = await this.configManager.getActiveModel();

        res.json({
          success: true,
          data: {
            models,
            activeModel: active.model
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 切换模型
    this.app.post('/api/models/:modelName/switch', async (req, res) => {
      try {
        const { modelName } = req.params;
        const success = await this.modelSwitcher.switchModel(modelName);

        res.json({
          success,
          message: success ? `Model switched to ${modelName}` : `Failed to switch to ${modelName}`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 更新模型配置
    this.app.put('/api/models/:modelName', async (req, res) => {
      try {
        const { modelName } = req.params;
        const updates = req.body;

        const models = await this.configManager.loadConfig();

        if (!models[modelName]) {
          return res.status(404).json({
            success: false,
            error: 'Model not found'
          });
        }

        // 更新模型配置
        models[modelName] = { ...models[modelName], ...updates };

        await this.configManager.saveConfig(models);

        res.json({
          success: true,
          message: `Model ${modelName} configuration updated`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 设置自定义模型版本
    this.app.put('/api/models/:modelName/version', async (req, res) => {
      try {
        const { modelName } = req.params;
        const { modelVersion } = req.body;

        if (!modelVersion || typeof modelVersion !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Model version is required and must be a string'
          });
        }

        const success = await this.configManager.setCustomModelVersion(modelName, modelVersion.trim());

        if (success) {
          res.json({
            success: true,
            message: `Custom model version set for ${modelName}: ${modelVersion.trim()}`
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to set custom model version'
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 测试模型连接
    this.app.post('/api/models/:modelName/test', async (req, res) => {
      try {
        const { modelName } = req.params;
        const isConnected = await this.configManager.testConnection(modelName);

        res.json({
          success: true,
          data: {
            connected: isConnected,
            status: isConnected ? 'connected' : 'disconnected'
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 获取当前活动模型
    this.app.get('/api/models/active', async (req, res) => {
      try {
        const active = await this.configManager.getActiveModel();
        res.json({
          success: true,
          data: active
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 创建自定义模型
    this.app.post('/api/models/custom', async (req, res) => {
      try {
        const { name, baseUrl, apiKeyName, apiKey, defaultModel, description } = req.body;

        const models = await this.configManager.loadConfig();

        // 创建新的自定义模型
        models[name] = {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          baseUrl,
          apiKeyName: apiKeyName || 'ANTHROPIC_API_KEY',
          apiKey: apiKey || '',
          defaultModel: defaultModel || 'gpt-3.5-turbo',
          description: description || '',
          isCustom: true
        };

        await this.configManager.saveConfig(models);

        res.json({
          success: true,
          message: `Custom model ${name} created`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 删除自定义模型
    this.app.delete('/api/models/:modelName', async (req, res) => {
      try {
        const { modelName } = req.params;
        const models = await this.configManager.loadConfig();

        if (!models[modelName] || !models[modelName].isCustom) {
          return res.status(400).json({
            success: false,
            error: 'Can only delete custom models'
          });
        }

        delete models[modelName];
        await this.configManager.saveConfig(models);

        res.json({
          success: true,
          message: `Custom model ${modelName} deleted`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 获取系统状态
    this.app.get('/api/status', async (req, res) => {
      try {
        const models = await this.configManager.loadConfig();
        const active = await this.configManager.getActiveModel();

        // 获取各模型状态
        const statusPromises = Object.keys(models).map(async (modelName) => {
          try {
            const isConnected = await this.configManager.testConnection(modelName);
            return {
              name: modelName,
              connected: isConnected,
              hasApiKey: !!models[modelName].apiKey
            };
          } catch (error) {
            return {
              name: modelName,
              connected: false,
              hasApiKey: !!models[modelName].apiKey,
              error: error.message
            };
          }
        });

        const modelStatuses = await Promise.all(statusPromises);

        res.json({
          success: true,
          data: {
            activeModel: active.model,
            models: modelStatuses,
            timestamp: Date.now()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`🚀 Claude Code AI Model Hub Web UI`);
          console.log(`📱 Server running at: http://localhost:${this.port}`);
          console.log(`🌐 API endpoints available at: http://localhost:${this.port}/api/`);
          console.log('\n📋 Available API endpoints:');
          console.log('  GET  /api/models          - Get all model configurations');
          console.log('  POST /api/models/:name/switch - Switch to model');
          console.log('  PUT  /api/models/:name    - Update model configuration');
          console.log('  POST /api/models/:name/test  - Test model connection');
          console.log('  GET  /api/models/active   - Get active model');
          console.log('  POST /api/models/custom   - Create custom model');
          console.log('  DELETE /api/models/:name  - Delete custom model');
          console.log('  GET  /api/status          - Get system status');
          resolve(this.server);
        }
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Web server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export default WebServer;