import { create } from "zustand"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import type {
  DeliveryStatus,
  Order,
  OrdersPage,
  OrderStatus,
  OrderStatusCounts,
  PaymentStatus,
  UpdateOrderStatusRequest,
  OrderSummary,
} from "@/types/order"
import { OrderPaginationParams, Page } from "@/types/pagination"

// Define the checkout request type based on your Java DTO
type CheckoutRequest = {
  cartItemIds: string[]
  deliveryMethod: string
  paymentMethod: string
  houseNumber: string
  streetName: string
  city: string
  state: string
  country: string
  postalCode: string
}

// Define the create payment request type
type CreatePaymentRequest = {
  orderId: string
}

// Define the Stripe response type
type StripeResponse = {
  status: string
  message: string
  httpStatus: number
  data: {
    sessionId: string
    sessionUrl: string
  } | null
}

type OrderStoreState = {
  isLoading: boolean
  error: string | null
  orders: Order[]
  myOrders: OrderSummary[]
  selectedOrder: Order | null
  totalOrders: number
  totalPages: number
  currentPage: number
  pageSize: number
  statusCounts: OrderStatusCounts | null
  stripeSessionUrl: string | null

  // Create order from selected cart items
  createOrder: (checkoutRequest: CheckoutRequest) => Promise<Order>

  // Create Stripe payment for an order
  createStripePayment: (orderId: string) => Promise<StripeResponse>

  // Verify Stripe payment
  verifyStripePayment: (sessionId: string) => Promise<boolean>

  // Update payment status
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>

  // Fetch orders
  fetchOrders: (params?: {
    page?: number
    size?: number
    sortBy?: string
    sortDir?: string
  }) => Promise<void>

  // Fetch my orders
  fetchMyOrders: (params?: Partial<OrderPaginationParams>) => Promise<void>


  // Fetch order statistics
  fetchOrderStatistics: () => Promise<void>

  // Get order by ID
  getOrderById: (orderId: string) => Promise<Order>

  // Update order status
  updateOrderStatus: (orderId: string, data: UpdateOrderStatusRequest) => Promise<void>

  // Delete order
  deleteOrder: (orderId: string) => Promise<void>

  // Clear current order
  clearSelectedOrder: () => void

  // Clear Stripe session URL
  clearStripeSessionUrl: () => void
}

