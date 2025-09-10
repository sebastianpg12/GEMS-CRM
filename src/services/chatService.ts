import { io, Socket } from 'socket.io-client'
import { API_CONFIG } from '../config/api'

export interface ChatRoom {
  _id: string
  name: string
  description: string
  type: 'team' | 'direct' | 'group'
  participants: User[]
  admins: User[]
  createdBy: User
  isActive: boolean
  lastActivity: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  chatRoom: string
  sender: User
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  attachments: Attachment[]
  replyTo?: Message
  edited: boolean
  editedAt?: string
  deleted: boolean
  deletedAt?: string
  readBy: ReadStatus[]
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  position?: string
  department?: string
  role: string
}

export interface Attachment {
  filename: string
  originalname: string
  mimetype: string
  size: number
  path: string
  url: string
}

export interface ReadStatus {
  user: string
  readAt: string
}

class ChatService {
  private socket: Socket | null = null
  private baseUrl = API_CONFIG.BASE_URL

  // Connect to WebSocket server
  connect(token: string, userId: string) {
    if (this.socket) {
      this.socket.disconnect()
    }

    const socketUrl = this.baseUrl.replace('/api', '')
    
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Connected to chat server')
      // Join user's personal room
      this.socket?.emit('join_user_room', userId)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Get all chat rooms for current user
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener salas de chat')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting chat rooms:', error)
      throw error
    }
  }

  // Create new chat room
  async createChatRoom(roomData: {
    name: string
    description?: string
    participants: string[]
    type?: 'team' | 'direct' | 'group'
  }): Promise<ChatRoom> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      })

      if (!response.ok) {
        throw new Error('Error al crear sala de chat')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating chat room:', error)
      throw error
    }
  }

  // Get messages for a chat room
  async getMessages(roomId: string, page = 1, limit = 50): Promise<Message[]> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener mensajes')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting messages:', error)
      throw error
    }
  }

  // Send message to chat room
  async sendMessage(roomId: string, messageData: {
    content: string
    type?: 'text' | 'image' | 'file'
    replyTo?: string
  }, files?: File[]): Promise<Message> {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('content', messageData.content)
      formData.append('type', messageData.type || 'text')
      
      if (messageData.replyTo) {
        formData.append('replyTo', messageData.replyTo)
      }

      if (files) {
        files.forEach(file => {
          formData.append('files', file)
        })
      }

      const response = await fetch(`${this.baseUrl}/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al enviar mensaje')
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${this.baseUrl}/chat/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // Get users for creating chat rooms
  async getUsers(): Promise<User[]> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener usuarios')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  }

  // Delete chat room
  async deleteChatRoom(roomId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${this.baseUrl}/chat/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Error deleting chat room:', error)
      throw error
    }
  }

  // Edit message
  async editMessage(messageId: string, content: string): Promise<Message> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('Error al editar mensaje')
      }

      return await response.json()
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  }

  // Socket event listeners
  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback)
    }
  }

  onRoomCreated(callback: (room: ChatRoom) => void) {
    if (this.socket) {
      this.socket.on('room_created', callback)
    }
  }

  onRoomDeleted(callback: (roomId: string) => void) {
    if (this.socket) {
      this.socket.on('room_deleted', callback)
    }
  }

  onMessageEdited(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message_edited', callback)
    }
  }

  onUserTyping(callback: (data: { userId: string, userName: string, roomId: string }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback)
    }
  }

  onUserStopTyping(callback: (data: { userId: string, roomId: string }) => void) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback)
    }
  }

  // Socket event emitters
  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join_room', roomId)
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId)
    }
  }

  startTyping(roomId: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('typing_start', { roomId, userId, userName })
    }
  }

  stopTyping(roomId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('typing_stop', { roomId, userId })
    }
  }
}

export const chatService = new ChatService()
export default chatService
