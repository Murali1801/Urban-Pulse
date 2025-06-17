"use client"

import { useEffect, useRef, useState } from "react"
import tt from "@tomtom-international/web-sdk-maps"
import * as ttServices from "@tomtom-international/web-sdk-services"

const TOMTOM_API_KEY = "ItW9AxUQxsOwuOxriWGp1kEID5r6ptrQ"
const VASAI_WEST_COORDINATES = {
  lat: 19.3919,
  lng: 72.8397
}

interface TrafficMapProps {
  className?: string
  cityCoordinates?: {
    lat: number
    lng: number
  }
}

export default function TrafficMap({ className = "", cityCoordinates }: TrafficMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<tt.Map | null>(null)
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null)
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const coordinates = cityCoordinates || VASAI_WEST_COORDINATES;

    // Initialize map
    map.current = tt.map({
      key: TOMTOM_API_KEY,
      container: mapContainer.current,
      center: [coordinates.lng, coordinates.lat],
      zoom: 13,
      language: "en-GB",
    })

    // Add traffic flow layer
    map.current.on("load", () => {
      if (!map.current) return

      // Add traffic flow layer using raster tiles
      map.current.addSource('traffic', {
        type: 'raster',
        tiles: [
          `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`
        ],
        tileSize: 256
      })

      map.current.addLayer({
        id: 'traffic-layer',
        type: 'raster',
        source: 'traffic',
        paint: {
          'raster-opacity': 0.7
        }
      })

      // Add click handler for route points
      map.current.on('click', (e) => {
        if (!startPoint) {
          setStartPoint([e.lngLat.lng, e.lngLat.lat])
        } else if (!endPoint) {
          setEndPoint([e.lngLat.lng, e.lngLat.lat])
          // Calculate route
          calculateRoute(startPoint, [e.lngLat.lng, e.lngLat.lat])
        }
      })

      // Add navigation controls
      map.current.addControl(new tt.NavigationControl(), 'top-right')
    })

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [startPoint, endPoint, cityCoordinates])

  const calculateRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
      )
      const data = await response.json()

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0]
        const distance = (route.distance / 1000).toFixed(2) // Convert to km
        const duration = Math.round(route.duration / 60) // Convert to minutes

        // Add route to map
        if (map.current) {
          // Remove existing route layer if it exists
          if (map.current.getLayer('route')) {
            map.current.removeLayer('route')
          }
          if (map.current.getSource('route')) {
            map.current.removeSource('route')
          }

          // Add new route layer
          map.current.addLayer({
            'id': 'route',
            'type': 'line',
            'source': {
              'type': 'geojson',
              'data': route.geometry
            },
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#4285F4',
              'line-width': 4,
              'line-opacity': 0.8
            }
          })

          // Add popup with route info
          new tt.Popup()
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
      console.error('Error calculating route:', error)
    }
  }

  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className={`w-full h-[600px] ${className}`}
      />
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-lg">
        <p className="text-sm">
          {!startPoint ? 'Click to set start point' : 'Click to set end point'}
        </p>
      </div>
    </div>
  )
}
