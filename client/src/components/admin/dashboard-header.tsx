"use client"

import { Bell, Moon, Settings } from "lucide-react"
import type { ReactNode } from "react"

interface DashboardHeaderProps {
  title?: string
  description?: string
  children?: ReactNode
}

export function DashboardHeader({ title = "WELCOME!", description, children }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-700">{title}</h1>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>

        <div className="flex items-center gap-4">
          {children}
          {/* <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <Moon size={20} />
          </button>
          <div className="relative">
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <Bell size={20} />
            </button>
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </div>
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <Settings size={20} />
          </button>
          <button className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=36&width=36"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </button> */}
        </div>
      </div>
    </header>
  )
}
