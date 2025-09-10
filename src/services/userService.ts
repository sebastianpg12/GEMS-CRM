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

  // Normaliza URLs de archivos: si viene '/uploads/...', la convierte a absoluta con el origen del backend
  private toAbsoluteUrl = (url?: string) => {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    // Obtener origen del backend a partir de baseUrl
    // Soporta valores como 'http://host:4000' o 'http://host:4000/api'
    let origin = this.baseUrl
    // Si incluye '/api' al final, lo removemos para apuntar al origen raíz
    origin = origin.replace(/\/?api\/?$/i, '')
    // Asegurar que tenga protocolo
    if (!/^https?:\/\//i.test(origin)) {
      origin = `http://${origin.replace(/^\/+/, '')}`
    }
    // Evitar doble slash al concatenar
    return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  }

  async getProfile(): Promise<UserProfileData> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      console.log('🌐 Llamando a API de perfil...')
      const response = await fetch(`${this.baseUrl}${this.endpoint}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Respuesta de API:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error en API:', errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Datos recibidos:', data)

      // El backend puede devolver data.user o data.data.user
      const user = data.user || data.data?.user
      if (!user) {
        throw new Error('No se recibieron datos de usuario válidos')
      }

      // Normalizar URL de foto si es relativa
      if (user.photo) {
        user.photo = this.toAbsoluteUrl(user.photo)
      }

      return user
    } catch (error) {
      console.error('❌ Error getting profile:', error)
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
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      console.log('📸 Subiendo foto:', file.name, 'Tamaño:', file.size)
      
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`${this.baseUrl}${this.endpoint}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      console.log('📡 Respuesta de subida:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error en subida:', errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

  const data = await response.json()
  console.log('📦 Respuesta de foto:', data)
      
  // Devolver URL absoluta para usarla directamente en <img>
  return this.toAbsoluteUrl(data.photoUrl)
    } catch (error) {
      console.error('❌ Error uploading photo:', error)
      throw error
    }
  }
}

export const userService = new UserService()
export type { UserProfileData, UpdateProfileData, UpdatePasswordData }
