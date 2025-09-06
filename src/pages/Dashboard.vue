<template>
  <div class="space-y-6">
    <!-- Header with User Role Info -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p class="text-gray-400 mt-2">
          Bienvenido, {{ authStore.user?.name }}
          <span class="ml-2 px-2 py-1 bg-purple-600/20 rounded-full text-xs">
            {{ getRoleDisplayName(authStore.user?.role) }}
          </span>
        </p>
      </div>
      
      <!-- Role-based visibility badge -->
      <div class="flex items-center space-x-2 text-sm">
        <i class="fas fa-shield-alt text-purple-400"></i>
        <span class="text-gray-400">
          Acceso: {{ authStore.user?.department }}
        </span>
      </div>
    </div>

    <!-- Stats Cards - Role-based visibility -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <!-- Clientes Card - Everyone can see -->
      <PermissionGuard :permissions="['view-clients']" :fallback="false">
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
      </PermissionGuard>
      
      <!-- Actividades Card - Everyone can see -->
      <PermissionGuard :permissions="['view-activities']" :fallback="false">
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
      </PermissionGuard>
      
      <!-- Ingresos Card - Only Admin/Manager -->
      <PermissionGuard :permissions="['view-accounting']" :fallback="false">
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
      </PermissionGuard>
      
      <!-- Issues Card - Admin/Manager/Employee -->
      <PermissionGuard :permissions="['view-cases']" :fallback="false">
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
      </PermissionGuard>

      <!-- Team Members Card - Only Admin/Manager -->
      <PermissionGuard :permissions="['view-team']" :fallback="false">
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
      </PermissionGuard>
    </div>
    
    <!-- Recent Activity & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activities -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Actividades Recientes</h3>
          <router-link 
            v-if="authStore.canViewActivities"
            to="/activities" 
            class="text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
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
      
      <!-- Payments Due - Only for Admin/Manager -->
      <PermissionGuard :permissions="['view-accounting']" :fallback="false">
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
      </PermissionGuard>
      
      <!-- Role-specific information for viewers -->
      <div 
        v-if="authStore.userRole === 'viewer'" 
        class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20"
      >
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
            <i class="fas fa-eye text-2xl text-purple-400"></i>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Acceso Limitado</h3>
          <p class="text-gray-400">
            Como visualizador, tienes acceso de solo lectura a clientes y actividades.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions - Role-based -->
    <div v-if="availableQuickActions.length > 0" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <h3 class="text-xl font-bold text-white mb-6">Acciones Rápidas</h3>
      <div class="flex flex-wrap gap-4 justify-center md:justify-start">
        <router-link
          v-for="action in availableQuickActions"
          :key="action.name"
          :to="action.to"
          :class="`flex flex-col items-center p-4 bg-gradient-to-br ${action.colors} rounded-xl transition-all duration-300 text-center group transform hover:scale-105 min-w-[140px]`"
        >
          <component :is="action.icon" :class="`w-8 h-8 ${action.iconColor} mb-2`" />
          <span class="text-white text-sm font-medium">{{ action.name }}</span>
        </router-link>
      </div>
    </div>

    <!-- Department-specific sections -->
    <div v-if="showDepartmentSections" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Marketing Section -->
      <PermissionGuard :permissions="['view-marketing']" :fallback="false">
        <div class="bg-gradient-to-br from-pink-800/20 to-pink-900/10 rounded-2xl p-6 border border-pink-500/20">
          <h3 class="text-xl font-bold text-pink-400 mb-4">
            <i class="fas fa-bullhorn mr-2"></i>
            Sección Marketing
          </h3>
          <p class="text-gray-300 mb-4">Herramientas específicas para el departamento de Marketing</p>
          <div class="space-y-2">
            <div class="text-sm text-gray-400">• Campañas publicitarias</div>
            <div class="text-sm text-gray-400">• Análisis de mercado</div>
            <div class="text-sm text-gray-400">• Métricas de engagement</div>
          </div>
        </div>
      </PermissionGuard>
      
      <!-- Sales Section -->
      <PermissionGuard :permissions="['view-sales']" :fallback="false">
        <div class="bg-gradient-to-br from-emerald-800/20 to-emerald-900/10 rounded-2xl p-6 border border-emerald-500/20">
          <h3 class="text-xl font-bold text-emerald-400 mb-4">
            <i class="fas fa-chart-line mr-2"></i>
            Sección Ventas
          </h3>
          <p class="text-gray-300 mb-4">Herramientas específicas para el departamento de Ventas</p>
          <div class="space-y-2">
            <div class="text-sm text-gray-400">• Pipeline de ventas</div>
            <div class="text-sm text-gray-400">• Seguimiento de leads</div>
            <div class="text-sm text-gray-400">• Comisiones y metas</div>
          </div>
        </div>
      </PermissionGuard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  useClientsStore, 
  useActivitiesStore, 
  usePaymentsStore, 
  useIssuesStore,
  useTeamStore 
} from '../stores'
import PermissionGuard from '../components/PermissionGuard.vue'
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

