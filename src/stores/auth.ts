import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'

export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'employee' | 'viewer'
  department: string
  position: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')
  
  // Role-based permissions
  const canViewDashboard = computed(() => isAuthenticated.value)
  const canViewClients = computed(() => isAuthenticated.value)
  const canViewActivities = computed(() => isAuthenticated.value)
  const canViewReports = computed(() => ['admin', 'manager'].includes(user.value?.role || ''))
  const canViewAccounting = computed(() => ['admin', 'manager'].includes(user.value?.role || ''))
  const canViewCases = computed(() => ['admin', 'manager', 'employee'].includes(user.value?.role || ''))
  const canViewTeam = computed(() => ['admin', 'manager'].includes(user.value?.role || ''))
  
  // Create/Edit permissions
  const canCreateClients = computed(() => ['admin', 'manager', 'employee'].includes(user.value?.role || ''))
  const canEditClients = computed(() => ['admin', 'manager', 'employee'].includes(user.value?.role || ''))
  const canDeleteClients = computed(() => ['admin', 'manager'].includes(user.value?.role || ''))
  
  const canCreateActivities = computed(() => isAuthenticated.value)
  const canEditActivities = computed(() => {
    if (!user.value) return false
    return ['admin', 'manager'].includes(user.value.role) || user.value.role === 'employee'
  })
  const canDeleteActivities = computed(() => ['admin', 'manager'].includes(user.value?.role || ''))
  
  const canManageTeam = computed(() => ['admin', 'manager'].includes(user.value?.role || ''))
  const canManageAccounting = computed(() => user.value?.role === 'admin')

  // Department-based access (for more granular control)
  const canViewMarketingSection = computed(() => {
    if (!user.value) return false
    return user.value.role === 'admin' || 
           (user.value.role === 'manager' && user.value.department === 'Marketing') ||
           (user.value.department === 'Marketing')
  })
  
  const canViewSalesSection = computed(() => {
    if (!user.value) return false
    return user.value.role === 'admin' || 
           (user.value.role === 'manager' && user.value.department === 'Ventas') ||
           (user.value.department === 'Ventas')
  })

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('🚀 Attempting login with:', credentials.email)
      
      const response = await authService.login(credentials)
      
      if (response.success && response.user && response.token) {
        user.value = response.user
        token.value = response.token
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        console.log('✅ Login successful!')
        console.log('👤 User:', response.user?.name, '- Role:', response.user?.role)
        
        return { success: true }
      } else {
        console.log('❌ Login failed:', response.message)
        error.value = response.message || 'Error al iniciar sesión'
        return { success: false, message: error.value }
      }
    } catch (err: any) {
      console.log('❌ Login error:', err)
      error.value = err.message || 'Error de conexión'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await authService.logout()
      }
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }

  const checkAuth = async () => {
    console.log('🔍 Checking auth...')
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    console.log('📦 Stored token:', !!storedToken)
    console.log('👤 Stored user:', !!storedUser)
    
    if (!storedToken || !storedUser) {
      console.log('❌ No stored credentials found')
      return false
    }

    try {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      
      console.log('✅ Auth restored from localStorage')
      console.log('👤 User:', user.value?.name, '- Role:', user.value?.role)
      
      // Verify token is still valid
      const response = await authService.verifyToken()
      if (!response.success) {
        console.log('❌ Token verification failed')
        await logout()
        return false
      }
      
      console.log('✅ Token verified successfully')
      return true
    } catch (err) {
      console.log('❌ Error restoring auth:', err)
      await logout()
      return false
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.updateProfile(profileData)
      
      if (response.success && user.value) {
        user.value = { ...user.value, ...response.user }
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true }
      } else {
        error.value = response.message || 'Error al actualizar perfil'
        return { success: false, message: error.value }
      }
    } catch (err: any) {
      error.value = err.message || 'Error de conexión'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const getAvailableModules = computed(() => {
    if (!user.value) return []
    
    const modules = [
      { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', path: '/', canAccess: canViewDashboard.value }
    ]
    
    if (canViewClients.value) {
      modules.push({ id: 'clients', name: 'Clientes', icon: 'fas fa-users', path: '/clients', canAccess: true })
    }
    
    if (canViewActivities.value) {
      modules.push({ id: 'activities', name: 'Actividades', icon: 'fas fa-tasks', path: '/activities', canAccess: true })
    }
    
    if (canViewReports.value) {
      modules.push({ id: 'reports', name: 'Reportes', icon: 'fas fa-chart-bar', path: '/reports', canAccess: true })
    }
    
    if (canViewAccounting.value) {
      modules.push({ id: 'accounting', name: 'Contabilidad', icon: 'fas fa-calculator', path: '/accounting', canAccess: true })
    }
    
    if (canViewCases.value) {
      modules.push({ id: 'cases', name: 'Casos', icon: 'fas fa-folder', path: '/cases', canAccess: true })
    }
    
    if (canViewTeam.value) {
      modules.push({ id: 'team', name: 'Equipo', icon: 'fas fa-users-cog', path: '/team', canAccess: true })
    }
    
    return modules.filter(m => m.canAccess)
  })

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isManager,
    
    // Permissions
    canViewDashboard,
    canViewClients,
    canViewActivities,
    canViewReports,
    canViewAccounting,
    canViewCases,
    canViewTeam,
    canCreateClients,
    canEditClients,
    canDeleteClients,
    canCreateActivities,
    canEditActivities,
    canDeleteActivities,
    canManageTeam,
    canManageAccounting,
    canViewMarketingSection,
    canViewSalesSection,
    getAvailableModules,
    
    // Actions
    login,
    logout,
    checkAuth,
    updateProfile
  }
})
