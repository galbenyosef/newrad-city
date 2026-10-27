# Vendored prettier 3.9.6 (module API)

The pinned renderer this mirror's `readable/`, `src/` and `split-spec.json`
were produced with, vendored INTO THIS MIRROR so a re-derivation never has to
reach into another mirror's tree.

- **version** — 3.9.6, exact. `tools/derive.mjs` and `tools/audit.js` both
  read `package.json` next to the entry point and refuse any other version.
- **source** — the published npm tarball `prettier-3.9.6.tgz`
  (integrity `sha512-OpN0zzVdiaiAhxpuuj5efpIS4sY9j7bY6uR5mnj5yPzGkdkjNKSJeUThPb60Jw29QuAZgA4o+/iB49kFiaBX6g==`).
- **files** — `index.mjs` (the module API entry point) + `doc.mjs` +
  `plugins/*.mjs` (all 13 language plugins) + `package.json` + `LICENSE` +
  `THIRD-PARTY-NOTICES.md`. 19 files.
- **`index.mjs` is the MODULE API, never the CLI.** The CLI respects
  `.gitignore` and can silently echo its input instead of formatting it; the
  module API never does that.
- **`package.json` here is a MINIMAL STUB** carrying `name`/`version`/
  `license` so the `pkg.version === "3.9.6"` check in the two loaders works.
  It is NOT the published `package.json` (whose `exports` map would point at
  files — `index.cjs`, `standalone.mjs`, `bin/prettier.cjs`, `internal/*` —
  that are not vendored here).
- The bytes of every vendored file are identical to the published 3.9.6
  tarball, so the mirror's derived layers re-render byte-for-byte.

## Why this is vendored instead of resolved at run time

`tools/derive.mjs` and `tools/audit.js` used to fall back to a path in ANOTHER
mirror's `node_modules`:

```
D:/repos/mirrors/metropolygonia/node_modules/prettier/index.mjs
```

That directory is gitignored and committed nowhere, so it exists only on
whichever machine happened to install it. A clean checkout, a disk cleanup or a
different machine broke this mirror's derive and audit at once, and the
failure read like a broken tool rather than a missing dependency — the
`module not found` came out of a path that has nothing to do with this mirror.

Both loaders now resolve, in this mirror's own order:

1. `$PRETTIER_MJS` — an explicit override, for a machine that keeps its own
   copy elsewhere;
2. `tools/vendor/prettier/index.mjs` — this vendored copy, the normal case;
3. `node_modules/prettier/index.mjs` — a local `npm install` of the same
   pinned version still works.

If none of those resolves, the loader stops with a message that names every
path it looked for, says why each was rejected, and gives the exact command
that restores the vendored copy.
