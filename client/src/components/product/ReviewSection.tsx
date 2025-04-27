"use client"

import { useState } from "react"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { Star, Edit2, Trash2 } from "lucide-react"
import { WriteReviewModal } from "./WriteReviewModal"
import { useAuthStore } from "@/stores/useAuthStore"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Review {
  id: string
  productId: string
  productVariantId: string
  userId: string
  userName: string | null
  rating: number
  content: string
}

interface ReviewStatistic {
  averageRating: number
  totalReviews: number
  fiveStarReviews: number
  fourStarReviews: number
  threeStarReviews: number
  twoStarReviews: number
  oneStarReviews: number
}

interface ReviewSectionProps {
  reviews: Review[]
  statistics: ReviewStatistic
  productId: string
  productVariantId: string
  onReviewSubmitted?: () => void
}

export function ReviewSection({
  reviews = [],
  statistics,
  productId,
  productVariantId,
  onReviewSubmitted = () => {},
}: ReviewSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { authUser } = useAuthStore()
  const router = useRouter()

  const handleOpenModal = () => {
    if (!authUser) {
      toast.error("Please log in to write a review")
      router.push("/login")
      return
    }
    setIsEditing(false)
    setReviewToEdit(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setReviewToEdit(null)
    setIsEditing(false)
  }

  const handleReviewSubmitted = () => {
    onReviewSubmitted()
  }

  const handleEditReview = (review: Review) => {
    if (!authUser) {
      toast.error("Please log in to edit your review")
      router.push("/login")
      return
    }

    if (authUser.id !== review.userId) {
      toast.error("You can only edit your own reviews")
      return
    }

    setReviewToEdit(review)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleDeleteReview = async (reviewId: string, userId: string) => {
    if (!authUser) {
      toast.error("Please log in to delete your review")
      router.push("/login")
      return
    }

    if (authUser.id !== userId) {
      toast.error("You can only delete your own reviews")
      return
    }

    if (!window.confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      await axios.delete(`/api/review/my/${reviewId}`)
      toast.success("Review deleted successfully")
      onReviewSubmitted()
    } catch (error: any) {
      console.error("Error deleting review:", error)
      toast.error(error.response?.data?.message || "Failed to delete review. Please try again.")
    }
  }

  const hasNoReviews = !reviews || reviews.length === 0

  return (
    <Bounded className="bg-brand-cream py-16">
      <Heading as="h2" size="md" className="mb-8 text-center">
        CUSTOMER REVIEWS
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm col-span-1 md:col-span-3 lg:col-span-1">
          <h3 className="text-xl font-medium mb-4">Customer Ratings</h3>
          <div className="flex items-center mb-4">
            <div className="text-3xl font-light mr-2">{statistics?.averageRating?.toFixed(1) || "0.0"}</div>
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => {
                const rating = statistics?.averageRating || 0
                const filled = i < Math.floor(rating)
                const half = i === Math.floor(rating) && rating % 1 >= 0.5

                return (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${filled ? "fill-current" : half ? "fill-current text-yellow-400" : "text-gray-300"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )
              })}
            </div>
            <div className="ml-2 text-sm text-gray-500">({statistics?.totalReviews || 0} reviews)</div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count =
                star === 5
                  ? statistics?.fiveStarReviews || 0
                  : star === 4
                    ? statistics?.fourStarReviews || 0
                    : star === 3
                      ? statistics?.threeStarReviews || 0
                      : star === 2
                        ? statistics?.twoStarReviews || 0
                        : statistics?.oneStarReviews || 0

              const percentage = statistics?.totalReviews > 0 ? Math.round((count / statistics.totalReviews) * 100) : 0

              return (
                <div key={star} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{star} star</div>
                  <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">{count}</div>
                </div>
              )
            })}
          </div>
        </div>

        {reviews && reviews.length > 0 ? (
          // Show actual reviews if available
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Show edit/delete buttons only for the user's own reviews */}
                {authUser && authUser.id === review.userId && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-1 text-gray-500 hover:text-orange-500"
                      aria-label="Edit review"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id, review.userId)}
                      className="p-1 text-gray-500 hover:text-red-500"
                      aria-label="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-2">{review.content}</p>
              <p className="text-sm text-gray-500">{review.userName || "Anonymous"}</p>
            </div>
          ))
        ) : (
          // Show placeholder cards when no reviews
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-gray-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5" />
                  ))}
                </div>
              </div>
              <p className="text-gray-400 mb-2">Be the first to review this product!</p>
              <p className="text-sm text-gray-400">Share your experience with this fragrance</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hidden md:block">
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={handleOpenModal}
                  className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900"
                >
                  Write a Review
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleOpenModal}
          className={`rounded-full ${hasNoReviews ? "bg-orange-500 hover:bg-orange-600" : "bg-black hover:bg-gray-900"} px-6 py-3 text-sm font-medium text-white transition-colors`}
        >
          Write a Review
        </button>
      </div>

      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productId={productId}
        productVariantId={productVariantId}
        onReviewSubmitted={handleReviewSubmitted}
        reviewToEdit={reviewToEdit}
        isEditing={isEditing}
      />
    </Bounded>
  )
}
