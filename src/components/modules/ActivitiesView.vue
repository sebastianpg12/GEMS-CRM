<template>
  <div class="space-y-6">
    <!-- Header con controles -->
    <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Gestión de Actividades</h1>
        <p class="text-gray-400 mt-1">Organiza tus actividades y gestiona tu calendario</p>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Toggle vista -->
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
            @click="currentView = 'calendar'"
            :class="currentView === 'calendar' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-400 hover:text-white'"
            class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            <i class="fas fa-calendar-alt mr-2"></i>
            Calendario
          </button>
        </div>
        
        <!-- Botón crear -->
        <PermissionGuard :permissions="['create-activities']" :fallback="false">
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            Nueva Actividad
          </button>
        </PermissionGuard>
      </div>
    </div>

    <!-- Barra de tarea rápida (en ambas vistas) -->
    <div class="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 relative">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-yellow-300">
          <i class="fas fa-lightning-bolt"></i>
          <span class="font-medium">Tarea Rápida</span>
          <!-- Indicador de configuración -->
          <div class="flex items-center text-xs bg-yellow-600/20 px-2 py-1 rounded">
            <i class="fas fa-timer mr-1"></i>
            <span>{{ quickTaskSettings.dueDays }}d</span>
            <span class="mx-1">·</span>
            <span>{{ quickTaskSettings.priority === 'low' ? 'Baja' : quickTaskSettings.priority === 'medium' ? 'Media' : quickTaskSettings.priority === 'high' ? 'Alta' : 'Urgente' }}</span>
            <span class="mx-1">·</span>
            <span>{{ quickTaskSettings.estimatedTime }}</span>
          </div>
        </div>
        
        <div class="flex-1 relative">
          <input
            v-model="quickTaskTitle"
            @keyup.enter="createQuickTaskNow"
            @keyup.esc="quickTaskTitle = ''"
            @focus="showQuickTaskHints = true"
            @blur="setTimeout(() => showQuickTaskHints = false, 200)"
            type="text"
            placeholder="¿Qué necesitas hacer? (Enter para crear, Esc para limpiar)"
            class="w-full px-3 py-2 bg-gray-800/50 border border-yellow-500/30 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
          />
          
          <!-- Hints para atajos de teclado -->
          <div 
            v-if="showQuickTaskHints && quickTaskTitle"
            class="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-md p-2 text-xs text-gray-400 z-20"
          >
            <div class="flex gap-4">
              <span><kbd class="bg-gray-800 px-1 rounded">Enter</kbd> Crear tarea</span>
              <span><kbd class="bg-gray-800 px-1 rounded">Esc</kbd> Limpiar</span>
              <span><kbd class="bg-gray-800 px-1 rounded">Ctrl+E</kbd> Editar después</span>
            </div>
          </div>
        </div>
        
        <button
          @click="createQuickTaskNow"
          :disabled="!quickTaskTitle.trim()"
          class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-bolt mr-1"></i>
          Crear
        </button>

        <!-- Configuración rápida (desplegable) -->
        <div class="relative">
          <button
            @click="showQuickSettings = !showQuickSettings"
            class="p-2 text-yellow-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Configuración rápida"
          >
            <i class="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
      <div class="flex flex-wrap gap-4 items-center">
        <!-- Filtro por miembro del equipo -->
        <div class="flex-1 min-w-64">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Filtrar por miembro del equipo
          </label>
          <select
            v-model="selectedTeamMember"
            @change="loadActivities"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos los miembros</option>
            <option value="unassigned">Sin asignar</option>
            <option v-for="member in teamMembers" :key="member._id" :value="member._id">
              {{ member.name }} - {{ member.role }}
            </option>
          </select>
        </div>

        <!-- Filtro por estado -->
        <div class="flex-1 min-w-48">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Filtrar por estado
          </label>
          <select
            v-model="selectedStatus"
            @change="loadActivities"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completada</option>
          </select>
        </div>

        <!-- Botón para limpiar filtros -->
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <i class="fas fa-filter-circle-xmark mr-2"></i>
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Vista de Calendario -->
    <div v-if="currentView === 'calendar'">
      <MonthlyCalendar
        :activities="filteredActivities"
        :clients="clients"
        :team-members="teamMembers"
        @quick-task="handleQuickTask"
        @view-activity="viewActivity"
      />
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="flex items-center justify-center py-12">
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
    <div
      v-else-if="currentView === 'kanban'"
      class="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 -mx-2 px-2 md:mx-0 md:px-0 md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
    >
      <!-- Columna Pendiente -->
  <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20 shrink-0 min-w-[78%] sm:min-w-[65%] md:min-w-0 md:w-auto snap-start">
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
            class="bg-gray-900/50 rounded-lg p-3 md:p-4 border border-gray-700 hover:border-yellow-500/40 transition-all duration-200 group cursor-move"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Header de la tarjeta -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2 flex-1">
                <i class="fas fa-grip-vertical text-gray-500 text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <h3 class="text-white font-semibold text-sm leading-tight flex-1">{{ activity.title }}</h3>
                
                <!-- Indicador de prioridad -->
                <span 
                  v-if="activity.priority"
                  class="px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1"
                  :class="getPriorityClass(activity.priority)"
                >
                  <i :class="getPriorityIcon(activity.priority)" class="text-[10px]"></i>
                  {{ getPriorityLabel(activity.priority) }}
                </span>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="markAsCompleted(activity._id!)"
                  class="p-1 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded transition-all duration-200"
                  title="Marcar como completada"
                >
                  <i class="fas fa-check text-xs"></i>
                </button>
                <PermissionGuard :permissions="['edit-activities']" :fallback="false">
                  <button
                    @click="editActivity(activity)"
                    class="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-all duration-200"
                    title="Editar"
                  >
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                </PermissionGuard>
                <PermissionGuard :permissions="['delete-activities']" :fallback="false">
                  <button
                    @click="deleteActivity(activity._id!)"
                    class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </PermissionGuard>
              </div>
            </div>

            <!-- Cliente -->
            <p class="text-gray-400 text-xs mb-2">{{ getClientName(activity.clientId) }}</p>

            <!-- Descripción -->
            <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ activity.description }}</p>

            <!-- Asignado a -->
            <div class="flex items-center gap-2 mb-3">
              <AvatarInline
                :name="getSmartAssignedName(activity)"
                :photo="(activity.assignedTo && typeof activity.assignedTo === 'object') ? activity.assignedTo.photo : ''"
              />
              <button
                v-if="!activity.assignedTo"
                @click="showAssignModal(activity)"
                class="ml-auto text-xs text-purple-400 hover:text-purple-300 transition-colors"
                title="Asignar actividad"
              >
                <i class="fas fa-user-plus"></i>
              </button>
            </div>

            <!-- Fecha y tiempo estimado -->
            <div class="flex items-center justify-between text-xs text-gray-400">
              <div class="flex items-center gap-1">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(activity.date) }}</span>
              </div>
              <div v-if="activity.estimatedTime" class="flex items-center gap-1">
                <i class="fas fa-clock"></i>
                <span>{{ activity.estimatedTime }}</span>
              </div>
            </div>

            <!-- Fecha de vencimiento -->
            <div v-if="activity.dueDate" class="mt-2 flex items-center gap-1 text-xs">
              <i class="fas fa-calendar-times text-orange-400"></i>
              <span 
                class="text-orange-400"
                :class="{ 'text-red-400': isOverdue(activity.dueDate) }"
              >
                Vence: {{ formatDate(activity.dueDate) }}
              </span>
            </div>
          </div>

          <!-- Estado vacío para pendientes -->
          <div v-if="pendingActivities.length === 0" class="text-center py-8">
            <i class="fas fa-clock text-3xl text-gray-600 mb-2"></i>
            <p class="text-gray-400 text-sm">No hay actividades pendientes</p>
          </div>
        </div>

        <!-- Botón de tarea rápida al final de la columna pendientes -->
        <div class="mt-3 px-2">
          <button
            @click="createQuickTaskForStatus('pending')"
            class="w-full py-2 border border-dashed border-yellow-500/30 rounded-lg text-yellow-300 hover:text-yellow-200 hover:border-yellow-400/50 hover:bg-yellow-500/5 transition-all duration-200 text-sm"
          >
            <i class="fas fa-plus mr-2"></i>
            Agregar tarea rápida
          </button>
        </div>
      </div>

      <!-- Columna En Proceso -->
  <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 shrink-0 min-w-[78%] sm:min-w-[65%] md:min-w-0 md:w-auto snap-start">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-play text-white text-sm"></i>
          </div>
          <h2 class="text-xl font-bold text-white">En Proceso</h2>
          <span class="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
            {{ inProgressActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300',
            isDragging && draggedActivity?.status !== 'in-progress' ? 'drop-zone-highlight' : ''
          ]"
          @drop="onDrop($event, 'in-progress')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in inProgressActivities"
            :key="activity._id"
            class="bg-gray-900/50 rounded-lg p-3 md:p-4 border border-gray-700 hover:border-blue-500/40 transition-all duration-200 group cursor-move"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Header de la tarjeta -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2 flex-1">
                <i class="fas fa-grip-vertical text-gray-500 text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <h3 class="text-white font-semibold text-sm leading-tight flex-1">{{ activity.title }}</h3>
                
                <!-- Indicador de prioridad -->
                <span 
                  v-if="activity.priority"
                  class="px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1"
                  :class="getPriorityClass(activity.priority)"
                >
                  <i :class="getPriorityIcon(activity.priority)" class="text-[10px]"></i>
                  {{ getPriorityLabel(activity.priority) }}
                </span>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="markAsCompleted(activity._id!)"
                  class="p-1 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded transition-all duration-200"
                  title="Marcar como completada"
                >
                  <i class="fas fa-check text-xs"></i>
                </button>
                <PermissionGuard :permissions="['edit-activities']" :fallback="false">
                  <button
                    @click="editActivity(activity)"
                    class="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-all duration-200"
                    title="Editar"
                  >
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                </PermissionGuard>
                <PermissionGuard :permissions="['delete-activities']" :fallback="false">
                  <button
                    @click="deleteActivity(activity._id!)"
                    class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </PermissionGuard>
              </div>
            </div>

            <!-- Cliente -->
            <p class="text-gray-400 text-xs mb-2">{{ getClientName(activity.clientId) }}</p>

            <!-- Descripción -->
            <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ activity.description }}</p>

            <!-- Asignado a -->
            <div class="flex items-center gap-2 mb-3">
              <AvatarInline
                :name="getSmartAssignedName(activity)"
                :photo="(activity.assignedTo && typeof activity.assignedTo === 'object') ? activity.assignedTo.photo : ''"
              />
              <button
                v-if="!activity.assignedTo"
                @click="showAssignModal(activity)"
                class="ml-auto text-xs text-purple-400 hover:text-purple-300 transition-colors"
                title="Asignar actividad"
              >
                <i class="fas fa-user-plus"></i>
              </button>
            </div>

            <!-- Fecha y tiempo estimado -->
            <div class="flex items-center justify-between text-xs text-gray-400">
              <div class="flex items-center gap-1">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(activity.date) }}</span>
              </div>
              <div v-if="activity.estimatedTime" class="flex items-center gap-1">
                <i class="fas fa-clock"></i>
                <span>{{ activity.estimatedTime }}</span>
              </div>
            </div>

            <!-- Fecha de vencimiento -->
            <div v-if="activity.dueDate" class="mt-2 flex items-center gap-1 text-xs">
              <i class="fas fa-calendar-times text-orange-400"></i>
              <span 
                class="text-orange-400"
                :class="{ 'text-red-400': isOverdue(activity.dueDate) }"
              >
                Vence: {{ formatDate(activity.dueDate) }}
              </span>
            </div>
          </div>

          <!-- Estado vacío para en proceso -->
          <div v-if="inProgressActivities.length === 0" class="text-center py-8">
            <i class="fas fa-play text-3xl text-gray-600 mb-2"></i>
            <p class="text-gray-400 text-sm">No hay actividades en proceso</p>
          </div>
        </div>

        <!-- Botón de tarea rápida al final de la columna en proceso -->
        <div class="mt-3 px-2">
          <button
            @click="createQuickTaskForStatus('in-progress')"
            class="w-full py-2 border border-dashed border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all duration-200 text-sm"
          >
            <i class="fas fa-plus mr-2"></i>
            Agregar tarea rápida
          </button>
        </div>
      </div>

      <!-- Columna Completada -->
  <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20 shrink-0 min-w-[78%] sm:min-w-[65%] md:min-w-0 md:w-auto snap-start">
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
            class="bg-gray-900/50 rounded-lg p-3 md:p-4 border border-gray-700 hover:border-green-500/40 transition-all duration-200 group cursor-move"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Header de la tarjeta -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2 flex-1">
                <i class="fas fa-grip-vertical text-gray-500 text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <h3 class="text-white font-semibold text-sm leading-tight flex-1">{{ activity.title }}</h3>
                
                <!-- Indicador de prioridad -->
                <span 
                  v-if="activity.priority"
                  class="px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1"
                  :class="getPriorityClass(activity.priority)"
                >
                  <i :class="getPriorityIcon(activity.priority)" class="text-[10px]"></i>
                  {{ getPriorityLabel(activity.priority) }}
                </span>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="markAsPending(activity._id!)"
                  class="p-1 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20 rounded transition-all duration-200"
                  title="Marcar como pendiente"
                >
                  <i class="fas fa-undo text-xs"></i>
                </button>
                <PermissionGuard :permissions="['edit-activities']" :fallback="false">
                  <button
                    @click="editActivity(activity)"
                    class="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-all duration-200"
                    title="Editar"
                  >
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                </PermissionGuard>
                <PermissionGuard :permissions="['delete-activities']" :fallback="false">
                  <button
                    @click="deleteActivity(activity._id!)"
                    class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </PermissionGuard>
              </div>
            </div>

            <!-- Cliente -->
            <p class="text-gray-400 text-xs mb-2">{{ getClientName(activity.clientId) }}</p>

            <!-- Descripción -->
            <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ activity.description }}</p>

            <!-- Asignado a -->
            <div class="flex items-center gap-2 mb-3">
              <AvatarInline
                :name="getSmartAssignedName(activity)"
                :photo="(activity.assignedTo && typeof activity.assignedTo === 'object') ? activity.assignedTo.photo : ''"
              />
            </div>

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


      <!-- Columna Vencida -->
  <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-red-600/30 shrink-0 min-w-[78%] sm:min-w-[65%] md:min-w-0 md:w-auto snap-start">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-white text-sm"></i>
          </div>
          <h2 class="text-xl font-bold text-white">Vencida</h2>
          <span class="bg-red-600/20 text-red-300 px-2 py-1 rounded-full text-xs font-medium">
            {{ overdueActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300',
            isDragging && draggedActivity?.status !== 'overdue' ? 'drop-zone-highlight' : ''
          ]"
          @drop="onDrop($event, 'overdue')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in overdueActivities"
            :key="activity._id"
            class="bg-red-900/20 rounded-lg p-4 border border-red-500/40 hover:border-red-500/60 transition-all duration-200 group cursor-move"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Header de la tarjeta -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2 flex-1">
                <i class="fas fa-grip-vertical text-gray-500 text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <h3 class="text-white font-semibold text-sm leading-tight flex-1">{{ activity.title }}</h3>
                
                <!-- Indicador de prioridad -->
                <span 
                  v-if="activity.priority"
                  class="px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1"
                  :class="getPriorityClass(activity.priority)"
                >
                  <i :class="getPriorityIcon(activity.priority)" class="text-[10px]"></i>
                  {{ getPriorityLabel(activity.priority) }}
                </span>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="markAsInProgress(activity._id!)"
                  class="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-all duration-200"
                  title="Retomar actividad"
                >
                  <i class="fas fa-play text-xs"></i>
                </button>
                <button
                  @click="extendDeadline(activity._id!)"
                  class="p-1 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20 rounded transition-all duration-200"
                  title="Extender plazo"
                >
                  <i class="fas fa-calendar-plus text-xs"></i>
                </button>
                <PermissionGuard :permissions="['edit-activities']" :fallback="false">
                  <button
                    @click="editActivity(activity)"
                    class="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-all duration-200"
                    title="Editar"
                  >
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                </PermissionGuard>
                <PermissionGuard :permissions="['delete-activities']" :fallback="false">
                  <button
                    @click="deleteActivity(activity._id!)"
                    class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </PermissionGuard>
              </div>
            </div>

            <!-- Cliente -->
            <p class="text-gray-400 text-xs mb-2">{{ getClientName(activity.clientId) }}</p>

            <!-- Descripción -->
            <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ activity.description }}</p>

            <!-- Asignado a -->
            <div class="flex items-center gap-2 mb-3">
              <AvatarInline
                :name="getSmartAssignedName(activity)"
                :photo="(activity.assignedTo && typeof activity.assignedTo === 'object') ? activity.assignedTo.photo : ''"
              />
            </div>

            <!-- Fecha y tiempo estimado -->
            <div class="flex items-center justify-between text-xs text-gray-400 mb-2">
              <div class="flex items-center gap-1">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(activity.date) }}</span>
              </div>
              <div v-if="activity.estimatedTime" class="flex items-center gap-1">
                <i class="fas fa-clock"></i>
                <span>{{ activity.estimatedTime }}</span>
              </div>
            </div>

            <!-- Fecha de vencimiento vencida -->
            <div v-if="activity.dueDate" class="flex items-center gap-1 text-xs">
              <i class="fas fa-exclamation-triangle text-red-400"></i>
              <span class="text-red-400 font-medium">
                Venció: {{ formatDate(activity.dueDate) }}
              </span>
              <span class="text-xs text-red-300 ml-2">
                ({{ getDaysOverdue(activity.dueDate) }} días)
              </span>
            </div>
          </div>

          <!-- Estado vacío para vencidas -->
          <div v-if="overdueActivities.length === 0" class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-3xl text-gray-600 mb-2"></i>
            <p class="text-gray-400 text-sm">No hay actividades vencidas</p>
            <p class="text-gray-500 text-xs mt-1">¡Excelente gestión del tiempo!</p>
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
          {{ props.searchTerm ? 'No se encontraron actividades que coincidan con tu búsqueda' : 'Comienza agregando tu primera actividad' }}
        </p>
        <PermissionGuard :permissions="['create-activities']" :fallback="false">
          <button
            @click="showCreateModal = true"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            <i class="fas fa-plus mr-2"></i>
            Crear Primera Actividad
          </button>
        </PermissionGuard>
      </div>
    </div>

    <!-- Modales -->
    <!-- Modal de crear/editar actividad -->
    <ActivityFormModal
      v-if="showCreateModal || showEditModal"
      :activity="editingActivity"
      :clients="clients"
      :team-members="teamMembers"
      @close="closeModals"
      @saved="onActivitySaved"
    />

    <!-- Modal de asignación -->
    <AssignActivityModal
      v-if="showAssignModalState"
      :activity="assigningActivity"
      :team-members="teamMembers"
      @close="closeAssignModal"
      @assign="handleAssignActivity"
    />

    <!-- Modal de tarea rápida -->
    <QuickTaskModal
      v-if="showQuickTaskModal"
      :selected-date="selectedDateForQuickTask!"
      @close="showQuickTaskModal = false; selectedDateForQuickTask = null"
      @create="handleQuickTaskCreate"
    />

    <!-- Modal de Configuración de Tareas Rápidas -->
    <Teleport to="body">
      <div
        v-if="showQuickSettings"
        class="fixed inset-0 z-[99999] overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Overlay -->
        <div 
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          @click="showQuickSettings = false"
        ></div>
        
        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-600 w-full max-w-md transform transition-all">
            <!-- Header del modal -->
            <div class="flex items-center justify-between p-6 border-b border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
                  <i class="fas fa-cog text-white"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Configuración</h3>
                  <p class="text-sm text-gray-400">Tareas rápidas por defecto</p>
                </div>
              </div>
              <button
                @click="showQuickSettings = false"
                class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Contenido del modal -->
            <div class="p-6 space-y-6">
              <!-- Días de vencimiento -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3">
                  <i class="fas fa-calendar-day text-yellow-400"></i>
                  Días hasta vencimiento
                </label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="day in [1, 2, 3, 7]"
                    :key="day"
                    @click="quickTaskSettings.dueDays = day"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      quickTaskSettings.dueDays === day 
                        ? 'bg-yellow-600 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    {{ day === 7 ? '1 sem' : `${day} día${day > 1 ? 's' : ''}` }}
                  </button>
                </div>
              </div>

              <!-- Prioridad por defecto -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3">
                  <i class="fas fa-flag text-yellow-400"></i>
                  Prioridad por defecto
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="priority in [
                      { value: 'low', label: 'Baja', color: 'green' },
                      { value: 'medium', label: 'Media', color: 'yellow' },
                      { value: 'high', label: 'Alta', color: 'orange' },
                      { value: 'urgent', label: 'Urgente', color: 'red' }
                    ]"
                    :key="priority.value"
                    @click="quickTaskSettings.priority = priority.value"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                      quickTaskSettings.priority === priority.value 
                        ? `bg-${priority.color}-600 text-white shadow-lg` 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    <i :class="`fas fa-circle text-${priority.color}-400 text-xs`"></i>
                    {{ priority.label }}
                  </button>
                </div>
              </div>

              <!-- Tiempo estimado -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3">
                  <i class="fas fa-clock text-yellow-400"></i>
                  Tiempo estimado
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="time in ['30 min', '1 hora', '2 horas', '4 horas', '1 día']"
                    :key="time"
                    @click="quickTaskSettings.estimatedTime = time"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      quickTaskSettings.estimatedTime === time 
                        ? 'bg-yellow-600 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    {{ time }}
                  </button>
                </div>
              </div>

              <!-- Auto-asignación -->
              <div class="bg-gray-750 rounded-xl p-4 border border-gray-600">
                <label class="flex items-center gap-3 cursor-pointer">
                  <div class="relative">
                    <input
                      v-model="quickTaskSettings.autoAssign"
                      type="checkbox"
                      class="sr-only"
                    >
                    <div :class="[
                      'w-12 h-6 rounded-full transition-all duration-200',
                      quickTaskSettings.autoAssign ? 'bg-yellow-600' : 'bg-gray-600'
                    ]">
                      <div :class="[
                        'w-5 h-5 bg-white rounded-full transition-transform duration-200 mt-0.5',
                        quickTaskSettings.autoAssign ? 'translate-x-6 ml-1' : 'translate-x-0 ml-1'
                      ]"></div>
                    </div>
                  </div>
                  <div>
                    <span class="text-white font-medium">Auto-asignación</span>
                    <p class="text-xs text-gray-400">Asignarme automáticamente las tareas rápidas</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Footer del modal -->
            <div class="flex items-center justify-between gap-3 p-6 border-t border-gray-700 bg-gray-750 rounded-b-2xl">
              <button
                @click="resetQuickSettings"
                class="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <i class="fas fa-undo mr-2"></i>
                Restablecer
              </button>
              <div class="flex gap-3">
                <button
                  @click="showQuickSettings = false"
                  class="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  @click="showQuickSettings = false"
                  class="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg"
                >
                  <i class="fas fa-save mr-2"></i>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { activityService, type ActivityData } from '../../services/activityService'
