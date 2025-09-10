<template>
  <div class="space-y-6 p-6 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Header with Glassmorphism Effect -->
    <div class="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          💬 Chat Interno
        </h1>
        <p class="text-gray-300 mt-2 text-lg">Comunícate con tu equipo en tiempo real</p>
      </div>
      <button
        @click="showCreateRoom = true"
        class="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium flex items-center space-x-3 shadow-xl hover:shadow-purple-500/25 hover:scale-105 transform"
      >
        <PlusIcon class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span>Nuevo Chat</span>
        <div class="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>

    <!-- Main Chat Interface with Enhanced Styling -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-280px)]">
      <!-- Sidebar: Chat Rooms with Glassmorphism -->
      <div class="lg:col-span-1">
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl h-full flex flex-col overflow-hidden hover:border-purple-400/50 transition-all duration-300">
          <!-- Sidebar Header with Gradient -->
          <div class="p-6 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <h2 class="text-xl font-bold text-white mb-3">💬 Conversaciones</h2>
            <!-- Enhanced Connection Status -->
            <div 
              v-if="!chatStore.isConnected"
              class="flex items-center text-yellow-400 bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/20"
            >
              <div class="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse shadow-lg shadow-yellow-400/50"></div>
              <span class="text-sm font-medium">Conectando...</span>
            </div>
            <div 
              v-else
              class="flex items-center text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg border border-emerald-400/20"
            >
              <div class="w-3 h-3 bg-emerald-400 rounded-full mr-3 shadow-lg shadow-emerald-400/50"></div>
              <span class="text-sm font-medium">Conectado</span>
            </div>
          </div>

          <!-- Chat Rooms List with Enhanced Styling -->
          <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <!-- Loading State with Spinner Animation -->
            <div v-if="chatStore.isLoading" class="flex items-center justify-center py-12">
              <div class="relative">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500 shadow-lg"></div>
                <div class="absolute inset-0 rounded-full border-4 border-purple-500/10 animate-pulse"></div>
              </div>
            </div>

            <!-- Enhanced Empty State -->
            <div v-else-if="chatStore.chatRooms.length === 0" class="text-center py-12">
              <div class="mb-6 relative">
                <ChatBubbleLeftRightIcon class="w-20 h-20 mx-auto text-purple-400/50 animate-pulse" />
                <div class="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
              </div>
              <h3 class="text-white font-bold text-lg mb-3">No hay conversaciones</h3>
              <p class="text-gray-300 text-sm mb-6 max-w-xs mx-auto">¡Crea tu primer chat y comienza a colaborar con tu equipo!</p>
              <button
                @click="showCreateRoom = true"
                class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-purple-500/25"
              >
                ✨ Crear conversación
              </button>
            </div>

            <!-- Enhanced Rooms List -->
            <div v-else class="space-y-3">
              <div
                v-for="room in chatStore.chatRooms"
                :key="room._id"
                @click="selectRoom(room)"
                class="group relative p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                :class="currentRoom?._id === room._id 
                  ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-2 border-purple-400/60 shadow-xl shadow-purple-500/25 scale-[1.02]' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 hover:shadow-lg'"
              >
                <!-- Animated Background Glow -->
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-400/5 to-pink-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="relative flex items-center">
                  <!-- Enhanced Room Icon with Animation -->
                  <div
                    class="relative w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg transition-all duration-300 group-hover:scale-110"
                    :class="room.type === 'direct' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                           : room.type === 'team' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                           : 'bg-gradient-to-br from-purple-500 to-pink-500'"
                  >
                    <UserIcon v-if="room.type === 'direct'" class="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    <UsersIcon v-else-if="room.type === 'team'" class="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    <UserGroupIcon v-else class="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    
                    <!-- Glow Effect -->
                    <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                         :class="room.type === 'direct' ? 'bg-emerald-400 blur-lg' 
                                : room.type === 'team' ? 'bg-blue-400 blur-lg' 
                                : 'bg-purple-400 blur-lg'"></div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <h3 class="text-white font-semibold truncate group-hover:text-purple-200 transition-colors">
                        {{ room.name }}
                      </h3>
                      <span class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        {{ formatTime(room.lastActivity) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <p class="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                        👥 {{ room.participants.length }} participante{{ room.participants.length !== 1 ? 's' : '' }}
                      </p>
                      <!-- Enhanced Unread Badge -->
                      <div 
                        v-if="getUnreadCount(room._id) > 0" 
                        class="relative bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-pulse"
                      >
                        {{ getUnreadCount(room._id) > 99 ? '99+' : getUnreadCount(room._id) }}
                        <div class="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full blur opacity-50 animate-ping"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Chat Area with Enhanced Glassmorphism -->
      <div class="lg:col-span-3">
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl h-full flex flex-col overflow-hidden hover:border-purple-400/30 transition-all duration-300">
          <!-- No room selected with Enhanced Animation -->
          <div v-if="!currentRoom" class="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <div class="text-center relative">
              <div class="relative mb-8">
                <ChatBubbleLeftEllipsisIcon class="w-32 h-32 mx-auto text-purple-400/50 animate-bounce" style="animation-duration: 3s" />
                <div class="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <h3 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Selecciona una conversación
              </h3>
              <p class="text-gray-300 mb-8 text-lg max-w-md mx-auto">
                Elige un chat para empezar a conversar con tu equipo y colaborar en tiempo real 
              </p>
              <div class="flex items-center justify-center space-x-3">
                <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"></div>
                <div class="w-3 h-3 bg-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50" style="animation-delay: 0.3s"></div>
                <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50" style="animation-delay: 0.6s"></div>
              </div>
            </div>
          </div>

          <!-- Chat Interface with Enhanced Styling -->
          <div v-else class="flex flex-col h-full">
            <!-- Enhanced Chat Header -->
            <div class="p-6 border-b border-white/20 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 backdrop-blur-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div
                    class="relative w-14 h-14 rounded-xl flex items-center justify-center mr-5 shadow-xl transition-all duration-300 hover:scale-110"
                    :class="currentRoom.type === 'direct' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                           : currentRoom.type === 'team' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                           : 'bg-gradient-to-br from-purple-500 to-pink-500'"
                  >
                    <UserIcon v-if="currentRoom.type === 'direct'" class="w-7 h-7 text-white" />
                    <UsersIcon v-else-if="currentRoom.type === 'team'" class="w-7 h-7 text-white" />
                    <UserGroupIcon v-else class="w-7 h-7 text-white" />
                    
                    <!-- Animated Glow -->
                    <div class="absolute inset-0 rounded-xl opacity-50 blur-lg animate-pulse"
                         :class="currentRoom.type === 'direct' ? 'bg-emerald-400' 
                                : currentRoom.type === 'team' ? 'bg-blue-400' 
                                : 'bg-purple-400'"></div>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-1 bg-gradient-to-r from-white to-gray-200 bg-clip-text">
                      {{ currentRoom.name }}
                    </h3>
                    <div class="flex items-center text-gray-300">
                      <span class="text-sm">👥 {{ currentRoom.participants.length }} participante{{ currentRoom.participants.length !== 1 ? 's' : '' }}</span>
                      <span v-if="typingUsers.length > 0" class="text-purple-400 ml-3 text-sm font-medium animate-pulse">
                        ✍️ {{ typingUsers.join(', ') }} escribiendo...
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Enhanced Room Actions -->
                <div class="flex items-center space-x-3">
                  <button
                    @click="showRoomInfo = true"
                    class="group text-gray-400 hover:text-white transition-all duration-300 p-3 rounded-xl hover:bg-white/10 hover:scale-110 transform"
                    title="Información del chat"
                  >
                    <InformationCircleIcon class="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Enhanced Messages Area -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent via-purple-950/10 to-slate-950/20 custom-scrollbar" ref="messagesContainer">
              <!-- Enhanced Loading State -->
              <div v-if="chatStore.isLoading" class="flex items-center justify-center py-16">
                <div class="text-center">
                  <div class="relative mb-6">
                    <div class="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto shadow-xl"></div>
                    <div class="absolute inset-0 rounded-full border-4 border-purple-500/10 animate-ping"></div>
                  </div>
                  <p class="text-gray-300 text-lg font-medium">Cargando mensajes...</p>
                </div>
              </div>

              <!-- Enhanced Empty Messages State -->
              <div v-else-if="currentMessages.length === 0" class="flex items-center justify-center py-16">
                <div class="text-center">
                  <div class="relative mb-8">
                    <ChatBubbleLeftEllipsisIcon class="w-24 h-24 mx-auto text-purple-400/50 animate-pulse" />
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
                  </div>
                  <h3 class="text-white font-bold text-xl mb-3">Sin mensajes aún</h3>
                  <p class="text-gray-300 text-sm">¡Sé el primero en enviar un mensaje y comenzar la conversación! 💬</p>
                </div>
              </div>

              <!-- Enhanced Messages with Better Styling -->
              <div v-else>
                <div
                  v-for="message in currentMessages"
                  :key="message._id"
                  class="flex mb-8 animate-fadeIn"
                  :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[75%] rounded-2xl shadow-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] transform"
                    :class="isOwnMessage(message) 
                      ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 text-white border-purple-400/30 shadow-purple-500/25' 
                      : 'bg-white/10 border-white/20 text-white shadow-xl hover:bg-white/15'"
                  >
                    <!-- Enhanced Sender Info -->
                    <div v-if="!isOwnMessage(message)" class="p-5 pb-0">
                      <div class="flex items-center mb-4">
                        <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                          <span class="text-white text-sm font-bold">
                            {{ message.sender.name.charAt(0).toUpperCase() }}
                          </span>
                          <div class="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl opacity-0 animate-pulse"></div>
                        </div>
                        <div>
                          <span class="text-white font-semibold text-sm">{{ message.sender.name }}</span>
                          <p class="text-purple-200 text-xs">{{ message.sender.position || message.sender.role }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="p-5" :class="!isOwnMessage(message) ? 'pt-0' : ''">
                      <!-- Enhanced Message Content -->
                      <div class="mb-4">
                        <p class="break-words leading-relaxed text-base">{{ message.content }}</p>

                        <!-- Enhanced Attachments -->
                        <div v-if="message.attachments && message.attachments.length > 0" class="mt-5 space-y-3">
                          <div
                            v-for="attachment in message.attachments"
                            :key="attachment.filename"
                            class="group flex items-center p-4 rounded-xl bg-black/20 hover:bg-black/30 transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-[1.02] transform"
                          >
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                              <DocumentIcon class="w-6 h-6 text-white" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <a
                                :href="attachment.url"
                                target="_blank"
                                class="block hover:underline text-sm font-medium text-white group-hover:text-purple-200 transition-colors truncate"
                              >
                                📎 {{ attachment.originalname }}
                              </a>
                              <span class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                💾 {{ formatFileSize(attachment.size) }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Enhanced Message Footer -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <span class="text-xs text-white/70 bg-black/20 px-2 py-1 rounded-lg">
                            🕒 {{ formatTime(message.createdAt) }}
                          </span>
                          <span v-if="message.edited" class="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg font-medium">
                            ✏️ editado
                          </span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <button
                            v-if="isOwnMessage(message) && message.type === 'text'"
                            @click="startEdit(message)"
                            class="opacity-60 hover:opacity-100 transition-all duration-300 p-2 rounded-lg hover:bg-black/20 hover:scale-110 transform"
                            title="Editar mensaje"
                          >
                            <PencilIcon class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Enhanced Typing Indicator -->
                <div v-if="typingUsers.length > 0" class="flex justify-start mb-8 animate-fadeIn">
                  <div class="bg-white/10 rounded-2xl p-5 max-w-[70%] border border-white/10 backdrop-blur-sm shadow-lg">
                    <div class="flex items-center space-x-4">
                      <div class="flex space-x-1">
                        <div class="w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50"></div>
                        <div class="w-3 h-3 bg-pink-400 rounded-full animate-bounce shadow-lg shadow-pink-400/50" style="animation-delay: 0.2s"></div>
                        <div class="w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style="animation-delay: 0.4s"></div>
                      </div>
                      <span class="text-sm text-purple-300 font-medium">
                        ✍️ {{ typingUsers.join(', ') }} escribiendo...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Message Input -->
            <div class="p-6 border-t border-white/20 bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-purple-900/10 backdrop-blur-sm">
              <!-- Enhanced Edit mode indicator -->
              <div v-if="editingMessage" class="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 rounded-xl backdrop-blur-sm animate-slideIn">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mr-3 shadow-lg">
                      <PencilIcon class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span class="text-yellow-300 font-semibold">✏️ Editando mensaje</span>
                      <p class="text-xs text-yellow-300/80 mt-1">Presiona Enter para guardar o Escape para cancelar</p>
                    </div>
                  </div>
                  <button 
                    @click="cancelEdit" 
                    class="group text-yellow-400 hover:text-yellow-300 transition-all duration-300 p-2 rounded-xl hover:bg-yellow-500/10 hover:scale-110 transform"
                  >
                    <XMarkIcon class="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>

              <!-- Enhanced Input Area -->
              <div class="flex items-end space-x-4">
                <div class="flex-1 relative group">
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <input
                    ref="messageInput"
                    v-model="newMessage"
                    @keydown.enter.prevent="editingMessage ? saveEdit() : sendMessage()"
                    @keydown.escape.prevent="cancelEdit"
                    @input="handleTyping"
                    :placeholder="editingMessage ? '✏️ Editar mensaje...' : '💬 Escribe un mensaje...'"
                    class="relative w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-base placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm shadow-lg hover:bg-white/15 hover:border-white/30"
                  />
                  <!-- Input glow effect -->
                  <div class="absolute inset-0 rounded-2xl border border-purple-400/0 group-focus-within:border-purple-400/50 transition-all duration-300"></div>
                </div>
                
                <!-- Enhanced Send Button -->
                <button
                  @click="editingMessage ? saveEdit() : sendMessage()"
                  :disabled="!newMessage.trim()"
                  class="group relative p-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-110 disabled:hover:scale-100"
                  :class="[
                    editingMessage 
                      ? 'bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-700 shadow-emerald-500/25' 
                      : 'bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-purple-500/25',
                    !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                  ]"
                >
                  <!-- Button glow effect -->
                  <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <PaperAirplaneIcon v-if="!editingMessage" class="relative w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-300" />
                  <CheckIcon v-else class="relative w-6 h-6 text-white group-hover:scale-125 transition-transform duration-300" />
                  
                  <!-- Animated ripple effect -->
                  <div class="absolute inset-0 rounded-2xl animate-ping opacity-0 group-active:opacity-20"
                       :class="editingMessage ? 'bg-emerald-400' : 'bg-purple-400'"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <CreateRoomModal
      v-if="showCreateRoom"
      @close="showCreateRoom = false"
      @created="handleRoomCreated"
    />

    <!-- Room Info Modal -->
    <div v-if="showRoomInfo && currentRoom" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showRoomInfo = false"></div>
      <div class="relative bg-gradient-to-br from-dark-800/95 to-dark-900/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl w-full max-w-md mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Información del Chat</h3>
            <button @click="showRoomInfo = false" class="text-gray-400 hover:text-white">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-400">Nombre</label>
              <p class="text-white">{{ currentRoom.name }}</p>
            </div>
            
            <div v-if="currentRoom.description">
              <label class="text-sm font-medium text-gray-400">Descripción</label>
              <p class="text-white">{{ currentRoom.description }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-400">Participantes ({{ currentRoom.participants.length }})</label>
              <div class="mt-2 space-y-2">
                <div
                  v-for="participant in currentRoom.participants"
                  :key="participant._id"
                  class="flex items-center p-2 bg-white/5 rounded-lg"
                >
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                    <span class="text-white text-sm font-medium">
                      {{ participant.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="text-white text-sm">{{ participant.name }}</p>
                    <p class="text-gray-400 text-xs">{{ participant.position || participant.role }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-xs text-gray-400">
              Creado: {{ new Date(currentRoom.createdAt).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/auth';
import CreateRoomModal from '@/components/CreateRoomModal.vue';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftEllipsisIcon,
  UserIcon,
  UsersIcon,
  UserGroupIcon,
  InformationCircleIcon,
  DocumentIcon,
  PencilIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckIcon
} from '@heroicons/vue/24/outline';
import type { ChatRoom, Message } from '@/services/chatService';

const chatStore = useChatStore();
const authStore = useAuthStore();

// State
const currentRoom = ref<ChatRoom | null>(null);
const newMessage = ref('');
const showCreateRoom = ref(false);
const showRoomInfo = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const messageInput = ref<HTMLElement | null>(null);
const editingMessage = ref<Message | null>(null);
const typingUsers = ref<string[]>([]);
const typingTimeout = ref<NodeJS.Timeout | null>(null);

// Computed
const currentMessages = computed(() => {
  if (!currentRoom.value) return [];
  return chatStore.messages[currentRoom.value._id] || [];
});

// Methods
const selectRoom = async (room: ChatRoom) => {
  if (currentRoom.value?._id === room._id) return;
  
  currentRoom.value = room;
  await chatStore.loadMessages(room._id);
  scrollToBottom();
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentRoom.value) return;

  const content = newMessage.value.trim();
  newMessage.value = '';

  try {
    await chatStore.sendMessage(content);
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
    // Restore message on error
    newMessage.value = content;
  }
};

const startEdit = (message: Message) => {
  editingMessage.value = message;
  newMessage.value = message.content;
  nextTick(() => {
    if (messageInput.value) {
      (messageInput.value as HTMLInputElement).focus();
    }
  });
};

const saveEdit = async () => {
  if (!editingMessage.value || !newMessage.value.trim()) return;

  try {
    await chatStore.editMessage(editingMessage.value._id, newMessage.value.trim());
    cancelEdit();
  } catch (error) {
    console.error('Error editing message:', error);
  }
};

const cancelEdit = () => {
  editingMessage.value = null;
  newMessage.value = '';
};

const handleTyping = () => {
  if (!currentRoom.value) return;

  chatStore.startTyping(currentRoom.value._id);

  // Clear previous timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  // Stop typing after 3 seconds of inactivity
  typingTimeout.value = setTimeout(() => {
    if (currentRoom.value) {
      chatStore.stopTyping(currentRoom.value._id);
    }
  }, 3000);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const handleRoomCreated = (room: ChatRoom) => {
  showCreateRoom.value = false;
  selectRoom(room);
};

const isOwnMessage = (message: Message) => {
  return message.sender._id === authStore.user?._id;
};

const getUnreadCount = (roomId: string) => {
  const room = chatStore.chatRooms.find(r => r._id === roomId);
  // Por ahora retornamos 0, esto se implementará cuando el store tenga el método
  return 0;
};

const formatTime = (date: string | Date) => {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'ahora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return messageDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Watchers
watch(
  () => chatStore.typingUsers,
  (newTypingUsers) => {
    if (currentRoom.value) {
      typingUsers.value = chatStore.getTypingInRoom(currentRoom.value._id);
    }
  },
  { deep: true }
);

watch(currentRoom, () => {
  if (currentRoom.value) {
    typingUsers.value = chatStore.getTypingInRoom(currentRoom.value._id);
  }
});

// Lifecycle
onMounted(async () => {
  await chatStore.initializeChat();
  await chatStore.loadChatRooms();
  
  // Auto-select first room if available
  if (chatStore.chatRooms.length > 0 && !currentRoom.value) {
    selectRoom(chatStore.chatRooms[0]);
  }
});

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
});
</script>

<style scoped>
/* Custom Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out forwards;
}

/* Custom Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(147, 51, 234, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgb(147, 51, 234), rgb(219, 39, 119));
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgb(126, 34, 206), rgb(190, 24, 93));
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.8);
}

/* Message hover effects */
.message-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Gradient text animation */
.gradient-text {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Enhanced button hover effects */
.btn-hover {
  position: relative;
  overflow: hidden;
}

.btn-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-hover:hover::before {
  left: 100%;
}

/* Floating animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Pulse glow effect */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(147, 51, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.8), 0 0 30px rgba(219, 39, 119, 0.6);
  }
}

.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Glass morphism effect */
.glass-morph {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Enhanced focus styles */
input:focus {
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.3), 0 0 20px rgba(147, 51, 234, 0.2);
}

/* Text shadow for better readability */
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Notification dot animation */
@keyframes notificationPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.notification-pulse {
  animation: notificationPulse 2s ease-in-out infinite;
}
</style>
