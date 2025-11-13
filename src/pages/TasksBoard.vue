<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <div class="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <!-- Selector de Board -->
        <div class="flex items-center gap-4">
          <select
            v-model="selectedBoardId"
            @change="onBoardChange"
            class="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Seleccionar Tablero</option>
            <option 
              v-for="board in boards" 
              :key="board._id"
              :value="board._id"
            >
              {{ board.name }}
            </option>
          </select>

          <!-- Toggle Vista -->
          <div class="flex bg-gray-700 rounded-lg p-1">
            <button
              @click="currentView = 'kanban'"
              :class="currentView === 'kanban' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'"
              class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              <i class="fas fa-columns mr-2"></i>
              Kanban
            </button>
            <button
              @click="currentView = 'list'"
              :class="currentView === 'list' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'"
              class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              <i class="fas fa-list mr-2"></i>
              Lista
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Filtros -->
          <button
            @click="showFilters = !showFilters"
            class="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-600/50 transition-colors"
          >
            <i class="fas fa-filter mr-2"></i>
            Filtros
          </button>

          <!-- Sprint Selector (only Scrum) -->
          <select
            v-if="currentBoard?.type === 'scrum'"
            v-model="selectedSprintId"
            @change="loadTasks"
            class="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
          >
            <option :value="null">Backlog</option>
            <option 
              v-for="sprint in sprints" 
              :key="sprint._id"
              :value="sprint._id"
            >
              {{ sprint.name }}
            </option>
          </select>

          <!-- Nueva Tarea -->
          <button
            @click="openTaskModal()"
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            Nueva Tarea
          </button>

          <!-- GitHub -->
          <button
            v-if="currentBoard?.github"
            @click="showGitHubPanel = !showGitHubPanel"
            class="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-600/50 transition-colors"
            title="GitHub Integration"
          >
            <i class="fab fa-github"></i>
          </button>
        </div>
      </div>

      <!-- Filtros Panel -->
      <div v-if="showFilters" class="mt-4 grid grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
          <select v-model="filters.type" @change="loadTasks" class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
            <option value="">Todos</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="user-story">User Story</option>
            <option value="epic">Epic</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Prioridad</label>
          <select v-model="filters.priority" @change="loadTasks" class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
            <option value="">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Estado</label>
          <select v-model="filters.status" @change="loadTasks" class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="blocked">Bloqueado</option>
            <option value="completed">Completado</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-600/50"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>

    <!-- Kanban View -->
    <div v-else-if="currentView === 'kanban' && selectedBoardId" class="overflow-x-auto">
      <div class="flex space-x-4 pb-4 min-w-max">
        <div
          v-for="column in columns"
          :key="column.id"
          class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 w-80 flex-shrink-0"
        >
          <!-- Column Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" :class="getColumnColor(column.id)"></div>
              <h3 class="text-white font-semibold">{{ column.name }}</h3>
              <span class="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {{ getColumnTasks(column.id).length }}
              </span>
              <span v-if="column.wipLimit" class="text-gray-500 text-xs">
                / {{ column.wipLimit }}
              </span>
            </div>
            <button
              @click="openTaskModal(column.id)"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>

          <!-- WIP Limit Warning -->
          <div 
            v-if="column.wipLimit && getColumnTasks(column.id).length >= column.wipLimit"
            class="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400"
          >
            <i class="fas fa-exclamation-triangle mr-1"></i>
            Límite WIP alcanzado
          </div>

          <!-- Tasks -->
          <div 
            class="space-y-3 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto"
            @drop="onDrop($event, column.id)"
            @dragover.prevent
            @dragenter.prevent
          >
            <div
              v-for="task in getColumnTasks(column.id)"
              :key="task._id"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
              @click="openTaskDetail(task)"
              class="bg-gray-900/50 rounded-lg p-3 border border-gray-700 hover:border-purple-500/50 transition-all cursor-move group"
            >
              <!-- Task Header -->
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2 flex-1">
                  <i :class="getTaskTypeIcon(task.type)" class="text-xs" :style="{ color: getTaskTypeColor(task.type) }"></i>
                  <h4 class="text-white text-sm font-medium flex-1 line-clamp-2">{{ task.title }}</h4>
                </div>
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                  :class="getPriorityClass(task.priority)"
                >
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>

              <!-- Description -->
              <p v-if="task.description" class="text-gray-400 text-xs mb-2 line-clamp-2">
                {{ task.description }}
              </p>

              <!-- Tags -->
              <div v-if="task.tags && task.tags.length" class="flex flex-wrap gap-1 mb-2">
                <span 
                  v-for="tag in task.tags.slice(0, 3)" 
                  :key="tag"
                  class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px]"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- GitHub Info -->
              <div v-if="task.github?.branch" class="flex items-center gap-2 mb-2 text-xs text-gray-400">
                <i class="fab fa-github"></i>
                <span class="truncate">{{ task.github.branch }}</span>
                <span 
                  v-if="task.github.pullRequest"
                  class="px-2 py-0.5 rounded text-[10px] font-medium"
                  :class="getPRStatusClass(task.github.pullRequest.status)"
                >
                  PR #{{ task.github.pullRequest.number }}
                </span>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-700/50">
                <!-- Assignee -->
                <div v-if="task.assignedTo" class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    {{ getInitials(task.assignedTo.name) }}
                  </div>
                  <span class="text-xs text-gray-400 truncate max-w-[100px]">
                    {{ task.assignedTo.name }}
                  </span>
                </div>
                <div v-else class="text-xs text-gray-500">Sin asignar</div>

                <!-- Metadata -->
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <div v-if="task.comments?.length" class="flex items-center gap-1">
                    <i class="fas fa-comment"></i>
                    <span>{{ task.comments.length }}</span>
                  </div>
                  <div v-if="task.attachments?.length" class="flex items-center gap-1">
                    <i class="fas fa-paperclip"></i>
                    <span>{{ task.attachments.length }}</span>
                  </div>
                  <div v-if="task.estimatedHours" class="flex items-center gap-1">
                    <i class="fas fa-clock"></i>
                    <span>{{ task.estimatedHours }}h</span>
                  </div>
                </div>
              </div>

              <!-- Blocked -->
              <div v-if="task.status === 'blocked'" class="mt-2 flex items-center gap-1 text-xs text-red-400">
                <i class="fas fa-ban"></i>
                <span>Bloqueada</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="getColumnTasks(column.id).length === 0" class="text-center py-8 text-gray-500 text-sm">
              <i class="fas fa-inbox text-2xl mb-2 opacity-50"></i>
              <p>Sin tareas</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else-if="currentView === 'list' && selectedBoardId" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-500/20 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tarea</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Prioridad</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Asignado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tiempo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">GitHub</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr 
              v-for="task in tasks" 
              :key="task._id"
              @click="openTaskDetail(task)"
              class="hover:bg-gray-700/30 cursor-pointer transition-colors"
            >
              <td class="px-4 py-3">
                <div>
                  <div class="text-white font-medium">{{ task.title }}</div>
                  <div class="text-gray-400 text-xs line-clamp-1">{{ task.description }}</div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs" :style="{ backgroundColor: getTaskTypeColor(task.type) + '20', color: getTaskTypeColor(task.type) }">
                  {{ getTaskTypeLabel(task.type) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs" :class="getBoardStatusClass(task.boardStatus)">
                  {{ getBoardStatusLabel(task.boardStatus) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs" :class="getPriorityClass(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div v-if="task.assignedTo" class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    {{ getInitials(task.assignedTo.name) }}
                  </div>
                  <span class="text-white text-sm">{{ task.assignedTo.name }}</span>
                </div>
                <span v-else class="text-gray-500 text-sm">Sin asignar</span>
              </td>
              <td class="px-4 py-3 text-white text-sm">
                {{ task.estimatedHours || 0 }}h / {{ task.actualHours || 0 }}h
              </td>
              <td class="px-4 py-3">
                <div v-if="task.github?.branch" class="flex items-center gap-2">
                  <i class="fab fa-github text-gray-400"></i>
                  <span class="text-gray-400 text-xs">{{ task.github.branch }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <i class="fas fa-clipboard-list text-4xl text-gray-600 mb-4"></i>
      <p class="text-gray-400">Selecciona un tablero para comenzar</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import { useTasksStore, type Task } from '@/stores/tasks'

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()

const currentView = ref<'kanban' | 'list'>('kanban')
const selectedBoardId = ref<string>('')
const selectedSprintId = ref<string | null>(null)
const showFilters = ref(false)
const showGitHubPanel = ref(false)
const filters = ref({
  type: '',
  priority: '',
  status: ''
})

const boards = computed(() => boardsStore.myBoards)
const currentBoard = computed(() => boardsStore.currentBoard)
const sprints = computed(() => boardsStore.currentBoardSprints)
const tasks = computed(() => tasksStore.tasks)
const loading = computed(() => boardsStore.loading || tasksStore.loading)

const columns = computed(() => {
  if (!currentBoard.value) return []
  return currentBoard.value.columns.sort((a, b) => a.order - b.order)
})

function getColumnTasks(columnId: string): Task[] {
  return tasks.value.filter(task => task.boardStatus === columnId)
}

function getColumnColor(columnId: string): string {
  const colors: Record<string, string> = {
    'backlog': 'bg-gray-500',
    'todo': 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    'review': 'bg-purple-500',
    'testing': 'bg-orange-500',
    'done': 'bg-green-500'
  }
  return colors[columnId] || 'bg-gray-500'
}

function getTaskTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'task': 'fas fa-tasks',
    'bug': 'fas fa-bug',
    'feature': 'fas fa-star',
    'user-story': 'fas fa-user',
    'epic': 'fas fa-mountain'
  }
  return icons[type] || 'fas fa-circle'
}

function getTaskTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'task': '#3B82F6',
    'bug': '#EF4444',
    'feature': '#A855F7',
    'user-story': '#10B981',
    'epic': '#F59E0B'
  }
  return colors[type] || '#6B7280'
}

function getTaskTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'task': 'Task',
    'bug': 'Bug',
    'feature': 'Feature',
    'user-story': 'User Story',
    'epic': 'Epic'
  }
  return labels[type] || type
}

