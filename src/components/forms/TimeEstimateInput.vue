<template>
  <div class="space-y-3">
    <label class="block text-sm font-medium text-gray-300">
      <i class="fas fa-clock text-blue-400 mr-1"></i>
      Tiempo Estimado
    </label>
    
    <!-- Botones rápidos predefinidos -->
    <div class="grid grid-cols-4 gap-2">
      <button
        type="button"
        v-for="preset in timePresets"
        :key="preset.value"
        @click="selectPreset(preset.value)"
        class="py-2 px-3 text-xs font-medium rounded-lg transition-all duration-200"
        :class="modelValue === preset.value 
          ? 'bg-purple-600 text-white shadow-lg' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'"
      >
        <i :class="preset.icon" class="mr-1"></i>
        {{ preset.label }}
      </button>
    </div>
    
    <!-- Divisor -->
    <div class="flex items-center gap-3">
      <div class="flex-1 h-px bg-gray-600"></div>
      <span class="text-xs text-gray-400">o personalizado</span>
      <div class="flex-1 h-px bg-gray-600"></div>
    </div>
    
    <!-- Entrada personalizada -->
    <div class="flex gap-3">
      <!-- Horas -->
      <div class="flex-1">
        <label class="block text-xs text-gray-400 mb-1">Horas</label>
        <div class="relative">
          <input
            v-model.number="customHours"
            @input="updateCustomTime"
            type="number"
            min="0"
            max="100"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
            placeholder="0"
          />
          <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">h</span>
        </div>
      </div>
      
      <!-- Minutos -->
      <div class="flex-1">
        <label class="block text-xs text-gray-400 mb-1">Minutos</label>
        <div class="relative">
          <select
            v-model.number="customMinutes"
            @change="updateCustomTime"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
          >
            <option value="0">0</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
          </select>
          <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">m</span>
        </div>
      </div>
    </div>
    
    <!-- Vista previa del tiempo seleccionado -->
    <div v-if="modelValue" class="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fas fa-stopwatch text-green-400"></i>
          <span class="text-sm text-gray-300">Tiempo estimado:</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-white font-medium">{{ modelValue }}</span>
          <button
            type="button"
            @click="clear"
            class="text-gray-400 hover:text-red-400 transition-colors"
            title="Limpiar"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>
      
      <!-- Barra de progreso visual (decorativa) -->
      <div class="mt-2">
        <div class="flex text-xs text-gray-500 mb-1">
          <span>Rápido</span>
          <span class="ml-auto">Largo</span>
        </div>
        <div class="w-full bg-gray-600 rounded-full h-1.5">
          <div 
            class="h-1.5 rounded-full transition-all duration-500"
            :class="getProgressBarClass()"
            :style="{ width: getProgressWidth() }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Props {
  modelValue?: string
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Reactive data
const customHours = ref(0)
const customMinutes = ref(0)

// Computed
const timePresets = [
  { value: '15 minutos', label: '15min', icon: 'fas fa-bolt' },
  { value: '30 minutos', label: '30min', icon: 'fas fa-clock' },
  { value: '1 hora', label: '1h', icon: 'fas fa-hourglass-half' },
  { value: '2 horas', label: '2h', icon: 'fas fa-hourglass-half' },
  { value: '4 horas', label: '4h', icon: 'fas fa-hourglass' },
  { value: '1 día', label: '1 día', icon: 'fas fa-calendar-day' },
  { value: '2 días', label: '2 días', icon: 'fas fa-calendar-alt' },
  { value: '1 semana', label: '1 sem', icon: 'fas fa-calendar-week' }
]

// Methods
const selectPreset = (value: string) => {
  emit('update:modelValue', value)
  
  // Actualizar campos personalizados basados en el preset
  updateCustomFieldsFromPreset(value)
}

