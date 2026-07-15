import sys
import os
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DATABASE_URL", f"sqlite:///{ROOT / 'ping_db.sqlite'}")

from schemas import TelemetryEventCreate
from routers import telemetry_router


class TelemetryRouterTests(unittest.TestCase):
    def make_event(self, event_type, payload):
        return TelemetryEventCreate(
            session_id="session-1",
            user_id=None,
            guest_id="guest-1",
            module_id="newton1",
            event_type=event_type,
            payload=payload,
            timestamp="2026-05-25T12:00:00Z",
            client_timestamp=1779710400000,
        )

    def test_game_event_is_compliant_for_unity_payloads(self):
        event = self.make_event(
            "game_event",
            {
                "verb": "passed",
                "object_id": "levels/intro",
                "result": {"success": True, "score": 100},
            },
        )

        self.assertTrue(telemetry_router.validate_event_compliance(event))

    def test_legacy_local_guest_user_id_is_normalized(self):
        event = TelemetryEventCreate(
            session_id="session-1",
            user_id="local-guest-browser",
            guest_id=None,
            module_id="race-game",
            event_type="game_event",
            payload={"verb": "started", "object_id": "race"},
            timestamp="2026-07-14T07:00:00Z",
            client_timestamp=1784012400000,
        )

        self.assertIsNone(event.user_id)
        self.assertEqual(event.guest_id, "local-guest-browser")

    def test_text_input_payload_is_reduced_to_privacy_safe_summary(self):
        event = self.make_event(
            "text_input",
            {
                "value": "student typed a private sentence",
                "field_id": "answer-box",
                "device": "keyboard",
            },
        )

        safe_payload = telemetry_router.sanitize_event_payload(event)

        self.assertEqual(safe_payload["length"], 32)
        self.assertEqual(safe_payload["field_id"], "answer-box")
        self.assertNotIn("value", safe_payload)
        self.assertNotIn("student typed", str(safe_payload))

    def test_event_converts_to_actor_verb_object_statement(self):
        event = self.make_event(
            "game_event",
            {
                "verb": "completed",
                "object_id": "objectives/finish-line",
                "object_name": "Finish Line",
                "result": {"success": True, "duration": "PT18.2S"},
            },
        )

        statement = telemetry_router.to_xapi_statement(event, "anon_abc123")

        self.assertEqual(statement["actor"]["name"], "anon_abc123")
        self.assertEqual(statement["verb"]["id"], "http://adlnet.gov/expapi/verbs/completed")
        self.assertEqual(statement["object"]["id"], "ping://games/newton1/objectives/finish-line")
        self.assertEqual(statement["object"]["definition"]["name"]["en-US"], "Finish Line")
        self.assertEqual(statement["result"], {"success": True, "duration": "PT18.2S"})
        self.assertEqual(statement["timestamp"], "2026-05-25T12:00:00Z")

    def test_game_event_completion_detection_uses_structured_payload(self):
        completed_event = self.make_event(
            "game_event",
            {"verb": "completed", "object_id": "objectives/final"},
        )
        interaction_event = self.make_event(
            "game_event",
            {"verb": "interacted", "object_id": "tools/slider"},
        )

        self.assertTrue(
            telemetry_router.is_completion_event(
                completed_event.event_type,
                telemetry_router.sanitize_event_payload(completed_event),
            )
        )
        self.assertFalse(
            telemetry_router.is_completion_event(
                interaction_event.event_type,
                telemetry_router.sanitize_event_payload(interaction_event),
            )
        )


if __name__ == "__main__":
    unittest.main()