function getPriorityClass(priority: string): string {
  const classes: Record<string, string> = {
    'low': 'bg-gray-500/20 text-gray-400',
    'medium': 'bg-yellow-500/20 text-yellow-400',
    'high': 'bg-orange-500/20 text-orange-400',
    'critical': 'bg-red-500/20 text-red-400'
  }
  return classes[priority] || 'bg-gray-500/20 text-gray-400'
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'critical': 'Crítica'
  }
  return labels[priority] || priority
}

function getBoardStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'backlog': 'bg-gray-500/20 text-gray-400',
    'todo': 'bg-blue-500/20 text-blue-400',
    'in-progress': 'bg-yellow-500/20 text-yellow-400',
    'review': 'bg-purple-500/20 text-purple-400',
    'testing': 'bg-orange-500/20 text-orange-400',
    'done': 'bg-green-500/20 text-green-400'
  }
  return classes[status] || 'bg-gray-500/20 text-gray-400'
}

function getBoardStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'backlog': 'Backlog',
    'todo': 'Por Hacer',
    'in-progress': 'En Progreso',
    'review': 'Revisión',
    'testing': 'Pruebas',
    'done': 'Completado'
  }
  return labels[status] || status
}

function getPRStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'open': 'bg-green-500/20 text-green-400',
    'closed': 'bg-gray-500/20 text-gray-400',
    'merged': 'bg-purple-500/20 text-purple-400'
  }
  return classes[status] || 'bg-gray-500/20 text-gray-400'
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

