<template>
  <div class="board-column bg-gray-50 rounded-lg p-4 min-w-[300px] max-w-[350px]">
    <!-- Column Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <h3 class="text-sm font-semibold text-gray-900">{{ column.name }}</h3>
        <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
          {{ tasks.length }}
        </span>
        <span v-if="column.wipLimit" class="text-xs text-gray-500">
          / {{ column.wipLimit }}
        </span>
      </div>
      <button
        v-if="canAddTask"
        @click="$emit('add-task', column.id)"
        class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
        title="Agregar tarea"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- WIP Limit Warning -->
    <div 
      v-if="column.wipLimit && tasks.length >= column.wipLimit"
      class="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800"
    >
      <div class="flex items-center space-x-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>Límite WIP alcanzado</span>
      </div>
    </div>

    <!-- Tasks List -->
    <div 
      ref="dropZone"
      class="tasks-container space-y-3 min-h-[200px]"
      :class="{ 'drop-zone-active': isDraggingOver }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div
        v-for="task in tasks"
        :key="task._id"
        draggable="true"
        @dragstart="handleDragStart(task, $event)"
        @dragend="handleDragEnd"
      >
        <TaskCard 
          :task="task"
          @click="$emit('task-click', task)"
        />
      </div>

      <!-- Empty state -->
      <div 
        v-if="tasks.length === 0"
        class="text-center py-8 text-gray-400 text-sm"
      >
        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>Sin tareas</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '@/stores/tasks'
import type { BoardColumn } from '@/stores/boards'

interface Props {
  column: BoardColumn
  tasks: Task[]
  canAddTask?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-task': [columnId: string]
  'task-click': [task: Task]
  'task-moved': [task: Task, targetColumnId: string, newIndex: number]
}>()

const isDraggingOver = ref(false)
let draggedTask: Task | null = null

function handleDragStart(task: Task, event: DragEvent) {
  draggedTask = task
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task._id)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDraggingOver.value = true
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDragLeave() {
  isDraggingOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDraggingOver.value = false
  
  if (draggedTask) {
    emit('task-moved', draggedTask, props.column.id, props.tasks.length)
  }
}

function handleDragEnd() {
  draggedTask = null
}
</script>

<style scoped>
.drop-zone-active {
  background-color: rgba(59, 130, 246, 0.05);
  border: 2px dashed rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
}

.tasks-container {
  transition: all 0.2s ease;
}
</style>
