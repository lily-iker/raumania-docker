'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/Header'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error('Unexpected error:', error)
  }, [error])

  return (
    <>
    <Header/>
    <div className="h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <div className="animate-pulse text-red-500">
        <AlertTriangle className="h-24 w-24 mb-6" />
      </div>
      <h1 className="text-7xl font-bold text-red-500">500</h1>
      <h2 className="text-2xl font-semibold text-red-400">Something went wrong</h2>
      <p className="text-neutral-400 max-w-md my-4">
        We're experiencing an unexpected error. Please try again or return to the homepage.
      </p>
      <div className="flex gap-4 mt-6">
        <Button
          onClick={() => reset()}
          variant="outline"
          className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
        >
          Try Again
        </Button>
        <Button
          onClick={() => router.push('/')}
          className="bg-theme-500 hover:bg-theme-600 text-black"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>
    </div>
    </>
  )
}
