"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, useTexture, Html } from "@react-three/drei"
import * as THREE from "three"
import { motion } from "framer-motion"
import { Droplets } from "lucide-react"

interface CityMarker {
  id: number
  name: string
  lat: number
  lng: number
  pollution: number
  traffic: number
}

// Generate sample data for city markers
const cityMarkers: CityMarker[] = [
  { id: 1, name: "New York", lat: 40.7128, lng: -74.006, pollution: 0.7, traffic: 0.8 },
  { id: 2, name: "London", lat: 51.5074, lng: -0.1278, pollution: 0.6, traffic: 0.7 },
  { id: 3, name: "Tokyo", lat: 35.6762, lng: 139.6503, pollution: 0.8, traffic: 0.9 },
  { id: 4, name: "Sydney", lat: -33.8688, lng: 151.2093, pollution: 0.4, traffic: 0.5 },
  { id: 5, name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, pollution: 0.6, traffic: 0.6 },
  { id: 6, name: "Cape Town", lat: -33.9249, lng: 18.4241, pollution: 0.5, traffic: 0.4 },
  { id: 7, name: "Moscow", lat: 55.7558, lng: 37.6173, pollution: 0.7, traffic: 0.8 },
  { id: 8, name: "Beijing", lat: 39.9042, lng: 116.4074, pollution: 0.9, traffic: 0.8 },
]

// Convert lat/lng to 3D coordinates on a sphere
function latLngToVector3(lat: number, lng: number, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const [hoveredMarker, setHoveredMarker] = useState<CityMarker | null>(null)

  // Load Earth texture
  const earthTexture = useTexture("/assets/3d/texture_earth.jpg")

  // Slowly rotate the earth
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005
    }
  })

  return (
    <>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={earthTexture} roughness={0.7} metalness={0.2} />

        {/* City markers */}
        {cityMarkers.map((city) => {
          const position = latLngToVector3(city.lat, city.lng, 1.01)

          // Color based on pollution level (green to red)
          const pollutionColor = new THREE.Color(city.pollution, 1 - city.pollution, 0.2)

          return (
            <group key={city.id} position={position}>
              {/* Marker point */}
              <mesh
                position={[0, 0, 0]}
                onPointerOver={() => setHoveredMarker(city)}
                onPointerOut={() => setHoveredMarker(null)}
              >
                <sphereGeometry args={[0.015, 16, 16]} />
                <meshStandardMaterial color={pollutionColor} emissive={pollutionColor} emissiveIntensity={0.7} />
              </mesh>

              {/* Pulsing ring */}
              <mesh position={[0, 0, 0]}>
                <ringGeometry args={[0.025, 0.03, 32]} />
                <meshBasicMaterial color={pollutionColor} transparent opacity={0.7} />
              </mesh>

              {/* Popup when hovering */}
              {hoveredMarker?.id === city.id && (
                <Html
                  position={[0, 0.05, 0]}
                  center
                  style={{
                    backgroundColor: "rgba(10, 15, 30, 0.8)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    transform: "translate3d(-50%, -100%, 0)",
                    border: "1px solid rgba(0, 163, 255, 0.3)",
                    boxShadow: "0 0 15px rgba(0, 163, 255, 0.3)",
                  }}
                >
                  <div>
                    <strong>{city.name}</strong>
                    <div className="text-xs mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                      <span>Pollution:</span>
                      <span className={city.pollution > 0.7 ? "text-red-400" : "text-green-400"}>
                        {Math.round(city.pollution * 100)}%
                      </span>
                      <span>Traffic:</span>
                      <span className={city.traffic > 0.7 ? "text-red-400" : "text-green-400"}>
                        {Math.round(city.traffic * 100)}%
                      </span>
                    </div>
                  </div>
                </Html>
              )}
            </group>
          )
        })}
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshBasicMaterial color="lightblue" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </>
  )
}

export function GlobeVisualization() {
  const [isGlobeVisible, setIsGlobeVisible] = useState(false)

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden glassmorphism">
      {isGlobeVisible ? (
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }} gl={{ antialias: true }}>
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 3, 5]} intensity={0.8} castShadow />
          <Earth />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1.5}
            maxDistance={4}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            autoRotate={false}
          />
        </Canvas>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-darker-bg/60">
          <div className="text-center px-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Droplets className="w-16 h-16 mx-auto mb-4 text-neon-blue" />
            </motion.div>
            <h3 className="text-xl font-medium mb-2">3D Globe Visualization</h3>
            <p className="text-muted-foreground max-w-md">
              This would display an interactive 3D globe showing real-time city data across the world.
            </p>
            <button
              onClick={() => setIsGlobeVisible(true)}
              className="mt-4 px-6 py-2 bg-neon-blue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              View Globe
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

