<template>
  <main class="dashboard-shell">
    <section class="dashboard-hero">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="dashboard-eyebrow">Dashboard operativo</span>
          <span class="dashboard-chip">{{ roleLabel }}</span>
        </div>
        <h1 class="mt-1.5 text-xl font-black tracking-tight text-slate-950 lg:text-2xl">
          Hola, {{ firstName }}
        </h1>
        <p class="mt-0.5 max-w-2xl text-xs font-medium text-slate-500">
          {{ welcomeLine }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          :disabled="refreshing"
          @click="refreshDashboard"
          class="dashboard-icon-button"
          title="Actualizar dashboard"
        >
          <ArrowPathIcon :class="['h-4 w-4', refreshing ? 'animate-spin' : '']" />
        </button>
        <router-link
          v-if="authStore.canCreateActivities"
          to="/activities"
          class="dashboard-primary-action"
        >
          <PlusCircleIcon class="h-4 w-4" />
          Nueva actividad
        </router-link>
      </div>
    </section>

    <section
      v-if="availableQuickActions.length > 0"
      class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
    >
      <router-link
        v-for="action in availableQuickActions.slice(0, 5)"
        :key="action.name"
        :to="action.to"
        class="quick-action"
      >
        <span :class="['quick-action-icon', action.tone]">
          <component :is="action.icon" class="h-4 w-4" />
        </span>
        <span class="min-w-0 text-center leading-tight sm:text-left">{{ action.name }}</span>
      </router-link>
    </section>

    <section class="grid grid-cols-2 gap-3 xl:grid-cols-5">
      <PermissionGuard :permissions="['view-clients']" :fallback="false">
        <article class="metric-card">
          <div class="metric-icon bg-blue-50 text-blue-600">
            <UserGroupIcon class="h-4 w-4" />
          </div>
          <div class="min-w-0">
            <p class="metric-label">Clientes</p>
            <div class="flex items-end gap-2">
              <p class="metric-value">{{ stats.clients }}</p>
              <span class="metric-badge text-blue-700 bg-blue-50">Base</span>
            </div>
          </div>
        </article>
      </PermissionGuard>

      <PermissionGuard :permissions="['view-activities']" :fallback="false">
        <article class="metric-card">
          <div class="metric-icon bg-emerald-50 text-emerald-600">
            <ClipboardDocumentListIcon class="h-4 w-4" />
          </div>
          <div class="min-w-0">
            <p class="metric-label">Actividades</p>
            <div class="flex items-end gap-2">
              <p class="metric-value">{{ activeActivities.length }}</p>
              <span class="metric-badge text-emerald-700 bg-emerald-50">Activas</span>
            </div>
          </div>
        </article>
      </PermissionGuard>

      <PermissionGuard :permissions="['view-cases']" :fallback="false">
        <article class="metric-card">
          <div class="metric-icon bg-rose-50 text-rose-600">
            <ExclamationTriangleIcon class="h-4 w-4" />
          </div>
          <div class="min-w-0">
            <p class="metric-label">Casos</p>
            <div class="flex items-end gap-2">
              <p class="metric-value">{{ stats.openIssues }}</p>
              <span class="metric-badge text-rose-700 bg-rose-50">Abiertos</span>
            </div>
          </div>
        </article>
      </PermissionGuard>

      <article v-if="canAccessModule('tickets')" class="metric-card">
        <div class="metric-icon bg-sky-50 text-sky-600">
          <TicketIcon class="h-4 w-4" />
        </div>
        <div class="min-w-0">
          <p class="metric-label">Tickets</p>
          <div class="flex items-end gap-2">
            <p class="metric-value">
              {{ ticketSummary.loading ? '...' : ticketSummary.open }}
            </p>
            <span class="metric-badge text-sky-700 bg-sky-50">Pendientes</span>
          </div>
        </div>
      </article>

      <PermissionGuard :permissions="['view-team']" :fallback="false">
        <article class="metric-card">
          <div class="metric-icon bg-violet-50 text-violet-600">
            <UsersIcon class="h-4 w-4" />
          </div>
          <div class="min-w-0">
            <p class="metric-label">Equipo</p>
            <div class="flex items-end gap-2">
              <p class="metric-value">{{ stats.teamMembers }}</p>
              <span class="metric-badge text-violet-700 bg-violet-50">Activos</span>
            </div>
          </div>
        </article>
      </PermissionGuard>
    </section>

    <section class="grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(292px,0.65fr)]">
      <div class="min-w-0 space-y-3">
        <AIInsightsWidget />

        <section class="dashboard-panel">
          <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
            <div class="min-w-0">
              <p class="dashboard-eyebrow">Agenda</p>
              <h2 class="text-sm font-black text-slate-900">Actividades próximas</h2>
            </div>
            <router-link to="/activities" class="panel-link">
              Ver todas
            </router-link>
          </div>

          <div class="divide-y divide-slate-100">
            <router-link
              v-for="activity in upcomingActivities"
              :key="activity._id || activity.title"
              to="/activities"
              class="activity-row"
            >
              <div class="flex min-w-0 items-center gap-2">
                <span :class="['priority-dot', getPriorityDot(activity.priority)]"></span>
                <div class="flex min-w-0 items-center gap-2">
                  <p class="truncate text-sm font-black text-slate-800">{{ activity.title }}</p>
                  <span class="hidden truncate text-[11px] font-bold text-slate-400 sm:inline">
                    · {{ getClientName(activity) }}
                  </span>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <span :class="['status-pill', getStatusClass(activity.status)]">
                  {{ getStatusLabel(activity.status) }}
                </span>
                <span :class="['due-pill', getDueTone(activity)]">
                  <ClockIcon class="h-3 w-3" />
                  {{ getActivityDueLabel(activity) }}
                </span>
              </div>
            </router-link>

            <div v-if="upcomingActivities.length === 0" class="px-4 py-8 text-center">
              <CalendarDaysIcon class="mx-auto h-8 w-8 text-slate-300" />
              <p class="mt-2 text-xs font-bold text-slate-500">No hay actividades próximas con fecha.</p>
            </div>
          </div>
        </section>
      </div>

      <aside class="space-y-3">
        <section class="dashboard-panel p-3.5">
          <div class="flex items-center justify-between">
            <div>
              <p class="dashboard-eyebrow">Ritmo del día</p>
              <h2 class="text-sm font-black text-slate-900">Foco operativo</h2>
            </div>
            <span class="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black text-white">
              {{ completionRate }}%
            </span>
          </div>

          <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-blue-600 transition-all"
              :style="{ width: `${completionRate}%` }"
            ></div>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="focus-tile">
              <p class="focus-value text-rose-600">{{ overdueActivities.length }}</p>
              <p class="focus-label">Vencidas</p>
            </div>
            <div class="focus-tile">
              <p class="focus-value text-amber-600">{{ dueTodayActivities.length }}</p>
              <p class="focus-label">Hoy</p>
            </div>
            <div class="focus-tile">
              <p class="focus-value text-violet-600">{{ highPriorityActivities.length }}</p>
              <p class="focus-label">Alta prioridad</p>
            </div>
          </div>
        </section>

        <section class="dashboard-panel overflow-hidden">
          <div class="border-b border-slate-100 px-4 py-2.5">
            <p class="dashboard-eyebrow">Pulso comercial</p>
            <h2 class="text-sm font-black text-slate-900">Dónde atacar primero</h2>
          </div>
          <div class="space-y-2.5 p-3.5">
            <div class="commercial-row">
              <BoltIcon class="h-4 w-4 text-slate-500" />
              <span>{{ commercialFocus }}</span>
            </div>
            <div class="commercial-row">
              <ChartBarIcon class="h-4 w-4 text-slate-500" />
              <span>{{ operationalSignal }}</span>
            </div>
            <div class="commercial-row">
              <CheckCircleIcon class="h-4 w-4 text-slate-500" />
              <span>{{ nextBestAction }}</span>
            </div>
          </div>
        </section>

        <section class="dashboard-note">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">Nota de foco</p>
          <p class="mt-2 text-sm font-semibold leading-relaxed text-white">
            Prioriza seguimientos con fecha, casos abiertos y tickets sin resolver. El dashboard debe servir para decidir, no para decorar.
          </p>
        </section>
      </aside>
    </section>
  </main>
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
import PermissionGuard from '../components/PermissionGuard.vue'
import AIInsightsWidget from '../components/AIInsightsWidget.vue'
import { ticketService } from '../services/ticketService'
import {
  ArrowPathIcon,
  BoltIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  TicketIcon,
  UserGroupIcon,
  UserPlusIcon,
  UsersIcon
} from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const refreshing = ref(false)
const ticketSummary = ref({
  open: 0,
  loading: false
})

const canAccessModule = (moduleId: string) => {
  return (authStore.getAvailableModules || []).some((module: any) => module.id === moduleId)
}

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuario')

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Manager',
    employee: 'Colaborador',
    support: 'Soporte',
    client: 'Cliente',
    viewer: 'Lectura'
  }

  return labels[authStore.user?.role || ''] || 'Equipo'
})

