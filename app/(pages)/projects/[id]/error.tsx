'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to console for debugging
    console.error('Project page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-red-400">Something went wrong!</h2>
        
        <div className="bg-gray-900 rounded p-4">
          <p className="text-sm text-gray-300 mb-2">Error details:</p>
          <pre className="text-xs text-red-300 overflow-auto max-h-40">
            {error.message || 'Unknown error'}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Try again
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Go Home
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Check console (F12) for more details
        </p>
      </div>
    </div>
  )
}

