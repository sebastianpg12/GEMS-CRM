import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/GEMS-CRM/', // Reemplaza con el nombre exacto de tu repositorio
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
