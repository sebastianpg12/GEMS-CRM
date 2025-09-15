<template>
  <div id="app">
    <!-- Show login page if not authenticated -->
    <router-view v-if="!authStore.isAuthenticated || $route.path === '/login'" />
    
    <!-- Show main app if authenticated -->
  <div v-else class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <!-- Navigation Sidebar -->
      <div class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/90 backdrop-blur-sm border-r border-purple-500/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0" 
           :class="{ '-translate-x-full': !sidebarOpen && !isDesktop }">
        
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-4 border-b border-purple-500/20">
          <div class="flex items-center">
            <img 
              :src="logoGems" 
              alt="GEMS Logo" 
              class="w-8 h-8 mr-3 rounded-lg shadow-lg" 
              style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" 
            />
            <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              GEMS CRM
            </h1>
          </div>
        </div>

        <!-- User Info -->
        <div class="px-4 py-4 border-b border-purple-500/20">
          <div class="flex items-center">
            <UserAvatar
              :name="authStore.user?.name || 'Usuario'"
              :photo="authStore.user?.photo"
              size="md"
              :clickable="true"
              @click="router.push('/profile')"
            />
            <div class="ml-3">
              <p class="text-white text-sm font-medium">{{ authStore.user?.name }}</p>
              <p class="text-gray-400 text-xs">{{ getRoleDisplayName(authStore.user?.role) }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="mt-4 flex-1">
          <div class="px-4 space-y-2">
            <router-link
              v-for="module in availableModules"
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

        <!-- Logout Button -->
        <div class="p-4 border-t border-purple-500/20">
          <button
            @click="handleLogout"
            class="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all duration-200"
          >
            <i class="fas fa-sign-out-alt w-5 h-5 mr-3"></i>
            Cerrar Sesión
          </button>
        </div>
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
              <!-- Chat icon in header -->
              <div class="relative">
                <router-link
                  to="/chat"
                  class="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/20 transition-colors"
                  title="Ir al chat"
                >
                  <i class="fas fa-comments"></i>
                  <span
                    v-if="chatStore.getUnreadCount > 0"
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  >
                    {{ chatStore.getUnreadCount > 99 ? '99+' : chatStore.getUnreadCount }}
                  </span>
                </router-link>
              </div>
              <!-- User Menu -->
              <div class="relative">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <UserAvatar
                    :name="authStore.user?.name || 'Usuario'"
                    :photo="authStore.user?.photo"
                    size="sm"
                  />
                  <i class="fas fa-chevron-down text-gray-400 text-sm"></i>
                </button>

                <!-- User Dropdown -->
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-16px)] bg-gray-900/95 backdrop-blur-xl border border-purple-500/20 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <!-- Header: email (truncated) -->
                  <div class="px-4 py-2 border-b border-gray-700">
                    <span class="block text-sm text-gray-300 truncate" :title="authStore.user?.email || ''">
                      {{ authStore.user?.email }}
                    </span>
                  </div>

                  <!-- Menu items -->
                  <div class="py-1">
                    <button 
                      @click="navigateToProfile"
                      class="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800/60 transition-colors text-sm flex items-center"
                    >
                      <i class="fas fa-user mr-2"></i>
                      Mi Perfil
                    </button>
                    <button
                      class="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800/60 transition-colors text-sm flex items-center"
                    >
                      <i class="fas fa-cog mr-2"></i>
                      Configuración
                    </button>
                    <div class="border-t border-gray-700 my-1"></div>
                    <button 
                      @click="handleLogout"
                      class="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/20 transition-colors text-sm flex items-center"
                    >
                      <i class="fas fa-sign-out-alt mr-2"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="p-6">
          <router-view />
        </main>
      </div>

  <!-- Mobile backdrop -->
  <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="sidebarOpen = false"></div>

  <!-- Global toast for nuevos mensajes -->
  <NewMessageToast />
    </div>
  </div>
</template>

<script setup lang="ts">
import logoGems from '@/assets/logo.webp'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useChatStore } from './stores/chatStore'
import UserAvatar from './components/ui/UserAvatar.vue'
import NewMessageToast from './components/NewMessageToast.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

// Reactive data
const sidebarOpen = ref(true)
const showUserMenu = ref(false)
const isDesktop = ref(true)
// Removed navbar mini-popup; use NewMessageToast instead

// Computed properties
const availableModules = computed(() => authStore.getAvailableModules)

const currentModule = computed(() => {
  const current = availableModules.value.find(m => m.path === route.path)
  return current?.id || 'dashboard'
})

// Methods
const getCurrentModuleName = () => {
  return availableModules.value.find(m => m.path === route.path)?.name || 'Dashboard'
}

const getCurrentModuleDescription = () => {
  const descriptions: Record<string, string> = {
    dashboard: 'Resumen general del CRM',
    clients: 'Gestión de clientes y contactos',
    activities: 'Actividades y tareas del equipo',
    reports: 'Estadísticas y análisis de rendimiento',
    accounting: 'Transacciones, pagos y gastos fijos',
    cases: 'Documentos, incidencias y seguimientos',
    team: 'Gestión de usuarios y equipo',
    profile: 'Configuración de perfil de usuario'
  }
  return descriptions[currentModule.value] || 'Panel de control principal'
}

const getRoleDisplayName = (role?: string) => {
  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Empleado',
    viewer: 'Visualizador'
  }
  return roleNames[role || ''] || role
}

const navigateToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
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

// Close user menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (showUserMenu.value && !(event.target as Element).closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(async () => {
  // Check authentication on app load
  await authStore.checkAuth()
  
  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)

  // Initialize chat in background for unread badge
  if (authStore.isAuthenticated) {
    try { await chatStore.initializeChat() } catch {}
  }
})

// Removed navbar popup listener; NewMessageToast handles notifications globally
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
