import { defineStore } from 'pinia'
import axios from 'axios'
import type { Activity, ActivityForm } from '../types'
import { API_CONFIG } from '@/config/api'


import { defineStore } from 'pinia'
import axios from 'axios'
import { API_CONFIG } from '@/config/api'

const API_BASE_URL = API_CONFIG.BASE_URL

export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: [],
    loading: false,
    error: null
  }),
  actions: {
    fetchActivities(filters) {
      this.loading = true;
      let url = `${API_BASE_URL}/activities`;
      if (filters && (filters.assignedTo || filters.status)) {
        const params = new URLSearchParams();
        if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
        if (filters.status) params.append('status', filters.status);
        url += `?${params.toString()}`;
      }
      return axios.get(url)
        .then(response => {
          this.activities = response.data;
          this.error = null;
        })
        .catch(error => {
          this.error = error.message || 'Error fetching activities';
          console.error('Error fetching activities:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    fetchMyPendingActivities() {
      this.loading = true;
      return axios.get(`${API_BASE_URL}/activities/mine`)
        .then(response => {
          this.activities = response.data;
          this.error = null;
        })
        .catch(error => {
          this.error = error.message || 'Error fetching my pending activities';
          console.error('Error fetching my pending activities:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    createActivity(activityData) {
      this.loading = true;
      return axios.post(`${API_BASE_URL}/activities`, activityData)
        .then(response => {
          this.activities.push(response.data);
          this.error = null;
          return response.data;
        })
        .catch(error => {
          this.error = error.message || 'Error creating activity';
          throw error;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateActivity(activityId, activityData) {
      this.loading = true;
      return axios.put(`${API_BASE_URL}/activities/${activityId}`, activityData)
        .then(response => {
          const index = this.activities.findIndex(a => a._id === activityId);
          if (index !== -1) {
            this.activities[index] = response.data;
          }
          this.error = null;
          return response.data;
        })
        .catch(error => {
          this.error = error.message || 'Error updating activity';
          throw error;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    deleteActivity(activityId) {
      this.loading = true;
      return axios.delete(`${API_BASE_URL}/activities/${activityId}`)
        .then(() => {
          this.activities = this.activities.filter(a => a._id !== activityId);
          this.error = null;
        })
        .catch(error => {
          this.error = error.message || 'Error deleting activity';
          throw error;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
})
            },
            deleteActivity(activityId) {
              this.loading = true;
              return axios.delete(`${API_BASE_URL}/activities/${activityId}`)
                .then(() => {
                  this.activities = this.activities.filter(a => a._id !== activityId);
                  this.error = null;
                })
                .catch(error => {
                  this.error = error.message || 'Error deleting activity';
                  throw error;
                })
                .finally(() => {
                  this.loading = false;
                });
            }
          }
