"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

interface MarineData {
  wave_height: number;
  wave_direction: number;
  wave_period: number;
  wave_height_max: number;
  wave_direction_dominant: number;
  wave_period_max: number;
  hourly_wave_height: number[];
  hourly_wave_direction: number[];
  hourly_wave_period: number[];
  hourly_times: string[];
  time: string;
}

interface CityMarker {
  id: number;
  name: string;
  lat: number;
  lng: number;
  marineData: MarineData | null;
}

// Expanded list of coastal cities worldwide
const coastalCities: CityMarker[] = [
  // Indian Coastal Cities
  { id: 1, name: "Mumbai", lat: 19.0760, lng: 72.8777, marineData: null },
  { id: 2, name: "Chennai", lat: 13.0827, lng: 80.2707, marineData: null },
  { id: 3, name: "Kochi", lat: 9.9312, lng: 76.2673, marineData: null },
  { id: 4, name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, marineData: null },
  { id: 5, name: "Goa", lat: 15.2993, lng: 74.1240, marineData: null },
  { id: 6, name: "Mangalore", lat: 12.8698, lng: 74.8431, marineData: null },
  { id: 7, name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, marineData: null },
  { id: 8, name: "Puducherry", lat: 11.9416, lng: 79.8083, marineData: null },
  { id: 9, name: "Port Blair", lat: 11.6234, lng: 92.7265, marineData: null },
  { id: 10, name: "Kolkata", lat: 22.5726, lng: 88.3639, marineData: null },
  { id: 11, name: "Porbandar", lat: 21.6417, lng: 69.6293, marineData: null },
  { id: 12, name: "Kakinada", lat: 16.9891, lng: 82.2475, marineData: null },
  { id: 13, name: "Paradip", lat: 20.3166, lng: 86.6111, marineData: null },
  { id: 14, name: "Tuticorin", lat: 8.7642, lng: 78.1348, marineData: null },
  { id: 15, name: "Kannur", lat: 11.8745, lng: 75.3704, marineData: null },

  // Asian Coastal Cities
  { id: 16, name: "Dubai", lat: 25.2048, lng: 55.2708, marineData: null },
  { id: 17, name: "Singapore", lat: 1.3521, lng: 103.8198, marineData: null },
  { id: 18, name: "Tokyo", lat: 35.6762, lng: 139.6503, marineData: null },
  { id: 19, name: "Hong Kong", lat: 22.3193, lng: 114.1694, marineData: null },
  { id: 20, name: "Shanghai", lat: 31.2304, lng: 121.4737, marineData: null },
  { id: 21, name: "Busan", lat: 35.1796, lng: 129.0756, marineData: null },
  { id: 22, name: "Jakarta", lat: -6.2088, lng: 106.8456, marineData: null },
  { id: 23, name: "Manila", lat: 14.5995, lng: 120.9842, marineData: null },

  // Americas
  { id: 24, name: "Miami", lat: 25.7617, lng: -80.1918, marineData: null },
  { id: 25, name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, marineData: null },
  { id: 26, name: "San Francisco", lat: 37.7749, lng: -122.4194, marineData: null },
  { id: 27, name: "Vancouver", lat: 49.2827, lng: -123.1207, marineData: null },
  { id: 28, name: "Panama City", lat: 8.9824, lng: -79.5199, marineData: null },
  { id: 29, name: "Valparaiso", lat: -33.0472, lng: -71.6127, marineData: null },

  // Europe
  { id: 30, name: "Barcelona", lat: 41.3851, lng: 2.1734, marineData: null },
  { id: 31, name: "Venice", lat: 45.4408, lng: 12.3155, marineData: null },
  { id: 32, name: "Rotterdam", lat: 51.9244, lng: 4.4777, marineData: null },
  { id: 33, name: "Istanbul", lat: 41.0082, lng: 28.9784, marineData: null },
  { id: 34, name: "Marseille", lat: 43.2965, lng: 5.3698, marineData: null },

  // Oceania & Africa
  { id: 35, name: "Sydney", lat: -33.8688, lng: 151.2093, marineData: null },
  { id: 36, name: "Cape Town", lat: -33.9249, lng: 18.4241, marineData: null },
  { id: 37, name: "Melbourne", lat: -37.8136, lng: 144.9631, marineData: null },
  { id: 38, name: "Auckland", lat: -36.8509, lng: 174.7645, marineData: null },
  { id: 39, name: "Lagos", lat: 6.5244, lng: 3.3792, marineData: null },
  { id: 40, name: "Mombasa", lat: -4.0435, lng: 39.6682, marineData: null }
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
  const [selectedMarker, setSelectedMarker] = useState<CityMarker | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [cityData, setCityData] = useState<CityMarker[]>(coastalCities);
  const [isLoading, setIsLoading] = useState(true);
  const earthTexture = useTexture("/texture_earth.jpg");

  // Add orbit controls ref
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const fetchMarineData = async () => {
      setIsLoading(true);
      try {
        const updatedCities = await Promise.all(
          coastalCities.map(async (city) => {
            try {
              const response = await fetch(
                `https://marine-api.open-meteo.com/v1/marine?latitude=${city.lat}&longitude=${city.lng}&daily=wave_height_max,wave_direction_dominant,wave_period_max&hourly=wave_height,wave_direction,wave_period&current=wave_height,wave_period,wave_direction`
              );
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const data = await response.json();
              
              return {
                ...city,
                marineData: {
                  wave_height: data.current?.wave_height ?? 0,
                  wave_direction: data.current?.wave_direction ?? 0,
                  wave_period: data.current?.wave_period ?? 0,
                  wave_height_max: data.daily?.wave_height_max[0] ?? 0,
                  wave_direction_dominant: data.daily?.wave_direction_dominant[0] ?? 0,
                  wave_period_max: data.daily?.wave_period_max[0] ?? 0,
                  hourly_wave_height: data.hourly?.wave_height.slice(0, 24) ?? [],
                  hourly_wave_direction: data.hourly?.wave_direction.slice(0, 24) ?? [],
                  hourly_wave_period: data.hourly?.wave_period.slice(0, 24) ?? [],
                  hourly_times: data.hourly?.time.slice(0, 24) ?? [],
                  time: data.current?.time ?? new Date().toISOString()
                }
              };
            } catch (error) {
              console.error(`Error fetching data for ${city.name}:`, error);
              return {
                ...city,
                marineData: null
              };
            }
          })
        );
        setCityData(updatedCities);
      } catch (error) {
        console.error("Error fetching marine data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarineData();
    const interval = setInterval(fetchMarineData, 300000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (earthRef.current && isRotating) {
      earthRef.current.rotation.y += 0.0005;
    }
  });

  // Update click handler to also stop orbit controls
  const handleMarkerClick = (city: CityMarker, event: THREE.Event) => {
    (event as unknown as Event).stopPropagation(); // Prevent event bubbling
    setSelectedMarker(city);
    setIsRotating(false);
    if (controlsRef.current) {
      controlsRef.current.enabled = false; // Disable controls when marker is selected
    }
  };

  // Update close handler to re-enable controls
  const handleClosePopup = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling
    setSelectedMarker(null);
    setIsRotating(true);
    if (controlsRef.current) {
      controlsRef.current.enabled = true; // Re-enable controls when popup is closed
    }
  };

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={earthTexture} roughness={0.7} metalness={0.2} />

        {cityData.map((city) => {
          const position = latLngToVector3(city.lat, city.lng, 1.01);
          
          const waveHeight = city.marineData?.wave_height ?? 0;
          const waveDirection = city.marineData?.wave_direction ?? 0;
          const wavePeriod = city.marineData?.wave_period ?? 0;
          const updateTime = city.marineData?.time ?? '';
          
          const waveIntensity = Math.min((waveHeight || 0) / 3, 1);
          const markerColor = new THREE.Color(waveIntensity, 1 - waveIntensity, 0.2);

          return (
            <group key={city.id} position={position}>
              <mesh
                position={[0, 0, 0]}
                onPointerOver={() => setHoveredMarker(city)}
                onPointerOut={() => !selectedMarker && setHoveredMarker(null)}
                onClick={(event) => handleMarkerClick(city, event)}
              >
                <sphereGeometry args={[0.015, 16, 16]} />
                <meshStandardMaterial 
                  color={markerColor}
                  emissive={markerColor} 
                  emissiveIntensity={selectedMarker?.id === city.id ? 1 : 0.7} 
                />
              </mesh>
              {(hoveredMarker?.id === city.id || selectedMarker?.id === city.id) && (
                <Html position={[0, 0.05, 0]} center>
                  <div 
                    className="bg-black/80 text-white p-2 rounded-lg text-sm min-w-[250px]"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching the globe
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-neon-blue">{city.name}</strong>
                      {selectedMarker?.id === city.id && (
                        <button 
                          onClick={(e) => handleClosePopup(e)}
                          className="text-gray-400 hover:text-white transition-colors px-2 py-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{getCityRegion(city)}</span>
                      <span className="text-xs text-gray-400">
                        {city.lat.toFixed(4)}°{city.lat > 0 ? 'N' : 'S'}, 
                        {city.lng.toFixed(4)}°{city.lng > 0 ? 'E' : 'W'}
                      </span>
                    </div>
                    {!isLoading && city.marineData ? (
                      <div className="mt-1 space-y-1">
                        <div className="border-b border-gray-600 pb-2">
                          <div className="font-semibold text-neon-blue">Current Conditions</div>
                          <div>Wave Height: {city.marineData.wave_height.toFixed(2)}m</div>
                          <div>Wave Direction: {city.marineData.wave_direction.toFixed(0)}°</div>
                          <div>Wave Period: {city.marineData.wave_period.toFixed(1)}s</div>
                        </div>
                        
                        <div className="border-b border-gray-600 pb-2">
                          <div className="font-semibold text-neon-blue">Daily Maximum</div>
                          <div>Max Wave Height: {city.marineData.wave_height_max.toFixed(2)}m</div>
                          <div>Dominant Direction: {city.marineData.wave_direction_dominant.toFixed(0)}°</div>
                          <div>Max Wave Period: {city.marineData.wave_period_max.toFixed(1)}s</div>
                        </div>

                        {selectedMarker?.id === city.id && (
                          <div>
                            <div className="font-semibold text-neon-blue">Hourly Forecast</div>
                            <div className="max-h-32 overflow-y-auto">
                              {city.marineData.hourly_times.map((time, index) => (
                                <div key={time} className="text-xs grid grid-cols-3 gap-1 py-1">
                                  <div>{new Date(time).getHours()}:00</div>
                                  <div>{city.marineData!.hourly_wave_height[index].toFixed(1)}m</div>
                                  <div>{city.marineData!.hourly_wave_period[index].toFixed(1)}s</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-400 mt-2">
                          Updated: {new Date(city.marineData.time).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-yellow-400">
                        Loading marine data...
                      </div>
                    )}
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </mesh>
      
      {/* Ocean effect */}
      <mesh>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshBasicMaterial 
          color="lightblue" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide} 
        />
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
          <OrbitControls 
            enablePan={false} 
            enableZoom 
            minDistance={1.5} 
            maxDistance={4}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      ) : (
        <div className="flex items-center justify-center bg-darker-bg/60 h-full">
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Droplets className="w-16 h-16 text-neon-blue" />
          </motion.div>
          <button 
            onClick={() => setIsGlobeVisible(true)} 
            className="btn-primary"
          >
            View 3D Data Globe
          </button>
        </div>
      )}
    </div>
  );
}

// Add a helper function to categorize cities by region
function getCityRegion(city: CityMarker): string {
  if (city.id <= 15) return "India";
  if (city.id <= 23) return "Asia";
  if (city.id <= 29) return "Americas";
  if (city.id <= 34) return "Europe";
  return "Oceania & Africa";
}