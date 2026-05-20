<template>
  <div class="relative" @keydown.escape.stop="open = false">
    <button
      @click="toggle"
      class="relative p-2 text-gray-400 hover:text-white transition-colors"
      aria-haspopup="true"
      :aria-expanded="open ? 'true' : 'false'"
      title="Usuarios en línea"
    >
      <UsersIcon class="w-6 h-6" />
      <span v-if="onlineCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">
        {{ onlineCount > 99 ? '99+' : onlineCount }}
      </span>
    </button>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-64 z-50 bg-gradient-to-br from-dark-800/95 to-dark-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden"
      role="dialog"
      aria-label="Usuarios en línea"
    >
      <div class="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <div class="text-sm text-white/90 font-medium">En línea</div>
        <div class="text-xs text-emerald-300">● {{ onlineCount }}</div>
      </div>
      <div class="max-h-64 overflow-y-auto custom-scrollbar p-2">
        <div v-if="onlineCount === 0" class="text-center text-gray-400 text-sm py-6">Nadie en línea</div>
        <ul v-else class="space-y-1">
          <li v-for="u in onlineList" :key="u._id" class="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/5">
            <div class="relative w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
              {{ u.name.charAt(0).toUpperCase() }}
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-dark-900"></span>
            </div>
            <div class="min-w-0">
              <div class="text-sm text-white truncate">{{ u.name }}</div>
              <div class="text-[11px] text-gray-400 truncate">{{ u.position || u.role || u.email }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { UsersIcon } from '@heroicons/vue/24/outline'

const chatStore = useChatStore()
const open = ref(false)

const onlineCount = computed(() => chatStore.onlineUsers?.length || 0)
const onlineList = computed(() => {
  const ids = new Set(chatStore.onlineUsers || [])
  return (chatStore.users || []).filter(u => ids.has(u._id))
})

const toggle = () => (open.value = !open.value)
</script>

<style scoped>
.custom-scrollbar{ scrollbar-width:thin; scrollbar-color: rgba(147, 51, 234, 0.5) transparent; }
.custom-scrollbar::-webkit-scrollbar{ width:8px }
.custom-scrollbar::-webkit-scrollbar-thumb{ background: linear-gradient(180deg, rgb(147,51,234), rgb(219,39,119)); border-radius: 10px; }
</style>
