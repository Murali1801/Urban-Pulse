"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Car, ArrowRight, AlertTriangle, Clock, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Sample data for traffic hotspots
const trafficHotspots = [
  {
    id: 1,
    name: "Downtown Main Street",
    congestion: 85,
    delay: "25 min",
    speed: "7 mph",
    status: "Heavy",
  },
  {
    id: 2,
    name: "Highway 101 North",
    congestion: 75,
    delay: "18 min",
    speed: "15 mph",
    status: "Heavy",
  },
  {
    id: 3,
    name: "Central Boulevard",
    congestion: 65,
    delay: "12 min",
    speed: "22 mph",
    status: "Moderate",
  },
  {
    id: 4,
    name: "West Bridge",
    congestion: 60,
    delay: "10 min",
    speed: "25 mph",
    status: "Moderate",
  },
  {
    id: 5,
    name: "East Highway Junction",
    congestion: 55,
    delay: "8 min",
    speed: "30 mph",
    status: "Moderate",
  },
]

// Sample data for emergency routes
const emergencyRoutes = [
  {
    id: 1,
    from: "Central Hospital",
    to: "North District",
    time: "7 min",
    distance: "2.3 miles",
    congestion: "Low",
  },
  {
    id: 2,
    from: "City Center",
    to: "Memorial Hospital",
    time: "12 min",
    distance: "4.1 miles",
    congestion: "Moderate",
  },
  {
    id: 3,
    from: "East Precinct",
    to: "Southside Mall",
    time: "9 min",
    distance: "3.5 miles",
    congestion: "Low",
  },
]

export default function TrafficPage() {
  const [selectedTab, setSelectedTab] = useState("heatmap")

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2">Traffic Monitoring</h1>
            <p className="text-muted-foreground mb-6">
              Real-time traffic data, congestion analysis, and route optimization
            </p>
          </motion.div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="heatmap" className="data-[state=active]:text-gradient">
                Traffic Heatmap
              </TabsTrigger>
              <TabsTrigger value="hotspots" className="data-[state=active]:text-gradient">
                Congestion Hotspots
              </TabsTrigger>
              <TabsTrigger value="emergency" className="data-[state=active]:text-gradient">
                Emergency Routes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap">
              <Card className="border-0 shadow-none overflow-hidden bg-transparent">
                <CardHeader>
                  <CardTitle>Live Traffic Heatmap</CardTitle>
                  <CardDescription>Real-time traffic conditions across the city</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-[600px] glassmorphism rounded-xl overflow-hidden">
                    {/* Here we'd normally have the Google Maps integration */}
                    <div className="absolute inset-0 grid place-items-center bg-darker-bg/60">
                      <div className="text-center px-4">
                        <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-medium mb-2">Interactive Map Placeholder</h3>
                        <p className="text-muted-foreground max-w-md">
                          This would be an interactive Google Maps or Mapbox integration showing real-time traffic data
                          with congestion heatmaps.
                        </p>
                      </div>
                    </div>

                    {/* Map overlay controls - these would actually work with a real map integration */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="glassmorphism p-3 rounded-lg shadow-lg">
                        <h4 className="text-sm font-medium mb-3">Traffic Density</h4>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 rounded-full bg-green-500" />
                          <span className="text-xs">Low</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 rounded-full bg-yellow-500" />
                          <span className="text-xs">Moderate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-500" />
                          <span className="text-xs">High</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <Card className="bg-panel-bg border-0">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium">Route Planner</h3>
                            <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue">
                              AI Powered
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Get AI-optimized route suggestions based on real-time traffic
                          </p>
                          <Button className="w-full bg-gradient-to-r from-neon-blue to-neon-orange">Plan Route</Button>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex-1">
                      <Card className="bg-panel-bg border-0">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium">Traffic Analysis</h3>
                            <Badge variant="outline" className="bg-neon-orange/20 text-neon-orange">
                              Historical Data
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Compare current traffic with historical patterns
                          </p>
                          <Button variant="outline" className="w-full">
                            View Analysis
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hotspots">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Top 5 Traffic Hotspots</h2>
                  <Badge variant="outline" className="bg-red-500/20 hover:bg-red-500/30 text-red-400">
                    Live Data
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trafficHotspots.map((hotspot, index) => (
                    <motion.div
                      key={hotspot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden glassmorphism border-0 h-full">
                        <div
                          className={`h-2 ${
                            hotspot.congestion > 70
                              ? "bg-red-500"
                              : hotspot.congestion > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium mb-1">{hotspot.name}</h3>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
                                <MapPin className="h-3 w-3" />
                                <span>Congestion Level: {hotspot.status}</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Badge
                                variant="outline"
                                className={`${
                                  hotspot.congestion > 70
                                    ? "bg-red-500/20 text-red-400"
                                    : hotspot.congestion > 50
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-green-500/20 text-green-400"
                                }`}
                              >
                                {hotspot.congestion}%
                              </Badge>
                            </div>
                          </div>

                          <Progress value={hotspot.congestion} className="h-2 mb-4" />

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">Delay: {hotspot.delay}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">Avg Speed: {hotspot.speed}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" className="gap-2">
                    View All Hotspots <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emergency">
              <Card className="border-0 shadow-none overflow-hidden bg-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Emergency Route Finder</CardTitle>
                      <CardDescription>AI-optimized routes for emergency vehicles</CardDescription>
                    </div>
                    <Badge className="bg-neon-blue/20 text-neon-blue">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Priority Routing
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 glassmorphism p-6 rounded-xl">
                    <h3 className="text-lg font-medium mb-4">Current Emergency Routes</h3>

                    <div className="space-y-4">
                      {emergencyRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 glassmorphism rounded-lg"
                        >
                          <div className="mb-3 sm:mb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue rounded-full">
                                Route {route.id}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span>{route.from}</span>
                              <ArrowRight className="h-3 w-3" />
                              <span>{route.to}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Time</div>
                              <div className="font-medium">{route.time}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Distance</div>
                              <div className="font-medium">{route.distance}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Traffic</div>
                              <div
                                className={`font-medium ${
                                  route.congestion === "Low"
                                    ? "text-green-400"
                                    : route.congestion === "Moderate"
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                }`}
                              >
                                {route.congestion}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <Card className="flex-1 bg-panel-bg border-0">
                      <CardContent className="p-5">
                        <h3 className="text-sm font-medium mb-2">Calculate New Route</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Find the fastest route for emergency vehicles based on current traffic conditions
                        </p>
                        <Button className="w-full bg-gradient-to-r from-neon-blue to-neon-orange">
                          Calculate Route
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="flex-1 bg-panel-bg border-0">
                      <CardContent className="p-5">
                        <h3 className="text-sm font-medium mb-2">Emergency Traffic Control</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Activate traffic light prioritization for emergency vehicles
                        </p>
                        <Button variant="destructive" className="w-full">
                          Activate Control
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

