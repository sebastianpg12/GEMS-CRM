<template>
  <transition name="slide-up">
    <div
      v-if="visible && msg"
      class="fixed bottom-4 right-4 z-50 max-w-[18rem] bg-dark-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <button class="absolute top-1.5 right-1.5 p-1 text-gray-400 hover:text-white" @click="dismiss" aria-label="Cerrar">
        <XMarkIcon class="w-4 h-4" />
      </button>
      <div class="p-3 cursor-pointer" @click="openChat">
        <div class="flex items-start gap-2.5">
          <div class="relative w-8 h-8 rounded-md bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
            {{ (msg.sender?.name || '?').charAt(0).toUpperCase() }}
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-pink-500 border-2 border-dark-900"></span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 mb-0.5">
              <ChatBubbleLeftRightIcon class="w-3.5 h-3.5 text-purple-300" />
              <p class="text-[13px] text-white font-medium truncate" :title="displayRoomName">{{ displayRoomName }}</p>
              <span class="ml-auto text-[10px] text-gray-400 whitespace-nowrap">{{ timeShort }}</span>
            </div>
            <p class="text-[12px] text-purple-200 truncate">de {{ msg.sender?.name }}</p>
            <div class="mt-0.5 flex items-center gap-1.5 text-[12px] text-gray-200 min-w-0">
              <PhotoIcon v-if="previewKind==='image'" class="w-4 h-4 text-gray-300 flex-shrink-0" />
              <PaperClipIcon v-else-if="previewKind==='file'" class="w-4 h-4 text-gray-300 flex-shrink-0" />
              <span class="line-clamp-1 truncate">{{ previewText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/auth'
import { XMarkIcon, ChatBubbleLeftRightIcon, PhotoIcon, PaperClipIcon } from '@heroicons/vue/24/outline'

const chat = useChatStore()
const auth = useAuthStore()
const router = useRouter()

const visible = ref(false)
const timer = ref<number | null>(null)

const msg = computed(() => chat.lastIncomingMessage)
const room = computed(() => {
  if (!msg.value) return null
  return chat.chatRooms.find(r => r._id === msg.value!.chatRoom) || null
})
const displayRoomName = computed(() => {
  const r = room.value
  if (!r) return 'Chat'
  if (r.type === 'direct') {
    const me = auth.user?._id
    const other = r.participants.find(p => p._id !== me)
    return other?.name || r.name || 'Directo'
  }
  return r.name || 'Chat'
})
const previewKind = computed<'text'|'image'|'file'>(() => {
  if (!msg.value) return 'text'
  const hasImages = (msg.value.attachments || []).some(a => a.mimetype?.startsWith('image/'))
  const hasFiles = (msg.value.attachments || []).length > 0 && !hasImages
  if (hasImages) return 'image'
  if (hasFiles) return 'file'
  return 'text'
})
const previewText = computed(() => {
  if (!msg.value) return ''
  const text = (msg.value.content || '').trim()
  const atts = msg.value.attachments || []
  if (previewKind.value === 'image') {
    return atts.length > 1 ? `Imágenes (${atts.length})` : 'Imagen'
  }
  if (previewKind.value === 'file') {
    return atts.length > 1 ? `Archivos adjuntos (${atts.length})` : 'Archivo adjunto'
  }
  return text || 'Nuevo mensaje'
})
const timeShort = computed(() => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))

const openChat = () => {
  if (!msg.value) return
  if (room.value) {
    chat.selectRoom(room.value)
  }
  router.push('/chat')
  visible.value = false
}

const dismiss = () => {
  visible.value = false
}

watch(() => chat.lastIncomingAt, (ts) => {
  if (!ts || !msg.value) return
  // Si la ventana tiene foco y estamos fuera del chat o en otra sala, mostrar toast
  const onChatPage = location.pathname.includes('/chat')
  const viewingSameRoom = onChatPage && chat.currentRoom?._id === msg.value.chatRoom
  if (!viewingSameRoom) {
    visible.value = true
    if (timer.value) window.clearTimeout(timer.value)
  timer.value = window.setTimeout(() => { visible.value = false }, 5000)
  }
}, { immediate: true })

onUnmounted(() => { if (timer.value) window.clearTimeout(timer.value) })
</script>

<style scoped>
.slide-up-enter-active,.slide-up-leave-active{ transition: all .22s ease }
.slide-up-enter-from,.slide-up-leave-to{ opacity:0; transform: translateY(6px) }
.line-clamp-1{ display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden }
</style>
