import { apiClient } from '@/lib/api-client'
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from '@/types/auth'

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse>(
    '/auth/login',
    payload,
  )
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post('/user', payload)
  return data
}
