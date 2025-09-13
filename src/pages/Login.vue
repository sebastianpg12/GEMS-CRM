<template>
  <div class="min-h-screen relative flex flex-col px-4 py-6 sm:py-8 text-slate-100 font-[Inter,Sora,ui-sans-serif]">
    <!-- Fondo prisma y grid sutil -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-purple-700 to-[#06B6D4]"></div>
    <div class="absolute inset-0 opacity-[0.06] pointer-events-none bg-[length:36px_36px]" style="background-image:linear-gradient(to right,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(to bottom,rgba(255,255,255,.12)_1px,transparent_1px);"></div>

  <div class="relative z-10 w-full max-w-7xl flex-1 pb-24 md:pb-0 mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-1.5 sm:px-0">
        <!-- Columna izquierda: Hero (desktop) -->
        <section class="hidden md:flex flex-col gap-6 pr-4">
          <div class="flex items-start gap-4">
            <img src="@/assets/logo.webp" alt="GEMS CRM" class="w-12 h-12 rounded-lg shadow-md shadow-cyan-300/20" />
            <div>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                GEMS CRM
              </h1>
              <p class="mt-3 text-lg md:text-xl font-normal text-slate-100/90">
                Enfócate en lo importante y avanza paso a paso con claridad.
              </p>
            </div>
          </div>
          <blockquote class="text-[13px] md:text-sm font-medium text-slate-300/80">
            “Escribe la visión, y declárala con claridad, para que corra el que la leyere.” — Habacuc 2:2
          </blockquote>
          <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 text-slate-100/95">
            <p class="text-[15px] md:text-base font-medium">
              Somos GEMS, una comunidad con propósito. Creemos en el crecimiento compartido: cada línea de código y cada píxel puede elevar a alguien más. Ayudamos a las personas creando experiencias que suman valor real.
            </p>
            <p class="mt-3 text-[15px] md:text-base font-medium">
              GEMS no es solo una empresa; es un estilo de vida. Y tú, que lees esto, aportarás tu granito de arena: con tu talento
            </p>
          </div>
        </section>

        <!-- Encabezado móvil (solo mobile) -->
        <section class="md:hidden order-1">
          <div class="flex items-start gap-3 mb-3">
            <img src="@/assets/logo.webp" alt="GEMS CRM" class="w-10 h-10 rounded-md shadow-md shadow-cyan-300/20" />
            <div>
              <h1 class="text-[30px] leading-snug font-bold text-white">
                GEMS CRM
              </h1>
              <p class="mt-1.5 text-[15px] font-normal text-slate-100/90">
                Enfócate en lo importante y avanza paso a paso con claridad.
              </p>
            </div>
          </div>
        </section>

        <!-- Formulario -->
        <section class="order-2">
          <div class="max-w-md mx-auto group rounded-2xl p-[1px] bg-gradient-to-r from-cyan-300/30 to-fuchsia-400/30 hover:from-cyan-300/60 hover:to-fuchsia-400/60 transition-colors">
            <div class="rounded-2xl bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-8 shadow-xl">
              <p class="sr-only">Inicia sesión en tu cuenta</p>
              <!-- Login Form -->
              <form @submit.prevent="handleLogin" class="space-y-6" aria-live="polite">
                <!-- Email Field -->
                <div>
                  <label for="email" class="block text-sm font-medium text-slate-200 mb-2">
                    Correo Electrónico
                  </label>
                  <div class="relative">
                    <input
                      id="email"
                      v-model="credentials.email"
                      type="email"
                      required
                      class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-300/70 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none transition-all duration-200"
                      :class="{ 'border-[#F43F5E] focus:ring-[#F43F5E]': emailError }"
                      placeholder="tu@email.com"
                      @blur="validateEmail"
                      @input="emailError = ''"
                      :aria-invalid="!!emailError"
                      aria-describedby="emailHelp"
                    />
                    <i class="fas fa-envelope absolute right-3 top-3.5 text-slate-300/70" aria-hidden="true"></i>
                  </div>
                  <p :id="'emailHelp'" v-if="emailError" class="text-[#F43F5E] text-sm mt-1">{{ emailError }}</p>
                </div>

                <!-- Password Field -->
                <div>
                  <label for="password" class="block text-sm font-medium text-slate-200 mb-2">
                    Contraseña
                  </label>
                  <div class="relative">
                    <input
                      id="password"
                      v-model="credentials.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-300/70 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none transition-all duration-200 pr-12"
                      :class="{ 'border-[#F43F5E] focus:ring-[#F43F5E]': passwordError }"
                      placeholder="••••••••"
                      @input="passwordError = ''"
                      :aria-invalid="!!passwordError"
                      aria-describedby="passwordHelp"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute right-3 top-3.5 text-slate-300/70 hover:text-white transition-colors"
                      aria-label="Mostrar u ocultar contraseña"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <p :id="'passwordHelp'" v-if="passwordError" class="text-[#F43F5E] text-sm mt-1">{{ passwordError }}</p>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div class="flex items-center">
                    <input
                      id="remember"
                      v-model="rememberMe"
                      type="checkbox"
                      class="w-4 h-4 text-sky-500 bg-white/5 border-white/10 rounded focus:ring-sky-400 focus:ring-2"
                    />
                    <label for="remember" class="ml-2 text-sm text-slate-200">
                      Recordarme
                    </label>
                  </div>
                  <button
                    type="button"
                    @click="showForgotPassword = true"
                    class="relative text-sm text-sky-300 hover:text-sky-200 transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-gradient-to-r from-cyan-300 to-fuchsia-400 hover:after:w-full after:transition-all self-end sm:self-auto"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="p-3 bg-red-900/40 border border-red-500/50 rounded-lg" aria-live="polite">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-300 mr-2" aria-hidden="true"></i>
                    <p class="text-red-300 text-sm">{{ error }}</p>
                  </div>
                </div>

                <!-- Login Button -->
                <button
                  type="submit"
                  :disabled="isLoading || !isFormValid"
                  class="w-full py-3 px-4 rounded-xl font-medium text-white bg-[#0EA5E9] hover:bg-[#22D3EE] focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  <span v-if="!isLoading" class="flex items-center justify-center">
                    <i class="fas fa-sign-in-alt mr-2" aria-hidden="true"></i>
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
            </div>
          </div>
        </section>

        <!-- Versículo móvil (después del form) -->
        <section class="md:hidden order-3">
          <blockquote class="mt-6 text-sm font-medium text-slate-300/90 max-w-md mx-auto">
            “Escribe la visión, y declárala con claridad, para que corra el que la leyere.” — Habacuc 2:2
          </blockquote>
        </section>

        <!-- Mensaje motivacional móvil (al final) -->
        <section class="md:hidden order-4 mt-3">
          <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 text-slate-100/95">
            <p class="text-[14px] font-medium">
              Somos GEMS, una comunidad con propósito. Creemos en el crecimiento compartido: cada línea de código y cada píxel puede elevar a alguien más. Ayudamos a las personas creando experiencias que suman valor real.
            </p>
            <p class="mt-2 text-[14px] font-medium">
              GEMS no es solo una empresa; es un estilo de vida. Y tú, que lees esto, aportarás tu granito de arena: con tu talento
            </p>
          </div>
        </section>
      </div>
    </div>

    <!-- Footer con derechos y redes -->
    <footer class="w-full z-10 mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-slate-200/80 text-xs sm:text-sm" style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px)">
        <div>
          © {{ currentYear }} GEMS Innovations. Todos los derechos reservados.
        </div>
        <nav class="flex items-center gap-4 mt-2 sm:mt-0" aria-label="Enlaces de GEMS Innovations">
          <a
            href="https://www.instagram.com/gemsinnovations/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sky-200 hover:text-sky-100 transition-colors underline decoration-transparent hover:decoration-sky-200 underline-offset-4"
            aria-label="Instagram de GEMS Innovations"
          >
            Instagram
          </a>
          <a
            href="https://gemsinnovations.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sky-200 hover:text-sky-100 transition-colors underline decoration-transparent hover:decoration-sky-200 underline-offset-4"
            aria-label="Sitio web de GEMS Innovations"
          >
            gemsinnovations.com
          </a>
        </nav>
      </div>
    </footer>

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

// Footer year
const currentYear = new Date().getFullYear()
</script>
