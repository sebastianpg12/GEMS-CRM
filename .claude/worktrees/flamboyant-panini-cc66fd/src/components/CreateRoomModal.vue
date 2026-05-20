<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-transparent backdrop-blur-sm"
        @click="$emit('close')"
      ></div>
      
  <!-- Modal -->
  <div class="relative bg-transparent backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl w-full max-w-sm p-5">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Crear nuevo chat</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="createRoom" class="space-y-4">
          <!-- Chat Type -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Tipo de chat
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                v-for="type in chatTypes"
                :key="type.value"
                @click="formData.type = type.value"
                :class="[
                  'p-3 rounded-lg border transition-all text-center',
                  formData.type === type.value
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                ]"
              >
                <component :is="type.icon" class="w-5 h-5 mx-auto mb-1" />
                <span class="text-xs font-medium">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <!-- Chat Name -->
          <div>
            <label for="chatName" class="block text-sm font-medium text-white mb-2">
              Nombre del chat
            </label>
            <input
              id="chatName"
              v-model="formData.name"
              type="text"
              required
              :placeholder="getNamePlaceholder()"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <!-- Description -->
          <div v-if="formData.type !== 'direct'">
            <label for="chatDescription" class="block text-sm font-medium text-white mb-2">
              Descripción (opcional)
            </label>
            <textarea
              id="chatDescription"
              v-model="formData.description"
              rows="3"
              placeholder="Describe el propósito de este chat..."
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
            ></textarea>
          </div>

          <!-- Participants -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">
              {{ formData.type === 'direct' ? 'Seleccionar usuario' : 'Seleccionar participantes' }}
            </label>
            
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
            
            <!-- Users List -->
            <div v-else class="max-h-40 overflow-y-auto space-y-2 p-2 bg-white/5 rounded-lg border border-white/10">
              <div
                v-for="user in users"
                :key="user._id"
                @click="toggleUser(user._id)"
                :class="[
                  'flex items-center p-2 rounded-lg cursor-pointer transition-colors',
                  selectedUsers.includes(user._id)
                    ? 'bg-purple-500/30 border border-purple-500/50'
                    : 'hover:bg-white/10'
                ]"
              >
                <div class="flex items-center flex-1">
                  <!-- Avatar -->
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                    <span class="text-white text-xs font-medium">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  
                  <!-- User Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ user.name }}</p>
                    <p class="text-xs text-gray-400 truncate">
                      {{ user.position || user.role }}
                    </p>
                  </div>
                </div>
                
                <!-- Checkbox -->
                <div
                  :class="[
                    'w-4 h-4 rounded border flex items-center justify-center',
                    selectedUsers.includes(user._id)
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-gray-400'
                  ]"
                >
                  <CheckIcon
                    v-if="selectedUsers.includes(user._id)"
                    class="w-3 h-3 text-white"
                  />
                </div>
              </div>
              
              <div v-if="users.length === 0" class="text-center text-gray-400 py-4">
                No hay usuarios disponibles
              </div>
            </div>
            
            <!-- Selected count -->
            <p v-if="selectedUsers.length > 0" class="text-xs text-gray-400 mt-2">
              {{ selectedUsers.length }} usuario{{ selectedUsers.length !== 1 ? 's' : '' }} seleccionado{{ selectedUsers.length !== 1 ? 's' : '' }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!canCreate"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {{ creating ? 'Creando...' : 'Crear chat' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from '../stores/chatStore'
import type { User } from '../services/chatService'
import {
  XMarkIcon,
  CheckIcon,
  UserIcon,
  UsersIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  close: []
  created: [room: any]
}>()

const chatStore = useChatStore()

const loading = ref(false)
const creating = ref(false)
const users = ref<User[]>([])
const selectedUsers = ref<string[]>([])

const formData = ref({
  type: 'team' as 'team' | 'direct' | 'group',
  name: '',
  description: ''
})

const chatTypes = [
  {
    value: 'direct',
    label: 'Directo',
    icon: UserIcon
  },
  {
    value: 'team',
    label: 'Equipo',
    icon: UsersIcon
  },
  {
    value: 'group',
    label: 'Grupo',
    icon: UserGroupIcon
  }
]

const canCreate = computed(() => {
  if (!formData.value.name.trim()) return false
  if (formData.value.type === 'direct') return selectedUsers.value.length === 1
  return selectedUsers.value.length > 0
})

const getNamePlaceholder = () => {
  switch (formData.value.type) {
    case 'direct':
      return 'Se generará automáticamente'
    case 'team':
      return 'Ej: Desarrollo, Marketing, Ventas'
    case 'group':
      return 'Ej: Proyecto Alpha, Cliente XYZ'
    default:
      return 'Nombre del chat'
  }
}

const toggleUser = (userId: string) => {
  if (formData.value.type === 'direct') {
    // For direct chats, only allow one user
    selectedUsers.value = selectedUsers.value.includes(userId) ? [] : [userId]
  } else {
    // For team/group chats, allow multiple users
    const index = selectedUsers.value.indexOf(userId)
    if (index > -1) {
      selectedUsers.value.splice(index, 1)
    } else {
      selectedUsers.value.push(userId)
    }
  }
}

const createRoom = async () => {
  if (!canCreate.value) return

  creating.value = true

  try {
    let roomData: any = {
      participants: selectedUsers.value,
      type: formData.value.type
    }

    if (formData.value.type === 'direct') {
      // For direct chats, generate name from selected user
      const selectedUser = users.value.find(u => u._id === selectedUsers.value[0])
      roomData.name = selectedUser ? `Chat con ${selectedUser.name}` : 'Chat directo'
    } else {
      roomData.name = formData.value.name.trim()
      if (formData.value.description.trim()) {
        roomData.description = formData.value.description.trim()
      }
    }

    const room = await chatStore.createChatRoom(roomData)
    emit('created', room)
  } catch (error) {
    console.error('Error creating chat room:', error)
    // TODO: Show error message to user
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await chatStore.loadUsers()
    users.value = chatStore.users
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
})
</script>
