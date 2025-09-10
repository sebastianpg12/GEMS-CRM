import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Configuración inteligente de base según el ambiente
  // - Desarrollo: '/'
  // - GitHub Pages con dominio personalizado: '/'
  // - GitHub Pages sin dominio personalizado: '/GEMS-CRM/'
  base: process.env.CUSTOM_DOMAIN === 'true' ? '/' : 
        (process.env.GITHUB_PAGES === 'true' ? '/GEMS-CRM/' : '/'),
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    // Configuración para desarrollo local
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
//testeo de subida