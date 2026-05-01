# Recherche outil — thumbnails Policy

Date : 2026-04-30

## Diagnostic

Les deux directions produites localement ne suffisent pas.

- `imagegen` intégré produit des visuels propres, mais revient trop facilement vers un registre institutionnel sombre et homogène.
- Le SVG/canvas codé donne du contrôle, mais le résultat reste trop naïf si l’on n’a pas une vraie bibliothèque de formes dessinées par un illustrateur.
- Les captures Economist / Foreign Affairs indiquent une autre cible : illustration éditoriale adulte, métaphore immédiate, aplats colorés, composition très lisible, mais exécution graphique professionnelle.

Conclusion : pour ce chantier, il faut tester un outil spécialisé en génération avec référence de style, ou une vraie chaîne locale type ComfyUI/FLUX avec références. Le dessin codé peut rester utile pour prototypes et briefs, pas comme moteur final.

## État local

Outils disponibles localement :

- ImageMagick : disponible.
- Node : disponible.
- `imagegen` Codex : disponible.
- ComfyUI / Stable Diffusion / FLUX local : non trouvé.
- Illustrator / Photoshop / Affinity / Krita / Inkscape : non trouvé, sauf Adobe Acrobat.
- Clés API visibles dans l’environnement : aucune (`OPENAI`, `RECRAFT`, `IDEOGRAM`, `BFL`, `FAL`, `REPLICATE`, `STABILITY` non trouvées).

Banque locale déjà conservée :

- Générations `imagegen` : `editorial/thumbnails/style-lab/archive/imagegen-2026-04-30/`
- Captures de référence : `editorial/thumbnails/style-lab/reference/economist-foreignaffairs-reference-contact-sheet.jpg`
- Essais SVG codés : `editorial/thumbnails/style-lab/drawn-v1/` et `editorial/thumbnails/style-lab/drawn-v2/`

## Outils à tester

### 1. Recraft API — piste prioritaire

Pourquoi :

- Recraft est orienté design/illustration plutôt que pur photoréalisme.
- L’API permet la génération raster et vectorielle.
- Elle permet de créer un style à partir d’images de référence.
- Elle permet aussi de générer en vectoriel via les modèles V3 vectoriels, avec des styles comme `Editorial`, `Engraving`, `Cutout`, `Linocut`, `Sharp contrast`.

Ce que disent les docs :

- `style_id` permet d’utiliser un style comme référence visuelle, mais les styles sont surtout compatibles avec les modèles V2/V3.
- `POST /v1/styles` accepte des images de référence pour créer un style.
- La création de style accepte jusqu’à 5 images, total 5 MB.
- Les styles de base incluent `realistic_image`, `digital_illustration`, `vector_illustration`, `icon`.
- Les modèles incluent `recraftv4`, `recraftv4_vector`, `recraftv4_pro`, `recraftv4_pro_vector`, mais les docs indiquent que les styles ne sont pas encore supportés pour V4. Pour notre test de référence stylistique, utiliser `recraftv3` et `recraftv3_vector`.

Test recommandé :

- Créer un style `digital_illustration` à partir de 3 à 5 crops représentatifs des captures Economist/Foreign Affairs.
- Générer 4 articles pilotes : Ormuz, Borrowers Platform, PME, Sanctions.
- Comparer `recraftv3` et `recraftv3_vector`.
- Ne pas demander “style Economist” ou “style Foreign Affairs”; demander une logique : editorial magazine illustration, mature, flat color, sharp metaphor, restrained palette.

### 2. Ideogram API — bonne piste de contrôle palette/style

Pourquoi :

- Ideogram API accepte `style_reference_images`.
- Elle accepte aussi une `color_palette` explicite.
- Style types disponibles : `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN`, `FICTION`.

Ce que disent les docs :

- `style_reference_images` accepte des images JPEG/PNG/WebP, total 10 MB.
- `color_palette` peut être définie par des hexadécimaux.
- Les liens d’images générées sont temporaires, donc il faut télécharger immédiatement les résultats.

