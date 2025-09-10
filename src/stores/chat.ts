import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import chatService from '../services/chatService'
import type { Chat, ChatMessage, ChatUser, ChatTab, TypingStatus } from '../types/chat'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  // State
  const chats = ref<Chat[]>([])
  const activeTabs = ref<ChatTab[]>([])
  const messages = ref<Record<string, ChatMessage[]>>({})
  const users = ref<ChatUser[]>([])
  const typingUsers = ref<Record<string, TypingStatus[]>>({})
  const isConnected = ref(false)
  const isLoading = ref(false)
  const showChatWidget = ref(false)
  const unreadTotal = ref(0)

  const authStore = useAuthStore()

  // Getters
  const sortedChats = computed(() => {
    return chats.value.sort((a, b) => {
      // Primero los pinned
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Luego por fecha del último mensaje
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0
      return bTime - aTime
    })
  })

  const activeTab = computed(() => {
    return activeTabs.value.find(tab => tab.isActive)
  })

  const minimizedTabs = computed(() => {
    return activeTabs.value.filter(tab => tab.isMinimized)
  })

  const visibleTabs = computed(() => {
    return activeTabs.value.filter(tab => !tab.isMinimized)
  })

  // Actions
  const initialize = async () => {
    if (!authStore.token) return

    try {
      isLoading.value = true
      
      // Conectar WebSocket
      const socket = chatService.connect(authStore.token)
      
      socket.on('connect', () => {
        isConnected.value = true
        console.log('Chat conectado')
      })
      
      socket.on('disconnect', () => {
        isConnected.value = false
        console.log('Chat desconectado')
      })
      
      // Configurar event listeners
      setupEventListeners()
      
      // Cargar datos iniciales
      await loadChats()
      await loadUsers()
      
    } catch (error) {
      console.error('Error initializing chat:', error)
    } finally {
      isLoading.value = false
    }
  }

  const setupEventListeners = () => {
    chatService.onNewMessage((message) => {
      addMessageToChat(message)
      updateChatLastMessage(message.chatId, message)
      
      // Si no es del usuario actual, incrementar contador
      if (message.senderId !== authStore.user?._id) {
        incrementUnreadCount(message.chatId)
      }
    })

    chatService.onChatUpdated((chat) => {
      const index = chats.value.findIndex(c => c._id === chat._id)
      if (index !== -1) {
        chats.value[index] = chat
      } else {
        chats.value.push(chat)
      }
    })

    chatService.onUserTyping((typing) => {
      updateTypingStatus(typing)
    })

    chatService.onUserOnlineStatus(({ userId, isOnline }) => {
      const user = users.value.find(u => u._id === userId)
      if (user) {
        user.isOnline = isOnline
        if (!isOnline) {
          user.lastSeen = new Date().toISOString()
        }
      }
    })
  }

  const loadChats = async () => {
    try {
      const loadedChats = await chatService.getChats()
      chats.value = loadedChats
      
      // Calcular total de no leídos
      unreadTotal.value = loadedChats.reduce((total, chat) => total + chat.unreadCount, 0)
      
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  const loadUsers = async () => {
    try {
      users.value = await chatService.getAvailableUsers()
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      if (!messages.value[chatId]) {
        messages.value[chatId] = []
      }
      
      const chatMessages = await chatService.getChatMessages(chatId)
      messages.value[chatId] = chatMessages
      
      return chatMessages
    } catch (error) {
      console.error('Error loading messages:', error)
      return []
    }
  }

  const sendMessage = async (chatId: string, content: string, type = 'text', replyTo?: string) => {
    try {
      const message = await chatService.sendMessage(chatId, content, type, replyTo)
      addMessageToChat(message)
      updateChatLastMessage(chatId, message)
      
      return message
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const createDirectChat = async (userId: string) => {
    try {
      // Verificar si ya existe un chat directo
      const existingChat = chats.value.find(chat => 
        chat.type === 'direct' && 
        chat.participants.some(p => p._id === userId)
      )
      
      if (existingChat) {
        return existingChat
      }
      
      const chat = await chatService.createDirectChat(userId)
      chats.value.push(chat)
      return chat
    } catch (error) {
      console.error('Error creating direct chat:', error)
      throw error
    }
  }

  const createGroupChat = async (name: string, description: string, participantIds: string[]) => {
    try {
      const chat = await chatService.createGroupChat(name, description, participantIds)
      chats.value.push(chat)
      return chat
    } catch (error) {
      console.error('Error creating group chat:', error)
      throw error
    }
  }

  const openChatTab = async (chat: Chat) => {
    // Verificar si ya existe una pestaña para este chat
    const existingTab = activeTabs.value.find(tab => tab.chatId === chat._id)
    
    if (existingTab) {
      // Activar pestaña existente
      setActiveTab(existingTab.id)
      if (existingTab.isMinimized) {
        existingTab.isMinimized = false
      }
    } else {
      // Crear nueva pestaña
      const newTab: ChatTab = {
        id: `tab-${Date.now()}`,
        chatId: chat._id,
        chat,
        isActive: true,
        isMinimized: false,
        position: activeTabs.value.length
      }
      
      // Desactivar otras pestañas
      activeTabs.value.forEach(tab => tab.isActive = false)
      
      // Agregar nueva pestaña
      activeTabs.value.push(newTab)
      
      // Cargar mensajes del chat
      await loadChatMessages(chat._id)
      
      // Unirse al chat room
      chatService.joinChat(chat._id)
      
      // Marcar como leído
      await markChatAsRead(chat._id)
    }
    
    showChatWidget.value = true
  }

  const closeChatTab = (tabId: string) => {
    const tabIndex = activeTabs.value.findIndex(tab => tab.id === tabId)
    if (tabIndex === -1) return
    
    const tab = activeTabs.value[tabIndex]
    
    // Salir del chat room
    chatService.leaveChat(tab.chatId)
    
    // Remover pestaña
    activeTabs.value.splice(tabIndex, 1)
    
    // Si era la pestaña activa, activar otra
    if (tab.isActive && activeTabs.value.length > 0) {
      activeTabs.value[Math.max(0, tabIndex - 1)].isActive = true
    }
    
    // Si no hay pestañas, ocultar widget
    if (activeTabs.value.length === 0) {
      showChatWidget.value = false
    }
  }

  const setActiveTab = (tabId: string) => {
    activeTabs.value.forEach(tab => {
      tab.isActive = tab.id === tabId
    })
  }

  const minimizeTab = (tabId: string) => {
    const tab = activeTabs.value.find(tab => tab.id === tabId)
    if (tab) {
      tab.isMinimized = true
      tab.isActive = false
      
      // Activar otra pestaña si es necesario
      const nextTab = activeTabs.value.find(t => !t.isMinimized && t.id !== tabId)
      if (nextTab) {
        nextTab.isActive = true
      }
    }
  }

  const markChatAsRead = async (chatId: string) => {
    try {
      await chatService.markAsRead(chatId)
      
      // Actualizar contador local
      const chat = chats.value.find(c => c._id === chatId)
      if (chat) {
        unreadTotal.value -= chat.unreadCount
        chat.unreadCount = 0
      }
      
      // Marcar mensajes como leídos
      if (messages.value[chatId]) {
        messages.value[chatId].forEach(message => {
          if (message.senderId !== authStore.user?._id) {
            message.isRead = true
          }
        })
      }
    } catch (error) {
      console.error('Error marking chat as read:', error)
    }
  }

  const startTyping = (chatId: string) => {
    chatService.emitTyping(chatId, true)
  }

  const stopTyping = (chatId: string) => {
    chatService.emitTyping(chatId, false)
  }

  // Helper functions
  const addMessageToChat = (message: ChatMessage) => {
    if (!messages.value[message.chatId]) {
      messages.value[message.chatId] = []
    }
    messages.value[message.chatId].push(message)
  }

  const updateChatLastMessage = (chatId: string, message: ChatMessage) => {
    const chat = chats.value.find(c => c._id === chatId)
    if (chat) {
      chat.lastMessage = message
      chat.updatedAt = message.timestamp
    }
  }

  const incrementUnreadCount = (chatId: string) => {
    const chat = chats.value.find(c => c._id === chatId)
    if (chat) {
      chat.unreadCount++
      unreadTotal.value++
    }
  }

  const updateTypingStatus = (typing: TypingStatus) => {
    if (!typingUsers.value[typing.chatId]) {
      typingUsers.value[typing.chatId] = []
    }
    
    const existingIndex = typingUsers.value[typing.chatId].findIndex(
      t => t.userId === typing.userId
    )
    
    if (typing.isTyping) {
      if (existingIndex === -1) {
        typingUsers.value[typing.chatId].push(typing)
      } else {
        typingUsers.value[typing.chatId][existingIndex] = typing
      }
    } else {
      if (existingIndex !== -1) {
        typingUsers.value[typing.chatId].splice(existingIndex, 1)
      }
    }
  }

  const disconnect = () => {
    chatService.disconnect()
    isConnected.value = false
    chats.value = []
    activeTabs.value = []
    messages.value = {}
    users.value = []
    typingUsers.value = {}
    showChatWidget.value = false
    unreadTotal.value = 0
  }

  const toggleChatWidget = () => {
    showChatWidget.value = !showChatWidget.value
  }

  return {
    // State
    chats,
    activeTabs,
    messages,
    users,
    typingUsers,
    isConnected,
    isLoading,
    showChatWidget,
    unreadTotal,
    
    // Getters
    sortedChats,
    activeTab,
    minimizedTabs,
    visibleTabs,
    
    // Actions
    initialize,
    loadChats,
    loadUsers,
    loadChatMessages,
    sendMessage,
    createDirectChat,
    createGroupChat,
    openChatTab,
    closeChatTab,
    setActiveTab,
    minimizeTab,
    markChatAsRead,
    startTyping,
    stopTyping,
    disconnect,
    toggleChatWidget
  }
})
