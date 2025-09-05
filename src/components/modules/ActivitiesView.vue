<template>
  <div class="space-y-6">
    <!-- Header con controles -->
    <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Gestión de Actividades</h1>
        <p class="text-gray-400 mt-1">Tablero Kanban - Organiza tus actividades por estado</p>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Botón crear -->
        <button
          @click="$emit('create')"
          class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
        >
          <i class="fas fa-plus"></i>
          Nueva Actividad
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <i class="fas fa-exclamation-triangle text-red-400"></i>
        <div>
          <h3 class="text-red-300 font-medium">Error al cargar actividades</h3>
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>
      </div>
      <button 
        @click="loadActivities"
        class="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Tablero Kanban -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna Pendiente -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <i class="fas fa-clock text-white text-sm"></i>
          </div>
          <h2 class="text-xl font-bold text-white">Pendiente</h2>
          <span class="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
            {{ pendingActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300',
            isDragging && draggedActivity?.status !== 'pending' ? 'drop-zone-highlight' : ''
          ]"
          @drop="onDrop($event, 'pending')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in pendingActivities"
            :key="activity._id"
            class="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/40 transition-all duration-200 group cursor-move"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Header de la tarjeta -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2 flex-1">
                <i class="fas fa-grip-vertical text-gray-500 text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <h3 class="text-white font-semibold text-sm leading-tight flex-1">{{ activity.title }}</h3>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="markAsCompleted(activity._id!)"
                  class="p-1 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded transition-all duration-200"
                  title="Marcar como completada"
                >
                  <i class="fas fa-check text-xs"></i>
                </button>
                <button
                  @click="$emit('edit', activity)"
                  class="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-all duration-200"
                  title="Editar"
                >
                  <i class="fas fa-edit text-xs"></i>
                </button>
                <button
                  @click="deleteActivity(activity._id!)"
                  class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
                  title="Eliminar"
                >
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Cliente -->
            <p class="text-gray-400 text-xs mb-2">{{ getClientName(activity.clientId) }}</p>

            <!-- Descripción -->
            <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ activity.description }}</p>

            <!-- Fecha -->
            <div class="flex items-center justify-between text-xs text-gray-400">
              <div class="flex items-center gap-1">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(activity.date) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="fas fa-clock"></i>
                <span>{{ formatTime(activity.date) }}</span>
              </div>
            </div>
          </div>

          <!-- Estado vacío para pendientes -->
          <div v-if="pendingActivities.length === 0" class="text-center py-8">
            <i class="fas fa-clock text-3xl text-gray-600 mb-2"></i>
            <p class="text-gray-400 text-sm">No hay actividades pendientes</p>
          </div>
        </div>
      </div>

      <!-- Columna Completada -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <i class="fas fa-check text-white text-sm"></i>
          </div>
          <h2 class="text-xl font-bold text-white">Completada</h2>
          <span class="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
            {{ completedActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300',
            isDragging && draggedActivity?.status !== 'completed' ? 'drop-zone-highlight' : ''
          ]"
          @drop="onDrop($event, 'completed')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in completedActivities"
            :key="activity._id"
            class="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/40 transition-all duration-200 group cursor-move"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Header de la tarjeta -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2 flex-1">
                <i class="fas fa-grip-vertical text-gray-500 text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <h3 class="text-white font-semibold text-sm leading-tight flex-1">{{ activity.title }}</h3>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="$emit('edit', activity)"
                  class="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-all duration-200"
                  title="Editar"
                >
                  <i class="fas fa-edit text-xs"></i>
                </button>
                <button
                  @click="deleteActivity(activity._id!)"
                  class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
                  title="Eliminar"
                >
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Cliente -->
            <p class="text-gray-400 text-xs mb-2">{{ getClientName(activity.clientId) }}</p>

            <!-- Descripción -->
            <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ activity.description }}</p>

            <!-- Fecha -->
            <div class="flex items-center justify-between text-xs text-gray-400">
              <div class="flex items-center gap-1">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(activity.date) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="fas fa-check-circle text-green-400"></i>
                <span>Completada</span>
              </div>
            </div>
          </div>

          <!-- Estado vacío para completadas -->
          <div v-if="completedActivities.length === 0" class="text-center py-8">
            <i class="fas fa-check-circle text-3xl text-gray-600 mb-2"></i>
            <p class="text-gray-400 text-sm">No hay actividades completadas</p>
          </div>
        </div>
      </div>

      <!-- Columna Cancelada -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <i class="fas fa-times text-white text-sm"></i>
          </div>
          <h2 class="text-xl font-bold text-white">Cancelada</h2>
          <span class="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs font-medium">
            {{ cancelledActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300',
            isDragging && draggedActivity?.status !== 'cancelled' ? 'drop-zone-highlight' : ''
          ]"
          @drop="onDrop($event, 'cancelled')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in cancelledActivities"
            :key="activity._id"
            class="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-red-500/40 transition-all duration-200 group cursor-move"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Header de la tarjeta -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2 flex-1">
                <i class="fas fa-grip-vertical text-gray-500 text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <h3 class="text-white font-semibold text-sm leading-tight flex-1">{{ activity.title }}</h3>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="$emit('edit', activity)"
                  class="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-all duration-200"
                  title="Editar"
                >
                  <i class="fas fa-edit text-xs"></i>
                </button>
                <button
                  @click="deleteActivity(activity._id!)"
                  class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
                  title="Eliminar"
                >
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Cliente -->
            <p class="text-gray-400 text-xs mb-2">{{ getClientName(activity.clientId) }}</p>

            <!-- Descripción -->
            <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ activity.description }}</p>

            <!-- Fecha -->
            <div class="flex items-center justify-between text-xs text-gray-400">
              <div class="flex items-center gap-1">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(activity.date) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="fas fa-times-circle text-red-400"></i>
                <span>Cancelada</span>
              </div>
            </div>
          </div>

          <!-- Estado vacío para canceladas -->
          <div v-if="cancelledActivities.length === 0" class="text-center py-8">
            <i class="fas fa-times-circle text-3xl text-gray-600 mb-2"></i>
            <p class="text-gray-400 text-sm">No hay actividades canceladas</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío general -->
    <div v-if="!loading && !error && activities.length === 0" class="text-center py-12">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
        <i class="fas fa-tasks text-6xl text-gray-600 mb-4"></i>
        <h3 class="text-xl font-bold text-white mb-2">No hay actividades</h3>
        <p class="text-gray-400 mb-6">
          {{ searchTerm ? 'No se encontraron actividades que coincidan con tu búsqueda' : 'Comienza agregando tu primera actividad' }}
        </p>
        <button
          @click="$emit('create')"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          <i class="fas fa-plus mr-2"></i>
          Crear Primera Actividad
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { activityService, type ActivityData } from '../../services/activityService'
import { clientService, type ClientData } from '../../services/clientService'
import { useNotifications } from '../../composables/useNotifications'