const useOrderStore = create<OrderStoreState>((set, get) => ({
  isLoading: false,
  error: null,
  orders: [],
  myOrders: [],
  selectedOrder: null,
  totalOrders: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  statusCounts: null,
  stripeSessionUrl: null,

  // Create order from selected cart items
  createOrder: async (checkoutRequest: CheckoutRequest) => {
    set({ isLoading: true, error: null })

    try {
      // Make API call to create order
      const response = await axios.post<{ result: Order }>("/api/orders/checkout", checkoutRequest)

      // Extract order from response
      const orderResponse = response.data.result

      // Update state with the new order
      set((state) => ({
        isLoading: false,
        // Add the new order to the orders array if it's not already there
        orders: state.orders.some((order) => order.id === orderResponse.id)
          ? state.orders
          : [orderResponse, ...state.orders],
        selectedOrder: orderResponse,
      }))

      toast.success("Order created successfully")
      return orderResponse
    } catch (error: any) {
      console.error("Error creating order:", error)

      // Set error state
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to create order",
      })

      // Show error toast
      toast.error(error.response?.data?.message || "Failed to create order")

      // Throw error to be handled by the component
      throw error
    }
  },

  // Create Stripe payment for an order
  createStripePayment: async (orderId: string) => {
    set({ isLoading: true, error: null })

    try {
      const request: CreatePaymentRequest = { orderId }
      const response = await axios.post<{ result: StripeResponse }>("/api/stripe/create-payment", request)

      const stripeResponse = response.data.result

      if (stripeResponse.data?.sessionUrl) {
        set({
          stripeSessionUrl: stripeResponse.data.sessionUrl,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }

      return stripeResponse
    } catch (error: any) {
      console.error("Error creating Stripe payment:", error)

      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to create payment",
      })

      toast.error(error.response?.data?.message || "Failed to create payment")
      throw error
    }
  },

  // Verify Stripe payment
  verifyStripePayment: async (sessionId: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await axios.get(`/api/stripe/success?session_id=${sessionId}`)

      set({ isLoading: false })

      // If we get a 200 response, payment was successful
      return response.status === 200
    } catch (error: any) {
      console.error("Error verifying payment:", error)

      set({
        isLoading: false,
        error: error.response?.data || "Failed to verify payment",
      })

      return false
    }
  },

  // Update payment status
  updatePaymentStatus: async (orderId: string, paymentStatus: PaymentStatus) => {
    set({ isLoading: true, error: null })

    try {
      // Make API call to update payment status
      await axios.patch(`/api/orders/${orderId}/payment-status`, null, {
        params: { paymentStatus },
      })

      // Update the order in the state
      set((state) => ({
        isLoading: false,
        orders: state.orders.map((order) => (order.id === orderId ? { ...order, paymentStatus } : order)),
        selectedOrder:
          state.selectedOrder && state.selectedOrder.id === orderId
            ? { ...state.selectedOrder, paymentStatus }
            : state.selectedOrder,
      }))

      toast.success("Payment status updated successfully")
    } catch (error: any) {
      console.error("Error updating payment status:", error)

      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to update payment status",
      })

      toast.error(error.response?.data?.message || "Failed to update payment status")
      throw error
    }
  },

  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const state = get()
      const page = params.page ?? state.currentPage
      const size = params.size ?? state.pageSize
      const sortBy = params.sortBy ?? "createdAt"
      const sortDir = params.sortDir ?? "desc"

      const response = await axios.get<{ result: OrdersPage }>("/api/orders", {
        params: {
          page,
          size,
          sortBy,
          sortDir,
        },
      })

      

      set({
        orders: response.data.result.content,
        totalOrders: response.data.result.totalElements,
        totalPages: response.data.result.totalPages,
        currentPage: page,
        pageSize: size,
        isLoading: false,
      })
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch orders. Please try again.",
      })
      toast.error(error.response?.data?.message || "Failed to fetch orders")
    }
  },

  // Fetch my orders
  fetchMyOrders: async (params?: Partial<OrderPaginationParams>) => {
    set({ isLoading: true, error: null })
    try {
      const state = get()
  
      const pageNumber = params?.pageNumber ?? state.currentPage
      const pageSize = params?.pageSize ?? state.pageSize
      const sort = params?.sort
  
      const response = await axios.get<Page<OrderSummary>>("/api/orders/my-orders", {
        params: {
          pageNumber,
          pageSize,
          sort,
        },
      })
      console.log("Fetched orders response:", response.data.result)

      set({
        myOrders: response.data.result.content,
        totalOrders: response.data.result.totalElements,
        totalPages: response.data.result.totalPages,
        currentPage: pageNumber,
        pageSize,
        isLoading: false,
      })
    } catch (error: any) {
      console.error("Error fetching my orders:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch your orders. Please try again.",
      })
  
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch your orders")
      }
  
      throw error
    }
  },
  

  fetchOrderStatistics: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<{ result: OrderStatusCounts }>("/api/orders/status-counts")
      set({
        statusCounts: response.data.result,
        isLoading: false,
      })
      console.log(response.data.result)
    } catch (error: any) {
      console.error("Error fetching order statistics:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch order statistics. Please try again.",
      })
      toast.error(error.response?.data?.message || "Failed to fetch order statistics")
    }
  },

  // Update the getOrderById method to better handle authentication and authorization
  getOrderById: async (orderId: string) => {
    set({ isLoading: true, error: null })
    try {
      // Make API call to fetch order
      const response = await axios.get<{ result: Order }>(`/api/orders/${orderId}`)

      // Process the response
      const orderData = response.data.result

      set({
        selectedOrder: orderData,
        isLoading: false,
      })

      return orderData // Return the order data for component use
    } catch (error: any) {
      console.error("Error fetching order:", error)

      // Set appropriate error state based on response status
      if (error.response?.status === 403) {
        set({
          isLoading: false,
          error: "forbidden",
        })
      } else {
        set({
          isLoading: false,
          error: error.response?.data?.message || "Failed to fetch order. Please try again.",
        })
      }

      // Rethrow the error so the component can handle it
      throw error
    }
  },

  updateOrderStatus: async (orderId: string, data: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    deliveryStatus?: DeliveryStatus;
  }) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Request Data:", {
        url: `/api/orders/${orderId}`,
        method: 'put',
        data,
      });
  
      // Use PUT instead of PATCH to match your @PutMapping
      const response = await axios.put<{ result: Order }>(
        `/api/orders/${orderId}`,
        data
      );
  
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                // Only overwrite if new data provided
                orderStatus: data.orderStatus ?? order.orderStatus,
                paymentStatus: data.paymentStatus ?? order.paymentStatus,
                deliveryStatus: data.deliveryStatus ?? order.deliveryStatus,
              }
            : order
        ),
        selectedOrder:
          state.selectedOrder?.id === orderId
            ? response.data.result
            : state.selectedOrder,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to update order status",
        isLoading: false,
      });
    }
  },

  deleteOrder: async (orderId: string) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`/api/orders/${orderId}`)

      // Remove the order from the orders array
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== orderId),
        selectedOrder: state.selectedOrder && state.selectedOrder.id === orderId ? null : state.selectedOrder,
        isLoading: false,
      }))

      toast.success("Order deleted successfully")
    } catch (error: any) {
      console.error("Error deleting order:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to delete order. Please try again.",
      })
      toast.error(error.response?.data?.message || "Failed to delete order")
    }
  },

  // Helper method to clear the selected order
  clearSelectedOrder: () => {
    set({ selectedOrder: null })
  },

  // Helper method to clear the Stripe session URL
  clearStripeSessionUrl: () => {
    set({ stripeSessionUrl: null })
  },
}))

export default useOrderStore
