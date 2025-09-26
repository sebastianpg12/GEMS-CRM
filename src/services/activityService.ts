import { API_CONFIG } from '../config/api'

export interface ActivityData {
  _id?: string
  title: string
  description: string
  date: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue'
  clientId: string
  assignedTo?: string[]
  assignedToUser?: {
    _id: string
    name: string
    email: string
    role: string
  }
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  estimatedTime?: string
  createdBy?: string
  createdByUser?: {
    _id: string
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface ActivityWithClient extends ActivityData {
  client?: {
    _id: string
    name: string
    email: string
    company?: string
  }
}

class ActivityService {
  private baseUrl = API_CONFIG.BASE_URL
  private endpoint = '/activities'

  async getAll(): Promise<ActivityData[]> {
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
      console.error('Error fetching activities:', error)
      throw new Error('No se pudieron cargar las actividades')
    }
  }

  async getById(id: string): Promise<ActivityData> {
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
      console.error('Error fetching activity:', error)
      throw new Error('No se pudo cargar la actividad')
    }
  }

  async create(activityData: Omit<ActivityData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating activity:', error)
      throw new Error('No se pudo crear la actividad')
    }
  }

  async update(id: string, activityData: Partial<ActivityData>): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating activity:', error)
      throw new Error('No se pudo actualizar la actividad')
    }
  }

  async deleteActivity(id: string): Promise<void> {
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
      console.error('Error deleting activity:', error)
      throw new Error('No se pudo eliminar la actividad')
    }
  }

  // Métodos específicos para asignaciones
  async getByAssignedUser(userId: string): Promise<ActivityData[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/assigned/${userId}`, {
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
      console.error('Error fetching assigned activities:', error)
      throw new Error('No se pudieron cargar las actividades asignadas')
    }
  }

  async getWithFilters(filters: { assignedTo?: string, status?: string }): Promise<ActivityData[]> {
    try {
      const params = new URLSearchParams()
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo)
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`${this.baseUrl}${this.endpoint}?${params.toString()}`, {
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
      console.error('Error fetching filtered activities:', error)
      throw new Error('No se pudieron cargar las actividades filtradas')
    }
  }

  async updateStatus(id: string, status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue'): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating activity status:', error)
      throw new Error('No se pudo actualizar el estado de la actividad')
    }
  }

  async reassignActivity(id: string, assignedTo: string | null): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error reassigning activity:', error)
      throw new Error('No se pudo reasignar la actividad')
    }
  }
}

export const activityService = new ActivityService()