const updateCustomFieldsFromPreset = (preset: string) => {
  switch (preset) {
    case '15 minutos':
      customHours.value = 0
      customMinutes.value = 15
      break
    case '30 minutos':
      customHours.value = 0
      customMinutes.value = 30
      break
    case '1 hora':
      customHours.value = 1
      customMinutes.value = 0
      break
    case '2 horas':
      customHours.value = 2
      customMinutes.value = 0
      break
    case '4 horas':
      customHours.value = 4
      customMinutes.value = 0
      break
    case '1 día':
      customHours.value = 8
      customMinutes.value = 0
      break
    case '2 días':
      customHours.value = 16
      customMinutes.value = 0
      break
    case '1 semana':
      customHours.value = 40
      customMinutes.value = 0
      break
    default:
      // Para valores personalizados, intentar parsearlo
      const match = preset.match(/(\d+)\s*(horas?|h)\s*(?:(\d+)\s*(minutos?|min))?/)
      if (match) {
        customHours.value = parseInt(match[1]) || 0
        customMinutes.value = parseInt(match[3]) || 0
      }
  }
}

const updateCustomTime = () => {
  const hours = customHours.value || 0
  const minutes = customMinutes.value || 0
  
  if (hours === 0 && minutes === 0) {
    emit('update:modelValue', '')
    return
  }
  
  let timeString = ''
  
  if (hours > 0) {
    timeString += `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }
  
  if (minutes > 0) {
    if (timeString) timeString += ' '
    timeString += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
  
  emit('update:modelValue', timeString)
}

const clear = () => {
  emit('update:modelValue', '')
  customHours.value = 0
  customMinutes.value = 0
}

const getProgressWidth = (): string => {
  if (!props.modelValue) return '0%'
  
  // Convertir el tiempo a minutos para calcular el porcentaje
  const totalMinutes = getTotalMinutes(props.modelValue)
  
  // Escala: 0-15min = 0-25%, 15min-1h = 25-50%, 1h-8h = 50-75%, 8h+ = 75-100%
  if (totalMinutes <= 15) {
    return `${(totalMinutes / 15) * 25}%`
  } else if (totalMinutes <= 60) {
    return `${25 + ((totalMinutes - 15) / 45) * 25}%`
  } else if (totalMinutes <= 480) { // 8 horas
    return `${50 + ((totalMinutes - 60) / 420) * 25}%`
  } else {
    return `${75 + Math.min(((totalMinutes - 480) / 1440) * 25, 25)}%` // Max 100%
  }
}

const getProgressBarClass = (): string => {
  if (!props.modelValue) return 'bg-gray-500'
  
  const totalMinutes = getTotalMinutes(props.modelValue)
  
  if (totalMinutes <= 60) {
    return 'bg-green-500' // Verde para tareas rápidas
  } else if (totalMinutes <= 480) {
    return 'bg-yellow-500' // Amarillo para tareas medianas
  } else {
    return 'bg-red-500' // Rojo para tareas largas
  }
}

const getTotalMinutes = (timeString: string): number => {
  if (!timeString) return 0
  
  let totalMinutes = 0
  
  // Buscar horas
  const hoursMatch = timeString.match(/(\d+)\s*(?:horas?|h)/)
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60
  }
  
  // Buscar minutos
  const minutesMatch = timeString.match(/(\d+)\s*(?:minutos?|min)/)
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1])
  }
  
  // Buscar días
  const daysMatch = timeString.match(/(\d+)\s*(?:días?|día)/)
  if (daysMatch) {
    totalMinutes += parseInt(daysMatch[1]) * 8 * 60 // 8 horas por día
  }
  
  // Buscar semanas
  const weeksMatch = timeString.match(/(\d+)\s*(?:semanas?|sem)/)
  if (weeksMatch) {
    totalMinutes += parseInt(weeksMatch[1]) * 5 * 8 * 60 // 5 días x 8 horas por semana
  }
  
  return totalMinutes
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue && !timePresets.some(preset => preset.value === newValue)) {
    updateCustomFieldsFromPreset(newValue)
  }
}, { immediate: true })
</script>

<style scoped>
/* Animaciones para los botones de preset */
button {
  transform: scale(1);
}

button:active {
  transform: scale(0.95);
}

/* Animación suave para la barra de progreso */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efectos hover para los inputs */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
</style>
