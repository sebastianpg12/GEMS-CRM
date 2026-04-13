<template>
  <div class="flex h-[75vh] bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- Lista de conversaciones -->
    <div class="w-80 min-w-[280px] max-w-[340px] bg-slate-50 border-r border-slate-200 p-4 scroll-smooth overflow-y-auto">
      <div class="font-black text-slate-800 mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
        <i class="fas fa-history text-primary-500"></i>
        Historial de Prospectos
      </div>
      <ProspectConversationsList @select="handleSelectConversation" />
    </div>
    <!-- Área de chat/análisis -->
    <div class="flex-1 p-6 md:p-8 flex flex-col bg-white">
      <template v-if="selectedConversation">
        <ProspectConversationDetail :conversation="selectedConversation" @message-sent="handleMessageSent" />
      </template>
      <template v-else>
        <div class="mb-6 h-full flex flex-col">
          <div class="font-black text-slate-800 text-xl mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <i class="fas fa-magic text-primary-500"></i>
            Nuevo Prospecto
          </div>
          <div class="flex flex-col md:flex-row gap-6 mt-2">
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Texto descriptivo del prospecto
              </label>
              <textarea v-model="inputText" rows="6" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 shadow-sm font-medium text-sm focus:outline-none transition-all resize-y" placeholder="Describe el prospecto, su negocio, necesidades, etc."></textarea>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Imágenes del prospecto (opcional)
              </label>
              <div class="relative group cursor-pointer">
                <input type="file" multiple accept="image/*" @change="handleImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div class="w-full px-4 py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center group-hover:border-primary-400 group-hover:bg-primary-50 transition-colors">
                  <i class="fas fa-cloud-upload-alt text-3xl text-slate-300 group-hover:text-primary-400 mb-2"></i>
                  <span class="text-sm font-bold text-slate-500 group-hover:text-primary-600">Haz clic o arrastra imágenes aquí</span>
                </div>
              </div>
              <div v-if="images.length" class="flex flex-wrap gap-3 mt-4">
                <div v-for="(img, i) in images" :key="i" class="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  <img :src="img.preview" class="w-20 h-20 object-cover" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-slate-100">
            <button @click="analyzeProspect" :disabled="loading || !inputText" class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-bold disabled:opacity-50 flex items-center shadow-sm">
              <i :class="loading ? 'fas fa-circle-notch fa-spin' : 'fas fa-bolt'" class="mr-2"></i>
              {{ loading ? 'Analizando prospecto...' : 'Analizar Prospecto con IA' }}
            </button>
          </div>
          
          <div v-if="result" class="mt-6 flex-1 bg-primary-50/50 rounded-xl p-6 border border-primary-100 overflow-y-auto">
            <h2 class="text-lg font-black text-primary-800 mb-4 flex items-center border-b border-primary-200/50 pb-2">
              <i class="fas fa-chart-line mr-2 text-primary-500"></i>
              Análisis y Recomendaciones
            </h2>
            <div class="text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-line">{{ result }}</div>
          </div>
          <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-600 flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            {{ error }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProspectConversationsList from '@/features/conversations/components/ProspectConversationsListFixed.vue'
import ProspectConversationDetail from '@/features/conversations/components/ProspectConversationDetail.vue'

const selectedConversation = ref(null)

function handleSelectConversation(conversation: any) {
  selectedConversation.value = conversation
}

function handleMessageSent(message: any) {
  // Actualizar el historial local si es necesario
  if (selectedConversation.value !== null) {
    (selectedConversation.value as any).messages.push(message)
  }
}

const inputText = ref('')
const images = ref<Array<{file: File, preview: string}>>([])
const loading = ref(false)
const result = ref('')
const error = ref('')

function handleImageUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  images.value = []
  for (const file of Array.from(files)) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      images.value.push({ file, preview: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

async function analyzeProspect() {
  loading.value = true
  error.value = ''
  result.value = ''
  try {
    // Prompt para análisis y para nombre estándar
    let prompt = `Eres un asesor comercial experto en ventas B2B para micro y medianas empresas. Analiza el siguiente prospecto y genera:\n- Un diagnóstico de sus falencias y oportunidades\n- Estrategias para abordarlo\n- Un mensaje para WhatsApp\n- Sugerencias de servicios de anuncios, redes sociales y automatización\n- Ejemplos de casos de éxito similares\nProspecto:\n${inputText.value}`
  let namePrompt = `Sugiere un nombre comercial para este prospecto, siguiendo el formato: Prospecto [color] [palabra relacionada con el sector, empresa o necesidad]. El nombre debe ser profesional, relevante y fácil de identificar. Prospecto:\n${inputText.value}`
    if (images.value.length) {
      prompt += '\n\nEl prospecto incluye imágenes descriptivas.'
      namePrompt += '\n\nEl prospecto incluye imágenes descriptivas.'
    }
    // Llamada a la API de OpenAI para análisis
    const apiKey = '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'
    const analysisRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Eres un asesor comercial experto en ventas B2B para micro y medianas empresas.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    })
    const analysisData = await analysisRes.json()
    if (!analysisData.choices || !analysisData.choices[0]?.message?.content) {
      throw new Error('No se recibió respuesta válida de la IA')
    }
    result.value = analysisData.choices[0].message.content

    // Llamada a la API de OpenAI para nombre
    const nameRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Eres un generador de nombres comerciales creativos y estandarizados.' },
          { role: 'user', content: namePrompt }
        ],
        max_tokens: 30,
        temperature: 0.7
      })
    })
    const nameData = await nameRes.json()
    let prospectName = 'Prospecto sin nombre'
    if (nameData.choices && nameData.choices[0]?.message?.content) {
      prospectName = nameData.choices[0].message.content.trim()
    }

    // Guardar en backend
  const saveRes = await fetch('https://gems-crm-backend.onrender.com/api/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prospectName,
        company: '',
        initialMessage: inputText.value + '\n\n' + result.value
      })
    })
    if (!saveRes.ok) throw new Error('No se pudo guardar el prospecto en el historial')
    // Refrescar historial sin recargar la página
    if (typeof window !== 'undefined') {
          const event = new CustomEvent('prospect-created')
          window.dispatchEvent(event)
    }
  } catch (e: any) {
    error.value = e.message || 'Error al analizar prospecto'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
