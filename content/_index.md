---
title: ""
date: 2026-02-25
type: landing

design:
  spacing: "5rem"

sections:
  # ── Hero : positionnement, pas biographie ──
  - block: hero
    id: hero
    content:
      title: |
        À l'intersection de la recherche,
        de la stratégie et de l'action publique
      text: |
        Macroéconomiste. Ancien conseiller au Quai d'Orsay (CAPS, 2018-2023).
        Chercheur associé BETA & FERDI. Spécialiste de la géoéconomie,
        du financement du développement et des risques géopolitiques.

        <div class="hero-roles">
          <span class="role role-accent">Chercheur</span>
          <span class="role">Stratège</span>
          <span class="role role-accent">Conseiller</span>
        </div>
      primary_action:
        text: Découvrir mes travaux
        url: /research/
      secondary_action:
        text: Foresight →
        url: /foresight/
    design:
      css_class: dark
      background:
        color: black

  # ── Chiffres clés ──
  - block: stats
    id: stats
    content:
      items:
        - statistic: "4"
          description: "Publications rang A"
        - statistic: "5 ans"
          description: "Conseiller CAPS / Quai d'Orsay"
        - statistic: "12+"
          description: "Années d'expérience"
        - statistic: "3"
          description: "Affiliations académiques"

  # ── Domaines d'expertise ──
  - block: features
    id: expertise
    content:
      title: Domaines d'expertise
      items:
        - name: "Géoéconomie & Risques"
          description: "Sanctions, compétition sino-américaine, arsenalisation des interdépendances, PME et chaînes de valeur."
          icon: globe-alt
          icon_pack: hero
        - name: "Financement du développement"
          description: "Architecture financière internationale, réforme des BMD, Agenda 2030, dette des PMA."
          icon: banknotes
          icon_pack: hero
        - name: "Transition énergétique"
          description: "Subventions aux énergies fossiles (FFSR), politique climatique, certification FMI Climate Risks."
          icon: bolt
          icon_pack: hero
        - name: "Institutions & Économie politique"
          description: "Corruption, survie des dirigeants, coups d'État, économie politique des ressources."
          icon: scale
          icon_pack: hero

  # ── Dernières analyses ──
  - block: collection
    id: analyses
    content:
      title: Dernières analyses
      count: 3
      filters:
        folders:
          - post
    design:
      view: date-title-summary

  # ── Publication phare — section sombre image-cards ──
  - block: markdown
    id: publications-phares
    content:
      title: ""
      text: |
        <div class="dark-showcase">
          <h2 class="showcase-title">Publications récentes</h2>
          <div class="showcase-grid">
            <a href="/post/2026-01-pme-geopolitiques/" class="showcase-card">
              <div class="showcase-card-img" style="background: linear-gradient(135deg, #003366 0%, #001a33 100%);">
                <span class="showcase-card-icon">🛡️</span>
              </div>
              <div class="showcase-card-body">
                <span class="showcase-card-date">Février 2026</span>
                <h3>La fragilité par la base</h3>
                <p>PME de la BITD et résilience géopolitique — Policy Brief</p>
              </div>
            </a>
            <a href="/post/2025-07-ffd4/" class="showcase-card">
              <div class="showcase-card-img" style="background: linear-gradient(135deg, #1a5276 0%, #003366 100%);">
                <span class="showcase-card-icon">🌍</span>
              </div>
              <div class="showcase-card-body">
                <span class="showcase-card-date">Juillet 2025</span>
                <h3>FfD4 : Time for a reset?</h3>
                <p>L'architecture financière internationale face aux défis actuels</p>
              </div>
            </a>
            <a href="/post/2025-07-haiti/" class="showcase-card">
              <div class="showcase-card-img" style="background: linear-gradient(135deg, #0a1628 0%, #1a5276 100%);">
                <span class="showcase-card-icon">🏛️</span>
              </div>
              <div class="showcase-card-body">
                <span class="showcase-card-date">Juillet 2025</span>
                <h3>Haïti : sortir de l'impasse</h3>
                <p>Repenser l'action internationale face à la crise sécuritaire</p>
              </div>
            </a>
          </div>
        </div>

  # ── À propos — 2 colonnes : bio + quote (Mazzucato pattern) ──
  - block: markdown
    id: a-propos
    content:
      title: ""
      text: |
        <div class="two-col-section">
          <div class="two-col-left">
            <h2 class="two-col-role">Chercheur</h2>
            <p>
              Macroéconomiste avec 12 ans d'expérience à l'intersection de la recherche académique,
              du conseil stratégique au plus haut niveau de l'État et de la coopération internationale.
              Ancien Économiste-Conseiller au CAPS/Quai d'Orsay (2018-2023), aujourd'hui chercheur associé
              au BETA (Université de Lorraine) et à la FERDI.
            </p>
            <p>
              <strong>Habilitation Secret Défense</strong> · Bilingue FR-EN (TOEIC 955) · Certifié FMI <em>Climate Risks</em> (2024)
            </p>
            <a href="/about/" class="mazz-btn">En savoir plus</a>
          </div>
          <div class="two-col-right">
            <blockquote class="mazz-quote">
              <span class="quote-mark">"</span>
              <p>L'enjeu pour l'Europe n'est pas de choisir entre compétitivité et souveraineté — c'est de comprendre que sans la seconde, la première est illusoire. Les PME sont le terrain de vérité de cette équation.</p>
              <span class="quote-mark quote-mark-end">"</span>
              <cite>Eric Kilama, Policy Brief PME-BITD, 2026</cite>
            </blockquote>
          </div>
        </div>
---
