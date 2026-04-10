#!/usr/bin/env python3
"""
UTM Link Generator — erickilama.com
Génère des liens trackés pour les posts LinkedIn, emails, etc.
Usage : python utm_generator.py
"""

from urllib.parse import urlencode

BASE_URL = "https://erickilama.com"

# Campagnes prédéfinies
CAMPAIGNS = {
    "apd_g7":       "Rapport APD G7 2026",
    "polycrisis":   "Polycrisis Report",
    "gpr_sme":      "GPR/SME Research",
    "vigie":        "Vigie Géopolitique",
    "general":      "Site Promotion",
}

SOURCES = {
    "li":    "linkedin",
    "x":     "twitter",
    "email": "email",
    "wpp":   "whatsapp",
    "ref":   "referral",
}


def generate_utm(page="/", source="li", campaign="general", content=""):
    """Génère un lien UTM complet."""
    params = {
        "utm_source": SOURCES.get(source, source),
        "utm_medium": "social" if source in ("li", "x") else source,
        "utm_campaign": campaign,
    }
    if content:
        params["utm_content"] = content

    url = f"{BASE_URL}{page}"
    return f"{url}?{urlencode(params)}"


def print_links():
    """Génère les liens UTM pour un post LinkedIn."""
    print("=" * 60)
    print("UTM LINK GENERATOR — erickilama.com")
    print("=" * 60)
    print()

    # Post APD G7
    print("── Post LinkedIn : Chute APD / Rapport G7 ──")
    links = [
        ("Homepage",        "/",          "li", "apd_g7", "post_apd_chute_2026"),
        ("Page Policy",     "/policy/",   "li", "apd_g7", "post_apd_chute_2026"),
        ("Page Policy Dev", "/policy/developpement/", "li", "apd_g7", "post_apd_chute_2026"),
    ]
    for label, page, src, camp, content in links:
        print(f"  {label}:")
        print(f"  {generate_utm(page, src, camp, content)}")
        print()

    # Post GPR/SME
    print("── Post LinkedIn : GPR/SME Research ──")
    links = [
        ("Homepage",        "/",           "li", "gpr_sme", "post_gpr_research"),
        ("Page Research",   "/research/",  "li", "gpr_sme", "post_gpr_research"),
    ]
    for label, page, src, camp, content in links:
        print(f"  {label}:")
        print(f"  {generate_utm(page, src, camp, content)}")
        print()

    # Liens email
    print("── Emails (recruteurs, contacts) ──")
    links = [
        ("CV/About (recruteur)", "/about/", "email", "general", "email_recruteur"),
        ("Homepage (contact)",   "/",       "email", "general", "email_contact"),
        ("Research (académique)", "/research/", "email", "general", "email_academic"),
    ]
    for label, page, src, camp, content in links:
        print(f"  {label}:")
        print(f"  {generate_utm(page, src, camp, content)}")
        print()

    # Liens X/Twitter
    print("── X/Twitter ──")
    links = [
        ("Vigie",    "/foresight/", "x", "vigie", "tweet_vigie"),
        ("Research", "/research/",  "x", "general", "tweet_research"),
    ]
    for label, page, src, camp, content in links:
        print(f"  {label}:")
        print(f"  {generate_utm(page, src, camp, content)}")
        print()

    print("=" * 60)
    print("Copier le lien approprié dans le post/email.")
    print("Le visiteur sera automatiquement taggé dans Clarity.")
    print("=" * 60)


if __name__ == "__main__":
    print_links()
