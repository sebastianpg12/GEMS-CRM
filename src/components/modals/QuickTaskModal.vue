<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-white">
          <i class="fas fa-lightning-bolt text-yellow-400 mr-2"></i>
          Tarea Rápida
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Título -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Título de la tarea <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              ref="titleInput"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="¿Qué necesitas hacer?"
              required
            />
          </div>

          <!-- Descripción (opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Detalles adicionales..."
            ></textarea>
          </div>

          <!-- Información automática -->
          <div class="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <h4 class="text-sm font-medium text-gray-300 mb-2">
              <i class="fas fa-magic text-purple-400 mr-1"></i>
              Configuración automática:
            </h4>
            
            <div class="space-y-2 text-sm text-gray-400">
              <div class="flex justify-between">
                <span>📅 Fecha:</span>
                <span class="text-white">{{ formatDate(selectedDate) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span>⏰ Vencimiento:</span>
                <span class="text-white">{{ formatDate(dueDate) }} (2 días)</span>
              </div>
              
              <div class="flex justify-between">
                <span>👤 Asignado a:</span>
                <span class="text-white">{{ currentUser?.name || 'Ti mismo' }}</span>
              </div>
              
              <div class="flex justify-between">
                <span>🏢 Cliente:</span>
                <span class="text-gray-300">Se asignará después</span>
              </div>
              
              <div class="flex justify-between">
                <span>📊 Estado:</span>
                <span class="text-yellow-300">Pendiente</span>
              </div>
            </div>
          </div>

          <!-- Prioridad rápida -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Prioridad
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                v-for="priority in priorities"
                :key="priority.value"
                @click="form.priority = priority.value"
                class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200"
                :class="form.priority === priority.value 
                  ? priority.activeClass 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
              >
                {{ priority.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            :disabled="!form.title.trim() || loading"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-lightning-bolt mr-2"></i>
            {{ loading ? 'Creando...' : 'Crear Tarea' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

// Props
interface Props {
  selectedDate: Date
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  create: [taskData: any]
}>()

// Composables
const authStore = useAuthStore()

// Reactive data
const loading = ref(false)
const titleInput = ref<HTMLInputElement>()

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
})

// Computed
const currentUser = computed(() => authStore.user)

const dueDate = computed(() => {
  const date = new Date(props.selectedDate)
  date.setDate(date.getDate() + 2) // 2 días después
  return date
})

const priorities = [
  { value: 'low', label: 'Baja', activeClass: 'bg-blue-600 text-white' },
  { value: 'medium', label: 'Media', activeClass: 'bg-yellow-600 text-white' },
  { value: 'high', label: 'Alta', activeClass: 'bg-orange-600 text-white' },
  { value: 'urgent', label: 'Urgente', activeClass: 'bg-red-600 text-white' }
]

// Methods
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleSubmit = async () => {
  if (!form.value.title.trim()) return

  loading.value = true
  
  try {
    const taskData = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || `Tarea creada rápidamente para ${formatDate(props.selectedDate)}`,
      date: props.selectedDate.toISOString(),
      dueDate: dueDate.value.toISOString(),
      status: 'pending',
      priority: form.value.priority,
      assignedTo: currentUser.value?._id || null,
      clientId: null, // Se asignará después
      estimatedTime: '2 horas', // Tiempo por defecto
      createdBy: currentUser.value?._id || null
    }
    
    emit('create', taskData)
  } catch (error) {
    console.error('Error creating quick task:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  titleInput.value?.focus()
})
</script>

<style scoped>
/* Animación de entrada */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Animación del modal */
.bg-gray-800 {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