Test recommandé :

- Mode `DESIGN`.
- Palette : ivoire, noir, rouge analytique, bleu sourd, jaune pâle, vert sourd.
- Référence style : 3 à 5 crops plutôt clairs et dessinés.
- `magic_prompt=OFF` pour éviter que l’outil réinterprète trop.

### 3. Midjourney — excellent pour exploration, moins bon pour pipeline

Pourquoi :

- Très bon pour retrouver des registres éditoriaux adultes.
- Fonction `--sref` dédiée aux références de style.

Limite :

- Pas un pipeline local/API propre pour Hugo.
- Très utile pour produire une banque initiale ou des références, moins pour automatiser 66 articles.

Test recommandé :

- Utiliser les captures comme style references via `--sref`.
- Prompts courts centrés sur le contenu, pas sur les instructions.
- Générer 4 lots de style : flat editorial, cut-paper, engraving, object-metaphor.

### 4. FLUX Kontext / ComfyUI — piste locale robuste mais plus lourde

Pourquoi :

- FLUX Kontext combine texte et image de référence.
- Il existe une variante open-weight `FLUX.1-Kontext-dev` sur Hugging Face.
- Pertinent pour construire un pipeline local si on accepte une installation lourde.

Limite :

- Rien n’est installé localement.
- Il faut une machine/config GPU adaptée ou passer par BFL / Replicate / fal.ai.

Test recommandé :

- Si API BFL disponible : tester `flux-kontext-pro` sur une image de référence claire + prompt article.
- Si pipeline local : installer ComfyUI + nœuds FLUX/ControlNet/IP-Adapter, puis constituer un style pack.

### 5. OpenAI Images API — utile mais pas la meilleure piste pour ce problème précis

Pourquoi :

- Le modèle peut prendre plusieurs images d’entrée en mode édition/API.
- Mais notre usage actuel via outil intégré n’a pas assez respecté le style de référence.

Test recommandé seulement si une clé API est fournie :

- Utiliser l’API/CLI, pas seulement l’outil intégré.
- Passer la planche de référence comme image d’entrée.
- Demander une seule vignette à la fois, pas une planche de 12.
- Qualité haute, format 16:9, itérations courtes.

## Décision proposée

La piste la plus sérieuse est Recraft en premier, Ideogram en second.

Ordre recommandé :

1. Préparer 5 crops de référence non destinés à être copiés, mais à extraire le langage visuel.
2. Tester Recraft `digital_illustration` avec `style_id`.
3. Tester Recraft `recraftv3_vector` pour voir si le SVG peut être assez adulte.
4. Tester Ideogram avec `style_reference_images` + `color_palette`.
5. Si aucun des deux ne convainc, passer à Midjourney pour constituer la banque manuelle, puis intégrer les fichiers validés dans Hugo.

## Garde-fous

- Ne pas copier les images Economist / Foreign Affairs.
- Ne pas imiter un illustrateur vivant identifié.
- Utiliser les références pour extraire : aplats, densité, cadrage, rythme, humour visuel, niveau de détail.
- Pour les images finales : chaque vignette doit être dérivée de la thèse de l’article, pas d’une catégorie vague.
- Tout fichier final doit être conservé localement et lié à son prompt/source.

## Sources consultées

- Recraft API — styles et création de style : https://www.recraft.ai/docs/api-reference/styles
- Recraft API — endpoints : https://www.recraft.ai/docs/api-reference/endpoints
- Recraft examples — style creation and vector generation : https://www.recraft.ai/docs/api-reference/examples
- Ideogram API — style reference images and color palette : https://developer.ideogram.ai/api-reference/api-reference/generate-v3
- Ideogram docs — style reference workflow : https://docs.ideogram.ai/using-ideogram/features-and-tools/reference-features/style-reference
- Midjourney docs — style reference best practices : https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference
- BFL / FLUX Kontext docs : https://docs.bfl.ai/api-reference/models/edit-or-create-an-image-with-flux-kontext-pro
- OpenAI image prompting guide : https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide
