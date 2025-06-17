"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface VasaiMapProps {
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

export function VasaiMap({ data }: VasaiMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [19.3897, 72.8397], // Vasai West coordinates
      zoom: 13,
      zoomControl: false,
    })

    // Add OpenStreetMap tiles with dark theme
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
    }).addTo(map)

    // Add IQAir air quality layer
    L.tileLayer(`https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${process.env.NEXT_PUBLIC_AQICN_API_TOKEN}`, {
      attribution: '&copy; <a href="https://aqicn.org">IQAir</a>',
      opacity: 0.7,
    }).addTo(map)

    // Add custom marker icon
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    // Add marker
    const marker = L.marker([19.3897, 72.8397], { icon: customIcon }).addTo(map)
    markerRef.current = marker

    // Create popup content
    const popupContent = `
      <div class="p-3 bg-white rounded-lg shadow-lg">
        <h3 class="font-bold text-lg text-black mb-2">Vasai West</h3>
        <div class="space-y-1">
          <p class="text-black"><span class="font-medium">AQI:</span> ${data.aqi}</p>
          <p class="text-black"><span class="font-medium">PM25:</span> ${data.iaqi.pm25.v} µg/m³</p>
          <p class="text-black"><span class="font-medium">PM10:</span> ${data.iaqi.pm10.v} µg/m³</p>
          <p class="text-black"><span class="font-medium">O3:</span> ${data.iaqi.o3.v} ppm</p>
          <p class="text-black"><span class="font-medium">NO2:</span> ${data.iaqi.no2.v} ppm</p>
        </div>
      </div>
    `

    // Add popup to marker
    marker.bindPopup(popupContent)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [data])

  return (
    <div className="relative w-full h-[600px] glassmorphism rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
} 