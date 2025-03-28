"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wind, Info, BarChart3, MapPin, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HeatmapVisualization } from "@/components/heatmap-visualization"
import { VasaiMap } from "@/components/vasai-map"
import { CitySearch } from "@/components/city-search"

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

export default function AirQualityPage() {
  const [selectedTab, setSelectedTab] = useState("dashboard")
  const [selectedLocation, setSelectedLocation] = useState("vasai")
  const [vasaiData, setVasaiData] = useState<AirQualityData | null>(null)
  const [mumbaiData, setMumbaiData] = useState<AirQualityData | null>(null)
  const [maladData, setMaladData] = useState<AirQualityData | null>(null)
  const [borivaliData, setBorivaliData] = useState<AirQualityData | null>(null)
  const [searchedCityData, setSearchedCityData] = useState<AirQualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAirData = async (city: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://api.waqi.info/feed/${city}/?token=027196b7135cabb95b0ad5f8b501749e0acba471`
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch air quality data for ${city}`)
      }
      const data = await response.json()
      if (data.status === "ok") {
        setSearchedCityData(data)
        setSelectedLocation("searched")
        setSelectedTab("dashboard")
      } else {
        throw new Error(`No data available for ${city}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching air quality data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch Vasai West data
        const vasaiResponse = await fetch(
          "https://api.waqi.info/feed/india/mumbai/vasai-west/?token=027196b7135cabb95b0ad5f8b501749e0acba471"
        )
        if (!vasaiResponse.ok) {
          throw new Error("Failed to fetch Vasai West air quality data")
        }
        const vasaiData = await vasaiResponse.json()
        if (vasaiData.status === "ok") {
          setVasaiData(vasaiData)
        }

        // Fetch Mumbai data
        const mumbaiResponse = await fetch(
          "https://api.waqi.info/feed/mumbai/?token=027196b7135cabb95b0ad5f8b501749e0acba471"
        )
        if (!mumbaiResponse.ok) {
          throw new Error("Failed to fetch Mumbai air quality data")
        }
        const mumbaiData = await mumbaiResponse.json()
        if (mumbaiData.status === "ok") {
          setMumbaiData(mumbaiData)
        }

        // Fetch Malad West data
        const maladResponse = await fetch(
          "https://api.waqi.info/feed/india/mumbai/malad-west/?token=027196b7135cabb95b0ad5f8b501749e0acba471"
        )
        if (!maladResponse.ok) {
          throw new Error("Failed to fetch Malad West air quality data")
        }
        const maladData = await maladResponse.json()
        if (maladData.status === "ok") {
          setMaladData(maladData)
        }

        // Fetch Borivali East data
        const borivaliResponse = await fetch(
          "https://api.waqi.info/feed/india/mumbai/borivali-east/?token=027196b7135cabb95b0ad5f8b501749e0acba471"
        )
        if (!borivaliResponse.ok) {
          throw new Error("Failed to fetch Borivali East air quality data")
        }
        const borivaliData = await borivaliResponse.json()
        if (borivaliData.status === "ok") {
          setBorivaliData(borivaliData)
        }

        // If no data was successfully fetched, throw an error
        if (!vasaiData && !mumbaiData && !maladData && !borivaliData) {
          throw new Error("No air quality data available for any location")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching air quality data")
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Function to get status color
  const getStatusColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-400 bg-green-400/20"
    if (aqi <= 100) return "text-yellow-400 bg-yellow-400/20"
    if (aqi <= 150) return "text-orange-400 bg-orange-400/20"
    return "text-red-400 bg-red-400/20"
  }

  // Function to get status text
  const getStatusText = (aqi: number) => {
    if (aqi <= 50) return "Good"
    if (aqi <= 100) return "Moderate"
    if (aqi <= 150) return "Unhealthy for Sensitive Groups"
    return "Unhealthy"
  }

  // Function to get trend
  const getTrend = (current: number, previous: number) => {
    return current > previous ? "up" : "down"
  }

  // Function to safely get pollutant value
  const getPollutantValue = (data: any, pollutant: string) => {
    return data?.iaqi?.[pollutant]?.v || 0
  }

  // Function to safely get forecast data
  const getForecastData = (data: any) => {
    return data?.forecast?.daily?.pm25 || []
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
        return searchedCityData?.data.city.name || "Searched City"
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
  const currentData = getSelectedLocationData()?.data

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

  // Get forecast data for today and tomorrow
  const todayForecast = currentData.forecast.daily.pm25.find(
    (day) => day.day === currentDate.toISOString().split("T")[0]
  )
  const tomorrowForecast = currentData.forecast.daily.pm25.find(
    (day) => day.day === new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  )

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
            <CitySearch onCitySearch={fetchAirData} />
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="dashboard" className="data-[state=active]:text-gradient">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="heatmap" className="data-[state=active]:text-gradient">
                Pollution Heatmap
              </TabsTrigger>
              <TabsTrigger value="forecast" className="data-[state=active]:text-gradient">
                AI Forecast
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
                            data={getSelectedLocationData()?.data.forecast.daily.pm25.slice(0, 3).map((day, index) => ({
                              name: `${new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' })}\n${new Date(day.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                              AQI: day.avg,
                              PM25: day.avg,
                              PM10: getSelectedLocationData()?.data.forecast.daily.pm10[index]?.avg || 0,
                              O3: getSelectedLocationData()?.data.forecast.daily.o3[index]?.avg || 0,
                              NO2: getSelectedLocationData()?.data.iaqi.no2.v || 0
                            }))}
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
                              interval={0}
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
                            <Line 
                              type="monotone" 
                              dataKey="NO2" 
                              stroke="#8B5CF6" 
                              strokeWidth={2}
                              dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
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
                      <CardTitle>Mumbai Metropolitan Region Air Quality</CardTitle>
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
                                  <span className="font-medium">{searchedCityData.data.city.name}</span>
                                </div>
                                <Badge variant="outline" className={getStatusColor(searchedCityData.data.aqi)}>
                                  {getStatusText(searchedCityData.data.aqi)}
                                </Badge>
                              </div>

                              <div className="flex justify-between mb-2">
                                <div className="text-2xl font-bold">{searchedCityData.data.aqi}</div>
                                {searchedCityData.data.forecast.daily.pm25[0] && searchedCityData.data.forecast.daily.pm25[1] && (
                                  getTrend(searchedCityData.data.forecast.daily.pm25[1].avg, searchedCityData.data.forecast.daily.pm25[0].avg) === "down" ? (
                                    <TrendingDown className="h-5 w-5 text-green-400" />
                                  ) : (
                                    <TrendingUp className="h-5 w-5 text-red-400" />
                                  )
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>PM25: {getPollutantValue(searchedCityData?.data, 'pm25')} µg/m³</div>
                                <div>PM10: {getPollutantValue(searchedCityData?.data, 'pm10')} µg/m³</div>
                                <div>Ozone: {getPollutantValue(searchedCityData?.data, 'o3')} ppm</div>
                                <div>NO₂: {getPollutantValue(searchedCityData?.data, 'no2')} ppm</div>
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
                                  <span className="font-medium">{vasaiData.data.city.name}</span>
                                </div>
                                <Badge variant="outline" className={getStatusColor(vasaiData.data.aqi)}>
                                  {getStatusText(vasaiData.data.aqi)}
                                </Badge>
                              </div>

                              <div className="flex justify-between mb-2">
                                <div className="text-2xl font-bold">{vasaiData.data.aqi}</div>
                                {vasaiData.data.forecast.daily.pm25[0] && vasaiData.data.forecast.daily.pm25[1] && (
                                  getTrend(vasaiData.data.forecast.daily.pm25[1].avg, vasaiData.data.forecast.daily.pm25[0].avg) === "down" ? (
                                    <TrendingDown className="h-5 w-5 text-green-400" />
                                  ) : (
                                    <TrendingUp className="h-5 w-5 text-red-400" />
                                  )
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>PM25: {getPollutantValue(vasaiData?.data, 'pm25')} µg/m³</div>
                                <div>PM10: {getPollutantValue(vasaiData?.data, 'pm10')} µg/m³</div>
                                <div>Ozone: {getPollutantValue(vasaiData?.data, 'o3')} ppm</div>
                                <div>NO₂: {getPollutantValue(vasaiData?.data, 'no2')} ppm</div>
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
                            {currentData.aqi <= 50
                              ? "Air quality is good. Perfect for outdoor activities."
                              : currentData.aqi <= 100
                              ? "Air quality is moderate. Sensitive groups should limit prolonged outdoor exposure."
                              : currentData.aqi <= 150
                              ? "Air quality is unhealthy for sensitive groups. Limit outdoor activities."
                              : "Air quality is unhealthy. Avoid outdoor activities."}
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

            <TabsContent value="heatmap">
              <Card className="border-0 shadow-none overflow-hidden bg-transparent">
                <CardHeader>
                  <CardTitle>Air Pollution Heatmap - Vasai West</CardTitle>
                  <CardDescription>Visualize pollution concentration in Vasai West</CardDescription>
                </CardHeader>
                <CardContent>
                  {vasaiData ? (
                    <VasaiMap data={vasaiData.data} />
                  ) : (
                  <div className="relative w-full h-[600px] glassmorphism rounded-xl overflow-hidden">
                    <div className="absolute inset-0 grid place-items-center bg-darker-bg/60">
                      <div className="text-center px-4">
                        <Wind className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-xl font-medium mb-2">Loading Map</h3>
                        <p className="text-muted-foreground max-w-md">
                            Please wait while we fetch the latest air quality data.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecast">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Air Quality Forecast - {getLocationName()}</CardTitle>
                        <CardDescription>Next 6 days prediction starting from day after tomorrow</CardDescription>
                      </div>
                      <Badge className="bg-neon-blue/20 text-neon-blue">
                        <BarChart3 className="h-3 w-3 mr-1" /> Forecast
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-4 rounded-xl h-[400px]">
                      {getSelectedLocationData() ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getSelectedLocationData()?.data.forecast.daily.pm25.slice(-6).map((day) => ({
                              name: `${new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' })}\n${new Date(day.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                              PM25: day.avg,
                              PM10: getSelectedLocationData()?.data.forecast.daily.pm10.find(d => d.day === day.day)?.avg || 0,
                              O3: getSelectedLocationData()?.data.forecast.daily.o3.find(d => d.day === day.day)?.avg || 0,
                              AQI: day.avg * 2 // Approximate AQI from PM25
                            }))}
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
                              interval={0}
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
                          <h3 className="font-medium">Next 6 Days Trend</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {getSelectedLocationData()?.data.forecast.daily.pm25[2] && getSelectedLocationData()?.data.forecast.daily.pm25[7]
                            ? `Air quality is predicted to ${
                                (getSelectedLocationData()?.data.forecast.daily.pm25[7]?.avg ?? 0) > (getSelectedLocationData()?.data.forecast.daily.pm25[2]?.avg ?? 0) ? "worsen" : "improve"
                              } over the next 6 days.`
                            : "Forecast data unavailable"}
                        </p>

                        <div className="border-t border-muted/20 pt-3">
                          <h4 className="text-sm font-medium mb-2">Key Predictions</h4>
                          <ul className="text-xs space-y-2">
                            {getSelectedLocationData()?.data.forecast.daily.pm25[2] && (
                            <li className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                                <span>Day after tomorrow's PM25: {getSelectedLocationData()?.data.forecast.daily.pm25[2].avg} µg/m³</span>
                            </li>
                            )}
                            {getSelectedLocationData()?.data.forecast.daily.pm25[7] && (
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400">!</span>
                                <span>6-day PM25: {getSelectedLocationData()?.data.forecast.daily.pm25[7].avg} µg/m³</span>
                            </li>
                            )}
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400">ℹ</span>
                              <span>Based on weather patterns and historical data</span>
                            </li>
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
                            Data provided by {getSelectedLocationData()?.data.attributions.map((attr: { name: string }) => attr.name).join(", ")}
                          </p>
                          <Button className="w-full mt-2 bg-gradient-to-r from-neon-blue to-neon-orange">
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

