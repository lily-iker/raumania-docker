export interface CreateProductVariantRequest {
    productId: string
    name: string
    size: string
    scent: string
    stock: number
    price: number
  }
  
  export interface UpdateProductVariantRequest {
    name: string
    size: string
    scent: string
    stock: number
    price: number
  }
  
  export interface ProductVariant {
    id: string
    name: string
    size: string
    scent: string
    stock: number
    price: number
    productId: string
  }