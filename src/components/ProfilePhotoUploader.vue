<template>
  <div>
    <input 
      type="file"
      ref="fileInput"
      class="hidden"
      accept="image/*"
      @change="handleFileChange"
    />
    
    <!-- Previsualización de imagen y controles -->
    <div class="space-y-4">
      <!-- Previsualización de la imagen -->
      <div v-if="previewUrl" class="relative mx-auto">
        <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 mx-auto">
          <img
            :src="previewUrl"
            alt="Vista previa"
            class="w-full h-full object-cover"
          />
        </div>
        
        <!-- Botón para cancelar -->
        <button
          @click="cancelUpload"
          class="absolute top-0 right-0 bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-white shadow-lg"
          title="Cancelar"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Mensaje de carga -->
      <div v-if="uploading" class="text-center text-sm text-blue-400">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        Subiendo imagen...
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-wrap gap-2 justify-center">
        <button
          v-if="!previewUrl && !uploading"
          @click="triggerFileInput"
          class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2"
        >
          <i class="fas fa-camera"></i>
          Seleccionar Imagen
        </button>
        
        <button
          v-if="previewUrl && !uploading"
          @click="uploadPhoto"
          class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg flex items-center gap-2"
        >
          <i class="fas fa-cloud-upload-alt"></i>
          Subir Imagen
        </button>
        
        <button
          v-if="currentPhoto && !uploading && !previewUrl"
          @click="removePhoto"
          class="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg flex items-center gap-2"
        >
          <i class="fas fa-trash-alt"></i>
          Eliminar Foto Actual
        </button>
      </div>
      
      <!-- Mensajes de ayuda -->
      <div class="text-center text-xs text-gray-400 mt-2" v-if="!previewUrl && !uploading">
        <p>Sube una foto de perfil personalizada</p>
        <p>Tamaño máximo: 2MB</p>
      </div>
      
      <!-- Errores -->
      <div v-if="errorMessage" class="text-center text-sm text-red-400">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'
import { AvatarService } from '@/services/avatarService'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  currentPhoto?: string | null
}>()

const emit = defineEmits<{
  (e: 'update', data: { photo: string | null, avatar: string | null }): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const errorMessage = ref('')

// Métodos
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  
  if (files && files.length > 0) {
    const file = files[0]
    
    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      errorMessage.value = 'Por favor selecciona una imagen válida'
      return
    }
    
    // Validar tamaño (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      errorMessage.value = 'La imagen debe ser menor a 2MB'
      return
    }
    
    // Limpiar error previo
    errorMessage.value = ''
    
    // Crear URL para previsualización
    previewUrl.value = URL.createObjectURL(file)
    selectedFile.value = file
  }
}

const uploadPhoto = async () => {
  if (!selectedFile.value) return
  
  try {
    uploading.value = true
    errorMessage.value = ''
    
    const response = await AvatarService.uploadProfilePhoto(selectedFile.value)
    
    if (response.success) {
      toast.success('Foto de perfil actualizada correctamente')
      
      // Emitir evento con los nuevos datos
      emit('update', {
        photo: response.data?.photo || null,
        avatar: null // Al subir foto se elimina el avatar predefinido
      })
      
      // Limpiar previsualización
      cleanup()
    } else {
      errorMessage.value = response.message || 'Error al subir la imagen'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al subir la imagen'
    console.error('Error uploading photo:', error)
  } finally {
    uploading.value = false
  }
}

const removePhoto = async () => {
  try {
    uploading.value = true
    errorMessage.value = ''
    
    const response = await AvatarService.removeProfilePhoto()
    
    if (response.success) {
      toast.success('Foto de perfil eliminada correctamente')
      
      // Emitir evento con los nuevos datos
      emit('update', {
        photo: null,
        avatar: null
      })
    } else {
      errorMessage.value = response.message || 'Error al eliminar la imagen'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al eliminar la imagen'
    console.error('Error removing photo:', error)
  } finally {
    uploading.value = false
  }
}

const cancelUpload = () => {
  cleanup()
}

const cleanup = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>