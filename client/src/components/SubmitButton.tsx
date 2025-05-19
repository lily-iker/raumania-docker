'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useFragranceCustomizer } from '@/app/build/context'
import { useAuthStore } from '@/stores/useAuthStore'
import toast from 'react-hot-toast'

function SubmitButton() {
  const { selectedBottle, selectedColor, selectedScent, selectedCap } = useFragranceCustomizer()
  const { fetchAuthUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    await fetchAuthUser()
    const { authUser: user } = useAuthStore.getState()

    console.log('After fetchAuthUser:', user)

    if (!user?.email) {
      toast('You must be logged in to submit a design.', { icon: '⚠️' })
      return
    }

    try {
      // Use fetch to send data to the API
      const response = await fetch('/api/send-customization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bottle: selectedBottle,
          color: selectedColor,
          scent: selectedScent,
          cap: selectedCap,
          senderEmail: user.email,
        }),
      })

      if (response.ok) {
        // If the request is successful
        setSuccess(true)
        toast.success('Customization request sent successfully!')
      } else {
        // Handle error response
        console.error('Error sending customization:', await response.text())
        setSuccess(false)
        toast.error('Failed to send customization request.')
      }
    } catch (error) {
      console.error('Error sending customization:', error)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSubmit} className="w-full mt-4">
      {loading ? 'Sending...' : success ? 'Sent!' : 'Send to Admin'}
    </Button>
  )
}

export default SubmitButton
