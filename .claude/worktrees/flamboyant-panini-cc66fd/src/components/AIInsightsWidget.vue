<template>
  <section class="ai-panel">
    <div class="ai-header">
      <div class="flex min-w-0 items-center gap-3">
        <div class="ai-mark">
          <i class="fas fa-brain text-[13px]"></i>
        </div>
        <div class="min-w-0">
          <p class="ai-eyebrow">IA personalizada</p>
          <h3 class="truncate text-sm font-black text-slate-900">
            Insights para {{ firstName }}
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          v-if="insights"
          type="button"
          class="ai-expand"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Ver menos' : 'Ver más' }}
        </button>
        <button
          @click="generateInsights(false)"
          :disabled="loading"
          class="ai-refresh"
          title="Actualizar insights"
        >
          <i :class="loading ? 'fas fa-spinner fa-spin text-[11px]' : 'fas fa-sync-alt text-[11px]'"></i>
        </button>
      </div>
    </div>

    <div v-if="loading" class="grid gap-3 px-4 py-4 md:grid-cols-3">
      <div v-for="item in 3" :key="item" class="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div class="mb-3 h-3 w-20 animate-pulse rounded bg-slate-200"></div>
        <div class="space-y-2">
          <div class="h-2.5 animate-pulse rounded bg-slate-200"></div>
          <div class="h-2.5 w-5/6 animate-pulse rounded bg-slate-200"></div>
          <div class="h-2.5 w-2/3 animate-pulse rounded bg-slate-200"></div>
        </div>
      </div>
    </div>

    <div v-else-if="insights" class="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
      <article class="insight-block">
        <div class="insight-title text-amber-600">
          <span class="insight-icon bg-amber-50">
            <i class="fas fa-lightbulb text-[10px]"></i>
          </span>
          Lectura
        </div>
        <p
          :class="['mt-2 text-xs font-semibold leading-relaxed text-slate-600', expanded ? '' : 'line-clamp-3']"
          :title="insights.summary"
        >
          {{ insights.summary }}
        </p>
      </article>

      <article class="insight-block">
        <div class="insight-title text-emerald-600">
          <span class="insight-icon bg-emerald-50">
            <i class="fas fa-bullseye text-[10px]"></i>
          </span>
          Acciones
        </div>
        <ul v-if="insights.recommendations?.length" class="mt-2 space-y-1.5">
          <li
            v-for="rec in insights.recommendations.slice(0, 3)"
            :key="rec"
            class="flex items-start gap-2 text-xs font-semibold leading-snug text-slate-600"
            :title="rec"
          >
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400"></span>
            <span :class="expanded ? '' : 'line-clamp-2'">{{ rec }}</span>
          </li>
        </ul>
        <p v-else class="mt-2 text-xs font-semibold text-slate-400">Generando acciones...</p>
      </article>

      <article class="insight-block">
        <div class="insight-title text-sky-600">
          <span class="insight-icon bg-sky-50">
            <i class="fas fa-chart-line text-[10px]"></i>
          </span>
          Riesgos
        </div>
        <ul v-if="insights.trends?.length" class="mt-2 space-y-1.5">
          <li
            v-for="trend in insights.trends.slice(0, 2)"
            :key="trend"
            class="flex items-start gap-2 text-xs font-semibold leading-snug text-slate-600"
            :title="trend"
          >
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400"></span>
            <span :class="expanded ? '' : 'line-clamp-2'">{{ trend }}</span>
          </li>
        </ul>
        <p v-else class="mt-2 text-xs font-semibold text-slate-400">Analizando riesgos...</p>
      </article>
    </div>

    <div v-else-if="error" class="m-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-black text-rose-700">IA no disponible</p>
          <p class="mt-0.5 text-xs font-semibold text-rose-500">{{ error }}</p>
        </div>
        <button
          @click="generateInsights(false)"
          class="rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px] font-black text-rose-600"
        >
          Reintentar
        </button>
      </div>
    </div>

    <div v-else class="m-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
      <p class="text-xs font-bold text-slate-500">Inicia un análisis IA para leer tu foco operativo.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import {
  useActivitiesStore,
  useClientsStore,
  useIssuesStore,
  useTeamStore
} from '../stores'
import { API_CONFIG } from '@/config/api'

interface InsightsData {
  summary: string
  recommendations: string[]
  trends: string[]
}

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const loading = ref(false)
const insights = ref<InsightsData | null>(null)
const error = ref('')
const expanded = ref(false)

const currentUserId = computed(() => authStore.user?._id || '')
const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuario')

