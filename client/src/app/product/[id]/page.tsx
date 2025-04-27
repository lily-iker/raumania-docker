"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Bounded } from "@/components/Bounded"
import { ButtonLink } from "@/components/ButtonLink"
import { SVGFilters } from "@/components/SVGFilters"
import { ProductGallery } from "@/components/product/ProductGallery"
import { ProductInfo } from "@/components/product/ProductInfo"
import { ProductDescription } from "@/components/product/ProductDescription"
import { ReviewSection } from "@/components/product/ReviewSection"
import { RelatedProducts } from "@/components/product/RelatedProducts"
import axios from "@/lib/axios-custom"
import { useAuthStore } from "@/stores/useAuthStore"
import { Product } from "@/types"
import { Header } from "@/components/Header"
import { NormalFooter } from "@/components/NormalFooter"

export default function ProductDetailPage() {
  // Use useParams hook instead of accessing params directly
  const params = useParams()
  const productId = params?.id as string

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { fetchAuthUser } = useAuthStore()

  // Fetch auth user on component mount
  useEffect(() => {
    fetchAuthUser()
  }, [fetchAuthUser])

  // Function to fetch product data
  const fetchProductData = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(`/api/product/${productId}`)

      // Process the product data to ensure all image URLs are valid
      const product = res.data.result

      // Fix product images
      if (product.productImages) {
        product.productImages = product.productImages.map((img: any) => ({
          ...img,
          image: ensureValidImageUrl(img.image),
        }))
      }

      // Fix related product images
      if (product.relatedProducts) {
        product.relatedProducts = product.relatedProducts.map((related: any) => ({
          ...related,
          thumbnailImage: ensureValidImageUrl(related.thumbnailImage),
        }))
      }

      setCurrentProduct(product)
      setError(null)
    } catch (err) {
      console.error("Failed to load product", err)
      setError("Failed to load product details")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch product on component mount
  useEffect(() => {
    if (productId) {
      fetchProductData()
    }
  }, [productId])

  // Helper function to ensure image URLs are valid
  function ensureValidImageUrl(url: string): string {
    if (!url) return "/placeholder.svg?height=300&width=300"

    // If URL already starts with / or http, it's valid
    if (url.startsWith("/") || url.startsWith("http")) {
      return url
    }

    // Otherwise, add a leading slash
    return `/placeholder.svg?height=300&width=300`
  }

  // Handle review submission
  const handleReviewSubmitted = () => {
    // Refresh product data to show the new review
    fetchProductData()
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-gray">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 bg-brand-gray bg-brand-grayborder-t-pink-300"></div>
          <p className="mt-4 font-serif text-gray-600">Loading your fragrance experience...</p>
        </div>
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9f3f3]">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-md backdrop-blur-sm">
          <h2 className="mb-4 font-serif text-2xl font-light tracking-wide">Product Not Found</h2>
          <p className="mb-6 text-gray-600">We couldn't find the fragrance you're looking for.</p>
          <ButtonLink href="/" color="orange" size="md">
            Explore Our Collection
          </ButtonLink>
        </div>
      </div>
    )
  }

  // Get the first product variant ID for reviews
  const firstVariantId =
    currentProduct.productVariants && currentProduct.productVariants.length > 0
      ? currentProduct.productVariants[0].id
      : ""

  return (
    <>
    <Header/>

    <div className="h-24 md:h-32 bg-brand-gray" /> 

    <div className="min-h-screen bg-brand-gray bg-opacity-95 bg-[url('/subtle-pattern.png')] bg-fixed">
      <SVGFilters />

      {error && (
        <div className="bg-pink-50 p-4 text-center text-pink-800 shadow-sm">
          <p className="text-sm font-light">
            Note: There was an issue loading some product data. Some information might be incomplete.
          </p>
        </div>
      )}

      <Bounded className="pt-16 pb-8">
        <div className="mb-8">
          <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center font-light transition-colors hover:text-pink-500">
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-pink-200">/</span>
                  <a href="/shop" className="font-light transition-colors hover:text-pink-500">
                    Fragrances
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-pink-200">/</span>
                  <span className="text-gray-700">{currentProduct.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
          <ProductGallery
            name={currentProduct.name}
            thumbnailImage={currentProduct.thumbnailImage}
            images={currentProduct.productImages || []}
          />
          <ProductInfo
            name={currentProduct.name}
            minPrice={currentProduct.minPrice}
            maxPrice={currentProduct.maxPrice}
            variants={currentProduct.productVariants || []}
            description={currentProduct.description}
          />
        </div>
      </Bounded>

      <ProductDescription
        name={currentProduct.name}
        description={currentProduct.description}
        productMaterial={currentProduct.productMaterial}
        inspiration={currentProduct.inspiration}
        usageInstructions={currentProduct.usageInstructions}
      />

      <div className="bg-brand-gray py-16 shadow-inner">
        <ReviewSection
          reviews={currentProduct.fiveLatestReviews || []}
          statistics={
            currentProduct.reviewStatistic || {
              averageRating: 0,
              totalReviews: 0,
              fiveStarReviews: 0,
              fourStarReviews: 0,
              threeStarReviews: 0,
              twoStarReviews: 0,
              oneStarReviews: 0,
            }
          }
          productId={currentProduct.id}
          productVariantId={firstVariantId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>

      <div className="bg-white py-16">
        <RelatedProducts relatedProducts={currentProduct.relatedProducts || []} />
      </div>

    </div>
    <NormalFooter/>

    </>
  )
}