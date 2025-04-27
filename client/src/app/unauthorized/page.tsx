"use client"

import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import Link from "next/link"
import axios from "@/lib/axios-custom"


export default function UnauthorizedPage() {


  const handleLogoutAndRedirect = async () => {
    try {
      await axios.post("/api/auth/logout")
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>

        <p className="text-gray-600 font-sans mb-6">
          You don't have permission to access this area. This section requires administrator privileges.
        </p>

        <div className="flex flex-col font-sans gap-3">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>

          <Button variant="outline" onClick={handleLogoutAndRedirect}>
            Login with Different Account
          </Button>
        </div>
      </div>
    </div>
  )
}
