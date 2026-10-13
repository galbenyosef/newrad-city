// play-inline-157 02 — inner
// Lines 19-149 of readable/play-inline-157.pretty.js (statement-aligned).
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const posterTex = (i) => P.carnegiePosterTex(i); // shared with the exterior (40_carnegie.js)
  // ===================================================================
  // INTERIOR
  // ===================================================================
  /** Horseshoe tier: slab (outer = hall walls, inner = offset horseshoe), parapet, seats, colliders. */
  function tier(S, y, d, seatsRows, o) {
    o = o || {};
    const b = S.b;
    const AX = 22,
      AZB = 4,
      AZE = 16,
      ZS = -24; // side walls x ±22 from z ZS up to AZB, back ellipse to AZE
    const ia = AX - d,
      ib = AZE - AZB - d;
    // inner path (from east-front, down the east side, around the back, up the west side)
    const inner = [];
    inner.push([ia, ZS]);
    inner.push([ia, AZB]);
    const N = 18;
    for (let k = 1; k < N; k++) {
      const a = (k / N) * PI;
      inner.push([ia * Math.cos(a), AZB + ib * Math.sin(a)]);
    }
    inner.push([-ia, AZB]);
    inner.push([-ia, ZS]);
    const sh = new THREE.Shape();
    sh.moveTo(-AX, ZS);
    sh.lineTo(-AX, AZE);
    sh.lineTo(AX, AZE);
    sh.lineTo(AX, ZS);
    for (const p of inner) sh.lineTo(p[0], p[1]);
    sh.closePath();
    const slab = new THREE.ExtrudeGeometry(sh, {
      depth: 0.45,
      bevelEnabled: false,
      curveSegments: 4,
    }).rotateX(HP);
    b.geo(o.floor || "carpet_red", slab, P.m4(0, y, 0), { grime: 0.4 });
    // soffit (underside plaster, slightly lower)
    // parapet with gilded rail along the inner edge
    for (let i = 0; i < inner.length - 1; i++) {
      const a = inner[i],
        c = inner[i + 1],
        L = Math.hypot(c[0] - a[0], c[1] - a[1]),
        ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
      const cx = (a[0] + c[0]) / 2,
        cz = (a[1] + c[1]) / 2;
      b.boxC("plaster_cream", cx, y, cz, L + 0.08, 1.05, 0.22, {
        ry: -ang,
        seg: false,
      });
      b.boxC("gold", cx, y + 1.05, cz, L + 0.1, 0.1, 0.34, {
        ry: -ang,
        seg: false,
      });
      b.boxC("gold", cx, y - 0.62, cz, L + 0.1, 0.18, 0.3, {
        ry: -ang,
        seg: false,
      });
      b.boxC("plaster_red", cx, y + 0.3, cz, L * 0.92, 0.45, 0.24, {
        ry: -ang,
        seg: false,
      });
      S.colR(cx, cz, L + 0.1, 0.3, y, y + 1.1, -ang, { walkable: false });
      // little lamp under the parapet every few segments
      if (i % 3 === 1 && o.lamps !== false) {
        b.sphere("lamp_dim", cx, y - 0.8, cz, 0.08, { ws: 5, hs: 4 });
        S.light(cx, y - 1.0, cz, 0xffd8a0, 6, 0.6);
      }
    }
    // colliders: side strips + sliced back band
    S.col(-AX, y - 0.45, ZS, -ia, y, AZB, { surface: "carpet" });
    S.col(ia, y - 0.45, ZS, AX, y, AZB, { surface: "carpet" });
    for (let z = AZB; z < AZE; z += 1.5) {
      const zm = Math.min(AZE, z + 1.5),
        zc = (z + zm) / 2 - AZB;
      const xi =
        zc < ib ? ia * Math.sqrt(Math.max(0, 1 - (zc / ib) * (zc / ib))) : 0;
      if (xi <= 0.05) S.col(-AX, y - 0.45, z, AX, y, zm, { surface: "carpet" });
      else {
        S.col(-AX, y - 0.45, z, -xi, y, zm, { surface: "carpet" });
        S.col(xi, y - 0.45, z, AX, y, zm, { surface: "carpet" });
      }
    }
    // seats: rows following the horseshoe, facing the stage
    const rn = P.rng(y * 13);
    for (let r = 0; r < seatsRows; r++) {
      const off = 0.9 + r * 1.0,
        ra = ia + off,
        rb = ib + off;
      const pts = [];
      for (let z = ZS + 2; z < AZB; z += 0.62) pts.push([ra, z]);
      const n = Math.round((PI * (ra + rb)) / 2 / 0.62);
      for (let k = 0; k <= n; k++) {
        const a = (k / n) * PI;
        pts.push([ra * Math.cos(a), AZB + rb * Math.sin(a)]);
      }
      for (let z = AZB; z > ZS + 2; z -= 0.62) pts.push([-ra, z]);
      for (const [x, z] of pts) {
        if (Math.abs(x) > AX - 0.4 || z > AZE - 0.5 || rn() < 0.1) continue;
        if (o.skipSeat && o.skipSeat(x, z)) continue;
        const ry = Math.atan2(0 - x, -30 - z) + PI;
        const M = P.m4(x, y, z, ry);
        b.geo(
          "velvet",
          new THREE.BoxGeometry(0.46, 0.1, 0.42).translate(0, 0.42, 0),
          M,
          { noAO: true, grime: 0.35 },
        );
        b.geo(
          "velvet",
          new THREE.BoxGeometry(0.48, 0.5, 0.08).translate(0, 0.72, 0.2),
          M,
          { noAO: true, grime: 0.35 },
        );
        b.geo(
          "iron",
          new THREE.BoxGeometry(0.05, 0.42, 0.4).translate(0.26, 0.21, 0),
          M,
          { noAO: true },
        );
      }
    }
    return inner;
  }

