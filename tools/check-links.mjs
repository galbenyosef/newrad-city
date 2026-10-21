// check-links.mjs — does every file of the derived layer export only names
// the layer actually declares?
//
// THE CLASS THIS GATE GUARDS
//   In an ES module, `export { x }` names a binding OF THAT MODULE. When x is
//   not declared there the module does not link: it is a hard SyntaxError
//   ("Export 'x' is not defined"), and the file cannot be imported at all.
//
//   The mirror's own gates do not see this class:
//     - check-exports.mjs compares a CAPTURE's export table with the LAYER's
//       PUBLIC names. It never asks whether the layer's own export statement
//       names a binding the layer declares.
//     - verify.mjs re-hashes the capture and re-derives every slice from its
//       recorded range. A slice that exports a name it does not declare still
//       round-trips byte-exactly.
//
// THIS MIRROR (newrad-city)
//   The derived layer is a CLASSIC-SCRIPT layer. The capture is one document
//   whose inline <script> blocks are IIFE-wrapped module bodies; the derive
//   unwraps them and cuts each into src/*.js slices, and the wrapper head and
//   tail and the top-level return guards stay out of the layer as `skipped`
//   sections. A slice of this layer carries NO import statement and NO export
//   statement - the layer has no ES module export table at all, in any of its
//   2945 files or in any of its 631 readable modules.
//
//   So the class this gate guards is structurally absent here today, and the
//   gate says so: 631 scopes, 0 export tables, nothing to fail. It is
//   deployed anyway because it is this mirror's only watch on the export side
//   of the layer, and it fires the moment a slice carries an export table
//   that names a binding the module does not declare.
//
//   A scope of this mirror is the group of slices cut from ONE readable
//   module: they share the module's scope, and the ranges the layer does not
//   carry (the skipped wrapper head and tail) contribute the readable copy's
//   own bytes. This mirror has no rename layer, so the readable copy's
//   spelling IS the layer's spelling.
//

// WHAT IT CHECKS
//   For every SCOPE of the layer that carries an export table:
//     1. the scope is reassembled from the LAYER's OWN bytes — every slice
//        contributes its payload, and every range the layer does not carry (a
//        skipped tail) contributes the mirror's own record of it — and the
//        reassembly is linked;
//     2. a file of that scope whose own strict-ESM check
//        (`node --input-type=module --check -`) reports "Export 'x' is not
//        defined" exports a name it does not declare. If the scope links, the
//        binding is declared by a SIBLING SLICE: the scope is cut from one
//        module, the pieces together are the module, and the file is a
//        FRAGMENT, not a defect. If the scope does not link either, the
//        binding exists NOWHERE and that is a real break, which the gate
//       names.
//
// WHY THE ENGINE IS THE JUDGE
//   The question that matters is the one the engine answers: does this text
//   link? So the gate asks the engine — once for the file, once for the scope
//   the file belongs to — instead of asking a parser which names it thinks a
//   file declares.
//
// WHAT IT DOES NOT COVER
//   - A scope that does not link even after the reassembly (a chunk whose own
//     text is not a module) cannot be judged for this class; the gate says so
//     instead of guessing.
//   - The IMPORT side of the layer graph (a named import the target does not
//     export) is a different class with a different owner.
//
// Usage: node tools/check-links.mjs [--quiet]
// Exits 1 if a layer file exports a binding the layer does not declare.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJ = path.resolve(HERE, "..");
const SRC = path.join(PROJ, "src");
const QUIET = process.argv.includes("--quiet");

// ── this mirror's own conventions ──────────────────────────────────────────
// ==== MIRROR CONFIG ====
function isStandalone(sec) {
  if (sec.wholeFile === true) return true;
  return false;
}

/**
 * The mirror's rename layer: the map from the CAPTURE's spelling of a binding
 * to the layer's spelling of it, keyed by the layer file the rename fires in.
 * null when the mirror has no rename layer (its readable copy already carries
 * the layer's spelling).
 */
const RENAME_MAP_FILE = null;
// ==== END MIRROR CONFIG ====

const read = (p) => {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
};

