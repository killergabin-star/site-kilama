// ============================================================
// KILAMA PIPELINE — Site-wide content loader
// ============================================================
// Vanilla JS. No framework, no build step. Hugo-transferable.
// Pattern: fetch JSON → cache → render into DOM containers.
// Fallback: hardcoded HTML stays if JSON fails to load.

var KilamaPipeline = (function() {
  'use strict';

  var DATA_BASE = 'data/';
  var cache = {};

  // Fetch JSON with caching + optional fallback
  function load(path, fallback) {
    if (cache[path]) return Promise.resolve(cache[path]);
    return fetch(DATA_BASE + path)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        cache[path] = data;
        return data;
      })
      .catch(function(err) {
        console.warn('[Pipeline] Failed to load ' + path + ':', err.message);
        if (fallback !== undefined) {
          cache[path] = fallback;
          return fallback;
        }
        return null;
      });
  }

  // Load multiple paths in parallel
  function loadAll(paths) {
    return Promise.all(paths.map(function(p) {
      if (typeof p === 'string') return load(p);
      return load(p.path, p.fallback);
    }));
  }

  // Render content into a DOM element via a template function
  function render(elementId, templateFn, data) {
    var el = document.getElementById(elementId);
    if (!el || data == null) return false;
    el.innerHTML = templateFn(data);
    return true;
  }

  // Clear cache for a specific path or all
  function invalidate(path) {
    if (path) delete cache[path];
    else cache = {};
  }

  return {
    load: load,
    loadAll: loadAll,
    render: render,
    invalidate: invalidate,
    cache: cache,
    DATA_BASE: DATA_BASE
  };
})();

// ============================================================
// DOSSIER MANAGER — Topic switching for Vigie Dashboard
// ============================================================

var DossierManager = (function() {
  'use strict';

  var DOSSIER_PATH = 'vigie/dossiers/';
  var activeDossier = null;
  var registry = null;
  var onSwitch = null; // callback(dossierData)

  // Load the dossier registry (_index.json)
  function loadRegistry() {
    return KilamaPipeline.load(DOSSIER_PATH + '_index.json').then(function(data) {
      registry = data;
      return data;
    });
  }

  // Load a specific dossier by ID
  function loadDossier(dossierId) {
    return KilamaPipeline.load(DOSSIER_PATH + dossierId + '.json').then(function(data) {
      activeDossier = data;
      if (onSwitch) onSwitch(data);
      return data;
    });
  }

  // Switch to a dossier (with URL hash update)
  function switchTo(dossierId) {
    window.location.hash = 'dossier=' + dossierId;
    return loadDossier(dossierId);
  }

  // Get dossier ID from URL hash, or use default
  function getDossierFromHash() {
    var hash = window.location.hash;
    var match = hash.match(/dossier=([a-z0-9-]+)/);
    return match ? match[1] : null;
  }

  // Initialize: load registry, resolve dossier from hash or default
  function init(callback) {
    onSwitch = callback;
    return loadRegistry().then(function(reg) {
      var dossierId = getDossierFromHash() || (reg && reg.default_dossier) || 'polycrisis';
      return loadDossier(dossierId);
    });
  }

  // Listen for hash changes (back/forward navigation)
  window.addEventListener('hashchange', function() {
    var id = getDossierFromHash();
    if (id && (!activeDossier || activeDossier.meta.id !== id)) {
      loadDossier(id);
    }
  });

  return {
    init: init,
    switchTo: switchTo,
    loadRegistry: loadRegistry,
    getActive: function() { return activeDossier; },
    getRegistry: function() { return registry; },
    getDossierFromHash: getDossierFromHash
  };
})();
