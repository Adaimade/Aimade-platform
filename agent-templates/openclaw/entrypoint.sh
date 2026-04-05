#!/bin/bash
set -e

export OPENCLAW_CONFIG_PATH=/tmp/openclaw.json

PROVIDER="${LLM_PROVIDER:-openai}"
MODEL="${LLM_MODEL:-gpt-4o}"
API_KEY="${LLM_API_KEY:-}"

# Map provider name to OpenClaw format
case "$PROVIDER" in
  openai)    OPENCLAW_PROVIDER="openai" ;;
  anthropic) OPENCLAW_PROVIDER="anthropic" ;;
  gemini)    OPENCLAW_PROVIDER="google" ;;
  *)         OPENCLAW_PROVIDER="openai" ;;
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
        "apiKey": "${API_KEY}"
      }
    },
    "default": "${OPENCLAW_PROVIDER}/${MODEL}"
  }
}
EOF

echo "✅ OpenClaw config generated (provider: ${OPENCLAW_PROVIDER}, model: ${MODEL})"
exec openclaw gateway