const currentMember = computed(() => {
  const user = authStore.user
  if (!user) return null
  return teamStore.members.find((member: any) => {
    return member._id === user._id || member.email === user.email
  }) || null
})

const userLeader = computed(() => {
  const member = currentMember.value as any
  const user = authStore.user as any
  const supervisorId = member?.supervisor || user?.supervisor
  const bySupervisor = supervisorId
    ? teamStore.members.find((item: any) => item._id === supervisorId || item.email === supervisorId)
    : null

  if (bySupervisor) return bySupervisor

  const department = member?.department || user?.department
  return teamStore.members.find((item: any) => {
    return item._id !== user?._id
      && item.department === department
      && (item.departmentRole === 'leader' || item.role === 'manager' || item.role === 'admin')
  }) || null
})

const isLeaderView = computed(() => {
  const role = authStore.user?.role
  return ['admin', 'manager'].includes(role || '') || currentMember.value?.departmentRole === 'leader'
})

const userActivities = computed(() => {
  const mine = activitiesStore.activities.filter((activity: any) => isRelatedToCurrentUser(activity))
  if (mine.length > 0 || !isLeaderView.value) return mine

  return activitiesStore.activities.filter((activity: any) => {
    const department = currentMember.value?.department || authStore.user?.department
    if (!department) return true
    return getAssignedUsers(activity).some((user: any) => user.department === department)
  })
})

const defaultInsights = computed<InsightsData>(() => {
  const overdue = countActivities(userActivities.value, (activity: any) => isPastDue(activity))
  const today = countActivities(userActivities.value, (activity: any) => {
    const date = getActivityDate(activity)
    return !!date && isSameDay(date, new Date()) && !isPastDue(activity)
  })

  return {
    summary: `${firstName.value} tiene ${userActivities.value.length} actividades en foco; ${overdue} atrasadas y ${today} para hoy.`,
    recommendations: [
      'Ordena primero las actividades atrasadas y de prioridad alta antes de abrir nuevos frentes.',
      userLeader.value?.name
        ? `Alinea bloqueos o dependencias con ${userLeader.value.name} para acelerar cierres.`
        : 'Define un responsable de apoyo cuando una tarea dependa de otra persona.',
      'Deja cada actividad con siguiente paso, fecha y cliente claro para que el seguimiento no se enfríe.'
    ],
    trends: [
      'Las tareas sin fecha o sin cliente claro pierden trazabilidad comercial rápidamente.',
      'Cuando se acumulan vencidas, conviene atacar por impacto en cliente y no solo por antigüedad.'
    ]
  }
})

const cacheKey = computed(() => {
  const latestActivity = activitiesStore.activities
    .map((activity: any) => activity.updatedAt || activity.createdAt || activity.dueDate || activity.date || '')
    .sort()
    .at(-1) || 'empty'

  return `crm_ai_insights_cache:${currentUserId.value || 'anonymous'}:${latestActivity}:${activitiesStore.activities.length}`
})

const CACHE_DURATION = 45 * 60 * 1000

const getCachedInsights = (): InsightsData | null => {
  try {
    const cached = localStorage.getItem(cacheKey.value)
    if (!cached) return null

    const parsed = JSON.parse(cached)
    if (Date.now() - parsed.timestamp < CACHE_DURATION) return parsed.data

    localStorage.removeItem(cacheKey.value)
  } catch (cacheError) {
    console.warn('Error reading insights cache:', cacheError)
  }

  return null
}

