// Simple toast utility
export const toast = {
  success: (message: string) => {
    console.log(`✅ Success: ${message}`)
    // For now, just using console.log, but you can integrate with any toast library
    alert(`✅ ${message}`)
  },
  
  error: (message: string) => {
    console.error(`❌ Error: ${message}`)
    alert(`❌ ${message}`)
  },
  
  info: (message: string) => {
    console.log(`ℹ️ Info: ${message}`)
    alert(`ℹ️ ${message}`)
  },
  
  warning: (message: string) => {
    console.warn(`⚠️ Warning: ${message}`)
    alert(`⚠️ ${message}`)
  }
}
