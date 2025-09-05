import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'
import Clients from './pages/Clients.vue'
import Activities from './pages/Activities.vue'
import ReportsView from './pages/ReportsView.vue'
import AccountingView from './components/AccountingView.vue'
import CasesView from './components/CasesView.vue'
import TeamView from './components/TeamView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients
  },
  {
    path: '/activities',
    name: 'Activities',
    component: Activities
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsView
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: AccountingView
  },
  {
    path: '/cases',
    name: 'Cases',
    component: CasesView
  },
  {
    path: '/team',
    name: 'Team',
    component: TeamView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
