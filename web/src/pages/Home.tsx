import { SignInButton, useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()

  // Already signed in → go to dashboard
  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Deploy your AI to Discord
          <span className="text-brand-500"> in 30 seconds.</span>
        </h1>
        <p className="text-xl text-gray-400">
          Build an AI agent, connect your cloud, watch it come alive — no code required.
        </p>
        <SignInButton mode="modal">
          <button className="px-8 py-3 bg-brand-500 hover:bg-brand-600 rounded-lg font-semibold text-white transition-colors">
            Get Started
          </button>
        </SignInButton>
        <p className="text-sm text-gray-500">Zeabur · AWS · More coming soon</p>
      </div>
    </main>
  )
}