let draggedTask: Task | null = null

function onDragStart(event: DragEvent, task: Task) {
  draggedTask = task
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragEnd() {
  draggedTask = null
}

async function onDrop(event: DragEvent, targetColumnId: string) {
  event.preventDefault()
  if (draggedTask && draggedTask.boardStatus !== targetColumnId) {
    try {
      await tasksStore.moveTask(draggedTask._id, targetColumnId)
    } catch (error) {
      console.error('Error moving task:', error)
    }
  }
}

async function onBoardChange() {
  if (selectedBoardId.value) {
    await boardsStore.fetchBoardById(selectedBoardId.value)
    await loadTasks()
  }
}

async function loadTasks() {
  if (!selectedBoardId.value) return
  
  const filterParams = {
    ...filters.value,
    sprint: selectedSprintId.value || undefined
  }
  
  Object.keys(filterParams).forEach(key => {
    if (!filterParams[key as keyof typeof filterParams]) {
      delete filterParams[key as keyof typeof filterParams]
    }
  })
  
  await tasksStore.fetchTasks(selectedBoardId.value, filterParams)
}

function clearFilters() {
  filters.value = { type: '', priority: '', status: '' }
  loadTasks()
}

function openTaskModal(_columnId?: string) {
  // TODO: Implementar modal de creación
  console.log('Open task modal for column:', _columnId)
}

function openTaskDetail(_task: Task) {
  // TODO: Implementar modal de detalle
  console.log('Open task detail:', _task)
}

onMounted(async () => {
  await boardsStore.fetchBoards()
  if (boards.value.length > 0) {
    selectedBoardId.value = boards.value[0]._id
    await onBoardChange()
  }
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
