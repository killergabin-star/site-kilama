# Protocole de test — style référence adulte

Objectif : obtenir une grammaire de thumbnails proche de l’intelligence visuelle observée dans les captures Economist / Foreign Affairs, sans copier leurs images ni leur identité.

## Hypothèse

Les prompts seuls ne suffisent pas. Il faut :

1. Un outil avec **référence de style réelle**.
2. Des prompts courts centrés sur le contenu.
3. Un test article par article, pas une planche de 12 d’un coup.
4. Une sélection stricte : chaque image doit raconter le mécanisme de l’article en moins d’une seconde.

## Pack de référence local

- Référence source : `reference/economist-foreignaffairs-reference-contact-sheet.jpg`
- Banque produite précédemment : `archive/imagegen-2026-04-30/`
- Essais non retenus mais conservés : `drawn-v1/`, `drawn-v2/`

À préparer avant test externe :

- 3 crops plutôt Economist : dessins clairs, aplats, trait adulte, métaphore simple.
- 2 crops plutôt Foreign Affairs : composition sombre, objet symbolique, sobriété.
- 1 image palette erickilama : ivoire / noir / rouge analytique / bleu sourd.

Important : ces crops servent seulement de référence de langage visuel. Les images finales doivent être originales.

## Test 1 — Recraft

Piste prioritaire.

Réglages :

- Base style : `digital_illustration`
- Modèle : `recraftv3`
- Variante vectorielle : `recraftv3_vector`
- Style de référence : créer un `style_id` avec 3 à 5 crops.
- Éviter `recraftv4` pour ce test si le `style_id` n’est pas pris en charge.

Prompts courts :

### Ormuz

```text
A narrow sea chokepoint becomes a delayed food-security shock: ships halted at a red gate, fertilizer, fuel, currency and aid channels flowing into a dry African grain field. Mature editorial magazine illustration, no text.
```

### Borrowers Platform

```text
Debtor countries finally coordinate: many small chairs form a circle facing a heavy creditor table, but the legal toolkit in the middle is still locked. Mature editorial magazine illustration, no text.
```

### PME

```text
Small European factories are squeezed by a red clamp: costs enter, prices cannot pass through, investment is blocked. Mature editorial magazine illustration, no text.
```

### Sanctions

```text
Sanctions reroute value: blocked oil routes become shadow routes, a tilted scale shows costs falling elsewhere. Mature editorial magazine illustration, no text.
```

Critère de réussite :

- Pas d’effet “logo corporate”.
- Pas d’effet “infographie sombre”.
- Pas d’effet enfantin.
- Métaphore lisible à 200 × 113 px.
- Trait/texture assez adulte pour une page Policy.

## Test 2 — Ideogram

Réglages :

- Endpoint : `ideogram-v3/generate`
- `style_type=DESIGN`
- `magic_prompt=OFF`
- `aspect_ratio=16x9`
- `style_reference_images` : 2 ou 3 crops
- `color_palette` explicite :
  - `#101014`
  - `#FFF7E8`
  - `#E63846`
  - `#7CB7E6`
  - `#F4CC58`
  - `#8BCB8F`

Prompts : reprendre les prompts courts du test Recraft.

Critère de réussite :

- Plus proche du dessin presse que de l’illustration corporate.
- Variété entre articles.
- Bonne tenue à petite taille.

## Test 3 — Midjourney

Piste exploratoire, non automatisée.

Réglages :

- Utiliser `--sref` avec 2 ou 3 références.
- Tester `--sv 6` puis `--sv 4`.
- Tester `--sw` entre 100 et 300.
- Ne pas surcharger le prompt : décrire le contenu, pas le style.

Exemple :

```text
small European factories squeezed by a red clamp, costs enter but prices cannot pass through, investment blocked, no text --ar 16:9 --sref <ref1> <ref2> --sv 6 --sw 200
```

Critère de réussite :

- Si Midjourney produit la direction la plus adulte, l’utiliser pour constituer une banque initiale manuelle.
- Le pipeline automatisé restera Recraft/Ideogram/FLUX.

## Test 4 — FLUX Kontext

Piste pipeline robuste si API ou installation disponible.

Réglages BFL :

- Endpoint : `flux-kontext-pro`
- `input_image` à `input_image_4` possibles.
- `aspect_ratio=16:9`
- `prompt_upsampling=false`
- `output_format=png`

Critère de réussite :

- Respect supérieur des références.
- Variété adulte.
- Moins de “style corporate”.

## Décision après benchmark

Score chaque outil sur 5 :

| Critère | Description |
|---|---|
| Fidélité article | L’image raconte-t-elle le mécanisme ? |
| Maturité visuelle | Est-ce adulte, presse premium, non enfantin ? |
| Cohérence série | Les images cohabitent-elles sur Policy ? |
| Variété | Peut-on éviter 66 images du même registre ? |
| Intégration site | Export propre, droits, archivage, taille web |

Garder l’outil qui dépasse 20/25 sur les 4 articles pilotes.

## Préférence actuelle

1. Recraft si le `style_id` donne une vraie illustration adulte.
2. Ideogram si la palette et le mode `DESIGN` sont plus disciplinés.
3. Midjourney si on accepte une banque manuelle.
4. FLUX Kontext si on veut investir dans un pipeline plus lourd.