const setCachedInsights = (data: InsightsData): void => {
  try {
    localStorage.setItem(cacheKey.value, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (cacheError) {
    console.warn('Error caching insights:', cacheError)
  }
}

const parseInsights = (text: string): InsightsData => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  const findValue = (prefix: string) => {
    const line = lines.find((item) => item.toLowerCase().startsWith(prefix.toLowerCase()))
    return line?.slice(line.indexOf(':') + 1).trim()
  }

  const recommendations = lines
    .filter((line) => /^rec\d*:/i.test(line))
    .map((line) => line.slice(line.indexOf(':') + 1).trim())
    .filter((line) => line.length > 5)

  const trends = lines
    .filter((line) => /^(riesgo|trend)\d*:/i.test(line))
    .map((line) => line.slice(line.indexOf(':') + 1).trim())
    .filter((line) => line.length > 5)

  return {
    summary: findValue('Resumen:') || defaultInsights.value.summary,
    recommendations: recommendations.length ? recommendations : defaultInsights.value.recommendations,
    trends: trends.length ? trends : defaultInsights.value.trends
  }
}

const generateInsights = async (background = false) => {
  if (!background) {
    loading.value = true
    insights.value = null
  }

  error.value = ''

  if (background) {
    const cached = getCachedInsights()
    if (cached) {
      insights.value = cached
      return
    }
  }

  try {
    const data = buildAIContext()
    const prompt = buildPrompt(data)

    const response = await fetch(`${API_CONFIG.BASE_URL}/ai/gemini-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `Error de IA (${response.status})`)
    }

    const result = await response.json()
    if (!result.text) throw new Error('La IA no devolvió contenido')

    const finalInsights = parseInsights(result.text)
    insights.value = finalInsights
    setCachedInsights(finalInsights)
  } catch (insightError: any) {
    console.error('Gemini Error:', insightError)
    if (!background) error.value = insightError?.message || 'No se pudo conectar con la IA'
    if (!insights.value) insights.value = defaultInsights.value
  } finally {
    if (!background) loading.value = false
  }
}

const buildAIContext = () => {
  const activities = userActivities.value
  const active = activities.filter((activity: any) => isActiveActivity(activity))
  const overdue = active.filter((activity: any) => isPastDue(activity))
  const dueToday = active.filter((activity: any) => {
    const date = getActivityDate(activity)
    return !!date && isSameDay(date, new Date()) && !isPastDue(activity)
  })
  const highPriority = active.filter((activity: any) => ['urgent', 'high'].includes(activity.priority))
  const withoutDate = active.filter((activity: any) => !getActivityDate(activity))

  return {
    user: authStore.user,
    member: currentMember.value,
    leader: userLeader.value,
    isLeader: isLeaderView.value,
    totals: {
      clients: clientsStore.clients.length,
      team: teamStore.members.length,
      casesOpen: issuesStore.issues.filter((issue: any) => issue.status === 'open' || issue.status === 'in_progress').length,
      allActivities: activitiesStore.activities.length,
      userActivities: activities.length,
      active: active.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      highPriority: highPriority.length,
      withoutDate: withoutDate.length
    },
    activityDigest: active
      .sort(compareByOperationalPriority)
      .slice(0, 14)
      .map(formatActivityForPrompt)
  }
}

const buildPrompt = (context: any) => {
  const leaderName = context.leader?.name || 'No identificado en equipo'
  const leaderRole = context.leader?.role || context.leader?.position || 'N/A'
  const activityLines = context.activityDigest.length
    ? context.activityDigest.map((item: string) => `- ${item}`).join('\n')
    : '- No hay tareas asignadas o relacionadas visibles para este usuario.'

  return `Actúa como asesor operativo y comercial dentro de un CRM.
No menciones la palabra GEMS. No inventes clientes, tareas ni líderes. Si falta un dato, dilo de forma útil.
La respuesta debe hablarle directamente al usuario por su contexto real, no al CRM en general.

USUARIO:
- Nombre: ${context.user?.name || 'Usuario'}
- Rol: ${context.user?.role || 'Miembro'}
- Cargo: ${context.user?.position || context.member?.position || 'No definido'}
- Departamento: ${context.user?.department || context.member?.department || 'General'}
- Es líder/vista de liderazgo: ${context.isLeader ? 'Sí' : 'No'}
- Líder detectado: ${leaderName} (${leaderRole})

RESUMEN DE CARGA:
- Actividades visibles totales del CRM: ${context.totals.allActivities}
- Actividades del usuario/equipo relevante: ${context.totals.userActivities}
- Activas: ${context.totals.active}
- Atrasadas: ${context.totals.overdue}
- Para hoy: ${context.totals.dueToday}
- Alta prioridad: ${context.totals.highPriority}
- Sin fecha: ${context.totals.withoutDate}
- Casos abiertos: ${context.totals.casesOpen}
- Clientes en base: ${context.totals.clients}

TAREAS Y CONTEXTO:
${activityLines}

FORMATO ESTRICTO:
Resumen: [1 frase ejecutiva, personalizada al usuario y su carga real]
Rec1: [acción concreta para las próximas 2 horas]
Rec2: [acción concreta coordinando con líder/equipo si aplica]
Rec3: [acción concreta para mejorar seguimiento y cierre]
Riesgo1: [riesgo operativo/comercial detectado en sus tareas]
Riesgo2: [riesgo o patrón detectado en fechas, prioridades o clientes]`
}

const isRelatedToCurrentUser = (activity: any) => {
  const user = authStore.user
  if (!user) return false
  if (activity.createdBy === user._id) return true
  if (activity.createdByUser?._id === user._id || activity.createdByUser?.email === user.email) return true
  if (activity.assignedToUser?._id === user._id || activity.assignedToUser?.email === user.email) return true

  return getAssignedUsers(activity).some((assigned: any) => {
    const assignedId = getEntityId(assigned)
    return assignedId === user._id || assigned?.email === user.email
  })
}

const getAssignedUsers = (activity: any) => {
  const assigned = activity.assignedTo
  if (!assigned) return activity.assignedToUser ? [activity.assignedToUser] : []
  return Array.isArray(assigned) ? assigned : [assigned]
}

const getEntityId = (entity: any) => {
  if (!entity) return ''
  if (typeof entity === 'string') return entity
  return entity._id || entity.id || ''
}

const formatActivityForPrompt = (activity: any) => {
  const clientName = getClientName(activity)
  const assignedNames = getAssignedUsers(activity)
    .map((assigned: any) => {
      if (typeof assigned === 'string') {
        return teamStore.members.find((member: any) => member._id === assigned)?.name || assigned
      }
      return assigned?.name || assigned?.email
    })
    .filter(Boolean)
    .join(', ') || 'Sin asignar'

  const description = cleanText(activity.description || '').slice(0, 110)
  return [
    activity.title || 'Sin título',
    `cliente: ${clientName}`,
    `estado: ${activity.status || 'pendiente'}`,
    `prioridad: ${activity.priority || 'media'}`,
    `vence: ${formatDue(activity)}`,
    `asignado: ${assignedNames}`,
    description ? `contexto: ${description}` : ''
  ].filter(Boolean).join(' | ')
}

const compareByOperationalPriority = (a: any, b: any) => {
  const overdueDiff = Number(isPastDue(b)) - Number(isPastDue(a))
  if (overdueDiff) return overdueDiff

  const priorityRank: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
  const priorityDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
  if (priorityDiff) return priorityDiff

  return (getActivityDate(a)?.getTime() || Number.POSITIVE_INFINITY)
    - (getActivityDate(b)?.getTime() || Number.POSITIVE_INFINITY)
}

const countActivities = (activities: any[], predicate: (activity: any) => boolean) => {
  return activities.filter(predicate).length
}

const isActiveActivity = (activity: any) => {
  return !['completed', 'cancelled'].includes(activity.status)
}

const parseDate = (value?: string) => {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day, 23, 59, 59, 999)
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const getActivityDate = (activity: any) => {
  return parseDate(activity.dueDate || activity.date)
}

const isPastDue = (activity: any) => {
  const date = getActivityDate(activity)
  return !!date && isActiveActivity(activity) && date.getTime() < Date.now()
}

const isSameDay = (a: Date, b: Date) => {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

const formatDue = (activity: any) => {
  const date = getActivityDate(activity)
  if (!date) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date).replace('.', '')
}

const getClientName = (activity: any) => {
  const rawClient = activity.clientId
  const clientId = typeof rawClient === 'object' ? rawClient?._id : rawClient
  const client = clientsStore.clients.find((item: any) => item._id === clientId || item.id === clientId)

  return client?.company || client?.name || rawClient?.company || rawClient?.name || 'Sin cliente'
}

const cleanText = (value: string) => {
  return value.replace(/\s+/g, ' ').trim()
}

onMounted(() => {
  insights.value = getCachedInsights() || defaultInsights.value
  generateInsights(true)
})
</script>

<style scoped>
.ai-panel {
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.045);
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgb(241 245 249);
  padding: 0.66rem 1rem;
}

.ai-mark {
  display: inline-flex;
  height: 1.9rem;
  width: 1.9rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.68rem;
  border: 1px solid rgb(191 219 254);
  background: rgb(239 246 255);
  color: rgb(37 99 235);
  box-shadow: none;
}

.ai-eyebrow {
  color: rgb(100 116 139);
  font-size: 0.62rem;
  font-weight: 950;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.ai-refresh {
  display: inline-flex;
  height: 1.8rem;
  width: 1.8rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  background: white;
  color: rgb(100 116 139);
  transition: all 160ms ease;
}

.ai-expand {
  height: 1.8rem;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.7rem;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  padding: 0 0.55rem;
  font-size: 0.62rem;
  font-weight: 900;
  transition: all 160ms ease;
}

.ai-expand:hover {
  color: rgb(37 99 235);
  background: white;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.05);
}

.ai-refresh:hover {
  color: rgb(37 99 235);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
}

.insight-block {
  min-height: 7.2rem;
  padding: 0.66rem 1rem;
}

.insight-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.68rem;
  font-weight: 950;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.insight-icon {
  display: inline-flex;
  height: 1.45rem;
  width: 1.45rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.55rem;
}

.line-clamp-2,
.line-clamp-3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.line-clamp-2 {
  -webkit-line-clamp: 2;
}

.line-clamp-3 {
  -webkit-line-clamp: 3;
}
</style>
