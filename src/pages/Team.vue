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
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Departamento</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Último Acceso</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
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
                    <UserAvatar :name="member.name" :photo="member.photo" size="md" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-white">{{ member.name }}</div>
                    <div class="text-sm text-gray-400">{{ member.email }}</div>
                  </div>
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getRoleBadgeClass(member.role)">
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

    <!-- Org Chart Editor (Admins) - Debajo de la lista de usuarios -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-500/20 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-white">Organigrama</h2>
          <p class="text-gray-400 text-sm">Usa los botones para gestionar jerarquías y asignaciones. Solo administradores pueden guardar.</p>
        </div>
        <div class="flex gap-2 items-center">
          <button v-if="authStore.isAdmin" @click="saveOrgChart" :disabled="orgSaving"
                  class="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
            {{ orgSaving ? 'Guardando...' : 'Guardar organigrama' }}
          </button>
        </div>
      </div>

      <!-- Simple Auto-layout by levels -->
      <div v-if="orgChart.nodes.length" class="space-y-6">
        <div v-for="lvl in [1,2,3,4]" :key="lvl" class="space-y-2">
          <div class="text-gray-400 text-sm">Nivel {{ lvl }}</div>
          <div class="flex flex-wrap gap-3">
            <div v-for="n in nodesByLevel(lvl)" :key="n.id" class="w-[280px]">
              <div
                class="p-3 rounded-xl"
                :class="n.isTeam ? 'bg-gradient-to-br from-blue-900/40 to-blue-700/20 border border-blue-500/30' : 'bg-gray-900/60 border border-gray-700'"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="text-white font-medium">{{ n.title }}</div>
                    <div class="text-sm" :class="n.status==='vacant' && !n.assignees?.length ? 'text-yellow-300' : 'text-gray-300'">
                      {{ n.name }}
                    </div>
                  </div>
                  <div class="text-xs text-gray-400">{{ n.id }}</div>
                </div>
                <div class="mt-2 text-xs text-gray-400">Parent: {{ n.parentId || '—' }}</div>
                <div class="mt-2 text-xs text-gray-400" v-if="n.description">{{ n.description }}</div>

                <!-- Assignees rendering -->
                <div v-if="n.isTeam" class="mt-3">
                  <div class="text-xs text-gray-400 mb-1">Miembros</div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="a in (n.assignees || [])" :key="a.userId" class="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30">
                      <span>{{ a.name }}</span>
                      <button v-if="authStore.isAdmin" @click="removeAssignee(n, a.userId)" class="text-blue-300 hover:text-white">×</button>
                    </span>
                    <button v-if="authStore.isAdmin" @click="openAssignModal(n, true)" class="px-2 py-1 text-xs rounded bg-blue-600/20 text-blue-300">+ Agregar</button>
                  </div>
                  <div class="mt-3 flex gap-2">
                    <button v-if="authStore.isAdmin" @click="openParentModal(n)" class="px-2 py-1 bg-purple-600/20 text-purple-300 rounded">Asignar superior</button>
                    <button v-if="authStore.isAdmin && n.parentId" @click="detachParent(n)" class="px-2 py-1 bg-gray-600/30 text-gray-200 rounded">Quitar superior</button>
                  </div>
                </div>

                <div v-else class="mt-2 flex flex-wrap gap-2">
                  <button v-if="authStore.isAdmin" @click="openAssignModal(n, false)" class="px-2 py-1 bg-blue-600/20 text-blue-300 rounded">Asignar</button>
                  <button v-if="authStore.isAdmin" @click="vacateNode(n)" class="px-2 py-1 bg-orange-600/20 text-orange-300 rounded">Vacante</button>
                  <button v-if="authStore.isAdmin" @click="openParentModal(n)" class="px-2 py-1 bg-purple-600/20 text-purple-300 rounded">Asignar superior</button>
                  <button v-if="authStore.isAdmin && n.parentId" @click="detachParent(n)" class="px-2 py-1 bg-gray-600/30 text-gray-200 rounded">Quitar superior</button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-400">Cargando organigrama...</div>
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
    <!-- Assign Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/70" @click="closeAssignModal"></div>
      <div class="relative w-full max-w-lg bg-gray-800 border border-purple-500/30 rounded-2xl p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-white font-semibold">Asignar {{ assignToTeam ? 'miembros' : 'usuario' }}</h3>
          <button @click="closeAssignModal" class="text-gray-300 hover:text-white">×</button>
        </div>
        <input v-model="userSearch" placeholder="Buscar por nombre o email" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-3" />
        <div class="max-h-72 overflow-auto divide-y divide-gray-700/50">
          <div v-for="u in filteredUsers" :key="u._id" class="flex items-center justify-between py-2">
            <div>
              <div class="text-white text-sm">{{ u.name }}</div>
              <div class="text-gray-400 text-xs">{{ u.email }}</div>
            </div>
            <button @click="selectUser(u)" class="px-3 py-1 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600/30">
              {{ assignToTeam ? 'Agregar' : 'Asignar' }}
            </button>
          </div>
          <div v-if="filteredUsers.length === 0" class="text-gray-400 text-center py-6 text-sm">No hay usuarios que coincidan</div>
        </div>
        <div class="mt-4 text-right">
          <button @click="closeAssignModal" class="px-3 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Parent Selection Modal -->
    <div v-if="showParentModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/70" @click="closeParentModal"></div>
      <div class="relative w-full max-w-lg bg-gray-800 border border-purple-500/30 rounded-2xl p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-white font-semibold">Asignar superior</h3>
          <button @click="closeParentModal" class="text-gray-300 hover:text-white">×</button>
        </div>
        <input v-model="parentSearch" placeholder="Buscar por título, nombre o id" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-3" />
        <div class="max-h-72 overflow-auto divide-y divide-gray-700/50">
          <div v-for="p in filteredParentNodes" :key="p.id" class="flex items-center justify-between py-2">
            <div>
              <div class="text-white text-sm">{{ p.title }}</div>
              <div class="text-gray-400 text-xs">{{ p.name || '—' }} · Nivel {{ p.level }}</div>
            </div>
            <button @click="selectParent(p)" class="px-3 py-1 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600/30">Elegir</button>
          </div>
          <div v-if="filteredParentNodes.length === 0" class="text-gray-400 text-center py-6 text-sm">No hay roles válidos para seleccionar</div>
        </div>
        <div class="mt-4 text-right">
          <button @click="closeParentModal" class="px-3 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useTeamStore, useOrgChartStore } from '../stores'
