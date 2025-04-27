import { create } from "zustand"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import type { ProductVariant, CreateProductVariantRequest, UpdateProductVariantRequest } from "@/types/product-variant"

interface ProductVariantStoreState {
  isLoading: boolean
  error: string | null
  selectedVariant: ProductVariant | null
  productVariants: ProductVariant[]

  // Create product variant
  createProductVariant: (data: CreateProductVariantRequest) => Promise<ProductVariant | null>

  // Update product variant
  updateProductVariant: (id: string, data: UpdateProductVariantRequest) => Promise<ProductVariant | null>

  // Get product variant by ID
  getProductVariantById: (id: string) => Promise<ProductVariant | null>

  // Delete product variant
  deleteProductVariant: (id: string) => Promise<boolean>

  // Get product variants by product ID
  getProductVariantsByProduct: (
    productId: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
  ) => Promise<{ content: ProductVariant[]; totalElements: number; totalPages: number } | null>

  // Set selected variant
  setSelectedVariant: (variant: ProductVariant | null) => void

  // Clear selected variant
  clearSelectedVariant: () => void
}

const useProductVariantStore = create<ProductVariantStoreState>((set) => ({
  isLoading: false,
  error: null,
  selectedVariant: null,
  productVariants: [],

  createProductVariant: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post<{ result: ProductVariant }>("/api/product-variant", data)
      toast.success("Product variant created successfully")
      set((state) => ({
        isLoading: false,
        productVariants: [...state.productVariants, response.data.result],
      }))
      return response.data.result
    } catch (error: any) {
      console.error("Error creating product variant:", error)
      const errorMessage = error.response?.data?.message || "Failed to create product variant"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return null
    }
  },

  updateProductVariant: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.put<{ result: ProductVariant }>(`/api/product-variant/${id}`, data)
      toast.success("Product variant updated successfully")
      set((state) => ({
        isLoading: false,
        productVariants: state.productVariants.map((variant) => (variant.id === id ? response.data.result : variant)),
        selectedVariant: state.selectedVariant?.id === id ? response.data.result : state.selectedVariant,
      }))
      return response.data.result
    } catch (error: any) {
      console.error("Error updating product variant:", error)
      const errorMessage = error.response?.data?.message || "Failed to update product variant"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return null
    }
  },

  getProductVariantById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<{ result: ProductVariant }>(`/api/product-variant/${id}`)
      set({ selectedVariant: response.data.result, isLoading: false })
      return response.data.result
    } catch (error: any) {
      console.error("Error fetching product variant:", error)
      const errorMessage = error.response?.data?.message || "Failed to fetch product variant"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return null
    }
  },

  deleteProductVariant: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`/api/product-variant/${id}`)
      toast.success("Product variant deleted successfully")
      set((state) => ({
        isLoading: false,
        productVariants: state.productVariants.filter((variant) => variant.id !== id),
        selectedVariant: state.selectedVariant?.id === id ? null : state.selectedVariant,
      }))
      return true
    } catch (error: any) {
      console.error("Error deleting product variant:", error)
      const errorMessage = error.response?.data?.message || "Failed to delete product variant"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return false
    }
  },

  getProductVariantsByProduct: async (
    productId,
    pageNumber = 1,
    pageSize = 10,
    sortBy = "id",
    sortDirection = "asc",
  ) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<{
        result: { content: ProductVariant[]; totalElements: number; totalPages: number }
      }>(`/api/product-variant/product/${productId}`, {
        params: {
          pageNumber,
          pageSize,
          sortBy,
          sortDirection,
        },
      })
      set({
        isLoading: false,
        productVariants: response.data.result.content,
      })
      return response.data.result
    } catch (error: any) {
      console.error("Error fetching product variants by product:", error)
      const errorMessage = error.response?.data?.message || "Failed to fetch product variants"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return null
    }
  },

  setSelectedVariant: (variant) => {
    set({ selectedVariant: variant })
  },

  clearSelectedVariant: () => {
    set({ selectedVariant: null })
  },
}))

export default useProductVariantStore
