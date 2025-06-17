"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Droplets, AlertTriangle, BarChart3, Clock, ArrowUpRight, TrendingUp, TrendingDown, Waves, Search, Thermometer, Droplet, Navigation, ArrowUp, ArrowDown, MapPin, Wind, NavigationIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

// Coastal cities with their coordinates
const coastalCities = [
  { name: "Mumbai", lat: 19.3607, lon: 72.7956 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Goa", lat: 15.2993, lon: 73.9941 },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 }
]

// Marine API interfaces - updated with all fields
interface MarineCurrentUnits {
  time: string;
  interval: string;
  wave_height: string;
  wave_period: string;
  wave_direction: string;
  wind_wave_height: string;
  wind_wave_direction: string;
  wind_wave_period: string;
  wind_wave_peak_period?: string;
  ocean_current_velocity: string;
  ocean_current_direction: string;
  sea_level_height_msl: string;
  sea_surface_temperature: string;
}

interface MarineCurrent {
  time: string;
  interval: number;
  wave_height: number;
  wave_period: number;
  wave_direction: number;
  wind_wave_height: number;
  wind_wave_direction: number;
  wind_wave_period: number;
  wind_wave_peak_period?: number;
  ocean_current_velocity: number;
  ocean_current_direction: number;
  sea_level_height_msl: number;
  sea_surface_temperature: number;
}

interface MarineHourlyUnits {
  time: string;
  wave_height: string;
  wave_direction: string;
  wave_period: string;
  wind_wave_height: string;
  wind_wave_direction: string;
  wind_wave_period: string;
  wind_wave_peak_period?: string;
  ocean_current_velocity: string;
  ocean_current_direction: string;
  sea_level_height_msl: string;
  sea_surface_temperature: string;
}

interface MarineHourly {
  time: string[];
  wave_height: number[];
  wave_direction: number[];
  wave_period: number[];
  wind_wave_height: number[];
  wind_wave_direction: number[];
  wind_wave_period: number[];
  wind_wave_peak_period?: number[];
  ocean_current_velocity: number[];
  ocean_current_direction: number[];
  sea_level_height_msl: number[];
  sea_surface_temperature: number[];
}

interface MarineDailyUnits {
  time: string;
  wave_height_max: string;
  wave_direction_dominant: string;
  wave_period_max: string;
  wind_wave_height_max: string;
  wind_wave_direction_dominant: string;
  wind_wave_period_max: string;
  wind_wave_peak_period_max?: string;
}

interface MarineDaily {
  time: string[];
  wave_height_max: number[];
  wave_direction_dominant: number[];
  wave_period_max: number[];
  wind_wave_height_max: number[];
  wind_wave_direction_dominant: number[];
  wind_wave_period_max: number[];
  wind_wave_peak_period_max?: (number | null)[];
}

interface MarineApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: MarineCurrentUnits;
  current: MarineCurrent;
  hourly_units: MarineHourlyUnits;
  hourly: MarineHourly;
  daily_units: MarineDailyUnits;
  daily: MarineDaily;
}

// Sample reservoir data - Keeping for backwards compatibility with layout structure
const reservoirData = [
  {
    id: 1,
    name: "Central Reservoir",
    capacity: 65,
    status: "Normal",
    phLevel: 7.2,
    lastUpdated: "15 minutes ago",
    change: { value: 2, type: "increase" },
  },
  {
    id: 2,
    name: "North Basin",
    capacity: 78,
    status: "Normal",
    phLevel: 7.1,
    lastUpdated: "20 minutes ago",
    change: { value: 3, type: "increase" },
  },
  {
    id: 3,
    name: "Highland Dam",
    capacity: 92,
    status: "High",
    phLevel: 7.3,
    lastUpdated: "10 minutes ago",
    change: { value: 5, type: "increase" },
  },
  {
    id: 4,
    name: "East Lake",
    capacity: 45,
    status: "Low",
    phLevel: 6.9,
    lastUpdated: "25 minutes ago",
    change: { value: 4, type: "decrease" },
  },
]

