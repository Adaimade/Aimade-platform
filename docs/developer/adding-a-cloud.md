# How to Add a New Cloud Provider

## 1. Create the Adapter

Create `deployment-engine/engine/adapters/yourprovider.py`:

```python
from .base import CloudAdapter
from ..models.agent_config import AgentConfig


class YourProviderAdapter(CloudAdapter):

    def deploy(self, image_uri, config, discord_token, credentials) -> tuple[str, str | None]:
        # Use credentials to call your cloud's API
        # Deploy image_uri as a running container
        # Return (external_id, external_url)
        ...

    def get_status(self, external_id, credentials) -> str:
        # Return "live", "stopped", "error", etc.
        ...

    def destroy(self, external_id, credentials) -> None:
        # Tear down the service
        ...
```

## 2. Register the Adapter

In `deployment-engine/engine/adapters/__init__.py`:

```python
from .yourprovider import YourProviderAdapter

def get_adapter(provider: str) -> CloudAdapter:
    adapters = {
        ...
        "yourprovider": YourProviderAdapter,  # Add here
    }
```

## 3. Add Credential Fields to Frontend

In `frontend/src/components/cloud-accounts/CloudAccountForm.tsx`:

```tsx
const FIELDS = {
  ...
  yourprovider: [
    { key: "api_key", label: "API Key", placeholder: "your-api-key" },
  ],
}
```

## 4. Add Provider Icon (Optional)

Drop `frontend/public/icons/yourprovider.svg` and reference it in `CloudProviderPicker`.

That's it — no other changes needed.
