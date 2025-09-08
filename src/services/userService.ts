interface UserProfileData {
  name: string
  email: string
  phone?: string
  department?: string
  photo?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

interface UpdateProfileData {
  name: string
  email: string
  phone?: string | null
  department?: string | null
}

interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
}

class UserService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  private endpoint = '/api/auth'

  async getProfile(): Promise<UserProfileData> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}${this.endpoint}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Error getting profile:', error)
      throw error
    }
  }

  async updateProfile(profileData: UpdateProfileData): Promise<UserProfileData> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}${this.endpoint}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  async updatePassword(passwordData: UpdatePasswordData): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}${this.endpoint}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  async uploadPhoto(file: File): Promise<string> {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`${this.baseUrl}${this.endpoint}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.photoUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  }
}

export const userService = new UserService()
export type { UserProfileData, UpdateProfileData, UpdatePasswordData }
