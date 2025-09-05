// Tipos para el CRM
export interface Client {
  _id?: string
  name: string
  email: string
  phone: string
  company: string
  createdAt?: string
  updatedAt?: string
}

export interface Activity {
  _id?: string
  title: string
  description: string
  date: string
  status: 'pending' | 'completed' | 'cancelled'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Payment {
  _id?: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Followup {
  _id?: string
  title: string
  description: string
  date: string
  status: 'pending' | 'completed' | 'cancelled'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Issue {
  _id?: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Notification {
  _id?: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success' | 'payment_reminder'
  status: 'read' | 'unread'
  clientId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Document {
  _id?: string
  title: string
  type: 'contract' | 'invoice' | 'proposal' | 'other'
  url: string
  status: 'active' | 'expired' | 'archived'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Minute {
  _id?: string
  title: string
  content: string
  date: string
  attendees: string[]
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Setting {
  _id?: string
  key: string
  value: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json'
  createdAt?: string
  updatedAt?: string
}

export interface TeamMember {
  _id?: string
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// Tipos para formularios
export interface ClientForm {
  name: string
  email: string
  phone: string
  company: string
}

export interface ActivityForm {
  title: string
  description: string
  date: string
  status: Activity['status']
  clientId: string
}

export interface PaymentForm {
  amount: number
  dueDate: string
  status: Payment['status']
  clientId: string
}

// Tipos para estados de los stores
export interface StoreState<T> {
  items: T[]
  loading: boolean
  error: string | null
}
