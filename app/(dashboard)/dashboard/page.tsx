"use client"

import { motion } from "framer-motion"
import { Wind, Droplets, Car, Zap, AlertCircle } from "lucide-react"
import { GlobeVisualization } from "@/components/globe-visualization"
import { CitySearch } from "@/components/city-search"
import { StatCard } from "@/components/stat-card"
import { AlertItem } from "@/components/alert-item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Sample alert data
const alerts = [
  {
    id: 1,
    title: "Flooding Alert",
    message: "Potential flooding in downtown area due to heavy rainfall.",
    time: "10 minutes ago",
    level: "critical" as const,
  },
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
]

export default function DashboardPage() {
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
              Monitor air quality, traffic, water levels, and energy consumption in real-time. UrbanPulse provides city
              administrators with the data they need to make informed decisions.
            </p>
          </motion.div>

          <CitySearch />

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <StatCard
                title="Air Quality Index"
                value="Good (42)"
                icon={<Wind className="h-5 w-5 text-neon-blue" />}
                trend={{ value: 12, isPositive: true }}
                className="border-t-4 border-t-neon-blue"
              >
                <div className="mt-2 pt-2 border-t border-muted/20">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>PM2.5: 10 µg/m³</span>
                    <span>PM10: 22 µg/m³</span>
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
                value="Moderate"
                icon={<Car className="h-5 w-5 text-neon-orange" />}
                trend={{ value: 8, isPositive: false }}
                className="border-t-4 border-t-neon-orange"
              >
                <div className="mt-2 pt-2 border-t border-muted/20">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Avg. Speed: 32 mph</span>
                    <span>Delay: +15 min</span>
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
                title="Water Reservoirs"
                value="78% Capacity"
                icon={<Droplets className="h-5 w-5 text-neon-blue" />}
                trend={{ value: 2, isPositive: true }}
                className="border-t-4 border-t-neon-blue"
              >
                <div className="mt-2 pt-2 border-t border-muted/20">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>pH Level: 7.2</span>
                    <span>Supply: Normal</span>
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
                title="Energy Consumption"
                value="247 MW"
                icon={<Zap className="h-5 w-5 text-neon-orange" />}
                trend={{ value: 5, isPositive: false }}
                className="border-t-4 border-t-neon-orange"
              >
                <div className="mt-2 pt-2 border-t border-muted/20">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Renewable: 35%</span>
                    <span>Grid Load: High</span>
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

