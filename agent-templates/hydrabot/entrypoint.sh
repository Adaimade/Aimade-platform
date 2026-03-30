#!/bin/bash
set -e

# Generate config.json from environment variables
python3 - <<'PYEOF'
import json, os, sys

token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
if not token:
    print("ERROR: TELEGRAM_BOT_TOKEN is not set", file=sys.stderr)
    sys.exit(1)

user_ids_raw = os.environ.get("TELEGRAM_USER_IDS", "")
authorized_users = [int(x.strip()) for x in user_ids_raw.split(",") if x.strip().isdigit()]

config = {
    "telegram_token": token,
    "authorized_users": authorized_users,
    "max_tokens": int(os.environ.get("MAX_TOKENS", "4096")),
    "max_history": int(os.environ.get("MAX_HISTORY", "50")),
    "models": [
        {
            "name": "Primary",
            "provider": os.environ.get("LLM_PROVIDER", "openai"),
            "api_key": os.environ.get("LLM_API_KEY", ""),
            "model": os.environ.get("LLM_MODEL", "gpt-4o"),
            "description": "Primary AI model"
        }
    ]
}

with open("config.json", "w") as f:
    json.dump(config, f, indent=2)

print(f"✅ Config generated — {len(authorized_users)} authorized user(s), model: {config['models'][0]['model']}")
PYEOF

exec python3 main.py
