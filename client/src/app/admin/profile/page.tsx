"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, KeyRound } from "lucide-react"
import useUserStore from "@/stores/useUserStore"
import toast from "react-hot-toast"
import Image from "next/image"

export default function ProfilePage() {
  const { selectedUser, fetchMyInfo, updateMyInfo, updatePassword, isLoading } = useUserStore()

  const [activeTab, setActiveTab] = useState("profile")
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadUserInfo = async () => {
      const user = await fetchMyInfo()
      if (user) {
        setFullName(user.fullName || "")
        setPhoneNumber(user.phoneNumber || "")
        setImageUrl(user.imageUrl || "")
      }
    }

    loadUserInfo()
  }, [fetchMyInfo])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateMyInfo(
        {
          fullName,
          phoneNumber,
          imageUrl: imageFile ? undefined : imageUrl, // Only send imageUrl if no file is uploaded
        },
        imageFile,
      )

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setImageFile(null)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match")
      return
    }

    try {
      await updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      // Reset form after successful update
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Failed to update password:", error)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <DashboardShell>
      <DashboardHeader title="My Profile" description="View and update your profile information" />

      <div className="p-6">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Change Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-sm text-gray-500 mt-1">Update your personal details and profile picture</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center justify-start gap-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100">
                      {imagePreview || imageUrl ? (
                        <Image
                          src={imagePreview || imageUrl || "/placeholder.svg"}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <User size={48} />
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <Button type="button" variant="outline" onClick={triggerFileInput} className="w-full">
                      Change Picture
                    </Button>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={selectedUser?.username || ""} disabled className="bg-gray-50" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={selectedUser?.email || ""} disabled className="bg-gray-50" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>

                 

                    <div className="flex justify-end gap-4 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFullName(selectedUser?.fullName || "")
                          setPhoneNumber(selectedUser?.phoneNumber || "")
                          setImageUrl(selectedUser?.imageUrl || "")
                          setImagePreview(null)
                          setImageFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Change Password</h2>
                <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="p-6">
                <div className="max-w-md space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCurrentPassword("")
                        setNewPassword("")
                        setConfirmPassword("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
