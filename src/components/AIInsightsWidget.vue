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
        @click="generateInsights(false)"
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
        @click="generateInsights(false)"
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

// Datos por defecto para mostrar inmediatamente
const defaultInsights: InsightsData = {
  summary: 'Tu negocio está en constante evolución, transformando oportunidades en resultados tangibles.',
  recommendations: [
    'Optimiza el seguimiento de actividades pendientes para aumentar la productividad del equipo',
    'Implementa estrategias de retención basadas en el análisis de clientes recurrentes',
    'Explora oportunidades de cross-selling con tus clientes más valiosos'
  ],
  trends: [
    'Crecimiento sostenido en la adquisición de nuevos clientes',
    'Mejora en la resolución eficiente de casos e incidencias',
    'Tendencia positiva en la colaboración y comunicación del equipo'
  ]
}

// API Key desde variables de entorno
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

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

const generateInsights = async (background = false) => {
  if (!background) {
    loading.value = true
  }
  error.value = ''
  
  // Check cache first
  const cached = getCachedInsights()
  if (cached) {
    insights.value = cached
    if (!background) {
      loading.value = false
    }
    return
  }
  
  // Solo limpiar insights si no es background (click manual)
  if (!background) {
    insights.value = null
  }

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

    // Crear prompt más conciso para respuesta más rápida
    const prompt = `Analiza estos datos CRM y genera insights:

DATOS:
• ${data.clients.total} clientes (${data.clients.recent} nuevos esta semana)
• ${data.activities.total} actividades (${data.activities.pending} pendientes, ${data.activities.completed} completadas)
• Ingresos: $${data.payments.totalRevenue.toLocaleString()}
• ${data.issues.total} casos (${data.issues.open} abiertos)
• Equipo: ${data.team.active}/${data.team.total} activos

Proporciona:
1. Resumen creativo (1-2 líneas)
2. 3 recomendaciones específicas
3. 2-3 tendencias clave`

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
        max_tokens: 400, // Reducido para respuesta más rápida
        temperature: 0.6 // Menos creativo pero más rápido
      })
    })

    if (!response.ok) {
      throw new Error('Error en la API de OpenAI')
    }

    const result = await response.json()

    if (!result.choices || !result.choices[0]?.message?.content) {
      throw new Error('Respuesta inválida de la IA')
    }

    // Parsear respuesta de manera más simple y rápida
    const aiResponse = result.choices[0].message.content
    const lines = aiResponse.split('\n').filter((line: string) => line.trim().length > 10)
    
    let summary = ''
    let recommendations: string[] = []
    let trends: string[] = []
    let currentSection = ''

    lines.forEach((line: string) => {
      const trimmed = line.trim()
      if (trimmed.match(/^(1\.|resumen|summary)/i)) {
        currentSection = 'summary'
        summary = trimmed.replace(/^(1\.|resumen|summary)[:.]?\s*/i, '')
      } else if (trimmed.match(/^(2\.|recomendaciones?|recommendations?)/i)) {
        currentSection = 'recommendations'
      } else if (trimmed.match(/^(3\.|tendencias?|trends?|insights?)/i)) {
        currentSection = 'trends'
      } else if (currentSection === 'recommendations' && trimmed.match(/^[-•*\d+.\s]*[a-zA-Z]/)) {
        recommendations.push(trimmed.replace(/^[-•*\d+.\s]*/, ''))
      } else if (currentSection === 'trends' && trimmed.match(/^[-•*\d+.\s]*[a-zA-Z]/)) {
        trends.push(trimmed.replace(/^[-•*\d+.\s]*/, ''))
      } else if (currentSection === 'summary' && !summary.includes(trimmed.substring(0, 50))) {
        summary += ' ' + trimmed
      }
    })

    const finalInsights = {
      summary: summary || 'Tu negocio muestra un rendimiento sólido con oportunidades de crecimiento.',
      recommendations: recommendations.slice(0, 3),
      trends: trends.slice(0, 3)
    }

    insights.value = finalInsights
    setCachedInsights(finalInsights)

  } catch (err: any) {
    error.value = err.message || 'Error al generar insights'
    console.error('Error generating insights:', err)
  } finally {
    if (!background) {
      loading.value = false
    }
  }
}

// Generar insights automáticamente al montar el componente
onMounted(() => {
  // Revisar cache inmediatamente
  const cached = getCachedInsights()
  if (cached) {
    insights.value = cached
  } else {
    // Mostrar datos por defecto si no hay cache
    insights.value = defaultInsights
  }
  
  // Generar insights reales en background inmediatamente
  generateInsights(true) // true indica que es background
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