#!/bin/bash
set -e

export OPENCLAW_CONFIG_PATH=/tmp/openclaw.json

PROVIDER="${LLM_PROVIDER:-openai}"
MODEL="${LLM_MODEL:-gpt-4o}"
API_KEY="${LLM_API_KEY:-}"

# Map provider to OpenClaw provider id + baseUrl
case "$PROVIDER" in
  openai)
    OPENCLAW_PROVIDER="openai"
    BASE_URL="https://api.openai.com/v1"
    ;;
  anthropic)
    OPENCLAW_PROVIDER="anthropic"
    BASE_URL="https://api.anthropic.com/v1"
    ;;
  gemini)
    OPENCLAW_PROVIDER="google"
    BASE_URL="https://generativelanguage.googleapis.com/v1beta"
    ;;
  *)
    OPENCLAW_PROVIDER="openai"
    BASE_URL="https://api.openai.com/v1"
    ;;
esac

cat > "$OPENCLAW_CONFIG_PATH" <<EOF
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "${DISCORD_BOT_TOKEN}",
      "dmPolicy": "open",
      "allowFrom": ["*"]
    }
  },
  "models": {
    "providers": {
      "${OPENCLAW_PROVIDER}": {
        "apiKey": "${API_KEY}",
        "baseUrl": "${BASE_URL}",
        "models": [{"id": "${MODEL}", "name": "${MODEL}"}]
      }
    }
  }
}
EOF

echo "✅ OpenClaw config generated (provider: ${OPENCLAW_PROVIDER}, model: ${MODEL})"
exec openclaw gateway
