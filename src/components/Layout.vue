<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-dark-900/90 to-dark-950/90 backdrop-blur-xl border-r border-white/10">
      <!-- Logo -->
      <div class="flex items-center justify-center h-20 border-b border-white/10">
        <div class="flex items-center">
          <!-- Logo GEMS -->
          <img 
            src="../assets/logo.webp" 
            alt="GEMS Logo" 
            class="w-12 h-12 mr-3 rounded-lg shadow-lg"
            style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
          />
          <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            GEMS CRM
          </div>
        </div>
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2 flex flex-col justify-between h-full">
        <div>
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.path"
            class="nav-item"
            :class="{ 'active': $route.path === item.path }"
          >
            <img 
              v-if="item.icon === 'logo'"
              src="../assets/logo.webp" 
              alt="GEMS Logo" 
              class="w-5 h-5 mr-3 rounded"
            />
            <component v-else :is="item.icon" class="w-5 h-5 mr-3" />
            <span>{{ item.name }}</span>
          </router-link>
        </div>
        <!-- Minimal logout icon at bottom with tooltip -->
        <div class="flex justify-center mt-8 mb-2">
          <button
            @click="$emit('logout')"
            class="p-2 rounded-lg hover:bg-dark-800/60 transition-colors group"
            aria-label="Cerrar sesión"
            style="position:relative;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7 text-gray-300 hover:text-red-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            <span class="absolute left-1/2 top-full mt-2 -translate-x-1/2 px-2 py-1 bg-black/80 text-xs text-white rounded opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200" style="white-space:nowrap;">Cerrar sesión</span>
          </button>
        </div>
      </nav>
      
      <!-- User Profile -->
      <div class="px-4 py-4 border-t border-white/10">
        <div class="flex flex-col items-center gap-2">
          <div class="flex items-center">
            <!-- Avatar personalizado o foto personalizada -->
            <div class="w-8 h-8 rounded-full overflow-hidden shadow-lg flex items-center justify-center bg-gray-700">
              <!-- Foto personalizada -->
              <img 
                v-if="user?.photo"
                :src="resolveImageUrl(user.photo)"
                alt="Foto de perfil" 
                class="w-full h-full object-cover"
                @error="onAvatarError"
              />
              <!-- Avatar predefinido -->
              <img 
                v-else-if="user?.avatar && getAvatarById(user.avatar)"
                :src="getAvatarById(user.avatar)?.path"
                :alt="getAvatarById(user.avatar)?.name" 
                class="w-full h-full object-cover"
              />
              <!-- Iniciales como fallback -->
              <span v-else class="text-xs font-medium text-white">{{ getUserInitials() }}</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-white">{{ user?.name || 'Usuario' }}</p>
              <p class="text-xs text-gray-400">{{ getRoleDisplayName() }}</p>
            </div>
          </div>
          <!-- Configuración de perfil -->
          <router-link
            to="/profile"
            class="p-2 rounded-lg hover:bg-dark-800/60 transition-colors mt-4 group"
            aria-label="Ver perfil"
            style="position:relative;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-gray-300 hover:text-primary-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="absolute left-1/2 top-full mt-2 -translate-x-1/2 px-2 py-1 bg-black/80 text-xs text-white rounded opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200" style="white-space:nowrap;">Configurar Perfil</span>
          </router-link>
          
          <!-- Cerrar sesión -->
          <button
            @click="$emit('logout')"
            class="p-2 rounded-lg hover:bg-dark-800/60 transition-colors mt-2 group"
            aria-label="Cerrar sesión"
            style="position:relative;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-gray-300 hover:text-red-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            <span class="absolute left-1/2 top-full mt-2 -translate-x-1/2 px-2 py-1 bg-black/80 text-xs text-white rounded opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200" style="white-space:nowrap;">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
      <header class="min-h-[64px] bg-gradient-to-r from-dark-800/50 to-dark-900/50 backdrop-blur-sm border-b border-white/10 flex flex-wrap items-center px-3 sm:px-8 justify-between relative z-30 gap-2 sm:gap-0">
        <div class="flex items-center flex-1 min-w-0">
          <!-- Menu Button (hamburger icon) -->
          <button
            class="flex-shrink-0 mr-2 sm:mr-4 p-2 rounded-lg bg-dark-900/70 hover:bg-dark-800/80 focus:outline-none z-30"
            @click="$emit('toggleSidebar')"
            aria-label="Abrir menú"
            style="min-width:40px; min-height:40px;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <!-- Logo -->
          <img 
            src="../assets/logo.webp" 
            alt="GEMS Logo" 
            class="w-10 h-10 mr-2 sm:mr-4 rounded-lg shadow-lg z-20 flex-shrink-0"
            style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
          />
          <!-- Título y descripción -->
          <div class="flex flex-col justify-center min-w-0 ml-2 sm:ml-4">
            <h1 class="text-base sm:text-xl font-bold text-white text-shadow whitespace-nowrap truncate">{{ pageTitle }}</h1>
            <p class="text-gray-400 text-[11px] sm:text-xs truncate">{{ pageDescription }}</p>
          </div>
        </div>
        <!-- Notifications -->
        <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 mt-2 sm:mt-0">
          <OnlineUsersPopover />
          
          <!-- Chat Unread Badge -->
          <router-link to="/chat" class="relative p-2 text-gray-400 hover:text-white transition-colors">
            <ChatBubbleLeftRightIcon class="w-6 h-6" />
            <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center">
              {{ chatUnread > 99 ? '99+' : chatUnread }}
            </span>
          </router-link>
          
          <!-- Notifications removed - Sistema de tareas tipo Azure -->
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="p-8">
        <router-view />
      </main>
    </div>
    
  <!-- Chat Widget -->
  <ChatWidget />
  <NewMessageToast />
    
    <!-- Notifications Panel - REMOVED for Azure-style task system -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chatStore'
