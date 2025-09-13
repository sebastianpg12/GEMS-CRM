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
            class="w-10 h-10 mr-3 rounded-lg shadow-lg"
            style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
          />
          <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            GEMS CRM
          </div>
        </div>
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
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
      </nav>
      
      <!-- User Profile -->
      <div class="px-4 py-4 border-t border-white/10">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-medium">U</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-white">Usuario</p>
            <p class="text-xs text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
  <header class="h-20 bg-gradient-to-r from-dark-800/50 to-dark-900/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-8">
        <div>
          <h1 class="text-2xl font-bold text-white text-shadow">{{ pageTitle }}</h1>
          <p class="text-gray-400">{{ pageDescription }}</p>
        </div>
        
        <!-- Notifications -->
        <div class="flex items-center space-x-4">
          <OnlineUsersPopover />
          <!-- Chat Unread Badge -->
          <router-link to="/chat" class="relative p-2 text-gray-400 hover:text-white transition-colors">
            <ChatBubbleLeftRightIcon class="w-6 h-6" />
            <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center">
              {{ chatUnread > 99 ? '99+' : chatUnread }}
            </span>
          </router-link>
          <button @click="showNotifications = !showNotifications" class="relative p-2 text-gray-400 hover:text-white transition-colors">
            <BellIcon class="w-6 h-6" />
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {{ unreadCount }}
            </span>
          </button>
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
    
    <!-- Notifications Panel -->
    <div v-if="showNotifications" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showNotifications = false"></div>
      <div class="absolute right-4 top-24 w-96 max-h-96 overflow-y-auto bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl">
        <div class="p-4 border-b border-white/10">
          <h3 class="text-lg font-semibold text-white">Notificaciones</h3>
        </div>
        <div class="p-4 space-y-3">
          <div v-if="notifications.length === 0" class="text-center text-gray-400 py-8">
            No hay notificaciones
          </div>
          <div 
            v-for="notification in notifications.slice(0, 10)" 
            :key="notification._id"
            class="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            @click="markAsRead(notification._id!)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-white">{{ notification.title }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ notification.message }}</p>
              </div>
              <div v-if="notification.status === 'unread'" class="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationsStore } from '../stores'
import { useChatStore } from '../stores/chatStore'
import ChatWidget from './ChatWidget.vue'
import OnlineUsersPopover from './OnlineUsersPopover.vue'
import NewMessageToast from './NewMessageToast.vue'
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  BellIcon,
  DocumentIcon,
  DocumentTextIcon,
  CogIcon,
  UsersIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const notificationsStore = useNotificationsStore()
const chatStore = useChatStore()

const showNotifications = ref(false)

const navigation = [
  { name: 'Dashboard', path: '/', icon: 'logo' },
  { name: 'Clientes', path: '/clients', icon: UserGroupIcon },
  { name: 'Actividades', path: '/activities', icon: ClipboardDocumentListIcon },
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

const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => 
  notifications.value.filter(n => n.status === 'unread').length
)

// Unread chat messages (from Pinia getter)
const chatUnread = computed(() => chatStore.getUnreadCount)

const markAsRead = async (notificationId: string) => {
  try {
    await notificationsStore.markAsRead(notificationId)
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

onMounted(() => {
  notificationsStore.fetchNotifications()
  chatStore.initializeChat()
  chatStore.loadChatRooms()
})
</script>
