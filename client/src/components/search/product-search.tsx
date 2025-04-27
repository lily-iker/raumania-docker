"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import type { ProductSearchParams, ProductSummary } from "@/types/index"
import useProductStore from "@/stores/useProductStore"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import axios from "@/lib/axios-custom"
import Link from "next/link"
import { Header } from "../Header"
import clsx from "clsx"

// Define the filter options interface
interface FilterOptions {
  brands: string[]
  sizes: string[]
  scents: string[]
}

export default function ProductSearch() {
  const {
    searchProductsName,
    searchElasticsearch,
    isLoading,
    products,
    totalProducts,
    totalPages,
    currentPage,
    pageSize,
    nameSuggestions,
  } = useProductStore((state) => state)

  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedScent, setSelectedScent] = useState<string | null>(null)
  const [isActiveOnly, setIsActiveOnly] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState<string>("id")
  const [sortDirection, setSortDirection] = useState<string>("asc")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Dynamic filter options state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brands: [],
    sizes: [],
    scents: [],
  })
  const [isLoadingFilters, setIsLoadingFilters] = useState(false)

  // Filter search states
  const [brandSearchQuery, setBrandSearchQuery] = useState("")
  const [sizeSearchQuery, setSizeSearchQuery] = useState("")
  const [scentSearchQuery, setScentSearchQuery] = useState("")
  const [showMoreBrands, setShowMoreBrands] = useState(false)
  const [showMoreSizes, setShowMoreSizes] = useState(false)
  const [showMoreScents, setShowMoreScents] = useState(false)

  // Debounced filter search queries
  const debouncedBrandSearch = useDebounce(brandSearchQuery, 300)
  const debouncedSizeSearch = useDebounce(sizeSearchQuery, 300)
  const debouncedScentSearch = useDebounce(scentSearchQuery, 300)

  // Load all products on initial page load
  useEffect(() => {
    const loadInitialProducts = async () => {
      if (!initialLoadComplete) {
        try {
          // Call searchElasticsearch with no parameters to get all products
          await searchElasticsearch({})
          setHasSearched(true)
          setInitialLoadComplete(true)
        } catch (error) {
          console.error("Error loading initial products:", error)
        }
      }
    }

    loadInitialProducts()
  }, [searchElasticsearch, initialLoadComplete])

  // Filtered options based on search
  const filteredBrands = useMemo(() => {
    if (!debouncedBrandSearch) return filterOptions.brands
    return filterOptions.brands.filter((brand) => brand.toLowerCase().includes(debouncedBrandSearch.toLowerCase()))
  }, [filterOptions.brands, debouncedBrandSearch])

  const filteredSizes = useMemo(() => {
    if (!debouncedSizeSearch) return filterOptions.sizes
    return filterOptions.sizes.filter((size) => size.toLowerCase().includes(debouncedSizeSearch.toLowerCase()))
  }, [filterOptions.sizes, debouncedSizeSearch])

  const filteredScents = useMemo(() => {
    if (!debouncedScentSearch) return filterOptions.scents
    return filterOptions.scents.filter((scent) => scent.toLowerCase().includes(debouncedScentSearch.toLowerCase()))
  }, [filterOptions.scents, debouncedScentSearch])

  // Display limited number of options unless "show more" is clicked
  const displayedBrands = useMemo(() => {
    return showMoreBrands ? filteredBrands : filteredBrands.slice(0, 5)
  }, [filteredBrands, showMoreBrands])

  const displayedSizes = useMemo(() => {
    return showMoreSizes ? filteredSizes : filteredSizes.slice(0, 5)
  }, [filteredSizes, showMoreSizes])

  const displayedScents = useMemo(() => {
    return showMoreScents ? filteredScents : filteredScents.slice(0, 5)
  }, [filteredScents, showMoreScents])

  // Simplified sort options that match your backend capabilities
  const sortOptions = useMemo(
    () => [
      { value: "id-asc", label: "Default" },
      { value: "minPrice-asc", label: "Price (Low to High)" },
      { value: "minPrice-desc", label: "Price (High to Low)" },
    ],
    [],
  )

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoadingFilters(true)
      try {
        const response = await axios.get("/api/product/filters")
        const data = response.data.result
        setFilterOptions({
          brands: data.brands || [],
          sizes: data.sizes || [],
          scents: data.scents || [],
        })
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setIsLoadingFilters(false)
      }
    }

    fetchFilterOptions()
  }, [])

  // Force re-render when products change
  useEffect(() => {
    console.log("Products updated:", products.length)
    console.log("Current page:", currentPage, "Total pages:", totalPages)
    setForceUpdate((prev) => prev + 1)
  }, [products, currentPage, totalPages])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim().length > 0) {
        try {
          await searchProductsName(debouncedSearchQuery)
          if (nameSuggestions && nameSuggestions.length > 0) {
            setShowSuggestions(true)
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setShowSuggestions(false)
        }
      } else {
        setShowSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSearchQuery, searchProductsName, nameSuggestions])

  useEffect(() => {
    setSelectedIndex(null)
  }, [searchQuery])

  // Update active filters whenever filter values change
  useEffect(() => {
    const newFilters: string[] = []

    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      newFilters.push(`Price: $${priceRange[0]} - $${priceRange[1]}`)
    }

    if (selectedBrand) {
      newFilters.push(`Brand: ${selectedBrand}`)
    }

    if (selectedSize) {
      newFilters.push(`Size: ${selectedSize}`)
    }

    if (selectedScent) {
      newFilters.push(`Scent: ${selectedScent}`)
    }

    if (isActiveOnly === true) {
      newFilters.push("In stock only")
    }

    const currentSortOption = sortOptions.find((option) => option.value === `${sortBy}-${sortDirection}`)
    if (currentSortOption && (sortBy !== "id" || sortDirection !== "asc")) {
      newFilters.push(`Sort: ${currentSortOption.label}`)
    }

    // Only update if filters have actually changed
    if (JSON.stringify(newFilters) !== JSON.stringify(activeFilters)) {
      setActiveFilters(newFilters)
    }
  }, [priceRange, selectedBrand, selectedSize, selectedScent, isActiveOnly, sortBy, sortDirection, sortOptions])

  // Fix the handlePageChange function to properly update the page
  const handlePageChange = useCallback(
    async (newPage: number) => {
      console.log(`Changing to page ${newPage} with pageSize ${pageSize}`)

      // Create a new search params object with the updated page number
      const searchParams: ProductSearchParams = {
        name: searchQuery.trim() || undefined,
        pageNumber: newPage,
        pageSize,
        sortBy,
        sortDirection,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
        brandName: selectedBrand || undefined,
        size: selectedSize || undefined,
        scent: selectedScent || undefined,
        isActive: isActiveOnly,
      }

      try {
        // Force a new API call by creating a unique timestamp parameter
        searchParams.timestamp = Date.now()

        const result = await searchElasticsearch(searchParams)
        console.log(`Page change result: Page ${result?.pageNumber}, Total items: ${result?.totalElements}`)

        // Force a re-render after page change
        setForceUpdate((prev) => prev + 1)
      } catch (error) {
        console.error("Page change error:", error)
      }
    },
    [
      searchQuery,
      pageSize,
      sortBy,
      sortDirection,
      priceRange,
      selectedBrand,
      selectedSize,
      selectedScent,
      isActiveOnly,
      searchElasticsearch,
    ],
  )

  // Update the ProductSearchParams interface to include timestamp
  interface ProductSearchParams {
    pageNumber?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: string
    name?: string
    minPrice?: number
    maxPrice?: number
    brandName?: string
    isActive?: boolean | null
    size?: string
    scent?: string
    timestamp?: number // Add timestamp for cache busting
  }

  // Also update the handleSearch function to include timestamp
  const handleSearch = useCallback(
    async (resetPage = true) => {
      // REMOVED: The line below used to prevent search on empty query/filters
      // if (!searchQuery.trim() && activeFilters.length === 0) return

      // Add a log to see when it's called, even if empty
      console.log("handleSearch called. Query:", searchQuery, "Filters count:", activeFilters.length);

      setHasSearched(true); // Still useful to know a search attempt was made
      setShowSuggestions(false);

      // Determine the page number based on resetPage flag and current store state
      const pageNumberToUse = resetPage ? 1 : useProductStore.getState().currentPage;

      const searchParams: ProductSearchParams = {
        name: searchQuery.trim() || undefined, // Will be undefined if searchQuery is empty
        pageNumber: pageNumberToUse,
        pageSize,
        sortBy,
        sortDirection,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
        brandName: selectedBrand || undefined,
        size: selectedSize || undefined,
        scent: selectedScent || undefined,
        isActive: isActiveOnly,
        timestamp: Date.now(), // Keep timestamp for cache busting
      };

      console.log("Executing search with params:", searchParams);

      try {
        // It's generally better to rely on the store update to trigger re-renders
        // than forceUpdate, but keeping it as it was in your original code.
        // Consider removing setForceUpdate if store updates work reliably.
        const result = await searchElasticsearch(searchParams);
        console.log(`Search result: Page ${result?.pageNumber}, Total items: ${result?.totalElements}`);
        setForceUpdate((prev) => prev + 1); // Keep forceUpdate if you found it necessary
      } catch (error) {
        console.error("Search error:", error);
        // Optionally set an error state in the store or component
      }
    },
    [
      // Dependencies for useCallback: include everything used inside the function
      searchQuery,
      // activeFilters is removed as it's no longer directly used for the check
      // currentPage is no longer directly used, fetched from store state instead
      pageSize,
      sortBy,
      sortDirection,
      priceRange,
      selectedBrand,
      selectedSize,
      selectedScent,
      isActiveOnly,
      searchElasticsearch,
      // setForceUpdate // Technically state setters don't need to be dependencies, but including if needed
    ]
  );

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      setSearchQuery(suggestion)
      setShowSuggestions(false)
      setSelectedIndex(null)

      const searchParams: ProductSearchParams = {
        name: suggestion,
        pageNumber: 1,
        pageSize: 12,
        sortBy,
        sortDirection,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
        brandName: selectedBrand || undefined,
        size: selectedSize || undefined,
        scent: selectedScent || undefined,
      }

      setHasSearched(true)
      try {
        await searchElasticsearch(searchParams)
        // Force a re-render after search completes
        setForceUpdate((prev) => prev + 1)
      } catch (error) {
        console.error("Search error:", error)
      }
    },
    [sortBy, sortDirection, priceRange, selectedBrand, selectedSize, selectedScent, isActiveOnly, searchElasticsearch],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (nameSuggestions && nameSuggestions.length > 0) {
        setShowSuggestions(true)
        setSelectedIndex((prev) => (prev === null || prev === nameSuggestions.length - 1 ? 0 : prev + 1))
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (nameSuggestions && nameSuggestions.length > 0) {
        setShowSuggestions(true)
        setSelectedIndex((prev) => (prev === null || prev === 0 ? nameSuggestions.length - 1 : prev - 1))
      }
    } else if (e.key === "Enter") {
      if (selectedIndex !== null && nameSuggestions[selectedIndex]) {
        handleSuggestionClick(nameSuggestions[selectedIndex])
      } else {
        handleSearch()
      }
    }
  }

  // Update the handleSortChange function to include timestamp
  const handleSortChange = useCallback(
    async (value: string) => {
      const [field, direction] = value.split("-")
      setSortBy(field)
      setSortDirection(direction)

      // Apply the sort immediately if we've already searched
      if (hasSearched) {
        const searchParams: ProductSearchParams = {
          name: searchQuery.trim() || undefined,
          pageNumber: 1, // Reset to first page when sorting
          pageSize,
          sortBy: field,
          sortDirection: direction,
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
          brandName: selectedBrand || undefined,
          size: selectedSize || undefined,
          scent: selectedScent || undefined,
          isActive: isActiveOnly,
          timestamp: Date.now(), // Add timestamp to prevent caching
        }

        try {
          const result = await searchElasticsearch(searchParams)
          console.log(`Sort change result: Page ${result?.pageNumber}, Total items: ${result?.totalElements}`)
          // Force a re-render after sort change
          setForceUpdate((prev) => prev + 1)
        } catch (error) {
          console.error("Sort change error:", error)
        }
      }
    },
    [
      hasSearched,
      searchQuery,
      pageSize,
      priceRange,
      selectedBrand,
      selectedSize,
      selectedScent,
      isActiveOnly,
      searchElasticsearch,
    ],
  )

  const clearSearch = () => {
    setSearchQuery("")
    setShowSuggestions(false)
    setHasSearched(false)
    setSelectedIndex(null)
  }



  const removeFilter = (filter: string) => {
    if (filter.startsWith("Price:")) {
      setPriceRange([0, 1000])
    } else if (filter.startsWith("Brand:")) {
      setSelectedBrand(null)
    } else if (filter.startsWith("Size:")) {
      setSelectedSize(null)
    } else if (filter.startsWith("Scent:")) {
      setSelectedScent(null)
    } else if (filter === "In stock only") {
      setIsActiveOnly(null)
    } else if (filter.startsWith("Sort:")) {
      setSortBy("id")
      setSortDirection("asc")
    }
  }

  return (
    
    <div className="w-full bg-brand-gray">
      <div className="py-8 px-4 md:px-6">
      <h1
          className={clsx(
            'text-[3rem] md:text-[4rem] font-dancing tracking-tight text-brand-purple drop-shadow-md transition-all duration-700 text-center mb-6'
          )}
        >
          Discover Your Perfect Scent
        </h1>

        <div className="flex flex-col md:flex-row gap-9">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block w-64 lg:w-96 shrink-0">
            <div className="bg-white p-5 rounded-md border border-[#e5e0d5] shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-lg text-brand-purple">Refine</h3>
                
              </div>

              <Accordion type="single" collapsible className="w-full" defaultValue="price">
                <AccordionItem value="price" className="border-b border-[#e5e0d5]">
                  <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                    Price Range
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="pt-4">
                        <Slider
                          value={priceRange}
                          min={0}
                          max={1000}
                          step={10}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          className="[&>[data-disabled]]:opacity-70 [&>span[role=slider]]:bg-[#d4a6a6]"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="border border-[#e5e0d5] rounded-md px-2 py-1 w-20 text-center text-sm">
                          ${priceRange[0]}
                        </div>
                        <div className="border border-[#e5e0d5] rounded-md px-2 py-1 w-20 text-center text-sm">
                          ${priceRange[1]}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="brand" className="border-b border-[#e5e0d5]">
                  <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                    Brand
                  </AccordionTrigger>
                  <AccordionContent>
                    {isLoadingFilters ? (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-[#d4a6a6]" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filterOptions.brands.length > 5 && (
                          <div className="mb-2">
                            <Input
                              type="text"
                              placeholder="Search brands..."
                              value={brandSearchQuery}
                              onChange={(e) => setBrandSearchQuery(e.target.value)}
                              className="h-8 text-sm border-[#e5e0d5]"
                            />
                          </div>
                        )}

                        {displayedBrands.length === 0 && (
                          <p className="text-sm text-muted-foreground">No brands match your search</p>
                        )}

                        {displayedBrands.map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox
                              id={`brand-${brand}`}
                              checked={selectedBrand === brand}
                              onCheckedChange={(checked) => {
                                setSelectedBrand(checked ? brand : null)
                              }}
                              className="border-[#d4a6a6] data-[state=checked]:bg-[#d4a6a6] data-[state=checked]:text-white"
                            />
                            <Label
                              htmlFor={`brand-${brand}`}
                              className="text-sm font-normal cursor-pointer text-[#333]"
                            >
                              {brand}
                            </Label>
                          </div>
                        ))}

                        {filteredBrands.length > 5 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMoreBrands(!showMoreBrands)}
                            className="w-full text-xs text-[#d4a6a6] hover:text-[#b87e7e] mt-1 flex items-center justify-center"
                          >
                            {showMoreBrands ? (
                              <>
                                Show less <ChevronUp className="ml-1 h-3 w-3" />
                              </>
                            ) : (
                              <>
                                Show more ({filteredBrands.length - 5} more) <ChevronDown className="ml-1 h-3 w-3" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="size" className="border-b border-[#e5e0d5]">
                  <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                    Size
                  </AccordionTrigger>
                  <AccordionContent>
                    {isLoadingFilters ? (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-[#d4a6a6]" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filterOptions.sizes.length > 5 && (
                          <div className="mb-2">
                            <Input
                              type="text"
                              placeholder="Search sizes..."
                              value={sizeSearchQuery}
                              onChange={(e) => setSizeSearchQuery(e.target.value)}
                              className="h-8 text-sm border-[#e5e0d5]"
                            />
                          </div>
                        )}

                        {displayedSizes.length === 0 && (
                          <p className="text-sm text-muted-foreground">No sizes match your search</p>
                        )}

                        {displayedSizes.map((size) => (
                          <div key={size} className="flex items-center space-x-2">
                            <Checkbox
                              id={`size-${size}`}
                              checked={selectedSize === size}
                              onCheckedChange={(checked) => {
                                setSelectedSize(checked ? size : null)
                              }}
                              className="border-[#d4a6a6] data-[state=checked]:bg-[#d4a6a6] data-[state=checked]:text-white"
                            />
                            <Label htmlFor={`size-${size}`} className="text-sm font-normal cursor-pointer text-[#333]">
                              {size}
                            </Label>
                          </div>
                        ))}

                        {filteredSizes.length > 5 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMoreSizes(!showMoreSizes)}
                            className="w-full text-xs text-[#d4a6a6] hover:text-[#b87e7e] mt-1 flex items-center justify-center"
                          >
                            {showMoreSizes ? (
                              <>
                                Show less <ChevronUp className="ml-1 h-3 w-3" />
                              </>
                            ) : (
                              <>
                                Show more ({filteredSizes.length - 5} more) <ChevronDown className="ml-1 h-3 w-3" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="scent" className="border-b border-[#e5e0d5]">
                  <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                    Scent
                  </AccordionTrigger>
                  <AccordionContent>
                    {isLoadingFilters ? (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-[#d4a6a6]" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filterOptions.scents.length > 5 && (
                          <div className="mb-2">
                            <Input
                              type="text"
                              placeholder="Search scents..."
                              value={scentSearchQuery}
                              onChange={(e) => setScentSearchQuery(e.target.value)}
                              className="h-8 text-sm border-[#e5e0d5]"
                            />
                          </div>
                        )}

                        {displayedScents.length === 0 && (
                          <p className="text-sm text-muted-foreground">No scents match your search</p>
                        )}

                        {displayedScents.map((scent) => (
                          <div key={scent} className="flex items-center space-x-2">
                            <Checkbox
                              id={`scent-${scent}`}
                              checked={selectedScent === scent}
                              onCheckedChange={(checked) => {
                                setSelectedScent(checked ? scent : null)
                              }}
                              className="border-[#d4a6a6] data-[state=checked]:bg-[#d4a6a6] data-[state=checked]:text-white"
                            />
                            <Label
                              htmlFor={`scent-${scent}`}
                              className="text-sm font-normal cursor-pointer text-[#333]"
                            >
                              {scent}
                            </Label>
                          </div>
                        ))}

                        {filteredScents.length > 5 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMoreScents(!showMoreScents)}
                            className="w-full text-xs text-[#d4a6a6] hover:text-[#b87e7e] mt-1 flex items-center justify-center"
                          >
                            {showMoreScents ? (
                              <>
                                Show less <ChevronUp className="ml-1 h-3 w-3" />
                              </>
                            ) : (
                              <>
                                Show more ({filteredScents.length - 5} more) <ChevronDown className="ml-1 h-3 w-3" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="availability" className="border-b border-[#e5e0d5]">
                  <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                    Availability
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active-only"
                        checked={isActiveOnly === true}
                        onCheckedChange={(checked) => {
                          setIsActiveOnly(checked ? true : null)
                        }}
                        className="border-[#d4a6a6] data-[state=checked]:bg-[#d4a6a6] data-[state=checked]:text-white"
                      />
                      <Label htmlFor="active-only" className="text-sm font-normal cursor-pointer text-[#333]">
                        In stock only
                      </Label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-6">
                <Button
                  className="w-full bg-[#d4a6a6] hover:bg-[#b87e7e] text-white font-serif"
                  onClick={() => handleSearch()}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="relative" ref={suggestionsRef}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search for fragrances..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      setSelectedIndex(null)
                      if (searchQuery.trim().length > 1 && nameSuggestions && nameSuggestions.length > 0) {
                        setShowSuggestions(true)
                      }
                    }}
                    className="pr-10 border-[#e5e0d5] focus-visible:ring-[#d4a6a6] bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Mobile filter button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden border-[#e5e0d5]">
                      <SlidersHorizontal className="h-4 w-4 text-[#333]" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-[#f8f5f1] border-l border-[#e5e0d5]">
                    <SheetHeader>
                      <SheetTitle className="font-serif text-[#333]">Refine Your Search</SheetTitle>
                      <SheetDescription className="text-[#666]">Find your perfect fragrance</SheetDescription>
                    </SheetHeader>

                    <div className="py-4">
                      <Accordion type="single" collapsible className="w-full" defaultValue="price">
                        <AccordionItem value="price" className="border-b border-[#e5e0d5]">
                          <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                            Price Range
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div className="pt-4">
                                <Slider
                                  value={priceRange}
                                  min={0}
                                  max={1000}
                                  step={10}
                                  onValueChange={(value) => setPriceRange(value as [number, number])}
                                  className="[&>[data-disabled]]:opacity-70 [&>span[role=slider]]:bg-[#d4a6a6]"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="border border-[#e5e0d5] rounded-md px-2 py-1 w-20 text-center text-sm">
                                  ${priceRange[0]}
                                </div>
                                <div className="border border-[#e5e0d5] rounded-md px-2 py-1 w-20 text-center text-sm">
                                  ${priceRange[1]}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="brand" className="border-b border-[#e5e0d5]">
                          <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                            Brand
                          </AccordionTrigger>
                          <AccordionContent>
                            {isLoadingFilters ? (
                              <div className="flex justify-center py-2">
                                <Loader2 className="h-5 w-5 animate-spin text-[#d4a6a6]" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {filterOptions.brands.length > 5 && (
                                  <div className="mb-2">
                                    <Input
                                      type="text"
                                      placeholder="Search brands..."
                                      value={brandSearchQuery}
                                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                                      className="h-8 text-sm border-[#e5e0d5]"
                                    />
                                  </div>
                                )}

                                {displayedBrands.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No brands match your search</p>
                                )}

                                {displayedBrands.map((brand) => (
                                  <div key={brand} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`mobile-brand-${brand}`}
                                      checked={selectedBrand === brand}
                                      onCheckedChange={(checked) => {
                                        setSelectedBrand(checked ? brand : null)
                                      }}
                                      className="border-[#d4a6a6] data-[state=checked]:bg-[#d4a6a6] data-[state=checked]:text-white"
                                    />
                                    <Label
                                      htmlFor={`mobile-brand-${brand}`}
                                      className="text-sm font-normal cursor-pointer text-[#333]"
                                    >
                                      {brand}
                                    </Label>
                                  </div>
                                ))}

                                {filteredBrands.length > 5 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMoreBrands(!showMoreBrands)}
                                    className="w-full text-xs text-[#d4a6a6] hover:text-[#b87e7e] mt-1 flex items-center justify-center"
                                  >
                                    {showMoreBrands ? (
                                      <>
                                        Show less <ChevronUp className="ml-1 h-3 w-3" />
                                      </>
                                    ) : (
                                      <>
                                        Show more ({filteredBrands.length - 5} more){" "}
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="size" className="border-b border-[#e5e0d5]">
                          <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                            Size
                          </AccordionTrigger>
                          <AccordionContent>
                            {isLoadingFilters ? (
                              <div className="flex justify-center py-2">
                                <Loader2 className="h-5 w-5 animate-spin text-[#d4a6a6]" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {filterOptions.sizes.length > 5 && (
                                  <div className="mb-2">
                                    <Input
                                      type="text"
                                      placeholder="Search sizes..."
                                      value={sizeSearchQuery}
                                      onChange={(e) => setSizeSearchQuery(e.target.value)}
                                      className="h-8 text-sm border-[#e5e0d5]"
                                    />
                                  </div>
                                )}

                                {displayedSizes.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No sizes match your search</p>
                                )}

                                {displayedSizes.map((size) => (
                                  <div key={size} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`mobile-size-${size}`}
                                      checked={selectedSize === size}
                                      onCheckedChange={(checked) => {
                                        setSelectedSize(checked ? size : null)
                                      }}
                                      className="border-[#d4a6a6] data-[state=checked]:bg-[#d4a6a6] data-[state=checked]:text-white"
                                    />
                                    <Label
                                      htmlFor={`mobile-size-${size}`}
                                      className="text-sm font-normal cursor-pointer text-[#333]"
                                    >
                                      {size}
                                    </Label>
                                  </div>
                                ))}

                                {filteredSizes.length > 5 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMoreSizes(!showMoreSizes)}
                                    className="w-full text-xs text-[#d4a6a6] hover:text-[#b87e7e] mt-1 flex items-center justify-center"
                                  >
                                    {showMoreSizes ? (
                                      <>
                                        Show less <ChevronUp className="ml-1 h-3 w-3" />
                                      </>
                                    ) : (
                                      <>
                                        Show more ({filteredSizes.length - 5} more){" "}
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="scent" className="border-b border-[#e5e0d5]">
                          <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                            Scent
                          </AccordionTrigger>
                          <AccordionContent>
                            {isLoadingFilters ? (
                              <div className="flex justify-center py-2">
                                <Loader2 className="h-5 w-5 animate-spin text-[#d4a6a6]" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {filterOptions.scents.length > 5 && (
                                  <div className="mb-2">
                                    <Input
                                      type="text"
                                      placeholder="Search scents..."
                                      value={scentSearchQuery}
                                      onChange={(e) => setScentSearchQuery(e.target.value)}
                                      className="h-8 text-sm border-[#e5e0d5]"
                                    />
                                  </div>
                                )}

                                {displayedScents.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No scents match your search</p>
                                )}

                                {displayedScents.map((scent) => (
                                  <div key={scent} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`mobile-scent-${scent}`}
                                      checked={selectedScent === scent}
                                      onCheckedChange={(checked) => {
                                        setSelectedScent(checked ? scent : null)
                                      }}
                                      className="border-[#d4a6a6] data-[state=checked]:bg-[#d4a6a6] data-[state=checked]:text-white"
                                    />
                                    <Label
                                      htmlFor={`mobile-scent-${scent}`}
                                      className="text-sm font-normal cursor-pointer text-[#333]"
                                    >
                                      {scent}
                                    </Label>
                                  </div>
                                ))}

                                {filteredScents.length > 5 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMoreScents(!showMoreScents)}
                                    className="w-full text-xs text-[#d4a6a6] hover:text-[#b87e7e] mt-1 flex items-center justify-center"
                                  >
                                    {showMoreScents ? (
                                      <>
                                        Show less <ChevronUp className="ml-1 h-3 w-3" />
                                      </>
                                    ) : (
                                      <>
                                        Show more ({filteredScents.length - 5} more){" "}
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="availability" className="border-b border-[#e5e0d5]">
                          <AccordionTrigger className="font-serif text-[#333] hover:text-[#d4a6a6] hover:no-underline">
                            Availability
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mobile-active-only"
                                checked={isActiveOnly === true}
                                onCheckedChange={(checked) => {
                                  setIsActiveOnly(checked ? true : null)
                                }}
                                className="border-[#d4a6a6] data-[state=checked]:bg-[#d4a6a6] data-[state=checked]:text-white"
                              />
                              <Label
                                htmlFor="mobile-active-only"
                                className="text-sm font-normal cursor-pointer text-[#333]"
                              >
                                In stock only
                              </Label>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    <SheetFooter className="flex flex-row gap-2 sm:justify-end">
                  
                      <SheetClose asChild>
                        <Button onClick={() => handleSearch()} className="bg-[#d4a6a6] hover:bg-[#b87e7e]">
                          Apply Filters
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                {/* Sort dropdown */}
                <Select value={`${sortBy}-${sortDirection}`} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] hidden md:flex border-[#e5e0d5] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#e5e0d5]">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="font-serif">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={() => handleSearch()} disabled={isLoading} className="bg-[#d4a6a6] hover:bg-[#b87e7e] text-white">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {showSuggestions && nameSuggestions && nameSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-[#e5e0d5] max-h-60 overflow-auto">
                  <ul className="py-1">
                    {nameSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className={`px-4 py-2 text-sm cursor-pointer ${
                          selectedIndex === index ? "bg-[#f8f5f1] font-medium" : "hover:bg-[#f8f5f1]"
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#f8f5f1] text-[#333] border border-[#e5e0d5]"
                  >
                    {filter}
                    <button onClick={() => removeFilter(filter)} className="ml-1 hover:text-[#d4a6a6]">
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              
              </div>
            )}

            {/* Mobile sort (below search) */}
            <div className="md:hidden mt-4">
              <Select value={`${sortBy}-${sortDirection}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full border-[#e5e0d5] bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#e5e0d5]">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-serif">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(hasSearched || initialLoadComplete) && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif text-brand-purple">
                    {isLoading ? "Searching..." : `Search Results (${totalProducts})`}
                  </h2>
                  {searchQuery && <p className="text-sm text-[#666]">Showing results for "{searchQuery}"</p>}
                </div>

                {products.length === 0 && !isLoading ? (
                  <div className="text-center py-12 border border-[#e5e0d5] rounded-md bg-white">
                    <p className="text-[#666]">No products found matching your search criteria.</p>
                    
                  </div>
                ) : (
                  <>
                    <div className="max-w-7xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <ProductCard key={`${product.id}-${forceUpdate}`} product={product as ProductSummary} />
                        ))}
                      </div>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-center mt-10">
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || isLoading}
                            className="border-[#e5e0d5] text-[#333] hover:bg-[#f8f5f1] hover:text-[#d4a6a6]"
                          >
                            Previous
                          </Button>

                          {(() => {
                            // Calculate which page numbers to show
                            let startPage = 1
                            let endPage = totalPages

                            if (totalPages > 5) {
                              // Show at most 5 pages
                              if (currentPage <= 3) {
                                // Near the start
                                endPage = 5
                              } else if (currentPage >= totalPages - 2) {
                                // Near the end
                                startPage = totalPages - 4
                              } else {
                                // In the middle
                                startPage = currentPage - 2
                                endPage = currentPage + 2
                              }
                            }

                            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
                              (pageNum) => (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  disabled={isLoading}
                                  className={
                                    currentPage === pageNum
                                      ? "bg-[#d4a6a6] hover:bg-[#b87e7e] text-white"
                                      : "border-[#e5e0d5] text-[#333] hover:bg-[#f8f5f1] hover:text-[#d4a6a6]"
                                  }
                                >
                                  {pageNum}
                                </Button>
                              ),
                            )
                          })()}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || isLoading}
                            className="border-[#e5e0d5] text-[#333] hover:bg-[#f8f5f1] hover:text-[#d4a6a6]"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: ProductSummary
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="group border border-[#e5e0d5] rounded-md overflow-hidden hover:shadow-md transition-shadow bg-white">
        <div className="aspect-square overflow-hidden bg-[#f8f5f1]">
          <img
            src={product.thumbnailImage || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-[#333] truncate">{product.name}</h3>
          <p className="text-sm text-[#666] mt-1">
            {product.minPrice === product.maxPrice
                ? `$${product.minPrice}`
                : `$${product.minPrice?.toFixed(2)} - $${product.maxPrice?.toFixed(2)}`}
          </p>
        </div>
      </div>
    </Link>
  )
}
