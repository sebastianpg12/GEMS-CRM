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
    <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));">
      <div v-for="card in teamStatCards" :key="card.label"
        class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
        <div class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 truncate">{{ card.label }}</div>
        <div class="flex items-end justify-between gap-2">
          <div class="flex items-baseline gap-1.5 min-w-0">
            <span class="text-xl sm:text-2xl font-bold leading-none" :class="card.valueColor">
              {{ kpiLoading ? '—' : card.value }}
            </span>
            <span v-if="card.suffix" class="text-[10px] font-semibold text-slate-400">{{ card.suffix }}</span>
          </div>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="card.iconBg">
            <i :class="['fas', card.icon, card.iconColor, 'text-[12px]']"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ Main grid ══════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-3">

      <!-- ── Left: Trends + KPIs table ──────────────────────────────── -->
      <div class="xl:col-span-2 flex flex-col gap-3">

        <!-- Trend charts (tabs: semanal / mensual) -->
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
            <div v-else class="h-56">
              <!-- Simple bar chart (CSS-based, no dependencies) -->
              <div class="flex items-end gap-1.5 h-44">
                <div v-for="(point, i) in currentTrend" :key="i"
                  class="flex-1 flex flex-col items-center gap-1">
                  <span class="text-[10px] font-bold text-slate-700">{{ point.completed }}</span>
                  <div class="w-full rounded-t-md transition-all duration-500 min-h-[4px]"
                    :class="trendTab === 'weekly' ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-gradient-to-t from-indigo-500 to-indigo-400'"
                    :style="{ height: trendBarHeight(point.completed) }">
                  </div>
                  <!-- Created bar (monthly) -->
                  <div v-if="trendTab === 'monthly' && point.created"
                    class="w-full rounded-t-md bg-slate-200 min-h-[2px]"
                    :style="{ height: trendBarHeight(point.created, 0.5) }">
                  </div>
                </div>
              </div>
              <div class="flex gap-1.5 mt-2">
                <div v-for="(point, i) in currentTrend" :key="'l'+i"
                  class="flex-1 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {{ point.label }}
                </div>
              </div>
              <!-- Legend -->
              <div class="flex items-center justify-center gap-4 mt-2">
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm" :class="trendTab === 'weekly' ? 'bg-blue-500' : 'bg-indigo-500'"></div>
                  <span class="text-[10px] text-slate-500 font-semibold">Completadas</span>
                </div>
                <div v-if="trendTab === 'monthly'" class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm bg-slate-200"></div>
                  <span class="text-[10px] text-slate-500 font-semibold">Creadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- KPIs per person table -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Rendimiento</div>
              <div class="text-[13px] font-bold text-slate-900">KPIs por persona</div>
            </div>
          </div>
          <div v-if="kpiLoading" class="flex items-center justify-center py-10">
            <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div v-else-if="kpiData.kpis.length === 0" class="py-10 text-center">
            <p class="text-[12px] text-slate-400">Sin datos para el período seleccionado</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/60">
                  <th class="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Persona</th>
                  <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Completadas</th>
                  <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Cumplimiento</th>
                  <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center hidden md:table-cell">Prom. días</th>
                  <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Pendientes</th>
                  <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Vencidas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="kpi in kpiData.kpis" :key="kpi.user._id" class="hover:bg-slate-50/40 transition-colors">
                  <td class="px-4 py-2.5">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {{ kpi.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <div class="text-[12px] font-semibold text-slate-800 truncate">{{ kpi.user.name }}</div>
                        <div class="text-[10px] text-slate-400 truncate">{{ kpi.user.department || kpi.user.role }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="text-[13px] font-bold text-slate-800">{{ kpi.totalCompleted }}</span>
                    <span class="text-[10px] text-slate-400"> / {{ kpi.totalItems }}</span>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <div class="inline-flex items-center gap-1.5">
                      <div class="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500"
                          :class="complianceBarColor(kpi.complianceRate)"
                          :style="{ width: kpi.complianceRate + '%' }"></div>
                      </div>
                      <span class="text-[12px] font-bold" :class="complianceTextColor(kpi.complianceRate)">
                        {{ kpi.complianceRate }}%
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-center hidden md:table-cell">
                    <span class="text-[12px] text-slate-600">{{ kpi.avgResolutionDays }}d</span>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="text-[13px] font-semibold text-slate-700">{{ kpi.currentWorkload }}</span>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span v-if="kpi.overdueCount > 0"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[11px] font-bold">
                      <i class="fas fa-exclamation-circle text-[9px]"></i>
                      {{ kpi.overdueCount }}
                    </span>
                    <span v-else class="text-[11px] text-slate-300">0</span>
                  </td>
                </tr>
              </tbody>
            </table>
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

        <!-- Email Report Panel -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Reportes</div>
              <div class="text-[13px] font-bold text-slate-900">Enviar por email</div>
            </div>
            <i class="fas fa-envelope text-slate-300 text-[14px]"></i>
          </div>
          <div class="px-4 py-3 space-y-3">
            <!-- Envío manual -->
            <div>
              <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Destinatarios</label>
              <input v-model="reportEmail" type="text" placeholder="email1@..., email2@..."
                class="w-full px-3 py-2 text-[12px] border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-colors" />
            </div>
            <div>
              <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Período del reporte</label>
              <select v-model="reportPeriod"
                class="w-full px-3 py-2 text-[12px] border border-slate-200 rounded-lg focus:border-blue-400 outline-none">
                <option value="week">Semanal</option>
                <option value="month">Mensual</option>
                <option value="quarter">Trimestral</option>
              </select>
            </div>
            <button @click="sendManualReport" :disabled="sendingReport"
              class="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-[12px] font-bold rounded-lg shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <i class="fas" :class="sendingReport ? 'fa-spinner animate-spin' : 'fa-paper-plane'" class="text-[11px]"></i>
              {{ sendingReport ? 'Enviando...' : 'Enviar reporte ahora' }}
            </button>
            <p v-if="reportMsg" class="text-[11px] font-semibold text-center" :class="reportMsgType === 'ok' ? 'text-emerald-500' : 'text-red-500'">{{ reportMsg }}</p>
          </div>

          <!-- Programación -->
          <div class="border-t border-slate-100 px-4 py-3 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-700">Envío automático</span>
              <button @click="toggleSchedule"
                class="relative w-9 h-5 rounded-full transition-colors"
                :class="scheduleConfig.enabled ? 'bg-blue-500' : 'bg-slate-200'">
                <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                  :class="scheduleConfig.enabled ? 'translate-x-4' : ''"></span>
              </button>
            </div>
            <div v-if="scheduleConfig.enabled" class="space-y-2">
              <div class="flex gap-2">
                <select v-model="scheduleConfig.frequency" @change="saveSchedule"
                  class="flex-1 px-2 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none">
                  <option value="daily">Diario (L-V)</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
                <select v-if="scheduleConfig.frequency === 'weekly'" v-model.number="scheduleConfig.dayOfWeek" @change="saveSchedule"
                  class="flex-1 px-2 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none">
                  <option :value="1">Lunes</option>
                  <option :value="2">Martes</option>
                  <option :value="3">Miércoles</option>
                  <option :value="4">Jueves</option>
                  <option :value="5">Viernes</option>
                </select>
              </div>
              <div class="flex gap-2 items-center">
                <label class="text-[10px] text-slate-400 font-bold shrink-0">Hora:</label>
                <input type="number" v-model.number="scheduleConfig.hour" min="0" max="23" @change="saveSchedule"
                  class="w-14 px-2 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none text-center" />
                <span class="text-[11px] text-slate-400">:</span>
                <input type="number" v-model.number="scheduleConfig.minute" min="0" max="59" @change="saveSchedule"
                  class="w-14 px-2 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none text-center" />
              </div>
              <p v-if="scheduleConfig.lastRun" class="text-[10px] text-slate-400">
                Último envío: {{ new Date(scheduleConfig.lastRun).toLocaleString('es-CO') }}
              </p>
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

    <!-- ══ Agenda (full width below) ══════════════════════════════════ -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Agenda</div>
          <div class="text-[13px] font-bold text-slate-900">Actividades próximas</div>
        </div>
        <router-link to="/activities" class="text-[12px] text-blue-500 hover:text-blue-600 font-semibold transition-colors">Ver todas</router-link>
      </div>
      <div v-if="agendaActivities.length === 0" class="py-8">
        <p class="text-[12px] text-slate-400 text-center">Sin actividades próximas</p>
      </div>
      <div v-else class="max-h-[320px] overflow-y-auto divide-y divide-slate-50">
        <div v-for="act in agendaActivities" :key="act._id"
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-slate-50/60 transition-colors">
          <span class="w-2 h-2 rounded-full shrink-0"
            :class="act.priority === 'urgent' ? 'bg-red-500' : act.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'"></span>
          <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
            <span class="text-[12px] font-semibold text-slate-800 truncate">{{ act.title }}</span>
            <span class="text-[11px] text-slate-400 truncate">
              <span class="hidden sm:inline">· </span>{{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}
            </span>
          </div>
          <span :class="['shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold', agendaStatusClass(act)]">
            {{ agendaStatusLabel(act) }}
          </span>
          <span class="shrink-0 hidden md:flex items-center gap-1 text-[11px] text-slate-500">
            <i class="fas fa-clock text-red-400 text-[10px]"></i>
            {{ formatDateShort(act.dueDate || act.date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useClientsStore, useActivitiesStore, useIssuesStore, useTeamStore } from '../stores'
import { teamReportsService, type KPIResponse, type TrendPoint, type ScheduleConfig } from '../services/reportsService'

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

// Report sending
const reportEmail = ref('')
const reportPeriod = ref('week')
const sendingReport = ref(false)
const reportMsg = ref('')
const reportMsgType = ref<'ok' | 'err'>('ok')

// Schedule
const scheduleConfig = ref<ScheduleConfig>({
  enabled: false, frequency: 'weekly', dayOfWeek: 1, hour: 8, minute: 0,
  period: 'week', recipients: [], department: null, lastRun: null,
})

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

// Team stat cards from KPI data
const teamStatCards = computed(() => {
  const t = kpiData.value.teamTotals
  return [
    { label: 'Completadas', value: t.totalCompleted, valueColor: 'text-slate-900', icon: 'fa-check-circle', iconBg: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Cumplimiento', value: t.avgCompliance + '%', valueColor: t.avgCompliance >= 70 ? 'text-emerald-600' : t.avgCompliance >= 40 ? 'text-amber-600' : 'text-red-600', icon: 'fa-bullseye', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Prom. resolución', value: t.avgResolution, suffix: 'días', valueColor: 'text-slate-900', icon: 'fa-clock', iconBg: 'bg-slate-100', iconColor: 'text-slate-500' },
    { label: 'Pendientes', value: t.totalWorkload, valueColor: 'text-slate-900', icon: 'fa-clipboard-list', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Vencidas', value: t.totalOverdue, valueColor: t.totalOverdue > 0 ? 'text-red-600' : 'text-slate-900', icon: 'fa-exclamation-triangle', iconBg: t.totalOverdue > 0 ? 'bg-red-50' : 'bg-slate-100', iconColor: t.totalOverdue > 0 ? 'text-red-500' : 'text-slate-400' },
    { label: 'Horas registradas', value: t.totalHours, suffix: 'h', valueColor: 'text-slate-900', icon: 'fa-stopwatch', iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
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
    .slice(0, 12)
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
function complianceTextColor(rate: number) {
  if (rate >= 70) return 'text-emerald-600'
  if (rate >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function trendBarHeight(value: number, opacity = 1) {
  const max = Math.max(...currentTrend.value.map(p => Math.max(p.completed, p.created || 0)), 1)
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
  const time = date.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
  return `${day} de ${month}, ${time}`
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

async function fetchScheduleConfig() {
  try {
    scheduleConfig.value = await teamReportsService.getScheduleConfig()
  } catch {}
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

// Watch period changes
watch(selectedPeriod, () => fetchKPIs())

// ── Report sending ──

async function sendManualReport() {
  sendingReport.value = true
  reportMsg.value = ''
  try {
    const recipients = reportEmail.value.split(',').map(e => e.trim()).filter(Boolean)
    const result = await teamReportsService.sendTeamReport({ recipients: recipients.length > 0 ? recipients : undefined, period: reportPeriod.value })
    reportMsg.value = result.success ? 'Reporte enviado correctamente' : (result.error || 'Error al enviar')
    reportMsgType.value = result.success ? 'ok' : 'err'
  } catch (e: any) {
    reportMsg.value = e.message || 'Error al enviar el reporte'
    reportMsgType.value = 'err'
  } finally {
    sendingReport.value = false
    setTimeout(() => { reportMsg.value = '' }, 5000)
  }
}

async function toggleSchedule() {
  scheduleConfig.value.enabled = !scheduleConfig.value.enabled
  await saveSchedule()
}

async function saveSchedule() {
  try {
    const updated = await teamReportsService.updateScheduleConfig(scheduleConfig.value)
    if (updated) scheduleConfig.value = updated
  } catch (e) {
    console.error('Error saving schedule:', e)
  }
}

// ── Init ──

onMounted(async () => {
  try {
    const ps: Promise<any>[] = [fetchKPIs(), fetchTrends(), fetchScheduleConfig()]
    if (authStore.canViewClients) ps.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) ps.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) ps.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) ps.push(teamStore.fetchTeam())
    await Promise.all(ps)
  } catch (e) { console.error('Error loading dashboard:', e) }
})
</script>
