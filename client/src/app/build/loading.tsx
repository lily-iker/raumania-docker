"use client"

import { useProgress } from "@react-three/drei"
import clsx from "clsx"

export default function Loading() {
  const { progress } = useProgress()

  return (
    <div
      className={clsx(
        "absolute inset-0 grid place-content-center bg-gradient-to-r from-pink-100 to-rose-100 font-sans text-[10vw] text-rose-800 transition-opacity duration-1000",
        progress >= 100 ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-rose-300 border-t-rose-600 animate-spin mb-8"></div>
        <p className="text-2xl font-medium animate-pulse">Loading Fragrance Experience...</p>
        <p className="text-lg text-rose-600 mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}
