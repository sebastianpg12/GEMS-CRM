<template>
  <!-- Main Container: Improved contrast and scrolling -->
  <div class="min-h-full bg-[#F1F5F9] flex flex-col font-['Inter',sans-serif]">

    
    <!-- Unified Header: Only visible for Public/Guest view (Authenticated view uses Layout.vue header) -->
    <header v-if="!authStore.isAuthenticated" class="bg-white border-b border-slate-100 flex-shrink-0">
      <div class="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
         <div class="flex items-center gap-3">
           <div class="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
             <i class="fas fa-headset text-sm"></i>
           </div>
           <div>
             <h1 class="text-lg font-black text-slate-800 tracking-tight">Customer CRM</h1>
             <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Centro de Soporte</p>
           </div>
         </div>
         
         <router-link to="/login" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all">
           Iniciar Sesión
         </router-link>
      </div>
    </header>

    <!-- Sub-navigation Tabs (Only for Logged-In Clients) -->
    <div v-if="authStore.isAuthenticated" class="bg-white border-b border-slate-100 flex-shrink-0 px-8 py-3 flex items-center justify-center">
       <nav class="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
         <button 
           @click="activeTab = 'create'"
           :class="activeTab === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
           class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
         >
           Nueva Solicitud
         </button>
         <button 
           @click="activeTab = 'history'"
           :class="activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
           class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
         >
           Mi Historial
         </button>
       </nav>
    </div>

    <!-- Scrollable Content Area -->
    <main class="flex-1 p-6 md:p-8 lg:p-12">

      <div class="max-w-5xl mx-auto">
        
        <!-- Create view -->
        <div v-if="activeTab === 'create' || !authStore.isAuthenticated" class="animate-content-in">
          <PublicTicketForm />
        </div>

        <!-- History/List view (Issue Navigator) -->
        <div v-else class="animate-content-in h-full">
          <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <!-- Table Header / Toolbar -->
            <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h2 class="text-xs font-black text-slate-800 uppercase tracking-widest">Cola de Incidencias</h2>
              <div class="flex items-center gap-4">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ tickets.length }} Solicitudes</span>
                <button @click="loadData" class="text-slate-400 hover:text-primary-500 transition-colors">
                  <i class="fas fa-sync-alt text-xs" :class="{ 'fa-spin': loading }"></i>
                </button>
              </div>
            </div>

            <!-- Modern Ticket Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-slate-50/50">
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo / ID</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen del Problema</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridad</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Actividad</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="ticket in tickets" :key="ticket._id" 
                    @click="openTicket(ticket)"
                    class="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td class="px-6 py-5">
                      <div class="flex flex-col">
                        <span class="text-[10px] font-black text-primary-600 uppercase tracking-tighter">{{ ticket.ticketNumber }}</span>
                        <span class="text-[9px] text-slate-400 font-bold uppercase">{{ ticket.category }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{{ ticket.subject }}</p>
                      <p class="text-[10px] text-slate-400 truncate max-w-xs">{{ ticket.description }}</p>
                    </td>
                    <td class="px-6 py-5">
                      <span :class="getPriorityClass(ticket.priority)" class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border">
                        {{ ticket.priority }}
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full" :class="getStatusColor(ticket.status)"></div>
                        <span class="text-[10px] font-black text-slate-700 uppercase tracking-widest">{{ ticket.status }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <span class="text-[10px] font-bold text-slate-400">{{ formatDate(ticket.updatedAt) }}</span>
                    </td>
                  </tr>
                  <tr v-if="tickets.length === 0 && !loading">
                    <td colspan="5" class="px-6 py-20 text-center">
                      <div class="flex flex-col items-center gap-3 opacity-30">
                        <i class="fas fa-inbox text-4xl"></i>
                        <p class="text-xs font-black uppercase tracking-widest text-slate-400">No se encontraron incidencias</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Slide-over Detail Panel (Premium) -->
    <div v-if="selectedTicket" class="fixed inset-0 z-[60] flex justify-end animate-fade-in">
       <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="selectedTicket = null"></div>
       <div class="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-slide-left flex flex-col">
         <!-- Detail Header -->
         <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
           <div class="flex items-center gap-4">
             <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <i class="fas fa-ticket-alt"></i>
             </div>
             <div>
               <h3 class="text-lg font-black text-slate-800 tracking-tight">{{ selectedTicket.ticketNumber }}</h3>
               <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Detalle de Solicitud</p>
             </div>
           </div>
           <button @click="selectedTicket = null" class="w-10 h-10 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center text-slate-400">
              <i class="fas fa-times"></i>
           </button>
         </div>

         <!-- Detail Content -->
         <div class="flex-1 overflow-y-auto p-8 space-y-8">
            <section class="space-y-4">
              <span :class="getPriorityClass(selectedTicket.priority)" class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border">
                {{ selectedTicket.priority }}
              </span>
              <h1 class="text-2xl font-black text-slate-800 tracking-tight">{{ selectedTicket.subject }}</h1>
              <p class="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">
                "{{ selectedTicket.description }}"
              </p>
            </section>

            <!-- Metadata Info -->
            <div class="grid grid-cols-2 gap-8 py-6 border-t border-slate-100">
               <div>
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asignado a</p>
                 <div v-if="selectedTicket.assignedTo" class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                       <img v-if="selectedTicket.assignedTo.avatar" src="" class="w-full h-full object-cover">
                       <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black">
                         {{ selectedTicket.assignedTo.name.charAt(0) }}
                       </div>
                    </div>
                    <span class="text-sm font-bold text-slate-700">{{ selectedTicket.assignedTo.name }}</span>
                 </div>
                 <span v-else class="text-xs text-slate-400 italic font-medium">Buscando el mejor experto...</span>
               </div>
               <div>
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</p>
                 <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" :class="getStatusColor(selectedTicket.status)"></div>
                    <span class="text-sm font-black text-slate-800 uppercase tracking-widest">{{ selectedTicket.status }}</span>
                 </div>
               </div>
            </div>

            <!-- Attachments Section -->
            <div v-if="selectedTicket.attachments?.length > 0" class="space-y-4">
               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencias Adjuntas</p>
               <div class="grid grid-cols-3 gap-3">
                  <div v-for="(att, i) in selectedTicket.attachments" :key="i" 
                    @click="viewAttachment(att)"
                    class="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden cursor-pointer border border-slate-200"
                  >
                    <img v-if="isImgUrl(att)" :src="resolveImageUrl(att)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2">
                       <i class="fas fa-file-alt text-slate-400 text-xl"></i>
                       <span class="text-[8px] font-black text-slate-400 uppercase">Ver DocumentO</span>
                    </div>
                    <div class="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <i class="fas fa-eye text-white"></i>
                    </div>
                  </div>
               </div>
            </div>

            <!-- Timeline / Comments placeholder -->
            <div class="pt-8 border-t border-slate-100">
               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Actividad y Comentarios</p>
               <div class="space-y-6">
                 <!-- Aquí irían los comentarios con un diseño limpio -->
                 <div class="text-center py-10 opacity-40">
                    <p class="text-xs font-bold text-slate-400">Aún no hay mensajes. Te notificaremos cuando haya novedades.</p>
                 </div>
               </div>
            </div>
         </div>

         <!-- Response Input -->
         <div class="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
            <div class="relative">
               <input 
                placeholder="Añadir una respuesta rápida..." 
                class="w-full pl-5 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all shadow-sm"
               />
               <button class="absolute right-4 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700">
                  <i class="fas fa-paper-plane text-sm"></i>
               </button>
            </div>
         </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

import { useAuthStore } from '../../stores/auth'
import { ticketService } from '../../services/ticketService'
import PublicTicketForm from '../../components/tickets/PublicTicketForm.vue'
import { API_CONFIG } from '@/config/api'

const authStore = useAuthStore()
const tickets = ref<any[]>([])
const loading = ref(false)
const selectedTicket = ref<any>(null)
const activeTab = ref<'create' | 'history'>('create')

const loadData = async () => {
    if (!authStore.isAuthenticated) return
    loading.value = true
    try {
        const data = await ticketService.getClientHistory()
        tickets.value = data
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (authStore.isAuthenticated) {
        loadData()
        activeTab.value = 'history'
    } else {
        activeTab.value = 'create'
    }
})

const getPriorityClass = (priority: string) => {
    const base = 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border'
    const colors = {
        'low': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'medium': 'bg-amber-50 text-amber-600 border-amber-100',
        'high': 'bg-orange-50 text-orange-600 border-orange-100',
        'urgent': 'bg-rose-50 text-rose-600 border-rose-100'
    }
    return `${base} ${colors[priority as keyof typeof colors] || colors.medium}`
}

const getStatusColor = (status: string) => {
    const colors = {
        'new': 'bg-primary-500',
        'open': 'bg-emerald-500',
        'waiting': 'bg-amber-500',
        'resolved': 'bg-slate-300',
        'closed': 'bg-slate-900'
    }
    return colors[status as keyof typeof colors] || 'bg-slate-300'
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    })
}

const openTicket = (ticket: any) => {
    selectedTicket.value = ticket
}

const isImgUrl = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url.toLowerCase())

const resolveImageUrl = (url: string) => {
  if (url.startsWith('http')) return url
  const origin = String(API_CONFIG.BASE_URL).replace(/\/?api\/?$/i, '')
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

const viewAttachment = (url: string) => {
  window.open(resolveImageUrl(url), '_blank')
}
</script>

<style scoped>
@keyframes slide-left {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes content-in {
  from { opacity: 0; filter: blur(5px); transform: scale(0.98); }
  to { opacity: 1; filter: blur(0); transform: scale(1); }
}

.animate-slide-left { animation: slide-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-content-in { animation: content-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { animation: fade-in 0.4s ease-out forwards; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
