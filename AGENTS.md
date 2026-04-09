# AGENTS.md — Protocole cross-agent pour erickilama.com

Ce fichier décrit le site et ses opérations dans un format consommable par
n'importe quel agent (Claude Code, Codex, Cursor, Aider, Gemini CLI, etc.).
C'est la source de vérité opérationnelle ; toute session doit lire ce fichier
avant d'intervenir sur le site.

**Dernière mise à jour** : 2026-04-09

---

## 1. Vue d'ensemble

- **Domaine** : erickilama.com
- **Hébergement** : GitHub Pages (repo `killergabin-star/site-kilama`, branche `gh-pages`)
- **Générateur** : Hugo v0.156+ extended (thème custom `kilama`)
- **DNS** : OVH, zone signée DNSSEC
- **TLS** : Let's Encrypt R13 → ISRG Root X1, renouvellement auto, HTTPS forcé
- **Déploiement** : script bash `scripts/sync_and_deploy.sh`, exécution manuelle ou via cron
- **Source de vérité contenu** : `~/.config/macrodata/staging/for-site/` (staging cross-session)

## 2. Arborescence critique

```
site-kilama/
├── AGENTS.md                 # ce fichier
├── CLAUDE.md                 # instructions spécifiques Claude Code (design system)
├── hugo.yaml                 # config Hugo (menus, langues, params)
├── content/                  # markdown des pages
│   ├── _index.md            # homepage
│   ├── about/_index.md
│   ├── research/
│   ├── policy/
│   ├── foresight/           # vigie
│   ├── teaching/
│   ├── contact/
│   └── trust.md             # AUTO-GÉNÉRÉ à chaque build, NE PAS éditer à la main
├── themes/kilama/            # thème custom
│   └── layouts/
│       └── partials/footer.html
├── scripts/
│   ├── sync_and_deploy.sh    # pipeline complet build + deploy
│   ├── generate_trust_page.sh # régénère content/trust.md avec empreintes TLS live
│   ├── ingest_staging.py     # ingère staging/for-site/ dans le site
│   └── update_vigie_data.py  # met à jour données vigie
├── public/                   # build Hugo (gitignored)
├── staging/for-site/         # symlink vers ~/.config/macrodata/staging/for-site/
└── data/                     # données JSON pour templates Hugo
```

## 3. Commandes opérationnelles

Toutes les commandes sont à exécuter depuis la racine du repo
(`/Users/killergabin/Documents/Application files/site-kilama/`).

### Build local (dry run)

```bash
hugo --gc --minify --baseURL "https://erickilama.com/"
```

Sortie dans `public/`. Pour prévisualiser :

```bash
hugo server -D --bind 0.0.0.0 --port 1313
```

Puis ouvrir http://localhost:1313/

### Pipeline complet : ingest staging + build + deploy

```bash
bash scripts/sync_and_deploy.sh
```

Étapes effectuées :
1. `python3 scripts/ingest_staging.py` — ingère le staging cross-session
2. `python3 scripts/update_vigie_data.py` — rafraîchit données vigie
3. `bash scripts/generate_trust_page.sh` — régénère empreintes TLS dans `content/trust.md`
4. `hugo --gc --minify --baseURL "https://erickilama.com/"` — build
5. `git add/commit/push` sur branche `main`
6. Deploy vers `gh-pages` branch (force push du contenu `public/` + `CNAME`)

Le script est **idempotent** : si aucun diff n'est détecté après ingest, il skip le déploiement.

### Régénérer uniquement la page /trust/

```bash
bash scripts/generate_trust_page.sh
```

