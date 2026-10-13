/* src/poi_eastside/30_new_york_life.js */
/* =====================================================================
 * NEW RAD CITY — POI EASTSIDE · 30 The New York Life Building
 *
 * EXTERIOR (site x 210..270, z 2..33, front on 23rd Street): Cass
 *   Gilbert's 1928 limestone tower — the full-block base with its tall
 *   pointed-arch arcade, vertical limestone piers between dark window
 *   columns and gothic tracery spandrels, three setbacks with pinnacles,
 *   the square tower with corner pinnacles and an open gothic belvedere,
 *   and the famous GILDED PYRAMID roof with its lantern and finial —
 *   some of its gold tiles torn away, girders showing. ash bear den
 *   signs at the door: claw-scored bronze, bones, warnings.
 * INTERIOR (cell 'new_york_life', origin 8600,0,400) — the den:
 *   F1  the MARBLE LOBBY (gilded coffered ceiling, bronze elevator bank,
 *       chandeliers — one fallen, security desk), the Policy Vault and
 *       mail room off the west side, the grand stair hall (switchback)
 *   F2  (9.8) the actuarial floor (desks, adding machines, Meridian
 *       tabulators), records, the executive office, the boardroom; the
 *       COLLAPSE: a fallen floor slab ramps down into the lobby (one-way
 *       shortcut back to the entrance); service stair up
 *   F3  (16) the GILDED PYRAMID ATTIC: steel hip rafters and purlins,
 *       the back of the gold skin, daylight through missing tiles, the
 *       lantern shaft — and the ash bear nest (Old Gilt). Maintenance
 *       lift back down to the lobby.
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
  const NL = (P.nyl = P.nyl || {});

  /** Rectangular pyramid geometry (apex up), base centred at origin, half-widths hx/hz, height h. */
  function pyramidGeo(hx, hz, h, open) {
    const g = new THREE.ConeGeometry(Math.SQRT2, 1, 4, 1, !!open);
    g.rotateY(PI / 4);
    g.translate(0, 0.5, 0);
    g.scale(hx, h, hz);
    return g;
  }
  NL.pyramidGeo = pyramidGeo;

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  /** Gothic limestone facade: piers, window columns, tracery spandrels, pinnacled cornice. */
  function gothicFace(S, side, a0, a1, c, y0, y1, o) {
    o = o || {};
    const F = P.face(S, side, a0, a1, c);
    const r = P.rng("nyl" + side + a0 + c + y0);
    const bay = o.bay || 2.9,
      n = Math.max(2, Math.round(F.len / bay)),
      bw = F.len / n,
      fh = o.floorH || 3.4;
    const wy0 = o.winStart !== undefined ? o.winStart : y0 + 1.1;
    const skip = o.skip || (() => false);
    for (let k = 0; k <= n; k++) {
      const u = k * bw,
        corner = k === 0 || k === n,
        pw = corner ? 1.1 : 0.62;
      const ua = corner ? (k === 0 ? -0.3 : u - 0.8) : u - pw / 2,
        ub = corner ? (k === 0 ? 0.8 : u + 0.3) : u + pw / 2;
      const ya = o.pierFrom !== undefined ? Math.max(y0, o.pierFrom) : y0;
      F.box("limestone", ua, ub, ya, y1, 0, 0.4, { segLen: 6 });
      if (o.pinnacles !== false && !corner && k % 2 === 0) {
        const [px, pz] = F.pt(u, 0.2);
        S.b.cyl("limestone", px, y1 + 0.9, pz, 0.02, 0.28, 1.6, 4, {
          ry: PI / 4,
        });
      }
    }
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) * bw;
      for (let y = wy0, f = 0; y + 2.0 < y1 - 0.8; y += fh, f++) {
        if (skip(u, y)) continue;
        const q = r();
        F.box(
          q < 0.08
            ? "glass_broken"
            : q < 0.12 && y < 40
              ? "wood_rotten"
              : "glass_dark",
          u - bw * 0.3,
          u + bw * 0.3,
          y,
          y + 2.1,
          -0.01,
          0.05,
          { seg: false, noAO: true, grime: 0.15 },
        );
        // tracery spandrel panel under the window (darker stone, a small trefoil)
        F.box(
          "limestone_dark",
          u - bw * 0.3,
          u + bw * 0.3,
          y - fh + 2.1 + 0.1,
          y - 0.1,
          0.0,
          0.1,
          { seg: false, grime: 0.5 },
        );
      }
    }
    // cornice + parapet with gothic arcading
    F.box("limestone", -0.4, F.len + 0.4, y1 - 0.2, y1 + 0.35, 0, 0.7, {
      seg: false,
    });
    F.box("limestone", -0.3, F.len + 0.3, y1 + 0.35, y1 + 1.3, -0.1, 0.3, {
      seg: false,
    });
    for (let u = 0.6; u < F.len - 0.4; u += 1.2)
      F.box(
        "limestone_dark",
        u - 0.3,
        u + 0.3,
        y1 + 0.5,
        y1 + 1.1,
        0.26,
        0.32,
        { seg: false, noAO: true },
      );
    return F;
  }
  /** Block of the tower: core box + four gothic faces + collider + roof. */
  function towerBlock(S, x0, z0, x1, z1, y0, y1, o) {
    o = o || {};
    S.b.box("limestone_dark", x0, y0, z0, x1, y1, z1, { segLen: 8 });
    S.col(x0 - 0.4, y0, z0 - 0.4, x1 + 0.4, y1 + 1.3, z1 + 0.4);
    const oo = Object.assign({}, o);
    gothicFace(S, "s", x0, x1, z1, y0, y1, oo);
    gothicFace(S, "n", x0, x1, z0, y0, y1, oo);
    gothicFace(S, "e", z0, z1, x1, y0, y1, oo);
    gothicFace(S, "w", z0, z1, x0, y0, y1, oo);
    S.b.box(
      "tar",
      x0 + 0.2,
      y1 - 0.05,
      z0 + 0.2,
      x1 - 0.2,
      y1 + 0.05,
      z1 - 0.2,
      { segLen: 6, noAO: true },
    );
    // corner pinnacles
    if (o.cornerPinnacles)
      for (const [x, z] of [
        [x0, z0],
        [x1, z0],
        [x0, z1],
        [x1, z1],
      ]) {
        S.b.box("limestone", x - 0.6, y1, z - 0.6, x + 0.6, y1 + 3.2, z + 0.6, {
          seg: false,
        });
        S.b.cyl("limestone", x, y1 + 3.2, z, 0.05, 0.75, 3.6, 4, {
          ry: PI / 4,
        });
        S.b.sphere("gold", x, y1 + 6.9, z, 0.18, { ws: 6, hs: 4 });
      }
  }

  const BX0 = 211,
    BX1 = 269,
    BZ0 = 3,
    BZ1 = 32; // base block
  const DOOR_X = 240;
  function buildExterior() {
    const S = P.site("nyl_ext", { grime: 0.55 });
    const b = S.b;
    const rn = P.rng("nyl_ext");
    b.box("sidewalk", 210, 0, 2, 270, 0.06, 33, {
      segLen: 8,
      grime: 0.5,
      noAO: true,
    });
    // ---------------- base block with the ground-floor arcade ----------------
    b.box("limestone_dark", BX0, 0, BZ0, BX1, 40, BZ1, { segLen: 8 });
    S.col(BX0 - 0.4, 0, BZ0 - 0.4, BX1 + 0.4, 41.3, BZ1 + 0.4);
    const baseOpts = { winStart: 11.6, pierFrom: 10.6, bay: 2.9 };
    gothicFace(S, "s", BX0, BX1, BZ1, 0, 40, baseOpts);
    gothicFace(S, "n", BX0, BX1, BZ0, 0, 40, { winStart: 2.2 });
    gothicFace(S, "e", BZ0, BZ1, BX1, 0, 40, { winStart: 2.2 });
    gothicFace(S, "w", BZ0, BZ1, BX0, 0, 40, { winStart: 2.2 });
    // 23rd Street arcade: tall pointed arches, the central one the entrance
    const FS = P.face(S, "s", BX0, BX1, BZ1);
    FS.box("limestone", -0.4, FS.len + 0.4, 0, 10.6, 0, 0.9, { segLen: 4 });
    FS.box("limestone", -0.5, FS.len + 0.5, 10.6, 11.4, 0, 1.1, { seg: false });
    const nA = 9,
      aw = FS.len / nA;
    for (let i = 0; i < nA; i++) {
      const u = (i + 0.5) * aw,
        w = aw - 1.3,
        h = 8.6;
      const ash = P.archShape(w, h, w * 0.6);
      b.extrude(
        i === 4 ? "black_glass" : "paint_black",
        ash,
        0.05,
        FS.mat(u, 0, 0.12),
        { uv: "box", noAO: true },
      );
      const ring = P.archShape(w + 0.6, h + 0.35, w * 0.6 + 0.3);
      ring.holes.push(P.archShape(w, h, w * 0.6));
      b.extrude("limestone", ring, 0.35, FS.mat(u, 0, 0.9));
      // shopfront / door infill
      if (i === 4) {
        FS.box("bronze", u - w / 2 + 0.2, u + w / 2 - 0.2, 0, 4.4, 0.15, 0.3, {
          seg: false,
        });
        FS.box("paint_black", u - 1.2, u + 1.2, 0.05, 3.6, 0.3, 0.33, {
          seg: false,
          noAO: true,
        });
        for (const s of [-1, 1])
          FS.box(
            "bronze",
            u + s * 1.6 - 0.35,
            u + s * 1.6 + 0.35,
            0.05,
            3.5,
            0.3,
            0.6 + (s > 0 ? 0.6 : 0.1),
            { seg: false, ry: s * 0.3 },
          );
        // tracery transom over the doors
        for (let k = -2; k <= 2; k++)
          FS.box(
            "bronze",
            u + k * 0.5 - 0.04,
            u + k * 0.5 + 0.04,
            4.4,
            7.4,
            0.14,
            0.2,
            { seg: false },
          );
        const sign = P.texMat(
          "nyl_name",
          P.signTex(
            "nyl_name",
            ["NEW YORK LIFE INSURANCE COMPANY"],
            "engraved",
            1024,
            96,
            { bg: "#b9b09a", fg: "rgba(50,42,32,0.9)" },
          ),
          { rough: 0.9 },
        );
        FS.quad(sign, u, 10.1, 14, 0.8, 0.92);
      } else {
        FS.box(
          rn() < 0.4 ? "glass_broken" : "glass_dark",
          u - w / 2 + 0.3,
          u + w / 2 - 0.3,
          1.0,
          6.4,
          0.14,
          0.18,
          { seg: false, noAO: true },
        );
        FS.box("bronze", u - w / 2 + 0.2, u + w / 2 - 0.2, 0, 1.0, 0.12, 0.35, {
          seg: false,
        });
        if (i % 3 === 1)
          for (let k = 0; k < 4; k++)
            FS.box(
              "wood_rotten",
              u - w / 2 + 0.1,
              u + w / 2 - 0.1,
              1.3 + k * 1.2,
              1.6 + k * 1.2,
              0.2,
              0.26,
              { seg: false, rz: (rn() - 0.5) * 0.1 },
            );
      }
    }
    // ---------------- setbacks + tower ----------------
    towerBlock(S, 216, 5.5, 264, 29.5, 40, 56, { winStart: 41.2 });
    towerBlock(S, 222, 8, 258, 27, 56, 72, { winStart: 57.2 });
    towerBlock(S, 228, 10, 252, 25, 72, 94, {
      winStart: 73.2,
      cornerPinnacles: true,
      bay: 2.4,
    });
    // belvedere: open gothic arcade stage under the pyramid
    const TX0 = 231,
      TX1 = 249,
      TZ0 = 11,
      TZ1 = 24,
      TY0 = 94,
      TY1 = 101;
    b.box(
      "limestone_dark",
      TX0 + 1.2,
      TY0,
      TZ0 + 1.2,
      TX1 - 1.2,
      TY1,
      TZ1 - 1.2,
      { segLen: 4 },
    );
    for (const [sd, a0, a1, cc] of [
      ["s", TX0, TX1, TZ1],
      ["n", TX0, TX1, TZ0],
      ["e", TZ0, TZ1, TX1],
      ["w", TZ0, TZ1, TX0],
    ]) {
      const F = P.face(S, sd, a0, a1, cc);
      const m = Math.round(F.len / 2.2),
        w = F.len / m;
      for (let k = 0; k <= m; k++)
        F.box("limestone", k * w - 0.35, k * w + 0.35, TY0, TY1, -0.1, 0.5);
      for (let k = 0; k < m; k++) {
        const ring = P.archShape(w - 0.2, 1.6, 0.9);
        ring.holes.push(P.archShape(w - 0.7, 1.35, 0.75));
        S.b.extrude(
          "limestone",
          ring,
          0.3,
          F.mat((k + 0.5) * w, TY1 - 2.0, 0.1),
        );
      }
      F.box("limestone", -0.4, F.len + 0.4, TY1 - 0.4, TY1 + 0.4, -0.1, 0.7, {
        seg: false,
      });
      F.box("limestone", -0.2, F.len + 0.2, TY0, TY0 + 1.1, -0.1, 0.55, {
        seg: false,
      });
    }
    S.col(TX0, TY0, TZ0, TX1, TY1 + 0.4, TZ1);
    // ---------------- the GILDED PYRAMID ----------------
    const PCX = (TX0 + TX1) / 2,
      PCZ = (TZ0 + TZ1) / 2,
      PHX = (TX1 - TX0) / 2 + 0.4,
      PHZ = (TZ1 - TZ0) / 2 + 0.4,
      PY0 = TY1 + 0.4,
      PH = 17;
    b.geo("gold_tiles", pyramidGeo(PHX, PHZ, PH, false), P.m4(PCX, PY0, PCZ), {
      grime: 0.25,
      noAO: true,
    });
    NL.pyrWorld = { cx: PCX, cz: PCZ, hx: PHX, hz: PHZ, y0: PY0, h: PH };
    // hip ridges (bronze rolls) + base cornice
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      b.rod(
        "bronze",
        [PCX + sx * PHX, PY0, PCZ + sz * PHZ],
        [PCX, PY0 + PH, PCZ],
        0.12,
        5,
      );
    b.box(
      "limestone",
      PCX - PHX - 0.3,
      PY0 - 0.3,
      PCZ - PHZ - 0.3,
      PCX + PHX + 0.3,
      PY0 + 0.1,
      PCZ + PHZ + 0.3,
      { seg: false },
    );
    // torn-away tiles on the north-east face: dark voids with bared ribs
    const faceNE = (t0, t1, s0, s1) => {
      // point on the east face: along-edge s (0..1 from north to south), up t (0 base .. 1 apex)
      const pt = (s, t) => {
        const x = PCX + PHX * (1 - t),
          z = PCZ + (-PHZ + 2 * PHZ * s) * (1 - t),
          y = PY0 + PH * t;
        return new THREE.Vector3(x + 0.06, y, z);
      };
      const g = new THREE.BufferGeometry().setFromPoints([
        pt(s0, t0),
        pt(s1, t0),
        pt(s1, t1),
        pt(s0, t0),
        pt(s1, t1),
        pt(s0, t1),
      ]);
      g.computeVertexNormals();
      b.geo("paint_black", g, new THREE.Matrix4(), { noAO: true, grime: 0 });
      for (let k = 0; k < 4; k++) {
        const s = s0 + ((s1 - s0) * (k + 0.5)) / 4;
        const a = pt(s, t0),
          c = pt(s, t1);
        a.x += 0.1;
        c.x += 0.1;
        b.rod("rust", a, c, 0.06, 4);
      }
      const a = pt(s0, (t0 + t1) / 2),
        c = pt(s1, (t0 + t1) / 2);
      a.x += 0.12;
      c.x += 0.12;
      b.rod("rust", a, c, 0.05, 4);
    };
    faceNE(0.18, 0.42, 0.12, 0.38);
    faceNE(0.5, 0.62, 0.3, 0.48);
    // dormers (one per face, gothic lancets)
    for (const [dx, dz, ry] of [
      [0, 1, 0],
      [0, -1, PI],
      [1, 0, HP],
      [-1, 0, -HP],
    ]) {
      const t = 0.25,
        ex = PCX + dx * PHX * (1 - t),
        ez = PCZ + dz * PHZ * (1 - t),
        ey = PY0 + PH * t;
      const M = P.m4(ex, ey - 0.6, ez, ry);
      b.geo(
        "gold",
        new THREE.BoxGeometry(1.6, 2.6, 1.6).translate(0, 1.3, -0.4),
        M,
        { noAO: true },
      );
      b.geo(
        "gold_tiles",
        new THREE.ConeGeometry(1.2, 1.6, 4)
          .rotateY(PI / 4)
          .translate(0, 3.4, -0.4),
        M,
        { noAO: true },
      );
      b.geo(
        "paint_black",
        new THREE.BoxGeometry(0.7, 1.6, 0.05).translate(0, 1.3, 0.42),
        M,
        { noAO: true },
      );
    }
    // the lantern + finial
    const LY = PY0 + PH - 1.4;
    b.cyl("gold", PCX, LY, PCZ, 1.0, 1.15, 2.6, 8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + PI / 8;
      b.box(
        "lamp_dim",
        PCX + Math.cos(a) * 1.02 - 0.18,
        LY + 0.8,
        PCZ + Math.sin(a) * 1.02 - 0.18,
        PCX + Math.cos(a) * 1.02 + 0.18,
        LY + 2.0,
        PCZ + Math.sin(a) * 1.02 + 0.18,
        { ry: -a, seg: false, noAO: true },
      );
    }
    b.cyl("gold", PCX, LY + 2.6, PCZ, 0.05, 1.25, 1.8, 8);
    b.sphere("gold", PCX, LY + 4.6, PCZ, 0.35, { ws: 10, hs: 8 });
    b.cyl("gold", PCX, LY + 4.9, PCZ, 0.02, 0.08, 2.4, 6);
    S.glow(PCX, LY + 1.4, PCZ, 0xffd890, 3.0, {
      dayFactor: 0.15,
      flicker: 0.1,
    });
    // pinnacle crowns on the setback corners
    for (const [x, z, y] of [
      [216, 5.5, 56],
      [264, 5.5, 56],
      [216, 29.5, 56],
      [264, 29.5, 56],
      [222, 8, 72],
      [258, 8, 72],
      [222, 27, 72],
      [258, 27, 72],
    ]) {
      b.box("limestone", x - 0.5, y + 1.3, z - 0.5, x + 0.5, y + 3.4, z + 0.5, {
        seg: false,
      });
      b.cyl("limestone", x, y + 3.4, z, 0.04, 0.6, 2.8, 4, { ry: PI / 4 });
    }
    // ---------------- den signs at the door ----------------
    const warn = P.texMat(
      "nyl_warn",
      P.signTex(
        "nyl_warn",
        ["BEAR", "DO NOT ENTER", "NOT KIDDING"],
        "raider",
        512,
        384,
        { fg: "#e8e0c8" },
      ),
      { transparent: true },
    );
    FS.quad(warn, FS.len / 2 - 5.2, 3.2, 3.2, 2.4, 0.95);
    const claw = P.texMat("nyl_claw", P.clawTex(), { transparent: true });
    FS.quad(claw, FS.len / 2 + 1.6, 2.0, 1.6, 1.6, 0.62);
    FS.quad(claw, FS.len / 2 - 1.8, 1.6, 1.3, 1.3, 0.62);
    const blood = P.texMat("nyl_blood", P.bloodTex(), { transparent: true });
    b.quad(blood, DOOR_X - 1.2, 0.075, BZ1 + 1.6, 2.6, 2.6, { rx: -HP });
    b.quad(blood, DOOR_X + 2.4, 0.075, BZ1 + 0.9, 1.6, 1.6, { rx: -HP });
    E.bones(b, DOOR_X, 0.06, BZ1 + 1.8, 2.2, 18);
    S.prop("skeleton", DOOR_X + 3.2, 0.06, BZ1 + 2.6, 2.4, {
      pose: "reaching",
    });
    E.pike(b, DOOR_X - 4.8, 0.06, BZ1 + 1.5, 2.0);
    S.prop("car", DOOR_X + 12, 0, BZ1 + 3.6, 1.45, {
      kind: "coupe",
      wreck: true,
      burnt: true,
      explodable: false,
    });
    // anchors
    S.anchor("ext_entrance", DOOR_X, 0, BZ1 + 2.6, PI);
    S.anchor("ext_pyramid", PCX, PY0 + PH, PCZ, 0);
    S.build({ shadow: true, lod: 340 });
    return { S, doorX: DOOR_X, doorZ: BZ1 };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  const F2 = 9.8,
    F2H = 4.5,
    F3 = 16,
    PYB = 19,
    PYH = 13;
  function buildInterior() {
    const O = P.I("new_york_life");
    const S = P.site("nyl_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x6a6252,
      ambI: 0.4,
      interiorKey: "new_york_life",
    });
    const b = S.b;
    const rn = P.rng("nyl_int");
    NL.S = S;
    // ================= F1: THE MARBLE LOBBY =================
    const LX0 = -7,
      LX1 = 7,
      LZ0 = -18,
      LZ1 = 20,
      LH = 9.5;
    S.floor("marble_cream", LX0, LZ0, LX1, LZ1, 0);
    // black marble border + checker runner
    for (let z = LZ0 + 0.5; z < LZ1 - 0.5; z += 1.0)
      for (let x = -2.5; x < 2.5; x += 1.0)
        if (((Math.round(x) + Math.round(z)) & 1) === 0)
          b.box("black_marble", x, 0, z, x + 1.0, 0.012, z + 1.0, {
            seg: false,
            noAO: true,
            grime: 0.3,
          });
    b.box("black_marble", LX0 + 0.2, 0, LZ0, LX0 + 0.8, 0.012, LZ1, {
      seg: false,
      noAO: true,
    });
    b.box("black_marble", LX1 - 0.8, 0, LZ0, LX1 - 0.2, 0.012, LZ1, {
      seg: false,
      noAO: true,
    });
    // walls
    S.wallZ("marble_cream", LX1, LZ0, LZ1, 0, LH, 0.4);
    S.wallZ("marble_cream", LX0, LZ0, LZ1, 0, LH, 0.4, [
      [-8, -4, 0, 4.2],
      [5.5, 9, 0, 3.2],
    ]);
    S.wallX("marble_cream", LZ1, LX0, LX1, 0, LH, 0.4, [[-2, 2, 0, 5.2]]);
    // dado, pilasters, bronze bands, cornice
    for (const x of [LX0 + 0.21, LX1 - 0.21]) {
      const s = x < 0 ? 1 : -1;
      b.box("marble_rose", x - 0.02, 0, LZ0, x + 0.02 + 0.0, 1.2, LZ1, {
        seg: false,
      });
      b.box("bronze", x - 0.03, 1.2, LZ0, x + 0.03, 1.28, LZ1, {
        seg: false,
        noAO: true,
      });
      b.box(
        "marble_rose",
        x - 0.1 * s - 0.1,
        8.7,
        LZ0,
        x + 0.1 * s + 0.1,
        9.5,
        LZ1,
        { seg: false },
      );
      for (let z = LZ0 + 2; z < LZ1 - 1; z += 4) {
        if (x < 0 && ((z > -8.5 && z < -3.5) || (z > 5 && z < 9.5))) continue;
        b.box(
          "marble_rose",
          x - 0.25 * (s < 0 ? 1 : 0),
          0,
          z - 0.4,
          x + 0.25 * (s > 0 ? 1 : 0),
          8.7,
          z + 0.4,
          { seg: false },
        );
        b.box(
          "bronze",
          x - 0.3 * (s < 0 ? 1 : 0),
          7.9,
          z - 0.5,
          x + 0.3 * (s > 0 ? 1 : 0),
          8.4,
          z + 0.5,
          { seg: false },
        );
      }
    }
    // coffered gilded ceiling with gold beams (a hole where the floor above collapsed)
    const HX0 = -2.6,
      HX1 = 2.6,
      HZ0 = 6,
      HZ1 = 14.5;
    for (const r of [
      [LX0, LZ0, LX1, HZ0],
      [LX0, HZ1, LX1, LZ1],
      [LX0, HZ0, HX0, HZ1],
      [HX1, HZ0, LX1, HZ1],
    ])
      S.ceil("coffer", r[0], r[1], r[2], r[3], LH);
    for (let z = LZ0 + 4; z < LZ1; z += 4)
      if (z < HZ0 || z > HZ1)
        b.box("gold", LX0, LH - 0.45, z - 0.18, LX1, LH - 0.08, z + 0.18, {
          seg: false,
        });
    b.box("gold", -0.18, LH - 0.45, LZ0, 0.18, LH - 0.08, HZ0, { seg: false });
    b.box("gold", -0.18, LH - 0.45, HZ1, 0.18, LH - 0.08, LZ1, { seg: false });
    // bronze elevator bank on the east wall
    for (const z of [-14, -9.5, -5, 3.5, 8, 12.5]) {
      b.box("bronze", LX1 - 0.3, 0, z - 1.15, LX1 - 0.18, 3.6, z + 1.15, {
        seg: false,
      });
      const open = z === 8;
      if (open) {
        b.box(
          "paint_black",
          LX1 - 0.2,
          0.02,
          z - 0.8,
          LX1 - 0.15,
          2.9,
          z + 0.8,
          { seg: false, noAO: true },
        );
        b.rod(
          "iron",
          [LX1 - 0.19, 2.9, z + 0.4],
          [LX1 - 0.19, 0.4, z + 0.1],
          0.02,
          3,
        );
      } else
        for (const s of [-1, 1]) {
          b.box(
            "brass",
            LX1 - 0.24,
            0.02,
            z + (s < 0 ? -0.8 : 0.01),
            LX1 - 0.18,
            2.9,
            z + (s < 0 ? -0.01 : 0.8),
            { seg: false },
          );
          b.box(
            "bronze",
            LX1 - 0.26,
            1.0,
            z + s * 0.4 - 0.2,
            LX1 - 0.24,
            1.9,
            z + s * 0.4 + 0.2,
            { seg: false, noAO: true },
          );
        }
      const arch = P.archShape(2.0, 1.0, 0.6);
      b.extrude("bronze", arch, 0.08, P.m4(LX1 - 0.3, 2.95, z, -HP));
      b.cyl("lamp_dim", LX1 - 0.3, 3.3, z, 0.08, 0.08, 0.05, 8, {
        rz: HP,
        noAO: true,
      });
    }
    D.label(
      b,
      "nyl_elev",
      ["ELEVATORS · FLOORS 2-34", "OUT OF SERVICE"],
      LX1 - 0.19,
      4.6,
      -0.7,
      2.2,
      0.5,
      -HP,
      "brass",
    );
    // chandeliers: two hanging, one fallen and shattered in the middle of the floor
    D.chandelier(S, 0, LH - 1.6, -11, 1.3, {
      tiers: 3,
      chain: 1.3,
      color: 0xffd8a0,
      lr: 13,
      li: 1.0,
    });
    D.chandelier(S, 0, LH - 1.6, 1, 1.3, {
      tiers: 3,
      chain: 1.3,
      dark: true,
      broken: true,
    });
    b.torus("gold", 1.6, 0.18, 17.2, 1.2, 0.06, TAU, {
      rx: HP + 0.3,
      ts: 20,
      rs: 4,
    });
    b.torus("gold", 1.3, 0.1, 17.4, 0.8, 0.05, TAU, {
      rx: HP - 0.2,
      ts: 16,
      rs: 4,
    });
    D.shards(b, 1.4, 0.01, 17.2, 2.2, 30);
    // daylight through the south transom + the doors
    b.box("dayglass", -1.8, 5.4, LZ1 - 0.25, 1.8, 8.4, LZ1 - 0.2, {
      seg: false,
    });
    for (let k = -1; k <= 1; k++)
      b.box(
        "bronze",
        k * 0.9 - 0.04,
        5.4,
        LZ1 - 0.3,
        k * 0.9 + 0.04,
        8.4,
        LZ1 - 0.18,
        { seg: false },
      );
    S.light(0, 6.5, LZ1 - 2, 0xd8e0c8, 12, 0.8);
    S.glow(0, 6.8, LZ1 - 0.5, 0xd8e0c8, 2.8);
    b.box("bronze", -2, 0, LZ1 - 0.25, -1.1, 3.4, LZ1 - 0.15, {
      seg: false,
      ry: 0.5,
    });
    // security desk
    b.box("marble_rose", -5.6, 0, 11, -3.4, 1.1, 14.6, { seg: false });
    b.box("black_marble", -5.7, 1.1, 10.9, -3.3, 1.18, 14.7, {
      seg: false,
      noAO: true,
    });
    S.col(-5.7, 0, 10.9, -3.3, 1.18, 14.7, { walkable: false });
    // ash bear den dressing in the lobby
    const claw = P.texMat("nyl_claw", P.clawTex(), { transparent: true });
    const blood = P.texMat("nyl_blood", P.bloodTex(), { transparent: true });
    for (const [x, y, z, ry, s] of [
      [LX0 + 0.24, 2.2, 0, HP, 1.8],
      [LX1 - 0.34, 1.8, -2.2, -HP, 1.5],
      [LX0 + 0.24, 3.0, 13, HP, 1.4],
      [3, 2.4, LZ1 - 0.24, PI, 1.6],
    ])
      b.quad(claw, x, y, z, s, s, { ry });
    for (const [x, z, s] of [
      [-2, 4, 3.2],
      [3, -6, 2.4],
      [-4, -13, 2.0],
      [1.5, 15, 2.2],
    ])
      b.quad(blood, x, 0.016, z, s, s, { rx: -HP });
    E.bones(b, -3, 0.01, -2, 3.2, 22);
    E.bones(b, 3.5, 0.01, 9, 2, 12);
    E.bones(b, 0, 0.01, -15, 2.4, 14);
    for (let i = 0; i < 3; i++) {
      const z = -8 + i * 7;
      b.boxC("wood_oak", -5.9, 0.4, z, 0.5, 0.08, 2.2, {
        seg: false,
        rz: i === 1 ? 1.4 : 0,
      });
    }
    D.sofa(b, 4.8, 0, -1.5, -HP + 0.6, { fabric: "leather", w: 2.0 });
    D.rubble(S, 0, 0, 12.5, 2.4, {
      n: 14,
      slab: true,
      slabKey: "coffer",
      rebar: true,
    });
    // ================= F1 west: Policy Vault + mail room =================
    S.room({
      x0: -18,
      z0: -12,
      x1: LX0,
      z1: 4,
      y: 0,
      h: 4.6,
      wall: "marble_cream",
      floor: "terrazzo",
      ceil: "plaster",
      skip: "e",
      trim: "bronze",
      holes: { s: [[-14, -12.6, 0, 2.4]] },
    });
    // the vault door (round, slightly ajar) on the vault's north wall
    b.cyl("steel", -12.5, 2.1 - 0.35, -11.75, 1.9, 1.9, 0.7, 32, { rx: HP });
    b.cyl("chrome", -12.5, 2.1 - 0.4, -11.2, 0.25, 0.25, 0.8, 12, { rx: HP });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      b.rod(
        "chrome",
        [-12.5, 2.1, -11.0],
        [-12.5 + Math.cos(a) * 0.7, 2.1 + Math.sin(a) * 0.7, -11.0],
        0.04,
        4,
      );
    }
    D.label(
      b,
      "nyl_vault",
      ["POLICY VAULT", "MOSLER · TIME LOCK"],
      -12.5,
      4.25,
      -11.75,
      1.8,
      0.45,
      0,
      "brass",
    );
    NL.vaultDoorLocal = { x: -12.5, y: 1.5, z: -10.8 };
    // (the vault's contents are reached through Deposit Box 1: a keypad safe in the safe-deposit wall)
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 5; j++)
        b.box(
          (i * 3 + j) % 7 === 0 ? "paint_black" : "brass",
          -17.85,
          0.4 + j * 0.62,
          -10.8 + i * 0.7,
          -17.8,
          0.95 + j * 0.62,
          -10.2 + i * 0.7,
          { seg: false, noAO: true },
        );
    for (let i = 0; i < 5; i++)
      E.cabinet(b, -8.2, 0, -10.5 + i * 0.62, -HP, { open: i === 2 });
    E.hangLamp(S, -12.5, 4.6, -6, {
      chain: 0.6,
      shade: "metal",
      color: 0xffd8a0,
      r: 8,
      i: 0.8,
    });
    // mail room x -18..-7, z 4..12
    S.room({
      x0: -18,
      z0: 4,
      x1: LX0,
      z1: 12,
      y: 0,
      h: 4.6,
      wall: "plaster",
      floor: "wood",
      ceil: "plaster",
      skip: "ne",
      trim: "wood_dark",
    });
    for (let i = 0; i < 10; i++)
      for (let j = 0; j < 6; j++)
        b.box(
          "wood_dark",
          -17.85,
          0.6 + j * 0.34,
          5 + i * 0.6,
          -17.6,
          0.9 + j * 0.34,
          5.55 + i * 0.6,
          { seg: false, noAO: true },
        );
    D.table(b, -12, 0, 8, { rect: [3, 1.2], top: "wood", leg: "wood_dark" });
    for (let i = 0; i < 6; i++)
      b.box(
        "paper",
        -13.2 + i * 0.45,
        0.76,
        7.7 + (i % 2) * 0.3,
        -12.9 + i * 0.45,
        0.8,
        8.1 + (i % 2) * 0.3,
        { seg: false, noAO: true },
      );
    S.prop("mailbox", -10, 0, 11.3, PI);
    E.hangLamp(S, -12, 4.6, 8, {
      chain: 0.8,
      shade: "paint_green",
      color: 0xffc880,
      i: 0.7,
    });
    // ================= stair hall (switchback) =================
    const SX0 = -7,
      SX1 = 7,
      SZ0 = -30,
      SZ1 = LZ0;
    S.floor("marble_cream", SX0, SZ0, SX1, SZ1, 0);
    S.wallZ("marble_cream", SX0, SZ0, SZ1, 0, F2 + F2H, 0.4);
    S.wallZ("marble_cream", SX1, SZ0, SZ1, 0, F2 + F2H, 0.4);
    S.wallX("marble_cream", SZ0, SX0, SX1, 0, F2 + F2H, 0.4);
    S.ceil("coffer", SX0, SZ0, SX1, SZ1 - 0.6, F2 + F2H);
    S.stairs("marble_cream", -4.3, LZ0 - 0.6, "n", 5.0, 0, F2 / 2, {
      nosing: "bronze",
    });
    S.floor("marble_cream", SX0, SZ0, SX1, -24.9, F2 / 2, { under: "plaster" });
    S.stairs("marble_cream", 4.3, -24.9, "s", 5.0, F2 / 2, F2, {
      rail: "bronze",
      nosing: "bronze",
      railSides: [-1],
      railCol: true,
    });
    b.box("marble_cream", -1.8, 0, -24.9, 1.8, F2 / 2, SZ1 - 0.6, {
      seg: false,
    });
    S.col(-1.8, 0, -24.9, 1.8, F2 / 2, SZ1 - 0.6, { walkable: false });
    S.rail(
      "bronze",
      [
        [SX0 + 0.2, -18.6],
        [1.8, -18.6],
      ],
      F2,
      1.0,
      { r: 0.05, step: 0.2 },
    );
    // tall gothic window in the stair hall (north) — daylight
    const sw = P.archShape(3.2, 6.5, 1.6);
    b.extrude("dayglass", sw, 0.05, P.m4(0, 5.2, SZ0 + 0.22, 0), {
      uv: "keep",
      noAO: true,
    });
    const swr = P.archShape(3.7, 6.8, 1.8);
    swr.holes.push(P.archShape(3.2, 6.5, 1.6));
    b.extrude("limestone", swr, 0.2, P.m4(0, 5.2, SZ0 + 0.2, 0));
    for (let k = -1; k <= 1; k++)
      b.box(
        "limestone",
        k * 0.8 - 0.05,
        5.2,
        SZ0 + 0.22,
        k * 0.8 + 0.05,
        10.4,
        SZ0 + 0.35,
        { seg: false },
      );
    S.light(0, 8.5, SZ0 + 2.5, 0xd8e0c8, 12, 0.9);
    S.glow(0, 8.4, SZ0 + 0.5, 0xd8e0c8, 3.0);
    D.chandelier(S, 0, F2 + F2H - 1.4, -24, 1.0, {
      tiers: 2,
      chain: 1.2,
      color: 0xffd8a0,
      lr: 11,
      li: 0.8,
    });
    // ================= F2: offices =================
    const OX0 = -20,
      OX1 = 20,
      OZ0 = -18.6,
      OZ1 = 22;
    // slab with the collapse hole (x -2.6..2.6, z 6..14.5) and the service-stair hole (x 16.5..19, z -17..-9.2 is F3's)
    for (const r of [
      [OX0, OZ0, OX1, HZ0],
      [OX0, HZ1, OX1, OZ1],
      [OX0, HZ0, HX0, HZ1],
      [HX1, HZ0, OX1, HZ1],
    ])
      S.floor("parquet", r[0], r[1], r[2], r[3], F2, {
        under: "plaster",
        surface: "wood",
      });
    S.wallX("plaster_cream", OZ1, OX0, OX1, F2, F2 + F2H, 0.3);
    S.wallZ("plaster_cream", OX0, OZ0, OZ1, F2, F2 + F2H, 0.3);
    S.wallZ("plaster_cream", OX1, OZ0, OZ1, F2, F2 + F2H, 0.3);
    S.wallX("plaster_cream", OZ0, OX0, SX0, F2, F2 + F2H, 0.3);
    S.wallX("plaster_cream", OZ0, SX1, OX1, F2, F2 + F2H, 0.3);
    S.ceil("plaster", OX0, OZ0, 16.4, OZ1, F2 + F2H);
    S.ceil("plaster", 16.4, -9.0, OX1, OZ1, F2 + F2H);
    // outer windows (hazy daylight)
    for (let z = OZ0 + 3; z < OZ1 - 2; z += 4.2)
      for (const x of [OX0 + 0.17, OX1 - 0.17]) {
        b.box(
          "dayglass",
          x - 0.02,
          F2 + 1.0,
          z - 0.8,
          x + 0.02,
          F2 + 3.4,
          z + 0.8,
          { seg: false },
        );
        b.box(
          "limestone",
          x - 0.08,
          F2 + 0.9,
          z - 0.95,
          x + 0.08,
          F2 + 1.0,
          z + 0.95,
          { seg: false },
        );
        if (z % 3 < 1)
          S.light(x + (x < 0 ? 1.2 : -1.2), F2 + 2.4, z, 0xc8d4b8, 6, 0.45);
      }
    for (let x = OX0 + 3; x < OX1 - 2; x += 4.2) {
      b.box(
        "dayglass",
        x - 0.8,
        F2 + 1.0,
        OZ1 - 0.19,
        x + 0.8,
        F2 + 3.4,
        OZ1 - 0.15,
        { seg: false },
      );
    }
    // interior partitions: exec office (W), boardroom (E), records (W), tabulators (E)
    S.wallZ("wood_oak", -8, 8, OZ1, F2, F2 + F2H, 0.2, [[9.5, 11, 0, 2.4]]);
    S.wallX("wood_oak", 8, OX0, -8, F2, F2 + F2H, 0.2, [[-15, -13.6, 0, 2.4]]);
    S.wallZ("wood_oak", 8, 8, OZ1, F2, F2 + F2H, 0.2, [[9.5, 11, 0, 2.4]]);
    S.wallX("wood_oak", 8, 8, OX1, F2, F2 + F2H, 0.2);
    // actuarial floor: rows of desks with adding machines
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 3; col++) {
        const x = -5 + col * 5,
          z = -14 + row * 4;
        if (z > 3 && Math.abs(x) < 3) continue;
        E.desk(b, x, F2, z, PI, {
          w: 1.4,
          typewriter: (row + col) % 2 === 0,
          phone: (row + col) % 3 === 0,
          clutter: true,
        });
        D.chair(b, x, F2, z - 0.8, 0, {
          seat: "leather",
          wood: "metal",
          toppled: rn() < 0.25,
        });
        if ((row + col) % 2) {
          const M = P.m4(x + 0.35, F2 + 0.765, z + 0.1, 0);
          b.geo(
            "press_dark",
            new THREE.BoxGeometry(0.3, 0.14, 0.34).translate(0, 0.07, 0),
            M,
            { noAO: true },
          );
          b.geo(
            "paper",
            new THREE.BoxGeometry(0.08, 0.3, 0.004).translate(0, 0.28, -0.1),
            M,
            { noAO: true },
          );
        }
      }
    for (const [x, z] of [
      [-5, -16],
      [5, -16],
      [0, -4],
      [-5, 4],
      [5, 4],
    ])
      E.tube(S, x, F2 + F2H, z, 0, {
        len: 2.4,
        drop: 0.25,
        lit: rn() > 0.3,
        r: 8,
        i: 0.8,
      });
    // Meridian tabulators along the tabulating room (east, x 9..15)
    for (let i = 0; i < 6; i++) {
      const z = -16 + i * 3.4;
      b.box("press_green", 9, F2, z, 10.6, F2 + 2.2, z + 2.6, { seg: false });
      for (let k = 0; k < 12; k++)
        b.sphere(
          rn() < 0.3 ? "lamp_red" : rn() < 0.5 ? "lamp_green" : "glass_dark",
          10.62,
          F2 + 1.4 + (k % 3) * 0.18,
          z + 0.4 + Math.floor(k / 3) * 0.5,
          0.035,
          { ws: 4, hs: 3 },
        );
      b.box("paint_black", 10.61, F2 + 0.3, z + 0.3, 10.63, F2 + 1.1, z + 2.3, {
        seg: false,
        noAO: true,
      });
      b.cyl("press_dark", 10.3, F2 + 2.2, z + 0.7, 0.4, 0.4, 0.1, 12, {
        rz: HP,
      });
      b.cyl("press_dark", 10.3, F2 + 2.2, z + 1.9, 0.4, 0.4, 0.1, 12, {
        rz: HP,
      });
      S.col(9, F2, z, 10.6, F2 + 2.2, z + 2.6, { walkable: false });
    }
    for (let i = 0; i < 30; i++)
      b.box(
        "paper",
        11 + rn() * 4,
        F2 + 0.01,
        -17 + rn() * 22,
        11.1 + rn() * 4,
        F2 + 0.014,
        -16.9 + rn() * 22,
        { seg: false, noAO: true, ry: rn() * 3 },
      );
    // records (west strip): tall file cabinet aisles
    for (let row = 0; row < 4; row++)
      for (let i = 0; i < 9; i++)
        E.cabinet(
          b,
          -17.5 + i * 0.52 - 0.0,
          F2,
          -15 + row * 5,
          row % 2 ? PI : 0,
          { open: rn() < 0.12 },
        );
    for (let row = 0; row < 4; row++)
      S.col(
        -17.8,
        F2,
        -15 - 0.35 + row * 5,
        -12.8,
        F2 + 1.4,
        -15 + 0.35 + row * 5,
        { walkable: false },
      );
    // executive office (x -20..-8, z 8..22)
    D.rug(b, -18.5, 10, -9.5, 20.5, F2 + 0.012, "carpet_red");
    E.desk(b, -14, F2, 17, 0, {
      w: 2.2,
      d: 1.0,
      phone: true,
      typewriter: false,
    });
    D.chair(b, -14, F2, 17.9, PI, { seat: "leather", arms: true });
    E.deskLamp(S, -14.8, F2 + 0.765, 16.8, true);
    D.bookcase(b, -19.7, F2, 14, HP, { w: 2.4 });
    D.bookcase(b, -19.7, F2, 17, HP, { w: 2.4 });
    const port = P.texMat(
      "nyl_portrait",
      P.signTex(
        "nyl_portrait",
        ["THE PRESIDENT", "H. W. VAN DUSEN", "1951–1967"],
        "label",
        384,
        512,
      ),
      { rough: 0.8 },
    );
    b.box("gold", -14.8, F2 + 1.4, OZ1 - 0.22, -13.2, F2 + 3.5, OZ1 - 0.17, {
      seg: false,
    });
    b.quad(port, -14, F2 + 2.45, OZ1 - 0.16, 1.4, 1.9, { ry: PI });
    E.hangLamp(S, -14, F2 + F2H, 14, {
      chain: 0.9,
      shade: "brass",
      color: 0xffd8a0,
      r: 8,
    });
    // boardroom (x 8..20, z 8..22)
    D.table(b, 14, F2, 15, {
      rect: [2.0, 9],
      top: "wood_oak",
      leg: "wood_dark",
    });
    for (let i = 0; i < 10; i++)
      D.chair(
        b,
        14 + (i % 2 ? 1.3 : -1.3),
        F2,
        11.2 + Math.floor(i / 2) * 1.9,
        i % 2 ? -HP : HP,
        { seat: "leather", arms: true, toppled: i === 3 || i === 8 },
      );
    D.chandelier(S, 14, F2 + F2H - 0.9, 15, 0.9, {
      tiers: 2,
      chain: 0.8,
      color: 0xffd8a0,
      lr: 10,
      li: 0.8,
    });
    const board = P.texMat(
      "nyl_board",
      P.signTex(
        "nyl_board",
        [
          "THE COMPANY OF THE FUTURE",
          "Q4 1966: MORTALITY TABLES REVISED — SEE ADDENDUM",
        ],
        "banner",
        1024,
        256,
        { bg: "#1e2a4a", fg: "#e8d8a8" },
      ),
      { rough: 0.9 },
    );
    b.quad(board, 19.82, F2 + 2.6, 15, 5, 1.25, { ry: -HP });
    // ash bear damage on F2: gouged partitions, bones, the nest trail
    E.bones(b, 0, F2 + 0.01, 0, 3, 14);
    E.bones(b, -10, F2 + 0.01, 2, 2, 10);
    b.quad(claw, -8.12, F2 + 2, 14, 1.6, 1.6, { ry: -HP });
    b.quad(blood, 3, F2 + 0.02, -2, 2.6, 2.6, { rx: -HP });
    // ================= the COLLAPSE: slab ramp down into the lobby =================
    {
      const zTop = HZ0,
        zBot = HZ1 - 0.2,
        yTop = F2,
        yBot = 1.55,
        steps = 20;
      const L = Math.hypot(zBot - zTop, yTop - yBot),
        ang = Math.atan2(yTop - yBot, zBot - zTop);
      const M = new THREE.Matrix4().compose(
        new THREE.Vector3(0, (yTop + yBot) / 2 - 0.2, (zTop + zBot) / 2),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(ang, 0, 0)),
        new THREE.Vector3(1, 1, 1),
      );
      b.geo(
        "parquet",
        new THREE.BoxGeometry(4.8, 0.08, L).translate(0, 0.16, 0),
        M,
        { grime: 0.6 },
      );
      b.geo("concrete", new THREE.BoxGeometry(4.8, 0.3, L), M, { grime: 0.6 });
      b.geo(
        "coffer",
        new THREE.BoxGeometry(4.8, 0.05, L).translate(0, -0.18, 0),
        M,
        { grime: 0.4 },
      );
      for (let i = 0; i < 6; i++)
        b.rod(
          "rust",
          [-2.2 + i * 0.9, yTop - 0.1, zTop + 0.2],
          [-2.2 + i * 0.9 + (rn() - 0.5), yTop + 0.3, zTop - 0.6],
          0.02,
          3,
        );
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps,
          t1 = (i + 1) / steps;
        const za = zTop + (zBot - zTop) * t0,
          zb = zTop + (zBot - zTop) * t1,
          yb = yTop + (yBot - yTop) * t1 + 0.08;
        S.col(-2.3, yb - 0.4, za, 2.3, yb, zb, { surface: "wood" });
      }
      D.rubble(S, 0, 0, HZ1 + 1.4, 2.0, {
        n: 16,
        key: "rubble",
        rebar: true,
        col: true,
        colH: 0.5,
      });
      D.rubble(S, 1.2, F2, HZ0 - 0.8, 1.2, { n: 6 });
    }
    // ================= service stair up to the attic =================
    S.stairs("steel", 17.75, -17, "s", 2.4, F2, F3, {
      rail: "iron",
      railSides: [-1],
      solid: false,
    });
    S.wallZ("plaster_cream", 16.4, -18.6, -8.6, F2, F2 + F2H, 0.2, [
      [-18.4, -16.8, 0, 2.4],
    ]);
    // ================= F3: THE GILDED PYRAMID ATTIC =================
    const AX0 = -16,
      AX1 = 20,
      AZ0 = -18,
      AZ1 = 14;
    const ACX = (AX0 + AX1) / 2,
      ACZ = (AZ0 + AZ1) / 2,
      AHX = (AX1 - AX0) / 2,
      AHZ = (AZ1 - AZ0) / 2;
    S.floor("concrete", AX0, AZ0, 16.4, AZ1, F3, {
      under: "plaster",
      surface: "concrete",
    });
    S.floor("concrete", 16.4, -9.0, AX1, AZ1, F3, { under: "plaster" });
    S.rail(
      "iron",
      [
        [16.4, -17.2],
        [16.4, -9.0],
      ],
      F3,
      1.0,
      { r: 0.03, step: 0.4 },
    );
    // perimeter parapet walls (the tower's top storey) up to where the pyramid springs
    S.wallX("limestone_dark", AZ0, AX0, AX1, F3, PYB, 0.5);
    S.wallX("limestone_dark", AZ1, AX0, AX1, F3, PYB, 0.5);
    S.wallZ("limestone_dark", AX0, AZ0, AZ1, F3, PYB, 0.5);
    S.wallZ("limestone_dark", AX1, AZ0, AZ1, F3, PYB, 0.5);
    // the pyramid shell seen from inside: the back of the gilded skin
    b.inside(
      "bronze",
      pyramidGeo(AHX + 0.3, AHZ + 0.3, PYH, true),
      P.m4(ACX, PYB, ACZ),
      { grime: 0.5, noAO: true },
    );
    // hip rafters, purlin rings, king post, braces
    const hip = (sx, sz) => [ACX + sx * AHX, PYB, ACZ + sz * AHZ];
    const apex = [ACX, PYB + PYH, ACZ];
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      E.girder(b, hip(sx, sz), apex, 0.3, "rust");
    for (const t of [0.28, 0.55, 0.78]) {
      const hx = AHX * (1 - t) - 0.2,
        hz = AHZ * (1 - t) - 0.2,
        y = PYB + PYH * t - 0.15;
      const pts = [
        [ACX - hx, y, ACZ - hz],
        [ACX + hx, y, ACZ - hz],
        [ACX + hx, y, ACZ + hz],
        [ACX - hx, y, ACZ + hz],
      ];
      for (let i = 0; i < 4; i++)
        E.girder(b, pts[i], pts[(i + 1) % 4], 0.22, "rust");
    }
    E.girder(b, [ACX, F3, ACZ + 6], [ACX, PYB + PYH, ACZ], 0.28, "rust");
    for (const [sx, sz] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ])
      E.girder(
        b,
        [ACX + sx * AHX * 0.9, PYB, ACZ + sz * AHZ * 0.9],
        [ACX + sx * 1.5, PYB + PYH * 0.62, ACZ + sz * 1.5],
        0.16,
        "rust",
      );
    for (let x = AX0 + 3; x < AX1 - 1; x += 4)
      E.girder(
        b,
        [x, PYB - 0.2, AZ0 + 0.3],
        [x, PYB - 0.2, AZ1 - 0.3],
        0.2,
        "iron",
      );
    // daylight through the torn tiles (NE face) + the lantern
    const holes = [
      [0.2, 0.4, 0.15, 0.4],
      [0.5, 0.62, 0.32, 0.5],
      [0.3, 0.45, 0.62, 0.78],
    ];
    NL.shafts = [];
    for (const h of holes) {
      const pt = (s, t) =>
        new THREE.Vector3(
          ACX + AHX * (1 - t) - 0.1,
          PYB + PYH * t,
          ACZ + (-AHZ + 2 * AHZ * s) * (1 - t),
        );
      const g = new THREE.BufferGeometry().setFromPoints([
        pt(h[2], h[0]),
        pt(h[2], h[1]),
        pt(h[3], h[1]),
        pt(h[2], h[0]),
        pt(h[3], h[1]),
        pt(h[3], h[0]),
      ]);
      g.computeVertexNormals();
      b.geo("daylight", g, new THREE.Matrix4(), { noAO: true });
      const c = pt((h[2] + h[3]) / 2, (h[0] + h[1]) / 2);
      S.light(c.x - 3, c.y - 2, c.z, 0xe8ecd0, 14, 1.3);
      S.glow(c.x - 0.4, c.y, c.z, 0xe8ecd0, 3.5);
      NL.shafts.push({
        from: S.W(c.x - 0.2, c.y, c.z).sub(new THREE.Vector3(0, 0, 0)),
        to: S.W(c.x - 7, F3, c.z + 1.5),
      });
    }
    b.cyl("daylight", ACX, PYB + PYH - 0.6, ACZ, 0.9, 0.9, 0.1, 8, {
      noAO: true,
    });
    S.light(ACX, PYB + PYH - 2, ACZ, 0xe8ecd0, 12, 0.9);
    // lantern shaft ladder
    for (let y = F3 + 0.3; y < PYB + PYH - 1; y += 0.35)
      b.box("iron", ACX - 0.3, y, ACZ + 5.6, ACX + 0.3, y + 0.04, ACZ + 5.68, {
        seg: false,
      });
    // THE NEST
    const NX = ACX - 2,
      NZ = ACZ - 1;
    E.nest(S, NX, F3, NZ, 3.2, { bones: 26 });
    E.bones(b, NX + 5, F3 + 0.01, NZ + 5, 3, 16);
    E.bones(b, NX - 6, F3 + 0.01, NZ - 4, 2.5, 12);
    for (let i = 0; i < 5; i++)
      b.rock(
        "gold_tiles",
        NX + 7 + rn() * 5,
        F3 + 0.1,
        NZ - 7 + rn() * 5,
        0.5 + rn() * 0.4,
        { flat: 0.2, rough: 0.2 },
      );
    b.quad(blood, NX + 2, F3 + 0.02, NZ + 1, 4, 4, { rx: -HP });
    // scavenger's last stand vignette
    b.box("wood_rotten", AX0 + 1, F3, AZ1 - 3, AX0 + 3.4, F3 + 0.9, AZ1 - 1, {
      seg: false,
      ry: 0.3,
    });
    // maintenance lift (loop back down to the lobby) — west side
    b.box("iron", AX0 + 0.26, F3, -6.2, AX0 + 0.4, F3 + 2.8, -3.8, {
      seg: false,
    });
    b.box("chrome", AX0 + 0.4, F3 + 0.05, -5.9, AX0 + 0.46, F3 + 2.5, -4.1, {
      seg: false,
    });
    D.label(
      b,
      "nyl_lift",
      ["MAINTENANCE LIFT", "→ LOBBY"],
      AX0 + 0.47,
      F3 + 2.7,
      -5,
      1.2,
      0.35,
      HP,
      "brass",
    );
    NL.liftTopLocal = { x: AX0 + 0.9, y: F3 + 1.4, z: -5 };
    // the lift's lobby end (behind the elevator bank's open car)
    NL.liftBottomLocal = { x: LX1 - 0.6, y: 1.5, z: 8 };
    // ================= props, pickups, terminals =================
    S.prop("terminal", -4.5, 1.18, 12.8, HP, {
      terminalId: "pe_nyl_security",
      mount: "bare",
    });
    S.prop("terminal", -14, F2 + 0.765, 16.7, PI, {
      terminalId: "pe_nyl_exec",
      mount: "bare",
    });
    S.prop("terminal", 12.5, F2, -1.5, -HP, {
      terminalId: "pe_nyl_actuary",
      mount: "own_desk",
    });
    S.prop("safe", -19.3, F2, 20.6, HP, {
      locked: 0,
      lock: P.LOCKS.nyl_exec_safe,
      name: "Executive Safe",
      items: [
        ["scrip", 160],
        ["pe_nyl_pocketwatch", 1],
        ["old_dollars", 12],
      ],
    });
    S.prop("safe", -16.8, 0, -11.2, 0, {
      locked: 0,
      lock: P.LOCKS.nyl_deposit_1,
      name: "Policy Vault — Deposit Box 1",
      items: [
        ["pe_nyl_policy", 1],
        ["scrip", 95],
        ["rally_tonic", 2],
        ["gold_bar", 1],
      ],
    });
    S.prop("file_cabinet", -12.8, F2, -5.2, 0, { loot: "file_cabinet" });
    S.prop("desk", 5.5, F2, -14.8, PI, { loot: "desk" });
    S.prop("first_aid", LX0 + 0.22, 1.4, -15.5, HP, { loot: "first_aid" });
    S.prop("duffle_bag", AX0 + 2, F3 + 0.9, AZ1 - 2, 0.3, {
      loot: "raider",
      name: "Scavenger's Duffle Bag",
    });
    S.prop("skeleton", AX0 + 1.6, F3, AZ1 - 3.6, 0.6, { pose: "lying" });
    S.prop("skeleton", -3.8, 0, -4, 1.1, { pose: "curled" });
    S.prop("skeleton", 12, F2, -3, 2.2, { pose: "lying" });
    S.prop("ammo_box", 18.2, F3, 12.2, 0.4, { loot: "ammo_box" });
    S.pickup("pe_reel_gilt", 1, AX0 + 1.9, F3 + 0.95, AZ1 - 2.6);
    S.pickup("pe_note_vandusen", 1, -13.5, F2 + 0.8, 16.8);
    S.pickup("pe_note_night_guard", 1, -4.4, 1.2, 11.6);
    S.pickup("rally_tonic", 1, NX + 3.2, F3 + 0.1, NZ + 1.4);
    // ================= anchors =================
    S.anchor("entrance", 0, 0, 17.8, 0);
    S.anchor("spawn1", -2, 0, -6, 0);
    S.anchor("spawn2", 3, 0, -14, 0);
    S.anchor("spawn3", 0, F2, -8, 0);
    S.anchor("spawn4", -12, F2, -1, 0);
    S.anchor("spawn5", ACX + 5, F3, ACZ + 5, 0);
    S.anchor("spawn6", 14, F2, 18, 0);
    S.anchor("boss", NX, F3 + 0.1, NZ, PI);
    S.anchor("nest", NX, F3, NZ, 0);
    S.anchor("photo", 14.5, F3, -6.5, HP);
    S.anchor("loot1", -19.3, F2, 20.6, 0);
    S.anchor("loot2", -16.8, 0, -11.2, 0);
    S.anchor("loot3", AX0 + 2, F3, AZ1 - 2, 0);
    S.anchor("vault", -12.5, 0, -9.8, 0);
    S.anchor("lift_top", AX0 + 1.6, F3, -5, HP);
    S.anchor("lift_bottom", LX1 - 1.6, 0, 8, -HP);
    S.build({ interior: true });
    return S;
  }

  P.addBuilder(
    "new_york_life",
    function () {
      const EX = buildExterior(),
        ES = EX.S;
      const I = buildInterior();
      const O = P.I("new_york_life");
      P.addInterior("new_york_life", I.root);
      NL.extRoot = ES.root;
      ES.door(
        EX.doorX,
        1.6,
        EX.doorZ + 0.5,
        "New York Life Building",
        { x: O.x, y: O.y, z: O.z + 17.8, yaw: 0 },
        {
          id: "pe_nyl_front",
          radius: 2.0,
          onEnter: () => P.safe("disc", () => G.discover("new_york_life")),
        },
      );
      I.door(
        0,
        1.6,
        19.6,
        "23rd Street",
        { x: EX.doorX, y: 0, z: EX.doorZ + 2.8, yaw: PI },
        { id: "pe_nyl_front_in", verb: "Exit", radius: 1.8 },
      );
      // maintenance lift: attic → lobby (always); lobby → attic only once ridden down (80_content locks it)
      NL.liftDown = I.door(
        NL.liftTopLocal.x,
        NL.liftTopLocal.y,
        NL.liftTopLocal.z,
        "Maintenance Lift (Lobby)",
        {
          x: O.x + NL.liftBottomLocal.x - 1.0,
          y: O.y,
          z: O.z + NL.liftBottomLocal.z,
          yaw: HP,
        },
        {
          id: "pe_nyl_lift_down",
          verb: "Ride",
          radius: 1.3,
          sound: "door_open",
        },
      );
      P.register("new_york_life", {
        root: ES.root,
        interiorRoot: I.root,
        interiorKey: "new_york_life",
        anchors: Object.assign({}, ES.anchors, I.anchors),
      });
    },
    30,
  );
})();
