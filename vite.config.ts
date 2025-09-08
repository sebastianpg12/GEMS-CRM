import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Configuración inteligente de base según el ambiente
  base: process.env.NODE_ENV === 'production' ? '/GEMS-CRM/' : '/',
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