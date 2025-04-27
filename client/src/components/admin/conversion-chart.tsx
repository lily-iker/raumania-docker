"use client"

import { useEffect, useRef } from "react"

export function ConversionChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Set dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Draw background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = "#f3f4f6"
    ctx.fill()

    // Draw progress arc
    const progress = 0.652 // 65.2%
    const startAngle = -Math.PI / 2 // Start from top
    const endAngle = startAngle + Math.PI * 2 * progress

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.lineTo(centerX, centerY)
    ctx.fillStyle = "#f97316"
    ctx.fill()

    // Draw inner circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2)
    ctx.fillStyle = "#ffffff"
    ctx.fill()

    // Draw progress lines
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2 - Math.PI / 2
      const innerRadius = radius * 0.8
      const outerRadius = radius * 0.95

      const startX = centerX + Math.cos(angle) * innerRadius
      const startY = centerY + Math.sin(angle) * innerRadius
      const endX = centerX + Math.cos(angle) * outerRadius
      const endY = centerY + Math.sin(angle) * outerRadius

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.lineWidth = 2

      // Determine if this line is within the progress arc
      const lineAngle = (i / 60) * Math.PI * 2
      const isWithinProgress = lineAngle <= progress * Math.PI * 2

      ctx.strokeStyle = isWithinProgress ? "#f97316" : "#e5e7eb"
      ctx.stroke()
    }
  }, [])

  return (
    <div className="w-full max-w-[200px] mx-auto">
      <canvas ref={canvasRef} width={200} height={200} className="w-full h-full"></canvas>
    </div>
  )
}
