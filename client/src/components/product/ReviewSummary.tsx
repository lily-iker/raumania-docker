import { ReviewStars } from "./ReviewStars"

type ReviewStatistics = {
  averageRating: number
  totalReviews: number
  fiveStarReviews: number
  fourStarReviews: number
  threeStarReviews: number
  twoStarReviews: number
  oneStarReviews: number
}

type ReviewSummaryProps = {
  statistics: ReviewStatistics
  onWriteReviewClick: () => void
}

export function ReviewSummary({ statistics, onWriteReviewClick }: ReviewSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="flex flex-col items-center justify-center md:items-start">
        <div className="text-5xl font-light">{statistics?.averageRating.toFixed(1) || "0.0"}</div>
        <div className="mt-2 flex">
          <ReviewStars rating={statistics?.averageRating || 0} size="lg" />
        </div>
        <p className="mt-2 text-sm text-gray-500">Based on {statistics?.totalReviews || 0} reviews</p>
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count =
            rating === 5
              ? statistics?.fiveStarReviews || 0
              : rating === 4
                ? statistics?.fourStarReviews || 0
                : rating === 3
                  ? statistics?.threeStarReviews || 0
                  : rating === 2
                    ? statistics?.twoStarReviews || 0
                    : statistics?.oneStarReviews || 0

          const percentage = statistics?.totalReviews ? (count / statistics.totalReviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="w-3 text-xs font-medium">{rating}</div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-black"
                  style={{
                    width: `${percentage}%`,
                  }}
                ></div>
              </div>
              <div className="w-8 text-right text-xs text-gray-500">{count}</div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col items-center justify-center gap-4 md:items-end">
        <button 
          onClick={onWriteReviewClick}
          className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900 md:w-auto"
        >
          Write a Review
        </button>
        <p className="text-xs text-gray-500">Share your experience with this fragrance</p>
      </div>
    </div>
  )
}
