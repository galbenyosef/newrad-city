import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const proj = path.resolve(here, "..");
const prettier = (await import(pathToFileURL("D:/repos/mirrors/metropolygonia/node_modules/prettier/index.mjs").href))
  .default;
const buf = fs.readFileSync(path.join(proj, "play.html"));

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
    if (!(after === 0x3e || after === 0x2f || after === 0x20 || after === 0x09 || after === 0x0a || after === 0x0d)) {
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
    if (external) out.push({ kind, external: true, tag });
    else {
      if (kind === "script") nScript++;
      else nStyle++;
      out.push({
        kind,
        external: false,
        block: kind === "script" ? nScript : nStyle,
        tag,
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
const scripts = blocks.filter((x) => x.kind === "script" && !x.external);
const fixed = async (text, parser, max = 6) => {
  let cur = text;
  for (let k = 1; k <= max; k++) {
    const next = await prettier.format(cur, { parser });
    if (next === cur) return { passes: k, text: cur, stable: true };
    cur = next;
  }
  return { passes: max, text: cur, stable: false };
};

// check idempotency of the first two blocks: format then format again
const stats = [];
const start = Number(process.argv[2] || 1);
const end = Number(process.argv[3] || 40);
for (let i = start; i <= end && i <= scripts.length; i++) {
  const b = scripts[i - 1];
  const onePass = await prettier.format(b.text, { parser: "babel" });
  const twoPass = await prettier.format(onePass, { parser: "babel" });
  if (onePass !== twoPass) {
    const r = await fixed(b.text, "babel");
    stats.push({ block: b.block, bytes: b.bytes, firstDiffPasses: r.passes, stable: r.stable });
  }
}
console.log("checked blocks", start, "-", end, "non-idempotent single-pass:", stats.length);
for (const s of stats) console.log(JSON.stringify(s));

// For the first offender, find a minimal understanding: print diff region
if (stats.length) {
  const b = scripts[stats[0].block - 1];
  const p1 = await prettier.format(b.text, { parser: "babel" });
  const p2 = await prettier.format(p1, { parser: "babel" });
  const l1 = p1.split("\n");
  const l2 = p2.split("\n");
  for (let k = 0; k < Math.max(l1.length, l2.length); k++) {
    if (l1[k] !== l2[k]) {
      console.log(`first diff at line ${k + 1}:`);
      console.log("  pass1: " + JSON.stringify((l1[k] || "").slice(0, 200)));
      console.log("  pass2: " + JSON.stringify((l2[k] || "").slice(0, 200)));
      console.log("  ctx1:  " + JSON.stringify((l1[k - 1] || "").slice(0, 160)));
      console.log("  ctx2:  " + JSON.stringify((l2[k - 1] || "").slice(0, 160)));
      break;
    }
  }
  fs.writeFileSync(path.join(proj, ".scratch", "offender-input.js"), b.text);
  fs.writeFileSync(path.join(proj, ".scratch", "offender-p1.js"), p1);
  fs.writeFileSync(path.join(proj, ".scratch", "offender-p2.js"), p2);
}
