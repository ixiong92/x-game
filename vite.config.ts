import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 监听所有网卡的IP地址
    host: '0.0.0.0',
    // 自动打开浏览器
    open: false,
    // 严格端口检查
    strictPort: false,
  }
})
