// capture.mjs — byte-exact capture + runtime-closure fetch for newrad-city.
//
// NEW RAD CITY (https://newrad.city/play) is a single-document game served by
// Netlify: the site holds `play.html` and Netlify's pretty-URL routing serves it
// at the route /play (200, same bytes as /play.html; /play/ 301-redirects back
// to /play). The document is ~21.6 MiB of code in 630 inline <script> blocks —
// the project's own single-file build where every `src/<dir>/<file>.js` module
// was inlined verbatim (each block opens with its `/* src/... */` header) —
// plus 12 inline <style> blocks and a tiny UI markup shell. three.js stays a
// CDN <script> (cdn.jsdelivr.net/npm/three@0.158.0), Google Fonts stay a CDN
// <link> (socker precedent, PLAN §1) — neither is backfilled into the capture.
//
// What the runtime requests from the origin, and what this tool does:
//
//   1. entry route /play  -> captured to disk as play.html (the deploy's own
//      file name; served path and disk path are both recorded). The /play.html
//      alias is verified byte-identical; /play/ is a 301 to /play.
//   2. /.netlify/scripts/rum -> the Netlify RUM beacon the edge injects into
//      the served HTML (`<script async id="netlify-rum-container" src=...>`) —
//      a same-origin runtime request, captured at .netlify/scripts/rum.
//   3. the game's own asset references are scanned to a fixpoint out of every
//      captured text file (HTML attrs, inline module bodies, JS literals,
//      CSS url()/@import) — see refsOf().
//   4. probed-but-404 (favicon.ico, browser-implicit) is recorded as a gap.
//
// Scanner precision rules (both proven against this capture; the opencli
// network log over a played session is the dynamic cross-check):
//   - block comments are stripped before scanning: every inline module opens
//     with a `/* src/dir/file.js */` banner, and those banners are provenance,
//     not network references. Stripping /* … */ removes them (and vendor-style
//     JSDoc path examples) from the probe list.
//   - only URLs that a browser could actually request are kept: data:/blob:/
//     javascript:/# and unresolved template literals are dropped, and paths
//     with spaces/quotes/operators fail the SANE filter.
//
// Output (all byte-exact, nothing edited):
//   <mirror root>/play.html          the entry document as served at /play
//   <mirror root>/.netlify/scripts/rum
//   _mirror-report.json              crawl record (dead-world shape)
//   .upstream/manifest.json          Gen-A { generated, origin, files: { rel: {bytes, sha256} } }
//
// usage: node tools/capture.mjs [--check] [--dry-run]
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const proj = path.resolve(here, "..");
const ORIGIN = "https://newrad.city";
const ENTRY_ROUTE = "play"; // the served route (no .html suffix — update.mjs compares it normalized)
const ENTRY_DISK = "play.html"; // what the deploy holds, and where the mirror stores it
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0" };

// browser-implicit root request the literal scanner cannot see (no upstream icon)
const KNOWN = ["favicon.ico"];

// strings that look like asset paths but are never network-requested
const EXCLUDE = new Set([
  // bug-reporter File() name generated client-side (canvas.toBlob → File),
  // posted as multipart to the Netlify form endpoint — never fetched as a path
  "screenshot.jpg",
]);

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const EXT =
  "js|mjs|css|png|jpe?g|webp|gif|svg|avif|ico|ktx2|basis|mp3|ogg|wav|m4a|mp4|webm|json|wasm|data|bin|glb|gltf|woff2?|ttf|otf|hdr|exr|txt|csv|glsl|vert|frag|map|xml|webmanifest";
const RE_EXT_END = new RegExp(`\\.(?:${EXT})$`, "i");

