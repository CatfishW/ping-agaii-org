import asyncio
import os
import sys
import unittest
from pathlib import Path

import httpx
from fastapi import FastAPI
from fastapi.testclient import TestClient


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DATABASE_URL", f"sqlite:///{ROOT / 'ping_db.sqlite'}")

from routers import llm_router
from services.llm_primary_service import LlmPrimaryService


class FakePrimaryService:
    configured = True

    async def chat_completions(self, payload):
        request = httpx.Request("POST", "http://upstream/chat/completions")
        return httpx.Response(
            200,
            json={
                "id": "test-response",
                "model": payload["model"],
                "choices": [{"message": {"role": "assistant", "content": "Ready."}}],
            },
            request=request,
        )


class MissingPrimaryService:
    configured = False


class LlmPrimaryRouterTests(unittest.TestCase):
    def setUp(self):
        llm_router._request_times.clear()
        app = FastAPI()
        app.state.llm_primary_service = FakePrimaryService()
        app.include_router(llm_router.router)
        self.client = TestClient(app)

    @staticmethod
    def payload():
        return {
            "model": "gpt-5.5",
            "messages": [{"role": "user", "content": "Reply with Ready."}],
            "max_tokens": 32,
        }

    def test_supported_request_is_forwarded(self):
        response = self.client.post(
            "/api/llm/primary/v1/chat/completions",
            json=self.payload(),
            headers={"Origin": "https://ping.agaii.org"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["model"], "gpt-5.5")
        self.assertEqual(response.headers["cache-control"], "no-store")

    def test_unsupported_model_is_rejected(self):
        payload = self.payload()
        payload["model"] = "another-model"

        response = self.client.post(
            "/api/llm/primary/v1/chat/completions",
            json=payload,
        )

        self.assertEqual(response.status_code, 422)

    def test_unknown_origin_is_rejected(self):
        response = self.client.post(
            "/api/llm/primary/v1/chat/completions",
            json=self.payload(),
            headers={"Origin": "https://example.com"},
        )

        self.assertEqual(response.status_code, 403)

    def test_unconfigured_service_is_unavailable(self):
        self.client.app.state.llm_primary_service = MissingPrimaryService()

        response = self.client.post(
            "/api/llm/primary/v1/chat/completions",
            json=self.payload(),
        )

        self.assertEqual(response.status_code, 503)

    def test_service_keeps_authorization_server_side(self):
        captured = {}

        async def handler(request):
            captured["authorization"] = request.headers.get("authorization")
            return httpx.Response(200, json={"choices": []})

        async def exercise():
            client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
            service = LlmPrimaryService(
                "http://127.0.0.1:28080/v1",
                "server-secret",
                client=client,
            )
            try:
                await service.chat_completions(self.payload())
            finally:
                await client.aclose()

        asyncio.run(exercise())
        self.assertEqual(captured["authorization"], "Bearer server-secret")


if __name__ == "__main__":
    unittest.main()