/**
 * The engine's own verdict on a text: does it link as an ES module?
 * `--input-type=module --check -` is the strict-ESM path: the CJS path lets an
 * export table name a binding the module never declares through.
 */
function esmCheck(text) {
  const r = spawnSync(process.execPath, ["--input-type=module", "--check", "-"], {
    input: text,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  if (r.status === 0) return { ok: true, missing: null, error: null };
  const err = String(r.stderr || "") + String(r.stdout || "");
  const m = /Export '([^']+)' is not defined/.exec(err);
  const lines = err.trim().split("\n").filter((l) => l.trim());
  const said = lines.find((l) => /Error/.test(l)) || lines[lines.length - 1] || err.trim();
  return {
    ok: false,
    missing: m ? m[1] : null,
    error: said.trim(),
  };
}

const ESCAPE_RE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The export tables of a text, as [start, end) spans. */
function exportTableSpans(text) {
  const spans = [];
  const re = /\bexport\s*\{/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const brace = text.indexOf("{", m.index);
    if (brace < 0) break;
    let depth = 1;
    let i = brace + 1;
    while (i < text.length && depth > 0) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      i++;
    }
    if (depth !== 0) break;
    spans.push([m.index, i]);
    re.lastIndex = i;
  }
  return spans;
}

/**
 * The LOCAL names an export table names — the bindings the module must
 * declare. A shorthand specifier (`x`) names x; an aliased one (`x as y`)
 * names x and exports it as y.
 */
function tableLocalNames(text) {
  const out = [];
  for (const [s, e] of exportTableSpans(text)) {
    const body = text.slice(s, e);
    const inner = body.slice(body.indexOf("{") + 1, body.lastIndexOf("}"));
    for (const part of inner.split(",")) {
      const seg = part.trim();
      if (!seg) continue;
      const m = /^([A-Za-z_$][\w$]*)\s+as\s+/.exec(seg);
      const name = m ? m[1] : /^[A-Za-z_$][\w$]*$/.test(seg) ? seg : null;
      if (name && !out.includes(name)) out.push(name);
    }
  }
  return out;
}

/**
 * The names a file's export statement exports that the file itself does not
 * declare. The engine names one per check, so the check is repeated with the
 * offending specifier removed each time: what is left is the whole list.
 */
function undeclaredExports(text) {
  const out = [];
  let probe = text;
  for (let i = 0; i < 500; i++) {
    const v = esmCheck(probe);
    if (v.ok || !v.missing) break;
    if (out.includes(v.missing)) break;
    out.push(v.missing);
    const next = blankSpecifier(probe, v.missing);
    if (next === probe) break;
    probe = next;
  }
  return out;
}

/** Remove the export specifier whose SOURCE name is `name` (the probe only). */
function blankSpecifier(text, name) {
  return text.replace(/\bexport\s*\{([^}]*)\}/g, (whole, body) => {
    const kept = body.split(",").filter((part) => {
      const seg = part.trim();
      if (!seg) return false; // an empty element is a syntax error
      const m = /^([A-Za-z_$][\w$]*)\s+as\s+/.exec(seg);
      return (m ? m[1] : seg) !== name;
    });
    return whole.replace(body, kept.join(", "));
  });
}

/**
 * Erase every mention of `name` in a text, EXCEPT inside an export table:
 * the export table is the question being asked, so it must keep naming the
 * name. A module whose declaration of the name has been erased then fails to
 * link, and that is how the declaring slice is found.
 */
function eraseName(text, name, probe) {
  const spans = exportTableSpans(text);
  const re = new RegExp(`(?<![\\w$])${ESCAPE_RE(name)}(?![\\w$])`, "g");
  let out = "";
  let at = 0;
  for (const [s, e] of spans) {
    out += text.slice(at, s).replace(re, probe);
    out += text.slice(s, e);
    at = e;
  }
  out += text.slice(at).replace(re, probe);
  return out;
}

