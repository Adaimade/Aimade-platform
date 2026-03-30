/*
 * AWS Adapter
 * Deploys the Discord bot as an AWS ECS Fargate task (container).
 * Note: We use ECS Fargate (not Lambda) because the bot needs a persistent connection.
 *
 * Flow:
 *   1. Create/update ECS Task Definition (points to our container image)
 *   2. Run the task in Fargate (persistent, long-running)
 */

type AWSCreds = {
  access_key_id:     string
  secret_access_key: string
  region:            string
}

// AWS SigV4 signing helper (lightweight, no SDK needed in Workers)
async function awsFetch(
  creds: AWSCreds,
  service: string,
  url: string,
  method: string,
  body: string,
  headers: Record<string, string> = {},
): Promise<any> {
  // For now, this is a placeholder — full SigV4 implementation
  // will be added in the next iteration.
  // In production, we recommend using a lightweight signing lib.
  throw new Error('AWS adapter: SigV4 signing not yet implemented — use Zeabur for now')
}

export async function deploy(
  imageUri: string,
  agentId: string,
  envVars: Record<string, string>,
  creds: AWSCreds,
): Promise<{ externalId: string; externalUrl: string | null }> {
  // TODO: implement ECS Fargate deployment
  // 1. Register task definition
  // 2. Run task with env vars: DISCORD_BOT_TOKEN, LLM_API_KEY
  // 3. Return task ARN as externalId
  throw new Error('AWS adapter not yet implemented')
}

export async function destroy(externalId: string, creds: AWSCreds): Promise<void> {
  // TODO: stop and deregister ECS task
  throw new Error('AWS adapter not yet implemented')
}
