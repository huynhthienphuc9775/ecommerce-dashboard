import { apiClient } from '@/lib/api-client'

export const InvitationType = {
  WEDDING: 'wedding',
  BIRTHDAY: 'birthday',
} as const

export type InvitationType =
  (typeof InvitationType)[keyof typeof InvitationType]

export interface Invitation {
  id: number
  name: string
  type: InvitationType
  imageUrl: string
  active: boolean
  createdAt: string
}

export interface PaginatedInvitations {
  data: Invitation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetInvitationsParams {
  type?: InvitationType
  active?: boolean
  page?: number
  limit?: number
}

export async function getInvitations(params: GetInvitationsParams = {}) {
  const { data } = await apiClient.get<PaginatedInvitations>('/invitations', {
    params,
  })
  return data
}

export interface CreateInvitationPayload {
  type: InvitationType
  image: File
  active?: boolean
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

export interface UpdateInvitationPayload {
  id: number
  type?: InvitationType
  image?: File
  active?: boolean
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
