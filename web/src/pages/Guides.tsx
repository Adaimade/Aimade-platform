import { useState } from 'react'

type Step = { text: string; url?: string; urlLabel?: string; code?: string; note?: string }
type Guide = {
  id: string
  provider: string
  badge?: string
  badgeColor?: string
  tagline: string
  pricing: string
  pricingColor: string
  steps: Step[]
  keyFormat: string
  keyPlaceholder: string
}

const GUIDES: Guide[] = [
  {
    id: 'gemini',
    provider: 'Google AI Studio',
    badge: '推薦 · 免費',
    badgeColor: 'bg-green-900 text-green-300',
    tagline: '免費使用 Gemma 4 / Gemini Flash 等模型，適合個人與開發測試',
    pricing: '完全免費（Gemma 系列無使用量上限，Gemini Flash 1,500 req/day）',
    pricingColor: 'text-green-400',
    keyFormat: 'AIzaSy...',
    keyPlaceholder: 'AIza...',
    steps: [
      {
        text: '前往 Google AI Studio',
        url: 'https://aistudio.google.com',
        urlLabel: 'aistudio.google.com',
      },
      {
        text: '用 Google 帳號登入（如尚未登入）',
      },
      {
        text: '點擊左側選單的「Get API key」',
      },
      {
        text: '點擊「Create API key」→ 選擇一個 Google Cloud 專案（或讓它自動建立）',
      },
      {
        text: '複製產生的 API Key（格式：AIzaSy...）',
        note: '⚠️ 這個 key 只顯示一次，請立即複製貼上到 Adaimade。',
      },
      {
        text: '回到 Adaimade，選擇 Provider: Google Gemini，貼上 API Key',
      },
      {
        text: '推薦模型',
        code: 'gemma-3-4b-it   ← 預設，免費，速度快\ngemma-3-27b-it  ← 更強，免費\ngemini-2.0-flash ← 最快，1,500 req/day 免費',
      },
    ],
  },
  {
    id: 'openai',
    provider: 'OpenAI',
    tagline: 'GPT-4o / GPT-4o mini 等模型，業界標準，按使用量付費',
    pricing: '無免費額度，按 token 計費。GPT-4o mini 約 $0.15/1M tokens（最便宜）',
    pricingColor: 'text-yellow-400',
    keyFormat: 'sk-...',
    keyPlaceholder: 'sk-...',
    steps: [
      {
        text: '前往 OpenAI Platform',
        url: 'https://platform.openai.com',
        urlLabel: 'platform.openai.com',
      },
      {
        text: '登入或註冊帳號（需手機驗證）',
      },
      {
        text: '右上角點擊頭像 → 「API keys」',
      },
      {
        text: '點擊「+ Create new secret key」→ 命名後建立',
      },
      {
        text: '複製 key（格式：sk-...）',
        note: '⚠️ 只顯示一次，立即複製。',
      },
      {
        text: '前往「Billing」→「Add payment method」加入付款方式（先儲值 $5 起）',
        note: '沒有餘額會回傳 429 錯誤。',
      },
      {
        text: '推薦模型',
        code: 'gpt-4o-mini   ← 最便宜，效果好\ngpt-4o        ← 最強，較貴\no3-mini       ← 推理模型',
      },
    ],
  },
  {
    id: 'anthropic',
    provider: 'Anthropic',
    tagline: 'Claude 系列模型，擅長長文本理解與代碼，按使用量付費',
    pricing: '無免費額度，按 token 計費。Claude Haiku 最便宜',
    pricingColor: 'text-yellow-400',
    keyFormat: 'sk-ant-...',
    keyPlaceholder: 'sk-ant-...',
    steps: [
      {
        text: '前往 Anthropic Console',
        url: 'https://console.anthropic.com',
        urlLabel: 'console.anthropic.com',
      },
      {
        text: '登入或註冊帳號',
      },
      {
        text: '點擊左側「API Keys」→「+ Create Key」',
      },
      {
        text: '命名後建立，複製 key（格式：sk-ant-...）',
        note: '⚠️ 只顯示一次，立即複製。',
      },
      {
        text: '前往「Billing」加入付款方式並儲值',
      },
      {
        text: '推薦模型',
        code: 'claude-haiku-4-5-20251001   ← 最快最便宜\nclaude-sonnet-4-6           ← 平衡選擇\nclaude-opus-4-6             ← 最強',
      },
    ],
  },
]

export default function GuidesPage() {
  const [active, setActive] = useState('gemini')
  const guide = GUIDES.find(g => g.id === active)!

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Key 申請指南</h1>
        <p className="text-sm text-gray-400 mt-1">選擇你想使用的 AI Provider，按照步驟申請 API Key</p>
      </div>

      {/* Provider tabs */}
      <div className="flex gap-2">
        {GUIDES.map(g => (
          <button key={g.id} type="button"
            onClick={() => setActive(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              active === g.id
                ? 'border-brand-500 bg-brand-500/10 text-white'
                : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-200'
            }`}>
            {g.provider}
            {g.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${g.badgeColor}`}>
                {g.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Guide content */}
      <div className="p-5 bg-gray-900 rounded-xl border border-gray-800 space-y-5">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{guide.provider}</h2>
            {guide.badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${guide.badgeColor}`}>
                {guide.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{guide.tagline}</p>
          <p className={`text-xs font-medium ${guide.pricingColor}`}>💰 {guide.pricing}</p>
        </div>

        <hr className="border-gray-800" />

        {/* Steps */}
        <ol className="space-y-4">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 text-xs font-bold flex items-center justify-center text-gray-300 mt-0.5">
                {i + 1}
              </span>
              <div className="space-y-1.5 flex-1">
                <p className="text-sm text-gray-200">
                  {step.text}
                  {step.url && (
                    <> — <a href={step.url} target="_blank" rel="noreferrer"
                      className="text-brand-400 hover:underline">
                      {step.urlLabel} ↗
                    </a></>
                  )}
                </p>
                {step.code && (
                  <pre className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-green-300 whitespace-pre-wrap">
                    {step.code}
                  </pre>
                )}
                {step.note && (
                  <p className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-900/40 rounded-lg px-3 py-1.5">
                    {step.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <hr className="border-gray-800" />

        {/* Key format hint */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Key 格式</p>
            <p className="text-sm font-mono text-gray-300 mt-0.5">{guide.keyFormat}</p>
          </div>
          <a href="/dashboard/agents/new"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm font-semibold transition-colors">
            去建立 Agent →
          </a>
        </div>
      </div>
    </div>
  )
}