// quoted-string scanner used for both HTML attributes/URLs and JS literals
const RE_QUOTED = new RegExp(`["'\`]([^"'\`\\n\\r]{1,300}?\\.(?:${EXT}))(?:\\?[^"'\`\\n\\r]*)?["'\`]`, "gi");
const RE_SPECIFIER = /\b(?:import|from)\s*\(?\s*["'`]([^"'`\n\r]+)["'`]/g;
const RE_NEW_URL = /\bnew\s+URL\s*\(\s*["'`]([^"'`\n\r]+)["'`]/g;
const RE_CSS_URL = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
const RE_CSS_IMPORT = /@import\s+(?:url\(\s*)?["']([^"']+)["']/g;
const RE_SRC_HREF = /\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi;
const RE_SRCSET = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
// a captured URL must look like a sane relative path: no spaces, quotes,
// interpolation, operators or query syntax (kills minifier-expression artifacts)
const SANE = (s) => s.length > 0 && s.length <= 250 && !/[\s"'`&?!=<>|;(){}$,:\\]/.test(s);

// module banners (`/* src/…/x.js */`) and vendor JSDoc quote paths that were
// never deployed; stripping /* … */ blocks before scanning keeps only code refs
const stripBlockComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ");

const normalize = (p) => {
  const out = [];
  for (const part of p.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out.join("/");
};

function classifyUrl(raw, baseDir) {
  let s = raw.trim();
  if (!s || s.includes("${")) return null;
  if (/^(data:|blob:|javascript:|mailto:|tel:|#)/i.test(s)) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) {
    if (s.startsWith(ORIGIN + "/")) s = s.slice(ORIGIN.length);
    else if (s === ORIGIN) s = "/";
    else return { external: s };
  }
  if (s.startsWith("//")) return { external: s };
  if (!SANE(s)) return null;
  if (s.startsWith("/")) {
    const n = normalize(s.replace(/^\//, ""));
    return { path: n || ENTRY_DISK }; // "/" is the site root document
  }
  // relative: try module-dir base first, then the origin root (document base)
  const mod = baseDir && baseDir !== "." ? normalize(path.posix.join(baseDir, s)) : normalize(s);
  const root = normalize(s);
  const paths = [...new Set([mod, root])].map((p) => p || ENTRY_DISK);
  return { paths };
}

// extract candidate references from a captured text file; each entry is a
// candidate-base GROUP for one reference (probe() closes it if any base works)
function refsOf(relPath, rawText, external) {
  const text = stripBlockComments(rawText);
  const groups = [];
  const add = (r) => {
    if (!r) return;
    if (r.external) {
      external.add(r.external);
      return;
    }
    const paths = (r.paths ?? [r.path]).filter((p) => p && !EXCLUDE.has(p));
    if (paths.length) groups.push(paths);
  };
  const baseDir = path.posix.dirname(relPath);
  const isHtml = /\.html?$/i.test(relPath);
  const isCss = /\.css$/i.test(relPath);
  const isJs = /\.(js|mjs)$/i.test(relPath);
  const isJson = /\.json$/i.test(relPath) || /\.webmanifest$/i.test(relPath);

  if (isHtml) {
    for (const m of text.matchAll(RE_SRC_HREF)) add(classifyUrl(m[1], ""));
    for (const m of text.matchAll(RE_SRCSET))
      for (const part of m[1].split(",")) add(classifyUrl(part.trim().split(/\s+/)[0], ""));
    for (const m of text.matchAll(RE_QUOTED)) {
      const v = m[1];
      if (RE_EXT_END.test(v)) add(classifyUrl(v, ""));
    }
    // HTML comments can carry loader hints
    for (const m of rawText.matchAll(/<!--([\s\S]*?)-->/g))
      for (const t of m[1].matchAll(new RegExp(`([A-Za-z0-9_./-]{1,200}\\.(?:${EXT}))`, "gi")))
        add(classifyUrl(t[1], ""));
  }
  if (isJson) {
    for (const m of text.matchAll(RE_QUOTED)) add(classifyUrl(m[1], baseDir));
  }
  if (isCss) {
    for (const m of text.matchAll(RE_CSS_URL)) add(classifyUrl(m[1], baseDir));
    for (const m of text.matchAll(RE_CSS_IMPORT)) add(classifyUrl(m[1], baseDir));
  }
  if (isJs) {
    for (const m of text.matchAll(RE_QUOTED)) add(classifyUrl(m[1], baseDir));
    for (const m of text.matchAll(RE_SPECIFIER)) {
      const v = m[1];
      if (/^(\.{0,2}\/)/.test(v) || /\.(js|mjs|css|json|wasm)(\?|$)/i.test(v)) add(classifyUrl(v, baseDir));
    }
    for (const m of text.matchAll(RE_NEW_URL)) {
      const v = m[1];
      if (!v.includes("${")) add(classifyUrl(v, baseDir));
    }
  }
  const seen = new Set();
  return groups.filter((g) => {
    const k = g.join("|");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const external = new Set();
const state = {
  start: ORIGIN + "/" + ENTRY_ROUTE,
  origin: ORIGIN,
  gated: false,
  sessionRenewal: "none",
  requests: 0,
  fetched: new Map(), // rel -> { bytes, sha256, buf }
  unresolved: [],
  unreachable: [],
  routeAliases: [],
};

const unresolvedSeen = new Set();
const unreachableSeen = new Set();
const probedFailed = new Map(); // candidate rel -> last non-200 status this run
const badStatus = (status, rel) => {
  if (status === 404 && !unresolvedSeen.has(rel)) {
    unresolvedSeen.add(rel);
    state.unresolved.push({ status, path: rel, probes: 1 });
  } else if (status !== 404 && !unreachableSeen.has(rel)) {
    unreachableSeen.add(rel);
    state.unreachable.push({ status, path: rel, probes: 1 });
  }
};

async function fetchUrl(url) {
  state.requests++;
  let r;
  try {
    r = await fetch(url, { headers: UA, redirect: "manual" });
  } catch (e) {
    return { status: `net:${e.message}`, buf: null, headers: null };
  }
  const headers = Object.fromEntries(r.headers.entries());
  if (r.status >= 300 && r.status < 400) return { status: r.status, buf: null, headers };
  if (r.status !== 200) return { status: r.status, buf: null, headers };
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: 200, buf, headers };
}

// one raw fetch of a disk rel (served at ORIGIN/<rel>)
async function tryFetch(rel) {
  return fetchUrl(ORIGIN + "/" + rel.split("/").map(encodeURIComponent).join("/"));
}

// probe one reference: try every candidate base path; a reference is a gap only
// when EVERY base 404s (then each probed form is recorded, dead-world style);
// once any base is captured the reference is closed
async function probe(paths) {
  if (paths.some((p) => state.fetched.has(p))) return true;
  const fresh = paths.filter((p) => !probedFailed.has(p));
  if (!fresh.length) return false;
  const failed = [];
  for (const rel of fresh) {
    const res = await tryFetch(rel);
    if (res.buf) {
      state.fetched.set(rel, { bytes: res.buf.length, sha256: sha256(res.buf), buf: res.buf });
      return true;
    }
    probedFailed.set(rel, res.status);
    failed.push({ status: res.status, rel });
  }
  for (const f of failed) badStatus(f.status, f.rel);
  return false;
}

// the entry route: /play (200) -> disk play.html; the /play.html alias and the
// /play/ 301 are verified and recorded (routeAliases) but only /play is the doc
async function fetchEntry() {
  const res = await fetchUrl(ORIGIN + "/" + ENTRY_ROUTE);
  if (!res.buf) throw new Error(`entry route /${ENTRY_ROUTE} not fetchable (HTTP ${res.status})`);
  state.fetched.set(ENTRY_DISK, { bytes: res.buf.length, sha256: sha256(res.buf), buf: res.buf });
  const alias = await fetchUrl(ORIGIN + "/" + ENTRY_DISK);
  state.routeAliases.push(
    alias.buf
      ? { route: "/" + ENTRY_ROUTE, disk: ENTRY_DISK, status: 200, aliasSame: alias.buf.equals(res.buf) }
      : { route: "/" + ENTRY_ROUTE, disk: ENTRY_DISK, status: 200, aliasStatus: alias.status },
  );
  const slash = await fetchUrl(ORIGIN + "/" + ENTRY_ROUTE + "/");
  state.routeAliases.push({ route: "/" + ENTRY_ROUTE + "/", status: slash.status, location: slash.headers?.location ?? null });
  return res.buf;
}

// --check: residual closure audit. Every reference scanned out of the captured
// text files must resolve to a captured file (any candidate base) or be a gap
// already recorded in _mirror-report.json — run after a capture to prove the
// runtime graph is closed.
function checkClosure() {
  const manifestPath = path.join(proj, ".upstream", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const have = new Set(Object.keys(manifest.files));
  const recorded = new Set();
  try {
    const rep = JSON.parse(fs.readFileSync(path.join(proj, "_mirror-report.json"), "utf8"));
    for (const u of rep.unresolved ?? []) recorded.add(u.path);
  } catch {
    /* no report yet: every unresolved reference counts as new */
  }
  const ext = new Set();
  let groups = 0;
  const missing = [];
  const scanExternal = new Set();
  for (const rel of Object.keys(manifest.files).filter((r) => /\.(html?|js|mjs|css|json|webmanifest)$/i.test(r))) {
    const text = fs.readFileSync(path.join(proj, rel), "utf8");
    for (const g of refsOf(rel, text, scanExternal)) {
      groups++;
      const k = g.join("|");
      if (ext.has(k)) continue;
      ext.add(k);
      if (!g.some((p) => have.has(p))) missing.push({ from: rel, candidates: g });
    }
  }
  const novel = missing.filter((m) => !m.candidates.some((c) => recorded.has(c)));
  for (const m of missing)
    console.log(
      `UNRESOLVED ${m.from} -> ${m.candidates.join(" | ")}` +
        (m.candidates.some((c) => recorded.has(c)) ? "  (recorded gap)" : "  (NEW)"),
    );
  console.log(
    `closure check: ${groups} reference group(s), ${missing.length} unresolved (${novel.length} new vs _mirror-report.json), ` +
      `${scanExternal.size} external off-origin reference(s) (left on CDN)`,
  );
  for (const e of [...scanExternal].sort()) console.log(`  external: ${e}`);
  process.exit(novel.length ? 1 : 0);
}

// --dry-run: print the reference groups the scanner would probe (no fetch)
function dryRun() {
  const entry = fs.readFileSync(path.join(proj, ENTRY_DISK), "utf8");
  const ext = new Set();
  let groups = 0;
  for (const g of refsOf(ENTRY_DISK, entry, external)) {
    groups++;
    const k = g.join("|");
    if (ext.has(k)) continue;
    ext.add(k);
    console.log("CANDIDATE", g.join(" | "));
  }
  console.log(`dry-run: ${groups} group(s), ${ext.size} distinct`);
  for (const e of [...external].sort()) console.log(`  external: ${e}`);
}

async function main() {
  if (process.argv.includes("--check")) return checkClosure();
  if (process.argv.includes("--dry-run")) return dryRun();

  // round 0: entry route + runtime-instantiated template targets
  if (!state.fetched.has(ENTRY_DISK)) await fetchEntry();
  for (const rel of KNOWN) if (!state.fetched.has(rel)) await probe([rel]);

  // iterate closure to fixpoint
  let round = 0;
  let newRefs = 0;
  do {
    newRefs = 0;
    round++;
    for (const [rel, rec] of [...state.fetched.entries()].sort()) {
      if (!/\.(html?|js|mjs|css|json|webmanifest)$/i.test(rel)) continue;
      const text = rec.buf.toString("utf8");
      if (!Buffer.from(text, "utf8").equals(rec.buf)) continue; // non-utf8, not scannable
      for (const group of refsOf(rel, text, external)) {
        if (group.some((p) => state.fetched.has(p))) continue;
        if (group.every((p) => probedFailed.has(p))) continue;
        newRefs++;
        await probe(group);
      }
    }
    console.log(`round ${round}: ${newRefs} new reference(s) probed, ${state.fetched.size} file(s) in closure`);
  } while (newRefs > 0);

  // write every captured file byte-exact at the capture root
  let bytes = 0;
  for (const [rel, rec] of [...state.fetched.entries()].sort()) {
    const abs = path.join(proj, rel);
    if (!path.resolve(abs).startsWith(path.resolve(proj) + path.sep) && path.resolve(abs) !== path.resolve(proj))
      throw new Error(`path escapes capture root: ${rel}`);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, rec.buf);
    bytes += rec.bytes;
  }
  state.bytes = bytes;

  // crawl record
  const report = {
    start: state.start,
    origin: state.origin,
    gated: state.gated,
    sessionRenewal: state.sessionRenewal,
    requests: state.requests,
    fetched: state.fetched.size,
    bytes: state.bytes,
    paths: [...state.fetched.keys()].sort(),
    routeAliases: state.routeAliases,
    unresolved: state.unresolved.sort((a, b) => a.path.localeCompare(b.path)),
    unreachable: state.unreachable.sort((a, b) => a.path.localeCompare(b.path)),
    external: [...external].sort(),
  };
  fs.writeFileSync(path.join(proj, "_mirror-report.json"), JSON.stringify(report, null, 2) + "\n");

  // Gen-A manifest over EVERY captured file
  const files = {};
  for (const [rel, rec] of [...state.fetched.entries()].sort()) files[rel] = { bytes: rec.bytes, sha256: rec.sha256 };
  fs.mkdirSync(path.join(proj, ".upstream"), { recursive: true });
  fs.writeFileSync(
    path.join(proj, ".upstream", "manifest.json"),
    JSON.stringify({ generated: new Date().toISOString(), origin: ORIGIN, files }, null, 2) + "\n",
  );

  console.log(
    `capture: ${state.fetched.size} file(s), ${bytes} bytes, ${state.requests} request(s), ` +
      `${state.unresolved.length} unresolved 404, ${state.unreachable.length} unreachable, ${external.size} external`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
