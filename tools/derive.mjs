// derive.mjs — rebuild the derived layers (readable/ + src/ + split-spec.json)
// from the newrad-city capture (PLAN §3/§5).
//
// NEW RAD CITY (https://newrad.city/play) is capture-class: a Netlify deploy
// whose route /play serves one 22,667,976 B document holding the whole game.
// The document is the project's own single-file build: **630 inline <script>
// blocks** (22,515,466 B) — 629 modules, each opening with its own
// `/* src/<dir>/<file>.js */` banner and wrapped in one IIFE
// (`(function () { 'use strict'; … })();`), plus one `window.G_BUILD` stamp —
// and **12 inline <style> blocks** (139,891 B), each carrying its
// `/* src/<...>.css */` banner. The code is unminified project source; the
// pretty pass may fold or expand lines but never loses the banners.
//
// Pipeline (the entry document carries nearly all of the code):
//   play.html inline <script> block N (N = 1..630, document order) ->
//     readable/play-inline-N.pretty.js (pinned prettier 3.9.6 module API —
//     the CLI respects .gitignore and can silently echo its input — single
//     pass verified idempotent; every twin is provably NOT a byte copy).
//     Each block's statements are then cut into statement-aligned slices
//     src/play-inline-N-MM.js at top-level statement boundaries (~250-350
//     line windows; oversized single declarations stay whole). The module
//     IIFE wrapper head/tail and any non-standalone statement (a top-level
//     `return` guard clause inside the IIFE) are indexed as skipped sections,
//     never sliced — they would not parse standalone.
//   play.html inline <style> block N -> readable/play-inline-N.pretty.css
//     (stylesheet rule: indexed wholeFile, never sliced).
//   .netlify/scripts/rum (captured Netlify RUM beacon, minified JS without a
//     file extension) -> readable/netlify-rum.pretty.js + src/netlify-rum-NN.js.
//   every twin is recorded in readable/index-inline-map.json with the exact
//   byte range + sha256 of its capture block and the module banner it carries.
//
// Non-code payloads: none are captured (the game is procedural — no asset
// fetches at all); the `notRendered` array stays in the spec for the record.
// The off-origin loads (three.js from jsdelivr, Google Fonts stylesheets) were
// never captured (socker precedent, PLAN §1), so they have no derived layer
// either; tools/capture.mjs --check keeps them listed as external references.
//
// Identifiers in src/ are the capture's own names (the modules are unminified
// project source, so meaningful names survive) — the rename campaign (PLAN §5)
// is recorded as an open task in README.md.
// usage:
//   node tools/derive.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
// The one place this mirror resolves the pinned prettier (vendored in
// tools/vendor/prettier/ — see tools/vendor/prettier/VENDOR-README.md).
import pinnedPrettier from "./pinned-prettier.cjs";

const { PINNED, loadPinnedPrettier } = pinnedPrettier;

const here = path.dirname(fileURLToPath(import.meta.url));
const proj = path.resolve(here, "..");
// ── --check: the reproducibility gate ───────────────────────────────────
// `node tools/derive.mjs --check` re-derives the derived layers IN MEMORY
// and compares them against the committed ones. It writes NOTHING: every
// derived file is compared against the committed file, and every difference
// (a file that would change, a file that would be created, a file whose
// committed copy would be superseded into legacy/, an orphan left in
// readable/ or src/) is reported and makes the tool exit non-zero. A plain
// run re-cuts exactly as before.
const CHECK = process.argv.includes("--check");
let checkProblems = 0;
// The re-derivation, in memory: resolved path -> the content this run
// produced. The self-check below reads it back instead of the committed
// file, so a stale committed layer is never mistaken for the fresh one.
const derivedText = new Map();
// Files already counted as a problem (one problem per affected file).
const counted = new Set();
const keyOf = (abs) => path.resolve(abs);
const relOf = (abs) => path.relative(proj, abs).split(path.sep).join("/");
// Report a difference: one message and one problem per affected file, so a
// file that would both change and be superseded is reported once.
const noteProblem = (key, message) => {
  if (counted.has(key)) return;
  counted.add(key);
  checkProblems++;
  console.error(message);
};

// Write one derived file. Under --check the content is only COMPARED with
// the committed file and a difference is reported; nothing is written.
function writeDerived(abs, text, encoding) {
  const key = keyOf(abs);
  derivedText.set(key, text);
  if (!CHECK) {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, text, encoding);
    return text;
  }
  const rel = relOf(abs);
  if (!fs.existsSync(abs)) {
    noteProblem(key, `derive --check: would create ${rel}`);
  } else if (fs.readFileSync(abs, "utf8") !== text) {
    noteProblem(key, `derive --check: would change ${rel}`);
  }
  return text;
}

