# Policy thumbnail prompt templates

The v2 system uses a template-first prompt. The model should not be asked to
"illustrate an article"; it should be asked to execute a reusable editorial
composition that carries one metaphor.

## Policy dark

```text
Create a 16:9 horizontal editorial thumbnail illustration.
Use the Policy-dark register: dark anthracite background, warm off-white main
forms, deep editorial red accent, optional muted ochre, slightly textured
engraving-inspired look.

Template: [TEMPLATE_NAME].
Subject: [TOPIC_METAPHOR].
Show [CENTRAL_SYMBOL] as the dominant visual metaphor. Add only [SECONDARY_1]
and [SECONDARY_2] if they clarify the idea.

Composition rules: one central idea, strong silhouette, high contrast, readable
at 160x90 px, mature current-affairs magazine feel.

No text, no letters, no numbers, no logos, no flags, no photorealism, no public
figures, no generic globe, no childish cartoon, no clutter.
```

## Economist light

```text
Create a 16:9 horizontal conceptual editorial thumbnail illustration.
Use the Economist-light register: warm ivory background, dark ink linework,
limited flat colours, one strong red accent, optional muted blue-grey or ochre,
subtle paper texture.

Template: [TEMPLATE_NAME].
Subject: [TOPIC_METAPHOR].
Show [CENTRAL_SYMBOL] as the dominant visual metaphor. Add only [SECONDARY_1]
and [SECONDARY_2] if they clarify the idea.

Composition rules: one central idea, generous negative space, simple geometry,
readable at 160x90 px, sophisticated current-affairs magazine feel.

No text, no letters, no numbers, no logos, no flags, no photorealism, no public
figures, no generic stock illustration, no childish cartoon, no clutter.
```

## Prompt assembly pseudo-code

```python
def build_prompt(article, template, style, metaphor):
    style_template = TEMPLATES[style]
    return style_template.replace("[TEMPLATE_NAME]", template["name"]) \
        .replace("[TOPIC_METAPHOR]", metaphor["subject"]) \
        .replace("[CENTRAL_SYMBOL]", metaphor["central_symbol"]) \
        .replace("[SECONDARY_1]", metaphor.get("secondary_1", "one supporting object")) \
        .replace("[SECONDARY_2]", metaphor.get("secondary_2", "one directional cue")) \
        + f"\n\nArticle title: {article['title']}\nArticle summary: {article['summary']}"
```

## Template names

- `person spotlight`
- `balance bars`
- `map arrows`
- `broken chart`
- `coins cascade`
- `parliament symbol`
- `pipeline valve`
- `containers bridge`
- `scale vs factories`
- `roundtable flows`
