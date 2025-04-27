import { format } from "date-fns"
import { Star, StarHalf } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentReview {
  id: string
  productName: string
  customerName: string
  rating: number
  content: string
  date: string
}

interface RecentReviewsProps {
  reviews: RecentReview[]
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto max-h-[300px]">
        {reviews.map((review) => (
          <div key={review.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
            <Avatar className="hidden sm:flex">
              <AvatarFallback>
                {review.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <p className="font-medium truncate max-w-[150px]">{review.customerName}</p>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {format(new Date(review.date), "MMM dd, yyyy")}
                </p>
              </div>
              <p className="text-sm font-medium truncate">{review.productName}</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => {
                  const ratingValue = i + 1
                  return (
                    <span key={i} className="text-amber-400">
                      {ratingValue <= review.rating ? (
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      ) : ratingValue - 0.5 === review.rating ? (
                        <StarHalf className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      ) : (
                        <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </span>
                  )
                })}
              </div>
              <p className="text-xs sm:text-sm line-clamp-2">{review.content}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
