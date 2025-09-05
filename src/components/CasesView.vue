<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Gestión de Casos
        </h1>
        <p class="text-gray-400 mt-2">Documentos, Incidencias y Seguimientos unificados</p>
      </div>
      <button
        @click="showCreateForm = true"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg shadow-purple-500/25"
      >
        <i class="fas fa-plus"></i>
        <span>Nuevo Caso</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-400 text-sm font-medium">Total Casos</p>
            <p class="text-2xl font-bold text-white">{{ totalCases }}</p>
          </div>
          <div class="p-3 bg-blue-500/20 rounded-full">
            <i class="fas fa-folder text-blue-400 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-2xl p-6 border border-yellow-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-yellow-400 text-sm font-medium">En Progreso</p>
            <p class="text-2xl font-bold text-white">{{ inProgressCases }}</p>
          </div>
          <div class="p-3 bg-yellow-500/20 rounded-full">
            <i class="fas fa-clock text-yellow-400 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-400 text-sm font-medium">Resueltos</p>
            <p class="text-2xl font-bold text-white">{{ resolvedCases }}</p>
          </div>
          <div class="p-3 bg-green-500/20 rounded-full">
            <i class="fas fa-check-circle text-green-400 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl p-6 border border-red-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-400 text-sm font-medium">Críticos</p>
            <p class="text-2xl font-bold text-white">{{ criticalCases }}</p>
          </div>
          <div class="p-3 bg-red-500/20 rounded-full">
            <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-tag mr-2 text-purple-400"></i>Tipo
          </label>
          <select
            v-model="filters.tipo"
            @change="loadCases"
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="">Todos los tipos</option>
            <option value="documento">Documentos</option>
            <option value="incidencia">Incidencias</option>
            <option value="seguimiento">Seguimientos</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-flag mr-2 text-purple-400"></i>Estado
          </label>
          <select
            v-model="filters.estado"
            @change="loadCases"
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En Progreso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-star mr-2 text-purple-400"></i>Prioridad
          </label>
          <select
            v-model="filters.prioridad"
            @change="loadCases"
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-search mr-2 text-purple-400"></i>Buscar
          </label>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar casos..."
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            @input="filterCases"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-purple-500/20 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p class="text-gray-400">Cargando casos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-500/20">
      <div class="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
        <div class="flex items-center gap-3 mb-4">
          <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
          <h3 class="text-red-300 font-medium text-lg">Error al cargar casos</h3>
        </div>
        <p class="text-red-400 mb-4">{{ error }}</p>
        <button 
          @click="loadCases"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Cases List -->
    <div v-else class="space-y-4">
      <!-- Empty State -->
      <div v-if="filteredCases.length === 0" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-purple-500/20 text-center">
        <i class="fas fa-folder text-6xl text-gray-500 mb-4"></i>
        <h3 class="text-xl font-medium text-gray-300 mb-2">
          {{ searchTerm || hasActiveFilters ? 'No se encontraron casos' : 'No hay casos registrados' }}
        </h3>
        <p class="text-gray-400 mb-6">
          {{ searchTerm || hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza creando tu primer caso' }}
        </p>
        <button
          v-if="!searchTerm && !hasActiveFilters"
          @click="showCreateForm = true"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 mx-auto font-medium transform hover:scale-105 shadow-lg shadow-purple-500/25"
        >
          <i class="fas fa-plus"></i>
          Crear Primer Caso
        </button>
      </div>

      <!-- Cases Cards -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div 
          v-for="caseItem in paginatedCases" 
          :key="caseItem._id"
          class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-500/20 hover:shadow-xl hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 cursor-pointer" @click="selectCase(caseItem)">
                <div class="flex items-center gap-2 mb-2">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getTypeClass(caseItem.tipo)"
                  >
                    <i :class="getTypeIcon(caseItem.tipo)" class="mr-1"></i>
                    {{ caseItem.tipo.charAt(0).toUpperCase() + caseItem.tipo.slice(1) }}
                  </span>
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getPriorityClass(caseItem.prioridad)"
                  >
                    {{ caseItem.prioridad.charAt(0).toUpperCase() + caseItem.prioridad.slice(1) }}
                  </span>
                </div>
                <h3 class="text-white font-semibold text-lg mb-2 line-clamp-2">{{ caseItem.titulo }}</h3>
                <p class="text-gray-400 text-sm line-clamp-3">{{ caseItem.descripcion }}</p>
              </div>
              
              <!-- Action buttons -->
              <div class="flex flex-col gap-2 ml-4">
                <button
                  @click="editCase(caseItem)"
                  class="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all duration-200"
                  title="Editar caso"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="deleteCase(caseItem)"
                  class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  title="Eliminar caso"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span 
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(caseItem.estado)"
              >
                <i :class="getStatusIcon(caseItem.estado)" class="mr-1"></i>
                {{ caseItem.estado.replace('_', ' ').charAt(0).toUpperCase() + caseItem.estado.replace('_', ' ').slice(1) }}
              </span>
              
              <div class="flex items-center gap-2">
                <div v-if="caseItem.archivos && caseItem.archivos.length > 0" class="flex items-center gap-1 text-gray-400">
                  <i class="fas fa-paperclip text-xs"></i>
                  <span class="text-xs">{{ caseItem.archivos.length }}</span>
                </div>
                <span class="text-gray-500 text-xs">
                  {{ formatDate(caseItem.fechaCreacion) }}
                </span>
              </div>
            </div>

            <!-- Progress Bar (only for in-progress cases) -->
            <div v-if="caseItem.estado === 'en_progreso' && caseItem.progreso !== undefined" class="mt-4">
              <div class="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progreso</span>
                <span>{{ caseItem.progreso }}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${caseItem.progreso}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
        <button
          @click="currentPage = currentPage - 1"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="flex gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              page === currentPage
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="currentPage = currentPage + 1"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Create Form Modal -->
    <div v-if="showCreateForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h3 class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {{ selectedCase ? 'Editar Caso' : 'Crear Nuevo Caso' }}
          </h3>
          <button @click="closeModals" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <CaseForm
            :case="selectedCase"
            @save="handleSave"
            @cancel="closeModals"
          />
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedCase" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h3 class="text-xl font-bold text-white">{{ selectedCase.titulo }}</h3>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-white font-medium mb-4">Información del Caso</h4>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="text-gray-400">Tipo:</span>
                  <span :class="getTypeClass(selectedCase.tipo)" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ selectedCase.tipo.charAt(0).toUpperCase() + selectedCase.tipo.slice(1) }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-400">Estado:</span>
                  <span :class="getStatusClass(selectedCase.estado)" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ selectedCase.estado.replace('_', ' ').charAt(0).toUpperCase() + selectedCase.estado.replace('_', ' ').slice(1) }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-400">Prioridad:</span>
                  <span :class="getPriorityClass(selectedCase.prioridad)" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ selectedCase.prioridad.charAt(0).toUpperCase() + selectedCase.prioridad.slice(1) }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-400">Fecha:</span>
                  <span class="text-white">{{ formatDate(selectedCase.fechaCreacion) }}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="text-white font-medium mb-4">Descripción</h4>
              <p class="text-gray-300">{{ selectedCase.descripcion }}</p>
            </div>
          </div>
          
          <div v-if="selectedCase.archivos && selectedCase.archivos.length > 0" class="mt-6">
            <h4 class="text-white font-medium mb-4">Archivos Adjuntos</h4>
            <div class="space-y-2">
              <div v-for="archivo in selectedCase.archivos" :key="archivo.nombre" class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <i class="fas fa-file text-purple-400"></i>
                <div class="flex-1">
                  <p class="text-white text-sm">{{ archivo.nombre }}</p>
                  <p class="text-gray-400 text-xs">{{ formatFileSize(archivo.tamaño) }}</p>
                </div>
                <button class="text-purple-400 hover:text-purple-300 transition-colors">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CaseForm from './forms/CaseForm.vue'
