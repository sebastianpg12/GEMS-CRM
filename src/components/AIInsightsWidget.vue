<template>
  <div class="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 lg:p-5 animate-fade-in animation-delay-1800">
    <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
      <h3 class="text-xs font-black text-slate-800 flex items-center tracking-tight uppercase">
        <div class="w-6 h-6 rounded bg-purple-50 flex items-center justify-center mr-2">
          <i class="fas fa-brain text-purple-500 text-[10px]"></i>
        </div>
        Insights IA
      </h3>
      <div class="flex items-center gap-2">
        <span class="text-[9px] bg-gradient-to-r from-purple-100 to-primary-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-bold uppercase tracking-wider">
          Activo
        </span>
        <button
          @click="generateInsights(false)"
          :disabled="loading"
          class="w-6 h-6 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-all duration-200 disabled:opacity-50 text-slate-500 hover:text-primary-500"
          title="Actualizar insights"
        >
          <i :class="loading ? 'fas fa-spinner fa-spin text-[10px]' : 'fas fa-sync-alt text-[10px]'"></i>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="relative mb-6 mx-auto w-16 h-16 flex items-center justify-center">
          <i class="fas fa-brain text-purple-500 text-3xl animate-bounce relative z-10"></i>
          <div class="absolute inset-0 bg-purple-100 rounded-full animate-pulse"></div>
        </div>
        <p class="text-slate-500 font-medium mb-3">Analizando datos con IA colaborativa...</p>
        <div class="flex justify-center space-x-1.5">
          <div class="w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse"></div>
          <div class="w-2.5 h-2.5 bg-primary-400 rounded-full animate-pulse animation-delay-300"></div>
          <div class="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse animation-delay-600"></div>
        </div>
      </div>
    </div>

    <div v-else-if="insights" class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
      
      <!-- Visión Creativa -->
      <div class="px-4 py-2 hover:bg-slate-50/50 transition-colors">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-5 h-5 rounded bg-amber-50 text-amber-500 flex items-center justify-center">
            <i class="fas fa-lightbulb text-[10px]"></i>
          </div>
          <h4 class="text-slate-800 font-bold text-[10px] uppercase tracking-wider">Visión</h4>
        </div>
        <p class="text-slate-500 text-[10px] font-medium leading-relaxed">{{ insights.summary }}</p>
      </div>

      <!-- Recomendaciones -->
      <div class="px-4 py-2 hover:bg-slate-50/50 transition-colors">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <i class="fas fa-bullseye text-[10px]"></i>
          </div>
          <h4 class="text-slate-800 font-bold text-[10px] uppercase tracking-wider">Recomendaciones</h4>
        </div>
        <div v-if="insights.recommendations && insights.recommendations.length > 0">
          <ul class="space-y-1">
            <li v-for="rec in insights.recommendations" :key="rec" class="text-slate-500 text-[10px] flex items-start font-medium leading-tight">
              <span class="text-emerald-400 mr-2 mt-[2px]"><i class="fas fa-circle text-[4px]"></i></span>
              <span>{{ rec }}</span>
            </li>
          </ul>
        </div>
        <div v-else class="text-slate-400 text-[10px] italic">
          Generando...
        </div>
      </div>

      <!-- Tendencias -->
      <div class="px-4 py-2 hover:bg-slate-50/50 transition-colors">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-5 h-5 rounded bg-sky-50 text-sky-500 flex items-center justify-center">
            <i class="fas fa-chart-line text-[10px]"></i>
          </div>
          <h4 class="text-slate-800 font-bold text-[10px] uppercase tracking-wider">Tendencias</h4>
        </div>
        <div v-if="insights.trends && insights.trends.length > 0">
          <ul class="space-y-1">
            <li v-for="trend in insights.trends" :key="trend" class="text-slate-500 text-[10px] flex items-start font-medium leading-tight">
              <span class="text-sky-400 mr-2 mt-[2px]"><i class="fas fa-circle text-[4px]"></i></span>
              <span>{{ trend }}</span>
            </li>
          </ul>
        </div>
        <div v-else class="text-slate-400 text-[10px] italic">
          Analizando...
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-red-500">
        <i class="fas fa-exclamation-triangle text-2xl"></i>
      </div>
      <p class="text-slate-700 font-bold mb-1">Inconveniente detectado</p>
      <p class="text-red-500 text-sm font-medium">{{ error }}</p>
      <button
        @click="generateInsights(false)"
        class="mt-5 px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-slate-700 font-bold transition-all duration-200 active:scale-[0.98]"
      >
        <i class="fas fa-sync-alt mr-2 text-slate-400"></i>Reintentar Análisis
      </button>
    </div>

    <div v-else class="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
        <i class="fas fa-brain text-2xl"></i>
      </div>
      <p class="font-medium">Inicia un análisis con IA para revelar el potencial de tus datos</p>
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
  
  // Verificar API key
  if (!API_KEY) {
    error.value = 'API key de OpenAI no configurada'
    console.error('OpenAI API key not found in environment variables')
    if (!background) {
      loading.value = false
    }
    return
  }
  
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

    // Parsear respuesta de manera más robusta
    const aiResponse = result.choices[0].message.content
    console.log('Respuesta de IA:', aiResponse)

    const lines = aiResponse.split('\n').filter((line: string) => line.trim().length > 0)

    let summary = ''
    let recommendations: string[] = []
    let trends: string[] = []
    let currentSection = ''

    lines.forEach((line: string) => {
      const trimmed = line.trim()

      // Detectar secciones por patrones comunes
      if (trimmed.match(/^(1\.|resumen|summary|visión|overview)/i)) {
        currentSection = 'summary'
        summary = trimmed.replace(/^(1\.|resumen|summary|visión|overview)[:.]?\s*/i, '')
      } else if (trimmed.match(/^(2\.|recomendaciones?|recommendations?|sugerencias|suggestions)/i)) {
        currentSection = 'recommendations'
      } else if (trimmed.match(/^(3\.|tendencias?|trends?|insights?|patrones)/i)) {
        currentSection = 'trends'
      } else if (currentSection === 'recommendations' && trimmed.match(/^[-•*\d+.\s]*[a-zA-Z]/)) {
        // Extraer texto después de viñetas o números
        const cleanText = trimmed.replace(/^[-•*\d+.\s]*/, '').trim()
        if (cleanText.length > 10) { // Solo agregar si es significativo
          recommendations.push(cleanText)
        }
      } else if (currentSection === 'trends' && trimmed.match(/^[-•*\d+.\s]*[a-zA-Z]/)) {
        const cleanText = trimmed.replace(/^[-•*\d+.\s]*/, '').trim()
        if (cleanText.length > 10) {
          trends.push(cleanText)
        }
      } else if (currentSection === 'summary' && trimmed.length > 10) {
        // Continuar agregando al resumen si no es una nueva sección
        if (!trimmed.match(/^\d+\./) && !trimmed.match(/^(recomendaciones?|tendencias?)/i)) {
          summary += (summary ? ' ' : '') + trimmed
        }
      }
    })

    // Si no se encontraron secciones estructuradas, intentar extraer de texto libre
    if (recommendations.length === 0 || trends.length === 0) {
      // Buscar recomendaciones en el texto
      if (recommendations.length === 0) {
        const recMatches = aiResponse.match(/(?:recomendaciones?|sugerencias?)[^:]*:([\s\S]*?)(?=\n(?:tendencias?|trends?|insights?)|$)/i)
        if (recMatches) {
          const recText = recMatches[1]
          const recLines = recText.split('\n').filter((l: string) => l.trim().match(/^[-•*\d+.\s]*[a-zA-Z]/))
          recommendations = recLines.map((l: string) => l.replace(/^[-•*\d+.\s]*/, '').trim()).filter((l: string) => l.length > 10).slice(0, 3)
        }
      }

      // Buscar tendencias en el texto
      if (trends.length === 0) {
        const trendMatches = aiResponse.match(/(?:tendencias?|trends?|insights?)[^:]*:([\s\S]*?)$/i)
        if (trendMatches) {
          const trendText = trendMatches[1]
          const trendLines = trendText.split('\n').filter((l: string) => l.trim().match(/^[-•*\d+.\s]*[a-zA-Z]/))
          trends = trendLines.map((l: string) => l.replace(/^[-•*\d+.\s]*/, '').trim()).filter((l: string) => l.length > 10).slice(0, 3)
        }
      }
    }

    const finalInsights = {
      summary: summary || 'Tu negocio muestra un rendimiento sólido con oportunidades de crecimiento.',
      recommendations: recommendations.length > 0 ? recommendations : [
        'Optimiza el seguimiento de actividades pendientes',
        'Implementa estrategias de retención de clientes',
        'Explora oportunidades de cross-selling'
      ],
      trends: trends.length > 0 ? trends : [
        'Crecimiento en adquisición de nuevos clientes',
        'Mejora en resolución de casos',
        'Tendencia positiva en colaboración del equipo'
      ]
    }

    console.log('Insights finales:', finalInsights)
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