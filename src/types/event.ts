import type { Category } from '@/types/category'

export interface Event {
  id: number
  name: string
  imageUrl: string
  categoryId: number
  category: Category
  createdAt: string
}

export interface PaginatedEvents {
  data: Event[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetEventsParams {
  categoryId?: number
  search?: string
  page?: number
  limit?: number
}

export interface CreateEventPayload {
  name: string
  categoryId: number
  image: File
}

export interface UpdateEventPayload {
  id: number
  name?: string
  categoryId?: number
  image?: File
}