Récupère le cert actuel de `erickilama.com` via `openssl s_client`, extrait les
empreintes (SHA-256, SHA-1, SPKI pin, serial, dates) et écrit `content/trust.md`
avec le template complet. La page /trust/ permet à tout visiteur de vérifier
qu'il reçoit bien le cert officiel et non un cert injecté par un MITM
(profil MDM, VPN, filtre parental, proxy d'entreprise). **Régénéré
automatiquement à chaque `sync_and_deploy.sh`**.

### Vérifier l'état du déploiement GitHub Pages

```bash
gh api repos/killergabin-star/site-kilama/pages
gh api repos/killergabin-star/site-kilama/pages/builds --jq '.[0] | {status, created_at, error}'
```

### Vérifier le cert TLS live

```bash
echo | openssl s_client -servername erickilama.com -connect erickilama.com:443 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -fingerprint -sha256
```

### Rollback déploiement

Le repo `main` garde l'historique complet. `gh-pages` est force-push à chaque
deploy, donc pas d'historique propre. Pour rollback :

```bash
# 1. Revenir à un commit main antérieur
git revert <hash>

# 2. Redéployer
bash scripts/sync_and_deploy.sh
```

Ou pour rollback du contenu `public/` uniquement sans toucher au source :

```bash
git checkout <old-commit> -- content/ data/
bash scripts/sync_and_deploy.sh
```

## 4. Règles éditoriales (critiques, ne jamais enfreindre)

Ces règles sont appliquées par `institutional-format` agent (Claude) et
`scripts/strip_author_lines.py`. Tout agent doit les respecter.

### 4.1. Auteur unique visible

- **Seul auteur visible** : Eric Gabin Kilama.
- Interdit dans tout contenu publié : nom de tiers, nom d'agent, nom de modèle
  ("Claude", "GPT", "Codex"), mentions d'infrastructure ("pipeline", "board",
  "consultation", numéro de version d'outil).
- Les agents sont des outils invisibles ; leur trace éditoriale est nulle.

### 4.2. MEAE / CAPS — formulation obligatoire

- **Interdit** : "il a été", "ancien", "ex-", tout passé composé concernant le
  CAPS ou le MEAE.
- **Autorisé** :
  - *"Son expérience au CAPS du Quai d'Orsay a forgé sa conviction que la
    géopolitique est redevenue une variable structurelle de l'économie mondiale."*
  - *"Macroéconomiste de formation, analyste stratégique par expérience."*
  - Badges : *"CAPS-MEAE"* ou *"CAPS — Quai d'Orsay"* (sans verbe, neutre)

### 4.3. BETA / Université de Lorraine — interdiction totale

- **Zéro mention** de BETA ou Université de Lorraine n'importe où dans le site.
- Remplacer par FERDI, CERDI, ou omettre.
- S'applique à : templates, contenu, metadata, bios, badges, footers,
  attributions, publications.

### 4.4. Accents français

- **Tous les mots français** doivent porter leurs accents corrects (é, è, ê, à,
  â, ù, ô, î, ï, ç, œ).
- L'auxiliaire *a* (avoir) n'a **pas** d'accent ; la préposition *à* en a un.
- **Jamais** de script Python qui "restaure" les accents après coup ; écrire
  correct dès la première frappe.

## 5. Staging cross-session

Le répertoire `staging/for-site/` est un **symlink** vers
`~/.config/macrodata/staging/for-site/`. Tout agent qui produit du contenu
site-worthy doit déposer un signal dans ce répertoire au format :

```markdown
# Signal Site-Bridge

type: publication_entry | policy_note | dossier_update | analysis_note
source: /chemin/vers/le/fichier/produit.md
target: data/policy/notes.json | data/publications/index.json | ...
priority: high | medium | low
restriction: null | defense_sensitive | embargo | co_author_approval
status: ready | draft | needs_review

## Content
{titre, résumé, tags — assez pour que l'ingest puisse créer l'entrée JSON}
```

Nom du fichier : `{YYYY-MM-DD}_{type}_{slug}.md`
Exemple : `2026-04-09_note_polycrisis-asie.md`

`scripts/ingest_staging.py` est appelé au début de `sync_and_deploy.sh` et
réconcilie les signaux dans les fichiers JSON de données du site.

## 6. Protocole /trust/ (authenticité TLS)

**URL** : https://erickilama.com/trust/
**Aliases** : /security/, /verify/, /verification/, /securite/

La page /trust/ expose :
- Empreinte SHA-256 du cert live
- Empreinte SHA-1
- Pin SPKI (SHA-256 base64)
- Numéro de série
- Dates de validité
- Autorité émettrice + racine de confiance
- Liens crt.sh et Google Certificate Transparency
- Procédure de vérification manuelle (openssl + navigateur)
- Causes fréquentes d'avertissement TLS et procédure de diagnostic

Si un utilisateur signale un avertissement "connexion non privée" :
1. Lui pointer https://erickilama.com/trust/
2. Lui demander de comparer l'empreinte affichée dans son warning avec celle
   de la page officielle
3. Si différente → interception client-side (MDM, VPN, filtre parental,
   horloge déréglée, OS trop ancien). Le site est sain, c'est l'environnement
   du lecteur qui réécrit la connexion.

**Aucune action côté serveur** ne peut bypasser un MITM client-side avec root
CA installé. C'est une limitation fondamentale de PKI. La page /trust/ est le
seul outil utilisable dans ce cas.

## 7. Pointeurs vers protocoles partagés

- **Protocole agents cross-session** (convention AGENTS.md globale, scripts
  partagés) : `~/.config/macrodata/entities/protocols/agents-cross-protocol.md`
- **Multi-model consultation** : `~/.config/macrodata/entities/protocols/multi-model-consultation.md`
- **Clone design / extraction web** : `~/.config/macrodata/entities/protocols/clone-extraction-cross-agent.md`
- **Extraction de données (APIs, PDF, littérature)** : `~/.config/macrodata/entities/protocols/data-extraction-cross-agent.md`

## 8. Responsabilités par agent

| Agent | Usage recommandé | Commandes |
|---|---|---|
| **Claude Code** (Opus 4.6) | Rédaction éditoriale longue, refactoring thème, gates qualité, debug Hugo | Skills `/verify-style`, `/consult-board`, `institutional-format` agent, gates G1-G6 |
| **Codex** (GPT) | Review de code bash/Python, second-opinion sur architecture, extraction rapide | `codex exec "..."` ou `codex review` |
| **Skills CLI portables** | Scripts exécutables agent-agnostiques | Voir `~/.config/macrodata/scripts/` |

Tout agent qui modifie le site doit :
1. Lire ce fichier (`AGENTS.md`) d'abord
2. Respecter les règles éditoriales section 4
3. Ne jamais pousser sans build local qui passe
4. Ne jamais toucher à `content/trust.md` à la main (auto-généré)
5. Ne jamais bypasser les hooks pre-commit (`--no-verify` interdit)

## 9. Incidents connus et apprentissages

- **2026-04-09** — Gilles voit un warning Safari "connexion non privée" sur
  iPhone LTE. Diagnostic complet : serveur sain. Cause probable : profil
  MDM/VPN/filtre client-side. Action : création de la page /trust/. Voir section 6.
- **2026-03-30** — Deux répertoires staging distincts causent perte de
  synchronisation. Fix : symlink unique vers `~/.config/macrodata/staging/for-site/`.
- **Netlify abandonné** en faveur de GitHub Pages suite à dépassement de quota
  free tier.

## 10. Contact

- Email : kilamaericgabin@yahoo.fr
- Repo : https://github.com/killergabin-star/site-kilama
- URL live : https://erickilama.com/
- Page d'authenticité : https://erickilama.com/trust/
