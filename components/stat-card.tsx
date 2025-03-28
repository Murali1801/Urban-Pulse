"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  children?: React.ReactNode
}

export function StatCard({ title, value, icon, trend, className, children }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn("glassmorphism rounded-xl overflow-hidden h-full", className)}
    >
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/50">{icon}</div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {trend && (
            <div
              className={cn(
                "flex items-center ml-auto text-xs px-2 py-0.5 rounded-full",
                trend.isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {children}
      </div>
    </motion.div>
  )
}

