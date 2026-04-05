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

# Detect platform from which token is available
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
  PLATFORM="telegram"
else
  PLATFORM="discord"
fi

# Build channel config block based on platform
if [ "$PLATFORM" = "telegram" ]; then
  # Build allowFrom array from TELEGRAM_USER_IDS (comma-separated)
  if [ -n "${TELEGRAM_USER_IDS:-}" ]; then
    ALLOW_FROM=$(echo "$TELEGRAM_USER_IDS" | tr ',' '\n' | sed 's/^/"/;s/$/"/' | paste -sd ',' -)
  else
    ALLOW_FROM='"*"'
  fi
  if [ -n "${TELEGRAM_USER_IDS:-}" ]; then
    DM_POLICY="allowlist"
  else
    ALLOW_FROM='"*"'
    DM_POLICY="open"
  fi
  CHANNEL_BLOCK=$(cat <<CHAN
    "telegram": {
      "enabled": true,
      "botToken": "${TELEGRAM_BOT_TOKEN}",
      "dmPolicy": "${DM_POLICY}",
      "allowFrom": [${ALLOW_FROM}]
    }
CHAN
)
else
  CHANNEL_BLOCK=$(cat <<CHAN
    "discord": {
      "enabled": true,
      "token": "${DISCORD_BOT_TOKEN}",
      "dmPolicy": "open",
      "allowFrom": ["*"]
    }
CHAN
)
fi

cat > "$OPENCLAW_CONFIG_PATH" <<EOF
{
  "gateway": {
    "mode": "local"
  },
  "channels": {
${CHANNEL_BLOCK}
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

echo "✅ OpenClaw config generated (platform: ${PLATFORM}, provider: ${OPENCLAW_PROVIDER}, model: ${MODEL})"
exec openclaw gateway
