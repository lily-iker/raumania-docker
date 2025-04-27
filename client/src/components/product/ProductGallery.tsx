"use client"

import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"

interface ProductGalleryProps {
  name: string
  thumbnailImage: string
  images: ProductImage[]
}

interface ProductImage {
  id: string
  image: string
}

export function ProductGallery({ name, thumbnailImage, images }: ProductGalleryProps) {
  // Process images to ensure we have valid URLs
  const processedImages = images.map((img) => ({
    ...img,
    image: ensureValidImageUrl(img.image),
  }))

  // Add thumbnailImage to the beginning if it's not already included
  const allImages = [{ id: "thumbnail", image: ensureValidImageUrl(thumbnailImage) }, ...processedImages]

  // If no images are provided, use a placeholder
  if (!allImages || allImages.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden bg-white rounded-lg">
        <Image src="/placeholder.svg?height=600&width=600" alt={name} fill className="object-contain p-8" priority />
      </div>
    )
  }

  // Embla carousel hooks
  const [mainViewportRef, mainEmbla] = useEmblaCarousel({ loop: false })
  const [thumbViewportRef, thumbEmbla] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

  // State to track the currently selected index
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Sync the main carousel with the thumbnail carousel
  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainEmbla || !thumbEmbla) return
      mainEmbla.scrollTo(index)
    },
    [mainEmbla, thumbEmbla],
  )

  // Update selected index when main carousel scrolls
  const onSelect = useCallback(() => {
    if (!mainEmbla || !thumbEmbla) return
    setSelectedIndex(mainEmbla.selectedScrollSnap())
    thumbEmbla.scrollTo(mainEmbla.selectedScrollSnap())
  }, [mainEmbla, thumbEmbla, setSelectedIndex])

  // Set up the select handler when the carousels are ready
  useEffect(() => {
    if (!mainEmbla) return
    onSelect()
    mainEmbla.on("select", onSelect)
    thumbEmbla?.on("select", onSelect) // Also listen to thumbEmbla, in case it's relevant
    return () => {
      mainEmbla.off("select", onSelect)
      thumbEmbla?.off("select", onSelect)
    }
  }, [mainEmbla, onSelect, thumbEmbla])

  // Helper function to ensure image URLs are valid
  function ensureValidImageUrl(url: string): string {
    if (!url) return "/placeholder.svg?height=600&width=600"

    // If URL already starts with / or http, it's valid
    if (url.startsWith("/") || url.startsWith("http")) {
      return url
    }

    // Otherwise, use placeholder
    return "/placeholder.svg?height=600&width=600"
  }

  return (
    <div className="max-w-full">
      {/* Main carousel */}
      <div className="overflow-hidden rounded-lg bg-white" ref={mainViewportRef}>
        <div className="flex">
          {allImages.map((image, index) => (
            <div key={image.id} className="relative min-w-full flex-[0_0_100%]">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={image.image || "/placeholder.svg"}
                  alt={`${name} - View ${index + 1}`}
                  fill
                  className="object-contain p-8"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="mt-4 overflow-hidden" ref={thumbViewportRef}>
          <div className="flex gap-2 p-2">
            {allImages.map((image, index) => (
              <div
                key={image.id}
                onClick={() => onThumbClick(index)}
                className={`relative min-w-[80px] cursor-pointer flex-[0_0_80px] overflow-hidden rounded-md bg-white transition-opacity
                  ${selectedIndex === index ? "ring-2 ring-brand-pink" : "opacity-70 hover:opacity-100"}`}
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={image.image || "/placeholder.svg"}
                    alt={`${name} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
