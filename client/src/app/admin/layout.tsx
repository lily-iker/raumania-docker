"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { authUser, fetchAuthUser, isLoading } = useAuthStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchAuthUser()
      } catch (error) {
        console.error("Error fetching auth user:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [fetchAuthUser])

  useEffect(() => {
    if (!isCheckingAuth && !isLoading) {
      // Redirect if user is not logged in or not an admin
      if (!authUser) {
        router.push("/login")
      } else if (authUser.role !== "ADMIN") {
        router.push("/unauthorized")
      }
    }
  }, [authUser, isCheckingAuth, isLoading, router])

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Don't render children if user is not an admin
  if (!authUser || authUser.role !== "ADMIN") {
    return null // This prevents flash of content before redirect
  }

  return  <div className="font-sans">
  {children}
</div>
}
