import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import type { AgentCreate, AgentSkill, LLMProvider, BotEngine, SoulPreset } from '@/types/agent'
import type { Agent } from '@/types/agent'

const SKILLS: { id: AgentSkill; label: string; desc: string }[] = [
  { id: 'chat',       label: 'Chat',       desc: 'AI replies when mentioned' },
  { id: 'welcomer',   label: 'Welcomer',   desc: 'Greets new members'        },
  { id: 'moderation', label: 'Moderation', desc: 'Auto-mod, warn, ban'       },
  { id: 'polls',      label: 'Polls',      desc: 'Create polls'              },
  { id: 'reminders',  label: 'Reminders',  desc: 'Set reminders'             },
  { id: 'music',      label: 'Music',      desc: 'Voice channel music'       },
]

const PROVIDERS: { id: LLMProvider; label: string; model: string }[] = [
  { id: 'openai',    label: 'OpenAI',    model: 'gpt-4o'                     },
  { id: 'gemini',    label: 'Gemini',    model: 'gemini-2.0-flash'           },
  { id: 'anthropic', label: 'Anthropic', model: 'claude-sonnet-4-6'          },
]

const BOT_ENGINES: { id: BotEngine; label: string; platform: string; desc: string }[] = [
  { id: 'standard',  label: 'Standard Bot', platform: 'Discord',          desc: 'AI chat bot for Discord servers'           },
  { id: 'hydrabot',  label: 'HydraBot',     platform: 'Telegram',         desc: 'Powerful personal AI assistant on Telegram' },
  { id: 'openclaw',  label: 'OpenClaw',     platform: 'Discord + more',   desc: 'Multi-platform AI with 50+ integrations'   },
]

const SOUL_PRESETS: { id: SoulPreset; emoji: string; label: string; desc: string; tag: string }[] = [
  { id: 'general',       emoji: '🤖', label: '助理',          desc: '全能通用助手，靈活應對各種需求',           tag: 'All-round'    },
  { id: 'stock_analyst', emoji: '📊', label: '股市分析專家',  desc: '台股、美股技術分析、持久記憶追蹤標的',     tag: 'Finance'      },
  { id: 'code_expert',   emoji: '💻', label: '代碼專家',      desc: '代碼審查、除錯、架構建議，支援所有語言',   tag: 'Engineering'  },
  { id: 'daily_butler',  emoji: '🗂️', label: '日常管家',      desc: '天氣、新聞、提醒、購物清單、日程安排',     tag: 'Lifestyle'    },
  { id: 'task_manager',  emoji: '📋', label: '任務調度主管',  desc: '任務拆解、進度追蹤、多代理協作調度',       tag: 'Productivity' },
]

export default function AgentNewPage() {
  const navigate = useNavigate()
  const api = useApi()
  const qc = useQueryClient()

  const [form, setForm] = useState<AgentCreate>({
    name: '',
    personality: { tone: 'friendly', verbosity: 'concise', emoji: true },
    skills: ['chat'],
    llm_provider: 'openai',
    llm_model: 'gpt-4o',
    llm_api_key: '',
    bot_engine: 'standard',
    soul_preset: 'general',
  })

  const mutation = useMutation({
    mutationFn: () => api<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(form),
    }),
    onSuccess: (agent) => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      navigate(`/dashboard/agents/${agent.id}/deploy`)
    },
  })

  const toggleSkill = (skill: AgentSkill) =>
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }))

  const selectedProvider = PROVIDERS.find(p => p.id === form.llm_provider)!
  const selectedEngine   = BOT_ENGINES.find(e => e.id === form.bot_engine)!
  const isStandard       = form.bot_engine === 'standard'

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Create Agent</h1>

      <form onSubmit={e => { e.preventDefault(); mutation.mutate() }} className="space-y-6">

        {/* Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-300">Name</label>
          <input required value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="My AI Assistant"
            className="w-full max-w-sm px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
        </div>

        {/* Engine + Role — side by side */}
        <div className="grid grid-cols-2 gap-6">

          {/* Bot Engine */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Bot Engine</label>
            <div className="space-y-2">
              {BOT_ENGINES.map(engine => (
                <button key={engine.id} type="button"
                  onClick={() => setForm(f => ({ ...f, bot_engine: engine.id }))}
                  className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${
                    form.bot_engine === engine.id
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{engine.label}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 shrink-0">
                      {engine.platform}
                    </span>
                  </div>
                  <p className="text-xs opacity-60 mt-0.5">{engine.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">角色 Role</label>
            <div className="space-y-2">
              {SOUL_PRESETS.map(preset => (
                <button key={preset.id} type="button"
                  onClick={() => setForm(f => ({ ...f, soul_preset: preset.id }))}
                  className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${
                    form.soul_preset === preset.id
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{preset.emoji} {preset.label}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 shrink-0">
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-xs opacity-60 mt-0.5">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills — only for standard Discord bot */}
        {isStandard && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Skills</label>
            <div className="grid grid-cols-3 gap-2">
              {SKILLS.map(skill => (
                <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                  className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                    form.skills.includes(skill.id)
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  <p className="font-medium">{skill.label}</p>
                  <p className="text-xs opacity-60">{skill.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Provider + Model + Key */}
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 space-y-3">
          <p className="text-sm font-medium text-gray-300">AI Model</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Provider</label>
              <select value={form.llm_provider}
                onChange={e => {
                  const p = PROVIDERS.find(p => p.id === e.target.value)!
                  setForm(f => ({ ...f, llm_provider: p.id, llm_model: p.model }))
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500">
                {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Model</label>
              <input value={form.llm_model}
                onChange={e => setForm(f => ({ ...f, llm_model: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">{selectedProvider.label} API Key</label>
              <input required type="password" value={form.llm_api_key}
                onChange={e => setForm(f => ({ ...f, llm_api_key: e.target.value }))}
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          <p className="text-xs text-gray-600">API key is stored encrypted and never shared.</p>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-400">{(mutation.error as Error).message}</p>
        )}

        <button type="submit" disabled={mutation.isPending}
          className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 rounded-lg font-semibold transition-colors">
          {mutation.isPending ? 'Creating...' : 'Create Agent →'}
        </button>

      </form>
    </div>
  )
}
