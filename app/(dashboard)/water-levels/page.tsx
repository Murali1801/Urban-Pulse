"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Droplets, AlertTriangle, BarChart3, Clock, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Sample reservoir data
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

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2">Water Level Monitoring</h1>
            <p className="text-muted-foreground mb-6">Track water reservoir levels and water quality metrics</p>
          </motion.div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:text-gradient">
                Overview
              </TabsTrigger>
              <TabsTrigger value="reservoirs" className="data-[state=active]:text-gradient">
                Reservoirs
              </TabsTrigger>
              <TabsTrigger value="water-quality" className="data-[state=active]:text-gradient">
                Water Quality
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {reservoirData.map((reservoir, index) => (
                  <motion.div
                    key={reservoir.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="glassmorphism border-0 h-full">
                      <CardContent className="pt-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{reservoir.name}</h3>
                          <Badge
                            variant="outline"
                            className={
                              reservoir.status === "High"
                                ? "bg-orange-500/20 text-orange-400"
                                : reservoir.status === "Low"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-green-500/20 text-green-400"
                            }
                          >
                            {reservoir.status}
                          </Badge>
                        </div>

                        <div className="relative py-5">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">{reservoir.capacity}%</span>
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
                                reservoir.capacity > 80
                                  ? "rgba(255, 165, 0, 0.8)"
                                  : reservoir.capacity > 60
                                    ? "rgba(0, 163, 255, 0.8)"
                                    : "rgba(255, 0, 0, 0.8)"
                              }
                              strokeWidth="10"
                              strokeDasharray={`${2 * Math.PI * 35 * (reservoir.capacity / 100)} ${2 * Math.PI * 35 * (1 - reservoir.capacity / 100)}`}
                              strokeDashoffset={2 * Math.PI * 35 * 0.25}
                            />
                          </svg>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{reservoir.lastUpdated}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {reservoir.change.type === "increase" ? (
                              <TrendingUp className="h-3 w-3 text-green-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-400" />
                            )}
                            <span>{reservoir.change.value}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Annual Reservoir Levels</CardTitle>
                        <CardDescription>Monthly water levels across all reservoirs</CardDescription>
                      </div>
                      <Badge className="bg-neon-blue/20 text-neon-blue">
                        <BarChart3 className="h-3 w-3 mr-1" /> Yearly Data
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-4 rounded-xl h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Droplets className="h-16 w-16 mx-auto mb-4 text-neon-blue" />
                        <h3 className="text-xl font-medium mb-2">Water Levels Chart</h3>
                        <p className="text-muted-foreground max-w-md">
                          This would display a chart showing water level trends over time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Water Supply Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-5 rounded-xl space-y-5">
                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">Overall Capacity</h3>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">Current Demand</h3>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">Supply Efficiency</h3>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>

                      <div className="pt-2 border-t border-muted/20">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-green-500/20 text-green-400">
                            Stable
                          </Badge>
                          <span className="text-muted-foreground">Water supply stable for next 180 days</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Water Conservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-5 rounded-xl">
                      <div className="mb-4">
                        <Badge variant="outline" className="mb-3 bg-neon-orange/20 text-neon-orange">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Conservation Notice
                        </Badge>
                        <p className="text-sm mb-3">
                          Current reservoir levels are adequate, but long-term forecasts suggest implementing water
                          conservation measures in the following areas:
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <ArrowUpRight className="h-4 w-4 text-neon-orange shrink-0 mt-0.5" />
                            <span>East District: Limit outdoor watering to twice per week</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowUpRight className="h-4 w-4 text-neon-orange shrink-0 mt-0.5" />
                            <span>All Districts: Repair leaking fixtures promptly</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowUpRight className="h-4 w-4 text-neon-orange shrink-0 mt-0.5" />
                            <span>Industrial Zone: Implement 5% reduction in water usage</span>
                          </li>
                        </ul>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-neon-blue to-neon-orange">
                        View Conservation Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reservoirs">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reservoirData.map((reservoir, index) => (
                  <motion.div
                    key={reservoir.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="glassmorphism border-0 overflow-hidden">
                      <div
                        className={
                          reservoir.status === "High"
                            ? "h-1 bg-orange-500"
                            : reservoir.status === "Low"
                              ? "h-1 bg-red-500"
                              : "h-1 bg-green-500"
                        }
                      />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{reservoir.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Updated {reservoir.lastUpdated}</span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              reservoir.status === "High"
                                ? "bg-orange-500/20 text-orange-400"
                                : reservoir.status === "Low"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-green-500/20 text-green-400"
                            }
                          >
                            {reservoir.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="glassmorphism p-4 rounded-lg text-center">
                            <div className="text-sm text-muted-foreground mb-1">Capacity</div>
                            <div className="text-2xl font-bold">{reservoir.capacity}%</div>
                            <div className="text-xs flex items-center justify-center gap-1 text-muted-foreground">
                              {reservoir.change.type === "increase" ? (
                                <>
                                  <TrendingUp className="h-3 w-3 text-green-400" />
                                  <span className="text-green-400">+{reservoir.change.value}%</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-3 w-3 text-red-400" />
                                  <span className="text-red-400">-{reservoir.change.value}%</span>
                                </>
                              )}
                              <span>this month</span>
                            </div>
                          </div>

                          <div className="glassmorphism p-4 rounded-lg text-center">
                            <div className="text-sm text-muted-foreground mb-1">pH Level</div>
                            <div className="text-2xl font-bold">{reservoir.phLevel}</div>
                            <div className="text-xs text-muted-foreground">
                              {reservoir.phLevel > 7.5
                                ? "Slightly Alkaline"
                                : reservoir.phLevel < 6.5
                                  ? "Slightly Acidic"
                                  : "Normal Range"}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            View Details
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-neon-blue to-neon-orange">
                            Historical Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Reservoir Map</CardTitle>
                    <CardDescription>Geographic overview of all water reservoirs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-[400px] glassmorphism rounded-xl overflow-hidden">
                      <div className="absolute inset-0 grid place-items-center bg-darker-bg/60">
                        <div className="text-center px-4">
                          <Droplets className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-xl font-medium mb-2">Interactive Map Placeholder</h3>
                          <p className="text-muted-foreground max-w-md">
                            This would be an interactive map showing the locations of all water reservoirs with their
                            current capacity levels.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="water-quality">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-0 shadow-none bg-transparent">
                  <CardHeader>
                    <CardTitle>Water Quality Metrics</CardTitle>
                    <CardDescription>Key water quality parameters across the city</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="glassmorphism p-6 rounded-xl space-y-5">
                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">pH Level</h3>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="bg-green-500/20 text-green-400">
                              Normal
                            </Badge>
                            <span className="text-sm font-medium">7.2</span>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="absolute inset-0 flex">
                              <div className="h-full w-1/3 bg-red-500 opacity-10"></div>
                              <div className="h-full w-1/3 bg-green-500 opacity-20"></div>
                              <div className="h-full w-1/3 bg-yellow-500 opacity-10"></div>
                            </div>
                            <div
                              className="h-full bg-green-500 absolute rounded-full"
                              style={{ width: "2px", left: "calc(60% - 1px)" }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                            <span>Acidic (0)</span>
                            <span>Neutral (7)</span>
                            <span>Alkaline (14)</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">Chlorine Levels</h3>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="bg-green-500/20 text-green-400">
                              Safe
                            </Badge>
                            <span className="text-sm font-medium">1.2 mg/L</span>
                          </div>
                        </div>
                        <Progress value={30} className="h-2" />
                        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                          <span>0 mg/L</span>
                          <span>4 mg/L (Max)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

