<template>
  <div class="flex h-[70vh] bg-gray-900 rounded-xl shadow-lg overflow-hidden">
    <!-- Lista de conversaciones -->
    <div class="w-80 min-w-[220px] max-w-[320px] bg-gray-800 border-r border-purple-500/20 p-4 overflow-y-auto">
      <div class="font-bold text-purple-300 mb-4 text-lg">Prospectos recientes</div>
      <ProspectConversationsList @select="handleSelectConversation" />
    </div>
    <!-- Área de chat/análisis -->
    <div class="flex-1 p-8 flex flex-col">
      <template v-if="selectedConversation">
        <ProspectConversationDetail :conversation="selectedConversation" @message-sent="handleMessageSent" />
      </template>
      <template v-else>
        <div class="mb-6">
          <div class="font-bold text-purple-300 text-xl mb-2">Nuevo Prospecto</div>
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-300 mb-2">Texto descriptivo del prospecto</label>
              <textarea v-model="inputText" rows="6" class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Describe el prospecto, su negocio, necesidades, etc."></textarea>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-300 mb-2">Imágenes del prospecto (opcional)</label>
              <input type="file" multiple accept="image/*" @change="handleImageUpload" class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white" />
              <div v-if="images.length" class="flex flex-wrap gap-2 mt-2">
                <img v-for="(img, i) in images" :key="i" :src="img.preview" class="w-20 h-20 object-cover rounded-lg border border-purple-500/30" />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-6">
            <button @click="analyzeProspect" :disabled="loading || !inputText" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium disabled:opacity-50">
              {{ loading ? 'Analizando...' : 'Analizar Prospecto con IA' }}
            </button>
          </div>
          <div v-if="result" class="mt-6 bg-gray-900/70 rounded-xl p-6 border border-purple-500/30">
            <h2 class="text-xl font-bold text-purple-300 mb-2">Análisis y Recomendaciones</h2>
            <div class="text-gray-200 whitespace-pre-line">{{ result }}</div>
          </div>
          <div v-if="error" class="mt-4 text-red-400">{{ error }}</div>
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

function handleSelectConversation(conversation) {
  selectedConversation.value = conversation
}

function handleMessageSent(message) {
  // Actualizar el historial local si es necesario
  if (selectedConversation.value) {
    selectedConversation.value.messages.push(message)
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
