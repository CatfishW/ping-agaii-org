import os
import sys
import unittest
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DATABASE_URL", f"sqlite:///{ROOT / 'ping_db.sqlite'}")

from database import get_db
from models import Base
from routers import game_login_router


class GameLoginRouterTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)

        app = FastAPI()
        app.include_router(game_login_router.router)

        def override_db():
            db = self.Session()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_db
        self.client = TestClient(app)

    def tearDown(self):
        self.engine.dispose()

    def test_guest_login_issues_numeric_identity_and_valid_session(self):
        login = self.client.post(
            "/api/game-login/login",
            json={
                "username": "guest-browser",
                "password": "guest-browser-meetingcells",
                "displayName": "Guest Driver",
                "moduleId": "race-game",
                "deviceId": "browser",
            },
        )

        self.assertEqual(login.status_code, 200)
        body = login.json()
        self.assertTrue(body["userId"].isdigit())
        self.assertTrue(body["sessionToken"])
        self.assertEqual(body["moduleId"], "race-game")

        validate = self.client.post(
            "/api/game-login/session/validate",
            json={"moduleId": "race-game"},
            headers={"Authorization": f"Bearer {body['sessionToken']}"},
        )

        self.assertEqual(validate.status_code, 200)
        self.assertEqual(validate.json()["userId"], body["userId"])

    def test_invalid_session_is_rejected(self):
        response = self.client.post(
            "/api/game-login/session/validate",
            json={"moduleId": "race-game"},
            headers={"Authorization": "Bearer invalid"},
        )

        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
