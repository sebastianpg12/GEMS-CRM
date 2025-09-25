<template>
  <aside class="prospect-list h-full flex flex-col bg-gray-900 border-r border-purple-900/20">
    <div class="p-4 border-b border-purple-800/20 flex items-center gap-3">
      <div class="text-lg font-bold text-white">Prospectos</div>
      <input v-model="query" placeholder="Buscar..." class="ml-auto bg-gray-800 text-sm text-gray-200 rounded px-3 py-1 focus:outline-none" />
    </div>

    <div class="p-3 flex-1 overflow-auto">
      <div v-if="loading" class="text-gray-400">Cargando prospectos...</div>
      <div v-else-if="error" class="text-red-400">{{ error }}</div>
      <div v-else>
        <div v-if="filtered.length === 0" class="text-gray-400">No hay prospectos.</div>
        <ul class="space-y-2">
          <li v-for="conv in filtered" :key="conv._id" @click="select(conv)" :class="['p-2 rounded-lg cursor-pointer flex items-center gap-3', selectedId === conv._id ? 'bg-purple-800/30 border border-purple-700' : 'hover:bg-gray-800']">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">{{ avatar(conv) }}</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-white truncate">{{ conv.prospectName }}</div>
              <div class="text-xs text-gray-400 truncate">{{ conv.company || 'Sin empresa' }}</div>
            </div>
            <div class="text-xs text-gray-400">{{ (conv.messages ?? []).length }}</div>
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
  const res = await fetch('https://gems-crm-backend.onrender.com/api/prospects')
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
.prospect-list { width: 300px; min-width: 220px; max-width: 320px; height: 100vh; }
input { background: #111827aa; }
</style>
