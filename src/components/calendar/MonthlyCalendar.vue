<template>
  <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <!-- Header del calendario -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button
          @click="previousMonth"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <h2 class="text-2xl font-bold text-white">
          {{ currentMonthName }} {{ currentYear }}
        </h2>
        
        <button
          @click="nextMonth"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Botón para ir al mes actual -->
        <button
          @click="goToCurrentMonth"
          class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          <i class="fas fa-calendar-day mr-2"></i>
          Hoy
        </button>
        
        <!-- Botón para alternar vista -->
        <button
          @click="toggleView"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <i class="fas fa-eye mr-2"></i>
          {{ showTasks ? 'Ocultar Tareas' : 'Ver Tareas' }}
        </button>
      </div>
    </div>

    <!-- Días de la semana -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="p-3 text-center text-sm font-medium text-gray-400 border-b border-gray-700"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendario -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="min-h-[120px] border border-gray-700/30 rounded-lg p-2 relative"
        :class="getDayClasses(day)"
      >
        <!-- Número del día -->
        <div class="flex justify-between items-start mb-2">
          <span
            class="text-sm font-medium"
            :class="day.isCurrentMonth ? 'text-white' : 'text-gray-500'"
          >
            {{ day.date.getDate() }}
          </span>
          
          <!-- Indicador de día actual -->
          <div
            v-if="isToday(day.date)"
            class="w-2 h-2 bg-blue-500 rounded-full"
          ></div>
        </div>

        <!-- Tareas del día -->
        <div v-if="showTasks && day.isCurrentMonth" class="space-y-1">
          <div
            v-for="activity in getActivitiesForDay(day.date)"
            :key="activity._id"
            class="px-2 py-1 rounded text-xs cursor-pointer"
            :class="getActivityClasses(activity)"
            @click="viewActivity(activity)"
            :title="`${activity.title} - ${getClientName(activity.clientId)}`"
          >
            <div class="truncate font-medium">{{ activity.title }}</div>
            <div class="flex items-center gap-1 text-xs opacity-75">
              <i class="fas fa-user" style="font-size: 8px;"></i>
              <span>{{ getAssignedToName(activity.assignedToUser) }}</span>
            </div>
          </div>
          
          <!-- Botón para agregar tarea rápida -->
          <button
            v-if="day.isCurrentMonth"
            @click="addQuickTask(day.date)"
            class="w-full mt-1 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 rounded border border-dashed border-gray-600 hover:border-gray-500 transition-all duration-200"
            title="Agregar tarea rápida"
          >
            <i class="fas fa-plus mr-1"></i>
            Agregar
          </button>
        </div>

        <!-- Contador de tareas cuando no se muestran -->
        <div
          v-else-if="!showTasks && day.isCurrentMonth && getActivitiesForDay(day.date).length > 0"
          class="absolute bottom-2 right-2"
        >
          <span class="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
            {{ getActivitiesForDay(day.date).length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-700">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-yellow-500 rounded"></div>
        <span class="text-sm text-gray-300">Pendiente</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-green-500 rounded"></div>
        <span class="text-sm text-gray-300">Completada</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-red-500 rounded"></div>
        <span class="text-sm text-gray-300">Cancelada</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-orange-500 rounded"></div>
        <span class="text-sm text-gray-300">Vencida</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ActivityData, TeamMember } from '../../types'

// Props
interface Props {
  activities: ActivityData[]
  clients: any[]
  teamMembers: TeamMember[]
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  quickTask: [date: Date]
  viewActivity: [activity: ActivityData]
}>()

// Reactive data
const currentDate = ref(new Date())
const showTasks = ref(true)

// Computed
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const currentMonthName = computed(() => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[currentMonth.value]
})

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1)
  // Último día del mes
  const lastDay = new Date(year, month + 1, 0)
  
  // Días que necesitamos mostrar del mes anterior
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // Días que necesitamos mostrar del mes siguiente
  const endDate = new Date(lastDay)
  const remainingDays = 6 - lastDay.getDay()
  endDate.setDate(endDate.getDate() + remainingDays)
  
  const days = []
  const currentDay = new Date(startDate)
  
  while (currentDay <= endDate) {
    days.push({
      date: new Date(currentDay),
      isCurrentMonth: currentDay.getMonth() === month
    })
    currentDay.setDate(currentDay.getDate() + 1)
  }
  
  return days
})

// Methods
const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToCurrentMonth = () => {
  currentDate.value = new Date()
}

const toggleView = () => {
  showTasks.value = !showTasks.value
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getDayClasses = (day: any) => {
  const classes = []
  
  if (!day.isCurrentMonth) {
    classes.push('opacity-30')
  }
  
  if (isToday(day.date)) {
    classes.push('bg-blue-900/30 border-blue-500/50')
  } else {
    classes.push('hover:bg-gray-700/30')
  }
  
  return classes.join(' ')
}

const getActivitiesForDay = (date: Date): ActivityData[] => {
  return props.activities.filter(activity => {
    const activityDate = new Date(activity.date)
    return activityDate.toDateString() === date.toDateString()
  })
}

const getActivityClasses = (activity: ActivityData) => {
  const baseClasses = 'transition-colors'
  
  switch (activity.status) {
    case 'pending':
      const isOverdue = new Date(activity.dueDate || activity.date) < new Date()
      return isOverdue 
        ? `${baseClasses} bg-orange-600/80 text-white border-l-2 border-orange-400`
        : `${baseClasses} bg-yellow-600/80 text-white border-l-2 border-yellow-400`
    case 'completed':
      return `${baseClasses} bg-green-600/80 text-white border-l-2 border-green-400`
    case 'cancelled':
      return `${baseClasses} bg-red-600/80 text-white border-l-2 border-red-400`
    default:
      return `${baseClasses} bg-gray-600/80 text-white border-l-2 border-gray-400`
  }
}

const getClientName = (clientData: any): string => {
  if (!clientData) return 'Sin cliente'
  if (typeof clientData === 'object' && clientData.name) return clientData.name
  if (typeof clientData === 'string') {
    const client = props.clients.find(c => c._id === clientData)
    return client ? client.name : 'Cliente no encontrado'
  }
  return 'Sin cliente'
}

const getAssignedToName = (assignedUser?: any): string => {
  if (!assignedUser) return 'Sin asignar'
  if (typeof assignedUser === 'object' && assignedUser.name) return assignedUser.name
  return 'Sin asignar'
}

const addQuickTask = (date: Date) => {
  emit('quickTask', date)
}

const viewActivity = (activity: ActivityData) => {
  emit('viewActivity', activity)
}
</script>

<style scoped>
/* Animaciones suaves */
.transition-colors {
  transition: all 0.2s ease;
}

/* Hover effects para las tareas */
.cursor-pointer:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
