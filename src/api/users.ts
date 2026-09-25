import { apiClient } from '@/lib/api-client'
import type { User } from '@/types/user'

export async function getUsers() {
  const { data } = await apiClient.get<User[]>('/user')
  return data
}
