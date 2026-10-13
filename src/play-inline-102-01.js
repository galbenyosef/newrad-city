// play-inline-102 01 — the
// Lines 13-64 of readable/play-inline-102.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const LAYER = "subway";
  let S = { x: 4000, y: 0, z: 400 };
  const A = {};
  M.anchors = M.anchors || {};
  const ssign = M.subwaySign; // shared sign emitter (60_subway.js; default layer 'subway')

  // -------------------------------------------------------------------
  // Interior helpers (local coords; the S transform is active)
  // -------------------------------------------------------------------
  const b = (key) => M.buf(key, 0, 0, LAYER);
  function CB(x0, y0, z0, x1, y1, z1, opts) {
    return M.box3(
      S.x + Math.min(x0, x1),
      y0,
      S.z + Math.min(z0, z1),
      S.x + Math.max(x0, x1),
      y1,
      S.z + Math.max(z0, z1),
      Object.assign({ tag: "subway", surface: "concrete" }, opts || {}),
    );
  }
  /** Tiled wall quad between (ax,az)→(bx,bz), y0..y1, facing n. */
  function tileWall(ax, az, bx, bz, y0, y1, nx, nz, dark) {
    const len = Math.hypot(bx - ax, bz - az);
    // (over-bright vertex colours: the station is lit only by a few fixtures, the tiles must still read)
    const c0 = dark ? [0.36, 0.36, 0.34] : [0.82, 0.8, 0.74],
      c1 = dark ? [0.6, 0.58, 0.55] : [1.25, 1.22, 1.12];
    // '@emis': the glazed tiles faintly return the light of the few live fixtures (the atmosphere's subway mood is very dark)
    M.quad(
      b(dark ? "my/subwaytile@emis" : "my/subwaytile@emis2"),
      [ax, y0, az],
      [bx, y0, bz],
      [bx, y1, bz],
      [ax, y1, az],
      [nx, 0, nz],
      [0, y0 / 2, len / 2, y0 / 2, len / 2, y1 / 2, 0, y1 / 2],
      c0,
      c1,
    );
  }
  function concreteBox(x0, y0, z0, x1, y1, z1, c, key) {
    M.box(b(key || "concrete@emis"), x0, y0, z0, x1, y1, z1, {
      s: 3,
      c: c || [0.6, 0.6, 0.57],
    });
  }

  /** A 1950s subway car (R-type look) in local coords; enterable if o.open. */
