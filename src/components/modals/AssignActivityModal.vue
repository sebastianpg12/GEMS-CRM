<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click="closeOnOutsideClick">
    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-md" @click.stop>
      <div class="p-6">
        <h2 class="text-xl font-bold text-white mb-4">
          <i class="fas fa-user-check mr-2 text-purple-400"></i>
          Asignar Actividad
        </h2>
        
        <!-- Información de la actividad -->
        <div class="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <i class="fas fa-tasks text-white text-sm"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-white font-medium mb-1">{{ activity?.title }}</h3>
              <p class="text-gray-400 text-sm line-clamp-2">{{ activity?.description }}</p>
              
              <!-- Información adicional -->
              <div class="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <div class="flex items-center gap-1">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(activity?.date || '') }}</span>
                </div>
                <div v-if="activity?.priority" class="flex items-center gap-1">
                  <i class="fas fa-exclamation-circle"></i>
                  <span>{{ getPriorityLabel(activity.priority) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Asignación actual -->
        <div v-if="activity?.assignedToUser" class="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div class="flex items-center gap-2 text-blue-300">
            <i class="fas fa-info-circle"></i>
            <span class="text-sm">
              Actualmente asignada a: <strong>{{ activity.assignedToUser.name }}</strong>
            </span>
          </div>
        </div>

        <!-- Selector de miembro del equipo -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-user mr-1"></i>
            Asignar a
          </label>
          <select
            v-model="selectedAssignee"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Sin asignar</option>
            <option v-for="member in teamMembers" :key="member._id" :value="member._id">
              {{ member.name }} - {{ member.role }}
              {{ member.department ? `(${member.department})` : '' }}
            </option>
          </select>
        </div>

        <!-- Información del miembro seleccionado -->
        <div v-if="selectedMember" class="mb-6 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white"></i>
            </div>
            <div>
              <h4 class="text-white font-medium">{{ selectedMember.name }}</h4>
              <p class="text-gray-400 text-sm">{{ selectedMember.role }}</p>
              <p v-if="selectedMember.department" class="text-gray-500 text-xs">
                {{ selectedMember.department }}
              </p>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleAssign"
            :disabled="loading || !hasChanges"
            class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-user-check"></i>
            {{ loading ? 'Asignando...' : 'Asignar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ActivityData } from '../../services/activityService'
import type { TeamMember } from '../../types'

interface Props {
  activity: ActivityData | null
  teamMembers: TeamMember[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  assign: [assigneeId: string | null]
}>()

const loading = ref(false)
const selectedAssignee = ref('')

const selectedMember = computed(() => {
  if (!selectedAssignee.value) return null
  return props.teamMembers.find(member => member._id === selectedAssignee.value)
})

const hasChanges = computed(() => {
  const currentAssigneeId = props.activity?.assignedTo || ''
  return selectedAssignee.value !== currentAssigneeId
})

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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

const handleAssign = () => {
  if (!hasChanges.value) return
  
  loading.value = true
  emit('assign', selectedAssignee.value || null)
  
  // El loading se desactiva desde el componente padre
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

const closeOnOutsideClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

onMounted(() => {
  // Establecer el valor actual de asignación
  selectedAssignee.value = props.activity?.assignedTo || ''
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
