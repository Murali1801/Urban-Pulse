"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Loader2, Mail, UserCircle, MapPin, Building2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth, db } from "@/lib/firebase"
import { updateProfile, updateEmail } from "firebase/auth"
import { useAuth } from "@/contexts/AuthContext"
import { doc, getDoc, setDoc } from "firebase/firestore"

interface UserLocation {
  city: string
  state: string
  country: string
  postalCode: string
  coordinates?: {
    lat: number
    lng: number
  } | null
  updatedAt?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState<UserLocation>({
    city: "",
    state: "",
    country: "",
    postalCode: "",
    coordinates: null
  })
  const [mapUrl, setMapUrl] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log("No user found, redirecting to login")
        router.push("/login")
        return
      }

      console.log("Current user:", user.uid) // Debug log

      try {
        setDisplayName(user.displayName || "")
        setEmail(user.email || "")
        
        const userRef = doc(db, "users", user.uid)
        console.log("Attempting to fetch user document for:", user.uid)

        try {
          const userDoc = await getDoc(userRef)
          console.log("Document exists:", userDoc.exists())

          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log("Retrieved user data:", userData)

            if (userData.location) {
              const locationData: UserLocation = {
                city: userData.location.city || "",
                state: userData.location.state || "",
                country: userData.location.country || "",
                postalCode: userData.location.postalCode || "",
                coordinates: userData.location.coordinates || null,
                updatedAt: userData.location.updatedAt
              }
              setLocation(locationData)
              updateMapPreview(locationData)
            }
          } else {
            console.log("Creating new user document")
            const initialData = {
              displayName: user.displayName || "",
              email: user.email || "",
              location: {
                city: "",
                state: "",
                country: "",
                postalCode: "",
                coordinates: null,
                updatedAt: new Date().toISOString()
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }

            try {
              console.log("Setting initial user data:", initialData)
              await setDoc(userRef, initialData)
              console.log("User document created successfully")
              setLocation(initialData.location)
            } catch (error: any) {
              console.error("Error creating user document:", error)
              console.error("Error code:", error.code)
              console.error("Error message:", error.message)
              
              if (error.code === 'permission-denied') {
                console.error("Permission denied while creating user document")
                setError("Unable to create user profile. Please try logging in again.")
                router.push("/login")
              } else {
                setError("Failed to create user profile. Please try again.")
              }
            }
          }
        } catch (error: any) {
          console.error("Error fetching user document:", error)
          console.error("Error code:", error.code)
          console.error("Error message:", error.message)
          
          if (error.code === 'permission-denied') {
            console.error("Permission denied while fetching user document")
            setError("You don't have permission to access this data. Please try logging in again.")
            router.push("/login")
          } else {
            setError("Failed to load profile data. Please try again.")
          }
        }
      } catch (error: any) {
        console.error("Error in fetchUserData:", error)
        console.error("Error code:", error.code)
        console.error("Error message:", error.message)
        setError("An unexpected error occurred. Please try again.")
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user, router])

  const updateMapPreview = (loc: UserLocation) => {
    if (loc.coordinates) {
      const { lat, lng } = loc.coordinates
      setMapUrl(`https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`)
    }
  }

  const validateLocation = (loc: UserLocation): string | null => {
    if (!loc.city.trim()) return "City is required"
    if (!loc.state.trim()) return "State/Province is required"
    if (!loc.country.trim()) return "Country is required"
    if (!loc.postalCode.trim()) return "Postal code is required"
    return null
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!user) {
        router.push("/login")
        return
      }

      const locationError = validateLocation(location)
      if (locationError) {
        throw new Error(locationError)
      }

      // Update display name
      if (displayName !== user.displayName) {
        try {
          await updateProfile(user, {
            displayName: displayName
          })
        } catch (error: any) {
          console.error("Error updating display name:", error)
          throw new Error("Failed to update display name")
        }
      }

      // Update email if changed
      if (email !== user.email) {
        try {
          await updateEmail(user, email)
        } catch (error: any) {
          console.error("Error updating email:", error)
          throw new Error("Failed to update email")
        }
      }

      // Update user data in Firestore
      const userRef = doc(db, "users", user.uid)
      const userData = {
        displayName,
        email,
        location: {
          city: location.city.trim(),
          state: location.state.trim(),
          country: location.country.trim(),
          postalCode: location.postalCode.trim(),
          coordinates: location.coordinates || null,
          updatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      }

      try {
        await setDoc(userRef, userData, { merge: true })
        updateMapPreview(location)
        setSuccess("Profile updated successfully")
      } catch (error: any) {
        console.error("Error updating Firestore:", error)
        console.error("Error code:", error.code) // Debug log
        console.error("Error message:", error.message) // Debug log
        
        if (error.code === 'permission-denied') {
          throw new Error("You don't have permission to update this data. Please try logging in again.")
        } else {
          throw new Error("Failed to update profile data")
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
      if (error.message.includes("permission") || error.message.includes("login")) {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            // Reverse geocode to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            
            const address = data.address
            const newLocation = {
              city: address.city || address.town || address.village || "",
              state: address.state || "",
              country: address.country || "",
              postalCode: address.postcode || "",
              coordinates: {
                lat: latitude,
                lng: longitude
              }
            }

            // Update Firestore with new location
            const userRef = doc(db, "users", user.uid)
            try {
              await setDoc(userRef, {
                location: {
                  ...newLocation,
                  updatedAt: new Date().toISOString()
                }
              }, { merge: true })

              setLocation(newLocation)
              updateMapPreview(newLocation)
            } catch (error: any) {
              console.error("Error updating location in Firestore:", error)
              if (error.code === 'permission-denied') {
                setError("You don't have permission to update location. Please try logging in again.")
                router.push("/login")
              } else {
                setError("Failed to update location data")
              }
            }
          } catch (error: any) {
            console.error("Error getting location details:", error)
            setError("Failed to get location details")
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Failed to get your location")
        }
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-dark-bg bg-city-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-transparent to-dark-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-transparent to-dark-bg" />
      </div>

      <div className="container relative z-10 flex flex-1 flex-col items-center justify-center py-12">
        <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-8">
          <div className="flex flex-col items-center space-y-2 text-center">
            <motion.div
              className="relative w-24 h-24 mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-orange blur-sm" />
              <div className="absolute inset-1 rounded-full bg-darker-bg" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-r from-neon-blue to-neon-orange opacity-80 flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          <div className="w-full">
            <motion.div
              className="glassmorphism rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-muted">
                  <div className="flex items-center justify-between">
                    <Label>Location Information</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetCurrentLocation}
                      className="text-xs"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Use Current Location
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Your city"
                      value={location.city}
                      onChange={(e) => setLocation({ ...location, city: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Your state or province"
                      value={location.state}
                      onChange={(e) => setLocation({ ...location, state: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      type="text"
                      placeholder="Your country"
                      value={location.country}
                      onChange={(e) => setLocation({ ...location, country: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="Your postal code"
                      value={location.postalCode}
                      onChange={(e) => setLocation({ ...location, postalCode: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>

                  {mapUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <User className="mr-2 h-4 w-4" />
                  )}
                  Update Profile
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 