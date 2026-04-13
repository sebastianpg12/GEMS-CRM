<template>
  <aside class="prospect-list h-full flex flex-col bg-slate-50">
    <div class="mb-4">
      <input v-model="query" placeholder="Buscar prospectos..." class="w-full bg-white border border-slate-200 text-sm text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all" />
    </div>

    <div class="flex-1 overflow-auto pr-1 scroll-smooth">
      <div v-if="loading" class="text-slate-400 font-medium text-sm flex items-center justify-center p-4">
        <i class="fas fa-spinner fa-spin mr-2"></i> Cargando...
      </div>
      <div v-else-if="error" class="text-red-500 font-medium text-sm p-4 bg-red-50 rounded-lg">{{ error }}</div>
      <div v-else>
        <div v-if="filtered.length === 0" class="text-slate-400 font-medium text-sm text-center p-6 border border-dashed border-slate-200 rounded-lg">No hay prospectos.</div>
        <ul class="space-y-2">
          <li v-for="conv in filtered" :key="conv._id" @click="select(conv)" class="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer flex items-center gap-3 hover:border-primary-400 hover:shadow-md transition-all shadow-sm">
            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 shrink-0">{{ avatar(conv) }}</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-slate-800 truncate">{{ conv.prospectName }}</div>
              <div class="text-xs font-medium text-slate-500 truncate">{{ conv.company || 'Sin empresa' }}</div>
            </div>
            <div class="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{{ conv.messages?.length ?? 0 }}</div>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type Message = { role?: string; content?: string; timestamp?: string | number }
type Conversation = { _id: string; prospectName: string; company?: string; messages?: Message[]; lastUpdated?: string | number }

const query = ref('')
const conversations = ref<Conversation[]>([])
const loading = ref(true)
const error = ref('')
const selectedId = ref<string | null>(null)

const emit = defineEmits<{
  (e: 'select', conv: Conversation): void
}>()

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = [...conversations.value].sort((a, b) => Number(new Date(String(b.lastUpdated || 0))) - Number(new Date(String(a.lastUpdated || 0))))
  return q
    ? list.filter(c => (c.prospectName || '').toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q))
    : list
})

function avatar(conv: Conversation) { return conv.prospectName ? conv.prospectName.charAt(0).toUpperCase() : '?' }
function select(conv: Conversation) { selectedId.value = conv._id; emit('select', conv) }

onMounted(async () => {
  try {
    const res = await fetch('/api/prospects')
    if (!res.ok) throw new Error('Network response not ok')
    const data = await res.json()
    conversations.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
    error.value = 'Error cargando prospectos'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.prospect-list { width: 100%; height: 100%; min-height: 50vh; }
</style>
