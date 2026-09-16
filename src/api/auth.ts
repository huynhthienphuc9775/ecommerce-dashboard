import { apiClient } from '@/lib/api-client'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse>(
    '/auth/login',
    payload,
  )
  return data
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post('/user', payload)
  return data
}
