import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import { DeploymentStatusPoller } from '@/components/DeploymentStatusPoller'
import type { CloudAccount } from '@/types/cloud'
import type { Agent } from '@/types/agent'

const PROVIDERS = [
  { id: 'railway', label: 'Railway', desc: 'Simple container hosting, easy setup'  },
  { id: 'zeabur',  label: 'Zeabur',  desc: 'Simple container hosting, global CDN'  },
  { id: 'aws',     label: 'AWS',     desc: 'Lambda + ECR, pay-per-use'             },
]

export default function AgentDeployPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const api = useApi()

  const [step, setStep]             = useState<1 | 2>(1)
  const [provider, setProvider]     = useState<'zeabur' | 'aws' | 'railway' | null>(null)
  const [cloudAccountId, setCloudAccountId] = useState('')
  const [botToken, setBotToken]     = useState('')
  const [telegramUserIds, setTelegramUserIds] = useState('')
  const [deploymentId, setDeploymentId] = useState<string | null>(null)

  const { data: agent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => api<Agent>(`/agents/${agentId}`),
    enabled: !!agentId,
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['cloud-accounts'],
    queryFn: () => api<CloudAccount[]>('/cloud-accounts'),
  })

  const filteredAccounts = accounts.filter(a => a.provider === provider)
  const botEngine = agent?.bot_engine ?? 'standard'
  const isHydraBot = botEngine === 'hydrabot'

  const deploy = useMutation({
    mutationFn: () => api<{ deployment_id: string }>('/deployments', {
      method: 'POST',
      body: JSON.stringify({
        agent_id:         agentId,
        cloud_account_id: cloudAccountId,
        bot_token:        botToken,
        extra_config: isHydraBot
          ? { telegram_user_ids: telegramUserIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) }
          : undefined,
      }),
    }),
    onSuccess: (data) => setDeploymentId(data.deployment_id),
  })

  const tokenLabel = isHydraBot ? 'Telegram Bot Token' : 'Discord Bot Token'
  const tokenHint  = isHydraBot
    ? 'From @BotFather on Telegram'
    : 'discord.com/developers/applications → Bot → Token'
  const tokenPlaceholder = isHydraBot ? 'Paste your Telegram bot token...' : 'Paste your bot token...'

  // After deploy is queued, show live status tracker
  if (deploymentId) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">Deploying Agent</h1>
        {agent && (
          <p className="text-sm text-gray-400">
            <span className="text-white font-medium">{agent.name}</span>
            {' · '}{botEngine} · {provider}
          </p>
        )}
        <DeploymentStatusPoller deploymentId={deploymentId} />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Deploy Agent</h1>

      {agent && (
        <p className="text-sm text-gray-400">
          Engine: <span className="text-white font-medium capitalize">{botEngine}</span>
          {' · '}Platform: <span className="text-white font-medium">
            {isHydraBot ? 'Telegram' : botEngine === 'openclaw' ? 'Discord + more' : 'Discord'}
          </span>
        </p>
      )}

      {/* Step 1 — Pick provider + account */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Step 1 of 2 — Choose deployment target</p>
          <div className="space-y-2">
            {PROVIDERS.map(p => (
              <button key={p.id} type="button" onClick={() => { setProvider(p.id as any); setCloudAccountId('') }}
                className={`w-full p-4 rounded-xl border text-left transition-colors ${
                  provider === p.id ? 'border-brand-500 bg-brand-500/10' : 'border-gray-700 hover:border-gray-500'
                }`}>
                <p className="font-semibold">{p.label}</p>
                <p className="text-sm text-gray-400">{p.desc}</p>
              </button>
            ))}
          </div>

          {provider && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Cloud Account</label>
              {filteredAccounts.length === 0 ? (
                <p className="text-sm text-yellow-400">
                  No {provider} accounts connected.{' '}
                  <a href="/dashboard/cloud-accounts" className="underline">Connect one first →</a>
                </p>
              ) : (
                <select value={cloudAccountId} onChange={e => setCloudAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500">
                  <option value="">Select account...</option>
                  {filteredAccounts.map(a => <option key={a.id} value={a.id}>{a.display_name}</option>)}
                </select>
              )}
            </div>
          )}

          <button disabled={!provider || !cloudAccountId} onClick={() => setStep(2)}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 rounded-lg font-semibold transition-colors">
            Next
          </button>
        </div>
      )}

      {/* Step 2 — Bot Token */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Step 2 of 2 — Bot Token</p>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">{tokenLabel}</label>
            <input type="password" value={botToken}
              onChange={e => setBotToken(e.target.value)}
              placeholder={tokenPlaceholder}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
            <p className="text-xs text-gray-500">{tokenHint}</p>
          </div>

          {isHydraBot && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Your Telegram User ID(s)</label>
              <input type="text" value={telegramUserIds}
                onChange={e => setTelegramUserIds(e.target.value)}
                placeholder="123456789 (or comma-separated for multiple)"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
              <p className="text-xs text-gray-500">
                Only these users can control the bot. Get your ID from @userinfobot on Telegram.
              </p>
            </div>
          )}

          {deploy.isError && (
            <p className="text-sm text-red-400">{(deploy.error as Error).message}</p>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-700 hover:border-gray-500 rounded-lg font-semibold transition-colors">
              Back
            </button>
            <button
              disabled={!botToken || (isHydraBot && !telegramUserIds) || deploy.isPending}
              onClick={() => deploy.mutate()}
              className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 rounded-lg font-semibold transition-colors">
              {deploy.isPending ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