// Props
interface Props {
  searchTerm?: string
}
const props = withDefaults(defineProps<Props>(), {
  searchTerm: ''
})

// Emits
defineEmits<{
  create: []
  edit: [activity: ActivityData]
}>()

// Composables
const { showSuccess, showError, confirmDelete, toast, showLoading, closeLoading } = useNotifications()

// Reactive data
const activities = ref<ActivityData[]>([])
const clients = ref<ClientData[]>([])
const loading = ref(true)
const loadingClients = ref(true)
const error = ref<string | null>(null)
const draggedActivity = ref<ActivityData | null>(null)
const isDragging = ref(false)

// Computed
const filteredActivities = computed(() => {
  let filtered = activities.value

  // Filtrar por búsqueda
  if (props.searchTerm) {
    const searchLower = props.searchTerm.toLowerCase()
    filtered = filtered.filter(activity =>
      activity.title.toLowerCase().includes(searchLower) ||
      activity.description.toLowerCase().includes(searchLower) ||
      getClientName(activity.clientId).toLowerCase().includes(searchLower)
    )
  }

  // Ordenar por fecha (más recientes primero)
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Computed para separar actividades por estado
const pendingActivities = computed(() => 
  filteredActivities.value.filter(activity => activity.status === 'pending' || !activity.status)
)

const completedActivities = computed(() => 
  filteredActivities.value.filter(activity => activity.status === 'completed')
)

const cancelledActivities = computed(() => 
  filteredActivities.value.filter(activity => activity.status === 'cancelled')
)

// Methods
const loadActivities = async () => {
  try {
    loading.value = true
    error.value = null
    activities.value = await activityService.getAll()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    activities.value = []
  } finally {
    loading.value = false
  }
}

const loadClients = async () => {
  try {
    loadingClients.value = true
    clients.value = await clientService.getAll()
  } catch (err) {
    console.error('Error loading clients:', err)
  } finally {
    loadingClients.value = false
  }
}

const deleteActivity = async (id: string) => {
  const activity = activities.value.find(a => a._id === id)
  const activityName = activity?.title || 'esta actividad'
  
  const result = await confirmDelete(activityName, 'actividad')
  
  if (!result.isConfirmed) {
    return
  }

  try {
    showLoading('Eliminando actividad...')
    await activityService.deleteActivity(id)
    activities.value = activities.value.filter(activity => activity._id !== id)
    closeLoading()
    showSuccess('¡Actividad eliminada!', 'La actividad ha sido eliminada exitosamente')
  } catch (err) {
    closeLoading()
    showError('Error al eliminar', err instanceof Error ? err.message : 'Error desconocido')
    loadActivities()
  }
}

const markAsCompleted = async (id: string) => {
  try {
    showLoading('Marcando como completada...')
    await activityService.update(id, { status: 'completed' })
    const activityIndex = activities.value.findIndex(a => a._id === id)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = 'completed'
    }
    closeLoading()
    toast('Actividad marcada como completada', 'success')
  } catch (err) {
    closeLoading()
    showError('Error al actualizar', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const getClientName = (clientData: string | any): string => {
  if (!clientData) return 'Sin cliente asignado'
  
  // Si es un objeto poblado desde el backend
  if (typeof clientData === 'object' && clientData.name) {
    return clientData.name
  }
  
  // Si es un ID, buscar en la lista de clientes cargados
  if (typeof clientData === 'string') {
    if (loadingClients.value) return 'Cargando cliente...'
    const client = clients.value.find(c => c._id === clientData)
    return client ? client.name : 'Cliente no válido'
  }
  
  return 'Cliente no válido'
}

const getActivityIcon = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'cancelled':
      return 'bg-red-500'
    case 'pending':
    default:
      return 'bg-yellow-500'
  }
}

const getActivityIconClass = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'fas fa-check'
    case 'cancelled':
      return 'fas fa-times'
    case 'pending':
    default:
      return 'fas fa-clock'
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-300'
    case 'cancelled':
      return 'bg-red-500/20 text-red-300'
    case 'pending':
    default:
      return 'bg-yellow-500/20 text-yellow-300'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completada'
    case 'cancelled':
      return 'Cancelada'
    case 'pending':
    default:
      return 'Pendiente'
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Drag and Drop methods
const onDragStart = (event: DragEvent, activity: ActivityData) => {
  draggedActivity.value = activity
  isDragging.value = true
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', activity._id || '')
  }

  // Añadir clase visual al elemento arrastrado
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '0.5'
  }
}

