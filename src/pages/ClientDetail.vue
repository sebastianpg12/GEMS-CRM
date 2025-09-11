<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
          {{ (client?.name || 'C').charAt(0).toUpperCase() }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">{{ client?.name }}</h1>
          <p class="text-gray-400">{{ client?.company }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/clients" class="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600">Volver</router-link>
        <button @click="editOverview = !editOverview" class="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700">
          {{ editOverview ? 'Cancelar' : 'Editar' }}
        </button>
        <button v-if="editOverview" @click="saveOverview" class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
          Guardar
        </button>
      </div>
    </div>

    <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
      <div class="flex gap-2 p-2 border-b border-gray-700/50 overflow-x-auto">
        <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
          :class="['px-4 py-2 rounded-lg whitespace-nowrap', activeTab === t.key ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600']">
          <i :class="t.icon" class="mr-2"></i>{{ t.label }}
        </button>
      </div>

      <div class="p-4">
        <!-- Overview -->
        <div v-if="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2 space-y-4">
            <div>
              <label class="text-sm text-gray-400">Acerca de</label>
              <textarea v-model="draft.profile.about" :readonly="!editOverview"
                class="w-full mt-1 bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-gray-200 min-h-[100px]"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-400">Dirección</label>
                <input v-model="draft.profile.address" :readonly="!editOverview" class="w-full mt-1 bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-gray-200"/>
              </div>
              <div>
                <label class="text-sm text-gray-400">Sitio web</label>
                <input v-model="draft.profile.website" :readonly="!editOverview" class="w-full mt-1 bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-gray-200"/>
              </div>
              <div>
                <label class="text-sm text-gray-400">Industria</label>
                <input v-model="draft.profile.industry" :readonly="!editOverview" class="w-full mt-1 bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-gray-200"/>
              </div>
              <div>
                <label class="text-sm text-gray-400">Tamaño</label>
                <input v-model="draft.profile.size" :readonly="!editOverview" class="w-full mt-1 bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-gray-200"/>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <div>
              <label class="text-sm text-gray-400">Etiquetas</label>
              <div class="flex flex-wrap gap-2 mt-2">
                <span v-for="(tag, i) in draft.tags" :key="i" class="px-2 py-1 rounded-full bg-purple-600/20 text-purple-300 text-xs border border-purple-500/30">{{ tag }}</span>
                <input v-if="editOverview" v-model="newTag" @keyup.enter="addTag" placeholder="+ etiqueta" class="bg-gray-900/60 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200"/>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-gray-400">Email</label>
                <input v-model="draft.email" :readonly="!editOverview" class="w-full mt-1 bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-gray-200"/>
              </div>
              <div>
                <label class="text-sm text-gray-400">Teléfono</label>
                <input v-model="draft.phone" :readonly="!editOverview" class="w-full mt-1 bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-gray-200"/>
              </div>
              <div class="col-span-2">
                <label class="text-sm text-gray-400">Compañía</label>
                <input v-model="draft.company" :readonly="!editOverview" class="w-full mt-1 bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-gray-200"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div v-else-if="activeTab === 'services'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-white font-semibold">Servicios</h3>
          </div>
          <!-- Inline add service -->
          <div class="flex flex-wrap gap-2 items-center bg-gray-900/60 border border-gray-700 rounded-xl p-3">
            <input v-model="serviceName" placeholder="Nombre del servicio" class="w-48 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <input v-model="servicePlan" placeholder="Plan (opcional)" class="w-40 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <select v-model="serviceStatus" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200">
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="cancelled">Cancelado</option>
              <option value="trial">Prueba</option>
            </select>
            <button @click="createService" class="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">Agregar</button>
          </div>
          <div v-if="client.services?.length" class="grid md:grid-cols-2 gap-4">
            <div v-for="s in client.services" :key="s._id" class="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <!-- view mode -->
              <div v-if="editingServiceId !== s._id" class="flex justify-between items-center">
                <div>
                  <p class="text-white font-medium">{{ s.name }}</p>
                  <p class="text-gray-400 text-sm">{{ s.plan }} · {{ s.status }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="startEditService(s)" class="px-2 py-1 rounded bg-blue-600/20 text-blue-300">Editar</button>
                  <button @click="deleteService(s._id)" class="px-2 py-1 rounded bg-red-600/20 text-red-300">Eliminar</button>
                </div>
              </div>
              <!-- edit mode -->
              <div v-else class="flex flex-wrap gap-2 items-center">
                <input v-model="editServicePlan" placeholder="Plan" class="w-40 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
                <input v-model="editServiceNotes" placeholder="Notas" class="flex-1 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
                <select v-model="editServiceStatus" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200">
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="trial">Prueba</option>
                </select>
                <button @click="confirmEditService" class="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">Guardar</button>
                <button @click="cancelEditService" class="px-3 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">Cancelar</button>
              </div>
              <p v-if="s.notes && editingServiceId !== s._id" class="text-gray-300 text-sm mt-2">{{ s.notes }}</p>
            </div>
          </div>
          <p v-else class="text-gray-400">No hay servicios registrados.</p>
        </div>

        <!-- Commitments -->
        <div v-else-if="activeTab === 'commitments'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-white font-semibold">Compromisos</h3>
          </div>
          <!-- Inline add commitment -->
          <div class="flex flex-wrap gap-2 items-center bg-gray-900/60 border border-gray-700 rounded-xl p-3">
            <input v-model="commitTitle" placeholder="Título" class="w-48 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <input v-model="commitDueDate" type="date" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <select v-model="commitStatus" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200">
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <button @click="createCommitment" class="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">Agregar</button>
          </div>
          <div v-if="client.commitments?.length" class="space-y-3">
            <div v-for="c in client.commitments" :key="c._id" class="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <!-- view mode -->
              <div v-if="editingCommitmentId !== c._id" class="flex justify-between items-center">
                <div>
                  <p class="text-white font-medium">{{ c.title }}</p>
                  <p class="text-gray-400 text-sm">{{ c.status }} · {{ formatDate(c.dueDate) }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="startEditCommitment(c)" class="px-2 py-1 rounded bg-blue-600/20 text-blue-300">Editar</button>
                  <button @click="deleteCommitment(c._id)" class="px-2 py-1 rounded bg-red-600/20 text-red-300">Eliminar</button>
                </div>
              </div>
              <!-- edit mode -->
              <div v-else class="flex flex-wrap gap-2 items-center">
                <input v-model="editCommitDescription" placeholder="Descripción" class="flex-1 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
                <input v-model="editCommitDueDate" type="date" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
                <select v-model="editCommitStatus" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200">
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <button @click="confirmEditCommitment" class="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">Guardar</button>
                <button @click="cancelEditCommitment" class="px-3 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">Cancelar</button>
              </div>
              <p v-if="c.description && editingCommitmentId !== c._id" class="text-gray-300 text-sm mt-2">{{ c.description }}</p>
            </div>
          </div>
          <p v-else class="text-gray-400">No hay compromisos registrados.</p>
        </div>

        <!-- Preferences -->
        <div v-else-if="activeTab === 'preferences'" class="space-y-3">
          <div class="flex gap-2 items-center">
            <input v-model="newPrefKey" placeholder="Clave (ej. tono, horario)" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <input v-model="newPrefValue" placeholder="Valor" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <button @click="addPreference" class="px-3 py-2 rounded bg-purple-600 text-white">Agregar</button>
          </div>
          <div class="grid md:grid-cols-2 gap-3">
            <div v-for="p in (client.preferences || [])" :key="p._id || p.key" class="bg-gray-900/60 border border-gray-700 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p class="text-gray-300 text-sm">{{ p.key }}</p>
                <p class="text-white">{{ p.value }}</p>
              </div>
              <button @click="removePreference(p)" class="px-2 py-1 rounded bg-red-600/20 text-red-300">Quitar</button>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-else-if="activeTab === 'notes'" class="space-y-3">
          <div class="flex gap-2">
            <input v-model="newNote" placeholder="Agregar nota (Enter para guardar)" @keyup.enter="addNote" class="flex-1 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <button @click="addNote" class="px-3 py-2 rounded bg-purple-600 text-white">Guardar</button>
          </div>
          <div class="space-y-2">
            <div v-for="n in sortedNotes" :key="n._id" class="bg-gray-900/60 border border-gray-700 rounded-xl p-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-400 text-xs">{{ formatDate(n.createdAt) }}</span>
                <div class="flex gap-2">
                  <button @click="togglePin(n)" class="px-2 py-1 rounded bg-yellow-600/20 text-yellow-300">{{ n.pinned ? 'Desfijar' : 'Fijar' }}</button>
                  <button @click="deleteNote(n._id)" class="px-2 py-1 rounded bg-red-600/20 text-red-300">Eliminar</button>
                </div>
              </div>
              <p class="text-white mt-2 whitespace-pre-wrap">{{ n.content }}</p>
            </div>
          </div>
        </div>

        <!-- Custom Fields -->
        <div v-else-if="activeTab === 'custom'" class="space-y-3">
          <div class="flex gap-2 items-center">
            <input v-model="newFieldKey" placeholder="Clave" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <input v-model="newFieldValue" placeholder="Valor" class="bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-gray-200" />
            <button @click="addCustomField" class="px-3 py-2 rounded bg-purple-600 text-white">Agregar</button>
          </div>
          <div class="grid md:grid-cols-2 gap-3">
            <div v-for="f in (client.customFields || [])" :key="f._id || f.key" class="bg-gray-900/60 border border-gray-700 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">{{ f.key }}</p>
                <p class="text-white">{{ f.value }}</p>
              </div>
              <button @click="removeCustomField(f)" class="px-2 py-1 rounded bg-red-600/20 text-red-300">Quitar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { clientService } from '@/services/clientService'
import { API_CONFIG } from '@/config/api'

const route = useRoute()
const id = route.params.id as string
const client = reactive<any>({})
const draft = reactive<any>({ profile: {}, tags: [] })
const editOverview = ref(false)
const newTag = ref('')
const newNote = ref('')
const newPrefKey = ref('')
const newPrefValue = ref('')
const newFieldKey = ref('')
const newFieldValue = ref('')

const tabs = [
  { key: 'overview', label: 'Resumen', icon: 'fas fa-user' },
  { key: 'services', label: 'Servicios', icon: 'fas fa-box' },
  { key: 'commitments', label: 'Compromisos', icon: 'fas fa-handshake' },
  { key: 'preferences', label: 'Preferencias', icon: 'fas fa-heart' },
  { key: 'notes', label: 'Notas', icon: 'fas fa-sticky-note' },
  { key: 'custom', label: 'Campos', icon: 'fas fa-sliders-h' }
]
const activeTab = ref('overview')

// Helper: safe JSON parsing with clearer errors
const parseJsonSafe = async (res: Response) => {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    const text = await res.text()
    throw new Error(`Respuesta no-JSON (${res.status}): ${text.slice(0, 200)}...`)
  }
  return res.json()
}

// Detect backend capability and fetch details with fallback to legacy route
const fetchDetail = async () => {
  try {
    let res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/detail`)
    if (res.status === 404) {
      // Fallback to legacy endpoint
      res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}`)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await parseJsonSafe(res)
    Object.assign(client, data)
    Object.assign(draft, JSON.parse(JSON.stringify(data)))
  } catch (err) {
    console.error('Error cargando detalle del cliente:', err)
    alert('No se pudo cargar el detalle del cliente. Ver consola para más información.')
  }
}

const saveOverview = async () => {
  try {
    const payload = {
      email: draft.email,
      phone: draft.phone,
      company: draft.company,
      tags: draft.tags,
      profile: draft.profile,
      // Persist arrays if backend ya soporta; si no, serán ignoradas sin romper
      preferences: draft.preferences,
      customFields: draft.customFields
    }

    let res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/detail`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.status === 404) {
      // Fallback a endpoint legacy PUT /clients/:id
      res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await parseJsonSafe(res)
    Object.assign(client, data)
    Object.assign(draft, JSON.parse(JSON.stringify(data)))
    editOverview.value = false
  } catch (err) {
    console.error('Error guardando cambios:', err)
    alert('No se pudieron guardar los cambios. Ver consola para más información.')
  }
}

const addTag = () => {
  const v = newTag.value.trim()
  if (!v) return
  draft.tags = [...(draft.tags || []), v]
  newTag.value = ''
}

// Notes
const sortedNotes = computed(() => (client.notes || []).slice().sort((a:any,b:any)=>{
  if (a.pinned && !b.pinned) return -1
  if (!a.pinned && b.pinned) return 1
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}))

const addNote = async () => {
  const content = newNote.value.trim()
  if (!content) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const note = await parseJsonSafe(res)
    client.notes = [note, ...(client.notes || [])]
    newNote.value = ''
  } catch (err) {
    console.error('Error agregando nota:', err)
    alert('No se pudo agregar la nota. Ver consola para más información.')
  }
}

const togglePin = async (n:any) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/notes/${n._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pinned: !n.pinned })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const upd = await parseJsonSafe(res)
    Object.assign(n, upd)
  } catch (err) {
    console.error('Error actualizando nota:', err)
    alert('No se pudo actualizar la nota. Ver consola para más información.')
  }
}

const deleteNote = async (noteId:string) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/notes/${noteId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    client.notes = (client.notes || []).filter((n:any)=>n._id!==noteId)
  } catch (err) {
    console.error('Error eliminando nota:', err)
    alert('No se pudo eliminar la nota. Ver consola para más información.')
  }
}

// Services (inline)
const serviceName = ref('')
const servicePlan = ref('')
const serviceStatus = ref<'active' | 'paused' | 'cancelled' | 'trial'>('active')
const editingServiceId = ref<string | null>(null)
const editServicePlan = ref('')
const editServiceNotes = ref('')
const editServiceStatus = ref<'active' | 'paused' | 'cancelled' | 'trial'>('active')

const createService = async () => {
  const name = serviceName.value.trim()
  if (!name) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/services`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, plan: servicePlan.value || undefined, status: serviceStatus.value })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const svc = await parseJsonSafe(res)
    client.services = [...(client.services || []), svc]
    serviceName.value = ''
    servicePlan.value = ''
    serviceStatus.value = 'active'
  } catch (err) {
    console.error('Error agregando servicio:', err)
    alert('No se pudo agregar el servicio. Ver consola para más información.')
  }
}
const startEditService = (s:any) => {
  editingServiceId.value = s._id
  editServicePlan.value = s.plan || ''
  editServiceNotes.value = s.notes || ''
  editServiceStatus.value = s.status || 'active'
}
const cancelEditService = () => {
  editingServiceId.value = null
}
const confirmEditService = async () => {
  if (!editingServiceId.value) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/services/${editingServiceId.value}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: editServicePlan.value || undefined, notes: editServiceNotes.value || undefined, status: editServiceStatus.value })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const upd = await parseJsonSafe(res)
    const idx = (client.services || []).findIndex((x:any)=>x._id===editingServiceId.value)
    if (idx !== -1) client.services[idx] = upd
    editingServiceId.value = null
  } catch (err) {
    console.error('Error editando servicio:', err)
    alert('No se pudo editar el servicio. Ver consola para más información.')
  }
}
const deleteService = async (serviceId:string) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/services/${serviceId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    client.services = (client.services || []).filter((s:any)=>s._id!==serviceId)
  } catch (err) {
    console.error('Error eliminando servicio:', err)
    alert('No se pudo eliminar el servicio. Ver consola para más información.')
  }
}

