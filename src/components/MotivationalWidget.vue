<template>
  <div class="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-xl rounded-xl shadow-lg p-3 border border-purple-500/20 animate-fade-in animation-delay-2000">
    <div class="flex items-center mb-2">
      <i class="fas fa-lightbulb text-yellow-400 mr-2 text-sm"></i>
      <h4 class="text-xs font-semibold text-white">Inspiración</h4>
    </div>

    <!-- Motivational Quote - Compact -->
    <div class="text-center">
      <div class="bg-white/5 rounded-lg p-2 border border-white/10 mb-2">
        <i class="fas fa-quote-left text-purple-400 text-xs mb-1 block opacity-60"></i>
        <p class="text-white text-xs font-medium leading-tight mb-1">{{ currentQuote }}</p>
        <p class="text-purple-300 text-xs opacity-80">- {{ currentAuthor }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const quotes = [
  { text: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', author: 'Robert Collier' },
  { text: 'La innovación distingue al líder del seguidor.', author: 'Steve Jobs' },
  { text: 'El único modo de hacer un gran trabajo es amar lo que haces.', author: 'Steve Jobs' },
  { text: 'La calidad nunca es un accidente; siempre es el resultado de un esfuerzo inteligente.', author: 'John Ruskin' },
  { text: 'El futuro pertenece a quienes creen en la belleza de sus sueños.', author: 'Eleanor Roosevelt' },
  { text: 'No esperes a que las oportunidades lleguen, búscalas.', author: 'Anónimo' },
  { text: 'La excelencia es un hábito, no un acto.', author: 'Aristóteles' },
  { text: 'El cambio es la ley de la vida. Aquellos que solo miran al pasado o al presente perderán el futuro.', author: 'John F. Kennedy' }
]

const currentQuote = ref(quotes[0].text)
const currentAuthor = ref(quotes[0].author)

// Rotar frases cada cierto tiempo
onMounted(() => {
  let index = 0
  setInterval(() => {
    index = (index + 1) % quotes.length
    currentQuote.value = quotes[index].text
    currentAuthor.value = quotes[index].author
  }, 30000) // Cambiar cada 30 segundos
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>