<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 animate-fade-in animation-delay-2000 relative overflow-hidden group">
    <div class="absolute -top-10 -right-10 w-24 h-24 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
    
    <div class="flex flex-col relative z-10">
      <div class="flex items-center mb-1">
        <i class="fas fa-lightbulb text-amber-500 text-[10px] mr-1.5"></i>
        <h4 class="text-[10px] font-black text-slate-800 uppercase tracking-wider">Breve Inspiración</h4>
      </div>
      <p class="text-slate-600 text-[11px] font-medium leading-snug mb-1 italic">"{{ currentQuote }}"</p>
      <p class="text-primary-600 text-[10px] font-bold text-right">- {{ currentAuthor }}</p>
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