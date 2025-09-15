<template>
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Prospectos
        </h1>
        <p class="text-gray-400 mt-2">Analiza y aborda nuevos clientes potenciales usando IA</p>
      </div>
    </div>
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <ProspectAIForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProspectAIForm from '../components/ProspectAIForm.vue'
</script>

<style scoped>
</style>
