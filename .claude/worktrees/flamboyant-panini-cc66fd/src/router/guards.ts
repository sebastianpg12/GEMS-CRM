import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  const isAuthenticated = await authStore.checkAuth()
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    next('/login')
    return
  }
  
  // Check role-based permissions for specific routes
  const user = authStore.user
  if (!user) {
    next('/login')
    return
  }
  
  // Define route permissions
  const routePermissions: Record<string, (role: string, department?: string) => boolean> = {
    '/reports': (role) => ['admin', 'manager'].includes(role),
    '/accounting': (role) => ['admin', 'manager'].includes(role),
    '/team': (role) => ['admin', 'manager'].includes(role),
    '/cases': (role) => ['admin', 'manager', 'employee'].includes(role),
  }
  
  const permission = routePermissions[to.path]
  if (permission && !permission(user.role, user.department)) {
    // Redirect to dashboard if user doesn't have permission
    next('/')
    return
  }
  
  next()
}

export const guestGuard = async (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  const isAuthenticated = await authStore.checkAuth()
  
  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next('/')
    return
  }
  
  next()
}
