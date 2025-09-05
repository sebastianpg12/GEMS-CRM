import { defineStore } from 'pinia'
import axios from 'axios'
import type { Activity, ActivityForm } from '../types'

const API_BASE_URL = 'http://localhost:4000/api'

// Actividades Store
export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: [] as Activity[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchActivities() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/activities`)
        this.activities = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching activities'
        console.error('Error fetching activities:', error)
      } finally {
        this.loading = false
      }
    },
    
    async createActivity(activityData: ActivityForm) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/activities`, activityData)
        this.activities.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating activity'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateActivity(activityId: string, activityData: Partial<ActivityForm>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/activities/${activityId}`, activityData)
        const index = this.activities.findIndex(a => a._id === activityId)
        if (index !== -1) {
          this.activities[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating activity'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteActivity(activityId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/activities/${activityId}`)
        this.activities = this.activities.filter(a => a._id !== activityId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting activity'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
