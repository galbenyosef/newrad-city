// audit.js — integrity gate (PLAN §5), tailored to newrad-city's shape.
//
// NEW RAD CITY (https://newrad.city/play) is capture-class: a Netlify deploy
// whose route /play serves one 22,667,976 B document carrying the whole game —
// the project's own single-file build inlining 629 source modules as 630
// inline <script> blocks (each opening with its `/* src/…/file.js */` banner,
// wrapped in one IIFE) plus 12 inline <style> blocks (each with its own
// `/* …css */` banner) — and one captured extensionless script file, the
// Netlify RUM beacon at .netlify/scripts/rum.
//
// The derived pipeline:
//
//   play.html inline <script> #N  -> readable/play-inline-N.pretty.js
//                                    + src/play-inline-N-MM.js slices
//                                    (IIFE unwrapped; wrapper + top-level
//                                     return guards indexed as skipped)
//   play.html inline <style>  #N  -> readable/play-inline-N.pretty.css (wholeFile)
//   .netlify/scripts/rum          -> readable/netlify-rum.pretty.js + slices
//   readable/index-inline-map.json -> byte ranges + sha256 + module banner
//                                     per inline block
//
// split-spec.json records that pipeline and this gate keeps it honest:
//
//   1. split-spec.json parses, carries a note + renderOptions, and a defaultFile exists.
//   2. Every section resolves: ranged slices have a src/*.js file on disk, a readable
//      *.pretty.js|css sourceFile and in-bounds startLine/endLine; wholeFile sections
//      (the 12 inline stylesheets) must NOT have a src file; `skipped` sections must NOT
//      have a src file and are re-verified textually against their recorded lines.
//   3. The ranges of each sourceFile tile it exactly: first starts at line 1, each next
//      starts at previous end + 1, last ends at EOF — no gaps, no overlaps.
//   4. Byte-exact round-trip: every src slice minus its exact 2-line header
//      (`// <tag> NN — <marker>` + `// Lines A-B of <pretty> (statement-aligned).`)
//      equals its recorded sourceFile range byte for byte.
//   5. Every slice parses standalone with the exact gate command
//      `node --input-type=module --check -` (stdin), as does every readable *.pretty.js.
//   6. src/*.js on disk and the spec's ranged slices are the same set — no unlisted or
//      missing reversals; wholeFile/skipped names are not on disk.
//   7. Every readable pretty is referenced by the spec and is NOT byte-identical to its
//      capture source (inline twins are byte-compared against their capture block;
//      .netlify/scripts/rum maps to readable/netlify-rum.pretty.js). Every captured
//      script file must have a readable twin (layer completeness).
//   8. Inline-block scan: every inline <script>/<style> content block in the captured
//      entry document must have its readable twin and a readable/index-inline-map.json
//      entry whose byte range + sha256 match the capture bytes, and — where the capture
//      block carries a `/* src/… */` module banner — the twin must open with that banner.
//   9. notRendered completeness: every captured non-HTML/JS/CSS payload has a record.
//  10. The hard rule — src/ import resolution: any specifier a slice carries must
//      resolve to a file the CAPTURE carries (this game has no import statements — the
//      build inlines modules; the scanner still runs so a refresh that introduces
//      imports is checked).
//  11. Shape guards: the entry must still be the game (the G_BUILD stamp, the project
//      banner, three.js through window.THREE, the frame loop), the module-banner set
//      must still cover the recorded module families, and the external CDN stance
//      (jsdelivr three.js) must still be recorded in _mirror-report.json.
//  12. Derived layers never enter the capture sums: no readable/, src/, legacy/ or
//      split-spec.json path may appear in .upstream/manifest.json.
//
// usage: node tools/audit.js
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
// The one place this mirror resolves the pinned prettier (vendored in
// tools/vendor/prettier/ — see tools/vendor/prettier/VENDOR-README.md).
const { PINNED, loadPinnedPrettier } = require("./pinned-prettier.cjs");

const here = __dirname;
const proj = path.resolve(here, "..");
const srcDir = path.join(proj, "src");
const readableDir = path.join(proj, "readable");
const ENTRY = "play.html";

