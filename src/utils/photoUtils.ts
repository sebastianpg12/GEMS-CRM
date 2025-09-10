import { API_CONFIG } from '../config/api'

/**
 * Construye la URL completa para las fotos de usuario
 */
export const getFullPhotoUrl = (photoPath?: string): string => {
  if (!photoPath) return ''
  
  // Si ya es una URL completa, devolverla tal como está
  if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
    return photoPath
  }
  
  // Si es una ruta relativa, construir URL completa
  const baseUrl = API_CONFIG.BASE_URL.replace('/api', '')  // Quitar /api del final
  return `${baseUrl}${photoPath}`
}

/**
 * Obtiene las iniciales del nombre del usuario
 */
export const getUserInitials = (name?: string): string => {
  if (!name) return 'U'
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
}

/**
 * Maneja errores de carga de imágenes
 */
export const handleImageError = (event: Event) => {
  console.log('Error loading user image:', event)
  // La imagen se ocultará automáticamente y se mostrarán las iniciales
}