// Read a derived file back: the fresh derivation when there is one, the
// committed file otherwise.
function readDerived(abs) {
  const key = keyOf(abs);
  if (derivedText.has(key)) return derivedText.get(key);
  return fs.readFileSync(abs, "utf8");
}
const MAX_WINDOW = 350;
const ENTRY = "play.html";

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const readLines = (abs) => {
  const t = readDerived(abs);
  const l = t.split("\n");
  if (l.length && l[l.length - 1] === "") l.pop();
  return l;
};
const linesOf = (text) => text.replace(/\n$/, "").split("\n");
const lineOf = (text, offset) => text.slice(0, offset).split("\n").length;

// ── pinned prettier (module API, exactly 3.9.6) ─────────────────────────
// The resolution lives in tools/pinned-prettier.cjs so this mirror has ONE
// place that knows where its pinned prettier is: the vendored copy in
// tools/vendor/prettier/ first, a local node_modules second, $PRETTIER_MJS as
// the override. The sibling-mirror path this tool used to fall back on is
// gone: that node_modules is gitignored and committed nowhere, so its loss
// broke the derive with a module-not-found that read like a broken tool.
async function loadPrettier() {
  const { mod, file, label } = await loadPinnedPrettier(proj);
  return { mod, at: `${file} (${label})` };
}

// format to fixed point: prettier must reach a stable output; most inputs are
// stable after one pass, a few member-chain reflows need more (recorded per
// source in `prettyPasses` / `idempotent`). audit re-renders with the same loop.
async function formatOnce(prettier, text, parser, max = 6) {
  let cur = text;
  for (let k = 1; k <= max; k++) {
    const next = await prettier.format(cur, { parser });
    if (next === cur) return { text: cur, passes: k };
    cur = next;
  }
  throw new Error(`prettier ${parser} did not reach a fixed point in ${max} passes`);
}

