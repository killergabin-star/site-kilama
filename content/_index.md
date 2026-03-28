---
title: ""
date: 2026-03-27
type: landing

design:
  spacing: "0"

sections:
  # ── Hero : promesse, pas biographie ──
  - block: hero
    id: hero
    content:
      title: |
        Quantifier les chocs
        géopolitiques
      text: |
        Sanctions, coups d'État, guerres commerciales, fragmentation des chaînes de valeur :
        ces chocs ne restent jamais confinés à la sphère politique. Ils se propagent à l'économie
        par des canaux identifiables et mesurables.

      primary_action:
        text: Dernier rapport
        url: /policy/
      secondary_action:
        text: Explorer Vigie
        url: /foresight/
    design:
      css_class: dark
      background:
        color: black

  # ── Mini-bio : qui est Eric Kilama ──
  - block: markdown
    id: intro-bio
    content:
      title: ""
      text: |
        <div class="intro-bio-section">
          <div class="intro-bio-content">
            <p class="intro-bio-lead">Eric Kilama est économiste-stratège. Son programme de recherche porte sur une question simple aux implications immenses : <strong>comment les chocs géopolitiques se transmettent-ils à l'économie, et peut-on les mesurer ?</strong></p>
            <p>Il combine économétrie causale, données massives et prospective quantitative pour analyser l'impact des coups d'État, sanctions, guerres commerciales et rivalités de puissances sur les États, les entreprises et l'architecture du financement du développement.</p>
            <a href="/about/" class="intro-bio-link">En savoir plus &rarr;</a>
          </div>
        </div>

  # ── Programme de recherche — 4 niveaux d'analyse ──
  - block: markdown
    id: programme
    content:
      title: ""
      text: |
        <div class="research-programme">
          <h2 class="section-label">Programme de recherche</h2>
          <div class="programme-grid">
            <div class="programme-card">
              <span class="programme-level">États</span>
              <p>Comment l'instabilité politique altère les institutions et les comportements économiques. Coups d'État, corruption, choix professionnels, fragilités institutionnelles.</p>
              <a href="/research/institutions/" class="programme-link">Institutions &rarr;</a>
            </div>
            <div class="programme-card">
              <span class="programme-level">Entreprises</span>
              <p>L'impact concret du risque géopolitique sur l'investissement, l'emploi et la survie des PME. 337 000 entreprises, 79 pays.</p>
              <a href="/research/geoeconomie/" class="programme-link">Géoéconomie &rarr;</a>
            </div>
            <div class="programme-card">
              <span class="programme-level">Système international</span>
              <p>La géopolitique redessine l'architecture de l'aide et du financement du développement. Chine bailleur alternatif, fragmentation des alliances.</p>
              <a href="/research/developpement/" class="programme-link">Développement &rarr;</a>
            </div>
            <div class="programme-card">
              <span class="programme-level">Prospectif</span>
              <p>Comprendre ne suffit pas — il faut anticiper. Le framework <em>Vigie</em> produit des scénarios conditionnels avec signposts et probabilités.</p>
              <a href="/foresight/" class="programme-link">Foresight &rarr;</a>
            </div>
          </div>
        </div>

  # ── Dernières publications ──
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

  # ── Sections du site — navigation par blocs ──
  - block: markdown
    id: sections-nav
    content:
      title: ""
      text: |
        <div class="sections-nav">
          <a href="/research/" class="section-nav-card">
            <h3>Research</h3>
            <p>Articles et working papers qui identifient les mécanismes de transmission des chocs géopolitiques aux économies nationales et aux entreprises.</p>
          </a>
          <a href="/policy/" class="section-nav-card">
            <h3>Policy</h3>
            <p>Notes et rapports pour décideurs sur les conséquences économiques des coups d'État, sanctions, guerres commerciales et reconfigurations de l'aide.</p>
          </a>
          <a href="/foresight/" class="section-nav-card">
            <h3>Foresight</h3>
            <p>Scénarios quantifiés des trajectoires géopolitiques et économiques, avec signposts, probabilités et indicateurs d'alerte.</p>
          </a>
          <a href="/teaching/" class="section-nav-card">
            <h3>Teaching</h3>
            <p>Cours et séminaires en économétrie causale, macroéconomie appliquée et économie politique internationale.</p>
          </a>
        </div>

  # ── Citation ──
  - block: markdown
    id: citation
    content:
      title: ""
      text: |
        <div class="pull-quote-section">
          <blockquote class="pull-quote">
            <p>Cette approche — économétrie causale pour identifier les mécanismes, données massives pour mesurer les effets, prospective quantitative pour anticiper les trajectoires — constitue une intelligence géopolitique rigoureusement chiffrée, au service des décideurs.</p>
          </blockquote>
        </div>
---
