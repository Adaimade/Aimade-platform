import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import type { DeploymentStatus } from '@/types/deployment'

const STEPS: { key: DeploymentStatus; label: string }[] = [
  { key: 'queued',    label: 'Queued'     },
  { key: 'building',  label: 'Building'   },
  { key: 'deploying', label: 'Deploying'  },
  { key: 'live',      label: 'Live'       },
]

const STEP_INDEX: Record<string, number> = {
  queued: 0, building: 1, deploying: 2, live: 3, failed: 3,
}

type Props = {
  deploymentId: string
  onComplete?: (status: 'live' | 'failed') => void
}

export function DeploymentStatusPoller({ deploymentId, onComplete }: Props) {
  const api = useApi()

  const { data } = useQuery({
    queryKey: ['deployment-status', deploymentId],
    queryFn: () => api<{
      deployment_id: string
      status: DeploymentStatus
      external_url?: string
      error_message?: string
    }>(`/deployments/${deploymentId}/status`),
    refetchInterval: (query) => {
      const s = query.state.data?.status
      return s === 'live' || s === 'failed' ? false : 3000
    },
    enabled: !!deploymentId,
  })

  const status = data?.status ?? 'queued'
  const isFailed = status === 'failed'
  const isLive   = status === 'live'
  const isDone   = isLive || isFailed
  const stepIdx  = STEP_INDEX[status] ?? 0

  useEffect(() => {
    if (isLive)   onComplete?.('live')
    if (isFailed) onComplete?.('failed')
  }, [isLive, isFailed])

  return (
    <div className="p-5 bg-gray-900 rounded-xl border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-300">Deployment Status</p>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isLive   ? 'bg-green-900 text-green-300' :
          isFailed ? 'bg-red-900 text-red-400'     :
                     'bg-yellow-900 text-yellow-300'
        }`}>
          {status}
        </span>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const done    = i < stepIdx || (i === stepIdx && isLive)
          const active  = i === stepIdx && !isDone
          const failed  = i === stepIdx && isFailed

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  failed ? 'bg-red-500 text-white' :
                  done   ? 'bg-green-500 text-white' :
                  active ? 'bg-brand-500 text-white animate-pulse' :
                           'bg-gray-700 text-gray-500'
                }`}>
                  {failed ? '✕' : done ? '✓' : i + 1}
                </div>
                <span className={`text-xs truncate ${
                  active || done ? 'text-gray-200' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-4 transition-colors ${
                  i < stepIdx ? 'bg-green-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Result */}
      {isLive && (
        <div className="space-y-2">
          <p className="text-sm text-green-400 font-medium">✅ Bot is live!</p>
          {data?.external_url && (
            <a href={data.external_url} target="_blank" rel="noreferrer"
              className="text-xs text-brand-400 hover:underline break-all">
              {data.external_url} ↗
            </a>
          )}
        </div>
      )}

      {isFailed && (
        <p className="text-sm text-red-400">
          ✕ Failed: {data?.error_message ?? 'Unknown error'}
        </p>
      )}

      {!isDone && (
        <p className="text-xs text-gray-500 animate-pulse">
          Checking status every 3 seconds...
        </p>
      )}
    </div>
  )
}
