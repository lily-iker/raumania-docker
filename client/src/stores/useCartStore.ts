import { create } from "zustand"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import { useAuthStore } from "@/stores/useAuthStore"

// Define types for cart items and cart
interface CartItem {
  id: string
  productId: string
  productVariantId: string
  productName: string
  variantName: string
  price: number
  quantity: number
  imageUrl?: string
}

interface Cart {
  id: string
  userId: string
  cartItems: CartItem[]
  totalItems: number
  totalPrice: number
}

// Request types
interface CreateCartItemRequest {
  productVariantId: string
  quantity: number
}

interface UpdateCartItemRequest {
  cartItemId: string
  quantity: number
}

interface CartStoreState {
  isLoading: boolean
  error: string | null
  cart: Cart | null

  // Cart operations
  getMyCart: () => Promise<Cart | null>
  addToCart: (request: CreateCartItemRequest) => Promise<CartItem | null>
  updateCartItem: (request: UpdateCartItemRequest) => Promise<CartItem | null>
  removeFromCart: (cartItemId: string) => Promise<void>
  clearCart: () => void
  checkAuthAndRedirect: () => Promise<boolean>
}

const useCartStore = create<CartStoreState>((set, get) => ({
  isLoading: false,
  error: null,
  cart: null,

  // Check authentication and redirect if not authenticated
  checkAuthAndRedirect: async () => {
    // Get the current auth user directly from the auth store
    const authUser = useAuthStore.getState().authUser

    if (!authUser && typeof window !== "undefined") {
      toast.error("Please login to access your cart")
      // Save current URL to redirect back after login
      const currentPath = window.location.pathname
      window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
      return false
    }
    return !!authUser
  },

  getMyCart: async () => {
    set({ isLoading: true, error: null })

    // Check authentication first
    const isAuthenticated = await get().checkAuthAndRedirect()
    if (!isAuthenticated) {
      set({ isLoading: false })
      return null
    }

    try {
      const response = await axios.get("/api/cart/my-cart")
      const cartData = response.data.result
      set({ cart: cartData, isLoading: false })
      return cartData
    } catch (error: any) {
      console.error("Error fetching cart:", error)

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear auth user on 401/403 errors
        useAuthStore.getState().setAuthUser(null)

        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname
          window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
        }
      } else {
        set({
          isLoading: false,
          error: error.response?.data?.message || "Failed to fetch cart",
        })
        toast.error(error.response?.data?.message || "Failed to fetch cart")
      }
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  addToCart: async (request: CreateCartItemRequest) => {
    set({ isLoading: true, error: null })

    // Check authentication first using authUser directly
    const authUser = useAuthStore.getState().authUser
    if (!authUser) {
      toast.error("Please login to add items to your cart")
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname
        window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
      }
      set({ isLoading: false })
      return null
    }

    try {
      const response = await axios.post("/api/cart/add", request)
      const addedItem = response.data.result

      // Update the cart with the new item
      await get().getMyCart()

      toast.success("Item added to cart successfully")
      set({ isLoading: false })
      return addedItem
    } catch (error: any) {
      console.error("Error adding item to cart:", error)

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear auth user on 401/403 errors
        useAuthStore.getState().setAuthUser(null)

        toast.error("Please login to add items to your cart")
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname
          window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
        }
      } else {
        const errorMessage = error.response?.data?.message || "Failed to add item to cart"
        set({ isLoading: false, error: errorMessage })
        toast.error(errorMessage)
      }
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  updateCartItem: async (request: UpdateCartItemRequest) => {
    set({ isLoading: true, error: null })

    // Check authentication first using authUser directly
    const authUser = useAuthStore.getState().authUser
    if (!authUser) {
      toast.error("Please login to update your cart")
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname
        window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
      }
      set({ isLoading: false })
      return null
    }

    try {
      const response = await axios.put("/api/cart/update", request)
      const updatedItem = response.data.result

      // Update the cart with the updated item
      await get().getMyCart()

      toast.success("Cart item updated successfully")
      set({ isLoading: false })
      return updatedItem
    } catch (error: any) {
      console.error("Error updating cart item:", error)

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear auth user on 401/403 errors
        useAuthStore.getState().setAuthUser(null)

        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname
          window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
        }
      } else {
        const errorMessage = error.response?.data?.message || "Failed to update cart item"
        set({ isLoading: false, error: errorMessage })
        toast.error(errorMessage)
      }
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  removeFromCart: async (cartItemId: string) => {
    set({ isLoading: true, error: null })

    // Check authentication first using authUser directly
    const authUser = useAuthStore.getState().authUser
    if (!authUser) {
      toast.error("Please login to remove items from your cart")
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname
        window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
      }
      set({ isLoading: false })
      return
    }

    try {
      await axios.delete(`/api/cart/remove/${cartItemId}`)

      // Update the cart after removing the item
      await get().getMyCart()

      toast.success("Item removed from cart successfully")
      set({ isLoading: false })
    } catch (error: any) {
      console.error("Error removing item from cart:", error)

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear auth user on 401/403 errors
        useAuthStore.getState().setAuthUser(null)

        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname
          window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
        }
      } else {
        const errorMessage = error.response?.data?.message || "Failed to remove item from cart"
        set({ isLoading: false, error: errorMessage })
        toast.error(errorMessage)
      }
    } finally {
      set({ isLoading: false })
    }
  },

  clearCart: () => {
    set({ cart: null })
  },
}))

export default useCartStore
