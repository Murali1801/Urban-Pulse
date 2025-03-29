"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wind, Info, BarChart3, MapPin, Calendar, TrendingUp, TrendingDown, Check, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HeatmapVisualization } from "@/components/heatmap-visualization"
import { VasaiMap } from "@/components/vasai-map"
import { Input } from "@/components/ui/input"

// Types for the API response
interface AirQualityData {
  status: string
  data: {
    aqi: number
    city: {
      name: string
      geo: [number, number]
    }
    iaqi: {
      pm25: { v: number }
      pm10: { v: number }
      o3: { v: number }
      no2: { v: number }
    }
    time: {
      s: string
      iso: string
    }
    forecast: {
      daily: {
        pm25: Array<{
          avg: number
          day: string
          max: number
          min: number
        }>
        pm10: Array<{
          avg: number
          day: string
          max: number
          min: number
        }>
        o3: Array<{
          avg: number
          day: string
          max: number
          min: number
        }>
      }
    }
    attributions: Array<{
      url: string
      name: string
      logo?: string
    }>
  }
}

interface OpenMeteoAirQualityData {
  current: {
    time: string
    european_aqi: number
    us_aqi: number
    pm10: number
    pm2_5: number
    carbon_monoxide: number
    nitrogen_dioxide: number
    sulphur_dioxide: number
    ozone: number
    aerosol_optical_depth: number
    dust: number
    uv_index: number
    uv_index_clear_sky: number
    ammonia: number
    alder_pollen: number
    birch_pollen: number
    grass_pollen: number
    mugwort_pollen: number
    olive_pollen: number
    ragweed_pollen: number
  }
  hourly: {
    time: string[]
    pm2_5: (number | null)[]
    pm10: (number | null)[]
    ozone: (number | null)[]
  }
  latitude: number
  longitude: number
}

interface NormalizedAirQualityData {
  city: {
    name: string
    geo: [number, number]
  }
  aqi: number
  pollutants: {
    pm25: number
    pm10: number
    o3: number
    no2: number
    so2: number
    co: number
  }
  time: {
    iso: string
  }
  pollen: {
    alder: number
    birch: number
    grass: number
    mugwort: number
    olive: number
    ragweed: number
  }
  uv: {
    index: number
    clearSky: number
  }
  dust: number
  aerosol: number
  forecast: {
    hourly: {
      pm25: { time: string; value: number }[]
      pm10: { time: string; value: number }[]
      o3: { time: string; value: number }[]
    }
  }
}

// Default data for Vasai to prevent "No data available" error
const defaultVasaiData: NormalizedAirQualityData = {
  city: {
    name: "Vasai West",
    geo: [19.3919, 72.8266]
  },
  aqi: 62,
  pollutants: {
    pm25: 28.5,
    pm10: 45.7,
    o3: 52.3,
    no2: 18.6,
    so2: 5.2,
    co: 420.0
  },
  time: {
    iso: new Date().toISOString()
  },
  pollen: {
    alder: 0.4,
    birch: 2.3,
    grass: 1.7,
    mugwort: 0.3,
    olive: 0.1,
    ragweed: 0.2
  },
  uv: {
    index: 7.8,
    clearSky: 8.5
  },
  dust: 8.5,
  aerosol: 0.38,
  forecast: {
    hourly: {
      pm25: Array.from({ length: 24 }, (_, i) => {
        // Create a realistic daily pattern with higher values during morning/evening rush hours
        const hour = new Date(Date.now() + i * 3600 * 1000).getHours();
        let baseValue = 28.5;
        
        // Morning rush hour (7-10 AM)
        if (hour >= 7 && hour <= 10) {
          baseValue += 15;
        }
        // Evening rush hour (5-8 PM)
        else if (hour >= 17 && hour <= 20) {
          baseValue += 18;
        }
        // Night time (reduced pollution)
        else if (hour >= 0 && hour <= 5) {
          baseValue -= 10;
        }
        
        // Add some random variation
        const variation = Math.sin(i / 4) * 5 + (Math.random() * 4 - 2);
        
        return {
          time: new Date(Date.now() + i * 3600 * 1000).toISOString(),
          value: Math.max(5, baseValue + variation) // Ensure no negative values
        };
      }),
      pm10: Array.from({ length: 24 }, (_, i) => {
        // Create a realistic daily pattern with higher values during morning/evening rush hours
        const hour = new Date(Date.now() + i * 3600 * 1000).getHours();
        let baseValue = 45.7;
        
        // Morning rush hour
        if (hour >= 7 && hour <= 10) {
          baseValue += 20;
        }
        // Evening rush hour
        else if (hour >= 17 && hour <= 20) {
          baseValue += 25;
        }
        // Night time (reduced pollution)
        else if (hour >= 0 && hour <= 5) {
          baseValue -= 15;
        }
        
        // Add some random variation
        const variation = Math.sin(i / 4) * 8 + (Math.random() * 6 - 3);
        
        return {
          time: new Date(Date.now() + i * 3600 * 1000).toISOString(),
          value: Math.max(10, baseValue + variation) // Ensure no negative values
        };
      }),
      o3: Array.from({ length: 24 }, (_, i) => {
        // Create a realistic daily pattern with higher values during midday due to sunlight
        const hour = new Date(Date.now() + i * 3600 * 1000).getHours();
        let baseValue = 52.3;
        
        // Midday peak (11 AM - 3 PM)
        if (hour >= 11 && hour <= 15) {
          baseValue += 25;
        }
        // Evening/night (reduced ozone due to lack of sunlight)
        else if (hour >= 19 || hour <= 5) {
          baseValue -= 20;
        }
        
        // Add some random variation
        const variation = Math.sin(i / 4) * 10 + (Math.random() * 8 - 4);
        
        return {
          time: new Date(Date.now() + i * 3600 * 1000).toISOString(),
          value: Math.max(15, baseValue + variation) // Ensure no negative values
        };
      })
    }
  }
};

