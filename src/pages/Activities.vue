<template>
  <div class="space-y-6">
    <!-- Search Bar -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="fas fa-search text-gray-400"></i>
        </div>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar actividades por título, descripción o cliente..."
          class="block w-full pl-10 pr-3 py-3 border border-gray-600/50 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
        />
      </div>
    </div>

    <!-- Activities View -->
    <ActivitiesView 
      ref="activitiesViewRef"
      :searchTerm="searchTerm"
      @create="openCreateModal"
      @edit="openEditModal"
      @open-notification-settings="showNotificationSettings = true"
    />

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h3 class="text-xl font-bold text-white">
            {{ editingActivity ? 'Editar Actividad' : 'Nueva Actividad' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <ActivityForm
            :activity="editingActivity"
            @save="handleSave"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
    
    <!-- Modal de configuración de notificaciones -->
    <TaskReportSettingsModal 
      v-if="showNotificationSettings" 
      @close="showNotificationSettings = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ActivitiesView from '../components/modules/ActivitiesView.vue'
import ActivityForm from '../components/forms/ActivityForm.vue'
import TaskReportSettingsModal from '../components/modals/TaskReportSettingsModal.vue'
import type { ActivityData } from '../services/activityService'

// Reactive state
const searchTerm = ref('')
const showModal = ref(false)
const showNotificationSettings = ref(false)
const editingActivity = ref<ActivityData | null>(null)
const activitiesViewRef = ref()

// Methods
const openCreateModal = () => {
  editingActivity.value = null
  showModal.value = true
}

const openEditModal = (activity: ActivityData) => {
  editingActivity.value = activity
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingActivity.value = null
}

const handleSave = () => {
  closeModal()
  // Recargar las actividades después de guardar
  if (activitiesViewRef.value?.loadActivities) {
    activitiesViewRef.value.loadActivities()
  }
}
</script>
