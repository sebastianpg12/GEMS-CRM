<template>
  <div class="fixed bottom-4 right-4 z-[9999]" data-chat-widget>
    <div class="bg-red-500 text-white p-2 rounded mb-2 text-xs">
      DEBUG: ChatWidget OK - Puerto 5174
    </div>
    
    <!-- Chat Toggle Button -->
    <button
      @click="toggleChat"
      class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-110"
      :class="{ 'animate-bounce': chatStore.unreadTotal > 0 }"
    >
      <i class="fas fa-comments text-xl"></i>
      <span 
        v-if="chatStore.unreadTotal > 0"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse"
      >
        {{ chatStore.unreadTotal > 99 ? '99+' : chatStore.unreadTotal }}
      </span>
    </button>

    <!-- Chat Widget -->
    <div
      v-if="showWidget"
      class="fixed bottom-20 right-4 flex flex-col bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden z-[9998]"
      style="width: 380px; height: 600px;"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <i class="fas fa-comments text-white text-xl"></i>
          <div>
            <h3 class="text-white font-semibold">Chat GEMS</h3>
            <p class="text-purple-100 text-xs">
              Sistema de mensajería interno
            </p>
          </div>
        </div>
        
        <button
          @click="toggleChat"
          class="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white/10"
          title="Cerrar"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 flex">
        <!-- Sidebar with Chats -->
        <div class="w-32 bg-gray-800/50 border-r border-gray-700 flex flex-col">
          <!-- Chat List -->
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
            <!-- Chat General -->
            <div class="relative p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-700/50 group bg-purple-600/30 border border-purple-500/50">
              <div class="flex justify-center mb-1">
                <div class="relative">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600">
                    G
                  </div>
                  <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    3
                  </span>
                </div>
              </div>
              <p class="text-xs text-center text-white transition-colors truncate">
                General
              </p>
            </div>
            
            <!-- Chat de Equipo -->
            <div class="relative p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-700/50 group bg-gray-700/30">
              <div class="flex justify-center mb-1">
                <div class="relative">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-green-500 to-green-600">
                    E
                  </div>
                </div>
              </div>
              <p class="text-xs text-center text-gray-300 group-hover:text-white transition-colors truncate">
                Equipo
              </p>
            </div>

            <!-- Chat de Marketing -->
            <div class="relative p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-700/50 group bg-gray-700/30">
              <div class="flex justify-center mb-1">
                <div class="relative">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600">
                    M
                  </div>
                  <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    1
                  </span>
                </div>
              </div>
              <p class="text-xs text-center text-gray-300 group-hover:text-white transition-colors truncate">
                Marketing
              </p>
            </div>
          </div>
        </div>

        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col">
          <!-- Chat Header -->
          <div class="p-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600">
                G
              </div>
              <div>
                <h4 class="text-white font-medium text-sm">Chat General</h4>
                <p class="text-gray-400 text-xs">5 miembros en línea</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button class="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700/50" title="Configuración">
                <i class="fas fa-cog text-sm"></i>
              </button>
            </div>
          </div>
          
          <!-- Messages Area -->
          <div class="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-900/20">
            <!-- Mensaje del sistema -->
            <div class="flex justify-center">
              <div class="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs">
                Sistema de chat GEMS iniciado
              </div>
            </div>

            <!-- Mensaje de ejemplo 1 -->
            <div class="flex justify-start">
              <div class="max-w-[70%] group">
                <div class="bg-gray-700 text-gray-100 px-4 py-2 rounded-2xl rounded-bl-lg">
                  <p class="text-xs font-medium mb-1 text-purple-300">Admin</p>
                  <p class="text-sm">¡Bienvenidos al nuevo sistema de chat interno de GEMS! 🎉</p>
                  <div class="text-xs mt-1 opacity-70 text-gray-400">
                    10:30 AM
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Mensaje de ejemplo 2 -->
            <div class="flex justify-start">
              <div class="max-w-[70%] group">
                <div class="bg-gray-700 text-gray-100 px-4 py-2 rounded-2xl rounded-bl-lg">
                  <p class="text-xs font-medium mb-1 text-green-300">Manager</p>
                  <p class="text-sm">Perfecto! Esto va a mejorar mucho nuestra comunicación interna.</p>
                  <div class="text-xs mt-1 opacity-70 text-gray-400">
                    10:32 AM
                  </div>
                </div>
              </div>
            </div>

            <!-- Mensaje propio de ejemplo -->
            <div class="flex justify-end">
              <div class="max-w-[70%] group">
                <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-2xl rounded-br-lg">
                  <p class="text-sm">¡Excelente! ¿Cuándo estará completamente funcional?</p>
                  <div class="text-xs mt-1 opacity-70 text-purple-200">
                    10:35 AM
                    <i class="fas fa-check-double ml-1 text-blue-300"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Indicador de que alguien está escribiendo -->
            <div class="flex justify-start">
              <div class="bg-gray-700 rounded-2xl px-4 py-2 max-w-[70%]">
                <div class="flex items-center gap-2">
                  <div class="flex gap-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                  <span class="text-xs text-gray-400">
                    Admin está escribiendo...
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-3 bg-gray-800/50 border-t border-gray-700">
            <div class="mb-2 text-xs text-center text-yellow-400 bg-yellow-400/10 py-2 rounded-lg">
              ⚡ Sistema en desarrollo - Próximamente mensajes en tiempo real
            </div>
            
            <div class="flex items-end gap-2">
              <button
                class="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                title="Emojis (próximamente)"
              >
                <i class="fas fa-smile"></i>
              </button>

              <div class="flex-1 relative">
                <textarea
                  v-model="demoMessage"
                  placeholder="Escribe un mensaje..."
                  class="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  rows="1"
                  @keydown.enter.prevent="sendDemoMessage"
                ></textarea>
              </div>

              <button
                @click="sendDemoMessage"
                :disabled="!demoMessage.trim()"
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-2 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useAuthStore } from '../../stores/auth'

