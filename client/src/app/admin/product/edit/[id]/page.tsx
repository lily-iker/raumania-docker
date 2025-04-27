"use client"

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Upload, X, Loader2, Trash2 } from "lucide-react"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import useProductStore from "@/stores/useProductStore"
import toast from "react-hot-toast"
import axios from "@/lib/axios-custom"

interface ProductImage {
  id: string  
  image: string
}

// 1. Add a new interface for brand dropdown data
interface BrandDropdownItem {
  id: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string;
  const { fetchProductById, isLoading } = useProductStore()
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [productMaterial, setProductMaterial] = useState("")
  const [inspiration, setInspiration] = useState("")
  const [usageInstructions, setUsageInstructions] = useState("")
  const [brand, setBrand] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Thumbnail image state
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

  // Additional images state
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  const [isDeletingImage, setIsDeletingImage] = useState<string | null>(null)

  // 2. Add state for brand dropdown data
  const [brands, setBrands] = useState<BrandDropdownItem[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")

  // Fetch product data on component mount
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = await fetchProductById(productId)
        if (product) {
          // Populate form with product data
          setName(product.name)
          setDescription(product.description)
          setProductMaterial(product.productMaterial || "")
          setInspiration(product.inspiration || "")
          setUsageInstructions(product.usageInstructions || "")
          setBrand(product.brand?.name || "")

          // Set the brand ID if available
          if (product.brand?.id) {
            setSelectedBrandId(product.brand.id)
          }

          setIsActive(product.isActive)

          // Set thumbnail image preview if available
          if (product.thumbnailImage) {
            setExistingImageUrl(product.thumbnailImage)
            setThumbnailPreview(product.thumbnailImage)
          }

          // Set existing additional images
          if (product.productImages && product.productImages.length > 0) {
            setExistingImages(product.productImages)
          }
        } else {
          toast.error("Product not found")
          router.back()
        }
      } catch (error) {
        console.error("Error loading product:", error)
        toast.error("Failed to load product")
      } finally {
        setIsPageLoading(false)
      }
    }

    loadProduct()
  }, [fetchProductById, productId, router])

  // 3. Add a function to fetch brands after the existing useEffect
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get("/api/brand/name")
        if (response.data.result) {
          setBrands(response.data.result)
        }
      } catch (error) {
        console.error("Error fetching brands:", error)
        toast.error("Failed to load brand list")
      }
    }

    fetchBrands()
  }, [])

  // Handle thumbnail image upload
  const handleThumbnailUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setThumbnailImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 4. Update the handleAdditionalImagesUpload function to fix the image preview issue
  const handleAdditionalImagesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: File[] = [...additionalImages]
    const newPreviews: string[] = [...additionalPreviews]

    Array.from(files).forEach((file) => {
      newImages.push(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        setAdditionalPreviews([...newPreviews])
      }
      reader.readAsDataURL(file)
    })

    setAdditionalImages(newImages)
  }

  // Remove a new additional image
  const removeAdditionalImage = (index: number) => {
    const newImages = [...additionalImages]
    const newPreviews = [...additionalPreviews]

    newImages.splice(index, 1)
    newPreviews.splice(index, 1)

    setAdditionalImages(newImages)
    setAdditionalPreviews(newPreviews)
  }

  // Delete an existing image
  const deleteExistingImage = async (imageId: string) => {
    try {
      setIsDeletingImage(imageId)
      await axios.delete(`/api/product/${productId}/images/${imageId}`)
      setExistingImages(existingImages.filter((img) => img.id !== imageId))
      toast.success("Image deleted successfully")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
    } finally {
      setIsDeletingImage(null)
    }
  }
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 6. Update the handleSubmit function to use selectedBrandId
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!name || !description || !selectedBrandId) {
      toast.error("Please fill in all required fields")
      return
    }
    setIsSubmitting(true)
    try {
      // Create a product object that matches your UpdateProductRequest on the backend
      const productData = {
        name,
        description,
        productMaterial,
        inspiration,
        usageInstructions,
        thumbnailImage: existingImageUrl || "",
        isActive,
        brand: brands.find((b) => b.id === selectedBrandId)?.name || "", // Send the brand name instead of ID
      }

      // Also add console logging to help debug
      console.log("Submitting product data:", productData)
      console.log("Selected brand ID:", selectedBrandId)
      console.log("Available brands:", brands)

      // Create FormData
      const formData = new FormData()

      // Add the product data as a JSON string with the correct parameter name
      formData.append(
        "request",
        new Blob([JSON.stringify(productData)], {
          type: "application/json",
        }),
      )

      // Add thumbnail image if a new one was selected
      if (thumbnailImage) {
        formData.append("thumbnailImageFile", thumbnailImage)
      }

      // Add additional images if any were selected
      if (additionalImages.length > 0) {
        additionalImages.forEach((image) => {
          formData.append("imageFiles", image)
        })
      }

      // Use axios directly to match the backend API structure
      const response = await axios.put(`/api/product/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.result) {
        toast.success("Product updated successfully!")
        router.back()
      }
    } catch (error: any) {
      console.error("Error updating product:", error)

      // More detailed error handling
      if (error.response) {
        if (error.response.status === 403) {
          toast.error("You don't have permission to update products. Please contact an administrator.")
        } else if (error.response.status === 401) {
          toast.error("Your session has expired. Please log in again.")
          router.push("/login")
        } else {
          toast.error(
            `Failed to update product: ${error.response.data?.message || error.response.statusText || "Unknown error"}`,
          )
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.")
      } else {
        toast.error("Failed to update product: " + error.message)
      }
    }
    finally {
      setIsSubmitting(false)
    }
  }

  if (isPageLoading) {
    return (
      <DashboardShell>
        <DashboardHeader title="Edit Product" />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="mt-2 text-gray-500">Loading product data...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Edit Product" />
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Product Images */}
            <div className="md:col-span-1">
              {/* Main Product Image */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">Product Thumbnail</h2>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <div className="relative w-full aspect-square">
                      <Image
                        src={
                          thumbnailPreview
                            ? thumbnailPreview.startsWith("data:") // Check if it's a data URL
                              ? thumbnailPreview // If yes, use it directly
                              : thumbnailPreview.startsWith("/") || thumbnailPreview.startsWith("http") // If not data, check for absolute/external
                                ? thumbnailPreview // If yes, use directly
                                : `/${thumbnailPreview}` // Otherwise, assume it's a relative path without /, prepend /
                            : "/placeholder.svg" // If thumbnailPreview is null/undefined/empty string
                        }
                        alt="Product preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (existingImageUrl) {
                            setThumbnailPreview(existingImageUrl)
                          } else {
                            setThumbnailPreview(null)
                          }
                          setThumbnailImage(null)
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        Drop your image here, or <span className="text-orange-500">click to browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        1600 x 1200 (4:3) recommended. PNG, JPG and GIF files are allowed
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                  />
                </div>
              </div>

              {/* Additional Images */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Additional Images</h2>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors mb-4"
                  onClick={() => additionalImagesInputRef.current?.click()}
                >
                  <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-orange-500" />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Add more product images, or <span className="text-orange-500">click to browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Upload multiple images to show different angles</p>
                  <input
                    type="file"
                    ref={additionalImagesInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                  />
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium mb-2 text-gray-700">
                      Existing Images ({existingImages.length})
                    </h3>
                    <div className="flex flex-wrap mb-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative w-24 h-24 m-1">
                          <Image
                            src={
                              image.image?.startsWith("/") || image.image?.startsWith("http")
                                ? image.image
                                : image.image
                                  ? `/${image.image}`
                                  : "/placeholder.svg"
                            }
                            alt="Product image"
                            fill
                            className="object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => deleteExistingImage(image.id)}
                            disabled={isDeletingImage === image.id}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 disabled:opacity-50"
                          >
                            {isDeletingImage === image.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} className="text-red-500" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* New Images */}
                {additionalImages.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium mb-2 text-gray-700">New Images ({additionalImages.length})</h3>
                    <div className="flex flex-wrap">
                      {additionalImages.map((image, index) => (
                        <div key={index} className="relative w-24 h-24 m-1">
                          <Image
                            src={additionalPreviews[index] || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {existingImages.length === 0 && additionalImages.length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    No additional images. Add some to show different angles of your product.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Product Information */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Product Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="productName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  {/* 7. Replace the brand text input with a dropdown in the JSX */}
                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="brand"
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Select a brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter product description"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="productMaterial" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Material
                    </label>
                    <input
                      id="productMaterial"
                      type="text"
                      value={productMaterial}
                      onChange={(e) => setProductMaterial(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter product material"
                    />
                  </div>

                  <div>
                    <label htmlFor="inspiration" className="block text-sm font-medium text-gray-700 mb-1">
                      Inspiration
                    </label>
                    <input
                      id="inspiration"
                      type="text"
                      value={inspiration}
                      onChange={(e) => setInspiration(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter product inspiration"
                    />
                  </div>

                  <div>
                    <label htmlFor="usageInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Instructions
                    </label>
                    <input
                      id="usageInstructions"
                      type="text"
                      value={usageInstructions}
                      onChange={(e) => setUsageInstructions(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter usage instructions"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Product is active and available for sale</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Product Variants</h2>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/product/${productId}/variants`)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    Manage Variants
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Product variants (sizes, scents, prices) can be managed from the variants page after saving this
                  product.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating…" : "Update Product"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
