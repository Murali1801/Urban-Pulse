"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

// TomTom API key
const TOMTOM_API_KEY = "ItW9AxUQxsOwuOxriWGp1kEID5r6ptrQ"

interface TrafficMapProps {
  className?: string
}

const TrafficMap = ({ className }: TrafficMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null)
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map with a Google Maps-like style
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [72.816101, 19.366636], // Mumbai coordinates
      zoom: 13, // Adjusted zoom level for better city view
      attributionControl: false
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right")

    // Add click handler for route points
    map.current.on("load", () => {
      if (!map.current) return

      // Add TomTom traffic layer
      map.current.addSource("traffic", {
        type: "raster",
        tiles: [
          `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`
        ],
        tileSize: 256
      })

      map.current.addLayer({
        id: "traffic-layer",
        type: "raster",
        source: "traffic",
        paint: {
          "raster-opacity": 0.7
        }
      })

      // Add click handler for route points
      map.current.on("click", (e) => {
        if (!startPoint) {
          setStartPoint([e.lngLat.lng, e.lngLat.lat])
        } else if (!endPoint) {
          setEndPoint([e.lngLat.lng, e.lngLat.lat])
          // Calculate route
          calculateRoute(startPoint, [e.lngLat.lng, e.lngLat.lat])
        }
      })

      setMapLoaded(true)
    })

    // Handle errors
    map.current.on("error", (e) => {
      console.error("Map error:", e)
      setError("Failed to load map. Please try again later.")
    })

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const calculateRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
      )
      const data = await response.json()

      if (data.code === "Ok" && data.routes && data.routes[0]) {
        const route = data.routes[0]
        const distance = (route.distance / 1000).toFixed(2) // Convert to km
        const duration = Math.round(route.duration / 60) // Convert to minutes

        // Add route to map
        if (map.current) {
          // Remove existing route layer if it exists
          if (map.current.getLayer("route")) {
            map.current.removeLayer("route")
          }
          if (map.current.getSource("route")) {
            map.current.removeSource("route")
          }

          map.current.addLayer({
            "id": "route",
            "type": "line",
            "source": {
              "type": "geojson",
              "data": route.geometry
            },
            "layout": {
              "line-join": "round",
              "line-cap": "round"
            },
            "paint": {
              "line-color": "#4285F4", // Google Maps blue
              "line-width": 4,
              "line-opacity": 0.8
            }
          })

          // Add popup with route info
          new maplibregl.Popup()
            .setLngLat(start)
            .setHTML(`
              <div class="text-sm bg-white p-2 rounded shadow">
                <p class="font-medium">Route Information</p>
                <p>Distance: ${distance} km</p>
                <p>Duration: ${duration} minutes</p>
              </div>
            `)
            .addTo(map.current)
        }
      }
    } catch (error) {
      console.error("Error calculating route:", error)
      setError("Failed to calculate route. Please try again.")
    }
  }

  if (error) {
    return (
      <div className={`bg-muted rounded-lg p-4 text-center ${className}`}>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className={`w-full h-[600px] rounded-lg ${className}`}
      />
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded shadow-lg z-10">
        <p className="text-sm font-medium">
          {!startPoint ? "Click to set start point" : !endPoint ? "Click to set end point" : "Route calculated"}
        </p>
      </div>
    </div>
  )
}

export default TrafficMap
