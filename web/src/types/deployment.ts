export type DeploymentStatus =
  | 'queued' | 'building' | 'deploying' | 'live' | 'failed' | 'stopped'

export type Deployment = {
  id: string
  agent_id: string
  cloud_account_id: string
  provider: 'zeabur' | 'aws' | 'railway'
  status: DeploymentStatus
  external_id?: string
  external_url?: string
  error_message?: string
  created_at: string
}
