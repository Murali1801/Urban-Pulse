"use client"

import { motion } from "framer-motion"
import { Wind, Droplets, Car, AlertCircle } from "lucide-react"
import { GlobeVisualization } from "@/components/globe-visualization"
import { CitySearch } from "@/components/city-search"
import { StatCard } from "@/components/stat-card"
import { AlertItem } from "@/components/alert-item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

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
  }
}

// New Open-Meteo Air Quality API interface
interface OpenMeteoAirQualityData {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_units: {
    time: string
    interval: string
    ozone: string
    sulphur_dioxide: string
    nitrogen_dioxide: string
    carbon_monoxide: string
    european_aqi: string
    us_aqi: string
    pm10: string
    pm2_5: string
    aerosol_optical_depth: string
    dust: string
    uv_index: string
    uv_index_clear_sky: string
    ammonia: string
    alder_pollen: string
    birch_pollen: string
    grass_pollen: string
    mugwort_pollen: string
    olive_pollen: string
    ragweed_pollen: string
  }
  current: {
    time: string
    interval: number
    ozone: number
    sulphur_dioxide: number
    nitrogen_dioxide: number
    carbon_monoxide: number
    european_aqi: number
    us_aqi: number
    pm10: number
    pm2_5: number
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
  hourly_units: {
    time: string
    pm10: string
    pm2_5: string
    carbon_monoxide: string
    carbon_dioxide: string
    nitrogen_dioxide: string
    sulphur_dioxide: string
    ozone: string
    aerosol_optical_depth: string
    dust: string
    uv_index: string
    uv_index_clear_sky: string
    ammonia: string
    methane: string
    alder_pollen: string
    birch_pollen: string
    grass_pollen: string
    mugwort_pollen: string
    olive_pollen: string
    ragweed_pollen: string
  }
  hourly: {
    time: string[]
    pm10: number[]
    pm2_5: number[]
    carbon_monoxide: number[]
    carbon_dioxide: number[]
    nitrogen_dioxide: number[]
    sulphur_dioxide: number[]
    ozone: number[]
    aerosol_optical_depth: number[]
    dust: number[]
    uv_index: number[]
    uv_index_clear_sky: number[]
    ammonia: number[]
    methane: number[]
    alder_pollen: number[]
    birch_pollen: number[]
    grass_pollen: number[]
    mugwort_pollen: number[]
    olive_pollen: number[]
    ragweed_pollen: number[]
  }
}

// Local interface to normalize the data for the UI components
interface NormalizedAirQualityData {
  status: string
  cityName: string
  coordinates: [number, number]
  aqi: number
  pm25: number
  pm10: number
  ozone: number
  no2: number
  time: string
  openMeteoData: OpenMeteoAirQualityData | null
}

// Traffic data interface
interface TrafficData {
  status: string
  congestionLevel: string
  averageSpeed: number
  delay: number
  lastUpdated: string
}

// Water data interface
interface WaterLevelsData {
  status: string
  capacity: number
  phLevel: number
  supplyStatus: string
  lastUpdated: string
}

export default function DashboardPage() {
  const [airQualityData, setAirQualityData] = useState<NormalizedAirQualityData | null>(null)
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [waterLevelsData, setWaterLevelsData] = useState<WaterLevelsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState({
    name: "vasai-west",
    lat: 19.40,
    lon: 72.82
  })
  // Dynamic alerts based on real-time data
  const [alerts, setAlerts] = useState<{
    id: number;
    title: string;
    message: string;
    time: string;
    level: "info" | "warning" | "critical";
  }[]>([
  {
    id: 2,
    title: "Traffic Congestion",
    message: "Major traffic jam on Highway 101, expect delays of 25+ minutes.",
    time: "25 minutes ago",
    level: "warning" as const,
  },
  {
    id: 3,
    title: "Air Quality Update",
    message: "Air quality has improved by 15% in the central district.",
    time: "1 hour ago",
    level: "info" as const,
  },
  ])

  // Function to fetch city coordinates from Nominatim API
  const fetchCityCoordinates = async (city: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        return { 
          name: city,
          lat: parseFloat(data[0].lat), 
          lon: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching city coordinates:", error)
      return null
    }
  }

  // Function to fetch air quality data using Open-Meteo API
  const fetchOpenMeteoAirQuality = async (lat: number, lon: number) => {
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,methane,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&current=ozone,sulphur_dioxide,nitrogen_dioxide,carbon_monoxide,european_aqi,us_aqi,pm10,pm2_5,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch air quality data for coordinates ${lat},${lon}`);
      }
      
      return await response.json() as OpenMeteoAirQualityData;
    } catch (error) {
      console.error("Error fetching air quality data:", error);
      throw error;
    }
  }

  // Function to fetch traffic data based on coordinates
  const fetchTrafficData = async (lat: number, lon: number, cityName: string) => {
    try {
      // This is a simulated API call as there's no free traffic API available
      // In a real application, you would call an actual traffic API here
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate somewhat realistic traffic data based on city
      const hour = new Date().getHours()
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)
      const isWeekend = [0, 6].includes(new Date().getDay())
      
      // Simulate different congestion levels for different cities
      const citySize = cityName.toLowerCase().includes("mumbai") || 
                       cityName.toLowerCase().includes("delhi") ||
                       cityName.toLowerCase().includes("bangalore") ? "big" : "small"
      
      let congestionLevel, averageSpeed, delay
      
      if (citySize === "big") {
        if (isRushHour && !isWeekend) {
          congestionLevel = "Heavy"
          averageSpeed = Math.floor(Math.random() * 15) + 10 // 10-25 mph
          delay = Math.floor(Math.random() * 30) + 20 // 20-50 min
        } else if (isWeekend) {
          congestionLevel = "Moderate"
          averageSpeed = Math.floor(Math.random() * 20) + 25 // 25-45 mph
          delay = Math.floor(Math.random() * 15) + 5 // 5-20 min
        } else {
          congestionLevel = "Moderate"
          averageSpeed = Math.floor(Math.random() * 15) + 20 // 20-35 mph
          delay = Math.floor(Math.random() * 10) + 10 // 10-20 min
        }
      } else {
        if (isRushHour && !isWeekend) {
          congestionLevel = "Moderate"
          averageSpeed = Math.floor(Math.random() * 20) + 20 // 20-40 mph
          delay = Math.floor(Math.random() * 15) + 5 // 5-20 min
        } else {
          congestionLevel = "Light"
          averageSpeed = Math.floor(Math.random() * 20) + 35 // 35-55 mph
          delay = Math.floor(Math.random() * 5) + 1 // 1-6 min
        }
      }
      
      return {
        status: "success",
        congestionLevel,
        averageSpeed,
        delay,
        lastUpdated: "Just now"
      }
    } catch (error) {
      console.error("Error fetching traffic data:", error)
      return null
    }
  }

  // Function to fetch water levels data based on coordinates
  const fetchWaterLevelsData = async (lat: number, lon: number) => {
    try {
      // This is a simulated API call as there's no free sea level API available
      // In a real application, you would call an actual sea levels API here
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 700))
      
      // Use the coordinates to somewhat realistically simulate sea level data
      // For example, coastal cities might have different tidal patterns
      const isCoastal = Math.abs(lat) < 30 || Math.abs(lon) < 30
      
      const month = new Date().getMonth()
      const hour = new Date().getHours()
      
      // Simulate tidal patterns (high tide around 6AM/6PM, low tide around 12AM/12PM)
      const isTidalChange = (hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19) || 
                           (hour >= 11 && hour <= 13) || (hour >= 23 || hour <= 1)
      
      let capacity, supplyStatus
      
      // Calculate tide level (percentage of normal)
      if (hour >= 5 && hour <= 7) {
        // Morning high tide coming in
        capacity = Math.floor(Math.random() * 15) + 105 // 105-120%
        supplyStatus = "Rising"
      } else if (hour >= 8 && hour <= 10) {
        // After morning high tide
        capacity = Math.floor(Math.random() * 10) + 100 // 100-110%
        supplyStatus = "High"
      } else if (hour >= 11 && hour <= 13) {
        // Midday low tide coming in
        capacity = Math.floor(Math.random() * 15) + 75 // 75-90%
        supplyStatus = "Falling"
      } else if (hour >= 14 && hour <= 16) {
        // Afternoon low
        capacity = Math.floor(Math.random() * 10) + 80 // 80-90%
        supplyStatus = "Low"
      } else if (hour >= 17 && hour <= 19) {
        // Evening high tide coming in
        capacity = Math.floor(Math.random() * 15) + 105 // 105-120%
        supplyStatus = "Rising"
      } else if (hour >= 20 && hour <= 22) {
        // After evening high tide
        capacity = Math.floor(Math.random() * 10) + 100 // 100-110%
        supplyStatus = "High"
      } else {
        // Night low tide
        capacity = Math.floor(Math.random() * 15) + 75 // 75-90%
        supplyStatus = "Falling"
      }
      
      // Coastal cities have more dramatic tides
      if (isCoastal) {
        capacity = capacity > 100 ? capacity + 10 : capacity - 10;
      }
      
      // pH levels typically range from 7.8 to 8.4 for seawater
      const phLevel = parseFloat((Math.random() * 0.6 + 7.8).toFixed(1))
      
      return {
        status: "success",
        capacity,
        phLevel,
        supplyStatus,
        lastUpdated: "Just now"
      }
    } catch (error) {
      console.error("Error fetching sea levels data:", error)
      return null
    }
  }

  // Function to update alerts based on fetched data
  const updateAlerts = () => {
    const newAlerts = [];
    
    // Add traffic alert if data is available
    if (trafficData) {
      const trafficLevel = trafficData.congestionLevel === "Heavy" ? "warning" : 
                          trafficData.congestionLevel === "Moderate" ? "warning" : "info";
      
      newAlerts.push({
        id: 1,
        title: `Traffic ${trafficData.congestionLevel} in ${selectedCity.name}`,
        message: `Average speed is ${trafficData.averageSpeed} mph with approximately ${trafficData.delay} minutes of delay.`,
        time: trafficData.lastUpdated,
        level: trafficLevel as "warning" | "info",
      });
    }
    
    // Add air quality alert if data is available
    if (airQualityData) {
      const aqiStatus = airQualityData.aqi <= 40 ? "Good" : 
                      airQualityData.aqi <= 60 ? "Moderate" : 
                      airQualityData.aqi <= 80 ? "Poor" : "Very Poor";
      
      const aqiLevel = airQualityData.aqi <= 40 ? "info" : 
                     airQualityData.aqi <= 60 ? "info" : 
                     airQualityData.aqi <= 80 ? "warning" : "critical";
      
      newAlerts.push({
        id: 2,
        title: `Air Quality: ${aqiStatus}`,
        message: `Current AQI is ${airQualityData.aqi} with PM2.5 at ${airQualityData.pm25} µg/m³ in ${selectedCity.name}.`,
        time: new Date(airQualityData.time).toLocaleTimeString(),
        level: aqiLevel as "info" | "warning" | "critical",
      });
    }
    
    setAlerts(newAlerts);
  }

  const fetchAirData = async (city: string) => {
    try {
      setLoading(true)
      setError(null)

      // First, get coordinates for the city
      const coordinates = await fetchCityCoordinates(city)
      if (!coordinates) {
        throw new Error(`Could not find coordinates for ${city}`)
      }
      
      setSelectedCity({
        name: city,
        lat: coordinates.lat,
        lon: coordinates.lon
      })

      // Fetch air quality data from Open-Meteo API
      const airQualityData = await fetchOpenMeteoAirQuality(coordinates.lat, coordinates.lon)
      
      // Normalize the data
      setAirQualityData({
        status: "success",
        cityName: city,
        coordinates: [coordinates.lat, coordinates.lon],
        aqi: airQualityData.current.european_aqi,
        pm25: airQualityData.current.pm2_5,
        pm10: airQualityData.current.pm10,
        ozone: airQualityData.current.ozone,
        no2: airQualityData.current.nitrogen_dioxide,
        time: airQualityData.current.time,
        openMeteoData: airQualityData
      })
      
      // Fetch additional data
      const traffic = await fetchTrafficData(coordinates.lat, coordinates.lon, city)
      if (traffic) setTrafficData(traffic)
      
      const waterLevels = await fetchWaterLevelsData(coordinates.lat, coordinates.lon)
      if (waterLevels) setWaterLevelsData(waterLevels)
      
      // After all data is fetched, update alerts
      updateAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchDefaultData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch data for default location (Vasai West)
        await fetchAirData("vasai-west")
      } catch (error) {
        console.error("Error fetching default data:", error)
        setError("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchDefaultData()
    // Refresh data every 5 minutes
    const interval = setInterval(() => fetchAirData(selectedCity.name), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Update alerts when any data changes
  useEffect(() => {
    if (!loading && (airQualityData || trafficData)) {
      updateAlerts();
    }
  }, [airQualityData, trafficData, waterLevelsData]);

  // Function to get status text
  const getStatusText = (aqi: number) => {
    if (aqi <= 20) return "Very Good"
    if (aqi <= 40) return "Good"
    if (aqi <= 60) return "Moderate"
    if (aqi <= 80) return "Poor"
    return "Very Poor"
  }

  // Function to get status color
  const getStatusColor = (aqi: number) => {
    if (aqi <= 20) return "text-green-400"
    if (aqi <= 40) return "text-green-400"
    if (aqi <= 60) return "text-yellow-400"
    if (aqi <= 80) return "text-orange-400"
    return "text-red-400"
  }

  // Function to get traffic status color
  const getTrafficStatusColor = (congestionLevel: string) => {
    if (congestionLevel === "Light") return "text-green-400"
    if (congestionLevel === "Moderate") return "text-yellow-400"
    return "text-red-400"
  }

  // Function to get water supply status color
  const getWaterStatusColor = (supplyStatus: string) => {
    if (supplyStatus === "High" || supplyStatus === "Rising") return "text-blue-400"
    if (supplyStatus === "Low" || supplyStatus === "Falling") return "text-amber-400"
    return "text-green-400"
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero section */}
      <section className="relative pt-16 pb-20">
        <div className="absolute inset-0 bg-city-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-transparent to-dark-bg"></div>

        <div className="relative container mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-neon-blue/20 text-neon-blue">Smart City Dashboard</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              Making Cities Smarter with Real-Time Data
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Monitor air quality, traffic, and sea levels in real-time. UrbanPulse provides city
              administrators with the data they need to make informed decisions.
            </p>
          </motion.div>

          <CitySearch onCitySearch={fetchAirData} />

          <div className="flex justify-center mt-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90 text-white font-medium px-8 py-6 h-auto rounded-full">
                Explore Data
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <StatCard
                title={`Air Quality Index - ${selectedCity.name}`}
                value={airQualityData ? `${getStatusText(airQualityData.aqi)} (${airQualityData.aqi})` : "Loading..."}
                icon={<Wind className="h-5 w-5 text-neon-blue" />}
                trend={{ value: 12, isPositive: true }}
                className={`border-t-4 border-t-neon-blue ${airQualityData ? getStatusColor(airQualityData.aqi) : ""}`}
              >
                <div className="mt-2 pt-2 border-t border-muted/20">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>PM2.5: {airQualityData ? `${airQualityData.pm25} µg/m³` : "..."}</span>
                    <span>PM10: {airQualityData ? `${airQualityData.pm10} µg/m³` : "..."}</span>
                  </div>
                </div>
              </StatCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <StatCard
                title="Traffic Congestion"
                value={trafficData ? trafficData.congestionLevel : "Loading..."}
                icon={<Car className="h-5 w-5 text-neon-orange" />}
                trend={{ value: trafficData ? trafficData.delay : 0, isPositive: false }}
                className={`border-t-4 border-t-neon-orange ${trafficData ? getTrafficStatusColor(trafficData.congestionLevel) : ""}`}
              >
                <div className="mt-2 pt-2 border-t border-muted/20">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Avg. Speed: {trafficData ? `${trafficData.averageSpeed} mph` : "..."}</span>
                    <span>Delay: {trafficData ? `+${trafficData.delay} min` : "..."}</span>
                  </div>
                </div>
              </StatCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <StatCard
                title="Sea Levels"
                value={waterLevelsData ? `${(waterLevelsData.capacity - 100).toFixed(1)}% ${waterLevelsData.capacity > 100 ? 'Above' : 'Below'} Normal` : "Loading..."}
                icon={<Droplets className="h-5 w-5 text-neon-blue" />}
                trend={{ value: 2, isPositive: waterLevelsData ? waterLevelsData.capacity > 100 : true }}
                className={`border-t-4 border-t-neon-blue ${waterLevelsData ? getWaterStatusColor(waterLevelsData.supplyStatus) : ""}`}
              >
                <div className="mt-2 pt-2 border-t border-muted/20">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>pH Level: {waterLevelsData ? waterLevelsData.phLevel : "..."}</span>
                    <span>Tide: {waterLevelsData ? waterLevelsData.supplyStatus : "..."}</span>
                  </div>
                </div>
              </StatCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Globe and Alerts section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-none overflow-hidden bg-transparent">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl">Global City Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <GlobeVisualization />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Recent Alerts</CardTitle>
                    <Badge variant="outline" className="bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Live Updates
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <AlertItem
                        key={alert.id}
                        title={alert.title}
                        message={alert.message}
                        time={alert.time}
                        level={alert.level}
                      />
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <Button variant="outline" className="w-full">
                      View All Alerts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}