# AUDIT: Site Content Pipeline Failure

**Date**: 2026-04-01
**Auditor**: Independent (Claude Code)
**Scope**: Full trace of content flow from production to erickilama.com
**Verdict**: TOTAL PIPELINE FAILURE — zero automated content reaches the deployed site

---

## 1. Pipeline Diagram

### INTENDED FLOW

```
Research Production        Cowork Pipelines         Cron Dispatcher
(papers, notes, FPSQ)     (01, 02, 10, 12)        (launchd every 10min)
        |                       |                        |
        v                       v                        v
  staging/for-site/  <---  Cowork 12 scan  <---  cron: 42 18 * * 0
  (signal drop zone)       (weekly Sunday)       (Sunday 18:42)
        |                       |
        v                       v
  site-bridge/registry.json + queue.json
        |
        v
  Eric validates ("publie Q001")
        |
        v
  Virtual Team processes
  (editor/data_engineer/analyst)
        |
        v
  data/ directory (Hugo)
  - data/publications/index.json
  - data/policy/notes.json
  - data/vigie/dossiers/*.json
  - data/fpsq/*.json
        |
        v
  Hugo templates consume data
        |
        v
  erickilama.com (live)
```

### ACTUAL FLOW

```
Research Production           staging/for-site/
(papers, notes, FPSQ)   -->  82 files deposited
        |                          |
        v                          v
  staging/for-site/ EXISTS    site-bridge/ EXISTS
  (82 markdown files)         (config + registry + queue)
        |                          |
        X BREAK 1                  X BREAK 2
        |                          |
  Cowork 12 NEVER RUNS        Queue has 9 items
  (not in cron schedule)       (7 pending, 2 validated)
                                   |
                                   X BREAK 3
                                   |
                              No processing occurs
                              (validated items sit forever)
                                   |
                                   X BREAK 4
                                   |
                              data/ DIRECTORY IS EMPTY
                              (only data/themes/kilama.yaml)
                              NO publications, policy, vigie,
                              fpsq subdirectories exist
                                   |
                                   X BREAK 5
                                   |
                              Hugo templates use ZERO data files
                              ALL content is hardcoded HTML
                              in layout templates
                                   |
                                   v
                              erickilama.com shows
                              STATIC HARDCODED CONTENT
```

---

## 2. Failure Points — Detailed Analysis

### BREAK 1: Cowork 12 was never registered in the cron dispatcher
**Classification**: (b) Built but never connected
**Evidence**:
- `schedule_state.json` contains 11 registered jobs. NONE is Cowork 12.
- `dispatcher.log` shows 18 EXEC entries (28 Mar - 31 Mar). ZERO mention "site", "bridge", or "cowork-12".
- The cron spec says `42 18 * * 0` (Sunday 18:42). Sunday 30 March passed. No execution.
- Cowork 12 spec exists at `~/.config/macrodata/entities/cowork/12_site-content-bridge.md` (134 lines, fully specified).
- A briefing log from 31 March explicitly notes: `Cowork 12 — site content bridge (dim. 30 mars) | **ABSENT**`
- The system SAW it was absent and did nothing about it.

**Root cause**: The job was designed but never added to the cron dispatcher's schedule. The dispatcher only runs jobs it knows about. Nobody ran the registration step.

### BREAK 2: staging/for-site/ has 82 files but no consumer
**Classification**: (b) Built but never connected
**Evidence**:
- The symlink works correctly: `site-kilama/staging/for-site -> ~/.config/macrodata/staging/for-site`
- 82 files deposited between 30 March and 31 March
- Includes: 21 notes, 13 LinkedIn articles, 5 reports, 5 briefs, 2 controverses, review files, governance docs, page content drafts
- The archive directory exists but is empty (0 files consumed and archived)
- Per the protocol, Cowork 12 Phase 0 was supposed to consume these signals. It never ran.

**Root cause**: The producer side works. Sessions deposited signals. But the consumer (Cowork 12) never ran.

