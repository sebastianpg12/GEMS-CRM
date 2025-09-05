import { defineStore } from 'pinia'
import axios from 'axios'
import type { Followup } from '../types'

const API_BASE_URL = 'http://localhost:4000/api'

export const useFollowupsStore = defineStore('followups', {
  state: () => ({
    followups: [] as Followup[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchFollowups() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/followups`)
        this.followups = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching followups'
      } finally {
        this.loading = false
      }
    },
    
    async createFollowup(followupData: Partial<Followup>) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/followups`, followupData)
        this.followups.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating followup'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateFollowup(followupId: string, followupData: Partial<Followup>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/followups/${followupId}`, followupData)
        const index = this.followups.findIndex(f => f._id === followupId)
        if (index !== -1) {
          this.followups[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating followup'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteFollowup(followupId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/followups/${followupId}`)
        this.followups = this.followups.filter(f => f._id !== followupId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting followup'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
