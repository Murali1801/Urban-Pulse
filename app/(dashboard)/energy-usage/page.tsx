"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Zap,
  BarChart3,
  Clock,
  DollarSign,
  Leaf,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Calendar,
  ArrowRight,
  Info,
  Tv,
  Refrigerator,
  Fan,
  Laptop,
  AirVent,
  Coffee,
  Smartphone,
  WashingMachine,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/stat-card"

// Sample data for energy consumption
const energyData = {
  today: {
    total: 24.7,
    peak: 3.2,
    average: 1.03,
    carbon: 12.4,
    cost: 3.71,
    comparison: { value: 8, isPositive: false },
  },
  week: {
    total: 168.3,
    peak: 4.8,
    average: 1.0,
    carbon: 84.2,
    cost: 25.25,
    comparison: { value: 5, isPositive: false },
  },
  month: {
    total: 720.5,
    peak: 5.2,
    average: 0.98,
    carbon: 360.3,
    cost: 108.08,
    comparison: { value: 3, isPositive: true },
  },
}

// Sample data for connected devices
const connectedDevices = [
  {
    id: 1,
    name: "Air Conditioner",
    location: "Living Room",
    consumption: 1.2,
    status: "active",
    icon: AirVent,
    percentage: 28,
  },
  {
    id: 2,
    name: "Refrigerator",
    location: "Kitchen",
    consumption: 0.85,
    status: "active",
    icon: Refrigerator,
    percentage: 20,
  },
  {
    id: 3,
    name: "Television",
    location: "Living Room",
    consumption: 0.65,
    status: "active",
    icon: Tv,
    percentage: 15,
  },
  {
    id: 4,
    name: "Washing Machine",
    location: "Laundry Room",
    consumption: 0.5,
    status: "idle",
    icon: WashingMachine,
    percentage: 12,
  },
  {
    id: 5,
    name: "Laptop",
    location: "Office",
    consumption: 0.35,
    status: "active",
    icon: Laptop,
    percentage: 8,
  },
  {
    id: 6,
    name: "Coffee Maker",
    location: "Kitchen",
    consumption: 0.3,
    status: "idle",
    icon: Coffee,
    percentage: 7,
  },
  {
    id: 7,
    name: "Fan",
    location: "Bedroom",
    consumption: 0.25,
    status: "active",
    icon: Fan,
    percentage: 6,
  },
  {
    id: 8,
    name: "Smartphone Charger",
    location: "Bedroom",
    consumption: 0.15,
    status: "active",
    icon: Smartphone,
    percentage: 4,
  },
]

// Sample energy-saving tips
const energySavingTips = [
  {
    id: 1,
    title: "Optimize Air Conditioner Usage",
    description: "Set your AC to 78°F instead of 72°F to save up to 15% on cooling costs.",
    impact: "High",
    savings: "$25/month",
  },
  {
    id: 2,
    title: "Unplug Idle Electronics",
    description: "Devices in standby mode still consume power. Unplug them when not in use.",
    impact: "Medium",
    savings: "$10/month",
  },
  {
    id: 3,
    title: "Use LED Light Bulbs",
    description: "Replace traditional bulbs with LEDs to reduce lighting energy by up to 75%.",
    impact: "Medium",
    savings: "$15/month",
  },
  {
    id: 4,
    title: "Run Full Loads of Laundry",
    description: "Wait until you have a full load before running your washing machine.",
    impact: "Low",
    savings: "$5/month",
  },
]

