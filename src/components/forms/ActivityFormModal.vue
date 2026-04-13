<template>
  <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click="closeOnOutsideClick">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100">
            <i :class="isEditing ? 'fas fa-edit text-primary-600' : 'fas fa-plus text-primary-600'" class="text-sm"></i>
          </div>
          <h2 class="text-base font-black text-slate-800">
            {{ isEditing ? 'Editar Actividad' : 'Nueva Actividad' }}
          </h2>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="p-5">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Título -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Título <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm font-medium"
              placeholder="Título de la actividad"
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Descripción
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none text-sm"
              placeholder="Descripción de la actividad"
            ></textarea>
          </div>

          <!-- Cliente -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Cliente <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.clientId"
              required
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm font-medium appearance-none"
            >
              <option value="">Seleccionar cliente</option>
              <option v-for="client in clients" :key="client._id" :value="client._id">
                {{ client.name }} - {{ client.company }}
              </option>
            </select>
          </div>

          <!-- Asignar a -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Asignar a
            </label>
            <AssignedUsersSelector
              v-model="form.assignedTo"
              :teamMembers="props.teamMembers"
            />
          </div>

          <!-- Prioridad -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Prioridad
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button
                type="button"
                v-for="p in [
                  { value: 'low', label: 'Baja', cls: 'bg-blue-100 text-blue-700 border-blue-300' },
                  { value: 'medium', label: 'Media', cls: 'bg-amber-100 text-amber-700 border-amber-300' },
                  { value: 'high', label: 'Alta', cls: 'bg-orange-100 text-orange-700 border-orange-300' },
                  { value: 'urgent', label: 'Urgente', cls: 'bg-red-100 text-red-700 border-red-300' }
                ]"
                :key="p.value"
                @click="form.priority = p.value as 'low' | 'medium' | 'high' | 'urgent'"
                class="py-2 px-1 rounded-lg text-xs font-bold transition-all border"
                :class="form.priority === p.value ? p.cls : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Estado
            </label>
            <select
              v-model="form.status"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm font-medium appearance-none"
            >
              <option value="pending">Pendiente</option>
              <option value="in-progress">En Proceso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <!-- Fecha de vencimiento -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fecha de vencimiento
            </label>
            <input
              v-model="form.dueDate"
              type="datetime-local"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm"
            />
          </div>

          <!-- Tiempo estimado -->
          <div>
            <TimeEstimateInput v-model="form.estimatedTime" />
          </div>

          <!-- Fecha de la actividad -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fecha de la actividad <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.date"
              type="datetime-local"
              required
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm"
            />
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-bold text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
              {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import AssignedUsersSelector from '../AssignedUsersSelector.vue'
import { activityService } from '../../services/activityService'
import type { ActivityData } from '../../services/activityService'
import type { TeamMember, Client } from '../../types'
import TimeEstimateInput from './TimeEstimateInput.vue'

interface Props {
  activity?: ActivityData | null
  clients: Client[]
  teamMembers: TeamMember[]
}

const props = withDefaults(defineProps<Props>(), {
  activity: null,
  teamMembers: () => []
})

const emit = defineEmits<{
  close: []
  saved: [activity: ActivityData]
}>()

const loading = ref(false)

const isEditing = computed(() => !!props.activity)

const form = reactive({
  title: '',
  description: '',
  clientId: '',
  assignedTo: [] as string[],
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  status: 'pending' as 'pending' | 'completed' | 'cancelled' | 'in-progress' | 'overdue',
  dueDate: '',
  estimatedTime: '',
  date: ''
})
// ...eliminado: helpers de selección múltiple, ahora en AssignedUsersSelector

// Poblar el formulario si estamos editando
const populateForm = () => {
  if (props.activity) {
    form.title = props.activity.title
    form.description = props.activity.description || ''
    form.clientId = props.activity.clientId
    form.assignedTo = Array.isArray(props.activity.assignedTo)
      ? props.activity.assignedTo
      : props.activity.assignedTo ? [props.activity.assignedTo] : []
    form.priority = props.activity.priority || 'medium'
    form.status = props.activity.status
    form.dueDate = props.activity.dueDate ? formatDateTimeLocal(props.activity.dueDate) : ''
    form.estimatedTime = props.activity.estimatedTime || ''
    form.date = formatDateTimeLocal(props.activity.date)
  } else {
    // Para nueva actividad, establecer fecha actual
    form.date = new Date().toISOString().slice(0, 16)
  }
}

const formatDateTimeLocal = (dateString: string) => {
  return new Date(dateString).toISOString().slice(0, 16)
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const activityData = {
      title: form.title,
      description: form.description,
      clientId: form.clientId,
      assignedTo: (form.assignedTo || []).filter(id => typeof id === 'string' && id),
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate || undefined,
      estimatedTime: form.estimatedTime || undefined,
      date: form.date
    }

    console.log('🔍 Form data before submit:', form)
    console.log('🔍 Activity data to send:', activityData)
    console.log('🔍 AssignedTo value:', form.assignedTo)

    let savedActivity: ActivityData
    
    if (isEditing.value && props.activity?._id) {
      savedActivity = await activityService.update(props.activity._id, activityData)
    } else {
      savedActivity = await activityService.create(activityData)
    }
    
    console.log('✅ Saved activity:', savedActivity)
    
    emit('saved', savedActivity)
    emit('close')
  } catch (error) {
    console.error('Error saving activity:', error)
    alert('Error al guardar la actividad. Por favor intenta de nuevo.')
  } finally {
    loading.value = false
  }
}

const closeOnOutsideClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

onMounted(() => {
  console.log('📝 ActivityFormModal mounted')
  console.log('👥 Team members received:', props.teamMembers)
  console.log('🔢 Team members count:', props.teamMembers.length)
  populateForm()
})
</script>
