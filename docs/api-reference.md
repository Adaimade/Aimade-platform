# API Reference

Base URL: `http://localhost:8000/v1`

All endpoints require: `Authorization: Bearer <supabase_jwt>`

---

## Agents

### POST /agents
Create a new agent.

**Body:**
```json
{
  "name": "My Assistant",
  "description": "Optional description",
  "personality": {
    "tone": "friendly",
    "verbosity": "concise",
    "emoji": true
  },
  "skills": ["chat", "welcomer"],
  "llm_provider": "openai",
  "llm_model": "gpt-4o",
  "llm_api_key": "sk-..."
}
```

**Response:** `201` AgentResponse

---

### GET /agents
List all agents for the current user.

---

### GET /agents/{agent_id}
Get a specific agent.

---

### PATCH /agents/{agent_id}
Update agent fields (partial update).

---

### DELETE /agents/{agent_id}
Delete agent. `204`

---

## Deployments

### POST /deployments ⭐
Deploy an agent.

**Body:**
```json
{
  "agent_id": "uuid",
  "cloud_account_id": "uuid",
  "discord_bot_token": "Bot token from Discord Developer Portal"
}
```

**Response:** `202`
```json
{
  "deployment_id": "uuid",
  "status": "queued",
  "message": "Deployment queued"
}
```

---

### GET /deployments/{id}/status ⭐
Poll deployment status.

**Response:**
```json
{
  "deployment_id": "uuid",
  "status": "live",
  "external_id": "worker-name",
  "external_url": "https://...",
  "error_message": null,
  "started_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:00:30Z"
}
```

**Status values:** `queued` → `building` → `deploying` → `live` | `failed`

---

### GET /deployments/{id}/logs ⭐
Stream deployment logs via Server-Sent Events.

**Response:** `text/event-stream`
```
data: {"level": "info", "message": "Starting deployment...", "ts": "..."}
data: {"level": "info", "message": "Build complete.", "ts": "..."}
```

---

### POST /deployments/{id}/stop
Stop a running deployment.

---

## Cloud Accounts

### POST /cloud-accounts
Connect a cloud account.

**Body (Cloudflare):**
```json
{
  "provider": "cloudflare",
  "display_name": "My CF Account",
  "credentials": {
    "api_token": "...",
    "account_id": "..."
  }
}
```

**Body (Zeabur):**
```json
{
  "provider": "zeabur",
  "display_name": "My Zeabur",
  "credentials": {
    "api_token": "..."
  }
}
```

**Body (AWS):**
```json
{
  "provider": "aws",
  "display_name": "My AWS",
  "credentials": {
    "access_key_id": "AKIA...",
    "secret_access_key": "...",
    "region": "us-east-1"
  }
}
```

---

### GET /cloud-accounts
List connected cloud accounts (credentials masked).

---

### DELETE /cloud-accounts/{id}
Remove a cloud account.
