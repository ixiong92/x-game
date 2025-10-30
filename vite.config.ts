import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 部署配置
  // 如果部署到 https://username.github.io/x-game/，设置为 '/x-game/'
  // 如果部署到根路径，设置为 '/'
  base: process.env.VITE_BASE_URL || '/x-game/',
  server: {
    // 监听所有网卡的IP地址
    host: '0.0.0.0',
    // 自动打开浏览器
    open: false,
    // 严格端口检查
    strictPort: false,
  }
})
