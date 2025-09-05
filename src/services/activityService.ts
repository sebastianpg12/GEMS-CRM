import { API_CONFIG } from '../config/api'

export interface ActivityData {
  _id?: string
  title: string
  description: string
  date: string
  status: 'pending' | 'completed' | 'cancelled'
  clientId: string
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
}

export const activityService = new ActivityService()
