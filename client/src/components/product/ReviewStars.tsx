import { Star } from "lucide-react"

type ReviewStarsProps = {
  rating: number
  size?: "sm" | "md" | "lg"
}

export function ReviewStars({ rating, size = "md" }: ReviewStarsProps) {
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass[size]} ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
          fill={star <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  )
}
