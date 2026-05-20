<template>
  <div class="flex items-center gap-2">
    <!-- Foto de perfil del usuario asignado -->
    <div class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
      <img
        v-if="userPhoto"
        :src="userPhoto"
        :alt="userName"
        class="w-full h-full object-cover"
        @error="handleImageError"
      >
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold"
      >
        {{ userInitials }}
      </div>
    </div>
    
    <span class="text-xs text-gray-400 flex-1">
      {{ userName }}
    </span>
    
    <button
      v-if="showAssignButton"
      @click="$emit('assign')"
      class="text-xs text-purple-400 hover:text-purple-300 transition-colors"
      title="Asignar actividad"
    >
      <i class="fas fa-user-plus"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFullPhotoUrl, getUserInitials } from '../../utils/photoUtils'

interface Props {
  activity: any
  teamMembers: any[]
  showAssignButton?: boolean
}

const props = defineProps<Props>()

defineEmits(['assign'])

// Función para obtener la foto del usuario asignado
const userPhoto = computed(() => {
  if (!props.activity) return ''
  
  let photoPath = ''
  
  // Buscar usuario en assignedTo primero
  if (props.activity.assignedTo) {
    if (typeof props.activity.assignedTo === 'object' && props.activity.assignedTo.photo) {
      photoPath = props.activity.assignedTo.photo
    } else {
      // Si es un ID, buscar en teamMembers
      const user = props.teamMembers.find(m => m._id === props.activity.assignedTo)
      photoPath = user?.photo || ''
    }
  }
  
  // Fallback a assignedToUser
  if (!photoPath && props.activity.assignedToUser) {
    if (typeof props.activity.assignedToUser === 'object' && props.activity.assignedToUser.photo) {
      photoPath = props.activity.assignedToUser.photo
    } else {
      // Si es un ID, buscar en teamMembers
      const user = props.teamMembers.find(m => m._id === props.activity.assignedToUser)
      photoPath = user?.photo || ''
    }
  }
  
  return getFullPhotoUrl(photoPath)
})

// Función para obtener el nombre del usuario asignado
const userName = computed(() => {
  if (!props.activity) return 'Sin asignar'
  
  // Buscar en assignedTo primero
  if (props.activity.assignedTo) {
    if (typeof props.activity.assignedTo === 'object' && props.activity.assignedTo.name) {
      return props.activity.assignedTo.name
    }
    // Si es un ID, buscar en teamMembers
    const user = props.teamMembers.find(m => m._id === props.activity.assignedTo)
    if (user) return user.name
  }
  
  // Fallback a assignedToUser
  if (props.activity.assignedToUser) {
    if (typeof props.activity.assignedToUser === 'object' && props.activity.assignedToUser.name) {
      return props.activity.assignedToUser.name
    }
    // Si es un ID, buscar en teamMembers
    const user = props.teamMembers.find(m => m._id === props.activity.assignedToUser)
    if (user) return user.name
  }
  
  return 'Sin asignar'
})

// Función para obtener las iniciales usando el helper
const userInitials = computed(() => {
  if (userName.value === 'Sin asignar') return 'SA'
  return getUserInitials(userName.value)
})

// Manejar error de imagen
const handleImageError = () => {
  // La imagen no se pudo cargar, se mostrará el fallback de iniciales automáticamente
}
</script>
