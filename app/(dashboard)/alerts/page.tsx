"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  AlertCircle,
  Cloud,
  CloudRain,
  Zap,
  Waves,
  Car,
  History,
  Megaphone,
  Filter,
  MessageSquare,
  Mail,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// Sample alert data
const alerts = [
  {
    id: 1,
    title: "Flooding Alert",
    message: "Potential flooding in downtown area due to heavy rainfall. Avoid low-lying areas.",
    time: "10 minutes ago",
    type: "disaster",
    level: "critical",
    icon: CloudRain,
    location: "Downtown",
  },
  {
    id: 2,
    title: "Traffic Congestion",
    message: "Major traffic jam on Highway 101, expect delays of 25+ minutes. Alternative routes recommended.",
    time: "25 minutes ago",
    type: "traffic",
    level: "warning",
    icon: Car,
    location: "Highway 101",
  },
  {
    id: 3,
    title: "Air Quality Update",
    message: "Air quality has improved by 15% in the central district. Safe for outdoor activities.",
    time: "1 hour ago",
    type: "environment",
    level: "info",
    icon: Cloud,
    location: "Central District",
  },
  {
    id: 4,
    title: "Power Outage",
    message: "Temporary power outage reported in the eastern neighborhood. Technicians dispatched.",
    time: "2 hours ago",
    type: "utilities",
    level: "warning",
    icon: Zap,
    location: "Eastern Neighborhood",
  },
  {
    id: 5,
    title: "Water Main Break",
    message: "Water main break on Main Street affecting water pressure in surrounding blocks. Repair crews en route.",
    time: "3 hours ago",
    type: "utilities",
    level: "warning",
    icon: Waves,
    location: "Main Street",
  },
  {
    id: 6,
    title: "Public Event",
    message: "City festival scheduled this weekend at Central Park. Expect increased pedestrian and vehicle traffic.",
    time: "5 hours ago",
    type: "community",
    level: "info",
    icon: Megaphone,
    location: "Central Park",
  },
]

