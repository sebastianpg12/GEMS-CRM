<template>
  <div class="space-y-6">
    <!-- Header with User Role Info -->
  <!-- ...existing code... -->

    <!-- Stats Cards - Role-based visibility -->
    <div class="w-full flex justify-center items-center py-2">
      <div class="flex flex-row flex-wrap justify-center items-center gap-2 sm:gap-4 w-full max-w-3xl px-2">
        <!-- Clientes -->
        <PermissionGuard :permissions="['view-clients']" :fallback="false">
          <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg px-3 py-2 border border-blue-500/20 min-w-[100px] flex flex-col justify-between items-center">
            <p class="text-blue-400 text-[13px] font-medium leading-tight">Total Clientes</p>
            <div class="flex items-center justify-between w-full mt-1">
              <span class="text-xl font-bold text-white leading-none">{{ stats.clients }}</span>
              <UserGroupIcon class="w-4 h-4 text-blue-400 ml-2" />
            </div>
          </div>
        </PermissionGuard>
        <!-- Actividades -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg px-3 py-2 border border-green-500/20 min-w-[100px] flex flex-col justify-between items-center">
            <p class="text-green-400 text-[13px] font-medium leading-tight">Actividades</p>
            <div class="flex items-center justify-between w-full mt-1">
              <span class="text-xl font-bold text-white leading-none">{{ stats.activities }}</span>
              <ClipboardDocumentListIcon class="w-4 h-4 text-green-400 ml-2" />
            </div>
          </div>
        </PermissionGuard>
        <!-- Ingresos -->
        <PermissionGuard :permissions="['view-accounting']" :fallback="false">
          <div class="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg px-3 py-2 border border-purple-500/20 min-w-[100px] flex flex-col justify-between items-center">
            <p class="text-purple-400 text-[13px] font-medium leading-tight">Ingresos Totales</p>
            <div class="flex items-center justify-between w-full mt-1">
              <span class="text-xl font-bold text-white leading-none">${{ formattedRevenue }}</span>
              <CurrencyDollarIcon class="w-4 h-4 text-purple-400 ml-2" />
            </div>
          </div>
        </PermissionGuard>
        <!-- Issues -->
        <PermissionGuard :permissions="['view-cases']" :fallback="false">
          <div class="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg px-3 py-2 border border-red-500/20 min-w-[100px] flex flex-col justify-between items-center">
            <p class="text-red-400 text-[13px] font-medium leading-tight">Issues Abiertos</p>
            <div class="flex items-center justify-between w-full mt-1">
              <span class="text-xl font-bold text-white leading-none">{{ stats.openIssues }}</span>
              <ExclamationTriangleIcon class="w-4 h-4 text-red-400 ml-2" />
            </div>
          </div>
        </PermissionGuard>
        <!-- Equipo -->
        <PermissionGuard :permissions="['view-team']" :fallback="false">
          <div class="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-lg px-3 py-2 border border-indigo-500/20 min-w-[100px] flex flex-col justify-between items-center">
            <p class="text-indigo-400 text-[13px] font-medium leading-tight">Miembros Equipo</p>
            <div class="flex items-center justify-between w-full mt-1">
              <span class="text-xl font-bold text-white leading-none">{{ stats.teamMembers }}</span>
              <UsersIcon class="w-4 h-4 text-indigo-400 ml-2" />
            </div>
          </div>
        </PermissionGuard>
      </div>
    </div>
    </div>
    
    <!-- Recent Activity & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Payments Due - Only for Admin/Manager -->
      <PermissionGuard :permissions="['view-activities']" :fallback="false">
        <div class="bg-gradient-to-br from-green-800/20 to-green-900/10 rounded-2xl p-6 border border-green-500/20 mb-6">
          <h3 class="text-xl font-bold text-green-400 mb-4">
            <ClipboardDocumentListIcon class="w-6 h-6 inline-block mr-2 text-green-400" />
            Mis Actividades
          </h3>
          <div v-if="myActivities.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
              <router-link
                v-for="activity in myActivities"
                :key="activity._id"
                to="/activities"
                class="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-green-700/40 transition-all duration-200 border border-gray-600/20 cursor-pointer"
              >
                <div>
                  <p class="text-white font-medium">{{ activity.title }}</p>
                  <p class="text-gray-400 text-sm">{{ formatDate(activity.dueDate || activity.date) }}</p>
                </div>
                <span class="px-3 py-1 text-xs rounded-full font-medium bg-green-500/20 text-green-400">
                  {{ activity.status }}
                </span>
              </router-link>
          </div>
          <div v-else class="text-gray-400">No tienes actividades asignadas.</div>
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
</template>

<script setup lang="ts">
// Actividades propias del usuario autenticado
import type { Activity } from '../types'
const myActivities = ref<Activity[]>([]);

onMounted(async () => {
  await activitiesStore.fetchMyPendingActivities();
  myActivities.value = activitiesStore.activities;
});
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
