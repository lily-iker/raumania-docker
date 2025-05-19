
export type AuthUser = {
  id: string
  username: string
  email: string
  fullName?: string
  phoneNumber?: string
  imageUrl?: string
  emailVerified: boolean
  isActive: boolean
  role: string
}

interface ProductImage {
  id: string
  image: string
}

interface ProductVariant {
  id: string
  name: string
  size: string
  scent: string
  stock: number
  price: number
  productId: string
}

interface Review {
  id: string
  productId: string
  productVariantId: string
  userId: string
  userName: string | null
  rating: number
  content: string
}

interface ReviewStatistic {
  averageRating: number
  totalReviews: number
  fiveStarReviews: number
  fourStarReviews: number
  threeStarReviews: number
  twoStarReviews: number
  oneStarReviews: number
}

interface RelatedProduct {
  id: string
  name: string
  thumbnailImage: string
  minPrice: number
}

 interface SearchProduct {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  thumbnailImage: string
  minPrice?: number; 
  maxPrice?: number; 
}

export interface Product {
  id: string
  name: string
  description: string
  productMaterial: string
  inspiration: string
  usageInstructions: string
  thumbnailImage: string
  minPrice: number
  maxPrice: number
  isActive: boolean
  brandName: string
  productVariants: ProductVariant[]
  productImages: ProductImage[]
  fiveLatestReviews: Review[]
  reviewStatistic: ReviewStatistic
  relatedProducts: RelatedProduct[]
  customizeUrl?: string
}

export interface ProductSummary {
  id: string
  name: string
  minPrice: number
  maxPrice: number
  thumbnailImage: string
}

export interface ProductSearchParams {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: string
  name?: string
  minPrice?: number
  maxPrice?: number
  brandName?: string
  isActive?: boolean
  size?: string
  scent?: string
}

export interface ProductSearchResponse {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  content: ProductSummary[]
}

