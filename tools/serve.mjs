// serve.mjs — static server reproducing newrad.city's served path structure.
//
// The origin is a Netlify deploy: the site holds `play.html` and Netlify's
// pretty-URL routing serves it at the route /play (200, byte-identical to
// /play.html); /play/ 301-redirects to /play. Off-the-shelf static servers do
// not reproduce that mapping (plain `npx serve .` answers 404 for /play), so
// this repo carries its own tiny server — the mirror stays self-contained and
// `/play` behaves exactly as upstream.
//
//   GET|HEAD /play        -> play.html   (text/html; charset=utf-8)
//   GET|HEAD /play.html   -> play.html   (the alias upstream also serves)
//   GET      /play/       -> 301 /play   (as upstream)
//   GET      /.netlify/scripts/rum -> the captured RUM beacon (text/javascript)
//   anything else         -> the file under the repo root, or 404
//
// usage: node tools/serve.mjs [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const port = Number(process.argv[2] || 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
};
// served-path -> on-disk path (the pretty-URL route), plus the alias forms
const ROUTES = new Map([
  ["/play", "play.html"],
  ["/play.html", "play.html"],
  ["/.netlify/scripts/rum", ".netlify/scripts/rum"],
]);
const RESTYPES = new Map([["/.netlify/scripts/rum", "text/javascript; charset=utf-8"]]);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end("bad request");
    return;
  }
  if (pathname === "/play/") {
    res.writeHead(301, { Location: "/play" }).end();
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end("method not allowed");
    return;
  }
  const rel = ROUTES.get(pathname) ?? pathname.replace(/^\//, "");
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    res.writeHead(403).end("forbidden");
    return;
  }
  let file = abs;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("not found");
    return;
  }
  const type = RESTYPES.get(pathname) ?? TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  const stat = fs.statSync(file);
  res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`newrad-city mirror served at http://127.0.0.1:${port}/play (root ${root})`);
});
