import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import type { CloudAccount, CloudProvider } from '@/types/cloud'

const FIELDS: Record<CloudProvider, { key: string; label: string; placeholder: string }[]> = {
  zeabur: [
    { key: 'api_token', label: 'API Token', placeholder: 'Zeabur personal access token' },
  ],
  railway: [
    { key: 'api_token', label: 'API Token', placeholder: 'Railway API token (railway.app/account/tokens)' },
  ],
  aws: [
    { key: 'access_key_id',     label: 'Access Key ID',     placeholder: 'AKIA...'      },
    { key: 'secret_access_key', label: 'Secret Access Key', placeholder: 'Your secret'  },
    { key: 'region',            label: 'Region',            placeholder: 'us-east-1'    },
  ],
}

export default function CloudAccountsPage() {
  const api = useApi()
  const qc = useQueryClient()
  const [provider, setProvider] = useState<CloudProvider>('zeabur')
  const [displayName, setDisplayName] = useState('')
  const [creds, setCreds] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['cloud-accounts'],
    queryFn: () => api<CloudAccount[]>('/cloud-accounts'),
  })

  const connect = useMutation({
    mutationFn: () => api<CloudAccount>('/cloud-accounts', {
      method: 'POST',
      body: JSON.stringify({ provider, display_name: displayName, credentials: creds }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cloud-accounts'] })
      setShowForm(false)
      setDisplayName('')
      setCreds({})
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cloud Accounts</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm font-semibold transition-colors">
          {showForm ? 'Cancel' : '+ Connect Cloud'}
        </button>
      </div>

      {/* Connect form */}
      {showForm && (
        <form onSubmit={e => { e.preventDefault(); connect.mutate() }}
          className="p-6 bg-gray-900 rounded-xl border border-gray-800 space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Provider</label>
              <select value={provider} onChange={e => { setProvider(e.target.value as CloudProvider); setCreds({}) }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500">
                <option value="zeabur">Zeabur</option>
                <option value="railway">Railway</option>
                <option value="aws">AWS</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Display Name</label>
              <input required value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="My Zeabur Account"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </div>

          {FIELDS[provider].map(f => (
            <div key={f.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-300">{f.label}</label>
              <input required type="password" placeholder={f.placeholder}
                value={creds[f.key] ?? ''}
                onChange={e => setCreds(c => ({ ...c, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
            </div>
          ))}

          <p className="text-xs text-gray-500">Credentials stored encrypted with AES-256.</p>
          <button type="submit" disabled={connect.isPending}
            className="w-full py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 rounded-lg font-semibold text-sm transition-colors">
            {connect.isPending ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      )}

      {/* Account list */}
      {isLoading && <p className="text-gray-400 text-sm">Loading...</p>}
      {!isLoading && accounts.length === 0 && !showForm && (
        <div className="p-12 bg-gray-900 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400">No cloud accounts connected yet.</p>
        </div>
      )}
      <div className="space-y-2">
        {accounts.map(a => (
          <div key={a.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <p className="font-semibold">{a.display_name}</p>
              <p className="text-sm text-gray-400 capitalize">{a.provider}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              a.is_valid === true  ? 'bg-green-900 text-green-300' :
              a.is_valid === false ? 'bg-red-900 text-red-300'     :
              'bg-gray-800 text-gray-400'
            }`}>
              {a.is_valid === true ? 'Valid' : a.is_valid === false ? 'Invalid' : 'Unchecked'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
