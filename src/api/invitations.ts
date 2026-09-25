import { apiClient } from '@/lib/api-client'
import type {
  CreateInvitationPayload,
  GetInvitationsParams,
  Invitation,
  PaginatedInvitations,
  UpdateInvitationPayload,
} from '@/types/invitation'

export async function getInvitations(params: GetInvitationsParams = {}) {
  const { data } = await apiClient.get<PaginatedInvitations>('/invitations', {
    params,
  })
  return data
}

export async function createInvitation(payload: CreateInvitationPayload) {
  const formData = new FormData()
  formData.append('type', payload.type)
  formData.append('image', payload.image)
  if (payload.active !== undefined) {
    formData.append('active', String(payload.active))
  }

  const { data } = await apiClient.post<Invitation>('/invitations', formData)
  return data
}

export async function updateInvitation({
  id,
  type,
  image,
  active,
}: UpdateInvitationPayload) {
  const formData = new FormData()
  if (type) formData.append('type', type)
  if (image) formData.append('image', image)
  if (active !== undefined) formData.append('active', String(active))

  const { data } = await apiClient.patch<Invitation>(
    `/invitations/${id}`,
    formData,
  )
  return data
}

export async function deleteInvitation(id: number) {
  await apiClient.delete(`/invitations/${id}`)
}
