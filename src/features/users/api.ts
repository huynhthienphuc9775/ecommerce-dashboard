import { apiClient } from '@/lib/api-client'

export interface User {
  id: number
  name: string
  email: string
}

export async function getUsers() {
  const { data } = await apiClient.get<User[]>('/user')
  return data
}
