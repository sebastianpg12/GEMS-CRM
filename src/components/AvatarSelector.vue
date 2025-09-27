<template>
  <div class="avatar-selector">
    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
      <i class="fas fa-gem mr-2 text-purple-400"></i>
      Elige tu Gema
    </h3>

    <!-- Preview del avatar seleccionado -->
    <div v-if="selectedAvatar" class="mb-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
      <div class="flex items-center space-x-4">
        <div class="text-center">
          <div class="w-16 h-16 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-lg mx-auto">
            <img
              :src="getSelectedAvatarData()?.path"
              :alt="getSelectedAvatarData()?.name"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
        <div class="flex-1">
          <h4 class="text-white font-medium text-lg">{{ getSelectedAvatarData()?.name }}</h4>
          <p class="text-gray-300 text-sm">Avatar seleccionado</p>
        </div>
        <div class="text-green-400">
          <i class="fas fa-check-circle text-2xl"></i>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="avatar in GEM_AVATARS"
        :key="avatar.id"
        @click="$emit('select', avatar.id)"
        class="avatar-option cursor-pointer transition-all duration-200 transform hover:scale-105 relative"
        :class="{
          'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-800 bg-yellow-400/10': selectedAvatar === avatar.id,
          'hover:ring-2 hover:ring-gray-400 hover:ring-offset-1': selectedAvatar !== avatar.id
        }"
      >
        <!-- Indicador de selección -->
        <div
          v-if="selectedAvatar === avatar.id"
          class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-10"
        >
          <i class="fas fa-check text-xs text-gray-900"></i>
        </div>

        <div class="avatar-container">
          <img
            :src="avatar.path"
            :alt="avatar.name"
            class="w-16 h-16 rounded-full object-cover border-2 transition-all duration-200"
            :class="selectedAvatar === avatar.id ? 'border-yellow-400' : 'border-white/20'"
          />
        </div>
        <p class="text-xs text-center mt-2 transition-colors duration-200"
           :class="selectedAvatar === avatar.id ? 'text-yellow-400 font-semibold' : 'text-gray-300'">
          {{ avatar.name }}
        </p>
      </div>
    </div>

    <div class="mt-6 text-center">
      <button
        @click="$emit('confirm')"
        :disabled="!selectedAvatar"
        class="px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="selectedAvatar ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' : 'bg-gray-600 text-gray-400'"
      >
        <i class="fas fa-check mr-2"></i>
        Confirmar Gema
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GEM_AVATARS, getAvatarById } from '@/utils/avatarConfig'

interface Props {
  selectedAvatar?: string
}

const props = defineProps<Props>()

defineEmits<{
  select: [avatarId: string]
  confirm: []
}>()

// Función para obtener los datos del avatar seleccionado
const getSelectedAvatarData = () => {
  if (!props.selectedAvatar) return null
  return getAvatarById(props.selectedAvatar)
}
</script>

<style scoped>
.avatar-selector {
  background: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(75, 85, 99, 0.5);
}

.avatar-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(55, 65, 81, 0.3);
}

.avatar-container {
  position: relative;
}

.avatar-option:hover {
  background: rgba(55, 65, 81, 0.5);
}
</style>