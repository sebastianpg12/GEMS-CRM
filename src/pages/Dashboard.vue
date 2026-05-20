<template>
  <div class="flex flex-col gap-3">

    <!-- ══ Top breadcrumb bar ══════════════════════════════════════════ -->
    <div class="flex items-center justify-between gap-2 flex-wrap pr-12 sm:pr-14">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 hidden sm:inline">Dashboard Operativo</span>
        <span class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:hidden">Dashboard</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider whitespace-nowrap">
          {{ userRoleLabel }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <!-- Period selector -->
        <div class="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
          <button v-for="p in periods" :key="p.value" @click="selectedPeriod = p.value"
            class="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
            :class="selectedPeriod === p.value ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-slate-50'">
            {{ p.label }}
          </button>
        </div>
        <button @click="refreshAll" :disabled="isRefreshing"
          class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50 shrink-0">
          <i class="fas fa-sync-alt text-[11px]" :class="{ 'animate-spin': isRefreshing }"></i>
        </button>
        <router-link v-if="authStore.canCreateActivities" to="/activities"
          class="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-[12px] font-semibold shadow-sm shadow-blue-500/20 transition-all shrink-0">
          <i class="fas fa-plus text-[10px]"></i>
          <span class="hidden sm:inline">Nueva actividad</span>
        </router-link>
      </div>
    </div>

    <!-- ══ Greeting ═══════════════════════════════════════════════════ -->
    <div>
      <h1 class="text-xl sm:text-2xl xl:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">Hola, {{ firstName }}</h1>
      <p class="text-[12px] sm:text-[13px] text-slate-500 mt-0.5">
        Tienes <span class="font-semibold text-slate-700">{{ criticalCount }}</span>
        {{ criticalCount === 1 ? 'actividad' : 'actividades' }} que
        {{ criticalCount === 1 ? 'requiere' : 'requieren' }} atención entre hoy y vencidas.
      </p>
    </div>

    <!-- ══ Team KPI Summary Cards ════════════════════════════════════ -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      <div v-for="card in teamStatCards" :key="card.label"
        class="bg-white border border-slate-200 rounded-xl px-3.5 py-3">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" :class="card.iconBg">
            <i :class="['fas', card.icon, card.iconColor, 'text-[11px]']"></i>
          </div>
          <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 truncate">{{ card.label }}</span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-xl font-bold leading-none" :class="card.valueColor">
            {{ kpiLoading ? '—' : card.value }}
          </span>
          <span v-if="card.suffix" class="text-[10px] font-semibold text-slate-400">{{ card.suffix }}</span>
        </div>
      </div>
    </div>

    <!-- ══ Main grid: 2/3 + 1/3 ══════════════════════════════════════ -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-3">

      <!-- ── Left column ────────────────────────────────────────────── -->
      <div class="xl:col-span-2 flex flex-col gap-3">

        <!-- Trend chart -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Tendencias</div>
              <div class="text-[13px] font-bold text-slate-900">Actividad del equipo</div>
            </div>
            <div class="flex bg-slate-100 rounded-lg overflow-hidden">
              <button @click="trendTab = 'weekly'"
                class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                :class="trendTab === 'weekly' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-700'">
                Semanal
              </button>
              <button @click="trendTab = 'monthly'"
                class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                :class="trendTab === 'monthly' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-700'">
                Mensual
              </button>
            </div>
          </div>
          <div class="px-4 py-4">
            <div v-if="trendsLoading" class="flex items-center justify-center py-12">
              <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <div v-else>
              <!-- Bar chart -->
              <div class="flex items-end gap-2 h-40 px-1">
                <div v-for="(point, i) in currentTrend" :key="i"
                  class="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span class="text-[10px] font-bold text-slate-600 tabular-nums">{{ point.completed }}</span>
                  <div class="w-full max-w-[48px] rounded-t-md transition-all duration-500 min-h-[4px] mx-auto"
                    :class="trendTab === 'weekly' ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-gradient-to-t from-indigo-500 to-indigo-400'"
                    :style="{ height: trendBarHeight(point.completed) }">
                  </div>
                </div>
              </div>
              <div class="flex gap-2 mt-2 px-1">
                <div v-for="(point, i) in currentTrend" :key="'l'+i"
                  class="flex-1 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate min-w-0">
                  {{ point.label }}
                </div>
              </div>
              <!-- Legend -->
              <div class="flex items-center justify-center gap-4 mt-3">
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm" :class="trendTab === 'weekly' ? 'bg-blue-500' : 'bg-indigo-500'"></div>
                  <span class="text-[10px] text-slate-500 font-semibold">Completadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- KPIs per person — card layout instead of table -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100">
            <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Rendimiento</div>
            <div class="text-[13px] font-bold text-slate-900">KPIs por persona</div>
          </div>
          <div v-if="kpiLoading" class="flex items-center justify-center py-10">
            <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div v-else-if="kpiData.kpis.length === 0" class="py-10 text-center">
            <p class="text-[12px] text-slate-400">Sin datos para el período seleccionado</p>
          </div>
          <div v-else class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div v-for="kpi in kpiData.kpis" :key="kpi.user._id"
              class="border border-slate-100 rounded-xl p-3 hover:border-slate-200 hover:shadow-sm transition-all">
              <!-- Header: avatar + name -->
              <div class="flex items-center gap-2.5 mb-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                  {{ kpi.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-[12px] font-bold text-slate-800 truncate">{{ kpi.user.name }}</div>
                  <div class="text-[10px] text-slate-400 truncate">{{ kpi.user.department || kpi.user.role }}</div>
                </div>
                <!-- Compliance badge -->
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  :class="kpi.complianceRate >= 70 ? 'bg-emerald-50 text-emerald-600' : kpi.complianceRate >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'">
                  {{ kpi.complianceRate }}%
                </span>
              </div>
              <!-- Compliance bar -->
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div class="h-full rounded-full transition-all duration-500"
                  :class="complianceBarColor(kpi.complianceRate)"
                  :style="{ width: kpi.complianceRate + '%' }"></div>
              </div>
              <!-- Stats row -->
              <div class="grid grid-cols-4 gap-1 text-center">
                <div>
                  <div class="text-[13px] font-bold text-slate-800">{{ kpi.totalCompleted }}</div>
                  <div class="text-[8px] font-bold uppercase tracking-wider text-slate-400">Hechas</div>
                </div>
                <div>
                  <div class="text-[13px] font-bold text-slate-600">{{ kpi.currentWorkload }}</div>
                  <div class="text-[8px] font-bold uppercase tracking-wider text-slate-400">Pend.</div>
                </div>
                <div>
                  <div class="text-[13px] font-bold" :class="kpi.overdueCount > 0 ? 'text-red-500' : 'text-slate-300'">{{ kpi.overdueCount }}</div>
                  <div class="text-[8px] font-bold uppercase tracking-wider text-slate-400">Venc.</div>
                </div>
                <div>
                  <div class="text-[13px] font-bold text-slate-500">{{ kpi.avgResolutionDays }}d</div>
                  <div class="text-[8px] font-bold uppercase tracking-wider text-slate-400">Prom.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Right column ─────────────────────────────────────────── -->
      <div class="flex flex-col gap-3">

        <!-- Ritmo del día -->
        <div class="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div class="flex items-start justify-between mb-2 gap-2">
            <div class="min-w-0">
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Ritmo del día</div>
              <div class="text-[13px] font-bold text-slate-900">Foco operativo</div>
            </div>
            <span class="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full leading-none shrink-0">{{ focusProgress }}%</span>
          </div>
          <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3.5">
            <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
              :style="{ width: focusProgress + '%' }"></div>
          </div>
          <div class="grid grid-cols-3 text-center gap-1">
            <div>
              <div class="text-xl font-bold text-red-500 leading-none">{{ overdueCount }}</div>
              <div class="text-[10px] text-slate-500 font-semibold mt-1">Vencidas</div>
            </div>
            <div>
              <div class="text-xl font-bold text-amber-500 leading-none">{{ todayCount }}</div>
              <div class="text-[10px] text-slate-500 font-semibold mt-1">Hoy</div>
            </div>
            <div>
              <div class="text-xl font-bold text-cyan-500 leading-none">{{ highPriorityCount }}</div>
              <div class="text-[10px] text-slate-500 font-semibold mt-1 leading-tight">Alta prioridad</div>
            </div>
          </div>
        </div>

        <!-- Alertas de equipo -->
        <div v-if="overloadedMembers.length > 0" class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-exclamation-triangle text-amber-500 text-[12px]"></i>
            <div class="text-[10px] font-bold uppercase tracking-widest text-amber-700">Sobrecarga detectada</div>
          </div>
          <div class="flex flex-col gap-1.5">
            <div v-for="m in overloadedMembers" :key="m.user._id" class="flex items-center justify-between">
              <span class="text-[12px] font-semibold text-amber-800 truncate">{{ m.user.name }}</span>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-[10px] text-amber-600 font-bold">{{ m.currentWorkload }} pend.</span>
                <span v-if="m.overdueCount > 0" class="text-[10px] text-red-500 font-bold">{{ m.overdueCount }} venc.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Agenda — compact card list -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Agenda</div>
              <div class="text-[13px] font-bold text-slate-900">Próximas actividades</div>
            </div>
            <router-link to="/activities" class="text-[11px] text-blue-500 hover:text-blue-600 font-semibold transition-colors">
              Ver todas
            </router-link>
          </div>
          <div v-if="agendaActivities.length === 0" class="py-8 text-center">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
              <i class="fas fa-calendar-check text-slate-300"></i>
            </div>
            <p class="text-[11px] text-slate-400 font-semibold">Sin actividades próximas</p>
          </div>
          <div v-else class="max-h-[400px] overflow-y-auto">
            <div v-for="act in agendaActivities" :key="act._id"
              class="px-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-2.5">
                <!-- Priority dot -->
                <div class="mt-1.5 shrink-0">
                  <span class="block w-2 h-2 rounded-full"
                    :class="act.priority === 'urgent' ? 'bg-red-500' : act.priority === 'high' ? 'bg-orange-500' : 'bg-blue-400'"></span>
                </div>
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-[12px] font-semibold text-slate-800 truncate leading-tight">{{ act.title }}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] text-slate-400 truncate">{{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}</span>
                    <span class="text-slate-200">·</span>
                    <span class="text-[10px] text-slate-400 shrink-0">
                      <i class="fas fa-clock text-[8px] mr-0.5"></i>{{ formatDateShort(act.dueDate || act.date) }}
                    </span>
                  </div>
                </div>
                <!-- Status badge -->
                <span :class="['shrink-0 px-2 py-0.5 rounded text-[9px] font-bold', agendaStatusClass(act)]">
                  {{ agendaStatusLabel(act) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nota de foco -->
        <div class="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-xl px-4 py-3.5 text-white relative overflow-hidden">
          <div class="absolute -top-8 -right-8 w-28 h-28 bg-violet-400/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="relative">
            <div class="flex items-center gap-2 mb-1.5">
              <i class="fas fa-bullseye text-indigo-300 text-[11px]"></i>
              <div class="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Nota de foco</div>
            </div>
            <p class="text-[13px] font-semibold leading-relaxed">
              {{ focusNote }}
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useClientsStore, useActivitiesStore, useIssuesStore, useTeamStore } from '../stores'
import { teamReportsService, type KPIResponse, type TrendPoint } from '../services/reportsService'

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const isRefreshing = ref(false)
const selectedPeriod = ref('month')
const trendTab = ref<'weekly' | 'monthly'>('weekly')

// KPI data
const kpiLoading = ref(true)
const kpiData = ref<KPIResponse>({ kpis: [], teamTotals: { totalItems: 0, totalCompleted: 0, avgCompliance: 0, avgResolution: 0, totalWorkload: 0, totalOverdue: 0, totalHours: 0 }, period: 'month', since: '' })
const weeklyTrends = ref<TrendPoint[]>([])
const monthlyTrends = ref<TrendPoint[]>([])
const trendsLoading = ref(true)

const periods = [
  { value: 'week', label: 'Sem' },
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trim' },
]

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuario')
const userRoleLabel = computed(() => ({
  admin: 'Administrador', manager: 'Manager', employee: 'Empleado',
  support: 'Soporte', development: 'Desarrollador', fullstack: 'Fullstack',
  viewer: 'Viewer', client: 'Cliente',
}[authStore.user?.role || ''] || authStore.user?.role || 'Usuario'))

const todayMidnight = new Date()
todayMidnight.setHours(0, 0, 0, 0)

const overdueCount = computed(() =>
  activitiesStore.activities.filter((a: any) => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
    return d < todayMidnight
  }).length
)
const todayCount = computed(() =>
  activitiesStore.activities.filter((a: any) => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
    return d.getTime() === todayMidnight.getTime()
  }).length
)
const highPriorityCount = computed(() =>
  activitiesStore.activities.filter((a: any) =>
    (a.priority === 'high' || a.priority === 'urgent') &&
    a.status !== 'completed' && a.status !== 'cancelled'
  ).length
)
const criticalCount = computed(() => overdueCount.value + todayCount.value)
const focusProgress = computed(() => {
  const total = activitiesStore.activities.length
  if (!total) return 0
  return Math.round(activitiesStore.activities.filter((a: any) => a.status === 'completed').length / total * 100)
})

// Team stat cards
const teamStatCards = computed(() => {
  const t = kpiData.value.teamTotals
  return [
    { label: 'Completadas', value: t.totalCompleted, valueColor: 'text-slate-900', icon: 'fa-check-circle', iconBg: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Cumplimiento', value: t.avgCompliance + '%', valueColor: t.avgCompliance >= 70 ? 'text-emerald-600' : t.avgCompliance >= 40 ? 'text-amber-600' : 'text-red-600', icon: 'fa-bullseye', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Resolución', value: t.avgResolution, suffix: 'días', valueColor: 'text-slate-900', icon: 'fa-clock', iconBg: 'bg-slate-100', iconColor: 'text-slate-500' },
    { label: 'Pendientes', value: t.totalWorkload, valueColor: 'text-slate-900', icon: 'fa-clipboard-list', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Vencidas', value: t.totalOverdue, valueColor: t.totalOverdue > 0 ? 'text-red-600' : 'text-slate-900', icon: 'fa-exclamation-triangle', iconBg: t.totalOverdue > 0 ? 'bg-red-50' : 'bg-slate-100', iconColor: t.totalOverdue > 0 ? 'text-red-500' : 'text-slate-400' },
    { label: 'Horas', value: t.totalHours, suffix: 'h', valueColor: 'text-slate-900', icon: 'fa-stopwatch', iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
  ]
})

const overloadedMembers = computed(() =>
  kpiData.value.kpis.filter(k => k.currentWorkload > 10 || k.overdueCount > 3)
)

const currentTrend = computed(() => trendTab.value === 'weekly' ? weeklyTrends.value : monthlyTrends.value)

const agendaActivities = computed(() => {
  return [...activitiesStore.activities]
    .filter((a: any) => a.status !== 'completed' && a.status !== 'cancelled')
    .sort((a: any, b: any) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime())
    .slice(0, 10)
})

const focusNote = computed(() => {
  if (criticalCount.value > 0)
    return 'Prioriza seguimientos con fecha, casos abiertos y tickets sin resolver. El dashboard debe servir para decidir, no para decorar.'
  return 'Aprovecha esta calma para revisar pipeline, planear seguimientos y consolidar relaciones con clientes clave.'
})

// ── Helpers ──

function complianceBarColor(rate: number) {
  if (rate >= 70) return 'bg-emerald-500'
  if (rate >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

function trendBarHeight(value: number) {
  const max = Math.max(...currentTrend.value.map(p => p.completed), 1)
  const pct = Math.max((value / max) * 100, 3)
  return `${pct}%`
}

const agendaStatusLabel = (a: any) => {
  const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
  if (d < todayMidnight) return 'Atrasada'
  if (a.status === 'in-progress') return 'En curso'
  return 'Pendiente'
}
const agendaStatusClass = (a: any) => {
  const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
  if (d < todayMidnight) return 'bg-red-50 text-red-600'
  if (a.status === 'in-progress') return 'bg-blue-50 text-blue-600'
  return 'bg-amber-50 text-amber-600'
}

const formatDateShort = (d?: string) => {
  if (!d) return '—'
  const date = new Date(d)
  const day = date.getDate()
  const month = date.toLocaleString('es', { month: 'short' }).replace('.', '')
  return `${day} ${month}`
}

// ── Data fetching ──

async function fetchKPIs() {
  kpiLoading.value = true
  try {
    kpiData.value = await teamReportsService.getKPIs(selectedPeriod.value)
  } catch (e) {
    console.error('Error fetching KPIs:', e)
  } finally {
    kpiLoading.value = false
  }
}

async function fetchTrends() {
  trendsLoading.value = true
  try {
    const [w, m] = await Promise.all([
      teamReportsService.getWeeklyTrends(),
      teamReportsService.getMonthlyTrends(),
    ])
    weeklyTrends.value = w
    monthlyTrends.value = m
  } catch (e) {
    console.error('Error fetching trends:', e)
  } finally {
    trendsLoading.value = false
  }
}

async function refreshAll() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    const ps: Promise<any>[] = [fetchKPIs(), fetchTrends()]
    if (authStore.canViewClients) ps.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) ps.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) ps.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) ps.push(teamStore.fetchTeam())
    await Promise.all(ps)
  } finally { isRefreshing.value = false }
}

watch(selectedPeriod, () => fetchKPIs())

// ── Init ──
onMounted(async () => {
  try {
    const ps: Promise<any>[] = [fetchKPIs(), fetchTrends()]
    if (authStore.canViewClients) ps.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) ps.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) ps.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) ps.push(teamStore.fetchTeam())
    await Promise.all(ps)
  } catch (e) { console.error('Error loading dashboard:', e) }
})
</script>
