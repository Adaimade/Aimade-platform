export type AgentSkill = 'chat' | 'moderation' | 'welcomer' | 'polls' | 'reminders' | 'music'
export type LLMProvider = 'openai' | 'gemini' | 'anthropic'
export type AgentStatus = 'draft' | 'deployed' | 'error' | 'stopped'
export type BotEngine = 'standard' | 'hydrabot' | 'openclaw'
export type SoulPreset = 'general' | 'stock_analyst' | 'code_expert' | 'daily_butler' | 'task_manager'

export type Agent = {
  id: string
  name: string
  description?: string
  personality: {
    tone: 'casual' | 'formal' | 'friendly' | 'professional'
    verbosity: 'concise' | 'detailed'
    emoji: boolean
    custom_instructions?: string
  }
  skills: AgentSkill[]
  llm_provider: LLMProvider
  llm_model: string
  bot_engine: BotEngine
  soul_preset: SoulPreset
  status: AgentStatus
  created_at: string
}

export type AgentCreate = Omit<Agent, 'id' | 'status' | 'created_at'> & {
  llm_api_key: string
}
