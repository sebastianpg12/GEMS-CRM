import { API_CONFIG } from '../config/api'

export interface Transaction {
  _id?: string
  fecha: string
  tipo: 'ingreso' | 'egreso'
  concepto: string
  monto: number
  cliente_id?: string
  metodo?: string
  es_recurrente?: boolean
  frecuencia?: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  proximo_pago?: string
  activo?: boolean
  estado_pago?: 'pendiente' | 'pagado' | 'vencido'
  createdAt?: string
  updatedAt?: string
}

export interface FixedExpense {
  _id?: string
  nombre: string
  monto_mensual: number
  activo: boolean
}

class AccountingService {
  private baseUrl = `${API_CONFIG.BASE_URL}/accounting`

  // TRANSACTIONS
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  async createTransaction(transaction: Omit<Transaction, '_id'>): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  // FIXED EXPENSES
  async getAllFixedExpenses(): Promise<FixedExpense[]> {
    try {
      const response = await fetch(`${this.baseUrl}/fixed-expenses`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching fixed expenses:', error)
      throw error
    }
  }

  async createFixedExpense(expense: Omit<FixedExpense, '_id'>): Promise<FixedExpense> {
    try {
      const response = await fetch(`${this.baseUrl}/fixed-expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error creating fixed expense:', error)
      throw error
    }
  }

  async updateFixedExpense(id: string, expense: Partial<FixedExpense>): Promise<FixedExpense> {
    try {
      const response = await fetch(`${this.baseUrl}/fixed-expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error updating fixed expense:', error)
      throw error
    }
  }

  async deleteFixedExpense(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/fixed-expenses/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting fixed expense:', error)
      throw error
    }
  }

  // RECURRING PAYMENTS
  async getRecurringPayments(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recurring-payments`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching recurring payments:', error)
      throw error
    }
  }

  async markPaymentAsPaid(id: string): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${id}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error marking payment as paid:', error)
      throw error
    }
  }

  // SUMMARY
  async getSummary(startDate?: string, endDate?: string): Promise<{
    ingresos: number
    egresos: number
    balance: number
    gastos_fijos_mensuales: number
    pagos_pendientes: Transaction[]
  }> {
    try {
      let url = `${this.baseUrl}/summary`
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching summary:', error)
      throw error
    }
  }
}

export const accountingService = new AccountingService()
