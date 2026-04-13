<template>
  <div class="min-h-screen bg-[#F4F5F7] flex font-['Inter',sans-serif]">
    
    <!-- JIRA-STYLE SIDEBAR (Solo para clientes o vista pública logueada) -->
    <aside v-if="!isManagementView && authStore.isAuthenticated" class="w-64 bg-white border-r border-[#DFE1E6] flex flex-col pt-6 shrink-0">
      <div class="px-6 mb-8 flex items-center gap-3">
        <div class="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-black text-xs">S</div>
        <span class="font-bold text-slate-800 tracking-tight text-sm uppercase">Soporte GEMS</span>
      </div>

      <nav class="flex-1 px-3 space-y-1">
        <button 
          @click="activeTab = 'create'"
          :class="activeTab === 'create' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all text-left"
        >
          <i class="fas fa-plus text-xs"></i> Nueva Solicitud
        </button>
        
        <div class="pt-4 pb-2 px-3">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mis Incidencias</span>
        </div>

        <button 
          @click="activeTab = 'history'"
          :class="activeTab === 'history' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all text-left"
        >
          <i class="fas fa-list text-xs"></i> Todas las Solicitudes
        </button>

        <button 
          @click="activeTab = 'active'"
          :class="activeTab === 'active' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all text-left"
        >
          <i class="fas fa-clock text-xs"></i> Solicitudes Activas
        </button>
      </nav>

      <div class="p-4 border-t border-[#DFE1E6]">
        <div class="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
             <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" />
             <div v-else class="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
               {{ authStore.user?.name.charAt(0) }}
             </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-black text-slate-800 truncate">{{ authStore.user?.name }}</p>
            <p class="text-[9px] text-slate-500 font-bold truncate">Cliente</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 flex flex-col min-w-0">
      
      <!-- Unified Header -->
      <div class="px-8 py-5 bg-white border-b border-[#DFE1E6] flex items-center justify-between">
         <div v-if="activeTab === 'create' || !authStore.isAuthenticated">
           <h1 class="text-lg font-black text-slate-800 tracking-tight">Levantar Nueva Solicitud</h1>
           <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Soporte GEMS</p>
         </div>
         <div v-else>
           <h1 class="text-lg font-black text-slate-800 tracking-tight">Panel de Solicitudes</h1>
           <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{{ authStore.isAuthenticated ? 'Tus Incidencias' : 'Portal de Soporte' }}</p>
         </div>

         <!-- Right actions if Admin -->
         <div v-if="isManagementView" class="flex items-center gap-2">
           <router-link to="/support" target="_blank" class="px-3 py-1.5 bg-slate-800 text-white rounded font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
             <i class="fas fa-external-link-alt"></i> Portal En Vivo
           </router-link>
         </div>
      </div>

      <!-- PORTAL CONTENT -->
      <div class="flex-1 overflow-auto bg-[#F4F5F7]">
        
        <!-- Vista de Creación (Formulario) -->
        <div v-if="activeTab === 'create' || !authStore.isAuthenticated" class="max-w-4xl mx-auto p-4 md:p-6">
            <PublicTicketForm />
        </div>



        <!-- Vista de Historial (Issue Navigator) -->
        <div v-else class="p-6">
            <div class="bg-white rounded-lg border border-[#DFE1E6] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
              
              <!-- Toolbar -->
              <div class="p-4 border-b border-[#DFE1E6] flex items-center justify-between bg-slate-50/50">
                 <div class="flex items-center gap-4">
                    <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest">Cola de Solicitudes</h2>
                    <div class="h-6 w-px bg-slate-200"></div>
                    <span class="text-xs text-slate-500 font-bold">{{ filteredTickets.length }} incidencias</span>
                 </div>
                 <div class="flex items-center gap-2">
                    <div class="relative">
                      <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                      <input 
                        v-model="searchQuery"
                        placeholder="Buscar solicitud..." 
                        class="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 w-64" 
                      />
                    </div>
                 </div>
              </div>

              <!-- Content Area: Table + Detail Panel -->
              <div class="flex-1 flex overflow-hidden">
                
                <!-- Table -->
                <div class="flex-1 overflow-auto scrollbar-thin">
                  <table class="w-full text-left border-collapse">
                    <thead class="sticky top-0 bg-white z-10 shadow-sm border-b border-[#DFE1E6]">
                      <tr>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clave</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asunto</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridad</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asignado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="ticket in filteredTickets" 
                        :key="ticket._id"
                        @click="selectedTicket = ticket"
                        :class="selectedTicket?._id === ticket._id ? 'bg-primary-50/50' : 'hover:bg-slate-50'"
                        class="cursor-pointer border-b border-[#EDF0F2] transition-colors"
                      >
                        <td class="px-4 py-4">
                          <div class="w-5 h-5 bg-indigo-500 rounded flex items-center justify-center text-[8px] text-white">
                            <i class="fas fa-bookmark"></i>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-xs font-black text-primary-600 font-mono">{{ ticket.ticketNumber }}</td>
                        <td class="px-4 py-4">
                          <p class="text-xs font-bold text-slate-800 line-clamp-1 truncate max-w-xs">{{ ticket.subject }}</p>
                        </td>
                        <td class="px-4 py-4">
                          <span 
                            :class="getStatusClass(ticket.status)"
                            class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border"
                          >
                            {{ getStatusLabel(ticket.status) }}
                          </span>
                        </td>
                        <td class="px-4 py-4">
                           <div class="flex items-center gap-2">
                             <i :class="getPriorityIcon(ticket.priority)" class="text-[10px]"></i>
                             <span class="text-[10px] font-bold text-slate-500 uppercase">{{ ticket.priority }}</span>
                           </div>
                        </td>
                        <td class="px-4 py-4">
                           <div class="flex items-center gap-2">
                             <div class="w-5 h-5 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                <img v-if="ticket.assignedTo?.avatar" :src="ticket.assignedTo.avatar" class="w-full h-full object-cover" />
                                <i v-else class="fas fa-user text-[8px] text-slate-400"></i>
                             </div>
                             <span class="text-[10px] font-medium text-slate-600">{{ ticket.assignedTo?.name || 'Por asignar' }}</span>
                           </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <!-- Empty State -->
                  <div v-if="filteredTickets.length === 0" class="flex flex-col items-center justify-center py-20 opacity-40">
                    <i class="fas fa-search text-4xl mb-4"></i>
                    <p class="font-bold text-sm">No se encontraron solicitudes</p>
                  </div>
                </div>

                <!-- JIRA-STYLE DETAIL PANEL (Slide-over) -->
                <div 
                  v-if="selectedTicket" 
                  class="w-[450px] border-l border-[#DFE1E6] bg-white flex flex-col animate-slide-left z-20"
                >
                  <!-- Panel Header -->
                  <div class="p-4 border-b border-[#DFE1E6] flex items-center justify-between">
                    <span class="text-[10px] font-black text-primary-600 font-mono">{{ selectedTicket.ticketNumber }}</span>
                    <button @click="selectedTicket = null" class="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors">
                      <i class="fas fa-times text-slate-400"></i>
                    </button>
                  </div>

                  <!-- Panel Content -->
                  <div class="flex-1 overflow-auto p-6 space-y-8 scrollbar-thin">
                    <div class="space-y-2">
                      <h3 class="text-xl font-black text-slate-800 tracking-tight leading-tight">{{ selectedTicket.subject }}</h3>
                      <p class="text-xs text-slate-500 font-medium leading-relaxed">{{ selectedTicket.description }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                       <div class="space-y-1">
                          <p class="text-[9px] font-black text-slate-400 uppercase">Estado</p>
                          <span :class="getStatusClass(selectedTicket.status)" class="px-3 py-1 rounded text-[10px] font-black uppercase inline-block">{{ getStatusLabel(selectedTicket.status) }}</span>
                       </div>
                       <div class="space-y-1">
                          <p class="text-[9px] font-black text-slate-400 uppercase">Prioridad</p>
                          <div class="flex items-center gap-2">
                             <i :class="getPriorityIcon(selectedTicket.priority)" class="text-xs"></i>
                             <span class="text-[10px] font-black uppercase text-slate-700">{{ selectedTicket.priority }}</span>
                          </div>
                       </div>
                       <div class="space-y-1">
                          <p class="text-[9px] font-black text-slate-400 uppercase">Categoría</p>
                          <span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{{ selectedTicket.category }}</span>
                       </div>
                       <div class="space-y-1">
                          <p class="text-[9px] font-black text-slate-400 uppercase">Creado</p>
                          <span class="text-[10px] font-bold text-slate-600">{{ new Date(selectedTicket.createdAt).toLocaleDateString() }}</span>
                       </div>
                    </div>

                    <!-- Chat/Conversation -->
                    <div class="space-y-4 pt-4 border-t border-slate-100">
                      <h4 class="text-[10px] font-black text-slate-800 uppercase tracking-widest">Actividad de la Incidencia</h4>
                      
                      <div class="space-y-4">
                         <div v-for="comment in selectedTicket.comments" :key="comment._id" class="flex gap-3">
                            <div class="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                               <i class="fas fa-user-circle text-slate-400"></i>
                            </div>
                            <div class="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                               <div class="flex items-center justify-between mb-1">
                                  <span class="text-[9px] font-black text-slate-800 uppercase">{{ comment.author?.name || 'Sistema' }}</span>
                                  <span class="text-[8px] text-slate-400">{{ formatDate(comment.createdAt) }}</span>
                               </div>
                               <p class="text-xs text-slate-600 leading-snug">{{ comment.text }}</p>
                            </div>
                         </div>
                      </div>

                      <!-- New Comment Input (Client can comment too) -->
                      <div class="pt-2">
                         <div class="relative">
                            <textarea 
                              v-model="newComment"
                              placeholder="Escribe una respuesta..." 
                              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none"
                              rows="3"
                            ></textarea>
                            <button 
                              @click="handleAddComment"
                              :disabled="!newComment.trim()"
                              class="absolute right-2 bottom-2 px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all shadow-sm"
                            >
                              Responder
                            </button>
                         </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

            </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ticketService } from '../../services/ticketService'
