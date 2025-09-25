<template>
  <div class="space-y-6">
    <!-- Header with User Role Info -->
  <!-- ...existing code... -->

    <!-- Stats Cards - Role-based visibility -->
    <div class="w-full flex justify-center items-center py-2 mb-6">
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
    
    <!-- ...existing code... -->
      <!-- Recent Activity & Quick Actions Redesigned -->
    <div class="flex justify-center items-center w-full py-6">
      <div v-if="availableQuickActions.length > 0" class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-purple-500/30 flex flex-col items-center justify-center max-w-md w-full mx-auto">
        <h3 class="text-lg font-semibold text-white mb-4 text-center tracking-wide">Acciones Rápidas</h3>
        <div class="flex flex-col gap-3 items-center w-full">
          <router-link
            v-for="action in availableQuickActions"
            :key="action.name"
            :to="action.to"
            :class="`
              flex flex-row items-center justify-start px-4 py-2 w-full min-h-[44px]
              bg-gradient-to-r ${action.colors} rounded-lg shadow-sm
              transition-all duration-200 group hover:scale-[1.03] hover:shadow-lg hover:border-purple-400/40
              border border-transparent
            `"
          >
            <component :is="action.icon" :class="`w-6 h-6 ${action.iconColor} mr-2 transition-colors duration-200 group-hover:text-white`" />
            <span class="text-white text-[15px] font-medium tracking-tight group-hover:text-purple-100">{{ action.name }}</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- ...existing code... -->

    <!-- Department-specific sections -->
    <!-- ...existing code... -->
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Activity } from '../types'
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

const myActivities = ref<Activity[]>([]);

onMounted(async () => {
  try {
    const promises: Promise<any>[] = [];
    if (authStore.canViewClients) {
      promises.push(clientsStore.fetchClients());
    }
    if (authStore.canViewActivities && authStore.user?._id) {
      console.log('[Dashboard] Fetching activities for user:', authStore.user?._id);
      await activitiesStore.fetchActivities();
      console.log('[Dashboard] activitiesStore.activities:', activitiesStore.activities);
      const userId = authStore.user?._id;
      const filtered = activitiesStore.activities
        .filter((a: Activity) => {
          if (!userId) return false;
          if (!(a.status === 'pending' || a.status === 'overdue' || a.status === 'in-progress')) return false;
          if (!a.assignedTo) return false;
          if (typeof a.assignedTo === 'string') {
            return a.assignedTo === userId;
          } else if (typeof a.assignedTo === 'object' && '._id' in a.assignedTo) {
            return a.assignedTo._id === userId;
          }
          return false;
        })
        .sort((a: Activity, b: Activity) => {
          if (a.status === 'overdue' && b.status !== 'overdue') return -1;
          if (a.status !== 'overdue' && b.status === 'overdue') return 1;
          return new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime();
        });
      console.log('[Dashboard] Filtered activities:', filtered);
      myActivities.value = filtered;
    }
    if (authStore.canViewAccounting) {
      promises.push(paymentsStore.fetchPayments());
    }
    await Promise.all(promises);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
});

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
      console.log('[Dashboard] Fetching all activities (secondary onMounted)');
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
