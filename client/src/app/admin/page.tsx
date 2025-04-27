"use client"

import { useEffect } from "react"
import { DashboardShell } from "@/components/admin/dashboard-shell"

import { DashboardContent } from "@/components/dashboard/dashboard-content"
import useDashboardStore from "@/stores/useDashboardStore"

export default function Home() {
  const { fetchAllDashboardData } = useDashboardStore()

  useEffect(() => {
    fetchAllDashboardData()
  }, [fetchAllDashboardData])

  return (
    <DashboardShell>
      <DashboardContent />
    </DashboardShell>
  )
}