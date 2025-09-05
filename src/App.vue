<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Navigation Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/90 backdrop-blur-sm border-r border-purple-500/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0" 
         :class="{ '-translate-x-full': !sidebarOpen && !isDesktop }">
      
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 border-b border-purple-500/20">
        <div class="flex items-center">
          <img 
            src="./assets/logo.webp" 
            alt="GEMS Logo" 
            class="w-8 h-8 mr-3 rounded-lg shadow-lg"
          />
          <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            GEMS CRM
          </h1>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <router-link
            v-for="module in modules"
            :key="module.id"
            :to="module.path"
            :class="[
              'w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 transform hover:scale-105',
              $route.path === module.path
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            ]"
          >
            <i :class="module.icon" class="w-5 h-5 mr-3"></i>
            {{ module.name }}
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="p-2 rounded-lg bg-gray-900/90 backdrop-blur-sm text-white border border-purple-500/20"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- Main Content -->
    <div class="lg:ml-64">
      <!-- Header -->
      <header class="bg-gray-900/50 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-40">
        <div class="flex items-center justify-between px-6 py-4">
          <div>
            <h2 class="text-2xl font-bold text-white">{{ getCurrentModuleName() }}</h2>
            <p class="text-gray-400 text-sm">{{ getCurrentModuleDescription() }}</p>
          </div>
          
          <!-- Header Actions -->
          <div class="flex items-center space-x-4">
            <button
              v-if="canCreate()"
              @click="openCreateModal"
              class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25"
            >
              <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Crear Nuevo
            </button>
            
            <!-- Search -->
            <div class="relative">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar..."
                class="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              >
              <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="p-6">
        <router-view />
      </main>
    </div>

    <!-- Universal Modal for Create/Edit -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h3 class="text-xl font-bold text-white">
            {{ modalMode === 'create' ? 'Crear' : 'Editar' }} {{ getCurrentModuleName() }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-6" :key="`${currentModule}-${modalMode}`">
          <ClientForm 
            v-if="currentModule === 'clients'"
            :item="selectedItem"
            :mode="modalMode"
            @save="handleSave"
            @cancel="closeModal"
          />
          
          <ActivityForm 
            v-else-if="currentModule === 'activities'"
            :item="selectedItem"
            :mode="modalMode"
            :clients="getClientsForActivityForm()"
            @save="handleSave"
            @cancel="closeModal"
          />
          
          <!-- Placeholder for other form components -->
          <div v-else class="text-center py-8">
            <i class="fas fa-cog text-4xl text-gray-600 mb-4"></i>
            <p class="text-gray-400">Formulario en desarrollo para {{ getCurrentModuleName() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile backdrop -->
    <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import DashboardView from './components/modules/DashboardView.vue'
import ClientsView from './components/modules/ClientsView.vue'
import ActivitiesView from './components/modules/ActivitiesView.vue'
import TeamView from './components/TeamView.vue'
import AccountingView from './components/AccountingView.vue'
import ClientForm from './components/forms/ClientForm.vue'
import ActivityForm from './components/forms/ActivityForm.vue'
import TeamForm from './components/TeamForm.vue'

const route = useRoute()

// Reactive data
const searchTerm = ref('')
const sidebarOpen = ref(true)
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedItem = ref(null)
const clientsViewRef = ref(null)
const activitiesViewRef = ref(null)
const teamViewRef = ref(null)
const accountingViewRef = ref(null)
const isDesktop = ref(true)

// Module definitions with Font Awesome icons
const modules = ref([
  { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', description: 'Resumen general del CRM', path: '/' },
  { id: 'clients', name: 'Clientes', icon: 'fas fa-users', description: 'Gestión de clientes y contactos', path: '/clients' },
  { id: 'activities', name: 'Actividades', icon: 'fas fa-tasks', description: 'Actividades y tareas del equipo', path: '/activities' },
  { id: 'reports', name: 'Reportes', icon: 'fas fa-chart-bar', description: 'Estadísticas y análisis de rendimiento', path: '/reports' },
  { id: 'accounting', name: 'Contabilidad', icon: 'fas fa-calculator', description: 'Transacciones, pagos y gastos fijos', path: '/accounting' },
  { id: 'cases', name: 'Gestión de Casos', icon: 'fas fa-folder', description: 'Documentos, incidencias y seguimientos', path: '/cases' },
])

const currentModule = computed(() => {
  const current = modules.value.find(m => m.path === route.path)
  return current?.id || 'dashboard'
})

// Methods
const getCurrentModuleName = () => {
  return modules.value.find(m => m.path === route.path)?.name || 'Dashboard'
}

const getCurrentModuleDescription = () => {
  return modules.value.find(m => m.path === route.path)?.description || 'Panel de control principal'
}

const canCreate = () => {
  return currentModule.value !== 'dashboard' && 
         currentModule.value !== 'settings' && 
         currentModule.value !== 'accounting' &&
         currentModule.value !== 'cases' &&
         currentModule.value !== 'reports'
}

const openCreateModal = () => {
  selectedItem.value = null
  modalMode.value = 'create'
  showModal.value = true
}

const openEditModal = (item: any) => {
  selectedItem.value = item
  modalMode.value = 'edit'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
}

const handleSave = async (data: any) => {
  // Reload data after save
  if (currentModule.value === 'clients' && clientsViewRef.value) {
    setTimeout(() => {
      (clientsViewRef.value as any).loadClients()
    }, 500)
  } else if (currentModule.value === 'activities' && activitiesViewRef.value) {
    setTimeout(() => {
      (activitiesViewRef.value as any).loadActivities()
    }, 500)
  } else if (currentModule.value === 'team' && teamViewRef.value) {
    setTimeout(() => {
      (teamViewRef.value as any).loadMembers()
    }, 500)
  } else if (currentModule.value === 'accounting' && accountingViewRef.value) {
    setTimeout(() => {
      (accountingViewRef.value as any).loadData()
    }, 500)
  }
  closeModal()
}

const getClientsForActivityForm = () => {
  if (activitiesViewRef.value) {
    return (activitiesViewRef.value as any).clients || []
  }
  return []
}

// Handle responsive sidebar
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
  if (isDesktop.value) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}
</style>
