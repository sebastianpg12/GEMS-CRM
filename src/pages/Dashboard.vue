<template>
  <div class="space-y-6 relative min-h-screen">
    <!-- Animated Background -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse animation-delay-3000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/3 rounded-full blur-2xl animate-pulse animation-delay-6000"></div>
      
      <!-- Subtle grid pattern -->
      <div class="absolute inset-0 opacity-[0.02]" style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
    <!-- Welcome Section -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-indigo-900/40 backdrop-blur-xl border border-purple-500/20 p-4 lg:p-6 shadow-2xl">
      <!-- Animated background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div class="absolute bottom-0 left-1/2 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      
      <div class="relative z-10">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-1 animate-fade-in">
              ¡Hola, {{ authStore.user?.name?.split(' ')[0] || 'Usuario' }}! 👋
            </h1>
            <p class="text-gray-300 text-sm animate-fade-in animation-delay-300">
              {{ getWelcomeMessage() }}
            </p>
          </div>
          
          <!-- Stats Grid inside welcome panel -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 min-w-0">
            <!-- Clientes -->
            <PermissionGuard :permissions="['view-clients']" :fallback="false">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-fade-in animation-delay-600 hover:bg-white/15 transition-colors duration-300">
                <div class="flex items-center justify-between mb-1">
                  <UserGroupIcon class="w-4 h-4 text-blue-400" />
                  <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <div class="text-lg font-bold text-white leading-tight">{{ stats.clients }}</div>
                <div class="text-xs text-gray-300">Clientes</div>
              </div>
            </PermissionGuard>
            <!-- Actividades -->
            <PermissionGuard :permissions="['view-activities']" :fallback="false">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-fade-in animation-delay-800 hover:bg-white/15 transition-colors duration-300">
                <div class="flex items-center justify-between mb-1">
                  <ClipboardDocumentListIcon class="w-4 h-4 text-green-400" />
                  <div class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div class="text-lg font-bold text-white leading-tight">{{ stats.activities }}</div>
                <div class="text-xs text-gray-300">Actividades</div>
              </div>
            </PermissionGuard>
            <!-- Ingresos -->
            <PermissionGuard :permissions="['view-accounting']" :fallback="false">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-fade-in animation-delay-1000 hover:bg-white/15 transition-colors duration-300">
                <div class="flex items-center justify-between mb-1">
                  <CurrencyDollarIcon class="w-4 h-4 text-purple-400" />
                  <div class="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
                <div class="text-lg font-bold text-white leading-tight">${{ formattedRevenue }}</div>
                <div class="text-xs text-gray-300">Ingresos</div>
              </div>
            </PermissionGuard>
            <!-- Issues -->
            <PermissionGuard :permissions="['view-cases']" :fallback="false">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-fade-in animation-delay-1200 hover:bg-white/15 transition-colors duration-300">
                <div class="flex items-center justify-between mb-1">
                  <ExclamationTriangleIcon class="w-4 h-4 text-red-400" />
                  <div class="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                </div>
                <div class="text-lg font-bold text-white leading-tight">{{ stats.openIssues }}</div>
                <div class="text-xs text-gray-300">Issues</div>
              </div>
            </PermissionGuard>
            <!-- Equipo -->
            <PermissionGuard :permissions="['view-team']" :fallback="false">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-fade-in animation-delay-1400 hover:bg-white/15 transition-colors duration-300">
                <div class="flex items-center justify-between mb-1">
                  <UsersIcon class="w-4 h-4 text-indigo-400" />
                  <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                </div>
                <div class="text-lg font-bold text-white leading-tight">{{ stats.teamMembers }}</div>
                <div class="text-xs text-gray-300">Equipo</div>
              </div>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions & AI Insights Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <!-- Quick Actions - Left Side -->
      <div class="lg:col-span-1">
        <div v-if="availableQuickActions.length > 0" class="bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-purple-500/20 animate-fade-in animation-delay-1600">
          <h3 class="text-lg font-semibold text-white mb-3 flex items-center">
            <i class="fas fa-bolt text-purple-400 mr-2"></i>
            Acciones Rápidas
          </h3>
          <div class="grid grid-cols-1 gap-2">
            <router-link
              v-for="(action, index) in availableQuickActions.slice(0, 4)"
              :key="action.name"
              :to="action.to"
              :class="`
                group relative overflow-hidden
                flex items-center gap-3 p-3 min-h-[50px]
                bg-gradient-to-r ${action.colors} rounded-lg shadow-lg
                transition-all duration-300 hover:scale-102 hover:shadow-xl hover:shadow-purple-500/25
                border border-transparent hover:border-purple-400/40
                animate-fade-in
              `"
              :style="{ animationDelay: `${1600 + index * 100}ms` }"
            >
              <!-- Icon -->
              <div class="relative z-10">
                <component :is="action.icon" :class="`w-4 h-4 ${action.iconColor} group-hover:scale-110 transition-transform duration-300`" />
              </div>

              <!-- Text -->
              <span class="relative z-10 text-white text-sm font-medium tracking-tight group-hover:text-purple-100 transition-colors duration-300 truncate">
                {{ action.name }}
              </span>
            </router-link>
          </div>
        </div>

        <!-- Motivational Widget - Below Quick Actions -->
        <div class="mt-6">
          <MotivationalWidget />
        </div>
      </div>

      <!-- AI Insights Widget - Right Side -->
      <div class="lg:col-span-2">
        <AIInsightsWidget />
      </div>
    </div>

    <!-- Department-specific sections -->
    <!-- ...existing code... -->
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  useClientsStore, 
  useActivitiesStore, 
  usePaymentsStore, 
  useIssuesStore,
  useTeamStore 
} from '../stores'
import PermissionGuard from '../components/PermissionGuard.vue'
import AIInsightsWidget from '../components/AIInsightsWidget.vue'
import MotivationalWidget from '../components/MotivationalWidget.vue'
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

const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  if (hour < 12) return '¡Buenos días! Comencemos con energía este día.'
  if (hour < 18) return '¡Buenas tardes! ¿Qué actividades tienes planeadas?'
  return '¡Buenas noches! Revisemos el progreso del día.'
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

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

.animation-delay-900 {
  animation-delay: 0.9s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
