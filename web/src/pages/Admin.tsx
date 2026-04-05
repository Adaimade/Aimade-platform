import { useQuery } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { useApi } from '@/lib/api'

const ADMIN_EMAILS = ['jhcobo001@gmail.com']

const STATUS_STYLE: Record<string, string> = {
  live:      'bg-green-900 text-green-300',
  failed:    'bg-red-900 text-red-400',
  queued:    'bg-gray-800 text-gray-400',
  building:  'bg-yellow-900 text-yellow-300',
  deploying: 'bg-blue-900 text-blue-300',
  stopped:   'bg-gray-800 text-gray-400',
}

const ENGINE_STYLE: Record<string, string> = {
  standard: 'bg-indigo-900 text-indigo-300',
  hydrabot: 'bg-purple-900 text-purple-300',
  openclaw: 'bg-orange-900 text-orange-300',
}

const PRESET_LABEL: Record<string, string> = {
  general:       '🤖 助理',
  stock_analyst: '📊 股市',
  code_expert:   '💻 代碼',
  daily_butler:  '🗂️ 管家',
  task_manager:  '📋 任務',
}

type Stats = {
  users: number
  agents: number
  deployments: number
  live_deployments: number
  failed_deployments: number
  cloud_accounts: number
  engines: Record<string, number>
  presets: Record<string, number>
  providers: Record<string, number>
}

type UserRow = {
  id: string
  email: string
  created_at: string
  agents: number
  deployments: number
  live_bots: number
}

type DeployRow = {
  id: string
  agent_name: string
  bot_engine: string
  soul_preset: string
  user_email: string
  provider: string
  status: string
  external_url?: string
  error_message?: string
  created_at: string
}

export default function AdminPage() {
  const { user } = useUser()
  const api = useApi()

  const isAdmin = ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress ?? '')

  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => api('/admin/stats'),
    enabled: isAdmin,
    refetchInterval: 30000,
  })

  const { data: users = [] } = useQuery<UserRow[]>({
    queryKey: ['admin-users'],
    queryFn: () => api('/admin/users'),
    enabled: isAdmin,
  })

  const { data: deploys = [] } = useQuery<DeployRow[]>({
    queryKey: ['admin-deployments'],
    queryFn: () => api('/admin/deployments'),
    enabled: isAdmin,
    refetchInterval: 15000,
  })

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Access denied.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <span className="text-xs text-gray-500">Auto-refreshes every 30s</span>
      </div>

      {/* Stats grid */}
      {stats && (
        <>
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: 'Users',        value: stats.users,              color: '' },
              { label: 'Agents',       value: stats.agents,             color: '' },
              { label: 'Deployments',  value: stats.deployments,        color: '' },
              { label: 'Live Bots',    value: stats.live_deployments,   color: 'text-green-400' },
              { label: 'Failed',       value: stats.failed_deployments, color: stats.failed_deployments > 0 ? 'text-red-400' : '' },
              { label: 'Cloud Accts',  value: stats.cloud_accounts,     color: '' },
            ].map(s => (
              <div key={s.label} className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Breakdown row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Engines</p>
              {Object.entries(stats.engines).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ENGINE_STYLE[k] ?? 'bg-gray-800 text-gray-400'}`}>{k}</span>
                  <span className="text-sm font-semibold">{v}</span>
                </div>
              ))}
              {Object.keys(stats.engines).length === 0 && <p className="text-xs text-gray-600">—</p>}
            </div>

            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Roles</p>
              {Object.entries(stats.presets).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">{PRESET_LABEL[k] ?? k}</span>
                  <span className="text-sm font-semibold">{v}</span>
                </div>
              ))}
              {Object.keys(stats.presets).length === 0 && <p className="text-xs text-gray-600">—</p>}
            </div>

            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cloud Providers</p>
              {Object.entries(stats.providers).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 capitalize">{k}</span>
                  <span className="text-sm font-semibold">{v}</span>
                </div>
              ))}
              {Object.keys(stats.providers).length === 0 && <p className="text-xs text-gray-600">—</p>}
            </div>
          </div>
        </>
      )}

      {/* Users table */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Users ({users.length})</p>
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900">
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Email</th>
                <th className="text-center px-4 py-2.5 text-xs text-gray-500 font-medium">Agents</th>
                <th className="text-center px-4 py-2.5 text-xs text-gray-500 font-medium">Deploys</th>
                <th className="text-center px-4 py-2.5 text-xs text-gray-500 font-medium">Live</th>
                <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={`border-b border-gray-800/50 ${i % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
                  <td className="px-4 py-2.5 text-gray-200">{u.email}</td>
                  <td className="px-4 py-2.5 text-center text-gray-400">{u.agents}</td>
                  <td className="px-4 py-2.5 text-center text-gray-400">{u.deployments}</td>
                  <td className="px-4 py-2.5 text-center">
                    {u.live_bots > 0
                      ? <span className="text-green-400 font-semibold">{u.live_bots}</span>
                      : <span className="text-gray-600">0</span>
                    }
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-600 text-xs">No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent deployments */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Deployments (last 50)</p>
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900">
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Agent</th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">User</th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Engine / Role</th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Provider</th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {deploys.map((d, i) => (
                <tr key={d.id} className={`border-b border-gray-800/50 ${i % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
                  <td className="px-4 py-2.5 font-medium text-gray-200">{d.agent_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{d.user_email ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${ENGINE_STYLE[d.bot_engine] ?? 'bg-gray-800 text-gray-400'}`}>
                        {d.bot_engine}
                      </span>
                      <span className="text-xs text-gray-500">{PRESET_LABEL[d.soul_preset] ?? d.soul_preset}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 capitalize text-xs">{d.provider}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[d.status] ?? 'bg-gray-800 text-gray-400'}`}>
                      {d.status}
                    </span>
                    {d.error_message && (
                      <p className="text-xs text-red-400 mt-0.5 truncate max-w-48">{d.error_message}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 text-xs">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {deploys.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-600 text-xs">No deployments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
