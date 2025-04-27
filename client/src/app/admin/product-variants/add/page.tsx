"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import useProductVariantStore from "@/stores/useProductVariantStore"
import useProductStore from "@/stores/useProductStore"
import type { CreateProductVariantRequest } from "@/types/product-variant"

export default function AddProductVariantPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")

  const { createProductVariant, isLoading } = useProductVariantStore()
  // Replace the line with getProductById with fetchProductById
  const { fetchProductById } = useProductStore()

  const [product, setProduct] = useState<any>(null)
  const [formData, setFormData] = useState<CreateProductVariantRequest>({
    productId: productId || "",
    name: "",
    size: "",
    scent: "",
    stock: 0,
    price: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // And update the useEffect to use fetchProductById instead of getProductById
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const productData = await fetchProductById(productId)
          setProduct(productData)
        } catch (error) {
          console.error("Failed to fetch product:", error)
        }
      }

      fetchProduct()
    } else {
      router.push("/admin/product-list")
    }
  }, [productId, fetchProductById, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Handle numeric inputs
    if (name === "price" || name === "stock") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Variant name is required"
    }

    if (!formData.size.trim()) {
      newErrors.size = "Size is required"
    }

    if (!formData.scent.trim()) {
      newErrors.scent = "Scent is required"
    }

    if (formData.stock < 0) {
      newErrors.stock = "Stock cannot be negative"
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createProductVariant(formData)
      router.push(`/admin/product-list`)
    } catch (error) {
      console.error("Failed to create product variant:", error)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        title="Add Product Variant"
        description={product ? `Adding variant for ${product.name}` : "Adding new product variant"}
      >
        <Button  variant="outline" size="sm" onClick={() => router.push("/admin/product-list")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </DashboardHeader>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Variant Information</CardTitle>
            <CardDescription>Enter the details for the new product variant</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Variant Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. 50ml Eau de Parfum"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="e.g. 50ml, 100ml"
                  className={errors.size ? "border-red-500" : ""}
                />
                {errors.size && <p className="text-sm text-red-500">{errors.size}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scent">Scent</Label>
                <Input
                  id="scent"
                  name="scent"
                  value={formData.scent}
                  onChange={handleInputChange}
                  placeholder="e.g. Floral, Woody"
                  className={errors.scent ? "border-red-500" : ""}
                />
                {errors.scent && <p className="text-sm text-red-500">{errors.scent}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    onChange={handleInputChange}
                    min="0"
                    className={errors.stock ? "border-red-500" : ""}
                  />
                  {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-4 border-t p-6">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/product-list")}>
                Cancel
              </Button>
              <Button className="bg-blue-500 text-white hover:bg-blue-600" type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Variant"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardShell>
  )
}