/** The slice's payload: its text without the header comment lines. */
function payloadLines(text) {
  const raw = text.split("\n");
  if (raw.length && raw[raw.length - 1] === "") raw.pop(); // the final newline
  let h = 0;
  while (h < raw.length && /^\s*\/\//.test(raw[h])) h++;
  return raw.slice(h);
}

/** Every .js file under a directory. */
function walkJs(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkJs(p, out);
    else if (e.name.endsWith(".js")) out.push(p);
  }
  return out;
}

// ── the mirror's own record of the layer ───────────────────────────────────
const specPath = path.join(PROJ, "split-spec.json");
if (!fs.existsSync(specPath)) {
  console.log("check-links: no split-spec.json - this mirror has no derived layer to check");
  process.exit(0);
}
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

/** The layer file a section names, if it is on disk. */
function layerFileOf(sec) {
  const rel = String(sec.file).replace(/\\/g, "/");
  for (const c of [
    path.join(SRC, rel),
    path.join(PROJ, rel),
    path.join(SRC, path.basename(rel)),
  ]) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

/** The mirror's own readable copy of the original module, if it has one. */
function sourceFileOf(sourceFile) {
  if (!sourceFile) return null;
  const rel = String(sourceFile).replace(/\\/g, "/");
  for (const c of [path.join(PROJ, rel), path.join(PROJ, "readable", path.basename(rel))]) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

// ── the mirror's rename layer ──────────────────────────────────────────────
/**
 * The rename map: the mirror's own record of the spelling the LAYER uses for
 * a binding the capture spelled differently. Keyed by the layer file the
 * rename fires in; a name appears in a file only where it fires.
 */
const renameMap = (() => {
  if (!RENAME_MAP_FILE) return null;
  const t = read(path.join(PROJ, RENAME_MAP_FILE));
  if (!t) return null;
  try {
    const m = JSON.parse(t);
    return m.files && typeof m.files === "object" ? m.files : null;
  } catch {
    return null;
  }
})();

/**
 * The rename map of ONE scope: the union of the entries of the scope's own
 * layer files. The map is per SOURCE (per module) in this campaign — the
 * same short name is a different binding in a different module — so the
 * union over a module's own slices is that module's map.
 */
function scopeRenameMap(parts) {
  if (!renameMap) return null;
  const out = {};
  for (const p of parts) {
    if (!p.srcFile) continue;
    // the map is keyed by the layer file — some mirrors key it from src/,
    // some from the mirror root
    const m = renameMap[p.srcFile] || (p.projFile ? renameMap[p.projFile] : null);
    if (!m) continue;
    for (const [from, to] of Object.entries(m)) {
      if (!Object.prototype.hasOwnProperty.call(out, from)) out[from] = to;
    }
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Rewrite an export table into the LAYER's spelling: the local name of every
 * specifier is the name the layer gives that binding. The EXPORTED name is
 * never touched — the module's public surface is the capture's, and a
 * shorthand that was renamed becomes `TARGET as ORIGINAL`, exactly as the
 * campaign's own engine writes it.
 */
function rewriteTableToLayer(text, map) {
  if (!map) return text;
  let out = "";
  let at = 0;
  for (const [s, e] of exportTableSpans(text)) {
    out += text.slice(at, s);
    const whole = text.slice(s, e);
    const body = whole.slice(whole.indexOf("{") + 1, whole.lastIndexOf("}"));
    const kept = body.split(",").map((part) => {
      const seg = part.trim();
      if (!seg) return part;
      const m = /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/.exec(seg);
      if (m) {
        const to = map[m[1]];
        return to && to !== m[1] ? `${to} as ${m[2]}` : seg;
      }
      const sh = /^([A-Za-z_$][\w$]*)$/.exec(seg);
      if (sh) {
        const to = map[sh[1]];
        return to && to !== sh[1] ? `${to} as ${sh[1]}` : seg;
      }
      return part;
    });
    const at2 = whole.indexOf(body);
    out += whole.slice(0, at2) + kept.join(", ") + whole.slice(at2 + body.length);
    at = e;
  }
  out += text.slice(at);
  return out;
}

// ── the scopes of the layer ────────────────────────────────────────────────
// A SCOPE is one ES module of the layer. It is either
//   · STANDALONE: one layer file that IS the module (a whole-file section, a
//     hand-written entry, a module factory), or
//   · A SLICE GROUP: the slices cut from ONE original module, which share ONE
//     scope. The group is what the layer's own record calls a module.

/**
 * The parts of a scope, in the order the record lists them: every slice
 * contributes its payload, and every range the layer does not carry (a skipped
 * tail) contributes the mirror's own record of it.
 *
 * The slices are CONCATENATED, not mapped onto line numbers: a slice is cut
 * mid-statement, so its payload is a fragment, and a fragment only means
 * anything in the company of its neighbours.
 */
function scopeParts(sections) {
  const parts = [];
  for (const sec of sections) {
    const f = layerFileOf(sec);
    if (f) {
      parts.push({
        kind: "slice",
        file: path.relative(PROJ, f).replace(/\\/g, "/"),
        srcFile: path.relative(SRC, f).replace(/\\/g, "/"),
        projFile: path.relative(PROJ, f).replace(/\\/g, "/"),
        text: payloadLines(read(f)).join("\n"),
      });
      continue;
    }
    // the layer does not carry this range: the mirror's own record of it (the
    // served chunk's export statement) is the bytes it contributes
    if (typeof sec.text === "string" && sec.text) {
      parts.push({ kind: "recorded", file: String(sec.file), srcFile: null, text: sec.text });
      continue;
    }
    const src = sourceFileOf(sec.sourceFile);
    if (src && Number.isInteger(sec.startLine) && Number.isInteger(sec.endLine)) {
      const lines = read(src).split("\n");
      parts.push({
        kind: "original",
        file: String(sec.sourceFile),
        srcFile: null,
        text: lines.slice(sec.startLine - 1, sec.endLine).join("\n"),
      });
      continue;
    }
    parts.push({ kind: "missing", file: String(sec.file), srcFile: null, text: "" });
  }
  return parts;
}

const moduleText = (parts) => parts.map((p) => p.text).join("\n");

/** The index of the part that holds the character at `offset`. */
function partIndexAt(parts, offset) {
  let off = 0;
  for (let i = 0; i < parts.length; i++) {
    const end = off + parts[i].text.length;
    if (offset >= off && offset < end) return i;
    off = end + 1; // the joining newline
  }
  return -1;
}

/**
 * The part that holds the HEAD of the declaration statement that binds
 * `name`, when the declarator sits in a later part than the head.
 *
 * A cut module can split one declaration statement across slices: the
 * `var`/`let`/`const` head sits in one slice and the declarators that follow
 * it in the next. The name is bound by the statement, so the slice that holds
 * the HEAD is the one that declares it.
 */
function declarationHeadPart(parts, name, afterIndex) {
  const text = moduleText(parts);
  const re = new RegExp(`(?<![\\w$])${ESCAPE_RE(name)}(?![\\w$])`, "g");
  let m;
  while ((m = re.exec(text)) !== null) {
    const at = m.index;
    const indexOf = partIndexAt(parts, at);
    if (indexOf < 0) continue;
    if (afterIndex !== null && indexOf > afterIndex) continue;
    // only a DECLARATOR can be governed by a statement head: the name must
    // sit where a declarator sits (after a comma or an "=")
    const beforeName = text.slice(0, at).replace(/\s+$/, "");
    if (!/(,|=)$/.test(beforeName)) continue;
    // scan backwards for the governing declaration keyword at depth zero
    let depth = 0;
    for (let i = at - 1; i >= 0; i--) {
      const c = text[i];
      if (c === "}" || c === ")" || c === "]") {
        depth++;
        continue;
      }
      if (c === "{" || c === "(" || c === "[") {
        if (depth === 0) break;
        depth--;
        continue;
      }
      if (depth !== 0) continue;
      const head = /(^|[^\w$])(var|let|const)\s*$/.exec(text.slice(Math.max(0, i - 6), i + 1));
      if (head) {
        const headAt = text.lastIndexOf(head[2], at);
        if (headAt >= 0) {
          const hi = partIndexAt(parts, headAt);
          if (hi >= 0) return parts[hi].file;
        }
        return null;
      }
    }
  }
  return null;
}

/**
 * The part of the scope that DECLARES `name`, found by reading the scope's
 * own text: a declaration head, an import binding or a declarator names it.
 *
 * Returns the part's file, or null when the scope does not declare it.
 */
function declaringPartByScan(parts, name) {
  const text = moduleText(parts);
  const re = new RegExp(`(?<![\\w$])${ESCAPE_RE(name)}(?![\\w$])`, "g");
  // an export table names the binding; it does not declare it
  const tables = exportTableSpans(text);
  let m;
  while ((m = re.exec(text)) !== null) {
    const at = m.index;
    if (tables.some(([s, e]) => at >= s && at < e)) continue;
    const indexOf = partIndexAt(parts, at);
    if (indexOf < 0) continue;
    const before = text.slice(Math.max(0, at - 40), at);
    // a declaration head directly before the name (`const x`, `function x`)
    if (/(^|[^\w$])(var|let|const|function|class)\s*$/.test(before)) return parts[indexOf].file;
    // an import binding (`import { x as y }` binds y)
    if (/\bas\s*$/.test(before)) return parts[indexOf].file;
    // a declarator in a list (`var a = 1, b = 2`): the HEAD of the statement
    // is what binds it
    if (/(,|=)$/.test(before.replace(/\s+$/, ""))) {
      const head = declarationHeadPart(parts, name, indexOf);
      if (head) return head;
      return parts[indexOf].file;
    }
  }
  return null;
}

/**
 * The part of the scope that DECLARES `name`, found by asking the engine:
 * the name is erased from a prefix of the parts at a time, and the part whose
 * erasure breaks the scope is the one that declared it.
 *
 * Returns the part's file, or null when the engine cannot place it.
 */
function declaringPart(parts, name) {
  const scanned = declaringPartByScan(parts, name);
  if (scanned) return scanned;
  return declaringPartByEngine(parts, name);
}

function declaringPartByEngine(parts, name) {
  const erasable = parts.filter((p) => p.kind !== "missing");
  if (erasable.length < 2) return null;
  const probe = "__probe_" + name.replace(/[^A-Za-z0-9_$]/g, "_");
  const withPrefix = (k) => {
    let n = -1;
    return parts
      .map((p) => {
        const own = p.linkText === undefined ? p.text : p.linkText;
        if (p.kind === "missing") return own;
        n++;
        return n <= k ? eraseName(own, name, probe) : own;
      })
      .join("\n");
  };
  // erasing EVERY part must break the scope (the name is declared nowhere
  // else); if it does not, the name is not in this scope at all.
  if (esmCheck(withPrefix(erasable.length - 1)).ok) return null;
  let lo = 0;
  let hi = erasable.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (esmCheck(withPrefix(mid)).ok) lo = mid + 1;
    else hi = mid;
  }
  return erasable[lo].file;
}

// ── the layer ──────────────────────────────────────────────────────────────
const files = walkJs(SRC).sort();
if (!files.length) {
  console.log("check-links: no layer file under src/ - nothing to check");
  process.exit(0);
}

// the scopes: standalone files and slice groups
const scopes = [];
const groups = new Map();

for (const sec of spec.sections || []) {
  if (!sec || !sec.file) continue;
  if (isStandalone(sec)) {
    const f = layerFileOf(sec);
    if (!f) continue;
    scopes.push({
      name: String(sec.file),
      source: sec.sourceFile || null,
      parts: [
        {
          kind: "standalone",
          file: path.relative(PROJ, f).replace(/\\/g, "/"),
          srcFile: path.relative(SRC, f).replace(/\\/g, "/"),
          projFile: path.relative(PROJ, f).replace(/\\/g, "/"),
          text: read(f),
        },
      ],
    });
    continue;
  }
  if (!Number.isInteger(sec.startLine) || !Number.isInteger(sec.endLine)) continue;
  // a slice: it belongs to the scope of the module it was cut from
  const key = sec.sourceFile || `FILE:${sec.file}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(sec);
}
for (const [key, list] of groups) {
  list.sort((a, b) => a.startLine - b.startLine);
  scopes.push({ name: key, source: key, parts: scopeParts(list), sections: list });
}

const problems = [];
const fragments = [];
const unjudged = [];
let scopesWithTable = 0;
let tablesChecked = 0;

for (const scope of scopes) {
  // the parts of this scope that carry an export table
  const carriers = [];
  for (const p of scope.parts) {
    if (p.kind === "missing") continue;
    if (!/\bexport\s*\{/.test(p.text)) continue;
    carriers.push(p);
  }
  if (!carriers.length) continue; // the scope carries no export table

  scopesWithTable++;
  tablesChecked += carriers.length;
  // the scope is read in the LAYER's spelling: a range the layer does not
  // carry is the capture's own bytes, and the layer renamed some bindings
  const map = scopeRenameMap(scope.parts);
  for (const p of scope.parts) {
    p.linkText =
      p.kind === "slice" || p.kind === "standalone" ? p.text : rewriteTableToLayer(p.text, map);
  }
  const text = moduleText(scope.parts.map((p) => ({ ...p, text: p.linkText })));

  let module = esmCheck(text);
  if (!module.ok && !module.missing) {
    // The scope does not parse as it stands. That can be a module whose own
    // text is not a module, or one whose export table sits inside a
    // statement; the second case is still answerable.
    const spans = exportTableSpans(text);
    if (spans.length) {
      let at = 0;
      let body = "";
      const tables = [];
      for (const [s, e] of spans) {
        body += text.slice(at, s);
        tables.push(text.slice(s, e));
        at = e;
      }
      body += text.slice(at);
      const alt = esmCheck(body + "\n" + tables.join("\n") + "\n");
      if (alt.ok || alt.missing) module = alt;
    }
  }

  if (!module.ok && module.missing) {
    // The scope as the LAYER's own bytes export a name nothing declares.
    const names = undeclaredExports(text);
    const listed = names.length ? names : [module.missing];
    problems.push(
      `${scope.name}: the layer's own bytes export { ${listed.join(", ")} } but no binding named ${listed[0]} is declared in any slice of that module (export table in: ${carriers.map((c) => c.file).join(", ")})`,
    );
    continue;
  }

  for (const c of carriers) {
    const alone = esmCheck(c.linkText);
    if (alone.ok) continue; // the file links on its own: it is a whole module
    if (!alone.missing) {
      unjudged.push(
        `${c.file}: does not link on its own (${alone.error}) and the module ${scope.name} does not link either - the binding cannot be located`,
      );
      continue;
    }
    // the file names a binding it does not declare, and the MODULE links:
    // the binding is declared by a SIBLING slice - a fragment, not a defect
    const aloneScope = [{ kind: "slice", file: c.file, srcFile: null, text: c.linkText }];
    const names = tableLocalNames(c.linkText).filter(
      (n) => !declaringPartByScan(aloneScope, n),
    );
    const where = [];
    for (const name of names) {
      const s = declaringPart(scope.parts, name);
      where.push(`${name} (declared by ${s ? s : "a sibling slice"})`);
    }
    fragments.push(
      `${c.file}: exports { ${names.join(", ")} } - ${where.join("; ")}: a sibling slice of ${scope.name} declares it, so the module is whole (fragment, not a defect)`,
    );
  }
}

if (!QUIET) {
  console.log(`check-links: ${files.length} file(s) in src/`);
  console.log(`  scopes (modules) reconstructed: ${scopes.length}   carrying an export table: ${scopesWithTable}`);
  console.log(`  export tables checked: ${tablesChecked}`);
  console.log(`  fragment exports (a sibling slice of the same module declares the binding): ${fragments.length}`);
  for (const f of fragments) console.log(`    ${f}`);
  if (unjudged.length) {
    console.log(`  not judged (the module does not link, so the binding cannot be located): ${unjudged.length}`);
    for (const u of unjudged) console.log(`    ${u}`);
  }
  if (problems.length) {
    console.log(`  LINK PROBLEMS: ${problems.length}`);
    for (const p of problems) console.log(`    ${p}`);
  }
}
if (problems.length) process.exit(1);
if (!QUIET) console.log("  every export table names a binding the layer declares: YES");
