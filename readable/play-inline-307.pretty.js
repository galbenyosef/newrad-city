/* src/poi_eastside/20_tudor_city.js */
/* =====================================================================
 * NEW RAD CITY — POI EASTSIDE · 20 Tudor City
 *
 * EXTERIOR (site x 292..330, z -179..-146): Fred French's 1927 Tudor-
 *   Gothic apartment complex on its raised stone TERRACE — rusticated
 *   retaining walls with blind arches, the grand stair up from the
 *   street, the terrace "greens" (iron fence, dead trees) now a raider
 *   camp. The tall TUDOR TOWER (brick, limestone quoins, string courses,
 *   crenellated parapets, octagonal corner turrets with spires, pointed
 *   stained-glass lobby windows, gabled slate penthouse) carries the
 *   famous red neon "TUDOR CITY" sign on its roof (walkable roof reached
 *   from the penthouse inside; a breaker relights the sign), the lower
 *   Windsor wing has the second sign and a water tower. Raider banners
 *   ("KNEEL"), skull pikes, scrap gate, cage, burning barrels.
 * INTERIOR (cell 'tudor_city', origin 8600,0,0) — raider den of the
 *   "Tudor Court":
 *   F1  the GREAT HALL (oak panelling, stone fireplace, hammer-beam
 *       trusses, stained glass, minstrels' gallery), the Tudor Room bar
 *       (chem lab), the mail & elevator hall (dead service elevator)
 *   F2  gallery + corridor, apartments 2A/2B (Scoop locked in 2B), the
 *       raider dorm 2C, the sealed Hollingsworth apartment 2D (skeleton
 *       dinner), the armoury 2E, two stairwells
 *   F3  THE COURT under the timber roof: rose window, throne dais, the
 *       Lord Protector's chamber, roof access, the service elevator
 *       back down to the hall (loop).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pe) return;
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
  function buildExterior() {
    const S = P.site("tc_ext", { grime: 0.5 });
    const b = S.b;
    const rn = P.rng("tc_ext");
    // ---------------- the terrace (retaining walls) ----------------
    const PX0 = 293,
      PX1 = 329,
      PZ0 = -177.5,
      PZ1 = -147.5,
      SX0 = 297.6,
      SX1 = 304.4,
      SZ = -153.15;
    b.box("granite_dark", PX0, 0, PZ0, PX1, TY, SZ, { segLen: 4 });
    b.box("granite_dark", PX0, 0, SZ, SX0, TY, PZ1, { segLen: 4 });
    b.box("granite_dark", SX1, 0, SZ, PX1, TY, PZ1, { segLen: 4 });
    S.col(PX0, 0, PZ0, PX1, TY, SZ);
    S.col(PX0, 0, SZ, SX0, TY, PZ1);
    S.col(SX1, 0, SZ, PX1, TY, PZ1);
    // rustication + blind arches on the street faces
    const FW = P.face(S, "w", PZ0, PZ1, PX0),
      FSo = P.face(S, "s", PX0, PX1, PZ1),
      FE = P.face(S, "e", PZ0, PZ1, PX1);
    for (const F of [FW, FSo, FE]) {
      for (let y = 0.6; y < TY; y += 0.6)
        F.box("granite", 0, F.len, y - 0.03, y + 0.03, -0.02, 0.03, {
          seg: false,
          grime: 0.8,
        });
      F.box("limestone", -0.2, F.len + 0.2, TY - 0.35, TY, 0, 0.35, {
        seg: false,
      });
      for (let u = 3; u < F.len - 2; u += 4.2) {
        if (F === FSo && u + PX0 > SX0 - 1.5 && u + PX0 < SX1 + 1.5) continue;
        F.box("granite_dark", u - 1.2, u + 1.2, 0, 2.2, -0.12, 0.0, {
          seg: false,
        });
        F.arch("limestone", u, 2.2, 1.2, 0.22, 0, 0.12);
        F.halfDisc("granite_dark", u, 2.2, 1.2, -0.1);
      }
    }
    // stone balustrade along the terrace edges (south + west) and the stair cheeks
    const bal = (pts) =>
      S.rail("limestone", pts, TY, 1.0, {
        baluster: true,
        r: 0.09,
        step: 0.32,
      });
    bal([
      [PX0 + 0.2, SZ + 5.5],
      [PX0 + 0.2, -165.2],
    ]);
    bal([
      [PX0 + 0.2, PZ1 - 0.2],
      [SX0 - 0.1, PZ1 - 0.2],
    ]);
    bal([
      [SX1 + 0.1, PZ1 - 0.2],
      [AX0 - 0.5, PZ1 - 0.2],
    ]);
    // the grand stair up from the street
    S.stairs(
      "granite",
      (SX0 + SX1) / 2,
      PZ1 + 0.02,
      "n",
      SX1 - SX0 - 0.2,
      0,
      TY,
      { nosing: "limestone" },
    );
    for (const x of [SX0 + 0.05, SX1 - 0.05]) {
      b.box("limestone", x - 0.25, 0, SZ, x + 0.25, TY + 1.0, PZ1, {
        seg: false,
      });
      S.col(x - 0.25, 0, SZ, x + 0.25, TY + 1.0, PZ1, { walkable: false });
      b.cyl("limestone", x, TY + 1.0, SZ + 0.2, 0.3, 0.3, 0.3, 8);
      b.sphere("limestone", x, TY + 1.55, SZ + 0.2, 0.25, { ws: 8, hs: 6 });
    }
    // lamp posts at the stair head (one still burning)
    for (const [x, lit] of [
      [SX0 - 0.8, true],
      [SX1 + 0.8, false],
    ]) {
      b.cyl("iron", x, TY, SZ - 0.6, 0.08, 0.12, 3.6, 6);
      b.cyl(
        lit ? "lamp_dim" : "glass_dark",
        x,
        TY + 3.6,
        SZ - 0.6,
        0.18,
        0.12,
        0.4,
        6,
      );
      b.cyl("iron", x, TY + 4.0, SZ - 0.6, 0.02, 0.24, 0.3, 6);
      if (lit) S.glow(x, TY + 3.8, SZ - 0.6, 0xffc880, 1.4, { flicker: 0.3 });
    }
    // ---------------- the greens (court) ----------------
    b.box("dirt", PX0 + 0.3, TY, SZ + 0.2, AX0 - 0.3, TY + 0.06, BZ1 - 0.3, {
      segLen: 4,
      noAO: true,
    });
    b.box("grass", 296, TY + 0.06, -163.5, 310.5, TY + 0.1, -157.5, {
      segLen: 4,
      noAO: true,
    });
    S.rail(
      "iron",
      [
        [296, -163.5],
        [310.5, -163.5],
        [310.5, -157.5],
        [296, -157.5],
        [296, -163.5],
      ],
      TY + 0.06,
      0.9,
      { r: 0.02, step: 0.18, col: true },
    );
    for (const [tx, tz] of [
      [299, -161],
      [307, -160],
    ]) {
      b.cyl("bark", tx, TY, tz, 0.16, 0.26, 4.5, 7);
      for (let i = 0; i < 6; i++) {
        const a = rn() * TAU,
          L = 1.2 + rn() * 1.6;
        b.rod(
          "bark",
          [tx, TY + 2.5 + rn() * 1.8, tz],
          [tx + Math.cos(a) * L, TY + 4 + rn() * 1.8, tz + Math.sin(a) * L],
          0.06,
          4,
          { rTop: 0.02 },
        );
      }
    }
    // raider camp on the greens: lean-to tarps, fire, mattresses, tires
    for (const [x, z, ry] of [
      [295.5, -155.8, 0.3],
      [308.5, -154.8, -0.4],
    ]) {
      const M = P.m4(x, TY, z, ry);
      b.geo(
        "fabric",
        new THREE.BoxGeometry(3.0, 0.04, 2.4)
          .rotateX(0.55)
          .translate(0, 1.35, 0),
        M,
        { grime: 0.7 },
      );
      for (const s of [-1, 1])
        b.geo(
          "wood_rotten",
          new THREE.CylinderGeometry(0.04, 0.05, 2.2, 5).translate(
            s * 1.4,
            1.1,
            -0.9,
          ),
          M,
        );
      E.mattress(b, x, TY + 0.06, z, ry);
    }
    S.prop("campfire", 302.2, TY + 0.06, -156.8, 0, { spit: true });
    S.prop("barrel", 311.2, TY + 0.06, -150.2, 0, { burning: true });
    S.prop("barrel", 294.2, TY + 0.06, -164.2, 0, { burning: true });
    for (let i = 0; i < 4; i++)
      b.torus(
        "rubber",
        304 + i * 0.3,
        TY + 0.14 + i * 0.22,
        -150.5,
        0.34,
        0.12,
        TAU,
        { rx: HP, ts: 12, rs: 6 },
      );
    // scrap gate across the stair head + skull pikes
    for (let i = 0; i < 5; i++)
      b.box(
        i % 2 ? "corrugated" : "rust",
        SX0 + i * 1.36,
        TY,
        SZ - 0.9,
        SX0 + i * 1.36 + 1.3,
        TY + 2.2 + (i % 3) * 0.3,
        SZ - 0.8,
        { seg: false, rz: (rn() - 0.5) * 0.08, grime: 0.8 },
      );
    b.box("rust", SX0 + 2.1, TY, SZ - 1.0, SX0 + 4.7, TY + 0.1, SZ - 0.7, {
      seg: false,
    });
    // (the gate stands half open — the middle panels are pushed aside)
    for (const x of [SX0 - 0.6, SX1 + 0.6, 296, 309])
      E.pike(b, x, TY, SZ - 1.4 - (x > 305 ? 0.3 : 0), 2.4);
    E.cage(b, 293.8, TY + 5.2, -151, { bones: true, chain: 0.4 });
    b.rod("rust", [293.2, TY, -151], [293.2, TY + 5.3, -151], 0.07, 5);
    b.rod("rust", [293.2, TY + 5.25, -151], [293.9, TY + 5.25, -151], 0.05, 4);
    const gsign = P.texMat(
      "tc_gsign",
      P.signTex(
        "tc_gsign",
        ["THE TUDOR COURT", "KNEEL OR BLEED"],
        "raider",
        512,
        192,
        { fg: "#d02a1e" },
      ),
      { transparent: true },
    );
    b.quad(gsign, (SX0 + SX1) / 2, TY + 1.7, SZ - 0.76, 3.6, 1.35, { ry: 0 });
    const ssign = P.texMat(
      "tc_ssign",
      P.signTex(
        "tc_ssign",
        ["TOLL: 20 SCRIP", "OR YOUR TEETH"],
        "raider",
        512,
        192,
        { fg: "#e8d8b0" },
      ),
      { transparent: true },
    );
    b.quad(ssign, SX1 + 1.8, 2.2, PZ1 + 0.02, 2.2, 0.85, { ry: 0 });
    // ---------------- Windsor wing (B) ----------------
    b.box("tudor_brick", BX0, TY, BZ0, BX1, BTOP, BZ1, { segLen: 6 });
    S.col(BX0, TY, BZ0, BX1, BTOP + 0.9, BZ1);
    tudorFace(S, "s", BX0, BX1, BZ1, TY, BTOP, {
      courses: [TY + 3.4, TY + 12.9, BTOP - 3.2],
      winStart: TY + 4.4,
    });
    tudorFace(S, "w", BZ0, BZ1, BX0, TY, BTOP, {
      courses: [TY + 3.4, TY + 12.9, BTOP - 3.2],
    });
    tudorFace(S, "n", BX0, BX1, BZ0, TY, BTOP, {
      courses: [TY + 3.4, TY + 12.9, BTOP - 3.2],
    });
    // ground-floor pointed windows on the court side
    const FBs = P.face(S, "s", BX0, BX1, BZ1);
    for (let u = 2.4; u < FBs.len - 1.5; u += 3.2)
      pointedWindow(FBs, u, TY + 0.6, 1.2, 2.6, {
        glass: "stained",
        rise: 0.7,
      });
    // the second (smaller) TUDOR CITY sign on the wing roof, facing south
    const neon2 = P.texMat("tc_neon2", P.neonLetterTex("TUDOR CITY", [2, 7]), {
      emissive: 1.6,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
    });
    for (let i = 0; i < 6; i++) {
      const x = 296 + i * 3;
      b.rod(
        "iron",
        [x, BTOP + 0.9, BZ1 - 1.2],
        [x, BTOP + 4.6, BZ1 - 1.2],
        0.04,
        4,
      );
      b.rod(
        "iron",
        [x, BTOP + 0.9, BZ1 - 2.8],
        [x, BTOP + 4.6, BZ1 - 1.25],
        0.03,
        3,
      );
    }
    b.box(
      "iron",
      295.5,
      BTOP + 1.6,
      BZ1 - 1.26,
      311.5,
      BTOP + 1.7,
      BZ1 - 1.14,
      { seg: false },
    );
    b.box(
      "iron",
      295.5,
      BTOP + 4.4,
      BZ1 - 1.26,
      311.5,
      BTOP + 4.5,
      BZ1 - 1.14,
      { seg: false },
    );
    b.quad(neon2, 303.5, BTOP + 3.05, BZ1 - 1.1, 16, 3.0, { ry: 0 });
    E.waterTower(b, 298, BTOP + 0.9, -171, 1.0);
    for (const [x, z] of [
      [306, -172],
      [309, -169.5],
    ]) {
      b.box(
        "tudor_brick",
        x - 0.6,
        BTOP,
        z - 0.9,
        x + 0.6,
        BTOP + 3.2,
        z + 0.9,
        { seg: false },
      );
      b.box(
        "limestone",
        x - 0.7,
        BTOP + 3.2,
        z - 1.0,
        x + 0.7,
        BTOP + 3.4,
        z + 1.0,
        { seg: false },
      );
    }
    // collapsed parapet corner (south-west) — rubble fan on the terrace below
    D.rubble(S, 294.6, TY + 0.06, -163.4, 1.8, {
      n: 10,
      slab: true,
      slabKey: "limestone",
      rebar: true,
      col: true,
    });
    // ---------------- Tudor Tower (A) ----------------
    b.box("tudor_brick", AX0, TY, AZ0, AX1, ATOP, AZ1, { segLen: 6 });
    S.col(AX0, TY, AZ0, AX1, ATOP, AZ1);
    const courses = [TY + 3.4, TY + 16.2, TY + 35.4, ATOP - 3.2];
    tudorFace(S, "s", AX0, AX1, AZ1, TY, ATOP, { courses, winStart: TY + 4.4 });
    tudorFace(S, "e", AZ0, AZ1, AX1, TY, ATOP, { courses });
    tudorFace(S, "n", AX0, AX1, AZ0, TY, ATOP, { courses });
    tudorFace(S, "w", AZ0, AZ1, AX0, TY, ATOP, {
      courses,
      winStart: TY + 4.4,
      skip: (u, y) =>
        (y < BTOP + 1 && u < 11.2) ||
        (y < TY + 10 && Math.abs(u - (ENT_Z - AZ0)) < 2.4),
    });
    // lobby: pointed stained-glass windows on the tower's south + west faces
    const FAs = P.face(S, "s", AX0, AX1, AZ1),
      FAw = P.face(S, "w", AZ0, AZ1, AX0);
    for (let u = 2.2; u < FAs.len - 1.5; u += 3.0)
      pointedWindow(FAs, u, TY + 0.7, 1.3, 3.0, {
        glass: "stained",
        rise: 0.8,
      });
    // the lobby portal: limestone Tudor arch, oak doors, heraldic panel, stained window above
    const eu = ENT_Z - AZ0; // u along the west face (from the north end)
    FAw.box("limestone", eu - 2.2, eu + 2.2, TY, TY + 5.6, 0, 0.6);
    const pa = archShape(2.4, 3.6, 0.9);
    FAw.S.b.extrude("wood_dark", pa, 0.08, FAw.mat(eu, TY, 0.6), { uv: "box" });
    const pr = archShape(3.2, 4.2, 1.1);
    pr.holes.push(archShape(2.4, 3.6, 0.9));
    FAw.S.b.extrude("limestone", pr, 0.3, FAw.mat(eu, TY - 0.001, 0.6));
    FAw.box("iron", eu - 0.05, eu + 0.05, TY + 0.1, TY + 3.1, 0.66, 0.72, {
      seg: false,
    });
    for (const s of [-1, 1])
      FAw.box(
        "iron",
        eu + s * 0.35 - 0.08,
        eu + s * 0.35 + 0.08,
        TY + 1.3,
        TY + 1.5,
        0.66,
        0.74,
        { seg: false },
      );
    pointedWindow(FAw, eu, TY + 6.2, 2.0, 3.4, {
      glass: "stained",
      rise: 1.0,
      d: 0.02,
    });
    const crest = P.texMat(
      "tc_crest",
      P.signTex("tc_crest", ["TUDOR", "TOWER"], "engraved", 256, 128, {
        bg: "#c8bca4",
      }),
      { rough: 0.9 },
    );
    FAw.quad(crest, eu, TY + 4.9, 1.8, 0.8, 0.62);
    S.glow(AX0 - 1.2, TY + 3.0, ENT_Z, 0xffc070, 1.6, { flicker: 0.2 });
    // raider banners ("KNEEL") on the tower
    for (const [u, y] of [
      [eu - 4.5, TY + 9],
      [eu + 3.6, TY + 12],
      [eu - 6.0, TY + 22],
    ]) {
      const bgeo = new THREE.PlaneGeometry(2.2, 4.4, 1, 6);
      {
        const p = bgeo.attributes.position;
        for (let v = 0; v < p.count; v++)
          p.setZ(v, Math.sin(p.getY(v) * 1.3 + u) * 0.08);
      }
      FAw.S.b.geo("tapestry", bgeo, FAw.mat(u, y, 0.16), {
        uv: "keep",
        noAO: true,
      });
      FAw.box("wood_rotten", u - 1.3, u + 1.3, y + 2.2, y + 2.32, 0.05, 0.25, {
        seg: false,
      });
    }
    // corner turrets (NE / SE / SW) rising above the parapet
    turret(S, AX1 - 0.2, AZ1 - 0.2, ATOP - 18, ATOP + 5.2, 1.25);
    turret(S, AX1 - 0.2, AZ0 + 0.2, ATOP - 18, ATOP + 5.2, 1.25);
    turret(S, AX0 + 0.2, AZ1 - 0.2, ATOP - 18, ATOP + 5.2, 1.25);
    turret(S, BX0 + 0.2, BZ1 - 0.2, BTOP - 12, BTOP + 3.6, 1.0);
    // ---------------- the walkable tower roof + gabled penthouse ----------------
    b.box(
      "tar",
      AX0 + 0.2,
      ATOP - 0.05,
      AZ0 + 0.2,
      AX1 - 0.2,
      ATOP + 0.02,
      AZ1 - 0.2,
      { segLen: 4, noAO: true },
    );
    // parapet colliders (the visual crenellation comes from tudorFace)
    S.col(AX0, ATOP, AZ0, AX0 + 0.3, ATOP + 1.2, AZ1, { walkable: false });
    S.col(AX1 - 0.3, ATOP, AZ0, AX1, ATOP + 1.2, AZ1, { walkable: false });
    S.col(AX0, ATOP, AZ0, AX1, ATOP + 1.2, AZ0 + 0.3, { walkable: false });
    S.col(AX0, ATOP, AZ1 - 0.3, AX1, ATOP + 1.2, AZ1, { walkable: false });
    const PHX0 = 317,
      PHX1 = 325,
      PHZ0 = -173,
      PHZ1 = -163;
    b.box("tudor_brick", PHX0, ATOP, PHZ0, PHX1, ATOP + 3.4, PHZ1, {
      segLen: 3,
    });
    S.col(PHX0, ATOP, PHZ0, PHX1, ATOP + 3.4, PHZ1, { walkable: false });
    gableRoof(
      S,
      PHX0 - 0.3,
      PHZ0 - 0.3,
      PHX1 + 0.3,
      PHZ1 + 0.3,
      ATOP + 3.4,
      3.6,
      true,
    );
    const FP = P.face(S, "w", PHZ0, PHZ1, PHX0);
    FP.box("wood_dark", 4.1, 5.9, ATOP, ATOP + 2.4, 0, 0.08, { seg: false });
    FP.box("limestone", 3.9, 6.1, ATOP + 2.4, ATOP + 2.65, 0, 0.14, {
      seg: false,
    });
    for (const u of [1.6, 8.4])
      FP.window(u, ATOP + 1.0, 0.9, 1.5, {
        style: "dark",
        frame: "limestone",
        sill: "limestone",
        mull: true,
      });
    for (const [x, z] of [
      [326.4, -160.2],
      [313.6, -174.6],
    ]) {
      b.box(
        "tudor_brick",
        x - 0.7,
        ATOP,
        z - 0.7,
        x + 0.7,
        ATOP + 3.6,
        z + 0.7,
        { seg: false },
      );
      b.box(
        "limestone",
        x - 0.8,
        ATOP + 3.6,
        z - 0.8,
        x + 0.8,
        ATOP + 3.8,
        z + 0.8,
        { seg: false },
      );
      S.col(x - 0.7, ATOP, z - 0.7, x + 0.7, ATOP + 3.8, z + 0.7, {
        walkable: false,
      });
    }
    // roof clutter: raider lookout (sandbags + mattress), crates, the breaker box
    E.sandbags(S, 313.6, -160.2, 316.4, -160.2, ATOP, 3);
    E.mattress(b, 322.2, ATOP + 0.02, -160.6, HP);
    S.prop("footlocker", 326.4, ATOP, -170.5, -HP, {
      loot: "footlocker",
      name: "Lookout's Footlocker",
    });
    b.box("metal", 316.2, ATOP + 0.9, -175.7, 317.6, ATOP + 2.3, -175.5, {
      seg: false,
    });
    b.box(
      "paint_black",
      316.5,
      ATOP + 1.2,
      -175.5,
      317.3,
      ATOP + 2.0,
      -175.45,
      { seg: false, noAO: true },
    );
    TC.breakerPos = S.W(316.9, ATOP + 1.5, -175.2);
    b.rod(
      "iron",
      [316.9, ATOP + 2.3, -175.6],
      [313.4, ATOP + 3.5, -175.2],
      0.03,
      3,
    );
    // ---------------- THE SIGN: steel frame + neon letters (facing west) ----------------
    const SGX = 313.2,
      SGZ0 = -174.4,
      SGZ1 = -159.6,
      SGY0 = ATOP + 1.4,
      SGY1 = ATOP + 8.2;
    for (let z = SGZ0; z <= SGZ1 + 0.01; z += (SGZ1 - SGZ0) / 6) {
      b.rod("iron", [SGX, ATOP, z], [SGX, SGY1, z], 0.06, 4);
      b.rod("iron", [SGX + 2.2, ATOP, z], [SGX, SGY1 - 0.6, z], 0.045, 4);
      b.rod("iron", [SGX + 2.2, ATOP, z], [SGX, ATOP + 3.2, z], 0.035, 3);
    }
    for (const y of [SGY0, (SGY0 + SGY1) / 2, SGY1])
      b.box("iron", SGX - 0.05, y - 0.06, SGZ0, SGX + 0.05, y + 0.06, SGZ1, {
        seg: false,
      });
    S.col(SGX - 0.1, ATOP, SGZ0, SGX + 2.3, SGY1, SGZ1, { walkable: false });
    // two letter planes: the full "lit" sign and the half-dead one (80_content toggles them)
    const signGeo = () =>
      new THREE.PlaneGeometry(SGZ1 - SGZ0 + 0.6, SGY1 - SGY0 - 0.4);
    const mkSign = (key, tex) => {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: 1.8,
        transparent: true,
        alphaTest: 0.05,
        depthWrite: false,
        side: THREE.DoubleSide,
        color: 0xffffff,
      });
      const mesh = new THREE.Mesh(signGeo(), m);
      mesh.position.set(SGX - 0.12, (SGY0 + SGY1) / 2 + 0.2, (SGZ0 + SGZ1) / 2);
      mesh.rotation.y = -HP;
      mesh.name = key;
      mesh.renderOrder = 2;
      return mesh;
    };
    TC.signLit = mkSign("tc_sign_lit", P.neonLetterTex("TUDOR CITY", []));
    TC.signDim = mkSign(
      "tc_sign_dim",
      P.neonLetterTex("TUDOR CITY", [1, 2, 3, 7, 8]),
    );
    TC.signLit.visible = false;
    S._extra = [TC.signLit, TC.signDim];
    TC.signGlows = [];
    // lettering glow sprites (dim state uses the lit subset)
    TC.glowSpots = [];
    for (let i = 0; i < 10; i++) {
      const z = SGZ1 - 0.9 - (i * (SGZ1 - SGZ0 - 1.8)) / 9;
      TC.glowSpots.push({
        pos: S.W(SGX - 0.8, (SGY0 + SGY1) / 2, z),
        dead: [1, 2, 3, 7, 8].indexOf(i) >= 0,
      });
    }
    // anchors
    S.anchor("ext_entrance", AX0 - 2.4, TY, ENT_Z, HP);
    S.anchor("ext_stairs", (SX0 + SX1) / 2, 0, PZ1 + 3, PI);
    S.anchor("ext_roof", 315.2, ATOP, -166, HP);
    S.anchor("ext_breaker", 316.9, ATOP, -174.4, 0);
    S.anchor("ext_guard1", SX0 + 1.2, TY, SZ - 2.2, PI);
    S.anchor("ext_guard2", 309.6, TY, -157.6, PI);
    S.build({ shadow: true, lod: 320 });
    for (const o of S._extra) S.root.add(o);
    return {
      S,
      doorX: AX0,
      doorZ: ENT_Z,
      roofDoor: { x: PHX0 - 0.1, y: ATOP + 1.4, z: -168 },
    };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  const F2 = 5,
    F3 = 10;
  function buildInterior() {
    const O = P.I("tudor_city");
    const S = P.site("tc_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x5e564a,
      ambI: 0.42,
      interiorKey: "tudor_city",
    });
    const b = S.b;
    const rn = P.rng("tc_int");
    TC.S = S;
    // ================= F1: THE GREAT HALL =================
    const GX0 = -10,
      GX1 = 10,
      GZ0 = 0,
      GZ1 = 18;
    S.floor("slate", GX0, GZ0, GX1, GZ1, 0, { surface: "concrete" });
    // walls: oak panelling to 3.2 m, plaster above with timber studs
    S.wallX("wood_oak", GZ1, GX0 - 0.15, GX1 + 0.15, 0, 3.2, 0.3, [
      [-1.3, 1.3, 0, 3.2],
    ]);
    S.wallX("plaster_cream", GZ1, GX0 - 0.15, GX1 + 0.15, 3.2, F3, 0.3);
    S.wallX("wood_oak", 0, GX0, GX1, 0, F2, 0.3, [[-7.8, -4.2, 0, 3.0]]);
    S.wallZ("wood_oak", GX0, GZ0, GZ1, 0, 3.2, 0.3, [[6, 10, 0, 3.0]]);
    S.wallZ("plaster_cream", GX0, GZ0, GZ1, 3.2, F2, 0.3);
    S.wallZ("plaster_cream", GX0, GZ0, GZ1, F2, F3, 0.3, [[0.2, 2.8, 0, 2.6]]);
    S.wallZ("wood_oak", GX1, GZ0, GZ1, 0, 3.2, 0.3, [[6, 10, 0, 3.0]]);
    S.wallZ("plaster_cream", GX1, GZ0, GZ1, 3.2, F2, 0.3);
    S.wallZ("plaster_cream", GX1, GZ0, GZ1, F2, F3, 0.3, [[0.2, 2.8, 0, 2.6]]);
    for (const x of [GX0 + 0.16, GX1 - 0.16])
      for (let z = GZ0 + 1; z < GZ1; z += 2.2)
        b.box("wood_dark", x - 0.05, 3.2, z - 0.1, x + 0.05, F3, z + 0.1, {
          seg: false,
        });
    // ceiling beams + hammer-beam trusses (the F3 slab sits on them)
    S.ceil("wood_dark", GX0, GZ0, GX1, GZ1, F3 - 0.3);
    for (let z = 3.5; z < GZ1; z += 3.6) {
      b.box("wood_dark", GX0, F3 - 1.0, z - 0.2, GX1, F3 - 0.3, z + 0.2, {
        seg: false,
      });
      for (const s of [-1, 1]) {
        b.box(
          "wood_dark",
          s * 9.9 - 0.2,
          F3 - 2.6,
          z - 0.18,
          s * 9.9 + 0.2,
          F3 - 1.0,
          z + 0.18,
          { seg: false },
        );
        b.rod(
          "wood_dark",
          [s * 9.8, F3 - 2.6, z],
          [s * 7.2, F3 - 1.0, z],
          0.14,
          4,
          { square: true },
        );
        b.box(
          "wood_dark",
          Math.min(s * 9.9, s * 8.0),
          F3 - 2.75,
          z - 0.2,
          Math.max(s * 9.9, s * 8.0),
          F3 - 2.5,
          z + 0.2,
          { seg: false },
        );
        b.box(
          "wood_dark",
          s * 8.0 - 0.15,
          F3 - 3.1,
          z - 0.15,
          s * 8.0 + 0.15,
          F3 - 2.5,
          z + 0.15,
          { seg: false },
        );
      }
    }
    // the minstrels' gallery (F2 level along the north wall) with balustrade
    S.floor("wood", GX0, GZ0 - 0.2, GX1, 3.0, F2, { under: "wood_dark" });
    S.rail(
      "wood_dark",
      [
        [GX0 + 0.2, 3.0],
        [GX1 - 0.2, 3.0],
      ],
      F2,
      1.0,
      { baluster: true, r: 0.07, step: 0.28 },
    );
    for (const x of [-6, 0, 6]) {
      b.box("wood_dark", x - 0.2, 0, 2.8, x + 0.2, F2, 3.2, { seg: false });
      S.col(x - 0.2, 0, 2.8, x + 0.2, F2, 3.2, { walkable: false });
    }
    const tap = P.texMat(
      "tc_tap_lord",
      P.signTex(
        "tc_tap_lord",
        ["LONG LIVE", "THE LORD PROTECTOR"],
        "banner",
        512,
        768,
        { bg: "#5a1a18", fg: "#e0c070", top: 0.35 },
      ),
      { rough: 1 },
    );
    for (const x of [-8, 8]) {
      b.geo(
        "tapestry",
        new THREE.PlaneGeometry(1.6, 3.2),
        P.m4(x, F2 + 2.3, 0.2, 0),
        { uv: "keep", noAO: true },
      );
    }
    b.quad(tap, 0, F2 + 2.3, 0.2, 2.4, 3.6, { ry: 0 });
    // the great stone fireplace under the gallery
    b.box("limestone", -2.6, 0, 0.1, 2.6, 3.4, 1.1, { segLen: 1 });
    b.box("paint_black", -1.5, 0.05, 1.05, 1.5, 1.9, 1.12, {
      seg: false,
      noAO: true,
    });
    const fpa = archShape(3.0, 2.2, 0.6);
    fpa.holes.push(archShape(2.4, 1.9, 0.5));
    b.extrude("limestone", fpa, 0.2, P.m4(0, 0, 1.1, 0));
    b.box("limestone", -2.9, 3.4, 0.1, 2.9, 3.7, 1.4, { seg: false });
    S.col(-2.6, 0, 0, 2.6, 3.4, 1.1, { walkable: false });
    b.box("iron", -1.0, 0.1, 1.2, 1.0, 0.18, 1.8, { seg: false });
    for (let i = 0; i < 5; i++)
      b.rod(
        "wood_rotten",
        [-0.8 + i * 0.35, 0.2, 1.3],
        [-0.6 + i * 0.3, 0.3, 1.85],
        0.07,
        5,
      );
    b.geo(
      "fire",
      new THREE.ConeGeometry(0.5, 1.0, 6).translate(0, 0.7, 1.5),
      P.m4(0, 0, 0),
      { noAO: true },
    );
    S.light(0, 1.3, 2.4, 0xff9a40, 11, 1.5);
    S.glow(0, 0.8, 1.7, 0xff8a30, 1.8, { flicker: 0.5 });
    TC.firePos = S.W(0, 0.6, 1.6);
    // stained glass (south wall): two tall pointed windows lit from outside
    const FSg = P.face(S, "n", GX0, GX1, GZ1); // the south wall seen from inside faces north
    for (const u of [4, 16]) {
      const w = 2.2,
        h = 4.4;
      FSg.S.b.extrude(
        "stained",
        archShape(w, h, 1.1),
        0.04,
        FSg.mat(u, 1.0, 0.18),
        { uv: "keep", noAO: true, noBake: true },
      );
      const fr = archShape(w + 0.4, h + 0.2, 1.3);
      fr.holes.push(archShape(w, h, 1.1));
      FSg.S.b.extrude("limestone", fr, 0.2, FSg.mat(u, 1.0, 0.1));
      const [lx, lz] = FSg.pt(u, 1.2);
      S.light(lx, 3.5, lz, 0xffc890, 8, 0.8);
      S.glow(lx, 3.2, lz, 0xffb070, 2.6);
    }
    // entrance doors (oak, iron strap hinges)
    b.box("wood_dark", -1.3, 0, GZ1 - 0.06, 1.3, 3.2, GZ1 + 0.05, {
      seg: false,
    });
    for (const y of [0.6, 2.4])
      b.box("iron", -1.2, y, GZ1 - 0.1, 1.2, y + 0.1, GZ1 - 0.05, {
        seg: false,
      });
    // iron ring chandeliers (one lit, one fallen)
    b.rod("iron", [0, F3 - 1, 9], [0, F3 - 3.5, 9], 0.02, 3);
    b.torus("iron", 0, F3 - 3.5, 9, 1.4, 0.05, TAU, { rx: HP, ts: 24, rs: 4 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      D.candles(S, Math.cos(a) * 1.4, F3 - 3.45, 9 + Math.sin(a) * 1.4, 1, {
        r: i % 2 ? 0.1 : 3,
        i: i % 2 ? 0.01 : 0.5,
        size: 0.25,
      });
    }
    S.light(0, F3 - 4.2, 9, 0xffb868, 12, 0.9);
    b.torus("iron", 3.2, 0.1, 14.6, 1.4, 0.05, TAU, {
      rx: HP + 0.25,
      ts: 24,
      rs: 4,
    });
    b.rod("iron", [3.2, 0.3, 14.6], [4.4, 1.2, 13.4], 0.02, 3);
    // raider occupation: long table, mattresses, trophy wall, cage, chem junk
    D.table(b, -3.5, 0, 10, {
      rect: [1.2, 5.4],
      top: "wood_dark",
      leg: "wood_dark",
    });
    for (let i = 0; i < 4; i++) {
      D.chair(b, -4.5, 0, 8 + i * 1.3, HP, {
        seat: "velvet",
        toppled: i === 2,
      });
      D.chair(b, -2.5, 0, 8.5 + i * 1.3, -HP, { seat: "velvet" });
    }
    for (let i = 0; i < 6; i++)
      b.cyl(
        i % 2 ? "glass_dark" : "glass",
        -3.7 + (i % 2) * 0.4,
        0.75,
        8.2 + i * 0.8,
        0.04,
        0.045,
        0.26,
        6,
        { noAO: true },
      );
    D.candles(S, -3.5, 0.75, 10.2, 4, { r: 5 });
    for (let i = 0; i < 4; i++)
      E.mattress(b, 6.5 + (i % 2) * 1.4, 0, 8 + i * 2.2, 0.1 * i);
    for (let i = 0; i < 9; i++)
      E.pike(b, GX1 - 0.4, 0, 12.2 + i * 0.5, 1.6 + (i % 3) * 0.3);
    E.cage(b, -7.6, F2 - 0.2, 14.8, { bones: true, chain: 0.4 });
    D.rubble(S, -7.2, 0, 4.8, 1.2, { n: 6, key: "rubble" });
    D.papers(b, 2, 0.01, 12, 5, 16);
    const kneel = P.texMat(
      "tc_kneel",
      P.signTex("tc_kneel", ["KNEEL"], "raider", 512, 192, { fg: "#c42a1e" }),
      { transparent: true },
    );
    b.quad(kneel, 0, 2.2, GZ1 - 0.2, 3.0, 1.1, { ry: PI });
    // ================= F1 west: the Tudor Room (raider bar + chem lab) =================
    S.room({
      x0: -22,
      z0: 0,
      x1: -10,
      z1: 18,
      y: 0,
      h: 4.7,
      wall: "wood_oak",
      floor: "wood",
      ceil: false,
      skip: "e",
      trim: "wood_dark",
      holes: { n: [[-18, -16.6, 0, 2.4]] },
    });
    D.bar(b, -21, -14, 0, 4.2, 1.2, { wood: "wood_oak", top: "marble_dark" });
    S.col(-21, 0, 3.6, -14, 1.1, 4.25, { walkable: false });
    for (let i = 0; i < 5; i++) {
      b.cyl("iron", -20.2 + i * 1.3, 0, 5.0, 0.03, 0.2, 0.7, 6);
      b.cyl("leather", -20.2 + i * 1.3, 0.7, 5.0, 0.2, 0.2, 0.08, 10);
    }
    // pool table
    b.box("wood_dark", -18.4, 0, 10, -15.6, 0.8, 11.6, { seg: false });
    b.box("velvet", -18.25, 0.8, 10.15, -15.75, 0.82, 11.45, {
      seg: false,
      noAO: true,
    });
    S.col(-18.4, 0, 10, -15.6, 0.85, 11.6, { walkable: false });
    const dart = P.texMat(
      "tc_dart",
      P.signTex("tc_dart", ["THE LORD", "PROTECTOR"], "raider", 256, 256, {
        fg: "#ffffff",
      }),
      { transparent: true },
    );
    b.cyl("wood_dark", -21.85, 1.7, 14, 0.4, 0.4, 0.05, 16, { rz: HP });
    b.quad(dart, -21.8, 1.75, 14, 0.7, 0.7, { ry: HP });
    // chem lab corner
    D.table(b, -19.5, 0, 16.4, { rect: [2.6, 1.0], top: "metal", leg: "iron" });
    for (let i = 0; i < 7; i++)
      b.cyl(
        i % 3 ? "glass" : "lamp_green",
        -20.6 + i * 0.35,
        0.75,
        16.3 + (i % 2) * 0.2,
        0.05,
        0.07,
        0.18 + (i % 3) * 0.08,
        6,
        { noAO: true },
      );
    S.light(-19.5, 1.4, 16.4, 0x8aff7a, 4, 0.6);
    E.hangLamp(S, -17, 4.7, 7, {
      chain: 1.2,
      shade: "paint_red",
      color: 0xffa060,
    });
    E.hangLamp(S, -17, 4.7, 13, {
      chain: 1.2,
      shade: "paint_red",
      color: 0xffa060,
      lit: false,
    });
    for (let k = 0; k < 3; k++) {
      b.box("glass_dark", -21.85, 1.2, 3 + k * 5, -21.8, 3.4, 4.4 + k * 5, {
        seg: false,
      });
      for (let j = 0; j < 3; j++)
        b.box(
          "wood_rotten",
          -21.8,
          1.4 + j * 0.8,
          2.8 + k * 5,
          -21.7,
          1.7 + j * 0.8,
          4.6 + k * 5,
          { seg: false },
        );
    }
    // ================= F1 east: mail & elevator hall =================
    S.room({
      x0: 10,
      z0: 0,
      x1: 18,
      z1: 18,
      y: 0,
      h: 4.7,
      wall: "marble_cream",
      floor: "slate",
      ceil: false,
      skip: "w",
      trim: "wood_dark",
      holes: { n: [[11, 13, 0, 2.6]] },
    });
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 8; j++)
        b.box(
          (i + j) % 5 === 0 ? "paint_black" : "brass",
          17.82,
          0.9 + j * 0.28,
          10.4 + i * 0.36,
          17.86,
          1.14 + j * 0.28,
          10.72 + i * 0.36,
          { seg: false, noAO: true },
        );
    for (const z of [4.0, 7.0]) {
      b.box("brass", 17.7, 0, z - 1.0, 17.85, 3.1, z + 1.0, { seg: false });
      b.box(
        z === 4.0 ? "chrome" : "paint_black",
        17.66,
        0.02,
        z - 0.75,
        17.72,
        2.6,
        z + 0.75,
        { seg: false },
      );
    }
    D.label(
      b,
      "tc_svc",
      ["SERVICE", "ELEVATOR"],
      17.64,
      2.85,
      4.0,
      0.9,
      0.3,
      -HP,
      "brass",
    );
    TC.svcDoorLocal = { x: 17.2, y: 1.5, z: 4.0 };
    E.tube(S, 14, 4.7, 5, 0, { len: 2, drop: 0.2, r: 7, i: 0.6 });
    E.tube(S, 14, 4.7, 13, 0, { len: 2, drop: 0.2, lit: false });
    S.prop("skeleton", 12.4, 0, 15.5, 0.4, { pose: "curled" });
    // ================= F2 slab (everywhere except over the great hall) =================
    S.floor("wood", -22, -14, -10, 18, F2, { under: "plaster" }); // over the bar / 2A 2B / kitchen
    S.floor("wood", 10, -14, 18, 18, F2, { under: "plaster" }); // over the mail hall / 2C / stair 2 area
    S.floor("wood", -10, -14, 10, -6.6, F2, { under: "plaster" }); // 2D / landing / 2E
    S.floor("wood", -10, -6.6, -7.8, 0, F2, { under: "plaster" }); // corridor west of stair 1
    S.floor("wood", -4.2, -6.6, 10, 0, F2, { under: "plaster" }); // corridor east of stair 1
    S.rail(
      "wood_dark",
      [
        [-7.8, -6.4],
        [-7.8, -0.2],
        [-4.2, -0.2],
        [-4.2, -6.4],
      ],
      F2,
      1.0,
      { baluster: true, r: 0.06, step: 0.3 },
    );
    // ================= F1 north strip + stair 1 =================
    S.floor("slate", -22, -14, 18, 0, 0);
    S.wallX("plaster_cream", -14, -22, 18, 0, F3, 0.3);
    S.wallX("wood_oak", 0, -22, -10, F2, F2 + 4.6, 0.3, [
      [-17.2, -15.8, 0, 2.3],
    ]);
    S.wallZ("plaster_cream", -22, -14, 0, 0, F3, 0.3);
    S.wallZ("plaster_cream", 18, -14, 0, 0, F3, 0.3);
    S.wallZ("plaster_cream", -22, 0, 18, F2, F3, 0.3);
    S.wallZ("plaster_cream", 18, 0, 18, F2, F3, 0.3);
    S.wallX("plaster_cream", 18, -22, -10, F2, F3, 0.3);
    S.wallX("plaster_cream", 18, 10, 18, F2, F3, 0.3);
    // F1 north strip rooms: kitchen (w), stair 1 hall, boiler (e)
    S.wallZ("plaster_ruin", -9, -14, 0, 0, F2, 0.25, [[-3, -1, 0, 2.4]]);
    S.wallZ("plaster_ruin", 0, -14, 0, 0, F2, 0.25, [[-3, -1, 0, 2.4]]);
    S.stairs("wood_dark", -6, -0.3, "n", 3.5, 0, F2, {
      rail: "wood_dark",
      nosing: "brass",
    });
    E.hangLamp(S, -2, F2, -8, { chain: 0.6, color: 0xffc070, r: 6 });
    // boiler room (x 0..18 z -14..0): the building's dead boiler + generator
    b.cyl("rust", 8, 0, -8, 1.8, 1.8, 4.2, 16, { rz: 0 });
    b.cyl("rust", 8, 4.2, -8, 1.4, 1.8, 0.6, 16);
    for (let i = 0; i < 3; i++)
      b.rod(
        "rust",
        [8 + (i - 1) * 0.8, 4.4, -8],
        [8 + (i - 1) * 0.8, F2, -8 + i],
        0.18,
        8,
      );
    S.col(6.2, 0, -9.8, 9.8, 4.8, -6.2, { walkable: false });
    S.prop("workbench", 14.5, 0, -13.2, 0);
    S.prop("toolbox", 16.2, 0.95, -13.3, 0, { loot: "toolbox" });
    E.hangLamp(S, 12, F2, -6, {
      chain: 0.8,
      shade: "metal",
      color: 0xffb060,
      i: 0.7,
    });
    // kitchen (x -22..-6 z -14..0): raider meat locker
    b.box("metal", -21.6, 0, -13.6, -14, 0.9, -12.6, { seg: false });
    b.box("marble", -21.6, 0.9, -13.6, -14, 0.96, -12.6, {
      seg: false,
      noAO: true,
    });
    S.col(-21.6, 0, -13.6, -14, 0.96, -12.6, { walkable: false });
    for (let i = 0; i < 5; i++) {
      const x = -20.5 + i * 1.4;
      b.rod("iron", [x, F2 - 0.2, -11], [x, F2 - 1.2, -11], 0.01, 3);
      b.box("gore", x - 0.2, F2 - 2.4, -11.15, x + 0.2, F2 - 1.2, -10.85, {
        seg: false,
        noAO: true,
      });
    }
    S.prop("fridge", -12.5, 0, -13.4, 0, { loot: "fridge" });
    E.hangLamp(S, -17, F2, -7, {
      chain: 0.8,
      shade: "paint_white",
      color: 0xe8e0c8,
      i: 0.8,
    });
    TC.door2D = { x: -13.9, y: F2, z: -6.6 };
    // ================= F2: corridor, apartments =================
    S.ceil("plaster", -22, -14, -10, 18, F3 - 0.3);
    S.ceil("plaster", 10, -14, 18, 18, F3 - 0.3);
    S.ceil("plaster", -10, -14, 10, 0, F3 - 0.3);
    // corridor strip z -6..0 : walls between corridor and north apartments
    S.wallX("wallpaper_green", -6.6, -22, -9, F2, F3 - 0.3, 0.25, [
      [-14.6, -13.2, 0, 2.3],
    ]);
    S.wallX("wallpaper_green", -6.6, 0, 12, F2, F3 - 0.3, 0.25, [
      [4.2, 5.6, 0, 2.3],
    ]);
    S.wallZ("wallpaper_green", -9, -14, -6.6, F2, F3 - 0.3, 0.25);
    S.wallZ("wallpaper_green", 0, -14, -6.6, F2, F3 - 0.3, 0.25);
    S.wallZ("wallpaper_green", 12, -14, -6.6, F2, F3 - 0.3, 0.25);
    E.hangLamp(S, -16, F3 - 0.3, -3, {
      chain: 0.5,
      color: 0xffc880,
      r: 7,
      i: 0.7,
    });
    E.hangLamp(S, 6, F3 - 0.3, -3, {
      chain: 0.5,
      color: 0xffc880,
      r: 7,
      i: 0.7,
      lit: false,
    });
    D.rug(b, -20, -5, 16, -1, F2 + 0.012, "carpet_red");
    // 2A (x -22..-10, z 0..9) and 2B (z 9..18): door 2A→2B locked (Scoop)
    S.wallX("wallpaper_rose", 9, -22, -10, F2, F3 - 0.3, 0.25, [
      [-13.4, -12.2, 0, 2.3],
    ]);
    D.bed(b, -20.4, F2, 4, HP, { w: 1.5, cover: "velvet" });
    D.sofa(b, -14, F2, 7.6, PI, { fabric: "fabric" });
    D.table(b, -15.5, F2, 4.4, { r: 0.5, top: "wood", leg: "wood_dark" });
    E.mattress(b, -12, F2 + 0.01, 2.5, 0.5);
    S.prop("footlocker", -21.4, F2, 7.8, HP, { loot: "footlocker" });
    E.hangLamp(S, -16, F3 - 0.3, 4.5, { chain: 0.5, color: 0xffb070, i: 0.7 });
    // 2B — Scoop's cell: a chair, a bucket, a typewriter the raiders gave him "to write the decree"
    D.chair(b, -17, F2, 13, 0, { seat: "wood", wood: "wood" });
    E.typewriter(b, -17, F2 + 0.77, 14.0, PI);
    D.table(b, -17, F2, 14.0, { rect: [1.2, 0.7], top: "wood", leg: "wood" });
    D.papers(b, -16, F2 + 0.01, 13, 2.5, 18);
    E.hangLamp(S, -16, F3 - 0.3, 13, { chain: 0.8, color: 0xffd0a0, i: 0.6 });
    b.box("glass_dark", -21.85, F2 + 1.2, 11, -21.8, F2 + 3.2, 16, {
      seg: false,
    });
    // the locked door (visual + collider; 80_content removes it on unlock)
    TC.cellDoor = { local: { x: -12.8, y: F2, z: 9 } };
    // 2C raider dorm (x 10..18, z 0..18) — reached from the gallery/corridor through a door at z=0
    S.wallX("wallpaper_green", 0, 10, 18, F2, F3 - 0.3, 0.25, [
      [13.4, 14.8, 0, 2.3],
    ]);
    for (let i = 0; i < 4; i++)
      E.mattress(
        b,
        12.2 + (i % 2) * 3.6,
        F2 + 0.01,
        4 + Math.floor(i / 2) * 5,
        0.2 * i,
      );
    S.prop("locker", 17.5, F2, 9, -HP, { count: 2, loot: "raider" });
    S.prop("barrel", 14, F2, 16.2, 0, { burning: true });
    S.light(14, F2 + 1.5, 16.2, 0xff9a40, 8, 1.0);
    b.box("glass_dark", 17.85, F2 + 1.2, 3, 17.9, F2 + 3.2, 7, { seg: false });
    // 2D the sealed Hollingsworth apartment (x -22..-6, z -14..-6.6): skeleton dinner, locked door
    D.table(b, -15, F2, -10.4, {
      rect: [2.6, 1.2],
      top: "wood_oak",
      leg: "wood_dark",
      cloth: "fabric_white",
    });
    for (const [x, z, r] of [
      [-16.2, -11.4, 0],
      [-13.8, -11.4, 0],
      [-16.2, -9.4, PI],
      [-13.8, -9.4, PI],
    ])
      D.chair(b, x, F2, z, r, { seat: "velvet" });
    for (let i = 0; i < 4; i++)
      b.cyl(
        "paint_white",
        -16 + i * 0.7,
        F2 + 0.76,
        -10.4 + (i % 2 ? 0.3 : -0.3),
        0.14,
        0.12,
        0.03,
        10,
        { noAO: true },
      );
    D.candles(S, -15, F2 + 0.76, -10.4, 3, { r: 4, i: 0.5 });
    D.bookcase(b, -21.6, F2, -10, HP, { w: 1.8 });
    D.fireplace(b, S, -9.4, F2, -10, -HP, { key: "marble" });
    const fam = P.texMat(
      "tc_family",
      P.signTex(
        "tc_family",
        ["THE HOLLINGSWORTHS", "CHRISTMAS 1966"],
        "label",
        512,
        384,
      ),
      { rough: 0.8 },
    );
    b.quad(fam, -18, F2 + 2.2, -13.8, 1.1, 0.8, { ry: 0 });
    // 2E armoury (x 0..12, z -14..-6.2)
    for (let i = 0; i < 3; i++)
      S.prop("ammo_box", 2 + i * 1.3, F2, -13.3, 0, {
        loot: "ammo_box",
        large: i === 1,
      });
    b.box("wood_rotten", 7, F2, -13.8, 11.6, F2 + 2.2, -13.4, { seg: false });
    for (let i = 0; i < 6; i++)
      b.rod(
        "rust",
        [7.4 + i * 0.7, F2 + 0.3, -13.3],
        [7.5 + i * 0.7, F2 + 1.8, -13.5],
        0.04,
        4,
      );
    S.prop("workbench", 3.5, F2, -7.2, PI);
    E.hangLamp(S, 6, F3 - 0.3, -10, {
      chain: 0.6,
      shade: "metal",
      color: 0xffc070,
      i: 0.8,
    });
    // stair 2 (east): F2 → F3, climbing north from z -6.4
    S.stairs("wood_dark", 15, -6.4, "n", 3.6, F2, F3, {
      rail: "wood_dark",
      nosing: "brass",
    });
    S.wallX("plaster_cream", -6.6, 12, 18, F2, F3 - 0.3, 0.25, [
      [13.2, 16.8, 0, 3.4],
    ]);
    // ================= F3: THE COURT (under the timber roof) =================
    S.floor("parquet", -22, -14, 18, -12.9, F3, { under: "wood_dark" });
    S.floor("parquet", -22, -12.9, 13.2, 18, F3, { under: "wood_dark" });
    S.floor("parquet", 16.8, -12.9, 18, 18, F3, { under: "wood_dark" });
    S.floor("parquet", 13.2, -6.5, 16.8, 18, F3, { under: "wood_dark" });
    S.rail(
      "wood_dark",
      [
        [13.2, -12.9],
        [13.2, -6.5],
        [16.8, -6.5],
        [16.8, -12.9],
      ],
      F3,
      1.0,
      { baluster: true, r: 0.06, step: 0.3 },
    );
    // pitched timber roof: purlins + trusses, slate underside
    const RY = F3 + 4.4,
      RH = 3.6;
    for (let x = -21; x <= 17; x += 3.8) {
      for (const s of [-1, 1])
        b.rod("wood_dark", [x, RY, s * 16 + 2], [x, RY + RH, 2], 0.16, 4, {
          square: true,
        });
      b.box("wood_dark", x - 0.18, RY - 0.3, -14, x + 0.18, RY, 18, {
        seg: false,
      });
      b.rod("wood_dark", [x, RY, 2], [x, RY + RH, 2], 0.1, 4, { square: true });
      for (const s of [-1, 1]) {
        b.box(
          "wood_dark",
          x - 0.15,
          F3,
          s * 15.6 + 2 - 0.15,
          x + 0.15,
          RY,
          s * 15.6 + 2 + 0.15,
          { seg: false },
        );
      }
    }
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0);
      sh.lineTo(16.4, 0);
      sh.lineTo(16.4, 0.12);
      sh.lineTo(0, 0.12);
      const L = Math.hypot(16, RH),
        ang = Math.atan2(RH, 16);
      const g = new THREE.BoxGeometry(40, 0.14, L);
      b.geo(
        "slate",
        g,
        new THREE.Matrix4().compose(
          new THREE.Vector3(-2, RY + RH / 2, 2 + s * 8),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(s * ang, 0, 0)),
          new THREE.Vector3(1, 1, 1),
        ),
        { noAO: true, grime: 0.3 },
      );
      void sh;
    }
    S.wallX("plaster_cream", -14, -22, 18, F3, RY, 0.3);
    S.wallX("plaster_cream", 18, -22, 18, F3, RY, 0.3);
    S.wallZ("plaster_cream", -22, -14, 18, F3, RY, 0.3);
    S.wallZ("plaster_cream", 18, -14, 18, F3, RY, 0.3);
    // gable infill triangles (east + west)
    for (const x of [-22, 18]) {
      const gs = new THREE.Shape();
      gs.moveTo(-16, 0);
      gs.lineTo(16, 0);
      gs.lineTo(0, RH);
      gs.closePath();
      b.extrude("plaster_cream", gs, 0.3, P.m4(x - 0.15, RY, 2, HP));
    }
    // the rose window (south wall) — stained glass, lit from outside
    const RWY = F3 + 2.3;
    b.cyl("stained", -2, RWY - 0.03, 17.8, 1.9, 1.9, 0.06, 32, {
      rx: HP,
      uv: "keep",
      noAO: true,
      noBake: true,
    });
    b.torus("limestone", -2, RWY, 17.75, 2.0, 0.16, TAU, { ts: 32, rs: 6 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      b.rod(
        "limestone",
        [-2, RWY, 17.72],
        [-2 + Math.cos(a) * 1.9, RWY + Math.sin(a) * 1.9, 17.72],
        0.045,
        4,
      );
    }
    b.cyl("limestone", -2, RWY - 0.03, 17.7, 0.35, 0.35, 0.1, 12, { rx: HP });
    S.light(-2, RWY, 16.2, 0xffb890, 12, 1.0);
    S.glow(-2, RWY, 17.4, 0xffa070, 3.4);
    // the throne dais (north, centre) + banners + trophy heap
    b.box("marble_dark", -4, F3, -13.9, 4, F3 + 0.3, -10.6, { seg: false });
    b.box("marble_dark", -3, F3 + 0.3, -13.9, 3, F3 + 0.6, -11.6, {
      seg: false,
    });
    S.col(-4, F3, -13.9, 4, F3 + 0.3, -10.6);
    S.col(-3, F3 + 0.3, -13.9, 3, F3 + 0.6, -11.6);
    {
      const M = P.m4(0, F3 + 0.6, -13.0, 0);
      b.geo(
        "velvet",
        new THREE.BoxGeometry(1.2, 0.2, 0.9).translate(0, 0.55, 0),
        M,
        { noAO: true },
      );
      b.geo(
        "gold",
        new THREE.BoxGeometry(1.4, 0.5, 1.0).translate(0, 0.22, 0),
        M,
        { noAO: true },
      );
      b.geo(
        "gold",
        new THREE.BoxGeometry(1.4, 2.4, 0.2).translate(0, 1.4, -0.45),
        M,
        { noAO: true },
      );
      b.geo(
        "velvet",
        new THREE.BoxGeometry(1.1, 1.8, 0.05).translate(0, 1.4, -0.33),
        M,
        { noAO: true },
      );
      for (const s of [-1, 1]) {
        b.geo(
          "gold",
          new THREE.BoxGeometry(0.15, 0.6, 0.9).translate(s * 0.68, 0.8, 0),
          M,
          { noAO: true },
        );
        b.geo(
          "gold",
          new THREE.SphereGeometry(0.14, 6, 5).translate(s * 0.68, 2.7, -0.45),
          M,
          { noAO: true },
        );
      }
      b.geo(
        "gold",
        new THREE.ConeGeometry(0.25, 0.6, 5).translate(0, 2.9, -0.45),
        M,
        { noAO: true },
      );
      E.bones(b, 1.8, F3 + 0.6, -12.6, 1.0, 10);
    }
    for (const x of [-6, 6])
      b.geo(
        "tapestry",
        new THREE.PlaneGeometry(2.2, 4.2),
        P.m4(x, F3 + 3.0, -13.82, 0),
        { uv: "keep", noAO: true },
      );
    b.quad(tap, 0, F3 + 4.4, -13.82, 2.6, 3.6, { ry: 0 });
    for (const x of [-3.5, 3.5]) {
      b.cyl("iron", x, F3 + 0.3, -11, 0.04, 0.2, 1.6, 6);
      b.cyl("fire", x, F3 + 1.9, -11, 0.18, 0.08, 0.4, 6);
      S.light(x, F3 + 2.4, -11, 0xff9a40, 8, 1.1);
      S.glow(x, F3 + 2.1, -11, 0xff8a30, 1.0, { flicker: 0.5 });
    }
    // loot hoard + feast table
    D.table(b, 0, F3, 4, {
      rect: [1.6, 8],
      top: "wood_oak",
      leg: "wood_dark",
      cloth: "velvet",
    });
    for (let i = 0; i < 8; i++)
      D.chair(
        b,
        i % 2 ? 1.2 : -1.2,
        F3,
        0.8 + Math.floor(i / 2) * 2.1,
        i % 2 ? -HP : HP,
        { seat: "velvet", arms: true, toppled: i === 5 },
      );
    D.candles(S, 0, F3 + 0.76, 2, 4, { r: 6 });
    D.candles(S, 0, F3 + 0.76, 6, 3, { r: 6 });
    for (let i = 0; i < 6; i++)
      b.cyl(
        i % 2 ? "gold" : "chrome",
        -0.4 + (i % 3) * 0.4,
        F3 + 0.76,
        3 + i * 0.5,
        0.08,
        0.06,
        0.16,
        8,
        { noAO: true },
      );
    D.chandelier(S, 0, RY + 1.0, 4, 1.1, {
      tiers: 2,
      chain: 1.2,
      broken: true,
      color: 0xffc880,
      lr: 12,
      li: 0.9,
    });
    // the Lord Protector's chamber (west end, x -22..-14) behind an oak screen
    S.wallZ("wood_oak", -14, -14, 18, F3, F3 + 3.4, 0.25, [[1, 3, 0, 2.5]]);
    D.bed(b, -19.5, F3, 12, 0, {
      w: 1.9,
      posts: true,
      canopy: "velvet",
      cover: "velvet",
    });
    D.rug(b, -21.5, -4, -15, 8, F3 + 0.013, "carpet_red");
    E.desk(b, -18, F3, -8.5, PI, { w: 1.6, typewriter: false });
    D.chair(b, -18, F3, -9.4, 0, { seat: "velvet", arms: true });
    D.bookcase(b, -21.6, F3, -3, HP, { w: 2 });
    D.fireplace(b, S, -21.8, F3, 4, HP, { key: "limestone", lit: true });
    for (let i = 0; i < 3; i++)
      b.box(
        "newsprint",
        -20.8 + i * 0.1,
        F3 + i * 0.35,
        1.2,
        -20.2 + i * 0.1,
        F3 + 0.33 + i * 0.35,
        1.9,
        { seg: false },
      );
    E.hangLamp(S, -18, RY, -2, {
      chain: 2.2,
      shade: "paint_red",
      color: 0xffa060,
      r: 8,
    });
    // roof stair (ladder-stair up to the roof hatch, NW)
    b.box("wood_dark", -21.4, F3, -13.86, -20.0, F3 + 2.4, -13.8, {
      seg: false,
    });
    b.box("wood_oak", -21.6, F3 + 2.4, -13.9, -19.8, F3 + 2.6, -13.7, {
      seg: false,
    });
    for (const x of [-21.55, -19.85])
      b.box("wood_oak", x - 0.1, F3, -13.9, x + 0.1, F3 + 2.4, -13.7, {
        seg: false,
      });
    for (const y of [0.5, 1.9])
      b.box("iron", -21.3, F3 + y, -13.8, -20.1, F3 + y + 0.08, -13.76, {
        seg: false,
      });
    D.label(
      b,
      "tc_roof",
      ["ROOF"],
      -20.7,
      F3 + 2.85,
      -13.84,
      0.8,
      0.25,
      0,
      "raider",
    );
    TC.roofHatchLocal = { x: -20.7, y: F3 + 1.4, z: -13.4 };
    // service elevator (east) — the shortcut back to the hall
    b.box("brass", 17.7, F3, 3, 17.85, F3 + 3.1, 5, { seg: false });
    b.box("chrome", 17.66, F3 + 0.02, 3.25, 17.72, F3 + 2.6, 4.75, {
      seg: false,
    });
    D.label(
      b,
      "tc_svc3",
      ["SERVICE", "ELEVATOR"],
      17.64,
      F3 + 2.85,
      4.0,
      0.9,
      0.3,
      -HP,
      "brass",
    );
    TC.svcDoorTopLocal = { x: 17.2, y: F3 + 1.5, z: 4.0 };
    // court lights
    for (const [x, z] of [
      [8, -8],
      [8, 10],
      [-10, 10],
      [-10, -8],
    ])
      E.hangLamp(S, x, RY, z, {
        chain: 2.6,
        shade: "iron",
        color: 0xffb060,
        r: 9,
        i: 0.75,
      });
    // ================= props, pickups, terminals =================
    S.prop("terminal", -18, F3 + 0.765, -8.2, 0, {
      terminalId: "pe_tc_lord",
      mount: "bare",
    });
    S.prop("terminal", 16.8, 0, 12.5, -HP, {
      terminalId: "pe_tc_super",
      mount: "own_desk",
    });
    S.prop("safe", -21.4, F2, -7.4, HP, {
      locked: 0,
      lock: P.LOCKS.tc_wall_safe,
      name: "Hollingsworth Wall Safe",
      items: [
        ["scrip", 85],
        ["pe_tc_ring", 1],
        ["old_dollars", 6],
      ],
      wall: true,
    });
    S.prop("cash_register", -17.5, 1.12, 3.9, PI, { loot: "cash_register" });
    S.prop("scrip_stash", -20, F3, 15.8, 0, {
      loot: "raider_boss",
      name: "The Royal Treasury",
    });
    S.prop("footlocker", -15, F3, 15.6, PI, {
      loot: "raider",
      name: "Lord Protector's Chest",
      items: [["pe_tc_key_cell", 1]],
    });
    S.prop("first_aid", 17.85, F2 + 1.3, 12, -HP, { loot: "first_aid" });
    S.prop("ammo_box", 9.4, 0, 16.8, 0.2, { loot: "ammo_box" });
    S.prop("skeleton", -16.2, F2 + 0.45, -11.3, 0, { pose: "seated" });
    S.prop("skeleton", -13.8, F2 + 0.45, -9.5, PI, { pose: "seated" });
    S.prop("skeleton", -16.1, F2 + 0.45, -9.5, PI, { pose: "seated" });
    S.prop("skeleton", -20.2, F2 + 0.55, 4, 0, { pose: "lying" });
    S.prop("teddy_bear", -13.8, F2 + 0.5, -11.4, 0);
    S.pickup("pe_note_decree", 1, -3.4, 0.78, 11.2);
    S.pickup("pe_reel_hollingsworth", 1, -14.6, F2 + 0.78, -10.0);
    S.pickup("pe_note_scoop_notes", 1, -16.6, F2 + 0.78, 14.1);
    S.pickup("rush", 1, -20.1, 0.78, 16.5);
    S.pickup("rage", 1, -19.0, 0.78, 16.3);
    // ================= anchors =================
    S.anchor("entrance", 0, 0, 16.2, 0);
    S.anchor("boss", 0, F3 + 0.6, -11.8, PI);
    S.anchor("throne", 0, F3 + 0.6, -12.6, PI);
    S.anchor("scoop", -17.4, F2, 12.2, PI * 0.6);
    S.anchor("cell_door", -12.8, F2, 8.6, PI);
    S.anchor("spawn1", -4, 0, 12, 0);
    S.anchor("spawn2", 5, 0, 6, 0);
    S.anchor("spawn3", -16, 0, 8, 0);
    S.anchor("spawn4", 4, F2, -3, 0);
    S.anchor("spawn5", 14, F2, 10, 0);
    S.anchor("spawn6", 6, F3, 10, 0);
    S.anchor("loot1", -20, F3, 15.8, 0);
    S.anchor("loot2", -21.4, F2, -7.4, 0);
    S.anchor("loot3", 2, F2, -13.3, 0);
    S.anchor("roof_hatch", -20.7, F3, -11.5, PI);
    S.anchor("svc_top", 16.4, F3, 4.0, -HP);
    S.anchor("svc_bottom", 16.4, 0, 4.0, -HP);
    S.anchor("lord_desk", -18, F3, -9.4, PI);
    S.build({ interior: true });
    return S;
  }

  // ===================================================================
  // builder
  // ===================================================================
  P.addBuilder(
    "tudor_city",
    function () {
      const EX = buildExterior(),
        ES = EX.S;
      const I = buildInterior();
      const O = P.I("tudor_city");
      P.addInterior("tudor_city", I.root);
      TC.extRoot = ES.root;
      ES.door(
        EX.doorX - 0.2,
        TY + 1.6,
        EX.doorZ,
        "Tudor Tower",
        { x: O.x, y: O.y, z: O.z + 16.2, yaw: 0 },
        {
          id: "pe_tc_front",
          radius: 1.8,
          onEnter: () => P.safe("disc", () => G.discover("tudor_city")),
        },
      );
      I.door(
        0,
        1.5,
        17.7,
        "Tudor City Terrace",
        { x: EX.doorX - 2.4, y: TY, z: EX.doorZ, yaw: HP },
        { id: "pe_tc_front_in", verb: "Exit", radius: 1.8 },
      );
      // penthouse ⇄ the real roof (with the neon sign)
      I.door(
        TC.roofHatchLocal.x,
        TC.roofHatchLocal.y,
        TC.roofHatchLocal.z,
        "Roof (the Tudor City sign)",
        { x: 316.2, y: ATOP, z: -168, yaw: 0 },
        { id: "pe_tc_roof_in", verb: "Climb to", radius: 1.4 },
      );
      ES.door(
        EX.roofDoor.x,
        EX.roofDoor.y,
        EX.roofDoor.z,
        "Tudor Tower — Penthouse",
        { x: O.x - 20.7, y: O.y + F3, z: O.z - 12.2, yaw: PI },
        { id: "pe_tc_roof", radius: 1.4 },
      );
      P.register("tudor_city", {
        root: ES.root,
        interiorRoot: I.root,
        interiorKey: "tudor_city",
        anchors: Object.assign({}, ES.anchors, I.anchors),
      });
    },
    20,
  );
})();
