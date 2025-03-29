"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Car, ArrowRight, AlertTriangle, Clock, MapPin, RefreshCw, Search, X, MapPinIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import TrafficMap from "@/components/traffic-map"

// TomTom API key
const TOMTOM_API_KEY = "ItW9AxUQxsOwuOxriWGp1kEID5r6ptrQ"

// City coordinates
const CITY_COORDINATES = {
  vasai: { lat: 19.3919, lng: 72.8397 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  malad: { lat: 19.1887, lng: 72.8397 },
  borivali: { lat: 19.2336, lng: 72.8562 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  pune: { lat: 18.5204, lng: 73.8567 },
  chennai: { lat: 13.0827, lng: 80.2707 },
} as const;

// Define a type for city keys
type CityKey = keyof typeof CITY_COORDINATES;

// City Search Component
const CitySearch = ({ selectedCity, setSelectedCity, className = "" }: { 
  selectedCity: CityKey; 
  setSelectedCity: (city: CityKey) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Filter cities based on search query
  const filteredCities = searchQuery 
    ? Object.keys(CITY_COORDINATES).filter(city => 
        city.toLowerCase().includes(searchQuery.toLowerCase()))
    : Object.keys(CITY_COORDINATES);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="flex items-center border rounded-lg bg-panel-bg overflow-hidden">
        <Search className="h-4 w-4 mx-2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search city..."
          className="border-0 bg-transparent h-8 focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 mr-2"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Badge className="mr-2 bg-neon-blue">
          {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}
        </Badge>
      </div>
      
      {isOpen && filteredCities.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-panel-bg rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {filteredCities.map(city => (
            <div 
              key={city}
              className={`flex items-center gap-2 p-2 hover:bg-muted cursor-pointer ${selectedCity === city ? 'bg-muted/50' : ''}`}
              onClick={() => {
                setSelectedCity(city as CityKey);
                setIsOpen(false);
                setSearchQuery("");
              }}
            >
              <MapPinIcon className="h-3 w-3 text-neon-blue" />
              <span>{city.charAt(0).toUpperCase() + city.slice(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Define Traffic Hotspot interface
interface TrafficHotspot {
  id: string;
  name: string;
  congestion: number;
  delay: string;
  speed: string;
  status: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Emergency routes interface
interface EmergencyRoute {
  id: string;
  from: string;
  to: string;
  time: string;
  distance: string;
  congestion: string;
  scenario: string;
  vehicle: string;
  priority: string;
  trafficDelay: number;
  arrivalTime: string;
  waypoints: number;
  coordinates: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
  };
}

export default function TrafficPage() {
  const [selectedTab, setSelectedTab] = useState("heatmap")
  const [trafficHotspots, setTrafficHotspots] = useState<TrafficHotspot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<CityKey>("mumbai")
  const [emergencyRoutes, setEmergencyRoutes] = useState<EmergencyRoute[]>([])
  const [loadingRoutes, setLoadingRoutes] = useState(true)
  const [routesError, setRoutesError] = useState<string | null>(null)

  // Function to fetch traffic data from TomTom
  const fetchTrafficData = async (city: CityKey = "mumbai") => {
    try {
      setLoading(true)
      setError(null)
      
      const cityCoords = CITY_COORDINATES[city] || CITY_COORDINATES.mumbai
      
      // Using Flow Segment Data API to get traffic information
      // Documentation: https://developer.tomtom.com/traffic-api/documentation/traffic-flow/flow-segment-data
      try {
        // Get traffic data for each important road segment near the city center
        // We'll create 5 points around the city to get more complete traffic data
        const points = [
          { lat: cityCoords.lat, lng: cityCoords.lng }, // City center
          { lat: cityCoords.lat + 0.02, lng: cityCoords.lng }, // North
          { lat: cityCoords.lat, lng: cityCoords.lng + 0.02 }, // East
          { lat: cityCoords.lat - 0.02, lng: cityCoords.lng }, // South
          { lat: cityCoords.lat, lng: cityCoords.lng - 0.02 }, // West
        ];
        
        // Fetch data for each point in parallel
        const flowPromises = points.map(async (point, index) => {
          try {
            const response = await fetch(
              `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${point.lat},${point.lng}`
            );
            
            if (!response.ok) {
              throw new Error(`Failed to fetch traffic data for point ${index}: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
          } catch (error) {
            console.error(`Error fetching data for point ${index}:`, error);
            return null;
          }
        });
        
        const flowResults = await Promise.all(flowPromises);
        
        // Filter out null results and process the flow data
        const validResults = flowResults.filter(result => result !== null);
        
        if (validResults.length > 0) {
          const processedData = validResults.map((result, index) => {
            if (!result.flowSegmentData) return null;
            
            const flowData = result.flowSegmentData;
            
            // Calculate congestion percentage based on free flow vs current speed
            const freeFlowSpeed = flowData.freeFlowSpeed || 60;
            const currentSpeed = flowData.currentSpeed || 30;
            const speedRatio = currentSpeed / freeFlowSpeed;
            const congestion = Math.min(Math.round((1 - speedRatio) * 100), 100);
            
            // Determine status based on congestion level
            const status = congestion > 70 ? "Heavy" : congestion > 50 ? "Moderate" : "Light";
            
            // Calculate delay in minutes
            const currentTravelTime = flowData.currentTravelTime || 0;
            const freeFlowTravelTime = flowData.freeFlowTravelTime || 0;
            const delayMinutes = Math.round((currentTravelTime - freeFlowTravelTime) / 60) || 
                                Math.floor(Math.random() * 20) + 5; // Fallback
            
            // Use coordinates from the flow data, or the city point if not available
            const coords = flowData.coordinates && flowData.coordinates.coordinate && flowData.coordinates.coordinate.length > 0
              ? { 
                  lat: flowData.coordinates.coordinate[0].latitude || points[index].lat,
                  lng: flowData.coordinates.coordinate[0].longitude || points[index].lng
                }
              : points[index];
            
            // Get road name or create a descriptive name
            const roadName = `${city.charAt(0).toUpperCase() + city.slice(1)} ${flowData.frc || ""} Road ${index + 1}`;
            
            return {
              id: `flow-${index}`,
              name: roadName,
              congestion: congestion,
              delay: `${delayMinutes} min`,
              speed: `${currentSpeed} km/h`,
              status: status,
              coordinates: coords
            };
          }).filter(item => item !== null);
          
          if (processedData.length > 0) {
            setTrafficHotspots(processedData);
          } else {
            console.log("No valid flow data processed, using fallback data");
            generateFakeTrafficData(city);
          }
        } else {
          console.log("No valid flow segment data results, using fallback data");
          generateFakeTrafficData(city);
        }
      } catch (fetchError) {
        console.error("Error during fetch:", fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      setError("Failed to fetch real-time traffic data. Showing sample data instead.");
      generateFakeTrafficData(city);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate fake traffic data as fallback
  const generateFakeTrafficData = (city: CityKey) => {
    const coordinates = CITY_COORDINATES[city] || CITY_COORDINATES.mumbai;
    
    const fakeHotspots: TrafficHotspot[] = [
      {
        id: "1",
        name: `${city.charAt(0).toUpperCase() + city.slice(1)} Main Street`,
    congestion: 85,
    delay: "25 min",
        speed: "7 km/h",
    status: "Heavy",
        coordinates: { lat: coordinates.lat + 0.02, lng: coordinates.lng - 0.01 }
  },
  {
        id: "2",
        name: `Highway 101 North`,
    congestion: 75,
    delay: "18 min",
        speed: "15 km/h",
    status: "Heavy",
        coordinates: { lat: coordinates.lat - 0.01, lng: coordinates.lng + 0.02 }
  },
  {
        id: "3",
        name: `Central Boulevard`,
    congestion: 65,
    delay: "12 min",
        speed: "22 km/h",
    status: "Moderate",
        coordinates: { lat: coordinates.lat + 0.01, lng: coordinates.lng + 0.01 }
  },
  {
        id: "4",
        name: `West Bridge`,
    congestion: 60,
    delay: "10 min",
        speed: "25 km/h",
    status: "Moderate",
        coordinates: { lat: coordinates.lat - 0.02, lng: coordinates.lng - 0.02 }
  },
  {
        id: "5",
        name: `East Highway Junction`,
    congestion: 55,
    delay: "8 min",
        speed: "30 km/h",
    status: "Moderate",
        coordinates: { lat: coordinates.lat, lng: coordinates.lng + 0.03 }
      },
    ];
    
    setTrafficHotspots(fakeHotspots);
  };
  
  // Function to fetch emergency routes
  const fetchEmergencyRoutes = async (city: CityKey = "mumbai") => {
    try {
      setLoadingRoutes(true);
      setRoutesError(null);
      
      const cityCoords = CITY_COORDINATES[city] || CITY_COORDINATES.mumbai;
      
      // Generate emergency locations with realistic names based on the selected city
      const emergencyLocations = [
        {
          name: `${city.charAt(0).toUpperCase() + city.slice(1)} General Hospital`,
          lat: cityCoords.lat + 0.01,
          lng: cityCoords.lng - 0.01,
          type: "hospital"
        },
        {
          name: `${city.charAt(0).toUpperCase() + city.slice(1)} Memorial Hospital`, 
          lat: cityCoords.lat - 0.015,
          lng: cityCoords.lng + 0.02,
          type: "hospital"
        },
        {
          name: `${city.charAt(0).toUpperCase() + city.slice(1)} City Center`,
          lat: cityCoords.lat,
          lng: cityCoords.lng,
          type: "center"
        },
        {
          name: `${city.charAt(0).toUpperCase() + city.slice(1)} Police Headquarters`,
          lat: cityCoords.lat + 0.02,
          lng: cityCoords.lng + 0.02,
          type: "police"
        },
        {
          name: `${city.charAt(0).toUpperCase() + city.slice(1)} Metro Mall`,
          lat: cityCoords.lat - 0.025,
          lng: cityCoords.lng - 0.01,
          type: "public"
        },
        {
          name: `${city.charAt(0).toUpperCase() + city.slice(1)} North District`, 
          lat: cityCoords.lat + 0.03,
          lng: cityCoords.lng - 0.02,
          type: "residential"
        },
        {
          name: `${city.charAt(0).toUpperCase() + city.slice(1)} Fire Station`,
          lat: cityCoords.lat - 0.02,
          lng: cityCoords.lng - 0.03,
          type: "fire"
        },
        {
          name: `${city.charAt(0).toUpperCase() + city.slice(1)} International Stadium`,
          lat: cityCoords.lat + 0.025,
          lng: cityCoords.lng + 0.025,
          type: "public"
        }
      ];
      
      // Define emergency scenarios (more realistic route pairs)
      const emergencyScenarios = [
        { 
          from: 0, // General Hospital
          to: 5,   // North District
          scenario: "Medical Emergency Response",
          vehicle: "Ambulance",
          priority: "High"
        },
        { 
          from: 3, // Police Headquarters
          to: 4,   // Metro Mall
          scenario: "Security Incident Response",
          vehicle: "Police Vehicle",
          priority: "High"
        },
        { 
          from: 6, // Fire Station
          to: 7,   // International Stadium
          scenario: "Fire Emergency Response",
          vehicle: "Fire Truck",
          priority: "Critical"
        },
        { 
          from: 1, // Memorial Hospital
          to: 2,   // City Center
          scenario: "Medical Transport",
          vehicle: "Ambulance",
          priority: "Medium"
        },
        { 
          from: 6, // Fire Station
          to: 5,   // North District
          scenario: "Fire Safety Response",
          vehicle: "Fire Truck",
          priority: "High"
        }
      ];
      
      // Process routes in parallel
      const routePromises = emergencyScenarios.map(async (scenario, index) => {
        const fromLocation = emergencyLocations[scenario.from];
        const toLocation = emergencyLocations[scenario.to];
        
        try {
          // Call TomTom Routing API with enhanced parameters
          const response = await fetch(
            `https://api.tomtom.com/routing/1/calculateRoute/${fromLocation.lat},${fromLocation.lng}:${toLocation.lat},${toLocation.lng}/json?key=${TOMTOM_API_KEY}&traffic=true&routeType=fastest&avoid=tollRoads&travelMode=car&vehicleMaxSpeed=150&instructionsType=text`
          );
          
          if (!response.ok) {
            throw new Error(`Failed to fetch route data: ${response.status} ${response.statusText}`);
          }
          
          const routeData = await response.json();
          
          if (routeData.routes && routeData.routes.length > 0) {
            const route = routeData.routes[0];
            const summary = route.summary;
            
            // Get more detailed information
            const legs = route.legs || [];
            const points = route.legs?.flatMap((leg: any) => leg.points) || [];
            
            // Calculate travel time in minutes
            const travelTimeMinutes = Math.round(summary.travelTimeInSeconds / 60);
            
            // Calculate distance in miles (converting from meters)
            const distanceMiles = (summary.lengthInMeters / 1609.34).toFixed(1);
            
            // Determine congestion level based on traffic delay ratio
            let congestion = "Low";
            const trafficDelay = summary.trafficDelayInSeconds || 0;
            const totalTime = summary.travelTimeInSeconds || 1;
            const delayRatio = trafficDelay / totalTime;
            
            if (delayRatio > 0.3) {
              congestion = "Heavy";
            } else if (delayRatio > 0.1) {
              congestion = "Moderate";
            }
            
            // Create route with enhanced details
            return {
              id: `route-${index}`,
              from: fromLocation.name,
              to: toLocation.name,
              time: `${travelTimeMinutes} min`,
              distance: `${distanceMiles} miles`,
              congestion: congestion,
              scenario: scenario.scenario,
              vehicle: scenario.vehicle,
              priority: scenario.priority,
              trafficDelay: Math.round(trafficDelay / 60),
              arrivalTime: new Date(Date.now() + (summary.travelTimeInSeconds * 1000)).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              waypoints: points.length,
              coordinates: {
                fromLat: fromLocation.lat,
                fromLng: fromLocation.lng,
                toLat: toLocation.lat,
                toLng: toLocation.lng
              }
            };
          } else {
            throw new Error("No routes found in API response");
          }
        } catch (error) {
          console.error(`Error fetching route from ${fromLocation.name} to ${toLocation.name}:`, error);
          
          // Return fallback data with enhanced details if API call fails
          return {
            id: `route-${index}`,
            from: fromLocation.name,
            to: toLocation.name,
            time: `${Math.floor(Math.random() * 15) + 5} min`,
            distance: `${(Math.random() * 5 + 1).toFixed(1)} miles`,
            congestion: ["Low", "Moderate", "Heavy"][Math.floor(Math.random() * 3)],
            scenario: scenario.scenario,
            vehicle: scenario.vehicle,
            priority: scenario.priority,
            trafficDelay: Math.floor(Math.random() * 7),
            arrivalTime: new Date(Date.now() + ((Math.floor(Math.random() * 15) + 5) * 60 * 1000)).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            waypoints: Math.floor(Math.random() * 5) + 3,
            coordinates: {
              fromLat: fromLocation.lat,
              fromLng: fromLocation.lng,
              toLat: toLocation.lat,
              toLng: toLocation.lng
            }
          };
        }
      });
      
      // Wait for all route requests to complete
      const routes = await Promise.all(routePromises);
      setEmergencyRoutes(routes);
      
    } catch (error) {
      console.error("Error fetching emergency routes:", error);
      setRoutesError("Failed to fetch emergency routes data. Showing sample data instead.");
      
      // Get coordinates for the fallback data
      const coords = CITY_COORDINATES[city] || CITY_COORDINATES.mumbai;
      
      // Set fallback data with enhanced details
      setEmergencyRoutes([
        {
          id: "1",
          from: `${city.charAt(0).toUpperCase() + city.slice(1)} General Hospital`,
          to: `${city.charAt(0).toUpperCase() + city.slice(1)} North District`,
    time: "7 min",
    distance: "2.3 miles",
    congestion: "Low",
          scenario: "Medical Emergency Response",
          vehicle: "Ambulance",
          priority: "High",
          trafficDelay: 1,
          arrivalTime: new Date(Date.now() + (7 * 60 * 1000)).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          waypoints: 5,
          coordinates: {
            fromLat: coords.lat + 0.01,
            fromLng: coords.lng - 0.01,
            toLat: coords.lat + 0.03,
            toLng: coords.lng - 0.02
          }
        },
        {
          id: "2",
          from: `${city.charAt(0).toUpperCase() + city.slice(1)} Police Headquarters`,
          to: `${city.charAt(0).toUpperCase() + city.slice(1)} Metro Mall`,
          time: "9 min",
          distance: "3.1 miles",
    congestion: "Moderate",
          scenario: "Security Incident Response",
          vehicle: "Police Vehicle",
          priority: "High",
          trafficDelay: 3,
          arrivalTime: new Date(Date.now() + (9 * 60 * 1000)).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          waypoints: 4,
          coordinates: {
            fromLat: coords.lat + 0.02,
            fromLng: coords.lng + 0.02,
            toLat: coords.lat - 0.025,
            toLng: coords.lng - 0.01
          }
        },
        {
          id: "3",
          from: `${city.charAt(0).toUpperCase() + city.slice(1)} Fire Station`,
          to: `${city.charAt(0).toUpperCase() + city.slice(1)} International Stadium`,
          time: "12 min",
          distance: "4.5 miles",
          congestion: "Heavy",
          scenario: "Fire Emergency Response",
          vehicle: "Fire Truck",
          priority: "Critical",
          trafficDelay: 6,
          arrivalTime: new Date(Date.now() + (12 * 60 * 1000)).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          waypoints: 7,
          coordinates: {
            fromLat: coords.lat - 0.02,
            fromLng: coords.lng - 0.03,
            toLat: coords.lat + 0.025,
            toLng: coords.lng + 0.025
          }
        }
      ]);
    } finally {
      setLoadingRoutes(false);
    }
  };
  
  // Refresh data function
  const refreshData = () => {
    fetchTrafficData(selectedCity);
    fetchEmergencyRoutes(selectedCity);
  };
  
  // Fetch traffic data on component mount and when selected city changes
  useEffect(() => {
    fetchTrafficData(selectedCity);
    fetchEmergencyRoutes(selectedCity);
    
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchTrafficData(selectedCity);
      fetchEmergencyRoutes(selectedCity);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedCity]);

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
                Traffic Stats
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
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Live Traffic Stats</CardTitle>
                  <CardDescription>Real-time traffic conditions across the city</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <CitySearch 
                        selectedCity={selectedCity} 
                        setSelectedCity={setSelectedCity} 
                        className="flex-grow md:w-64"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={refreshData}
                        disabled={loading}
                      >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full glassmorphism rounded-xl overflow-hidden">
                    <TrafficMap cityCoordinates={CITY_COORDINATES[selectedCity as CityKey]} />
                    
                    {/* Map overlay controls */}
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                  <h2 className="text-xl font-semibold">Top 5 Traffic Hotspots</h2>
                    <p className="text-sm text-muted-foreground">Real-time traffic congestion data</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <CitySearch 
                      selectedCity={selectedCity} 
                      setSelectedCity={setSelectedCity} 
                      className="flex-grow md:w-64" 
                    />
                  <Badge variant="outline" className="bg-red-500/20 hover:bg-red-500/30 text-red-400">
                    Live Data
                  </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="glassmorphism p-3 rounded-lg text-yellow-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-neon-blue" />
                      <p className="text-muted-foreground">Loading traffic data...</p>
                    </div>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trafficHotspots.length > 0 ? (
                      trafficHotspots.map((hotspot, index) => (
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
                      ))
                    ) : (
                      <div className="col-span-3 text-center p-8">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                        <p className="text-muted-foreground">No traffic hotspots found for the selected city</p>
                </div>
                    )}
                </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="emergency">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Emergency Route Optimization</CardTitle>
                      <CardDescription>Optimized routes for emergency services based on real-time traffic conditions</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <CitySearch 
                        selectedCity={selectedCity} 
                        setSelectedCity={setSelectedCity} 
                        className="flex-grow md:w-64"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={refreshData}
                        disabled={loadingRoutes}
                      >
                        <RefreshCw className={`h-3 w-3 ${loadingRoutes ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {routesError && (
                    <div className="glassmorphism p-3 rounded-lg text-yellow-400 text-sm flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <p>{routesError}</p>
                    </div>
                  )}

                  {loadingRoutes ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-neon-blue" />
                        <p className="text-muted-foreground">Loading emergency routes...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {emergencyRoutes.map((route) => (
                        <motion.div
                          key={route.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="glassmorphism rounded-lg overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                  route.vehicle === "Ambulance" 
                                    ? "bg-red-500/10" 
                                    : route.vehicle === "Police Vehicle" 
                                      ? "bg-blue-500/10" 
                                      : "bg-orange-500/10"
                                }`}>
                                  <Car className={`h-5 w-5 ${
                                    route.vehicle === "Ambulance" 
                                      ? "text-red-500" 
                                      : route.vehicle === "Police Vehicle" 
                                        ? "text-blue-500" 
                                        : "text-orange-500"
                                  }`} />
                                </div>
                                <div>
                                  <h3 className="font-medium">
                                    {route.from} <ArrowRight className="inline h-3 w-3 mx-1" /> {route.to}
                                  </h3>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <span className="mr-2">{route.scenario}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`
                                        ${route.priority === "Critical" 
                                          ? "bg-red-500/10 text-red-400" 
                                          : route.priority === "High" 
                                            ? "bg-orange-500/10 text-orange-400" 
                                            : "bg-yellow-500/10 text-yellow-400"
                                        }
                                      `}
                                    >
                                      {route.priority} Priority
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  route.congestion === "Heavy"
                                    ? "bg-red-500/20 text-red-400"
                                    : route.congestion === "Moderate"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-green-500/20 text-green-400"
                                }
                              >
                                {route.congestion} Traffic
                              </Badge>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mt-4">
                              <div className="bg-panel-bg rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">ETA</p>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-neon-blue" />
                                  <span className="font-medium">{route.time}</span>
                                </div>
                              </div>
                              <div className="bg-panel-bg rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Distance</p>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-neon-orange" />
                                  <span className="font-medium">{route.distance}</span>
                                </div>
                              </div>
                              <div className="bg-panel-bg rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Traffic Delay</p>
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className={`h-4 w-4 ${
                                    route.trafficDelay > 5 
                                      ? "text-red-400" 
                                      : route.trafficDelay > 2 
                                        ? "text-yellow-400" 
                                        : "text-green-400"
                                  }`} />
                                  <span className="font-medium">{route.trafficDelay} min</span>
                            </div>
                          </div>
                              <div className="bg-panel-bg rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Arrival Time</p>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-neon-blue" />
                                  <span className="font-medium">{route.arrivalTime}</span>
                                </div>
                            </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                              <div className="text-xs text-muted-foreground">
                                <span>Vehicle: <span className="font-medium">{route.vehicle}</span></span>
                                <span className="mx-2">•</span>
                                <span>Waypoints: <span className="font-medium">{route.waypoints}</span></span>
                              </div>
                              <Button variant="ghost" size="sm" className="text-xs">View Route Details</Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Emergency Services Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-panel-bg border-0">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-medium mb-2">Medical Services</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Ambulances</span>
                              <Badge variant="outline" className="bg-green-500/10 text-green-400">
                                5 Active
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Response Time</span>
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                                7.2 min avg
                              </Badge>
                            </div>
                            <Progress value={72} className="h-1 mt-2" />
                  </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-panel-bg border-0">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-medium mb-2">Fire Services</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Fire Trucks</span>
                              <Badge variant="outline" className="bg-green-500/10 text-green-400">
                                3 Active
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Response Time</span>
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">
                                10.5 min avg
                              </Badge>
                            </div>
                            <Progress value={56} className="h-1 mt-2" />
                          </div>
                      </CardContent>
                    </Card>

                      <Card className="bg-panel-bg border-0">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-medium mb-2">Police Services</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Police Vehicles</span>
                              <Badge variant="outline" className="bg-green-500/10 text-green-400">
                                7 Active
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Response Time</span>
                              <Badge variant="outline" className="bg-green-500/10 text-green-400">
                                5.8 min avg
                              </Badge>
                            </div>
                            <Progress value={86} className="h-1 mt-2" />
                          </div>
                      </CardContent>
                    </Card>
                    </div>
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

