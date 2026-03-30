import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import type { Agent } from '@/types/agent'
import type { CloudAccount } from '@/types/cloud'

export default function DashboardPage() {
  const api = useApi()
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api<Agent[]>('/agents'),
  })
  const { data: cloudAccounts = [] } = useQuery({
    queryKey: ['cloud-accounts'],
    queryFn: () => api<CloudAccount[]>('/cloud-accounts'),
  })
  const { data: deployments = [] } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => api<any[]>('/deployments'),
  })

  const live = deployments.filter((d: any) => d.status === 'live').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <Link to="/dashboard/agents/new"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm font-semibold transition-colors">
          + New Agent
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Agents',      value: agents.length },
          { label: 'Live Deployments',  value: live },
          { label: 'Cloud Accounts',    value: cloudAccounts.length },
        ].map(s => (
          <div key={s.label} className="p-5 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="p-12 bg-gray-900 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400 mb-4">No agents yet.</p>
          <Link to="/dashboard/agents/new"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm font-semibold transition-colors">
            Create your first agent
          </Link>
        </div>
      )}
    </div>
  )
}
