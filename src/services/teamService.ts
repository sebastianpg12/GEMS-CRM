import { API_CONFIG, ENDPOINTS } from '../config/api'

export interface TeamMember {
  _id?: string
  name: string
  role: string
  email: string
  createdAt?: string
}

class TeamService {
  private baseUrl = `${API_CONFIG.BASE_URL}${ENDPOINTS.TEAM}`

  async getAll(): Promise<TeamMember[]> {
    try {
      const response = await fetch(this.baseUrl)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching team members:', error)
      throw error
    }
  }

  async create(member: Omit<TeamMember, '_id' | 'createdAt'>): Promise<TeamMember> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error creating team member:', error)
      throw error
    }
  }

  async update(id: string, member: Partial<TeamMember>): Promise<TeamMember> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error updating team member:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting team member:', error)
      throw error
    }
  }
}

export const teamService = new TeamService()
