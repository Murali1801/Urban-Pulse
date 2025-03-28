"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface HeatmapProps {
  data: {
    aqi: number
    iaqi: {
      pm25: { v: number }
      pm10: { v: number }
      o3: { v: number }
      no2: { v: number }
    }
  }
}

export function HeatmapVisualization({ data }: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create gradient for heatmap
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "rgba(0, 255, 0, 0.3)") // Green for good
    gradient.addColorStop(0.33, "rgba(255, 255, 0, 0.3)") // Yellow for moderate
    gradient.addColorStop(0.66, "rgba(255, 165, 0, 0.3)") // Orange for unhealthy
    gradient.addColorStop(1, "rgba(255, 0, 0, 0.3)") // Red for very unhealthy

    // Draw heatmap
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add pollution data visualization
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) / 3

    // Draw concentric circles based on AQI
    const aqi = data.aqi
    const maxRadius = radius * (aqi / 200) // Normalize AQI to radius
    const opacity = Math.min(aqi / 200, 1) // Normalize opacity

    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI)
    ctx.fillStyle = `rgba(255, 0, 0, ${opacity * 0.3})`
    ctx.fill()

    // Add pollutant indicators
    const pollutants = [
      { name: "PM25", value: data.iaqi.pm25.v, color: "#10B981" },
      { name: "PM10", value: data.iaqi.pm10.v, color: "#F59E0B" },
      { name: "O3", value: data.iaqi.o3.v, color: "#EF4444" },
      { name: "NO2", value: data.iaqi.no2.v, color: "#8B5CF6" },
    ]

    pollutants.forEach((pollutant, index) => {
      const angle = (index * 2 * Math.PI) / pollutants.length
      const x = centerX + Math.cos(angle) * (radius * 0.8)
      const y = centerY + Math.sin(angle) * (radius * 0.8)

      // Draw pollutant circle
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, 2 * Math.PI)
      ctx.fillStyle = pollutant.color
      ctx.fill()

      // Add pollutant value
      ctx.fillStyle = "white"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(pollutant.value.toString(), x, y)
    })

    // Add legend
    const legendX = 20
    const legendY = 20
    ctx.fillStyle = "white"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Air Quality Heatmap", legendX, legendY)
    ctx.font = "12px sans-serif"
    ctx.fillText(`AQI: ${aqi}`, legendX, legendY + 20)
  }, [data])

  return (
    <div className="relative w-full h-[600px] glassmorphism rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: "rgba(0, 0, 0, 0.2)" }}
      />
      <div className="absolute top-4 right-4 z-10">
        <div className="glassmorphism p-3 rounded-lg shadow-lg">
          <h4 className="text-sm font-medium mb-3">Pollution Levels</h4>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-xs">Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span className="text-xs">Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span className="text-xs">Unhealthy (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-xs">Very Unhealthy (151+)</span>
          </div>
        </div>
      </div>
    </div>
  )
} 