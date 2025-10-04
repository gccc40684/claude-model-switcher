const { createApp } = Vue;

createApp({
  data() {
    return {
      // UI状态
      activeTab: 'models',
      loading: true,
      error: null,
      success: null,

      // 数据
      models: {},
      activeModel: null,
      modelStatuses: {},

      // 操作状态
      switchingModel: null,
      testingModel: null,

      // 编辑状态
      editingModel: null,
      editForm: {
        name: '',
        baseUrl: '',
        apiKey: '',
        defaultModel: ''
      },

      // 添加模型状态
      showAddModel: false,
      addForm: {
        key: '',
        name: '',
        baseUrl: '',
        apiKey: '',
        defaultModel: '',
        description: ''
      },

      // 设置
      autoTest: true,
      theme: 'default'
    };
  },

  async mounted() {
    await this.loadData();
    this.loadSettings();

    // 自动刷新状态
    setInterval(() => {
      this.refreshStatuses();
    }, 30000); // 每30秒刷新一次
  },

  methods: {
    // 数据加载
    async loadData() {
      try {
        this.loading = true;
        this.error = null;

        const response = await fetch('/api/models');
        const result = await response.json();

        if (result.success) {
          this.models = result.data.models;
          this.activeModel = result.data.activeModel;

          // 初始化模型状态
          Object.keys(this.models).forEach(key => {
            this.modelStatuses[key] = 'unknown';
          });

          // 刷新状态
          await this.refreshStatuses();
        } else {
          throw new Error(result.error || 'Failed to load models');
        }
      } catch (error) {
        this.error = error.message;
        this.showMessage('error', error.message);
      } finally {
        this.loading = false;
      }
    },

    // 切换模型
    async switchModel(modelKey) {
      if (this.switchingModel || modelKey === this.activeModel) return;

      try {
        this.switchingModel = modelKey;
        this.error = null;

        const response = await fetch(`/api/models/${modelKey}/switch`, {
          method: 'POST'
        });
        const result = await response.json();

        if (result.success) {
          this.activeModel = modelKey;
          this.showMessage('success', result.message);

          // 如果开启了自动测试，测试新模型
          if (this.autoTest) {
            setTimeout(() => this.testModel(modelKey), 1000);
          }
        } else {
          throw new Error(result.message || 'Failed to switch model');
        }
      } catch (error) {
        this.error = error.message;
        this.showMessage('error', error.message);
      } finally {
        this.switchingModel = null;
      }
    },

    // 测试模型
    async testModel(modelKey) {
      if (this.testingModel) return;

      try {
        this.testingModel = modelKey;
        this.modelStatuses[modelKey] = 'testing';

        const response = await fetch(`/api/models/${modelKey}/test`, {
          method: 'POST'
        });
        const result = await response.json();

        if (result.success) {
          this.modelStatuses[modelKey] = result.data.connected ? 'connected' : 'disconnected';

          if (result.data.connected) {
            this.showMessage('success', `${this.models[modelKey].name} 连接成功`);
          } else {
            this.showMessage('warning', `${this.models[modelKey].name} 连接失败`);
          }
        } else {
          throw new Error(result.error || 'Test failed');
        }
      } catch (error) {
        this.modelStatuses[modelKey] = 'error';
        this.showMessage('error', `测试失败: ${error.message}`);
      } finally {
        this.testingModel = null;
      }
    },

    // 编辑模型
    editModel(modelKey) {
      const model = this.models[modelKey];
      this.editingModel = modelKey;
      this.editForm = {
        name: model.name,
        baseUrl: model.baseUrl,
        apiKey: '', // 不显示现有密钥
        defaultModel: model.defaultModel
      };
    },

    // 保存模型编辑
    async saveModelEdit() {
      try {
        const updateData = {
          name: this.editForm.name,
          baseUrl: this.editForm.baseUrl,
          defaultModel: this.editForm.defaultModel
        };

        // 如果输入了新密钥，才更新密钥
        if (this.editForm.apiKey.trim()) {
          updateData.apiKey = this.editForm.apiKey;
        }

        const response = await fetch(`/api/models/${this.editingModel}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        const result = await response.json();

        if (result.success) {
          this.editingModel = null;
          await this.loadData();
          this.showMessage('success', result.message);
        } else {
          throw new Error(result.error || 'Update failed');
        }
      } catch (error) {
        this.showMessage('error', error.message);
      }
    },

    // 添加自定义模型
    async addCustomModel() {
      try {
        if (!this.addForm.key || !this.addForm.name || !this.addForm.baseUrl) {
          throw new Error('请填写必填字段');
        }

        const response = await fetch('/api/models/custom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.addForm)
        });
        const result = await response.json();

        if (result.success) {
          this.showAddModel = false;
          this.resetAddForm();
          await this.loadData();
          this.showMessage('success', result.message);
        } else {
          throw new Error(result.error || 'Failed to create model');
        }
      } catch (error) {
        this.showMessage('error', error.message);
      }
    },

    // 删除自定义模型
    async deleteModel(modelKey) {
      if (!confirm(`确定要删除模型 ${this.models[modelKey].name} 吗？`)) {
        return;
      }

      try {
        const response = await fetch(`/api/models/${modelKey}`, {
          method: 'DELETE'
        });
        const result = await response.json();

        if (result.success) {
          await this.loadData();
          this.showMessage('success', result.message);
        } else {
          throw new Error(result.error || 'Delete failed');
        }
      } catch (error) {
        this.showMessage('error', error.message);
      }
    },

    // 刷新所有状态
    async refreshStatuses() {
      const statusPromises = Object.keys(this.models).map(async (key) => {
        try {
          const response = await fetch(`/api/models/${key}/test`, {
            method: 'POST'
          });
          const result = await response.json();

          if (result.success) {
            this.modelStatuses[key] = result.data.connected ? 'connected' : 'disconnected';
          } else {
            this.modelStatuses[key] = 'error';
          }
        } catch (error) {
          this.modelStatuses[key] = 'error';
        }
      });

      await Promise.all(statusPromises);
    },

    // 刷新单个状态
    refreshAll() {
      this.refreshStatuses();
      this.showMessage('success', '状态刷新完成');
    },

    // 设置管理
    loadSettings() {
      const settings = localStorage.getItem('claude-switcher-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.autoTest = parsed.autoTest ?? true;
        this.theme = parsed.theme ?? 'default';
      }
    },

    saveSettings() {
      const settings = {
        autoTest: this.autoTest,
        theme: this.theme
      };
      localStorage.setItem('claude-switcher-settings', JSON.stringify(settings));
    },

    // 工具方法
    showMessage(type, message) {
      if (type === 'success') {
        this.success = message;
        setTimeout(() => this.success = null, 3000);
      } else if (type === 'error') {
        this.error = message;
        setTimeout(() => this.error = null, 5000);
      }
    },

    getStatusColor(status) {
      switch (status) {
        case 'connected': return '#07c160';
        case 'disconnected': return '#969799';
        case 'testing': return '#ff976a';
        case 'error': return '#ee0a24';
        default: return '#c8c9cc';
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'connected': return '已连接';
        case 'disconnected': return '未连接';
        case 'testing': return '测试中';
        case 'error': return '错误';
        default: return '未知';
      }
    },

    resetAddForm() {
      this.addForm = {
        key: '',
        name: '',
        baseUrl: '',
        apiKey: '',
        defaultModel: '',
        description: ''
      };
    }
  }
}).mount('#app');