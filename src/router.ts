import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

// Pages
import Dashboard from './pages/Dashboard.vue'
import Login from './pages/Login.vue'
import Clients from './pages/Clients.vue'
import Activities from './pages/Activities.vue'
import ReportsView from './pages/ReportsView.vue'
import AccountingView from './components/AccountingView.vue'
import CasesView from './components/CasesView.vue'
import TeamView from './components/TeamView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
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
    meta: { requiresAuth: true }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: Activities,
    meta: { requiresAuth: true }
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
      requiredRoles: ['admin', 'manager', 'employee']
    }
  },
  {
    path: '/team',
    name: 'Team',
    component: TeamView,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['admin', 'manager']
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
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
  
  // Check role-based permissions
  if (to.meta.requiredRoles && authStore.user) {
    const userRole = authStore.user.role
    const requiredRoles = to.meta.requiredRoles as string[]
    
    if (!requiredRoles.includes(userRole)) {
      // Redirect to dashboard if user doesn't have permission
      next('/')
      return
    }
  }
  
  next()
})

export default router
