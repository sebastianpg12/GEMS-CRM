<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <!-- ...existing code... -->
          
          <div class="flex items-center gap-4">
            <!-- Vista seleccionada -->
            <div class="flex bg-gray-800 rounded-lg p-1">
              <button
                @click="viewMode = 'cards'"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'cards' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                ]"
              >
                <i class="fas fa-th-large mr-2"></i>
                Tarjetas
              </button>
              <button
                @click="viewMode = 'table'"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'table' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                ]"
              >
                <i class="fas fa-table mr-2"></i>
                Tabla
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>

      <!-- Vista de tarjetas por miembro -->
      <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="member in teamMembersWithActivities"
          :key="member._id"
          class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
        >
          <!-- Header del miembro -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-white font-semibold">{{ member.name }}</h3>
              <p class="text-gray-400 text-sm">{{ member.role }}</p>
              <p v-if="member.department" class="text-gray-500 text-xs">{{ member.department }}</p>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="bg-gray-700/30 rounded-lg p-2 text-center">
              <div class="text-lg font-bold text-white">{{ member.activities.length }}</div>
              <div class="text-xs text-gray-400">Total</div>
            </div>
            <div class="bg-yellow-500/20 rounded-lg p-2 text-center">
              <div class="text-lg font-bold text-yellow-300">{{ getPendingCount(member.activities) }}</div>
              <div class="text-xs text-yellow-400">Pendientes</div>
            </div>
            <div class="bg-green-500/20 rounded-lg p-2 text-center">
              <div class="text-lg font-bold text-green-300">{{ getCompletedCount(member.activities) }}</div>
              <div class="text-xs text-green-400">Completadas</div>
            </div>
          </div>

          <!-- Lista de actividades recientes -->
          <div class="space-y-2 mb-4">
            <h4 class="text-sm font-medium text-gray-300 mb-2">Actividades Recientes</h4>
            <div v-if="member.activities.length === 0" class="text-center py-4">
              <i class="fas fa-inbox text-2xl text-gray-600 mb-2"></i>
              <p class="text-gray-400 text-sm">Sin actividades asignadas</p>
            </div>
            <div
              v-else
              v-for="activity in member.activities.slice(0, 3)"
              :key="activity._id"
              class="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h5 class="text-white text-sm font-medium break-words whitespace-normal">{{ activity.title }}</h5>
                  <p class="text-gray-400 text-xs line-clamp-1 mt-1">{{ activity.description }}</p>
                </div>
                <span
                  class="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(activity.status)"
                >
                  {{ getStatusLabel(activity.status) }}
                </span>
              </div>
              
              <!-- Fecha y prioridad -->
              <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
                <div class="flex items-center gap-1">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(activity.date) }}</span>
                </div>
                <div v-if="activity.priority" class="flex items-center gap-1">
                  <i class="fas fa-flag" :class="getPriorityIconClass(activity.priority)"></i>
                  <span>{{ getPriorityLabel(activity.priority) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón ver todas -->
          <button
            v-if="member.activities.length > 3"
            @click="viewMemberActivities(member)"
            class="w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors text-sm"
          >
            Ver todas las actividades ({{ member.activities.length }})
          </button>
        </div>
      </div>

      <!-- Vista de tabla -->
      <div v-else-if="viewMode === 'table'" class="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-700/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actividad
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Asignado a
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Prioridad
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700/50">
              <tr
                v-for="activity in allActivities"
                :key="activity._id"
                class="hover:bg-gray-700/20 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <div class="text-white font-medium">{{ activity.title }}</div>
                    <div class="text-gray-400 text-sm line-clamp-1">{{ activity.description }}</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-white text-xs"></i>
                    </div>
                    <div>
                      <div class="text-white text-sm">{{ getAssignedToName(activity.assignedToUser) }}</div>
                      <div v-if="activity.assignedToUser?.role" class="text-gray-400 text-xs">
                        {{ activity.assignedToUser.role }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(activity.status)"
                  >
                    {{ getStatusLabel(activity.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    v-if="activity.priority"
                    class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                    :class="getPriorityClass(activity.priority)"
                  >
                    <i class="fas fa-flag" :class="getPriorityIconClass(activity.priority)"></i>
                    {{ getPriorityLabel(activity.priority) }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </td>
                <td class="px-6 py-4 text-gray-300 text-sm">
                  {{ formatDate(activity.date) }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      @click="reassignActivity(activity)"
                      class="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                      title="Reasignar"
                    >
                      <i class="fas fa-user-edit text-sm"></i>
                    </button>
                    <button
                      @click="editActivity(activity)"
                      class="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <i class="fas fa-edit text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estados vacíos -->
      <div v-if="!loading && teamMembersWithActivities.length === 0" class="text-center py-12">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <i class="fas fa-users text-6xl text-gray-600 mb-4"></i>
          <h3 class="text-xl font-bold text-white mb-2">No hay miembros del equipo</h3>
          <p class="text-gray-400 mb-6">
            Agrega miembros al equipo para poder asignar actividades
          </p>
          <router-link
            to="/team"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            <i class="fas fa-user-plus mr-2"></i>
            Gestionar Equipo
          </router-link>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <AssignActivityModal
      v-if="showAssignModal"
      :activity="selectedActivity"
      :team-members="teamMembers"
      @close="closeAssignModal"
      @assign="handleReassign"
    />

    <ActivityFormModal
      v-if="showEditModal"
      :activity="selectedActivity"
      :clients="clients"
      @close="closeEditModal"
      @saved="onActivitySaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { activityService, type ActivityData } from '../services/activityService'
import { teamService } from '../services/teamService'
import { clientService, type ClientData } from '../services/clientService'
import { useNotifications } from '../composables/useNotifications'
import type { TeamMember } from '../types'
import AssignActivityModal from '../components/modals/AssignActivityModal.vue'
import ActivityFormModal from '../components/forms/ActivityFormModal.vue'

// Reactive data
const loading = ref(true)
const viewMode = ref<'cards' | 'table'>('cards')
const activities = ref<ActivityData[]>([])
const teamMembers = ref<TeamMember[]>([])
const clients = ref<ClientData[]>([])

// Modales
const showAssignModal = ref(false)
const showEditModal = ref(false)
const selectedActivity = ref<ActivityData | null>(null)

// Composables
const { showSuccess, showError, toast } = useNotifications()

// Computed
const teamMembersWithActivities = computed(() => {
  return teamMembers.value.map(member => ({
    ...member,
    activities: activities.value.filter(activity => activity.assignedTo === member._id)
  }))
})

const allActivities = computed(() => {
  return activities.value.filter(activity => activity.assignedTo)
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const [activitiesData, teamData, clientsData] = await Promise.all([
      activityService.getAll(),
      teamService.getActiveMembers(),
      clientService.getAll()
    ])
    
    activities.value = activitiesData
    teamMembers.value = teamData
    clients.value = clientsData
  } catch (error) {
    showError('Error al cargar datos', error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    loading.value = false
  }
}

const getPendingCount = (activities: ActivityData[]) => {
  return activities.filter(a => a.status === 'pending').length
}

const getCompletedCount = (activities: ActivityData[]) => {
  return activities.filter(a => a.status === 'completed').length
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'Pendiente',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }
  return labels[status as keyof typeof labels] || status
}

const getPriorityClass = (priority: string) => {
  const classes = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  }
  return labels[priority as keyof typeof labels] || 'Media'
}

const getPriorityIconClass = (priority: string) => {
  const classes = {
    low: 'text-blue-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getAssignedToName = (assignedUser?: any): string => {
  if (!assignedUser) return 'Sin asignar'
  
  if (typeof assignedUser === 'object' && assignedUser.name) {
    return assignedUser.name
  }
  
  return 'Sin asignar'
}

const viewMemberActivities = (member: TeamMember & { activities: ActivityData[] }) => {
  // Implementar navegación o modal para ver todas las actividades del miembro
  console.log('Ver actividades de:', member.name)
}

const reassignActivity = (activity: ActivityData) => {
  selectedActivity.value = activity
  showAssignModal.value = true
}

const editActivity = (activity: ActivityData) => {
  selectedActivity.value = activity
  showEditModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  selectedActivity.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedActivity.value = null
}

const handleReassign = async (assigneeId: string | null) => {
  if (!selectedActivity.value?._id) return
  
  try {
    const updatedActivity = await activityService.reassignActivity(
      selectedActivity.value._id,
      assigneeId
    )
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === selectedActivity.value!._id)
    if (activityIndex !== -1) {
      activities.value[activityIndex] = updatedActivity
    }
    
    const assigneeName = assigneeId 
      ? teamMembers.value.find(m => m._id === assigneeId)?.name || 'Usuario'
      : 'Nadie'
    
    toast(`Actividad reasignada a ${assigneeName}`, 'success')
    closeAssignModal()
  } catch (error) {
    showError('Error al reasignar actividad', error instanceof Error ? error.message : 'Error desconocido')
  }
}

const onActivitySaved = (activity: ActivityData) => {
  const index = activities.value.findIndex(a => a._id === activity._id)
  if (index !== -1) {
    activities.value[index] = activity
  }
  toast('Actividad actualizada correctamente', 'success')
  closeEditModal()
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
