import { toast as toastUtils } from '../utils/toast'

export function useToast() {
  const toast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    switch (type) {
      case 'success':
        toastUtils.success(message)
        break
      case 'error':
        toastUtils.error(message)
        break
      case 'warning':
        toastUtils.warning(message)
        break
      case 'info':
      default:
        toastUtils.info(message)
        break
    }
  }

  const showError = (title: string, message: string) => {
    toastUtils.error(`${title}: ${message}`)
  }

  return {
    toast,
    showError
  }
}