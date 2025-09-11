import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import chatService, { type ChatRoom, type Message, type User } from '../services/chatService'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  // State
  const chatRooms = ref<ChatRoom[]>([])
  const messages = ref<{ [roomId: string]: Message[] }>({})
  const currentRoom = ref<ChatRoom | null>(null)
  const users = ref<User[]>([])
  const typingUsers = ref<{ [roomId: string]: string[] }>({})
  const isConnected = ref(false)
  const isLoading = ref(false)
  // Notification metadata for incoming messages
  const lastIncomingAt = ref<number | null>(null)
  const lastIncomingRoomId = ref<string | null>(null)
  
  // Getters
  const getCurrentMessages = computed(() => {
    return currentRoom.value ? messages.value[currentRoom.value._id] || [] : []
  })
  
  const getUnreadCount = computed(() => {
    const authStore = useAuthStore()
    const currentUserId = authStore.user?._id
    
    if (!currentUserId) return 0
    
    let totalUnread = 0
    
    chatRooms.value.forEach(room => {
      const roomMessages = messages.value[room._id] || []
      const unread = roomMessages.filter(msg => 
        msg.sender._id !== currentUserId && 
        !msg.readBy.some(read => read.user === currentUserId)
      ).length
      totalUnread += unread
    })
    
    return totalUnread
  })
  
  const getTypingInRoom = computed(() => (roomId: string) => {
    return typingUsers.value[roomId] || []
  })
  
  // Actions
  const initializeChat = async () => {
    const authStore = useAuthStore()
    const token = localStorage.getItem('token')
    const userId = authStore.user?._id
    
    if (!token || !userId) return
    
    try {
      // Connect to socket
      const socket = chatService.connect(token, userId)
      
      socket.on('connect', () => {
        isConnected.value = true
      })
      
      socket.on('disconnect', () => {
        isConnected.value = false
      })
      
      // Set up event listeners
      setupSocketListeners()
      
      // Load initial data
      await Promise.all([
        loadChatRooms(),
        loadUsers()
      ])
      
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  }
  
  const setupSocketListeners = () => {
    chatService.onNewMessage((message: Message) => {
      addMessage(message)
    })
    
    chatService.onRoomCreated((room: ChatRoom) => {
      chatRooms.value.push(room)
    })
    
    chatService.onRoomDeleted((roomId: string) => {
      chatRooms.value = chatRooms.value.filter(room => room._id !== roomId)
      if (currentRoom.value?._id === roomId) {
        currentRoom.value = null
      }
    })
    
    chatService.onMessageEdited((message: Message) => {
      const roomMessages = messages.value[message.chatRoom]
      if (roomMessages) {
        const index = roomMessages.findIndex(msg => msg._id === message._id)
        if (index !== -1) {
          roomMessages[index] = message
        }
      }
    })
    
    chatService.onUserTyping((data) => {
      const { userName, roomId } = data
      if (!typingUsers.value[roomId]) {
        typingUsers.value[roomId] = []
      }
      if (!typingUsers.value[roomId].includes(userName)) {
        typingUsers.value[roomId].push(userName)
      }
    })
    
    chatService.onUserStopTyping((data) => {
      const { roomId } = data
      const authStore = useAuthStore()
      const currentUserName = authStore.user?.name
      
      if (typingUsers.value[roomId] && currentUserName) {
        typingUsers.value[roomId] = typingUsers.value[roomId].filter(name => name !== currentUserName)
      }
    })
  }
  
  const loadChatRooms = async () => {
    try {
      isLoading.value = true
      const rooms = await chatService.getChatRooms()
      chatRooms.value = rooms
      
      // Load recent messages for each room
      await Promise.all(
        rooms.map(room => loadMessages(room._id))
      )
    } catch (error) {
      console.error('Error loading chat rooms:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const loadMessages = async (roomId: string, page = 1) => {
    try {
      const roomMessages = await chatService.getMessages(roomId, page)
      if (!messages.value[roomId]) {
        messages.value[roomId] = []
      }
      
      if (page === 1) {
        messages.value[roomId] = roomMessages
      } else {
        messages.value[roomId] = [...roomMessages, ...messages.value[roomId]]
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }
  
  const loadUsers = async () => {
    try {
      const availableUsers = await chatService.getUsers()
      users.value = availableUsers
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }
  
  const createChatRoom = async (roomData: {
    name: string
    description?: string
    participants: string[]
    type?: 'team' | 'direct' | 'group'
  }) => {
    try {
      const room = await chatService.createChatRoom(roomData)
      chatRooms.value.push(room)
      return room
    } catch (error) {
      console.error('Error creating chat room:', error)
      throw error
    }
  }
  
  const selectRoom = async (room: ChatRoom) => {
    if (currentRoom.value) {
      chatService.leaveRoom(currentRoom.value._id)
    }
    
    currentRoom.value = room
    chatService.joinRoom(room._id)
    
    // Load messages if not loaded
    if (!messages.value[room._id]) {
      await loadMessages(room._id)
    }
    
    // Mark messages as read
    const authStore = useAuthStore()
    const currentUserId = authStore.user?._id
    
    if (currentUserId) {
      const unreadMessages = messages.value[room._id]?.filter(msg => 
        msg.sender._id !== currentUserId && 
        !msg.readBy.some(read => read.user === currentUserId)
      ) || []
      
      // Mark each unread message as read
      for (const message of unreadMessages) {
        await chatService.markMessageAsRead(message._id)
      }
    }
  }
  
  const sendMessage = async (content: string, files?: File[], replyTo?: string) => {
    if (!currentRoom.value || !content.trim()) return

    try {
      const message = await chatService.sendMessage(
        currentRoom.value._id,
        { content: content.trim(), replyTo },
        files
      )
      
      // Don't add message here - it will come from socket
      return message
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }
  
  const addMessage = (message: Message) => {
    if (!messages.value[message.chatRoom]) {
      messages.value[message.chatRoom] = []
    }
    
    // Check if message already exists (prevent duplicates)
    const exists = messages.value[message.chatRoom].some(msg => msg._id === message._id)
    if (!exists) {
      messages.value[message.chatRoom].push(message)
    }
    
    // Update room's last activity
    const room = chatRooms.value.find(r => r._id === message.chatRoom)
    if (room) {
      room.lastActivity = message.createdAt
      // Move room to top of list
      chatRooms.value = chatRooms.value.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      )
    }

    // Mark new incoming for notifications if it's from another user
    const authStore = useAuthStore()
    const currentUserId = authStore.user?._id
    if (message.sender._id !== currentUserId) {
      lastIncomingAt.value = Date.now()
      lastIncomingRoomId.value = message.chatRoom
    }
  }
  
  const editMessage = async (messageId: string, content: string) => {
    if (!content.trim()) return

    try {
      const message = await chatService.editMessage(messageId, content.trim())
      
      // Update message in current room messages
      if (currentRoom.value) {
        const roomMessages = messages.value[currentRoom.value._id]
        if (roomMessages) {
          const index = roomMessages.findIndex(msg => msg._id === messageId)
          if (index !== -1) {
            roomMessages[index] = message
          }
        }
      }
      
      return message
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  }
  
  const deleteChatRoom = async (roomId: string) => {
    try {
      await chatService.deleteChatRoom(roomId)
      chatRooms.value = chatRooms.value.filter(room => room._id !== roomId)
      if (currentRoom.value?._id === roomId) {
        currentRoom.value = null
      }
    } catch (error) {
      console.error('Error deleting chat room:', error)
      throw error
    }
  }
  
  const startTyping = () => {
    if (currentRoom.value) {
      const authStore = useAuthStore()
      const userId = authStore.user?._id
      const userName = authStore.user?.name
      
      if (userId && userName) {
        chatService.startTyping(currentRoom.value._id, userId, userName)
      }
    }
  }
  
  const stopTyping = () => {
    if (currentRoom.value) {
      const authStore = useAuthStore()
      const userId = authStore.user?._id
      
      if (userId) {
        chatService.stopTyping(currentRoom.value._id, userId)
      }
    }
  }
  
  const disconnect = () => {
    chatService.disconnect()
    isConnected.value = false
  }
  
  return {
    // State
    chatRooms,
    messages,
    currentRoom,
    users,
    typingUsers,
    isConnected,
    isLoading,
  lastIncomingAt,
  lastIncomingRoomId,
    
    // Getters
    getCurrentMessages,
    getUnreadCount,
    getTypingInRoom,
    
    // Actions
    initializeChat,
    loadChatRooms,
    loadMessages,
    loadUsers,
    createChatRoom,
    selectRoom,
    sendMessage,
    editMessage,
    deleteChatRoom,
    startTyping,
    stopTyping,
    disconnect
  }
})
