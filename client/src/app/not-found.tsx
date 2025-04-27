'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, ShoppingCart } from 'lucide-react'
import { Header } from '@/components/Header'

export default function NotFound() {
  const router = useRouter()

  return (<>
    <Header/>
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Large animated shopping cart */}
        <div className="flex justify-center animate-bounce">
          <ShoppingCart className="h-24 w-24 text-pink-500" />
        </div>

        {/* Error message */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-pink-400">403</h1>
          <h2 className="text-2xl font-semibold text-pink-400">Page Not Found</h2>
          <p className="text-neutral-400 max-w-md mx-auto">
            Page Not Found. Let's get you back to shopping.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700 w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="bg-theme-500 hover:bg-theme-600 text-black w-full sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div></>
  )
}
