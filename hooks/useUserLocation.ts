import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UserLocation {
  city: string
  state: string
  country: string
  postalCode: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export function useUserLocation() {
  const { user } = useAuth()
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocation = async () => {
      if (!user) {
        setLocation(null)
        setLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.location) {
            setLocation(userData.location)
          }
        }
      } catch (err) {
        setError('Failed to fetch location data')
        console.error('Error fetching location:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLocation()
  }, [user])

  return { location, loading, error }
} 