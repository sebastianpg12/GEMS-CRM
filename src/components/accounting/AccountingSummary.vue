<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Resumen Financiero -->
    <div class="lg:col-span-2">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
        <h3 class="text-xl font-bold text-white mb-6">Resumen Financiero</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Ingresos vs Egresos -->
          <div class="bg-gradient-to-br from-green-500/10 to-red-500/10 rounded-xl p-4 border border-purple-500/20">
            <h4 class="text-lg font-semibold text-white mb-4">Flujo de Efectivo</h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-green-400 flex items-center">
                  <i class="fas fa-arrow-up mr-2"></i>
                  Ingresos
                </span>
                <span class="text-green-400 font-bold">
                  ${{ formatCurrency(summary.ingresos) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-red-400 flex items-center">
                  <i class="fas fa-arrow-down mr-2"></i>
                  Egresos
                </span>
                <span class="text-red-400 font-bold">
                  ${{ formatCurrency(summary.egresos) }}
                </span>
              </div>
              <hr class="border-gray-600">
              <div class="flex justify-between items-center">
                <span class="text-white font-semibold">Balance</span>
                <span :class="[
                  'font-bold text-lg',
                  summary.balance >= 0 ? 'text-green-400' : 'text-red-400'
                ]">
                  ${{ formatCurrency(summary.balance) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Gastos Fijos -->
          <div class="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-purple-500/20">
            <h4 class="text-lg font-semibold text-white mb-4">Gastos Fijos</h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-yellow-400 flex items-center">
                  <i class="fas fa-calendar-alt mr-2"></i>
                  Mensuales
                </span>
                <span class="text-yellow-400 font-bold">
                  ${{ formatCurrency(summary.gastos_fijos_mensuales) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-orange-400 flex items-center">
                  <i class="fas fa-calendar mr-2"></i>
                  Proyección Anual
                </span>
                <span class="text-orange-400 font-bold">
                  ${{ formatCurrency(summary.gastos_fijos_mensuales * 12) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400 flex items-center">
                  <i class="fas fa-percentage mr-2"></i>
                  % del Balance
                </span>
                <span class="text-gray-400 font-bold">
                  {{ getFixedExpensePercentage() }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagos Pendientes -->
    <div>
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Pagos Pendientes</h3>
          <span class="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
            {{ summary.pagos_pendientes.length }}
          </span>
        </div>

        <div v-if="summary.pagos_pendientes.length === 0" class="text-center py-8">
          <i class="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
          <p class="text-gray-400">¡Todos los pagos al día!</p>
        </div>

        <div v-else class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="pago in summary.pagos_pendientes"
            :key="pago._id"
            class="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h4 class="font-semibold text-white">{{ pago.concepto }}</h4>
                <p v-if="pago.cliente_id" class="text-sm text-gray-400">
                  <i class="fas fa-user mr-1"></i>
                  {{ getClientName(pago.cliente_id) }}
                </p>
                <p v-if="pago.proximo_pago" class="text-sm text-red-400">
                  <i class="fas fa-clock mr-1"></i>
                  Vence: {{ formatDate(pago.proximo_pago) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-red-400">
                  ${{ formatCurrency(pago.monto) }}
                </p>
                <button
                  @click="$emit('markAsPaid', pago)"
                  class="mt-2 px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors border border-green-500/30 text-xs"
                >
                  <i class="fas fa-check mr-1"></i>
                  Marcar Pagado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SummaryData {
  ingresos: number
  egresos: number
  balance: number
  gastos_fijos_mensuales: number
  pagos_pendientes: any[]
}

interface Props {
  summary: SummaryData
}

const props = defineProps<Props>()

defineEmits<{
  markAsPaid: [pago: any]
}>()

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getClientName = (clientData: any): string => {
  if (typeof clientData === 'object' && clientData !== null) {
    return `${clientData.nombre || ''} ${clientData.apellido || ''}`.trim()
  }
  return 'Cliente no especificado'
}

const getFixedExpensePercentage = (): string => {
  if (props.summary.balance <= 0) return '0'
  const percentage = (props.summary.gastos_fijos_mensuales / Math.abs(props.summary.balance)) * 100
  return percentage.toFixed(1)
}
</script>
