import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import type { Agent } from '@/types/agent'
import type { CloudAccount } from '@/types/cloud'
import type { Deployment } from '@/types/deployment'

const STATUS_STYLE: Record<string, string> = {
  queued:    'bg-gray-800 text-gray-400',
  building:  'bg-yellow-900 text-yellow-300',
  deploying: 'bg-blue-900 text-blue-300',
  live:      'bg-green-900 text-green-300',
  failed:    'bg-red-900 text-red-400',
  stopped:   'bg-gray-800 text-gray-400',
}

const ENGINE_STYLE: Record<string, string> = {
  standard: 'bg-indigo-900 text-indigo-300',
  hydrabot: 'bg-purple-900 text-purple-300',
  openclaw: 'bg-orange-900 text-orange-300',
}

const ENGINE_LABEL: Record<string, string> = {
  standard: 'Discord',
  hydrabot: 'Telegram',
  openclaw: 'OpenClaw',
}

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
    queryFn: () => api<Deployment[]>('/deployments'),
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some(
        d => d.status === 'queued' || d.status === 'building' || d.status === 'deploying'
      )
      return hasPending ? 4000 : false
    },
  })

  const live    = deployments.filter(d => d.status === 'live').length
  const pending = deployments.filter(
    d => d.status === 'queued' || d.status === 'building' || d.status === 'deploying'
  ).length
  const recent  = [...deployments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))

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
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Agents',   value: agents.length },
          { label: 'Live Bots',      value: live,    accent: live > 0    },
          { label: 'Deploying',      value: pending, accent: pending > 0 },
          { label: 'Cloud Accounts', value: cloudAccounts.length },
        ].map(s => (
          <div key={s.label} className={`p-5 bg-gray-900 rounded-xl border transition-colors ${
            s.accent ? 'border-brand-500/50' : 'border-gray-800'
          }`}>
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.accent ? 'text-brand-400' : ''}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Deployments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Recent Deployments
          </h2>
          {pending > 0 && (
            <span className="text-xs text-yellow-400 animate-pulse">
              {pending} in progress...
            </span>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="p-8 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-gray-500 text-sm">No deployments yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(dep => {
              const agent = agentMap[dep.agent_id]
              const isPending = dep.status === 'building' || dep.status === 'deploying'
              return (
                <div key={dep.id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">
                        {agent?.name ?? 'Unknown Agent'}
                      </p>
                      {agent && (
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${ENGINE_STYLE[agent.bot_engine]}`}>
                          {ENGINE_LABEL[agent.bot_engine]}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 shrink-0 capitalize">{dep.provider}</span>
                    </div>
                    {dep.external_url && (
                      <a href={dep.external_url} target="_blank" rel="noreferrer"
                        className="text-xs text-brand-400 hover:underline truncate block mt-0.5">
                        {dep.external_url} ↗
                      </a>
                    )}
                    {dep.error_message && (
                      <p className="text-xs text-red-400 mt-0.5 truncate">{dep.error_message}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ml-4 shrink-0 ${STATUS_STYLE[dep.status]}`}>
                    {isPending
                      ? <span className="animate-pulse">{dep.status}</span>
                      : dep.status
                    }
                  </span>
                </div>
              )
            })}
          </div>
        )}
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
