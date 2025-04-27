"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, StarHalf, Edit, Trash2, Search } from "lucide-react"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"

interface Product {
  id: string
  name: string
}

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    imageUrl: string
  }
  product: {
    id: string
    name: string
  }
}

interface ReviewsResponse {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  content: Review[]
}

export default function ReviewsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState({
    rating: 5,
    content: "",
  })

  // Add state for product search
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/product/all", {
          params: {
            pageNumber: 1,
            pageSize: 100, // Get a large number of products for the dropdown
          },
        })
        setProducts(response.data.result.content)
        setFilteredProducts(response.data.result.content)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast.error("Failed to load products")
      }
    }

    fetchProducts()
  }, [])

  // Filter products when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  // Fetch reviews when a product is selected
  useEffect(() => {
    if (selectedProductId) {
      fetchReviews(selectedProductId, currentPage)
    }
  }, [selectedProductId, currentPage])

  const fetchReviews = async (productId: string, page: number) => {
    setIsLoading(true)
    try {
      const response = await axios.get<{ result: ReviewsResponse }>("/api/review/all", {
        params: {
          pageNumber: page,
          pageSize: 6,
          sortBy: "createdAt",
          sortDirection: "desc",
          productId: productId,
        },
      })

      const result = response.data.result
      setReviews(result.content)
      setTotalPages(result.totalPages)
      setCurrentPage(result.pageNumber)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductChange = (value: string) => {
    setSelectedProductId(value)
    setCurrentPage(1)
    setSearchTerm("") // Clear search when product is selected
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditReview = (review: Review) => {
    setSelectedReview(review)
    setFormData({
      rating: review.rating,
      content: review.content,
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteReview = (review: Review) => {
    setSelectedReview(review)
    setIsDeleteDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rating: Number.parseInt(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReview) return

    try {
      await axios.put("/api/review/update", {
        reviewId: selectedReview.id,
        rating: formData.rating,
        content: formData.content,
      })

      // Refresh reviews
      fetchReviews(selectedProductId, currentPage)
      setIsEditDialogOpen(false)
      toast.success("Review updated successfully")
    } catch (error) {
      console.error("Error updating review:", error)
      toast.error("Failed to update review")
    }
  }

  const confirmDelete = async () => {
    if (!selectedReview) return

    try {
      await axios.delete(`/api/review/${selectedReview.id}`)

      // Refresh reviews
      fetchReviews(selectedProductId, currentPage)
      setIsDeleteDialogOpen(false)
      toast.success("Review deleted successfully")
    } catch (error) {
      console.error("Error deleting review:", error)
      toast.error("Failed to delete review")
    }
  }

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" />)
    }

    return stars
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Review Management" description="View and manage product reviews" />

      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-80">
            <Label htmlFor="product-select" className="text-sm font-medium text-gray-700 mb-2 block">
              Select Product
            </Label>
            <div className="space-y-2">
              {/* Enhanced search input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search and choose products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  aria-label="Search products"
                />
              </div>

              {/* Separate product dropdown */}
              <div className="relative">
                <Select value={selectedProductId} onValueChange={handleProductChange}>
                  <SelectTrigger
                    id="product-select"
                    className="w-full bg-white border border-gray-300 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md rounded-md">

                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="cursor-pointer hover:bg-orange-50">
                          {product.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-3 px-2 text-sm text-gray-500 text-center">No products found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : selectedProductId ? (
          <>
            {reviews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map((review) => (
                    <Card key={review.id} className="h-full">
                      <CardContent className="p-0">
                        <div className="flex flex-col h-full">
                          {/* Review header */}
                          <div className="p-4 border-b">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                               
                                <div>
                                  <p className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">{renderStars(review.rating)}</div>
                            </div>
                          </div>

                          {/* Review content */}
                          <div className="p-4 flex-grow">
                            <p className="text-gray-700 line-clamp-4">{review.content}</p>
                          </div>

                          {/* Review actions */}
                          <div className="p-4 border-t flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditReview(review)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteReview(review)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page)}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No reviews found for this product.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Please select a product to view its reviews.</p>
          </div>
        )}
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <Select value={formData.rating.toString()} onValueChange={handleRatingChange}>
                  <SelectTrigger id="rating">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md rounded-md">

                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Review Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter review content"
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-500 text-white hover:bg-blue-600" type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Review Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            {selectedReview && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex gap-1 mb-2">{renderStars(selectedReview.rating)}</div>
                <p className="text-sm text-gray-700 line-clamp-3">{selectedReview.content}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-500 text-white hover:bg-red-600" type="button" variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
