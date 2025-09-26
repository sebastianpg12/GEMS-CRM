<template>
  <div>
    <div class="flex flex-wrap gap-2 mb-2">
      <span v-for="user in selectedUsers" :key="user._id"
        class="flex items-center px-2 bg-purple-700/80 rounded-full text-white text-xs"
        style="height:28px; min-height:28px; max-height:28px; align-items:center;">
        <img v-if="user.photo"
          :src="user.photo"
          class="rounded-full object-cover"
          style="width:20px; height:20px; min-width:20px; min-height:20px; max-width:20px; max-height:20px; margin-right:6px; display:inline-block; vertical-align:middle;" />
        <span class="whitespace-nowrap" style="line-height:28px; font-size:13px; height:28px; display:inline-flex; align-items:center; vertical-align:middle;">{{ user.name || 'Usuario' }}</span>
        <button type="button" @click="removeAssigned(user._id)"
          class="ml-1 text-pink-300 hover:text-pink-500 flex items-center justify-center"
          style="height:20px; width:20px; line-height:28px; font-size:16px; display:inline-flex; align-items:center; vertical-align:middle;">
          &times;
        </button>
      </span>
    </div>
    <input
      v-model="searchUser"
      type="text"
      placeholder="Buscar usuario..."
      class="w-full px-3 py-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    />
    <div class="max-h-40 overflow-y-auto">
      <button
        v-for="member in filteredMembers"
        :key="member._id"
        type="button"
        @click="typeof member._id === 'string' && addAssigned(member._id)"
        :disabled="typeof member._id !== 'string' || (modelValue && modelValue.includes(member._id as string))"
        class="flex items-center w-full px-3 py-2 mb-1 bg-gray-700/60 rounded-lg text-white hover:bg-purple-700/80 disabled:opacity-50"
      >
        <img v-if="member.photo" :src="member.photo" class="w-5 h-5 rounded-full mr-2" />
        <span>{{ member.name }} <span class="text-xs text-gray-400">({{ member.email }})</span></span>
        <span v-if="typeof member._id === 'string' && modelValue && modelValue.includes(member._id as string)" class="ml-auto text-green-400">✔</span>
      </button>
    </div>
    <p v-if="teamMembers.length === 0" class="text-yellow-400 text-sm mt-1">
      No hay usuarios disponibles para asignar.
    </p>
  </div>
</template>

<script setup lang="ts">
// Exponer selectedUsers al template
import { ref, computed } from 'vue'
import type { TeamMember } from '../types'

const props = defineProps<{
  modelValue: string[]
  teamMembers: TeamMember[]
}>()
const emit = defineEmits(['update:modelValue'])

const searchUser = ref('')
const addAssigned = (id: string) => {
  if (!props.modelValue.includes(id)) {
    emit('update:modelValue', [...props.modelValue, id])
  }
}
const removeAssigned = (id: string) => {
  emit('update:modelValue', props.modelValue.filter(uid => uid !== id))
}
const filteredMembers = computed(() => {
  if (!searchUser.value) return props.teamMembers
  return props.teamMembers.filter(u =>
    u.name.toLowerCase().includes(searchUser.value.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.value.toLowerCase())
  )
})
const selectedUsers = computed(() => props.modelValue.map(id => props.teamMembers.find(u => u._id === id)).filter(Boolean))
</script>