const problems = [];
const problem = (msg) => problems.push(msg);

// ── helpers ─────────────────────────────────────────────────────────────
const readLines = (abs) => {
  const t = fs.readFileSync(abs, "utf8");
  const l = t.split("\n");
  if (l.length && l[l.length - 1] === "") l.pop();
  return l;
};
const linesCache = new Map();
const getLines = (abs) => {
  if (!linesCache.has(abs)) linesCache.set(abs, readLines(abs));
  return linesCache.get(abs);
};
const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

// captured script files -> readable twin name
const CAPTURED_SCRIPT = /(\.(?:js|mjs)$)|(^\.netlify\/scripts\/rum$)/;
const prettyNameOf = (capRel) => {
  if (capRel === ".netlify/scripts/rum") return "readable/netlify-rum.pretty.js";
  const flat = capRel.replace(/\.(js|mjs)$/i, "").split("/").join("__");
  return "readable/" + flat + ".pretty.js";
};
const captureByPretty = new Map(); // readable/<x>.pretty.js|css -> capture rel

// parse check — the exact standalone gate: node --input-type=module --check - < file
function parseCheck(abs, rel) {
  const r = spawnSync(process.execPath, ["--input-type=module", "--check", "-"], {
    input: fs.readFileSync(abs),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0)
    problem(`standalone ESM parse failed: ${rel} — ${(r.stderr || "").trim().split("\n").slice(0, 4).join(" | ")}`);
  return r.status === 0;
}

// inline <script>/<style> scan (byte-exact, same shape as tools/derive.mjs —
// ordered single-pass tokenizer: script/style content ends at the first close
// tag, HTML comments are skipped)
function scanBlocks(buf) {
  const out = [];
  let p = 0;
  let nScript = 0;
  let nStyle = 0;
  while (p < buf.length) {
    let best = -1;
    let kind = null;
    for (const [needle, k] of [
      ["<script", "script"],
      ["<style", "style"],
      ["<!--", "comment"],
    ]) {
      const i = buf.indexOf(needle, p);
      if (i >= 0 && (best < 0 || i < best)) {
        best = i;
        kind = k;
      }
    }
    if (best < 0) break;
    if (kind === "comment") {
      const e = buf.indexOf("-->", best + 4);
      p = e < 0 ? buf.length : e + 3;
      continue;
    }
    const after = buf[best + kind.length + 1];
    const boundary =
      after === 0x3e || after === 0x2f || after === 0x20 || after === 0x09 || after === 0x0a || after === 0x0d;
    if (!boundary) {
      p = best + kind.length + 1;
      continue;
    }
    const tagEnd = buf.indexOf(">", best);
    if (tagEnd < 0) break;
    const close = kind === "script" ? "</script" : "</style";
    const j = buf.indexOf(close, tagEnd + 1);
    if (j < 0) {
      problem(`unterminated <${kind}> opened at byte ${best}`);
      break;
    }
    const tag = buf.subarray(best, tagEnd + 1).toString("utf8");
    const external = /\bsrc\s*=\s*["']/i.test(tag);
    if (!external) {
      if (kind === "script") nScript++;
      else nStyle++;
      const content = buf.subarray(tagEnd + 1, j);
      const text = content.toString("utf8");
      const banner = (/^\s*\/\*\s*(src\/[^*\n]+?\.(?:js|css))\s*\*\//.exec(text) || [])[1] ?? null;
      out.push({
        kind: /\btype\s*=\s*["']importmap["']/i.test(tag) ? "importmap" : kind,
        block: kind === "script" ? nScript : nStyle,
        banner,
        contentStart: tagEnd + 1,
        contentEnd: j,
        bytes: content.length,
        sha256: sha256(content),
      });
    }
    p = j + close.length;
  }
  return out;
}

// ── specifier extraction + export tables (the hard rule) ─────────────────
function extractSpecifiers(code) {
  const out = [];
  const push = (spec, kind, clause) => out.push({ spec, kind, clause: clause || "" });
  let m;
  const fromRe = /\bimport\s+([^;('"]*?)\s*from\s*(["'])([^"']+)\2/g;
  while ((m = fromRe.exec(code))) push(m[3], "from", m[1]);
  const sideRe = /\bimport\s*(["'])([^"']+)\1/g;
  while ((m = sideRe.exec(code))) push(m[2], "side-effect", "");
  const reExpRe = /\bexport\s+[^;()]*?\bfrom\s*(["'])([^"']+)\1/g;
  while ((m = reExpRe.exec(code))) push(m[2], "re-export", "");
  const dynRe = /\bimport\s*\(\s*(["'])([^"']+)\1\s*\)/g;
  while ((m = dynRe.exec(code))) push(m[2], "dynamic", "");
  const dynTplRe = /\bimport\s*\(\s*`([^`]*)`\s*\)/g;
  while ((m = dynTplRe.exec(code))) if (!m[1].includes("${")) push(m[1], "dynamic", "");
  const urlRe = /\bnew\s+URL\s*\(\s*(["'`])([^"'`]+)\1\s*,/g;
  while ((m = urlRe.exec(code))) push(m[2], "worker-url", "");
  if (/\brequire\s*\(/.test(code)) push("<require()>", "require", "");
  return out;
}

// ── capture manifest ────────────────────────────────────────────────────
let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(proj, ".upstream", "manifest.json"), "utf8"));
} catch (e) {
  problem(`.upstream/manifest.json does not parse: ${e.message}`);
}
const captured = manifest?.files ? Object.keys(manifest.files).sort() : [];
for (const rel of captured) {
  if (CAPTURED_SCRIPT.test(rel)) captureByPretty.set(prettyNameOf(rel), rel);
}

// ── split-spec.json ─────────────────────────────────────────────────────
const SPEC_REQUIRED_MODULES = [
  "src/core/layout.js",
  "src/core/engine.js",
  "src/core/player.js",
  "src/sound/50_radio.js",
  "src/atmosphere/40_postfx.js",
  "src/weapons/",
];
const specPath = path.join(proj, "split-spec.json");
if (!fs.existsSync(specPath)) problem("split-spec.json missing at repo root");
let spec = null;
try {
  spec = specPath && JSON.parse(fs.readFileSync(specPath, "utf8"));
} catch (e) {
  problem(`split-spec.json does not parse: ${e.message}`);
}
const sections = Array.isArray(spec?.sections) ? spec.sections : [];
if (spec && !Array.isArray(spec?.sections)) problem("split-spec.json has no sections array");
if (!String(spec?.note ?? "").trim()) problem("split-spec.json has no note (derivation record)");
if (!spec?.renderOptions || typeof spec.renderOptions !== "object")
  problem("split-spec.json records no renderOptions (prettier options for re-derivation)");
if (!Array.isArray(spec?.notRendered))
  problem("split-spec.json records no notRendered array (non-code payload blocks)");
if (spec?.defaultFile) {
  const df = path.join(srcDir, path.basename(String(spec.defaultFile)));
  if (!fs.existsSync(df)) problem(`split-spec defaultFile "${spec.defaultFile}" does not exist`);
}

const seen = new Set();
const rangedFiles = new Set();
const indexOnlyFiles = new Set();
for (const s of sections) {
  if (!s.file) {
    problem("split-spec section without a file");
    continue;
  }
  if (seen.has(s.file)) problem(`split-spec lists ${s.file} twice`);
  seen.add(s.file);
  const isWhole = s.wholeFile === true;
  const isSkipped = s.skipped === true;
  if (isWhole && isSkipped) problem(`section ${s.file}: both wholeFile and skipped`);
  if (typeof s.startLine !== "number" || typeof s.endLine !== "number")
    problem(`section ${s.file}: no startLine/endLine range recorded`);
  if (typeof s.sourceFile !== "string") problem(`section ${s.file}: no sourceFile provenance recorded`);
  if (isWhole || isSkipped) indexOnlyFiles.add(s.file);
  else rangedFiles.add(s.file);
}
if (!rangedFiles.size) problem("no ranged src slices in split-spec.json (no reversed layer)");

const onDisk = fs.existsSync(srcDir)
  ? fs.readdirSync(srcDir).filter((f) => f.endsWith(".js")).sort()
  : [];
if (!onDisk.length) problem("src/ missing or empty (no reversed layer)");
for (const f of onDisk) if (!rangedFiles.has(f)) problem(`src/${f} exists but is not a ranged slice in split-spec.json`);
for (const f of rangedFiles) if (!onDisk.includes(f)) problem(`split-spec lists ${f} but it is not on disk`);
for (const f of indexOnlyFiles)
  if (onDisk.includes(f)) problem(`index-only section ${f} must not have a src file on disk (wholeFile/skipped)`);

// ── ranges: existence, bounds, tiling ───────────────────────────────────
const bySource = new Map();
for (const s of sections) {
  if (!s.file || typeof s.sourceFile !== "string") continue;
  const src = path.join(proj, s.sourceFile);
  if (!fs.existsSync(src)) {
    problem(`section ${s.file}: sourceFile missing: ${s.sourceFile}`);
    continue;
  }
  if (!/\.pretty\.(js|css)$/i.test(s.sourceFile)) {
    problem(`section ${s.file}: sourceFile is not a readable pretty: ${s.sourceFile}`);
    continue;
  }
  const srcLines = getLines(src);
  const A = s.startLine,
    B = s.endLine;
  if (!Number.isInteger(A) || !Number.isInteger(B) || A < 1 || B < A || B > srcLines.length) {
    problem(`section ${s.file}: bad range ${A}-${B} vs ${s.sourceFile} (${srcLines.length} lines)`);
    continue;
  }
  if (!bySource.has(s.sourceFile)) bySource.set(s.sourceFile, []);
  bySource.get(s.sourceFile).push({ s, A, B });
}
let tiledOK = 0;
for (const [sourceFile, list] of bySource) {
  let ok = true;
  list.sort((x, y) => x.A - y.A);
  const srcLines = getLines(path.join(proj, sourceFile));
  if (list[0].A !== 1) {
    problem(`${sourceFile}: first section starts at line ${list[0].A}, not 1`);
    ok = false;
  }
  for (let k = 1; k < list.length; k++) {
    if (list[k].A !== list[k - 1].B + 1) {
      problem(
        `${sourceFile}: ranges not contiguous at ${list[k].s.file} (starts ${list[k].A}, previous ends ${list[k - 1].B})`,
      );
      ok = false;
    }
  }
  if (list[list.length - 1].B !== srcLines.length) {
    problem(`${sourceFile}: last section ends at ${list[list.length - 1].B}, not ${srcLines.length}`);
    ok = false;
  }
  if (ok) tiledOK++;
}

// ── byte-exact round-trip + header provenance ───────────────────────────
let roundOK = 0,
  ranged = 0;
for (const [, list] of bySource) {
  for (const { s, A, B } of list) {
    if (s.wholeFile === true || s.skipped === true) continue;
    ranged++;
    const srcAbs = path.join(srcDir, path.basename(String(s.file)));
    if (!fs.existsSync(srcAbs)) continue; // already reported
    const text = fs.readFileSync(srcAbs, "utf8");
    const nl1 = text.indexOf("\n");
    const nl2 = nl1 >= 0 ? text.indexOf("\n", nl1 + 1) : -1;
    if (nl2 < 0) {
      problem(`src/${s.file}: missing 2-line header`);
      continue;
    }
    const header1 = text.slice(0, nl1);
    const header2 = text.slice(nl1 + 1, nl2);
    const nn = path.basename(String(s.file)).match(/-(\d+)\.js$/)?.[1];
    if (!nn) problem(`src/${s.file}: file name carries no -NN slice number`);
    else if (!new RegExp(`^// .+ ${nn} — .+$`).test(header1))
      problem(`src/${s.file}: header line 1 does not match "// <tag> ${nn} — <marker>": ${header1}`);
    const want2 = `// Lines ${A}-${B} of ${s.sourceFile} (statement-aligned).`;
    if (header2 !== want2) problem(`src/${s.file}: header line 2 is not the recorded range: ${header2}`);
    const body = text.slice(nl2 + 1);
    const srcLines = getLines(path.join(proj, s.sourceFile));
    const expected = srcLines.slice(A - 1, B).join("\n") + "\n";
    if (body !== expected)
      problem(`src/${s.file}: body is not a byte-exact round-trip of ${s.sourceFile} lines ${A}-${B}`);
    else roundOK++;
  }
}

// ── skipped sections: textual re-verification ───────────────────────────
let skippedOK = 0,
  skippedTotal = 0;
for (const s of sections) {
  if (s.skipped !== true || typeof s.sourceFile !== "string") continue;
  skippedTotal++;
  const src = path.join(proj, s.sourceFile);
  if (!fs.existsSync(src)) {
    problem(`skipped section ${s.file}: sourceFile missing: ${s.sourceFile}`);
    continue;
  }
  const lines = getLines(src);
  if (!Number.isInteger(s.startLine) || !Number.isInteger(s.endLine) || s.startLine < 1 || s.endLine > lines.length)
    continue;
  const first = lines[s.startLine - 1],
    last = lines[s.endLine - 1];
  if (typeof s.firstLine !== "string" || typeof s.lastLine !== "string")
    problem(`skipped section ${s.file}: no firstLine/lastLine recorded`);
  else if (first !== s.firstLine || last !== s.lastLine)
    problem(`skipped section ${s.file}: range text does not match the recorded first/last lines`);
  else skippedOK++;
}

// ── every src + pretty parses standalone ────────────────────────────────
let checkOK = 0;
for (const f of onDisk) if (parseCheck(path.join(srcDir, f), `src/${f}`)) checkOK++;

const prettyFiles = [];
const walkPretty = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkPretty(p);
    else if (/\.pretty\.(js|css|json)$/i.test(e.name)) prettyFiles.push(p);
  }
};
walkPretty(readableDir);
if (!prettyFiles.length) problem("readable/ has no *.pretty.js|css (derived layer missing)");
let prettyOK = 0,
  prettyParsed = 0;
for (const abs of prettyFiles) {
  const rel = path.relative(proj, abs).split(path.sep).join("/");
  if (!/\.pretty\.js$/i.test(rel)) continue; // CSS/JSON pretties are indexed, not ESM-parsed
  prettyParsed++;
  if (parseCheck(abs, rel)) prettyOK++;
}

// ── inline block twins + map (deliverable rule) ─────────────────────────
// Inline twins have no capture .js/.css of their own — they are validated here,
// byte-for-byte against their capture block, and exempted from the pretty→capture
// mapping loop below.
const inlineMapPath = path.join(readableDir, "index-inline-map.json");
let inlineMap = null;
if (fs.existsSync(inlineMapPath)) {
  try {
    inlineMap = JSON.parse(fs.readFileSync(inlineMapPath, "utf8"));
  } catch (e) {
    problem(`readable/index-inline-map.json does not parse: ${e.message}`);
  }
}
const inlineTwinRels = new Set();
let inlineBlocks = 0;
const twinTextByBlock = new Map();
for (const capRel of Object.keys(manifest?.files ?? {})) {
  if (!/\.html?$/i.test(capRel)) continue;
  const buf = fs.readFileSync(path.join(proj, capRel));
  const blocks = scanBlocks(buf);
  inlineBlocks += blocks.length;
  const entryTag = capRel.replace(/\.html$/i, "").split("/").join("__");
  for (const b of blocks) {
    const twinExt = b.kind === "style" ? "css" : b.kind === "importmap" ? "json" : "js";
    const twin = `readable/${entryTag}-inline-${b.block}.pretty.${twinExt}`;
    inlineTwinRels.add(twin);
    if (!fs.existsSync(path.join(proj, twin))) problem(`${capRel}: inline ${b.kind} #${b.block} has no twin ${twin}`);
    else {
      const twinText = fs.readFileSync(path.join(proj, twin), "utf8");
      twinTextByBlock.set(`${b.kind}-${b.block}`, twinText);
      const content = buf.subarray(b.contentStart, b.contentEnd);
      if (twinText === content.toString("utf8"))
        problem(`${twin}: byte-identical to its capture block (prettier did not run?)`);
      if (b.banner && !twinText.replace(/^\uFEFF/, "").startsWith(`/* ${b.banner} */`))
        problem(`${twin}: twin does not open with the capture block's module banner (/* ${b.banner} */)`);
      if (twinExt === "json") {
        try {
          JSON.parse(twinText);
        } catch (e) {
          problem(`${twin}: does not parse as JSON: ${e.message}`);
        }
      }
    }
    const rec = inlineMap?.blocks?.find((x) => x.file === twin && x.source === capRel);
    if (!rec) {
      problem(`${capRel}: inline ${b.kind} #${b.block} is missing from readable/index-inline-map.json`);
      continue;
    }
    if (rec.byteStart !== b.contentStart || rec.byteEnd !== b.contentEnd || rec.sha256 !== b.sha256)
      problem(`${twin}: recorded inline byte range/sha256 does not match the capture bytes`);
    if (b.banner && rec.module !== b.banner) problem(`${twin}: inline map lost the module banner (${b.banner})`);
  }
}
if (inlineMap && inlineBlocks === 0) problem("readable/index-inline-map.json exists but the capture has no inline blocks");
if (inlineMap && Array.isArray(inlineMap.blocks) && inlineMap.blocks.length !== inlineBlocks)
  problem(`readable/index-inline-map.json lists ${inlineMap.blocks.length} block(s) but the capture has ${inlineBlocks}`);

// ── every pretty referenced + provably derived + layer completeness ─────
const referenced = new Set();
for (const [sourceFile] of bySource) referenced.add(sourceFile.split(path.sep).join("/"));
let derivedOK = 0;
for (const abs of prettyFiles) {
  const rel = path.relative(proj, abs).split(path.sep).join("/");
  if (!referenced.has(rel))
    problem(`readable/${path.basename(rel)} exists but is not referenced by split-spec.json`);
  if (inlineTwinRels.has(rel)) {
    derivedOK++; // inline twins are byte-compared against their capture block above
    continue;
  }
  const capRel = captureByPretty.get(rel);
  const capAbs = capRel ? path.join(proj, capRel) : null;
  if (!capAbs || !fs.existsSync(capAbs)) {
    problem(`${rel}: capture source missing (no captured script maps to this pretty)`);
    continue;
  }
  if (manifest && !manifest.files?.[capRel])
    problem(`${rel}: capture source ${capRel} is not recorded in .upstream/manifest.json`);
  if (fs.readFileSync(capAbs).equals(fs.readFileSync(abs)))
    problem(`${rel}: byte-identical to its capture source (prettier did not run?)`);
  else derivedOK++;
}
if (manifest) {
  for (const capRel of Object.keys(manifest.files)) {
    if (!CAPTURED_SCRIPT.test(capRel)) continue;
    if (!prettyFiles.some((abs) => captureByPretty.get(path.relative(proj, abs).split(path.sep).join("/")) === capRel))
      problem(`captured ${capRel} has no readable twin referenced by the spec`);
  }
}

// ── notRendered completeness: every captured non-code payload is recorded ─
{
  const recs = new Map((spec?.notRendered ?? []).map((r) => [r.capture, r]));
  for (const rel of captured) {
    if (/\.(html?|css)$/i.test(rel) || CAPTURED_SCRIPT.test(rel)) continue;
    const rec = recs.get(rel);
    if (!rec) {
      problem(`captured payload ${rel} has no notRendered record in split-spec.json`);
      continue;
    }
    if (rec.sha256 !== manifest?.files?.[rel]?.sha256) problem(`notRendered ${rel}: sha256 does not match the manifest`);
  }
}

// ── shape guards: the capture is still this game ────────────────────────
{
  const entryAbs = path.join(proj, ENTRY);
  if (fs.existsSync(entryAbs)) {
    const entry = fs.readFileSync(entryAbs, "utf8");
    for (const [re, what] of [
      [/window\.G_BUILD=\{"hash"/, "the G_BUILD build stamp"],
      [/NEW RAD CITY/, "the project banner"],
      [/cdn\.jsdelivr\.net\/npm\/three@0\.158\.0\/build\/three\.min\.js/, "the three.js CDN script"],
      [/fonts\.googleapis\.com/, "the Google Fonts stylesheet"],
      [/domElement\.id = 'game-canvas'/, "the renderer canvas id"],
      [/new THREE\.WebGLRenderer/, "the three.js renderer construction"],
      [/requestAnimationFrame/, "the frame loop"],
    ])
      if (!re.test(entry)) problem(`${ENTRY}: shape guard failed (${what}) — the capture changed shape`);
  }
  const g1 = twinTextByBlock.get("script-1");
  if (g1 !== undefined && !/window\.G_BUILD = \{/.test(g1))
    problem("readable/play-inline-1.pretty.js: does not carry the G_BUILD stamp (block order changed?)");
  // module-banner coverage: the recorded families must still be present
  const banners = new Set();
  for (const [, t] of twinTextByBlock) {
    const m = /^\s*\/\*\s*(src\/[^*\n]+?\.(?:js|css))\s*\*\//.exec(t);
    if (m) banners.add(m[1]);
  }
  if (banners.size < 600) problem(`module-banner coverage fell to ${banners.size} (expected 600+ modules)`);
  for (const want of SPEC_REQUIRED_MODULES)
    if (![...banners].some((b) => b.startsWith(want))) problem(`module banner missing from the derived layer: ${want}`);
  // external CDN stance still recorded (never backfilled into the capture)
  try {
    const rep = JSON.parse(fs.readFileSync(path.join(proj, "_mirror-report.json"), "utf8"));
    const ext = new Set(rep.external ?? []);
    for (const want of [
      "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js",
      "https://fonts.googleapis.com/css2?family=Michroma&family=Share+Tech+Mono&family=VT323&family=Oswald:wght@400;600;700&family=Special+Elite&display=swap",
    ])
      if (!ext.has(want)) problem(`_mirror-report.json lost the recorded external reference: ${want}`);
  } catch (e) {
    problem(`_mirror-report.json does not parse: ${e.message}`);
  }
}

// ── the hard rule: src/ import resolution against the capture ───────────
let checkedImports = 0,
  resolvedImports = 0,
  whitelisted = 0;
for (const s of sections) {
  if (s.wholeFile === true || s.skipped === true) continue;
  if (!s.file || typeof s.sourceFile !== "string") continue;
  const srcAbs = path.join(srcDir, path.basename(String(s.file)));
  if (!fs.existsSync(srcAbs)) continue;
  // slices come from inline blocks / root-level captured files: base dir is the capture root
  const baseDir = "";
  const code = fs.readFileSync(srcAbs, "utf8");
  for (const { spec: specifier, kind } of extractSpecifiers(code)) {
    checkedImports++;
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const target = path.posix.normalize(path.posix.join(baseDir, specifier));
      if (!fs.existsSync(path.join(proj, target))) {
        problem(`src/${s.file}: unresolvable ${kind} import "${specifier}" (capture carries no ${target})`);
        continue;
      }
      resolvedImports++;
      continue;
    }
    if (specifier.startsWith("node:") || specifier.startsWith("vite/") || specifier.startsWith("/")) {
      whitelisted++;
      continue;
    }
    problem(`src/${s.file}: unresolvable ${kind} import "${specifier}" — bare/URL specifier not whitelisted`);
  }
}

// ── derived layers must never enter the capture sums ────────────────────
if (manifest) {
  for (const rel of Object.keys(manifest.files)) {
    const norm = rel.split(path.sep).join("/");
    if (/^(readable|src|legacy)\//.test(norm) || norm === "split-spec.json")
      problem(`derived layer leaked into the capture manifest: ${rel}`);
  }
}

// ── re-render every pretty with the pinned prettier 3.9.6 ────────────────
// The resolution lives in tools/pinned-prettier.cjs (the vendored copy in
// tools/vendor/prettier/ first). The re-render check is NOT best-effort any
// more: the pinned prettier is committed in this mirror, so a mirror that
// cannot find it is a mirror whose committed layer cannot be re-verified —
// that is a FAILURE, reported with the same message the derive gives, not a
// silent skip.
(async () => {
  let renderNote = "";
  let prettier = null;
  try {
    ({ mod: prettier } = await loadPinnedPrettier(proj));
  } catch (e) {
    problem(`the pinned prettier ${PINNED} cannot be resolved, so the committed layer cannot be re-rendered:\n${e.message}`);
    renderNote = `prettier ${PINNED} NOT resolvable — re-render check FAILED`;
  }
  if (prettier) {
    // format-to-fixed-point: derive records the stable output (most blocks are
    // stable after one pass; a few member-chain reflows need more — the per-source
    // prettyPasses count is in split-spec.json). The loop below mirrors derive's.
    const renderFix = async (text, parser) => {
      let cur = text;
      for (let k = 1; k <= 6; k++) {
        const next = await prettier.format(cur, { parser });
        if (next === cur) return cur;
        cur = next;
      }
      return null;
    };
    let renderOK = 0;
    let renderTotal = 0;
    // inline twins re-render from their capture byte range (all pretties here)
    for (const rec of inlineMap?.blocks ?? []) {
      const capAbs = path.join(proj, rec.source);
      if (!fs.existsSync(capAbs)) continue; // already reported
      const parser = rec.kind === "importmap" ? "json" : rec.kind === "style" ? "css" : "babel";
      const src = fs.readFileSync(capAbs).subarray(rec.byteStart, rec.byteEnd).toString("utf8");
      const got = await renderFix(src, parser);
      const want = fs.readFileSync(path.join(proj, rec.file), "utf8");
      renderTotal++;
      if (got === want) renderOK++;
      else problem(`${rec.file}: does not re-render byte-exact under pinned prettier ${PINNED} ({parser:${parser}}, fixed-point method)`);
    }
    // any other pretty (the captured RUM beacon) re-renders from its capture source
    for (const abs of prettyFiles) {
      const rel = path.relative(proj, abs).split(path.sep).join("/");
      if (inlineTwinRels.has(rel)) continue;
      const capRel = captureByPretty.get(rel);
      if (!capRel || !fs.existsSync(path.join(proj, capRel))) {
        renderTotal++;
        problem(`${rel}: pretty with no capture source mapping — cannot re-render`);
        continue;
      }
      const parser = /\.pretty\.css$/i.test(rel) ? "css" : "babel";
      const got = await renderFix(fs.readFileSync(path.join(proj, capRel), "utf8"), parser);
      const want = fs.readFileSync(abs, "utf8");
      renderTotal++;
      if (got === want) renderOK++;
      else problem(`${rel}: does not re-render byte-exact under pinned prettier ${PINNED} ({parser:${parser}}, fixed-point method)`);
    }
    renderNote = `${renderOK}/${renderTotal} pretties re-render byte-exact under pinned prettier ${PINNED} (format-to-fixed-point)`;
  }

  if (problems.length) {
    console.error(`AUDIT FAIL — ${problems.length} problem(s)`);
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log(
    `AUDIT PASS — ${sections.length} spec sections (${roundOK}/${ranged} src↔pretty round-trips byte-exact, ` +
      `${tiledOK}/${bySource.size} pretty sources tiled contiguously, ` +
      `${skippedOK}/${skippedTotal} skipped non-standalone sections re-verified textually, ` +
      `${checkOK}/${onDisk.length} src slices + ${prettyOK}/${prettyParsed} readable/*.pretty.js parse standalone (node --input-type=module --check -), ` +
      `${derivedOK}/${prettyFiles.length} pretties provably distinct from their capture source, ` +
      `${indexOnlyFiles.size} index-only wholeFile/skipped sections carry no src file, ` +
      `${inlineBlocks} inline content block(s) with twins + index-inline-map.json, ` +
      `${spec?.notRendered?.length ?? 0} notRendered payload records (all captured payloads covered), ` +
      `${resolvedImports}/${checkedImports} imports resolve inside the capture (${whitelisted} whitelisted machinery), ` +
      `${renderNote}, shape guards held, capture manifest free of derived layers)`,
  );
})();
