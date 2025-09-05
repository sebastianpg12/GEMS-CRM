<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p class="text-gray-400 mt-2">Resumen general del sistema CRM</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <!-- Clientes Card -->
      <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-400 text-sm font-medium">Total Clientes</p>
            <p class="text-2xl font-bold text-white">{{ stats.clients }}</p>
          </div>
          <div class="p-3 bg-blue-500/20 rounded-full">
            <UserGroupIcon class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>
      
      <!-- Actividades Card -->
      <div class="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-400 text-sm font-medium">Actividades</p>
            <p class="text-2xl font-bold text-white">{{ stats.activities }}</p>
          </div>
          <div class="p-3 bg-green-500/20 rounded-full">
            <ClipboardDocumentListIcon class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>
      
      <!-- Ingresos Card -->
      <div class="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-6 border border-purple-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-400 text-sm font-medium">Ingresos Totales</p>
            <p class="text-2xl font-bold text-white">${{ formattedRevenue }}</p>
          </div>
          <div class="p-3 bg-purple-500/20 rounded-full">
            <CurrencyDollarIcon class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>
      
      <!-- Issues Card -->
      <div class="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl p-6 border border-red-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-400 text-sm font-medium">Issues Abiertos</p>
            <p class="text-2xl font-bold text-white">{{ stats.openIssues }}</p>
          </div>
          <div class="p-3 bg-red-500/20 rounded-full">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-400" />
          </div>
        </div>
      </div>

      <!-- Team Members Card -->
      <div class="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-2xl p-6 border border-indigo-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-indigo-400 text-sm font-medium">Miembros Equipo</p>
            <p class="text-2xl font-bold text-white">{{ stats.teamMembers }}</p>
          </div>
          <div class="p-3 bg-indigo-500/20 rounded-full">
            <UsersIcon class="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activities -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Actividades Recientes</h3>
          <router-link to="/activities" class="text-purple-400 hover:text-purple-300 text-sm font-medium">
            Ver todas
          </router-link>
        </div>
        
        <div class="space-y-4">
          <div v-if="recentActivities.length === 0" class="text-center text-gray-400 py-8">
            <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <p>No hay actividades recientes</p>
          </div>
          <div 
            v-for="activity in recentActivities.slice(0, 5)" 
            :key="activity._id"
            class="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200 border border-gray-600/20"
          >
            <div class="flex-1">
              <p class="text-white font-medium">{{ activity.title }}</p>
              <p class="text-gray-400 text-sm">{{ formatDate(activity.date) }}</p>
            </div>
            <span 
              class="px-3 py-1 text-xs rounded-full font-medium"
              :class="getStatusClass(activity.status)"
            >
              {{ activity.status }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Payments Due -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Pagos Pendientes</h3>
          <router-link to="/accounting" class="text-purple-400 hover:text-purple-300 text-sm font-medium">
            Ver todos
          </router-link>
        </div>
        
        <div class="space-y-4">
          <div v-if="pendingPayments.length === 0" class="text-center text-gray-400 py-8">
            <CurrencyDollarIcon class="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <p>No hay pagos pendientes</p>
          </div>
          <div 
            v-for="payment in pendingPayments.slice(0, 5)" 
            :key="payment._id"
            class="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200 border border-gray-600/20"
          >
            <div>
              <p class="text-white font-medium">${{ payment.amount.toLocaleString() }}</p>
              <p class="text-gray-400 text-sm">Vence: {{ formatDate(payment.dueDate) }}</p>
            </div>
            <span 
              class="px-3 py-1 text-xs rounded-full font-medium"
              :class="getPaymentStatusClass(payment.status)"
            >
              {{ payment.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <h3 class="text-xl font-bold text-white mb-6">Acciones Rápidas</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <router-link
          to="/clients"
          class="flex flex-col items-center p-4 bg-gradient-to-br from-blue-600/20 to-blue-700/20 
                 rounded-xl border border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30 
                 transition-all duration-300 text-center group transform hover:scale-105"
        >
          <UserPlusIcon class="w-8 h-8 text-blue-400 group-hover:text-blue-300 mb-2" />
          <span class="text-white text-sm font-medium">Nuevo Cliente</span>
        </router-link>
        
        <router-link
          to="/activities"
          class="flex flex-col items-center p-4 bg-gradient-to-br from-green-600/20 to-green-700/20 
                 rounded-xl border border-green-500/30 hover:from-green-500/30 hover:to-green-600/30 
                 transition-all duration-300 text-center group transform hover:scale-105"
        >
          <PlusCircleIcon class="w-8 h-8 text-green-400 group-hover:text-green-300 mb-2" />
          <span class="text-white text-sm font-medium">Nueva Actividad</span>
        </router-link>
        
        <router-link
          to="/accounting"
          class="flex flex-col items-center p-4 bg-gradient-to-br from-purple-600/20 to-purple-700/20 
                 rounded-xl border border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30 
                 transition-all duration-300 text-center group transform hover:scale-105"
        >
          <BanknotesIcon class="w-8 h-8 text-purple-400 group-hover:text-purple-300 mb-2" />
          <span class="text-white text-sm font-medium">Registrar Pago</span>
        </router-link>
        
        <router-link
          to="/cases"
          class="flex flex-col items-center p-4 bg-gradient-to-br from-orange-600/20 to-orange-700/20 
                 rounded-xl border border-orange-500/30 hover:from-orange-500/30 hover:to-orange-600/30 
                 transition-all duration-300 text-center group transform hover:scale-105"
        >
          <ExclamationCircleIcon class="w-8 h-8 text-orange-400 group-hover:text-orange-300 mb-2" />
          <span class="text-white text-sm font-medium">Nuevo Caso</span>
        </router-link>

        <router-link
          to="/team"
          class="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-600/20 to-indigo-700/20 
                 rounded-xl border border-indigo-500/30 hover:from-indigo-500/30 hover:to-indigo-600/30 
                 transition-all duration-300 text-center group transform hover:scale-105"
        >
          <UsersIcon class="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 mb-2" />
          <span class="text-white text-sm font-medium">Gestionar Equipo</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  useClientsStore, 
  useActivitiesStore, 
  usePaymentsStore, 
  useIssuesStore,
  useTeamStore 
} from '../stores'
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  PlusCircleIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'

const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const paymentsStore = usePaymentsStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const stats = computed(() => ({
  clients: clientsStore.clients.length,
  activities: activitiesStore.activities.length,
  openIssues: issuesStore.issues.filter(i => i.status === 'open').length,
  teamMembers: teamStore.members.length,
}))

const formattedRevenue = computed(() => {
  return paymentsStore.totalRevenue.toLocaleString()
})

const recentActivities = computed(() => 
  [...activitiesStore.activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
)

const pendingPayments = computed(() => 
  paymentsStore.pendingPayments
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }
  return classes[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
}

const getPaymentStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    paid: 'bg-green-500/20 text-green-400 border border-green-500/30',
    overdue: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }
  return classes[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
}

onMounted(async () => {
  try {
    await Promise.all([
      clientsStore.fetchClients(),
      activitiesStore.fetchActivities(),
      paymentsStore.fetchPayments(),
      paymentsStore.fetchSummary(), // Cargar el resumen con gastos fijos incluidos
      issuesStore.fetchIssues(),
      teamStore.fetchTeam()
    ])
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>
