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
    pm25: airQualityData.pm25,
    pm10: airQualityData.pm10,
    co2: airQualityData.co2,
    aqi: airQualityData.aqi,
    temperature: airQualityData.temperature,
    windSpeed: marineWeatherData.windSpeed,
    waveHeight: marineWeatherData.waveHeight,
    waterTemperature: marineWeatherData.waterTemperature,
    humidity: marineWeatherData.humidity,
  })

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call to store data
    console.log("Storing data:", formData)

    // Simulate anomaly detection
    const hasAnomaly = Math.random() > 0.7
    if (hasAnomaly) {
      setShowAnomalyAlert(true)
      setActiveAnomalies((prev) => prev + 1)
    }

    setIsDataAugmentationOpen(false)
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
              <h1 className="text-3xl font-bold mb-2">AI Anomaly Detection</h1>
              <p className="text-muted-foreground">
                Real-time monitoring of air quality and marine weather with AI-powered anomaly detection
              </p>
            </div>

            <div className="flex gap-3">
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
                      Manually enter or modify sensor data. Changes will be analyzed for anomalies.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFormSubmit}>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="pm25">PM2.5 (μg/m³)</Label>
                        <Input
                          id="pm25"
                          name="pm25"
                          type="number"
                          step="0.1"
                          value={formData.pm25}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
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
                        <Label htmlFor="co2">CO2 (ppm)</Label>
                        <Input
                          id="co2"
                          name="co2"
                          type="number"
                          value={formData.co2}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aqi">AQI Index</Label>
                        <Input
                          id="aqi"
                          name="aqi"
                          type="number"
                          value={formData.aqi}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Air Temperature (°C)</Label>
                        <Input
                          id="temperature"
                          name="temperature"
                          type="number"
                          step="0.1"
                          value={formData.temperature}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="windSpeed">Wind Speed (km/h)</Label>
                        <Input
                          id="windSpeed"
                          name="windSpeed"
                          type="number"
                          step="0.1"
                          value={formData.windSpeed}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waveHeight">Wave Height (m)</Label>
                        <Input
                          id="waveHeight"
                          name="waveHeight"
                          type="number"
                          step="0.1"
                          value={formData.waveHeight}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waterTemperature">Water Temperature (°C)</Label>
                        <Input
                          id="waterTemperature"
                          name="waterTemperature"
                          type="number"
                          step="0.1"
                          value={formData.waterTemperature}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="humidity">Humidity (%)</Label>
                        <Input
                          id="humidity"
                          name="humidity"
                          type="number"
                          value={formData.humidity}
                          onChange={handleFormChange}
                          className="bg-muted/30"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-gradient-to-r from-neon-blue to-neon-orange">
                        Submit Data
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

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="dashboard" className="data-[state=active]:text-gradient">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="anomalies" className="data-[state=active]:text-gradient">
                Anomaly Alerts
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:text-gradient">
                Data Trends
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
                      <Badge className={getAqiStatusColor(airQualityData.aqi)}>{airQualityData.status}</Badge>
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
                            <span className="text-2xl font-semibold">{airQualityData.pm25}</span>
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
                            <span className="text-2xl font-semibold">{airQualityData.pm10}</span>
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
                            <span className="text-2xl font-semibold">{airQualityData.co2}</span>
                            <span className="text-xs text-muted-foreground">ppm</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-orange/20">
                              <Thermometer className="h-4 w-4 text-neon-orange" />
                            </div>
                            <span className="text-sm text-muted-foreground">Temperature</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">{airQualityData.temperature}</span>
                            <span className="text-xs text-muted-foreground">°C</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">Air Quality Index</h3>
                          <span className="text-sm font-medium">{airQualityData.aqi}</span>
                        </div>
                        <div className="relative">
                          <Progress value={airQualityData.aqi} max={300} className="h-2" />
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
                          <span className="text-muted-foreground">Updated {airQualityData.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {airQualityData.trend === "rising" ? (
                            <ArrowUp className="h-3 w-3 text-red-400" />
                          ) : airQualityData.trend === "falling" ? (
                            <ArrowDown className="h-3 w-3 text-green-400" />
                          ) : (
                            <RefreshCw className="h-3 w-3 text-blue-400" />
                          )}
                          <span className="text-muted-foreground">Trend: {airQualityData.trend}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Marine Weather Card */}
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Marine Weather Monitoring</CardTitle>
                        <CardDescription>Real-time marine weather conditions</CardDescription>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400">Live Data</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-5 rounded-xl space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-blue/20">
                              <Wind className="h-4 w-4 text-neon-blue" />
                            </div>
                            <span className="text-sm text-muted-foreground">Wind Speed</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">{marineWeatherData.windSpeed}</span>
                            <span className="text-xs text-muted-foreground">km/h</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-blue/20">
                              <Waves className="h-4 w-4 text-neon-blue" />
                            </div>
                            <span className="text-sm text-muted-foreground">Wave Height</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">{marineWeatherData.waveHeight}</span>
                            <span className="text-xs text-muted-foreground">m</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-orange/20">
                              <Thermometer className="h-4 w-4 text-neon-orange" />
                            </div>
                            <span className="text-sm text-muted-foreground">Water Temperature</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">{marineWeatherData.waterTemperature}</span>
                            <span className="text-xs text-muted-foreground">°C</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-neon-orange/20">
                              <CloudRain className="h-4 w-4 text-neon-orange" />
                            </div>
                            <span className="text-sm text-muted-foreground">Humidity</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">{marineWeatherData.humidity}</span>
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">Wave Conditions</h3>
                          <span className="text-sm font-medium">
                            {marineWeatherData.waveHeight < 1
                              ? "Calm"
                              : marineWeatherData.waveHeight < 2
                                ? "Moderate"
                                : "Rough"}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={marineWeatherData.waveHeight * 25} max={100} className="h-2" />
                          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                            <span>Calm</span>
                            <span>Moderate</span>
                            <span>Rough</span>
                            <span>High</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2 border-t border-muted/20">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Updated {marineWeatherData.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {marineWeatherData.trend === "rising" ? (
                            <ArrowUp className="h-3 w-3 text-red-400" />
                          ) : marineWeatherData.trend === "falling" ? (
                            <ArrowDown className="h-3 w-3 text-green-400" />
                          ) : (
                            <RefreshCw className="h-3 w-3 text-blue-400" />
                          )}
                          <span className="text-muted-foreground">Trend: {marineWeatherData.trend}</span>
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
                          <CardTitle>AI Anomaly Detection Status</CardTitle>
                          <CardDescription>Real-time monitoring and analysis</CardDescription>
                        </div>
                        <Badge className="bg-neon-blue/20 text-neon-blue">
                          <BarChart3 className="h-3 w-3 mr-1" /> AI Powered
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-neon-blue" />
                          <h3 className="text-xl font-medium mb-2">Anomaly Detection Chart</h3>
                          <p className="text-muted-foreground max-w-md">
                            This would display a chart showing detected anomalies and data patterns over time.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Recent Anomalies</CardTitle>
                      <CardDescription>AI-detected data irregularities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl space-y-4">
                        {anomalyAlerts.slice(0, 3).map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-lg border-l-2 ${getSeverityColor(alert.severity)}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium">{alert.title}</h4>
                              <Badge
                                variant="outline"
                                className={
                                  alert.severity === "high"
                                    ? "bg-red-500/20 text-red-400"
                                    : alert.severity === "medium"
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-blue-500/20 text-blue-400"
                                }
                              >
                                {alert.severity === "high" ? "High" : alert.severity === "medium" ? "Medium" : "Low"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{alert.message}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{alert.time}</span>
                              {!alert.acknowledged && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" /> Acknowledge
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" className="w-full text-sm">
                          View All Anomalies
                        </Button>
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
                          <CardTitle>Anomaly Alerts</CardTitle>
                          <CardDescription>AI-detected data irregularities and potential issues</CardDescription>
                        </div>
                        <Badge className="bg-red-500/20 text-red-400">{activeAnomalies} Active Alerts</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {anomalyAlerts.map((alert) => (
                          <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: alert.id * 0.1 }}
                            className={`p-4 border-l-4 rounded-r-lg glassmorphism ${
                              alert.severity === "high"
                                ? "border-red-500 bg-red-500/10"
                                : alert.severity === "medium"
                                  ? "border-amber-500 bg-amber-500/10"
                                  : "border-blue-500 bg-blue-500/10"
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <AlertCircle
                                  className={`h-5 w-5 ${
                                    alert.severity === "high"
                                      ? "text-red-500"
                                      : alert.severity === "medium"
                                        ? "text-amber-500"
                                        : "text-blue-500"
                                  }`}
                                />
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-medium">{alert.title}</h3>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={
                                        alert.severity === "high"
                                          ? "bg-red-500/20 text-red-400"
                                          : alert.severity === "medium"
                                            ? "bg-amber-500/20 text-amber-400"
                                            : "bg-blue-500/20 text-blue-400"
                                      }
                                    >
                                      {alert.severity === "high"
                                        ? "High"
                                        : alert.severity === "medium"
                                          ? "Medium"
                                          : "Low"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground mb-1">{alert.message}</div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{alert.time}</span>
                                  {!alert.acknowledged && (
                                    <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                                      <Check className="h-3 w-3 mr-1" /> Acknowledge
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Anomaly Detection Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-neon-blue" />
                            <span className="font-medium">Detection Sensitivity</span>
                          </div>
                          <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue">
                            Medium
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>PM2.5 Threshold</span>
                              <span>±15%</span>
                            </div>
                            <Progress value={50} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Wave Height Threshold</span>
                              <span>±20%</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Temperature Threshold</span>
                              <span>±10%</span>
                            </div>
                            <Progress value={35} className="h-2" />
                          </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-neon-blue to-neon-orange">
                          Adjust Sensitivity
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>AI Model Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-neon-orange" />
                            <span className="font-medium">Model Accuracy</span>
                          </div>
                          <Badge variant="outline" className="bg-green-500/20 text-green-400">
                            94.7%
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>False Positives</span>
                            <span className="text-amber-400">3.2%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>False Negatives</span>
                            <span className="text-red-400">2.1%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Last Retrained</span>
                            <span>2 days ago</span>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" /> Retrain Model
                        </Button>
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
                          <CardTitle>Data Trend Analysis</CardTitle>
                          <CardDescription>24-hour trends with anomaly detection</CardDescription>
                        </div>
                        <Badge className="bg-neon-blue/20 text-neon-blue">
                          <BarChart3 className="h-3 w-3 mr-1" /> 24h Data
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl h-[400px] flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-neon-blue" />
                          <h3 className="text-xl font-medium mb-2">Data Trends Chart</h3>
                          <p className="text-muted-foreground max-w-md">
                            This would display a chart showing air quality and marine weather trends over time with
                            anomaly indicators.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-2">
                      <CardTitle>Trend Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-neon-blue" />
                          <h3 className="font-medium">24-Hour Analysis</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Air quality has remained stable with minor fluctuations within normal ranges. Marine
                          conditions show a gradual increase in wave height over the past 6 hours.
                        </p>

                        <div className="pt-3 border-t border-muted/20">
                          <h4 className="text-sm font-medium mb-2">Key Observations</h4>
                          <ul className="text-xs space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>PM2.5 levels peak during morning rush hour (7-9 AM)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Wave height correlates with wind speed patterns</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              <span>Anomaly detected in CO2 readings at 14:30</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-2">
                      <CardTitle>Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-neon-orange" />
                            <h3 className="font-medium">AI Prediction</h3>
                          </div>
                          <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue">
                            Next 24h
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Air Quality</span>
                              <span className="text-yellow-400">Moderate</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Wave Conditions</span>
                              <span className="text-blue-400">Increasing</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Anomaly Probability</span>
                              <span className="text-green-400">Low</span>
                            </div>
                            <Progress value={25} className="h-2" />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-muted/20 text-xs text-muted-foreground">
                          <p>
                            Forecast based on historical patterns, weather predictions, and sensor data.
                            <span className="text-neon-blue ml-1">95% confidence</span>
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