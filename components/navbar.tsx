"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Home, User, Menu, X, Car, Wind, Droplets, Zap, Bot, AlertCircle, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

const navLinks = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Traffic", href: "/traffic", icon: Car },
  { name: "Air Quality", href: "/air-quality", icon: Wind },
  { name: "Water Levels", href: "/water-levels", icon: Droplets },
  { name: "AI Alerts", href: "/ai-alerts", icon: AlertCircle },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
]

export function Navbar() {
  const router = useRouter()
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glassmorphism py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <motion.div
            className="relative w-8 h-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-orange blur-sm" />
            <div className="absolute inset-0.5 rounded-full bg-darker-bg" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-orange opacity-80" />
          </motion.div>
          <span className="text-2xl font-bold tracking-tight text-gradient">UrbanPulse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-muted/50 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  {link.name}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="rounded-full">
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="rounded-full">
                <User className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            size="icon"
            variant="outline"
            className="md:hidden rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-[1.2rem] w-[1.2rem]" /> : <Menu className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-0 top-[60px] z-50 glassmorphism border-t border-[#ffffff10] pt-2 pb-4 md:hidden"
        >
          <nav className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-muted/50 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </span>
                </Link>
              )
            })}
            <div className="border-t border-[#ffffff10] my-2" />
            <Link
              href="/profile"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-muted/50 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </span>
            </Link>
            <button
              onClick={() => {
                handleLogout()
                setIsMobileMenuOpen(false)
              }}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:text-red-400 hover:bg-muted/50 transition text-left"
            >
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Log out
              </span>
            </button>
          </nav>
        </motion.div>
      )}
    </header>
  )
}

