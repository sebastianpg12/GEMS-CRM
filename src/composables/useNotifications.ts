import Swal from 'sweetalert2'

// Configuración base para SweetAlert2 con tema dark
const swalConfig = {
  background: '#1f2937',
  color: '#f3f4f6',
  confirmButtonColor: '#8b5cf6',
  cancelButtonColor: '#6b7280',
  customClass: {
    popup: 'swal-dark-popup',
    title: 'swal-dark-title',
    content: 'swal-dark-content',
    confirmButton: 'swal-confirm-button',
    cancelButton: 'swal-cancel-button',
    input: 'swal-dark-input'
  }
}

export const useNotifications = () => {
  // Notificación de éxito
  const showSuccess = (title: string, message?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'success',
      title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    })
  }

  // Notificación de error
  const showError = (title: string, message?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Entendido'
    })
  }

  // Notificación de advertencia
  const showWarning = (title: string, message?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Entendido'
    })
  }

  // Notificación informativa
  const showInfo = (title: string, message?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Entendido'
    })
  }

  // Confirmación de eliminación
  const confirmDelete = (itemName: string, itemType: string = 'elemento') => {
    return Swal.fire({
      ...swalConfig,
      title: '¿Estás seguro?',
      html: `
        <p style="color: #d1d5db; margin: 1rem 0;">
          Esta acción eliminará permanentemente <strong style="color: #f87171;">${itemName}</strong>
        </p>
        <p style="color: #9ca3af; font-size: 0.875rem;">
          Esta acción no se puede deshacer
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, eliminar ${itemType}`,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    })
  }

  // Confirmación genérica
  const confirm = (title: string, message: string, confirmText: string = 'Confirmar') => {
    return Swal.fire({
      ...swalConfig,
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })
  }

  // Loading
  const showLoading = (title: string = 'Procesando...') => {
    return Swal.fire({
      ...swalConfig,
      title,
      html: 'Por favor espera...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  // Cerrar loading
  const closeLoading = () => {
    Swal.close()
  }

  // Toast simple
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const Toast = Swal.mixin({
      ...swalConfig,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    return Toast.fire({
      icon: type,
      title: message
    })
  }

  // Input personalizado
  const showInput = (title: string, inputLabel: string, inputType: 'text' | 'email' | 'password' | 'textarea' = 'text') => {
    return Swal.fire({
      ...swalConfig,
      title,
      input: inputType,
      inputLabel,
      inputPlaceholder: `Ingresa ${inputLabel.toLowerCase()}`,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return `${inputLabel} es requerido`
        }
      }
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmDelete,
    confirm,
    showLoading,
    closeLoading,
    toast,
    showInput
  }
}

// Estilos CSS personalizados para SweetAlert2
export const injectSwalStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = `
      .swal-dark-popup {
        border: 1px solid rgba(139, 92, 246, 0.3) !important;
        backdrop-filter: blur(10px) !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
      }
      
      .swal-dark-title {
        font-weight: 700 !important;
        font-size: 1.25rem !important;
      }
      
      .swal-dark-content {
        color: #d1d5db !important;
      }
      
      .swal-confirm-button {
        background: linear-gradient(135deg, #8b5cf6, #ec4899) !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 0.75rem 1.5rem !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3) !important;
      }
      
      .swal-confirm-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 25px 0 rgba(139, 92, 246, 0.4) !important;
      }
      
      .swal-cancel-button {
        background: #374151 !important;
        border: 1px solid #4b5563 !important;
        border-radius: 8px !important;
        padding: 0.75rem 1.5rem !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
      }
      
      .swal-cancel-button:hover {
        background: #4b5563 !important;
        transform: translateY(-1px) !important;
      }
      
      .swal-dark-input {
        background: #374151 !important;
        border: 1px solid #4b5563 !important;
        border-radius: 8px !important;
        color: #f3f4f6 !important;
        padding: 0.75rem !important;
      }
      
      .swal-dark-input:focus {
        border-color: #8b5cf6 !important;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
        outline: none !important;
      }
      
      .swal2-timer-progress-bar {
        background: linear-gradient(135deg, #8b5cf6, #ec4899) !important;
      }
      
      .swal2-toast.swal2-show {
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(139, 92, 246, 0.2) !important;
      }
    `
    document.head.appendChild(style)
  }
}
