<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
      <div>
        <h1 class="text-2xl font-black text-slate-800 flex items-center gap-2">
          <i class="fas fa-robot text-primary-500"></i>
          Prospectos IA
        </h1>
        <p class="text-slate-500 font-medium text-sm mt-1">Analiza y aborda nuevos clientes potenciales usando Inteligencia Artificial</p>
      </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-0 overflow-hidden">
      <ProspectAIForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProspectAIForm from '../components/ProspectAIForm.vue'
</script>

<style scoped>
</style>
