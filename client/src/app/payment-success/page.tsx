"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import useOrderStore from "@/stores/useOrderStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { toast } from "react-hot-toast"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyStripePayment, isLoading } = useOrderStore()
  const { authUser, fetchAuthUser, isLoading: isAuthLoading } = useAuthStore()

  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasVerifiedPayment, setHasVerifiedPayment] = useState(false)

  // Step 1: Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchAuthUser()
        setIsCheckingAuth(false)
      } catch (error) {
        console.error("Error fetching auth user:", error)
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [fetchAuthUser])

  // Step 2: Verify payment only after auth check is complete
  const verifyPayment = useCallback(async () => {
    if (hasVerifiedPayment) return // Prevent multiple verifications

    try {
      const sessionId = searchParams.get("session_id")
      const orderIdParam = searchParams.get("order_id")

      if (!sessionId) {
        setVerificationStatus("error")
        toast.error("Invalid payment session")
        return
      }

      if (orderIdParam) {
        setOrderId(orderIdParam)
      }

      // Verify the payment with the backend
      const success = await verifyStripePayment(sessionId)
      setHasVerifiedPayment(true)

      if (success) {
        setVerificationStatus("success")
        toast.success("Payment successful!")
      } else {
        setVerificationStatus("error")
        toast.error("Payment verification failed")
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      setVerificationStatus("error")
      toast.error("Failed to verify payment")
    }
  }, [searchParams, verifyStripePayment, hasVerifiedPayment])

  // Only verify payment after auth check is complete and user is authenticated
  useEffect(() => {
    if (!isCheckingAuth && authUser) {
      verifyPayment()
    } else if (!isCheckingAuth && !authUser) {
      setVerificationStatus("error") // Set error state if not authenticated
    }
  }, [isCheckingAuth, authUser, verifyPayment])

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/orders/${orderId}`)
    } else {
      router.push("/orders")
    }
  }

  const handleGoToHome = () => {
    router.push("/")
  }

  // Show loading state while checking authentication
  if (isCheckingAuth || isAuthLoading) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-black mb-4"></div>
            <h2 className="text-xl font-medium">Verifying your session...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your details.</p>
          </div>
        </div>
      </Bounded>
    )
  }

  // If not authenticated, show login prompt
  if (!authUser) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <Heading className="mb-2" as="h1">
              Authentication Required
            </Heading>
            <p className="text-gray-600 mb-8">Please log in to view your payment status.</p>

            <div className="space-y-4 w-full">
              <Button
                className="w-full bg-black text-white hover:bg-gray-900 py-6"
                onClick={() => router.push("/login")}
              >
                Log In
              </Button>

              <Button variant="outline" className="w-full py-6" onClick={handleGoToHome}>
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      </Bounded>
    )
  }

  return (
    <Bounded className="min-h-screen bg-brand-cream py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        {verificationStatus === "loading" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-black mb-4"></div>
            <h2 className="text-xl font-medium">Verifying your payment...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
          </div>
        ) : verificationStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <Heading className="mb-2" as="h1">
              Payment Successful!
            </Heading>
            <p className="text-gray-600 mb-8">
              Thank you for your order. Your payment has been successfully processed.
            </p>

            <div className="space-y-4 w-full">
              <Button className="w-full bg-black text-white hover:bg-gray-900 py-6" onClick={handleViewOrder}>
                View Order Details
              </Button>

              <Button variant="outline" className="w-full py-6" onClick={handleGoToHome}>
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <Heading className="mb-2" as="h1">
              Payment Failed
            </Heading>
            <p className="text-gray-600 mb-8">
              We couldn't verify your payment. Please try again or contact customer support.
            </p>

            <div className="space-y-4 w-full">
              <Button
                className="w-full bg-black text-white hover:bg-gray-900 py-6"
                onClick={() => router.push("/cart")}
              >
                Return to Cart
              </Button>

              <Button variant="outline" className="w-full py-6" onClick={handleGoToHome}>
                Go to Homepage
              </Button>
            </div>
          </div>
        )}
      </div>
    </Bounded>
  )
}
