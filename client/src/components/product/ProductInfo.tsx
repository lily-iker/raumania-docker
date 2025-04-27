"use client"

import { useState, useEffect } from "react"
import { HorizontalLine } from "@/components/Line"
import useCartStore from "@/stores/useCartStore"
import { useAuthStore } from "@/stores/useAuthStore"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
}

interface ProductInfoProps {
  name: string
  minPrice: number
  maxPrice: number
  variants?: ProductVariant[]
  description?: string
}

export function ProductInfo({ name, minPrice, maxPrice, variants = [], description }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addToCart } = useCartStore()
  const { authUser, fetchAuthUser } = useAuthStore()
  const router = useRouter()

  // Check authentication status on component mount
  useEffect(() => {
    fetchAuthUser()
  }, [fetchAuthUser])

  const currentPrice = selectedVariant
  ? selectedVariant.price
  : minPrice === maxPrice
    ? minPrice
    : `${minPrice} - ${maxPrice}`;
    const formattedPrice = typeof currentPrice === "number"
    ? new Intl.NumberFormat("en-US", {
        style:    "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(currentPrice)
    : currentPrice;

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!authUser) {
      toast.error("Please login to add items to your cart")
      const currentPath = window.location.pathname
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      return
    }

    if (!selectedVariant && variants.length > 0) {
      toast.error("Please select a variant")
      return
    }

    const variantId = selectedVariant ? selectedVariant.id : variants[0]?.id

    if (!variantId) {
      toast.error("No product variant available")
      return
    }

    setIsAddingToCart(true)
    try {
      await addToCart({
        productVariantId: variantId,
        quantity: quantity,
      })
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-serif font-light mb-4">{name}</h1>

      <HorizontalLine className="mb-6 stroke-2 text-stone-300" />

      <p className="text-3xl font-light mb-6">{formattedPrice}</p>

      {description && (
        <div className="prose prose-sm max-w-none mb-6">
          <p>{description}</p>
        </div>
      )}

      {variants.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Variants</h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                className={`border px-4 py-2 rounded-md transition-colors ${
                  selectedVariant?.id === variant.id
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
                onClick={() => setSelectedVariant(variant)}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Quantity</h3>
        <div className="flex items-center">
          <button
            onClick={decrementQuantity}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="w-16 h-10 border-t border-b border-gray-300 text-center"
          />
          <button
            onClick={incrementQuantity}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="button-cutout group inline-flex items-center bg-gradient-to-b from-brand-purple to-brand-yellowbutton from-25% to-75% bg-[length:100%_400%] font-bold text-black transition-[filter,background-position] duration-300 hover:bg-bottom hover:text-black py-5 px-6"
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  )
}
