"use client"

import type React from "react"

import { ArrowDown, ArrowUp, DollarSign, Package, UserPlus } from "lucide-react"
import { PerformanceChart } from "@/components/admin/performance-chart"
import { ConversionChart } from "@/components/admin/conversion-chart"
import { TopPagesTable } from "@/components/admin/top-pages-table"


export function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Alert */}
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
        We regret to inform you that our server is currently experiencing technical difficulties.
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value="13,647"
          icon={<Package className="h-6 w-6 text-orange-500" />}
          change={2.3}
          period="Last Week"
        />
        <StatCard
          title="New Leads"
          value="9,526"
          icon={<UserPlus className="h-6 w-6 text-orange-500" />}
          change={8.1}
          period="Last Month"
        />
        <StatCard
          title="Deals"
          value="976"
          icon={<Package className="h-6 w-6 text-orange-500" />}
          change={-0.3}
          period="Last Month"
        />
        <StatCard
          title="Booked Revenue"
          value="$123.6k"
          icon={<DollarSign className="h-6 w-6 text-orange-500" />}
          change={-10.8}
          period="Last Month"
        />
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Performance</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200">ALL</button>
            <button className="px-3 py-1 text-sm rounded-md">1M</button>
            <button className="px-3 py-1 text-sm rounded-md">6M</button>
            <button className="px-3 py-1 text-sm rounded-md">1Y</button>
          </div>
        </div>
        <PerformanceChart />
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
     
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-6">Conversions</h2>
          <div className="flex flex-col items-center">
            <ConversionChart />
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold">65.2%</div>
              <div className="text-sm text-gray-500">Returning Customer</div>
            </div>
            <div className="w-full grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">This Week</div>
                <div className="text-xl font-medium">23.5k</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Last Week</div>
                <div className="text-xl font-medium">41.05k</div>
              </div>
            </div>
            <button className="mt-6 w-full py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
              View Details
            </button>
          </div>
        </div>

       

        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Top Pages</h2>
            <button className="text-sm text-orange-500 hover:underline">View All</button>
          </div>
          <TopPagesTable />
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change: number
  period: string
}

function StatCard({ title, value, icon, change, period }: StatCardProps) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`flex items-center text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-500 ml-2">{period}</span>
        <button className="ml-auto text-sm text-gray-500 hover:text-gray-700">View More</button>
      </div>
    </div>
  )
}
