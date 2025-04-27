"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import useBrandStore from "@/stores/useBrandStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function CreateBrandPage() {
  const router = useRouter()
  const { isLoading, createBrand } = useBrandStore()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

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
      newErrors.name = "Brand name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Brand name must be at least 2 characters"
    } else if (formData.name.length > 50) {
      newErrors.name = "Brand name must be less than 50 characters"
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
      await createBrand(formData)
      router.push("/admin/brands")
    } catch (error) {
      console.error("Failed to create brand:", error)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Create New Brand" description="Add a new brand to the system">
        <Button className="bg-blue-500 text-white hover:bg-blue-600" variant="outline" size="sm" onClick={() => router.push("/admin/brands")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Brands
        </Button>
      </DashboardHeader>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>Enter the details for the new brand</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter brand description"
                  rows={5}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-4 border-t p-6">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/brands")}>
                Cancel
              </Button>
              <Button className="bg-blue-500 text-white hover:bg-blue-600" type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Brand"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardShell>
  )
}