import ChatWidget from './ChatWidget.vue'
import OnlineUsersPopover from './OnlineUsersPopover.vue'
import NewMessageToast from './NewMessageToast.vue'
import { getAvatarById } from '@/utils/avatarConfig'
import { API_CONFIG } from '@/config/api'
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UsersIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const chatStore = useChatStore()
const authStore = useAuthStore()

const avatarError = ref(false)

// Acceso al usuario actual
const user = computed(() => authStore.user)

const navigation = [
  { name: 'Dashboard', path: '/', icon: 'logo' },
  { name: 'Clientes', path: '/clients', icon: UserGroupIcon },
  { name: 'Actividades', path: '/activities', icon: ClipboardDocumentListIcon },
  { name: 'Tableros', path: '/boards', icon: Squares2X2Icon },
  { name: 'Actividades por Equipo', path: '/team-activities', icon: UsersIcon },
  { name: 'Contabilidad', path: '/accounting', icon: CurrencyDollarIcon },
  { name: 'Gestión de Casos', path: '/cases', icon: FolderIcon },
  { name: 'Equipo', path: '/team', icon: DocumentTextIcon },
  { name: 'Chat Interno', path: '/chat', icon: ChatBubbleLeftRightIcon },
]

const pageTitle = computed(() => {
  const current = navigation.find(item => item.path === route.path)
  return current ? current.name : 'Dashboard'
})

const pageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    '/': 'Panel de control principal',
    '/boards': 'Tableros Kanban y Scrum',
    '/clients': 'Gestión de clientes',
    '/activities': 'Gestión de actividades y tareas',
    '/team-activities': 'Actividades asignadas por miembro del equipo',
    '/accounting': 'Gestión financiera unificada',
    '/cases': 'Documentos, incidencias y seguimientos',
    '/team': 'Gestión del equipo de trabajo',
    '/chat': 'Chat interno del equipo'
  }
  return descriptions[route.path] || ''
})

// Unread chat messages (from Pinia getter)
const chatUnread = computed(() => chatStore.getUnreadCount)

// Resolver URL de imágenes
const resolveImageUrl = (url: string | null) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = String(API_CONFIG.BASE_URL).replace(/\/?api\/?$/i, '')
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

// Obtener iniciales del usuario
const getUserInitials = () => {
  const name = user.value?.name || ''
  if (!name) return 'U'
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
}

// Manejar error al cargar avatar
const onAvatarError = () => {
  avatarError.value = true
}

// Mostrar nombre del rol en español
const getRoleDisplayName = () => {
  const roles: Record<string, string> = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'user': 'Usuario',
    'employee': 'Empleado',
    'viewer': 'Visualizador'
  }
  return roles[user.value?.role || ''] || user.value?.role || 'Usuario'
}

onMounted(() => {
  chatStore.initializeChat()
  chatStore.loadChatRooms()
  
  // Resetear errores
  avatarError.value = false
})
</script>