// ── parse check: the exact standalone gate (ESM stdin) ──────────────────
function parses(text) {
  const r = spawnSync(process.execPath, ["--input-type=module", "--check", "-"], {
    input: text,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return { ok: r.status === 0, why: (r.stderr || "").trim().split("\n").slice(0, 5).join(" | ") };
}

// ── markers for titles (top tokens, lowercase; fleet convention) ────────
const STOP = new Set(
  ("function return typeof undefined object string number boolean prototype length value default " +
    "exports import this that with from then else case break continue delete instanceof constructor " +
    "arguments void null true false call apply name type text target window document globalthis self " +
    "require module async await yield static class const let var new for while switch throw try catch " +
    "finally extends super using debugger of in do if has own hasown get set")
    .split(" ")
    .filter(Boolean),
);
function markers(text, n = 2) {
  const code = text.replace(/`[^`]*`|"[^"\n]*"|'[^'\n]*'/g, " ");
  const counts = new Map();
  for (const m of code.matchAll(/[A-Za-z][A-Za-z0-9_]{2,}/g)) {
    const w = m[0].toLowerCase();
    if (STOP.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n);
}
const markerText = (ms) => ms.map(([w, c]) => `${w}(${c})`).join(", ");

// ── windowize: cut only at statement starts; ≤350 lines, a single ───────
// ── oversized declaration is a window of its own ────────────────────────
function windowize(stmts) {
  const out = [];
  let cur = null;
  for (const s of stmts) {
    if (!cur) {
      cur = { first: s, last: s, count: 1, startLine: s.startLine, endLine: s.endLine };
      continue;
    }
    const projected = s.endLine - cur.startLine + 1;
    if (projected > MAX_WINDOW) {
      out.push(cur);
      cur = { first: s, last: s, count: 1, startLine: s.startLine, endLine: s.endLine };
    } else {
      cur.last = s;
      cur.count++;
      cur.endLine = s.endLine;
    }
  }
  if (cur) out.push(cur);
  return out;
}

// ── is a statement standalone at module top level? A `return` that is not ─
// ── nested inside a function makes the statement non-standalone ────────────
function hasTopLevelReturn(node) {
  let found = false;
  const walk = (n) => {
    if (!n || found || typeof n.type !== "string") return;
    // any function-ish scope owns its own `return` (arrow/function/class
    // methods, object-literal methods, getters/setters, static blocks)
    if (/Function|Method|StaticBlock/.test(n.type)) return;
    if (n.type === "ReturnStatement") {
      found = true;
      return;
    }
    for (const k of Object.keys(n)) {
      if (k === "loc" || k === "start" || k === "end" || k === "range" || k === "leadingComments" || k === "trailingComments") continue;
      const v = n[k];
      if (Array.isArray(v)) {
        for (const c of v) if (c && typeof c.type === "string") walk(c);
      } else if (v && typeof v.type === "string") {
        walk(v);
      }
    }
  };
  walk(node);
  return found;
}

// ── inline block scan (byte-exact, over the raw entry buffer) ───────────
// Ordered single-pass tokenizer: script/style content ends at the first
// `</script`/`</style` (browser rule), and HTML comments are skipped — so a
// `<style>`/`<script>` string inside a block is never miscounted as a block
// (this document carries such strings in its menu/grain CSS templates).
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
    if (j < 0) throw new Error(`unterminated <${kind}> opened at byte ${best}`);
    const tag = buf.subarray(best, tagEnd + 1).toString("utf8");
    const isImportmap = /\btype\s*=\s*["']importmap["']/i.test(tag);
    const external = /\bsrc\s*=\s*["']/i.test(tag);
    if (external) {
      out.push({ kind, external: true, tag, openStart: best });
    } else {
      if (kind === "script") nScript++;
      else nStyle++;
      const content = buf.subarray(tagEnd + 1, j);
      const text = content.toString("utf8");
      // the module's own banner, when the block carries one (provenance)
      const banner = (/^\s*\/\*\s*(src\/[^*\n]+?\.(?:js|css))\s*\*\//.exec(text) || [])[1] ?? null;
      out.push({
        kind: isImportmap ? "importmap" : kind,
        external: false,
        block: kind === "script" ? nScript : nStyle,
        tag,
        banner,
        openStart: best,
        contentStart: tagEnd + 1,
        contentEnd: j,
        bytes: content.length,
        sha256: sha256(content),
        text,
      });
    }
    p = j + close.length;
  }
  return out;
}

// captured files that are script sources and get a pretty twin + slices
// (rum carries no extension — it is served at that route as text/javascript)
const CAPTURED_SCRIPT = /(\.(?:js|mjs)$)|(^\.netlify\/scripts\/rum$)/;

async function main() {
  const { mod: prettier, at } = await loadPrettier();
  console.log(`pinned prettier ${PINNED} (${at})`);

  const manifest = JSON.parse(fs.readFileSync(path.join(proj, ".upstream", "manifest.json"), "utf8"));
  const captured = Object.keys(manifest.files).map((r) => r.split(path.sep).join("/")).sort();
  const captureBytes = (rel) => {
    const abs = path.join(proj, rel);
    if (!fs.existsSync(abs)) throw new Error(`capture file missing: ${rel}`);
    const buf = fs.readFileSync(abs);
    if (sha256(buf) !== manifest.files[rel].sha256)
      throw new Error(`${rel} on disk does not match .upstream/manifest.json — re-verify the capture first`);
    return buf;
  };

  const readableDir = path.join(proj, "readable");
  const srcDir = path.join(proj, "src");
  if (!CHECK) {
    fs.mkdirSync(readableDir, { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });
  }
  const written = { readable: new Set(), src: new Set() };

  const sources = [];
  const sections = [];
  const notRendered = [];
  const inlineMapBlocks = [];
  const inlineFiles = [];
  let slicedTotal = 0;
  let wholeTotal = 0;
  let skippedTotal = 0;

  // ── statement-aligned slicing of one script source (pretty text) ───────
  async function sliceScript({
    rel,
    captureKind,
    captureByteStart,
    captureByteEnd,
    captureSha256,
    captureBytesLen,
    tag,
    banner,
    pretty,
    prettyPasses = 1,
    sourceFile,
  }) {
    const lines = linesOf(pretty);
    const dbg = await prettier.__debug.parse(pretty, { parser: "babel" });
    const program = (dbg.ast.program || dbg.ast).body;
    if (!program.length) throw new Error(`${sourceFile}: no top-level statements — readable changed shape`);

    // Generic IIFE unwrap (fleet pattern): each module block is one
    // `(function () { 'use strict'; … })();` expression statement, so slices
    // are cut at the body's statement boundaries.
    let inner = program;
    let slicingMode = "top-level-program";
    let iifeFn = null;
    if (program.length === 1 && program[0].type === "ExpressionStatement") {
      const e = program[0].expression;
      const fn = e.type === "CallExpression" && e.callee ? e.callee : e;
      if (
        (fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression") &&
        fn.body.type === "BlockStatement"
      ) {
        inner = fn.body.body;
        iifeFn = fn;
        slicingMode = "iife-body";
      }
    }
    const directives = iifeFn ? iifeFn.body.directives || [] : [];
    const directiveStmts = directives.map((d) => ({
      node: d,
      startLine: lineOf(pretty, d.start),
      endLine: lineOf(pretty, d.end),
      text: pretty.slice(d.start, d.end),
    }));
    const stmts = [
      ...directiveStmts,
      ...inner.map((n) => ({
        node: n,
        startLine: lineOf(pretty, n.start),
        endLine: lineOf(pretty, n.end),
        text: pretty.slice(n.start, n.end),
      })),
    ];
    for (let i = 1; i < stmts.length; i++)
      if (stmts[i].startLine <= stmts[i - 1].endLine)
        throw new Error(`${rel}: statements ${i - 1}/${i} share a line — cannot slice at line boundaries`);

    const specials = [];
    const covered = new Array(stmts.length).fill(false);
    const claim = (a, b, block) => {
      if (a < 0 || b < a || b >= stmts.length) throw new Error(`${rel}: bad ${block.file} range ${a}-${b}`);
      for (let i = a; i <= b; i++) {
        if (covered[i]) throw new Error(`${rel}: ${block.file} overlaps another block at statement ${i}`);
        covered[i] = true;
      }
      specials.push({ ...block, A: stmts[a].startLine, B: stmts[b].endLine });
    };

    // wrapper head/tail (only when an IIFE was unwrapped)
    if (slicingMode === "iife-body") {
      const first = stmts[0];
      const last = stmts[stmts.length - 1];
      if (first.startLine > 1)
        specials.push({
          kind: "skip",
          file: `${tag}-wrapper-head.js`,
          title: `${tag} — IIFE wrapper head (non-standalone, not sliced)`,
          desc: `Lines 1-${first.startLine - 1}. The block opens with its module banner comment and a single top-level IIFE (\`(function () {\`); the wrapper head is not standalone, so it is indexed only. Slices are cut inside the body (${slicingMode}).`,
          A: 1,
          B: first.startLine - 1,
        });
      if (last.endLine < lines.length)
        specials.push({
          kind: "skip",
          file: `${tag}-wrapper-tail.js`,
          title: `${tag} — IIFE wrapper tail (non-standalone, not sliced)`,
          desc: `Lines ${last.endLine + 1}-${lines.length}. The IIFE invocation tail (\`})();\`) is not standalone, so it is indexed only.`,
          A: last.endLine + 1,
          B: lines.length,
        });
    }

    // body statements that are not standalone at module top level (top-level
    // `return` guard clauses inside the module IIFE)
    for (let i = 0; i < stmts.length; i++) {
      if (!covered[i] && hasTopLevelReturn(stmts[i].node)) {
        claim(i, i, {
          kind: "skip",
          file: `${tag}-nonstandalone-${i + 1}.js`,
          title: `${tag} — non-standalone statement (top-level return guard, not sliced)`,
          desc: `Lines ${stmts[i].startLine}-${stmts[i].endLine}. This statement is only valid inside a function body (it contains a top-level \`return\`), so it is indexed only — it would not parse standalone.`,
        });
      }
    }

    // runs of uncovered statements -> windows
    const runs = [];
    for (let i = 0; i < stmts.length; i++) {
      if (covered[i]) continue;
      const run = [stmts[i]];
      while (i + 1 < stmts.length && !covered[i + 1]) run.push(stmts[++i]);
      runs.push(run);
    }
    const windows = [];
    for (const run of runs) for (const w of windowize(run)) windows.push(w);

    // blocks in line order, then re-tile so every line of the pretty is owned
    const blocks = [
      ...specials,
      ...windows.map((w) => ({ kind: "slice", A: w.startLine, B: w.endLine, count: w.count })),
    ];
    blocks.sort((a, b) => a.A - b.A);
    for (let i = 0; i < blocks.length; i++) {
      if (i === 0) blocks[i].A = 1;
      if (i + 1 < blocks.length) blocks[i].B = blocks[i + 1].A - 1;
      else blocks[i].B = lines.length;
    }

    let nn = 0;
    let perFileSkipped = 0;
    let perFileWhole = 0;
    for (const b of blocks) {
      if (b.kind === "slice") {
        nn++;
        const num = String(nn).padStart(2, "0");
        const body = lines.slice(b.A - 1, b.B).join("\n") + "\n";
        const ms = markers(body);
        const topWord = ms.length ? ms[0][0] : /^\s*['"]use strict['"]/.test(body) ? "use-strict" : tag.toLowerCase();
        const oversized = b.count === 1 && b.B - b.A + 1 > MAX_WINDOW;
        const file = `${tag}-${num}.js`;
        const sliceText =
          `// ${tag} ${num} — ${topWord}\n` +
          `// Lines ${b.A}-${b.B} of ${sourceFile} (statement-aligned).\n` +
          body;
        const chk = parses(sliceText);
        if (!chk.ok) throw new Error(`generated src/${file} does not parse standalone: ${chk.why}`);
        writeDerived(path.join(srcDir, file), sliceText);
        written.src.add(file);
        sections.push({
          file,
          title: `${tag} ${num} — ${topWord}`,
          desc: `${oversized ? "Oversized single declaration (kept whole). " : ""}Lines ${b.A}-${b.B}. Markers: ${markerText(ms)}.`,
          startLine: b.A,
          endLine: b.B,
          sourceFile,
        });
      } else if (b.kind === "whole") {
        perFileWhole++;
        sections.push({
          file: b.file,
          wholeFile: true,
          title: b.title,
          desc: `Lines ${b.A}-${b.B} of ${sourceFile}: ${b.body}`,
          note: "whole-file region (vendor/machinery rule): indexed in readable/, never sliced",
          startLine: b.A,
          endLine: b.B,
          sourceFile,
        });
      } else {
        perFileSkipped++;
        sections.push({
          file: b.file,
          skipped: true,
          title: b.title,
          desc: b.desc,
          startLine: b.A,
          endLine: b.B,
          sourceFile,
          firstLine: lines[b.A - 1],
          lastLine: lines[b.B - 1],
        });
      }
    }
    slicedTotal += nn;
    wholeTotal += perFileWhole;
    skippedTotal += perFileSkipped;
    sources.push({
      sourceFile,
      capture: rel,
      captureKind,
      captureByteStart,
      captureByteEnd,
      captureSha256,
      captureBytes: captureBytesLen,
      prettyLines: lines.length,
      prettyBytes: Buffer.byteLength(pretty, "utf8"),
      prettyPasses,
      idempotent: prettyPasses === 1,
      tag,
      module: banner || null,
      slicingMode,
      slices: nn,
      derived:
        `readable + ${nn} statement-aligned slice(s)` +
        (perFileWhole ? ` + ${perFileWhole} wholeFile region(s)` : "") +
        (perFileSkipped ? ` + ${perFileSkipped} skipped section(s)` : ""),
    });
  }

  // ── 1) captured script files (the Netlify RUM beacon) ──────────────────
  const jsRels = captured.filter((r) => CAPTURED_SCRIPT.test(r));
  for (const rel of jsRels) {
    const buf = captureBytes(rel);
    const text = buf.toString("utf8");
    if (!Buffer.from(text, "utf8").equals(buf)) throw new Error(`${rel} does not round-trip through utf8`);
    const { text: pretty, passes } = await formatOnce(prettier, text, "babel");
    if (pretty === text) throw new Error(`${rel}: prettier output is byte-identical to the capture`);
    const tag = rel === ENTRY ? "play" : "netlify-rum";
    const prettyFile = `${tag}.pretty.js`;
    writeDerived(path.join(readableDir, prettyFile), pretty);
    written.readable.add(prettyFile);
    await sliceScript({
      rel,
      captureKind: "file",
      captureSha256: manifest.files[rel].sha256,
      captureBytesLen: buf.length,
      tag,
      banner: null,
      pretty,
      prettyPasses: passes,
      sourceFile: `readable/${prettyFile}`,
    });
    console.log(`derive: ${rel} -> readable/${prettyFile} (${linesOf(pretty).length} lines, ${passes} pass(es))`);
  }

  // ── 2) entry document: inline <script>/<style> scan + twins + slicing ───
  const htmlRels = captured.filter((r) => /\.html$/i.test(r));
  if (!htmlRels.length) throw new Error("capture carries no HTML entry document");
  for (const rel of htmlRels) {
    const buf = captureBytes(rel);
    const blocks = scanBlocks(buf);
    const inline = blocks.filter((b) => !b.external);
    const externals = blocks.filter((b) => b.external);
    inlineFiles.push(rel);
    for (const b of externals) console.log(`derive: ${rel}: external ${b.kind} (not derived): ${b.tag.slice(0, 90)}`);
    if (!inline.length) throw new Error(`${rel}: no inline <script>/<style> content blocks — nothing to derive`);
    const entryTag = rel.replace(/\.html$/i, "").split("/").join("__");
    const DATA_TYPES = new Set(["application/ld+json", "application/json", "importmap", "speculationrules"]);
    for (const b of inline) {
      const isImportmap = b.kind === "importmap";
      const type = (/\btype\s*=\s*["']?([^"'\s>]+)/i.exec(b.tag)?.[1] ?? "").toLowerCase();
      if (b.kind === "script" && DATA_TYPES.has(type)) {
        notRendered.push({
          capture: rel,
          kind: "inline-data",
          type,
          byteStart: b.contentStart,
          byteEnd: b.contentEnd,
          bytes: b.bytes,
          sha256: b.sha256,
          rendered: false,
          reason: `typed data block (<script type="${type}">) — data, not JS/CSS; recorded with range + sha256, no pretty pass`,
        });
        continue;
      }
      const tag = `${entryTag}-inline-${b.block}`;
      const parser = isImportmap ? "json" : b.kind === "style" ? "css" : "babel";
      const prettyExt = isImportmap ? "json" : b.kind === "style" ? "css" : "js";
      const prettyFile = `${tag}.pretty.${prettyExt}`;
      const { text: pretty, passes } = await formatOnce(prettier, b.text, parser);
      if (pretty === b.text)
        throw new Error(`readable/${prettyFile} would be byte-identical to its capture source`);
      writeDerived(path.join(readableDir, prettyFile), pretty);
      written.readable.add(prettyFile);
      inlineMapBlocks.push({
        file: `readable/${prettyFile}`,
        source: rel,
        kind: isImportmap ? "importmap" : b.kind,
        block: b.block,
        module: b.banner,
        byteStart: b.contentStart,
        byteEnd: b.contentEnd,
        bytes: b.bytes,
        sha256: b.sha256,
        prettyFile: `readable/${prettyFile}`,
        prettyBytes: Buffer.byteLength(pretty, "utf8"),
      });
      if (b.kind === "style" || isImportmap) {
        // stylesheet/importmap rule: whole-file, never sliced
        const lines = linesOf(pretty);
        sections.push({
          file: `${tag}.${prettyExt}`,
          wholeFile: true,
          title: `${tag} — inline ${isImportmap ? "importmap" : "style"} block (whole-file, never sliced)`,
          desc: `Lines 1-${lines.length} of readable/${prettyFile}. Whole-file: the entry document's inline ${b.kind} block (${b.bytes} B at bytes ${b.contentStart}-${b.contentEnd} of ${rel}${b.banner ? `, module banner ${b.banner}` : ""}) is indexed whole and never sliced.`,
          note: `whole-file (entry inline ${b.kind} block, not sliced)`,
          startLine: 1,
          endLine: lines.length,
          sourceFile: `readable/${prettyFile}`,
        });
        sources.push({
          sourceFile: `readable/${prettyFile}`,
          capture: rel,
          captureKind: `inline-${b.kind}`,
          captureByteStart: b.contentStart,
          captureByteEnd: b.contentEnd,
          captureSha256: b.sha256,
          captureBytes: b.bytes,
          prettyLines: lines.length,
          prettyBytes: Buffer.byteLength(pretty, "utf8"),
          prettySha256: sha256(Buffer.from(pretty, "utf8")),
          prettyPasses: passes,
          idempotent: passes === 1,
          tag,
          module: b.banner || null,
          slices: 0,
          derived: "readable only (inline block, wholeFile)",
        });
      } else {
        await sliceScript({
          rel,
          captureKind: `inline-${b.kind}`,
          captureByteStart: b.contentStart,
          captureByteEnd: b.contentEnd,
          captureSha256: b.sha256,
          captureBytesLen: b.bytes,
          tag,
          banner: b.banner,
          pretty,
          prettyPasses: passes,
          sourceFile: `readable/${prettyFile}`,
        });
        console.log(
          `derive: ${rel} inline script #${b.block}${b.banner ? ` (${b.banner})` : ""} -> readable/${prettyFile} (${linesOf(pretty).length} lines, ${passes} pass(es))`,
        );
      }
    }
  }

  // ── 3) non-code payloads: hashed notRendered records (no pretty pass) ───
  for (const rel of captured) {
    if (/\.html?$/i.test(rel) || CAPTURED_SCRIPT.test(rel) || /\.css$/i.test(rel)) continue;
    const buf = captureBytes(rel);
    notRendered.push({
      capture: rel,
      kind: "binary",
      bytes: buf.length,
      sha256: manifest.files[rel].sha256,
      rendered: false,
      reason: `non-code payload — binary/data capture stays byte-exact under .upstream/manifest.json; recorded here hashed, no pretty pass`,
    });
  }

  // ── 4) inline map (byte ranges + sha256 + module banners) ───────────────
  writeDerived(
    path.join(readableDir, "index-inline-map.json"),
    JSON.stringify(
      {
        note:
          "byte ranges (into the captured entry document) + sha256 for every inline <script>/<style> content block, " +
          "with its readable twin and the module banner the block carries; generated by tools/derive.mjs",
        blocks: inlineMapBlocks,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`derive: wrote readable/index-inline-map.json (${inlineMapBlocks.length} inline block(s))`);

  // ── 5) prune orphan derived files (capture untouched) ──────────────────
  let pruned = 0;
  for (const [dir, keep, exts] of [
    [readableDir, written.readable, /\.(pretty\.js|pretty\.css|pretty\.json)$/],
    [srcDir, written.src, /\.js$/],
  ]) {
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
      if (exts.test(f) && !keep.has(f)) {
        if (CHECK) {
          noteProblem(
            keyOf(path.join(dir, f)),
            `derive --check: orphan derived file ${path.join(path.basename(dir), f)}`,
          );
        } else {
          fs.rmSync(path.join(dir, f));
          pruned++;
          console.log(`derive: pruned orphan derived file ${path.join(path.basename(dir), f)}`);
        }
      }
    }
  }

  // ── 6) split-spec.json (2-space indent + trailing newline) ─────────────
  const appSources = sources.filter((s) => s.slices > 0);
  const moduleCount = sources.filter((s) => s.module).length;
  // stable entry point: the first slice of the module that opens the game
  // (src/core/layout.js — the world-layout single source of truth), falling
  // back to the first ranged slice overall
  const entrySource = sources.find((s) => s.module === "src/core/layout.js")?.sourceFile;
  const defaultSection =
    (entrySource && sections.find((s) => !s.wholeFile && !s.skipped && s.sourceFile === entrySource)) ??
    sections.find((s) => !s.wholeFile && !s.skipped);
  const spec = {
    project: "newrad-city",
    kind: "statement-aligned-slices",
    defaultFile: `src/${defaultSection.file}`,
    note:
      "NEW RAD CITY (https://newrad.city/play) is capture-class: a Netlify deploy whose pretty-URL route /play " +
      "serves the deploy's play.html (byte-identical at /play.html; /play/ 301-redirects to /play). One " +
      "22,667,976 B document holds the whole game — the project's own single-file build inlining 629 source " +
      "modules as 630 inline <script> blocks (22,515,466 B), each opening with its own `/* src/<dir>/<file>.js */` " +
      "banner and wrapped in a single IIFE (`(function () { 'use strict'; … })();`), plus 12 inline <style> " +
      "blocks (139,891 B) with their own `/* …css */` banners, over a small UI markup shell. §0.4 " +
      "fork-over-mirror was checked on 2026-10-13 — see README (no public upstream repo for the project " +
      "itself; the only repository credits in the captured text are library/author links, and GitHub searches " +
      "for the game's name and author return nothing) — so the mirror stands. Derived pipeline: capture → " +
      "pinned prettier 3.9.6 (module API, default options, format-to-fixed-point — most blocks are stable " +
      "after one pass, a few member-chain reflows need up to 3; the per-source prettyPasses count is recorded; " +
      "never the CLI: it respects .gitignore and can silently echo its input) → every inline content block " +
      "becomes a readable twin (readable/play-inline-<N>.pretty.js for scripts #1..630 in document order, " +
      "readable/play-inline-<N>.pretty.css for styles #1..12; every twin provably NOT byte-identical to its " +
      "capture block; readable/index-inline-map.json records each block's exact byte range + sha256 + module " +
      "banner), and the captured Netlify RUM beacon (.netlify/scripts/rum, an extensionless minified JS route) " +
      "becomes readable/netlify-rum.pretty.js. Script twins are then cut into statement-aligned slices " +
      "src/<tag>-NN.js: the module IIFE is unwrapped and only its body's top-level statement boundaries are " +
      "used (~250-350 line windows; oversized single declarations stay whole), with the exact 2-line " +
      "provenance header. Statements that cannot stand alone (the IIFE wrapper head/tail, and top-level " +
      "`return` guard clauses inside the module IIFE) are indexed as skipped sections, never sliced. Every " +
      "slice parses standalone under `node --input-type=module --check -` and round-trips byte-exact to its " +
      "recorded readable line range. Stylesheet rule — the 12 inline <style> blocks are wholeFile sections, " +
      "never sliced. Non-code payloads: none are captured (the game is fully procedural; no same-origin asset " +
      "requests exist); the notRendered array is kept for the record. The off-origin loads (three.js " +
      "0.158.0 from cdn.jsdelivr.net, the Google Fonts stylesheets/font origins) were never captured (socker " +
      "precedent, PLAN §1) and have no derived layer; tools/capture.mjs --check lists them as external " +
      "references. Identifiers in src/ are the capture's own names (the modules are unminified project " +
      "source) — the rename campaign (PLAN §5) is recorded as an open task in README.md, not claimed here. " +
      "Capture bytes are untouched by everything above; re-cut with `node tools/derive.mjs` after any " +
      "capture refresh. `node tools/audit.js` is the gate.",
    renderOptions: {
      _default:
        "prettier 3.9.6, module API, default options, format-to-fixed-point (re-format until the output is stable — recorded per source as prettyPasses; most are 1, a few need 2-3) — never the CLI: it respects .gitignore and can silently echo its input",
      js: "parser babel, no plugins (inline <script> blocks + the captured extensionless RUM beacon)",
      css: "parser css, no plugins (inline <style>)",
      json: "parser json, no plugins (inline importmap blocks, if any)",
    },
    source:
      `readable/: ${inlineMapBlocks.length} inline twin(s) + ${jsRels.length} captured script twin(s) ` +
      `(${sources.length} total sources); src/: ${slicedTotal} statement-aligned slice(s); ` +
      `${wholeTotal} wholeFile section(s); ${skippedTotal} skipped section(s); ` +
      `capture: ${captured.length} files under .upstream/manifest.json; inline scan: ${inlineFiles.join(", ")} ` +
      `(${inlineMapBlocks.length} content block(s), ${moduleCount} carrying their own module banner); ` +
      `notRendered: ${notRendered.length} hashed payload record(s).`,
    inline: {
      scanned: inlineFiles,
      contentBlocks: inlineMapBlocks.length,
      notRendered: notRendered.filter((n) => n.kind === "inline-data").length,
      note:
        "the entry document carries 630 inline <script> content blocks (the project's single-file build: 629 " +
        "banners + one G_BUILD stamp) and 12 inline <style> blocks; every content block has a readable twin " +
        "recorded in readable/index-inline-map.json with its exact byte range + sha256 + module banner. The " +
        "off-origin <link rel=stylesheet> (Google Fonts) and the jsdelivr three.js <script src> are CDN " +
        "dependencies and are not derived.",
    },
    sources,
    sections,
    notRendered,
  };
  writeDerived(path.join(proj, "split-spec.json"), JSON.stringify(spec, null, 2) + "\n");

  // ── 7) self-check (tools/audit.js is the authoritative gate) ────────────
  let bad = 0;
  const bySource = new Map();
  for (const s of sections) {
    if (!bySource.has(s.sourceFile)) bySource.set(s.sourceFile, []);
    bySource.get(s.sourceFile).push(s);
  }
  for (const [sourceFile, list] of bySource) {
    const lines = readLines(path.join(proj, sourceFile));
    const sorted = [...list].sort((a, b) => a.startLine - b.startLine);
    if (sorted[0].startLine !== 1) {
      console.error(`TILING FAIL ${sourceFile}: starts at line ${sorted[0].startLine}`);
      bad++;
    }
    for (let i = 1; i < sorted.length; i++)
      if (sorted[i].startLine !== sorted[i - 1].endLine + 1) {
        console.error(`TILING FAIL ${sourceFile}: gap/overlap at ${sorted[i].file}`);
        bad++;
      }
    if (sorted[sorted.length - 1].endLine !== lines.length) {
      console.error(`TILING FAIL ${sourceFile}: does not reach EOF (${lines.length})`);
      bad++;
    }
  }
  let parsed = 0;
  let ranged = 0;
  let roundOK = 0;
  for (const s of sections) {
    if (s.wholeFile || s.skipped) continue;
    ranged++;
    const abs = path.join(srcDir, s.file);
    const text = readDerived(abs);
    const nl2 = text.indexOf("\n", text.indexOf("\n") + 1);
    const body = text.slice(nl2 + 1);
    const expected = readLines(path.join(proj, s.sourceFile)).slice(s.startLine - 1, s.endLine).join("\n") + "\n";
    if (body !== expected) {
      console.error(`ROUND-TRIP FAIL ${s.file}`);
      bad++;
    } else roundOK++;
    if (!parses(text).ok) {
      console.error(`PARSE FAIL src/${s.file}`);
      bad++;
    } else parsed++;
  }
  let prettyParsed = 0;
  for (const s of sources) {
    if (!s.sourceFile.endsWith(".pretty.js")) continue;
    if (!parses(readDerived(path.join(proj, s.sourceFile))).ok) {
      console.error(`PARSE FAIL ${s.sourceFile}`);
      bad++;
    } else prettyParsed++;
  }
  console.log(
    `derive: ${written.readable.size} readable file(s), ${written.src.size} src slices ` +
      `(${parsed}/${ranged} parse standalone, ${roundOK}/${ranged} round-trip byte-exact), ` +
      `${skippedTotal} skipped, ${sections.filter((s) => s.wholeFile).length} wholeFile, ` +
      `${prettyParsed} pretty js parse clean, ${notRendered.length} notRendered, ${pruned} orphan(s) pruned — ` +
      `self-check ${bad ? bad + " FAILURE(S)" : "clean"}`,
  );
  if (CHECK) {
    if (checkProblems || bad) {
      console.error(
        `derive --check: ${checkProblems} difference(s) between the committed derived layers and a fresh re-derivation` +
          (bad ? ` (self-check: ${bad} failure(s))` : ""),
      );
      process.exit(1);
    }
    console.log("derive --check: the committed derived layers match a fresh re-derivation exactly (nothing written)");
    process.exit(0);
  }
  if (bad) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
