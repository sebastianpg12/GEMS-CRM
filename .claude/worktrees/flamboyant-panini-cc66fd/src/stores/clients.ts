import { defineStore } from 'pinia'
import axios from 'axios'
import type { Client, ClientForm } from '../types'
import { API_CONFIG } from '@/config/api'

const API_BASE_URL = API_CONFIG.BASE_URL

// Cliente Store
export const useClientsStore = defineStore('clients', {
  state: () => ({
    clients: [] as Client[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchClients() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/clients`)
        this.clients = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching clients'
        console.error('Error fetching clients:', error)
      } finally {
        this.loading = false
      }
    },
    
    async createClient(clientData: ClientForm) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/clients`, clientData)
        this.clients.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating client'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateClient(clientId: string, clientData: Partial<ClientForm>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/clients/${clientId}`, clientData)
        const index = this.clients.findIndex(c => c._id === clientId)
        if (index !== -1) {
          this.clients[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating client'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteClient(clientId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/clients/${clientId}`)
        this.clients = this.clients.filter(c => c._id !== clientId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting client'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
