<template>
  <div v-if="hasPermission">
    <slot />
  </div>
  <div v-else-if="fallback" class="flex items-center justify-center min-h-[200px]">
    <div class="text-center">
      <div class="w-12 h-12 mx-auto mb-4 bg-red-100/20 rounded-full flex items-center justify-center">
        <i class="fas fa-ban text-xl text-red-400"></i>
      </div>
      <h3 class="text-lg font-semibold text-white mb-2">Acceso Denegado</h3>
      <p class="text-gray-400 text-sm mb-4">No tienes permisos para acceder a esta sección.</p>
      <router-link
        to="/"
        class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
      >
        <i class="fas fa-home mr-1 text-sm"></i>
        Volver al Dashboard
      </router-link>
    </div>
  </div>
  <!-- When fallback is false, show nothing -->
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
  if (props.permissions && Array.isArray(props.permissions) && props.permissions.length > 0) {
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
        case 'create-cases':
          return authStore.canCreateCases
        case 'edit-cases':
          return authStore.canEditCases
        case 'delete-cases':
          return authStore.canDeleteCases
        case 'create-team':
          return authStore.canCreateTeam
        case 'edit-team':
          return authStore.canEditTeam
        case 'delete-team':
          return authStore.canDeleteTeam
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
