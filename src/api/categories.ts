import { apiClient } from '@/lib/api-client'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category'

export async function getCategories() {
  const { data } = await apiClient.get<Category[]>('/categories')
  return data
}

export async function createCategory(payload: CreateCategoryPayload) {
  const { data } = await apiClient.post<Category>('/categories', payload)
  return data
}

export async function updateCategory({ id, name }: UpdateCategoryPayload) {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, { name })
  return data
}

export async function deleteCategory(id: number) {
  await apiClient.delete(`/categories/${id}`)
}
