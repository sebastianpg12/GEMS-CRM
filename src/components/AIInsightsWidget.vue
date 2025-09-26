<template>
  <div class="bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-purple-500/20 animate-fade-in animation-delay-1800">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-semibold text-white flex items-center">
        <i class="fas fa-brain text-purple-400 mr-2"></i>
        Insights IA
        <span class="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
          Creativo
        </span>
      </h3>
      <button
        @click="generateInsights"
        :disabled="loading"
        class="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors duration-200 disabled:opacity-50"
        :title="loading ? 'Generando insights...' : 'Actualizar insights'"
      >
        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="text-purple-400"></i>
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="relative mb-4">
          <i class="fas fa-brain text-purple-400 text-4xl animate-bounce"></i>
          <div class="absolute inset-0 bg-purple-400/20 rounded-full blur-lg animate-pulse"></div>
        </div>
        <p class="text-gray-400 mb-2">Analizando datos con IA creativa...</p>
        <div class="flex justify-center space-x-1">
          <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-300"></div>
          <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-600"></div>
        </div>
      </div>
    </div>

    <div v-else-if="insights" class="space-y-4">
      <div class="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
        <div class="flex items-start gap-3">
          <i class="fas fa-lightbulb text-yellow-400 mt-1"></i>
          <div>
            <h4 class="text-white font-medium mb-1">Visión Creativa</h4>
            <p class="text-gray-300 text-sm leading-relaxed">{{ insights.summary }}</p>
          </div>
        </div>
      </div>

      <div v-if="insights.recommendations && insights.recommendations.length > 0" class="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
        <div class="flex items-start gap-3">
          <i class="fas fa-bullseye text-green-400 mt-1"></i>
          <div>
            <h4 class="text-white font-medium mb-2">Recomendaciones Innovadoras</h4>
            <ul class="space-y-1">
              <li v-for="rec in insights.recommendations" :key="rec" class="text-gray-300 text-sm flex items-start">
                <span class="text-green-400 mr-2">•</span>
                {{ rec }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="insights.trends && insights.trends.length > 0" class="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
        <div class="flex items-start gap-3">
          <i class="fas fa-chart-line text-blue-400 mt-1"></i>
          <div>
            <h4 class="text-white font-medium mb-2">Tendencias & Insights</h4>
            <ul class="space-y-1">
              <li v-for="trend in insights.trends" :key="trend" class="text-gray-300 text-sm flex items-start">
                <span class="text-blue-400 mr-2">📈</span>
                {{ trend }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <i class="fas fa-exclamation-triangle text-red-400 text-3xl mb-2"></i>
      <p class="text-gray-400 mb-2">Error al generar insights</p>
      <p class="text-red-400 text-sm">{{ error }}</p>
      <button
        @click="generateInsights"
        class="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 transition-colors duration-200"
      >
        Reintentar
      </button>
    </div>

    <div v-else class="text-center py-8 text-gray-400">
      <i class="fas fa-brain text-3xl mb-2 block"></i>
      <p>Haz clic en el botón para generar insights con IA</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  useClientsStore,
  useActivitiesStore,
  usePaymentsStore,
  useIssuesStore,
  useTeamStore
} from '../stores'

interface InsightsData {
  summary: string
  recommendations: string[]
  trends: string[]
}

const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const paymentsStore = usePaymentsStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const loading = ref(false)
const insights = ref<InsightsData | null>(null)
const error = ref('')

// API Key (misma que en ProspectAIForm)
const API_KEY = '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'

// Cache key for localStorage
const CACHE_KEY = 'crm_ai_insights_cache'
const CACHE_DURATION = 4 * 60 * 60 * 1000 // 4 hours in milliseconds

// Cache functions
const getCachedInsights = (): InsightsData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      const now = Date.now()
      if (now - parsed.timestamp < CACHE_DURATION) {
        return parsed.data
      } else {
        localStorage.removeItem(CACHE_KEY)
      }
    }
  } catch (error) {
    console.warn('Error reading insights cache:', error)
  }
  return null
}

const setCachedInsights = (data: InsightsData): void => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Error caching insights:', error)
  }
}

