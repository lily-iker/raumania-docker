"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, ChevronLeft, ChevronRight, Calendar, DollarSign, Package2 } from "lucide-react"
import type { OrderPaginationParams } from "@/types/pagination"
import useOrderStore from "@/stores/useOrderStore"
import { useAuthStore } from "@/stores/useAuthStore" // Import the auth store
import { Header } from "@/components/Header"
import { NormalFooter } from "@/components/NormalFooter"
import clsx from "clsx"

// Helper function to format dates
const formatDate = (dateString: string | Date) => {
  if (!dateString) return "N/A"
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    myOrders,
    totalOrders,
    totalPages,
    currentPage,
    pageSize,
    isLoading: ordersLoading,
    error,
    fetchMyOrders,
  } = useOrderStore()
  const { authUser, isLoading: authLoading, fetchAuthUser } = useAuthStore() // Get auth state

  const [sortField, setSortField] = useState<string>("createdAt,desc")
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      await fetchAuthUser()
      setIsAuthChecked(true)
    }

    checkAuth()
  }, [fetchAuthUser])

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthChecked && !authLoading && !authUser) {
      router.push("/login?redirect=/orders")
    }
  }, [authUser, authLoading, isAuthChecked, router])

  // Query params
  const pageNumber = searchParams ? Number(searchParams.get("page") || "1") : 1
  const sort = searchParams ? searchParams.get("sort") || sortField : sortField

  // Fetch orders on mount & param change (only if authenticated)
  useEffect(() => {
    if (authUser) {
      const params: Partial<OrderPaginationParams> = {
        pageNumber,
        pageSize,
        sort,
      }
      fetchMyOrders(params)
    }
  }, [fetchMyOrders, pageNumber, pageSize, sort, authUser])

  // Pagination nav
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return

    if (searchParams) {
      // Check if searchParams is not null
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", page.toString())
      params.set("sort", sort)
      router.push(`/orders?${params.toString()}`)
    } else {
      console.error("searchParams is null")
    }
  }

  // Show loading state while checking authentication
  if (authLoading || !isAuthChecked) {
    return (
      <>
        <Header />
        <div className="h-24 md:h-32 bg-brand-gray" />
        <div className="min-h-screen bg-brand-gray p-6 md:p-8 lg:p-12 font-cormorant text-brand-purple flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-purple border-t-brand-orange"></div>
            <p className="mt-4 text-xl text-brand-purple/70">Verifying your account...</p>
          </div>
        </div>
        <NormalFooter />
      </>
    )
  }

  // If auth check is complete and no user, the redirect effect will handle it
  // This is just a fallback in case the redirect hasn't happened yet
  if (!authUser) {
    return null
  }

  return (
    <>
      <Header />
      <div className="h-24 md:h-32 bg-brand-gray" />
      <div className="min-h-screen bg-brand-gray p-6 md:p-8 lg:p-12 font-cormorant text-brand-purple">
        {error && (
          <div
            className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl shadow-sm mx-auto max-w-6xl"
            style={{ border: "2px solid rgba(220, 38, 38, 0.3)", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
          >
            {error}
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <h1 className="text-[3rem] md:text-[4rem] font-dancing tracking-tight text-brand-purple drop-shadow-md transition-all duration-700 text-center mb-10">
            Your Orders
          </h1>

          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "2px solid #CC9999", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-brand-purple/5 border-b border-[#CC9999]/30">
                    <th className="px-6 py-5 text-left">
                      <div className="flex items-center gap-2 text-brand-purple">
                        <Calendar className="h-4 w-4 text-brand-orange" />
                        <span className="text-lg font-dancing">Order Date</span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <div className="flex items-center gap-2 text-brand-purple">
                        <DollarSign className="h-4 w-4 text-brand-orange" />
                        <span className="text-lg font-dancing">Total Amount</span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left">
                      <div className="flex items-center gap-2 text-brand-purple">
                        <Package2 className="h-4 w-4 text-brand-orange" />
                        <span className="text-lg font-dancing">Order Quantity</span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <span className="text-lg font-dancing text-brand-purple">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ordersLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-brand-orange"></div>
                          <p className="mt-4 text-lg text-brand-purple/70">Loading your orders...</p>
                        </div>
                      </td>
                    </tr>
                  ) : myOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
                            <Package2 className="h-8 w-8 text-brand-purple/50" />
                          </div>
                          <p className="text-xl text-brand-purple/70">No orders found</p>
                          <p className="mt-2 text-brand-purple/50">Your order history will appear here</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    myOrders.map((order, index) => (
                      <tr
                        key={order.orderId}
                        className={clsx(
                          "border-b border-[#CC9999]/10 hover:bg-brand-purple/5 transition-colors duration-300",
                          index % 2 === 0 ? "bg-white" : "bg-brand-gray/30",
                        )}
                      >
                        <td className="px-6 py-5 text-brand-purple text-xl">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-5 text-brand-purple text-xl font-medium">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-5 text-brand-purple text-xl">{order.quantity}</td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => router.push(`/orders/${order.orderId}`)}
                            className="p-2.5 rounded-full bg-brand-purple/10 text-brand-purple hover:bg-brand-orange hover:text-white transition-all duration-300"
                            title="View Order Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!ordersLoading && myOrders.length > 0 && (
              <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between border-t border-[#CC9999]/30 bg-white">
                <div className="text-sm text-brand-purple/70 mb-4 sm:mb-0">
                  Showing <span className="font-medium text-brand-purple">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-medium text-brand-purple">{Math.min(currentPage * pageSize, totalOrders)}</span>{" "}
                  of <span className="font-medium text-brand-purple">{totalOrders}</span> orders
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={clsx(
                      "p-2 rounded-lg transition-all duration-300",
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed text-brand-purple/50"
                        : "text-brand-purple hover:bg-brand-orange hover:text-white",
                    )}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5) {
                      if (currentPage <= 3) pageNum = i + 1
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={clsx(
                          "w-9 h-9 flex items-center justify-center rounded-lg text-base transition-all duration-300",
                          currentPage === pageNum
                            ? "bg-brand-purple text-white"
                            : "text-brand-purple hover:bg-brand-orange/10",
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={clsx(
                      "p-2 rounded-lg transition-all duration-300",
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed text-brand-purple/50"
                        : "text-brand-purple hover:bg-brand-orange hover:text-white",
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <NormalFooter />
    </>
  )
}
