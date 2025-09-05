<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Gestión de Clientes
        </h1>
        <p class="text-gray-400 mt-2">{{ clients.length }} clientes registrados</p>
      </div>
      
      <button 
        @click="showModal = true; editingClient = null; resetForm()" 
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg shadow-purple-500/25"
      >
        <PlusIcon class="w-5 h-5" />
        Nuevo Cliente
      </button>
    </div>
    
    <!-- Search and Filters -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar clientes por nombre, email, empresa..."
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          />
        </div>
        <select 
          v-model="sortBy" 
          class="bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="name">Ordenar por Nombre</option>
          <option value="company">Ordenar por Empresa</option>
          <option value="email">Ordenar por Email</option>
          <option value="createdAt">Ordenar por Fecha</option>
        </select>
      </div>
    </div>
    
    <!-- Clients Table/Cards -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-500/20 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
      
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mx-6">
          <div class="flex items-center justify-center gap-3 mb-4">
            <ExclamationTriangleIcon class="w-8 h-8 text-red-400" />
            <h3 class="text-red-300 font-medium text-lg">Error al cargar clientes</h3>
          </div>
          <p class="text-red-400 mb-4">{{ error }}</p>
          <button @click="fetchClients" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
      
      <div v-else>
        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-900/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Empresa
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Contacto
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th class="px-6 py-4 text-right text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700/50">
              <tr 
                v-for="client in filteredClients" 
                :key="client._id"
                class="hover:bg-gray-700/30 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span class="text-white text-lg font-bold">
                        {{ client.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-white font-medium">{{ client.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-gray-300">{{ client.company }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-gray-300">{{ client.email }}</div>
                  <div class="text-gray-400 text-sm">{{ client.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-300">
                  {{ formatDate(client.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="editClient(client)"
                      class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Editar cliente"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDelete(client)"
                      class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Eliminar cliente"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="md:hidden p-4 space-y-4">
          <div 
            v-for="client in filteredClients" 
            :key="client._id"
            class="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20 hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">{{ client.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="ml-3">
                  <h3 class="text-white font-medium">{{ client.name }}</h3>
                  <p class="text-gray-400 text-sm">{{ client.company }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editClient(client)"
                  class="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="confirmDelete(client)"
                  class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="space-y-1 text-sm">
              <p class="text-gray-300">{{ client.email }}</p>
              <p class="text-gray-400">{{ client.phone }}</p>
              <p class="text-gray-500">Registrado: {{ formatDate(client.createdAt) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredClients.length === 0" class="text-center py-12">
          <UserGroupIcon class="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <h3 class="text-xl font-medium text-gray-300 mb-2">
            {{ searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados' }}
          </h3>
          <p class="text-gray-400 mb-6">
            {{ searchTerm ? 'Intenta con una búsqueda diferente' : 'Comienza agregando tu primer cliente' }}
          </p>
          <button @click="showModal = true; editingClient = null; resetForm()" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 mx-auto font-medium transform hover:scale-105 shadow-lg shadow-purple-500/25">
            <PlusIcon class="w-5 h-5" />
            Nuevo Cliente
          </button>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h3 class="text-xl font-bold text-white">
            {{ editingClient ? 'Editar Cliente' : 'Crear Nuevo Cliente' }}
          </h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveClient" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <i class="fas fa-user mr-2 text-purple-400"></i>Nombre completo *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <i class="fas fa-envelope mr-2 text-purple-400"></i>Email *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="juan@ejemplo.com"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <i class="fas fa-phone mr-2 text-purple-400"></i>Teléfono *
              </label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="+57 300 123 4567"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <i class="fas fa-building mr-2 text-purple-400"></i>Empresa *
              </label>
              <input
                v-model="form.company"
                type="text"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Empresa ABC"
              />
            </div>
          </div>
          
          <div class="flex justify-end gap-4 pt-4">
            <button
              type="button"
              @click="showModal = false"
              class="px-6 py-3 text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium transform hover:scale-105 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </span>
              <span v-else class="flex items-center gap-2">
                <i class="fas fa-save"></i>
                {{ editingClient ? 'Actualizar' : 'Crear' }} Cliente
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-gray-900 rounded-2xl shadow-2xl border border-red-500/20 max-w-md w-full mx-4">
        <div class="flex items-center justify-between p-6 border-b border-red-500/20">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-400" />
            Confirmar Eliminación
          </h3>
          <button @click="showDeleteModal = false" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-lg">
                {{ clientToDelete?.name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <p class="text-white font-medium">{{ clientToDelete?.name }}</p>
              <p class="text-gray-400 text-sm">{{ clientToDelete?.company }}</p>
            </div>
          </div>
          
          <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p class="text-red-300 text-sm">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>¿Estás seguro de que deseas eliminar este cliente?</strong>
            </p>
            <p class="text-red-400 text-sm mt-2">
              Esta acción no se puede deshacer y se perderán todos los datos asociados.
            </p>
          </div>
          
          <div class="flex justify-end gap-4">
            <button
              @click="showDeleteModal = false"
              class="px-6 py-3 text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              @click="deleteClient"
              :disabled="loading"
              class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="loading" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Eliminando...
              </span>
              <span v-else class="flex items-center gap-2">
                <i class="fas fa-trash"></i>
                Eliminar Cliente
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '../stores/clientStore'
import type { Client, ClientForm } from '../types'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const clientsStore = useClientStore()

const showModal = ref(false)
const showDeleteModal = ref(false)
const searchTerm = ref('')
const sortBy = ref('name')
const editingClient = ref<Client | null>(null)
const clientToDelete = ref<Client | null>(null)

const form = ref<ClientForm>({
  name: '',
  email: '',
  phone: '',
  company: ''
})

const clients = computed(() => clientsStore.clients)
const loading = computed(() => clientsStore.loading)
const error = computed(() => clientsStore.error)

const filteredClients = computed(() => {
  let filtered = clients.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(client => 
      client.name.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.company.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search)
    )
  }

  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'company':
        return a.company.localeCompare(b.company)
      case 'email':
        return a.email.localeCompare(b.email)
      case 'createdAt':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      default:
        return 0
    }
  })
})

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    phone: '',
    company: ''
  }
}

const editClient = (client: Client) => {
  editingClient.value = client
  form.value = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company
  }
  showModal.value = true
}

const confirmDelete = (client: Client) => {
  clientToDelete.value = client
  showDeleteModal.value = true
}

const saveClient = async () => {
  try {
    if (editingClient.value) {
      await clientsStore.updateClient(editingClient.value._id!, form.value)
    } else {
      await clientsStore.createClient(form.value)
    }
    showModal.value = false
    resetForm()
    editingClient.value = null
  } catch (error) {
    console.error('Error saving client:', error)
  }
}

const deleteClient = async () => {
  if (!clientToDelete.value?._id) return
  
  try {
    await clientsStore.deleteClient(clientToDelete.value._id)
    showDeleteModal.value = false
    clientToDelete.value = null
  } catch (error) {
    console.error('Error deleting client:', error)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchClients = async () => {
  try {
    await clientsStore.fetchClients()
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

onMounted(() => {
  fetchClients()
})
</script>
