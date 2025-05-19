"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { UserPaginationParams } from "@/types/user"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import useUserStore from "@/stores/useUserStore"


export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    users,
    totalUsers,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    error,
    fetchUsers,
    updateUserStatus,
    deleteUser,
  } = useUserStore()

  const [sortField, setSortField] = useState<string>("fullName")
  const [sortDirection, setSortDirection] = useState<string>("asc")

  // Get query params
  const pageNumber = Number(searchParams?.get("page") || "1")

  // Fetch users on mount and when params change
  useEffect(() => {
    const params: Partial<UserPaginationParams> = {
      pageNumber,
      pageSize,
      sortBy: sortField,
      sortDirection,
    }

    fetchUsers(params)
  }, [fetchUsers, pageNumber, pageSize, sortField, sortDirection])

  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return

    const params = new URLSearchParams(searchParams?.toString())
    params.set("page", page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)
  }

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/edit/${userId}`)
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    await updateUserStatus(userId, !currentStatus)
  }

  const handleAddUser = () => {
    router.push("/admin/users/create")
  }

  // Generate user initials for avatar
  const getUserInitials = (fullName: string | null, username: string): string => {
    if (fullName) {
      const names = fullName.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return fullName[0].toUpperCase()
    }
    return username[0].toUpperCase()
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Roles" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">ROLES LIST</h1>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Add User
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort("roleName")}
                  >
                    Role
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort("fullName")}
                  >
                    Full Name
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    Email
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
                        <p className="mt-2">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden relative flex items-center justify-center">
                            {user.imageUrl ? (
                              <Image
                                src={user.imageUrl || "/placeholder.svg"}
                                alt={user.username}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {getUserInitials(user.fullName, user.username)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.roleName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{user.fullName || "—"}</td>
                      <td className="px-4 py-4 text-gray-700">{user.email}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              user.isActive ? "bg-orange-500" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                user.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                         
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
                            title="Edit user"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Showing {users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
