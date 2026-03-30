import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

import HomePage from './pages/Home'
import DashboardPage from './pages/Dashboard'
import AgentsPage from './pages/Agents'
import AgentNewPage from './pages/AgentNew'
import AgentDeployPage from './pages/AgentDeploy'
import CloudAccountsPage from './pages/CloudAccounts'
import DashboardLayout from './components/layout/DashboardLayout'

// Guard: redirect to sign-in if not logged in
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!isSignedIn) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />

        {/* Protected — wrapped in dashboard shell */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="agents/new" element={<AgentNewPage />} />
          <Route path="agents/:agentId/deploy" element={<AgentDeployPage />} />
          <Route path="cloud-accounts" element={<CloudAccountsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