import { casesService, type Case } from '../services/casesService'
import { useNotifications } from '../composables/useNotifications'

// Composables
const { showSuccess, showError, confirmDelete, showLoading, closeLoading } = useNotifications()

// State
const cases = ref<Case[]>([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const showCreateForm = ref(false)
const showDetailModal = ref(false)
const selectedCase = ref<Case | null>(null)
const currentPage = ref(1)
const itemsPerPage = 9

// Filters
const filters = ref({
  tipo: '',
  estado: '',
  prioridad: ''
})

// Computed properties
const totalCases = computed(() => cases.value.length)
const resolvedCases = computed(() => cases.value.filter(c => c.estado === 'resuelto').length)
const inProgressCases = computed(() => cases.value.filter(c => c.estado === 'en_progreso').length)
const criticalCases = computed(() => cases.value.filter(c => c.prioridad === 'critica').length)

const hasActiveFilters = computed(() => {
  return filters.value.tipo || filters.value.estado || filters.value.prioridad
})

const filteredCases = computed(() => {
  let filtered = cases.value

  // Apply text search
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(caseItem =>
      caseItem.titulo.toLowerCase().includes(search) ||
      caseItem.descripcion.toLowerCase().includes(search)
    )
  }

  // Apply filters
  if (filters.value.tipo) {
    filtered = filtered.filter(caseItem => caseItem.tipo === filters.value.tipo)
  }
  if (filters.value.estado) {
    filtered = filtered.filter(caseItem => caseItem.estado === filters.value.estado)
  }
  if (filters.value.prioridad) {
    filtered = filtered.filter(caseItem => caseItem.prioridad === filters.value.prioridad)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredCases.value.length / itemsPerPage))

const paginatedCases = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCases.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const loadCases = async () => {
  loading.value = true
  error.value = ''
  
  try {
    cases.value = await casesService.getAll()
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los casos'
    console.error('Error loading cases:', err)
  } finally {
    loading.value = false
  }
}

const selectCase = (caseItem: Case) => {
  selectedCase.value = caseItem
  showDetailModal.value = true
}

const editCase = (caseItem: Case) => {
  selectedCase.value = caseItem
  showCreateForm.value = true
}

const deleteCase = async (caseItem: Case) => {
  const result = await confirmDelete(caseItem.titulo, 'caso')
  
  if (!result.isConfirmed) {
    return
  }

  try {
    showLoading('Eliminando caso...')
    await casesService.deleteCase(caseItem._id!)
    
    // Remove from local array
    cases.value = cases.value.filter(c => c._id !== caseItem._id)
    closeLoading()
    showSuccess('¡Caso eliminado!', 'El caso ha sido eliminado exitosamente')
  } catch (err: any) {
    closeLoading()
    showError('Error al eliminar caso', err.message || 'Error desconocido al eliminar el caso')
  }
}

const closeModals = () => {
  showCreateForm.value = false
  showDetailModal.value = false
  selectedCase.value = null
}

const handleSave = () => {
  closeModals()
  loadCases()
  showSuccess('¡Caso guardado!', 'El caso ha sido guardado exitosamente')
}

const filterCases = () => {
  currentPage.value = 1
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Style helpers
const getTypeClass = (tipo: string) => {
  const classes = {
    documento: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    incidencia: 'bg-red-500/20 text-red-400 border border-red-500/30',
    seguimiento: 'bg-green-500/20 text-green-400 border border-green-500/30'
  }
  return classes[tipo as keyof typeof classes] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
}

const getTypeIcon = (tipo: string) => {
  const icons = {
    documento: 'fas fa-file-alt',
    incidencia: 'fas fa-exclamation-triangle',
    seguimiento: 'fas fa-eye'
  }
  return icons[tipo as keyof typeof icons] || 'fas fa-folder'
}

const getPriorityClass = (prioridad: string) => {
  const classes = {
    baja: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    media: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    alta: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    critica: 'bg-red-500/20 text-red-400 border border-red-500/30'
  }
  return classes[prioridad as keyof typeof classes] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
}

const getStatusClass = (estado: string) => {
  const classes = {
    abierto: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    en_progreso: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    resuelto: 'bg-green-500/20 text-green-400 border border-green-500/30',
    cerrado: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
  return classes[estado as keyof typeof classes] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
}

const getStatusIcon = (estado: string) => {
  const icons = {
    abierto: 'fas fa-folder-open',
    en_progreso: 'fas fa-spinner',
    resuelto: 'fas fa-check-circle',
    cerrado: 'fas fa-lock'
  }
  return icons[estado as keyof typeof icons] || 'fas fa-question'
}

// Initialize
onMounted(() => {
  loadCases()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>