import os
import sys
import unittest
from pathlib import Path
import tempfile

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


class DefaultModuleTests(unittest.TestCase):
    def test_biology_games_use_framework_build_paths(self):
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as temp_dir:
            os.environ["DATABASE_URL"] = f"sqlite:///{Path(temp_dir) / 'modules.sqlite'}"
            for name in ["database", "models", "main"]:
                sys.modules.pop(name, None)

            import database
            import models
            import main

            models.Base.metadata.create_all(bind=database.engine)
            db = database.SessionLocal()
            try:
                org_id = main.ensure_default_org(db)
                main.ensure_default_subjects(db)
                main.ensure_default_modules(db)

                biology = db.query(models.Subject).filter_by(key="biology").one()
                expected = {
                    "gameheart": "/games/gameheart/Build/heart",
                    "gamemeetingcells": "/games/gamemeetingcells/Build/MeetingCells_NewEnv",
                }
                for module_id, build_path in expected.items():
                    module = db.query(models.Module).filter_by(module_id=module_id).one()
                    self.assertEqual(module.subject, "biology")
                    self.assertEqual(module.subject_id, biology.id)
                    self.assertEqual(module.build_path, build_path)
                    self.assertTrue(module.is_published)

                    whitelist = (
                        db.query(models.ModuleWhitelist)
                        .filter_by(organization_id=org_id, module_id=module.id)
                        .one()
                    )
                    self.assertTrue(whitelist.is_enabled)
            finally:
                db.close()
                database.engine.dispose()


if __name__ == "__main__":
    unittest.main()
