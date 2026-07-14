/* ============================================================================
   theme-toggle.js — Bascule dark/light pour erickilama.com (v2)
   ----------------------------------------------------------------------------
   v2 patch (29 avril 2026) : propage le changement de palette aux descendants
   qui ont leur propre data-palette (corrige le bug texte invisible sur Policy).

   Comportement :
   - Défaut : dark mode (vivid-editorial / vivid-bloomberg) selon la page
   - Toggle bascule vers la palette light correspondante :
       vivid-bloomberg ↔ bloomberg-light    (Index, Research, Foresight)
       vivid-editorial ↔ editorial-light    (Policy, About, Teaching)
   - Persistance : localStorage clé "erickilama-color-scheme"
                   valeurs "dark" | "light"
   - Met à jour aussi le src des portraits dual sur Index et About :
       portrait-eric-kilama-dark.png  ↔  portrait-eric-kilama-light.png
   - Met à jour les icônes du toggle dans le header (haut-droit)
     ET les liens texte du footer
   - NOUVEAU v2 : synchronise les data-palette descendants (page-body, etc.)
     avec la palette toggleable. Les palettes "spéciales" non-toggleables
     (institutional, bloomberg basique pour data-room Foresight) restent
     intactes.
   ============================================================================ */

(function () {
  'use strict';

  // Mapping : pour chaque palette dark, donne la palette light correspondante
  var DARK_TO_LIGHT = {
    'vivid-bloomberg': 'bloomberg-light',
    'vivid-editorial': 'editorial-light'
  };
  var LIGHT_TO_DARK = {
    'bloomberg-light': 'vivid-bloomberg',
    'editorial-light': 'vivid-editorial'
  };

  // Palettes que le toggle gère (toggleables). Les autres sont préservées.
  var TOGGLEABLE_PALETTES = {
    'vivid-bloomberg': true,
    'vivid-editorial': true,
    'bloomberg-light': true,
    'editorial-light': true
  };

  var STORAGE_KEY = 'erickilama-color-scheme';

  function getCurrentScheme() {
    var html = document.documentElement;
    var palette = html.getAttribute('data-palette') || '';
    return palette.endsWith('-light') ? 'light' : 'dark';
  }

  function getDarkPalette() {
    var html = document.documentElement;
    return html.getAttribute('data-palette-default') || 'vivid-bloomberg';
  }

  /**
   * Propage la palette à tous les descendants qui ont un data-palette
   * appartenant à l'ensemble toggleable. Préserve les data-palette spéciaux
   * (institutional, bloomberg, etc.) qui sont des contextes intentionnels.
   */
  function propagatePaletteToDescendants(targetPalette) {
    var html = document.documentElement;
    var descendants = document.querySelectorAll('[data-palette]');
    descendants.forEach(function (el) {
      if (el === html) return;  // racine déjà gérée
      var current = el.getAttribute('data-palette');
      if (TOGGLEABLE_PALETTES[current]) {
        el.setAttribute('data-palette', targetPalette);
      }
      // Si pas dans TOGGLEABLE_PALETTES (ex. "bloomberg" pour data-room),
      // on ne touche pas — c'est un contexte intentionnel.
    });
  }

  function applyScheme(scheme) {
    var html = document.documentElement;
    var darkPalette = getDarkPalette();
    var targetPalette;

    if (scheme === 'light') {
      targetPalette = DARK_TO_LIGHT[darkPalette] || 'bloomberg-light';
    } else {
      targetPalette = darkPalette;
    }

    html.setAttribute('data-palette', targetPalette);

    // NOUVEAU v2 : propager aux descendants
    propagatePaletteToDescendants(targetPalette);

    // Mettre à jour les portraits dual (index + about)
    var portraits = document.querySelectorAll('.portrait-photo[data-portrait-dual]');
    portraits.forEach(function (img) {
      var basePath = img.getAttribute('data-portrait-dual');
      if (basePath) {
        img.setAttribute('src', basePath.replace('{scheme}', scheme));
      }
    });

    // Mettre à jour les icônes du toggle
    var icons = document.querySelectorAll('[data-theme-icon]');
    icons.forEach(function (icon) {
      icon.setAttribute('data-current', scheme);
    });

    // Mettre à jour les liens du footer
    var darkLinks = document.querySelectorAll('[data-theme-link="dark"]');
    var lightLinks = document.querySelectorAll('[data-theme-link="light"]');
    darkLinks.forEach(function (a) {
      a.classList.toggle('active', scheme === 'dark');
    });
    lightLinks.forEach(function (a) {
      a.classList.toggle('active', scheme === 'light');
    });
  }

  function setScheme(scheme) {
    try {
      localStorage.setItem(STORAGE_KEY, scheme);
    } catch (e) {
      // localStorage indisponible (cookies bloqués) — on bascule en mémoire seulement
    }
    applyScheme(scheme);
  }

  function toggleScheme() {
    var current = getCurrentScheme();
    setScheme(current === 'dark' ? 'light' : 'dark');
  }

  // Init au chargement
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Sauver la palette dark "native" de la page si pas déjà fait
    var html = document.documentElement;
    if (!html.hasAttribute('data-palette-default')) {
      var current = html.getAttribute('data-palette') || 'vivid-bloomberg';
      if (current.endsWith('-light')) {
        html.setAttribute('data-palette-default', LIGHT_TO_DARK[current] || 'vivid-bloomberg');
      } else {
        html.setAttribute('data-palette-default', current);
      }
    }

    // 2. Lire la préférence sauvegardée
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}

    // 3. Appliquer la préférence (défaut = dark)
    var scheme = (stored === 'light') ? 'light' : 'dark';
    applyScheme(scheme);

    // 4. Brancher les boutons toggle (header + footer)
    var toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleScheme();
      });
    });

    // 5. Brancher les liens explicites du footer
    var darkLinks = document.querySelectorAll('[data-theme-link="dark"]');
    var lightLinks = document.querySelectorAll('[data-theme-link="light"]');
    darkLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        setScheme('dark');
      });
    });
    lightLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        setScheme('light');
      });
    });
  });

  // Exposer pour debug console : window.ericTheme.set('light' | 'dark')
  window.ericTheme = {
    set: setScheme,
    toggle: toggleScheme,
    get: getCurrentScheme
  };
})();
