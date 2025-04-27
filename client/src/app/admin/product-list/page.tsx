"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Layers } from "lucide-react"
import type { ProductPaginationParams } from "@/types/pagination"
import useProductStore from "@/stores/useProductStore"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { ProductFilters } from "@/components/admin/product-filters"

// Helper function to ensure image URLs are properly formatted for next/image
const getImageUrl = (src: string | undefined | null): string => {
  if (!src) return "/placeholder.svg?height=64&width=64"

  // If it's already a valid URL or starts with a slash, return it
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src
  }

  // Otherwise, add a leading slash to make it a valid path
  return `/${src}`
}

export default function ProductListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { products, totalProducts, totalPages, currentPage, pageSize, isLoading, error, fetchProducts, deleteProduct } =
    useProductStore()

  const [sortField, setSortField] = useState<string>("name,asc")

  // Get query params with null safety
  const pageNumber = searchParams ? Number(searchParams.get("page") || "1") : 1
  const searchName = searchParams ? searchParams.get("name") || "" : ""
  const minPrice = searchParams ? Number(searchParams.get("minPrice") || "0") : 0
  const maxPrice = searchParams ? Number(searchParams.get("maxPrice") || "1000000") : 1000000
  const brandName = searchParams ? searchParams.get("brandName") || null : null
  const isActive = searchParams
    ? searchParams.get("isActive") === "true"
      ? true
      : searchParams.get("isActive") === "false"
        ? false
        : null
    : null

  // Fetch products on mount and when params change
  useEffect(() => {
    const params: Partial<ProductPaginationParams> = {
      pageNumber,
      pageSize,
      name: searchName || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      brandName: brandName || undefined,
      isActive: isActive !== null ? isActive : undefined,
      sort: sortField,
    }

    fetchProducts(params)
  }, [fetchProducts, pageNumber, pageSize, searchName, minPrice, maxPrice, brandName, isActive, sortField])

  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return

    if (searchParams) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", page.toString())
      router.push(`/admin/product-list?${params.toString()}`)
    } else {
      router.push(`/admin/product-list?page=${page}`)
    }
  }

  // Handle product actions
  const handleViewProduct = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/product/edit/${productId}`)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId)
    }
  }

  const handleAddProduct = () => {
    router.push("/admin/product/add")
  }

  // Handle sorting
  const handleSort = (field: string) => {
    const currentDirection = sortField.includes("asc") ? "desc" : "asc"
    setSortField(`${field},${currentDirection}`)
  }

  const handleViewProductVariants = (productId: string) => {
    router.push(`/admin/product/${productId}/variants`)
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Products" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">All Product List</h1>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Add Product
          </button>
        </div>

        {/* Product Filters */}
        <ProductFilters />

        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Product Name
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    Price
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
                        <p className="mt-2">Loading products...</p>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden">
                            <Image
                              src={getImageUrl(product.thumbnailImage) || "/placeholder.svg"}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        ${product.price ? product.price.toFixed(2) : (product.minPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="View Product"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
                            title="Edit Product"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewProductVariants(product.id)}
                            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                            title="Manage Product Variants"
                          >
                            <Layers className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Showing {products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
