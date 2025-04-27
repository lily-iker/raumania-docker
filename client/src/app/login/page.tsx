"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev)
    if (passwordRef.current) {
      passwordRef.current.type = isPasswordVisible ? "password" : "text"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(identifier, password)
      if (document.referrer.includes("/unauthorized")) {
        router.back() // go back to login page
        setTimeout(() => {
          router.back() // go back again to the page before unauthorized
        }, 100)
    } 
    router.back()
    }catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Left side - Login form */}
      <div className="relative flex w-full items-center justify-center bg-white lg:w-[55%]">
        <div className="w-[450px] px-8">
          <h1 className="mb-24 text-[56px] font-bold leading-tight text-[#292929]">
            Welcome back
          </h1>
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="text-xl font-normal text-gray-500"
              >
                Email or Username
              </label>
              <input
                id="email"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="raumania@gmail.com"
                className="w-full border-b border-gray-300 pb-4 text-[18px] font-normal text-gray-800 outline-none focus:border-gray-400"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xl font-normal text-gray-500"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-normal text-gray-500 hover:text-gray-700"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
  <input
    id="password"
    type={isPasswordVisible ? "text" : "password"}
    ref={passwordRef}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full border-b border-gray-300 pb-4 text-[18px] font-normal text-gray-800 outline-none focus:border-gray-400 pr-10" // note the padding-right
    required
  />

  {password && (
    <button
      type="button"
      onClick={togglePasswordVisibility}
      className="absolute right-0 top-1/2 -translate-y-1/2 transform p-2 text-gray-600 hover:text-gray-800"
    >
      {isPasswordVisible ? (
        // Eye Open SVG
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        // Eye Closed SVG
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.302-3.766M9.88 9.88a3 3 0 104.24 4.24" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 01-3 3m0-3a3 3 0 013-3m-3 0a3 3 0 013 3M4.22 4.22l15.56 15.56" />
        </svg>
      )}
    </button>
  )}
</div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full bg-[#222222] py-5 text-xl font-medium uppercase text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-24 text-center text-xl font-normal text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-gray-700 hover:underline"
            >
              Sign Up
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
