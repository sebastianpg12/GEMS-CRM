<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Solo para vista de gestión (Admin/Manager) -->
    <div v-if="isManagementView" class="flex flex-col h-full p-6 gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black text-slate-800 tracking-tight">Configuración de Portal Externo</h1>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Gestión del formulario público para clientes</p>
        </div>
        <div class="flex items-center gap-2">
          <router-link
            to="/support"
            target="_blank"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2"
          >
            <i class="fas fa-external-link-alt text-xs"></i> Abrir Portal Público
          </router-link>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
         <!-- Form Preview Column -->
         <div class="col-span-2 space-y-4">
            <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-indigo-200 shadow-sm">
                <i class="fas fa-globe text-indigo-600"></i>
              </div>
              <div class="flex-1">
                <p class="text-xs font-black text-indigo-800 uppercase tracking-widest">Enlace del Portal</p>
                <p class="text-sm text-indigo-600 font-bold truncate">{{ publicUrl }}</p>
              </div>
              <button @click="copyUrl" class="p-2 hover:bg-white rounded-lg transition-colors text-indigo-400">
                <i class="fas fa-copy"></i>
              </button>
            </div>

            <!-- The Actual Form Frame -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
               <div class="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
                  <div class="flex gap-1.5">
                    <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <span class="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Vista Previa en Vivo</span>
               </div>
               <div class="p-8 bg-slate-50/50">
                  <PublicTicketForm />
               </div>
            </div>
         </div>

         <!-- Config Column -->
         <div class="space-y-4">
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Campos Activos</h3>
              <div class="space-y-3">
                <div v-for="field in formFields" :key="field.id" class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <i :class="field.icon" class="text-slate-400 text-xs w-4"></i>
                    <span class="text-xs font-bold text-slate-600">{{ field.label }}</span>
                  </div>
                  <div 
                    @click="field.active = !field.active"
                    :class="field.active ? 'bg-primary-500' : 'bg-slate-200'"
                    class="w-8 h-4.5 rounded-full relative cursor-pointer transition-colors"
                  >
                    <div :class="field.active ? 'translate-x-3.5' : 'translate-x-0.5'" class="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Estadísticas Rápidas</h3>
              <div class="grid grid-cols-2 gap-3">
                 <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Total Hoy</p>
                    <p class="text-lg font-black text-slate-800">12</p>
                 </div>
                 <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Tasa Conversión</p>
                    <p class="text-lg font-black text-emerald-600">88%</p>
                 </div>
              </div>
            </div>
         </div>
      </div>
    </div>

    <!-- VISTA PÚBLICA (Para ruta /support o Clientes) -->
    <div v-else class="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div class="w-full max-w-xl">
           <PublicTicketForm />
           
           <div class="mt-8 text-center" v-if="!authStore.isAuthenticated">
             <p class="text-xs text-slate-400 font-medium">¿Ya tienes una cuenta? <router-link to="/login" class="text-primary-600 font-black hover:underline">Inicia sesión aquí</router-link></p>
           </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import PublicTicketForm from '../../components/tickets/PublicTicketForm.vue'

const route = useRoute()
const authStore = useAuthStore()

// Determinamos si es la vista de gestión o la vista pública/cliente
const isManagementView = computed(() => {
  // Es gestión si estamos en la ruta de configuración y somos admin/manager
  return route.path.includes('external-tickets') && (authStore.isAdmin || authStore.isManager)
})

const publicUrl = ref(window.location.origin + '/support')

const copyUrl = () => {
  navigator.clipboard.writeText(publicUrl.value)
  alert('URL copiada al portapapeles')
}

const formFields = ref([
  { id: 'name', label: 'Nombre Completo', icon: 'fas fa-user', active: true },
  { id: 'email', label: 'Correo Electrónico', icon: 'fas fa-envelope', active: true },
  { id: 'category', label: 'Categoría', icon: 'fas fa-tag', active: true },
  { id: 'priority', label: 'Prioridad', icon: 'fas fa-flag', active: true },
  { id: 'attachments', label: 'Adjuntos', icon: 'fas fa-paperclip', active: false },
])
</script>

<style scoped>
.dashed-border {
  border-style: dashed;
}
</style>