import PublicTicketForm from '../../components/tickets/PublicTicketForm.vue'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const route = useRoute()
const authStore = useAuthStore()

const activeTab = ref('history')
const tickets = ref<any[]>([])
const selectedTicket = ref<any>(null)
const searchQuery = ref('')
const newComment = ref('')

const isManagementView = computed(() => {
  return route.path.includes('external-tickets') && (authStore.isAdmin || authStore.isManager)
})

const filteredTickets = computed(() => {
  let result = [...tickets.value]
  
  if (activeTab.value === 'active') {
    result = result.filter(t => ['new', 'open', 'waiting'].includes(t.status))
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t => 
      t.subject.toLowerCase().includes(q) || 
      t.ticketNumber.toLowerCase().includes(q)
    )
  }

  return result
})

const fetchHistory = async () => {
  if (authStore.isAuthenticated) {
    try {
      tickets.value = await ticketService.getClientHistory()
    } catch (err) {
      console.error('Error fetching history:', err)
    }
  }
}

const handleAddComment = async () => {
  if (!selectedTicket.value || !newComment.value.trim()) return
  
  try {
    const comment = await ticketService.addComment(selectedTicket.value._id, newComment.value, false)
    selectedTicket.value.comments.push(comment)
    newComment.value = ''
  } catch (err) {
    console.error('Error adding comment:', err)
  }
}

