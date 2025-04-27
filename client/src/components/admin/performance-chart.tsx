"use client"

import { useEffect, useRef } from "react"

export function PerformanceChart() {
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
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e5e7eb"
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    ctx.textAlign = "center"
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px Inter, sans-serif"

    months.forEach((month, i) => {
      const x = padding + (chartWidth / 11) * i
      ctx.fillText(month, x, height - padding + 20)
    })

    // Draw y-axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 8; i++) {
      const y = height - padding - (chartHeight / 8) * i
      ctx.fillText(`${i * 10}`, padding - 10, y + 4)
    }

    // Draw bar chart data
    const barData = [32, 65, 45, 70, 47, 60, 42, 44, 80, 50, 65, 70]
    const barWidth = chartWidth / barData.length / 2

    barData.forEach((value, i) => {
      const x = padding + (chartWidth / 11) * i - barWidth / 2
      const barHeight = (value / 80) * chartHeight
      const y = height - padding - barHeight

      ctx.fillStyle = "#f97316"
      ctx.fillRect(x, y, barWidth, barHeight)
    })

    // Draw line chart data
    const lineData = [10, 15, 8, 20, 15, 18, 8, 15, 25, 18, 30, 25]

    ctx.beginPath()
    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 3

    lineData.forEach((value, i) => {
      const x = padding + (chartWidth / 11) * i
      const y = height - padding - (value / 30) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw dots on line
    lineData.forEach((value, i) => {
      const x = padding + (chartWidth / 11) * i
      const y = height - padding - (value / 30) * chartHeight

      ctx.beginPath()
      ctx.fillStyle = "#ffffff"
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.strokeStyle = "#22c55e"
      ctx.lineWidth = 2
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.stroke()
    })

    // Draw legend
    const legendY = padding / 2

    // Page Views
    ctx.beginPath()
    ctx.fillStyle = "#f97316"
    ctx.arc(width / 2 - 60, legendY, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#6b7280"
    ctx.textAlign = "left"
    ctx.fillText("Page Views", width / 2 - 50, legendY + 4)

    // Clicks
    ctx.beginPath()
    ctx.fillStyle = "#22c55e"
    ctx.arc(width / 2 + 30, legendY, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillText("Clicks", width / 2 + 40, legendY + 4)
  }, [])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} width={800} height={300} className="w-full h-full"></canvas>
    </div>
  )
}
