<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- Foto de perfil -->
        <div class="relative">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl">
            <img
              v-if="profileData.photo"
              :src="profileData.photo"
              :alt="profileData.name"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold"
            >
              {{ getInitials(profileData.name) }}
            </div>
          </div>
          
          <!-- Botón para cambiar foto -->
          <button
            @click="triggerFileInput"
            class="absolute bottom-2 right-2 w-10 h-10 bg-yellow-600 hover:bg-yellow-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 transform hover:scale-110"
            title="Cambiar foto"
          >
            <i class="fas fa-camera text-sm"></i>
          </button>
          
          <!-- Input file oculto -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="hidden"
          >
        </div>
        
        <!-- Info básica -->
        <div class="text-center md:text-left flex-1">
          <h1 class="text-3xl font-bold text-white mb-2">{{ profileData.name }}</h1>
          <p class="text-purple-300 text-lg mb-2">{{ getRoleDisplayName(profileData.role) }}</p>
          <p class="text-gray-400 mb-4">{{ profileData.email }}</p>
          
          <div class="flex flex-wrap gap-2 justify-center md:justify-start">
            <span class="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">
              <i class="fas fa-check-circle mr-1"></i>
              Activo
            </span>
            <span class="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
              <i class="fas fa-calendar mr-1"></i>
              Desde {{ formatDate(profileData.createdAt) }}
            </span>
          </div>
        </div>
        
        <!-- Botón editar -->
        <button
          @click="toggleEditMode"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <i class="fas fa-edit mr-2"></i>
          {{ isEditing ? 'Cancelar' : 'Editar Perfil' }}
        </button>
      </div>
    </div>

    <!-- Formulario de edición / Vista de información -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Información personal -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-6 flex items-center">
          <i class="fas fa-user mr-3 text-purple-400"></i>
          Información Personal
        </h2>
        
        <div class="space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Nombre completo</label>
            <input
              v-if="isEditing"
              v-model="editForm.name"
              type="text"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            >
            <p v-else class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData.name }}</p>
          </div>
          
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              v-if="isEditing"
              v-model="editForm.email"
              type="email"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="tu@email.com"
            >
            <p v-else class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData.email }}</p>
          </div>
          
          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
            <input
              v-if="isEditing"
              v-model="editForm.phone"
              type="tel"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+1 234 567 8900"
            >
            <p v-else class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData.phone || 'No especificado' }}</p>
          </div>
          
          <!-- Departamento -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Departamento</label>
            <input
              v-if="isEditing"
              v-model="editForm.department"
              type="text"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Departamento o área"
            >
            <p v-else class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData.department || 'No especificado' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Información del sistema -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-6 flex items-center">
          <i class="fas fa-cog mr-3 text-purple-400"></i>
          Información del Sistema
        </h2>
        
        <div class="space-y-4">
          <!-- Rol -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Rol</label>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ getRoleDisplayName(profileData.role) }}</p>
          </div>
          
          <!-- Fecha de creación -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Fecha de registro</label>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ formatDate(profileData.createdAt) }}</p>
          </div>
          
          <!-- Última actividad -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Última actividad</label>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ formatDate(profileData.updatedAt) }}</p>
          </div>
          
          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Estado</label>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-green-300">Activo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cambio de contraseña -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <h2 class="text-xl font-bold text-white mb-6 flex items-center">
        <i class="fas fa-lock mr-3 text-purple-400"></i>
        Seguridad
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Contraseña actual</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="••••••••"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Nueva contraseña</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="••••••••"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Confirmar contraseña</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="••••••••"
          >
        </div>
      </div>
      
      <div class="flex justify-end mt-4">
        <button
          @click="updatePassword"
          :disabled="!canUpdatePassword"
          class="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
        >
          <i class="fas fa-key mr-2"></i>
          Cambiar Contraseña
        </button>
      </div>
    </div>
    
    <!-- Botones de acción -->
    <div v-if="isEditing" class="flex justify-end gap-4">
      <button
        @click="toggleEditMode"
        class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        @click="saveProfile"
        :disabled="loading"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i class="fas fa-save mr-2"></i>
        {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { userService } from '../services/userService'
import { toast } from '../utils/toast'

const authStore = useAuthStore()

// State
const loading = ref(false)
const isEditing = ref(false)
const fileInput = ref<HTMLInputElement>()

const profileData = ref({
  name: '',
  email: '',
  role: '',
  phone: '',
  department: '',
  photo: '',
  createdAt: '',
  updatedAt: ''
})

const editForm = ref({
  name: '',
  email: '',
  phone: '',
  department: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const canUpdatePassword = computed(() => {
  return passwordForm.value.currentPassword && 
         passwordForm.value.newPassword && 
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 6
})

// Methods
const getInitials = (name: string) => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
}

const getRoleDisplayName = (role: string) => {
  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Empleado',
    viewer: 'Visualizador'
  }
  return roleNames[role] || role
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'No disponible'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const toggleEditMode = () => {
  if (isEditing.value) {
    // Cancelar - restaurar datos originales
    editForm.value = {
      name: profileData.value.name,
      email: profileData.value.email,
      phone: profileData.value.phone || '',
      department: profileData.value.department || ''
    }
  } else {
    // Iniciar edición - copiar datos actuales
    editForm.value = {
      name: profileData.value.name,
      email: profileData.value.email,
      phone: profileData.value.phone || '',
      department: profileData.value.department || ''
    }
  }
  isEditing.value = !isEditing.value
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  // Validar tipo y tamaño
  if (!file.type.startsWith('image/')) {
    toast.error('Por favor selecciona una imagen válida')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    toast.error('La imagen debe ser menor a 5MB')
    return
  }
  
  try {
    loading.value = true
    
    // Convertir a base64 para preview inmediato
    const reader = new FileReader()
    reader.onload = (e) => {
      if (profileData.value) {
        profileData.value.photo = e.target?.result as string
      }
    }
    reader.readAsDataURL(file)
    
    // Aquí subirías la imagen al servidor
    // const photoUrl = await userService.uploadPhoto(file)
    // profileData.value.photo = photoUrl
    
    toast.success('Foto de perfil actualizada')
  } catch (error) {
    console.error('Error al subir foto:', error)
    toast.error('Error al subir la foto')
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  if (!editForm.value.name.trim()) {
    toast.error('El nombre es requerido')
    return
  }
  
  if (!editForm.value.email.trim()) {
    toast.error('El email es requerido')
    return
  }
  
  try {
    loading.value = true
    
    const updateData = {
      name: editForm.value.name.trim(),
      email: editForm.value.email.trim(),
      phone: editForm.value.phone.trim() || null,
      department: editForm.value.department.trim() || null
    }
    
    // Actualizar en el servidor
    await userService.updateProfile(updateData)
    
    // Actualizar datos locales
    Object.assign(profileData.value, updateData)
    
    // Actualizar store de auth
    await authStore.refreshUserData()
    
    toast.success('Perfil actualizado correctamente')
    isEditing.value = false
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    toast.error('Error al actualizar el perfil')
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  try {
    loading.value = true
    
    await userService.updatePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    // Limpiar formulario
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    toast.success('Contraseña actualizada correctamente')
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    toast.error('Error al cambiar la contraseña')
  } finally {
    loading.value = false
  }
}

const loadProfile = async () => {
  try {
    loading.value = true
    
    // Cargar datos del perfil
    const profile = await userService.getProfile()
    profileData.value = profile
    
  } catch (error) {
    console.error('Error al cargar perfil:', error)
    // Usar datos del store como fallback
    if (authStore.user) {
      profileData.value = {
        name: authStore.user.name || '',
        email: authStore.user.email || '',
        role: authStore.user.role || '',
        phone: authStore.user.phone || '',
        department: authStore.user.department || '',
        photo: authStore.user.photo || '',
        createdAt: authStore.user.createdAt || '',
        updatedAt: authStore.user.updatedAt || ''
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>
