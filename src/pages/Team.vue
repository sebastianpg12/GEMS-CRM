<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Gestión de Equipo
        </h1>
        <p class="text-gray-400 mt-2">Administra los usuarios y miembros del equipo</p>
      </div>
      
      <!-- Create Button - Only for Admin/Manager -->
      <PermissionGuard :permissions="['create-team']" :fallback="false">
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 
                 transition-all duration-200 transform hover:scale-105"
        >
          <UserPlusIcon class="w-5 h-5 mr-2" />
          Agregar Miembro
        </button>
      </PermissionGuard>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-400 text-sm font-medium">Total Miembros</p>
            <p class="text-2xl font-bold text-white">{{ totalMembers }}</p>
          </div>
          <div class="p-3 bg-blue-500/20 rounded-full">
            <UsersIcon class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-400 text-sm font-medium">Miembros Activos</p>
            <p class="text-2xl font-bold text-white">{{ activeMembers }}</p>
          </div>
          <div class="p-3 bg-green-500/20 rounded-full">
            <CheckCircleIcon class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-6 border border-purple-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-400 text-sm font-medium">Administradores</p>
            <p class="text-2xl font-bold text-white">{{ adminCount }}</p>
          </div>
          <div class="p-3 bg-purple-500/20 rounded-full">
            <ShieldCheckIcon class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-6 border border-orange-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-400 text-sm font-medium">Gerentes</p>
            <p class="text-2xl font-bold text-white">{{ managerCount }}</p>
          </div>
          <div class="p-3 bg-orange-500/20 rounded-full">
            <UserGroupIcon class="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar miembros..."
              class="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <select
            v-model="selectedRole"
            class="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white 
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="employee">Empleado</option>
            <option value="viewer">Visualizador</option>
          </select>
          
          <select
            v-model="selectedStatus"
            class="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white 
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Team Members List -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-500/20 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-700/50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Usuario
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Departamento
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Último Acceso
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700/50">
            <tr 
              v-for="member in filteredMembers" 
              :key="member._id"
              class="hover:bg-gray-700/30 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <UserAvatar
                      :name="member.name"
                      :photo="member.photo"
                      size="md"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-white">{{ member.name }}</div>
                    <div class="text-sm text-gray-400">{{ member.email }}</div>
                  </div>
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getRoleBadgeClass(member.role)"
                >
                  {{ getRoleDisplayName(member.role) }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ member.department || '-' }}
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="member.isActive 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'"
                >
                  {{ member.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(member.lastLogin) }}
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <!-- Edit Button -->
                  <PermissionGuard :permissions="['edit-team']" :fallback="false">
                    <button
                      @click="editMember(member)"
                      class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 
                             rounded-lg transition-all duration-200"
                      :title="'Editar ' + member.name"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                  </PermissionGuard>
                  
                  <!-- Toggle Status Button -->
                  <PermissionGuard :permissions="['delete-team']" :fallback="false">
                    <button
                      @click="toggleMemberStatus(member)"
                      class="p-2 transition-all duration-200 rounded-lg"
                      :class="member.isActive 
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' 
                        : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'"
                      :title="member.isActive ? 'Desactivar' : 'Activar'"
                    >
                      <component 
                        :is="member.isActive ? XMarkIcon : CheckIcon" 
                        class="w-4 h-4" 
                      />
                    </button>
                  </PermissionGuard>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Empty State -->
        <div v-if="filteredMembers.length === 0" class="text-center py-12">
          <UsersIcon class="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p class="text-gray-400">No se encontraron miembros del equipo</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div class="fixed inset-0 bg-black opacity-75" @click="closeModal"></div>
        
        <div class="relative inline-block align-middle bg-gray-800 rounded-2xl text-left overflow-hidden 
                    shadow-xl transform transition-all w-full max-w-md border border-purple-500/20">
          <div class="px-6 py-4 border-b border-gray-700/50">
            <h3 class="text-lg font-medium text-white">
              {{ showCreateModal ? 'Agregar Nuevo Miembro' : 'Editar Miembro' }}
            </h3>
          </div>
          
          <form @submit.prevent="submitForm" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nombre completo"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="email@ejemplo.com"
              />
            </div>
            
            <div v-if="showCreateModal">
              <label class="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <input
                v-model="formData.password"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Rol</label>
              <select
                v-model="formData.role"
                required
                class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                       text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar rol</option>
                <option value="admin" v-if="authStore.isAdmin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="employee">Empleado</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Departamento</label>
              <input
                v-model="formData.department"
                type="text"
                class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Departamento"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Posición</label>
              <input
                v-model="formData.position"
                type="text"
                class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Posición o cargo"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Número de teléfono"
              />
            </div>
            
            <div class="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg 
                       hover:from-purple-700 hover:to-pink-700 transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Guardando...' : (showCreateModal ? 'Crear' : 'Actualizar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="teamStore.loading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p class="text-white">Cargando...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useTeamStore } from '../stores'
