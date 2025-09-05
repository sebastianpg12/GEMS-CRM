import { API_CONFIG } from '../config/api'

export interface ClientData {
  _id?: string
  name: string
  email: string
  phone?: string
  company?: string
  status?: 'active' | 'inactive' | 'prospect'
  address?: string
  createdAt?: string
  updatedAt?: string
}

class ClientService {
  private baseUrl = API_CONFIG.BASE_URL
  private endpoint = '/clients'

  async getAll(): Promise<ClientData[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching clients:', error)
      throw new Error('No se pudieron cargar los clientes')
    }
  }

  async getById(id: string): Promise<ClientData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching client:', error)
      throw new Error('No se pudo cargar el cliente')
    }
  }

  async create(clientData: Omit<ClientData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ClientData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating client:', error)
      throw new Error('No se pudo crear el cliente')
    }
  }

  async update(id: string, clientData: Partial<ClientData>): Promise<ClientData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating client:', error)
      throw new Error('No se pudo actualizar el cliente')
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      throw new Error('No se pudo eliminar el cliente')
    }
  }

  async search(query: string): Promise<ClientData[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error searching clients:', error)
      throw new Error('No se pudo realizar la búsqueda')
    }
  }
}

export const clientService = new ClientService()
