"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import { useAuthStore } from "@/stores/useAuthStore"
import { useRouter } from "next/navigation"

interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productVariantId: string
  onReviewSubmitted: () => void
  // For editing existing review
  reviewToEdit?: {
    id: string
    rating: number
    content: string
  } | null
  isEditing?: boolean
}

export function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productVariantId,
  onReviewSubmitted,
  reviewToEdit = null,
  isEditing = false,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { authUser } = useAuthStore()
  const router = useRouter()

  // Set initial values if editing an existing review
  useEffect(() => {
    if (reviewToEdit) {
      setRating(reviewToEdit.rating)
      setContent(reviewToEdit.content)
    } else {
      // Reset form when not editing
      setRating(5)
      setContent("")
    }
  }, [reviewToEdit, isOpen])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isOpen && !authUser) {
      toast.error("Please log in to write a review")
      onClose()
      router.push("/login")
    }
  }, [isOpen, authUser, onClose, router])

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authUser) {
      toast.error("Please log in to submit a review")
      onClose()
      router.push("/login")
      return
    }

    if (rating < 1) {
      toast.error("Please select a rating")
      return
    }

    if (!content.trim()) {
      toast.error("Please enter a review")
      return
    }

    try {
      setIsSubmitting(true)

      const reviewData = {
        productId,
        productVariantId,
        rating,
        content,
      }

      if (isEditing && reviewToEdit) {
        // Update existing review
        await axios.put("/api/review/my", {
          reviewId: reviewToEdit.id,
          rating,
          content,
        })
        toast.success("Review updated successfully!")
      } else {
        // Create new review
        await axios.post("/api/review/my", reviewData)
        toast.success("Review submitted successfully!")
      }

      setContent("")
      setRating(5)
      onReviewSubmitted()
      onClose()
    } catch (error: any) {
      console.error("Error submitting review:", error)
      toast.error(error.response?.data?.message || "Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-center text-xl font-medium">{isEditing ? "Edit Your Review" : "Write a Review"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">Your Rating</label>
            <div className="flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="p-1 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-8 w-8 ${star <= rating ? "fill-current text-yellow-400" : "text-gray-300"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="review-content" className="mb-2 block text-sm font-medium text-gray-700">
              Your Review
            </label>
            <textarea
              id="review-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Share your experience with this fragrance..."
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