// Commitments (inline)
const commitTitle = ref('')
const commitDueDate = ref<string>('')
const commitStatus = ref<'pending'|'in_progress'|'completed'|'cancelled'>('pending')
const editingCommitmentId = ref<string | null>(null)
const editCommitDescription = ref('')
const editCommitDueDate = ref<string>('')
const editCommitStatus = ref<'pending'|'in_progress'|'completed'|'cancelled'>('pending')

const createCommitment = async () => {
  const title = commitTitle.value.trim()
  if (!title) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/commitments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        title,
        status: commitStatus.value,
        dueDate: commitDueDate.value ? new Date(commitDueDate.value).toISOString() : undefined
      })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const item = await parseJsonSafe(res)
    client.commitments = [...(client.commitments || []), item]
    commitTitle.value = ''
    commitDueDate.value = ''
    commitStatus.value = 'pending'
  } catch (err) {
    console.error('Error agregando compromiso:', err)
    alert('No se pudo agregar el compromiso. Ver consola para más información.')
  }
}
const startEditCommitment = (c:any) => {
  editingCommitmentId.value = c._id
  editCommitDescription.value = c.description || ''
  editCommitStatus.value = c.status || 'pending'
  editCommitDueDate.value = c.dueDate ? new Date(c.dueDate).toISOString().slice(0,10) : ''
}
const cancelEditCommitment = () => {
  editingCommitmentId.value = null
}
const confirmEditCommitment = async () => {
  if (!editingCommitmentId.value) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/commitments/${editingCommitmentId.value}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        description: editCommitDescription.value || undefined,
        status: editCommitStatus.value,
        dueDate: editCommitDueDate.value ? new Date(editCommitDueDate.value).toISOString() : undefined
      })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const upd = await parseJsonSafe(res)
    const idx = (client.commitments || []).findIndex((x:any)=>x._id===editingCommitmentId.value)
    if (idx !== -1) client.commitments[idx] = upd
    editingCommitmentId.value = null
  } catch (err) {
    console.error('Error editando compromiso:', err)
    alert('No se pudo editar el compromiso. Ver consola para más información.')
  }
}
const deleteCommitment = async (commitmentId:string) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/commitments/${commitmentId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    client.commitments = (client.commitments || []).filter((c:any)=>c._id!==commitmentId)
  } catch (err) {
    console.error('Error eliminando compromiso:', err)
    alert('No se pudo eliminar el compromiso. Ver consola para más información.')
  }
}

