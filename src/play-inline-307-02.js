// play-inline-307 02 — rise
// Lines 33-277 of readable/play-inline-307.pretty.js (statement-aligned).
  const P = G._pe,
    D = P.dress,
    E = P.dress2;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const TC = (P.tc = P.tc || {});

  // ------------------------------------------------------------------
  // helpers
  // ------------------------------------------------------------------
  /** Tudor pointed (four-centred-ish) arch outline as a THREE.Shape, base at y=0. */
  function archShape(w, h, rise) {
    const s = new THREE.Shape(),
      hw = w / 2,
      sp = h - rise;
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, sp);
    s.quadraticCurveTo(hw, sp + rise * 0.7, 0, h);
    s.quadraticCurveTo(-hw, sp + rise * 0.7, -hw, sp);
    s.closePath();
    return s;
  }
  P.archShape = archShape;
  /** Pointed-arch window on facade F: glass (key) + stone frame ring. */
  function pointedWindow(F, u, y, w, h, o) {
    o = o || {};
    const rise = o.rise || w * 0.55,
      d = o.d || 0.03,
      ft = o.ft || 0.22;
    F.S.b.extrude(
      o.glass || "glass_dark",
      archShape(w, h, rise),
      0.04,
      F.mat(u, y, d - 0.04),
      { uv: "keep", noAO: true, grime: 0.1 },
    );
    const outer = archShape(w + ft * 2, h + ft, rise + ft * 0.5);
    outer.holes.push(archShape(w, h, rise));
    F.S.b.extrude(
      o.frame || "limestone",
      outer,
      o.fd || 0.18,
      F.mat(u, y - 0.001, d - 0.02),
      { grime: 0.3 },
    );
    if (o.mull !== false) {
      F.box(
        o.frame || "limestone",
        u - 0.05,
        u + 0.05,
        y,
        y + h - rise * 0.2,
        d,
        d + 0.08,
        { seg: false },
      );
      if (h > 2.4)
        F.box(
          o.frame || "limestone",
          u - w / 2,
          u + w / 2,
          y + (h - rise) * 0.55,
          y + (h - rise) * 0.55 + 0.08,
          d,
          d + 0.08,
          { seg: false },
        );
    }
    F.box(
      o.frame || "limestone",
      u - w / 2 - ft - 0.1,
      u + w / 2 + ft + 0.1,
      y - 0.16,
      y,
      d - 0.02,
      d + 0.26,
      { seg: false },
    );
  }
  /** Brick facade block face: windows per floor, quoins, string courses, crenellated parapet. */
  function tudorFace(S, side, a0, a1, c, y0, y1, o) {
    o = o || {};
    const F = P.face(S, side, a0, a1, c);
    const r = P.rng("tc" + side + a0 + c + y0);
    const bay = o.bay || 2.6,
      n = Math.max(1, Math.round(F.len / bay)),
      bw = F.len / n,
      fh = o.floorH || 3.2;
    const wy0 = o.winStart !== undefined ? o.winStart : y0 + 1.1;
    const skip = o.skip || (() => false);
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) * bw;
      for (let y = wy0, f = 0; y + 1.8 < y1 - 0.5; y += fh, f++) {
        if (skip(u, y)) continue;
        const q = r();
        const style =
          q < 0.07 ? "broken" : q < 0.13 && y < y0 + 12 ? "boarded" : "dark";
        F.window(u - 0.36, y, 0.62, 1.75, {
          style,
          frame: "limestone",
          sill: "limestone",
          hood: "flat",
          hoodKey: "limestone",
          mull: false,
          ft: 0.08,
          fd: 0.1,
        });
        F.window(u + 0.36, y, 0.62, 1.75, {
          style: r() < 0.08 ? "broken" : "dark",
          frame: "limestone",
          sill: "limestone",
          hood: "flat",
          hoodKey: "limestone",
          mull: false,
          ft: 0.08,
          fd: 0.1,
        });
      }
    }
    // quoins at both corners
    for (let y = y0, i = 0; y < y1 - 0.6; y += 0.62, i++) {
      const wq = i % 2 ? 0.55 : 0.95;
      F.box("limestone", -0.02, wq, y, y + 0.56, 0, 0.08, {
        seg: false,
        grime: 0.4,
      });
      F.box("limestone", F.len - wq, F.len + 0.02, y, y + 0.56, 0, 0.08, {
        seg: false,
        grime: 0.4,
      });
    }
    // string courses
    for (const yy of o.courses || [])
      F.box("limestone", -0.05, F.len + 0.05, yy, yy + 0.32, 0, 0.18, {
        seg: false,
      });
    // crenellated parapet
    if (o.parapet !== false) {
      F.box("tudor_brick", -0.05, F.len + 0.05, y1, y1 + 0.9, -0.15, 0.1, {
        seg: false,
      });
      F.box("limestone", -0.1, F.len + 0.1, y1 - 0.3, y1, 0, 0.3, {
        seg: false,
      });
      const m = Math.max(2, Math.round(F.len / 1.3));
      for (let i = 0; i <= m; i++) {
        const u = (i * F.len) / m;
        if (i % 2 === 0)
          F.box(
            "tudor_brick",
            u - 0.35,
            u + 0.35,
            y1 + 0.9,
            y1 + 1.5,
            -0.15,
            0.1,
            { seg: false },
          );
        F.box(
          "limestone",
          u - (i % 2 === 0 ? 0.42 : 0.3),
          u + (i % 2 === 0 ? 0.42 : 0.3),
          y1 + (i % 2 === 0 ? 1.5 : 0.9),
          y1 + (i % 2 === 0 ? 1.62 : 1.02),
          -0.2,
          0.16,
          { seg: false },
        );
      }
    }
    return F;
  }
  /** Octagonal corner turret with a slate spire and finial. */
  function turret(S, x, z, y0, y1, r) {
    const b = S.b;
    b.cyl("tudor_brick", x, y0, z, r, r, y1 - y0, 8, { hSeg: 4 });
    for (let y = y0 + 3; y < y1; y += 6)
      b.cyl("limestone", x, y, z, r + 0.08, r + 0.08, 0.25, 8);
    b.cyl("limestone", x, y1, z, r + 0.2, r + 0.1, 0.4, 8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + PI / 8;
      b.box(
        "glass_dark",
        x + Math.cos(a) * (r + 0.01) - 0.2,
        y1 - 2.4,
        z + Math.sin(a) * (r + 0.01) - 0.2,
        x + Math.cos(a) * (r + 0.01) + 0.2,
        y1 - 1.2,
        z + Math.sin(a) * (r + 0.01) + 0.2,
        { seg: false, ry: -a, noAO: true },
      );
    }
    b.cyl("slate", x, y1 + 0.4, z, 0.02, r + 0.25, r * 3.2, 8);
    b.cyl("brass", x, y1 + 0.4 + r * 3.2, z, 0.02, 0.05, 1.0, 5);
    b.sphere("brass", x, y1 + 0.5 + r * 3.2 + 0.6, z, 0.12, { ws: 6, hs: 4 });
    S.col(x - r, y0, z - r, x + r, y1 + 0.4, z + r, { walkable: false });
  }
  /** Gabled slate roof: ridge along z (when alongZ) over rect; brick gable ends with finials. */
  function gableRoof(S, x0, z0, x1, z1, y, h, alongZ) {
    const b = S.b;
    const W = alongZ ? x1 - x0 : z1 - z0,
      L = alongZ ? z1 - z0 : x1 - x0;
    const sh = new THREE.Shape();
    sh.moveTo(-W / 2 - 0.3, 0);
    sh.lineTo(W / 2 + 0.3, 0);
    sh.lineTo(0, h);
    sh.closePath();
    const m = alongZ
      ? P.m4((x0 + x1) / 2, y, z0 - 0.2, 0)
      : P.m4(x0 - 0.2, y, (z0 + z1) / 2, HP);
    b.extrude("slate", sh, L + 0.4, m, { uv: "box" });
    // brick gable ends (slightly proud) + finials
    const gs = new THREE.Shape();
    gs.moveTo(-W / 2, 0);
    gs.lineTo(W / 2, 0);
    gs.lineTo(0, h * 0.96);
    gs.closePath();
    for (const e of [0, 1]) {
      const mm = alongZ
        ? P.m4((x0 + x1) / 2, y, e ? z1 + 0.25 : z0 - 0.45, 0)
        : P.m4(e ? x1 + 0.25 : x0 - 0.45, y, (z0 + z1) / 2, HP);
      b.extrude("tudor_brick", gs, 0.2, mm, { uv: "box" });
      const fx = alongZ ? (x0 + x1) / 2 : e ? x1 + 0.35 : x0 - 0.35,
        fz = alongZ ? (e ? z1 + 0.35 : z0 - 0.35) : (z0 + z1) / 2;
      b.cyl("limestone", fx, y + h * 0.96 - 0.1, fz, 0.06, 0.14, 1.1, 6);
    }
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  const TY = 4.5; // terrace level
  const AX0 = 312,
    AX1 = 328,
    AZ0 = -176,
    AZ1 = -158,
    ATOP = 64; // Tudor Tower
  const BX0 = 293,
    BX1 = 312,
    BZ0 = -176,
    BZ1 = -165,
    BTOP = 40; // Windsor wing
  const ENT_Z = -161.5; // lobby door on the tower's west face
