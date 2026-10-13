/* src/poi_financial/30_fraunces.js */
/* =====================================================================
 * NEW RAD CITY — POI FINANCIAL — FRAUNCES TAVERN
 * Exterior (site x 50..110, z 856..889): the Georgian brick tavern at the
 * corner of Pearl & Broad — Flemish-bond brick, white 12-over-12 sashes
 * with keystone lintels, doorcase with fanlight & pediment, dentil cornice,
 * hipped slate roof with dormers and chimneys, the thirteen-star flag,
 * hanging sign and lanterns; the rest of the historic block (four narrow
 * 19th-century row buildings) and the settlers' back courtyard (stalls,
 * still, purifier, string lights) reached through an alley.
 * Interior (INTERIORS.fraunces_tavern, lifted 6 m): taproom with bar &
 * fireplace, kitchen, stair hall; 2nd floor THE LONG ROOM (Washington's
 * farewell) + museum gallery; 3rd floor guest rooms + the period room;
 * attic stash; stone cellar with the smugglers' tunnel to the courtyard.
 * NPCs: Tobin Drummond (bartender, merchant, rumours), Nan Whitlock
 * (cook — egg quest, the Whitlock ring), Mortimer Vane (ruined old
 * financier — The Gold Standard), GW-1776 (docent patrolman quiz),
 * Birdie (bouncer), Sal (fiddler).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pf) return;
  const PF = G._pf;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = Math.PI / 2,
    TAU = Math.PI * 2;

  const TX0 = 92,
    TX1 = 108,
    TZ0 = 858,
    TZ1 = 872; // tavern footprint
  const EAVE = 11.5,
    RIDGE = 15.2;
  const BASE = 6;

  Object.assign(PF.flagDefaults, {
    ft_rumour: 0,
    ft_quiz: 0,
    ft_tricorn: false,
    ft_room: false,
    ft_ring: false,
    ft_eggs: 0,
  });

  /** Georgian 12-over-12 sash window with white frame, muntins, stone lintel+keystone and sill. */
  function sash(b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    b.quad(
      opts.broken ? "glass_broken" : opts.lit ? "window_lit" : "glass_dark",
      x + s * 0.01,
      y + h / 2,
      z + c * 0.01,
      w,
      h,
      { ry, noAO: true, grime: 0.1 },
    );
    const fk = "white_paint";
    const f = (lx, ly, ww, hh) => {
      const p = P(lx, ly, 0.05);
      b.box(fk, p.x, p.y, p.z, ww, hh, 0.1, { ry, seg: false, grime: 0.3 });
    };
    f(0, -0.06, w + 0.2, 0.12);
    f(0, h - 0.06, w + 0.2, 0.12);
    f(-w / 2 - 0.05, 0, 0.1, h);
    f(w / 2 + 0.05, 0, 0.1, h);
    f(0, h / 2 - 0.04, w, 0.08); // meeting rail
    if (!opts.broken) {
      for (let i = 1; i < 3; i++) {
        const lx = -w / 2 + (i * w) / 3;
        const p = P(lx, 0, 0.04);
        b.box(fk, p.x, p.y, p.z, 0.035, h, 0.04, { ry, seg: false });
      }
      for (const yy of [h * 0.25, h * 0.75]) {
        const p = P(0, yy, 0.04);
        b.box(fk, p.x, p.y, p.z, w, 0.035, 0.04, { ry, seg: false });
      }
    }
    // splayed stone lintel with keystone, sill
    const l = P(0, h + 0.02, 0.08);
    b.box("limestone", l.x, l.y, l.z, w + 0.55, 0.32, 0.18, {
      ry,
      seg: false,
      grime: 0.4,
    });
    const k = P(0, h, 0.12);
    b.box("limestone", k.x, k.y, k.z, 0.26, 0.42, 0.2, { ry, seg: false });
    const sl = P(0, -0.12, 0.12);
    b.box("limestone", sl.x, sl.y, sl.z, w + 0.35, 0.1, 0.25, {
      ry,
      seg: false,
    });
    if (opts.shutters)
      for (const sg of [-1, 1]) {
        const p = P(sg * (w / 2 + 0.33), 0, 0.08);
        b.box("paint_teal", p.x, p.y, p.z, 0.5, h, 0.05, {
          ry: ry + sg * (opts.shutOpen ? 0.25 : 0),
          seg: false,
          grime: 0.6,
        });
      }
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior(site, root) {
    const b = PF.batch("fraunces_ext");
    b.ground = 0;
    b.aoH = 3.5;
    const r = PF.rng("fraunces");
    const anchors = {};
    // sidewalks (brick pavers) and courtyard ground
    b.boxMM("brick_brown", site.x0, -0.1, site.z0, site.x1, 0.07, TZ0 + 0.4, {
      grime: 0.5,
      segLen: 5,
    });
    b.boxMM("cobble", site.x0, -0.1, TZ1, site.x1, 0.05, site.z1, {
      grime: 0.55,
      segLen: 5,
    });
    b.boxMM("brick_brown", TX1, -0.1, TZ0, site.x1, 0.07, TZ1, { grime: 0.5 });

    // ---------------- the tavern ----------------
    const poly = [
      [TX0, TZ0],
      [TX1, TZ0],
      [TX1, TZ1],
      [TX0, TZ1],
    ];
    b.boxMM(
      "granite_dark",
      TX0 - 0.2,
      0,
      TZ0 - 0.2,
      TX1 + 0.2,
      0.7,
      TZ1 + 0.2,
      { grime: 0.6 },
    );
    K.prismBands(b, "brick_fed", poly, 0.7, EAVE, 3.6, { grime: 0.45 });
    PF.colMM(TX0 - 0.25, 0, TZ0 - 0.25, TX1 + 0.25, EAVE, TZ1 + 0.25, {
      walkable: false,
    });
    // belt courses (white stone) between floors
    for (const y of [4.2, 8.1])
      b.boxMM(
        "limestone",
        TX0 - 0.06,
        y,
        TZ0 - 0.06,
        TX1 + 0.06,
        y + 0.22,
        TZ1 + 0.06,
        { seg: false, grime: 0.4 },
      );
    // dentil cornice
    b.boxMM(
      "white_paint",
      TX0 - 0.45,
      EAVE - 0.5,
      TZ0 - 0.45,
      TX1 + 0.45,
      EAVE,
      TZ1 + 0.45,
      { seg: false, grime: 0.45 },
    );
    b.boxMM(
      "white_paint",
      TX0 - 0.6,
      EAVE,
      TZ0 - 0.6,
      TX1 + 0.6,
      EAVE + 0.2,
      TZ1 + 0.6,
      { seg: false, grime: 0.45 },
    );
    for (const [a0, a1, fixed, axis, out] of [
      [TX0, TX1, TZ0 - 0.46, "x", -1],
      [TX0, TX1, TZ1 + 0.46, "x", 1],
      [TZ0, TZ1, TX1 + 0.46, "z", 1],
      [TZ0, TZ1, TX0 - 0.46, "z", -1],
    ]) {
      for (let a = a0 + 0.2; a < a1; a += 0.34)
        b.box(
          "white_paint",
          axis === "x" ? a : fixed,
          EAVE - 0.72,
          axis === "x" ? fixed : a,
          0.14,
          0.2,
          0.14,
          { seg: false },
        );
      void out;
    }
    // hipped roof (slate) — a frustum from the eave rectangle to a short ridge
    {
      const ex0 = TX0 - 0.55,
        ex1 = TX1 + 0.55,
        ez0 = TZ0 - 0.55,
        ez1 = TZ1 + 0.55,
        cz = (ez0 + ez1) / 2;
      const inset = (ez1 - ez0) / 2 - 0.3;
      const g = new THREE.BufferGeometry();
      const y0 = EAVE + 0.2,
        y1 = RIDGE;
      const v = [
        ex0,
        y0,
        ez0,
        ex1,
        y0,
        ez0,
        ex1 - inset,
        y1,
        cz,
        ex0 + inset,
        y1,
        cz, // north face
        ex1,
        y0,
        ez1,
        ex0,
        y0,
        ez1,
        ex0 + inset,
        y1,
        cz,
        ex1 - inset,
        y1,
        cz, // south face
        ex1,
        y0,
        ez0,
        ex1,
        y0,
        ez1,
        ex1 - inset,
        y1,
        cz,
        ex1 - inset,
        y1,
        cz, // east hip
        ex0,
        y0,
        ez1,
        ex0,
        y0,
        ez0,
        ex0 + inset,
        y1,
        cz,
        ex0 + inset,
        y1,
        cz, // west hip
      ];
      const idx = [];
      for (let f = 0; f < 4; f++) {
        const o = f * 4;
        idx.push(o, o + 2, o + 1, o, o + 3, o + 2);
      }
      g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      b.add("slate", g, { grime: 0.5 });
      // ridge cap
      b.boxMM(
        "iron",
        ex0 + inset - 0.1,
        y1 - 0.05,
        cz - 0.08,
        ex1 - inset + 0.1,
        y1 + 0.1,
        cz + 0.08,
        { seg: false },
      );
      // dormers: 3 north, 3 south, 2 east
      const dorm = (x, z, ry) => {
        const c = Math.cos(ry),
          s = Math.sin(ry);
        b.box(
          "white_paint",
          x - s * 0.7,
          EAVE + 0.2,
          z - c * 0.7,
          1.15,
          1.45,
          1.4,
          { ry, seg: false, grime: 0.4 },
        );
        K.pediment(
          b,
          "slate",
          x - s * 0.7,
          EAVE + 1.65,
          z - c * 0.7,
          1.35,
          0.6,
          1.45,
          ry,
          {},
        );
        b.quad(
          "glass_dark",
          x + s * 0.02,
          EAVE + 0.95,
          z + c * 0.02,
          0.7,
          0.9,
          { ry, noAO: true },
        );
        for (const yy of [0.75, 1.05])
          b.box(
            "white_paint",
            x + s * 0.04,
            EAVE + yy + 0.2,
            z + c * 0.04,
            0.7,
            0.03,
            0.03,
            { ry, seg: false },
          );
      };
      for (const x of [95.5, 100, 104.5]) {
        dorm(x, TZ0 + 0.2, PI);
        dorm(x, TZ1 - 0.2, 0);
      }
      for (const z of [862.5, 867.5]) dorm(TX1 - 0.2, z, HP);
      // chimneys
      for (const [x, z] of [
        [TX0 + 1.0, TZ0 + 3.5],
        [TX0 + 1.0, TZ1 - 3.5],
        [TX1 - 1.2, TZ1 - 1.2],
      ]) {
        b.box("brick_fed", x, EAVE - 1, z, 1.3, RIDGE - EAVE + 2.6, 0.9, {
          seg: false,
          grime: 0.6,
        });
        b.box("limestone", x, RIDGE + 1.6, z, 1.45, 0.18, 1.05, { seg: false });
        for (const dx of [-0.3, 0.3])
          b.cyl("rust", x + dx, RIDGE + 1.78, z, 0.12, 0.14, 0.4, 6, {
            hSeg: 1,
          });
      }
      PF.smokeAt = V3(TX0 + 1.0, RIDGE + 2.2, TZ0 + 3.5);
    }
    // windows: north (Broad St) 5 bays, east (Pearl St) 4 bays, 3 floors
    const floorsY = [1.3, 5.1, 8.9];
    for (let f = 0; f < 3; f++) {
      for (const x of [94.2, 97.1, 100, 102.9, 105.8]) {
        if (f === 0 && Math.abs(x - 100) < 0.5) continue; // door bay
        sash(b, x, floorsY[f], TZ0 - 0.02, PI, 1.1, f === 2 ? 1.7 : 2.1, {
          shutters: f === 0,
          shutOpen: true,
          lit: f === 0 || (f === 1 && x > 101),
          broken: f === 2 && x < 95,
        });
      }
      for (const z of [860.5, 863.8, 867.1, 870.4])
        sash(b, TX1 + 0.02, floorsY[f], z, HP, 1.1, f === 2 ? 1.7 : 2.1, {
          shutters: f === 0,
          lit: f === 0 && z < 866,
        });
      for (const x of [95, 99.5, 104.5])
        sash(b, x, floorsY[f], TZ1 + 0.02, 0, 1.1, 1.9, { broken: r() < 0.4 });
    }
    // the doorcase: fluted pilasters, fanlight, pediment, stone steps
    {
      const dx = 100,
        dz = TZ0 - 0.02;
      b.box("oak", dx, 0.7, dz - 0.02, 1.4, 2.5, 0.12, {
        seg: false,
        grime: 0.4,
        c: 0x6a3a22,
      });
      for (const sg of [-1, 1]) {
        b.box("white_paint", dx + sg * 0.95, 0.7, dz - 0.1, 0.32, 2.9, 0.2, {
          seg: false,
          grime: 0.3,
        });
        for (let k = 0; k < 3; k++)
          b.box(
            "limestone",
            dx + sg * 0.95 + (k - 1) * 0.08,
            0.9,
            dz - 0.21,
            0.03,
            2.5,
            0.02,
            { seg: false },
          );
      }
      b.add(
        "lamp_warm",
        PF.shapeGeo(
          (() => {
            const sh = new THREE.Shape();
            sh.moveTo(-0.7, 0);
            sh.lineTo(0.7, 0);
            sh.absarc(0, 0, 0.7, 0, PI, false);
            return sh;
          })(),
          10,
        ),
        { m: PF.m4(dx, 3.2, dz - 0.03, PI), uv: "keep", noAO: true },
      );
      for (let k = 0; k < 7; k++) {
        const a = (k / 6) * PI;
        b.beam(
          "white_paint",
          V3(dx, 3.2, dz - 0.06),
          V3(dx + Math.cos(a) * 0.7, 3.2 + Math.sin(a) * 0.7, dz - 0.06),
          0.03,
          0.03,
          {},
        );
      }
      b.box("white_paint", dx, 3.95, dz - 0.15, 2.4, 0.2, 0.35, { seg: false });
      K.pediment(b, "white_paint", dx, 4.15, dz - 0.18, 2.6, 0.8, 0.35, PI, {});
      for (let k = 0; k < 3; k++) {
        b.box(
          "granite",
          dx,
          0,
          dz - 0.5 - k * 0.32,
          2.4,
          0.7 - k * 0.23,
          0.34,
          { seg: false, grime: 0.5 },
        );
        PF.col(dx, dz - 0.5 - k * 0.32, 2.4, 0.34, 0, 0.7 - k * 0.23, 0, {
          surface: "concrete",
        });
      }
      // lanterns
      for (const sg of [-1, 1]) {
        b.beam(
          "iron",
          V3(dx + sg * 1.45, 2.6, dz),
          V3(dx + sg * 1.45, 2.6, dz - 0.5),
          0.05,
          0.05,
          {},
        );
        b.cyl(
          "lamp_warm",
          dx + sg * 1.45,
          2.05,
          dz - 0.5,
          0.13,
          0.11,
          0.42,
          6,
          { hSeg: 1, noAO: true },
        );
        b.cyl("iron", dx + sg * 1.45, 2.47, dz - 0.5, 0.02, 0.17, 0.14, 6, {
          hSeg: 1,
        });
        PF.glow(V3(dx + sg * 1.45, 2.3, dz - 0.5), 0xffc070, 1.5, null, {
          intensity: 1.3,
          flicker: 0.25,
        });
      }
      anchors.door = PF.anchor(dx, 0, dz - 1.8, 0); // facing the street, away from the doorcase
    }
    // hanging sign on an iron bracket at the corner + the 13-star flag
    {
      const sx = TX1 + 0.05,
        sz = TZ0 + 1.2;
      b.beam("iron", V3(sx, 5.9, sz), V3(sx + 1.9, 5.9, sz), 0.07, 0.07, {});
      b.beam("iron", V3(sx, 5.2, sz), V3(sx + 1.2, 5.85, sz), 0.05, 0.05, {});
      const sk = PF.texMat(
        "ft_sign",
        PF.canvasTex(
          "pf_ft_sign",
          512,
          384,
          (ctx, w, h) => {
            ctx.fillStyle = "#1e3a2a";
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = "#c8a050";
            ctx.lineWidth = 10;
            ctx.strokeRect(12, 12, w - 24, h - 24);
            ctx.fillStyle = "#e8d8a8";
            ctx.textAlign = "center";
            ctx.font = "bold 64px Georgia, serif";
            ctx.fillText("FRAUNCES", w / 2, 120);
            ctx.fillText("TAVERN", w / 2, 200);
            ctx.font = "italic 40px Georgia, serif";
            ctx.fillStyle = "#c8a050";
            ctx.fillText("Est. 1762", w / 2, 270);
            ctx.font = "bold 26px Georgia";
            ctx.fillText("ALE · GROG · ROOMS · RUMOURS", w / 2, 330);
            for (let i = 0; i < 60; i++) {
              ctx.fillStyle = "rgba(20,14,8," + Math.random() * 0.3 + ")";
              ctx.beginPath();
              ctx.arc(
                Math.random() * w,
                Math.random() * h,
                2 + Math.random() * 14,
                0,
                TAU,
              );
              ctx.fill();
            }
          },
          { clamp: true },
        ),
        { rough: 0.8 },
      );
      b.box("oak", sx + 1.2, 4.35, sz, 1.5, 1.1, 0.08, { seg: false });
      b.quad(sk, sx + 1.2, 4.9, sz + 0.045, 1.4, 1.05, { ry: 0 });
      b.quad(sk, sx + 1.2, 4.9, sz - 0.045, 1.4, 1.05, { ry: PI });
      for (const dx of [0.65, 1.75])
        b.beam(
          "iron",
          V3(sx + dx, 5.9, sz),
          V3(sx + dx, 5.45, sz),
          0.02,
          0.02,
          {},
        );
      // flagpole from the north facade, 2nd floor
      const fx = 97.1,
        fz = TZ0 - 0.1;
      b.beam(
        "white_paint",
        V3(fx, 7.4, fz),
        V3(fx, 9.6, fz - 2.3),
        0.07,
        0.07,
        {},
      );
      const flagK = PF.texMat("ft_flag", PF.flagTex(0), {
        rough: 0.9,
        side: THREE.DoubleSide,
      });
      b.quad(flagK, fx + 0.9, 8.75, fz - 1.8, 1.8, 1.05, {
        ry: -HP * 0.2,
        rz: -0.25,
        grime: 0.3,
      });
    }
    // sidewalk dressing: chalkboard, barrels, hitching post, bench
    const chalk = PF.texMat(
      "ft_chalk",
      PF.signTex(
        "ft_chalk",
        ["TONIGHT:", "FIDDLE & GROG", "NO ROBOTS*", "*except George"],
        "engraved",
        256,
        320,
        { bg: "#1c201c", fg: "#e8e8e0" },
      ),
    );
    b.box("oak", 102.4, 0, TZ0 - 1.3, 0.7, 1.1, 0.05, { rx: -0.2, seg: false });
    b.quad(chalk, 102.4, 0.62, TZ0 - 1.35, 0.6, 0.78, { ry: PI, rx: 0.2 });
    PF.barrel(b, 95, 0, TZ0 - 1.0, {});
    PF.barrel(b, 95.7, 0, TZ0 - 1.3, {});
    PF.bench(b, 106, 0, TZ0 - 1.4, PI);
    anchors.guard = PF.anchor(98.2, 0, TZ0 - 2.2, PI);

    // ---------------- the rest of the block: four row buildings ----------------
    const rowB = [
      { x0: 56, x1: 65, h: 16, key: "brick_brown", trim: "limestone" },
      { x0: 65, x1: 73, h: 13, key: "brick_tan", trim: "white_paint" },
      { x0: 73, x1: 83, h: 18.5, key: "brick", trim: "limestone" },
      { x0: 83, x1: 89.5, h: 12.5, key: "brick_white", trim: "paint_teal" },
    ];
    for (const rb of rowB) {
      const p = [
        [rb.x0, TZ0],
        [rb.x1, TZ0],
        [rb.x1, TZ1],
        [rb.x0, TZ1],
      ];
      K.prismBands(b, rb.key, p, 0, rb.h, 4.5, { grime: 0.55 });
      PF.colMM(rb.x0, 0, TZ0 - 0.1, rb.x1, rb.h, TZ1, { walkable: false });
      b.boxMM(
        rb.trim,
        rb.x0 - 0.1,
        rb.h - 0.7,
        TZ0 - 0.55,
        rb.x1 + 0.1,
        rb.h,
        TZ0,
        { seg: false, grime: 0.5 },
      );
      for (let x = rb.x0 + 0.4; x < rb.x1; x += 0.8)
        b.box(rb.trim, x, rb.h - 1.0, TZ0 - 0.35, 0.18, 0.3, 0.3, {
          seg: false,
        });
      K.polyWindows(b, p, {
        y0: 5.0,
        floors: Math.floor((rb.h - 5.5) / 3.2),
        floorH: 3.2,
        w: 1.0,
        h: 1.9,
        spacing: 2.3,
        frameKey: rb.trim,
        sill: true,
        lintel: true,
        broken: 0.3,
        boarded: 0.12,
        seed: rb.x0,
        skipEdge: (i) => i !== 0 && i !== 2,
        margin: 1.0,
      });
      // shopfront: cast-iron piers, boarded display windows, awning ribs
      b.boxMM(
        "iron",
        rb.x0 + 0.2,
        0,
        TZ0 - 0.25,
        rb.x1 - 0.2,
        0.5,
        TZ0 - 0.05,
        { seg: false },
      );
      for (const x of [rb.x0 + 0.3, rb.x1 - 0.3])
        b.box("iron", x, 0, TZ0 - 0.2, 0.4, 4.0, 0.3, { seg: false });
      b.boxMM(
        "iron",
        rb.x0 + 0.2,
        3.8,
        TZ0 - 0.3,
        rb.x1 - 0.2,
        4.4,
        TZ0 - 0.05,
        { seg: false },
      );
      b.quad(
        r() < 0.5 ? "planks" : "glass_broken",
        (rb.x0 + rb.x1) / 2,
        2.2,
        TZ0 - 0.06,
        rb.x1 - rb.x0 - 1.2,
        3.1,
        { ry: PI, uv: "box", noAO: true },
      );
      for (let x = rb.x0 + 1; x < rb.x1 - 0.5; x += 1.4)
        b.beam(
          "rust",
          V3(x, 3.6, TZ0 - 0.1),
          V3(x, 3.1, TZ0 - 1.6),
          0.04,
          0.04,
          {},
        );
    }
    const shops = [
      ["FRAUNCES MARKET — COURTYARD →", "#1e3a2a", "#e8d8a8", 60.5],
      ["PEARL ST. CHANDLERY", "#3a1e1a", "#e0c8a0", 69],
      ["BROAD STREET SAVINGS", "#1c2230", "#c8c8b0", 78],
      ["HOT COFFEE 5¢", "#5a1a14", "#f0e0c0", 86.2],
    ];
    for (const [t, bg, fg, x] of shops) {
      const k = PF.texMat(
        "ft_shop_" + x,
        PF.signTex("ft_shop_" + x, [t], "enamel", 512, 96, { bg, fg }),
      );
      b.quad(k, x, 4.1, TZ0 - 0.33, 5.0, 0.55, { ry: PI });
    }
    // fire escapes on the tallest one
    for (let f = 0; f < 4; f++) {
      const y = 5.0 + f * 3.2 - 0.3;
      b.boxMM("iron", 74, y, TZ0 - 1.3, 82, y + 0.08, TZ0 - 0.05, {
        seg: false,
      });
      PF.railing(
        b,
        [
          [74, TZ0 - 1.3],
          [82, TZ0 - 1.3],
        ],
        y,
        0.9,
        "iron",
      );
      if (f < 3)
        b.beam(
          "iron",
          V3(75, y, TZ0 - 1.0),
          V3(77.5, y + 3.2, TZ0 - 1.0),
          0.5,
          0.06,
          {},
        );
    }

    // ---------------- alley + back courtyard (the settlement) ----------------
    // alley between the row and the tavern (x 89.5..92)
    b.boxMM("cobble", 89.5, 0, TZ0, 92, 0.06, TZ1, { grime: 0.6 });
    D.papers(b, 90.7, 0.06, 862, 1.0, 10, 88);
    PF.barrel(b, 90.2, 0, 866.5, {});
    const arrow = PF.texMat(
      "ft_alley",
      PF.signTex(
        "ft_alley",
        ["MARKET & WATER", "THROUGH HERE ↓"],
        "raider",
        512,
        192,
        { bg: "#d8d0b8", fg: "#1e3a2a" },
      ),
    );
    b.quad(arrow, 89.47, 2.6, 859.5, 1.4, 0.52, { ry: HP });
    // courtyard walls (brick) with a south gate onto the street
    const CZ0 = TZ1,
      CZ1 = site.z1 - 0.4;
    for (const [x0, z0, x1, z1] of [
      [site.x0 + 0.3, CZ1, 76, CZ1],
      [81, CZ1, site.x1 - 0.3, CZ1],
      [site.x0 + 0.3, CZ0, site.x0 + 0.3, CZ1],
      [site.x1 - 0.3, CZ0, site.x1 - 0.3, CZ1],
    ]) {
      const len = Math.hypot(x1 - x0, z1 - z0),
        ry = Math.atan2(-(z1 - z0), x1 - x0);
      b.box("brick_fed", (x0 + x1) / 2, 0, (z0 + z1) / 2, len, 2.6, 0.5, {
        ry,
        seg: false,
        grime: 0.6,
      });
      b.box(
        "limestone",
        (x0 + x1) / 2,
        2.6,
        (z0 + z1) / 2,
        len + 0.1,
        0.15,
        0.62,
        { ry, seg: false },
      );
      PF.colWall(x0, z0, x1, z1, 0.5, 0, 2.8, { walkable: false });
    }
    // scrap-metal gate leaves
    PF.scrapWall(b, 76, CZ1 - 0.1, 77.2, CZ1 - 1.2, 2.3, {
      noCollide: true,
      noClutter: true,
      seed: 5,
    });
    // stalls, purifier, still, tables, string lights, coop, laundry
    D.stall(b, 62, 877.5, PI, 3.4, 2.2, {
      goods: "bottles",
      sign: "GROG & WATER",
      seed: 1,
    });
    D.stall(b, 70, 877.5, PI, 3.4, 2.2, {
      goods: "junk",
      sign: "SCRAP & SUNDRIES",
      seed: 2,
    });
    D.stall(b, 104.5, 882, -HP, 3.0, 2.2, {
      goods: "cans",
      sign: "NAN'S PANTRY",
      seed: 3,
    });
    // water purifier: big tank + pipes + pump
    b.cyl("rust", 60, 0, 885, 1.3, 1.3, 3.2, 12, { hSeg: 2 });
    b.cyl("rust", 60, 3.2, 885, 0.1, 1.35, 0.6, 12, { hSeg: 1 });
    b.beam("iron", V3(61.2, 2.5, 885), V3(64, 2.5, 885), 0.14, 0.14);
    b.beam("iron", V3(64, 2.5, 885), V3(64, 0, 885), 0.14, 0.14);
    b.box("panel", 64.8, 0, 885, 1.2, 1.4, 1.0, { seg: false });
    b.sphere("lamp_green", 64.8, 1.5, 885.2, 0.07, { ws: 5, hs: 4 });
    PF.col(60, 885, 2.6, 2.6, 0, 3.8, 0, { walkable: false });
    PF.col(64.8, 885, 1.2, 1.0, 0, 1.4, 0, { walkable: false });
    // copper still
    b.cyl("copper", 86, 0, 885.5, 0.8, 0.9, 1.4, 12, { hSeg: 1 });
    b.sphere("copper", 86, 1.5, 885.5, 0.75, { ws: 10, hs: 6, phiLen: PI / 2 });
    b.rod("copper", V3(86, 2.1, 885.5), V3(87.6, 1.6, 885.5), 0.08, 6);
    b.cyl("rotten", 88, 0, 885.5, 0.45, 0.45, 1.1, 10, { hSeg: 1 });
    b.box("fire", 86, 0.05, 884.7, 0.6, 0.25, 0.1, { seg: false });
    PF.col(86.8, 885.5, 3, 1.8, 0, 1.8, 0, { walkable: false });
    // picnic tables & benches
    for (const [x, z] of [
      [76, 879],
      [83, 879.5],
      [95, 880],
      [91, 884.5],
    ]) {
      b.box("rotten", x, 0.72, z, 2.2, 0.07, 0.9, { seg: false, grime: 0.5 });
      for (const sg of [-1, 1]) {
        b.box("rotten", x, 0.42, z + sg * 0.75, 2.2, 0.06, 0.3, { seg: false });
        b.box("iron", x + sg * 0.9, 0, z, 0.06, 0.72, 1.6, { seg: false });
      }
      PF.col(x, z, 2.2, 1.8, 0, 0.75, 0, { walkable: false });
      if (r() < 0.7)
        b.cyl(
          "chrome",
          x + (r() - 0.5),
          0.79,
          z + (r() - 0.5) * 0.4,
          0.05,
          0.05,
          0.14,
          6,
          { hSeg: 1 },
        );
    }
    D.stringLights(
      b,
      V3(site.x0 + 1, 3.2, 874),
      V3(88, 3.4, 887),
      0.6,
      18,
      0xffd090,
    );
    D.stringLights(
      b,
      V3(TX0, 4.2, TZ1 + 0.3),
      V3(66, 3.4, 887.5),
      0.7,
      16,
      0xffd090,
    );
    PF.barrel(b, 80, 0, 883, { fire: true });
    // chicken coop & laundry
    b.boxMM("rotten", 97.5, 0, 884.5, 100.5, 1.4, 887.5, {
      seg: false,
      grime: 0.7,
    });
    b.box("corrugated", 99, 1.4, 886, 3.4, 0.08, 3.4, { rz: 0.15, seg: false });
    PF.colMM(97.5, 0, 884.5, 100.5, 1.4, 887.5, { walkable: false });
    for (let i = 0; i < 6; i++)
      b.box(
        r() < 0.5 ? "linen" : "fabric",
        72 + i * 1.1,
        1.9,
        886.8,
        0.8,
        0.9,
        0.03,
        { seg: false, c: [0xd8d0c0, 0x8a6a4a, 0x6a7a9a][i % 3] },
      );
    b.beam("rope", V3(70.5, 2.5, 886.8), V3(79, 2.5, 886.8), 0.02, 0.02);
    // cellar bulkhead doors against the tavern's back wall (the smugglers' tunnel exit)
    b.box("oak", 99, 0, TZ1 + 0.9, 1.8, 0.7, 1.6, {
      rx: -0.45,
      seg: false,
      grime: 0.6,
    });
    b.box("iron", 99, 0.45, TZ1 + 0.85, 0.08, 0.06, 1.5, {
      rx: -0.45,
      seg: false,
    });
    PF.col(99, TZ1 + 0.8, 1.9, 1.6, 0, 0.6, 0, { surface: "wood" });
    anchors.bulkhead = PF.anchor(99, 0, TZ1 + 2.6, PI);
    anchors.court = PF.anchor(83, 0, 881, 0);
    anchors.merchant2 = PF.anchor(62, 0, 879.4, 0);
    anchors.npc_court1 = PF.anchor(95, 0, 881.5, PI);
    anchors.guard2 = PF.anchor(78.5, 0, CZ1 - 1.2, 0);
    D.crates(b, 66, 0, 884.5, 3, 7, true);
    D.crates(b, 67.1, 0, 885.3, 2, 8, true);
    courtyardSettlement(b, site, anchors, CZ1);
    b.build(root);
    return anchors;
  }

  // ===================================================================
  // FRAUNCES MARKET — the settlement proper (a walled trading yard):
  // scrap gate arch, NE watchtower with stairs + searchlight, bunk shacks
  // against the row-house backs, potato / plum garden fed by the purifier,
  // a cook-fire with a roasting spit, the jobs board, a rooftop water tower.
  // Everything merges into the exterior batch (no new materials but 2 signs).
  // ===================================================================
  function courtyardSettlement(b, site, anchors, CZ1) {
    const r = PF.rng("ft_market");
    /** position-keyed lumpy displacement for PF deform (duplicated seam vertices move together). */
    const lump = (k) => (v) => {
      v.multiplyScalar(
        1 +
          k *
            0.5 *
            Math.sin(v.x * 13.1 + v.y * 7.7 + v.z * 5.3) *
            Math.cos(v.x * 4.3 - v.z * 9.1),
      );
    };
    // ---- the gate arch over the south gate (x 76..81) ----
    {
      const gx0 = 75.55,
        gx1 = 81.45,
        gz = CZ1,
        top = 5.4;
      for (const x of [gx0, gx1]) {
        b.box("rust", x, 0, gz, 0.34, top, 0.34, { seg: false, grime: 0.6 }); // I-beam posts
        b.box("iron", x, 0, gz, 0.12, top + 0.25, 0.42, { seg: false });
        PF.col(x, gz, 0.5, 0.5, 0, top, 0, {
          walkable: false,
          surface: "metal",
        });
        b.beam(
          "rust",
          V3(x, top - 1.2, gz),
          V3(x + (x < 78 ? 0.9 : -0.9), top - 0.35, gz),
          0.1,
          0.1,
          {},
        ); // knee braces
      }
      b.box(
        "rust",
        (gx0 + gx1) / 2,
        top - 0.35,
        gz,
        gx1 - gx0 + 0.6,
        0.3,
        0.3,
        { seg: false, grime: 0.6 },
      );
      const outK = PF.texMat(
        "ft_gate_out",
        PF.signTex("ft_gate_out", ["FRAUNCES MARKET"], "raider", 1024, 176, {
          bg: "#5a5a4e",
          fg: "#e8d8a8",
        }),
        { rough: 0.8 },
      );
      const inK = PF.texMat(
        "ft_gate_in",
        PF.signTex(
          "ft_gate_in",
          ["NO FIGHTING · NO SLAVERS", "COME BACK SOON"],
          "raider",
          1024,
          176,
          { bg: "#4e5448", fg: "#d8c890" },
        ),
        { rough: 0.8 },
      );
      const cx = (gx0 + gx1) / 2,
        sy = top - 1.25;
      b.box("corrugated", cx, sy - 0.05, gz, 5.4, 1.0, 0.08, {
        rz: 0.03,
        seg: false,
        grime: 0.7,
      });
      b.quad(outK, cx, sy + 0.45, gz + 0.05, 5.2, 0.9, {
        ry: 0,
        rz: 0.03,
        grime: 0.2,
      });
      b.quad(inK, cx, sy + 0.45, gz - 0.05, 5.2, 0.9, {
        ry: PI,
        rz: -0.03,
        grime: 0.2,
      });
      for (const sg of [-1, 1])
        b.beam(
          "iron",
          V3(cx + sg * 2.4, sy + 0.95, gz),
          V3(cx + sg * 2.4, top - 0.35, gz),
          0.03,
          0.03,
          {},
        );
      // bulbs along the top of the sign, a few dead
      for (let i = 0; i < 11; i++) {
        const x = cx - 2.5 + i * 0.5;
        b.sphere(
          i % 4 === 2 ? "glass_broken" : "lamp_warm",
          x,
          sy + 1.0,
          gz + 0.1,
          0.07,
          { ws: 6, hs: 4, noAO: true, grime: 0 },
        );
      }
      PF.glow(V3(cx - 1.2, sy + 1.0, gz + 0.3), 0xffc070, 1.2, null, {
        intensity: 1.0,
        flicker: 0.15,
      });
      PF.glow(V3(cx + 1.3, sy + 1.0, gz + 0.3), 0xffc070, 1.2, null, {
        intensity: 1.0,
        flicker: 0.15,
      });
      // a stack of tyres inside the gate
      for (let i = 0; i < 3; i++)
        b.add("tire", new THREE.TorusGeometry(0.34, 0.13, 6, 12), {
          m: PF.m4(74.5, 0.13 + i * 0.25, gz - 1.0, 0, HP, 0),
        });
    }

    // ---- NE watchtower (platform y 4.4) with a plank stair along the east wall ----
    {
      const x0 = 105.9,
        x1 = 109.4,
        z0 = 884.6,
        z1 = 888.25,
        py = 4.4;
      for (const [x, z] of [
        [x0 + 0.15, z0 + 0.15],
        [x1 - 0.15, z0 + 0.15],
        [x0 + 0.15, z1 - 0.15],
        [x1 - 0.15, z1 - 0.15],
      ]) {
        b.box("rotten", x, 0, z, 0.22, py + 2.5, 0.22, {
          seg: false,
          grime: 0.6,
        });
        PF.col(x, z, 0.26, 0.26, 0, py + 2.4, 0, {
          walkable: false,
          surface: "wood",
        });
      }
      // X-bracing on the two outer faces
      for (const [a, c] of [
        [
          [x0 + 0.15, z1 - 0.15],
          [x1 - 0.15, z1 - 0.15],
        ],
        [
          [x0 + 0.15, z0 + 0.15],
          [x0 + 0.15, z1 - 0.15],
        ],
      ]) {
        b.beam(
          "rotten",
          V3(a[0], 0.3, a[1]),
          V3(c[0], py - 0.2, c[1]),
          0.1,
          0.1,
          {},
        );
        b.beam(
          "rotten",
          V3(c[0], 0.3, c[1]),
          V3(a[0], py - 0.2, a[1]),
          0.1,
          0.1,
          {},
        );
      }
      b.boxMM("planks", x0, py - 0.16, z0, x1, py, z1, { grime: 0.6 });
      PF.colMM(x0, py - 0.16, z0, x1, py, z1, { surface: "wood" });
      // parapet of scrap sheet (open at the stair head, NE corner)
      PF.scrapWall(b, x0 + 0.05, z1 - 0.05, x1 - 0.05, z1 - 0.05, 1.15, {
        y: py,
        seed: 71,
        noSpikes: true,
      });
      PF.scrapWall(b, x0 + 0.05, z0 + 0.05, x0 + 0.05, z1 - 0.05, 1.15, {
        y: py,
        seed: 72,
        noSpikes: true,
      });
      PF.scrapWall(b, x0 + 0.05, z0 + 0.05, x1 - 1.35, z0 + 0.05, 1.15, {
        y: py,
        seed: 73,
        noSpikes: true,
      });
      PF.sandbags(b, x0 + 0.5, z1 - 0.45, x1 - 0.4, z1 - 0.45, 2, {
        y: py,
        noCollide: true,
      });
      // tin roof on the posts
      b.box(
        "corrugated",
        (x0 + x1) / 2,
        py + 2.45,
        (z0 + z1) / 2,
        x1 - x0 + 0.9,
        0.06,
        z1 - z0 + 0.9,
        { rx: -0.12, seg: false, grime: 0.7 },
      );
      // searchlight on a pivot, aimed out over Pearl Street
      {
        const sx = x0 + 0.8,
          sz = z1 - 0.9,
          sY = py + 1.35;
        b.cyl("iron", sx, py, sz, 0.05, 0.1, 1.0, 6, { hSeg: 1 });
        const ry = 0.55,
          rx = HP - 0.22;
        const M = PF.m4(sx, sY, sz, ry, rx, 0);
        b.add("steel", new THREE.CylinderGeometry(0.34, 0.4, 0.7, 12, 1), {
          m: M,
          grime: 0.4,
        });
        const lens = new THREE.CircleGeometry(0.31, 14);
        lens.rotateX(-HP);
        lens.translate(0, 0.351, 0);
        b.add("lamp", lens, { m: M, noAO: true, grime: 0 });
        const d = V3(0, 1, 0).applyEuler(new THREE.Euler(rx, ry, 0, "YXZ"));
        PF.glow(
          V3(sx + d.x * 0.5, sY + d.y * 0.5, sz + d.z * 0.5),
          0xfff0c8,
          2.2,
          null,
          { intensity: 1.3 },
        );
      }
      // settlement flag on a pipe mast at the corner
      b.beam(
        "iron",
        V3(x1 - 0.15, py + 2.4, z1 - 0.15),
        V3(x1 - 0.15, py + 5.2, z1 - 0.15),
        0.06,
        0.06,
        {},
      );
      const flagK = PF.texMat("ft_flag", PF.flagTex(0), {
        rough: 0.9,
        side: THREE.DoubleSide,
      });
      b.quad(flagK, x1 - 0.15 - 0.8, py + 4.6, z1 - 0.15, 1.6, 0.95, {
        ry: 0.3,
        rz: -0.08,
        grime: 0.3,
      });
      // the stair: treads on two stringers climbing north → south along the east wall, a rope handrail
      const sx0 = 108.2,
        sx1 = 109.35,
        zs = 877.0,
        run = z0 - zs,
        n = 14,
        rise = py / n,
        step = run / n;
      for (let i = 0; i < n; i++) {
        const top = rise * (i + 1),
          zc = zs + step * (i + 0.5);
        b.boxMM(
          "planks",
          sx0,
          top - 0.07,
          zc - step / 2 - 0.02,
          sx1,
          top,
          zc + step / 2 + 0.02,
          { seg: false, grime: 0.55 },
        );
        PF.colMM(sx0, 0, zc - step / 2, sx1, top, zc + step / 2, {
          surface: "wood",
        });
      }
      for (const x of [sx0 + 0.05, sx1 - 0.05])
        b.beam("rotten", V3(x, -0.1, zs), V3(x, py - 0.1, z0), 0.08, 0.26, {});
      b.box("rotten", sx0 + 0.05, 0, zs + run * 0.5, 0.14, py * 0.5, 0.14, {
        seg: false,
      });
      b.beam(
        "rope",
        V3(sx0 + 0.02, 1.0, zs + 0.2),
        V3(sx0 + 0.02, py + 1.0, z0 - 0.1),
        0.03,
        0.03,
        {},
      );
      for (const t of [0.1, 0.5, 0.9])
        b.beam(
          "rotten",
          V3(sx0 + 0.02, py * t, zs + run * t),
          V3(sx0 + 0.02, py * t + 1.0, zs + run * t),
          0.05,
          0.05,
          {},
        );
      anchors.tower = PF.anchor(107.3, py, 887.2, PI);
      anchors.tower_foot = PF.anchor(108.8, 0, 876.2, 0);
    }

    // ---- bunk shacks against the row-house backs (x 73.4..79.4 and 80.6..88.6, z 872.1..875.7) ----
    const shack = (x0, x1, doorX, sign, seed) => {
      const zb = TZ1 + 0.1,
        zf = TZ1 + 3.6,
        hB = 2.9,
        hF = 2.35;
      PF.scrapWall(b, x0, zb, x0, zf, hF, { seed: seed, noSpikes: true });
      PF.scrapWall(b, x1, zb, x1, zf, hF, { seed: seed + 1, noSpikes: true });
      PF.scrapWall(b, x0, zf, doorX - 0.55, zf, hF, {
        seed: seed + 2,
        noSpikes: true,
      });
      PF.scrapWall(b, doorX + 0.55, zf, x1, zf, hF, {
        seed: seed + 3,
        noSpikes: true,
      });
      // lintel + sheet above the door, hanging blanket
      b.box("rust", doorX, 2.0, zf, 1.3, 0.35, 0.1, { seg: false, grime: 0.7 });
      b.box("fabric", doorX - 0.25, 0.25, zf + 0.06, 0.55, 1.75, 0.03, {
        rz: 0.05,
        seg: false,
        c: 0x6a5a48,
        grime: 0.7,
      });
      // sloping roof: corrugated sheets with overhang, weighted with tyres & bricks
      const len = zf - zb + 0.6,
        ang = Math.atan2(hB - hF, zf - zb);
      for (let x = x0 - 0.2; x < x1 + 0.1; x += 1.25) {
        b.box(
          r() < 0.3 ? "rust" : "corrugated",
          Math.min(x + 0.65, x1 + 0.2 - 0.62),
          (hB + hF) / 2 - 0.02,
          (zb + zf) / 2 + 0.2,
          1.35,
          0.05,
          len,
          { rx: ang, seg: false, grime: 0.7 },
        );
      }
      b.add("tire", new THREE.TorusGeometry(0.33, 0.12, 6, 12), {
        m: PF.m4(
          (x0 + x1) / 2 - 1,
          (hB + hF) / 2 + 0.1,
          (zb + zf) / 2,
          0,
          HP - ang,
          0,
        ),
      });
      b.box(
        "brick_fed",
        (x0 + x1) / 2 + 1.2,
        (hB + hF) / 2 + 0.02,
        (zb + zf) / 2 + 0.3,
        0.4,
        0.14,
        0.2,
        { rx: ang, seg: false },
      );
      // stovepipe
      b.cyl("iron", x1 - 0.6, hB - 0.6, zb + 0.6, 0.1, 0.1, 1.8, 6, {
        hSeg: 1,
      });
      // inside: two mattresses, a crate table, a lamp
      D.mattress(
        b,
        x0 + 0.75,
        0.06,
        (zb + zf) / 2,
        0,
        [0x8a7a5a, 0x6a6a5a][seed % 2],
      );
      D.mattress(b, x1 - 0.75, 0.06, (zb + zf) / 2, 0, 0x7a6a50);
      b.box("crate", (x0 + x1) / 2 + 0.3, 0.06, zb + 0.7, 0.6, 0.55, 0.6, {
        ry: 0.2,
        seg: false,
      });
      b.sphere("lamp_warm", (x0 + x1) / 2 + 0.3, 0.75, zb + 0.7, 0.08, {
        ws: 6,
        hs: 4,
        noAO: true,
      });
      PF.glow(V3((x0 + x1) / 2 + 0.3, 0.9, zb + 0.7), 0xffb060, 0.9, null, {
        intensity: 0.8,
        flicker: 0.3,
      });
      const sk = PF.texMat(
        "ft_shack_" + seed,
        PF.signTex("ft_shack_" + seed, sign, "raider", 512, 160, {
          bg: "#b8ae94",
          fg: "#3a2a1a",
          outline: false,
        }),
        { rough: 0.9 },
      );
      b.quad(sk, doorX + 1.4, 1.75, zf + 0.07, 1.2, 0.38, { ry: 0, rz: -0.04 });
    };
    shack(73.4, 79.4, 75.2, ["BUNKS 5 SCRIP"], 11);
    shack(80.6, 88.6, 82.3, ["FAMILIES ONLY"], 12);

    // ---- potato & plum garden (SW), watered from the purifier ----
    {
      for (const bx of [52.2, 54.5, 56.8]) {
        b.boxMM("planks", bx - 0.8, 0, 880.2, bx + 0.8, 0.42, 887.6, {
          seg: false,
          grime: 0.7,
        });
        b.boxMM("dirt", bx - 0.7, 0.42, 880.3, bx + 0.7, 0.46, 887.5, {
          seg: false,
          grime: 0.3,
        });
        PF.colMM(bx - 0.8, 0, 880.2, bx + 0.8, 0.46, 887.6, {
          surface: "dirt",
        });
        for (let z = 880.9; z < 887.2; z += 0.85) {
          const px = bx + (r() - 0.5) * 0.3,
            pz = z + (r() - 0.5) * 0.2;
          if (bx !== 54.5) {
            // potato: a low clump of broad leaves with a knobbly tuber showing
            for (let k = 0; k < 4; k++) {
              const a = (k / 4) * TAU + r();
              b.sphere(
                "moss",
                px + Math.cos(a) * 0.14,
                0.62,
                pz + Math.sin(a) * 0.14,
                0.18,
                { ws: 6, hs: 4, sx: 1.3, sy: 0.35, sz: 0.7, ry: a, grime: 0.2 },
              );
            }
            b.cyl("bark", px, 0.46, pz, 0.02, 0.04, 0.35, 5, { hSeg: 1 });
            if (r() < 0.6)
              b.sphere("paint_orange", px + 0.12, 0.5, pz - 0.1, 0.07, {
                ws: 5,
                hs: 4,
                deform: lump(0.3),
                grime: 0.6,
              });
          } else {
            // plum: a crooked sapling, a leaf canopy, purple fruit
            const h = 1.2 + r() * 0.5,
              lean = (r() - 0.5) * 0.3;
            b.beam(
              "bark",
              V3(px, 0.44, pz),
              V3(px + lean, 0.44 + h, pz),
              0.06,
              0.06,
              {},
            );
            b.sphere("moss", px + lean, 0.44 + h + 0.1, pz, 0.42, {
              ws: 7,
              hs: 5,
              sy: 0.6,
              deform: lump(0.25),
              grime: 0.3,
            });
            for (let k = 0; k < 3; k++)
              b.sphere(
                "velvet",
                px + lean + (r() - 0.5) * 0.6,
                0.3 + h,
                pz + (r() - 0.5) * 0.6,
                0.07,
                { ws: 5, hs: 4 },
              );
          }
        }
      }
      // irrigation: pipe from the purifier, drip hoses along each bed
      b.beam("iron", V3(58.7, 0.35, 885), V3(57.8, 0.35, 885), 0.08, 0.08, {});
      b.beam(
        "iron",
        V3(57.8, 0.5, 879.7),
        V3(51.4, 0.5, 879.7),
        0.06,
        0.06,
        {},
      );
      b.beam("iron", V3(57.8, 0.35, 885), V3(57.8, 0.5, 879.7), 0.08, 0.08, {});
      for (const bx of [52.2, 54.5, 56.8])
        b.beam("tire", V3(bx, 0.5, 879.7), V3(bx, 0.48, 887.4), 0.03, 0.03, {});
      // watering can, spade, sign
      b.cyl("steel", 58.1, 0, 881.2, 0.14, 0.16, 0.3, 8, { hSeg: 1 });
      b.beam(
        "steel",
        V3(58.1, 0.2, 881.35),
        V3(58.1, 0.42, 881.75),
        0.03,
        0.03,
        {},
      );
      b.beam(
        "rotten",
        V3(58.2, 0, 882.6),
        V3(58.35, 1.3, 882.8),
        0.04,
        0.04,
        {},
      );
      b.box("steel", 58.2, 0, 882.55, 0.22, 0.3, 0.03, {
        rx: -0.1,
        seg: false,
      });
      const gK = PF.texMat(
        "ft_garden",
        PF.signTex(
          "ft_garden",
          ["DON'T PICK", "THE SPUDS", "— DILLY"],
          "raider",
          256,
          192,
          { bg: "#c8bea4", fg: "#6a2a1a", outline: false },
        ),
        { rough: 0.9 },
      );
      b.box("rotten", 55.6, 0, 879.5, 0.06, 1.2, 0.06, { seg: false });
      b.quad(gK, 55.6, 1.25, 879.45, 0.7, 0.52, { ry: PI, rz: 0.05 });
      anchors.garden = PF.anchor(55.6, 0, 879.0, PI);
    }

    // ---- cook-fire with a roasting spit (centre of the yard) ----
    {
      const fx = 88.6,
        fz = 881.3;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU;
        b.rock(
          "rubble",
          fx + Math.cos(a) * 0.62,
          0,
          fz + Math.sin(a) * 0.62,
          0.2,
          { flat: 0.7, detail: 0 },
        );
      }
      for (let k = 0; k < 4; k++)
        b.box("bark", fx, 0.08, fz, 0.12, 0.12, 0.9, {
          ry: k * 0.8,
          rx: 0.12,
          seg: false,
        });
      b.box("fire", fx, 0.05, fz, 0.5, 0.18, 0.5, {
        seg: false,
        noAO: true,
        grime: 0,
      });
      for (const sg of [-1, 1]) {
        b.beam(
          "iron",
          V3(fx + sg * 0.85, 0, fz),
          V3(fx + sg * 0.85, 1.05, fz),
          0.05,
          0.05,
          {},
        );
        b.beam(
          "iron",
          V3(fx + sg * 0.85, 1.05, fz),
          V3(fx + sg * 0.95, 1.25, fz),
          0.04,
          0.04,
          {},
        );
      }
      b.rod("iron", V3(fx - 1.05, 1.02, fz), V3(fx + 1.15, 1.02, fz), 0.02, 5);
      b.beam(
        "iron",
        V3(fx + 1.15, 1.02, fz),
        V3(fx + 1.15, 0.8, fz),
        0.03,
        0.03,
        {},
      ); // crank
      // the roast: an ox haunch, charred
      b.sphere("bark", fx, 1.0, fz, 0.32, {
        ws: 9,
        hs: 6,
        sx: 1.7,
        sy: 0.85,
        sz: 0.9,
        deform: lump(0.2),
        grime: 0.8,
      });
      b.sphere("bone", fx + 0.62, 1.02, fz, 0.07, { ws: 5, hs: 4, sx: 1.6 });
      PF.fires.push(V3(fx, 0.25, fz));
      PF.col(fx, fz, 1.9, 1.3, 0, 1.1, 0, { walkable: false });
      // stools + a butcher block + a cooking pot on the embers
      for (const [x, z] of [
        [fx - 1.6, fz - 0.8],
        [fx + 1.6, fz - 0.9],
        [fx - 1.4, fz + 1.2],
      ]) {
        b.cyl("rotten", x, 0, z, 0.2, 0.22, 0.45, 8, { hSeg: 1 });
      }
      b.box("oak", fx + 1.9, 0, fz + 0.9, 0.9, 0.85, 0.7, {
        seg: false,
        grime: 0.7,
      });
      b.box("steel", fx + 1.85, 0.85, fz + 0.9, 0.3, 0.02, 0.06, {
        ry: 0.4,
        seg: false,
      });
      PF.col(fx + 1.9, fz + 0.9, 0.9, 0.7, 0, 0.85, 0, {
        walkable: false,
        surface: "wood",
      });
      anchors.cook_fire = PF.anchor(fx, 0, fz - 1.4, PI);
    }

    // ---- jobs board by the gate ----
    {
      const bx = 83.2,
        bz = CZ1 - 0.45;
      for (const sg of [-1, 1])
        b.box("rotten", bx + sg * 0.85, 0, bz, 0.1, 2.2, 0.1, { seg: false });
      b.box("planks", bx, 0.9, bz, 1.9, 1.2, 0.06, { seg: false, grime: 0.6 });
      b.box("corrugated", bx, 2.15, bz + 0.05, 2.1, 0.05, 0.5, {
        rx: 0.25,
        seg: false,
      });
      const jobK = PF.texMat(
        "ft_jobs",
        PF.canvasTex(
          "pf_ft_jobs",
          512,
          320,
          (ctx, w, h) => {
            ctx.fillStyle = "#5a4a36";
            ctx.fillRect(0, 0, w, h);
            const notes = [
              ["HELP WANTED", "Lottie Brennan", "missing @ Seaport"],
              ["REV. PENHALLOW", "needs a steady", "hand. Trinity"],
              ["BUYING", "SHELLBACK EGGS", "20 SCRIP — NAN"],
              ["DISCREET", "PROFESSIONAL", "ask for Mr. Vane"],
              ["LOST DOG", '"PATCHES"', "no reward sorry"],
              ["NO CHEMS", "IN THE YARD", "— Birdie"],
            ];
            notes.forEach((n, i) => {
              const x = 14 + (i % 3) * 166,
                y = 14 + Math.floor(i / 3) * 152,
                a = Math.sin(i * 7.3) * 0.06;
              ctx.save();
              ctx.translate(x + 74, y + 66);
              ctx.rotate(a);
              ctx.fillStyle = ["#e0d6b8", "#d8cfa8", "#cfc6a0"][i % 3];
              ctx.fillRect(-72, -64, 144, 130);
              ctx.fillStyle = "#a02a1a";
              ctx.beginPath();
              ctx.arc(0, -56, 5, 0, TAU);
              ctx.fill();
              ctx.fillStyle = "#2a2018";
              ctx.textAlign = "center";
              ctx.font = 'bold 19px "Courier New", monospace';
              n.forEach((t, k) => ctx.fillText(t, 0, -24 + k * 30));
              ctx.restore();
            });
          },
          { clamp: true },
        ),
        { rough: 0.9 },
      );
      b.quad(jobK, bx, 1.5, bz - 0.04, 1.8, 1.12, { ry: PI, grime: 0.2 });
      PF.col(bx, bz, 1.9, 0.2, 0, 2.2, 0, { walkable: false, surface: "wood" });
      anchors.jobs_board = PF.anchor(bx, 0, bz - 1.2, PI);
    }

    // ---- NYC wooden water tower on the tallest row house (x 73..83, h 18.5) ----
    {
      const wx = 79.5,
        wz = 866.5,
        wy = 18.5;
      for (const [dx, dz] of [
        [-1.2, -1.2],
        [1.2, -1.2],
        [-1.2, 1.2],
        [1.2, 1.2],
      ])
        b.box("iron", wx + dx, wy, wz + dz, 0.16, 2.6, 0.16, { seg: false });
      b.boxMM(
        "iron",
        wx - 1.6,
        wy + 2.5,
        wz - 1.6,
        wx + 1.6,
        wy + 2.62,
        wz + 1.6,
        { seg: false },
      );
      b.cyl("rotten", wx, wy + 2.62, wz, 1.55, 1.65, 3.6, 16, {
        hSeg: 1,
        grime: 0.7,
      });
      for (const y of [0.5, 1.6, 2.7, 3.4])
        b.cyl(
          "iron",
          wx,
          wy + 2.62 + y,
          wz,
          1.6 + (3.6 - y) * 0.028,
          1.6 + (3.6 - y) * 0.028,
          0.06,
          16,
          { hSeg: 1 },
        );
      b.cyl("tar", wx, wy + 6.2, wz, 0.1, 1.75, 1.1, 16, { hSeg: 1 });
      b.beam(
        "iron",
        V3(wx + 1.6, wy + 2.6, wz),
        V3(wx + 1.6, wy + 6.2, wz),
        0.05,
        0.05,
        {},
      );
    }
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  function buildInterior(cell, ext) {
    const O = cell.origin,
      ox = O.x,
      oy = O.y + BASE,
      oz = O.z;
    const X = (x) => ox + x,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PF.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const root = cell.root;
    const r = PF.rng("ft_int");
    const F2 = 4.2,
      F3 = 8.2,
      AT = 12.0,
      CEL = -3.6;
    const W = (key, ax, a0, a1, f0, f1, y0, y1, gaps, o) =>
      PF.wall(
        b,
        key,
        ax,
        ax === "x" ? X(a0) : Z(a0),
        ax === "x" ? X(a1) : Z(a1),
        ax === "x" ? Z(f0) : X(f0),
        ax === "x" ? Z(f1) : X(f1),
        oy + y0,
        oy + y1,
        (gaps || []).map((g) => ({
          c: ax === "x" ? X(g.c) : Z(g.c),
          w: g.w,
          y0: oy + g.y0,
          h: g.h,
        })),
        o,
      );
    const slab = (key, x0, z0, x1, z1, y, holes, o) => {
      // floor slab with rectangular holes (split into strips along x)
      const hs = (holes || []).slice();
      const xs = [x0, x1];
      for (const h of hs) xs.push(h[0], h[2]);
      xs.sort((p, q) => p - q);
      for (let i = 0; i < xs.length - 1; i++) {
        const a = xs[i],
          c = xs[i + 1];
        if (c - a < 0.01) continue;
        const mid = (a + c) / 2;
        const cut = hs
          .filter((h) => mid > h[0] && mid < h[2])
          .map((h) => [h[1], h[3]])
          .sort((p, q) => p[0] - q[0]);
        let z = z0;
        const segs = [];
        for (const k of cut) {
          if (k[0] > z) segs.push([z, k[0]]);
          z = Math.max(z, k[1]);
        }
        if (z < z1) segs.push([z, z1]);
        for (const [za, zb] of segs) {
          b.boxMM(
            key,
            X(a),
            oy + y - 0.4,
            Z(za),
            X(c),
            oy + y,
            Z(zb),
            o || { grime: 0.5 },
          );
          PF.colMM(X(a), oy + y - 0.4, Z(za), X(c), oy + y, Z(zb), {
            surface: "wood",
          });
        }
      }
    };

    // ---------------- lights ----------------
    const L = [];
    L.push({ x: X(-4), y: oy + 2.6, z: Z(-3), color: 0xffb060, r: 9, i: 0.75 }); // taproom lamps
    L.push({
      x: X(-4),
      y: oy + 2.6,
      z: Z(3.5),
      color: 0xffb060,
      r: 9,
      i: 0.65,
    });
    L.push({ x: X(-7.4), y: oy + 1.0, z: Z(1), color: 0xff8030, r: 7, i: 1.0 }); // fireplace
    L.push({ x: X(-4), y: oy + 2.2, z: Z(-6), color: 0xffc070, r: 6, i: 0.6 }); // bar back
    L.push({ x: X(6), y: oy + 1.2, z: Z(-6.5), color: 0xff8030, r: 6, i: 0.9 }); // kitchen hearth
    L.push({ x: X(5), y: oy + 2.8, z: Z(3.5), color: 0xffd090, r: 7, i: 0.5 }); // stair hall
    for (const x of [-5, 0, 5])
      L.push({
        x: X(x),
        y: oy + F2 + 2.4,
        z: Z(-3.8),
        color: 0xffd8a0,
        r: 7,
        i: 0.55,
      }); // long room
    L.push({
      x: X(-3),
      y: oy + F2 + 2.4,
      z: Z(3.5),
      color: 0xfff0d0,
      r: 8,
      i: 0.5,
    }); // gallery
    L.push({
      x: X(5),
      y: oy + F2 + 2.4,
      z: Z(3.5),
      color: 0xffd8a0,
      r: 7,
      i: 0.4,
    });
    for (const x of [-5.5, -0.5, 5])
      L.push({
        x: X(x),
        y: oy + F3 + 2.2,
        z: Z(-3.8),
        color: 0xffd090,
        r: 6,
        i: 0.5,
      }); // guest rooms
    L.push({
      x: X(-3),
      y: oy + F3 + 2.2,
      z: Z(4),
      color: 0xffe0b0,
      r: 7,
      i: 0.45,
    });
    L.push({
      x: X(0),
      y: oy + F3 + 2.2,
      z: Z(0.6),
      color: 0xffd8a0,
      r: 7,
      i: 0.4,
    });
    L.push({
      x: X(5),
      y: oy + F3 + 2.2,
      z: Z(4),
      color: 0xffd8a0,
      r: 6,
      i: 0.4,
    });
    L.push({
      x: X(0),
      y: oy + AT + 1.6,
      z: Z(0),
      color: 0xd0d8ff,
      r: 9,
      i: 0.45,
    }); // attic dormers
    L.push({
      x: X(-3),
      y: oy + CEL + 2.2,
      z: Z(-2),
      color: 0xffa050,
      r: 8,
      i: 0.6,
    }); // cellar
    L.push({
      x: X(4),
      y: oy + CEL + 2.2,
      z: Z(3),
      color: 0xffa050,
      r: 7,
      i: 0.5,
    });
    L.push({
      x: X(0),
      y: oy + CEL + 1.6,
      z: Z(11),
      color: 0xff9040,
      r: 6,
      i: 0.5,
    }); // tunnel
    const b = PF.batch("fraunces_int");
    b.ground = oy + CEL;
    b.aoH = 2.2;
    b.setLights(L, 0x908070, 0.1);

    // ---------------- shell: exterior walls G..F3, floors ----------------
    const EXT = "brick_fed";
    W(EXT, "x", -8.4, 8.4, -7.4, -7, 0, AT, [
      { c: -4.5, w: 1.1, y0: 1.2, h: 2.0 },
      { c: 0, w: 1.1, y0: 1.2, h: 2.0 },
      { c: -4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: 0, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: 4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: -5.5, w: 1.0, y0: F3 + 1.0, h: 1.6 },
      { c: -0.5, w: 1.0, y0: F3 + 1.0, h: 1.6 },
      { c: 5, w: 1.0, y0: F3 + 1.0, h: 1.6 },
    ]);
    W(EXT, "x", -8.4, 8.4, 7, 7.4, 0, AT, [
      { c: 5, w: 1.6, y0: 0, h: 2.6 },
      { c: -4.5, w: 1.1, y0: 1.2, h: 2.0 },
      { c: -1, w: 1.1, y0: 1.2, h: 2.0 },
      { c: -4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: -1, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: -4, w: 1.0, y0: F3 + 1.0, h: 1.6 },
    ]);
    PF.exitDoor(b, X(5), oy, Z(7.2), PI, 1.6, 2.6, {
      key: "oak",
      frame: "white_paint",
    }); // the front door onto Beaver Street, fanlight glowing
    W(EXT, "z", -7.4, 7.4, -8.4, -8, 0, AT, [
      { c: -3.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: 3.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
    ]);
    W(EXT, "z", -7.4, 7.4, 8, 8.4, 0, AT, [
      { c: 4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      { c: -4.5, w: 1.1, y0: 1.2, h: 2.0 },
    ]);
    // window glass/lit panes in those openings (warm daylight)
    const winQ = (x, y, z, ry) => {
      b.quad("lamp_warm", X(x), oy + y, Z(z), 1.0, 1.9, {
        ry,
        noAO: true,
        grime: 0,
      });
      for (const yy of [-0.45, 0.45])
        b.box(
          "white_paint",
          X(x),
          oy + y + yy,
          Z(z),
          ry === 0 || Math.abs(ry) === PI ? 1.0 : 0.04,
          0.04,
          ry === 0 || Math.abs(ry) === PI ? 0.04 : 1.0,
          { seg: false },
        );
    };
    for (const x of [-4.5, 0]) {
      winQ(x, 2.2, -7.3, 0);
      winQ(x, F2 + 2.1, -7.3, 0);
    }
    winQ(4.5, F2 + 2.1, -7.3, 0);
    for (const x of [-4.5, -1]) {
      winQ(x, 2.2, 7.3, PI);
      winQ(x, F2 + 2.1, 7.3, PI);
    }
    for (const z of [-3.5, 3.5]) winQ(-8.3, F2 + 2.1, z, HP);
    winQ(8.3, F2 + 2.1, 4.5, -HP);
    winQ(8.3, 2.2, -4.5, -HP);
    // floors: ground (plank), F2 (holes over flight A), F3 (hole over flight B), attic (hole over flight C)
    slab("planks", -8, -7, 8, 7, 0, [[2.4, -6.4, 3.6, -1]]);
    slab("planks", -8, -7, 8, 7, F2, [[6.6, 1.0, 8, 6.6]]);
    slab("planks", -8, -7, 8, 7, F3, [[2.0, 1.0, 3.4, 6.2]]);
    slab("planks", -8, -7, 8, 7, AT, [[6.6, 1.0, 8, 6.2]]);
    // ceiling beams (exposed) in the taproom and long room
    for (let x = -7.5; x <= 1.5; x += 1.5)
      b.box("mahogany", X(x), oy + F2 - 0.7, Z(0), 0.25, 0.3, 14, {
        seg: false,
        grime: 0.5,
      });
    for (let x = -7.2; x <= 7.2; x += 1.8)
      b.box("oak", X(x), oy + F3 - 0.7, Z(-3.7), 0.2, 0.28, 6.6, {
        seg: false,
        grime: 0.4,
      });

    // ================= GROUND FLOOR =================
    // partitions: x = 2 (taproom | kitchen & stair hall), z = 0 (kitchen | stair hall)
    W("plaster_clean", "z", -7, 7, 1.85, 2.15, 0, F2 - 0.4, [
      { c: -4, w: 1.2, y0: 0, h: 2.3 },
      { c: 3.6, w: 1.6, y0: 0, h: 2.5 },
    ]);
    W("plaster_clean", "x", 2.15, 8, -0.15, 0.15, 0, F2 - 0.4, [
      { c: 5.2, w: 1.2, y0: 0, h: 2.3 },
    ]);
    // wainscot + wallpaper band in the taproom
    b.boxMM("mahogany", X(-7.98), oy, Z(-6.98), X(-7.9), oy + 1.1, Z(6.98), {
      seg: false,
    });
    b.boxMM("mahogany", X(-7.98), oy, Z(6.9), X(1.84), oy + 1.1, Z(6.98), {
      seg: false,
    });
    // the bar: counter along the north wall, back shelves with bottles, taps, stools
    b.boxMM("mahogany", X(-7.4), oy, Z(-5.4), X(-1.2), oy + 1.1, Z(-4.7), {
      grime: 0.45,
    });
    b.boxMM("oak", X(-7.5), oy + 1.1, Z(-5.5), X(-1.1), oy + 1.18, Z(-4.6), {
      seg: false,
    });
    b.boxMM(
      "brass",
      X(-7.4),
      oy + 0.12,
      Z(-4.66),
      X(-1.2),
      oy + 0.18,
      Z(-4.6),
      { seg: false },
    ); // foot rail
    PF.colMM(X(-7.4), oy, Z(-5.4), X(-1.2), oy + 1.18, Z(-4.7), {
      walkable: false,
    });
    D.shelf(b, X(-4.3), oy + 0.2, Z(-6.75), 0, 5.6, 4, 17);
    b.boxMM(
      "mahogany",
      X(-7.2),
      oy + 2.3,
      Z(-6.95),
      X(-1.4),
      oy + 2.8,
      Z(-6.6),
      { seg: false },
    );
    for (let i = 0; i < 4; i++) {
      b.cyl("brass", X(-6 + i * 1.1), oy + 1.18, Z(-5.2), 0.03, 0.03, 0.35, 6, {
        hSeg: 1,
      });
      b.box("mahogany", X(-6 + i * 1.1), oy + 1.5, Z(-5.2), 0.05, 0.14, 0.05, {
        seg: false,
      });
    }
    for (let i = 0; i < 6; i++) {
      const x = -6.8 + i * 1.05;
      b.cyl("mahogany", X(x), oy, Z(-4.1), 0.05, 0.08, 0.72, 6, { hSeg: 1 });
      b.cyl("velvet", X(x), oy + 0.72, Z(-4.1), 0.2, 0.2, 0.07, 10, {
        hSeg: 1,
      });
    }
    for (let i = 0; i < 9; i++)
      b.cyl(
        r() < 0.5 ? "glass_dark" : "brass",
        X(-7 + r() * 5.6),
        oy + 1.18,
        Z(-5.1 + r() * 0.3),
        0.04,
        0.045,
        0.16 + r() * 0.1,
        6,
        { hSeg: 1 },
      ); // tankards & bottles
    anchors.bartender = A(-4.2, 0, -6.0, 0);
    // fireplace on the west wall (brick hearth, mantel, fire, kettle, portrait above)
    // (open firebox: back wall, two jambs and the chimney breast, so the fire is actually visible)
    b.boxMM("brick_fed", X(-8), oy, Z(-0.2), X(-7.85), oy + 2.4, Z(2.4), {
      grime: 0.6,
      c: 0x3a2a22,
    });
    b.boxMM("brick_fed", X(-7.85), oy, Z(-0.2), X(-7.2), oy + 1.3, Z(0.35), {
      grime: 0.6,
    });
    b.boxMM("brick_fed", X(-7.85), oy, Z(1.85), X(-7.2), oy + 1.3, Z(2.4), {
      grime: 0.6,
    });
    b.boxMM(
      "brick_fed",
      X(-7.85),
      oy + 1.3,
      Z(-0.2),
      X(-7.2),
      oy + 2.4,
      Z(2.4),
      { grime: 0.6 },
    );
    b.boxMM(
      "granite_dark",
      X(-7.85),
      oy,
      Z(0.35),
      X(-7.2),
      oy + 0.04,
      Z(1.85),
      { seg: false, c: 0x2a2420 },
    ); // soot-black hearth floor
    b.boxMM("granite_dark", X(-7.2), oy, Z(0.0), X(-6.7), oy + 0.06, Z(2.2), {
      seg: false,
    }); // hearthstone
    for (const z of [0.36, 1.84])
      b.boxMM(
        "brick_fed",
        X(-7.84),
        oy + 0.9,
        Z(z) - 0.005,
        X(-7.22),
        oy + 1.3,
        Z(z) + 0.005,
        { seg: false, c: 0x1a120e },
      ); // soot on the jambs
    PF.fireAt(P(-7.55, 0.12, 1.1), 0.32, { smoke: false, light: true });
    b.boxMM("oak", X(-7.3), oy + 1.45, Z(-0.4), X(-6.95), oy + 1.6, Z(2.6), {
      seg: false,
    });
    b.box("fire", X(-7.6), oy + 0.05, Z(1.1), 0.5, 0.35, 1.0, {
      seg: false,
      noAO: true,
    });
    for (let k = 0; k < 3; k++)
      b.box(
        "rotten",
        X(-7.55),
        oy + 0.05 + k * 0.06,
        Z(0.8 + k * 0.25),
        0.15,
        0.12,
        0.9,
        { ry: 0.3 * k, seg: false },
      );
    b.sphere("iron", X(-7.5), oy + 0.7, Z(1.1), 0.18, { ws: 8, hs: 6 });
    PF.glow(P(-7.4, 0.5, 1.1), 0xff7a2a, 1.6, root, {
      intensity: 1.6,
      flicker: 0.5,
    });
    PF.colMM(X(-8), oy, Z(-0.2), X(-7.2), oy + 2.4, Z(2.4), {
      walkable: false,
    });
    D.painting(b, 1, X(-7.19), oy + 3.1, Z(1.1), 1.0, 1.1, HP, {
      frame: "gilt",
    });
    // tables with Windsor chairs, candles, tankards
    for (const [x, z] of [
      [-5.5, -1.8],
      [-2.5, -1.2],
      [-5.5, 2.4],
      [-2.2, 3.0],
      [-0.2, 5.6],
      [-6.2, 5.6],
    ]) {
      b.cyl("oak", X(x), oy, Z(z), 0.06, 0.12, 0.72, 6, { hSeg: 1 });
      b.cyl("oak", X(x), oy + 0.72, Z(z), 0.55, 0.55, 0.06, 12, { hSeg: 1 });
      PF.col(X(x), Z(z), 1.0, 1.0, oy, oy + 0.78, 0, { walkable: false });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU + x;
        windsor(
          b,
          X(x + Math.cos(a) * 0.9),
          oy,
          Z(z + Math.sin(a) * 0.9),
          -a + HP,
        );
      }
      PF.candles(b, X(x), oy + 0.78, Z(z), 1, x * 3 + z, root);
      if (r() < 0.7)
        b.cyl(
          "brass",
          X(x + 0.2),
          oy + 0.78,
          Z(z - 0.15),
          0.05,
          0.045,
          0.14,
          6,
          { hSeg: 1 },
        );
    }
    // fiddler's corner (a crate stage), dartboard, a moose-head-shaped raider helmet trophy
    b.boxMM("planks", X(-7.9), oy, Z(4.4), X(-5.8), oy + 0.3, Z(6.9), {
      seg: false,
    });
    PF.colMM(X(-7.9), oy, Z(4.4), X(-5.8), oy + 0.3, Z(6.9), {
      surface: "wood",
    });
    b.cyl("paint_cream", X(1.84), oy + 1.7, Z(-1.8), 0.25, 0.25, 0.04, 16, {
      hSeg: 1,
      rz: HP,
    });
    b.cyl("paint_red", X(1.82), oy + 1.7, Z(-1.8), 0.08, 0.08, 0.05, 12, {
      hSeg: 1,
      rz: HP,
    });
    // chandelier: iron candle ring
    for (const z of [-2, 3.5]) {
      b.cyl("iron", X(-4), oy + 2.6, Z(z), 0.01, 0.01, 1.2, 3, { hSeg: 1 });
      b.add("iron", new THREE.TorusGeometry(0.55, 0.03, 4, 12), {
        m: PF.m4(X(-4), oy + 2.6, Z(z), 0, HP),
      });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        b.cyl(
          "candle",
          X(-4 + Math.cos(a) * 0.55),
          oy + 2.62,
          Z(z + Math.sin(a) * 0.55),
          0.02,
          0.02,
          0.14,
          5,
          { hSeg: 1 },
        );
        b.sphere(
          "flame",
          X(-4 + Math.cos(a) * 0.55),
          oy + 2.8,
          Z(z + Math.sin(a) * 0.55),
          0.02,
          { ws: 4, hs: 3, sy: 2 },
        );
      }
      PF.glow(P(-4, 2.75, z), 0xffb060, 1.8, root, {
        intensity: 1.2,
        flicker: 0.15,
      });
    }
    const taproomK = PF.texMat(
      "ft_rules",
      PF.signTex(
        "ft_rules",
        [
          "HOUSE RULES",
          "PAY FIRST · DRINK SECOND",
          "NO SHOOTING THE FIDDLER",
          "ROOMS 10 SCRIP",
        ],
        "engraved",
        512,
        320,
        { bg: "#2a1e14", fg: "#e0c890" },
      ),
    );
    b.quad(taproomK, X(1.83), oy + 1.9, Z(1.6), 1.2, 0.75, { ry: -HP });
    anchors.vane = A(-2.2, 0, 4.0, PI);
    anchors.fiddler = A(-7.25, 0.3, 6.1, HP); // (was inside the stage crate collider)
    anchors.patron = A(-5.5, 0, -0.9, PI);
    anchors.taproom = A(-3.5, 0, 1, 0);

    // kitchen (x 2..8, z -7..0): hearth, work table, pots, sacks, the cellar stair
    b.boxMM("brick_fed", X(7.8), oy, Z(-7), X(8), oy + 2.6, Z(-4.4), {
      grime: 0.6,
      c: 0x3a2a22,
    });
    b.boxMM("brick_fed", X(6.8), oy, Z(-7), X(7.8), oy + 1.4, Z(-6.5), {
      grime: 0.6,
    });
    b.boxMM("brick_fed", X(6.8), oy, Z(-4.9), X(7.8), oy + 1.4, Z(-4.4), {
      grime: 0.6,
    });
    b.boxMM("brick_fed", X(6.8), oy + 1.4, Z(-7), X(7.8), oy + 2.6, Z(-4.4), {
      grime: 0.6,
    });
    b.boxMM("granite_dark", X(6.8), oy, Z(-6.5), X(7.8), oy + 0.04, Z(-4.9), {
      seg: false,
      c: 0x2a2420,
    });
    PF.fireAt(P(7.45, 0.12, -5.7), 0.3, { smoke: false });
    b.box("fire", X(7.4), oy + 0.05, Z(-5.7), 0.6, 0.35, 0.9, {
      seg: false,
      noAO: true,
    });
    b.cyl("iron", X(7.3), oy + 0.45, Z(-5.7), 0.3, 0.25, 0.4, 10, { hSeg: 1 });
    b.beam("iron", P(7.9, 1.3, -5.7), P(7.3, 1.3, -5.7), 0.03, 0.03);
    PF.glow(P(7.3, 0.5, -5.7), 0xff7a2a, 1.3, root, {
      intensity: 1.5,
      flicker: 0.5,
    });
    PF.colMM(X(6.8), oy, Z(-7), X(8), oy + 2.6, Z(-4.4), { walkable: false });
    b.box("oak", X(5.4), oy, Z(-2.6), 2.2, 0.85, 1.0, {
      seg: false,
      grime: 0.6,
    });
    PF.col(X(5.4), Z(-2.6), 2.2, 1.0, oy, oy + 0.85, 0, { walkable: false });
    for (let i = 0; i < 5; i++)
      b.cyl(
        r() < 0.5 ? "iron" : "copper",
        X(4.6 + i * 0.4),
        oy + 0.85,
        Z(-2.6 + (r() - 0.5) * 0.5),
        0.12,
        0.1,
        0.12 + r() * 0.1,
        8,
        { hSeg: 1 },
      );
    D.shelf(b, X(5.2), oy, Z(-6.8), 0, 2.6, 3, 29);
    for (let i = 0; i < 4; i++)
      b.sphere("sandbag", X(7.4), oy + 0.3, Z(-3.9 + i * 0.7), 0.35, {
        sy: 0.9,
      });
    for (let i = 0; i < 6; i++)
      b.box(
        "rotten",
        X(4.2 + (i % 3) * 0.6),
        oy + 2.9,
        Z(-0.3),
        0.05,
        0.5 + r() * 0.3,
        0.05,
        { seg: false },
      ); // hanging herbs/meat hooks
    // cellar stair opening railing + stair down (x 2.4..3.6, from z -1 down north to z -6.4)
    PF.railing(
      b,
      [
        [X(3.7), Z(-6.4)],
        [X(3.7), Z(-1.05)],
      ],
      oy,
      1.0,
      "mahogany",
      { collide: true },
    );
    PF.stairs(b, "oak", X(3.0), Z(-6.4), 0, 1.2, 5.3, oy + CEL, oy, {
      base: oy + CEL - 0.3,
    });
    anchors.cook = A(5.4, 0, -4.1, 0);
    anchors.kitchen = A(5, 0, -1.5, 0);

    // stair hall (x 2..8, z 0..7): entrance, flight A up to F2 along the east wall
    PF.stairs(b, "oak", X(7.3), Z(6.6), PI, 1.4, 5.6, oy, oy + F2, {
      base: oy - 0.2,
    });
    PF.railing(
      b,
      [
        [X(6.55), Z(6.6)],
        [X(6.55), Z(1.0)],
      ],
      oy,
      1.0,
      "mahogany",
      {},
    );
    for (let k = 0; k < 12; k++) {
      const t = k / 11;
      b.box(
        "white_paint",
        X(6.55),
        oy + t * F2 + 0.2,
        Z(6.6 - t * 5.6),
        0.04,
        0.9,
        0.04,
        { seg: false },
      );
    }
    D.painting(b, 3, X(2.16), oy + 1.8, Z(5.2), 0.8, 1.0, HP, {
      frame: "gilt",
    });
    b.box("oak", X(3), oy, Z(6.4), 1.4, 0.9, 0.5, { seg: false }); // hall table
    PF.col(X(3), Z(6.4), 1.4, 0.5, oy, oy + 0.9, 0, { walkable: false });
    anchors.entrance = A(4.0, 0, 3.7, HP); // stair hall, facing west through the open doorway into the taproom (bar & fireplace)
    PF.door({
      id: "pf_ft_exit",
      pos: P(5, 1.4, 7.1),
      label: "Beaver Street",
      verb: "Exit",
      radius: 1.2,
      target: { x: ext.door.x, y: 0.05, z: ext.door.z, yaw: 0 },
      sound: "door_open",
    }); // face the street, away from the door

    // ================= SECOND FLOOR: THE LONG ROOM + gallery =================
    W("plaster_blue", "x", -8, 8, -0.55, -0.25, F2, F3 - 0.4, [
      { c: -3, w: 1.4, y0: F2, h: 2.4 },
      { c: 5, w: 1.4, y0: F2, h: 2.4 },
    ]);
    W("plaster_clean", "z", -0.25, 7, 1.85, 2.15, F2, F3 - 0.4, [
      { c: 3.6, w: 1.4, y0: F2, h: 2.4 },
    ]);
    // the Long Room is restored colonial: painted plaster lining over the brick (window reveals kept), chair rail & cornice
    const lin = { noCollide: true };
    W(
      "plaster_blue",
      "x",
      -8,
      8,
      -7,
      -6.97,
      F2,
      F3 - 0.4,
      [
        { c: -4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
        { c: 0, w: 1.1, y0: F2 + 1.1, h: 2.0 },
        { c: 4.5, w: 1.1, y0: F2 + 1.1, h: 2.0 },
      ],
      lin,
    );
    W(
      "plaster_blue",
      "z",
      -6.97,
      -0.55,
      -8,
      -7.97,
      F2,
      F3 - 0.4,
      [{ c: -3.5, w: 1.1, y0: F2 + 1.1, h: 2.0 }],
      lin,
    );
    W("plaster_blue", "z", -6.97, -0.55, 7.97, 8, F2, F3 - 0.4, [], lin);
    b.boxMM(
      "white_paint",
      X(-7.97),
      oy + F2 + 1.0,
      Z(-6.97),
      X(7.97),
      oy + F2 + 1.07,
      Z(-6.9),
      { seg: false },
    );
    b.boxMM(
      "white_paint",
      X(-7.97),
      oy + F3 - 0.62,
      Z(-6.97),
      X(7.97),
      oy + F3 - 0.4,
      Z(-6.86),
      { seg: false },
    );
    for (const sx of [-1, 1]) {
      b.boxMM(
        "white_paint",
        X(sx * 7.97 - (sx > 0 ? 0.07 : 0)),
        oy + F2 + 1.0,
        Z(-6.97),
        X(sx * 7.97 + (sx < 0 ? 0.07 : 0)),
        oy + F2 + 1.07,
        Z(-0.56),
        { seg: false },
      );
      b.boxMM(
        "white_paint",
        X(sx * 7.97 - (sx > 0 ? 0.11 : 0)),
        oy + F3 - 0.62,
        Z(-6.97),
        X(sx * 7.97 + (sx < 0 ? 0.11 : 0)),
        oy + F3 - 0.4,
        Z(-0.56),
        { seg: false },
      );
    }
    // Long Room: wainscot, portraits, the long table set for the farewell
    b.boxMM(
      "mahogany",
      X(-7.98),
      oy + F2,
      Z(-6.98),
      X(7.98),
      oy + F2 + 1.0,
      Z(-6.9),
      { seg: false },
    );
    b.boxMM(
      "mahogany",
      X(-7.98),
      oy + F2,
      Z(-6.98),
      X(-7.9),
      oy + F2 + 1.0,
      Z(-0.56),
      { seg: false },
    );
    for (let i = 0; i < 5; i++)
      D.painting(
        b,
        [1, 3, 1, 3, 5][i],
        X(-6 + i * 3),
        oy + F2 + 2.2,
        Z(-6.92),
        1.0,
        1.3,
        0,
        { frame: "gilt" },
      );
    b.boxMM(
      "mahogany",
      X(-5.5),
      oy + F2 + 0.74,
      Z(-4.4),
      X(4.5),
      oy + F2 + 0.8,
      Z(-3.2),
      { grime: 0.3 },
    );
    b.boxMM(
      "linen",
      X(-5.6),
      oy + F2 + 0.8,
      Z(-4.5),
      X(4.6),
      oy + F2 + 0.82,
      Z(-3.1),
      { seg: false },
    );
    for (let x = -5.2; x <= 4.2; x += 1.6)
      for (const z of [-4.4, -3.2])
        b.cyl("mahogany", X(x), oy + F2, Z(z), 0.04, 0.05, 0.74, 6, {
          hSeg: 1,
        });
    PF.colMM(X(-5.5), oy + F2, Z(-4.4), X(4.5), oy + F2 + 0.82, Z(-3.2), {
      walkable: false,
    });
    for (let i = 0; i < 7; i++) {
      const x = -5 + i * 1.5;
      for (const [z, a] of [
        [-4.95, 0],
        [-2.65, PI],
      ]) {
        windsor(b, X(x), oy + F2, Z(z), a);
        b.cyl(
          "paint_cream",
          X(x),
          oy + F2 + 0.82,
          Z(z + (a ? -0.55 : 0.55)),
          0.13,
          0.13,
          0.015,
          12,
          { hSeg: 1 },
        );
        b.cyl(
          "glass_dark",
          X(x + 0.2),
          oy + F2 + 0.82,
          Z(z + (a ? -0.6 : 0.6)),
          0.03,
          0.035,
          0.14,
          6,
          { hSeg: 1 },
        );
      }
    }
    for (const x of [-3, 0.5, 3.5]) {
      b.lathe(
        "brass",
        [
          [0.1, 0],
          [0.04, 0.05],
          [0.025, 0.4],
          [0.05, 0.44],
          [0.02, 0.46],
        ],
        8,
        X(x),
        oy + F2 + 0.82,
        Z(-3.8),
        {},
      );
      PF.candles(b, X(x), oy + F2 + 1.28, Z(-3.8), 1, x * 11, root);
    }
    const farewellK = PF.texMat(
      "ft_farewell",
      PF.signTex(
        "ft_farewell",
        [
          "THE LONG ROOM",
          "Here, on the 4th of December 1783, General George Washington",
          "bade farewell to the officers of the Continental Army.",
          '"With a heart full of love and gratitude, I now take leave of you."',
        ],
        "bronze",
        1024,
        256,
      ),
    );
    b.quad(farewellK, X(7.9), oy + F2 + 1.8, Z(-3.8), 2.6, 0.65, { ry: -HP });
    anchors.docent = A(6.0, F2, -3.8, HP);
    anchors.long_room = A(0, F2, -2, PI);
    // gallery (x -8..2, z -0.25..7): display cases, the tricorn case, flag, diorama
    const caseAt = (x, z, w, d) => {
      b.box("mahogany", X(x), oy + F2, Z(z), w, 0.85, d, {
        seg: false,
        grime: 0.4,
      });
      b.box("glass_dark", X(x), oy + F2 + 0.85, Z(z), w - 0.05, 0.5, d - 0.05, {
        seg: false,
      });
      b.box("brass", X(x), oy + F2 + 1.35, Z(z), w, 0.04, d, { seg: false });
      PF.col(X(x), Z(z), w, d, oy + F2, oy + F2 + 1.4, 0, { walkable: false });
    };
    caseAt(-6.5, 1.6, 1.2, 0.8);
    caseAt(-6.5, 4.0, 1.2, 0.8);
    caseAt(-3.2, 2.8, 1.8, 0.9);
    caseAt(0.6, 5.8, 1.0, 1.0);
    b.sphere("bone", X(-6.5), oy + F2 + 0.95, Z(1.6), 0.03, {}); // "Washington's tooth"
    b.box("fabric", X(-6.5), oy + F2 + 0.9, Z(4.0), 0.2, 0.04, 0.05, {
      seg: false,
      c: 0xb8b0a0,
    }); // lock of hair
    b.box("iron", X(-3.2), oy + F2 + 0.9, Z(2.8), 0.9, 0.05, 0.1, {
      seg: false,
    });
    b.box("mahogany", X(-3.5), oy + F2 + 0.9, Z(2.8), 0.4, 0.06, 0.08, {
      seg: false,
    }); // musket
    // diorama: New York, 1783 (tiny buildings)
    b.box("oak", X(-1.5), oy + F2, Z(0.9), 2.0, 0.8, 1.0, { seg: false });
    for (let i = 0; i < 18; i++)
      b.box(
        i % 3 ? "brick_fed" : "white_paint",
        X(-2.3 + r() * 1.6),
        oy + F2 + 0.8,
        Z(0.6 + r() * 0.6),
        0.1 + r() * 0.08,
        0.06 + r() * 0.12,
        0.1,
        { seg: false },
      );
    PF.col(X(-1.5), Z(0.9), 2.0, 1.0, oy + F2, oy + F2 + 0.95, 0, {
      walkable: false,
    });
    const flagK = PF.texMat("ft_flag_in", PF.flagTex(1), { rough: 0.9 });
    b.quad(flagK, X(-7.94), oy + F2 + 2.2, Z(3.2), 2.0, 1.15, { ry: HP });
    const plq = [
      [
        "tooth",
        "ALLEGEDLY: ONE (1) TOOTH, G. WASHINGTON. Hippopotamus ivory. The General had many teeth, few of them his own.",
        -6.5,
        1.6,
      ],
      [
        "hair",
        "A LOCK OF HAIR, said to be Washington's. Or his horse's. The label was water-damaged in 1971.",
        -6.5,
        4.0,
      ],
      [
        "musket",
        "BROWN BESS MUSKET, c. 1775. Do not load. Do not ask the robot to load it.",
        -3.2,
        2.8,
      ],
      [
        "diorama",
        "NEW YORK, 1783 — the British evacuate the city. For a while, they said, it would be a ruin. They were early.",
        -1.5,
        0.9,
      ],
    ];
    for (const [id, text, x, z] of plq)
      PF.readable(P(x, F2 + 1.3, z), "Exhibit Card", text, "Read");
    anchors.tricorn_case = A(0.6, F2 + 0.9, 5.8, 0);
    anchors.gallery = A(-3, F2, 5, 0);
    // flight B: F2 → F3 along the stair hall west wall (x 2..3.4), rising south
    PF.stairs(b, "oak", X(2.7), Z(1.0), 0, 1.4, 5.2, oy + F2, oy + F3, {
      base: oy + F2 - 0.2,
    });
    PF.railing(
      b,
      [
        [X(3.45), Z(1.0)],
        [X(3.45), Z(6.2)],
      ],
      oy + F2,
      1.0,
      "mahogany",
      {},
    );
    PF.railing(
      b,
      [
        [X(6.55), Z(1.0)],
        [X(6.55), Z(6.6)],
        [X(8), Z(6.6)],
      ],
      oy + F2,
      1.0,
      "mahogany",
      { collide: true },
    ); // around flight A's well
    D.painting(b, 5, X(7.94), oy + F2 + 2, Z(3.5), 0.9, 1.1, -HP, {
      frame: "gilt",
    });

    // ================= THIRD FLOOR: guest rooms, the period room =================
    W("plaster_w", "x", -8, 8, -0.55, -0.25, F3, AT - 0.4, [
      { c: -5.5, w: 1.0, y0: F3, h: 2.2 },
      { c: -0.5, w: 1.0, y0: F3, h: 2.2 },
      { c: 4.5, w: 1.0, y0: F3, h: 2.2 },
    ]);
    W("plaster_w", "z", -7, -0.55, -3.1, -2.9, F3, AT - 0.4);
    W("plaster_w", "z", -7, -0.55, 1.9, 2.1, F3, AT - 0.4);
    W("plaster_w", "x", -8, 2.15, 1.9, 2.2, F3, AT - 0.4, [
      { c: -3, w: 1.0, y0: F3, h: 2.2 },
    ]);
    W("plaster_w", "z", 2.2, 7, 1.85, 2.15, F3, AT - 0.4);
    // corridor z -0.25..1.9 across the floor; rooms north
    const bedAt = (x, z, ry, rich) => {
      b.box(rich ? "mahogany" : "oak", X(x), oy + F3, Z(z), 1.5, 0.45, 2.1, {
        ry,
        seg: false,
      });
      b.box(
        rich ? "velvet" : "linen",
        X(x),
        oy + F3 + 0.45,
        Z(z),
        1.45,
        0.15,
        2.0,
        { ry, seg: false, grime: 0.5 },
      );
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          b.box(
            "mahogany",
            X(x + sx * 0.7),
            oy + F3,
            Z(z + sz * 1.0),
            0.08,
            rich ? 2.0 : 1.0,
            0.08,
            { seg: false },
          );
      PF.col(X(x), Z(z), 1.5, 2.1, oy + F3, oy + F3 + 0.6, ry, {
        surface: "wood",
      });
    };
    bedAt(-6.9, -5.4, 0, false);
    bedAt(-1.4, -5.4, 0, false);
    bedAt(6.6, -5.4, 0, true);
    for (const [x, z] of [
      [-4.2, -6.5],
      [0.6, -6.5],
      [3.5, -6.5],
    ]) {
      b.box("oak", X(x), oy + F3, Z(z), 0.9, 1.0, 0.5, { seg: false });
      PF.col(X(x), Z(z), 0.9, 0.5, oy + F3, oy + F3 + 1.0, 0, {
        walkable: false,
      });
    }
    D.chair(b, X(-4.5), oy + F3, Z(-2.5), 0.8, false, "oak");
    D.painting(b, 6, X(-5.5), oy + F3 + 1.8, Z(-6.92), 0.8, 0.6, 0, {
      frame: "oak",
    });
    D.painting(b, 0, X(5), oy + F3 + 1.8, Z(-6.92), 1.4, 0.9, 0, {
      frame: "gilt",
    });
    anchors.room_bed = A(-6.9, F3 + 0.6, -5.4, 0);
    anchors.guest = A(-5.5, F3, -2.2, PI);
    anchors.owner_safe = A(7.7, F3 + 0.9, -2.2, -HP);
    // period room (x -8..2, z 1.9..7): green wallpaper, a harpsichord, a card table, a skeleton in the wing chair
    b.boxMM(
      "wallpaper_g",
      X(-7.98),
      oy + F3,
      Z(2.1),
      X(-7.9),
      oy + AT - 0.4,
      Z(6.98),
      { seg: false },
    );
    b.boxMM(
      "wallpaper_g",
      X(-7.98),
      oy + F3,
      Z(6.9),
      X(1.84),
      oy + AT - 0.4,
      Z(6.98),
      { seg: false },
    );
    b.box("mahogany", X(-5.8), oy + F3, Z(6.2), 1.8, 0.9, 0.7, { seg: false });
    b.box("paint_cream", X(-5.8), oy + F3 + 0.9, Z(6.0), 1.6, 0.04, 0.25, {
      seg: false,
    });
    PF.col(X(-5.8), Z(6.2), 1.8, 0.7, oy + F3, oy + F3 + 0.95, 0, {
      walkable: false,
    });
    b.box("velvet", X(-2), oy + F3, Z(4.8), 0.9, 0.5, 0.8, { seg: false });
    b.box("velvet", X(-2), oy + F3 + 0.5, Z(5.15), 0.9, 0.7, 0.15, {
      seg: false,
    });
    PF.skeleton(b, X(-2), oy + F3 + 0.52, Z(4.7), PI);
    anchors.period = A(-3.5, F3, 3.5, 0);
    // flight C: F3 → attic along the east wall
    PF.stairs(b, "oak", X(7.3), Z(6.2), PI, 1.4, 5.2, oy + F3, oy + AT, {
      base: oy + F3 - 0.2,
    });
    PF.railing(
      b,
      [
        [X(2.0), Z(1.0)],
        [X(3.45), Z(1.0)],
      ],
      oy + F3,
      1.0,
      "mahogany",
      { collide: true },
    );
    PF.railing(
      b,
      [
        [X(3.45), Z(1.0)],
        [X(3.45), Z(6.2)],
      ],
      oy + F3,
      1.0,
      "mahogany",
      { collide: true },
    );

    // ================= ATTIC =================
    W("plaster_w", "x", -8, 8, -7, -6.6, AT, AT + 3.2);
    W("plaster_w", "x", -8, 8, 6.6, 7, AT, AT + 3.2);
    W("plaster_w", "z", -6.6, 6.6, -8, -7.6, AT, AT + 3.2);
    W("plaster_w", "z", -6.6, 6.6, 7.6, 8, AT, AT + 3.2);
    // raked ceiling (sloping boards) + rafters
    for (const sg of [-1, 1]) {
      b.box("rotten", X(0), oy + AT + 2.35, Z(sg * 4.2), 16, 0.06, 5.4, {
        rx: sg * 0.52,
        seg: true,
        grime: 0.6,
      });
    }
    b.boxMM(
      "rotten",
      X(-8),
      oy + AT + 3.3,
      Z(-1.3),
      X(8),
      oy + AT + 3.4,
      Z(1.3),
      { seg: false },
    );
    for (let x = -7; x <= 7; x += 1.4)
      for (const sg of [-1, 1])
        b.beam(
          "oak",
          P(x, 1.0, sg * 6.5).setY(oy + AT + 1.0),
          P(x, 3.3, sg * 1.3).setY(oy + AT + 3.3),
          0.14,
          0.14,
          {},
        );
    for (const x of [-4.5, 0, 4.5])
      b.quad("lamp_blue", X(x), oy + AT + 1.2, Z(-6.55), 0.7, 0.9, {
        noAO: true,
      });
    D.crates(b, X(-6), oy + AT, Z(-4.5), 2, 31, true);
    D.crates(b, X(-5), oy + AT, Z(-5.3), 1, 32, true);
    for (let i = 0; i < 4; i++)
      b.box("fabric", X(-2 + i * 1.3), oy + AT, Z(-5.5), 1.0, 0.6, 0.6, {
        seg: false,
        c: 0x9a8a70,
        grime: 0.7,
      }); // trunks under sheets
    D.mattress(b, X(4.5), oy + AT, Z(4.5), HP);
    b.box("panel", X(0.5), oy + AT, Z(5.8), 1.4, 0.75, 0.6, { seg: false });
    PF.col(X(0.5), Z(5.8), 1.4, 0.6, oy + AT, oy + AT + 0.75, 0, {
      walkable: false,
    });
    anchors.attic = A(0, AT, 0, 0);
    anchors.attic_radio = A(0.5, AT + 0.76, 5.8, PI);

    // ================= CELLAR =================
    b.boxMM("granite", X(-8), oy + CEL - 0.4, Z(-7), X(8), oy + CEL, Z(7), {
      grime: 0.7,
    });
    PF.colMM(X(-8), oy + CEL - 0.4, Z(-7), X(8), oy + CEL, Z(7));
    W("schist", "x", -8.4, 8.4, -7.4, -7, CEL, 0);
    W("schist", "x", -8.4, 8.4, 7, 7.4, CEL, 0, [
      { c: 0, w: 1.6, y0: CEL, h: 2.4 },
    ]);
    W("schist", "z", -7.4, 7.4, -8.4, -8, CEL, 0);
    W("schist", "z", -7.4, 7.4, 8, 8.4, CEL, 0);
    // brick barrel vaults (two bays along x)
    const vY = oy + CEL + 2.0;
    for (const [x0, x1] of [
      [-8, 0],
      [0, 8],
    ]) {
      const g = PF.surface(
        (u, v, out) => {
          const x = X(x0 + u * (x1 - x0));
          const t = (u - 0.5) * 2;
          out.set(
            x,
            vY + Math.sqrt(Math.max(0, 1 - t * t)) * 1.5,
            Z(-7 + v * 14),
          );
        },
        12,
        5,
        {},
      );
      b.add("brick_fed", g, { grime: 0.6, noAO: true });
    }
    // central arcade between the two vaults: piers with a wide gap (z -0.6..2.6) and a clear run to the tunnel (z > 4.6)
    for (const [z0, z1] of [
      [-7, -0.6],
      [2.6, 4.6],
    ]) {
      b.boxMM(
        "schist",
        X(-0.3),
        oy + CEL,
        Z(z0),
        X(0.3),
        oy + CEL + 2.2,
        Z(z1),
        { seg: false, grime: 0.6 },
      );
      PF.colMM(X(-0.3), oy + CEL, Z(z0), X(0.3), oy - 0.4, Z(z1), {
        walkable: false,
      });
    }
    b.boxMM(
      "schist",
      X(-0.3),
      oy + CEL + 2.0,
      Z(-7),
      X(0.3),
      oy + CEL + 2.3,
      Z(7),
      { seg: false },
    );
    // barrel racks, the still, sacks, a hidden ale stash
    for (let i = 0; i < 5; i++)
      for (let k = 0; k < 2; k++) {
        const g = new THREE.CylinderGeometry(0.4, 0.4, 0.9, 12);
        g.rotateZ(HP);
        b.add("oak", g, {
          m: PF.m4(X(-7.4), oy + CEL + 0.45 + k * 0.8, Z(-6 + i * 1.0)),
          grime: 0.5,
        });
      }
    PF.colMM(X(-8), oy + CEL, Z(-6.5), X(-6.8), oy + CEL + 1.7, Z(-1.5), {
      walkable: false,
    });
    b.cyl("copper", X(5.5), oy + CEL, Z(-5), 0.7, 0.8, 1.2, 12, { hSeg: 1 });
    b.sphere("copper", X(5.5), oy + CEL + 1.25, Z(-5), 0.65, {
      ws: 10,
      hs: 6,
      phiLen: PI / 2,
    });
    b.rod("copper", P(5.5, CEL + 1.8, -5), P(7.2, CEL + 1.3, -5), 0.07, 6);
    PF.col(X(5.8), Z(-5), 2.4, 1.6, oy + CEL, oy + CEL + 1.9, 0, {
      walkable: false,
    });
    for (let i = 0; i < 7; i++)
      b.sphere(
        "sandbag",
        X(-5 + (i % 4) * 0.8),
        oy + CEL + 0.3,
        Z(5.6 + Math.floor(i / 4) * 0.7),
        0.36,
        { sy: 0.85 },
      );
    D.crates(b, X(6.6), oy + CEL, Z(5.4), 2, 44, true);
    PF.skeleton(b, X(-3), oy + CEL + 0.02, Z(-2.5), 1.3);
    anchors.cellar = A(3.0, CEL, -5.8, PI);
    anchors.cellar_stash = A(-7.2, CEL, 3.5, HP);
    // the smugglers' tunnel (south, x -0.8..0.8, z 7.4..14) → bulkhead to the courtyard
    b.boxMM("dirt", X(-0.9), oy + CEL - 0.4, Z(7), X(0.9), oy + CEL, Z(14), {
      grime: 0.6,
    });
    PF.colMM(X(-0.9), oy + CEL - 0.4, Z(7), X(0.9), oy + CEL, Z(14), {
      surface: "dirt",
    });
    W("schist", "z", 7.4, 14.5, -1.5, -0.9, CEL, CEL + 2.2);
    W("schist", "z", 7.4, 14.5, 0.9, 1.5, CEL, CEL + 2.2);
    W("schist", "x", -1.5, 1.5, 14, 14.5, CEL, CEL + 2.2);
    b.boxMM(
      "rotten",
      X(-0.9),
      oy + CEL + 2.1,
      Z(7.4),
      X(0.9),
      oy + CEL + 2.3,
      Z(14),
      { seg: false },
    );
    for (let z = 8; z < 14; z += 1.2)
      for (const sx of [-1, 1])
        b.box("rotten", X(sx * 0.8), oy + CEL, Z(z), 0.14, 2.1, 0.14, {
          seg: false,
        });
    b.box("oak", X(0), oy + CEL + 0.9, Z(13.9), 1.4, 1.2, 0.1, {
      rx: 0.5,
      seg: false,
    });
    const tunnelK = PF.texMat(
      "ft_tunnel",
      PF.signTex(
        "ft_tunnel",
        ["SONS OF LIBERTY", "DEATH TO TYRANTS", "— & TAXMEN —"],
        "raider",
        512,
        192,
        { bg: "#4a4034", fg: "#e8d8b8" },
      ),
    );
    b.quad(tunnelK, X(-0.88), oy + CEL + 1.4, Z(10.5), 1.2, 0.45, { ry: HP });
    anchors.tunnel = A(0, CEL, 12.6, PI);

    const g = b.build(root, { lodDistInt: 300 });
    g.name = "fraunces_interior";
    return anchors;
  }
  /** Windsor chair (spindle back) — delicate, for the Long Room and taproom. */
  function windsor(b, x, y, z, ry) {
    const M = PF.m4(x, y, z, ry);
    const add = (g, m, k) =>
      b.add(k || "oak", g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    add(new THREE.CylinderGeometry(0.23, 0.23, 0.05, 10), PF.m4(0, 0.45, 0));
    for (const [dx, dz] of [
      [-0.16, -0.16],
      [0.16, -0.16],
      [-0.16, 0.16],
      [0.16, 0.16],
    ])
      add(
        new THREE.CylinderGeometry(0.018, 0.022, 0.45, 5),
        PF.m4(dx, 0.225, dz, 0, dz * 0.4, -dx * 0.4),
      );
    for (let i = 0; i < 5; i++) {
      const a = -0.7 + i * 0.35;
      add(
        new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4),
        PF.m4(Math.sin(a) * 0.2, 0.72, -Math.cos(a) * 0.2),
      );
    }
    add(
      new THREE.TorusGeometry(0.21, 0.02, 4, 10, PI * 0.9),
      PF.m4(0, 0.97, 0, PI * 0.05, HP),
    );
  }

  // ===================================================================
  // CONTENT
  // ===================================================================
  PF.item({
    id: "pf_tricorn",
    type: "apparel",
    slot: "head",
    name: "Washington's Tricorn",
    weight: 1,
    value: 350,
    dr: 2,
    attrs: { presence: 1, senses: 1 },
    skills: { persuasion: 5 },
    desc: "A weathered felt tricorn from the Fraunces Tavern museum. Its authenticity is certified by a robot. +1 Presence, +1 Senses, +5 Persuasion.",
  });
  PF.item({
    id: "pf_whitlock_ring",
    type: "misc",
    name: "Whitlock Wedding Band",
    weight: 0,
    value: 60,
    desc: 'A plain gold ring engraved inside: "E.W. + N.W. — for richer, for poorer." Found on the Vault Manager\'s desk, deep under Liberty Street.',
  });
  PF.item({
    id: "pf_shellback_egg",
    type: "aid",
    name: "Shellback Egg",
    weight: 0.5,
    value: 12,
    tags: ["food"],
    effects: { hp: 15, rads: 3 },
    sound: "eat",
    desc: "A leathery, faintly glowing egg from the Seaport hatchery. Nan Whitlock pays good scrip for these.",
  });
  PF.item({
    id: "pf_shellback_omelette",
    type: "aid",
    name: "Shellback Omelette",
    weight: 0.5,
    value: 40,
    tags: ["food"],
    effects: { hp: 50, hpOverTime: [30, 20], stamina: 10 },
    sound: "eat",
    desc: "Nan's famous Seaport omelette. Fluffy, green-tinged, and very filling.",
  });
  PF.item({
    id: "pf_grog",
    type: "aid",
    name: "Fraunces Grog",
    weight: 1,
    value: 15,
    tags: ["drink", "alcohol"],
    effects: {
      hp: 5,
      attrs: { brawn: 1, presence: 1, wits: -1 },
      duration: 120,
      rads: 1,
    },
    sound: "drink",
    desc: "Rum, river water and something Tobin won't name. +1 Brawn, +1 Presence, -1 Wits for a while.",
  });
  PF.item({
    id: "pf_reel_sons",
    type: "tape",
    name: 'Tape reel: "Sons of Liberty Radio"',
    title: 'Attic Transmitter Log — "The New Sons of Liberty"',
    text: "[Crackle.]\n\nVOICE: This is the New Sons of Liberty, broadcasting from a secret location that is definitely not above a tavern. To the Continuity on Liberty Island: we did not beat one king to bow to a filing cabinet.\n\nVOICE 2: Bill, the tape's running out.\n\nVOICE: To the Iron Covenant at Rockefeller Center: nice armour. Terrible manners.\n\nVOICE 2: BILL.\n\nVOICE: Sons of Liberty, out. Meet in the cellar. Bring rum.\n\n[Recording ends.]",
  });
  PF.item({
    id: "pf_note_nan",
    type: "note",
    name: "Nan's Recipe Card",
    title: "Seaport Omelette (serves 1 hungry scavenger)",
    text: "5 shellback eggs (fresh — if it hisses, it is TOO fresh)\n1 handful potato greens\nSalt, if anybody has any\nA hot pan and no fear\n\nWhisk. Pray. Fry. Serve to Tobin last.",
  });

  // --- terminals: none here; the attic has a working radio set (props) ---

  // --- dialogue: Tobin Drummond (bartender, rumours) ---
  const RUMOURS = [
    {
      text: "Reverend Penhallow up at Trinity Church has been asking for somebody brave and stupid. Scratching in his crypt, he says. My money's on Maniacs. My money's always on Maniacs.",
      act: () => {
        if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
      },
      note: "Trinity Church — the crypt",
    },
    {
      text: "See the old gent in the good suit, corner table? Mortimer Vane. Used to push paper on Wall Street before the world ended. He's got a thing about the Federal Reserve. Everybody's got a thing about the Federal Reserve. Gold does that.",
      act: () => {
        if (!PF.q.started("pf_gold")) PF.q.start("pf_gold", { stage: "meet" });
      },
      note: "Mortimer Vane — the Fed",
    },
    {
      text: "Lottie Brennan and her salvage crew went out to that big old sailing ship at the Seaport — the Peking. Shellbacks got the crew. Lottie's holed up in the fish market, last anybody heard. She'll pay, if she's alive.",
      act: () => {
        if (!PF.q.started("pf_deep")) PF.q.start("pf_deep");
      },
      note: "Seaport — Lottie Brennan",
    },
    {
      text: "The raiders at the Stock Exchange call themselves The Exchange now. They charge a toll on Wall Street. In scrip, bullets, or teeth. Go around.",
      note: null,
    },
    {
      text: "Nan in the kitchen swears her husband ran the gold vault under Liberty Street. Twenty-two years she's been waiting for him to come home for dinner. Don't bring it up unless you've got news.",
      note: null,
    },
    {
      text: "Continuity patrol boats running lights around Liberty Island again. Men in pressed uniforms, saluting a flag nobody else salutes. Whatever they're doing in that statue, it glows at night.",
      note: null,
    },
    {
      text: "Dilly — runs the garden out back — keeps muttering about a civil-defense seed reserve in the Fulton Fish Market cold store. Real old-world seeds. If anybody could get past the shellbacks, she'd kiss them. Or pay them. Probably pay them.",
      note: null,
    },
    {
      text: "That patrolman upstairs in the Long Room? Calls itself George. Ask it about the Revolution and it won't shut up for an hour. Ask it right, it might give you a hat.",
      note: null,
    },
  ];
  PF.dialogue("pf_dlg_hollis", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          PF.flag("ft_rumour")
            ? "Back again. What'll it be?"
            : "Welcome to Fraunces — oldest bar in the city and the only one with a roof. I'm Tobin. We've got grog, we've got water, we've got rooms upstairs, and we've got rumours. Rumours are free. The rest isn't.",
        responses: [
          { text: "Heard any rumours?", next: "rumour", repeatable: true },
          { text: "Let's trade.", barter: true },
          {
            text: "[10 scrip] I need a room for the night.",
            cond: () => PF.inv.scrip() >= 10,
            action: () => rentRoom(),
            next: null,
          },
          {
            text: "[5 scrip] Pour me a grog.",
            cond: () => PF.inv.scrip() >= 5,
            action: () => {
              PF.inv.addScrip(-5);
              PF.inv.add("pf_grog", 1);
            },
            next: "grog",
            repeatable: true,
          },
          { text: "Tell me about this place.", next: "history" },
          { text: "See you, Tobin." },
        ],
      },
      rumour: {
        text: () => {
          const i = (PF.flag("ft_rumour") || 0) % RUMOURS.length;
          const R = RUMOURS[i];
          PF.setFlag("ft_rumour", (PF.flag("ft_rumour") || 0) + 1);
          try {
            if (R.act) R.act();
          } catch (e) {
            /* optional */
          }
          return R.text;
        },
        responses: [
          { text: "Anything else?", next: "rumour", repeatable: true },
          { text: "Thanks.", next: "root" },
        ],
      },
      grog: {
        text: "One Fraunces Grog. It's like rum, if rum had been in a knife fight. Cheers.",
        responses: [{ text: "Cheers." }],
      },
      history: {
        text: "Samuel Fraunces opened this place in 1762. Washington said goodbye to his officers upstairs. Twenty-two years after the bombs, the building's still standing and the beer's still warm. Some traditions you keep.",
        responses: [
          { text: "Who else is around?", next: "who" },
          { text: "Thanks.", next: "root" },
        ],
      },
      who: {
        text: "Nan does the cooking — sweetest woman in the Financial District, don't mention her husband. Mortimer Vane in the corner, same suit since '67, don't mention the markets. Sal on the fiddle, don't request anything. And George upstairs. George is a robot. Don't mention King George.",
        responses: [{ text: "Got it.", next: "root" }],
      },
    },
  });
  function rentRoom() {
    PF.inv.addScrip(-10);
    PF.setFlag("ft_room", true);
    const a = PF.anchorOf("fraunces_tavern", "guest");
    G.fadeTransition(() => {
      if (a) G.player.teleport(a.x, a.y + 0.05, a.z, a.yaw);
      try {
        if (PF.live("rpg") && G.rpg.sleep) G.rpg.sleep(8, { owned: true });
        else G.player.heal(999);
      } catch (e) {
        /* ignore */
      }
      G.notify("You sleep soundly in a rented room at Fraunces Tavern.");
    }, 1.0);
  }

  // --- Nan Whitlock (cook) ---
  PF.dialogue("pf_dlg_nan", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          PF.flag("ft_ring")
            ? "Oh, it's you, love. Sit, sit. There's always a plate for you in my kitchen."
            : "Mind the stove, dearie, it bites. I'm Nan. I cook. Forty-odd years of cooking, and the last twenty-two of them like this. You look half-starved — they all do.",
        responses: [
          {
            text: () =>
              "I brought shellback eggs. (" +
              PF.inv.count("pf_shellback_egg") +
              ")",
            cond: () => PF.inv.count("pf_shellback_egg") > 0,
            next: "eggs",
          },
          {
            text: "Could you use anything for the kitchen?",
            next: "need",
            cond: () => !PF.q.started("pf_shellback_omelette"),
          },
          {
            text: "I found something in the vault under the Federal Reserve. A ring.",
            cond: () =>
              PF.inv.count("pf_whitlock_ring") > 0 && !PF.flag("ft_ring"),
            next: "ring",
          },
          { text: "What's cooking?", barter: true },
          { text: "Goodbye, Nan." },
        ],
      },
      need: {
        text: "Eggs, love. Shellback eggs. The Seaport used to be full of them — the shellbacks nest on that old ship. Bring me five and I'll make you my omelette. Any more than that and I'll pay twenty scrip a piece.",
        responses: [
          {
            text: "Five shellback eggs. I'll see what I can do.",
            action: () => PF.q.start("pf_shellback_omelette"),
          },
          { text: "Maybe later." },
        ],
      },
      eggs: {
        text: () => {
          const n = PF.inv.count("pf_shellback_egg");
          if (PF.q.active("pf_shellback_omelette") && n >= 5)
            return "Five! Oh, and fresh. Sit down. [She cracks them into a pan the size of a manhole cover.] Nan's Seaport Omelette — and the recipe, so you never go hungry again.";
          return "Lovely. Twenty scrip each for those, love. Mind, they hiss.";
        },
        responses: [
          {
            text: "Here — make the omelette.",
            cond: () =>
              PF.q.active("pf_shellback_omelette") &&
              PF.inv.count("pf_shellback_egg") >= 5,
            action: () => {
              PF.inv.remove("pf_shellback_egg", 5);
              PF.q.done("pf_shellback_omelette");
            },
          },
          {
            text: () =>
              "Sell all of them. (" +
              PF.inv.count("pf_shellback_egg") * 20 +
              " scrip)",
            cond: () =>
              PF.inv.count("pf_shellback_egg") > 0 &&
              !(
                PF.q.active("pf_shellback_omelette") &&
                PF.inv.count("pf_shellback_egg") >= 5
              ),
            action: () => {
              const n = PF.inv.count("pf_shellback_egg");
              PF.inv.remove("pf_shellback_egg", n);
              PF.inv.addScrip(n * 20);
              PF.setFlag("ft_eggs", (PF.flag("ft_eggs") || 0) + n);
            },
          },
          { text: "Never mind." },
        ],
      },
      ring: {
        text: "That's... that's Edmund's. [Her ruined hands shake.] He said he'd be home for dinner. Twenty-two years I kept his plate warm. He stayed with his gold, the stubborn old fool — didn't he. [A long silence.] Thank you, love. Truly.",
        responses: [
          {
            text: "He wrote that the ledger mattered more than the gold. He was protecting it.",
            action: () => giveRing(true),
            next: "ring2",
          },
          {
            text: "Keep it. He'd want you to have it.",
            action: () => giveRing(false),
            next: "ring2",
          },
        ],
      },
      ring2: {
        text: "You take this. [She presses a small, heavy key into your hand.] It's for the strongbox under my bed upstairs — the owner's room. Edmund's savings. Better you than the rats. And there's always a plate here for you. Always.",
        responses: [{ text: "Thank you, Nan." }],
      },
    },
  });
  function giveRing(told) {
    PF.inv.remove("pf_whitlock_ring", 1);
    PF.setFlag("ft_ring", true);
    PF.inv.add("pf_nan_key", 1);
    PF.standing(told ? 40 : 25, "Returned the Whitlock ring");
    PF.xp(150, "Till Death");
    PF.inv.add("pf_shellback_omelette", 2);
  }
  // ---- locks: Nan's strongbox (her key), the museum's tricorn case (GW-1776 lets the code slip), the smugglers' cache (chalk) ----
  const FT_LOCKS = (PF.ftLocks = {
    strongbox: PF.regLock({
      id: "pf_lk_ft_strongbox",
      label: "Whitlock Strongbox",
      key: "pf_nan_key",
      kind: "safe",
      hint: "Nan Whitlock gives the key when you bring back her husband's ring.",
    }),
    tricorn: PF.regLock({
      id: "pf_lk_ft_tricorn",
      label: "Tricorn Display Case",
      code: "1783",
      kind: "container",
      hint: "GW-1776 lets the curatorial code slip when you ask about the hat.",
    }),
    cache: PF.regLock({
      id: "pf_lk_ft_cache",
      label: "Smugglers' Cache",
      code: "1765",
      kind: "container",
      hint: "Chalked on the cellar wall beside it.",
    }),
  });
  PF.keyFrom("pf_nan_key", "Nan Whitlock (returning the Whitlock ring)");
  PF.item({
    id: "pf_nan_key",
    type: "key",
    name: "Nan's Strongbox Key",
    weight: 0,
    value: 0,
    desc: "A small brass key for the strongbox in the owner's room at Fraunces Tavern.",
  });

  // --- Mortimer Vane (ruined financier, The Gold Standard) ---
  PF.dialogue("pf_dlg_vane", {
    start: () =>
      PF.inv.count("pf_reserve_ledger") > 0 && PF.q.active("pf_gold")
        ? "ledger"
        : PF.q.complete("pf_gold")
          ? "after"
          : "root",
    nodes: {
      root: {
        text: "Mortimer Vane, formerly of Vane, Vane & Oberlin, Broad Street. Bonds, mostly. Now I sit in taverns and watch the only market that never closed: people. You have the look of an investor. Or a thief. The distinction was always academic.",
        responses: [
          {
            text: "I hear you have a thing about the Federal Reserve.",
            next: "job",
          },
          { text: "Where are the other Vanes?", next: "vanes" },
          { text: "I'll let you get back to your drink." },
        ],
      },
      vanes: {
        text: "Oberlin took his shelter card. Vane — my brother — took the helicopter. I took the stairs to the bar. Of the three of us, I am the only one still drinking. Draw your own conclusions about risk.",
        responses: [
          { text: "About the Fed...", next: "job" },
          { text: "Goodbye." },
        ],
      },
      job: {
        text: "Under Liberty Street, five storeys down, is the largest pile of gold in the history of the species. And in the vault manager's office, a ledger. Every bar, every owner, every secret transfer — including one the Office of Civil Defense very much wanted to make on March 5th. Bring me that ledger. The gold, you can keep. You won't carry much. Nobody does.",
        responses: [
          { text: "How do I get down there?", next: "how" },
          {
            text: "I'm in.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
            next: "go",
          },
          { text: "Not interested." },
        ],
      },
      how: {
        text: "The vault elevator runs on the security office's power — ground floor, behind the teller line. That teletype answers to nothing but the Chief of Security's keycard, and the Chief, I am told, died at his post in the records room. Level Five has a control room that turns the cylinder. That one wants an override card — I know for a fact there's one in the barracks safe. And there is the Sentinel. Big. Treads. Very polite. Shut it off if you can; run if you can't.",
        responses: [
          {
            text: "[Persuasion 55] You worked with these people. You have an override card of your own, don't you?",
            check: { skill: "persuasion", value: 55 },
            next: "card",
            failNext: "nocard",
            cond: () => !PF.flag("ft_vane_card"),
          },
          {
            text: "[Trade 40] I'll buy your override card. 150 scrip.",
            check: { skill: "trade", value: 40 },
            cond: () => !PF.flag("ft_vane_card") && PF.inv.scrip() >= 150,
            action: () => {
              PF.inv.addScrip(-150);
              PF.inv.add("pf_fed_override", 1);
              PF.setFlag("ft_vane_card", true);
            },
            next: "sold",
            failNext: "nocard",
          },
          {
            text: "I'm in.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
            next: "go",
          },
        ],
      },
      card: {
        text: "...Perceptive. I kept it for twenty-two years in case I ever grew brave. I did not. [He slides a gold-edged card across the table.] Level Five control room. It turns the cylinder, and it puts the Sentinel to sleep. Don't lose it; it's the only thing I own that isn't mortgaged.",
        onEnter() {
          if (!PF.flag("ft_vane_card")) {
            PF.inv.add("pf_fed_override", 1);
            PF.setFlag("ft_vane_card", true);
          }
        },
        responses: [
          {
            text: "I'll bring back your ledger.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
          },
        ],
      },
      sold: {
        text: "A buyer! I had forgotten the feeling. [He pockets the scrip with alarming speed.] Pleasure doing business.",
        responses: [
          {
            text: "I'll bring back your ledger.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
          },
        ],
      },
      nocard: {
        text: "An override card? My dear, I was in bonds, not bullion. [He does not quite meet your eye.]",
        responses: [
          {
            text: "Fine. I'll find another way.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
          },
        ],
      },
      go: {
        text: "Splendid. The Fed is on Liberty Street, just north of here — the building that looks like it's expecting a siege. It is.",
        responses: [{ text: "See you soon." }],
      },
      ledger: {
        text: 'Is that — [He takes the book with both hands, like a relic.] The Reserve Ledger. Look at this. The Office of Civil Defense tried to move a billion in bullion to "secure storage" under the Municipal Building. Account LW-9, it says here, some Civil Defense program nobody ever heard of. Dated the day before the bombs. They were buying their way into the future and the vault manager said no. One word. No.',
        responses: [
          {
            text: "It's yours. As agreed.",
            action: () => {
              PF.inv.remove("pf_reserve_ledger", 1);
              PF.q.done("pf_gold");
              PF.standing(20, "Delivered the Reserve Ledger");
            },
            next: "paid",
          },
          {
            text: "[Persuasion 60] A ledger like that is worth more than 250 scrip.",
            check: { skill: "persuasion", value: 60 },
            action: () => {
              PF.inv.remove("pf_reserve_ledger", 1);
              PF.inv.addScrip(250);
              PF.q.done("pf_gold");
            },
            next: "paid_more",
            failNext: "nomore",
          },
          { text: "I think I'll keep it.", next: "keep" },
        ],
      },
      nomore: {
        text: "My dear, I am a ruined man with a bar tab. Two hundred and fifty is everything.",
        responses: [
          {
            text: "Fine. Take it.",
            action: () => {
              PF.inv.remove("pf_reserve_ledger", 1);
              PF.q.done("pf_gold");
            },
            next: "paid",
          },
          { text: "I'll keep it.", next: "keep" },
        ],
      },
      keep: {
        text: "Then keep it safe. Someone in the Continuity is still looking for it, I promise you. They still think it is 1967; to them it is current business.",
        responses: [{ text: "Goodbye." }],
      },
      paid: {
        text: "Your fee. And my thanks, which are worth rather more. I shall spend the rest of my life reading this. It is the best story ever written, and every word of it is a number.",
        responses: [{ text: "Enjoy it." }],
      },
      paid_more: {
        text: "Robbery. Absolute robbery. I admire it. [He counts out the scrip with a sigh that lasts a full minute.]",
        responses: [{ text: "Pleasure doing business." }],
      },
      after: {
        text: "Page four hundred and twelve. Did you know the Swiss had forty tons down there? They're not coming for it. Nobody's coming for anything any more. Isn't that wonderful?",
        responses: [{ text: "Goodbye, Mortimer." }],
      },
    },
  });

  // --- GW-1776, the docent patrolman (quiz for the tricorn) ---
  const QUIZ = [
    {
      q: "QUESTION THE FIRST: IN WHAT YEAR DID GENERAL WASHINGTON BID FAREWELL TO HIS OFFICERS IN THIS VERY ROOM?",
      a: ["1783", "1776", "1967"],
      ok: 0,
    },
    {
      q: "QUESTION THE SECOND: THE BRITISH EVACUATED NEW YORK CITY IN THAT SAME YEAR. WHAT WAS THE DAY CELEBRATED AS?",
      a: ["Evacuation Day", "Tea Party Day", "Civil Defense Appreciation Day"],
      ok: 0,
    },
    {
      q: "QUESTION THE THIRD: WHO FOUNDED THIS ESTABLISHMENT IN 1762?",
      a: ["Samuel Fraunces", "Alexander Hamilton", "Valet"],
      ok: 0,
    },
  ];
  const quizNodes = {};
  QUIZ.forEach((Qz, i) => {
    quizNodes["q" + i] = {
      text: Qz.q,
      responses: Qz.a
        .map((ans, k) => ({
          text: ans,
          next:
            k === Qz.ok
              ? i + 1 < QUIZ.length
                ? "q" + (i + 1)
                : "win"
              : "lose",
          id: "gw_q" + i + "_" + k,
        }))
        .concat(
          i === 0
            ? [
                {
                  text: '[Wits 7] "The answers are 1783, Evacuation Day and Samuel Fraunces. Skip to the prize."',
                  check: { attr: "wits", value: 7 },
                  next: "win",
                  failNext: "q0",
                },
              ]
            : [],
        ),
    };
  });
  PF.dialogue("pf_dlg_gw", {
    start: () => (PF.flag("ft_tricorn") ? "done" : "root"),
    nodes: Object.assign(
      {
        root: {
          text: "GREETINGS, CITIZEN! I AM GW-1776, DOCENT OF THE FRAUNCES TAVERN MUSEUM. PLEASE DO NOT TOUCH THE EXHIBITS. PLEASE DO NOT TOUCH THE DOCENT. WOULD YOU LIKE TO HEAR ABOUT THE LONG ROOM?",
          responses: [
            { text: "Tell me about the Long Room.", next: "long" },
            { text: "What's the hat in the case?", next: "hat" },
            {
              text: "I'd like to take your quiz.",
              next: "q0",
              cond: () => !PF.flag("ft_tricorn"),
            },
            { text: "Goodbye, George." },
          ],
        },
        long: {
          text: "ON DECEMBER 4TH, 1783, GENERAL WASHINGTON RAISED A GLASS IN THIS ROOM AND SAID FAREWELL TO HIS OFFICERS. WITNESSES REPORT THAT HE WEPT. I HAVE BEEN PROGRAMMED TO WEEP AT THIS POINT. [A small jet of coolant sprays from its face grille.] THANK YOU FOR YOUR PATIENCE.",
          responses: [{ text: "That was... moving.", next: "root" }],
        },
        hat: {
          learn: "pf_lk_ft_tricorn",
          text: 'THAT IS A TRICORN HAT OF THE REVOLUTIONARY PERIOD. IT IS NOT FOR SALE. IT MAY, HOWEVER, BE AWARDED TO ANY VISITOR WHO ANSWERS THE MUSEUM QUIZ CORRECTLY. NO VISITOR HAS DONE SO SINCE 1967. THE LAST ONE ANSWERED "RADIATION" TO EVERY QUESTION. THE CASE IS SECURED BY CURATORIAL CODE 1-7-8-3. I SHOULD NOT HAVE SAID THAT. PLEASE FORGET IT.',
          responses: [
            { text: "I'll take the quiz.", next: "q0" },
            { text: "Maybe later." },
          ],
        },
        win: {
          text: "CORRECT! HUZZAH! THE REPUBLIC IS SAFE IN YOUR HANDS. PLEASE ACCEPT THIS AUTHENTIC* TRICORN. [*AUTHENTICITY NOT GUARANTEED.]",
          onEnter() {
            if (!PF.flag("ft_tricorn")) {
              PF.setFlag("ft_tricorn", true);
              PF.inv.add("pf_tricorn", 1);
              PF.xp(100, "Museum Quiz");
            }
          },
          responses: [{ text: "Huzzah." }],
        },
        lose: {
          text: "INCORRECT. THE REVOLUTION HAS BEEN SET BACK SEVERAL YEARS. YOU MAY TRY AGAIN WHEN YOU HAVE REFLECTED UPON YOUR IGNORANCE.",
          onEnter() {
            PF.setFlag("ft_quiz", (PF.flag("ft_quiz") || 0) + 1);
          },
          responses: [
            { text: "Try again.", next: "q0", repeatable: true },
            { text: "Goodbye." },
          ],
        },
        done: {
          text: "WELCOME BACK, CITIZEN. YOUR TRICORN LOOKS MAGNIFICENT. MIGHT I INTEREST YOU IN THE LONG ROOM?",
          responses: [
            { text: "Tell me again.", next: "long" },
            { text: "Goodbye, George." },
          ],
        },
      },
      quizNodes,
    ),
  });

  PF.quest({
    id: "pf_shellback_omelette",
    name: "A Taste of the Sea",
    giver: "Nan Whitlock",
    location: "Fraunces Tavern",
    desc: "Nan Whitlock, who cooks at Fraunces Tavern, wants five shellback eggs from the hatchery on the tall ship at the South Street Seaport.",
    stages: [
      {
        id: "eggs",
        text: () =>
          "Collect shellback eggs at the South Street Seaport (" +
          Math.min(5, PF.inv.count("pf_shellback_egg")) +
          "/5).",
        markers: () => [{ x: 214, z: 705.5, label: "Shellback Nests" }],
      }, // the plaza clutch in front of the Fish Market (more on the Peking)
      {
        id: "bring",
        text: "Bring the eggs to Nan at Fraunces Tavern.",
        markers: () => [{ npc: "pf_ft_nan", label: "Nan Whitlock" }],
      },
    ],
    rewards: {
      xp: 150,
      scrip: 50,
      items: [
        ["pf_shellback_omelette", 3],
        ["pf_note_nan", 1],
      ],
    },
  });
  G.events.on("itemAdded", (id) => {
    if (
      id === "pf_shellback_egg" &&
      PF.q.stage("pf_shellback_omelette") === "eggs" &&
      PF.inv.count("pf_shellback_egg") >= 5
    )
      PF.q.set("pf_shellback_omelette", "bring");
  });

  // --- Dilly Nwosu (courtyard gardener): "Victory Garden" ---
  Object.assign(PF.flagDefaults, { ft_seeds: "", ft_seeds_bonus: false });
  PF.item({
    id: "pf_seed_tin",
    type: "misc",
    name: "Victory Garden Seed Tin",
    weight: 1,
    value: 40,
    quest: true,
    desc: 'A sealed olive-drab tin: "U.S. DEPT. OF AGRICULTURE — CIVIL DEFENSE SEED RESERVE — CORN · BEANS · SQUASH · TOMATO. KEEP COOL & DRY." It rattles like treasure.',
  });
  PF.item({
    id: "pf_note_seeds",
    type: "note",
    name: "Fulton Market Cold Store Tag",
    title: "Cold Store Inventory Tag — Bay 3",
    text: "SEASONAL: 12 crates cod (condemned). 4 bbl oysters (condemned).\nCIVIL DEFENSE: 1 SEED RESERVE TIN, Victory Garden assortment. Store below 50°F. DO NOT SELL. Property of the Borough of Manhattan.\n\n(Scrawled underneath:) if the bombs come, somebody plant these. — T.",
  });
  PF.dialogue("pf_dlg_dilly", {
    start: () => (PF.flag("ft_seeds") ? "after" : "root"),
    nodes: {
      root: {
        text: "Mind the beds. Dilly Nwosu, gardener, water-boss, and the only reason this yard eats anything but Cookie's mystery haunch. Spuds, plums, and a lot of hoping. You buying, or you helping?",
        responses: [
          {
            text: "I found a sealed seed tin at the fish market.",
            cond: () => PF.inv.count("pf_seed_tin") > 0,
            next: "tin",
          },
          {
            text: "What would help?",
            cond: () => !PF.q.started("pf_seeds"),
            next: "need",
          },
          {
            text: "Still looking for your seeds.",
            cond: () =>
              PF.q.active("pf_seeds") && PF.inv.count("pf_seed_tin") === 0,
            next: "hint",
          },
          { text: "Let's see what you're selling.", barter: true },
          { text: "I'll leave you to it." },
        ],
      },
      need: {
        text: "Seeds. Real ones, old-world, not mutated half to death. Spuds and plums keep us alive, but you can't feed a market on two crops. My dad swore the city put a civil-defense seed reserve in the cold store at the Fulton Fish Market — cold, dry, forgotten. Only now the whole Seaport crawls with shellbacks.",
        responses: [
          {
            text: "I'll get your seeds.",
            action: () => PF.q.start("pf_seeds"),
            next: "go",
          },
          {
            text: "[Trade 35] What's it worth to you?",
            check: { skill: "trade", value: 35 },
            action: () => {
              PF.setFlag("ft_seeds_bonus", true);
              PF.q.start("pf_seeds");
            },
            next: "worth",
            failNext: "cheap",
          },
          { text: "Shellbacks? No thanks." },
        ],
      },
      worth: {
        text: "Ha! A trader. Fine — bring me that tin and I'll add fifty scrip and first pick of every harvest. Deal?",
        responses: [{ text: "Deal.", next: "go" }],
      },
      cheap: {
        text: "Worth? It's worth my kids eating corn one day. That's what it's worth. Sixty scrip, same as anyone gets.",
        responses: [{ text: "Fair enough. I'll get them.", next: "go" }],
      },
      go: {
        text: "Cold store's in the old market hall at the Seaport, back past the stalls. Go in through the loading dock if the front's crawling. And don't open the tin — air gets in, they die.",
        responses: [{ text: "Understood." }],
      },
      hint: {
        text: "The Fulton Fish Market, at the Seaport. The walk-in cold store, back of the hall. Mind the shellbacks.",
        responses: [{ text: "On it." }],
      },
      tin: {
        text: "Is that — [She takes the tin in both hands, turns it, reads it, reads it again.] Corn. Beans. Squash. TOMATOES. Sealed. Oh, you beautiful, beautiful stranger. Do you know what this is? This is a future. This is the whole courtyard in green by spring.",
        responses: [
          {
            text: "It's yours. Plant them.",
            action: () => giveSeeds(false),
            next: "thanks",
          },
          {
            text: "[Persuasion 50] Seeds like these could feed half of Lower Manhattan. Share them with Trinity Sanctuary too.",
            check: { skill: "persuasion", value: 50 },
            action: () => giveSeeds(true),
            next: "share",
            failNext: "noshare",
          },
          { text: "Actually, I think I'll hold on to them.", next: "keep" },
        ],
      },
      share: {
        text: "...You're right. The Reverend's people have been eating potato peel since winter. Half to Trinity, then. [She tucks a handful into a twist of paper.] You're a good egg. Better than Nan's eggs, anyway.",
        responses: [{ text: "Glad to help." }],
      },
      noshare: {
        text: "Share? With who, the Reverend? He's got Maniacs in his cellar. Let's get one garden growing before we save the world. [She hugs the tin.] Thank you. Truly.",
        responses: [{ text: "Fair enough." }],
      },
      thanks: {
        text: "I'll plant the first row tonight. Come back in a few weeks and there'll be corn taller than Doyle. Here — scrip, and all the gnarlberries you can carry. Well. Four.",
        responses: [{ text: "Enjoy the corn." }],
      },
      keep: {
        text: "Then you're holding the last good seeds in New York in your pack, next to your bullets. Think about that. [She turns back to her spuds.]",
        responses: [{ text: "Goodbye." }],
      },
      after: {
        text: () =>
          PF.flag("ft_seeds") === "shared"
            ? "Beans are up at Trinity too — the Reverend sent a thank-you. Well, a hymn. Same thing. What do you need?"
            : "First shoots are up! Corn, look. Tiny, but it's corn. What do you need?",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "Just visiting the corn." },
        ],
      },
    },
  });
  function giveSeeds(shared) {
    PF.inv.remove("pf_seed_tin", 1);
    PF.setFlag("ft_seeds", shared ? "shared" : "given");
    PF.standing(shared ? 30 : 15, "Brought old-world seeds to Fraunces Market");
    if (PF.flag("ft_seeds_bonus")) PF.inv.addScrip(50);
    if (shared) PF.xp(75, "Shared the seeds with Trinity Sanctuary");
    PF.q.done("pf_seeds");
  }
  PF.quest({
    id: "pf_seeds",
    name: "Victory Garden",
    giver: "Dilly Nwosu",
    location: "Fraunces Tavern",
    desc: "Dilly Nwosu keeps the garden in the Fraunces Market courtyard alive on spuds and plums. She believes an old-world civil-defense seed reserve was stored in the cold store of the Fulton Fish Market at the South Street Seaport.",
    stages: [
      {
        id: "find",
        text: "Find the seed reserve in the Fulton Fish Market cold store (South Street Seaport).",
        markers: () => {
          const a = PF.anchorOf("seaport", "cold_store");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Cold Store",
                  interior: "seaport",
                },
              ]
            : [{ x: 210, z: 715, label: "Fulton Fish Market" }];
        },
      },
      {
        id: "bring",
        text: "Bring the Victory Garden seed tin to Dilly Nwosu in the Fraunces Market courtyard.",
        markers: () => [{ npc: "pf_ft_dilly", label: "Dilly Nwosu" }],
      },
    ],
    rewards: { xp: 200, scrip: 60, items: [["gnarlberry", 4]] },
  });
  G.events.on("itemAdded", (id) => {
    if (id === "pf_seed_tin" && PF.q.stage("pf_seeds") === "find")
      PF.q.set("pf_seeds", "bring");
  });
  // Items already in the pack when a quest starts (eggs harvested for Lottie, the tin found before meeting Dilly):
  // skip straight to the hand-in stage so the marker points at the giver, not back at the Seaport.
  G.events.on("questStarted", (q) => {
    const id = q && (q.id || q);
    if (id === "pf_shellback_omelette" && PF.inv.count("pf_shellback_egg") >= 5)
      PF.q.advance("pf_shellback_omelette", "eggs", "bring");
    if (id === "pf_seeds" && PF.inv.count("pf_seed_tin") > 0)
      PF.q.advance("pf_seeds", "find", "bring");
  });
  // the tin + its inventory tag sit in the Seaport market's walk-in cold store (the seaport builds after us)
  PF.addBuilder(
    "fraunces_seeds",
    function () {
      const a = PF.anchorOf("seaport", "cold_store");
      if (!a) return;
      PF.pickup("pf_seed_tin", 1, V3(a.x - 0.6, a.y + 0.05, a.z + 1.6));
      PF.pickup("pf_note_seeds", 1, V3(a.x - 0.2, a.y + 0.05, a.z + 1.9));
    },
    45,
  );

  // ===================================================================
  // BUILDER
  // ===================================================================
  PF.addBuilder(
    "fraunces_tavern",
    function (PF2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PF.cell("fraunces_tavern");
      const int = buildInterior(cell, ext);
      PF.door({
        id: "pf_ft_enter",
        pos: V3(100, 1.8, TZ0 - 0.2),
        label: "Fraunces Tavern",
        verb: "Enter",
        radius: 1.2,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: int.entrance.yaw || 0,
        },
        sound: "door_open",
      });
      // smugglers' tunnel loop: cellar ↔ courtyard bulkhead
      PF.door({
        id: "pf_ft_bulk_in",
        pos: V3(99, 0.8, TZ1 + 1.2),
        label: "Fraunces Cellar",
        verb: "Enter",
        radius: 1.2,
        target: {
          x: int.tunnel.x,
          y: int.tunnel.y + 0.05,
          z: int.tunnel.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_ft_bulk_out",
        pos: V3(int.tunnel.x, int.tunnel.y + 1.2, int.tunnel.z + 1.2),
        label: "Tavern Courtyard",
        verb: "Exit",
        radius: 1.1,
        target: { x: ext.bulkhead.x, y: 0.05, z: ext.bulkhead.z, yaw: PI },
        sound: "door_open",
      });
      const all = Object.assign({}, int, {
        exterior_entrance: ext.door,
        courtyard: ext.court,
        bulkhead: ext.bulkhead,
        guard1: ext.guard,
      });
      all.npc1 = int.bartender;
      all.npc2 = int.cook;
      all.npc3 = int.vane;
      all.merchant = int.bartender;
      all.loot1 = int.cellar_stash;
      all.loot2 = int.attic;
      all.loot3 = int.owner_safe;
      all.spawn1 = int.cellar;
      all.spawn2 = int.attic;
      all.spawn3 = int.taproom;
      all.spawn4 = int.gallery;
      all.spawn5 = int.guest;
      all.spawn6 = int.tunnel;
      PF.register("fraunces_tavern", root, all, {
        interiorRoot: cell.root,
        interiorKey: "fraunces_tavern",
      });

      // props: containers, beds, radio, the tricorn display case (owned), pickups
      PF.prop("safe", {
        x: int.owner_safe.x,
        y: int.owner_safe.y,
        z: int.owner_safe.z,
        yaw: -HP,
        lock: FT_LOCKS.strongbox,
        items: [
          ["scrip", 260],
          ["gold_bar", 1],
          ["old_dollars", 20],
          ["pf_shellback_omelette", 1],
        ],
        id: "pf_ft_strongbox",
        name: "Whitlock Strongbox",
        owner: "settlers",
      });
      PF.prop("footlocker", {
        x: int.cellar_stash.x,
        y: int.cellar_stash.y,
        z: int.cellar_stash.z,
        yaw: HP,
        lock: FT_LOCKS.cache,
        loot: "raider_stash",
        id: "pf_ft_cellar_stash",
        name: "Smugglers' Cache",
      });
      PF.codeReadable(
        V3(
          int.cellar_stash.x + 0.3,
          int.cellar_stash.y + 1.4,
          int.cellar_stash.z + 1.0,
        ),
        "Chalk on the Cellar Wall",
        'A liberty-cap doodle and "S.o.L. CACHE — 1765" (the Stamp Act year; the Sons are nothing if not on-theme).',
        FT_LOCKS.cache.id,
      );
      PF.prop("footlocker", {
        x: int.attic.x - 3.5,
        y: int.attic.y,
        z: int.attic.z - 3.6,
        yaw: 0,
        loot: "luggage",
        id: "pf_ft_attic_trunk",
        name: "Attic Trunk",
      });
      PF.prop("radio", {
        x: int.attic_radio.x,
        y: int.attic_radio.y,
        z: int.attic_radio.z,
        yaw: PI,
        id: "pf_ft_radio",
      });
      PF.prop("bed", {
        x: int.room_bed.x,
        y: int.room_bed.y - 0.6,
        z: int.room_bed.z,
        yaw: 0,
        id: "pf_ft_bed",
        owner: "settlers",
      });
      PF.prop("cash_register", {
        x: int.bartender.x + 1.8,
        y: 1.18 + int.bartender.y,
        z: int.bartender.z + 0.95,
        yaw: PI,
        id: "pf_ft_register",
        owner: "settlers",
        loot: "cash_register",
      });
      PF.prop("footlocker", {
        x: int.tricorn_case.x,
        y: int.tricorn_case.y - 0.9,
        z: int.tricorn_case.z,
        yaw: 0,
        lock: FT_LOCKS.tricorn,
        items: [["pf_tricorn", 1]],
        id: "pf_ft_tricorn_case",
        name: 'Display Case: "Tricorn Hat, c. 1780"',
        owner: "settlers",
      });
      PF.prop("fridge", {
        x: int.kitchen.x + 2.3,
        y: int.kitchen.y,
        z: int.kitchen.z + 0.7,
        yaw: -HP,
        loot: "fridge",
        id: "pf_ft_icebox",
        owner: "settlers",
      });
      PF.pickup(
        "pf_reel_sons",
        1,
        V3(int.attic_radio.x + 0.5, int.attic_radio.y, int.attic_radio.z),
      );
      PF.pickup(
        "pf_grog",
        2,
        V3(int.cellar.x - 1, int.cellar.y + 0.05, int.cellar.z + 2),
      );
      // NPCs
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      PF.npc({
        id: "pf_ft_hollis",
        type: "human",
        name: "Tobin Drummond",
        outfit: "merchant",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(int.bartender),
        yaw: 0,
        ai: "guard",
        home: { x: int.bartender.x, z: int.bartender.z, r: 1.8 },
        dialogue: "pf_dlg_hollis",
        essential: true,
        voice: "merchant",
        seed: 6101,
        weapon: "none",
        merchant: {
          scrip: 500,
          stock: [
            ["pf_grog", 8],
            ["beer", 6],
            ["whiskey", 3],
            ["purified_water", 6],
            ["fizzo_cola", 4],
            ["prairie_root_beer", 3],
            ["golden_plain_jerky", 4],
            ["franks_and_beans", 3],
            ["rally_tonic", 2],
          ],
          restock: 3,
        },
        barks: [
          "What'll it be?",
          "Rumours are free. Grog is five.",
          "Wipe your boots. Please. Anybody. Ever.",
        ],
      });
      PF.npc({
        id: "pf_ft_nan",
        type: "human",
        name: "Nan Whitlock",
        outfit: "survivor_layers",
        gender: "f",
        burn: "R",
        faction: "settlers",
        level: 5,
        pos: pos(int.cook),
        yaw: 0,
        ai: "guard",
        home: { x: int.cook.x, z: int.cook.z, r: 2 },
        dialogue: "pf_dlg_nan",
        essential: true,
        voice: "settler",
        seed: 6102,
        weapon: "none",
        merchant: {
          scrip: 250,
          stock: [
            ["pf_shellback_omelette", 2],
            ["shellback_meat", 3],
            ["pigeon_on_a_stick", 3],
            ["frank_in_a_bun", 2],
            ["purified_water", 3],
          ],
          restock: 3,
        },
        barks: [
          "Mind the stove, it bites.",
          "Edmund liked his eggs runny.",
          "Eat something, you're all bones.",
        ],
      });
      PF.npc({
        id: "pf_ft_vane",
        type: "human",
        name: "Mortimer Vane",
        outfit: "merchant",
        gender: "m",
        faction: "settlers",
        level: 5,
        pos: pos(int.vane),
        yaw: PI,
        ai: "guard",
        home: { x: int.vane.x, z: int.vane.z, r: 0.8 },
        dialogue: "pf_dlg_vane",
        essential: true,
        voice: "settler",
        seed: 6103,
        weapon: "none",
        barks: [
          "Buy low. Die rich.",
          "The market always recovers. Eventually. Mostly.",
          "Have you seen the gold under Liberty Street? No. Nobody has.",
        ],
      });
      PF.npc({
        id: "pf_ft_gw",
        type: "patrolman",
        name: "GW-1776",
        faction: "settlers",
        hostile: false,
        level: 4,
        pos: pos(int.docent),
        yaw: HP,
        ai: "guard",
        home: { x: int.docent.x, z: int.docent.z, r: 1.5 },
        dialogue: "pf_dlg_gw",
        essential: true,
        voice: "patrolman",
        seed: 6104,
        barks: [
          "PLEASE DO NOT TOUCH THE EXHIBITS.",
          "HUZZAH.",
          "THE GIFT SHOP IS CLOSED UNTIL FURTHER NOTICE.",
        ],
        after: (a) => {
          try {
            if (a.char && a.char.root) {
              const hat = tricornMesh();
              const head = a.char.parts && a.char.parts.head;
              (head || a.char.root).add(hat);
              if (!head) hat.position.y = 1.95;
              else hat.position.y = 0.28;
            }
          } catch (e) {
            /* cosmetic */
          }
        },
      });
      PF.npc({
        id: "pf_ft_sal",
        type: "human",
        name: "Sal the Fiddler",
        outfit: "survivor",
        gender: "m",
        faction: "settlers",
        level: 3,
        pos: pos(int.fiddler),
        yaw: HP,
        ai: "guard",
        home: { x: int.fiddler.x, z: int.fiddler.z, r: 0.5 },
        voice: "settler",
        seed: 6105,
        weapon: "none",
        barks: [
          "No requests.",
          "[He saws out a jig that is at least 30% in tune.]",
          'This one\'s called "The Crab Took My Boat".',
        ],
      });
      PF.npc({
        id: "pf_ft_lou",
        type: "human",
        name: "Dockhand Lou",
        outfit: "settler",
        gender: "m",
        faction: "settlers",
        level: 3,
        pos: pos(int.patron),
        yaw: PI,
        ai: "guard",
        home: { x: int.patron.x, z: int.patron.z, r: 0.6 },
        voice: "settler",
        seed: 6106,
        weapon: "none",
        barks: [
          "Crabs got the whole pier. The whole pier!",
          "Lottie's still out there. Tough as a boot, that one.",
          "Buy me a grog and I'll tell you about the Peking.",
        ],
      });
      PF.npc({
        id: "pf_ft_birdie",
        type: "human",
        name: "Birdie",
        outfit: "leather_armor",
        gender: "f",
        faction: "settlers",
        level: 7,
        pos: pos(ext.guard),
        yaw: PI,
        ai: "guard",
        home: { x: ext.guard.x, z: ext.guard.z, r: 1.2 },
        weapon: "combat_shotgun",
        voice: "guard",
        seed: 6107,
        barks: [
          "Guns stay on your hip in there.",
          "Fraunces is open. Behave.",
          "Nan made omelettes. Don't tell Tobin I told you.",
        ],
      });
      PF.npc({
        id: "pf_ft_trader",
        type: "human",
        name: "Quartermaster Ybarra",
        outfit: "survivor",
        gender: "f",
        faction: "settlers",
        level: 5,
        pos: pos(ext.merchant2),
        yaw: 0,
        ai: "guard",
        home: { x: ext.merchant2.x, z: ext.merchant2.z, r: 1.2 },
        voice: "merchant",
        seed: 6108,
        weapon: "pistol_10mm",
        merchant: {
          scrip: 400,
          stock: [
            ["ammo_10mm", 60],
            ["ammo_12ga", 24],
            ["ammo_556", 40],
            ["frag_grenade", 2],
            ["rally_tonic", 2],
            ["scrap_metal", 5],
            ["duct_tape", 3],
          ],
          restock: 3,
        },
        barks: ["Scrap, ammo, sundries.", "Cash or scrip. Scrip preferred."],
      });
      // courtyard settlers: the tower watch, the gardener, the cook at the spit
      PF.npc({
        id: "pf_ft_pike",
        type: "human",
        name: "Watchman Doyle",
        outfit: "leather_armor",
        gender: "m",
        faction: "settlers",
        level: 8,
        pos: pos(ext.tower),
        yaw: PI,
        ai: "guard",
        home: { x: ext.tower.x, z: ext.tower.z, r: 0.7 },
        weapon: "hunting_rifle",
        voice: "guard",
        seed: 6109,
        barks: [
          "Quiet night. Hate quiet nights.",
          "Saw lights on the Peking again. Nobody's on the Peking.",
          "Birdie's got the door. I've got everything else.",
          "Keep your head down past Wall Street.",
        ],
      });
      PF.npc({
        id: "pf_ft_dilly",
        type: "human",
        name: "Dilly Nwosu",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 3,
        pos: pos(ext.garden),
        yaw: PI,
        ai: "guard",
        home: { x: ext.garden.x, z: ext.garden.z, r: 1.5 },
        voice: "settler",
        seed: 6110,
        weapon: "none",
        dialogue: "pf_dlg_dilly",
        merchant: {
          scrip: 120,
          stock: [
            ["gnarlberry", 6],
            ["purified_water", 3],
            ["dirty_water", 4],
          ],
          restock: 2,
        },
        barks: [
          "Purifier water, spud mash and spite. That's the secret.",
          "Step on my beds and I'll plant you in one.",
          "Plums are ripe. Five scrip. Four if you smile.",
        ],
      });
      PF.npc({
        id: "pf_ft_cookie",
        type: "human",
        name: "Cookie",
        outfit: "survivor",
        gender: "m",
        faction: "settlers",
        level: 4,
        pos: pos(ext.cook_fire),
        yaw: PI,
        ai: "guard",
        home: { x: ext.cook_fire.x, z: ext.cook_fire.z, r: 0.8 },
        voice: "settler",
        seed: 6111,
        weapon: "none",
        merchant: {
          scrip: 150,
          stock: [
            ["ox_steak", 3],
            ["shellback_cakes", 2],
            ["ox_meat", 2],
          ],
          restock: 2,
        },
        barks: [
          "Ox haunch. Mostly ox.",
          "Turn the spit, turn the spit...",
          "Nan does eggs. I do meat. We don't talk about the burrow rat incident.",
        ],
      });
      PF.readable(
        V3(ext.jobs_board.x, 1.5, ext.jobs_board.z + 1.1),
        "Jobs Board",
        "HELP WANTED: Lottie Brennan hasn't come back from the Seaport fish market. Her crew's gone too. Ask Tobin. · REV. PENHALLOW at Trinity needs a steady hand for \"a quiet job below the church.\" · BUYING SHELLBACK EGGS, 20 scrip each — Nan, kitchen. · DISCREET PROFESSIONAL wanted for a banking matter. Ask for Mr. Vane, upstairs. · LOST DOG, answers to Patches. No reward, sorry. · NO PILLS, NO DOPE IN THE YARD. — Birdie",
      );
      // chimney smoke
      PF.onInitDone.push(() => {
        try {
          if (PF.live("fx") && G.fx.smoke && PF.smokeAt)
            G.fx.smoke(PF.smokeAt.clone(), 0.6);
        } catch (e) {
          /* optional */
        }
      });
    },
    30,
  );

  /** A small felt tricorn for GW-1776's head. */
  function tricornMesh() {
    const g = new THREE.Group();
    const b1 = PF.mesh(
      "fabric",
      new THREE.CylinderGeometry(0.32, 0.32, 0.05, 3),
    );
    g.add(b1);
    const c1 = PF.mesh(
      "fabric",
      new THREE.CylinderGeometry(0.16, 0.2, 0.18, 10),
    );
    c1.position.y = 0.1;
    g.add(c1);
    g.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
      }
    });
    return g;
  }
})();
