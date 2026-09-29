import { Toast } from '@base-ui/react/toast'

// Manager tạo ngoài React để interceptor của axios cũng bắn được toast.
export const toastManager = Toast.createToastManager()

// Lỗi và cảnh báo cần thời gian đọc lâu hơn thông báo thành công.
const ATTENTION_TIMEOUT = 8000

export const toast = {
  success(title: string, description?: string) {
    return toastManager.add({ title, description, type: 'success' })
  },
  error(title: string, description?: string) {
    return toastManager.add({
      title,
      description,
      type: 'error',
      priority: 'high',
      timeout: ATTENTION_TIMEOUT,
    })
  },
  warning(title: string, description?: string) {
    return toastManager.add({
      title,
      description,
      type: 'warning',
      priority: 'high',
      timeout: ATTENTION_TIMEOUT,
    })
  },
  info(title: string, description?: string) {
    return toastManager.add({ title, description, type: 'info' })
  },
}
