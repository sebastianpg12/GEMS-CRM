import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { injectSwalStyles } from './composables/useNotifications'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

// Inyectar estilos personalizados de SweetAlert2
injectSwalStyles()

// Configurar Vue3Toastify
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'dark',
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
} as ToastContainerOptions)

app.use(pinia)
app.use(router)
app.mount('#app')
