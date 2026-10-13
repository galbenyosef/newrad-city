/* src/map/70_mapimage.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 70 GOGGLES WORLD MAP
 * G.map.getMapImage() → 2048×3136 canvas: the VIGIL goggles' survey
 * plate — a vector/wireframe city in pale cyan-white on near-black blue
 * (the goggles' CRT palette). It is painted as a grey aerial photograph first
 * (asphalt & sidewalks, hill-shaded Central Park with the lakes, canopy
 * dots of the dead trees, every building with a sun shadow to the SE whose
 * length follows its height, setback tiers on towers, bulkheads & water
 * tanks on the roofs, rubble fields on collapsed lots, landmark footprints
 * brighter with a crisp outline, piers, islands, the fallen towers), then
 * outlined (edge pass: every footprint, coast and path edge becomes a bright
 * line while flat areas sink) and mapped through the goggles ramp (near-black
 * blue → dim cyan rgba(150,220,240,.35) → #cfeefa on the brightest edges)
 * with grain and faint scan banding.
 * Painted lazily on the first call (≈0.3–0.6 s) and cached.
 * G.map.worldToMap(x,z) → {u,v} in 0..1 ; G.map.mapToWorld(u,v) → {x,z}.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const M = G.map._;

  const CW = 2048,
    CH = 3136;
  const LS = CW / 1024; // label scale relative to the old 1024 px plate
  let xf = null;
  function transform() {
    if (xf) return xf;
    const W = G.LAYOUT.WORLD;
    const s = Math.min(CW / (W.maxX - W.minX), CH / (W.maxZ - W.minZ));
    const ox = (CW - (W.maxX - W.minX) * s) / 2,
      oy = (CH - (W.maxZ - W.minZ) * s) / 2;
    xf = { s, ox, oy, W };
    return xf;
  }
  M.mapXF = transform;
  const P = (x, z) => {
    const t = transform();
    return [t.ox + (x - t.W.minX) * t.s, t.oy + (z - t.W.minZ) * t.s];
  };
  const grey = (v, a) => {
    v = Math.max(0, Math.min(255, v | 0));
    return a === undefined
      ? "rgb(" + v + "," + v + "," + v + ")"
      : "rgba(" + v + "," + v + "," + v + "," + a + ")";
  };

  function pathPoly(ctx, pts, dx, dz) {
    ctx.beginPath();
    pts.forEach((p, i) => {
      const q = P(p[0] + (dx || 0), p[1] + (dz || 0));
      if (i) ctx.lineTo(q[0], q[1]);
      else ctx.moveTo(q[0], q[1]);
    });
    ctx.closePath();
  }
  const rectPts = (x0, z0, x1, z1) => [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ];

  // sun from the NW (upper left of the plate): shadows fall to the SE
  const SUN = [0.62, 0.78];
  /** Building shadow: the footprint swept along the sun direction (length ∝ height, capped). */
  function shadow(ctx, pts, h) {
    const len = Math.min(46, 3 + h * 0.34),
      n = Math.max(2, Math.min(10, Math.ceil(len / 5)));
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    // convex sweep for rectangles, stacked copies for other shapes
    if (
      pts.length === 4 &&
      pts[0][1] === pts[1][1] &&
      pts[1][0] === pts[2][0]
    ) {
      const [x0, z0] = pts[0],
        [x1, z1] = pts[2],
        dx = SUN[0] * len,
        dz = SUN[1] * len;
      pathPoly(ctx, [
        [x0, z0],
        [x1, z0],
        [x1 + dx, z0 + dz],
        [x1 + dx, z1 + dz],
        [x0 + dx, z1 + dz],
        [x0, z1],
      ]);
      ctx.fill();
      return;
    }
    for (let k = 1; k <= n; k++) {
      pathPoly(ctx, pts, (SUN[0] * len * k) / n, (SUN[1] * len * k) / n);
      ctx.fill();
    }
  }
  /** Lit roof: fill + parapet highlight on the sun side, dark lip on the far side. */
  function roofFill(ctx, pts, v, edge) {
    pathPoly(ctx, pts);
    ctx.fillStyle = grey(v);
    ctx.fill();
    const t = transform();
    ctx.lineWidth = Math.max(1, 0.9 * t.s);
    // shade edges by their outward normal against the sun
    const ccw = M.polyArea(pts) > 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        b = pts[(i + 1) % pts.length];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        l = Math.hypot(dx, dz) || 1;
      let nx = dz / l,
        nz = -dx / l;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      const lit = -(nx * SUN[0] + nz * SUN[1]); // facing the sun → brighter lip
      const qa = P(a[0], a[1]),
        qb = P(b[0], b[1]);
      ctx.strokeStyle =
        lit > 0 ? grey(v + 40 * lit + (edge || 0)) : grey(v * (1 + 0.45 * lit));
      ctx.beginPath();
      ctx.moveTo(qa[0], qa[1]);
      ctx.lineTo(qb[0], qb[1]);
      ctx.stroke();
    }
  }
  function speckle(ctx, pts, r, n, v0, v1, size) {
    const bb = M.polyBBox(pts),
      t = transform();
    for (let i = 0; i < n; i++) {
      const x = r.range(bb.x0, bb.x1),
        z = r.range(bb.z0, bb.z1);
      if (pts.length > 4 && !M.inPoly(x, z, pts)) continue;
      const q = P(x, z),
        s = (size || 1.2) * t.s * r.range(0.6, 1.6);
      ctx.fillStyle = grey(r.range(v0, v1));
      ctx.fillRect(q[0], q[1], s, s);
    }
  }
  /** Roof furniture: bulkheads, a water tank, vents; setback tiers on tall buildings. */
  function roofDetail(ctx, x0, z0, x1, z1, h, v, r, kind) {
    const w = x1 - x0,
      d = z1 - z0;
    if (h > 55 && w > 12 && d > 12 && kind !== "collapsed") {
      const tiers = h > 110 ? 3 : h > 80 ? 2 : 1;
      let a = [x0, z0, x1, z1];
      for (let k = 1; k <= tiers; k++) {
        const ix = (a[2] - a[0]) * r.range(0.12, 0.2),
          iz = (a[3] - a[1]) * r.range(0.12, 0.2);
        const b = [a[0] + ix, a[1] + iz, a[2] - ix, a[3] - iz];
        if (b[2] - b[0] < 5 || b[3] - b[1] < 5) break;
        const pts = rectPts(b[0], b[1], b[2], b[3]);
        shadow(ctx, pts, h * 0.12 * k);
        roofFill(ctx, pts, v + 12 * k, 10);
        a = b;
      }
      // mast / spire dot on the top tier
      if (h > 100) {
        const q = P((a[0] + a[2]) / 2, (a[1] + a[3]) / 2),
          t = transform();
        ctx.fillStyle = grey(v + 70);
        ctx.fillRect(q[0] - t.s, q[1] - t.s, 2 * t.s, 2 * t.s);
      }
      return;
    }
    if (kind === "collapsed") return;
    const nb = w * d > 250 ? 2 : 1;
    for (let i = 0; i < nb; i++) {
      const bw = r.range(2.5, 4.5),
        bd = r.range(2.5, 4.5);
      const bx = r.range(x0 + 1, Math.max(x0 + 1, x1 - bw - 1)),
        bz = r.range(z0 + 1, Math.max(z0 + 1, z1 - bd - 1));
      const pts = rectPts(bx, bz, bx + bw, bz + bd);
      shadow(ctx, pts, 3);
      roofFill(ctx, pts, v + 16, 8);
    }
    if (
      (kind === "apartment" ||
        kind === "tenement" ||
        kind === "commercial" ||
        kind === "shell" ||
        kind === "brownstone") &&
      r() < 0.45 &&
      w > 6 &&
      d > 6
    ) {
      const t = transform(),
        cx = r.range(x0 + 2.5, x1 - 2.5),
        cz = r.range(z0 + 2.5, z1 - 2.5),
        q = P(cx, cz),
        rr = 1.8 * t.s;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.arc(q[0] + SUN[0] * 5 * t.s, q[1] + SUN[1] * 5 * t.s, rr, 0, 7);
      ctx.fill();
      ctx.fillStyle = grey(v + 26);
      ctx.beginPath();
      ctx.arc(q[0], q[1], rr, 0, 7);
      ctx.fill();
      ctx.strokeStyle = grey(v - 25);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  M.drawMapImage = function (into) {
    const L = G.LAYOUT;
    const cv = into || M.canvas(CW, CH),
      ctx = cv.getContext("2d", { willReadFrequently: true });
    const t = transform(),
      S = t.s;
    const r = M.rng("mapplate2");
    const lands = [
      L.MANHATTAN,
      L.BROOKLYN,
      M.circlePoly(L.LIBERTY.x, L.LIBERTY.z, L.LIBERTY.r, 40),
      M.circlePoly(L.ELLIS.x, L.ELLIS.z, L.ELLIS.r, 32),
    ].concat(L.ROOSEVELT ? [L.ROOSEVELT] : []);
    const clipLand = () => {
      ctx.save();
      ctx.beginPath();
      for (const lp of lands)
        lp.forEach((p, i) => {
          const q = P(p[0], p[1]);
          if (i) ctx.lineTo(q[0], q[1]);
          else ctx.moveTo(q[0], q[1]);
        });
      ctx.clip();
    };

    // ---- water: dark, with a soft swell texture and brighter chop along the shores
    ctx.fillStyle = grey(16);
    ctx.fillRect(0, 0, CW, CH);
    ctx.lineWidth = 1;
    for (let y = 0; y < CH; y += 5) {
      ctx.strokeStyle = grey(22 + r() * 8, 0.35);
      ctx.beginPath();
      for (let x = 0; x <= CW; x += 24)
        ctx.lineTo(x, y + Math.sin(x * 0.021 + y * 0.7) * 2);
      ctx.stroke();
    }
    // far shores (New Jersey / Queens context): dim land with a faint block texture
    ctx.fillStyle = grey(30);
    ctx.fillRect(0, 0, P(-770, 0)[0], CH);
    for (let i = 0; i < 1400; i++) {
      const x = r() * P(-775, 0)[0],
        y = r() * CH;
      ctx.fillStyle = grey(r.range(26, 48));
      ctx.fillRect(x, y, r.range(3, 9), r.range(3, 9));
    }
    // shore glow (surf / riprap) around every land mass
    for (const lp of lands) {
      pathPoly(ctx, lp);
      ctx.strokeStyle = grey(44, 0.6);
      ctx.lineWidth = 7 * S;
      ctx.stroke();
      ctx.strokeStyle = grey(70, 0.8);
      ctx.lineWidth = 2.5 * S;
      ctx.stroke();
    }
    // ---- land base: dusty concrete & dirt with grain
    for (const lp of lands) {
      pathPoly(ctx, lp);
      ctx.fillStyle = grey(52);
      ctx.fill();
    }
    clipLand();
    for (let i = 0; i < 26000; i++) {
      const x = r() * CW,
        y = r() * CH;
      ctx.fillStyle = grey(r.range(38, 70), 0.5);
      ctx.fillRect(x, y, r.range(1, 3), r.range(1, 3));
    }
    ctx.restore();

    // ---- streets: sidewalks (light) then carriageways (dark asphalt) with worn centre lines
    const avenues = M.roads ? M.roads.avenues : L.avenues,
      streets = M.roads ? M.roads.streets : L.streets;
    const rectW = (x0, z0, x1, z1, v) => {
      const a = P(x0, z0),
        b = P(x1, z1);
      ctx.fillStyle = typeof v === "string" ? v : grey(v);
      ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    };
    clipLand();
    for (const a of avenues)
      rectW(a.x - a.width / 2, a.z0, a.x + a.width / 2, a.z1, 96);
    for (const s of streets)
      rectW(s.x0, s.z - s.width / 2, s.x1, s.z + s.width / 2, 96);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const bwLine = (w, v) => {
      ctx.strokeStyle = grey(v);
      ctx.lineWidth = w * S;
      ctx.beginPath();
      L.BROADWAY.forEach((p, i) => {
        const q = P(p[0], p[1]);
        if (i) ctx.lineTo(q[0], q[1]);
        else ctx.moveTo(q[0], q[1]);
      });
      ctx.stroke();
    };
    bwLine(L.BROADWAY_W, 96);
    for (const c of L.CIRCLES || []) {
      const q = P(c.x, c.z);
      ctx.fillStyle = grey(96);
      ctx.beginPath();
      ctx.arc(q[0], q[1], (c.rOuter + 3) * S, 0, 7);
      ctx.fill();
    }
    const road = 40;
    for (const a of avenues)
      rectW(a.x - a.road / 2, a.z0, a.x + a.road / 2, a.z1, road);
    for (const s of streets)
      rectW(s.x0, s.z - s.road / 2, s.x1, s.z + s.road / 2, road);
    bwLine(L.BROADWAY_ROAD, road);
    for (const c of L.CIRCLES || []) {
      const q = P(c.x, c.z);
      ctx.fillStyle = grey(road);
      ctx.beginPath();
      ctx.arc(q[0], q[1], c.rOuter * S, 0, 7);
      ctx.fill();
      ctx.fillStyle = grey(74);
      ctx.beginPath();
      ctx.arc(q[0], q[1], c.rIsland * S, 0, 7);
      ctx.fill();
      ctx.strokeStyle = grey(120);
      ctx.lineWidth = 1.2 * S;
      ctx.stroke();
    }
    // asphalt mottling (patches, oil, rubble) + faded centre lines
    ctx.setLineDash([3 * S, 4 * S]);
    ctx.lineWidth = Math.max(1, 0.35 * S);
    ctx.strokeStyle = grey(78, 0.55);
    for (const a of avenues) {
      const p0 = P(a.x, a.z0),
        p1 = P(a.x, a.z1);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
    for (const s of streets) {
      const p0 = P(s.x0, s.z),
        p1 = P(s.x1, s.z);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const a of avenues)
      for (let z = a.z0; z < a.z1; z += 9)
        if (r() < 0.5) {
          const q = P(a.x + r.range(-a.road / 2, a.road / 2 - 2), z + r() * 8);
          ctx.fillStyle = grey(r.range(28, 60), 0.7);
          ctx.fillRect(q[0], q[1], r.range(1.5, 4) * S, r.range(1.5, 4) * S);
        }
    for (const s of streets)
      for (let x = s.x0; x < s.x1; x += 9)
        if (r() < 0.45) {
          const q = P(x + r() * 8, s.z + r.range(-s.road / 2, s.road / 2 - 2));
          ctx.fillStyle = grey(r.range(28, 60), 0.7);
          ctx.fillRect(q[0], q[1], r.range(1.5, 4) * S, r.range(1.5, 4) * S);
        }
    // craters & blockades read as dark pits / bright wreck clusters
    for (const c of G.map.craters || M.craters || []) {
      const q = P(c.x, c.z),
        rr = Math.max(2, c.r || 4) * S;
      ctx.fillStyle = grey(18, 0.8);
      ctx.beginPath();
      ctx.arc(q[0], q[1], rr, 0, 7);
      ctx.fill();
      ctx.strokeStyle = grey(88, 0.7);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (const b of M.blockades || []) {
      for (let i = 0; i < 7; i++) {
        const q = P(b.x + r.range(-6, 6), b.z + r.range(-4, 4));
        ctx.fillStyle = grey(r.range(90, 150));
        ctx.fillRect(q[0], q[1], r.range(2, 4) * S, r.range(1.5, 2.5) * S);
      }
    }
    ctx.restore();

    // ---- Central Park: hill-shaded heightfield, lakes, paths, canopy
    const Pk = L.PARK;
    if (M.parkHF) {
      const H = M.parkHF,
        st = H.step;
      const hAt = (i, j) =>
        H.h[
          Math.max(0, Math.min(H.nz - 1, j)) * H.nx +
            Math.max(0, Math.min(H.nx - 1, i))
        ];
      const px = Math.max(1, st * S);
      for (let j = 0; j < H.nz; j++)
        for (let i = 0; i < H.nx; i++) {
          const h = H.h[j * H.nx + i];
          const q = P(H.x0 + i * st - st / 2, H.z0 + j * st - st / 2);
          if (h < (M.LAKE_Y !== undefined ? M.LAKE_Y : -1.2)) {
            // water: darker with depth, a light rim at the bank
            const depth = Math.min(1, ((M.LAKE_Y || -1.2) - h) / 2);
            ctx.fillStyle = grey(30 - depth * 16);
            ctx.fillRect(q[0], q[1], px + 0.6, px + 0.6);
            continue;
          }
          const gx = (hAt(i + 1, j) - hAt(i - 1, j)) / (2 * st),
            gz = (hAt(i, j + 1) - hAt(i, j - 1)) / (2 * st);
          const shade = Math.max(
            -1,
            Math.min(1, (gx * SUN[0] + gz * SUN[1]) * -3.2),
          );
          const n = M.hash(i, j, 5);
          ctx.fillStyle = grey(
            60 + shade * 34 + n * 10 + Math.min(12, h * 1.5),
          );
          ctx.fillRect(q[0], q[1], px + 0.6, px + 0.6);
        }
      // lake banks: a bright line where water meets land
      ctx.fillStyle = grey(96, 0.8);
      for (let j = 1; j < H.nz - 1; j++)
        for (let i = 1; i < H.nx - 1; i++) {
          const w = H.h[j * H.nx + i] < (M.LAKE_Y || -1.2);
          if (!w) continue;
          if (
            H.h[j * H.nx + i + 1] >= (M.LAKE_Y || -1.2) ||
            H.h[j * H.nx + i - 1] >= (M.LAKE_Y || -1.2) ||
            H.h[(j + 1) * H.nx + i] >= (M.LAKE_Y || -1.2) ||
            H.h[(j - 1) * H.nx + i] >= (M.LAKE_Y || -1.2)
          ) {
            const q = P(H.x0 + i * st - st / 2, H.z0 + j * st - st / 2);
            ctx.fillRect(q[0], q[1], px * 0.7, px * 0.7);
          }
        }
    } else {
      rectW(Pk.x0, Pk.z0, Pk.x1, Pk.z1, 58);
    }
    ctx.strokeStyle = grey(128, 0.85);
    ctx.lineCap = "round";
    for (const p of M.parkPaths || []) {
      ctx.lineWidth = Math.max(1, p.width * S * 0.9);
      ctx.beginPath();
      p.pts.forEach((q2, i) => {
        const q = P(q2[0], q2[1]);
        if (i) ctx.lineTo(q[0], q[1]);
        else ctx.moveTo(q[0], q[1]);
      });
      ctx.stroke();
    }
    // dead-tree canopies: a shadow blot + a grey tangle
    const tp = M.treePos || [];
    for (let i = 0; i < tp.length; i += 3) {
      const q = P(tp[i], tp[i + 1]),
        rr = (1.6 + tp[i + 2] * 1.4) * S;
      ctx.fillStyle = "rgba(0,0,0,0.42)";
      ctx.beginPath();
      ctx.arc(q[0] + SUN[0] * 3.5 * S, q[1] + SUN[1] * 3.5 * S, rr * 0.9, 0, 7);
      ctx.fill();
      ctx.fillStyle = grey(84 + M.hash(tp[i], tp[i + 1], 3) * 40, 0.85);
      ctx.beginPath();
      ctx.arc(q[0], q[1], rr, 0, 7);
      ctx.fill();
    }
    // park wall
    {
      const a = P(Pk.x0, Pk.z0),
        b = P(Pk.x1, Pk.z1);
      ctx.strokeStyle = grey(118);
      ctx.lineWidth = 1.2 * S;
      ctx.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    }

    // ---- open spaces (plazas / squares): pale paving
    for (const o of M.OPEN_SPACES || []) {
      const pts = o.poly || rectPts(o.x0, o.z0, o.x1, o.z1);
      pathPoly(ctx, pts);
      ctx.fillStyle = grey(84);
      ctx.fill();
      speckle(ctx, pts, r, 60, 50, 110, 2.5);
    }

    // ---- piers
    for (const pr of M.piers || []) {
      const w = pr.w || 14,
        dx = pr.ex - pr.x,
        dz = pr.ez - pr.z,
        l = Math.hypot(dx, dz) || 1,
        nx = ((-dz / l) * w) / 2,
        nz = ((dx / l) * w) / 2;
      const pts = [
        [pr.x + nx, pr.z + nz],
        [pr.ex + nx, pr.ez + nz],
        [pr.ex - nx, pr.ez - nz],
        [pr.x - nx, pr.z - nz],
      ];
      shadow(ctx, pts, 4);
      roofFill(ctx, pts, 92, 10);
    }

    // ---- generic buildings: shadow first (all), then roofs, so shadows fall on streets but not on roofs
    const lots = (M.lots || []).filter((l) => l.h || l.kind === "collapsed");
    const cut = (M.cutLots || []).filter((l) => l.poly);
    const lotV = (l, rr) => {
      const k = Math.min(1, (l.h || 0) / 150);
      let v = 86 + k * 52 + rr.range(-12, 12);
      if (l.burnt) v *= 0.62;
      if (l.kind === "brownstone" || l.kind === "tenement") v -= 10;
      if (l.kind === "warehouse") v += 4;
      return v;
    };
    clipLand();
    for (const l of lots)
      if (l.kind !== "collapsed")
        shadow(ctx, rectPts(l.x0, l.z0, l.x1, l.z1), l.h || 8);
    for (const l of cut) if (!l.ruined || l.h) shadow(ctx, l.poly, l.h || 20);
    ctx.restore();
    for (const l of lots) {
      const rr = M.rng("pm" + Math.round(l.x0) + "," + Math.round(l.z0));
      const pts = rectPts(l.x0, l.z0, l.x1, l.z1);
      if (l.kind === "collapsed") {
        // rubble field: mottled heap, brighter debris chunks
        pathPoly(ctx, pts);
        ctx.fillStyle = grey(66);
        ctx.fill();
        speckle(
          ctx,
          pts,
          rr,
          (l.x1 - l.x0) * (l.z1 - l.z0) * 0.35,
          40,
          150,
          1.6,
        );
        continue;
      }
      const v = lotV(l, rr);
      roofFill(ctx, pts, v, 14);
      speckle(
        ctx,
        pts,
        rr,
        Math.min(90, (l.x1 - l.x0) * (l.z1 - l.z0) * 0.06),
        v - 26,
        v + 14,
        1.1,
      ); // tar & gravel
      if (l.ruined)
        speckle(
          ctx,
          pts,
          rr,
          (l.x1 - l.x0) * (l.z1 - l.z0) * 0.12,
          30,
          110,
          1.4,
        );
      if (l.courtyard) {
        const ix = (l.x1 - l.x0) * 0.3,
          iz = (l.z1 - l.z0) * 0.3;
        pathPoly(ctx, rectPts(l.x0 + ix, l.z0 + iz, l.x1 - ix, l.z1 - iz));
        ctx.fillStyle = grey(40);
        ctx.fill();
      }
      roofDetail(ctx, l.x0, l.z0, l.x1, l.z1, l.h || 8, v, rr, l.kind);
    }
    for (const l of cut) {
      const rr = M.rng("pc" + Math.round(l.x0) + "," + Math.round(l.z0));
      const v = lotV(l, rr);
      roofFill(ctx, l.poly, v, 14);
      if (l.ruined) speckle(ctx, l.poly, rr, 40, 30, 110, 1.4);
    }

    // ---- fallen towers: a long bright shaft lying across the street
    for (const f of M.fallenTowers || []) {
      const dx = f.tipx - f.x,
        dz = f.tipz - f.z,
        l = Math.hypot(dx, dz) || 1,
        w = (f.w || 14) / 2,
        nx = (-dz / l) * w,
        nz = (dx / l) * w;
      const pts = [
        [f.x + nx, f.z + nz],
        [f.tipx + nx, f.tipz + nz],
        [f.tipx - nx, f.tipz - nz],
        [f.x - nx, f.z - nz],
      ];
      shadow(ctx, pts, 8);
      roofFill(ctx, pts, 120, 10);
      speckle(ctx, pts, r, 120, 50, 160, 1.5);
    }

    // ---- landmark & POI sites. Their real buildings are read from the world colliders (true footprints, heights
    // and orientation of whatever the landmark / POI modules built); a site that is not built yet falls back to a
    // shaded block. Ground = pale paving (not in the park), crisp outline so every landmark reads as a place.
    const mapCols = new Set(M.colliders || []);
    const siteShape = (s) =>
      s.poly ? s.poly : rectPts(s.x0, s.z0, s.x1, s.z1);
    const colPts = (c) => {
      const k = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];
      return k.map(([a, b]) => {
        const lx = a * c.hx,
          lz = b * c.hz;
        return [c.cx + lx * c.cos + lz * c.sin, c.cz - lx * c.sin + lz * c.cos];
      });
    };
    const siteBlds = new Map();
    for (const s of L.SITES) {
      if (s.id === "brooklyn_bridge" || s.id === "statue_of_liberty") continue;
      const list = [];
      try {
        for (const c of G.world.query(s.x0, s.z0, s.x1, s.z1)) {
          if (
            mapCols.has(c) ||
            /actor|car|vehicle|wreck|bus|truck|barrel|crate/.test(c.tag || "")
          )
            continue;
          if (
            c.maxY - Math.max(0, c.minY) < 2.4 ||
            c.minY > 6 ||
            c.hx * c.hz < 2
          )
            continue;
          if (
            c.cx < s.x0 - 2 ||
            c.cx > s.x1 + 2 ||
            c.cz < s.z0 - 2 ||
            c.cz > s.z1 + 2
          )
            continue;
          list.push(c);
        }
      } catch (e) {
        /* world not ready */
      }
      list.sort((a, b) => a.maxY - b.maxY);
      siteBlds.set(s, list.length > 2 ? list : null);
    }
    for (const s of L.SITES) {
      if (
        s.id === "brooklyn_bridge" ||
        s.id === "statue_of_liberty" ||
        s.plaza ||
        !(s.height > 0)
      )
        continue;
      if (L.inPark((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2)) continue;
      pathPoly(ctx, siteShape(s));
      ctx.fillStyle = grey(88);
      ctx.fill();
    }
    clipLand();
    for (const s of L.SITES) {
      const bl = siteBlds.get(s);
      if (bl) {
        for (const c of bl) shadow(ctx, colPts(c), Math.min(160, c.maxY));
        continue;
      }
      if (
        s.height > 0 &&
        !s.plaza &&
        s.id !== "brooklyn_bridge" &&
        s.id !== "statue_of_liberty" &&
        !L.inPark((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2)
      )
        shadow(ctx, siteShape(s), Math.min(160, s.height));
    }
    ctx.restore();
    for (const s of L.SITES) {
      if (s.id === "brooklyn_bridge") {
        const a = P(s.x0, (s.z0 + s.z1) / 2),
          b = P(s.x1, (s.z0 + s.z1) / 2);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 10 * S;
        ctx.beginPath();
        ctx.moveTo(a[0] + 4 * S, a[1] + 6 * S);
        ctx.lineTo(b[0] + 4 * S, b[1] + 6 * S);
        ctx.stroke();
        ctx.strokeStyle = grey(150);
        ctx.lineWidth = 9 * S;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        ctx.strokeStyle = grey(210);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1] - 4.5 * S);
        ctx.lineTo(b[0], b[1] - 4.5 * S);
        ctx.moveTo(a[0], a[1] + 4.5 * S);
        ctx.lineTo(b[0], b[1] + 4.5 * S);
        ctx.stroke();
        for (const x of [
          s.x0 + (s.x1 - s.x0) * 0.3,
          s.x0 + (s.x1 - s.x0) * 0.7,
        ]) {
          const q = P(x, (s.z0 + s.z1) / 2);
          ctx.fillStyle = grey(225);
          ctx.fillRect(q[0] - 4 * S, q[1] - 8 * S, 8 * S, 16 * S);
        }
        continue;
      }
      if (s.id === "statue_of_liberty") {
        const c = P((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2);
        ctx.strokeStyle = grey(200);
        ctx.lineWidth = 1.5 * LS;
        ctx.beginPath();
        for (let i = 0; i < 11; i++) {
          const ang = (i / 10) * Math.PI * 2 - Math.PI / 2,
            rr = (i % 2 ? 9 : 19) * LS;
          const x = c[0] + Math.cos(ang) * rr,
            y = c[1] + Math.sin(ang) * rr;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = grey(150);
        ctx.fill();
        ctx.stroke();
        continue;
      }
      clipLand();
      const pts = siteShape(s),
        bl = siteBlds.get(s),
        inPark = L.inPark((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2);
      const rr = M.rng("ps" + s.id);
      if (bl) {
        for (const c of bl) {
          const v = 112 + Math.min(1, c.maxY / 200) * 70;
          roofFill(ctx, colPts(c), v, 18);
        }
      } else if (s.plaza || !(s.height > 0)) {
        if (!inPark) {
          pathPoly(ctx, pts);
          ctx.fillStyle = grey(100);
          ctx.fill();
          speckle(ctx, pts, rr, 80, 70, 140, 2);
        }
      } else if (!inPark) {
        const v = 118 + Math.min(1, s.height / 200) * 50;
        roofFill(ctx, pts, v, 20);
        if (s.x1 - s.x0 > 14 && s.z1 - s.z0 > 14)
          roofDetail(
            ctx,
            s.x0 + 2,
            s.z0 + 2,
            s.x1 - 2,
            s.z1 - 2,
            s.height,
            v,
            rr,
            "site",
          );
      }
      pathPoly(ctx, pts);
      ctx.strokeStyle = grey(215, inPark ? 0.35 : 0.7);
      ctx.lineWidth = (inPark ? 0.8 : 1.2) * LS;
      ctx.stroke();
      ctx.restore();
    }

    // ---- shorelines (bright coast line)
    ctx.strokeStyle = grey(165);
    ctx.lineWidth = 1.6 * LS;
    ctx.lineJoin = "round";
    for (const lp of lands) {
      pathPoly(ctx, lp);
      ctx.stroke();
    }
    // very faint survey grid (100 m)
    ctx.strokeStyle = grey(140, 0.06);
    ctx.lineWidth = 1;
    for (let x = Math.ceil(t.W.minX / 100) * 100; x <= t.W.maxX; x += 100) {
      const a = P(x, t.W.minZ),
        b = P(x, t.W.maxZ);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    for (let z = Math.ceil(t.W.minZ / 100) * 100; z <= t.W.maxZ; z += 100) {
      const a = P(t.W.minX, z),
        b = P(t.W.maxX, z);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }

    // ---- labels (area names only; locations are drawn by the goggles map tab)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = (txt, x, z, size, alpha, rot) => {
      const q = P(x, z);
      ctx.save();
      ctx.translate(q[0], q[1]);
      if (rot) ctx.rotate(rot);
      ctx.font =
        "bold " + size * LS + 'px "Share Tech Mono", "Courier New", monospace';
      ctx.lineWidth = 3 * LS;
      ctx.strokeStyle = grey(10, alpha * 0.9);
      ctx.strokeText(txt, 0, 0);
      ctx.fillStyle = grey(235, alpha);
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    };
    label("HUDSON RIVER", -540, -300, 18, 0.55, -Math.PI / 2);
    label("EAST RIVER", 405, -150, 16, 0.55, -Math.PI / 2);
    label("UPPER NEW YORK BAY", 150, 1250, 16, 0.5);
    label("CENTRAL PARK", 0, -700, 15, 0.6, -Math.PI / 2);
    label("UPPER WEST SIDE", -230, -700, 11, 0.45, -Math.PI / 2);
    label("UPPER EAST SIDE", 230, -700, 11, 0.45, -Math.PI / 2);
    label("MIDTOWN", -190, -200, 13, 0.5);
    label("CHELSEA", -190, 50, 11, 0.45);
    label("GREENWICH VILLAGE", -150, 330, 11, 0.45);
    label("FINANCIAL DISTRICT", -130, 760, 11, 0.45);
    label("BROOKLYN", 650, 540, 14, 0.55);
    label("NEW JERSEY", -730, 600, 12, 0.4, -Math.PI / 2);
    label("LIBERTY IS.", L.LIBERTY.x, L.LIBERTY.z + 75, 10, 0.5);
    label("ELLIS IS.", L.ELLIS.x, L.ELLIS.z - 45, 10, 0.5);
    // compass rose
    const cr = [CW - 70 * LS, CH - 90 * LS];
    ctx.strokeStyle = grey(200, 0.6);
    ctx.lineWidth = 1.5 * LS;
    ctx.beginPath();
    ctx.arc(cr[0], cr[1], 26 * LS, 0, 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cr[0], cr[1] - 36 * LS);
    ctx.lineTo(cr[0], cr[1] + 36 * LS);
    ctx.moveTo(cr[0] - 36 * LS, cr[1]);
    ctx.lineTo(cr[0] + 36 * LS, cr[1]);
    ctx.stroke();
    ctx.fillStyle = grey(220, 0.8);
    ctx.font = "bold " + 16 * LS + 'px "Share Tech Mono", monospace';
    ctx.fillText("N", cr[0], cr[1] - 46 * LS);

    // ---- goggles ramp: grey plate → edge-lit vector look → near-black blue / dim cyan / #cfeefa
    //      (+ grain, faint scan banding, soft vignette). Never green.
    const img = ctx.getImageData(0, 0, CW, CH),
      a = img.data;
    const ramp = new Uint8ClampedArray(256 * 3);
    const DARK = [3, 7, 14],
      DIM = [150 * 0.62, 220 * 0.62, 240 * 0.62],
      HOT = [207, 238, 250];
    for (let v = 0; v < 256; v++) {
      const f = Math.pow(v / 255, 1.15);
      const t1 = Math.min(1, f / 0.7),
        t2 = Math.max(0, (f - 0.7) / 0.3);
      for (let k = 0; k < 3; k++)
        ramp[v * 3 + k] =
          (DARK[k] * (1 - t1) + DIM[k] * t1) * (1 - t2) + HOT[k] * t2;
    }
    // luminance copy for the edge pass (the plate is grey: r = g = b)
    const lum = new Uint8Array(CW * CH);
    for (let i = 0, j = 0; j < lum.length; i += 4, j++) lum[j] = a[i];
    const gr = M.rng("mapgrain");
    for (let y = 0; y < CH; y++) {
      const band = y % 4 === 0 ? -6 : 0;
      const vy = (y / CH - 0.5) * 2;
      const row = y * CW,
        below = y < CH - 1 ? CW : 0;
      for (let x = 0; x < CW; x++) {
        const j = row + x,
          i = j * 4;
        const L0 = lum[j],
          ex = x < CW - 1 ? Math.abs(lum[j + 1] - L0) : 0,
          ey = Math.abs(lum[j + below] - L0);
        const vx = (x / CW - 0.5) * 2,
          vig = 1 - 0.18 * (vx * vx + vy * vy);
        let v =
          ((L0 * 0.6 + Math.min(150, (ex + ey) * 2.2)) * vig +
            band +
            (gr() - 0.5) * 10) |
          0;
        v = v < 0 ? 0 : v > 255 ? 255 : v;
        a[i] = ramp[v * 3];
        a[i + 1] = ramp[v * 3 + 1];
        a[i + 2] = ramp[v * 3 + 2];
        a[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  };

  // Painted lazily. A call before 'initDone' (another module wanting the plate at init) is repainted into the SAME
  // canvas once every module has built its landmarks, so callers that cached the canvas get the final picture.
  let cached = null,
    ready = false,
    stale = false;
  G.map.getMapImage = function () {
    if (!cached) {
      try {
        cached = M.drawMapImage();
        stale = !ready;
      } catch (e) {
        G.reportError("map:getMapImage", e);
        cached = M.canvas(CW, CH);
      }
    }
    return cached;
  };
  try {
    G.events.on("initDone", () => {
      ready = true;
      if (cached && stale) {
        try {
          M.drawMapImage(cached);
          stale = false;
        } catch (e) {
          G.reportError("map:getMapImage", e);
        }
      }
    });
  } catch (e) {
    ready = true;
  }
  G.map.worldToMap = function (x, z) {
    const t = transform();
    return {
      u: (t.ox + (x - t.W.minX) * t.s) / CW,
      v: (t.oy + (z - t.W.minZ) * t.s) / CH,
    };
  };
  G.map.mapToWorld = function (u, v) {
    const t = transform();
    return {
      x: (u * CW - t.ox) / t.s + t.W.minX,
      z: (v * CH - t.oy) / t.s + t.W.minZ,
    };
  };
  G.map.mapSize = { width: CW, height: CH };
})();
