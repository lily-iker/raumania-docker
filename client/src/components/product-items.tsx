"use client"

interface ProductItemProps {
  product: {
    name: string
    price: number
  }
}

export default function ProductItem({ product }: ProductItemProps) {
  return (
    <li className="border p-2 my-2 rounded-md bg-gray-100">
      {product.name} - ${product.price}
    </li>
  )
}