// Alert type colors
const getAlertTypeColor = (type: string) => {
  switch (type) {
    case "disaster":
      return "bg-red-500/20 text-red-400"
    case "traffic":
      return "bg-amber-500/20 text-amber-400"
    case "environment":
      return "bg-green-500/20 text-green-400"
    case "utilities":
      return "bg-blue-500/20 text-blue-400"
    case "community":
      return "bg-purple-500/20 text-purple-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

// Alert level styling
const getAlertLevelStyle = (level: string) => {
  switch (level) {
    case "critical":
      return "border-red-500 bg-red-500/10"
    case "warning":
      return "border-amber-500 bg-amber-500/10"
    case "info":
      return "border-blue-500 bg-blue-500/10"
    default:
      return "border-muted bg-muted/10"
  }
}

export default function AlertsPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false)
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(false)
  const [filterTypes, setFilterTypes] = useState({
    disaster: true,
    traffic: true,
    environment: true,
    utilities: true,
    community: true,
  })

  // Filter alerts based on the selected tab and filter types
  const filteredAlerts = alerts.filter((alert) => {
    if (!filterTypes[alert.type as keyof typeof filterTypes]) return false
    if (selectedTab === "all") return true
    if (selectedTab === "critical" && alert.level === "critical") return true
    if (selectedTab === "warnings" && alert.level === "warning") return true
    if (selectedTab === "info" && alert.level === "info") return true
    return false
  })

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Alerts & Notifications</h1>
              <p className="text-muted-foreground">Monitor critical alerts and notifications across the city</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Alert Types</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.disaster}
                    onCheckedChange={(checked) => setFilterTypes({ ...filterTypes, disaster: checked })}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getAlertTypeColor("disaster").split(" ")[1]}`} />
                      Disasters
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.traffic}
                    onCheckedChange={(checked) => setFilterTypes({ ...filterTypes, traffic: checked })}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getAlertTypeColor("traffic").split(" ")[1]}`} />
                      Traffic
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.environment}
                    onCheckedChange={(checked) => setFilterTypes({ ...filterTypes, environment: checked })}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getAlertTypeColor("environment").split(" ")[1]}`} />
                      Environment
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.utilities}
                    onCheckedChange={(checked) => setFilterTypes({ ...filterTypes, utilities: checked })}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getAlertTypeColor("utilities").split(" ")[1]}`} />
                      Utilities
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.community}
                    onCheckedChange={(checked) => setFilterTypes({ ...filterTypes, community: checked })}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getAlertTypeColor("community").split(" ")[1]}`} />
                      Community
                    </div>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90 gap-2">
                <Bell className="h-4 w-4" /> Configure Alerts
              </Button>
            </div>
          </motion.div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="all" className="data-[state=active]:text-gradient">
                All Alerts
              </TabsTrigger>
              <TabsTrigger value="critical" className="data-[state=active]:text-gradient">
                Critical
              </TabsTrigger>
              <TabsTrigger value="warnings" className="data-[state=active]:text-gradient">
                Warnings
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:text-gradient">
                Information
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Recent Alerts</CardTitle>
                        <Badge
                          variant="outline"
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Live Updates
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredAlerts.length > 0 ? (
                        <div className="space-y-4">
                          {filteredAlerts.map((alert, index) => {
                            const IconComponent = alert.icon
                            return (
                              <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`p-4 border-l-4 rounded-r-lg glassmorphism ${getAlertLevelStyle(alert.level)}`}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <IconComponent
                                      className={`h-5 w-5 ${
                                        alert.level === "critical"
                                          ? "text-red-500"
                                          : alert.level === "warning"
                                            ? "text-amber-500"
                                            : "text-blue-500"
                                      }`}
                                    />
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <h3 className="font-medium">{alert.title}</h3>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={getAlertTypeColor(alert.type)}>
                                          {alert.type}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-1">{alert.message}</div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>{alert.time}</span>
                                      <span>{alert.location}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="glassmorphism p-8 rounded-lg text-center">
                          <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <h3 className="font-medium text-lg mb-2">No alerts found</h3>
                          <p className="text-muted-foreground">There are no alerts matching your current filters.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Configure how you receive alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={notificationsEnabled}
                            onCheckedChange={setNotificationsEnabled}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="email-alerts">Email Alerts</Label>
                          </div>
                          <Switch
                            id="email-alerts"
                            checked={emailAlertsEnabled}
                            onCheckedChange={setEmailAlertsEnabled}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="sms-alerts">SMS Alerts</Label>
                          </div>
                          <Switch id="sms-alerts" checked={smsAlertsEnabled} onCheckedChange={setSmsAlertsEnabled} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                      <CardTitle>Alert History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glassmorphism p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-medium">Previous Alerts</h3>
                          </div>
                          <Badge variant="outline">Last 24 hours</Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Critical alerts:</span>
                            <Badge variant="outline" className="bg-red-500/20 text-red-400">
                              3
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Warning alerts:</span>
                            <Badge variant="outline" className="bg-amber-500/20 text-amber-400">
                              8
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Information alerts:</span>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                              12
                            </Badge>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full mt-4">
                          View Full History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="critical" className="mt-0">
              {/* Content for critical alerts tab - similar structure as "all" tab */}
              <div className="space-y-4">
                {filteredAlerts.map((alert, index) => {
                  const IconComponent = alert.icon
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 border-l-4 rounded-r-lg glassmorphism ${getAlertLevelStyle(alert.level)}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <IconComponent
                            className={`h-5 w-5 ${
                              alert.level === "critical"
                                ? "text-red-500"
                                : alert.level === "warning"
                                  ? "text-amber-500"
                                  : "text-blue-500"
                            }`}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{alert.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getAlertTypeColor(alert.type)}>
                                {alert.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">{alert.message}</div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{alert.time}</span>
                            <span>{alert.location}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="warnings" className="mt-0">
              {/* Content for warnings tab - similar structure as "all" tab */}
              <div className="space-y-4">
                {filteredAlerts.map((alert, index) => {
                  const IconComponent = alert.icon
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 border-l-4 rounded-r-lg glassmorphism ${getAlertLevelStyle(alert.level)}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <IconComponent
                            className={`h-5 w-5 ${
                              alert.level === "critical"
                                ? "text-red-500"
                                : alert.level === "warning"
                                  ? "text-amber-500"
                                  : "text-blue-500"
                            }`}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{alert.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getAlertTypeColor(alert.type)}>
                                {alert.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">{alert.message}</div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{alert.time}</span>
                            <span>{alert.location}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              {/* Content for info tab - similar structure as "all" tab */}
              <div className="space-y-4">
                {filteredAlerts.map((alert, index) => {
                  const IconComponent = alert.icon
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 border-l-4 rounded-r-lg glassmorphism ${getAlertLevelStyle(alert.level)}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <IconComponent
                            className={`h-5 w-5 ${
                              alert.level === "critical"
                                ? "text-red-500"
                                : alert.level === "warning"
                                  ? "text-amber-500"
                                  : "text-blue-500"
                            }`}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{alert.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getAlertTypeColor(alert.type)}>
                                {alert.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">{alert.message}</div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{alert.time}</span>
                            <span>{alert.location}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

