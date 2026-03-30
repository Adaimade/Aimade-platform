import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import type { Agent } from '@/types/agent'

const STATUS_STYLE: Record<string, string> = {
  draft:    'bg-gray-800 text-gray-400',
  deployed: 'bg-green-900 text-green-300',
  error:    'bg-red-900 text-red-300',
  stopped:  'bg-yellow-900 text-yellow-300',
}

export default function AgentsPage() {
  const api = useApi()
  const queryClient = useQueryClient()

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api<Agent[]>('/agents'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/agents/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete agent "${name}"? This cannot be undone.`)) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Link to="/dashboard/agents/new"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm font-semibold transition-colors">
          + New Agent
        </Link>
      </div>

      {isLoading && <p className="text-gray-400 text-sm">Loading...</p>}

      {!isLoading && agents.length === 0 && (
        <div className="p-12 bg-gray-900 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400">No agents yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {agents.map(agent => (
          <div key={agent.id}
            className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <p className="font-semibold">{agent.name}</p>
              <p className="text-sm text-gray-400">{agent.skills.join(', ')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[agent.status]}`}>
                {agent.status}
              </span>
              <Link to={`/dashboard/agents/${agent.id}/deploy`}
                className="text-sm text-brand-500 hover:underline">
                Deploy
              </Link>
              <button
                onClick={() => handleDelete(agent.id, agent.name)}
                disabled={deleteMutation.isPending}
                className="text-sm text-red-400 hover:text-red-300 hover:underline disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
