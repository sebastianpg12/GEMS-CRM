import axios from 'axios'
import type { LoginCredentials, User } from '../stores/auth'
import { API_CONFIG } from '@/config/api'

// Configuration
const API_BASE_URL = API_CONFIG.BASE_URL

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔗 Making login request to:', `${apiClient.defaults.baseURL}/auth/login`)
      console.log('📤 Credentials:', credentials)
      
      const response = await apiClient.post('/auth/login', credentials)
      
      console.log('📥 Backend response:', response.data)
      console.log('📊 Response status:', response.status)
      
      if (response.data.success) {
        console.log('✅ Login successful, processing data:', response.data.data)
        return {
          success: true,
          user: response.data.data.user,  // Los datos están en response.data.data
          token: response.data.data.token
        }
      } else {
        console.log('❌ Login failed from backend:', response.data)
        return {
          success: false,
          message: response.data.message || 'Credenciales inválidas'
        }
      }
    } catch (error: any) {
      console.error('❌ Login error details:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error data:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        }
      }
      
      return {
        success: false,
        message: 'Error de conexión. Verifique que el servidor esté funcionando.'
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  async verifyToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/verify-token')
      return {
        success: response.data.success,
        user: response.data.user
      }
    } catch (error) {
      return { success: false }
    }
  },

  async updateProfile(profileData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await apiClient.put('/auth/profile', profileData)
      
      return {
        success: response.data.success,
        user: response.data.user,
        message: response.data.message
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar perfil'
      }
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.put('/auth/change-password', {
        oldPassword,
        newPassword
      })
      
      return {
        success: response.data.success,
        message: response.data.message
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cambiar contraseña'
      }
    }
  },

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      
      return {
        success: response.data.success,
        message: response.data.message
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al solicitar restablecimiento'
      }
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      })
      
      return {
        success: response.data.success,
        message: response.data.message
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al restablecer contraseña'
      }
    }
  }
}

export default apiClient
