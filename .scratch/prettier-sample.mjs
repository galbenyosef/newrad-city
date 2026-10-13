import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const proj = path.resolve(here, "..");
const prettier = (await import(pathToFileURL("D:/repos/mirrors/metropolygonia/node_modules/prettier/index.mjs").href))
  .default;
console.log("prettier", prettier.version);
const buf = fs.readFileSync(path.join(proj, "play.html"));

// reuse the scanner from stats.mjs inline
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

// prettier shape sample at 12 evenly spaced blocks
const idxs = [0];
for (let k = 1; k < 12; k++) idxs.push(Math.floor((k * (scripts.length - 1)) / 11));
let differ = 0;
let same = 0;
for (const i of idxs) {
  const b = scripts[i];
  const t0 = Date.now();
  const pretty = await prettier.format(b.text, { parser: "babel" });
  const ms = Date.now() - t0;
  const dbg = await prettier.__debug.parse(pretty, { parser: "babel" });
  const prog = (dbg.ast.program || dbg.ast).body;
  const shape = prog.map((n) => n.type).join(",");
  const single = prog.length === 1;
  const first = prog[0];
  let isIife = false;
  if (single && first.type === "ExpressionStatement") {
    const e = first.expression;
    const fn = e.type === "CallExpression" ? e.callee : e;
    isIife = (fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression") && fn.body?.type === "BlockStatement";
  }
  const identical = pretty === b.text;
  if (identical) same++;
  else differ++;
  console.log(
    `#${b.block} ${b.bytes}B pretty=${pretty.length}B ${ms}ms identical=${identical} stmts=${prog.length} iife=${isIife} shape=${shape.slice(0, 120)}`,
  );
  if (i === idxs[1]) {
    fs.writeFileSync(path.join(proj, ".scratch", "sample-pretty.js"), pretty);
    const chk = spawnSync(process.execPath, ["--input-type=module", "--check", "-"], {
      input: pretty,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    console.log("  pretty parse standalone:", chk.status === 0, (chk.stderr || "").trim().slice(0, 200));
  }
}
console.log("differ", differ, "same", same);
// measure full page prettier time extrapolation: time the biggest block
const big = scripts.reduce((a, b) => (b.bytes > a.bytes ? b : a));
console.log("biggest block #" + big.block, big.bytes + "B");
const t0 = Date.now();
await prettier.format(big.text, { parser: "babel" });
console.log("biggest prettier ms", Date.now() - t0);
