<template>
  <div class="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-xl rounded-xl shadow-lg p-3 border border-purple-500/20 animate-fade-in animation-delay-2000">
    <div class="flex items-center mb-2">
      <i class="fas fa-lightbulb text-yellow-400 mr-2 text-sm"></i>
      <h4 class="text-xs font-semibold text-white">Inspiración</h4>
    </div>

    <!-- Motivational Quote - Compact -->
    <div v-if="currentContent" class="text-center">
      <div class="bg-white/5 rounded-lg p-2 border border-white/10 mb-2">
        <i class="fas fa-quote-left text-purple-400 text-xs mb-1 block opacity-60"></i>
        <p class="text-white text-xs font-medium leading-tight mb-1 line-clamp-3">{{ currentContent.quote || currentContent.title }}</p>
        <p class="text-purple-300 text-xs opacity-80">- {{ currentContent.author || 'Anónimo' }}</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="text-center py-2">
      <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-400 mx-auto"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface QuoteItem {
  quote: string
  author: string
  date: string
}

const currentContent = ref<QuoteItem | null>(null)

// Base de datos local de contenido motivacional
const motivationalContent = [
  // YouTube Shorts (IDs reales de videos motivacionales)
  {
    type: 'video' as const,
    videoId: 'S9TSZa1p-_k', // Motivación emprendedores
    title: 'El poder de la consistencia',
    date: ''
  },
  {
    type: 'video' as const,
    videoId: 'kBdfcR-8hEY', // Hábitos exitosos
    title: 'Hábitos que cambian vidas',
    date: ''
  },
  {
    type: 'video' as const,
    videoId: '80StKtVs-zE', // Mentalidad ganadora
    title: 'Mentalidad de campeón',
    date: ''
  },
  {
    type: 'video' as const,
    videoId: 'XxXgfhh3aLI', // Disciplina y éxito
    title: 'La disciplina es libertad',
    date: ''
  },
  // Frases motivacionales inspiradoras
  {
    type: 'quote' as const,
    quote: 'Tu trabajo va a llenar gran parte de tu vida, y la única manera de estar realmente satisfecho es hacer lo que crees que es un gran trabajo.',
    author: 'Steve Jobs',
    date: ''
  },
  {
    type: 'quote' as const,
    quote: 'La innovación distingue a un líder de un seguidor.',
    author: 'Steve Jobs',
    date: ''
  },
  {
    type: 'quote' as const,
    quote: 'El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez de manera más inteligente.',
    author: 'Henry Ford',
    date: ''
  },
  {
    type: 'quote' as const,
    quote: 'No cuentes los días, haz que los días cuenten.',
    author: 'Muhammad Ali',
    date: ''
  },
  {
    type: 'quote' as const,
    quote: 'El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje para continuar.',
    author: 'Winston Churchill',
    date: ''
  },
  {
    type: 'quote' as const,
    quote: 'La calidad nunca es un accidente; siempre es el resultado de un esfuerzo inteligente.',
    author: 'John Ruskin',
    date: ''
  },
  {
    type: 'quote' as const,
    quote: 'El futuro pertenece a quienes creen en la belleza de sus sueños.',
    author: 'Eleanor Roosevelt',
    date: ''
  },
  {
    type: 'quote' as const,
    quote: 'La creatividad es la inteligencia divirtiéndose.',
    author: 'Albert Einstein',
    date: ''
  }
]

const getTodayKey = () => {
  const today = new Date()
  return `motivational_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`
}

const getRandomContent = (): ContentItem => {
  const randomIndex = Math.floor(Math.random() * motivationalContent.length)
  const content = { ...motivationalContent[randomIndex] }
  content.date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return content
}

const loadTodaysContent = () => {
  const todayKey = getTodayKey()
  const stored = localStorage.getItem(todayKey)

  if (stored) {
    try {
      currentContent.value = JSON.parse(stored)
    } catch (e) {
      // Si hay error, generar nuevo contenido
      currentContent.value = getRandomContent()
      localStorage.setItem(todayKey, JSON.stringify(currentContent.value))
    }
  } else {
    // Generar nuevo contenido para hoy
    currentContent.value = getRandomContent()
    localStorage.setItem(todayKey, JSON.stringify(currentContent.value))
  }
}

onMounted(() => {
  console.log('[MotivationalWidget] Loading content...')
  loadTodaysContent()
  console.log('[MotivationalWidget] Content loaded:', currentContent.value)
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

/* Responsive adjustments */
@media (max-width: 640px) {
  /* Allow video to be full width on mobile */
}
</style>