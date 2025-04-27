"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import axios from "@/lib/axios-custom"

interface Brand {
  id: string
  name: string
}

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState(searchParams.get("name") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [brandName, setBrandName] = useState(searchParams.get("brandName") || "")
  const [isActive, setIsActive] = useState<string>(
    searchParams.get("isActive") === "true" ? "true" : searchParams.get("isActive") === "false" ? "false" : "",
  )

  // Add state for brands
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoadingBrands, setIsLoadingBrands] = useState(false)
  const [brandError, setBrandError] = useState("")

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoadingBrands(true)
      setBrandError("")

      try {
        const response = await axios.get("/api/brand/name");
        const data = response.data;
    
        setBrands(data.result || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setBrandError("Failed to load brands");
      } finally {
        setIsLoadingBrands(false);
      }
    }

    fetchBrands()
  }, [])

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (name) params.set("name", name)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (brandName) params.set("brandName", brandName)
    if (isActive) params.set("isActive", isActive)

    // Reset to page 1 when filters change
    params.set("page", "1")

    router.push(`/admin/product-list?${params.toString()}`)
  }

  const clearFilters = () => {
    setName("")
    setMinPrice("")
    setMaxPrice("")
    setBrandName("")
    setIsActive("")
    router.push("/admin/product-list")
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min price"
            className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price"
            className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          {brandError ? (
            <div className="text-sm text-red-500">{brandError}</div>
          ) : (
            <select
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={isLoadingBrands}
              className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Brands</option>
              {isLoadingBrands ? (
                <option disabled>Loading brands...</option>
              ) : (
                brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
            className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
        <button onClick={applyFilters} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
          Apply Filters
        </button>
      </div>
    </div>
  )
}

export default ProductFilters
