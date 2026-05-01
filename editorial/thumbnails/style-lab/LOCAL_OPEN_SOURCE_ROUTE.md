# Route locale open source — thumbnails Policy

Date : 2026-04-30

## Position claire

On ne contourne pas les crédits/API de Recraft, Ideogram, BFL ou OpenAI.

Ce qui est possible et propre :

- utiliser Claude/Codex comme directeur artistique, critique, générateur de prompts et évaluateur;
- utiliser des modèles open source localement;
- utiliser des comptes web personnels dans leur interface normale, si les conditions d’usage le permettent;
- installer une chaîne locale sur le T7 pour éviter de saturer le disque interne.

Ce qui n’est pas une bonne voie :

- automatiser des comptes web de façon non prévue pour éviter une API payante;
- utiliser Claude comme proxy pour accéder à un service image payant;
- exploiter des démos publiques Hugging Face/Gradio comme backend de production.

## Contrainte machine

Machine détectée :

- Apple M1
- 8 GB RAM
- disque interne : environ 18 GB libres
- T7 : environ 189 GB libres

Conséquence :

- FLUX local complet sera probablement très lent ou instable.
- SDXL local est possible mais avec modèles légers/optimisés.
- Le meilleur compromis local est probablement **Draw Things** sur macOS, ou **ComfyUI** installé sur le T7 avec modèles SDXL Turbo/Lightning et éventuellement IP-Adapter.

## Option A — Draw Things

Piste la plus simple sur Mac Apple Silicon.

Rôle :

- générer manuellement les 10 à 20 premiers thumbnails adultes;
- tester rapidement des styles avec modèles optimisés;
- exporter PNG/WebP puis intégrer dans Hugo.

Limites :

- pas idéal pour pipeline automatisé;
- réglages manuels;
- qualité dépend du modèle installé.

Usage recommandé :

1. Installer Draw Things.
2. Charger un modèle SDXL/Lightning ou FLUX Schnell si disponible dans l’app.
3. Utiliser nos crops de référence comme guide visuel.
4. Générer article par article, pas en planche.
5. Exporter vers `editorial/thumbnails/style-lab/local-open-source/outputs/`.

## Option B — ComfyUI local sur T7

Piste reproductible mais plus lourde.

Emplacement proposé :

`/Volumes/T7 sharing/ai-image-lab/ComfyUI`

Modules à viser :

- ComfyUI
- PyTorch MPS
- modèle SDXL léger ou Turbo/Lightning
- IP-Adapter ou un mécanisme de référence style si compatible
- ControlNet lineart/scribble uniquement si nécessaire

Pourquoi pas FLUX tout de suite :

- FLUX est meilleur mais beaucoup plus lourd.
- Sur M1 8 GB, commencer par SDXL léger permet de vérifier le workflow avant de télécharger des poids massifs.

## Option C — pipeline Python diffusers minimal

Piste scriptable, mais probablement moins confortable que ComfyUI pour l’itération visuelle.

Préconditions :

- Python 3.10/3.11 recommandé.
- `diffusers`, `transformers`, `accelerate`, `torch`.
- Modèle compatible MPS.

Problème actuel :

- Seul Python 3.13 est visible comme runtime système.
- `torch` et `transformers` sont présents, `diffusers` non.
- Installer tout directement dans l’environnement système n’est pas recommandé.

## Modèles candidats

### Démarrage léger

- SDXL Turbo / SDXL Lightning : rapide, bon pour itérer, moins fin.
- DreamShaper XL / Juggernaut XL / RealVisXL : souvent bons pour illustration, mais vérifier licences.

### Style référence

- IP-Adapter Plus SDXL : pour injecter un langage visuel depuis les captures.
- ControlNet lineart/scribble : pour garder la composition.

### FLUX

- FLUX.1 Schnell : open weights, rapide relativement, mais lourd.
- FLUX.1 Dev/Kontext : meilleure qualité, licences et ressources à vérifier avant usage de production.

## Plan d’action recommandé

1. Garder Recraft/Ideogram comme piste API si une clé devient disponible.
2. Installer une piste locale **Draw Things** pour exploration immédiate.
3. Installer ComfyUI sur le T7 si l’on veut reproductibilité et batch.
4. Produire 4 pilotes adultes : Ormuz, Borrowers Platform, PME, Sanctions.
5. Si le rendu atteint le niveau presse, étendre à 12 puis à 66 articles.

## Prompts locaux courts

Ne pas utiliser les longues planches de prompts.

Forme :

```text
Adult editorial magazine illustration. [Article mechanism in one sentence]. Strong visual metaphor, flat colour, refined ink line, subtle paper texture, no text, no logos, no flags, no public figures, not childish, not corporate.
```

Exemple Ormuz :

```text
Adult editorial magazine illustration. A narrow sea chokepoint closed by a red barrier sends four delayed shock channels — fertilizer, fuel, currency, aid — into a dry African grain field. Strong visual metaphor, flat colour, refined ink line, subtle paper texture, no text, no logos, no flags, no public figures, not childish, not corporate.
```

## Sources utiles

- ComfyUI : https://github.com/comfyanonymous/ComfyUI
- FLUX.1 Schnell : https://huggingface.co/black-forest-labs/FLUX.1-schnell
- FLUX.1 Dev : https://huggingface.co/black-forest-labs/FLUX.1-dev
- Diffusers : https://github.com/huggingface/diffusers
- IP-Adapter : https://github.com/tencent-ailab/IP-Adapter
