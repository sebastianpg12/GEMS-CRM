<template>
  <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
    <!-- Header del calendario -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button
          @click="previousMonth"
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <h2 class="text-2xl font-black text-slate-800">
          {{ currentMonthName }} {{ currentYear }}
        </h2>
        
        <button
          @click="nextMonth"
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Botón para ir al mes actual -->
        <button
          @click="goToCurrentMonth"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold shadow-sm flex items-center"
        >
          <i class="fas fa-calendar-day mr-2"></i>
          Hoy
        </button>
        
        <!-- Botón para alternar vista -->
        <button
          @click="toggleView"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-bold shadow-sm flex items-center"
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
        class="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendario -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="min-h-[120px] border border-slate-200 rounded-lg p-2 relative transition-colors"
        :class="getDayClasses(day)"
      >
        <!-- Número del día -->
        <div class="flex justify-between items-start mb-2">
          <span
            class="text-sm"
            :class="day.isCurrentMonth ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'"
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
            class="px-2 py-1 rounded text-xs cursor-pointer shadow-sm border"
            :class="getActivityClasses(activity)"
            @click="viewActivity(activity)"
            :title="`${activity.title} - ${getClientName(activity.clientId)}`"
          >
            <div class="truncate font-bold">{{ activity.title }}</div>
            <div class="flex items-center gap-1 text-[10px] mt-0.5 font-medium opacity-90">
              <i class="fas fa-user"></i>
              <span>{{ getAssignedToName(activity) }}</span>
            </div>
          </div>
          
          <!-- Botón para agregar tarea rápida -->
          <button
            v-if="day.isCurrentMonth"
            @click="addQuickTask(day.date)"
            class="w-full mt-1 py-1 text-xs text-slate-400 hover:text-primary-600 hover:bg-primary-50 font-bold rounded border border-dashed border-slate-300 hover:border-primary-300 transition-all duration-200"
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
          <span class="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {{ getActivitiesForDay(day.date).length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-100">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-amber-500 rounded"></div>
        <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Pendiente</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-emerald-500 rounded"></div>
        <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Completada</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-rose-500 rounded"></div>
        <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Cancelada</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-orange-500 rounded"></div>
        <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Vencida</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Activity, TeamMember } from '../../types'

// Props
interface Props {
  activities: Activity[]
  clients: any[]
  teamMembers: TeamMember[]
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  quickTask: [date: Date]
  viewActivity: [activity: Activity]
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
    classes.push('opacity-50 bg-slate-50 border-transparent')
  } else {
    classes.push('bg-white')
  }
  
  if (isToday(day.date)) {
    classes.push('ring-2 ring-primary-500 ring-inset border-transparent')
  } else if (day.isCurrentMonth) {
    classes.push('hover:border-primary-200 hover:shadow-sm')
  }
  
  return classes.join(' ')
}

const getActivitiesForDay = (date: Date): Activity[] => {
  return props.activities.filter(activity => {
    const activityDate = new Date(activity.date)
    return activityDate.toDateString() === date.toDateString()
  })
}

const getActivityClasses = (activity: Activity) => {
  const baseClasses = 'transition-colors text-white'
  
  switch (activity.status) {
    case 'pending':
      const isOverdue = new Date(activity.dueDate || activity.date) < new Date()
      return isOverdue 
        ? `${baseClasses} bg-orange-500 hover:bg-orange-600 border-orange-600`
        : `${baseClasses} bg-amber-500 hover:bg-amber-600 border-amber-600`
    case 'completed':
      return `${baseClasses} bg-emerald-500 hover:bg-emerald-600 border-emerald-600`
    case 'cancelled':
      return `${baseClasses} bg-rose-500 hover:bg-rose-600 border-rose-600`
    default:
      return `${baseClasses} bg-slate-500 hover:bg-slate-600 border-slate-600`
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

const getAssignedToName = (activity: Activity): string => {
  if (!activity || !activity.assignedTo || activity.assignedTo.length === 0) return 'Sin asignar'
  
  // Si assignedTo es un array
  if (Array.isArray(activity.assignedTo)) {
    const firstUser = activity.assignedTo[0]
    
    // Si es un string (ID), buscar en teamMembers
    if (typeof firstUser === 'string') {
      const member = props.teamMembers.find(m => m._id === firstUser)
      return member?.name || 'Sin asignar'
    }
    
    // Si es un objeto completo de usuario
    if (firstUser && typeof firstUser === 'object' && 'name' in firstUser) {
      return (firstUser as any).name
    }
  }
  
  return 'Sin asignar'
}

const addQuickTask = (date: Date) => {
  emit('quickTask', date)
}

const viewActivity = (activity: Activity) => {
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