const onDragEnd = (event: DragEvent) => {
  isDragging.value = false
  
  // Restaurar opacidad
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '1'
  }
  
  // Limpiar después de un pequeño delay para evitar flickering
  setTimeout(() => {
    draggedActivity.value = null
  }, 100)
}

const onDrop = async (event: DragEvent, newStatus: string) => {
  event.preventDefault()
  
  if (!draggedActivity.value || !draggedActivity.value._id) {
    return
  }

  const activityId = draggedActivity.value._id
  const currentStatus = draggedActivity.value.status

  // No hacer nada si el estado es el mismo
  if (currentStatus === newStatus) {
    return
  }

  try {
    // Actualizar en el backend
    await activityService.update(activityId, { status: newStatus })
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = newStatus
    }

    // Mostrar notificación de éxito
    const statusText = newStatus === 'completed' ? 'completada' : 
                      newStatus === 'cancelled' ? 'cancelada' : 'pendiente'
    toast(`Actividad marcada como ${statusText}`, 'success')
    
  } catch (err) {
    showError('Error al mover actividad', err instanceof Error ? err.message : 'Error desconocido')
    // Recargar actividades en caso de error
    await loadActivities()
  }
}

// Lifecycle
onMounted(async () => {
  // Cargar clientes primero, luego actividades
  await loadClients()
  await loadActivities()
})

// Watchers
watch(() => props.searchTerm, () => {
  // La búsqueda se maneja en el computed filteredActivities
})

// Expose methods for parent component
defineExpose({
  loadActivities,
  loadClients,
  clients
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Personalizar scrollbar para las columnas */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Estilos para drag and drop */
.cursor-move:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.cursor-move:active {
  transform: scale(0.95);
}

/* Efectos durante el dragover */
.overflow-y-auto:has([draggable="true"]:hover) {
  background: rgba(139, 92, 246, 0.05);
  border-radius: 12px;
}

/* Indicador visual para zonas de drop */
.overflow-y-auto:drag-over {
  background: rgba(139, 92, 246, 0.1);
  border: 2px dashed rgba(139, 92, 246, 0.5);
  border-radius: 12px;
}

/* Animación para las tarjetas */
.group {
  transition: all 0.2s ease;
}

.group:not(:hover) {
  transition-delay: 0.1s;
}

/* Estilo especial cuando se está arrastrando */
[draggable="true"]:active {
  cursor: grabbing !important;
  transform: rotate(5deg) scale(1.05);
  z-index: 1000;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

/* Feedback visual para las columnas durante drag */
.drop-zone-highlight {
  background: rgba(139, 92, 246, 0.1);
  border: 2px dashed rgba(139, 92, 246, 0.5);
  border-radius: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { background: rgba(139, 92, 246, 0.05); }
  50% { background: rgba(139, 92, 246, 0.15); }
  100% { background: rgba(139, 92, 246, 0.05); }
}
</style>