import { clientService, type ClientData } from '../../services/clientService'
import { teamService } from '../../services/teamService'
import { useNotifications } from '../../composables/useNotifications'
import { useAuthStore } from '../../stores/auth'
import type { TeamMember } from '../../types'
import PermissionGuard from '../PermissionGuard.vue'
import ActivityFormModal from '../forms/ActivityFormModal.vue'
import AssignActivityModal from '../modals/AssignActivityModal.vue'
import MonthlyCalendar from '../calendar/MonthlyCalendar.vue'
import QuickTaskModal from '../modals/QuickTaskModal.vue'
import AvatarInline from '../AvatarInline.vue'

// Props
interface Props {
  searchTerm?: string
}
const props = withDefaults(defineProps<Props>(), {
  searchTerm: ''
})

// Emits
const emit = defineEmits<{
  create: []
  edit: [activity: ActivityData]
}>()

// Composables
const { showSuccess, showError, confirmDelete, toast, showLoading, closeLoading } = useNotifications()
const authStore = useAuthStore()

// Reactive data
const activities = ref<ActivityData[]>([])
const clients = ref<ClientData[]>([])
const teamMembers = ref<TeamMember[]>([])
const loading = ref(true)
const loadingClients = ref(true)
const error = ref<string | null>(null)
const draggedActivity = ref<ActivityData | null>(null)
const isDragging = ref(false)

