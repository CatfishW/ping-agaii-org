import os
from typing import Any, Dict, Optional

import httpx


class LlmPrimaryTimeout(Exception):
    pass


class LlmPrimaryUnavailable(Exception):
    pass


class LlmPrimaryService:
    def __init__(
        self,
        upstream: str,
        api_key: str,
        timeout_seconds: float = 12.0,
        client: Optional[httpx.AsyncClient] = None,
    ):
        self.upstream = upstream.rstrip("/")
        self.api_key = api_key.strip()
        self.timeout_seconds = timeout_seconds
        self._client = client or httpx.AsyncClient()
        self._owns_client = client is None

    @classmethod
    def from_environment(cls) -> "LlmPrimaryService":
        return cls(
            upstream=os.getenv(
                "PING_LLM_PRIMARY_UPSTREAM",
                "http://127.0.0.1:28080/v1",
            ),
            api_key=os.getenv("PING_LLM_PRIMARY_API_KEY", ""),
            timeout_seconds=float(os.getenv("PING_LLM_PRIMARY_TIMEOUT_SECONDS", "12")),
        )

    @property
    def configured(self) -> bool:
        return bool(self.upstream and self.api_key)

    async def chat_completions(self, payload: Dict[str, Any]) -> httpx.Response:
        if not self.configured:
            raise LlmPrimaryUnavailable("Primary LLM relay is not configured.")

        try:
            return await self._client.post(
                f"{self.upstream}/chat/completions",
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Accept": "application/json",
                },
                timeout=self.timeout_seconds,
            )
        except httpx.TimeoutException as exc:
            raise LlmPrimaryTimeout("Primary LLM request timed out.") from exc
        except httpx.HTTPError as exc:
            raise LlmPrimaryUnavailable("Primary LLM service is unavailable.") from exc

    async def close(self) -> None:
        if self._owns_client:
            await self._client.aclose()
