"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import useBrandStore from "@/stores/useBrandStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Edit, Trash2, Plus, Search, ArrowUpDown } from "lucide-react"
import type { Brand } from "@/types/brand"

export default function BrandsPage() {
  const router = useRouter()
  const { brands, totalPages, currentPage, isLoading, fetchBrands, searchBrands, deleteBrand } = useBrandStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [sortBy, setSortBy] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  useEffect(() => {
    fetchBrands({ sortBy, sortDirection })
  }, [fetchBrands, sortBy, sortDirection])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      searchBrands({ name: searchTerm })
    } else {
      fetchBrands()
    }
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    fetchBrands()
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const handlePageChange = (page: number) => {
    if (searchTerm.trim()) {
      searchBrands({ name: searchTerm, pageNumber: page })
    } else {
      fetchBrands({ pageNumber: page })
    }
  }

  const handleDeleteBrand = (brand: Brand) => {
    setBrandToDelete(brand)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (brandToDelete) {
      await deleteBrand(brandToDelete.id)
      setIsDeleteDialogOpen(false)
      setBrandToDelete(null)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Brand Management" description="Manage your product brands">
        <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={() => router.push("/admin/brands/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </DashboardHeader>

      <main className="p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
              {searchTerm && (
                <Button type="button" variant="outline" onClick={handleClearSearch}>
                  Clear
                </Button>
              )}
            </form>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                          <div className="flex items-center">
                            Brand Name
                            {sortBy === "name" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands.length > 0 ? (
                        brands.map((brand) => (
                          <TableRow key={brand.id}>
                            <TableCell className="font-medium">{brand.name}</TableCell>
                            <TableCell>
                              {brand.description ? (
                                brand.description.length > 100 ? (
                                  `${brand.description.substring(0, 100)}...`
                                ) : (
                                  brand.description
                                )
                              ) : (
                                <span className="text-gray-400 italic">No description</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => router.push(`/admin/brands/edit/${brand.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteBrand(brand)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            {searchTerm ? "No brands found matching your search" : "No brands found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
            )}
          </div>
        </div>
      </main>

      {/* Delete Brand Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this brand? This action cannot be undone.</p>
            {brandToDelete && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p>
                  <strong>Brand:</strong> {brandToDelete.name}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-500 text-white hover:bg-red-600" type="button" variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
