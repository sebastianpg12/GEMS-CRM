<template>
  <div ref="bellRoot" class="fixed bottom-6 right-6 z-50">
    <!-- Botón campana flotante (circular, igual estilo que el ChatWidget) -->
    <button
      type="button"
      @click.stop="toggleDropdown"
      class="relative bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white p-4 rounded-full shadow-lg shadow-primary-300/30 transition-all duration-300 hover:scale-105 active:scale-95"
      title="Notificaciones"
    >
      <i class="fas fa-bell text-xl" :class="unreadCount > 0 ? 'animate-wiggle' : ''"></i>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow"
      >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- Dropdown abre hacia arriba -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 bottom-full mb-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden origin-bottom-right"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/40">
          <h3 class="text-sm font-black text-slate-700 tracking-tight">Notificaciones</h3>
          <button
            v-if="hasUnread"
            type="button"
            @click="markAllAsRead"
            class="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-wider transition-colors"
          >Marcar todas leídas</button>
        </div>

        <!-- Filtros tabs -->
        <div class="flex border-b border-slate-100 px-2">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            @click="activeTab = t.id"
            class="flex-1 py-2 px-2 text-[10px] font-black uppercase tracking-wider transition-colors relative"
            :class="activeTab === t.id ? 'text-primary-500' : 'text-slate-400 hover:text-slate-600'"
          >
            {{ t.label }}
            <span
              v-if="activeTab === t.id"
              class="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-500 rounded-full"
            ></span>
          </button>
        </div>

        <!-- Lista -->
        <div class="max-h-96 overflow-y-auto custom-scrollbar">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>

          <div v-else-if="filteredNotifications.length === 0" class="flex flex-col items-center justify-center py-10 text-center px-6">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
              <i class="fas fa-inbox text-slate-300 text-lg"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sin notificaciones</p>
            <p class="text-[10px] text-slate-300 mt-1">Estás al día</p>
          </div>

          <button
            v-for="n in filteredNotifications"
            :key="n._id"
            type="button"
            @click="onNotificationClick(n)"
            class="w-full px-4 py-3 border-b border-slate-100 hover:bg-slate-50 text-left transition-colors flex items-start gap-3 group"
            :class="!n.read ? 'bg-primary-50/30' : ''"
          >
            <!-- Icono según categoría -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[14px]"
              :class="categoryIconBg(n.category)"
            >
              <i :class="categoryIcon(n.category)"></i>
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1">
                <p class="text-[12px] font-black text-slate-700 truncate">{{ n.title }}</p>
                <span v-if="!n.read" class="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0 ml-auto"></span>
              </div>
              <p v-if="n.message" class="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
              <p class="text-[9px] text-slate-300 mt-1 font-bold uppercase tracking-wider">{{ formatDate(n.createdAt) }}</p>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { notificationService, type AppNotification } from '@/services/notificationService'

const router = useRouter()

const open = ref(false)
const loading = ref(false)
const notifications = ref<AppNotification[]>([])
const unreadCount = ref(0)
const activeTab = ref<'all' | 'mention' | 'assignment' | 'due'>('all')
const bellRoot = ref<HTMLElement>()

const tabs = [
  { id: 'all' as const, label: 'Todas' },
  { id: 'mention' as const, label: 'Menciones' },
  { id: 'assignment' as const, label: 'Asignadas' },
  { id: 'due' as const, label: 'Vencen' },
]

const hasUnread = computed(() => notifications.value.some(n => !n.read))

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  if (activeTab.value === 'mention') return notifications.value.filter(n => n.category === 'mention')
  if (activeTab.value === 'assignment') return notifications.value.filter(n => n.category === 'assignment')
  if (activeTab.value === 'due') return notifications.value.filter(n => n.category === 'due-soon' || n.category === 'overdue')
  return notifications.value
})

async function fetchNotifications() {
  loading.value = true
  try {
    notifications.value = await notificationService.list()
  } catch (e) {
    console.error('Error fetching notifications:', e)
  } finally {
    loading.value = false
  }
}

async function fetchUnreadCount() {
  try {
    unreadCount.value = await notificationService.unreadCount()
  } catch {}
}

async function toggleDropdown() {
  open.value = !open.value
  if (open.value) {
    await fetchNotifications()
  }
}

function closeDropdown() {
  open.value = false
}

async function markAllAsRead() {
  try {
    await notificationService.markAllRead()
    notifications.value.forEach(n => { if (!n.virtual) n.read = true })
    await fetchUnreadCount()
  } catch {}
}

async function onNotificationClick(n: AppNotification) {
  // Marcar como leída
  if (!n.read && !n.virtual) {
    try {
      await notificationService.markRead(n._id)
      n.read = true
    } catch {}
  }

  closeDropdown()
  await fetchUnreadCount()

  // Navegar a la entidad
  if (n.entityType === 'activity' && n.entityId) {
    router.push({ path: '/tasks', query: { openActivity: String(n.entityId) } })
  } else if (n.entityType === 'task' && n.entityId) {
    router.push({ path: '/tasks', query: { openTask: String(n.entityId) } })
  }
}

// ── Iconos por categoría ──
function categoryIcon(category: string): string {
  switch (category) {
    case 'mention': return 'fas fa-at text-violet-500'
    case 'assignment': return 'fas fa-user-tag text-blue-500'
    case 'comment': return 'fas fa-comment text-emerald-500'
    case 'due-soon': return 'fas fa-clock text-amber-500'
    case 'overdue': return 'fas fa-exclamation-triangle text-rose-500'
    default: return 'fas fa-bell text-slate-400'
  }
}

function categoryIconBg(category: string): string {
  switch (category) {
    case 'mention': return 'bg-violet-50'
    case 'assignment': return 'bg-blue-50'
    case 'comment': return 'bg-emerald-50'
    case 'due-soon': return 'bg-amber-50'
    case 'overdue': return 'bg-rose-50'
    default: return 'bg-slate-50'
  }
}

function formatDate(date: string): string {
  try {
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    // Si es menos de 7 días, mostrar relativo
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(d, { locale: es, addSuffix: true })
    }
    return format(d, "d MMM, HH:mm", { locale: es })
  } catch {
    return ''
  }
}

// ── Click outside handler (sin directiva) ──
function onDocClick(e: MouseEvent) {
  if (!open.value) return
  if (bellRoot.value && !bellRoot.value.contains(e.target as Node)) {
    open.value = false
  }
}

// ── Polling cada 30s del contador ──
let pollInterval: number | undefined
onMounted(() => {
  fetchUnreadCount()
  pollInterval = window.setInterval(fetchUnreadCount, 30_000)
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  if (pollInterval) clearInterval(pollInterval)
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  20%, 60% { transform: rotate(-12deg); }
  40%, 80% { transform: rotate(12deg); }
}
.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
  transform-origin: top center;
}
</style>
