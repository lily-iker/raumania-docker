export interface User {
  id: string
  username: string
  email: string
  fullName: string
  phoneNumber: string
  imageUrl?: string
  isActive: boolean
  role: {
    id: string
    name: string
  },
  roleName: string,
  createdAt: string
  updatedAt: string
}

export interface UserPaginationParams {
  pageNumber: number
  pageSize: number
  sortBy: string
  sortDirection: string
  name?: string
}

export interface UserPage {
  content: User[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  result: T
}

export interface UpdateUserRequest {
  fullName?: string
  phoneNumber?: string
  imageUrl?: string
  isActive?: boolean
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