export default function WaterLevelsPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [marineData, setMarineData] = useState<MarineApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchCity, setSearchCity] = useState("")
  const [cityInput, setCityInput] = useState("")
  const [selectedCity, setSelectedCity] = useState(coastalCities[0])
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Function to convert city name to coordinates
  const fetchCityCoordinates = async (cityName: string) => {
    try {
      setIsSearching(true)
      // Using OpenStreetMap's Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error("City not found");
      }
      
      // Return the coordinates
      return { 
        name: cityName,
        lat: parseFloat(data[0].lat), 
        lon: parseFloat(data[0].lon) 
      };
    } catch (err) {
      console.error("Failed to fetch city coordinates:", err);
      toast({
        title: "Error",
        description: `Could not find coordinates for "${cityName}". Please try another city.`,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // Handle city search
  const handleCitySearch = async () => {
    if (!cityInput.trim()) return;
    
    // Check if city is in our predefined list
    const predefinedCity = coastalCities.find(
      city => city.name.toLowerCase() === cityInput.toLowerCase()
    );
    
    if (predefinedCity) {
      setSelectedCity(predefinedCity);
      setSearchCity(predefinedCity.name);
      return;
    }
    
    // Otherwise fetch coordinates
    const cityCoords = await fetchCityCoordinates(cityInput);
    if (cityCoords) {
      setSelectedCity(cityCoords);
      setSearchCity(cityCoords.name);
      setShowCityDropdown(false);
    }
  };

  // Fetch marine data
  useEffect(() => {
    const fetchMarineData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&daily=wave_height_max,wave_direction_dominant,wave_period_max,wind_wave_height_max,wind_wave_direction_dominant,wind_wave_period_max,wind_wave_peak_period_max&hourly=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period,ocean_current_velocity,ocean_current_direction,sea_level_height_msl,sea_surface_temperature&current=wave_height,wave_period,wave_direction,wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period,ocean_current_velocity,ocean_current_direction,sea_level_height_msl,sea_surface_temperature`
        )
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        setMarineData(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch marine data:", err)
        setError("Failed to load sea level data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchMarineData()
  }, [selectedCity])

  // Filter cities based on search input
  const filteredCities = coastalCities.filter(city => 
    city.name.toLowerCase().includes(cityInput.toLowerCase())
  )

  // Helper functions to process marine data
  const getWaveHeightStatus = (height: number) => {
    if (height >= 0.5) return { status: "High", color: "orange" }
    if (height >= 0.3) return { status: "Moderate", color: "blue" }
    return { status: "Low", color: "green" }
  }

  const formatWaveDirection = (direction: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"]
    const index = Math.round(direction / 45)
    return directions[index % 8]
  }

  // Calculate trends (comparing current to average of next 24h)
  const calculateTrend = () => {
    if (!marineData?.hourly) return null
    
    const currentHeight = marineData.current.wave_height
    const next24Hours = marineData.hourly.wave_height.slice(0, 24)
    const avgNext24Hours = next24Hours.reduce((sum, h) => sum + h, 0) / next24Hours.length
    
    const diff = ((currentHeight - avgNext24Hours) / avgNext24Hours) * 100
    return {
      value: Math.abs(parseFloat(diff.toFixed(1))),
      type: diff >= 0 ? "increase" : "decrease"
    }
  }

  const trend = calculateTrend()

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
            <h1 className="text-3xl font-bold mb-2">Water Level Monitoring</h1>
                <p className="text-muted-foreground">Track water reservoir levels and sea conditions metrics</p>
              </div>
              
              <div className="relative mt-4 md:mt-0 w-full md:w-64" ref={searchRef}>
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    placeholder="Enter any city..."
                    value={cityInput}
                    onChange={(e) => {
                      setCityInput(e.target.value)
                      setShowCityDropdown(true)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCitySearch();
                      }
                    }}
                    className="pl-10 pr-12"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6" 
                    onClick={handleCitySearch}
                    disabled={isSearching}
                  >
                    {isSearching ? 
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : 
                      <ArrowUpRight className="h-4 w-4" />
                    }
                  </Button>
                </div>
                
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                    {filteredCities.map((city) => (
                      <div
                        key={city.name}
                        className="px-4 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setSelectedCity(city)
                          setSearchCity(city.name)
                          setCityInput(city.name)
                          setShowCityDropdown(false)
                        }}
                      >
                        {city.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="glassmorphism p-12 rounded-xl text-center">
              <Droplets className="animate-pulse h-12 w-12 mx-auto mb-4 text-neon-blue" />
              <p>Loading water level data for {selectedCity.name}...</p>
            </div>
          ) : error ? (
            <div className="glassmorphism p-12 rounded-xl text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <p className="text-red-400">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:text-gradient">
                Overview
              </TabsTrigger>
              <TabsTrigger value="reservoirs" className="data-[state=active]:text-gradient">
                Forecast
              </TabsTrigger>
              <TabsTrigger value="water-quality" className="data-[state=active]:text-gradient">
                Sea Conditions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Current Wave Height */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glassmorphism border-0 h-full">
                      <CardContent className="pt-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Current Wave Height</h3>
                          {marineData && (
                          <Badge
                            variant="outline"
                            className={
                                getWaveHeightStatus(marineData.current.wave_height).color === "orange"
                                ? "bg-orange-500/20 text-orange-400"
                                  : getWaveHeightStatus(marineData.current.wave_height).color === "blue"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-green-500/20 text-green-400"
                            }
                          >
                              {getWaveHeightStatus(marineData.current.wave_height).status}
                          </Badge>
                          )}
                        </div>

                        <div className="relative py-5">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">
                              {marineData ? `${marineData.current.wave_height} m` : "N/A"}
                            </span>
                          </div>
                          <svg className="w-full h-36" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="35"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="35"
                              fill="none"
                              stroke={
                                marineData
                                  ? getWaveHeightStatus(marineData.current.wave_height).color === "orange"
                                  ? "rgba(255, 165, 0, 0.8)"
                                    : getWaveHeightStatus(marineData.current.wave_height).color === "blue"
                                    ? "rgba(0, 163, 255, 0.8)"
                                    : "rgba(75, 192, 192, 0.8)"
                                  : "rgba(128, 128, 128, 0.8)"
                              }
                              strokeWidth="10"
                              strokeDasharray={`${
                                marineData ? 2 * Math.PI * 35 * (marineData.current.wave_height / 1.5) : 0
                              } ${marineData ? 2 * Math.PI * 35 * (1 - marineData.current.wave_height / 1.5) : 0}`}
                              strokeDashoffset={2 * Math.PI * 35 * 0.25}
                            />
                          </svg>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {marineData
                                ? new Date(marineData.current.time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {trend && (
                              <>
                                {trend.type === "increase" ? (
                                  <TrendingUp className="h-3 w-3 text-orange-400" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-green-400" />
                                )}
                                <span>{trend.value}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Sea Surface Temperature */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="glassmorphism border-0 h-full">
                      <CardContent className="pt-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Sea Surface Temperature</h3>
                          <Badge variant="outline" className="bg-red-500/20 text-red-400">
                            {marineData?.current?.sea_surface_temperature && marineData.current.sea_surface_temperature > 28 ? "Warm" : "Normal"}
                          </Badge>
              </div>

                        <div className="relative py-5">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">
                              {marineData ? `${marineData.current.sea_surface_temperature.toFixed(1)}°C` : "N/A"}
                        </span>
                      </div>
                          <svg className="w-full h-36" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="35"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="35"
                              fill="none"
                              stroke="rgba(239, 68, 68, 0.6)"
                              strokeWidth="10"
                              strokeDasharray={`${
                                marineData ? 2 * Math.PI * 35 * ((marineData.current.sea_surface_temperature - 20) / 15) : 0
                              } ${marineData ? 2 * Math.PI * 35 * (1 - ((marineData.current.sea_surface_temperature - 20) / 15)) : 0}`}
                              strokeDashoffset={2 * Math.PI * 35 * 0.25}
                            />
                          </svg>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            <span>Temperature</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>
                              {marineData && marineData.hourly.sea_surface_temperature.length > 0
                                ? `Avg: ${(
                                    marineData.hourly.sea_surface_temperature
                                      .slice(0, 24)
                                      .reduce((sum, temp) => sum + temp, 0) / 24
                                  ).toFixed(1)}°C`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Sea Level */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Card className="glassmorphism border-0 h-full">
                      <CardContent className="pt-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Sea Level</h3>
                          <Badge 
                            variant="outline" 
                            className={
                              marineData?.current?.sea_level_height_msl && marineData.current.sea_level_height_msl > 0 
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-amber-500/20 text-amber-400"
                            }
                          >
                            {marineData?.current?.sea_level_height_msl && marineData.current.sea_level_height_msl > 0 ? "High Tide" : "Low Tide"}
                      </Badge>
                    </div>

                        <div className="relative py-5">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">
                              {marineData ? `${marineData.current.sea_level_height_msl.toFixed(2)} m` : "N/A"}
                            </span>
                          </div>
                          <div className="w-full h-24 relative mt-2">
                            <div className="absolute h-px w-full bg-muted top-1/2 left-0"></div>
                            <div 
                              className={`absolute h-2 w-2 rounded-full ${marineData?.current?.sea_level_height_msl !== undefined && marineData?.current?.sea_level_height_msl > 0 ? "bg-blue-400" : "bg-amber-400"}`}
                              style={{ 
                                left: "50%", 
                                top: "50%",
                                transform: `translateX(-50%) translateY(-50%) translateY(${marineData?.current?.sea_level_height_msl !== undefined ? -(marineData.current.sea_level_height_msl * 25) : 0}px)` 
                              }}
                            ></div>
                            <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
                              <span>+3m</span>
                              <span>0m</span>
                              <span>-3m</span>
                            </div>
                            
                            {/* Tide pattern */}
                            {marineData && marineData.hourly.sea_level_height_msl && marineData.hourly.sea_level_height_msl.length > 0 && (
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                  d={`M 0,${50 - (marineData.hourly.sea_level_height_msl[0] || 0) * 8} ${
                                    marineData.hourly.sea_level_height_msl
                                      .slice(0, 24)
                                      .map((level, i) => `L ${(i + 1) * (100 / 24)},${50 - (level || 0) * 8}`)
                                      .join(" ")
                                  }`}
                                  fill="none"
                                  stroke="rgba(59, 130, 246, 0.5)"
                                  strokeWidth="1"
                                />
                              </svg>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Droplet className="h-3 w-3" />
                            <span>Relative to MSL</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {marineData && (
                              <>
                                {marineData.hourly.sea_level_height_msl[1] > marineData.current.sea_level_height_msl ? (
                                  <TrendingUp className="h-3 w-3 text-blue-400" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-amber-400" />
                                )}
                              </>
                            )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>
              </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Ocean Current */}
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                      <CardTitle>Ocean Current</CardTitle>
                      <CardDescription>Current velocity and direction</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="glassmorphism p-6 rounded-xl">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-medium">Current Velocity</h3>
                              <div className="text-3xl font-bold my-3">
                                {marineData ? `${marineData.current.ocean_current_velocity.toFixed(1)} km/h` : "N/A"}
                        </div>
                              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">
                                {marineData?.current?.ocean_current_velocity !== undefined ? 
                                  (marineData.current.ocean_current_velocity < 0.5 ? "Calm" : 
                                   marineData.current.ocean_current_velocity < 1.5 ? "Mild" : "Strong")
                                  : "N/A"}
                      </div>
                        </div>
                      </div>

                          <div className="flex-1">
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-medium">Current Direction</h3>
                              <div className="relative w-32 h-32 mx-auto my-2">
                                <div className="relative w-full h-full rounded-full border-2 border-muted flex items-center justify-center">
                                  <div 
                                    className="absolute w-1 h-16 bg-cyan-400 origin-bottom" 
                                    style={{ 
                                      transform: marineData ? 
                                        `translateY(-50%) rotate(${marineData.current.ocean_current_direction}deg)` : 
                                        'translateY(-50%) rotate(0deg)' 
                                    }}
                                  />
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">N</div>
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-xs">S</div>
                                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">W</div>
                                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 text-xs">E</div>
                        </div>
                      </div>
                              <div className="text-sm">
                                {marineData ? `${marineData.current.ocean_current_direction}° ${formatWaveDirection(marineData.current.ocean_current_direction)}` : "N/A"}
                              </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                  {/* Wind Wave Information */}
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                      <CardTitle>Wind Wave Statistics</CardTitle>
                      <CardDescription>Wind-generated wave data</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="glassmorphism p-6 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glassmorphism p-4 rounded-lg">
                            <h3 className="text-sm font-medium mb-2">Wind Wave Height</h3>
                            <div className="text-2xl font-bold mb-1">
                              {marineData ? `${marineData.current.wind_wave_height.toFixed(2)} m` : "N/A"}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-muted-foreground">
                                Period: {marineData ? `${marineData.current.wind_wave_period.toFixed(1)}s` : "N/A"}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={
                                  marineData?.current?.wind_wave_height && marineData.current.wind_wave_height > 0.3
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-green-500/20 text-green-400"
                                }
                              >
                                {marineData?.current?.wind_wave_height && marineData.current.wind_wave_height > 0.3 ? "Choppy" : "Calm"}
                        </Badge>
                            </div>
                      </div>

                          <div className="glassmorphism p-4 rounded-lg">
                            <h3 className="text-sm font-medium mb-2">Wind Wave Direction</h3>
                            <div className="flex justify-center">
                              <div className="relative w-16 h-16 rounded-full border-2 border-muted flex items-center justify-center">
                                <div 
                                  className="absolute w-0.5 h-8 bg-orange-400 origin-bottom" 
                                  style={{ 
                                    transform: marineData ? 
                                      `translateY(-50%) rotate(${marineData.current.wind_wave_direction}deg)` : 
                                      'translateY(-50%) rotate(0deg)' 
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs">
                                    {marineData ? formatWaveDirection(marineData.current.wind_wave_direction) : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-center mt-2 text-xs text-muted-foreground">
                              {marineData ? `${marineData.current.wind_wave_direction}°` : "N/A"}
                            </div>
                          </div>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reservoirs">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {marineData && marineData.daily.time.slice(0, 4).map((day, index) => {
                  const waveHeight = marineData.daily.wave_height_max[index];
                  const wavePeriod = marineData.daily.wave_period_max[index];
                  const waveDirection = marineData.daily.wave_direction_dominant[index];
                  
                  // Calculate change from previous day if available
                  let waveHeightChange = 0;
                  let changeType = "";
                  if (index > 0) {
                    waveHeightChange = ((waveHeight - marineData.daily.wave_height_max[index-1]) / marineData.daily.wave_height_max[index-1]) * 100;
                    changeType = waveHeightChange >= 0 ? "increase" : "decrease";
                  }
                  
                  return (
                    <Card key={day} className="border-0 shadow-none bg-transparent">
                      <CardContent className="p-0">
                        <div className="glassmorphism p-6 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                          <div>
                              <h3 className="text-lg font-medium">
                                {new Date(day).toLocaleDateString([], {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </h3>
                              <p className="text-muted-foreground text-sm">Daily forecast</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                                waveHeight > 0.5 ? "bg-orange-500/20 text-orange-400" :
                                waveHeight > 0.3 ? "bg-blue-500/20 text-blue-400" :
                                "bg-green-500/20 text-green-400"
                              }
                            >
                              {waveHeight > 0.5 ? "High" : waveHeight > 0.3 ? "Moderate" : "Low"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="glassmorphism p-3 rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Max Wave Height</div>
                              <div className="text-xl font-medium mb-1">{waveHeight.toFixed(2)} m</div>
                              {index > 0 && (
                                <div className={`flex items-center text-xs ${changeType === "increase" ? "text-orange-400" : "text-green-400"}`}>
                                  {changeType === "increase" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                  <span>{Math.abs(waveHeightChange).toFixed(1)}% from yesterday</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="glassmorphism p-3 rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">Wave Period</div>
                              <div className="text-xl font-medium mb-1">{wavePeriod.toFixed(1)} s</div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{wavePeriod > 6 ? "Long period swell" : "Short period waves"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between space-x-2">
                            <div className="mb-3 text-sm flex-1">
                              <div className="flex items-center gap-1 mb-1">
                                <Waves className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Wave Direction:</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>{formatWaveDirection(waveDirection)}</span>
                                <ArrowUp 
                                  className="h-3 w-3" 
                                  style={{ transform: `rotate(${waveDirection}deg)` }} 
                                />
                              </div>
                            </div>
                            <div className="mb-3 text-sm flex-1">
                              <div className="flex items-center gap-1 mb-1">
                                <Wind className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Wind Wave:</span>
                              </div>
                              <div>
                                <span>{marineData.daily.wind_wave_height_max[index].toFixed(2)} m</span>
                            </div>
                          </div>
                        </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="w-full">
                              <Search className="h-3 w-3 mr-1" /> View Details
                          </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              <Clock className="h-3 w-3 mr-1" /> Hourly Forecast
                          </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <Card className="col-span-full border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Coastal Map</CardTitle>
                    <CardDescription>Current marine conditions for {selectedCity ? selectedCity.name : 'Mumbai'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 glassmorphism p-0 rounded-xl overflow-hidden h-[500px] relative">
                        <iframe 
                          src={`https://embed.windy.com/embed2.html?lat=${selectedCity.lat}&lon=${selectedCity.lon}&detailLat=${selectedCity.lat}&detailLon=${selectedCity.lon}&width=650&height=450&zoom=9&level=surface&overlay=waves&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                          width="100%" 
                          height="100%" 
                          frameBorder="0"
                          title="Marine Forecast Map"
                          loading="lazy"
                          allow="fullscreen"
                        ></iframe>
                        <div className="absolute bottom-2 left-2 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-md max-w-xs">
                          <div className="text-sm font-medium">{selectedCity.name} Marine Conditions</div>
                          <div className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedCity.lat.toFixed(4)}, {selectedCity.lon.toFixed(4)}
                            </span>
                        </div>
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-background/80 backdrop-blur-sm"
                            onClick={() => window.open(`https://www.windy.com/-Waves-waves?waves,${selectedCity.lat},${selectedCity.lon},9`, '_blank')}
                          >
                            <Search className="h-3 w-3 mr-1" /> Open Windy Map
                          </Button>
                        </div>
                      </div>
                      
                      <div className="glassmorphism p-6 rounded-xl flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Current Marine Conditions</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Wave Height</div>
                              <div className="text-2xl font-medium">
                                {marineData ? `${marineData.current.wave_height} m` : "N/A"}
                              </div>
                              <div className="flex items-center mt-1">
                                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      marineData?.current?.wave_height ? 
                                        (marineData.current.wave_height > 0.5 ? "bg-orange-500" :
                                         marineData.current.wave_height > 0.3 ? "bg-blue-500" :
                                         "bg-green-500")
                                        : "bg-gray-500"
                                    }`}
                                    style={{ width: `${marineData?.current?.wave_height ? Math.min(marineData.current.wave_height * 100, 100) : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Sea Temperature</div>
                              <div className="text-2xl font-medium">
                                {marineData ? `${marineData.current.sea_surface_temperature?.toFixed(1) || 'N/A'}°C` : "N/A"}
                              </div>
                              <div className="flex items-center mt-1">
                                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500"
                                    style={{ width: `${marineData && marineData.current.sea_surface_temperature ? Math.min(((marineData.current.sea_surface_temperature - 20) / 15) * 100, 100) : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Location</div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>
                                  {selectedCity ? selectedCity.name : 'Mumbai'} ({selectedCity ? selectedCity.lat.toFixed(4) : '19.0760'}, {selectedCity ? selectedCity.lon.toFixed(4) : '72.8777'})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-6 bg-gradient-to-r from-neon-blue to-neon-orange">
                          View Detailed Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="water-quality">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-3 border-0 shadow-none bg-transparent overflow-hidden">
                  <CardHeader>
                    <CardTitle>Sea Condition Metrics</CardTitle>
                    <CardDescription>Current marine data and hourly forecasts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Wave Height */}
                      <div className="glassmorphism p-5 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Wave Height</h3>
                          {marineData && (
                            <Badge
                              variant="outline"
                              className={
                                getWaveHeightStatus(marineData.current.wave_height).color === "orange"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : getWaveHeightStatus(marineData.current.wave_height).color === "blue"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-green-500/20 text-green-400"
                              }
                            >
                              {getWaveHeightStatus(marineData.current.wave_height).status}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-3xl font-bold mb-3">
                          {marineData ? `${marineData.current.wave_height} m` : "N/A"}
                        </div>
                        
                        <Progress 
                          value={marineData ? (marineData.current.wave_height / 1) * 100 : 0} 
                          className="h-2 mb-2" 
                        />
                        
                        <div className="flex justify-between text-xs text-muted-foreground pt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {marineData
                                ? new Date(marineData.current.time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                      <div>
                            {trend && (
                          <div className="flex items-center gap-1">
                                {trend.type === "increase" ? (
                                  <TrendingUp className="h-3 w-3 text-orange-400" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-green-400" />
                                )}
                                <span>{trend.value}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Wind Wave Height */}
                      <div className="glassmorphism p-5 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Wind Wave Height</h3>
                          {marineData && (
                            <Badge
                              variant="outline"
                              className={
                                marineData.current.wind_wave_height && marineData.current.wind_wave_height > 0.3
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-green-500/20 text-green-400"
                              }
                            >
                              {marineData.current.wind_wave_height > 0.3 ? "Choppy" : "Calm"}
                            </Badge>
                          )}
                          </div>
                        
                        <div className="text-3xl font-bold mb-3">
                          {marineData ? `${marineData.current.wind_wave_height.toFixed(2)} m` : "N/A"}
                        </div>
                        
                        <Progress 
                          value={marineData ? (marineData.current.wind_wave_height / 0.6) * 100 : 0} 
                          className="h-2 mb-2" 
                        />
                        
                        <div className="flex justify-between text-xs text-muted-foreground pt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Period: {marineData ? `${marineData.current.wind_wave_period.toFixed(1)}s` : "N/A"}</span>
                            </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            <span>
                              {marineData ? `${formatWaveDirection(marineData.current.wind_wave_direction)}` : ""}
                            </span>
                          </div>
                          </div>
                        </div>
                      
                      {/* Ocean Current */}
                      <div className="glassmorphism p-5 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Ocean Current</h3>
                          {marineData && (
                            <Badge
                              variant="outline"
                              className={
                                marineData.current.ocean_current_velocity && marineData.current.ocean_current_velocity > 1
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-green-500/20 text-green-400"
                              }
                            >
                              {marineData.current.ocean_current_velocity > 1 ? "Strong" : 
                               marineData.current.ocean_current_velocity > 0.5 ? "Moderate" : "Weak"}
                            </Badge>
                          )}
                      </div>

                        <div className="text-3xl font-bold mb-3">
                          {marineData ? `${marineData.current.ocean_current_velocity.toFixed(1)} km/h` : "N/A"}
                        </div>
                        
                        <Progress 
                          value={marineData ? (marineData.current.ocean_current_velocity / 4) * 100 : 0} 
                          className="h-2 mb-2" 
                        />
                        
                        <div className="flex justify-between text-xs text-muted-foreground pt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {marineData
                                ? new Date(marineData.current.time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            <span>
                              {marineData ? `${formatWaveDirection(marineData.current.ocean_current_direction)}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3 border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Sea Surface Temperature</CardTitle>
                    <CardDescription>Current and forecasted sea temperature</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-6 rounded-xl">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-medium">Current Temperature</h3>
                            <div className="text-3xl font-bold my-3">
                              {marineData ? `${marineData.current.sea_surface_temperature.toFixed(1)}°C` : "N/A"}
                            </div>
                            <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                              {marineData?.current?.sea_surface_temperature !== undefined ? 
                                (marineData.current.sea_surface_temperature > 28 ? "Warm" : 
                                 marineData.current.sea_surface_temperature > 25 ? "Moderate" : "Cool")
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-sm font-medium mb-3">Temperature Forecast</h3>
                          {marineData && (
                            <div className="h-24 w-full">
                              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path
                                  d={`M 0,${40 - (((marineData.hourly.sea_surface_temperature[0] || 25) - 20) / 15) * 40} ${
                                    marineData.hourly.sea_surface_temperature
                                      .slice(0, 24)
                                      .map((temp, i) => `L ${(i + 1) * (100 / 24)},${40 - (((temp || 25) - 20) / 15) * 40}`)
                                      .join(" ")
                                  }`}
                                  fill="none"
                                  stroke="rgba(239, 68, 68, 0.6)"
                                  strokeWidth="1.5"
                                />
                              </svg>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Now</span>
                                <span>+12h</span>
                                <span>+24h</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3 border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Hourly Forecast</CardTitle>
                    <CardDescription>Next 12 hours of sea conditions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-4 rounded-xl overflow-x-auto">
                      <div className="min-w-[900px]">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-sm border-b border-border/40">
                              <th className="p-2">Time</th>
                              <th className="p-2">Wave Height</th>
                              <th className="p-2">Wave Period</th>
                              <th className="p-2">Wave Direction</th>
                              <th className="p-2">Wind Waves</th>
                              <th className="p-2">Current</th>
                              <th className="p-2">Sea Level</th>
                              <th className="p-2">Temperature</th>
                            </tr>
                          </thead>
                          <tbody>
                            {marineData && marineData.hourly.time.slice(0, 12).map((time, i) => (
                              <tr key={time} className="border-b border-border/20 hover:bg-muted/5">
                                <td className="p-2">
                                  {new Date(time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{marineData.hourly.wave_height[i].toFixed(2)} m</span>
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        getWaveHeightStatus(marineData.hourly.wave_height[i]).color === "orange"
                                          ? "h-2 w-2 p-0 bg-orange-500"
                                          : getWaveHeightStatus(marineData.hourly.wave_height[i]).color === "blue"
                                          ? "h-2 w-2 p-0 bg-blue-500"
                                          : "h-2 w-2 p-0 bg-green-500"
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="p-2">{marineData.hourly.wave_period[i].toFixed(1)} s</td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <span>{formatWaveDirection(marineData.hourly.wave_direction[i])}</span>
                                    <ArrowUp 
                                      className="h-3 w-3" 
                                      style={{ transform: `rotate(${marineData.hourly.wave_direction[i]}deg)` }} 
                                    />
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <span>{marineData.hourly.wind_wave_height[i].toFixed(2)} m</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({marineData.hourly.wind_wave_period[i].toFixed(1)} s)
                                    </span>
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <span>{marineData.hourly.ocean_current_velocity[i].toFixed(1)} km/h</span>
                                    <ArrowUp 
                                      className="h-3 w-3 text-cyan-400" 
                                      style={{ transform: `rotate(${marineData.hourly.ocean_current_direction[i]}deg)` }} 
                                    />
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <span>{marineData.hourly.sea_level_height_msl[i]?.toFixed(2) || "N/A"} m</span>
                                    {marineData.hourly.sea_level_height_msl[i] && marineData.hourly.sea_level_height_msl[i] > 0 ? (
                                      <ArrowUp className="h-3 w-3 text-blue-400" />
                                    ) : (
                                      <ArrowDown className="h-3 w-3 text-amber-400" />
                                    )}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <span>{marineData.hourly.sea_surface_temperature[i].toFixed(1)}°C</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3 border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Marine Advisories</CardTitle>
                    <CardDescription>Current marine conditions and safety advisories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-6 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="mb-4 flex gap-2 flex-wrap">
                            {marineData && (
                              <>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    Math.max(...marineData.daily.wave_height_max) > 0.5
                                      ? "bg-orange-500/20 text-orange-400"
                                      : "bg-green-500/20 text-green-400"
                                  }
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {Math.max(...marineData.daily.wave_height_max) > 0.5 
                                    ? "Wave Height Advisory" 
                                    : "Normal Wave Conditions"
                                  }
                            </Badge>
                                
                                <Badge 
                                  variant="outline" 
                                  className={
                                    marineData.current.ocean_current_velocity && marineData.current.ocean_current_velocity > 1
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-green-500/20 text-green-400"
                                  }
                                >
                                  <Navigation className="h-3 w-3 mr-1" />
                                  {marineData?.current?.ocean_current_velocity && marineData.current.ocean_current_velocity > 1
                                    ? "Strong Current Advisory" 
                                    : "Normal Current Conditions"
                                  }
                                </Badge>
                                
                                <Badge 
                                  variant="outline" 
                                  className={
                                    marineData.current.sea_surface_temperature > 28
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-green-500/20 text-green-400"
                                  }
                                >
                                  <Thermometer className="h-3 w-3 mr-1" />
                                  {marineData.current.sea_surface_temperature > 28
                                    ? "High SST Advisory" 
                                    : "Normal Temperature"
                                  }
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          <div className="text-sm space-y-4">
                            {marineData && (marineData.current.wave_height > 0.5 || marineData.current.ocean_current_velocity > 1) && (
                              <div>
                                <h3 className="font-medium mb-2">Current Advisories:</h3>
                                <ul className="space-y-2">
                                  {marineData.current.wave_height > 0.5 && (
                                    <li className="flex items-start gap-2">
                                      <ArrowUpRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                      <span>Wave heights of {marineData.current.wave_height.toFixed(2)}m observed. Caution advised for small watercraft.</span>
                                    </li>
                                  )}
                                  {marineData.current.ocean_current_velocity > 1 && (
                                    <li className="flex items-start gap-2">
                                      <ArrowUpRight className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                      <span>Strong ocean currents ({marineData.current.ocean_current_velocity?.toFixed(1) || "N/A"} km/h) from {formatWaveDirection(marineData.current.ocean_current_direction || 0)}. Exercise caution when swimming.</span>
                                    </li>
                                  )}
                                  {marineData.current.sea_surface_temperature > 28 && (
                                    <li className="flex items-start gap-2">
                                      <ArrowUpRight className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                                      <span>Elevated sea surface temperature ({marineData.current.sea_surface_temperature.toFixed(1)}°C) may impact marine ecosystems.</span>
                                    </li>
                                  )}
                                </ul>
                        </div>
                            )}
                            
                            {marineData && Math.max(...marineData.daily.wave_height_max) > 0.5 && (
                              <div>
                                <h3 className="font-medium mb-2">Forecast Advisories:</h3>
                                <p className="mb-2">Increased wave activity expected in the coming days, with maximum wave heights reaching {Math.max(...marineData.daily.wave_height_max).toFixed(2)}m.</p>
                                <ul className="space-y-2">
                                  <li className="flex items-start gap-2">
                                    <ArrowUpRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                    <span>Coastal Areas: Exercise caution during high tide periods</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <ArrowUpRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                    <span>Small Craft: Monitor weather forecasts before heading out</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <ArrowUpRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                    <span>Beach Activities: Stay informed about local conditions</span>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-3">7-Day Marine Forecast:</h3>
                          {marineData && (
                            <div className="space-y-3">
                              {marineData.daily.time.map((day, i) => (
                                <div key={day} className="flex items-center p-2 rounded-lg hover:bg-muted/10">
                                  <div className="w-16 text-sm">
                                    {new Date(day).toLocaleDateString([], {
                                      weekday: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <div className="flex-1 flex justify-around text-sm">
                                    <div className="flex flex-col items-center" title="Wave Height">
                                      <Waves className="h-4 w-4 mb-1 text-blue-400" />
                                      <span>{marineData.daily.wave_height_max[i].toFixed(1)}m</span>
                                    </div>
                                    <div className="flex flex-col items-center" title="Wind Wave">
                                      <Wind className="h-4 w-4 mb-1 text-orange-400" />
                                      <span>{marineData.daily.wind_wave_height_max[i].toFixed(1)}m</span>
                                    </div>
                                    <div className="flex flex-col items-center" title="Sea Temperature">
                                      <Thermometer className="h-4 w-4 mb-1 text-red-400" />
                                      <span>{marineData.hourly.sea_surface_temperature[i * 24].toFixed(1)}°C</span>
                                    </div>
                                  </div>
                                  <div className="w-20 text-right">
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        marineData.daily.wave_height_max[i] > 0.5
                                          ? "bg-orange-500/20 text-orange-400"
                                          : "bg-green-500/20 text-green-400"
                                      }
                                    >
                                      {marineData.daily.wave_height_max[i] > 0.5 ? "Advisory" : "Safe"}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}

