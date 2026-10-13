# NEW RAD CITY — offline mirror

Full mirror of **NEW RAD CITY** (https://newrad.city/play) — an open-world
browser city game ("Rad City") in the style of a retro-3D GTA: a first-person
city of districts, traffic, weapons and story radio, built directly on
three.js.

Source: https://newrad.city/play

![NEW RAD CITY](docs/cover.png)

## Stack

- **Single-document three.js game, served at the route `/play`** — the site is
  a Netlify deploy holding `play.html`; Netlify's pretty-URL routing serves it
  at `/play` (200, byte-identical to `/play.html`; `/play/` 301-redirects to
  `/play`). The mirror captures the document as `play.html` and documents the
  route.
- **~21.6 MiB of inline code in 630 blocks** — the build inlines every source
  module as its own `<script>` block, each opening with its
  `/* src/<dir>/<file>.js */` banner (629 modules + one `window.G_BUILD`
  stamp). The code is **unminified, hand-formatted project source** — module
  names, comments and structure survive in the capture.
- **three.js stays a CDN script** — `https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js`
  is a cross-origin `<script src>` (classic script, global `THREE`). It is
  never backfilled into the capture (socker precedent, PLAN §1), so the mirror
  needs network access for the engine — documented external.
- **Google Fonts stay CDN** — the `Michroma` / `Share Tech Mono` / `VT323` /
  `Oswald` / `Special Elite` / `Major Mono Display` stylesheets load from
  `fonts.googleapis.com`; recorded external, never backfilled.
- **Procedural everything else** — textures, sounds (WebAudio synthesis),
  music, radio and voices are generated in code; the runtime closure scan finds
  no same-origin asset fetches at all.
- **Netlify infrastructure request** — the edge injects
  `<script async id="netlify-rum-container" src="/.netlify/scripts/rum">` into
  the served document; that same-origin RUM beacon is captured byte-exact at
  `.netlify/scripts/rum`.

## What this is

NEW RAD CITY (newrad.city/play) — capture-class mirror. The origin is a
Netlify deploy whose `/play` route serves one 22,667,976 B document carrying
the whole game: 630 inline `<script>` blocks (22,515,466 B — the project's own
single-file build, every `src/…` module inlined with its banner), 12 inline
`<style>` blocks (139,891 B) and a small UI markup shell of divs/SVG/canvas
elements. Captured whole, byte-exact under `.upstream/manifest.json`: **2
files, 22,679,117 bytes** — the entry document (`play.html`) and the Netlify
RUM beacon (`.netlify/scripts/rum`, 11,141 B). The build stamp is
`window.G_BUILD={"hash": "f1f0628", "time": "2026-10-07 18:36"}`.

External at runtime: three.js (jsdelivr) and the Google Fonts stylesheets, plus
two social links (`x.com/chrisfirst`, `instagram.com/chrisfirstt`, author
links, not loads). The only same-origin non-document request is the Netlify RUM
beacon; the only recorded 404 is the browser-implicit `favicon.ico`.

## Layout

- `play.html` — the capture of the served `/play` document (disk name = the
  deploy's own file name)
- `.netlify/scripts/rum` — the same-origin Netlify RUM beacon the document
  references
- `.upstream/manifest.json` — sha256 + bytes for every captured file (Gen-A)
- `_mirror-report.json` — crawl record: request count, captured paths, the
  `/play` route aliases, the recorded 404 gap, external references
- `readable/` — prettified derived layer (pinned prettier 3.9.6)
- `src/` + `split-spec.json` — deobfuscated slices of the inline modules with
  the recorded derivation spec
- `docs/cover.png` — gameplay cover (taken through a local serve)
- `tools/capture.mjs` — byte-exact capture + runtime-closure fetch (`--check`
  for a residual closure audit, `--dry-run` for scanner candidates)
- `tools/derive.mjs` — rebuild `readable/` + `src/` + `split-spec.json`
- `tools/verify.mjs` — re-hash the capture against the manifest
- `tools/update.mjs` — read-only drift probe against the live origin
- `tools/audit.js` — integrity gate for the derived layers (`AUDIT PASS`)
- `tools/net-crosscheck.mjs` — compare an opencli network log against the
  manifest (dynamic closure check)

## Assets

The build is a single document: the art is **procedural** and the code is the
payload. What the repo carries:

- **code (the payload)** — 630 inline `<script>` blocks in `play.html`
  (22,515,466 B): 629 `/* src/<dir>/<file>.js */` modules (core, textures,
  sound, atmosphere, weapons, vehicles, city, poi_*, story, UI, …) plus the
  `G_BUILD` stamp. In-file representation: raw text, unminified.
- **styles** — 12 inline `<style>` blocks (139,891 B) in `play.html`, each
  carrying its own `/* src/<...>.css */` banner (HUD, weapons scope, radio,
  menu, POI readouts, …). In-file representation: raw CSS text.
- **images** — none as files. All art is generated at runtime on canvases
  (`src/textures/*` paint facades, signs, brands, ads, story art); the only
  in-file image data is an SVG `data:` URI used as a menu grain texture (CSS).
- **audio** — none as files. `src/sound/*` synthesises every weapon, voice,
  UI and world sound plus the music/radio beds with WebAudio.
- **models** — none as files. The city, vehicles, props and weapons are
  procedural three.js geometry built in code.
- **fonts** — none captured: Google Fonts (six families) stay external CDN
  references.
- **data** — none as files: layout, POI and story data live inside the inline
  modules (e.g. `src/core/layout.js` is the single source of truth).

## Run

Serve the repo root with a static server that resolves the extensionless route
`/play` to `play.html`, and open **`/play`** (the route the origin serves):

```
npx serve .
# then open http://localhost:3000/play
```

The game is fully client-side except two CDN dependencies that stay CDN
(three.js + Google Fonts), so with network access the mirror plays exactly as
upstream from this one route. The bug-reporter's "submit report" POSTs to
Netlify's form backend (`fetch('/', {method:'POST'})`) — a backend interaction
that a static mirror cannot serve; every other feature is local. The game needs
WebGL.

## Verify

```
node tools/verify.mjs                 # re-hash the capture → 2 files checked, 0 problems
node tools/audit.js                   # derived-layer integrity gate → AUDIT PASS
node tools/capture.mjs --check        # residual closure audit → 0 new unresolved
node tools/net-crosscheck.mjs docs/boot-network-2026-10-13.json   # dynamic closure check
```

## Updating from upstream

```
node tools/update.mjs     # read-only drift probe: what changed upstream
```

The probe fetches the entry from the **route** `/play` (route-named, no
`.html` suffix) and compares it normalized; other captured files are probed by
sha256. It never rewrites the capture — a mirror is a point-in-time snapshot.
Refreshing means re-fetching into a clean tree (`node tools/capture.mjs`),
re-cutting the manifest, and re-deriving `readable/` + `src/` from the new
document with `node tools/derive.mjs`.

### 2026-10-13 capture + readable/src derivation

_(in progress — capture recorded, derived layers being cut)_

## Mirror conventions

- **Capture layer** — the captured files are byte-exact copies of what the
  origin served; nothing in them is edited. `.gitattributes` pins `* -text` so
  git never normalizes EOLs.
- **CDN dependencies stay CDN** — three.js (jsdelivr) and the Google Fonts
  stylesheets/font origins are recorded as external references and are never
  backfilled into the capture (PLAN §1, socker precedent).
- **Readable layer** — `readable/` is derived (prettified) and never shipped
  to a browser.
- **Provenance** — `.upstream/manifest.json` records sha256 for each captured
  artifact, and `tools/verify.mjs` re-checks it; `_mirror-report.json` is the
  crawl record.
- **Drift** — `tools/update.mjs` is read-only: it reports what changed upstream
  and never rewrites the capture.

## Fleet status

<!-- mirror-status:start — feeds _standard/REPO-INDEX.md. Update ONLY your own mirror's block; never edit the shared index (PLAN §8). Rebuild: node _standard/build-index.mjs -->
<!-- cols: cls=classification · ver=verify 0 problems · upd=drift probe · man=manifest · rdbl=readable re-derived · src=reversed src · boot=boot test · top=offline-mirror topic · tag=backup tag · staged=staged not committed -->
| # | repo | cls | ver | upd | man | rdbl | src | boot | top | tag | staged |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | newrad-city | mirror | ✓ | ✓ | ✓ | — | — | — | — | — | — |
<!-- mirror-status:end -->
