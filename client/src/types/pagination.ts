export interface Page<T> {
    result: {
      content: T[]
      pageNumber: number
      pageSize: number
      totalElements: number
      totalPages: number
    }
  }
  
  export interface ProductPaginationParams {
    pageNumber?: number
    pageSize?: number
    name?: string
    minPrice?: number
    maxPrice?: number
    isActive?: boolean
    brandName?: string
    size?: string
    scent?: string
    sort?: string
    sortBy?: string
    sortDirection?: string
  }
  
  export interface OrderPaginationParams {
    pageNumber: number
    pageSize: number
    sort?: string
  }