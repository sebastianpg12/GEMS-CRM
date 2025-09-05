<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
      <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md">
      <div class="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/20 p-8">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <i class="fas fa-gem text-2xl text-white"></i>
            </div>
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            GEMS CRM
          </h1>
          <p class="text-gray-400">Inicia sesión en tu cuenta</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <div class="relative">
              <input
                id="email"
                v-model="credentials.email"
                type="email"
                required
                class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                :class="{ 'border-red-500 focus:ring-red-500': emailError }"
                placeholder="tu@email.com"
                @blur="validateEmail"
                @input="emailError = ''"
              />
              <i class="fas fa-envelope absolute right-3 top-3.5 text-gray-400"></i>
            </div>
            <p v-if="emailError" class="text-red-400 text-sm mt-1">{{ emailError }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-12"
                :class="{ 'border-red-500 focus:ring-red-500': passwordError }"
                placeholder="••••••••"
                @input="passwordError = ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p v-if="passwordError" class="text-red-400 text-sm mt-1">{{ passwordError }}</p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label for="remember" class="ml-2 text-sm text-gray-300">
                Recordarme
              </label>
            </div>
            <button
              type="button"
              @click="showForgotPassword = true"
              class="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
            <div class="flex items-center">
              <i class="fas fa-exclamation-triangle text-red-400 mr-2"></i>
              <p class="text-red-400 text-sm">{{ error }}</p>
            </div>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="!isLoading" class="flex items-center justify-center">
              <i class="fas fa-sign-in-alt mr-2"></i>
              Iniciar Sesión
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </span>
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 class="text-sm font-medium text-gray-300 mb-3">Credenciales de prueba:</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Admin:</span>
              <button
                @click="setDemoCredentials('admin')"
                class="text-purple-400 hover:text-purple-300 transition-colors"
              >
                admin@gems.com
              </button>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Manager:</span>
              <button
                @click="setDemoCredentials('manager')"
                class="text-purple-400 hover:text-purple-300 transition-colors"
              >
                maria@gems.com
              </button>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Employee:</span>
              <button
                @click="setDemoCredentials('employee')"
                class="text-purple-400 hover:text-purple-300 transition-colors"
              >
                carlos@gems.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPassword" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-md w-full mx-4 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Restablecer Contraseña</h3>
          <button @click="showForgotPassword = false" class="text-gray-400 hover:text-white transition-colors">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              v-model="forgotPasswordEmail"
              type="email"
              required
              class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="showForgotPassword = false"
              class="flex-1 py-2 px-4 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="forgotPasswordLoading"
              class="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
            >
              {{ forgotPasswordLoading ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const credentials = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)
const emailError = ref('')
const passwordError = ref('')
const showForgotPassword = ref(false)
const forgotPasswordEmail = ref('')
const forgotPasswordLoading = ref(false)

// Computed
const isFormValid = computed(() => {
  return credentials.value.email && 
         credentials.value.password && 
         !emailError.value && 
         !passwordError.value
})

const { isLoading, error } = authStore

// Methods
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(credentials.value.email)) {
    emailError.value = 'Por favor ingresa un correo válido'
  } else {
    emailError.value = ''
  }
}

const handleLogin = async () => {
  if (!isFormValid.value) return

  const result = await authStore.login(credentials.value)
  
  if (result.success) {
    // Redirect to dashboard after successful login
    await router.push('/')
  }
}

const setDemoCredentials = (type: 'admin' | 'manager' | 'employee') => {
  const demoCredentials = {
    admin: { email: 'admin@gems.com', password: 'admin123' },
    manager: { email: 'maria@gems.com', password: 'maria123' },
    employee: { email: 'carlos@gems.com', password: 'carlos123' }
  }
  
  credentials.value = demoCredentials[type]
  emailError.value = ''
  passwordError.value = ''
}

const handleForgotPassword = async () => {
  forgotPasswordLoading.value = true
  // TODO: Implement forgot password functionality
  setTimeout(() => {
    forgotPasswordLoading.value = false
    showForgotPassword.value = false
    alert('Se ha enviado un correo con las instrucciones para restablecer tu contraseña.')
  }, 2000)
}

// Check if user is already authenticated
onMounted(async () => {
  const isAuthenticated = await authStore.checkAuth()
  if (isAuthenticated) {
    await router.push('/')
  }
})
</script>
