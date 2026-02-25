---
title: "Policy"
type: landing

sections:
  - block: markdown
    id: intro
    content:
      title: "Policy & Analyses stratégiques"
      text: |
        Notes de politique publique, analyses stratégiques et commentaires d'actualité
        à l'intersection de la géoéconomie, du financement du développement et de
        l'économie politique.

        Ces travaux s'appuient sur une double expertise — la rigueur de la recherche
        académique et l'expérience opérationnelle acquise au Centre d'analyse, de
        prévision et de stratégie (CAPS) du Quai d'Orsay (2018-2023).

  # ── Thèmes visuels : grille Mazzucato ──
  - block: markdown
    id: themes
    content:
      title: ""
      text: |
        <div class="themes-wrapper">
          <h2 class="themes-section-title">Thèmes</h2>
          <div class="theme-grid">
            <a href="/policy/geoeconomie/" class="theme-card">
              <img src="/media/theme-geoeconomie.svg" alt="Géoéconomie & Risques">
              <div class="card-overlay">
                <h3 class="card-title">Géoéconomie & Risques</h3>
                <p class="card-subtitle">Sanctions, compétition technologique, chaînes de valeur, PME européennes</p>
              </div>
            </a>
            <a href="/policy/developpement/" class="theme-card">
              <img src="/media/theme-developpement.svg" alt="Financement du développement">
              <div class="card-overlay">
                <h3 class="card-title">Financement du développement</h3>
                <p class="card-subtitle">Architecture financière, réforme des BMD, dette des PMA, G7</p>
              </div>
            </a>
            <a href="/policy/energie-climat/" class="theme-card">
              <img src="/media/theme-energie-climat.svg" alt="Énergie & Climat">
              <div class="card-overlay">
                <h3 class="card-title">Énergie & Climat</h3>
                <p class="card-subtitle">Subventions aux fossiles, transition juste, risques climatiques financiers</p>
              </div>
            </a>
            <a href="/policy/institutions/" class="theme-card">
              <img src="/media/theme-institutions.svg" alt="Institutions & Gouvernance">
              <div class="card-overlay">
                <h3 class="card-title">Institutions & Gouvernance</h3>
                <p class="card-subtitle">Corruption, fragilité, gouvernance des ressources, économie politique</p>
              </div>
            </a>
          </div>
        </div>

  - block: collection
    id: recent-analyses
    content:
      title: "Analyses récentes"
      count: 6
      filters:
        folders:
          - post
      sort_by: Date
    design:
      view: date-title-summary
---
