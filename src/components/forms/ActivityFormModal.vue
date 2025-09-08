<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click="closeOnOutsideClick">
    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6">
        <h2 class="text-xl font-bold text-white mb-6">
          {{ isEditing ? 'Editar Actividad' : 'Nueva Actividad' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Título -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Título de la actividad"
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Descripción de la actividad"
            ></textarea>
          </div>

          <!-- Cliente -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Cliente *
            </label>
            <select
              v-model="form.clientId"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Seleccionar cliente</option>
              <option v-for="client in clients" :key="client._id" :value="client._id">
                {{ client.name }} - {{ client.company }}
              </option>
            </select>
          </div>

          <!-- Asignar a -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Asignar a
            </label>
            <select
              v-model="form.assignedTo"
              @change="console.log('🔄 Assignment changed to:', form.assignedTo)"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Sin asignar</option>
              <option v-for="member in props.teamMembers" :key="member._id" :value="member._id">
                {{ member.name }} - {{ member.role }}
              </option>
            </select>
            <div v-if="form.assignedTo" class="text-xs text-gray-400 mt-1">
              Asignado a: {{ props.teamMembers.find(m => m._id === form.assignedTo)?.name }}
            </div>
          </div>

          <!-- Prioridad -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Prioridad
            </label>
            <select
              v-model="form.priority"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="pending">Pendiente</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <!-- Fecha de vencimiento -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Fecha de vencimiento
            </label>
            <input
              v-model="form.dueDate"
              type="datetime-local"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Tiempo estimado -->
          <div>
            <TimeEstimateInput v-model="form.estimatedTime" />
          </div>

          <!-- Fecha de la actividad -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Fecha de la actividad *
            </label>
            <input
              v-model="form.date"
              type="datetime-local"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
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
  assignedTo: '',
  priority: 'medium' as const,
  status: 'pending' as const,
  dueDate: '',
  estimatedTime: '',
  date: ''
})

// Poblar el formulario si estamos editando
const populateForm = () => {
  if (props.activity) {
    form.title = props.activity.title
    form.description = props.activity.description || ''
    form.clientId = props.activity.clientId
    form.assignedTo = props.activity.assignedTo || ''
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
      assignedTo: form.assignedTo || undefined,
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
