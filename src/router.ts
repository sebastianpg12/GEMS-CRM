import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

// Pages
import Dashboard from './pages/Dashboard.vue'
import Login from './pages/Login.vue'
import Clients from './pages/Clients.vue'
import Activities from './pages/Activities.vue'
import ReportsView from './pages/ReportsView.vue'
import Team from './pages/Team.vue'
import TeamActivities from './pages/TeamActivities.vue'
import AccountingView from './components/AccountingView.vue'
import CasesView from './components/CasesView.vue'
import ProfileView from './pages/ProfileView.vue'
import ChatPage from './pages/ChatPage.vue'
import ClientDetail from './pages/ClientDetail.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/clients/:id',
    name: 'ClientDetail',
    component: ClientDetail,
    meta: { requiresAuth: true, requiredPermissions: ['view-clients'] }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-clients']
    }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: Activities,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-activities']
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsView,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['admin', 'manager']
    }
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: AccountingView,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['admin', 'manager']
    }
  },
  {
    path: '/cases',
    name: 'Cases',
    component: CasesView,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-cases']
    }
  },
  {
    path: '/team',
    name: 'Team',
    component: Team,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-team']
    }
  },
  {
    path: '/team-activities',
    name: 'TeamActivities',
    component: TeamActivities,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-activities', 'view-team']
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { 
      requiresAuth: true
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: { 
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Global navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Always allow access to login page
  if (to.path === '/login') {
    // If already authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      next('/')
      return
    }
    next()
    return
  }
  
  // For all other routes, check authentication
  if (!authStore.isAuthenticated) {
    // Try to restore session from localStorage
    const restored = await authStore.checkAuth()
    
    if (!restored) {
      next('/login')
      return
    }
  }
  
  // Check role-based permissions (legacy support)
  if (to.meta.requiredRoles && authStore.user) {
    const userRole = authStore.user.role
    const requiredRoles = to.meta.requiredRoles as string[]
    
    if (!requiredRoles.includes(userRole)) {
      // Redirect to dashboard if user doesn't have permission
      next('/')
      return
    }
  }
  
  // Check permission-based access (new system)
  if (to.meta.requiredPermissions && authStore.user) {
    const requiredPermissions = to.meta.requiredPermissions as string[]
    const hasPermission = requiredPermissions.some(permission => {
      switch (permission) {
        case 'view-clients':
          return authStore.canViewClients
        case 'view-activities':
          return authStore.canViewActivities
        case 'view-team':
          return authStore.canViewTeam
        case 'view-accounting':
          return authStore.canViewAccounting
        case 'view-reports':
          return authStore.canViewReports
        case 'view-cases':
          return authStore.canViewCases
        default:
          return false
      }
    })
    
    if (!hasPermission) {
      // Redirect to dashboard if user doesn't have permission
      next('/')
      return
    }
  }
  
  next()
})

export default router
