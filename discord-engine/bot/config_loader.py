import base64
import json
import os
from pathlib import Path


def load_agent_config() -> dict:
    # Priority 1: AGENT_CONFIG_B64 env var (base64-encoded JSON) — avoids special char issues
    raw_b64 = os.environ.get("AGENT_CONFIG_B64")
    if raw_b64:
        return json.loads(base64.b64decode(raw_b64).decode("utf-8"))

    # Priority 2: AGENT_CONFIG env var (JSON string) — legacy / local dev
    raw = os.environ.get("AGENT_CONFIG")
    if raw:
        return json.loads(raw)

    # Priority 2: file path — used for local development
    config_path = os.environ.get("AGENT_CONFIG_PATH", "/app/config/agent_config.json")
    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Agent config not found: {config_path}")
    return json.loads(path.read_text())
