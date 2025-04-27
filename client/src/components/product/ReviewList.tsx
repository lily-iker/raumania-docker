

import Image from "next/image"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { ButtonLink } from "@/components/ButtonLink"
import useProductStore from "@/stores/useProductStore"
import { useEffect } from "react"

export function RelatedProducts() {
  const { random12Products, fetchRandom12Products, isLoading } = useProductStore()

  useEffect(() => {
    fetchRandom12Products()
  }, [fetchRandom12Products])

  return (
    <Bounded className="bg-white py-16">
      <Heading as="h2" size="md" className="mb-8 text-center">
        YOU MAY ALSO LIKE
      </Heading>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {(random12Products.slice(0, 4) || Array.from({ length: 4 })).map((product, index) => (
              <div key={product?.id || index} className="group relative">
                <div className="aspect-square overflow-hidden bg-brand-cream rounded-lg">
                  <Image
                    src={product?.thumbnailImage || `/placeholder.svg?height=300&width=300&text=Related ${index + 1}`}
                    alt={product?.name || `Related Product ${index + 1}`}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-4 text-center font-medium">{product?.name || `Related Fragrance ${index + 1}`}</h3>
                <p className="text-center text-gray-600">
                  {product?.price
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      }).format(product.price)
                    : "$99.00"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ButtonLink href="/shop" color="orange">
              View All Products
            </ButtonLink>
          </div>
        </>
      )}
    </Bounded>
  )
}