const chatStore = useChatStore()
const authStore = useAuthStore()
const showWidget = ref(false)
const demoMessage = ref('')

console.log('💬 CHATWIDGET SCRIPT CARGADO')

const toggleChat = () => {
  console.log('🔄 Toggle chat clicked, showWidget actual:', showWidget.value)
  showWidget.value = !showWidget.value
  console.log('🔄 Toggle chat después:', showWidget.value)
  chatStore.toggleChatWidget()
}

const sendDemoMessage = () => {
  if (!demoMessage.value.trim()) return
  
  // Simular envío de mensaje
  console.log('📨 Mensaje demo enviado:', demoMessage.value)
  
  // Limpiar input
  demoMessage.value = ''
  
  // Mostrar notificación
  // TODO: Mostrar mensaje en la lista cuando esté el backend funcionando
}

onMounted(async () => {
  console.log('🎯 ===== CHATWIDGET MONTADO =====')
  console.log('🎯 Elemento montado correctamente')
  console.log('🎯 authStore:', authStore)
  console.log('🎯 chatStore:', chatStore)
  console.log('🎯 authStore.isAuthenticated:', authStore.isAuthenticated)
  console.log('🎯 showWidget inicial:', showWidget.value)
  
  // Verificar que el elemento esté en el DOM
  setTimeout(() => {
    const element = document.querySelector('[data-chat-widget]')
    console.log('🎯 Elemento en DOM:', !!element)
    if (element) {
      console.log('🎯 Estilos del elemento:', window.getComputedStyle(element))
      console.log('🎯 Posición del elemento:', element.getBoundingClientRect())
    }
  }, 500)
  
  if (authStore.isAuthenticated) {
    console.log('🎯 Usuario autenticado, inicializando chat...')
    try {
      await chatStore.initialize()
      console.log('🎯 Chat inicializado exitosamente')
    } catch (error) {
      console.log('⚠️ Error inicializando chat (esperado sin backend):', error)
    }
  } else {
    console.log('🎯 Usuario NO autenticado')
  }
  
  console.log('🎯 ===== FIN DEBUG CHATWIDGET =====')
})

onUnmounted(() => {
  try {
    chatStore.disconnect()
  } catch (error) {
    console.log('⚠️ Error desconectando chat:', error)
  }
})
</script>