const authStore = useAuthStore()
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

const showDepartmentSections = computed(() => {
  return authStore.canViewMarketingSection || authStore.canViewSalesSection
})

// Computed property for available quick actions
const availableQuickActions = computed(() => {
  const actions = []
  
  if (authStore.canCreateClients) {
    actions.push({
      name: 'Nuevo Cliente',
      to: '/clients',
      icon: UserPlusIcon,
      colors: 'from-blue-600/20 to-blue-700/20 border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30',
      iconColor: 'text-blue-400 group-hover:text-blue-300'
    })
  }
  
  if (authStore.canCreateActivities) {
    actions.push({
      name: 'Nueva Actividad',
      to: '/activities',
      icon: PlusCircleIcon,
      colors: 'from-green-600/20 to-green-700/20 border-green-500/30 hover:from-green-500/30 hover:to-green-600/30',
      iconColor: 'text-green-400 group-hover:text-green-300'
    })
  }
  
  if (authStore.canViewAccounting) {
    actions.push({
      name: 'Registrar Pago',
      to: '/accounting',
      icon: BanknotesIcon,
      colors: 'from-purple-600/20 to-purple-700/20 border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30',
      iconColor: 'text-purple-400 group-hover:text-purple-300'
    })
  }
  
  if (authStore.canCreateCases) {
    actions.push({
      name: 'Nuevo Caso',
      to: '/cases',
      icon: ExclamationCircleIcon,
      colors: 'from-orange-600/20 to-orange-700/20 border-orange-500/30 hover:from-orange-500/30 hover:to-orange-600/30',
      iconColor: 'text-orange-400 group-hover:text-orange-300'
    })
  }
  
  if (authStore.canCreateTeam) {
    actions.push({
      name: 'Gestionar Equipo',
      to: '/team',
      icon: UsersIcon,
      colors: 'from-indigo-600/20 to-indigo-700/20 border-indigo-500/30 hover:from-indigo-500/30 hover:to-indigo-600/30',
      iconColor: 'text-indigo-400 group-hover:text-indigo-300'
    })
  }
  
  return actions
})

const getRoleDisplayName = (role?: string) => {
  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Empleado',
    viewer: 'Visualizador'
  }
  return roleNames[role || ''] || role
}

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
    // Only fetch data user has permission to see
    const promises: Promise<any>[] = []
    
    if (authStore.canViewClients) {
      promises.push(clientsStore.fetchClients())
    }
    
    if (authStore.canViewActivities) {
      promises.push(activitiesStore.fetchActivities())
    }
    
    if (authStore.canViewAccounting) {
      promises.push(paymentsStore.fetchPayments())
      promises.push(paymentsStore.fetchSummary())
    }
    
    if (authStore.canViewCases) {
      promises.push(issuesStore.fetchIssues())
    }
    
    if (authStore.canViewTeam) {
      promises.push(teamStore.fetchTeam())
    }
    
    await Promise.all(promises)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>