### BREAK 3: Queue items validated but never processed
**Classification**: (a) Never built — no processing engine exists
**Evidence**:
- `queue.json` has 9 items. Q008 and Q009 are status "validated" (the Gopinath-Pettis and Hickel controverses).
- The Cowork 12 spec describes a "Processing" phase with virtual team roles (editor, data_engineer, analyst, strategist, qa_reviewer).
- There is NO code, script, or automation that performs this processing.
- The spec says: "When Eric validates an item, the assigned team role executes." But this is a SPECIFICATION, not an IMPLEMENTATION.
- No skill, no cron job, no hook, no script converts a validated queue item into a `data/*.json` file.
- The entire "virtual team" is a design document. It describes what should happen. Nothing makes it happen.

**Root cause**: The processing step was designed as a Claude conversation-level task ("Eric says 'publie Q001' and the assigned role executes"). This requires a live Claude session to be running and aware of the queue. No persistent automation exists to bridge queue validation to file creation.

### BREAK 4: Hugo data/ directory is empty
**Classification**: (a) Never built
**Evidence**:
- `data/` contains only `data/themes/kilama.yaml` (Hugo theme config)
- No `data/publications/` directory
- No `data/policy/` directory
- No `data/vigie/` directory
- No `data/fpsq/` directory
- `config.json` references `data/publications/index.json`, `data/policy/notes.json`, `data/vigie/dossiers/{id}.json`, `data/fpsq/{indicator_id}.json` — NONE of these files exist.
- The vigie dossier data exists ONLY in `prototypes/p2-federation/data/` (polycrisis.json, iran-hormuz.json, _index.json). It was never migrated to the Hugo data/ directory.

**Root cause**: Nobody created the data directory structure. The config.json describes schemas for files that were never instantiated.

### BREAK 5: Hugo templates are 100% hardcoded HTML
**Classification**: (c) Connected but broken — structurally incapable
**Evidence**:
- `themes/kilama/layouts/policy/list.html` (1043 lines): Zero Hugo `{{ range }}`, zero `{{ .Site.Data }}`, zero `{{ getJSON }}` calls. Every note title, every excerpt, every date, every tag, every SVG chart data point is hardcoded HTML.
- The policy page contains a hardcoded SVG chart with pixel coordinates for a GPR index curve.
- "En bref" section: 6 hardcoded news items with no data source.
- "Catalogue des notes": 13+ hardcoded notes listed as static HTML.
- The Gopinath-Pettis and Hickel controverses are hardcoded in the template despite being "validated" in the queue and having full markdown in staging/for-site/.
- `themes/kilama/layouts/foresight/list.html`: Zero data file references. The vigie dashboard uses `static/js/vigie-data-engine.js` which generates SYNTHETIC data (hardcoded JavaScript with event impacts).
- `themes/kilama/layouts/index.html`: One single `{{ }}` reference found in 696 lines, and it's for a CSS class, not data.

**Root cause**: The Hugo templates were built as static HTML prototypes. They were never refactored to consume Hugo data files. Even if the data/ directory were populated, the templates would not read from it.

### BREAK 6: FPSQ data pipeline was never connected
**Classification**: (a) Never built
**Evidence**:
- `prototypes/p2-federation/data/fpsq/README.md` describes the schema and includes an R function `fpsq_export_vigie()`.
- The R function DOES NOT EXIST in the FPSQ codebase. `find` returns zero results for `export_vigie` anywhere.
- `vigie-data-engine.js` explicitly says: `VIGIE_DATA_MODE = 'synthetic'` with a comment: "To switch from synthetic to real: 1. FPSQ R pipeline exports... 2. Set VIGIE_DATA_MODE = 'live'"
- The FPSQ output directory exists and has files, but none in the JSON format specified by the schema.
- Zero JSON indicator files exist in `data/fpsq/`.

**Root cause**: The README documents a contract. The contract was never implemented on either side — the R export function was never written, and the JS consumer was never switched to live mode.