onMounted(() => {
  fetchHistory()
  if (!authStore.isAuthenticated) {
    activeTab.value = 'create'
  }
})

// UI Helpers
const getStatusLabel = (status: string) => {
  const labels: any = {
    new: 'Pendiente',
    open: 'En Curso',
    waiting: 'Esperando',
    resolved: 'Solucionado',
    closed: 'Cerrado'
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: any = {
    new: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    open: 'bg-primary-50 text-primary-700 border-primary-100',
    waiting: 'bg-amber-50 text-amber-700 border-amber-100',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    closed: 'bg-slate-50 text-slate-700 border-slate-100'
  }
  return classes[status] || ''
}

const getPriorityIcon = (priority: string) => {
  const icons: any = {
    low: 'fas fa-arrow-down text-emerald-500',
    medium: 'fas fa-equals text-amber-500',
    high: 'fas fa-chevron-up text-orange-500',
    urgent: 'fas fa-bolt text-rose-500'
  }
  return icons[priority] || 'fas fa-minus text-slate-400'
}

const formatDate = (date: string) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  } catch {
    return date
  }
}

watch(activeTab, () => {
  selectedTicket.value = null
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #DFE1E6;
  border-radius: 10px;
}

@keyframes slide-left {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-slide-left {
  animation: slide-left 0.2s ease-out forwards;
}
</style>
