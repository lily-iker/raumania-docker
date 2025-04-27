"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import useUserStore from "@/stores/useUserStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { DashboardHeader } from "@/components/admin/dashboard-header"

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { selectedUser, isLoading, fetchUserById, updateUser } = useUserStore()

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    imageUrl: "",
    isActive: true,
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        await fetchUserById(userId)
      } catch (error) {
        console.error("Failed to fetch user:", error)
        router.push("/admin/users")
      }
    }

    loadUser()
  }, [userId, fetchUserById, router])

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        fullName: selectedUser.fullName || "",
        phoneNumber: selectedUser.phoneNumber || "",
        imageUrl: selectedUser.imageUrl || "",
        isActive: selectedUser.isActive,
      })
    }
  }, [selectedUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      await updateUser(selectedUser.id, formData)
      router.push("/admin/users")
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Edit User" description="Update user information">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </DashboardHeader>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit User Information</CardTitle>
            <CardDescription>
              {selectedUser
                ? `Editing ${selectedUser.username} (${selectedUser.email})`
                : "Loading user information..."}
            </CardDescription>
          </CardHeader>

          {isLoading ? (
            <CardContent className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>


                <div className="flex items-center space-x-2">
                  <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleStatusChange} />
                  <Label htmlFor="isActive">{formData.isActive ? "User is active" : "User is inactive"}</Label>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-4 border-t p-6">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}
