"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { ArrowLeft, Pencil } from "lucide-react"
import useProductVariantStore from "@/stores/useProductVariantStore"
import toast from "react-hot-toast"

export default function ProductVariantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const variantId = params?.id as string

  const { selectedVariant, getProductVariantById, clearSelectedVariant } = useProductVariantStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVariantDetails = async () => {
      if (!variantId) {
        router.push("/admin/product-list")
        return
      }

      setIsLoading(true)
      try {
        await getProductVariantById(variantId)
      } catch (error) {
        console.error("Failed to fetch variant details:", error)
        toast.error("Failed to load variant details")
        router.push("/admin/product-list")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVariantDetails()

    // Cleanup function to clear selected variant when leaving the page
    return () => {
      clearSelectedVariant()
    }
  }, [variantId, getProductVariantById, clearSelectedVariant, router])

  const handleEditVariant = () => {
    router.push(`/admin/product-variants/edit/${variantId}`)
  }

  const handleBackToVariants = () => {
    if (selectedVariant?.productId) {
      router.push(`/admin/product-variants/${selectedVariant.productId}`)
    } else {
      router.push("/admin/product-list")
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader title="Product Variant Details" description="Loading variant information...">
          <button
            onClick={handleBackToVariants}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </DashboardHeader>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
          <p className="ml-2 text-gray-500">Loading variant details...</p>
        </div>
      </DashboardShell>
    )
  }

  if (!selectedVariant) {
    return (
      <DashboardShell>
        <DashboardHeader title="Product Variant Details" description="Variant not found">
          <button
            onClick={() => router.push("/admin/product-list")}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </DashboardHeader>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">Variant not found or has been deleted.</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Product Variant Details" description={`Details for ${selectedVariant.name}`}>
        <div className="flex gap-2">
          <button
            onClick={handleBackToVariants}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Variants
          </button>
          <button
            onClick={handleEditVariant}
            className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Pencil className="h-4 w-4" />
            Edit Variant
          </button>
        </div>
      </DashboardHeader>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Variant Information</h2>
          </div>

          <div className="p-6">
            <div className="grid gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedVariant.name}</h3>
                  <p className="text-gray-500 mt-1">Product ID: {selectedVariant.productId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">${selectedVariant.price.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-medium">{selectedVariant.stock} units</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Attributes</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Size</p>
                        <p>{selectedVariant.size || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Scent</p>
                        <p>{selectedVariant.scent || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