// Preferences (fix persist)
const addPreference = async () => {
  const key = newPrefKey.value.trim(); const value = newPrefValue.value.trim();
  if (!key) return
  // update draft (source of truth for saveOverview)
  draft.preferences = [...(draft.preferences || []), { key, value }]
  // optimistic UI
  client.preferences = JSON.parse(JSON.stringify(draft.preferences))
  newPrefKey.value = ''; newPrefValue.value = ''
  await saveOverview()
}
const removePreference = async (pref:any) => {
  const next = (draft.preferences || []).filter((p:any)=> (p._id && pref._id) ? p._id !== pref._id : p.key !== pref.key)
  draft.preferences = next
  client.preferences = JSON.parse(JSON.stringify(next))
  await saveOverview()
}

// Custom Fields (fix persist)
const addCustomField = async () => {
  const key = newFieldKey.value.trim(); const value = newFieldValue.value
  if (!key) return
  draft.customFields = [...(draft.customFields || []), { key, value }]
  client.customFields = JSON.parse(JSON.stringify(draft.customFields))
  newFieldKey.value=''; newFieldValue.value=''
  await saveOverview()
}
const removeCustomField = async (cf:any) => {
  const next = (draft.customFields || []).filter((f:any)=> (f._id && cf._id) ? f._id !== cf._id : f.key !== cf.key)
  draft.customFields = next
  client.customFields = JSON.parse(JSON.stringify(next))
  await saveOverview()
}

const formatDate = (d?: string|Date) => d ? new Date(d).toLocaleString('es-ES') : '—'

onMounted(fetchDetail)
</script>

<style scoped>
</style>
