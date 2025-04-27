"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { Pencil, Trash2, Plus, ArrowLeft, Eye } from "lucide-react"
import useProductStore from "@/stores/useProductStore"
import useProductVariantStore from "@/stores/useProductVariantStore"
import toast from "react-hot-toast"
import type { ProductVariant } from "@/types/product-variant"

// Custom confirmation dialog component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: React.ReactNode
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductVariantsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { fetchProductById } = useProductStore()
  const { getProductVariantsByProduct, deleteProductVariant } = useProductVariantStore()

  const [product, setProduct] = useState<any>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  })

  useEffect(() => {
    if (productId) {
      const fetchProductAndVariants = async () => {
        setIsLoading(true)
        try {
          const productData = await fetchProductById(productId)
          setProduct(productData)

          // Use the Zustand store method to fetch variants
          const variantsData = await getProductVariantsByProduct(productId, pagination.pageNumber, pagination.pageSize)

          if (variantsData) {
            setVariants(variantsData.content)
            setPagination((prev) => ({
              ...prev,
              totalElements: variantsData.totalElements,
              totalPages: variantsData.totalPages,
            }))
          }
        } catch (error) {
          console.error("Failed to fetch product or variants:", error)
          toast.error("Failed to load product variants")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProductAndVariants()
    } else {
      router.push("/admin/product-list")
    }
  }, [productId, fetchProductById, getProductVariantsByProduct, pagination.pageNumber, pagination.pageSize, router])

  const handleAddVariant = () => {
    router.push(`/admin/product-variants/add?productId=${productId}`)
  }

  const handleViewVariant = (variantId: string) => {
    router.push(`/admin/product-variants/detail/${variantId}`)
  }

  const handleEditVariant = (variantId: string) => {
    router.push(`/admin/product-variants/edit/${variantId}`)
  }

  const handleDeleteVariant = (variant: ProductVariant) => {
    setVariantToDelete(variant)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!variantToDelete) return

    setIsLoading(true)
    try {
      const success = await deleteProductVariant(variantToDelete.id)

      if (success) {
        // Remove the deleted variant from the list
        setVariants(variants.filter((v) => v.id !== variantToDelete.id))
      }
    } catch (error) {
      console.error("Failed to delete variant:", error)
      toast.error("Failed to delete product variant")
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setVariantToDelete(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      pageNumber: newPage,
    }))
  }

  return (
    <DashboardShell>
      <DashboardHeader
        title="Product Variants"
        description={product ? `Manage variants for ${product.name}` : "Manage product variants"}
      >
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/product-list")}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
          <button
            onClick={handleAddVariant}
            className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </button>
        </div>
      </DashboardHeader>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Product Variants</h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
                <p className="ml-2 text-gray-500">Loading variants...</p>
              </div>
            ) : variants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No variants found for this product</p>
                <button
                  onClick={handleAddVariant}
                  className="flex items-center gap-1 mx-auto rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Add First Variant
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Scent</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Price</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{variant.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{variant.size}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{variant.scent}</td>
                        <td className="px-4 py-4 text-sm text-center text-gray-700">{variant.stock}</td>
                        <td className="px-4 py-4 text-sm text-center text-gray-700">${variant.price.toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewVariant(variant.id)}
                              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                              title="View Variant Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditVariant(variant.id)}
                              className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
                              title="Edit Variant"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(variant)}
                              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                              title="Delete Variant"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, pagination.pageNumber - 1))}
                        disabled={pagination.pageNumber === 1}
                        className={`px-3 py-1 rounded-md ${
                          pagination.pageNumber === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        }`}
                      >
                        Previous
                      </button>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            pagination.pageNumber === page
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.pageNumber + 1))}
                        disabled={pagination.pageNumber === pagination.totalPages}
                        className={`px-3 py-1 rounded-md ${
                          pagination.pageNumber === pagination.totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom confirmation dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this product variant? This action cannot be undone.</p>
        {variantToDelete && (
          <div className="mt-2 rounded-md bg-gray-50 p-3">
            <p>
              <strong>Variant:</strong> {variantToDelete.name}
            </p>
            <p>
              <strong>Size:</strong> {variantToDelete.size}
            </p>
            <p>
              <strong>Price:</strong> ${variantToDelete.price.toFixed(2)}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </DashboardShell>
  )
}
