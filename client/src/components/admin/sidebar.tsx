"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Box, ShoppingCart, Star, Tag, User, Users, Menu, X } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMobileSidebarOpen && !target.closest(".sidebar-container") && !target.closest(".sidebar-toggle")) {
        setIsMobileSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileSidebarOpen])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname])

  const isActive = (path: string) => {
    return pathname === path
  }

  // Navigation items grouped by section
  const navigationItems = {
    general: [
      { href: "/admin", label: "Dashboard", icon: <BarChart3 size={18} /> },
      { href: "/admin/product-list", label: "Products", icon: <Box size={18} /> },
      { href: "/admin/brands", label: "Brands", icon: <Tag size={18} /> },
      { href: "/admin/orders", label: "Orders", icon: <ShoppingCart size={18} /> },
      { href: "/admin/reviews", label: "Reviews", icon: <Star size={18} /> },
    ],
    users: [
      { href: "/admin/profile", label: "Profile", icon: <User size={18} /> },
      { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
    ],
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="sidebar-toggle fixed top-4 left-4 z-50 p-2 bg-brand-purple bg-opacity-70 hover:bg-opacity-100 text-white rounded-md shadow-md md:hidden flex items-center justify-center transition"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isMobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Sidebar Content */}
      <div
        className={`sidebar-container fixed md:sticky top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out transform ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } bg-gray-900 text-gray-300 flex flex-col`}
      >
        {/* Mobile Close Button (inside sidebar) */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          {/* GENERAL Section */}
          <div className="px-4 mb-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">GENERAL</p>
            <nav className="space-y-1">
              {navigationItems.general.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                    isActive(item.href) ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* USERS Section */}
          <div className="px-4 mt-6 mb-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">USERS</p>
            <nav className="space-y-1">
              {navigationItems.users.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                    isActive(item.href) ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