const activeActivities = computed(() => {
  return activitiesStore.activities.filter((activity: any) => isActiveActivity(activity))
})

const completedActivities = computed(() => {
  return activitiesStore.activities.filter((activity: any) => activity.status === 'completed')
})

const overdueActivities = computed(() => {
  return activeActivities.value.filter((activity: any) => isPastDue(activity))
})

const dueTodayActivities = computed(() => {
  return activeActivities.value.filter((activity: any) => {
    const date = getActivityDate(activity)
    return !!date && isSameDay(date, new Date()) && !isPastDue(activity)
  })
})

const highPriorityActivities = computed(() => {
  return activeActivities.value.filter((activity: any) => ['urgent', 'high'].includes(activity.priority)).slice(0, 99)
})

const completionRate = computed(() => {
  const total = activeActivities.value.length + completedActivities.value.length
  if (!total) return 0
  return Math.min(100, Math.round((completedActivities.value.length / total) * 100))
})

const upcomingActivities = computed(() => {
  return activeActivities.value
    .filter((activity: any) => getActivityDate(activity))
    .sort((a: any, b: any) => {
      const dateA = getActivityDate(a)?.getTime() || Number.POSITIVE_INFINITY
      const dateB = getActivityDate(b)?.getTime() || Number.POSITIVE_INFINITY
      return dateA - dateB
    })
    .slice(0, 4)
})

