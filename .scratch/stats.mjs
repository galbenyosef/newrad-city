import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const proj = path.resolve(here, "..");
const buf = fs.readFileSync(path.join(proj, "play.html"));

// sequential block tokenizer (mirrors tools/capture.mjs scan intent)
function scanBlocks(b) {
  const out = [];
  let p = 0;
  let nScript = 0;
  let nStyle = 0;
  while (p < b.length) {
    let best = -1;
    let kind = null;
    for (const [needle, k] of [
      ["<script", "script"],
      ["<style", "style"],
      ["<!--", "comment"],
    ]) {
      const i = b.indexOf(needle, p);
      if (i >= 0 && (best < 0 || i < best)) {
        best = i;
        kind = k;
      }
    }
    if (best < 0) break;
    if (kind === "comment") {
      const e = b.indexOf("-->", best + 4);
      p = e < 0 ? b.length : e + 3;
      continue;
    }
    const after = b[best + kind.length + 1];
    const boundary =
      after === 0x3e || after === 0x2f || after === 0x20 || after === 0x09 || after === 0x0a || after === 0x0d;
    if (!boundary) {
      p = best + kind.length + 1;
      continue;
    }
    const te = b.indexOf(">", best);
    if (te < 0) break;
    const tag = b.subarray(best, te + 1).toString("utf8");
    const close = kind === "script" ? "</script" : "</style";
    const j = b.indexOf(close, te + 1);
    if (j < 0) throw new Error("unterminated " + kind);
    const external = /\bsrc\s*=\s*["']/i.test(tag);
    const rec = JSON.stringify(out.length);
    void rec;
    if (external) {
      out.push({ kind, external: true, tag, openStart: best });
    } else {
      if (kind === "script") nScript++;
      else nStyle++;
      out.push({
        kind,
        external: false,
        block: kind === "script" ? nScript : nStyle,
        tag,
        openStart: best,
        contentStart: te + 1,
        contentEnd: j,
        bytes: j - (te + 1),
        text: b.subarray(te + 1, j).toString("utf8"),
      });
    }
    p = j + close.length;
  }
  return out;
}

const blocks = scanBlocks(buf);
const inlineScripts = blocks.filter((b) => b.kind === "script" && !b.external);
const inlineStyles = blocks.filter((b) => b.kind === "style" && !b.external);
console.log("inline scripts", inlineScripts.length, "styles", inlineStyles.length);

// banner census
const dirs = new Map();
let noBanner = 0;
let iife = 0;
let notIife = [];
for (const b of inlineScripts) {
  const m = /^\/\* src\/([^*]+?)\.js \*\//.exec(b.text.trimStart().slice(0, 200));
  if (!m) {
    noBanner++;
    if (b.bytes > 300) notIife.push(["NOBANNER", b.block, b.bytes, b.text.slice(0, 80).replace(/\n/g, "\\n")]);
  } else {
    const dir = m[1].split("/")[0];
    dirs.set(dir, (dirs.get(dir) || 0) + 1);
  }
  const t = b.text.trim();
  // is it exactly one IIFE?
  if (/^\(function\s*\(\)\s*\{[\s\S]*\}\)\(\);\s*$/.test(t)) iife++;
  else if (b.bytes > 300) notIife.push(["NOT-ONE-IIFE", b.block, b.bytes, t.slice(0, 100).replace(/\n/g, "\\n")]);
}
console.log("dirs:", [...dirs.entries()].sort((a, b) => b[1] - a[1]));
console.log("noBanner:", noBanner, "iife-wrapped:", iife, "anomalies(>300B):", notIife.length);
for (const a of notIife.slice(0, 25)) console.log("  ", a.join(" | "));

// size distribution
const sizes = inlineScripts.map((b) => b.bytes).sort((a, b) => b - a);
const total = sizes.reduce((a, b) => a + b, 0);
console.log("total inline script bytes", total, "max", sizes[0], "median", sizes[Math.floor(sizes.length / 2)]);
// count top-level guard returns (approx): lines matching "return;" at 2-space indent
let guardReturns = 0;
for (const b of inlineScripts) {
  for (const m of b.text.matchAll(/^  (?:if\s*\([^\n]*\)\s*)?return;?\s*$/gm)) guardReturns++;
}
console.log("approx top-level guard-return lines (2-space indent):", guardReturns);

export { scanBlocks };
