<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- Avatar de perfil -->
        <div class="relative">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl">
            <img
              v-if="selectedAvatarData"
              :src="selectedAvatarData.path"
              :alt="selectedAvatarData.name"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold"
            >
              {{ getInitials(profileData?.name || 'U') }}
            </div>
          </div>

          <!-- Botón para elegir gema -->
          <button
            @click="openAvatarSelector"
            class="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 transform hover:scale-110"
            title="Elegir Gema"
          >
            <i class="fas fa-gem text-sm"></i>
          </button>
        </div>
        
        <!-- Info básica -->
        <div class="text-center md:text-left flex-1">
          <h1 class="text-3xl font-bold text-white mb-2">{{ profileData?.name || 'Cargando...' }}</h1>
          <p class="text-purple-300 text-lg mb-2">{{ getRoleDisplayName(profileData?.role || '') }}</p>
          <p class="text-gray-400 mb-4">{{ profileData?.email || '' }}</p>
          
          <div class="flex flex-wrap gap-2 justify-center md:justify-start">
            <span class="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">
              <i class="fas fa-check-circle mr-1"></i>
              Activo
            </span>
            <span class="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
              <i class="fas fa-calendar mr-1"></i>
              Desde {{ formatDate(profileData?.createdAt || '') }}
            </span>
          </div>
        </div>

        <!-- Botón de editar -->
        <div class="flex gap-3">
          <button
            @click="toggleEditMode"
            :class="[
              'px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105',
              isEditing 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
            ]"
          >
            <i :class="isEditing ? 'fas fa-times' : 'fas fa-edit'" class="mr-2"></i>
            {{ isEditing ? 'Cancelar' : 'Editar Perfil' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Información Personal -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <h2 class="text-xl font-bold text-white mb-6 flex items-center">
        <i class="fas fa-user mr-3 text-purple-400"></i>
        Información Personal
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-signature mr-2"></i>
            Nombre Completo
          </label>
          <div v-if="isEditing">
            <input
              v-model="editForm.name"
              type="text"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>
          <div v-else>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData?.name || 'No especificado' }}</p>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-envelope mr-2"></i>
            Correo Electrónico
          </label>
          <div v-if="isEditing">
            <input
              v-model="editForm.email"
              type="email"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
          <div v-else>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData?.email || 'No especificado' }}</p>
          </div>
        </div>

        <!-- Teléfono -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-phone mr-2"></i>
            Teléfono
          </label>
          <div v-if="isEditing">
            <input
              v-model="editForm.phone"
              type="tel"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+57 300 000 0000"
            />
          </div>
          <div v-else>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData?.phone || 'No especificado' }}</p>
          </div>
        </div>

        <!-- Departamento -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-building mr-2"></i>
            Departamento
          </label>
          <div v-if="isEditing">
            <input
              v-model="editForm.department"
              type="text"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tu departamento"
            />
          </div>
          <div v-else>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData?.department || 'No especificado' }}</p>
          </div>
        </div>

        <!-- Rol (solo lectura) -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-user-tag mr-2"></i>
            Rol
          </label>
          <div>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ getRoleDisplayName(profileData?.role || '') }}</p>
          </div>
        </div>

        <!-- Fecha de registro -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-calendar-plus mr-2"></i>
            Fecha de Registro
          </label>
          <div>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ formatDate(profileData?.createdAt || '') }}</p>
          </div>
        </div>

        <!-- Última actualización -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-clock mr-2"></i>
            Última Actualización
          </label>
          <div>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ formatDate(profileData?.updatedAt || '') }}</p>
          </div>
        </div>
      </div>

      <!-- Botones de acción para modo edición -->
      <div v-if="isEditing" class="flex gap-4 mt-6 justify-end">
        <button
          @click="toggleEditMode"
          class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300"
        >
          <i class="fas fa-times mr-2"></i>
          Cancelar
        </button>
        <button
          @click="updateProfile"
          :disabled="loading"
          class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
        >
          <i class="fas fa-save mr-2"></i>
          {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>

    <!-- Cambiar Contraseña -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <h2 class="text-xl font-bold text-white mb-6 flex items-center">
        <i class="fas fa-lock mr-3 text-purple-400"></i>
        Cambiar Contraseña
      </h2>
      
      <form @submit.prevent="updatePassword" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Contraseña Actual
            </label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              autocomplete="new-password"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Contraseña
            </label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              autocomplete="new-password"
              required
            />
          </div>
        </div>
        
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
          >
            <i class="fas fa-key mr-2"></i>
            {{ loading ? 'Actualizando...' : 'Cambiar Contraseña' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal Selector de Avatares -->
    <div v-if="showAvatarSelector" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">Elige tu Gema</h3>
          <button
            @click="showAvatarSelector = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <AvatarSelector
          :selected-avatar="tempSelectedAvatar || profileData.avatar || getDefaultAvatar().id"
          @select="selectAvatar"
          @confirm="confirmAvatarSelection"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import { AvatarService } from '@/services/avatarService'
import { toast } from 'vue3-toastify'
import AvatarSelector from '@/components/AvatarSelector.vue'
import { getAvatarById, getDefaultAvatar } from '@/utils/avatarConfig'

const authStore = useAuthStore()

// State
const loading = ref(false)
const isEditing = ref(false)
const showAvatarSelector = ref(false)
const tempSelectedAvatar = ref<string>('')

const profileData = ref({
  name: '',
  email: '',
  role: '',
  phone: '',
  department: '',
  avatar: null as string | null, // Permitir null
  createdAt: '',
  updatedAt: ''
})

// Computed para obtener datos del avatar seleccionado
const selectedAvatarData = computed(() => {
  const avatarId = profileData.value?.avatar
  return avatarId ? getAvatarById(avatarId) : getDefaultAvatar()
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

// Methods
const getInitials = (name: string) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
}

const getRoleDisplayName = (role: string) => {
  const roles: { [key: string]: string } = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'user': 'Usuario',
    'employee': 'Empleado'
  }
  return roles[role] || role || 'Sin rol'
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'No disponible'
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

// Funciones para manejar selección de avatares
const selectAvatar = (avatarId: string) => {
  tempSelectedAvatar.value = avatarId
}

const openAvatarSelector = () => {
  tempSelectedAvatar.value = profileData.value.avatar || getDefaultAvatar().id
  showAvatarSelector.value = true
}

const confirmAvatarSelection = async () => {
  if (!tempSelectedAvatar.value) return

  try {
    loading.value = true

    // Usar el servicio de avatares específico
    const result = await AvatarService.updateUserAvatar(tempSelectedAvatar.value)

    if (result.success) {
      // Actualizar datos locales
      profileData.value.avatar = tempSelectedAvatar.value

      // Actualizar el store de auth
      if (authStore.user) {
        authStore.user.avatar = tempSelectedAvatar.value
        localStorage.setItem('user', JSON.stringify(authStore.user))
      }

      showAvatarSelector.value = false
      tempSelectedAvatar.value = ''
      toast.success('Avatar actualizado correctamente')
    } else {
      toast.error(result.message || 'Error al actualizar el avatar')
    }

  } catch (error) {
    console.error('Error al actualizar avatar:', error)
    toast.error('Error al actualizar el avatar')
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  if (!profileData.value) return
  
  if (isEditing.value) {
    // Cancelar - restaurar datos originales
    editForm.value = {
      name: profileData.value.name || '',
      email: profileData.value.email || '',
      phone: profileData.value.phone || '',
      department: profileData.value.department || ''
    }
  } else {
    // Iniciar edición - copiar datos actuales
    editForm.value = {
      name: profileData.value.name || '',
      email: profileData.value.email || '',
      phone: profileData.value.phone || '',
      department: profileData.value.department || ''
    }
  }
  isEditing.value = !isEditing.value
}

const updateProfile = async () => {
  try {
    loading.value = true
    
    const result = await authStore.updateProfile(editForm.value)
    
    if (result.success) {
      // Actualizar datos locales
      Object.assign(profileData.value, editForm.value)
      
      isEditing.value = false
      toast.success('Perfil actualizado correctamente')
    } else {
      toast.error(result.message || 'Error al actualizar el perfil')
    }
    
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
    
    console.log('🔄 Iniciando carga de perfil...')
    console.log('👤 AuthStore user:', authStore.user)
    
    // Inicializar inmediatamente con datos del store si están disponibles
    if (authStore.user) {
      console.log('✅ Datos encontrados en authStore, inicializando...')
      profileData.value = {
        name: authStore.user.name || '',
        email: authStore.user.email || '',
        role: authStore.user.role || '',
        phone: (authStore.user as any).phone || '',
        department: authStore.user.department || '',
        avatar: (authStore.user as any).avatar || null, // Permitir null
        createdAt: (authStore.user as any).createdAt || '',
        updatedAt: (authStore.user as any).updatedAt || ''
      }
      console.log('📋 ProfileData inicial:', profileData.value)
    } else {
      console.log('❌ No se encontraron datos en authStore')
    }
    
    // Intentar cargar datos actualizados del servidor
    try {
      console.log('🌐 Cargando perfil del servidor...')
      const profile = await userService.getProfile()
      console.log('✅ Perfil cargado del servidor:', profile)
      profileData.value = {
        name: profile.name || '',
        email: profile.email || '',
        role: profile.role || '',
        phone: profile.phone || '',
        department: profile.department || '',
        avatar: profile.avatar || null, // No forzar valor por defecto
        createdAt: profile.createdAt || '',
        updatedAt: profile.updatedAt || ''
      }
      
    } catch (serverError) {
      console.error('❌ Error al cargar perfil del servidor:', serverError)
      
      // Si falla la carga del servidor pero tenemos datos del store, los usamos
      if (!profileData.value.name && authStore.user) {
        console.log('🔄 Usando datos de respaldo del authStore...')
        profileData.value = {
          name: authStore.user.name || '',
          email: authStore.user.email || '',
          role: authStore.user.role || '',
          phone: (authStore.user as any).phone || '',
          department: authStore.user.department || '',
          avatar: (authStore.user as any).avatar || null, // No forzar valor por defecto
          createdAt: (authStore.user as any).createdAt || '',
          updatedAt: (authStore.user as any).updatedAt || ''
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general al cargar perfil:', error)
    toast.error('Error al cargar el perfil: ' + ((error as any)?.message || 'Error desconocido'))
  } finally {
    loading.value = false
    console.log('🏁 Carga de perfil completada')
    console.log('📋 ProfileData final:', profileData.value)
    
    // Debug específico para el avatar
    console.log('� DEBUGGING AVATAR:')
    console.log('- profileData.value?.avatar:', profileData.value?.avatar)
    console.log('- Avatar seleccionado:', selectedAvatarData.value)
  }
}

onMounted(() => {
  loadProfile()
})
</script>