const stats = computed(() => ({
  clients: clientsStore.clients.length,
  activities: activitiesStore.activities.length,
  openIssues: issuesStore.issues.filter((issue: any) => issue.status === 'open' || issue.status === 'in_progress').length,
  teamMembers: teamStore.members.length
}))

const welcomeLine = computed(() => {
  const critical = overdueActivities.value.length + dueTodayActivities.value.length
  if (critical > 0) {
    return `Tienes ${critical} actividades que requieren atención entre hoy y vencidas.`
  }

  return 'Tu operación está estable. Mantén el foco en seguimientos comerciales y tickets activos.'
})

const commercialFocus = computed(() => {
  if (overdueActivities.value.length > 0) return 'Recupera primero las actividades vencidas antes de abrir nuevos frentes.'
  if (dueTodayActivities.value.length > 0) return 'El foco de hoy está en cerrar seguimientos con fecha límite.'
  return 'Buen momento para avanzar oportunidades y alimentar próximos pasos.'
})

const operationalSignal = computed(() => {
  if (ticketSummary.value.open > 0) return `${ticketSummary.value.open} tickets activos pueden afectar experiencia de clientes.`
  if (stats.value.openIssues > 0) return `${stats.value.openIssues} casos abiertos requieren seguimiento visible.`
  return 'Sin fricción crítica detectada en tickets o casos abiertos.'
})

const nextBestAction = computed(() => {
  if (highPriorityActivities.value.length > 0) return 'Ataca actividades urgentes o de alta prioridad en bloque.'
  if (upcomingActivities.value.length > 0) return 'Confirma responsables y fechas de las próximas actividades.'
  return 'Crea la siguiente actividad comercial para sostener el ritmo.'
})

