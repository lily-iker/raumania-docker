"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await register(username, email, password, confirmPassword)
      console.log("Registration successful")
      router.push("/login") // Redirect to login after successful registration
    } catch (error) {
      console.error("Registration failed:", error)
      // Error is already handled in the store with toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Left side - Registration form with even bigger size */}
      <div className="relative flex w-full items-center justify-center bg-white lg:w-[55%]">
        <div className="w-[450px] px-8">
          <h1 className="mb-16 text-[56px] font-bold leading-tight text-[#292929]">Create account</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label htmlFor="username" className="text-xl font-normal text-gray-500">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full border-b border-gray-300 pb-4 text-[18px] font-normal text-gray-800 outline-none focus:border-gray-400"
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="email" className="text-xl font-normal text-gray-500">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full border-b border-gray-300 pb-4 text-[18px] font-normal text-gray-800 outline-none focus:border-gray-400"
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-xl font-normal text-gray-500">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 pb-4 text-[18px] font-normal text-gray-800 outline-none focus:border-gray-400"
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="text-xl font-normal text-gray-500">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-b border-gray-300 pb-4 text-[18px] font-normal text-gray-800 outline-none focus:border-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full bg-[#222222] py-5 text-xl font-medium uppercase text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>

          <div className="mt-16 text-center text-xl font-normal text-gray-500">
            Already have an account?{" "}
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

