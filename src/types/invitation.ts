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

export interface CreateInvitationPayload {
  type: InvitationType
  image: File
  active?: boolean
}

export interface UpdateInvitationPayload {
  id: number
  type?: InvitationType
  image?: File
  active?: boolean
}
