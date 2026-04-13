<template>
  <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <i class="fas fa-bolt text-indigo-600 text-sm"></i>
          </div>
          <h3 class="text-base font-black text-slate-800">Tarea Rápida</h3>
        </div>
        <button
          @click="$emit('close')"
          class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-5">
        <div class="space-y-4">
          <!-- Título -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Título <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              ref="titleInput"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm font-medium"
              placeholder="¿Qué necesitas hacer?"
              required
            />
          </div>

          <!-- Descripción (opcional) -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Descripción <span class="text-slate-400 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none text-sm"
              placeholder="Detalles adicionales..."
            ></textarea>
          </div>

          <!-- Información automática -->
          <div class="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <h4 class="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <i class="fas fa-magic text-indigo-500"></i>
              Configuración automática
            </h4>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-medium flex items-center gap-1.5"><i class="fas fa-calendar-day text-indigo-400"></i> Fecha:</span>
                <span class="text-slate-800 font-bold">{{ formatDate(selectedDate) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-medium flex items-center gap-1.5"><i class="fas fa-hourglass-end text-orange-400"></i> Vencimiento:</span>
                <span class="text-slate-800 font-bold">{{ formatDate(dueDate) }} <span class="text-slate-400 font-normal">(2 días)</span></span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-medium flex items-center gap-1.5"><i class="fas fa-user text-indigo-400"></i> Asignado a:</span>
                <span class="text-slate-800 font-bold">{{ currentUser?.name || 'Ti mismo' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-medium flex items-center gap-1.5"><i class="fas fa-building text-slate-400"></i> Cliente:</span>
                <span class="text-slate-500 italic">Se asignará después</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-medium flex items-center gap-1.5"><i class="fas fa-circle-dot text-amber-400"></i> Estado:</span>
                <span class="text-amber-600 font-bold">Pendiente</span>
              </div>
            </div>
          </div>

          <!-- Prioridad rápida -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Prioridad
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                v-for="priority in priorities"
                :key="priority.value"
                @click="form.priority = priority.value as 'low' | 'medium' | 'high' | 'urgent'"
                class="flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-200 border"
                :class="form.priority === priority.value 
                  ? priority.activeClass 
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'"
              >
                {{ priority.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-3 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-bold text-sm"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            :disabled="!form.title.trim() || loading"
            class="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-bolt"></i>
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
  { value: 'low', label: 'Baja', activeClass: 'bg-blue-600 text-white border-blue-600' },
  { value: 'medium', label: 'Media', activeClass: 'bg-amber-500 text-white border-amber-500' },
  { value: 'high', label: 'Alta', activeClass: 'bg-orange-600 text-white border-orange-600' },
  { value: 'urgent', label: 'Urgente', activeClass: 'bg-red-600 text-white border-red-600' }
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
.animate-fade-in {
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
