// Define types based on your Zustand store
export interface CartItem {
    id: string
    productId: string
    productVariantId: string
    productName: string
    variantName: string
    price: number
    quantity: number
    imageUrl?: string
  }
  
  export interface Cart {
    id: string
    userId: string
    cartItems: CartItem[]
    totalItems: number
    totalPrice: number
  }
  
  export interface UpdateCartItemRequest {
    cartItemId: string
    quantity: number
  }
  