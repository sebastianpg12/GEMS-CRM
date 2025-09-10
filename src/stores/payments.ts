import { defineStore } from 'pinia'
import axios from 'axios'
import type { Payment, PaymentForm } from '../types'
import { API_CONFIG } from '@/config/api'

const API_BASE_URL = API_CONFIG.BASE_URL

// Pagos Store
export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    payments: [] as Payment[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchPayments() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/payments`)
        this.payments = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching payments'
        console.error('Error fetching payments:', error)
      } finally {
        this.loading = false
      }
    },
    
    async createPayment(paymentData: PaymentForm) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/payments`, paymentData)
        this.payments.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating payment'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updatePayment(paymentId: string, paymentData: Partial<PaymentForm>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/payments/${paymentId}`, paymentData)
        const index = this.payments.findIndex(p => p._id === paymentId)
        if (index !== -1) {
          this.payments[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating payment'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deletePayment(paymentId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/payments/${paymentId}`)
        this.payments = this.payments.filter(p => p._id !== paymentId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting payment'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
