"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

interface CityMarker {
  id: number;
  name: string;
  lat: number;
  lng: number;
  pollution: number;
  traffic: number;
}

const cityMarkers: CityMarker[] = [
  { id: 1, name: "New York", lat: 40.7128, lng: -74.006, pollution: 0.7, traffic: 0.8 },
  { id: 2, name: "London", lat: 51.5074, lng: -0.1278, pollution: 0.6, traffic: 0.7 },
  { id: 3, name: "Tokyo", lat: 35.6762, lng: 139.6503, pollution: 0.8, traffic: 0.9 },
  { id: 4, name: "Sydney", lat: -33.8688, lng: 151.2093, pollution: 0.4, traffic: 0.5 },
  { id: 5, name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, pollution: 0.6, traffic: 0.6 },
  { id: 6, name: "Mumbai", lat: 19.076, lng: 72.8777, pollution: 0.75, traffic: 0.85 },
  { id: 7, name: "Delhi", lat: 28.6139, lng: 77.209, pollution: 0.8, traffic: 0.9 },
  { id: 8, name: "Bangalore", lat: 12.9716, lng: 77.5946, pollution: 0.6, traffic: 0.8 },
  { id: 9, name: "Chennai", lat: 13.0827, lng: 80.2707, pollution: 0.5, traffic: 0.7 },
  { id: 10, name: "Kolkata", lat: 22.5726, lng: 88.3639, pollution: 0.7, traffic: 0.8 },
  { id: 11, name: "Hyderabad", lat: 17.385, lng: 78.4867, pollution: 0.55, traffic: 0.7 },
  { id: 12, name: "Pune", lat: 18.5204, lng: 73.8567, pollution: 0.4, traffic: 0.6 },
  { id: 13, name: "Ahmedabad", lat: 23.0225, lng: 72.5714, pollution: 0.6, traffic: 0.75 },
  { id: 14, name: "Jaipur", lat: 26.9124, lng: 75.7873, pollution: 0.5, traffic: 0.7 },
  { id: 15, name: "Lucknow", lat: 26.8467, lng: 80.9462, pollution: 0.7, traffic: 0.8 },
  { id: 16, name: "Surat", lat: 21.1702, lng: 72.8311, pollution: 0.55, traffic: 0.65 },
  { id: 17, name: "Indore", lat: 22.7196, lng: 75.8577, pollution: 0.4, traffic: 0.6 },
  { id: 18, name: "Bhopal", lat: 23.2599, lng: 77.4126, pollution: 0.5, traffic: 0.7 },
  { id: 19, name: "Patna", lat: 25.5941, lng: 85.1376, pollution: 0.75, traffic: 0.85 },
  { id: 20, name: "Nagpur", lat: 21.1458, lng: 79.0882, pollution: 0.6, traffic: 0.75 },
  { id: 21, name: "Chandigarh", lat: 30.7333, lng: 76.7794, pollution: 0.4, traffic: 0.6 },
  { id: 22, name: "Lucknow", lat: 26.8467, lng: 80.9462, pollution: 0.7, traffic: 0.8 },
  { id: 23, name: "Guwahati", lat: 26.1445, lng: 91.7362, pollution: 0.55, traffic: 0.7 },
  { id: 24, name: "Ludhiana", lat: 30.901, lng: 75.8573, pollution: 0.6, traffic: 0.75 },
  { id: 25, name: "Dehradun", lat: 30.3165, lng: 78.0322, pollution: 0.45, traffic: 0.6 },
  { id: 26, name: "Amritsar", lat: 31.634, lng: 74.8723, pollution: 0.55, traffic: 0.7 },
  { id: 27, name: "Shimla", lat: 31.1048, lng: 77.1734, pollution: 0.3, traffic: 0.4 },
  { id: 28, name: "Ranchi", lat: 23.3441, lng: 85.3096, pollution: 0.6, traffic: 0.7 },
  { id: 29, name: "Vadodara", lat: 22.3072, lng: 73.1812, pollution: 0.5, traffic: 0.6 },
  { id: 30, name: "Jammu", lat: 32.7266, lng: 74.857, pollution: 0.4, traffic: 0.6 }
];

function latLngToVector3(lat: number, lng: number, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const [hoveredMarker, setHoveredMarker] = useState<CityMarker | null>(null);
  const earthTexture = useTexture("/texture_earth.jpg");

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={earthTexture} roughness={0.7} metalness={0.2} />

        {cityMarkers.map((city) => {
          const position = latLngToVector3(city.lat, city.lng, 1.01);
          const pollutionColor = new THREE.Color(city.pollution, 1 - city.pollution, 0.2);

          return (
            <group key={city.id} position={position}>
              <mesh
                position={[0, 0, 0]}
                onPointerOver={() => setHoveredMarker(city)}
                onPointerOut={() => setHoveredMarker(null)}
              >
                <sphereGeometry args={[0.015, 16, 16]} />
                <meshStandardMaterial color={pollutionColor} emissive={pollutionColor} emissiveIntensity={0.7} />
              </mesh>
              {hoveredMarker?.id === city.id && (
                <Html position={[0, 0.05, 0]} center>
                  <div className="tooltip">
                    <strong>{city.name}</strong>
                    <div>
                      <span>Pollution: {Math.round(city.pollution * 100)}%</span>
                      <span>Traffic: {Math.round(city.traffic * 100)}%</span>
                    </div>
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </mesh>
      <mesh>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshBasicMaterial color="lightblue" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </>
  );
}

export function GlobeVisualization() {
  const [isGlobeVisible, setIsGlobeVisible] = useState(false);

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden glassmorphism">
      {isGlobeVisible ? (
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 3, 5]} intensity={0.8} />
          <Earth />
          <Stars radius={100} depth={50} count={5000} />
          <OrbitControls enablePan={false} enableZoom minDistance={1.5} maxDistance={4} />
        </Canvas>
      ) : (
        <div className="flex items-center justify-center bg-darker-bg/60 h-full">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Droplets className="w-16 h-16 text-neon-blue" />
          </motion.div>
          <button onClick={() => setIsGlobeVisible(true)} className="btn-primary">
            View Globe
          </button>
        </div>
      )}
    </div>
  );
}