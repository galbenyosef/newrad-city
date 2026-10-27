// pinned-prettier.cjs — the ONE place this mirror resolves the prettier it
// renders with.
//
// NEW RAD CITY's derived layers (readable/, src/, split-spec.json) are
// rendered with prettier 3.9.6, pinned. That pinned copy is VENDORED in this
// mirror at tools/vendor/prettier/ (see the VENDOR-README.md there), so a
// re-derivation never depends on another mirror's node_modules — a directory
// that is gitignored and committed nowhere, and whose loss used to break this
// mirror's derive with a module-not-found that read like a broken tool.
//
// This mirror resolves the pinned prettier in this order:
//   1. $PRETTIER_MJS           — an explicit override
//   2. tools/vendor/prettier/ — the vendored copy (the normal case)
//   3. node_modules/prettier/ — a local npm install of the same pinned version
//
// Every candidate is checked for the EXACT pinned version — both the
// package.json next to the entry point and the module's own reported version —
// because another prettier formats differently and would move readable/ and
// src/.
//
// usage (CommonJS): const { PINNED, loadPinnedPrettier } = require("./pinned-prettier.cjs");
// usage (ESM):      import pinnedPrettier from "./pinned-prettier.cjs";
//                  const { PINNED, loadPinnedPrettier } = pinnedPrettier;
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const PINNED = "3.9.6";

/**
 * Every place this mirror is willing to load the pinned prettier from, in
 * order. `label` says what the place IS, so the failure message reads as a
 * list of the mirror's own places rather than a list of paths.
 */
function candidates(proj) {
  return [
    { label: "$PRETTIER_MJS (explicit override)", file: process.env.PRETTIER_MJS || null },
    {
      label: "this mirror's vendored copy",
      file: path.join(proj, "tools", "vendor", "prettier", "index.mjs"),
    },
    {
      label: "this mirror's node_modules",
      file: path.join(proj, "node_modules", "prettier", "index.mjs"),
    },
  ].filter((c) => c.file);
}

/**
 * The message a caller gets when the pinned prettier is not resolvable. It
 * names EVERY path this mirror tried and why each was rejected, and gives the
 * exact command that restores the vendored copy.
 */
function notFoundMessage(proj, tried) {
  const rel = (p) => {
    const r = path.relative(proj, p).split(path.sep).join("/");
    return r.startsWith("..") ? p : r;
  };
  return [
    `pinned prettier ${PINNED} not found — this mirror renders readable/, src/ and split-spec.json with it,`,
    `and both tools refuse any other version (another prettier formats differently and would move the layer).`,
    `  every path this mirror tried, in order:`,
    ...tried.map((t) => `    ${rel(t.file)}\n      (${t.label}) — ${t.why}`),
    `  to restore the vendored copy, from the mirror root:`,
    `    git restore tools/vendor/prettier`,
    `  (or point $PRETTIER_MJS at a prettier ${PINNED} index.mjs, or install one here with:`,
    `    npm i prettier@${PINNED})`,
  ].join("\n");
}

/**
 * Load the pinned prettier. Returns { mod, file, label } on success; throws an
 * Error whose message names every path tried and the recovery command when it
 * cannot.
 */
async function loadPinnedPrettier(proj) {
  const tried = [];
  for (const c of candidates(proj)) {
    if (!fs.existsSync(c.file)) {
      tried.push({ file: c.file, label: c.label, why: "not there" });
      continue;
    }
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync(path.join(path.dirname(c.file), "package.json"), "utf8"));
    } catch (e) {
      tried.push({ file: c.file, label: c.label, why: `no readable package.json next to it (${e.message})` });
      continue;
    }
    if (pkg.version !== PINNED) {
      tried.push({
        file: c.file,
        label: c.label,
        why: `version ${pkg.version}, not the pinned ${PINNED}`,
      });
      continue;
    }
    let mod;
    try {
      mod = (await import(pathToFileURL(c.file).href)).default;
    } catch (e) {
      tried.push({ file: c.file, label: c.label, why: `could not be imported (${e.message})` });
      continue;
    }
    if (!mod || mod.version !== PINNED) {
      tried.push({
        file: c.file,
        label: c.label,
        why: `the module reports version ${mod && mod.version}, not the pinned ${PINNED}`,
      });
      continue;
    }
    return { mod, file: c.file, label: c.label };
  }
  throw new Error(notFoundMessage(proj, tried));
}

module.exports = { PINNED, candidates, notFoundMessage, loadPinnedPrettier };
