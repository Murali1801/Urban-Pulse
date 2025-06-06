"use client"

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Dynamically import the map component with no SSR
const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
})

interface TrafficMapProps {
  className?: string
}

export default function TrafficMap({ className = "" }: TrafficMapProps) {
  const [cityCoordinates] = useState({
    lat: 51.5074, // London coordinates as default
    lng: -0.1278,
  })

  // Replace with your actual TomTom API key
  const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || ''

  return (
    <div className={`relative ${className}`}>
      <MapComponent
        cityCoordinates={cityCoordinates}
        apiKey={apiKey}
      />
    </div>
  )
}
