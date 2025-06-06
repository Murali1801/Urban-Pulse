'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90">
            Go back home
          </Button>
        </Link>
      </div>
    </div>
  )
} 