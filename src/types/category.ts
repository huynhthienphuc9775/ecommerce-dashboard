export interface Category {
  id: number
  name: string
  createdAt: string
}

export interface CreateCategoryPayload {
  name: string
}

export interface UpdateCategoryPayload {
  id: number
  name: string
}