const availableQuickActions = computed(() => {
  const actions = []

  if (authStore.canCreateClients) {
    actions.push({
      name: 'Nuevo cliente',
      to: '/clients',
      icon: UserPlusIcon,
      tone: 'bg-blue-50 text-blue-600 border-blue-100'
    })
  }

  if (authStore.canCreateActivities) {
    actions.push({
      name: 'Nueva actividad',
      to: '/activities',
      icon: PlusCircleIcon,
      tone: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    })
  }

  if (canAccessModule('tickets')) {
    actions.push({
      name: 'Revisar tickets',
      to: '/tickets',
      icon: TicketIcon,
      tone: 'bg-sky-50 text-sky-600 border-sky-100'
    })
  }

  if (authStore.canCreateCases) {
    actions.push({
      name: 'Nuevo caso',
      to: '/cases',
      icon: ExclamationCircleIcon,
      tone: 'bg-amber-50 text-amber-600 border-amber-100'
    })
  }

  if (authStore.canCreateTeam) {
    actions.push({
      name: 'Gestionar equipo',
      to: '/team',
      icon: UsersIcon,
      tone: 'bg-violet-50 text-violet-600 border-violet-100'
    })
  }

  return actions
})

const fetchTicketSummary = async () => {
  ticketSummary.value.loading = true
  try {
    const statuses = ['new', 'open', 'waiting']
    const results = await Promise.all(
      statuses.map((status) =>
        ticketService.getAll({ status, limit: 1 }).catch(() => null)
      )
    )

    ticketSummary.value.open = results.reduce((total, result: any) => {
      return total + (result?.pagination?.total || result?.data?.length || 0)
    }, 0)
  } finally {
    ticketSummary.value.loading = false
  }
}

const refreshDashboard = async () => {
  refreshing.value = true
  try {
    const promises: Promise<any>[] = []

    if (authStore.canViewClients) promises.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) promises.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) promises.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) promises.push(teamStore.fetchTeam())
    if (canAccessModule('tickets')) promises.push(fetchTicketSummary())

    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    refreshing.value = false
  }
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

const isTomorrow = (date: Date) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return isSameDay(date, tomorrow)
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

const getActivityDueLabel = (activity: any) => {
  const date = getActivityDate(activity)
  if (!date) return 'Sin fecha'
  if (isSameDay(date, new Date())) return `Hoy ${formatTime(date)}`
  if (isTomorrow(date)) return `Mañana ${formatTime(date)}`

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

const getPriorityDot = (priority?: string) => {
  const classes: Record<string, string> = {
    urgent: 'bg-rose-500',
    high: 'bg-orange-500',
    medium: 'bg-sky-500',
    low: 'bg-emerald-500'
  }

  return classes[priority || 'medium'] || classes.medium
}

const getStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    'in-progress': 'En progreso',
    overdue: 'Atrasada',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }

  return labels[status || 'pending'] || status || 'Pendiente'
}

const getStatusClass = (status?: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100/70',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-100/70',
    overdue: 'bg-rose-50 text-rose-700 border-rose-100/70',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-100/70',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200/70'
  }

  return classes[status || 'pending'] || classes.pending
}

const getDueTone = (activity: any) => {
  if (isPastDue(activity)) return 'bg-rose-50/70 text-rose-600 border-rose-100/60'
  const date = getActivityDate(activity)
  if (date && isSameDay(date, new Date())) return 'bg-amber-50/80 text-amber-700 border-amber-100/70'
  return 'bg-slate-100 text-slate-600 border-slate-200/70'
}

onMounted(() => {
  refreshDashboard()
})
</script>

<style scoped>
.dashboard-shell {
  width: min(100%, 1530px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.1rem 0 0.85rem;
}

.dashboard-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0.2rem 0.2rem 0.15rem;
  box-shadow: none;
}

.dashboard-eyebrow {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(148 163 184);
}

