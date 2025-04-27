import { create } from "zustand"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import type { Brand, BrandPage, CreateBrandRequest, UpdateBrandRequest } from "@/types/brand"

interface BrandStoreState {
  isLoading: boolean
  error: string | null
  brands: Brand[]
  totalBrands: number
  totalPages: number
  currentPage: number
  pageSize: number
  selectedBrand: Brand | null

  // Fetch brands
  fetchBrands: (params?: {
    pageNumber?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: string
  }) => Promise<void>

  // Search brands
  searchBrands: (params: {
    name: string
    pageNumber?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: string
  }) => Promise<void>

  // Set selected brand
  setSelectedBrand: (brand: Brand | null) => void

  // Create brand
  createBrand: (data: CreateBrandRequest) => Promise<void>

  // Update brand
  updateBrand: (id: string, data: UpdateBrandRequest) => Promise<void>

  // Delete brand
  deleteBrand: (id: string) => Promise<void>

  // Fetch brand by ID
  fetchBrandById: (id: string) => Promise<void>
}

const useBrandStore = create<BrandStoreState>((set, get) => ({
  isLoading: false,
  error: null,
  brands: [],
  totalBrands: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  selectedBrand: null,

  fetchBrands: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const state = get()
      const pageNumber = params.pageNumber ?? state.currentPage
      const pageSize = params.pageSize ?? state.pageSize
      const sortBy = params.sortBy ?? "name"
      const sortDirection = params.sortDirection ?? "asc"

      const response = await axios.get<{ result: BrandPage }>("/api/brand", {
        params: {
          pageNumber,
          pageSize,
          sortBy,
          sortDirection,
        },
      })

      set({
        brands: response.data.result.content,
        totalBrands: response.data.result.totalElements,
        totalPages: response.data.result.totalPages,
        currentPage: pageNumber,
        pageSize,
        isLoading: false,
      })
    } catch (error: any) {
      console.error("Error fetching brands:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch brands. Please try again.",
      })
      toast.error(error.response?.data?.message || "Failed to fetch brands")
    }
  },

  searchBrands: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const state = get()
      const pageNumber = params.pageNumber ?? state.currentPage
      const pageSize = params.pageSize ?? state.pageSize
      const sortBy = params.sortBy ?? "name"
      const sortDirection = params.sortDirection ?? "asc"

      const response = await axios.get<{ result: BrandPage }>("/api/brand/search", {
        params: {
          name: params.name,
          pageNumber,
          pageSize,
          sortBy,
          sortDirection,
        },
      })

      set({
        brands: response.data.result.content,
        totalBrands: response.data.result.totalElements,
        totalPages: response.data.result.totalPages,
        currentPage: pageNumber,
        pageSize,
        isLoading: false,
      })
    } catch (error: any) {
      console.error("Error searching brands:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to search brands. Please try again.",
      })
      toast.error(error.response?.data?.message || "Failed to search brands")
    }
  },

  setSelectedBrand: (brand) => {
    set({ selectedBrand: brand })
  },

  createBrand: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await axios.post("/api/brand", data)

      // Refresh the brand list
      await get().fetchBrands()

      toast.success("Brand created successfully")
    } catch (error: any) {
      console.error("Error creating brand:", error)
      const errorMessage = error.response?.data?.message || "Failed to create brand"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateBrand: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await axios.put(`/api/brand/${id}`, data)

      // Update the brand in the brands array
      set((state) => ({
        brands: state.brands.map((brand) => (brand.id === id ? { ...brand, ...data } : brand)),
        selectedBrand: null,
        isLoading: false,
      }))

      toast.success("Brand updated successfully")
    } catch (error: any) {
      console.error("Error updating brand:", error)
      const errorMessage = error.response?.data?.message || "Failed to update brand"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  },

  deleteBrand: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`/api/brand/${id}`)

      // Remove the brand from the brands array
      set((state) => ({
        brands: state.brands.filter((brand) => brand.id !== id),
        totalBrands: state.totalBrands - 1,
        isLoading: false,
      }))

      toast.success("Brand deleted successfully")
    } catch (error: any) {
      console.error("Error deleting brand:", error)
      const errorMessage = error.response?.data?.message || "Failed to delete brand"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
    }
  },

  fetchBrandById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<{ result: Brand }>(`/api/brand/${id}`)
      set({ selectedBrand: response.data.result, isLoading: false })
    } catch (error: any) {
      console.error("Error fetching brand:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch brand. Please try again.",
      })
      throw error
    }
  },
}))

export default useBrandStore
