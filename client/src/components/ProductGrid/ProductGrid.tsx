import type { FC } from "react"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { SlideIn } from "./SlideIn"
import { PerfumeProduct } from "./PerfumeProduct"
import { Product } from "@/types"

export type ProductGridProps = {
  heading: string
  body: string
  products: Product[]
}

const ProductGrid: FC<ProductGridProps> = ({ heading, body, products }) => {
  return (
    <Bounded className="bg-texture bg-brand-gray">
      <SlideIn>
        <Heading className="text-center ~mb-6/10" as="h2">
          {heading}
        </Heading>
      </SlideIn>

      <SlideIn>
        <div className="text-center ~mb-8/12 max-w-2xl mx-auto">
          <p className="~text-base/xl">{body}</p>
        </div>
      </SlideIn>

      <div className="grid w-full grid-cols-1 ~gap-4/8 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <PerfumeProduct key={product.id} product={product} />
        ))}
      </div>
    </Bounded>
  )
}

export default ProductGrid

