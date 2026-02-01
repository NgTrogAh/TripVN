import httpx
from apps.ai.app.config import BACKEND_API_URL

class BackendClient:
    def __init__(self):
        self.base_url = BACKEND_API_URL

    async def apply_action(self, action_type: str, payload: dict) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{self.base_url}/ai/actions",
                json={
                    "action_type": action_type,
                    "payload": payload,
                },
            )
            response.raise_for_status()
            return response.json()

    async def query(self, path: str, params: dict | None = None) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{self.base_url}{path}",
                params=params,
            )
            response.raise_for_status()
            return response.json()