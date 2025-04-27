"use client"

import Image from "next/image"
import clsx from "clsx"
import { Scribble } from "./Scribble"
import Link from "next/link"
import { HorizontalLine, VerticalLine } from "../Line"

type ProductGrid = {
  id: string
  name: string
  thumbnailImage: string
  minPrice: number
  customizeUrl?: string
}

type Props = {
  product: ProductGrid
}

const VERTICAL_LINE_CLASSES =
  "absolute top-0 h-full stroke-2 text-stone-300 transition-colors group-hover:text-stone-400"

const HORIZONTAL_LINE_CLASSES = "-mx-8 stroke-2 text-stone-300 transition-colors group-hover:text-stone-400"

export function PerfumeProduct({ product }: Props) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(product.minPrice)

  // Ensure image URL is properly formatted
  const imageUrl =
    product.thumbnailImage && (product.thumbnailImage.startsWith("/") || product.thumbnailImage.startsWith("http"))
      ? product.thumbnailImage
      : `/placeholder.svg?height=150&width=150`

  return (
    <div className="group relative mx-auto w-full max-w-72 px-8 pt-4 transition-transform duration-300 hover:scale-105">
      <VerticalLine className={clsx(VERTICAL_LINE_CLASSES, "left-4")} />
      <VerticalLine className={clsx(VERTICAL_LINE_CLASSES, "right-4")} />
      <HorizontalLine className={HORIZONTAL_LINE_CLASSES} />

      <div className="flex items-center justify-between text-xs">
        <span>{price}</span>
      </div>

      {/* Square image container with fixed aspect ratio */}
      <div className="-mb-1 overflow-hidden py-4 relative">
        <Scribble className="absolute inset-0 h-full w-full" color="#000" />

        {/* Square container with aspect ratio */}
        <div className="aspect-square w-full relative mx-auto overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain mx-auto transform-gpu transition-transform duration-500 ease-in-out group-hover:scale-125"
          />
        </div>
      </div>

      <HorizontalLine className={HORIZONTAL_LINE_CLASSES} />

      <h3 className="my-2 text-center font-serif leading-tight text-base line-clamp-2">{product.name}</h3>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Link
          href={`/product/${product.id}`}
          className="button-cutout group mx-4 inline-flex items-center bg-gradient-to-b from-brand-orange to-brand-lime from-25% to-75% bg-[length:100%_400%] font-bold text-black transition-[filter,background-position] duration-300 hover:bg-bottom hover:text-black py-2 px-4"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
