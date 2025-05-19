"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"

// Reset password content component that uses useSearchParams
function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuthStore()

  useEffect(() => {
    // Get token from URL query parameter
    const tokenParam = searchParams?.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      // If no token is provided, redirect to forgot password page
      router.push("/forgot-password")
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(token, password, confirmPassword)
      setIsSuccess(true)
    } catch (error) {
      console.error("Failed to reset password:", error)
      // Error is already handled in the store with toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Left side - Form with even bigger size */}
      <div className="relative flex w-full items-center justify-center bg-white lg:w-[55%]">
        <div className="w-[450px] px-8">
          {!isSuccess ? (
            <>
              <h1 className="mb-8 text-[56px] font-bold leading-tight text-[#292929]">Reset password</h1>
              <p className="mb-16 text-xl text-gray-500">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-3">
                  <label htmlFor="password" className="text-xl font-normal text-gray-500">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-gray-300 pb-4 text-[18px] font-normal text-gray-800 outline-none focus:border-gray-400"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="text-xl font-normal text-gray-500">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-b border-gray-300 pb-4 text-[18px] font-normal text-gray-800 outline-none focus:border-gray-400"
                    required
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="mt-6 w-full bg-[#222222] py-5 text-xl font-medium uppercase text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "RESETTING..." : "RESET PASSWORD"}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-8 text-center">
              <h1 className="text-[40px] font-bold leading-tight text-[#292929]">Password reset successful</h1>
              <p className="text-xl text-gray-500">Your password has been successfully reset.</p>
              <div className="pt-8">
                <Link
                  href="/login"
                  className="inline-block bg-[#222222] px-8 py-4 text-xl font-medium uppercase text-white transition-colors hover:bg-black"
                >
                  SIGN IN
                </Link>
              </div>
            </div>
          )}

          <div className="mt-24 text-center text-xl font-normal text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-gray-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Diagonal overlay for the form section */}
        <div
          className="absolute right-0 top-0 hidden h-full w-[100px] transform lg:block"
          style={{
            background: "linear-gradient(to bottom right, transparent 49.5%, white 50%)",
            zIndex: 10,
          }}
        ></div>
      </div>

      {/* Right side - Image with diagonal cut */}
      <div className="hidden lg:block lg:w-[45%]">
        <div className="relative h-full w-full">
          <Image
            src="https://res.cloudinary.com/dp67bxzbf/image/upload/v1743866867/login-image_vhmwym.jpg"
            alt="Cartier storefront with vintage red Porsche"
            width={1200}
            height={1200}
            priority
            className="h-full w-full object-cover"
          />
          {/* This overlay creates the diagonal cut on the left side of the image */}
          <div
            className="absolute left-0 top-0 h-full w-[100px]"
            style={{
              background: "linear-gradient(to bottom right, white 49.5%, transparent 50%)",
              zIndex: 5,
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

// Main page component
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full overflow-hidden font-sans">
        <div className="relative flex w-full items-center justify-center bg-white lg:w-[55%]">
          <div className="w-[450px] px-8 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black mx-auto mb-4"></div>
            <p className="text-xl text-gray-500">Loading reset password form...</p>
          </div>
        </div>
        <div className="hidden lg:block lg:w-[45%]">
          <div className="relative h-full w-full">
            <Image
              src="https://res.cloudinary.com/dp67bxzbf/image/upload/v1743866867/login-image_vhmwym.jpg"
              alt="Cartier storefront with vintage red Porsche"
              width={1200}
              height={1200}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

