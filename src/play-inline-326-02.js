// play-inline-326 02 — opts
// Lines 19-288 of readable/play-inline-326.pretty.js (statement-aligned).
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const NB = (PF.NB = {
    X0: -262,
    X1: -218,
    Z0: 227,
    Z1: 258,
    XT: -232, // split between the bakery block (west) and the tower (east)
    HA: 21.5,
    HT: 29, // roof heights
    F: [0, 4.0, 7.5, 11, 14.5, 18, 21.5, 25, 28.5], // floor levels
  });

  /** Semicircular-arch window/door opening: frame of voussoirs + recessed dark pane (+ optional sash). */
  function archBay(b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    const springY = h - w / 2;
    // pane: rectangle + half disc
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(w / 2, springY);
    sh.absarc(0, springY, w / 2, 0, PI, false);
    sh.lineTo(-w / 2, 0);
    const g = PF.shapeGeo(sh, 10);
    b.add(opts.pane || "glass_dark", g, {
      m: PF.m4(x - s * 0.02, y, z - c * 0.02, ry),
      uv: "box",
      grime: 0.1,
      noAO: true,
    });
    // voussoirs (brick soldier ring) + keystone
    const N = 11,
      R = w / 2 + 0.16;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * PI;
      const p = P(Math.cos(a) * R, springY + Math.sin(a) * R, 0.06);
      b.add(
        opts.ring || "brick_nab_dk",
        new THREE.BoxGeometry(0.3, 0.46, 0.3),
        { m: PF.m4(p.x, p.y, p.z, ry, 0, a - HP), grime: 0.5 },
      );
    }
    if (opts.key) {
      const p = P(0, h + 0.18, 0.1);
      b.add(opts.key, new THREE.BoxGeometry(0.4, 0.6, 0.34), {
        m: PF.m4(p.x, p.y, p.z, ry),
        grime: 0.4,
      });
    }
    // mullions (steel sash) in the rectangle + fan bars in the arch
    if (opts.sash !== false) {
      for (const k of [-1, 0, 1]) {
        const p = P((k * w) / 4, 0, 0.03);
        b.box(
          "steel_win",
          p.x,
          y,
          p.z,
          0.06,
          springY + (w / 2) * Math.sqrt(1 - (k / 2) * (k / 2)),
          0.05,
          { ry, seg: false },
        );
      }
      for (let k = 1; k <= 3; k++) {
        const p = P(0, (springY * k) / 3.2, 0.03);
        b.box("steel_win", p.x, p.y, p.z, w, 0.05, 0.05, { ry, seg: false });
      }
    }
  }
  /** Segmental-arch industrial window: shallow brick arch lintel, stone sill, steel sash grid. */
  function segWindow(b, x, y, z, ry, w, h, pane) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    b.quad(pane, x + s * 0.01, y + h / 2, z + c * 0.01, w, h, {
      ry,
      uv: "box",
      grime: 0.1,
      noAO: true,
    });
    for (let k = 1; k < 4; k++) {
      const lx = -w / 2 + (k * w) / 4;
      b.box(
        "steel_win",
        x + lx * c + s * 0.04,
        y,
        z - lx * s + c * 0.04,
        0.05,
        h,
        0.05,
        { ry, seg: false },
      );
    }
    for (let k = 1; k < 3; k++)
      b.box(
        "steel_win",
        x + s * 0.04,
        y + (k * h) / 3,
        z + c * 0.04,
        w,
        0.05,
        0.05,
        { ry, seg: false },
      );
    // segmental arch lintel (shallow curve of soldier bricks)
    const N = 7,
      R = w * 0.9,
      rise = 0.28;
    for (let i = 0; i <= N; i++) {
      const t = i / N - 0.5,
        lx = t * (w + 0.3),
        ly = h + 0.12 + Math.cos(t * PI) * rise;
      b.box(
        "brick_nab_dk",
        x + lx * c + s * 0.05,
        y + ly - 0.2,
        z - lx * s + c * 0.05,
        (w + 0.3) / N + 0.02,
        0.4,
        0.22,
        { ry, rz: -t * 0.6, seg: false, grime: 0.4 },
      );
    }
    void R;
    b.box(
      "limestone",
      x + s * 0.1,
      y - 0.14,
      z + c * 0.1,
      w + 0.35,
      0.14,
      0.28,
      { ry, seg: false, grime: 0.5 },
    );
  }
  PF.archBay = archBay;
  PF.segWindow = segWindow;

  /** A full piered brick façade along one side. dir: outward normal ry. from a (along) to b. */
  function facade(b, side, a0, a1, fixed, floors, topY, opts) {
    opts = opts || {};
    const ry = { s: 0, n: PI, e: HP, w: -HP }[side];
    const along = side === "s" || side === "n" ? "x" : "z";
    const out = side === "s" || side === "e" ? 1 : -1;
    const bay = opts.bay || 4.3;
    const n = Math.max(1, Math.round((a1 - a0) / bay));
    const bw = (a1 - a0) / n;
    const r = PF.rng("fac" + side + a0 + fixed);
    const at = (t, o) =>
      along === "x" ? [t, fixed + out * o] : [fixed + out * o, t];
    // piers between bays (full height), with stone cappings at each string course
    for (let i = 0; i <= n; i++) {
      const t = a0 + i * bw;
      const [px, pz] = at(t, 0.2);
      b.box(
        "brick_nab",
        px,
        0.8,
        pz,
        along === "x" ? 0.8 : 0.4,
        topY - 0.8,
        along === "x" ? 0.4 : 0.8,
        { seg: false, grime: 0.6 },
      );
    }
    // granite water table
    {
      const [px, pz] = at((a0 + a1) / 2, 0.3);
      b.box(
        "granite_dark",
        px,
        0,
        pz,
        along === "x" ? a1 - a0 + 0.6 : 0.6,
        0.85,
        along === "x" ? 0.6 : a1 - a0 + 0.6,
        { seg: false, grime: 0.6 },
      );
    }
    // string courses
    for (const y of opts.courses || [NB.F[1], NB.F[2]]) {
      const [px, pz] = at((a0 + a1) / 2, 0.42);
      b.box(
        "limestone",
        px,
        y - 0.1,
        pz,
        along === "x" ? a1 - a0 + 0.3 : 0.25,
        0.28,
        along === "x" ? 0.25 : a1 - a0 + 0.3,
        { seg: false, grime: 0.5 },
      );
    }
    for (let i = 0; i < n; i++) {
      const t = a0 + (i + 0.5) * bw;
      // ground floor: big Romanesque arch (door/loading or window)
      const skip = opts.skipGround && opts.skipGround(t);
      if (!skip) {
        const [gx, gz] = at(t, 0.07);
        archBay(
          b,
          gx,
          0.85,
          gz,
          ry,
          Math.min(3.1, bw - 1.1),
          NB.F[1] - 0.85 + 0.9,
          { pane: r() < 0.3 ? "glass_broken" : "glass_dark", key: "limestone" },
        );
      }
      // upper floors: segmental windows, top floor round arches
      for (let f = 1; f < floors; f++) {
        const y = NB.F[f] + (f === 1 ? 1.0 : 0.8);
        if (opts.skipUpper && opts.skipUpper(t, f)) continue;
        const [wx, wz] = at(t, 0.07);
        const roll = r();
        const pane =
          roll < 0.28 ? "glass_broken" : roll < 0.34 ? "planks" : "glass_dark";
        if (f === floors - 1)
          archBay(b, wx, y, wz, ry, Math.min(2.2, bw - 1.2), 2.5, {
            pane,
            ring: "brick_nab_dk",
          });
        else segWindow(b, wx, y, wz, ry, Math.min(2.4, bw - 1.1), 2.1, pane);
      }
    }
    // corbelled brick cornice: three stepped courses + dentils + parapet with stone coping
    for (let k = 0; k < 3; k++) {
      const [px, pz] = at((a0 + a1) / 2, 0.35 + k * 0.18);
      b.box(
        "brick_nab_dk",
        px,
        topY - 1.2 + k * 0.3,
        pz,
        along === "x" ? a1 - a0 + 0.4 + k * 0.3 : 0.3,
        0.3,
        along === "x" ? 0.3 : a1 - a0 + 0.4 + k * 0.3,
        { seg: false, grime: 0.6 },
      );
    }
    for (let t = a0 + 0.3; t < a1; t += 0.7) {
      const [px, pz] = at(t, 0.55);
      b.box("brick_nab_dk", px, topY - 1.55, pz, 0.25, 0.3, 0.25, {
        seg: false,
      });
    }
    {
      const [px, pz] = at((a0 + a1) / 2, 0.2);
      b.box(
        "limestone",
        px,
        topY + 0.9,
        pz,
        along === "x" ? a1 - a0 + 0.5 : 0.7,
        0.18,
        along === "x" ? 0.7 : a1 - a0 + 0.5,
        { seg: false },
      );
    }
  }

