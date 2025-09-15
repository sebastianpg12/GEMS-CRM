<template>
  <div class="h-full flex">
    <ProspectConversationsList @select="onSelect" />
    <div class="flex-1 p-6 bg-gray-950 min-h-screen">
      <div v-if="!selected" class="h-full flex items-center justify-center text-gray-400">
        Selecciona un prospecto para ver la conversación
      </div>
      <ProspectConversationDetail v-else :conversation="selected" @message-sent="onMessageSent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProspectConversationsList from './components/ProspectConversationsListFixed.vue'
import ProspectConversationDetail from './components/ProspectConversationDetail.vue'

const selected = ref(null as any)

function onSelect(conv: any) {
  selected.value = conv
}

function onMessageSent(msg: any) {
  // buscar y actualizar la conversación localmente si es necesario
  if (selected.value && selected.value._id === msg.conversationId) {
    selected.value.messages.push(msg)
  }
}
</script>

<style scoped>
.h-full { height: 100vh; }
.bg-gray-950 { background: #0f1720; }
</style>
<template>
  <div class="h-full flex">
    <ProspectConversationsList @select="onSelect" />
    <div class="flex-1 p-6 bg-gray-950 min-h-screen">
      <div v-if="!selected" class="h-full flex items-center justify-center text-gray-400">
        Selecciona un prospecto para ver la conversación
      </div>
      <ProspectConversationDetail v-else :conversation="selected" @message-sent="onMessageSent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProspectConversationsList from './components/ProspectConversationsListFixed.vue'
import ProspectConversationDetail from './components/ProspectConversationDetail.vue'

const selected = ref(null as any)

function onSelect(conv: any) {
  selected.value = conv
}

function onMessageSent(msg: any) {
  // buscar y actualizar la conversación localmente si es necesario
  if (selected.value && selected.value._id === msg.conversationId) {
    selected.value.messages.push(msg)
  }
}
</script>

<style scoped>
.h-full { height: 100vh; }
.bg-gray-950 { background: #0f1720; }
</style>