// Vista y UI
const currentView = ref<'kanban' | 'calendar'>('kanban')
const quickTaskTitle = ref('')
const showQuickSettings = ref(false)
const showQuickTaskHints = ref(false)

// Configuración de tareas rápidas
const quickTaskSettings = ref({
  dueDays: 2,
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  estimatedTime: '2 horas',
  autoAssign: true
})

// Filtros
const selectedTeamMember = ref('')
const selectedStatus = ref('')

// Modales
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingActivity = ref<ActivityData | null>(null)
const showAssignModalState = ref(false)
const assigningActivity = ref<ActivityData | null>(null)
const assignLoading = ref(false)

// Modales para funcionalidad del calendario
const showQuickTaskModal = ref(false)
const selectedDateForQuickTask = ref<Date | null>(null)
const showActivityDetailModal = ref(false)
const selectedActivity = ref<ActivityData | null>(null)

// Computed
const filteredActivities = computed(() => {
  let filtered = activities.value

  // Filtrar por término de búsqueda
  if (props.searchTerm) {
    const search = props.searchTerm.toLowerCase()
    filtered = filtered.filter(activity =>
      activity.title.toLowerCase().includes(search) ||
      activity.description?.toLowerCase().includes(search) ||
      getClientName(activity.clientId).toLowerCase().includes(search)
    )
  }

  return filtered
})

