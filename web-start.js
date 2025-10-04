#!/usr/bin/env node

import WebServer from './src/web-server.js';

console.log('🚀 Starting Claude Code AI Model Hub Web UI...');
console.log('📱 Opening H5 interface at http://localhost:3000');
console.log('');

// 创建并启动Web服务器
const webServer = new WebServer(3000);

webServer.start().catch(error => {
  console.error('❌ Failed to start web server:', error);
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down web server...');
  await webServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down web server...');
  await webServer.stop();
  process.exit(0);
});

console.log('🔧 Web UI Features:');
console.log('  • 📱 Mobile-first responsive design');
console.log('  • 🎯 One-click model switching');
console.log('  • ⚙️ Visual configuration editor');
console.log('  • 📊 Real-time status monitoring');
console.log('  • 🧪 API connection testing');
console.log('  • ➕ Custom model management');
console.log('');
console.log('💡 Press Ctrl+C to stop the web server');