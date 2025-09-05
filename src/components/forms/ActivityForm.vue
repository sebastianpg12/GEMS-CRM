<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Información básica -->
    <div class="grid grid-cols-1 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Título de la Actividad *
        </label>
        <input
          v-model="form.title"
          type="text"
          required
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder="Ej: Reunión de seguimiento con cliente"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Cliente *
        </label>
        <select
          v-model="form.clientId"
          required
          :disabled="loadingClients"
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="" disabled>
            {{ loadingClients ? 'Cargando clientes...' : 'Selecciona un cliente' }}
          </option>
          <option 
            v-for="client in clients" 
            :key="client._id" 
            :value="client._id"
          >
            {{ client.name }} {{ client.company ? `- ${client.company}` : '' }}
          </option>
        </select>
        <p v-if="!loadingClients && clients.length === 0" class="text-yellow-400 text-sm mt-1">
          No hay clientes disponibles. Crea un cliente primero.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Fecha y Hora *
        </label>
        <input
          v-model="form.date"
          type="datetime-local"
          required
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Estado
        </label>
        <select
          v-model="form.status"
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="pending">Pendiente</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>
    </div>

    <!-- Descripción -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Descripción *
      </label>
      <textarea
        v-model="form.description"
        rows="4"
        required
        class="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
        placeholder="Describe los detalles de la actividad..."
      ></textarea>
    </div>

    <!-- Error message -->
    <div v-if="error" class="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
      <p class="text-red-400 text-sm">{{ error }}</p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-6 py-3 text-gray-400 hover:text-white transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading || clients.length === 0 || loadingClients"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/25"
      >
        <span v-if="loading" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Guardando...
        </span>
        <span v-else>
          {{ mode === 'create' ? 'Crear Actividad' : 'Actualizar Actividad' }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { activityService, type ActivityData } from '../../services/activityService'
import { clientService, type ClientData } from '../../services/clientService'

// Props
const props = defineProps<{
  activity?: ActivityData | null
}>()

// Emits
const emit = defineEmits(['save', 'cancel'])

// Reactive data
const loading = ref(false)
const error = ref('')
const clients = ref<ClientData[]>([])
const loadingClients = ref(false)

const form = reactive<Partial<ActivityData>>({
  title: '',
  description: '',
  date: '',
  status: 'pending',
  clientId: ''
})

// Computed
const mode = ref<'create' | 'edit'>('create')

// Methods
const loadClients = async () => {
  try {
    loadingClients.value = true
    clients.value = await clientService.getAll()
  } catch (err) {
    console.error('Error loading clients:', err)
    error.value = 'Error al cargar la lista de clientes'
  } finally {
    loadingClients.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // Validar que se haya seleccionado un cliente
    if (!form.clientId) {
      error.value = 'Debes seleccionar un cliente'
      return
    }

    // Validar que la fecha sea válida
    if (!form.date) {
      error.value = 'Debes seleccionar una fecha y hora'
      return
    }

    const activityData = {
      title: form.title!,
      description: form.description!,
      date: new Date(form.date!).toISOString(),
      status: form.status || 'pending',
      clientId: form.clientId!
    }

    if (mode.value === 'create') {
      await activityService.create(activityData)
    } else if (props.activity?._id) {
      await activityService.update(props.activity._id, activityData)
    }

    emit('save')
  } catch (err: any) {
    error.value = err.message || 'Error al guardar la actividad'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    date: '',
    status: 'pending',
    clientId: ''
  })
}

const loadForm = () => {
  if (props.activity) {
    mode.value = 'edit'
    Object.assign(form, {
      title: props.activity.title || '',
      description: props.activity.description || '',
      date: props.activity.date ? new Date(props.activity.date).toISOString().slice(0, 16) : '',
      status: props.activity.status || 'pending',
      clientId: typeof props.activity.clientId === 'string' ? props.activity.clientId : props.activity.clientId?._id || ''
    })
  } else {
    mode.value = 'create'
    resetForm()
    // Set default date to now + 1 hour
    const now = new Date()
    now.setHours(now.getHours() + 1)
    form.date = now.toISOString().slice(0, 16)
  }
}

// Load form data and clients on mount
onMounted(async () => {
  await loadClients()
  loadForm()
})

// Watch for changes in props
watch(() => props.activity, () => {
  loadForm()
})
</script>
