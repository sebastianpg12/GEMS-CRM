<!-- Componente para mostrar el estado de conexión con el backend -->
<template>
  <div class="fixed bottom-4 right-4 z-50">
    <div 
      :class="[
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg',
        connectionStatus === 'connected' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
        connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
        'bg-red-500/20 text-red-300 border border-red-500/30'
      ]"
    >
      <div class="flex items-center gap-2">
        <div 
          :class="[
            'w-2 h-2 rounded-full',
            connectionStatus === 'connected' ? 'bg-green-400' :
            connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          ]"
        ></div>
        <span>{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { API_CONFIG } from '../config/api'

const connectionStatus = ref<'connecting' | 'connected' | 'disconnected'>('connecting')
const statusText = ref('Conectando...')

let checkInterval: NodeJS.Timeout | null = null

const checkConnection = async () => {
  try {
    connectionStatus.value = 'connecting'
    statusText.value = 'Verificando conexión...'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      connectionStatus.value = 'connected'
      statusText.value = `Conectado a ${API_CONFIG.BASE_URL.includes('localhost') ? 'Local' : 'Producción'}`
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    connectionStatus.value = 'disconnected'
    statusText.value = `Sin conexión (${API_CONFIG.BASE_URL.includes('localhost') ? 'Local' : 'Producción'})`
    console.warn('Backend connection check failed:', error)
  }
}

onMounted(() => {
  // Verificar inmediatamente
  checkConnection()
  
  // Verificar cada 30 segundos
  checkInterval = setInterval(checkConnection, 30000)
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>