.dashboard-chip {
  border: 1px solid rgb(226 232 240);
  border-radius: 999px;
  background: white;
  color: rgb(71 85 105);
  font-size: 0.68rem;
  font-weight: 900;
  padding: 0.18rem 0.55rem;
}

.dashboard-icon-button,
.dashboard-primary-action,
.quick-action,
.metric-card,
.dashboard-panel,
.dashboard-note {
  border: 1px solid rgb(226 232 240);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.045);
}

.dashboard-icon-button {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  transition: all 160ms ease;
}

.dashboard-primary-action {
  display: inline-flex;
  height: 2rem;
  align-items: center;
  gap: 0.45rem;
  border-radius: 0.75rem;
  border-color: rgb(191 219 254);
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  padding: 0 0.8rem;
  font-size: 0.72rem;
  font-weight: 900;
  transition: all 160ms ease;
}

.dashboard-primary-action svg,
.dashboard-icon-button svg {
  filter: none;
}

.dashboard-icon-button:hover,
.dashboard-primary-action:hover,
.quick-action:hover,
.metric-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.065);
}

.quick-action {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-start;
  gap: 0.55rem;
  min-height: 2.9rem;
  border-radius: 0.75rem;
  padding: 0.5rem 0.65rem;
  color: rgb(30 41 59);
  font-size: 0.75rem;
  font-weight: 900;
  transition: all 160ms ease;
}

.quick-action-icon,
.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(226, 232, 240, 0.82);
}

.quick-action-icon {
  height: 1.75rem;
  width: 1.75rem;
  flex-shrink: 0;
  border-radius: 0.62rem;
}

.quick-action-icon svg {
  height: 0.95rem;
  width: 0.95rem;
}

.metric-card {
  display: flex;
  min-height: 3.9rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  border-radius: 0.78rem;
  padding: 0.66rem 0.72rem;
  transition: all 160ms ease;
}

.metric-icon {
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  border-radius: 0.68rem;
  box-shadow: none;
  order: 2;
}

.metric-icon svg {
  height: 1.05rem;
  width: 1.05rem;
}

.metric-label {
  color: rgb(148 163 184);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.metric-value {
  color: rgb(15 23 42);
  font-size: 1.35rem;
  font-weight: 950;
  line-height: 1;
}

.metric-badge {
  border-radius: 999px;
  padding: 0.13rem 0.38rem;
  font-size: 0.52rem;
  font-weight: 900;
}

.dashboard-panel,
.dashboard-note {
  border-radius: 0.85rem;
}

.panel-link {
  color: rgb(79 70 229);
  font-size: 0.72rem;
  font-weight: 900;
}

.activity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2.35rem;
  padding: 0.35rem 1rem;
  transition: background 140ms ease;
}

.activity-row:hover {
  background: rgb(248 250 252);
}

.activity-row:hover .priority-dot {
  transform: scale(1.15);
}

.priority-dot {
  height: 0.45rem;
  width: 0.45rem;
  flex-shrink: 0;
  border-radius: 999px;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.12);
  transition: transform 140ms ease;
}

.status-pill,
.due-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 0.55rem;
  padding: 0.18rem 0.48rem;
  font-size: 0.6rem;
  font-weight: 900;
  line-height: 1;
}

.due-pill svg {
  opacity: 0.72;
}

.focus-tile {
  border: 1px solid rgb(241 245 249);
  border-radius: 0.75rem;
  background: rgb(248 250 252);
  padding: 0.55rem 0.45rem;
  text-align: center;
}

.focus-value {
  font-size: 1rem;
  font-weight: 950;
  line-height: 1;
}

.focus-label {
  margin-top: 0.18rem;
  color: rgb(100 116 139);
  font-size: 0.62rem;
  font-weight: 900;
}

.commercial-row {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  color: rgb(71 85 105);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.35;
}

.dashboard-note {
  padding: 0.9rem;
  border-color: transparent;
  background: rgb(49 46 129);
  box-shadow: 0 14px 34px rgba(49, 46, 129, 0.18);
}

@media (max-width: 768px) {
  .dashboard-hero {
    flex-direction: column;
  }

  .activity-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.55rem;
  }
}
</style>
