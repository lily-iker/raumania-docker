"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import Hero from "@/components/home/Hero"
import TextAndImage from "@/components/home/TextAndImage/TextAndImage"
import VideoBlock from "@/components/home/VideoBlock/videoblock"
import { heroData, productsData, textAndImageSlices } from "./data/homeData"
import type { TextAndImageProps } from "@/components/home/TextAndImage/TextAndImage"
import Footer from "@/components/Footer"
import { InteractivePerfume } from "@/components/home/InteractivePerfume"
import ProductGrid from "@/components/ProductGrid/ProductGrid"
import useProductStore from "@/stores/useProductStore"
import { RelatedProducts } from "@/components/product/RelatedProducts"


type TextAndImageBundle = {
  slice_type: "text_and_image_bundle"
  slices: TextAndImageProps[]
}

// Define the type for the related products returned from the API
// Make sure it matches exactly what comes from the API
interface SearchProduct {
  id: string
  name: string
  description?: string
  price?: number
  imageUrl?: string
  thumbnailImage?: string
  minPrice?: number
  maxPrice?: number
}

// Define a type that matches what RelatedProducts component expects
interface RelatedProductType {
  id: string
  name: string
  thumbnailImage: string
  minPrice: number
  customizeUrl?: string
}

export default function Home() {
  const { fetchRelatedProducts } = useProductStore()
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductType[]>([])
  const bundledSlices = bundleTextAndImageSlices(textAndImageSlices)

  useEffect(() => {
    const loadRelatedProducts = async () => {
      const products = await fetchRelatedProducts(4)
      if (products) {
        // Transform the API response to match RelatedProductType
        const transformedProducts: RelatedProductType[] = products.map((product: SearchProduct) => ({
          id: product.id,
          name: product.name,
          thumbnailImage: product.thumbnailImage || "/placeholder.svg?height=150&width=150",
          minPrice: product.minPrice || product.price || 0, // Provide fallbacks
          customizeUrl: product.id ? `/product/${product.id}` : undefined,
        }))
        setRelatedProducts(transformedProducts)
      }
    }

    loadRelatedProducts()
  }, [fetchRelatedProducts])

  // Only render the related products section if we have products
  return (
    <>
      <Header />

      <div className="relative">
        <InteractivePerfume />

        <Hero
          heading={heroData.heading}
          body={heroData.body}
          buttonText={heroData.buttonText}
          buttonHref={heroData.buttonHref}
          color={heroData.color}
        />
      </div>

      <ProductGrid
        heading="Our Perfumes"
        body="Browse our luxurious collection of signature scents."
        products={relatedProducts}
      />

      {bundledSlices.map((slice, index) => {
        if ("slice_type" in slice && slice.slice_type === "text_and_image_bundle") {
          return (
            <div key={index}>
              {slice.slices.map((s, i) => (
                <TextAndImage key={i} {...s} />
              ))}
            </div>
          )
        }
        return null
      })}

    

      <VideoBlock youtubeID="VllN0yINA5A" />

      <Footer />
    </>
  )
}

function bundleTextAndImageSlices(slices: TextAndImageProps[]): (TextAndImageProps | TextAndImageBundle)[] {
  const res: (TextAndImageProps | TextAndImageBundle)[] = []

  for (const slice of slices) {
    const last = res.at(-1)
    if (last && "slice_type" in last && last.slice_type === "text_and_image_bundle") {
      last.slices.push(slice)
    } else {
      res.push({
        slice_type: "text_and_image_bundle",
        slices: [slice],
      })
    }
  }

  return res
}
