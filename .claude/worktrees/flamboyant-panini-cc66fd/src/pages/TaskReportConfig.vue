<template>
  <Layout>
    <template #header>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Configuración de Notificaciones</h1>
          <p class="text-gray-400 text-sm mt-1">
            Administra las notificaciones automáticas y reportes de tareas enviados a WhatsApp
          </p>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Botón para ir a notificador manual -->
          <router-link 
            to="/tasks-notifier" 
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Ir a Notificador Manual
          </router-link>
          
          <!-- Botón para ir a vincular WhatsApp -->
          <router-link 
            to="/vincular-wpp" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Vincular WhatsApp
          </router-link>
        </div>
      </div>
      
      <!-- Migas de pan -->
      <div class="flex items-center text-sm text-gray-500 mt-2">
        <router-link to="/" class="hover:text-white">Inicio</router-link>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-white">Configuración de Notificaciones</span>
      </div>
    </template>

    <!-- Descripción -->
    <div class="bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 mb-6">
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-lg bg-purple-700/30 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-medium text-white mb-2">Sistema de Notificaciones Automáticas</h2>
          <p class="text-gray-300 text-sm">
            Este módulo permite configurar notificaciones automáticas para mantener informado a tu equipo sobre las tareas pendientes.
            Puedes activar dos tipos de notificaciones:
          </p>
          <ul class="mt-2 space-y-1 text-sm">
            <li class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-purple-500"></div>
              <span class="text-gray-300"><strong>Resumen Diario:</strong> Envía un reporte de tareas creadas durante el día</span>
            </li>
            <li class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span class="text-gray-300"><strong>Recordatorio de Vencimiento:</strong> Avisa sobre tareas próximas a vencer</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <div class="grid grid-cols-1 gap-6">
        <TaskReportSettings />
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../components/Layout.vue'
import TaskReportSettings from '../components/admin/TaskReportSettings.vue'
</script>