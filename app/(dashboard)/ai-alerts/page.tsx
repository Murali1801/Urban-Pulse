"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Wind,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Edit,
  X,
  Check,
  Info,
  Waves,
  Thermometer,
  Gauge,
  CloudRain,
  ArrowUp,
  ArrowDown,
  Clock,
  Search,
  MapPin,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Interface for air quality API response
interface AirQualityData {
  latitude: number
  longitude: number
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
  hourly_units: {
    [key: string]: string
  }
  current_units: {
    [key: string]: string
  }
}

// Sample air quality data
const airQualityData = {
  pm25: 23.5,
  pm10: 35.2,
  co2: 410,
  aqi: 78,
  temperature: 28,
  status: "Moderate",
  lastUpdated: "10 minutes ago",
  trend: "stable",
}

// Sample marine weather data
const marineWeatherData = {
  windSpeed: 12.4,
  waveHeight: 1.5,
  waterTemperature: 22,
  humidity: 75,
  lastUpdated: "15 minutes ago",
  trend: "rising",
}

// Sample anomaly alerts
const anomalyAlerts = [
  {
    id: 1,
    title: "Sudden PM2.5 Spike",
    message: "PM2.5 levels increased by 45% in the last hour. Possible data anomaly or environmental incident.",
    time: "35 minutes ago",
    severity: "high",
    acknowledged: false,
  },
  {
    id: 2,
    title: "Unusual Wave Height Pattern",
    message:
      "Wave height measurements show irregular patterns compared to historical data for similar weather conditions.",
    time: "2 hours ago",
    severity: "medium",
    acknowledged: true,
  },
  {
    id: 3,
    title: "Temperature Sensor Discrepancy",
    message:
      "Air temperature readings differ significantly from nearby weather stations. Possible sensor calibration issue.",
    time: "4 hours ago",
    severity: "low",
    acknowledged: false,
  },
]

// Sample hourly data for charts
const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  pm25: Math.random() * 30 + 10,
  pm10: Math.random() * 40 + 20,
  aqi: Math.random() * 50 + 50,
  waveHeight: Math.random() * 2 + 0.5,
  windSpeed: Math.random() * 15 + 5,
}))

