"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"
import ProfilePage from "@/components/profile-page"
import { Loader2 } from "lucide-react"

export default function ProfileRoute() {
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
    if (!isCheckingAuth && !authUser && !isLoading) {
      
      router.push("/login")
    }
  }, [authUser, isCheckingAuth, isLoading, router])

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!authUser) {
    return null // This prevents flash of content before redirect
  }

  return <ProfilePage />
}
