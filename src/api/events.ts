import { apiClient } from '@/lib/api-client'
import type {
  CreateEventPayload,
  Event,
  GetEventsParams,
  PaginatedEvents,
  UpdateEventPayload,
} from '@/types/event'

export async function getEvents(params: GetEventsParams = {}) {
  const { data } = await apiClient.get<PaginatedEvents>('/events', { params })
  return data
}

export async function createEvent(payload: CreateEventPayload) {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('categoryId', String(payload.categoryId))
  formData.append('image', payload.image)

  const { data } = await apiClient.post<Event>('/events', formData)
  return data
}

export async function updateEvent({
  id,
  name,
  categoryId,
  image,
}: UpdateEventPayload) {
  const formData = new FormData()
  if (name) formData.append('name', name)
  if (categoryId !== undefined) formData.append('categoryId', String(categoryId))
  if (image) formData.append('image', image)

  const { data } = await apiClient.patch<Event>(`/events/${id}`, formData)
  return data
}

export async function deleteEvent(id: number) {
  await apiClient.delete(`/events/${id}`)
}