---

## 3. Root Cause Analysis

### Primary cause: Design-implementation gap

The entire content pipeline is a SPECIFICATION STACK, not an implementation. Every layer was designed in detail:

| Layer | Spec quality | Implementation |
|-------|-------------|----------------|
| Cowork 12 spec | Excellent (134 lines, 5 phases) | Zero code |
| site-sync-protocol | Excellent (anti-patterns, conventions) | Symlink works, nothing else |
| config.json | Excellent (7 sources, 7 content types, staleness rules) | Zero consumers |
| queue.json | Working (9 items, some validated) | Zero processing |
| registry.json | Working (5 publications, 2 controverses, 2 dossiers, 7 gaps) | Zero publication |
| FPSQ README | Excellent (schema, R function, activation) | Zero implementation |
| Hugo data schemas | Defined (6 content types) | Zero files |
| Hugo templates | 1000+ lines each | 100% hardcoded HTML |

The system was designed top-down (spec first) but never built bottom-up (data files first, then templates that consume them). The result: a complete, coherent specification stack sitting on top of hardcoded prototypes.

### Secondary cause: No feedback loop

The briefing of March 31 flagged Cowork 12 as ABSENT. Nothing happened. The system can detect its own failures but has no mechanism to correct them. The cron dispatcher runs every 10 minutes but only checks jobs that are registered. There is no "meta-monitor" that checks whether all expected jobs are registered.

### Tertiary cause: Prototype trap

The Hugo templates were built during design sessions as visual prototypes (clone-design, p2-federation). The hardcoded HTML looks good when rendered. This created the illusion that the site was "done" when in reality it was a static mockup with no data layer. The move from prototype to data-driven templates never happened.

---

## 4. Severity Assessment

| Component | Severity | Impact |
|-----------|----------|--------|
| Cowork 12 not in cron | CRITICAL | No automated scanning occurs at all |
| Queue processing unimplemented | CRITICAL | Even manually validated items go nowhere |
| data/ directory empty | CRITICAL | Hugo has nothing to render dynamically |
| Templates are hardcoded | CRITICAL | Even if data existed, templates wouldn't use it |
| FPSQ export not built | HIGH | Vigie page runs on synthetic (fake) data |
| staging/for-site/ unconsumed | MEDIUM | 82 files sitting idle, but they're inputs not outputs |
| Registry accurate but useless | LOW | Good inventory, no one reads it |

### Overall verdict

**0% of the designed pipeline is operational.** The site serves hardcoded HTML from layout templates. Not a single piece of content flows from research production through the bridge to the deployed site.

The staging/for-site/ directory is the closest thing to a working component — sessions actually deposit signals there. But without a consumer, it's a dead letter box.

---

## 5. What Would Be Required to Fix This

In priority order:

1. **Create Hugo data files** — `data/publications/index.json`, `data/policy/notes.json`, `data/vigie/dossiers/*.json` — populated from registry.json and staging content. Estimated: 2 hours.

2. **Refactor Hugo templates** to use `{{ range .Site.Data.publications }}` instead of hardcoded HTML. Each template needs a full rewrite of its content sections. Estimated: 4-8 hours per template, 5 templates.

3. **Register Cowork 12 in the cron dispatcher** — add the job definition to the schedule. Estimated: 15 minutes.

4. **Implement queue processing** — a script or hook that reads validated queue items and writes data/*.json files. Estimated: 4 hours.

5. **Write the FPSQ R export function** — `fpsq_export_vigie()` per the README contract. Estimated: 2 hours.

6. **Switch vigie-data-engine.js** from synthetic to live/hybrid mode. Estimated: 30 minutes (code already supports it).

Total estimated effort: 20-35 hours of implementation work.

---

*This audit was conducted by reading every file in the pipeline chain and tracing actual data flow. No component was assumed to work without verification. Every claim above is backed by file contents examined during the audit.*
