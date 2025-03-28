"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CitySearch() {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log(`Searching for: ${query}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-xl mx-auto"
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
          <Search className="h-5 w-5" />
        </Button>
      </form>
    </motion.div>
  )
}