import PermissionGuard from '../components/PermissionGuard.vue'
import UserAvatar from '../components/ui/UserAvatar.vue'
import type { TeamMember } from '../types'
import {
  UserPlusIcon,
  UsersIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const teamStore = useTeamStore()

// State
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const editingMember = ref<TeamMember | null>(null)

// Form data
const formData = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
  department: '',
  position: '',
  phone: ''
})

// Computed
const totalMembers = computed(() => teamStore.members.length)
const activeMembers = computed(() => teamStore.members.filter(m => m.isActive).length)
const adminCount = computed(() => teamStore.members.filter(m => m.role === 'admin' && m.isActive).length)
const managerCount = computed(() => teamStore.members.filter(m => m.role === 'manager' && m.isActive).length)

const filteredMembers = computed(() => {
  let filtered = teamStore.members

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(member => 
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.department?.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (selectedRole.value) {
    filtered = filtered.filter(member => member.role === selectedRole.value)
  }

  // Status filter
  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'true'
    filtered = filtered.filter(member => member.isActive === isActive)
  }

  return filtered
})

// Methods
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Nunca'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRoleDisplayName = (role: string) => {
  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Empleado',
    viewer: 'Visualizador'
  }
  return roleNames[role] || role
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-400 border border-red-500/30',
    manager: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    employee: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    viewer: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
  return classes[role] || classes.viewer
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    position: '',
    phone: ''
  })
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingMember.value = null
  resetForm()
}

const editMember = (member: TeamMember) => {
  editingMember.value = member
  Object.assign(formData, {
    name: member.name,
    email: member.email,
    password: '',
    role: member.role,
    department: member.department || '',
    position: member.position || '',
    phone: member.phone || ''
  })
  showEditModal.value = true
}

const submitForm = async () => {
  try {
    isSubmitting.value = true

    if (showCreateModal.value) {
      await teamStore.createMember(formData)
    } else if (editingMember.value) {
      const updateData = { ...formData }
      delete updateData.password // No incluir password en edición
      await teamStore.updateMember(editingMember.value._id!, updateData)
    }

    closeModal()
  } catch (error: any) {
    console.error('Error submitting form:', error)
    alert(error.message || 'Error al guardar los datos')
  } finally {
    isSubmitting.value = false
  }
}

const toggleMemberStatus = async (member: TeamMember) => {
  try {
    if (member.isActive) {
      await teamStore.deleteMember(member._id!)
    } else {
      await teamStore.activateMember(member._id!)
    }
  } catch (error: any) {
    console.error('Error toggling member status:', error)
    alert(error.message || 'Error al cambiar el estado del miembro')
  }
}

// Lifecycle
onMounted(async () => {
  console.log('👥 Team component mounted')
  console.log('🔑 Can view team:', authStore.canViewTeam)
  console.log('👤 User role:', authStore.userRole)
  console.log('📋 User permissions:', authStore.user?.permissions)
  console.log('👥 Team permissions specifically:', authStore.user?.permissions?.team)
  
  if (authStore.canViewTeam) {
    console.log('✅ Loading team data...')
    await teamStore.fetchTeam()
    console.log('📊 Team members loaded:', teamStore.members.length)
  } else {
    console.log('❌ No permission to view team')
  }
})
</script>
