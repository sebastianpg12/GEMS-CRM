import { API_CONFIG } from '../config/api'

/**
 * Une base y path garantizando exactamente una barra entre ellos
 */
const joinUrl = (base: string, path: string) => {
  const cleanBase = base.replace(/\/?$/,'')
  const cleanPath = path.replace(/^\.\//,'').replace(/^\//,'')
  return `${cleanBase}/${cleanPath}`
}

/**
 * Construye la URL absoluta para las fotos de usuario
 * - Acepta URLs absolutas (http/https/data)
 * - Une correctamente paths relativos con el origin del backend (sin /api)
 * - Si recibe solo un nombre de archivo, asume uploads/profiles
 */
export const getFullPhotoUrl = (photoPath?: string): string => {
  if (!photoPath) return ''

  const p = String(photoPath).trim()
  // Ya es absoluta
  if (/^(https?:)?\/\//i.test(p) || p.startsWith('data:')) {
    return p
  }

  // Origin del backend sin /api
  const origin = String(API_CONFIG.BASE_URL).replace(/\/api\/?$/i, '')

  // Si es solo nombre de archivo con extensión, asumir carpeta de perfiles
  const isBareFilename = /^[^\/]+\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(p)
  if (isBareFilename) {
    return joinUrl(origin, `uploads/profiles/${p}`)
  }

  // Path relativo normal (con o sin slash inicial)
  return joinUrl(origin, p)
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
