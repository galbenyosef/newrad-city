// net-crosscheck.mjs — dynamic closure cross-check for newrad-city.
//
// The static closure (tools/capture.mjs --check) proves the captured text files
// reference nothing un-captured. This tool adds the dynamic half: it compares an
// opencli browser network log, recorded while the mirror was loaded and played
// on loopback, against .upstream/manifest.json:
//   - every same-origin request must be a captured file (a MISSING line is a
//     closure gap the static scan did not see);
//   - captured files that were never requested are listed (informational);
//   - off-origin requests are summarised (three.js from jsdelivr and the Google
//     Fonts stylesheet/font origins stay external by design);
//   - failed requests (status >= 400) are listed — favicon.ico is the recorded
//     404 gap (browser-implicit; no icon is deployed), so a failure line naming
//     it is expected, not a defect.
//
// Route mapping: the game is served at the route /play (Netlify pretty-URL of
// the deploy's play.html). Both /play and /play.html on loopback map to the
// captured file play.html. A `POST /` (bug-report form submit) is a backend
// interaction a static mirror cannot serve — the static server answers 404/405;
// it is listed as a non-GET request, not a closure gap.
//
// The log is the JSON-lines stream of
//   opencli browser <session> network --all --follow
// (one JSON object per request; the --since query form does not retain the
// buffer, which is why the log is recorded with --follow while the game runs).
//
// usage: opencli browser <session> network --all --follow > docs/boot-network-<date>.json
//        node tools/net-crosscheck.mjs docs/boot-network-<date>.json
import fs from "node:fs";

const log = JSON.parse(
  "[" +
    fs
      .readFileSync(process.argv[2], "utf8")
      .split("\n")
      .filter((l) => l.trim().startsWith("{"))
      .join(",") +
    "]",
);
const manifest = JSON.parse(fs.readFileSync(new URL("../.upstream/manifest.json", import.meta.url), "utf8"));
const have = new Set(Object.keys(manifest.files));
// recorded 404 gaps (from the capture crawl): a request for one of these is
// explained, not a new closure gap
const recorded = new Set();
try {
  const rep = JSON.parse(fs.readFileSync(new URL("../_mirror-report.json", import.meta.url), "utf8"));
  for (const u of rep.unresolved ?? []) recorded.add(u.path);
} catch {
  /* no report: nothing recorded */
}

// served path -> captured disk rel (the /play route is the pretty-URL form of play.html)
const diskOf = (p) => {
  if (p === "play" || p === "play.html" || p === "") return "play.html";
  return p;
};

const sameOrigin = new Map(); // path -> statuses
const offOrigin = new Map();
const nonGet = [];
let dataUris = 0;
let blobUris = 0;
for (const e of log) {
  if (!e.url) continue;
  if (e.url.startsWith("data:")) {
    dataUris++;
    continue;
  }
  if (e.url.startsWith("blob:")) {
    // in-page object URLs (worker sources built from Blob in the game code) —
    // never network requests
    blobUris++;
    continue;
  }
  let u;
  try {
    u = new URL(e.url);
  } catch {
    continue;
  }
  if (u.hostname === "127.0.0.1" || u.hostname === "localhost") {
    const p = diskOf(u.pathname.replace(/^\//, ""));
    if (!sameOrigin.has(p)) sameOrigin.set(p, []);
    sameOrigin.get(p).push(e.status);
    if (e.method && e.method !== "GET") nonGet.push(`${e.method} ${u.pathname} -> ${e.status}`);
  } else {
    if (!offOrigin.has(u.origin)) offOrigin.set(u.origin, 0);
    offOrigin.set(u.origin, offOrigin.get(u.origin) + 1);
  }
}
console.log(
  `entries: ${log.length} (off-origin: ${[...offOrigin.entries()].map(([o, n]) => `${o} x${n}`).join(", ") || "none"}; embedded data: URIs: ${dataUris}; in-page blob: URLs: ${blobUris})`,
);
console.log("--- same-origin requests not in manifest:");
let novel = 0;
for (const [p, st] of [...sameOrigin.entries()].sort()) {
  const ok = have.has(p);
  if (!ok) {
    const rec = recorded.has(p);
    if (!rec) novel++;
    console.log(
      `  MISSING ${p} statuses=${[...new Set(st)].join(",")}` +
        (rec ? "  (recorded 404 gap — never served upstream)" : "  (NEW — not a recorded gap)"),
    );
  }
}
console.log(novel ? `${novel} NEW missing` : "0 new missing — every same-origin request is captured or a recorded gap");
console.log("--- captured-but-never-requested:");
const req = new Set(sameOrigin.keys());
for (const rel of [...have].sort()) if (!req.has(rel)) console.log(`  ${rel}`);
console.log(`--- same-origin request count: ${sameOrigin.size}; failed (>=400 or 0):`);
for (const [p, st] of [...sameOrigin.entries()].sort())
  if (st.some((s) => s >= 400 || s === 0)) console.log(`  ${p} statuses=${[...new Set(st)].join(",")}`);
if (nonGet.length) console.log("--- non-GET requests (backend interactions, not closure):\n  " + nonGet.join("\n  "));
