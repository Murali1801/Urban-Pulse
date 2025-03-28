"use client"

import { motion } from "framer-motion"
import { AlertCircle, Info } from "lucide-react"

type AlertLevel = "critical" | "warning" | "info"

interface AlertItemProps {
  title: string
  message: string
  time: string
  level: AlertLevel
}

export function AlertItem({ title, message, time, level }: AlertItemProps) {
  // Color based on alert level
  const alertColor = {
    critical: "border-r-red-500 bg-red-500/10",
    warning: "border-r-amber-500 bg-amber-500/10",
    info: "border-r-blue-500 bg-blue-500/10",
  }

  const alertIcon = {
    critical: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 border-r-4 rounded-l-lg mb-3 glassmorphism ${alertColor[level]}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{alertIcon[level]}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 text-sm text-muted-foreground">{message}</div>
          <p className="mt-1 text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </motion.div>
  )
}

