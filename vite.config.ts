import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Configuración inteligente de base según el ambiente
  // - Desarrollo: '/'
  // - GitHub Pages: '/GEMS-CRM/'
  // - Dominio personalizado: '/'
  base: process.env.GITHUB_PAGES === 'true' ? '/GEMS-CRM/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    // Configuración para desarrollo local
    port: 5173,
    host: true
  }
})
//testeo de subida