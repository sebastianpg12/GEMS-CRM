<template>
  <div v-if="hasPermission">
    <slot />
  </div>
  <div v-else class="flex items-center justify-center min-h-[400px]">
    <div class="text-center">
      <div class="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <i class="fas fa-ban text-4xl text-red-600"></i>
      </div>
      <h2 class="text-2xl font-bold text-white mb-4">Acceso Denegado</h2>
      <p class="text-gray-400 mb-6">No tienes permisos para acceder a esta sección.</p>
      <router-link
        to="/"
        class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
      >
        <i class="fas fa-home mr-2"></i>
        Volver al Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

interface Props {
  roles?: string[]
  permissions?: string[]
  requireAll?: boolean
  fallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  permissions: () => [],
  requireAll: false,
  fallback: true
})

const authStore = useAuthStore()

const hasPermission = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user) {
    return false
  }

  const userRole = authStore.user.role

  // Check role-based permissions
  if (props.roles && props.roles.length > 0) {
    const hasRole = props.roles.includes(userRole)
    if (!hasRole) return false
  }

  // Check specific permissions
  if (props.permissions && props.permissions.length > 0) {
    const permissionChecks = props.permissions.map(permission => {
      switch (permission) {
        case 'view-dashboard':
          return authStore.canViewDashboard
        case 'view-clients':
          return authStore.canViewClients
        case 'view-activities':
          return authStore.canViewActivities
        case 'view-reports':
          return authStore.canViewReports
        case 'view-accounting':
          return authStore.canViewAccounting
        case 'view-cases':
          return authStore.canViewCases
        case 'view-team':
          return authStore.canViewTeam
        case 'create-clients':
          return authStore.canCreateClients
        case 'edit-clients':
          return authStore.canEditClients
        case 'delete-clients':
          return authStore.canDeleteClients
        case 'create-activities':
          return authStore.canCreateActivities
        case 'edit-activities':
          return authStore.canEditActivities
        case 'delete-activities':
          return authStore.canDeleteActivities
        case 'manage-team':
          return authStore.canManageTeam
        case 'manage-accounting':
          return authStore.canManageAccounting
        case 'view-marketing':
          return authStore.canViewMarketingSection
        case 'view-sales':
          return authStore.canViewSalesSection
        default:
          return false
      }
    })

    if (props.requireAll) {
      return permissionChecks.every(Boolean)
    } else {
      return permissionChecks.some(Boolean)
    }
  }

  return true
})
</script>
