// play-inline-84 01 — math
// Lines 23-150 of readable/play-inline-84.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  // footprints (world rects) — flattened to y = 0 and kept free of park scatter
  const PIECES = {
    rotorcraft: { x: -70, z: -675, x0: -83, x1: -57, z0: -688, z1: -661 },
    needle: { x: 74, z: -731, x0: 67, x1: 81, z0: -738, z1: -724 },
    bandshell: { x: 33, z: -520, x0: 22, x1: 43, z0: -532, z1: -508 },
    carousel: { x: -36, z: -444, x0: -47, x1: -25, z0: -455, z1: -433 },
    playground: { x: -93, z: -437, x0: -104, x1: -82, z0: -445, z1: -429 },
  };
  M.PARK_PIECES = PIECES;
  for (const k in PIECES) {
    const p = PIECES[k];
    M.parkExcl.push({
      x0: p.x0 - 1.5,
      x1: p.x1 + 1.5,
      z0: p.z0 - 1.5,
      z1: p.z1 + 1.5,
    });
  }

  const W = [1, 1, 1];
  const v3n = (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };

  /**
   * Loft along local +z through superellipse sections {z, w, h, y, e} (e = squareness 2..6).
   * Emitted under the current transform. o: {seg, c (colour fn (t, ring angle) or array), s}
   */
  function loft(b, secs, o) {
    o = o || {};
    const seg = o.seg || 12,
      s = o.s || 2;
    const ring = (S, a) => {
      const ca = Math.cos(a),
        sa = Math.sin(a),
        e = 2 / (S.e || 3);
      const x = (Math.sign(ca) * Math.pow(Math.abs(ca), e) * S.w) / 2,
        y = (Math.sign(sa) * Math.pow(Math.abs(sa), e) * S.h) / 2;
      return [x, (S.y || 0) + y, S.z];
    };
    b.reserve(secs.length * (seg + 1), (secs.length - 1) * seg * 6);
    const base = b.vn;
    let vAcc = 0;
    for (let i = 0; i < secs.length; i++) {
      if (i > 0) vAcc += Math.abs(secs[i].z - secs[i - 1].z);
      for (let k = 0; k <= seg; k++) {
        const a = (k / seg) * Math.PI * 2;
        const p = ring(secs[i], a);
        // normal from neighbouring ring points (around) and the section slope (along)
        const pa = ring(secs[i], a + 0.01),
          pb = ring(secs[i], a - 0.01);
        const tx = pa[0] - pb[0],
          ty = pa[1] - pb[1];
        let n = v3n([ty, -tx, 0]);
        const j = Math.min(secs.length - 1, i + 1),
          jm = Math.max(0, i - 1);
        const q1 = ring(secs[j], a),
          q0 = ring(secs[jm], a),
          dz = q1[2] - q0[2] || 1;
        const dr = ((q1[0] - q0[0]) * n[0] + (q1[1] - q0[1]) * n[1]) / dz;
        n = v3n([n[0], n[1], -dr]);
        const c =
          typeof o.c === "function" ? o.c(i / (secs.length - 1), a) : o.c || W;
        b.v(
          p[0],
          p[1],
          p[2],
          n[0],
          n[1],
          n[2],
          (k / seg) * 4,
          vAcc / s,
          c[0],
          c[1],
          c[2],
        );
      }
    }
    for (let i = 0; i < secs.length - 1; i++)
      for (let k = 0; k < seg; k++) {
        const a = base + i * (seg + 1) + k,
          a1 = a + 1,
          c = a + seg + 1,
          c1 = c + 1;
        // rings run CCW seen from -z; outward winding
        b.tri(a, c1, a1);
        b.tri(a, c, c1);
      }
  }
  /** Flat cap of a loft section (facing dir = ±1 along z). */
  function loftCap(b, S, dir, c, seg) {
    seg = seg || 12;
    const e = 2 / (S.e || 3);
    b.reserve(seg + 2, seg * 3);
    const ctr = b.v(0, S.y || 0, S.z, 0, 0, dir, 0.5, 0.5, c[0], c[1], c[2]);
    for (let k = 0; k <= seg; k++) {
      const a = (k / seg) * Math.PI * 2,
        ca = Math.cos(a),
        sa = Math.sin(a);
      b.v(
        (Math.sign(ca) * Math.pow(Math.abs(ca), e) * S.w) / 2,
        (S.y || 0) + (Math.sign(sa) * Math.pow(Math.abs(sa), e) * S.h) / 2,
        S.z,
        0,
        0,
        dir,
        0.5 + ca * 0.5,
        0.5 + sa * 0.5,
        c[0],
        c[1],
        c[2],
      );
    }
    for (let k = 0; k < seg; k++) {
      if (dir > 0) b.tri(ctr, ctr + 1 + k, ctr + 2 + k);
      else b.tri(ctr, ctr + 2 + k, ctr + 1 + k);
    }
  }

  // -------------------------------------------------------------------
  // 1. Crashed Rotorcraft (the Ramble): a twin-rotor tandem troop carrier
  // -------------------------------------------------------------------