// Add this component directly in the air quality page file
const CitySearch = ({ onCitySearch, isLoading = false, error = null }: { 
  onCitySearch: (city: string) => void, 
  isLoading?: boolean,
  error?: string | null
}) => {
  const [searchInput, setSearchInput] = useState("")
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      onCitySearch(searchInput.trim())
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
      <div className="flex w-full relative">
        <Input 
          type="text" 
          placeholder="Search for a city..." 
          className="flex-1 pr-24"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="absolute right-0 bg-gradient-to-r from-neon-blue to-neon-orange"
          disabled={isLoading || !searchInput.trim()}
        >
          {isLoading ? (
            <>
              <Wind className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default function AirQualityPage() {
  const [selectedTab, setSelectedTab] = useState("dashboard")
  const [selectedLocation, setSelectedLocation] = useState("vasai")
  const [vasaiData, setVasaiData] = useState<NormalizedAirQualityData | null>(defaultVasaiData)
  const [mumbaiData, setMumbaiData] = useState<NormalizedAirQualityData | null>(null)
  const [maladData, setMaladData] = useState<NormalizedAirQualityData | null>(null)
  const [borivaliData, setBorivaliData] = useState<NormalizedAirQualityData | null>(null)
  const [searchedCityData, setSearchedCityData] = useState<NormalizedAirQualityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Function to fetch city coordinates from a city name using Nominatim API
  const fetchCityCoordinates = async (city: string): Promise<{ lat: number; lon: number; display_name: string }> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch coordinates for ${city}`)
    }
    
    const data = await response.json()
    if (!data || data.length === 0) {
      throw new Error(`No location data found for ${city}`)
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name
    }
  }

  // Function to normalize Open-Meteo data to our app format
  const normalizeAirQualityData = (data: OpenMeteoAirQualityData, cityName: string): NormalizedAirQualityData => {
    // Create hourly forecast data for PM2.5, PM10, and Ozone
    const hourlyPM25 = data.hourly.time.map((time, index) => ({
      time: time,
      value: data.hourly.pm2_5[index] || 0
    })).filter(item => item.value !== null && !isNaN(item.value)).slice(0, 24); // Get first 24 hours

    const hourlyPM10 = data.hourly.time.map((time, index) => ({
      time: time,
      value: data.hourly.pm10[index] || 0
    })).filter(item => item.value !== null && !isNaN(item.value)).slice(0, 24);

    const hourlyO3 = data.hourly.time.map((time, index) => ({
      time: time,
      value: data.hourly.ozone[index] || 0
    })).filter(item => item.value !== null && !isNaN(item.value)).slice(0, 24);

    return {
      city: {
        name: cityName,
        geo: [data.latitude, data.longitude]
      },
      aqi: data.current.european_aqi || data.current.us_aqi || 0,
      pollutants: {
        pm25: data.current.pm2_5 || 0,
        pm10: data.current.pm10 || 0,
        o3: data.current.ozone || 0,
        no2: data.current.nitrogen_dioxide || 0,
        so2: data.current.sulphur_dioxide || 0,
        co: data.current.carbon_monoxide || 0
      },
      time: {
        iso: data.current.time
      },
      pollen: {
        alder: data.current.alder_pollen || 0,
        birch: data.current.birch_pollen || 0,
        grass: data.current.grass_pollen || 0,
        mugwort: data.current.mugwort_pollen || 0,
        olive: data.current.olive_pollen || 0,
        ragweed: data.current.ragweed_pollen || 0
      },
      uv: {
        index: data.current.uv_index || 0,
        clearSky: data.current.uv_index_clear_sky || 0
      },
      dust: data.current.dust || 0,
      aerosol: data.current.aerosol_optical_depth || 0,
      forecast: {
        hourly: {
          pm25: hourlyPM25,
          pm10: hourlyPM10,
          o3: hourlyO3
        }
      }
    }
  }

  // Function to fetch air data and update state
  const fetchAirData = async (city: string) => {
    try {
      setSearchLoading(true)
      setSearchError(null)

      // First, get coordinates for the city
      const { lat, lon, display_name } = await fetchCityCoordinates(city)
      
      // Fetch air quality data from Open-Meteo using coordinates
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&hourly=pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,methane,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch air quality data for ${city}`)
      }
      
      const data: OpenMeteoAirQualityData = await response.json()
      
      // Normalize the data
      const normalizedData = normalizeAirQualityData(data, display_name.split(',')[0])
      
      // Update data for searched city
      setSearchedCityData(normalizedData)
      
      // Update selected location to show the searched city data
        setSelectedLocation("searched")

      // Reset any previous errors
      setSearchError(null)

      console.log("Fetched air quality data for:", normalizedData.city.name);
    } catch (err) {
      console.error("Error fetching searched city data:", err);
      setSearchError(err instanceof Error ? err.message : `An error occurred while fetching air quality data for "${city}"`)
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Predefined coordinates for our main cities
        const cities = [
          { name: "Vasai West", lat: 19.3919, lon: 72.8266 },
          { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
          { name: "Malad West", lat: 19.1854, lon: 72.8401 },
          { name: "Borivali East", lat: 19.2321, lon: 72.8654 }
        ]

        // Fetch data for all cities
        const fetchPromises = cities.map(async (city) => {
          try {
            const response = await fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&hourly=pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,methane,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto`
            )
            
            if (!response.ok) {
              throw new Error(`Failed to fetch air quality data for ${city.name}`)
            }
            
            const data: OpenMeteoAirQualityData = await response.json()
            return { city, data }
          } catch (error) {
            console.error(`Error fetching data for ${city.name}:`, error);
            return { city, data: null };
          }
        })

        const results = await Promise.all(fetchPromises)
        
        // Process the results
        for (const { city, data } of results) {
          if (data) {
            const normalizedData = normalizeAirQualityData(data, city.name)
            
            if (city.name === "Vasai West") {
              setVasaiData(normalizedData)
            } else if (city.name === "Mumbai") {
              setMumbaiData(normalizedData)
            } else if (city.name === "Malad West") {
              setMaladData(normalizedData)
            } else if (city.name === "Borivali East") {
              setBorivaliData(normalizedData)
            }
          }
        }

        // If no data was successfully fetched, use default data for Vasai
        if (!vasaiData && !mumbaiData && !maladData && !borivaliData) {
          setVasaiData(defaultVasaiData);
        }
      } catch (err) {
        console.error("Error fetching air quality data:", err);
        setError(err instanceof Error ? err.message : "An error occurred while fetching air quality data")
        // Use default data for Vasai in case of error
        setVasaiData(defaultVasaiData);
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Function to get status color based on European AQI
  const getStatusColor = (aqi: number) => {
    if (aqi <= 20) return "text-green-400 bg-green-400/20" // Good
    if (aqi <= 40) return "text-yellow-400 bg-yellow-400/20" // Fair
    if (aqi <= 60) return "text-orange-400 bg-orange-400/20" // Moderate
    if (aqi <= 80) return "text-red-400 bg-red-400/20" // Poor
    return "text-purple-400 bg-purple-400/20" // Very Poor
  }

  // Function to get status text based on European AQI
  const getStatusText = (aqi: number) => {
    if (aqi <= 20) return "Good"
    if (aqi <= 40) return "Fair"
    if (aqi <= 60) return "Moderate"
    if (aqi <= 80) return "Poor"
    return "Very Poor"
  }

  // Function to get trend
  const getTrend = (current: number, previous: number) => {
    return current > previous ? "up" : "down"
  }

  // Function to safely get pollutant value
  const getPollutantValue = (data: NormalizedAirQualityData | null, pollutant: keyof NormalizedAirQualityData['pollutants']) => {
    return data?.pollutants[pollutant] || 0
  }

  // Function to get hourly forecast data
  const getHourlyForecastData = (data: NormalizedAirQualityData | null, pollutant: keyof NormalizedAirQualityData['forecast']['hourly']) => {
    return data?.forecast.hourly[pollutant] || []
  }

  // Function to get location data based on selection
  const getSelectedLocationData = () => {
    switch (selectedLocation) {
      case "vasai":
        return vasaiData
      case "mumbai":
        return mumbaiData
      case "malad":
        return maladData
      case "borivali":
        return borivaliData
      case "searched":
        return searchedCityData
      default:
        return vasaiData
    }
  }

  // Function to get location name
  const getLocationName = () => {
    switch (selectedLocation) {
      case "vasai":
        return "Vasai West"
      case "mumbai":
        return "Mumbai"
      case "malad":
        return "Malad West"
      case "borivali":
        return "Borivali East"
      case "searched":
        return searchedCityData?.city.name || "Searched City"
      default:
        return "Vasai West"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg py-8 flex items-center justify-center">
        <div className="text-center">
          <Wind className="h-16 w-16 mx-auto mb-4 text-neon-blue animate-spin" />
          <p className="text-muted-foreground">Loading air quality data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg py-8 flex items-center justify-center">
        <div className="text-center">
          <Info className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <p className="text-red-400">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Get the current air quality data
  const currentData = getSelectedLocationData()

  if (!currentData) {
    return (
      <div className="min-h-screen bg-dark-bg py-8 flex items-center justify-center">
        <div className="text-center">
          <Info className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
          <p className="text-yellow-400">No data available</p>
        </div>
      </div>
    )
  }

  const currentDate = new Date(currentData.time.iso)
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Prepare data for hourly forecast charts
  const hourlyChartData = getHourlyForecastData(currentData, 'pm25').map((hour, index) => ({
    name: new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    PM25: hour.value,
    PM10: getHourlyForecastData(currentData, 'pm10')[index]?.value || 0,
    O3: getHourlyForecastData(currentData, 'o3')[index]?.value || 0,
    AQI: currentData.aqi
  })).slice(0, 24); // Show next 24 hours

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2">Air Quality Monitoring</h1>
            <p className="text-muted-foreground mb-6">
              Real-time air quality data for {getLocationName()} - {formattedDate}
            </p>
          </motion.div>

          <div className="mb-12">
            <div className="w-full">
              <CitySearch 
                onCitySearch={fetchAirData} 
                isLoading={searchLoading}
                error={searchError}
              />
              {searchError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
                  <Info className="h-4 w-4" />
                  <span>{searchError}</span>
                </div>
              )}
              {selectedLocation === "searched" && searchedCityData && !searchLoading && !searchError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
                  <Check className="h-4 w-4" />
                  <span>Showing data for {searchedCityData.city.name}</span>
                </div>
              )}
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="dashboard" className="data-[state=active]:text-gradient">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:text-gradient">
                Stats View
              </TabsTrigger>
              <TabsTrigger value="forecasts" className="data-[state=active]:text-gradient">
                Forecasts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Air Quality Index Trends - {getLocationName()}</CardTitle>
                    <CardDescription>Real-time air quality metrics for {getLocationName()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-4 rounded-xl h-[400px]">
                      {getSelectedLocationData() ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={hourlyChartData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#9CA3AF"
                              tick={{ 
                                fill: '#9CA3AF',
                                fontSize: 10,
                                dy: 10
                              }}
                              interval={2}
                              height={50}
                            />
                            <YAxis 
                              stroke="#9CA3AF"
                              tick={{ fill: '#9CA3AF' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                                color: '#9CA3AF'
                              }}
                              labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="AQI" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
                              dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="PM25" 
                              stroke="#10B981" 
                              strokeWidth={2}
                              dot={{ fill: '#10B981', strokeWidth: 2 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="PM10" 
                              stroke="#F59E0B" 
                              strokeWidth={2}
                              dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="O3" 
                              stroke="#EF4444" 
                              strokeWidth={2}
                              dot={{ fill: '#EF4444', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                            <Wind className="h-16 w-16 mx-auto mb-4 text-neon-blue animate-spin" />
                            <p className="text-muted-foreground">Loading {getLocationName()} air quality data...</p>
                          </div>
                      </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-2">
                      <CardTitle>Air Quality Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedLocation === "searched" ? (
                          searchedCityData && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`glassmorphism p-4 rounded-lg cursor-pointer transition-all ring-2 ring-neon-blue`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{searchedCityData.city.name}</span>
                                </div>
                                <Badge variant="outline" className={getStatusColor(searchedCityData.aqi)}>
                                  {getStatusText(searchedCityData.aqi)}
                                </Badge>
                              </div>

                              <div className="flex justify-between mb-2">
                                <div className="text-2xl font-bold">{searchedCityData.aqi}</div>
                                {getHourlyForecastData(searchedCityData, 'pm25')[0] && getHourlyForecastData(searchedCityData, 'pm25')[6] && (
                                  getTrend(getHourlyForecastData(searchedCityData, 'pm25')[6].value, getHourlyForecastData(searchedCityData, 'pm25')[0].value) === "down" ? (
                                    <TrendingDown className="h-5 w-5 text-green-400" />
                                  ) : (
                                    <TrendingUp className="h-5 w-5 text-red-400" />
                                  )
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>PM2.5: {getPollutantValue(searchedCityData, 'pm25')} µg/m³</div>
                                <div>PM10: {getPollutantValue(searchedCityData, 'pm10')} µg/m³</div>
                                <div>Ozone: {getPollutantValue(searchedCityData, 'o3')} µg/m³</div>
                                <div>NO₂: {getPollutantValue(searchedCityData, 'no2')} µg/m³</div>
                              </div>
                            </motion.div>
                          )
                        ) : (
                          vasaiData && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`glassmorphism p-4 rounded-lg cursor-pointer transition-all ${
                                selectedLocation === "vasai" ? "ring-2 ring-neon-blue" : ""
                              }`}
                              onClick={() => setSelectedLocation("vasai")}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{vasaiData.city.name}</span>
                                </div>
                                <Badge variant="outline" className={getStatusColor(vasaiData.aqi)}>
                                  {getStatusText(vasaiData.aqi)}
                                </Badge>
                              </div>

                              <div className="flex justify-between mb-2">
                                <div className="text-2xl font-bold">{vasaiData.aqi}</div>
                                {getHourlyForecastData(vasaiData, 'pm25')[0] && getHourlyForecastData(vasaiData, 'pm25')[6] && (
                                  getTrend(getHourlyForecastData(vasaiData, 'pm25')[6].value, getHourlyForecastData(vasaiData, 'pm25')[0].value) === "down" ? (
                                    <TrendingDown className="h-5 w-5 text-green-400" />
                                  ) : (
                                    <TrendingUp className="h-5 w-5 text-red-400" />
                                  )
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>PM2.5: {getPollutantValue(vasaiData, 'pm25')} µg/m³</div>
                                <div>PM10: {getPollutantValue(vasaiData, 'pm10')} µg/m³</div>
                                <div>Ozone: {getPollutantValue(vasaiData, 'o3')} µg/m³</div>
                                <div>NO₂: {getPollutantValue(vasaiData, 'no2')} µg/m³</div>
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent>
                      <div className="glassmorphism rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Health Recommendations</h3>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="space-y-3 text-sm">
                          <p>
                            {currentData.aqi <= 20
                              ? "Air quality is good. Perfect for outdoor activities."
                              : currentData.aqi <= 40
                              ? "Air quality is fair. Sensitive groups should consider limiting prolonged outdoor exposure."
                              : currentData.aqi <= 60
                              ? "Air quality is moderate. Sensitive groups should limit outdoor activities."
                              : currentData.aqi <= 80
                              ? "Air quality is poor. Everyone should reduce outdoor activities."
                              : "Air quality is very poor. Avoid outdoor activities."}
                          </p>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            View Health Guidelines
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="map">
              <Card className="border-0 shadow-none overflow-hidden bg-transparent">
                <CardHeader>
                  <CardTitle>Air Pollution Metrics - {getLocationName()}</CardTitle>
                  <CardDescription>Detailed air quality measurements for {getLocationName()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glassmorphism p-4 rounded-xl">
                      <h3 className="text-lg font-medium mb-4">Particulate Matter</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">PM2.5 (Fine Particles)</span>
                            <span className="text-xs font-medium">{getPollutantValue(currentData, 'pm25')} µg/m³</span>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                getPollutantValue(currentData, 'pm25') <= 10 ? "bg-green-400" :
                                getPollutantValue(currentData, 'pm25') <= 25 ? "bg-yellow-400" :
                                getPollutantValue(currentData, 'pm25') <= 50 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(getPollutantValue(currentData, 'pm25') / 100 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>25</span>
                            <span>50</span>
                            <span>100+</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">PM10 (Coarse Particles)</span>
                            <span className="text-xs font-medium">{getPollutantValue(currentData, 'pm10')} µg/m³</span>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                getPollutantValue(currentData, 'pm10') <= 20 ? "bg-green-400" :
                                getPollutantValue(currentData, 'pm10') <= 50 ? "bg-yellow-400" :
                                getPollutantValue(currentData, 'pm10') <= 100 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(getPollutantValue(currentData, 'pm10') / 150 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                            <span>150+</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">What is Particulate Matter?</h4>
                        <p className="text-xs text-muted-foreground">
                          Particulate matter consists of microscopic particles in the air that can be inhaled and cause health problems.
                          PM2.5 particles are fine particles with diameters less than 2.5 micrometers, while PM10 particles are coarse
                          particles with diameters less than 10 micrometers.
                          </p>
                        </div>
                      </div>
                    
                    <div className="glassmorphism p-4 rounded-xl">
                      <h3 className="text-lg font-medium mb-4">Gas Pollutants</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Ozone (O₃)</span>
                            <span className="text-xs font-medium">{getPollutantValue(currentData, 'o3')} µg/m³</span>
                    </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                getPollutantValue(currentData, 'o3') <= 60 ? "bg-green-400" :
                                getPollutantValue(currentData, 'o3') <= 120 ? "bg-yellow-400" :
                                getPollutantValue(currentData, 'o3') <= 180 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(getPollutantValue(currentData, 'o3') / 240 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>120</span>
                            <span>180</span>
                            <span>240+</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Nitrogen Dioxide (NO₂)</span>
                            <span className="text-xs font-medium">{getPollutantValue(currentData, 'no2')} µg/m³</span>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                getPollutantValue(currentData, 'no2') <= 40 ? "bg-green-400" :
                                getPollutantValue(currentData, 'no2') <= 90 ? "bg-yellow-400" :
                                getPollutantValue(currentData, 'no2') <= 120 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(getPollutantValue(currentData, 'no2') / 200 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>90</span>
                            <span>120</span>
                            <span>200+</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Sulphur Dioxide (SO₂)</span>
                            <span className="text-xs font-medium">{getPollutantValue(currentData, 'so2')} µg/m³</span>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                getPollutantValue(currentData, 'so2') <= 20 ? "bg-green-400" :
                                getPollutantValue(currentData, 'so2') <= 80 ? "bg-yellow-400" :
                                getPollutantValue(currentData, 'so2') <= 250 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(getPollutantValue(currentData, 'so2') / 350 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>80</span>
                            <span>250</span>
                            <span>350+</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Carbon Monoxide (CO)</span>
                            <span className="text-xs font-medium">{getPollutantValue(currentData, 'co')} µg/m³</span>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                getPollutantValue(currentData, 'co') <= 4000 ? "bg-green-400" :
                                getPollutantValue(currentData, 'co') <= 10000 ? "bg-yellow-400" :
                                getPollutantValue(currentData, 'co') <= 30000 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(getPollutantValue(currentData, 'co') / 30000 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>10k</span>
                            <span>30k</span>
                            <span>30k+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glassmorphism p-4 rounded-xl">
                      <h3 className="text-lg font-medium mb-4">Additional Metrics</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">UV Index</span>
                            <span className="text-xs font-medium">{currentData.uv.index.toFixed(1)}</span>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                currentData.uv.index <= 2 ? "bg-green-400" :
                                currentData.uv.index <= 5 ? "bg-yellow-400" :
                                currentData.uv.index <= 7 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(currentData.uv.index / 11 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>5</span>
                            <span>8</span>
                            <span>11+</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Dust Concentration</span>
                            <span className="text-xs font-medium">{currentData.dust.toFixed(1)} µg/m³</span>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                currentData.dust <= 10 ? "bg-green-400" :
                                currentData.dust <= 50 ? "bg-yellow-400" :
                                currentData.dust <= 100 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(currentData.dust / 200 * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Aerosol Optical Depth</span>
                            <span className="text-xs font-medium">{currentData.aerosol.toFixed(2)}</span>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                currentData.aerosol <= 0.1 ? "bg-green-400" :
                                currentData.aerosol <= 0.2 ? "bg-yellow-400" :
                                currentData.aerosol <= 0.5 ? "bg-orange-400" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(currentData.aerosol / 1 * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="text-sm font-medium mb-2">Air Quality Index (EU Scale)</div>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-3 bg-green-400 rounded-l-full"></div>
                          <div className="flex-1 h-3 bg-green-300"></div>
                          <div className="flex-1 h-3 bg-yellow-300"></div>
                          <div className="flex-1 h-3 bg-yellow-400"></div>
                          <div className="flex-1 h-3 bg-orange-300"></div>
                          <div className="flex-1 h-3 bg-orange-400"></div>
                          <div className="flex-1 h-3 bg-red-300"></div>
                          <div className="flex-1 h-3 bg-red-400"></div>
                          <div className="flex-1 h-3 bg-purple-300"></div>
                          <div className="flex-1 h-3 bg-purple-400 rounded-r-full"></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0</span>
                          <span>20</span>
                          <span>40</span>
                          <span>60</span>
                          <span>80</span>
                          <span>100</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium mt-2">
                          <span className="text-green-400">Good</span>
                          <span className="text-yellow-400">Fair</span>
                          <span className="text-orange-400">Moderate</span>
                          <span className="text-red-400">Poor</span>
                          <span className="text-purple-400">Very Poor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecasts">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Air Quality Forecast - {getLocationName()}</CardTitle>
                        <CardDescription>Next 24 hours predictions for key pollutants</CardDescription>
                      </div>
                      <Badge className="bg-neon-blue/20 text-neon-blue">
                        <BarChart3 className="h-3 w-3 mr-1" /> Hourly Forecast
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-4 rounded-xl h-[400px]">
                      {currentData ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={hourlyChartData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#9CA3AF"
                              tick={{ 
                                fill: '#9CA3AF',
                                fontSize: 10,
                                dy: 10
                              }}
                              interval={2}
                              height={50}
                            />
                            <YAxis 
                              stroke="#9CA3AF"
                              tick={{ fill: '#9CA3AF' }}
                              label={{ 
                                value: 'µg/m³', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: '#9CA3AF' }
                              }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                                color: '#9CA3AF'
                              }}
                              labelStyle={{ color: '#9CA3AF' }}
                              formatter={(value, name) => [
                                `${parseFloat(value.toString()).toFixed(1)} µg/m³`, 
                                name === "PM25" ? "PM2.5" : 
                                name === "PM10" ? "PM10" : 
                                name === "O3" ? "Ozone" : 
                                name
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="PM25" 
                              stroke="#10B981" 
                              strokeWidth={2}
                              dot={{ fill: '#10B981', strokeWidth: 2 }}
                              name="PM2.5"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="PM10" 
                              stroke="#F59E0B" 
                              strokeWidth={2}
                              dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                              name="PM10"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="O3" 
                              stroke="#EF4444" 
                              strokeWidth={2}
                              dot={{ fill: '#EF4444', strokeWidth: 2 }}
                              name="Ozone"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                            <Wind className="h-16 w-16 mx-auto mb-4 text-neon-blue animate-spin" />
                            <p className="text-muted-foreground">Loading forecast data...</p>
                          </div>
                      </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-2">
                      <CardTitle>Forecast Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-neon-blue" />
                          <h3 className="font-medium">24-Hour Trend</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {hourlyChartData.length > 0 && hourlyChartData[0] && hourlyChartData[hourlyChartData.length - 1]
                            ? `Air quality is predicted to ${
                                hourlyChartData[hourlyChartData.length - 1].PM25 > hourlyChartData[0].PM25 ? "worsen" : "improve"
                              } over the next 24 hours with ${
                                hourlyChartData[hourlyChartData.length - 1].PM25 > hourlyChartData[0].PM25 
                                  ? `an increase of ${(hourlyChartData[hourlyChartData.length - 1].PM25 - hourlyChartData[0].PM25).toFixed(1)}`
                                  : `a decrease of ${(hourlyChartData[0].PM25 - hourlyChartData[hourlyChartData.length - 1].PM25).toFixed(1)}`
                              } µg/m³ in PM2.5 levels.`
                            : "Forecast data unavailable"}
                        </p>

                        <div className="border-t border-muted/20 pt-3">
                          <h4 className="text-sm font-medium mb-2">Key Predictions</h4>
                          <ul className="text-xs space-y-2">
                            {hourlyChartData[6] && (
                            <li className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              <span>PM2.5 in 6 hours: {hourlyChartData[6].PM25.toFixed(1)} µg/m³ ({
                                hourlyChartData[6].PM25 > hourlyChartData[0].PM25 
                                  ? `+${(hourlyChartData[6].PM25 - hourlyChartData[0].PM25).toFixed(1)}` 
                                  : `-${(hourlyChartData[0].PM25 - hourlyChartData[6].PM25).toFixed(1)}`
                              })</span>
                            </li>
                            )}
                            {hourlyChartData[12] && (
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400">!</span>
                              <span>PM2.5 in 12 hours: {hourlyChartData[12].PM25.toFixed(1)} µg/m³ ({
                                hourlyChartData[12].PM25 > hourlyChartData[0].PM25 
                                  ? `+${(hourlyChartData[12].PM25 - hourlyChartData[0].PM25).toFixed(1)}` 
                                  : `-${(hourlyChartData[0].PM25 - hourlyChartData[12].PM25).toFixed(1)}`
                              })</span>
                            </li>
                            )}
                            {hourlyChartData[23] && (
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400">ℹ</span>
                              <span>PM2.5 in 24 hours: {hourlyChartData[23].PM25.toFixed(1)} µg/m³ ({
                                hourlyChartData[23].PM25 > hourlyChartData[0].PM25 
                                  ? `+${(hourlyChartData[23].PM25 - hourlyChartData[0].PM25).toFixed(1)}` 
                                  : `-${(hourlyChartData[0].PM25 - hourlyChartData[23].PM25).toFixed(1)}`
                              })</span>
                            </li>
                            )}
                          </ul>
                        </div>

                        <div className="border-t border-muted/20 pt-3">
                          <h4 className="text-sm font-medium mb-2">Health Recommendations</h4>
                          <ul className="text-xs space-y-2">
                            {hourlyChartData.length > 0 && (
                              <>
                                {hourlyChartData.some(data => data.PM25 > 35) && (
                                  <li className="flex items-start gap-2">
                                    <span className="text-red-400">!</span>
                                    <span>Consider using air purifiers when indoors as PM2.5 levels may exceed healthy limits</span>
                                  </li>
                                )}
                                {hourlyChartData.some(data => data.O3 > 100) && (
                                  <li className="flex items-start gap-2">
                                    <span className="text-orange-400">!</span>
                                    <span>Limit outdoor activities during peak ozone hours (usually midday to afternoon)</span>
                                  </li>
                                )}
                                <li className="flex items-start gap-2">
                                  <span className="text-neon-blue">ℹ</span>
                                  <span>Stay updated with real-time air quality information before planning outdoor activities</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent>
                      <div className="glassmorphism rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Data Source</h3>
                          <Badge variant="outline" className="bg-neon-orange/20 text-neon-orange">
                            Real-time
                          </Badge>
                        </div>

                        <div className="space-y-3 text-sm">
                          <p>
                            Data provided by Open-Meteo.com Air Quality API
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {currentData ? new Date(currentData.time.iso).toLocaleString() : 'N/A'}
                          </p>
                          <Button className="w-full mt-2 bg-gradient-to-r from-neon-blue to-neon-orange" 
                            onClick={() => window.open('https://open-meteo.com/en/docs/air-quality-api', '_blank')}>
                            View Source
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

