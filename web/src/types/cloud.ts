export type CloudProvider = 'zeabur' | 'aws' | 'railway'

export type CloudAccount = {
  id: string
  provider: CloudProvider
  display_name: string
  is_valid: boolean | null
  created_at: string
}
