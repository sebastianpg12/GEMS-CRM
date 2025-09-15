
<template>
  <div class="flex flex-col h-full relative items-center justify-center" style="min-height: 100vh;">
    <!-- Fondo dinámico futurista -->
    <div class="absolute inset-0 z-0 pointer-events-none" style="background: radial-gradient(ellipse at 60% 40%, #7c3aed55 0%, #ec489955 60%, #18181b 100%); filter: blur(40px); opacity: 0.7;"></div>
    <div class="font-bold text-lg text-purple-400 mb-2 z-10 flex items-center gap-2">
      <svg class="w-6 h-6 text-pink-400 animate-pulse" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" /></svg>
      Conversación con {{ conversation.prospectName }}
    </div>
  <div class="flex-1 rounded-lg p-4 overflow-y-auto flex flex-col gap-2 z-10 prospect-chat-area" style="backdrop-filter: blur(8px); background: rgba(36, 16, 56, 0.20); max-width: 600px; min-width: 320px; width: 100%;">
      <template v-for="(msg, idx) in conversation.messages" :key="idx">
        <div class="w-full flex mb-2" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
          <div :class="msg.role === 'user' ? 'bg-gradient-to-r from-gray-700 via-purple-400 to-gray-600 text-white' : 'bg-gradient-to-r from-gray-800 via-purple-300 to-gray-700 text-white'"
            class="max-w-[70%] px-5 py-3 rounded-3xl shadow-lg text-base whitespace-pre-line relative flex items-end animate-fade-in prospect-chat-bubble"
            style="backdrop-filter: blur(2px); border: 1px solid #a78bfa33;">
            <span v-if="msg.role === 'user'" class="font-semibold mr-2 flex items-center">
              <svg class="w-5 h-5 text-blue-300 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg> Tú:
            </span>
            <span v-else class="font-semibold mr-2 flex items-center">
              <svg class="w-5 h-5 text-pink-300 mr-1" fill="currentColor" viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="12" rx="6" /></svg> IA:
            </span>
            <span class="block w-full whitespace-pre-line" v-html="formatMessage(msg)"></span>
            <span class="block text-xs text-gray-200 mt-2 ml-2">{{ formatDate(msg.timestamp) }}</span>
          </div>
        </div>
        <!-- Separador visual entre mensajes de usuario y IA -->
        <div v-if="idx < conversation.messages.length - 1 && msg.role !== conversation.messages[idx + 1].role" class="w-full flex justify-center">
          <div class="h-0.5 w-1/2 bg-gray-300 opacity-40 rounded my-1"></div>
        </div>
      </template>
    </div>
    <div class="flex gap-2 mt-4 z-10">
      <input
        type="text"
        v-model="input"
        class="flex-1 bg-gray-800/80 text-white rounded-xl px-4 py-3 border border-purple-500/30 shadow-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
        placeholder="Escribe un mensaje o agrega contexto..."
        :disabled="sending"
      />
      <button
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform duration-150"
        @click="sendMessage"
        :disabled="sending"
      >
        <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        Enviar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
function formatMessage(msg) {
  if (msg.role === 'assistant') {
    // Separar sugerencias, diagnóstico y mensaje para WhatsApp si existen
    let content = msg.content
    content = content.replace(/(Diagnóstico de falencias y oportunidades:)/g, '<b>$1</b>')
    content = content.replace(/(Estrategias para abordarlo:)/g, '<b>$1</b>')
    content = content.replace(/(Un mensaje para WhatsApp:)/g, '<b>$1</b>')
    content = content.replace(/(Sugerencias de servicios de anuncios, redes sociales y automatización:)/g, '<b>$1</b>')
    content = content.replace(/(Ejemplos de casos de éxito similares:)/g, '<b>$1</b>')
    return content
  }
  return msg.content
}
import { ref } from 'vue'
const props = defineProps({
  conversation: Object
})
const emit = defineEmits(['message-sent'])
const input = ref('')
const sending = ref(false)
function formatDate(ts: string | number) {
  const d = new Date(ts)
  return d.toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
}
async function sendMessage() {
  if (!input.value.trim()) return
  sending.value = true
  try {
    const res = await fetch(`/api/prospects/${props.conversation._id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: input.value })
    })
    const data = await res.json()
    emit('message-sent', data.messages[data.messages.length - 1])
    input.value = ''
  } catch (e) {
    alert('Error enviando mensaje')
  }
  sending.value = false
}
</script>

<style scoped>
  .prospect-chat-area {
    margin: 0 auto;
    box-shadow: 0 2px 24px 0 rgba(80,40,120,0.08);
    border-radius: 1.5rem;
    background: rgba(36, 16, 56, 0.10);
  }
  @media (max-width: 700px) {
    .prospect-chat-area {
      max-width: 98vw;
      min-width: 0;
      padding: 0.5rem;
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .prospect-chat-bubble {
    word-break: break-word;
  }
  .bg-gradient-to-r {
    background-blend-mode: multiply;
    opacity: 0.92;
  }
</style>