const pendingActivities = computed(() => 
  filteredActivities.value.filter(a => a.status === 'pending')
)

const inProgressActivities = computed(() => 
  filteredActivities.value.filter(a => a.status === 'in-progress')
)

const completedActivities = computed(() => 
  filteredActivities.value.filter(a => a.status === 'completed')
)

// Columna Cancelada eliminada del tablero Kanban; las actividades con estado 'cancelled' no se muestran en esta vista

const overdueActivities = computed(() => 
  filteredActivities.value.filter(a => a.status === 'overdue')
)

// Methods
const loadActivities = async () => {
  loading.value = true
  error.value = null
  
  try {
    const filters: any = {}
    if (selectedTeamMember.value && selectedTeamMember.value !== 'unassigned') {
      filters.assignedTo = selectedTeamMember.value
    }
    if (selectedStatus.value) {
      filters.status = selectedStatus.value
    }

    activities.value = Object.keys(filters).length > 0 
      ? await activityService.getWithFilters(filters)
      : await activityService.getAll()
    
    // Actualizar automáticamente las actividades vencidas
    await updateOverdueActivities()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    showError('Error al cargar actividades', error.value)
  } finally {
    loading.value = false
  }
}

const updateOverdueActivities = async () => {
  try {
    const today = new Date()
    const overdueActivitiesToUpdate = activities.value.filter(activity => 
      activity.dueDate && 
      new Date(activity.dueDate) < today && 
      activity.status !== 'completed' && 
  activity.status !== 'cancelled' &&
      activity.status !== 'overdue'
    )

    // Actualizar cada actividad vencida en el backend
    for (const activity of overdueActivitiesToUpdate) {
      if (activity._id) {
        await activityService.updateStatus(activity._id, 'overdue')
        // Actualizar en el estado local
        const activityIndex = activities.value.findIndex(a => a._id === activity._id)
        if (activityIndex !== -1) {
          activities.value[activityIndex].status = 'overdue'
        }
      }
    }

    if (overdueActivitiesToUpdate.length > 0) {
      console.log(`✅ Se actualizaron ${overdueActivitiesToUpdate.length} actividades vencidas`)
    }
  } catch (err) {
    console.error('❌ Error al actualizar actividades vencidas:', err)
  }
}

