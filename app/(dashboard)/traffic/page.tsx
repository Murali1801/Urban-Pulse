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
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Traffic Monitoring</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Traffic Map</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficMap className="rounded-lg overflow-hidden" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

