// Configuración automática de API según el ambiente
const getBaseURL = (): string => {
  // Usar variables de ambiente si están disponibles
  const devURL = import.meta.env.VITE_API_BASE_URL_DEV || 'https://gems-crm-backend.onrender.com/api'
  const prodURL = import.meta.env.VITE_API_BASE_URL_PROD || 'https://gems-crm-backend.onrender.com/api'
  
  // En desarrollo (localhost o modo dev)
  if (import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return devURL
  }
  
  // En producción (cualquier otro dominio)
  return prodURL
}

// Función para obtener timeout personalizado
const getTimeout = (): number => {
  return Number(import.meta.env.VITE_API_TIMEOUT) || 10000
}

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: getTimeout(),
  HEADERS: {
    'Content-Type': 'application/json',
  }
}

// Función para verificar si estamos en modo debug
export const isDebugMode = (): boolean => {
  return import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV
}


if (isDebugMode()) {
  console.log('🌐 API Configuration:', {
    environment: import.meta.env.DEV ? 'development' : 'production',
    hostname: window.location.hostname,
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    mode: import.meta.env.MODE
  })
}

export const ENDPOINTS = {
  CLIENTS: '/clients',
  ACTIVITIES: '/activities',
  PAYMENTS: '/payments',
  CASES: '/cases',
  FOLLOWUPS: '/followups',
  ISSUES: '/issues',
  NOTIFICATIONS: '/notifications',
  DOCS: '/docs',
  MINUTES: '/minutes',
  SETTINGS: '/settings',
  TEAM: '/team',
  REPORTS: '/reports'
}