const loadTeamMembers = async () => {
  console.log('🔄 Iniciando carga de miembros del equipo...')
  console.log('👤 Usuario actual:', authStore.user?.name, '- Rol:', authStore.user?.role)
  console.log('🔐 Puede ver equipo:', authStore.canViewTeam)
  
  if (!authStore.canViewTeam) {
    console.log('❌ Usuario no tiene permisos para ver el equipo')
    return
  }
  
  try {
    console.log('🔄 Cargando miembros del equipo...')
    teamMembers.value = await teamService.getActiveMembers()
    console.log('✅ Miembros del equipo cargados:', teamMembers.value)
  } catch (err) {
    console.error('❌ Error loading team members:', err)
    // Intentar cargar todos los miembros si falla getActiveMembers
    try {
      console.log('🔄 Intentando cargar todos los miembros...')
      const allMembers = await teamService.getAll()
      teamMembers.value = allMembers.filter(member => member.isActive)
      console.log('✅ Miembros activos filtrados:', teamMembers.value)
    } catch (err2) {
      console.error('❌ Error loading all team members:', err2)
    }
  }
}

const loadClients = async () => {
  loadingClients.value = true
  try {
    clients.value = await clientService.getAll()
  } catch (err) {
    console.error('Error loading clients:', err)
  } finally {
    loadingClients.value = false
  }
}

