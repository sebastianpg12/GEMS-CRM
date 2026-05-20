export interface ChatUser {
  _id: string
  name: string
  email: string
  photo?: string
  isOnline?: boolean
  lastSeen?: string
}

export interface ChatMessage {
  _id: string
  senderId: string
  senderName: string
  senderPhoto?: string
  chatId: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  timestamp: string
  isRead: boolean
  editedAt?: string
  replyTo?: string // ID del mensaje al que responde
}

export interface Chat {
  _id: string
  type: 'direct' | 'group' | 'team' | 'general'
  name?: string // Solo para grupos personalizados
  description?: string
  participants: ChatUser[]
  lastMessage?: ChatMessage
  unreadCount: number
  isArchived: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  teamId?: string // Para chats de equipo específico
}

export interface ChatTab {
  id: string
  chatId: string
  chat: Chat
  isActive: boolean
  isMinimized: boolean
  position: number
}

export interface TypingStatus {
  chatId: string
  userId: string
  userName: string
  isTyping: boolean
}
