import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from public_attribution_gate import scan_paths, scan_text  # noqa: E402
from ingest_staging import ingest_file  # noqa: E402


class PublicAttributionGateTests(unittest.TestCase):
    def test_blocks_caps_badge(self):
        violations = scan_text("<span>CAPS-MEAE</span>")
        self.assertIn("CAPS_PUBLIC_MENTION", {item.rule for item in violations})

    def test_blocks_full_institution_name(self):
        violations = scan_text("Centre d'analyse, de prévision et de stratégie")
        self.assertEqual({item.rule for item in violations}, {"CAPS_FULL_NAME"})

    def test_blocks_internal_style_profile(self):
        violations = scan_text("style_profile: caps_house")
        self.assertEqual({item.rule for item in violations}, {"CAPS_INTERNAL_IDENTIFIER"})

    def test_blocks_lowercase_badge(self):
        violations = scan_text("badge: caps-meae")
        self.assertEqual({item.rule for item in violations}, {"CAPS_INTERNAL_IDENTIFIER"})

    def test_blocks_personal_quai_affiliation(self):
        violations = scan_text("Mon expérience au Quai d'Orsay a structuré cette analyse.")
        self.assertEqual(
            {item.rule for item in violations},
            {"PERSONAL_INSTITUTIONAL_AFFILIATION"},
        )

    def test_allows_meae_as_policy_actor(self):
        self.assertEqual(scan_text("Le MEAE devrait publier cette série statistique."), [])

    def test_allows_quai_as_public_source(self):
        self.assertEqual(scan_text("Le Quai d'Orsay publie le communiqué officiel."), [])

    def test_scans_files_and_reports_location(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "page.md"
            path.write_text("Titre\n\nCAPS — badge", encoding="utf-8")
            violations = scan_paths([path])
        self.assertEqual(len(violations), 1)
        self.assertEqual(violations[0].line, 3)

    def test_ingestion_blocks_restricted_output_before_write(self):
        signal = """---
type: note
status: ready
date: 2026-07-13
---
# Test public

Badge CAPS-MEAE.
"""
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "restricted.md"
            path.write_text(signal, encoding="utf-8")
            result = ingest_file(path, dry_run=True)
        self.assertIsNotNone(result)
        self.assertEqual(result["status"], "blocked")
        self.assertIn("CAPS_PUBLIC_MENTION", result["reason"])

    def test_ingestion_help_does_not_run_ingestion(self):
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "ingest_staging.py"), "--help"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("--dry-run", result.stdout)
        self.assertNotIn("Ingestion summary", result.stdout)


if __name__ == "__main__":
    unittest.main()
