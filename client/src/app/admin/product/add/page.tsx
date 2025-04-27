"use client"

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import useProductStore from "@/stores/useProductStore"
import toast from "react-hot-toast"
import axios from "@/lib/axios-custom"
import { useRouter } from "next/navigation"

// Add interface for brand dropdown data
interface BrandDropdownItem {
  id: string
  name: string
}

export default function AddProductPage() {
  const { isLoading, addProduct } = useProductStore()
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // Product form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [productMaterial, setProductMaterial] = useState("")
  const [inspiration, setInspiration] = useState("")
  const [usageInstructions, setUsageInstructions] = useState("")
  const [brand, setBrand] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Add state for brand dropdown
  const [brands, setBrands] = useState<BrandDropdownItem[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")

  // Variant form state
  const [variantName, setVariantName] = useState("")
  const [variantSize, setVariantSize] = useState("100ml")
  const [variantScent, setVariantScent] = useState("")
  const [variantStock, setVariantStock] = useState("")
  const [variantPrice, setVariantPrice] = useState("")

  // Thumbnail image state
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  // Additional images state
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])

  // Size options for fragrance
  const sizeOptions = ["50ml", "100ml", "150ml"]

  // Add useEffect to fetch brands
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

  // Handle additional images upload
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

  // Remove an additional image
  const removeAdditionalImage = (index: number) => {
    const newImages = [...additionalImages]
    const newPreviews = [...additionalPreviews]

    newImages.splice(index, 1)
    newPreviews.splice(index, 1)

    setAdditionalImages(newImages)
    setAdditionalPreviews(newPreviews)
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate required fields
      if (!name || !description || !selectedBrandId) {
        toast.error("Please fill in all required product fields")
        setSubmitting(false)
        return
      }

      if (!thumbnailImage) {
        toast.error("Please upload a product thumbnail image")
        setSubmitting(false)
        return
      }

      if (!variantName || !variantSize) {
        toast.error("Please fill in all required variant fields")
        setSubmitting(false)
        return
      }

      // Ensure stock and price are valid numbers
      const stock = Number.parseFloat(variantStock)
      if (isNaN(stock) || stock <= 0) {
        toast.error("Stock must be a positive number")
        setSubmitting(false)
        return
      }

      const price = Number.parseFloat(variantPrice)
      if (isNaN(price) || price <= 0) {
        toast.error("Price must be a positive number")
        setSubmitting(false)
        return
      }

      // Create FormData object
      const formData = new FormData()

      // Get the brand name from the selected brand ID
      const selectedBrandName = brands.find((b) => b.id === selectedBrandId)?.name || ""

      // Create product data object matching backend CreateProductRequest
      const productData = {
        name,
        description,
        productMaterial,
        inspiration,
        usageInstructions,
        isActive,
        brand: selectedBrandName, // Use the brand name from the selected brand
        productVariant: {
          name: variantName,
          size: variantSize,
          scent: variantScent,
          stock: variantStock,
          price: variantPrice,
        },
      }

      // Add product data as JSON blob with the exact name expected by the backend
      formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }))

      // Add thumbnail image with the exact name expected by the backend
      if (thumbnailImage) {
        formData.append("thumbnailImage", thumbnailImage)
      }

      // Add additional images with the exact name expected by the backend
      if (additionalImages.length > 0) {
        additionalImages.forEach((image) => {
          formData.append("images", image)
        })
      }

      // Send request directly using axios
      const response = await axios.post("/api/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.result) {
        toast.success("Product created successfully!")
        router.back();
      }
    } catch (error: any) {
      console.error("Error adding product:", error)
      const errorMessage = error.response?.data?.message || "Unknown error occurred"
      toast.error(`Failed to add product: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader title="CREATE PRODUCT" />

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Product Images */}
            <div className="lg:col-span-1">
              {/* Main Product Image */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">Add Product Photo</h2>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <div className="relative w-full aspect-square">
                      <Image
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Product thumbnail preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setThumbnailPreview(null)
                          setThumbnailImage(null)
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-orange-500" />
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        Drop your image here, or <span className="text-orange-500">click to browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        1600 x 1200 (4:3) recommended. PNG, JPG and GIF files are allowed
                      </p>
                    </div>
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

                {additionalImages.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium mb-2 text-gray-700">
                      Selected Images ({additionalImages.length})
                    </h3>
                    <div className="flex flex-wrap">
                      {additionalPreviews.map((preview, index) => (
                        <div key={index} className="relative w-24 h-24 m-1">
                          <Image
                            src={preview || "/placeholder.svg"}
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
              </div>
            </div>

            {/* Right Column - Product Information */}
            <div className="lg:col-span-2">
              {/* Product Information */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">Product Information</h2>

                <div className="space-y-6">
                  {/* Product Name */}
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
                      placeholder="Product Name"
                      required
                    />
                  </div>

                  {/* Brand - Replace text input with dropdown */}
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

                  {/* Description */}
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
                      placeholder="Short description about the product"
                      required
                    />
                  </div>

                  {/* Product Material */}
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

                  {/* Inspiration */}
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

                  {/* Usage Instructions */}
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

                  {/* Active Status */}
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

              {/* Default Variant Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Default Product Variant</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Create the first variant for this product. You can add more variants after creating the product.
                </p>

                <div className="space-y-6">
                  {/* Variant Name */}
                  <div>
                    <label htmlFor="variantName" className="block text-sm font-medium text-gray-700 mb-1">
                      Variant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="variantName"
                      type="text"
                      value={variantName}
                      onChange={(e) => setVariantName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Default variant name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Size */}
                    <div>
                      <label htmlFor="variantSize" className="block text-sm font-medium text-gray-700 mb-1">
                        Size <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="variantSize"
                        value={variantSize}
                        onChange={(e) => setVariantSize(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        {sizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Scent */}
                    <div>
                      <label htmlFor="variantScent" className="block text-sm font-medium text-gray-700 mb-1">
                        Scent
                      </label>
                      <input
                        id="variantScent"
                        type="text"
                        value={variantScent}
                        onChange={(e) => setVariantScent(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Variant scent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stock */}
                    <div>
                      <label htmlFor="variantStock" className="block text-sm font-medium text-gray-700 mb-1">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="variantStock"
                        type="number"
                        min="1"
                        value={variantStock}
                        onChange={(e) => setVariantStock(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Available stock"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label htmlFor="variantPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="variantPrice"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={variantPrice}
                        onChange={(e) => setVariantPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Variant price"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
