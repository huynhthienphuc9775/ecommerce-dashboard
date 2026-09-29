import axios from 'axios'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/store/auth-store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ coi là hết hạn phiên khi đang đăng nhập; 401 lúc đăng nhập sai mật
    // khẩu để màn hình login tự hiển thị lỗi.
    if (isUnauthorizedError(error) && useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().logout()
      toast.warning(
        'Phiên đăng nhập đã hết hạn',
        'Vui lòng đăng nhập lại để tiếp tục.',
      )
    }
    return Promise.reject(error)
  },
)