const generateInsights = async () => {
  loading.value = true
  error.value = ''
  
  // Check cache first
  const cached = getCachedInsights()
  if (cached) {
    insights.value = cached
    loading.value = false
    return
  }
  
  insights.value = null

  try {
    // Preparar datos para el análisis con más detalle
    const data = {
      clients: {
        total: clientsStore.clients.length,
        recent: clientsStore.clients.filter((c: any) => {
          const createdDate = new Date(c.createdAt || c.date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return createdDate > weekAgo
        }).length
      },
      activities: {
        total: activitiesStore.activities.length,
        pending: activitiesStore.activities.filter((a: any) => a.status === 'pending').length,
        completed: activitiesStore.activities.filter((a: any) => a.status === 'completed').length,
        overdue: activitiesStore.activities.filter((a: any) => a.status === 'overdue').length,
        inProgress: activitiesStore.activities.filter((a: any) => a.status === 'in-progress').length
      },
      payments: {
        totalRevenue: paymentsStore.totalRevenue,
        recentPayments: paymentsStore.payments?.slice(0, 10) || []
      },
      issues: {
        total: issuesStore.issues.length,
        open: issuesStore.issues.filter((i: any) => i.status === 'open').length,
        closed: issuesStore.issues.filter((i: any) => i.status === 'closed').length
      },
      team: {
        total: teamStore.members.length,
        active: teamStore.members.filter((m: any) => m.isActive).length
      }
    }

    // Crear prompt más específico y creativo para GPT-3.5-turbo
    const prompt = `Como analista de negocio creativo y experto en CRM, analiza estos datos y genera insights accionables y creativos:

DATOS ACTUALES DEL CRM:
• ${data.clients.total} clientes totales (${data.clients.recent} nuevos esta semana)
• ${data.activities.total} actividades (${data.activities.pending} pendientes, ${data.activities.completed} completadas, ${data.activities.overdue} vencidas, ${data.activities.inProgress} en progreso)
• Ingresos totales: $${data.payments.totalRevenue.toLocaleString()}
• ${data.issues.total} casos (${data.issues.open} abiertos, ${data.issues.closed} cerrados)
• Equipo: ${data.team.active} miembros activos de ${data.team.total} totales

GENERA UNA ANÁLISIS CREATIVO que incluya:
1. Un resumen ejecutivo creativo (máximo 2 líneas) con una metáfora o analogía
2. 3-4 recomendaciones específicas, medibles y creativas para mejorar el rendimiento
3. 2-3 tendencias o insights únicos que destaquen patrones interesantes

Usa un tono profesional pero creativo, enfócate en oportunidades de crecimiento y sé específico con números cuando sea relevante.`

    // Llamada a OpenAI API usando GPT-3.5-turbo (más económico)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un analista de negocio creativo especializado en CRM. Proporciona insights accionables, creativos y específicos con un toque de innovación.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8 // Más creativo que el anterior
      })
    })

    if (!response.ok) {
      throw new Error('Error en la API de OpenAI')
    }

    const result = await response.json()

    if (!result.choices || !result.choices[0]?.message?.content) {
      throw new Error('Respuesta inválida de la IA')
    }

    // Parsear la respuesta de la IA de manera más inteligente
    const aiResponse = result.choices[0].message.content

    // Extraer secciones usando patrones más flexibles
    const sections = aiResponse.split('\n\n').filter((s: string) => s.trim().length > 20)
    
    let summary = ''
    let recommendations: string[] = []
    let trends: string[] = []

    sections.forEach((section: string) => {
      const lowerSection = section.toLowerCase()
      if (lowerSection.includes('resumen') || lowerSection.includes('ejecutivo') || sections.indexOf(section) === 0) {
        summary = section.replace(/^(resumen ejecutivo|resumen|análisis)[:.]?\s*/i, '').trim()
      } else if (lowerSection.includes('recomendacion') || lowerSection.includes('sugerencia')) {
        const recs = section.split('\n').filter((line: string) =>
          line.trim().match(/^[-•*\d+.\s]*[a-zA-Z]/) && line.trim().length > 15
        ).map((line: string) => line.replace(/^[-•*\d+.\s]*/, '').trim())
        recommendations = recs.slice(0, 4)
      } else if (lowerSection.includes('tendencia') || lowerSection.includes('insight') || lowerSection.includes('patrón')) {
        const trnds = section.split('\n').filter((line: string) =>
          line.trim().match(/^[-•*\d+.\s]*[a-zA-Z]/) && line.trim().length > 15
        ).map((line: string) => line.replace(/^[-•*\d+.\s]*/, '').trim())
        trends = trnds.slice(0, 3)
      }
    })

    // Fallback si no se parsearon bien las secciones
    if (!summary && sections.length > 0) {
      summary = sections[0].substring(0, 200) // Limitar longitud
      recommendations = sections.slice(1, 4).filter((s: string) => s.length > 20).slice(0, 4)
      trends = sections.slice(4, 6).filter((s: string) => s.length > 20).slice(0, 3)
    }

    const finalInsights = {
      summary: summary || 'Tu negocio está en movimiento constante, como un río que fluye hacia el éxito.',
      recommendations: recommendations.length > 0 ? recommendations : [
        'Considera automatizar el seguimiento de actividades pendientes para mejorar la eficiencia',
        'Implementa un sistema de recordatorios inteligentes para actividades próximas a vencer',
        'Analiza los patrones de tus clientes más valiosos para replicar estrategias exitosas'
      ],
      trends: trends.length > 0 ? trends : [
        'El crecimiento de nuevos clientes indica una expansión saludable del mercado',
        'La tasa de completación de actividades muestra un equipo productivo y organizado'
      ]
    }

    insights.value = finalInsights
    setCachedInsights(finalInsights)

  } catch (err: any) {
    error.value = err.message || 'Error al generar insights'
    console.error('Error generating insights:', err)
  } finally {
    loading.value = false
  }
}

// Generar insights automáticamente al montar el componente
onMounted(() => {
  // Pequeño delay para asegurar que los stores estén cargados
  setTimeout(() => {
    generateInsights()
  }, 2000)
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.animation-delay-1800 {
  animation-delay: 1.8s;
}
</style>