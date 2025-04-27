import { create } from "zustand"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"

// Define interfaces for API responses
interface DashboardSummary {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  newOrders: number
  newProducts: number
  newUsers: number
  orderGrowth: number
  productGrowth: number
  userGrowth: number
}

interface OrderStatusDistribution {
  status: string
  count: number
}

interface RecentOrder {
  id: string
  customerName: string | null
  orderDate: string
  totalAmount: number
  status: string
  paymentStatus: string
}

interface RecentReview {
  id: string
  productName: string
  customerName: string
  rating: number
  content: string
  date: string
}

interface DashboardStoreState {
  isLoading: boolean
  error: string | null
  summary: DashboardSummary | null
  orderStatusDistribution: OrderStatusDistribution[]
  recentOrders: RecentOrder[]
  recentReviews: RecentReview[]
  
  fetchDashboardSummary: () => Promise<void>
  fetchOrderStatusDistribution: () => Promise<void>
  fetchRecentOrders: (limit?: number) => Promise<void>
  fetchRecentReviews: (limit?: number) => Promise<void>
  fetchAllDashboardData: () => Promise<void>
}

const useDashboardStore = create<DashboardStoreState>((set) => ({
  isLoading: false,
  error: null,
  summary: null,
  orderStatusDistribution: [],
  recentOrders: [],
  recentReviews: [],
  
  fetchDashboardSummary: async () => {
    try {
      set({ isLoading: true, error: null })
      const res = await axios.get("/api/admin/dashboard/summary")
      set({ summary: res.data.result, isLoading: false })
    } catch (err) {
      console.error(err)
      set({ isLoading: false, error: "Failed to fetch dashboard summary" })
      toast.error("Failed to fetch dashboard summary")
    }
  },
  
  fetchOrderStatusDistribution: async () => {
    try {
      set({ isLoading: true, error: null })
      const res = await axios.get("/api/admin/dashboard/orders/status")
      set({ orderStatusDistribution: res.data.result, isLoading: false })
    } catch (err) {
      console.error(err)
      set({ isLoading: false, error: "Failed to fetch order status distribution" })
      toast.error("Failed to fetch order status distribution")
    }
  },
  
  fetchRecentOrders: async (limit = 10) => {
    try {
      set({ isLoading: true, error: null })
      const res = await axios.get(`/api/admin/dashboard/orders/recent?limit=${limit}`)
      set({ recentOrders: res.data.result, isLoading: false })
    } catch (err) {
      console.error(err)
      set({ isLoading: false, error: "Failed to fetch recent orders" })
      toast.error("Failed to fetch recent orders")
    }
  },
  
  fetchRecentReviews: async (limit = 10) => {
    try {
      set({ isLoading: true, error: null })
      const res = await axios.get(`/api/admin/dashboard/reviews/recent?limit=${limit}`)
      set({ recentReviews: res.data.result, isLoading: false })
    } catch (err) {
      console.error(err)
      set({ isLoading: false, error: "Failed to fetch recent reviews" })
      toast.error("Failed to fetch recent reviews")
    }
  },
  
  fetchAllDashboardData: async () => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all([
        axios.get("/api/admin/dashboard/summary"),
        axios.get("/api/admin/dashboard/orders/status"),
        axios.get("/api/admin/dashboard/orders/recent"),
        axios.get("/api/admin/dashboard/reviews/recent")
      ]).then(([summaryRes, orderStatusRes, recentOrdersRes, recentReviewsRes]) => {
        set({
          summary: summaryRes.data.result,
          orderStatusDistribution: orderStatusRes.data.result,
          recentOrders: recentOrdersRes.data.result,
          recentReviews: recentReviewsRes.data.result,
          isLoading: false
        })
      })
    } catch (err) {
      console.error(err)
      set({ isLoading: false, error: "Failed to fetch dashboard data" })
      toast.error("Failed to fetch dashboard data")
    }
  }
}))

export default useDashboardStore