export default function EnergyUsagePage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [timeframe, setTimeframe] = useState("today")

  // Get the appropriate data based on the selected timeframe
  const currentData = energyData[timeframe as keyof typeof energyData]

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2">Energy Usage Monitoring</h1>
            <p className="text-muted-foreground mb-6">
              Track, analyze, and optimize your city's energy consumption in real-time
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="w-full sm:w-auto">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                  <TabsTrigger value="overview" className="data-[state=active]:text-gradient">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="data-[state=active]:text-gradient">
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="devices" className="data-[state=active]:text-gradient">
                    Devices
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="data-[state=active]:text-gradient">
                    Tips
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-2">
              <Button
                variant={timeframe === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe("today")}
                className={timeframe === "today" ? "bg-gradient-to-r from-neon-blue to-neon-orange" : ""}
              >
                Today
              </Button>
              <Button
                variant={timeframe === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe("week")}
                className={timeframe === "week" ? "bg-gradient-to-r from-neon-blue to-neon-orange" : ""}
              >
                Week
              </Button>
              <Button
                variant={timeframe === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe("month")}
                className={timeframe === "month" ? "bg-gradient-to-r from-neon-blue to-neon-orange" : ""}
              >
                Month
              </Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <StatCard
                    title="Total Energy Consumption"
                    value={currentData.total + " kWh"}
                    icon={<Zap className="h-5 w-5 text-neon-orange" />}
                    trend={currentData.comparison}
                    className="border-t-4 border-t-neon-orange"
                  >
                    <div className="mt-2 pt-2 border-t border-muted/20">
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Peak: {currentData.peak} kWh</span>
                        <span>Avg: {currentData.average} kWh/h</span>
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
                    title="Live Power Usage"
                    value="2.4 kW"
                    icon={<RefreshCw className="h-5 w-5 text-neon-blue" />}
                    className="border-t-4 border-t-neon-blue"
                  >
                    <div className="mt-2 pt-2 border-t border-muted/20">
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Status: Active</span>
                        <span className="text-green-400">Normal Range</span>
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
                    title="Carbon Footprint"
                    value={currentData.carbon + " kg CO₂"}
                    icon={<Leaf className="h-5 w-5 text-green-500" />}
                    trend={currentData.comparison}
                    className="border-t-4 border-t-green-500"
                  >
                    <div className="mt-2 pt-2 border-t border-muted/20">
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Equivalent to:</span>
                        <span>{(currentData.carbon / 8.8).toFixed(1)} tree days</span>
                      </div>
                    </div>
                  </StatCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <StatCard
                    title="Estimated Cost"
                    value={"$" + currentData.cost.toFixed(2)}
                    icon={<DollarSign className="h-5 w-5 text-neon-orange" />}
                    trend={currentData.comparison}
                    className="border-t-4 border-t-neon-orange"
                  >
                    <div className="mt-2 pt-2 border-t border-muted/20">
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Rate: $0.15/kWh</span>
                        <span>Projected: ${(currentData.cost * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </StatCard>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Energy Consumption Trends</CardTitle>
                          <CardDescription>Hourly energy usage pattern</CardDescription>
                        </div>
                        <Badge className="bg-neon-blue/20 text-neon-blue">
                          <BarChart3 className="h-3 w-3 mr-1" /> Live Data
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-neon-blue" />
                          <h3 className="text-xl font-medium mb-2">Energy Consumption Chart</h3>
                          <p className="text-muted-foreground max-w-md">
                            This would display a chart showing energy consumption trends over time.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Peak Usage Hours</CardTitle>
                      <CardDescription>When energy consumption is highest</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neon-orange" />
                            <span className="font-medium">Today's Peak Hours</span>
                          </div>
                          <Badge variant="outline" className="bg-neon-orange/20 text-neon-orange">
                            High Demand
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Morning (7-9 AM)</span>
                              <span className="font-medium">2.8 kWh</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Afternoon (12-2 PM)</span>
                              <span className="font-medium">2.2 kWh</span>
                            </div>
                            <Progress value={55} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Evening (6-8 PM)</span>
                              <span className="font-medium">3.2 kWh</span>
                            </div>
                            <Progress value={80} className="h-2" />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-muted/20">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Recommendation:</span>
                            <span className="text-neon-blue">Shift usage to off-peak hours</span>
                          </div>
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
                          <CardTitle>Energy Usage Analytics</CardTitle>
                          <CardDescription>Detailed consumption patterns and forecasts</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-neon-blue/20 text-neon-blue">
                            <Calendar className="h-3 w-3 mr-1" /> {timeframe}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-xl h-[400px] flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-neon-blue" />
                          <h3 className="text-xl font-medium mb-2">Energy Analytics Chart</h3>
                          <p className="text-muted-foreground max-w-md">
                            This would display detailed analytics charts showing energy usage patterns, forecasts, and
                            comparisons with historical data.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-2">
                      <CardTitle>Consumption Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-green-400" />
                          <h3 className="font-medium">Usage Trend</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Your energy consumption is <span className="text-green-400">8% lower</span> than last{" "}
                          {timeframe}. Keep up the good work!
                        </p>

                        <div className="pt-3 border-t border-muted/20">
                          <h4 className="text-sm font-medium mb-2">Key Observations</h4>
                          <ul className="text-xs space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Peak usage has shifted from evening to morning hours</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>HVAC systems account for 40% of total consumption</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-neon-blue">•</span>
                              <span>Weekend usage is 15% lower than weekdays</span>
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
                            <TrendingUp className="h-5 w-5 text-neon-orange" />
                            <h3 className="font-medium">Projected Usage</h3>
                          </div>
                          <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue">
                            AI Prediction
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Tomorrow</span>
                              <span>~25.2 kWh</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Next Week</span>
                              <span>~172.5 kWh</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Next Month</span>
                              <span>~710.8 kWh</span>
                            </div>
                            <Progress value={60} className="h-2" />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-muted/20 text-xs text-muted-foreground">
                          <p>
                            Forecast based on historical patterns, weather predictions, and scheduled activities.
                            <span className="text-neon-blue ml-1">92% confidence</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="devices">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Connected Devices</CardTitle>
                          <CardDescription>Energy consumption by device</CardDescription>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">8 Devices Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connectedDevices.map((device) => {
                          const DeviceIcon = device.icon
                          return (
                            <motion.div
                              key={device.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: device.id * 0.05 }}
                            >
                              <div className="glassmorphism p-4 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted/50">
                                      <DeviceIcon className="h-5 w-5 text-neon-blue" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{device.name}</h3>
                                      <p className="text-xs text-muted-foreground">{device.location}</p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={
                                      device.status === "active"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-muted/50 text-muted-foreground"
                                    }
                                  >
                                    {device.status === "active" ? "Active" : "Idle"}
                                  </Badge>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Current Usage:</span>
                                    <span className="font-medium">{device.consumption} kWh</span>
                                  </div>
                                  <Progress value={device.percentage} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{device.percentage}% of total</span>
                                    <span>~${(device.consumption * 0.15).toFixed(2)}/day</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Device Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-5">
                        <div>
                          <h3 className="font-medium mb-3">Top Energy Consumers</h3>
                          <div className="space-y-3">
                            {connectedDevices
                              .slice(0, 3)
                              .sort((a, b) => b.consumption - a.consumption)
                              .map((device) => {
                                const DeviceIcon = device.icon
                                return (
                                  <div key={device.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{device.name}</span>
                                    </div>
                                    <div className="text-sm font-medium">{device.consumption} kWh</div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-muted/20">
                          <h3 className="font-medium mb-3">Optimization Opportunities</h3>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-neon-orange shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm">Air Conditioner is running at high power</p>
                                <p className="text-xs text-muted-foreground">Potential savings: 0.4 kWh/hour</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-neon-orange shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm">Refrigerator efficiency has decreased</p>
                                <p className="text-xs text-muted-foreground">Maintenance recommended</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-neon-blue to-neon-orange">
                          Run Optimization Scan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tips">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Energy-Saving Recommendations</CardTitle>
                          <CardDescription>AI-powered suggestions to reduce consumption</CardDescription>
                        </div>
                        <Badge className="bg-neon-blue/20 text-neon-blue">
                          <Lightbulb className="h-3 w-3 mr-1" /> Smart Tips
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {energySavingTips.map((tip) => (
                          <motion.div
                            key={tip.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: tip.id * 0.1 }}
                            className="glassmorphism p-4 rounded-lg"
                          >
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-full bg-neon-blue/20">
                                <Lightbulb className="h-5 w-5 text-neon-blue" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-medium">{tip.title}</h3>
                                  <Badge
                                    variant="outline"
                                    className={
                                      tip.impact === "High"
                                        ? "bg-green-500/20 text-green-400"
                                        : tip.impact === "Medium"
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : "bg-blue-500/20 text-blue-400"
                                    }
                                  >
                                    {tip.impact} Impact
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Potential savings:</span>
                                  <span className="text-green-400 font-medium">{tip.savings}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" className="gap-2">
                          View All Recommendations <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Real-time Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-neon-orange" />
                            <h3 className="font-medium">Consumption Alerts</h3>
                          </div>
                          <Badge variant="outline" className="bg-neon-orange/20 text-neon-orange">
                            2 Active
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-red-500/10 border-l-2 border-red-500">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium">Unusual Power Spike</h4>
                              <span className="text-xs text-muted-foreground">15 min ago</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Detected 3.5 kWh spike in the Industrial Zone. Investigating cause.
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-yellow-500/10 border-l-2 border-yellow-500">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium">High Consumption Period</h4>
                              <span className="text-xs text-muted-foreground">1 hour ago</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Current usage is 20% above average for this time of day.
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full">
                          Configure Alert Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Energy Efficiency Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg">
                        <div className="flex justify-center mb-4">
                          <div className="relative w-32 h-32">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth="10"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(0, 163, 255, 0.8)"
                                strokeWidth="10"
                                strokeDasharray={(2 * Math.PI * 45 * 0.75) + " " + (2 * Math.PI * 45 * 0.25)}
                                strokeDashoffset={2 * Math.PI * 45 * 0.25}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                              <span className="text-3xl font-bold">B+</span>
                              <span className="text-xs text-muted-foreground">75/100</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Current Rating:</span>
                            <span className="font-medium text-neon-blue">Good</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Month:</span>
                            <span className="font-medium">C (65/100)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>City Average:</span>
                            <span className="font-medium">C+ (68/100)</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-muted/20">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                              Implementing all recommendations could improve your score to an A (90+).
                            </p>
                          </div>
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