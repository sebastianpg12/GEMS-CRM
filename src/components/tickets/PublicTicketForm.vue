<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
    <div v-if="!submitted" class="p-4 md:p-6 space-y-4 animate-fade-in">

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tu Nombre Completo</label>
            <div class="relative group">
              <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors"></i>
              <input 
                v-model="formData.name"
                required 
                :readonly="!!authStore.user"
                type="text" 
                placeholder="Ej. Juan Pérez"
                class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm read-only:opacity-60 read-only:cursor-not-allowed"
              />
            </div>

          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
            <div class="relative group">
              <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors"></i>
              <input 
                v-model="formData.email"
                required 
                :readonly="!!authStore.user"
                type="email" 
                placeholder="tu@email.com"
                class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm read-only:opacity-60 read-only:cursor-not-allowed"
              />
            </div>

          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">¿Qué sucede?</label>
          <div class="relative group">
            <i class="fas fa-heading absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors"></i>
            <input 
              v-model="formData.subject"
              required 
              type="text" 
              placeholder="Asunto breve de tu incidencia"
              class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Categoría</label>
            <select 
              v-model="formData.category"
              class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat shadow-sm transition-all"
            >
              <option value="technical">Soporte Técnico</option>
              <option value="billing">Facturación / Pagos</option>
              <option value="sales">Consulta de Ventas</option>
              <option value="other">Otros Temas</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Prioridad</label>
            <div class="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
               <button 
                type="button"
                v-for="p in priorities" 
                :key="p.id"
                @click="formData.priority = p.id"
                class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all transition-duration-300"
                :class="formData.priority === p.id 
                  ? p.activeClass 
                  : 'text-slate-400 hover:text-slate-600'"
               >
                 {{ p.label }}
               </button>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción Detallada</label>
          <textarea 
            v-model="formData.description"
            required 
            rows="4" 
            placeholder="Por favor, describe el problema con el mayor detalle posible..."
            class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm resize-none"
          ></textarea>
        </div>

        <!-- Submit -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
        >
          <template v-if="loading">
            <i class="fas fa-spinner fa-spin"></i> Enviando...
          </template>
          <template v-else>
            <i class="fas fa-paper-plane text-xs"></i> Enviar Mi Solicitud
          </template>
        </button>

        <p class="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">
          Al enviar este ticket, aceptas nuestras políticas de soporte y privacidad.
        </p>
      </form>
    </div>

    <!-- Success State -->
    <div v-else class="p-12 md:p-16 text-center animate-fade-in">
       <div class="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-sm relative overflow-hidden">
         <div class="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
         <i class="fas fa-check text-emerald-500 text-4xl"></i>
       </div>
       
       <h2 class="text-3xl font-black text-slate-800 tracking-tight mb-3">¡Solicitud recibida!</h2>
       <p class="text-sm text-slate-500 font-bold mb-3 uppercase tracking-widest">
         Número de Ticket: <span class="bg-primary-50 text-primary-600 px-3 py-1 rounded-lg border border-primary-100 font-mono ml-2">#{{ ticketId }}</span>
       </p>
       <p class="text-base text-slate-600 font-medium max-w-sm mx-auto leading-relaxed mb-10">
         Hemos asignado a un miembro de nuestro equipo para atenderte. Recibirás una notificación por correo en breve.
       </p>

       <div class="flex flex-col md:flex-row gap-4 justify-center">
         <button 
          @click="resetForm" 
          class="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm"
         >
           Enviar otro ticket
         </button>
         <router-link 
          to="/" 
          class="px-8 py-3 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md"
         >
           Ir al Portal
         </router-link>
       </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ticketService } from '../../services/ticketService'
import { useNotifications } from '../../composables/useNotifications'
import { useAuthStore } from '../../stores/auth'

const { showError, showSuccess } = useNotifications()
const authStore = useAuthStore()

const loading = ref(false)
const submitted = ref(false)
const ticketId = ref('')

const formData = ref({
  name: '',
  email: '',
  subject: '',
  description: '',
  category: 'technical',
  priority: 'medium'
})

const priorities = [
  { id: 'low', label: 'Baja', activeClass: 'bg-emerald-500 text-white shadow-sm' },
  { id: 'medium', label: 'Media', activeClass: 'bg-amber-400 text-white shadow-sm' },
  { id: 'high', label: 'Alta', activeClass: 'bg-orange-500 text-white shadow-sm' },
  { id: 'urgent', label: 'Urgente', activeClass: 'bg-rose-500 text-white shadow-sm' }
]

onMounted(() => {
  // Auto-fill if user is logged in
  if (authStore.isAuthenticated && authStore.user) {
    formData.value.name = authStore.user.name
    formData.value.email = authStore.user.email
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // Include userId if authenticated
    const submissionData = {
      ...formData.value,
      userId: authStore.user?._id
    }
    
    const response = await ticketService.createPublic(submissionData)
    if (response.success && response.data) {
      ticketId.value = response.data.ticketNumber
      submitted.value = true
      showSuccess('Ticket enviado correctamente')
    } else {
      showError(response.error || 'Ocurrió un error al enviar el ticket')
    }
  } catch (err: any) {
    showError(err.message)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    subject: '',
    description: '',
    category: 'technical',
    priority: 'medium'
  }
  submitted.value = false
}
</script>


<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}
</style>
