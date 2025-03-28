  "use client"

  import { useState } from "react"
  import { motion } from "framer-motion"
  import { Wind, Info, BarChart3, MapPin, Calendar, TrendingUp, TrendingDown } from "lucide-react"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  import { Button } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"

  // City air index data
  const cityAirData = [
    {
      id: 1,
      name: "Downtown",
      aqi: 32,
      status: "Good",
      pm25: 8.2,
      pm10: 18.5,
      o3: 0.03,
      no2: 0.01,
      trend: "down",
    },
    {
      id: 2,
      name: "Industrial Zone",
      aqi: 85,
      status: "Moderate",
      pm25: 25.7,
      pm10: 42.3,
      o3: 0.07,
      no2: 0.04,
      trend: "up",
    },
    {
      id: 3,
      name: "Residential Area",
      aqi: 45,
      status: "Good",
      pm25: 12.3,
      pm10: 22.1,
      o3: 0.04,
      no2: 0.02,
      trend: "down",
    },
    {
      id: 4,
      name: "City Park",
      aqi: 22,
      status: "Good",
      pm25: 4.8,
      pm10: 10.2,
      o3: 0.02,
      no2: 0.01,
      trend: "down",
    },
  ]

  export default function AirQualityPage() {
    const [selectedTab, setSelectedTab] = useState("dashboard")

    // Function to get status color
    const getStatusColor = (aqi: number) => {
      if (aqi <= 50) return "text-green-400 bg-green-400/20"
      if (aqi <= 100) return "text-yellow-400 bg-yellow-400/20"
      if (aqi <= 150) return "text-orange-400 bg-orange-400/20"
      return "text-red-400 bg-red-400/20"
    }

    return (
      <div className="min-h-screen bg-dark-bg py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold mb-2">Air Quality Monitoring</h1>
              <p className="text-muted-foreground mb-6">Track real-time air quality metrics across the city</p>
            </motion.div>

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
                      <CardTitle>Air Quality Index Trends</CardTitle>
                      <CardDescription>7-day air quality metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl h-[400px] flex items-center justify-center">
                        <div className="text-center">
                          <Wind className="h-16 w-16 mx-auto mb-4 text-neon-blue" />
                          <h3 className="text-xl font-medium mb-2">Air Quality Chart</h3>
                          <p className="text-muted-foreground max-w-md">
                            This would display a chart showing air quality trends over time.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-6">
                    <Card className="border-0 shadow-none bg-transparent">
                      <CardHeader className="pb-2">
                        <CardTitle>City Air Index</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {cityAirData.map((city) => (
                            <motion.div
                              key={city.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: city.id * 0.1 }}
                              className="glassmorphism p-4 rounded-lg"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{city.name}</span>
                                </div>
                                <Badge variant="outline" className={getStatusColor(city.aqi)}>
                                  {city.status}
                                </Badge>
                              </div>

                              <div className="flex justify-between mb-2">
                                <div className="text-2xl font-bold">{city.aqi}</div>
                                {city.trend === "down" ? (
                                  <TrendingDown className="h-5 w-5 text-green-400" />
                                ) : (
                                  <TrendingUp className="h-5 w-5 text-red-400" />
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>PM2.5: {city.pm25} µg/m³</div>
                                <div>PM10: {city.pm10} µg/m³</div>
                                <div>Ozone: {city.o3} ppm</div>
                                <div>NO₂: {city.no2} ppm</div>
                              </div>
                            </motion.div>
                          ))}
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
                              Overall air quality is good in most areas. Ideal for outdoor activities in parks and
                              residential areas.
                            </p>
                            <p className="text-yellow-400">
                              Caution advised in industrial zones. Sensitive groups should limit extended outdoor
                              exposure.
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
                    <CardTitle>Air Pollution Heatmap</CardTitle>
                    <CardDescription>Visualize pollution concentration across the city</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-[600px] glassmorphism rounded-xl overflow-hidden">
                      <div className="absolute inset-0 grid place-items-center bg-darker-bg/60">
                        <div className="text-center px-4">
                          <Wind className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-xl font-medium mb-2">Interactive Map Placeholder</h3>
                          <p className="text-muted-foreground max-w-md">
                            This would be an interactive Google Maps or Mapbox integration showing air pollution heatmap
                            overlays.
                          </p>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 z-10">
                        <div className="glassmorphism p-3 rounded-lg shadow-lg">
                          <h4 className="text-sm font-medium mb-3">Pollution Levels</h4>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-green-500" />
                            <span className="text-xs">Good</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-yellow-500" />
                            <span className="text-xs">Moderate</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-orange-500" />
                            <span className="text-xs">Unhealthy</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-500" />
                            <span className="text-xs">Hazardous</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forecast">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2 border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>AI-Powered Air Quality Forecast</CardTitle>
                          <CardDescription>7-day prediction based on weather and historical trends</CardDescription>
                        </div>
                        <Badge className="bg-neon-blue/20 text-neon-blue">
                          <BarChart3 className="h-3 w-3 mr-1" /> AI Prediction
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl h-[400px] flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-neon-blue" />
                          <h3 className="text-xl font-medium mb-2">Forecast Chart</h3>
                          <p className="text-muted-foreground max-w-md">
                            This would display a chart showing predicted air quality trends.
                          </p>
                        </div>
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
                            <h3 className="font-medium">Weekly Trend</h3>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Air quality is predicted to improve over the next 7 days due to expected precipitation and
                            wind patterns.
                          </p>

                          <div className="border-t border-muted/20 pt-3">
                            <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                            <ul className="text-xs space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Thursday and Friday are optimal for outdoor activities</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-yellow-400">!</span>
                                <span>Industrial zone pollution expected to decrease by 20%</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Weekend forecast shows excellent air quality</span>
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
                            <h3 className="font-medium">AI Confidence Score</h3>
                            <Badge variant="outline" className="bg-neon-orange/20 text-neon-orange">
                              92%
                            </Badge>
                          </div>

                          <div className="space-y-3 text-sm">
                            <p>
                              This forecast is based on historical data, current weather patterns, traffic conditions, and
                              industrial activity.
                            </p>
                            <Button className="w-full mt-2 bg-gradient-to-r from-neon-blue to-neon-orange">
                              Generate Custom Forecast
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