import PermissionGuard from '../components/PermissionGuard.vue'
import UserAvatar from '../components/ui/UserAvatar.vue'
import type { TeamMember, OrgChart, OrgChartNode } from '../types'
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
const orgStore = useOrgChartStore()

// State
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const editingMember = ref<TeamMember | null>(null)

// Org chart state
const orgSaving = ref(false)
const orgChart = reactive<OrgChart>({ nodes: [] })

// Assign modal state
const showAssignModal = ref(false)
const assignToTeam = ref(false)
const nodeBeingAssigned = ref<OrgChartNode | null>(null)
const userSearch = ref('')
const filteredUsers = computed(() => {
  const query = userSearch.value.trim().toLowerCase()
  const all = teamStore.members.filter(m => m.isActive)
  if (!nodeBeingAssigned.value) return []
  // If team assignment, exclude already assigned
  let candidates = all
  if (assignToTeam.value) {
    const assignedIds = new Set((nodeBeingAssigned.value.assignees || []).map(a => a.userId))
    candidates = candidates.filter(m => !assignedIds.has(m._id!))
  }
  if (!query) return candidates
  return candidates.filter(m => m.name.toLowerCase().includes(query) || (m.email || '').toLowerCase().includes(query))
})

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

  // Load org chart
  await orgStore.fetchChart()
  Object.assign(orgChart, orgStore.chart)
})

// Org chart helpers
const nodesByLevel = (level: number) => orgChart.nodes.filter(n => n.level === level)
const onDragStart = (n: OrgChartNode) => { dragged = n }
const isDescendant = (nodes: OrgChartNode[], possibleAncestorId: string, possibleDescendantId: string): boolean => {
  // BFS/DFS up from descendant
  let current: OrgChartNode | undefined = nodes.find(n => n.id === possibleAncestorId)
  if (!current) return false
  const stack = nodes.filter(n => n.parentId === current!.id)
  while (stack.length) {
    const n = stack.pop()!
    if (n.id === possibleDescendantId) return true
    stack.push(...nodes.filter(c => c.parentId === n.id))
  }
  return false
}

const onDrop = (target: OrgChartNode) => {
  if (!dragged || dragged.id === target.id) return
  // Evitar ciclos: no permitir poner a un nodo bajo uno de sus descendientes
  if (isDescendant(orgChart.nodes, dragged.id, target.id)) {
    alert('No puedes asignar un superior que es descendiente del nodo')
    return
  }
  // Reasignar padre del nodo arrastrado al target
  dragged.parentId = target.id
  // Asegurar nivel
  dragged.level = Math.min(target.level + 1, 6)
}

const openAssignModal = (n: OrgChartNode, toTeam: boolean) => {
  nodeBeingAssigned.value = n
  assignToTeam.value = toTeam
  userSearch.value = ''
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  nodeBeingAssigned.value = null
}

const selectUser = (u: TeamMember) => {
  const n = nodeBeingAssigned.value
  if (!n) return
  if (assignToTeam.value) {
    n.assignees = [...(n.assignees || []), { userId: u._id!, name: u.name, email: u.email }]
  } else {
    n.name = u.name
    n.userId = u._id || null
    n.status = 'filled'
  }
  if (!assignToTeam.value) closeAssignModal()
}

const vacateNode = (n: OrgChartNode) => {
  n.userId = null
  n.status = 'vacant'
  // Mantener el título y nombre como etiqueta
}

// addAssignee now handled by openAssignModal in template

const removeAssignee = (n: OrgChartNode, userId: string) => {
  if (!n.isTeam) return
  n.assignees = (n.assignees || []).filter(a => a.userId !== userId)
}

const detachParent = (n: OrgChartNode) => {
  n.parentId = null
  n.level = 1
}

const saveOrgChart = async () => {
  try {
    orgSaving.value = true
    const payload: OrgChart = { nodes: orgChart.nodes, updatedAt: new Date().toISOString() }
    await orgStore.saveChart(payload)
    Object.assign(orgChart, orgStore.chart)
  } catch (e: any) {
    console.error('Error saving orgchart', e)
    alert(e.response?.data?.message || e.message || 'Error al guardar organigrama')
  } finally {
    orgSaving.value = false
  }
}
</script>
