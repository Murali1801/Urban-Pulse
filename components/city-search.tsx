"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface CitySearchProps {
  onCitySearch: (city: string) => void;
}

interface CitySuggestion {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
}

export function CitySearch({ onCitySearch }: CitySearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch city suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&featuretype=city`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch city suggestions")
        }
        const data = await response.json()
        
        setSuggestions(data.map((place: any) => ({
          name: place.name,
          display_name: place.display_name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon)
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch suggestions")
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onCitySearch(query.trim())
      setSuggestions([])
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (cityName: string) => {
    setQuery(cityName)
    onCitySearch(cityName)
    setSuggestions([])
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-xl mx-auto relative"
      ref={searchRef}
    >
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="Search for a city..."
          className="pr-12 h-12 pl-5 rounded-full border-muted/30 bg-muted/20 backdrop-blur-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-1 top-1 rounded-full h-10 w-10 bg-gradient-to-br from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </form>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute w-full mt-2 bg-dark-bg/95 backdrop-blur-sm rounded-xl border border-muted/30 shadow-lg z-50"
          >
            <div className="p-1.5 space-y-0.5 max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              {suggestions.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(city.name)}
                  className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{city.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{city.display_name}</div>
                    </div>
                  </div>
                  <Badge className="bg-neon-blue/20 text-neon-blue">
                    {city.lat.toFixed(2)}, {city.lon.toFixed(2)}
                  </Badge>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute w-full mt-2 p-2 bg-red-500/10 text-red-400 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  )
}

