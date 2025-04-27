"use client"

import { StatCard } from "./stat-card"
import { StatusDistributionChart } from "./status-distribution-chart"
import { RecentOrdersTable } from "./recent-orders-table"
import { RecentReviews } from "./recent-reviews"
import { Package, ShoppingCart, Users, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import useDashboardStore from "@/stores/useDashboardStore"
import { useEffect, useState } from "react"

export function DashboardContent() {
  const {
    isLoading,
    summary,
    orderStatusDistribution,
    recentOrders,
    recentReviews,
    fetchAllDashboardData,
    fetchDashboardSummary,
    fetchOrderStatusDistribution,
    fetchRecentOrders,
    fetchRecentReviews,
  } = useDashboardStore()

  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)

  // Fetch all dashboard data on component mount
  useEffect(() => {
    fetchAllDashboardData()
  }, [fetchAllDashboardData])

  // Set hasAttemptedLoad to true after initial loading completes
  useEffect(() => {
    if (!isLoading) {
      setHasAttemptedLoad(true)
    }
  }, [isLoading])

  // Function to determine if we should show "no data" state
  const shouldShowNoData = (data: any) => {
    return hasAttemptedLoad && !isLoading && (!data || (Array.isArray(data) && data.length === 0))
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </>
        ) : !summary ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <NoDataCard message="Summary data not available" onRetry={() => fetchDashboardSummary()} />
          </div>
        ) : (
          <>
            <StatCard
              title="Total Orders"
              value={summary.totalOrders}
              icon={<ShoppingCart />}
              description={`${summary.newOrders} new orders`}
              trend={summary.orderGrowth}
            />
            <StatCard
              title="Total Products"
              value={summary.totalProducts}
              icon={<Package />}
              description={`${summary.newProducts} new products`}
              trend={summary.productGrowth}
            />
            <StatCard
              title="Total Users"
              value={summary.totalUsers}
              icon={<Users />}
              description={`${summary.newUsers} new users`}
              trend={summary.userGrowth}
            />
          </>
        )}
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : shouldShowNoData(orderStatusDistribution) ? (
          <NoDataCard message="No order status data available" onRetry={() => fetchOrderStatusDistribution()} />
        ) : (
          <StatusDistributionChart data={orderStatusDistribution} />
        )}

        <div className="flex flex-col gap-4 sm:gap-6">
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : shouldShowNoData(recentReviews) ? (
            <NoDataCard message="No recent reviews available" onRetry={() => fetchRecentReviews()} />
          ) : (
            <RecentReviews reviews={recentReviews.slice(0, 3)} />
          )}
        </div>
      </div>

      {/* Recent Orders */}
      {isLoading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : shouldShowNoData(recentOrders) ? (
        <NoDataCard message="No recent orders available" onRetry={() => fetchRecentOrders()} />
      ) : (
        <RecentOrdersTable orders={recentOrders} />
      )}
    </div>
  )
}

// No Data Component
function NoDataCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border rounded-lg p-6 flex flex-col items-center justify-center h-[200px] bg-gray-50 dark:bg-gray-900">
      <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
      <p className="text-gray-500 dark:text-gray-400 text-center mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-brand-purple/90 transition-colors"
      >
        Refresh Data
      </button>
    </div>
  )
}
