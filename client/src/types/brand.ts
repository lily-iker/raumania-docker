export interface Brand {
    id: string
    name: string
    description: string
  }
  
  export interface BrandPage {
    pageNumber: number
    pageSize: number
    totalElements: number
    totalPages: number
    content: Brand[]
  }
  
  export interface ApiResponse<T> {
    statusCode: number
    message: string
    result: T
  }
  
  export interface CreateBrandRequest {
    name: string
    description: string
  }
  
  export interface UpdateBrandRequest {
    name: string
    description: string
  }
  