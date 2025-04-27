"use client"

import { useEffect, useState } from "react"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { ButtonLink } from "@/components/ButtonLink"
import axios from "@/lib/axios-custom"
import { SlideIn } from "../ProductGrid/SlideIn"
import { PerfumeProduct } from "../ProductGrid/PerfumeProduct"

interface RelatedProduct {
  id: string
  name: string
  thumbnailImage: string
  minPrice: number
  customizeUrl?: string
}

interface RelatedProductsProps {
  relatedProducts?: RelatedProduct[]
}

export function RelatedProducts({ relatedProducts: initialProducts = [] }: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(initialProducts.length === 0)

  useEffect(() => {
    // If we already have products from props, don't fetch
    if (initialProducts.length > 0) {
      // Ensure all image URLs are properly formatted
      const formattedProducts = initialProducts.map((product) => ({
        ...product,
        thumbnailImage: ensureValidImageUrl(product.thumbnailImage),
      }))
      setProducts(formattedProducts)
      return
    }

    const fetchRelatedProducts = async () => {
      setIsLoading(true)
      try {
        const res = await axios.get("/api/product/random-12")
        const fetchedProducts = res.data.result?.slice(0, 4) || []

        // Ensure all image URLs are properly formatted
        const formattedProducts = fetchedProducts.map((product: RelatedProduct) => ({
          ...product,
          thumbnailImage: ensureValidImageUrl(product.thumbnailImage),
        }))

        setProducts(formattedProducts)
      } catch (err) {
        console.error("Failed to fetch related products:", err)
        // Set some placeholder products if fetch fails
        setProducts(
          Array.from({ length: 4 }).map((_, i) => ({
            id: `placeholder-${i}`,
            name: "Velvet Bloom",
            thumbnailImage: "/placeholder.svg?height=150&width=150",
            minPrice: 50000000,
          })),
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [initialProducts])

  // Helper function to ensure image URLs are valid
  function ensureValidImageUrl(url: string): string {
    if (!url) return "/placeholder.svg?height=150&width=150"

    // If URL already starts with / or http, it's valid
    if (url.startsWith("/") || url.startsWith("http")) {
      return url
    }

    // Otherwise, add a leading slash
    return `/placeholder.svg?height=150&width=150`
  }

  return (
    <Bounded className="bg-texture bg-brand-cream">
      <SlideIn>
        <Heading className="text-center mb-6" as="h2" size="md">
          YOU MAY ALSO LIKE
        </Heading>
      </SlideIn>

      <SlideIn delay={0.1}>
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <p className="text-base">Discover more fragrances that complement your selection.</p>
        </div>
      </SlideIn>

      {isLoading ? (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mx-auto w-full max-w-72 px-8 pt-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-40 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <PerfumeProduct key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <ButtonLink href="/shop" color="orange">
          View All Products
        </ButtonLink>
      </div>
    </Bounded>
  )
}