const markAsCompleted = async (activityId: string) => {
  try {
    await activityService.updateStatus(activityId, 'completed')
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = 'completed'
    }
    
    toast('Actividad marcada como completada', 'success')
  } catch (err) {
    showError('Error al completar actividad', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const markAsPending = async (activityId: string) => {
  try {
    await activityService.updateStatus(activityId, 'pending')
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = 'pending'
    }
    
    toast('Actividad marcada como pendiente', 'success')
  } catch (err) {
    showError('Error al cambiar estado de actividad', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const markAsInProgress = async (activityId: string) => {
  try {
    await activityService.updateStatus(activityId, 'in-progress')
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = 'in-progress'
    }
    
    toast('Actividad marcada como en proceso', 'success')
  } catch (err) {
    showError('Error al cambiar estado de actividad', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const reactivateActivity = async (activityId: string) => {
  try {
    await activityService.updateStatus(activityId, 'pending')
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = 'pending'
    }
    
    toast('Actividad reactivada', 'success')
  } catch (err) {
    showError('Error al reactivar actividad', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const extendDeadline = async (activityId: string) => {
  try {
    const activity = activities.value.find(a => a._id === activityId)
    if (!activity) return
    
    // Establecer nueva fecha de vencimiento (7 días a partir de hoy)
    const newDeadline = new Date()
    newDeadline.setDate(newDeadline.getDate() + 7)
    
    await activityService.update(activityId, {
      ...activity,
      dueDate: newDeadline.toISOString(),
      status: 'pending' // Cambiar de vencida a pendiente
    })
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].dueDate = newDeadline.toISOString()
      activities.value[activityIndex].status = 'pending'
    }
    
    toast('Plazo extendido por 7 días', 'success')
  } catch (err) {
    showError('Error al extender plazo', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const getDaysOverdue = (dueDate: string): number => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date()
}

const deleteActivity = async (activityId: string) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (!activity) return

  const result = await confirmDelete(activity.title, 'actividad')
  if (result.isConfirmed) {
    try {
      await activityService.deleteActivity(activityId)
      activities.value = activities.value.filter(a => a._id !== activityId)
      toast('Actividad eliminada correctamente', 'success')
    } catch (err) {
      showError('Error al eliminar actividad', err instanceof Error ? err.message : 'Error desconocido')
    }
  }
}

const editActivity = (activity: ActivityData) => {
  editingActivity.value = activity
  showEditModal.value = true
}

const showAssignModal = (activity: ActivityData) => {
  assigningActivity.value = activity
  showAssignModalState.value = true
}

const closeAssignModal = () => {
  showAssignModalState.value = false
  assigningActivity.value = null
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingActivity.value = null
}

const onActivitySaved = (activity: ActivityData) => {
  if (editingActivity.value) {
    // Actualizar actividad existente
    const index = activities.value.findIndex(a => a._id === activity._id)
    if (index !== -1) {
      activities.value[index] = activity
    }
    toast('Actividad actualizada correctamente', 'success')
  } else {
    // Agregar nueva actividad
    activities.value.unshift(activity)
    toast('Actividad creada correctamente', 'success')
  }
}

const handleAssignActivity = async (assigneeId: string | null) => {
  if (!assigningActivity.value?._id) return
  
  assignLoading.value = true
  try {
    const updatedActivity = await activityService.reassignActivity(
      assigningActivity.value._id,
      assigneeId
    )
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === assigningActivity.value!._id)
    if (activityIndex !== -1) {
      activities.value[activityIndex] = updatedActivity
    }
    
    const assigneeName = assigneeId 
      ? teamMembers.value.find(m => m._id === assigneeId)?.name || 'Usuario'
      : 'Nadie'
    
    toast(`Actividad asignada a ${assigneeName}`, 'success')
    closeAssignModal()
  } catch (err) {
    showError('Error al asignar actividad', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    assignLoading.value = false
  }
}

// Métodos para funcionalidad del calendario
const handleQuickTask = (date: Date) => {
  selectedDateForQuickTask.value = date
  showQuickTaskModal.value = true
}

const createQuickTaskNow = async () => {
  if (!quickTaskTitle.value.trim()) return
  
  const today = new Date()
  const dueDate = new Date()
  dueDate.setDate(today.getDate() + quickTaskSettings.value.dueDays)
  
  const taskData = {
    title: quickTaskTitle.value.trim(),
    description: `Tarea creada rápidamente el ${today.toLocaleDateString('es-ES')}`,
    date: today.toISOString(),
    dueDate: dueDate.toISOString(),
    status: 'pending',
    priority: quickTaskSettings.value.priority,
    assignedTo: authStore.user?._id || null,
    clientId: null,
    estimatedTime: quickTaskSettings.value.estimatedTime,
    createdBy: authStore.user?._id || null
  }
  
  await handleQuickTaskCreate(taskData)
  quickTaskTitle.value = ''
  showQuickSettings.value = false
}

const handleQuickTaskCreate = async (taskData: any) => {
  try {
    showLoading('Creando tarea rápida...')
    const newActivity = await activityService.create(taskData)
    activities.value.unshift(newActivity)
    toast('Tarea rápida creada correctamente', 'success')
    showQuickTaskModal.value = false
    selectedDateForQuickTask.value = null
  } catch (err) {
    showError('Error al crear tarea rápida', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

const viewActivity = (activity: ActivityData) => {
  selectedActivity.value = activity
  showActivityDetailModal.value = true
}

const resetQuickSettings = () => {
  quickTaskSettings.value = {
    dueDays: 2,
    priority: 'medium',
    estimatedTime: '2 horas',
    autoAssign: true
  }
}

const createQuickTaskForStatus = async (status: string) => {
  const today = new Date()
  const dueDate = new Date()
  dueDate.setDate(today.getDate() + quickTaskSettings.value.dueDays)
  
  const taskData = {
    title: `Nueva tarea ${status === 'pending' ? 'pendiente' : status}`,
    description: `Tarea creada rápidamente en columna ${status} el ${today.toLocaleDateString('es-ES')}`,
    date: today.toISOString(),
    dueDate: dueDate.toISOString(),
    status: status,
    priority: quickTaskSettings.value.priority,
    assignedTo: authStore.user?._id || null,
    clientId: null,
    estimatedTime: quickTaskSettings.value.estimatedTime,
    createdBy: authStore.user?._id || null
  }
  
  try {
    showLoading('Creando tarea rápida...')
    const newActivity = await activityService.create(taskData)
    activities.value.unshift(newActivity)
    toast(`Tarea ${status === 'pending' ? 'pendiente' : status} creada`, 'success')
    
    // Si es una nueva tarea, permitir edición rápida del título
    setTimeout(() => {
      editActivity(newActivity)
    }, 500)
  } catch (err) {
    showError('Error al crear tarea rápida', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

// También crear una función auxiliar más simple para los casos actuales
const getActivityAssignedName = (assignedUser?: any): string => {
  console.log('🔍 getActivityAssignedName received:', assignedUser)
  
  // Si no hay usuario asignado
  if (!assignedUser) return 'Sin asignar'
  
  // Si es un objeto con nombre (nuevo formato populate)
  if (typeof assignedUser === 'object' && assignedUser.name) {
    console.log('✅ Found user name:', assignedUser.name)
    return assignedUser.name
  }
  
  // Si es solo un string ID, buscar en teamMembers
  if (typeof assignedUser === 'string') {
    const member = teamMembers.value.find(m => m._id === assignedUser)
    console.log('🔍 Looking for member with ID:', assignedUser, 'Found:', member)
    return member?.name || 'Sin asignar'
  }
  
  console.log('❌ Could not determine user name')
  return 'Sin asignar'
}

// Función que busca en las actividades actuales para encontrar la asignación correcta
const getActivityAssignmentByContext = (activityId: string): string => {
  console.log('🔍 Looking for activity:', activityId)
  
  // Buscar en todas las listas de actividades
  const allActivities = [
    ...pendingActivities.value,
    ...inProgressActivities.value,
    ...completedActivities.value,
    ...overdueActivities.value
  ]
  
  const activity = allActivities.find(a => a._id === activityId)
  
  if (activity) {
    console.log('✅ Found activity:', activity)
    return getAssignedToNameSmart(activity)
  }
  
  console.log('❌ Activity not found')
  return 'Sin asignar'
}

// Función especial para buscar el assignment en cualquier lugar de la actividad
const getAssignedToNameSmart = (param?: any): string => {
  console.log('🧠 getAssignedToNameSmart received:', param)
  
  // Si no hay parámetro, no podemos hacer nada
  if (!param) {
    console.log('❌ No parameter')
    return 'Sin asignar'
  }
  
  // Si recibimos directamente un usuario (objeto con name o string ID)
  if (typeof param === 'string' || (typeof param === 'object' && param.name)) {
    console.log('👤 Direct user parameter')
    return getActivityAssignedName(param)
  }
  
  // Si recibimos una actividad, buscar en ambos campos
  if (typeof param === 'object') {
    // Prioridad: assignedTo (nuevo formato)
    if (param.assignedTo) {
      console.log('✅ Found assignedTo')
      return getActivityAssignedName(param.assignedTo)
    }
    
    // Fallback: assignedToUser (formato legacy)
    if (param.assignedToUser) {
      console.log('⚠️ Found assignedToUser') 
      return getActivityAssignedName(param.assignedToUser)
    }
    
    // Si llegamos aquí, probablemente el parámetro era undefined/null de assignedToUser
    // pero tenemos la actividad padre. Necesitamos acceso a la actividad completa.
    console.log('🔍 Parameter appears to be empty assignedToUser, checking context')
  }
  
  console.log('❌ Could not find assignment')
  return 'Sin asignar'
}

// Crear un computed que tenga todas las actividades con su información completa
const allActivitiesWithAssignments = computed(() => {
  const allActivities = [
    ...pendingActivities.value,
    ...inProgressActivities.value,
    ...completedActivities.value,
    ...overdueActivities.value
  ]
  
  return allActivities.map(activity => ({
    ...activity,
    assignmentName: activity.assignedTo?.name || getActivityAssignedName(activity.assignedTo) || getActivityAssignedName(activity.assignedToUser) || 'Sin asignar'
  }))
})

// Función que busca la actividad y devuelve su asignación
const getAssignedToNameByContext = (activityId?: string): string => {
  if (!activityId) return 'Sin asignar'
  
  const activity = allActivitiesWithAssignments.value.find(a => a._id === activityId)
  return activity ? activity.assignmentName : 'Sin asignar'
}

// Función que maneja el caso cuando assignedToUser es undefined pero assignedTo tiene datos
const getAssignedToNameFixed = (activity: any): string => {
  console.log('🔧 getAssignedToNameFixed received activity:', activity)
  
  if (!activity) {
    console.log('❌ No activity provided')
    return 'Sin asignar'
  }
  
  // Prioridad: assignedTo (nuevo formato con populate del backend)
  if (activity.assignedTo) {
    console.log('✅ Using assignedTo field:', activity.assignedTo)
    return getActivityAssignedName(activity.assignedTo)
  }
  
  // Fallback: assignedToUser (formato anterior)
  if (activity.assignedToUser) {
    console.log('⚠️ Using assignedToUser field:', activity.assignedToUser)
    return getActivityAssignedName(activity.assignedToUser)
  }
  
  console.log('❌ No assignment found in activity')
  return 'Sin asignar'
}

// Función específica para obtener el nombre del asignado que maneja tanto assignedTo como assignedToUser
const getAssignmentDisplay = (activity: any): string => {
  console.log('🎯 getAssignmentDisplay for activity:', activity?._id, activity)
  
  if (!activity) {
    console.log('❌ No activity provided to getAssignmentDisplay')
    return 'Sin asignar'
  }
  
  // Prioridad 1: assignedTo con populate (formato nuevo del backend)
  if (activity.assignedTo) {
    console.log('✅ Found assignedTo:', activity.assignedTo)
    if (typeof activity.assignedTo === 'object' && activity.assignedTo.name) {
      console.log('✅ assignedTo has name:', activity.assignedTo.name)
      return activity.assignedTo.name
    }
    if (typeof activity.assignedTo === 'string') {
      const member = teamMembers.value.find(m => m._id === activity.assignedTo)
      console.log('🔍 assignedTo is string ID, found member:', member)
      return member?.name || 'Sin asignar'
    }
  }
  
  // Prioridad 2: assignedToUser (formato legacy)
  if (activity.assignedToUser) {
    console.log('⚠️ Using legacy assignedToUser:', activity.assignedToUser)
    if (typeof activity.assignedToUser === 'object' && activity.assignedToUser.name) {
      return activity.assignedToUser.name
    }
    if (typeof activity.assignedToUser === 'string') {
      const member = teamMembers.value.find(m => m._id === activity.assignedToUser)
      return member?.name || 'Sin asignar'
    }
  }
  
  console.log('❌ No assignment found')
  return 'Sin asignar'
}

// Variable para mantener el contexto de la actividad actual siendo renderizada
let currentActivityBeingRendered: any = null

// SOLUCIÓN DEFINITIVA: Crear una versión mejorada que funciona con el contexto de Vue
const getSmartAssignedName = (activity: any): string => {
  console.log('🎯 getSmartAssignedName for activity:', activity?._id)
  
  if (!activity) {
    console.log('❌ No activity provided')
    return 'Sin asignar'
  }
  
  // Si la actividad tiene assignedTo (el campo correcto del backend)
  if (activity.assignedTo) {
    console.log('✅ Found assignedTo:', activity.assignedTo)
    
    // Si es un objeto con nombre (populated)
    if (typeof activity.assignedTo === 'object' && activity.assignedTo.name) {
      console.log('✅ assignedTo has name:', activity.assignedTo.name)
      return activity.assignedTo.name
    }
    
    // Si es un ID string, buscar en teamMembers
    if (typeof activity.assignedTo === 'string') {
      const member = teamMembers.value.find(m => m._id === activity.assignedTo)
      console.log('🔍 assignedTo is ID, found member:', member)
      return member?.name || 'Sin asignar'
    }
  }
  
  // Fallback: assignedToUser (campo legacy)
  if (activity.assignedToUser) {
    console.log('⚠️ Using legacy assignedToUser:', activity.assignedToUser)
    
    if (typeof activity.assignedToUser === 'object' && activity.assignedToUser.name) {
      return activity.assignedToUser.name
    }
    
    if (typeof activity.assignedToUser === 'string') {
      const member = teamMembers.value.find(m => m._id === activity.assignedToUser)
      return member?.name || 'Sin asignar'
    }
  }
  
  console.log('❌ No assignment found')
  return 'Sin asignar'
}

// Función antigua modificada para usar la nueva función internamente
const getAssignedToName = (assignedParam?: any, activity?: any): string => {
  console.log('🔍 getAssignedToName called with:', assignedParam, 'typeof:', typeof assignedParam)
  console.log('🔍 Activity context:', activity)
  
  // Si el parámetro es undefined, intentamos usar el contexto de la actividad si está disponible
  if (assignedParam === undefined && activity) {
    console.log('🚨 assignedParam is undefined! Trying to use activity context...')
    return getSmartAssignedName(activity)
  }
  
  // Si el parámetro es undefined y no hay contexto, devolvemos sin asignar
  if (assignedParam === undefined) {
    console.log('🚨 assignedParam is undefined! Returning Sin asignar')
    return 'Sin asignar'
  }
  
  // Si es un objeto con nombre
  if (typeof assignedParam === 'object' && assignedParam?.name) {
    console.log('✅ Found user name:', assignedParam.name)
    return assignedParam.name
  }
  
  // Si es solo un string ID, buscar en teamMembers
  if (typeof assignedParam === 'string') {
    const member = teamMembers.value.find(m => m._id === assignedParam)
    console.log('� Looking for member with ID:', assignedParam, 'Found:', member)
    return member?.name || 'Sin asignar'
  }
  
  console.log('❌ Could not determine user name')
  return 'Sin asignar'
}

// Función auxiliar para buscar actividad por ID y obtener el nombre del asignado
const findActivityAssignment = (activityId: string): string => {
 
  const allActivities = [
    ...pendingActivities.value,
    ...inProgressActivities.value, 
    ...completedActivities.value,
    ...overdueActivities.value
  ]
  
  const activity = allActivities.find(a => a._id === activityId)
  if (activity) {
    return getAssignmentDisplay(activity)
  }
  
  return 'Sin asignar'
}

const getPriorityClass = (priority: string) => {
  const classes = {
    low: 'bg-blue-900/20 text-blue-300 border-blue-500/30',
    medium: 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30',
    high: 'bg-orange-900/20 text-orange-300 border-orange-500/30',
    urgent: 'bg-red-900/20 text-red-300 border-red-500/30'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const getPriorityIcon = (priority: string) => {
  const icons = {
    low: 'fas fa-arrow-down',
    medium: 'fas fa-minus',
    high: 'fas fa-arrow-up',
    urgent: 'fas fa-exclamation'
  }
  return icons[priority as keyof typeof icons] || icons.medium
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

const clearFilters = () => {
  selectedTeamMember.value = ''
  selectedStatus.value = ''
  loadActivities()
}

const getClientName = (clientData: any): string => {
  if (!clientData) return 'Cliente no válido'
  
  // Si es un objeto cliente con información completa
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

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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
  // Verificar usuario autenticado
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  console.log('🔐 Token presente:', !!token)
  console.log('👤 Usuario en localStorage:', userStr ? JSON.parse(userStr) : null)
  
  // Cargar datos iniciales
  await Promise.all([
    loadClients(),
    loadTeamMembers(),
    loadActivities()
  ])

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showQuickSettings.value = false
    }
  })
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

/* Ocultar barra horizontal pero mantener scroll táctil */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
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

/* Estilo para zona de drop */
.drop-zone-highlight {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.4);
}

/* Efectos visuales para las tarjetas */
.group:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Transiciones suaves */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
