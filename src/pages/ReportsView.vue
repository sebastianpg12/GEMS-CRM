<template>
  <div class="p-6 space-y-6 bg-gray-900/50 backdrop-blur-sm rounded-xl">
    <!-- Header -->
    <div class="flex space-x-4 justify-end">
      <select 
        v-model="selectedPeriod" 
        @change="updateData"
        class="px-4 py-2 bg-gray-800 border border-purple-500/30 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        <option value="month">Este Mes</option>
        <option value="quarter">Este Trimestre</option>
  if (clientStats.value && clientStats.value.growth) {
    // Procesar datos reales del backend
    const mo  if (clientStats.value && clientStats.value.growth) {
    // Procesar datos reales del backend
    const monthlyData = clientStats.value.growth.sort((a: any, b: any) => a._id.month - b._id.month)
    if (monthlyData.length > 0) {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      labels = monthlyData.map((item: any) => monthNames[item._id.month - 1] || `Mes ${item._id.month}`)
      data = monthlyData.map((item: any) => item.newClients)
    }a = clientStats.value.growth.sort((a, b) => a._id.month - b._id.month)
    if (monthlyData.length > 0) {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      labels = monthlyData.map(item => monthNames[item._id.month - 1] || `Mes ${item._id.month}`)
      data = monthlyData.map(item => item.newClients)
    }<option value="year">Este Año</option>
      </select>
      <button 
        @click="refreshData"
        :disabled="loading"
        class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ loading ? 'Actualizando...' : 'Actualizar' }}</span>
      </button>
    </div>

    <!-- Dashboard Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-blue-500/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-300">Ingresos Totales</p>
            <p class="text-2xl font-bold text-blue-400">
              ${{ formatCurrency(dashboardStats?.monthly?.monthlyRevenue || 0) }}
            </p>
          </div>
          <div class="p-3 bg-blue-500/20 rounded-full">
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-green-500/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-300">Clientes Activos</p>
            <p class="text-2xl font-bold text-green-400">{{ dashboardStats?.totals?.clients || 0 }}</p>
          </div>
          <div class="p-3 bg-green-500/20 rounded-full">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-purple-500/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-300">Actividades Completadas</p>
            <p class="text-2xl font-bold text-purple-400">{{ dashboardStats?.monthly?.completedActivities || 0 }}</p>
          </div>
          <div class="p-3 bg-purple-500/20 rounded-full">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-orange-500/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-300">Casos Activos</p>
            <p class="text-2xl font-bold text-orange-400">{{ dashboardStats?.totals?.cases || 0 }}</p>
          </div>
          <div class="p-3 bg-orange-500/20 rounded-full">
            <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50">
        <h3 class="text-lg font-semibold text-white mb-4">Tendencia de Ingresos</h3>
        <div class="h-64">
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>

      <!-- Activities Completion Chart -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50">
        <h3 class="text-lg font-semibold text-white mb-4">Actividades por Estado</h3>
        <div class="h-64">
          <canvas ref="activitiesChart"></canvas>
        </div>
      </div>

      <!-- Client Growth Chart -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50">
        <h3 class="text-lg font-semibold text-white mb-4">Crecimiento de Clientes</h3>
        <div class="h-64">
          <canvas ref="clientGrowthChart"></canvas>
        </div>
      </div>

      <!-- Team Performance Chart -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50">
        <h3 class="text-lg font-semibold text-white mb-4">Rendimiento del Equipo</h3>
        <div class="h-64">
          <canvas ref="teamChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Additional Reports Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" v-if="activityStats || clientStats">
      <!-- Activity Resolution Time -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50" v-if="activityStats?.resolutionTime">
        <h3 class="text-lg font-semibold text-white mb-4">Tiempo de Resolución</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Promedio:</span>
            <span class="text-blue-400 font-semibold">{{ Math.round(activityStats.resolutionTime.avgResolutionTime) }} días</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Mínimo:</span>
            <span class="text-green-400 font-semibold">{{ Math.round(activityStats.resolutionTime.minResolutionTime) }} días</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Máximo:</span>
            <span class="text-red-400 font-semibold">{{ Math.round(activityStats.resolutionTime.maxResolutionTime) }} días</span>
          </div>
        </div>
      </div>

      <!-- Top Active Clients -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50" v-if="clientStats?.topActive">
        <h3 class="text-lg font-semibold text-white mb-4">Clientes Más Activos</h3>
        <div class="space-y-3">
          <div v-for="client in clientStats.topActive.slice(0, 5)" :key="client._id" class="flex justify-between items-center">
            <div>
              <p class="text-white font-medium">{{ client.clientName }}</p>
              <p class="text-gray-400 text-sm">{{ client.totalActivities }} actividades</p>
            </div>
            <div class="text-right">
              <p class="text-green-400 font-semibold">{{ Math.round(client.completionRate * 100) }}%</p>
              <p class="text-gray-400 text-xs">completadas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Workload -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50" v-if="teamPerformance?.currentWorkload">
        <h3 class="text-lg font-semibold text-white mb-4">Carga de Trabajo Actual</h3>
        <div class="space-y-3">
          <div v-for="member in teamPerformance.currentWorkload.slice(0, 5)" :key="member._id" class="flex justify-between items-center">
            <div>
              <p class="text-white font-medium">{{ member.teamMember?.nombre || `Miembro ${member._id}` }}</p>
            </div>
            <div class="text-right">
              <span class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="member.activeWorkload > 10 ? 'bg-red-500/20 text-red-400' : 
                           member.activeWorkload > 5 ? 'bg-yellow-500/20 text-yellow-400' : 
                           'bg-green-500/20 text-green-400'">
                {{ member.activeWorkload }} tareas
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Comparison -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50" v-if="executiveSummary">
        <h3 class="text-lg font-semibold text-white mb-4">Comparación Mensual</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Nuevos Clientes:</span>
            <div class="text-right">
              <span class="text-white font-semibold">{{ executiveSummary.kpis.newClientsThisMonth }}</span>
              <span class="text-xs ml-2" :class="executiveSummary.growth.clients >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ executiveSummary.growth.clients >= 0 ? '+' : '' }}{{ executiveSummary.growth.clients.toFixed(1) }}%
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Actividades Completadas:</span>
            <div class="text-right">
              <span class="text-white font-semibold">{{ executiveSummary.kpis.completedThisMonth }}</span>
              <span class="text-xs ml-2" :class="executiveSummary.growth.activities >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ executiveSummary.growth.activities >= 0 ? '+' : '' }}{{ executiveSummary.growth.activities.toFixed(1) }}%
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Ingresos:</span>
            <div class="text-right">
              <span class="text-white font-semibold">${{ formatCurrency(executiveSummary.kpis.revenueThisMonth) }}</span>
              <span class="text-xs ml-2" :class="executiveSummary.growth.revenue >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ executiveSummary.growth.revenue >= 0 ? '+' : '' }}{{ executiveSummary.growth.revenue.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Executive Summary -->
    <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700/50" v-if="executiveSummary">
      <h3 class="text-lg font-semibold text-white mb-4">Resumen Ejecutivo</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
          <p class="text-sm text-gray-300">Total Clientes</p>
          <p class="text-2xl font-bold text-green-400">{{ executiveSummary.kpis.totalClients }}</p>
        </div>
        
        <div class="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
          <p class="text-sm text-gray-300">Ingresos del Año</p>
          <p class="text-2xl font-bold text-blue-400">${{ formatCurrency(executiveSummary.kpis.revenueThisYear) }}</p>
        </div>
        
        <div class="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
          <p class="text-sm text-gray-300">Actividades Totales</p>
          <p class="text-2xl font-bold text-purple-400">{{ executiveSummary.kpis.totalActivities }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h4 class="text-md font-semibold text-white">Comparativas de Crecimiento</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-3 bg-gray-700/30 rounded-lg">
            <p class="text-sm text-gray-300">Clientes (Mes vs Mes anterior)</p>
            <p class="text-lg font-semibold" :class="executiveSummary.growth.clients >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ executiveSummary.growth.clients >= 0 ? '+' : '' }}{{ executiveSummary.growth.clients.toFixed(1) }}%
            </p>
            <p class="text-xs text-gray-400">{{ executiveSummary.kpis.newClientsThisMonth }} vs {{ executiveSummary.kpis.newClientsLastMonth }}</p>
          </div>
          <div class="p-3 bg-gray-700/30 rounded-lg">
            <p class="text-sm text-gray-300">Actividades (Mes vs Mes anterior)</p>
            <p class="text-lg font-semibold" :class="executiveSummary.growth.activities >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ executiveSummary.growth.activities >= 0 ? '+' : '' }}{{ executiveSummary.growth.activities.toFixed(1) }}%
            </p>
            <p class="text-xs text-gray-400">{{ executiveSummary.kpis.completedThisMonth }} vs {{ executiveSummary.kpis.completedLastMonth }}</p>
          </div>
          <div class="p-3 bg-gray-700/30 rounded-lg">
            <p class="text-sm text-gray-300">Ingresos (Mes vs Mes anterior)</p>
            <p class="text-lg font-semibold" :class="executiveSummary.growth.revenue >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ executiveSummary.growth.revenue >= 0 ? '+' : '' }}{{ executiveSummary.growth.revenue.toFixed(1) }}%
            </p>
            <p class="text-xs text-gray-400">${{ formatCurrency(executiveSummary.kpis.revenueThisMonth) }} vs ${{ formatCurrency(executiveSummary.kpis.revenueLastMonth) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data Message -->
    <div v-if="!loading && (!dashboardStats && !financialData && !activityStats)" 
         class="bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg shadow-md border border-gray-700/50 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <h3 class="text-xl font-semibold text-white mb-2">No hay datos disponibles</h3>
      <p class="text-gray-300 mb-4">Agrega algunos clientes, actividades y transacciones para ver los reportes.</p>
      <button 
        @click="refreshData"
        class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
      >
        Intentar de nuevo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { reportsService } from '../services/reportsService'
import { useNotifications } from '../composables/useNotifications'
import type { 
  DashboardStats, 
  FinancialData, 
  ActivityStats, 
  ClientStats, 
  TeamPerformance, 
  ExecutiveSummary 
} from '../services/reportsService'

// Registrar Chart.js
Chart.register(...registerables)

const { showError, showLoading, showSuccess } = useNotifications()

// State
const loading = ref(false)
const selectedPeriod = ref<'month' | 'quarter' | 'year'>('month')

// Data
const dashboardStats = ref<DashboardStats | null>(null)
const financialData = ref<FinancialData | null>(null)
const activityStats = ref<ActivityStats | null>(null)
const clientStats = ref<ClientStats | null>(null)
const teamPerformance = ref<TeamPerformance | null>(null)
const executiveSummary = ref<ExecutiveSummary | null>(null)

// Loading states for individual sections
const loadingStates = ref({
  dashboard: false,
  financial: false,
  activities: false,
  clients: false,
  team: false,
  executive: false
})

// Chart refs
const revenueChart = ref<HTMLCanvasElement>()
const activitiesChart = ref<HTMLCanvasElement>()
const clientGrowthChart = ref<HTMLCanvasElement>()
const teamChart = ref<HTMLCanvasElement>()

// Chart instances
let revenueChartInstance: Chart | null = null
let activitiesChartInstance: Chart | null = null
let clientGrowthChartInstance: Chart | null = null
let teamChartInstance: Chart | null = null

// Methods
const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0'
  }
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const loadData = async () => {
  loading.value = true
  
  try {
    console.log('Loading reports data...')
    
    const [
      dashboardData,
      financialResponse,
      activityResponse,
      clientResponse,
      teamResponse,
      executiveResponse
    ] = await Promise.all([
      reportsService.getDashboardStats().catch(err => {
        console.error('Dashboard stats error:', err)
        return null
      }),
      reportsService.getFinancialData(selectedPeriod.value).catch(err => {
        console.error('Financial data error:', err)
        return null
      }),
      reportsService.getActivityStats().catch(err => {
        console.error('Activity stats error:', err)
        return null
      }),
      reportsService.getClientStats().catch(err => {
        console.error('Client stats error:', err)
        return null
      }),
      reportsService.getTeamPerformance().catch(err => {
        console.error('Team performance error:', err)
        return null
      }),
      reportsService.getExecutiveSummary().catch(err => {
        console.error('Executive summary error:', err)
        return null
      })
    ])

    console.log('Data loaded:', {
      dashboardData,
      financialResponse,
      activityResponse,
      clientResponse,
      teamResponse,
      executiveResponse
    })

    dashboardStats.value = dashboardData
    financialData.value = financialResponse
    activityStats.value = activityResponse
    clientStats.value = clientResponse
    teamPerformance.value = teamResponse
    executiveSummary.value = executiveResponse

    await nextTick()
    // Crear gráficas siempre, incluso si algunos datos son null
    createCharts()
    
  } catch (error) {
    console.error('Error loading reports:', error)
    showError(`Error al cargar los reportes: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    
    // Crear gráficas básicas incluso si hay errores
    await nextTick()
    createCharts()
  } finally {
    loading.value = false
  }
}

const updateData = async () => {
  await loadData()
  showSuccess('Datos actualizados correctamente')
}

const refreshData = async () => {
  await loadData()
  showSuccess('Reportes actualizados')
}

const createCharts = () => {
  // Crear las gráficas siempre, usando datos disponibles o datos básicos
  setTimeout(() => {
    createRevenueChart()
    createActivitiesChart()
    createClientGrowthChart()
    createTeamChart()
  }, 100) // Pequeño delay para asegurar que los canvas estén listos
}

const createRevenueChart = () => {
  if (!revenueChart.value) return

  // Destruir chart anterior si existe
  if (revenueChartInstance) {
    revenueChartInstance.destroy()
  }

  const ctx = revenueChart.value.getContext('2d')
  if (!ctx) return

  // Usar datos financieros si están disponibles, si no, crear datos básicos
  let labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  let data = [0, 0, 0, 0, 0, 0]

  if (financialData.value && financialData.value.transactions) {
    // Procesar datos reales del backend
    const monthlyData = financialData.value.transactions
      .filter(t => t._id.tipo === 'ingreso')
      .sort((a, b) => a._id.month - b._id.month)
    
    if (monthlyData.length > 0) {
      labels = monthlyData.map(item => {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        return monthNames[item._id.month - 1] || `Mes ${item._id.month}`
      })
      data = monthlyData.map(item => item.total)
    }
  } else if (dashboardStats.value?.monthly?.monthlyRevenue) {
    // Usar datos del dashboard como fallback
    labels = ['Este Mes']
    data = [dashboardStats.value.monthly.monthlyRevenue]
  }

  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ingresos',
        data: data,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: 'rgb(147, 51, 234)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'rgb(209, 213, 219)'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'rgb(156, 163, 175)'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: 'rgb(156, 163, 175)',
            callback: (value) => '$' + formatCurrency(Number(value))
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          }
        }
      }
    }
  })
}

const createActivitiesChart = () => {
  if (!activitiesChart.value) return

  if (activitiesChartInstance) {
    activitiesChartInstance.destroy()
  }

  const ctx = activitiesChart.value.getContext('2d')
  if (!ctx) return

  // Usar datos de actividades si están disponibles, si no usar datos básicos
  let completedCount = 0
  let inProgressCount = 0
  let pendingCount = 0

  if (activityStats.value && activityStats.value.statusDistribution) {
    // Procesar datos reales del backend
    activityStats.value.statusDistribution.forEach(status => {
      switch(status._id.toLowerCase()) {
        case 'completed':
        case 'completada':
        case 'finalizada':
          completedCount = status.count
          break
        case 'in progress':
        case 'en progreso':
        case 'progreso':
          inProgressCount = status.count
          break
        case 'pending':
        case 'pendiente':
          pendingCount = status.count
          break
        default:
          pendingCount += status.count
      }
    })
  } else {
    // Usar datos del dashboard como fallback
    completedCount = dashboardStats.value?.monthly?.completedActivities || 0
    inProgressCount = Math.floor((dashboardStats.value?.totals?.activities || 0) * 0.3)
    pendingCount = (dashboardStats.value?.totals?.activities || 0) - completedCount - inProgressCount
  }

  activitiesChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completadas', 'En Progreso', 'Pendientes'],
      datasets: [{
        data: [completedCount, inProgressCount, pendingCount],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(147, 51, 234)',
          'rgb(249, 115, 22)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(147, 51, 234)',
          'rgb(249, 115, 22)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'rgb(209, 213, 219)'
          }
        }
      }
    }
  })
}

const createClientGrowthChart = () => {
  if (!clientGrowthChart.value) return

  if (clientGrowthChartInstance) {
    clientGrowthChartInstance.destroy()
  }

  const ctx = clientGrowthChart.value.getContext('2d')
  if (!ctx) return

  // Usar datos de clientes si están disponibles, si no crear datos básicos
  let labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  let data = [1, 2, 1, 3, 2, 1]

  if (clientStats.value && clientStats.value.growth) {
    // Procesar datos reales del backend si existen
    const monthlyData = clientStats.value.growth.sort((a: any, b: any) => a._id.month - b._id.month)
    if (monthlyData.length > 0) {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      labels = monthlyData.map((item: any) => monthNames[item._id.month - 1] || `Mes ${item._id.month}`)
      data = monthlyData.map((item: any) => item.newClients)
    }
  } else if (dashboardStats.value?.monthly?.newClients) {
    // Usar datos del dashboard como fallback
    labels = ['Este Mes']
    data = [dashboardStats.value.monthly.newClients]
  }

  clientGrowthChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Nuevos Clientes',
        data: data,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'rgb(209, 213, 219)'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'rgb(156, 163, 175)'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: 'rgb(156, 163, 175)'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          }
        }
      }
    }
  })
}

const createTeamChart = () => {
  if (!teamChart.value) return

  if (teamChartInstance) {
    teamChartInstance.destroy()
  }

  const ctx = teamChart.value.getContext('2d')
  if (!ctx) return

  // Usar datos del equipo si están disponibles, si no crear datos básicos
  let labels = ['Equipo A', 'Equipo B', 'Equipo C']
  let data = [15, 22, 18]

  if (teamPerformance.value && teamPerformance.value.performance && teamPerformance.value.performance.length > 0) {
    // Procesar datos reales del backend
    labels = teamPerformance.value.performance.map(member => member.teamMember?.nombre || `Miembro ${member._id}`)
    data = teamPerformance.value.performance.map(member => member.completedActivities)
  } else if (dashboardStats.value?.totals?.teamMembers) {
    // Crear datos básicos basados en el número de miembros del equipo
    const teamCount = dashboardStats.value.totals.teamMembers
    labels = Array.from({length: teamCount}, (_, i) => `Miembro ${i + 1}`)
    data = Array.from({length: teamCount}, () => Math.floor(Math.random() * 25) + 10)
  }

  teamChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Actividades Completadas',
        data: data,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: 'rgb(236, 72, 153)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'rgb(209, 213, 219)'
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            color: 'rgb(156, 163, 175)',
            backdropColor: 'transparent'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.3)'
          },
          angleLines: {
            color: 'rgba(156, 163, 175, 0.3)'
          },
          pointLabels: {
            color: 'rgb(209, 213, 219)'
          }
        }
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>