export default function AIAlertsPage() {
  const [selectedTab, setSelectedTab] = useState("dashboard")
  const [showAnomalyAlert, setShowAnomalyAlert] = useState(false)
  const [activeAnomalies, setActiveAnomalies] = useState(anomalyAlerts.filter((alert) => !alert.acknowledged).length)
  const [isDataAugmentationOpen, setIsDataAugmentationOpen] = useState(false)
  const [formData, setFormData] = useState({
    pm10: 52.5,
    carbon_monoxide: 152,
    nitrogen_dioxide: 11.1,
    sulphur_dioxide: 8.8,
    ozone: 40,
    dust: 59
  })
  
  // New state for prediction
  const [predictionResult, setPredictionResult] = useState<number | null>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)

  // New states for city search and air quality data
  const [cityInput, setCityInput] = useState("")
  const [selectedCity, setSelectedCity] = useState({ name: "Vasai West", lat: 19.35, lon: 72.82 })
  const [airQualityApiData, setAirQualityApiData] = useState<AirQualityData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Function to fetch coordinates from city name using Nominatim API
  const fetchCityCoordinates = async (cityName: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        return { 
          name: cityName,
          lat: parseFloat(data[0].lat), 
          lon: parseFloat(data[0].lon)
        }
      }
      
      throw new Error("City not found")
    } catch (error) {
      console.error("Error fetching city coordinates:", error)
      return null
    }
  }

  // Function to fetch air quality data from Open-Meteo API
  const fetchAirQualityData = async (lat: number, lon: number) => {
    setIsLoading(true)
    try {
      const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,methane,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&current=ozone,sulphur_dioxide,nitrogen_dioxide,carbon_monoxide,european_aqi,us_aqi,pm10,pm2_5,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`
      
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      setAirQualityApiData(data)
      console.log("Air quality data:", data)
      
      // Update prediction inputs with live values when available
      if (data && data.current) {
        setFormData({
          pm10: data.current.pm10 || 52.5,
          carbon_monoxide: data.current.carbon_monoxide || 152,
          nitrogen_dioxide: data.current.nitrogen_dioxide || 11.1,
          sulphur_dioxide: data.current.sulphur_dioxide || 8.8,
          ozone: data.current.ozone || 40,
          dust: data.current.dust || 59
        })
      }
    } catch (error) {
      console.error("Error fetching air quality data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle city search
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cityInput.trim()) return
    
    const cityData = await fetchCityCoordinates(cityInput)
    if (cityData) {
      setSelectedCity(cityData)
      fetchAirQualityData(cityData.lat, cityData.lon)
      setCityInput("")
    }
  }

  // Fetch air quality data for initial city on component mount
  useEffect(() => {
    fetchAirQualityData(selectedCity.lat, selectedCity.lon)
  }, [])

  // Simulate anomaly detection when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeAnomalies > 0) {
        setShowAnomalyAlert(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [activeAnomalies])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number.parseFloat(value) || 0,
    }))
  }

  // Local prediction function (backup when API is not available)
  const calculateLocalPrediction = (data: typeof formData) => {
    // Simple linear model to approximate PM2.5 based on input parameters
    const pm25Estimate = (
      (data.pm10 * 0.7) + 
      (data.carbon_monoxide * 0.01) + 
      (data.nitrogen_dioxide * 0.1) + 
      (data.sulphur_dioxide * 0.05) + 
      (data.ozone * 0.02) + 
      (data.dust * 0.03)
    ) / 1.5;
    return Math.max(1, Math.min(Math.round(pm25Estimate * 100) / 100, 500));
  };

  // Function to submit prediction request
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Reset previous prediction result
    setPredictionResult(null)
    setPredictionError(null)
    setPredictionLoading(true)
    
    try {
      console.log("Sending prediction data:", formData);
      
      // Always calculate local prediction as fallback
      const localPrediction = calculateLocalPrediction(formData);
      
      // Try API call but use local prediction as fallback
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch("https://pm-server-h9q9.onrender.com/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn(`API returned status ${response.status}, using local prediction`);
          throw new Error(`Prediction failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("API prediction response:", data);
        
        if (data && typeof data.predicted_pm25 === 'number') {
          setPredictionResult(data.predicted_pm25);
        } else {
          console.warn("Invalid API response format, using local prediction");
          setPredictionResult(localPrediction);
        }
      } catch (fetchError) {
        console.warn("API fetch failed, using local prediction:", fetchError);
        setPredictionResult(localPrediction);
      }

    // Simulate anomaly detection
      const hasAnomaly = Math.random() > 0.7;
    if (hasAnomaly) {
        setShowAnomalyAlert(true);
        setActiveAnomalies((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Overall prediction error:", error);
      setPredictionError(error instanceof Error ? error.message : "Failed to get prediction");
    } finally {
      setPredictionLoading(false);
    }
  }

  const acknowledgeAlert = (id: number) => {
    // Simulate API call to acknowledge alert
    console.log("Acknowledging alert:", id)
    setActiveAnomalies((prev) => Math.max(0, prev - 1))
    if (activeAnomalies <= 1) {
      setShowAnomalyAlert(false)
    }
  }

  // Function to get status color based on AQI
  const getAqiStatusColor = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500/20 text-green-400"
    if (aqi <= 100) return "bg-yellow-500/20 text-yellow-400"
    if (aqi <= 150) return "bg-orange-500/20 text-orange-400"
    return "bg-red-500/20 text-red-400"
  }

  // Function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-500/10"
      case "medium":
        return "border-amber-500 bg-amber-500/10"
      case "low":
        return "border-blue-500 bg-blue-500/10"
      default:
        return "border-muted bg-muted/10"
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Air Quality Monitor</h1>
              <p className="text-muted-foreground">
                Real-time monitoring of air quality with AI-powered anomaly detection
              </p>
            </div>

            <div className="flex gap-3">
              <form onSubmit={handleCitySearch} className="relative">
                <Input
                  type="text"
                  placeholder="Enter city name..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="pr-10 w-[180px] md:w-[220px]"
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                  disabled={isLoading}
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>
              
              <Dialog open={isDataAugmentationOpen} onOpenChange={setIsDataAugmentationOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-neon-blue to-neon-orange gap-2">
                    <Edit className="h-4 w-4" /> Data Augmentation
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] glassmorphism border-neon-blue">
                  <DialogHeader>
                    <DialogTitle>Augment Sensor Data</DialogTitle>
                    <DialogDescription>
                      Enter parameters to predict PM2.5 levels using the machine learning model.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFormSubmit}>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="pm10">PM10 (μg/m³)</Label>
                        <Input
                          id="pm10"
                          name="pm10"
                          type="number"
                          step="0.1"
                          value={formData.pm10}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carbon_monoxide">Carbon Monoxide (μg/m³)</Label>
                        <Input
                          id="carbon_monoxide"
                          name="carbon_monoxide"
                          type="number"
                          step="0.1"
                          value={formData.carbon_monoxide}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nitrogen_dioxide">Nitrogen Dioxide (μg/m³)</Label>
                        <Input
                          id="nitrogen_dioxide"
                          name="nitrogen_dioxide"
                          type="number"
                          step="0.1"
                          value={formData.nitrogen_dioxide}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sulphur_dioxide">Sulphur Dioxide (μg/m³)</Label>
                        <Input
                          id="sulphur_dioxide"
                          name="sulphur_dioxide"
                          type="number"
                          step="0.1"
                          value={formData.sulphur_dioxide}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ozone">Ozone (μg/m³)</Label>
                        <Input
                          id="ozone"
                          name="ozone"
                          type="number"
                          step="0.1"
                          value={formData.ozone}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dust">Dust (μg/m³)</Label>
                        <Input
                          id="dust"
                          name="dust"
                          type="number"
                          step="0.1"
                          value={formData.dust}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      </div>
                    
                    {predictionResult !== null && (
                      <div className="my-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="font-medium text-green-400 mb-1">Prediction Result:</div>
                        <div className="text-xl">PM2.5: {predictionResult?.toFixed(2)} μg/m³</div>
                        <div className="mt-2 text-xs text-green-400/70">
                          This prediction is based on the parameters you provided above.
                    </div>
                      </div>
                    )}
                    
                    {predictionError && (
                      <div className="my-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {predictionError}
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-neon-blue to-neon-orange"
                        disabled={predictionLoading}
                      >
                        {predictionLoading ? "Processing..." : "Predict PM2.5"}
                      </Button>
                      <Button 
                        type="button" 
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                        onClick={() => {
                          const hasAnomaly = Math.random() > 0.5;
                          if (hasAnomaly) {
                            setShowAnomalyAlert(true);
                            setActiveAnomalies((prev) => prev + 1);
                          }
                        }}
                      >
                        Detect Anomaly
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <AlertCircle className="h-[1.2rem] w-[1.2rem]" />
                      {activeAnomalies > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {activeAnomalies}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{activeAnomalies} active anomalies detected</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>

          {/* Anomaly Alert Banner */}
          {showAnomalyAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg border border-red-500 bg-red-500/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-red-400">Anomaly Detected</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeAnomalies} anomalies detected in sensor data. Review alerts for details.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAnomalyAlert(false)}>
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Current Location Card */}
          <div className="mb-6">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-4">
                <div className="glassmorphism p-4 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-neon-blue/20">
                      <MapPin className="h-5 w-5 text-neon-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{selectedCity.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Lat: {selectedCity.lat?.toFixed(4)}, Lon: {selectedCity.lon?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getAqiStatusColor(airQualityApiData?.current.european_aqi || airQualityData.aqi)}>
                      {airQualityApiData ? 
                        (airQualityApiData.current.european_aqi <= 20 ? "Good" :
                         airQualityApiData.current.european_aqi <= 40 ? "Fair" :
                         airQualityApiData.current.european_aqi <= 60 ? "Moderate" :
                         airQualityApiData.current.european_aqi <= 80 ? "Poor" :
                         airQualityApiData.current.european_aqi <= 100 ? "Very Poor" : "Hazardous") 
                        : airQualityData.status}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                      {airQualityApiData ? 
                        new Date(airQualityApiData.current.time).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "Live Data"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="dashboard" className="data-[state=active]:text-gradient">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="anomalies" className="data-[state=active]:text-gradient">
                Pollutants
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:text-gradient">
                Forecast
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Air Quality Card */}
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Air Quality Monitoring</CardTitle>
                        <CardDescription>Real-time air quality metrics</CardDescription>
                      </div>
                      <Badge className={getAqiStatusColor(airQualityApiData?.current.european_aqi || airQualityData.aqi)}>
                        {airQualityApiData ? 
                          `EU AQI: ${airQualityApiData.current.european_aqi}` : 
                          airQualityData.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-5 rounded-xl space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-blue/20">
                              <Gauge className="h-4 w-4 text-neon-blue" />
                            </div>
                            <span className="text-sm text-muted-foreground">PM2.5</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                              {airQualityApiData ? airQualityApiData.current.pm2_5?.toFixed(1) : airQualityData.pm25}
                            </span>
                            <span className="text-xs text-muted-foreground">μg/m³</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-blue/20">
                              <Gauge className="h-4 w-4 text-neon-blue" />
                            </div>
                            <span className="text-sm text-muted-foreground">PM10</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                              {airQualityApiData ? airQualityApiData.current.pm10?.toFixed(1) : airQualityData.pm10}
                            </span>
                            <span className="text-xs text-muted-foreground">μg/m³</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-orange/20">
                              <Wind className="h-4 w-4 text-neon-orange" />
                            </div>
                            <span className="text-sm text-muted-foreground">CO2</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                              {airQualityApiData && airQualityApiData.hourly.carbon_dioxide ? 
                                airQualityApiData.hourly.carbon_dioxide[0] : airQualityData.co2}
                            </span>
                            <span className="text-xs text-muted-foreground">ppm</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-orange/20">
                              <Wind className="h-4 w-4 text-neon-orange" />
                            </div>
                            <span className="text-sm text-muted-foreground">O3 (Ozone)</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                              {airQualityApiData ? airQualityApiData.current.ozone?.toFixed(1) : "35.0"}
                            </span>
                            <span className="text-xs text-muted-foreground">μg/m³</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">Air Quality Index (EU)</h3>
                          <span className="text-sm font-medium">
                            {airQualityApiData ? airQualityApiData.current.european_aqi : airQualityData.aqi}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={airQualityApiData ? airQualityApiData.current.european_aqi : airQualityData.aqi} 
                            max={100} 
                            className="h-2" 
                          />
                          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                            <span>Good</span>
                            <span>Fair</span>
                            <span>Moderate</span>
                            <span>Poor</span>
                            <span>Very Poor</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2 border-t border-muted/20">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Updated {airQualityApiData ? 
                              new Date(airQualityApiData.current.time).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 
                              airQualityData.lastUpdated}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 text-blue-400" />
                          <span className="text-muted-foreground">Real-time data</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pollutants Card */}
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Additional Pollutants</CardTitle>
                        <CardDescription>Other air quality indicators</CardDescription>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400">Detailed Data</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-5 rounded-xl space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-blue/20">
                              <Gauge className="h-4 w-4 text-neon-blue" />
                            </div>
                            <span className="text-sm text-muted-foreground">NO2</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                              {airQualityApiData ? airQualityApiData.current.nitrogen_dioxide?.toFixed(1) : "12.8"}
                            </span>
                            <span className="text-xs text-muted-foreground">μg/m³</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-blue/20">
                              <Gauge className="h-4 w-4 text-neon-blue" />
                            </div>
                            <span className="text-sm text-muted-foreground">SO2</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                              {airQualityApiData ? airQualityApiData.current.sulphur_dioxide?.toFixed(1) : "2.5"}
                            </span>
                            <span className="text-xs text-muted-foreground">μg/m³</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-orange/20">
                              <Wind className="h-4 w-4 text-neon-orange" />
                            </div>
                            <span className="text-sm text-muted-foreground">CO</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                              {airQualityApiData ? airQualityApiData.current.carbon_monoxide?.toFixed(1) : "215.0"}
                            </span>
                            <span className="text-xs text-muted-foreground">μg/m³</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-orange/20">
                              <CloudRain className="h-4 w-4 text-neon-orange" />
                            </div>
                            <span className="text-sm text-muted-foreground">NH3</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                              {airQualityApiData ? airQualityApiData.current.ammonia?.toFixed(1) : "1.8"}
                            </span>
                            <span className="text-xs text-muted-foreground">μg/m³</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">US AQI</h3>
                          <span className="text-sm font-medium">
                            {airQualityApiData ? airQualityApiData.current.us_aqi : "65"}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={airQualityApiData ? airQualityApiData.current.us_aqi : 65} 
                            max={300} 
                            className="h-2" 
                          />
                          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                            <span>Good</span>
                            <span>Moderate</span>
                            <span>Unhealthy</span>
                            <span>Hazardous</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2 border-t border-muted/20">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Updated {airQualityApiData ? 
                              new Date(airQualityApiData.current.time).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 
                              "15 minutes ago"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 text-blue-400" />
                          <span className="text-muted-foreground">Real-time data</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Pollen Levels</CardTitle>
                          <CardDescription>Current pollen concentrations in the area</CardDescription>
                        </div>
                        <Badge className="bg-neon-blue/20 text-neon-blue">
                          <Clock className="h-3 w-3 mr-1" /> Today's Data
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-5 rounded-xl">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-green-500/20">
                                <Gauge className="h-4 w-4 text-green-400" />
                              </div>
                              <span className="text-sm">Alder Pollen</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-semibold">
                                {airQualityApiData ? airQualityApiData.current.alder_pollen?.toFixed(1) : "0.0"}
                              </span>
                              <span className="text-xs text-muted-foreground">grains/m³</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-yellow-500/20">
                                <Gauge className="h-4 w-4 text-yellow-400" />
                              </div>
                              <span className="text-sm">Birch Pollen</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-semibold">
                                {airQualityApiData ? airQualityApiData.current.birch_pollen?.toFixed(1) : "2.8"}
                              </span>
                              <span className="text-xs text-muted-foreground">grains/m³</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-blue-500/20">
                                <Gauge className="h-4 w-4 text-blue-400" />
                              </div>
                              <span className="text-sm">Grass Pollen</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-semibold">
                                {airQualityApiData ? airQualityApiData.current.grass_pollen?.toFixed(1) : "0.0"}
                              </span>
                              <span className="text-xs text-muted-foreground">grains/m³</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-purple-500/20">
                                <Gauge className="h-4 w-4 text-purple-400" />
                              </div>
                              <span className="text-sm">Mugwort Pollen</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-semibold">
                                {airQualityApiData ? airQualityApiData.current.mugwort_pollen?.toFixed(1) : "0.0"}
                              </span>
                              <span className="text-xs text-muted-foreground">grains/m³</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-amber-500/20">
                                <Gauge className="h-4 w-4 text-amber-400" />
                              </div>
                              <span className="text-sm">Olive Pollen</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-semibold">
                                {airQualityApiData ? airQualityApiData.current.olive_pollen?.toFixed(1) : "0.0"}
                              </span>
                              <span className="text-xs text-muted-foreground">grains/m³</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-red-500/20">
                                <Gauge className="h-4 w-4 text-red-400" />
                              </div>
                              <span className="text-sm">Ragweed Pollen</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-semibold">
                                {airQualityApiData ? airQualityApiData.current.ragweed_pollen?.toFixed(1) : "0.0"}
                              </span>
                              <span className="text-xs text-muted-foreground">grains/m³</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-muted/20 pt-4 mt-2">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="h-4 w-4 text-neon-blue" />
                            <h3 className="font-medium text-sm">Pollen Level Interpretation</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 text-sm gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-green-400"></span>
                              <span className="text-muted-foreground">0-1: Low levels</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                              <span className="text-muted-foreground">1-5: Moderate levels</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                              <span className="text-muted-foreground">5-20: High levels</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-red-400"></span>
                              <span className="text-muted-foreground">20+: Very high levels</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>UV & Dust Levels</CardTitle>
                      <CardDescription>Additional environmental factors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl space-y-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>UV Index</span>
                              <span>
                                {airQualityApiData ? airQualityApiData.current.uv_index.toFixed(1) : "0.0"}
                              </span>
                            </div>
                            <Progress 
                              value={airQualityApiData ? (airQualityApiData.current.uv_index / 11) * 100 : 0} 
                              className="h-2" 
                            />
                            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                              <span>Low</span>
                              <span>Moderate</span>
                              <span>High</span>
                              <span>Very High</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Clear Sky UV Index</span>
                              <span>
                                {airQualityApiData ? airQualityApiData.current.uv_index_clear_sky.toFixed(1) : "0.0"}
                              </span>
                            </div>
                            <Progress 
                              value={airQualityApiData ? (airQualityApiData.current.uv_index_clear_sky / 11) * 100 : 0} 
                              className="h-2" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Dust Concentration</span>
                              <span>
                                {airQualityApiData ? airQualityApiData.current.dust.toFixed(1) : "0.0"}
                              </span>
                            </div>
                            <Progress 
                              value={airQualityApiData ? Math.min((airQualityApiData.current.dust / 50) * 100, 100) : 0} 
                              className="h-2" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Aerosol Optical Depth</span>
                              <span>
                                {airQualityApiData ? airQualityApiData.current.aerosol_optical_depth.toFixed(2) : "0.31"}
                              </span>
                            </div>
                            <Progress 
                              value={airQualityApiData ? (airQualityApiData.current.aerosol_optical_depth / 1) * 100 : 31} 
                              className="h-2" 
                            />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-muted/20">
                          <h4 className="text-sm font-medium mb-2">UV Index Scale</h4>
                          <ul className="text-xs space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="text-green-400">•</span>
                              <span>0-2: Low - Minimal protection needed</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400">•</span>
                              <span>3-5: Moderate - Protection recommended</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400">•</span>
                              <span>6-7: High - Protection essential</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              <span>8+: Very High - Extra protection needed</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="anomalies">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Hourly Pollutant Trends</CardTitle>
                          <CardDescription>24-hour pollutant concentration patterns</CardDescription>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400">24-Hour Data</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-5 rounded-xl space-y-4">
                        {/* PM2.5 Trend */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <h3 className="text-sm font-medium">PM2.5 (μg/m³) - 24 Hour Trend</h3>
                          </div>
                          <div className="h-[80px] flex items-end gap-1">
                            {airQualityApiData ? 
                              airQualityApiData.hourly.pm2_5.slice(0, 24).map((value, index) => (
                                <div 
                                  key={index}
                                  className="flex-1 bg-gradient-to-t from-neon-blue/20 to-neon-blue/60 rounded-t relative group"
                                  style={{ height: `${Math.min((value / 50) * 100, 100)}%` }}
                                >
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-background border border-muted px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                    {value.toFixed(1)} μg/m³
                              </div>
                                </div>
                              )) :
                              Array.from({ length: 24 }, (_, i) => (
                                <div 
                                  key={i}
                                  className="flex-1 bg-gradient-to-t from-neon-blue/20 to-neon-blue/60 rounded-t"
                                  style={{ height: `${Math.random() * 80 + 10}%` }}
                                ></div>
                              ))
                            }
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>24:00</span>
                          </div>
                        </div>
                        
                        {/* PM10 Trend */}
                        <div className="pt-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-sm font-medium">PM10 (μg/m³) - 24 Hour Trend</h3>
                          </div>
                          <div className="h-[80px] flex items-end gap-1">
                            {airQualityApiData ? 
                              airQualityApiData.hourly.pm10.slice(0, 24).map((value, index) => (
                                <div 
                                  key={index}
                                  className="flex-1 bg-gradient-to-t from-neon-orange/20 to-neon-orange/60 rounded-t relative group"
                                  style={{ height: `${Math.min((value / 100) * 100, 100)}%` }}
                                >
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-background border border-muted px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                    {value.toFixed(1)} μg/m³
                                  </div>
                                </div>
                              )) :
                              Array.from({ length: 24 }, (_, i) => (
                                <div 
                                  key={i}
                                  className="flex-1 bg-gradient-to-t from-neon-orange/20 to-neon-orange/60 rounded-t"
                                  style={{ height: `${Math.random() * 80 + 10}%` }}
                                ></div>
                              ))
                            }
                                </div>
                          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>24:00</span>
                              </div>
                            </div>
                        
                        {/* Ozone Trend */}
                        <div className="pt-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-sm font-medium">Ozone (μg/m³) - 24 Hour Trend</h3>
                          </div>
                          <div className="h-[80px] flex items-end gap-1">
                            {airQualityApiData ? 
                              airQualityApiData.hourly.ozone.slice(0, 24).map((value, index) => (
                                <div 
                                  key={index}
                                  className="flex-1 bg-gradient-to-t from-blue-400/20 to-blue-400/60 rounded-t relative group"
                                  style={{ height: `${Math.min((value / 120) * 100, 100)}%` }}
                                >
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-background border border-muted px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                    {value.toFixed(1)} μg/m³
                                  </div>
                                </div>
                              )) :
                              Array.from({ length: 24 }, (_, i) => (
                                <div 
                                  key={i}
                                  className="flex-1 bg-gradient-to-t from-blue-400/20 to-blue-400/60 rounded-t"
                                  style={{ height: `${Math.random() * 80 + 10}%` }}
                                ></div>
                              ))
                            }
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>24:00</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Air Quality Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                          <div className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-neon-blue" />
                          <h3 className="font-medium">Health Implications</h3>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>PM2.5 Level</span>
                              <span className={
                                airQualityApiData && airQualityApiData.current.pm2_5 <= 10 ? "text-green-400" :
                                airQualityApiData && airQualityApiData.current.pm2_5 <= 25 ? "text-yellow-400" :
                                airQualityApiData && airQualityApiData.current.pm2_5 <= 50 ? "text-orange-400" :
                                "text-red-400"
                              }>
                                {airQualityApiData && airQualityApiData.current.pm2_5 <= 10 ? "Good" :
                                 airQualityApiData && airQualityApiData.current.pm2_5 <= 25 ? "Moderate" :
                                 airQualityApiData && airQualityApiData.current.pm2_5 <= 50 ? "Unhealthy for Sensitive Groups" :
                                 "Unhealthy"}
                              </span>
                            </div>
                            <Progress value={
                              airQualityApiData ? 
                                Math.min((airQualityApiData.current.pm2_5 / 50) * 100, 100) : 
                                50
                            } className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Ozone Level</span>
                              <span className={
                                airQualityApiData && airQualityApiData.current.ozone <= 60 ? "text-green-400" :
                                airQualityApiData && airQualityApiData.current.ozone <= 120 ? "text-yellow-400" :
                                airQualityApiData && airQualityApiData.current.ozone <= 180 ? "text-orange-400" :
                                "text-red-400"
                              }>
                                {airQualityApiData && airQualityApiData.current.ozone <= 60 ? "Good" :
                                 airQualityApiData && airQualityApiData.current.ozone <= 120 ? "Moderate" :
                                 airQualityApiData && airQualityApiData.current.ozone <= 180 ? "Unhealthy for Sensitive Groups" :
                                 "Unhealthy"}
                              </span>
                            </div>
                            <Progress value={
                              airQualityApiData ? 
                                Math.min((airQualityApiData.current.ozone / 180) * 100, 100) : 
                                30
                            } className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>NO2 Level</span>
                              <span className={
                                airQualityApiData && airQualityApiData.current.nitrogen_dioxide <= 40 ? "text-green-400" :
                                airQualityApiData && airQualityApiData.current.nitrogen_dioxide <= 90 ? "text-yellow-400" :
                                airQualityApiData && airQualityApiData.current.nitrogen_dioxide <= 120 ? "text-orange-400" :
                                "text-red-400"
                              }>
                                {airQualityApiData && airQualityApiData.current.nitrogen_dioxide <= 40 ? "Good" :
                                 airQualityApiData && airQualityApiData.current.nitrogen_dioxide <= 90 ? "Moderate" :
                                 airQualityApiData && airQualityApiData.current.nitrogen_dioxide <= 120 ? "Unhealthy for Sensitive Groups" :
                                 "Unhealthy"}
                              </span>
                            </div>
                            <Progress value={
                              airQualityApiData ? 
                                Math.min((airQualityApiData.current.nitrogen_dioxide / 120) * 100, 100) : 
                                20
                            } className="h-2" />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-muted/20">
                          <h4 className="text-sm font-medium mb-2">Health Recommendations</h4>
                          <ul className="text-xs space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Keep windows closed when pollution levels are high</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Use air purifiers in indoor spaces</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Limit outdoor exercise during peak pollution hours</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Wear masks when air quality is unhealthy</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Pollution Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Traffic Emissions</span>
                            <Badge variant="outline" className="bg-amber-500/20 text-amber-400">Major</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Industrial Emissions</span>
                            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">Moderate</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Natural Sources</span>
                            <Badge variant="outline" className="bg-green-500/20 text-green-400">Minor</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Residential Heating</span>
                            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">Moderate</Badge>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-muted/20 text-xs text-muted-foreground">
                          <p>
                            Data based on emission inventories and source attribution models.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>5-Day Air Quality Forecast</CardTitle>
                          <CardDescription>Projected air quality index and pollutant levels</CardDescription>
                        </div>
                        <Badge className="bg-neon-blue/20 text-neon-blue">
                          <BarChart3 className="h-3 w-3 mr-1" /> 5-Day Forecast
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-5 rounded-xl space-y-5">
                        {/* PM2.5 Forecast */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <h3 className="text-sm font-medium">PM2.5 Forecast (μg/m³)</h3>
                          </div>
                          <div className="h-[100px] flex items-end gap-1">
                            {airQualityApiData ?
                              // Group by day and show average for 5 days
                              Array.from({ length: 5 }, (_, dayIndex) => {
                                const startIdx = dayIndex * 24;
                                const dayData = airQualityApiData?.hourly?.pm2_5?.slice(startIdx, startIdx + 24) || [];
                                const avgValue = dayData.length > 0 ? dayData.reduce((sum, val) => sum + (val || 0), 0) / dayData.length : 0;
                                
                                return (
                                  <div key={dayIndex} className="flex-1 flex flex-col items-center gap-1">
                                    <div 
                                      className="w-full bg-gradient-to-t from-neon-blue/20 to-neon-blue/60 rounded-t relative group"
                                      style={{ height: `${Math.min((avgValue / 50) * 100, 100)}%` }}
                                    >
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-background border border-muted px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                        {avgValue?.toFixed(1)} μg/m³
                                      </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        new Date(airQualityApiData?.hourly?.time?.[startIdx] || Date.now()).getTime() + dayIndex * 86400000
                                      ).toLocaleDateString(undefined, { weekday: 'short' })}
                                    </span>
                                  </div>
                                );
                              }) :
                              Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                  <div 
                                    className="w-full bg-gradient-to-t from-neon-blue/20 to-neon-blue/60 rounded-t"
                                    style={{ height: `${Math.random() * 80 + 10}%` }}
                                  ></div>
                                  <span className="text-xs text-muted-foreground">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                                  </span>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                        
                        {/* Ozone Forecast */}
                        <div className="pt-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-sm font-medium">Ozone Forecast (μg/m³)</h3>
                          </div>
                          <div className="h-[100px] flex items-end gap-1">
                            {airQualityApiData ?
                              // Group by day and show average for 5 days
                              Array.from({ length: 5 }, (_, dayIndex) => {
                                const startIdx = dayIndex * 24;
                                const dayData = airQualityApiData?.hourly?.ozone?.slice(startIdx, startIdx + 24) || [];
                                const avgValue = dayData.length > 0 ? dayData.reduce((sum, val) => sum + (val || 0), 0) / dayData.length : 0;
                                
                                return (
                                  <div key={dayIndex} className="flex-1 flex flex-col items-center gap-1">
                                    <div 
                                      className="w-full bg-gradient-to-t from-blue-400/20 to-blue-400/60 rounded-t relative group"
                                      style={{ height: `${Math.min((avgValue / 120) * 100, 100)}%` }}
                                    >
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-background border border-muted px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                        {avgValue?.toFixed(1)} μg/m³
                                      </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        new Date(airQualityApiData?.hourly?.time?.[startIdx] || Date.now()).getTime() + dayIndex * 86400000
                                      ).toLocaleDateString(undefined, { weekday: 'short' })}
                                    </span>
                                  </div>
                                );
                              }) :
                              Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                  <div 
                                    className="w-full bg-gradient-to-t from-blue-400/20 to-blue-400/60 rounded-t"
                                    style={{ height: `${Math.random() * 80 + 10}%` }}
                                  ></div>
                                  <span className="text-xs text-muted-foreground">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                                  </span>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                        
                        {/* NO2 Forecast */}
                        <div className="pt-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-sm font-medium">Nitrogen Dioxide Forecast (μg/m³)</h3>
                          </div>
                          <div className="h-[100px] flex items-end gap-1">
                            {airQualityApiData ?
                              // Group by day and show average for 5 days
                              Array.from({ length: 5 }, (_, dayIndex) => {
                                const startIdx = dayIndex * 24;
                                const dayData = airQualityApiData?.hourly?.nitrogen_dioxide?.slice(startIdx, startIdx + 24) || [];
                                const avgValue = dayData.length > 0 ? dayData.reduce((sum, val) => sum + (val || 0), 0) / dayData.length : 0;
                                
                                return (
                                  <div key={dayIndex} className="flex-1 flex flex-col items-center gap-1">
                                    <div 
                                      className="w-full bg-gradient-to-t from-amber-400/20 to-amber-400/60 rounded-t relative group"
                                      style={{ height: `${Math.min((avgValue / 120) * 100, 100)}%` }}
                                    >
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-background border border-muted px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                        {avgValue?.toFixed(1)} μg/m³
                                      </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        new Date(airQualityApiData?.hourly?.time?.[startIdx] || Date.now()).getTime() + dayIndex * 86400000
                                      ).toLocaleDateString(undefined, { weekday: 'short' })}
                                    </span>
                                  </div>
                                );
                              }) :
                              Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                  <div 
                                    className="w-full bg-gradient-to-t from-amber-400/20 to-amber-400/60 rounded-t"
                                    style={{ height: `${Math.random() * 80 + 10}%` }}
                                  ></div>
                                  <span className="text-xs text-muted-foreground">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                                  </span>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-2">
                      <CardTitle>Air Quality Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-neon-blue" />
                          <h3 className="font-medium">5-Day Analysis</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {airQualityApiData ? 
                            `Air quality in ${selectedCity.name} is expected to remain at ${
                              airQualityApiData.current.european_aqi <= 20 ? "good" :
                              airQualityApiData.current.european_aqi <= 40 ? "fair" :
                              airQualityApiData.current.european_aqi <= 60 ? "moderate" :
                              airQualityApiData.current.european_aqi <= 80 ? "poor" :
                              "very poor"
                            } levels for the next few days, with some fluctuations in pollutant concentrations throughout the day.` :
                            "Air quality forecast based on current conditions and weather patterns. Pollution levels may vary based on local conditions and emissions."
                          }
                        </p>

                        <div className="pt-3 border-t border-muted/20">
                          <h4 className="text-sm font-medium mb-2">Key Observations</h4>
                          <ul className="text-xs space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>PM2.5 levels tend to peak during morning rush hour (7-9 AM)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Ozone concentrations are highest during midday when UV levels peak</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Nitrogen dioxide (NO2) correlates with traffic patterns</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-2">
                      <CardTitle>Health Impact Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-neon-orange" />
                            <h3 className="font-medium">Health Risk Levels</h3>
                          </div>
                          <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue">
                            Next 5 Days
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>General Population</span>
                              <span className={
                                airQualityApiData && airQualityApiData.current.european_aqi <= 40 ? "text-green-400" :
                                airQualityApiData && airQualityApiData.current.european_aqi <= 60 ? "text-yellow-400" :
                                "text-orange-400"
                              }>
                                {airQualityApiData && airQualityApiData.current.european_aqi <= 40 ? "Low Risk" :
                                 airQualityApiData && airQualityApiData.current.european_aqi <= 60 ? "Moderate Risk" :
                                 "Elevated Risk"}
                              </span>
                            </div>
                            <Progress value={
                              airQualityApiData ? 
                                Math.min((airQualityApiData.current.european_aqi / 100) * 100, 100) : 
                                45
                            } className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Sensitive Groups</span>
                              <span className={
                                airQualityApiData && airQualityApiData.current.european_aqi <= 20 ? "text-green-400" :
                                airQualityApiData && airQualityApiData.current.european_aqi <= 40 ? "text-yellow-400" :
                                "text-red-400"
                              }>
                                {airQualityApiData && airQualityApiData.current.european_aqi <= 20 ? "Low Risk" :
                                 airQualityApiData && airQualityApiData.current.european_aqi <= 40 ? "Moderate Risk" :
                                 "High Risk"}
                              </span>
                            </div>
                            <Progress value={
                              airQualityApiData ? 
                                Math.min((airQualityApiData.current.european_aqi / 80) * 100, 100) : 
                                65
                            } className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Pollen Sensitivity</span>
                              <span className={
                                airQualityApiData && airQualityApiData.current.birch_pollen <= 1 ? "text-green-400" :
                                airQualityApiData && airQualityApiData.current.birch_pollen <= 10 ? "text-yellow-400" :
                                "text-orange-400"
                              }>
                                {airQualityApiData && airQualityApiData.current.birch_pollen <= 1 ? "Low Risk" :
                                 airQualityApiData && airQualityApiData.current.birch_pollen <= 10 ? "Moderate Risk" :
                                 "High Risk"}
                              </span>
                            </div>
                            <Progress value={
                              airQualityApiData ? 
                                Math.min((airQualityApiData.current.birch_pollen / 20) * 100, 100) : 
                                25
                            } className="h-2" />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-muted/20 text-xs text-muted-foreground">
                          <p>
                            Risk assessment based on current air quality data and forecasted trends.
                            <span className="text-neon-blue ml-1">Updated hourly</span>
                          </p>
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