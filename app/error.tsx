'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-8">{error.message}</p>
        <Button
          onClick={reset}
          className="bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90"
        >
          Try again
        </Button>
      </div>
    </div>
  )
} 