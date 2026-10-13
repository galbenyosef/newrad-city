/* src/poi_financial/40_seaport.js */
/* =====================================================================
 * NEW RAD CITY — POI FINANCIAL — SOUTH STREET SEAPORT
 * Exterior (site x 170..250, z 677..753 + the piers & ships on the East
 * River beyond it): Schermerhorn Row's Federal-style brick warehouses with
 * pitched roofs, dormers and chimneys; the cobbled Fulton Street plaza; the
 * Fulton Fish Market shed; the Titanic Memorial lighthouse; a broken
 * fragment of the elevated FDR Drive; Pier 17 with its glass pavilion;
 * Pier 16 with the four-masted barque PEKING (black hull, full rig) and the
 * red lightship AMBROSE. Shellback nests everywhere.
 * Interior (INTERIORS.seaport, lifted 10 m), two sub-areas:
 *   SHIP  — the Peking's 'tween deck (fo'c'sle, crew berths, galley, sail
 *           locker, collapsed midships deck), the cargo hold with the
 *           SHELLBACK HATCHERY, and the captain's saloon aft (loop exit).
 *   MARKET — the Fulton Fish Market hall: stalls, cold store, loading dock,
 *           and the counting-house mezzanine where Lottie Brennan hides.
 * Quest "Low Tide" (Lottie), nest harvesting for Nan's omelette.
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
  const BASE = 10;

  // ship frames (exterior)
  const PK = {
    x0: 264,
    x1: 328,
    zc: 736.2,
    hb: 5.0,
    deck: 4.0,
    top: 5.2,
    bot: -5.5,
  }; // Peking
  const AM = {
    x0: 281,
    x1: 307,
    zc: 712.2,
    hb: 3.4,
    deck: 2.6,
    top: 3.5,
    bot: -3.5,
  }; // Ambrose
  const P16 = { z0: 718, z1: 728, x1: 332 }; // Pier 16
  const P17 = { z0: 681, z1: 701, x1: 318 }; // Pier 17
  const shoreX = (z) => 285 - ((z - 620) * 30) / 140;

  Object.assign(PF.flagDefaults, {
    sp_met: false,
    sp_nest: false,
    sp_harvest: false,
    sp_cal: false,
    sp_market: false,
    sp_clutch: [],
    sp_lottie_door: false,
  });

  // ===================================================================
  // helpers
  // ===================================================================
  /** Hull half-width factor along the length v (0 = stern, 1 = bow). */
  function wf(v, sharp) {
    if (v < 0.12) return 0.72 + 0.28 * (v / 0.12);
    if (v > 0.68)
      return Math.pow(Math.cos(((v - 0.68) / 0.32) * HP), sharp || 0.85);
    return 1;
  }
  /** Deck outline point (world) at v, side s (-1 port/north, +1 starboard/south). */
  function deckPt(S, v, s, inset) {
    return [S.x0 + v * (S.x1 - S.x0), S.zc + s * (S.hb * wf(v) - (inset || 0))];
  }
  /** Parametric hull surface. */
  function hull(b, key, S, opts) {
    opts = opts || {};
    const g = PF.surface(
      (u, v, out) => {
        const th = (u - 0.5) * PI,
          w = S.hb * wf(v);
        const sheer = S.top + 0.6 * Math.pow(Math.abs(v - 0.5) * 2, 2.5); // sheer line rises at the ends
        const bot = S.bot + 1.5 * Math.pow(Math.abs(v - 0.45) * 1.8, 3);
        const yy = sheer - (sheer - bot) * Math.pow(Math.cos(th), 0.35);
        out.set(S.x0 + v * (S.x1 - S.x0), yy, S.zc + w * Math.sin(th));
      },
      opts.nu || 16,
      opts.nv || 36,
      { flip: true },
    );
    b.add(key, g, { grime: 0.45, noAO: true });
  }
  /** Flat deck polygon at height y (+ collider strips). */
  function deck(b, key, S, y, inset, collide) {
    const pts = [];
    for (let i = 0; i <= 24; i++) pts.push(deckPt(S, i / 24, -1, inset));
    for (let i = 24; i >= 0; i--) pts.push(deckPt(S, i / 24, 1, inset));
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], -pts[0][1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], -pts[i][1]);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: 0.25,
      bevelEnabled: false,
    });
    g.rotateX(-HP);
    g.translate(0, y - 0.25, 0);
    b.add(key, g, { grime: 0.5 });
    if (collide) {
      for (let i = 0; i < 16; i++) {
        const v0 = i / 16,
          v1 = (i + 1) / 16,
          vm = (v0 + v1) / 2;
        const w = S.hb * Math.min(wf(v0), wf(v1)) - (inset || 0) + 0.2;
        if (w < 0.3) continue;
        PF.colMM(
          S.x0 + v0 * (S.x1 - S.x0),
          S.bot,
          S.zc - w,
          S.x0 + v1 * (S.x1 - S.x0),
          y,
          S.zc + w,
          { surface: "wood" },
        );
        void vm;
      }
    }
    return pts;
  }
  /** Bulwark (inner planking + rail) along the deck edge with colliders; gaps: [[v0,v1,side]]. */
  function bulwark(b, S, y, h, gaps, keyIn, keyRail) {
    for (const s of [-1, 1]) {
      for (let i = 0; i < 24; i++) {
        const v0 = i / 24,
          v1 = (i + 1) / 24,
          vm = (v0 + v1) / 2;
        if ((gaps || []).some((g) => g[2] === s && vm > g[0] && vm < g[1]))
          continue;
        const [ax, az] = deckPt(S, v0, s, 0.12),
          [bx, bz] = deckPt(S, v1, s, 0.12);
        const len = Math.hypot(bx - ax, bz - az),
          ry = Math.atan2(-(bz - az), bx - ax);
        b.box(
          keyIn || "hull_white",
          (ax + bx) / 2,
          y,
          (az + bz) / 2,
          len + 0.05,
          h,
          0.14,
          { ry, seg: false, grime: 0.5 },
        );
        b.box(
          keyRail || "mahogany",
          (ax + bx) / 2,
          y + h,
          (az + bz) / 2,
          len + 0.08,
          0.1,
          0.3,
          { ry, seg: false },
        );
        PF.colWall(ax, az, bx, bz, 0.25, y, y + h + 0.1, { walkable: false });
      }
    }
    // transom (stern) rail
    const [sx0, sz0] = deckPt(S, 0, -1, 0.12),
      [sx1, sz1] = deckPt(S, 0, 1, 0.12);
    b.box(
      keyIn || "hull_white",
      sx0 + 0.07,
      y,
      (sz0 + sz1) / 2,
      0.14,
      h,
      Math.abs(sz1 - sz0),
      { seg: false },
    );
    b.box(
      keyRail || "mahogany",
      sx0 + 0.07,
      y + h,
      (sz0 + sz1) / 2,
      0.3,
      0.1,
      Math.abs(sz1 - sz0) + 0.1,
      { seg: false },
    );
    PF.colMM(
      sx0 - 0.1,
      y,
      Math.min(sz0, sz1),
      sx0 + 0.25,
      y + h + 0.1,
      Math.max(sz0, sz1),
      { walkable: false },
    );
  }
  /** Painted letters on a hull side (flat quad). */
  function hullName(b, text, x, y, z, ry, w, h, color) {
    const k = PF.texMat(
      "sp_name_" + text + "_" + (color || "w"),
      PF.canvasTex(
        "pf_sp_name_" + text + (color || "w"),
        512,
        96,
        (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H);
          ctx.fillStyle = color || "#e8e4d8";
          ctx.font = "bold 76px Georgia, serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, W / 2, H / 2 + 4);
          for (let i = 0; i < 400; i++) {
            ctx.clearRect(
              Math.random() * W,
              Math.random() * H,
              2 + Math.random() * 5,
              2 + Math.random() * 4,
            );
          }
        },
        { clamp: true },
      ),
      { transparent: true, rough: 0.7 },
    );
    b.quad(k, x, y, z, w, h, { ry, grime: 0.1, noAO: true });
  }
  /** A timber pier: deck slab + piles + bollards + edge beams (+ colliders). */
  function pier(b, x0, x1, z0, z1, y, opts) {
    opts = opts || {};
    b.boxMM(opts.key || "deck_wood", x0, y - 0.35, z0, x1, y, z1, {
      grime: 0.6,
      segLen: 4,
    });
    PF.colMM(x0, y - 3, z0, x1, y, z1, { surface: "wood" });
    for (let x = x0 + 1; x < x1; x += 3)
      for (const z of [z0 + 0.3, (z0 + z1) / 2, z1 - 0.3])
        b.cyl("rotten", x, -6, z, 0.25, 0.28, 6 + y - 0.35, 6, {
          hSeg: 2,
          grime: 0.8,
        });
    for (let x = x0 + 2; x < x1 - 1; x += 7)
      for (const z of [z0 + 0.4, z1 - 0.4]) {
        b.cyl("iron", x, y, z, 0.18, 0.22, 0.5, 8, { hSeg: 1 });
        b.cyl("iron", x, y + 0.5, z, 0.26, 0.2, 0.12, 8, { hSeg: 1 });
      }
    b.boxMM("rotten", x0, y - 0.6, z0 - 0.2, x1, y - 0.1, z0, { seg: false });
    b.boxMM("rotten", x0, y - 0.6, z1, x1, y - 0.1, z1 + 0.2, { seg: false });
    // broken planks & holes
    const r = PF.rng(x0 * 3 + z0);
    for (let i = 0; i < (opts.holes || 3); i++)
      b.box(
        "glass_broken",
        x0 + 4 + r() * (x1 - x0 - 8),
        y + 0.005,
        z0 + 1 + r() * (z1 - z0 - 2),
        1.2 + r(),
        0.01,
        0.6 + r() * 0.6,
        { ry: r() * PI, seg: false, noAO: true },
      );
  }
  /** Shellback nest mound with eggs (+ glow). Returns centre. */
  function nest(b, x, y, z, r0, eggs, parent, seed) {
    const r = PF.rng(seed || x * 7 + z);
    b.rock("dirt", x, y - r0 * 0.4, z, r0, {
      flat: 0.35,
      rough: 0.6,
      seed: seed || x,
    });
    b.rock("slime", x + r0 * 0.3, y - r0 * 0.3, z - r0 * 0.2, r0 * 0.6, {
      flat: 0.3,
      detail: 1,
      seed: (seed || x) + 1,
    });
    for (let i = 0; i < eggs; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * r0 * 0.8;
      b.sphere(
        "egg",
        x + Math.cos(a) * d,
        y + 0.15 + r() * 0.12 + (1 - d / r0) * r0 * 0.25,
        z + Math.sin(a) * d,
        0.16 + r() * 0.06,
        { ws: 8, hs: 6, sy: 1.25 },
      );
    }
    for (let i = 0; i < 5; i++) {
      const a = r() * TAU;
      b.box(
        "bone",
        x + Math.cos(a) * r0,
        y + 0.03,
        z + Math.sin(a) * r0,
        0.05,
        0.05,
        0.4,
        { ry: r() * PI, seg: false },
      );
    }
    PF.glow(V3(x, y + 0.4, z), 0x9aff60, r0 * 1.6, parent || null, {
      intensity: 0.7,
      flicker: 0.15,
    });
    return V3(x, y, z);
  }

  /** One long face of a Schermerhorn Row unit (fs +1 = south / plaza, -1 = north / Fulton Street): granite shopfront
   *  storey with cast-iron mullions & a named sign band, framed 6-over-6 sash windows (jambs, splayed lintel, sill,
   *  muntins) with a spread of dark / broken / boarded / shuttered states, and a dentil cornice. */
  const SHOPS_N = [
    "BOWNE & CO. STATIONERS",
    "A. A. LOW & BROS.",
    "SWEET'S",
    "FULTON ST. PROVISIONS",
    "PAGAN'S SAIL LOFT",
    "SEAPORT BOOKS",
  ];
  const SHOPS_S = [
    "FULTON FISH CO.",
    "SEAMEN'S SUPPLY",
    "SLOPPY LOU'S OYSTERS",
    "SHIP CHANDLERY",
    "SEAPORT MUSEUM",
    "FIZZO COLA · OYSTERS · RUM",
  ];
  function facade(b, u, i, bays, bw, fs, r) {
    const RZ0 = 680,
      RZ1 = 694,
      zf = fs > 0 ? RZ1 : RZ0,
      ry = fs > 0 ? 0 : PI;
    const Z = (d) => zf + fs * d;
    // ground storey: granite band, piers, cast-iron shopfronts
    b.boxMM(
      "granite",
      u.x0,
      0,
      Math.min(Z(0), Z(0.2)),
      u.x1,
      4.0,
      Math.max(Z(0), Z(0.2)),
      { seg: false, grime: 0.55 },
    );
    for (let k = 0; k <= bays; k++)
      b.box("granite", u.x0 + k * bw, 0, Z(0.3), 0.6, 4.0, 0.3, {
        seg: false,
        grime: 0.5,
      });
    for (let k = 0; k < bays; k++) {
      const cx = u.x0 + (k + 0.5) * bw,
        roll = r(),
        door = k === 1;
      b.quad(
        roll < 0.35 ? "planks" : roll < 0.55 ? "glass_broken" : "glass_dark",
        cx,
        1.8,
        Z(0.21),
        bw - 0.9,
        3.0,
        { ry, uv: "box", noAO: true },
      );
      for (const dx of [-(bw - 0.9) / 6, (bw - 0.9) / 6])
        b.box("iron", cx + dx, 0.3, Z(0.24), 0.07, 2.9, 0.06, { seg: false });
      b.box("iron", cx, 2.6, Z(0.25), bw - 0.9, 0.08, 0.07, { seg: false });
      b.box("granite", cx, 0, Z(0.3), bw - 0.8, 0.45, 0.2, {
        seg: false,
        grime: 0.6,
      }); // stall riser
      if (door) {
        b.box("glass_dark", cx, 0, Z(0.16), 1.2, 2.4, 0.08, { seg: false });
        b.box("rotten", cx + 0.35, 0.02, Z(0.62), 1.15, 2.3, 0.06, {
          ry: fs * 0.9,
          seg: false,
        });
      }
      // tattered canvas awning on some bays (north side mostly)
      if ((fs < 0 && r() < 0.55) || (fs > 0 && r() < 0.25)) {
        const torn = r() < 0.4,
          dep = torn ? 0.9 : 1.6;
        b.box(
          r() < 0.5 ? "awning_green" : "awning_red",
          cx,
          3.45 - dep * 0.3,
          Z(0.3 + dep / 2),
          bw - 0.95,
          0.04,
          dep,
          { rx: fs * 0.36, seg: false, grime: 0.6 },
        );
        for (const dx of [-(bw - 1) / 2, (bw - 1) / 2])
          b.beam(
            "iron",
            V3(cx + dx, 3.5, Z(0.3)),
            V3(cx + dx, 3.45 - dep * 0.6, Z(0.3 + dep)),
            0.03,
            0.03,
          );
      }
    }
    const names = fs > 0 ? SHOPS_S : SHOPS_N;
    const sk = PF.texMat(
      (fs > 0 ? "sp_shop" : "sp_shopn") + i,
      PF.signTex(
        (fs > 0 ? "sp_shop" : "sp_shopn") + i,
        [names[i]],
        (fs > 0 && i === 5) || (fs < 0 && i === 2) ? "enamel" : "engraved",
        512,
        96,
        (fs > 0 && i === 5) || (fs < 0 && i === 2)
          ? { bg: "#7a1c14", fg: "#f0e0c0" }
          : { bg: "#2a3a30", fg: "#e0d0a0" },
      ),
    );
    b.quad(
      sk,
      (u.x0 + u.x1) / 2,
      3.55,
      Z(0.36),
      Math.min(8, u.x1 - u.x0 - 2),
      0.6,
      { ry },
    );
    // upper storeys: framed sash windows
    for (let k = 0; k < bays; k++) {
      const cx = u.x0 + (k + 0.5) * bw;
      for (let f = 1; f < u.stories; f++) {
        const y = 4.6 + (f - 1) * 3.0,
          yc = y + 0.95,
          roll = r();
        const state =
          roll < 0.5
            ? "dark"
            : roll < 0.7
              ? "broken"
              : roll < 0.85
                ? "boarded"
                : "shutter";
        b.quad(
          state === "boarded"
            ? "planks"
            : state === "broken"
              ? "glass_broken"
              : "glass_dark",
          cx,
          yc,
          Z(0.015),
          1.0,
          1.8,
          { ry, noAO: true, uv: state === "boarded" ? "box" : undefined },
        );
        // reveal: jambs + head standing proud of the glass so the window reads recessed
        for (const dx of [-0.56, 0.56])
          b.box("brick_brown", cx + dx, y - 0.05, Z(0.02), 0.14, 2.0, 0.16, {
            seg: false,
            grime: 0.6,
          });
        b.box("limestone", cx, y + 1.9, Z(0.08), 1.44, 0.28, 0.2, {
          seg: false,
          grime: 0.45,
        }); // splayed lintel
        b.box("limestone", cx, y + 2.02, Z(0.14), 0.26, 0.2, 0.14, {
          seg: false,
        }); // keystone
        b.box("limestone", cx, y - 0.12, Z(0.1), 1.3, 0.1, 0.26, {
          seg: false,
          grime: 0.5,
        }); // sill
        if (state === "dark" || state === "shutter") {
          b.box("white_paint", cx, yc, Z(0.035), 1.0, 0.06, 0.05, {
            seg: false,
            grime: 0.6,
          }); // meeting rail
          for (const dx of [-0.17, 0.17])
            b.box("white_paint", cx + dx, y + 0.05, Z(0.035), 0.03, 1.8, 0.03, {
              seg: false,
              grime: 0.6,
            });
          for (const dy of [0.5, 1.4])
            b.box("white_paint", cx, y + dy, Z(0.035), 1.0, 0.03, 0.03, {
              seg: false,
              grime: 0.6,
            });
          for (const dx of [-0.5, 0.5])
            b.box("white_paint", cx + dx, y + 0.05, Z(0.035), 0.06, 1.8, 0.05, {
              seg: false,
              grime: 0.6,
            });
        } else if (state === "boarded") {
          for (const a of [0.55, -0.55])
            b.box("rotten", cx, yc - 0.1, Z(0.06), 1.35, 0.16, 0.04, {
              rz: a,
              seg: false,
              grime: 0.6,
            });
        } else {
          for (const dx of [-0.5, 0.5])
            b.box("white_paint", cx + dx, y + 0.05, Z(0.035), 0.06, 1.8, 0.05, {
              seg: false,
              grime: 0.7,
            });
          b.box("white_paint", cx - 0.2, yc - 0.3, Z(0.02), 0.04, 0.9, 0.04, {
            rz: 0.5,
            seg: false,
          }); // snapped muntin
        }
        if (state === "shutter")
          for (const sd of [-1, 1]) {
            const hang = r() < 0.3 && sd > 0;
            b.box(
              "paint_teal",
              cx + sd * 0.86,
              y + (hang ? -0.2 : 0.05),
              Z(0.1),
              0.5,
              1.8,
              0.04,
              { rz: hang ? 0.25 : 0, seg: false, grime: 0.6, c: 0x5a7a58 },
            );
          }
      }
    }
    // dentil cornice
    b.boxMM(
      "white_paint",
      u.x0,
      u.h - 0.35,
      Math.min(Z(0), Z(0.45)),
      u.x1,
      u.h,
      Math.max(Z(0), Z(0.45)),
      { seg: false, grime: 0.5 },
    );
    b.boxMM(
      "white_paint",
      u.x0,
      u.h - 0.62,
      Math.min(Z(0), Z(0.2)),
      u.x1,
      u.h - 0.52,
      Math.max(Z(0), Z(0.2)),
      { seg: false, grime: 0.55 },
    );
    for (let x = u.x0 + 0.15; x < u.x1 - 0.1; x += 0.28)
      b.box("white_paint", x, u.h - 0.52, Z(0.12), 0.13, 0.17, 0.2, {
        seg: false,
        grime: 0.55,
      });
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior(site, root) {
    const b = PF.batch("seaport_ext");
    b.ground = 0;
    b.aoH = 4;
    const r = PF.rng("seaport");
    const anchors = {};
    anchors.clutches = [];
    // ---- ground: cobbled plaza, esplanade to the river --------------------
    b.boxMM("cobble", site.x0, -0.1, site.z0, site.x1, 0.05, site.z1, {
      grime: 0.55,
      segLen: 6,
    });
    for (let z = site.z0; z < site.z1; z += 4) {
      const sx = shoreX(z + 2);
      b.boxMM("deck_wood", site.x1, -0.1, z, sx + 0.5, 0.06, z + 4, {
        grime: 0.6,
      });
    }
    // bulkhead edge along the shore (timber cribbing + rail)
    for (let z = site.z0; z < site.z1; z += 3) {
      const xa = shoreX(z),
        xb = shoreX(z + 3);
      b.beam(
        "rotten",
        V3(xa + 0.3, 0.05, z),
        V3(xb + 0.3, 0.05, z + 3),
        0.4,
        0.4,
      );
      b.beam(
        "rotten",
        V3(xa + 0.4, -1.4, z),
        V3(xb + 0.4, -1.4, z + 3),
        0.6,
        1.6,
      );
      if (
        (z > P16.z1 + 1 || z + 3 < P16.z0 - 1) &&
        (z > P17.z1 + 1 || z + 3 < P17.z0 - 1)
      )
        PF.colWall(xa + 0.3, z, xb + 0.3, z + 3, 0.3, 0, 1.0, {
          walkable: false,
        });
      if (r() < 0.6)
        b.cyl("iron", xa, 0.05, z + 1.5, 0.05, 0.05, 1.0, 5, { hSeg: 1 });
    }

    // ---- SCHERMERHORN ROW -------------------------------------------------
    const units = [
      { x0: 176, x1: 187, h: 12.5, k: "brick_fed", stories: 4 },
      { x0: 187, x1: 197.5, h: 12.5, k: "brick", stories: 4 },
      { x0: 197.5, x1: 208, h: 13.2, k: "brick_fed", stories: 4 },
      { x0: 208, x1: 219, h: 12.5, k: "brick_brown", stories: 4 },
      { x0: 219, x1: 230, h: 16.2, k: "brick_fed", stories: 5 },
      { x0: 230, x1: 242, h: 12.5, k: "brick", stories: 4 },
    ];
    const RZ0 = 680,
      RZ1 = 694;
    units.forEach((u, i) => {
      const poly = [
        [u.x0, RZ0],
        [u.x1, RZ0],
        [u.x1, RZ1],
        [u.x0, RZ1],
      ];
      K.prismBands(b, u.k, poly, 0, u.h, 4.2, { grime: 0.55 });
      PF.colMM(u.x0, 0, RZ0, u.x1, u.h, RZ1 + 0.1, { walkable: false });
      // both long faces are full street fronts: south onto the plaza, north onto Fulton Street (the approach)
      const bays = u.x1 - u.x0 > 10.6 ? 4 : 3,
        bw = (u.x1 - u.x0) / bays;
      facade(b, u, i, bays, bw, 1, r);
      facade(b, u, i, bays, bw, -1, r);
      // pitched roof (ridge along x) with dormers on the south slope
      const rh = 3.2 + (u.stories === 5 ? -0.8 : 0);
      const sh = new THREE.Shape();
      sh.moveTo(RZ0 - 0.3, 0);
      sh.lineTo(RZ1 + 0.5, 0);
      sh.lineTo((RZ0 + RZ1) / 2, rh);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: u.x1 - u.x0,
        bevelEnabled: false,
      });
      g.rotateY(-HP);
      b.add("slate", g, { m: PF.m4(u.x1, u.h, 0), grime: 0.55 });
      for (let k = 0; k < bays; k++) {
        const cx = u.x0 + (k + 0.5) * bw;
        b.box("white_paint", cx, u.h + 0.4, RZ1 - 1.6, 1.3, 1.5, 1.4, {
          seg: false,
          grime: 0.5,
        });
        K.pediment(b, "slate", cx, u.h + 1.9, RZ1 - 1.6, 1.6, 0.7, 1.5, 0, {});
        b.quad("glass_dark", cx, u.h + 1.1, RZ1 - 0.89, 0.7, 0.9, {
          noAO: true,
        });
      }
      // chimneys on the party walls
      b.box(u.k, u.x0 + 0.4, u.h - 1, RZ0 + 3.5, 0.8, rh + 3.2, 2.4, {
        seg: false,
        grime: 0.6,
      });
      b.box(u.k, u.x0 + 0.4, u.h - 1, RZ1 - 3.5, 0.8, rh + 3.2, 2.4, {
        seg: false,
        grime: 0.6,
      });
      for (let c = 0; c < 3; c++)
        b.cyl(
          "rust",
          u.x0 + 0.4,
          u.h + rh + 2.2,
          RZ0 + 2.8 + c * 0.7,
          0.13,
          0.15,
          0.4,
          6,
          { hSeg: 1 },
        );
    });
    const rowPlq = PF.texMat(
      "sp_row",
      PF.signTex(
        "sp_row",
        [
          "SCHERMERHORN ROW",
          "Built 1811–1812 as counting-houses",
          "for the merchants of the East River",
        ],
        "bronze",
        512,
        192,
      ),
    );
    b.quad(rowPlq, 176.8, 1.9, RZ1 + 0.52, 1.2, 0.45, {});
    PF.readable(
      V3(176.8, 1.9, RZ1 + 0.9),
      "Schermerhorn Row",
      "Built 1811–1812 as counting-houses for the merchants of the East River. Survived fire, flood, a century and a half of real estate developers, and one nuclear war.",
    );
    // fire escape on the tall unit
    for (let f = 0; f < 4; f++) {
      const y = 4.4 + f * 3.0;
      b.boxMM("iron", 220, y, RZ1 + 0.1, 229, y + 0.08, RZ1 + 1.4, {
        seg: false,
      });
      PF.railing(
        b,
        [
          [220, RZ1 + 1.4],
          [229, RZ1 + 1.4],
        ],
        y,
        0.9,
        "iron",
      );
      if (f < 3)
        b.beam(
          "iron",
          V3(221, y, RZ1 + 1.0),
          V3(223.5, y + 3, RZ1 + 1.0),
          0.5,
          0.06,
          {},
        );
    }

    // north (Fulton Street) side: fire escapes, the roof-mounted SCHERMERHORN ROW sign, the defenders' last barricade,
    // and the clutter of a fish market that died mid-shift (barrels, crates, nets, shellback shells picked clean)
    for (const [fx0, fx1, n] of [
      [188.5, 196.5, 3],
      [209, 217.5, 3],
    ]) {
      for (let f = 0; f < n; f++) {
        const y = 4.4 + f * 3.0;
        b.boxMM("iron", fx0, y, RZ0 - 1.3, fx1, y + 0.08, RZ0 - 0.1, {
          seg: false,
        });
        PF.railing(
          b,
          [
            [fx0, RZ0 - 1.3],
            [fx1, RZ0 - 1.3],
          ],
          y,
          0.9,
          "iron",
        );
        for (const x of [fx0, fx1])
          b.beam(
            "iron",
            V3(x, y, RZ0 - 1.3),
            V3(x, y + 0.9, RZ0 - 1.3),
            0.04,
            0.04,
          );
        if (f < n - 1)
          b.beam(
            "iron",
            V3(fx1 - 1.0, y + 0.05, RZ0 - 0.75),
            V3(fx1 - 3.4, y + 3.0, RZ0 - 0.75),
            0.55,
            0.06,
          );
        for (const x of [fx0 + 0.4, fx1 - 0.4])
          b.beam(
            "iron",
            V3(x, y - 0.9, RZ0 - 0.05),
            V3(x, y, RZ0 - 1.2),
            0.05,
            0.05,
          ); // brackets
      }
      for (let k = 0; k < 8; k++)
        b.box("iron", fx0 + 0.6, 1.9 + k * 0.3, RZ0 - 1.25, 0.5, 0.03, 0.03, {
          seg: false,
        }); // drop ladder
      b.beam(
        "iron",
        V3(fx0 + 0.35, 1.9, RZ0 - 1.25),
        V3(fx0 + 0.35, 4.4, RZ0 - 1.25),
        0.04,
        0.04,
      );
      b.beam(
        "iron",
        V3(fx0 + 0.85, 1.9, RZ0 - 1.25),
        V3(fx0 + 0.85, 4.4, RZ0 - 1.25),
        0.04,
        0.04,
      );
    }
    {
      const sk = PF.texMat(
        "sp_row_big",
        PF.signTex("sp_row_big", ["SCHERMERHORN ROW"], "engraved", 1024, 128, {
          bg: "#e0d8c0",
          fg: "#2a2418",
        }),
      );
      const sx0 = 177.5,
        sx1 = 196,
        sy = 12.5 + 0.35;
      b.quad(sk, (sx0 + sx1) / 2, sy + 1.0, RZ0 - 0.55, sx1 - sx0, 1.7, {
        ry: PI,
        grime: 0.5,
      });
      b.boxMM("iron", sx0, sy + 0.1, RZ0 - 0.5, sx1, sy + 0.18, RZ0 - 0.4, {
        seg: false,
      });
      b.boxMM("iron", sx0, sy + 1.85, RZ0 - 0.5, sx1, sy + 1.93, RZ0 - 0.4, {
        seg: false,
      });
      for (let x = sx0; x <= sx1 + 0.01; x += 3.08) {
        b.beam(
          "iron",
          V3(x, sy, RZ0 - 0.45),
          V3(x, sy + 2.0, RZ0 - 0.45),
          0.06,
          0.06,
        );
        b.beam(
          "iron",
          V3(x, sy + 1.9, RZ0 - 0.45),
          V3(x, sy - 0.2, RZ0 + 1.5),
          0.04,
          0.04,
        );
      }
      b.box("rust", 185.2, sy + 0.5, RZ0 - 0.6, 0.25, 0.9, 0.02, {
        seg: false,
        noAO: true,
      }); // one letter panel hanging loose
    }
    // the barricade across the west end of the Fulton Street walk (sandbags + scrap), a burnt-out barrel fire
    PF.scrapWall(b, 172.5, 677.6, 172.5, 679.6, 2.2, { seed: 9 });
    PF.sandbags(b, 173.2, 677.4, 175.6, 677.4, 3);
    PF.barrel(b, 174.2, 0, 678.8, {});
    PF.skeleton(b, 176.2, 0.05, 678.3, 2.1);
    for (const [x, z, a] of [
      [181, 678.6, 0.3],
      [199.5, 678.4, 2.2],
      [214, 678.8, 4.0],
      [236.5, 678.5, 1.1],
    ]) {
      // shellback shell picked clean: domed carapace, torn-off claw, a scatter of leg segments
      b.sphere("terracotta", x, 0.05, z, 0.8, {
        sx: 1.25,
        sy: 0.42,
        sz: 1.0,
        ry: a,
        c: 0x8a5a40,
        ws: 10,
        hs: 5,
      });
      b.box(
        "bone",
        x + Math.cos(a) * 1.2,
        0.05,
        z + Math.sin(a) * 0.6,
        0.55,
        0.22,
        0.3,
        { ry: a, seg: false, c: 0xb08060 },
      );
      for (let k = 0; k < 4; k++)
        b.box(
          "bone",
          x - 0.9 + k * 0.45,
          0.04,
          z - 0.5 + (k % 2) * 0.9,
          0.35,
          0.07,
          0.08,
          { ry: a + k, seg: false, c: 0xa07050 },
        );
    }
    for (const [x, z, n] of [
      [183.5, 678.7, 2],
      [204, 678.6, 3],
      [226.5, 678.9, 1],
      [240, 678.5, 2],
    ])
      D.crates(b, x, 0, z, n, x * 7);
    for (const [x, z] of [
      [192.5, 678.9],
      [221.5, 678.6],
      [233, 678.9],
    ]) {
      PF.barrel(b, x, 0, z, { key: "paint_teal" });
      PF.barrel(b, x + 0.7, 0, z - 0.1, {});
      b.box("net", x + 0.35, 0.93, z, 1.6, 0.05, 1.2, {
        rz: 0.15,
        rx: -0.1,
        seg: false,
      });
    }
    D.rubble(b, 206.5, 0, 678.6, 0.9, 6, 212);
    D.papers(b, 200, 0.06, 678.5, 3.5, 30, 1812);

    // ---- FULTON FISH MARKET SHED --------------------------------------------
    const MX0 = 180,
      MX1 = 232,
      MZ0 = 714,
      MZ1 = 734,
      MH = 7.5;
    K.prismBands(
      b,
      "brick",
      [
        [MX0, MZ0],
        [MX1, MZ0],
        [MX1, MZ1],
        [MX0, MZ1],
      ],
      0,
      MH,
      3.8,
      { grime: 0.6 },
    );
    PF.colMM(MX0, 0, MZ0 - 0.1, MX1, MH + 3, MZ1, { walkable: false });
    // arched openings (bricked/boarded) along both long sides
    const MDX = MX0 + 3 + 5.2 * 4; // the market's street door takes the 5th arch of the north (plaza) front
    for (let x = MX0 + 3; x < MX1 - 2; x += 5.2) {
      for (const [z, ry] of [
        [MZ0 - 0.02, PI],
        [MZ1 + 0.02, 0],
      ]) {
        if (ry === PI && Math.abs(x - MDX) < 0.1) continue; // built below as the entrance bay
        b.add(
          r() < 0.3 ? "glass_broken" : "rotten",
          PF.shapeGeo(roundArch(3.0, 4.6), 8),
          { m: PF.m4(x, 0.2, z, ry), uv: "box", grime: 0.6 },
        );
        for (let k = 0; k <= 8; k++) {
          const a = (k / 8) * PI;
          b.box(
            "limestone",
            x + Math.cos(a) * 1.7 * (ry ? -1 : 1),
            3.3 + Math.sin(a) * 1.7,
            z + (ry ? -0.08 : 0.08),
            0.5,
            0.36,
            0.2,
            { rz: (a - HP) * (ry ? -1 : 1), seg: false, grime: 0.4 },
          );
        }
        for (const sx of [-1, 1])
          b.box(
            "limestone",
            x + sx * 1.62,
            0.2,
            z + (ry ? -0.08 : 0.08),
            0.34,
            3.1,
            0.2,
            { seg: false, grime: 0.4 },
          );
      }
    }
    // clerestory roof: lower roof + raised monitor with louvres, iron trusses showing at the gable
    b.boxMM(
      "corrugated",
      MX0 - 0.6,
      MH,
      MZ0 - 0.8,
      MX1 + 0.6,
      MH + 0.25,
      MZ1 + 0.8,
      { grime: 0.6 },
    );
    b.boxMM("brick", MX0 + 2, MH + 0.25, MZ0 + 6, MX1 - 2, MH + 2.6, MZ1 - 6, {
      grime: 0.5,
    });
    for (let x = MX0 + 3; x < MX1 - 2; x += 2.2)
      for (const z of [MZ0 + 5.98, MZ1 - 5.98])
        b.quad("glass_dark", x, MH + 1.4, z, 1.6, 1.4, {
          ry: z < 724 ? PI : 0,
          noAO: true,
        });
    {
      const sh = new THREE.Shape();
      sh.moveTo(MZ0 + 5.5, 0);
      sh.lineTo(MZ1 - 5.5, 0);
      sh.lineTo((MZ0 + MZ1) / 2, 1.8);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: MX1 - MX0 - 3,
        bevelEnabled: false,
      });
      g.rotateY(-HP);
      b.add("corrugated", g, { m: PF.m4(MX1 - 1.5, MH + 2.6, 0), grime: 0.6 });
    }
    const fishK = PF.texMat(
      "sp_fulton",
      PF.signTex("sp_fulton", ["FULTON FISH MARKET"], "enamel", 1024, 128, {
        bg: "#1c3a5a",
        fg: "#f0e8c8",
      }),
    );
    b.quad(fishK, (MX0 + MX1) / 2, MH - 1.1, MZ0 - 0.1, 16, 2.0, { ry: PI });
    b.quad(fishK, MX1 + 0.1, MH - 1.1, (MZ0 + MZ1) / 2, 12, 1.5, { ry: HP });
    // main doors (north, facing the plaza) & dock door (east, facing the river)
    // MAIN ENTRANCE BAY (plaza side): a projecting brick surround with a stone arch, a roll-up steel shutter
    // jammed half open over the lit market hall, a caged work lamp and a hand-painted sign — readable from the plaza
    {
      const x = MDX,
        z = MZ0;
      b.boxMM("brick", x - 2.6, 0, z - 0.7, x - 1.6, 5.6, z, { grime: 0.6 });
      b.boxMM("brick", x + 1.6, 0, z - 0.7, x + 2.6, 5.6, z, { grime: 0.6 });
      b.boxMM("brick", x - 2.6, 4.6, z - 0.7, x + 2.6, 5.6, z, { grime: 0.6 });
      b.boxMM("limestone", x - 2.8, 5.6, z - 0.85, x + 2.8, 5.85, z, {
        seg: false,
        grime: 0.5,
      });
      PF.colMM(x - 2.6, 0, z - 0.7, x - 1.6, 5.6, z, { walkable: false });
      PF.colMM(x + 1.6, 0, z - 0.7, x + 2.6, 5.6, z, { walkable: false });
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * PI;
        b.box(
          "limestone",
          x - Math.cos(a) * 1.75,
          3.1 + Math.sin(a) * 1.5,
          z - 0.78,
          0.45,
          0.34,
          0.2,
          { rz: -(a - HP), seg: false, grime: 0.45 },
        );
      }
      // the lit hall beyond (painted interior card): stalls, hanging bulbs, wet concrete
      const hallK = PF.texMat(
        "sp_hall_card",
        PF.canvasTex(
          "pf_sp_hall_card",
          512,
          256,
          (ctx, w, h) => {
            ctx.fillStyle = "#0c0d0b";
            ctx.fillRect(0, 0, w, h);
            const gl = ctx.createRadialGradient(
              w * 0.5,
              h * 0.35,
              8,
              w * 0.5,
              h * 0.5,
              w * 0.55,
            );
            gl.addColorStop(0, "rgba(255,200,130,0.9)");
            gl.addColorStop(0.4, "rgba(120,96,60,0.7)");
            gl.addColorStop(1, "rgba(12,12,10,0)");
            ctx.fillStyle = gl;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#3a3a34";
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(w, h);
            ctx.lineTo(w * 0.7, h * 0.62);
            ctx.lineTo(w * 0.3, h * 0.62);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgba(200,210,200,0.25)";
            ctx.fillRect(w * 0.42, h * 0.7, w * 0.16, h * 0.3); // wet sheen
            ctx.fillStyle = "rgba(14,12,10,0.92)";
            for (const [x0, x1] of [
              [0.05, 0.3],
              [0.7, 0.95],
            ]) {
              ctx.fillRect(w * x0, h * 0.55, w * (x1 - x0), h * 0.18);
              ctx.fillRect(w * x0, h * 0.35, w * 0.02, h * 0.2);
              ctx.fillRect(w * (x1 - 0.02), h * 0.35, w * 0.02, h * 0.2);
              ctx.fillRect(w * x0, h * 0.33, w * (x1 - x0), h * 0.04);
            }
            for (const bx of [0.3, 0.5, 0.7]) {
              ctx.fillRect(w * bx - 1, 0, 2, h * 0.22);
              ctx.fillStyle = "#ffe4a8";
              ctx.beginPath();
              ctx.arc(w * bx, h * 0.24, 6, 0, TAU);
              ctx.fill();
              ctx.fillStyle = "rgba(14,12,10,0.92)";
            }
          },
          { clamp: true },
        ),
        { emissive: 0.8, rough: 0.9 },
      );
      b.quad(hallK, x, 1.25, z - 0.03, 3.2, 2.5, { ry: PI, noAO: true });
      // roll-up shutter jammed at 2.5 m (slats + bottom bar + guide rails) and the arch tympanum boarded above it
      for (let y = 2.5; y < 4.6; y += 0.16)
        b.box("corrugated", x, y, z - 0.12, 3.2, 0.15, 0.06, {
          seg: false,
          grime: 0.7,
        });
      b.box("rust", x, 2.42, z - 0.16, 3.25, 0.12, 0.12, { seg: false });
      for (const sx of [-1, 1])
        b.box("iron", x + sx * 1.63, 0, z - 0.12, 0.08, 4.6, 0.12, {
          seg: false,
        });
      b.box("rust", x, 4.6, z - 0.35, 3.4, 0.5, 0.5, {
        seg: false,
        grime: 0.6,
      }); // shutter drum housing
      b.boxMM("concrete_dark", x - 1.6, 0, z - 1.6, x + 1.6, 0.12, z, {
        seg: false,
        grime: 0.8,
      }); // worn threshold apron
      // painted sign + caged lamp
      const entK = PF.texMat(
        "sp_entrance",
        PF.signTex(
          "sp_entrance",
          ["MARKET HALL", "ENTRANCE · NO CARTS"],
          "painted",
          512,
          160,
          { bg: "#e8dcc0", fg: "#8a2a1a" },
        ),
      );
      b.quad(entK, x, 5.1, z - 0.72, 2.9, 0.9, { ry: PI });
      b.beam(
        "iron",
        V3(x, 4.35, z - 0.72),
        V3(x, 4.35, z - 1.4),
        0.05,
        0.05,
        {},
      );
      b.cyl("lamp_warm", x, 4.0, z - 1.4, 0.13, 0.13, 0.28, 8, {
        hSeg: 1,
        noAO: true,
      });
      b.cyl("iron", x, 4.27, z - 1.4, 0.03, 0.26, 0.1, 8, { hSeg: 1 });
      PF.glow(V3(x, 4.1, z - 1.4), 0xffc880, 2.0, null, {
        intensity: 1.3,
        flicker: 0.3,
      });
      PF.glow(V3(x, 1.2, z - 0.4), 0xffb070, 2.6, null, {
        intensity: 0.6,
        flicker: 0.05,
      });
    }
    // dock door (east, facing the river): steel leaf in a frame, stencil, lamp
    b.box("rust", MX1 + 0.12, 0, 724, 0.2, 3.8, 3.6, {
      seg: false,
      grime: 0.6,
    });
    for (const dz of [-1.9, 1.9])
      b.box("iron", MX1 + 0.2, 0, 724 + dz, 0.25, 4.0, 0.2, { seg: false });
    b.box("iron", MX1 + 0.2, 3.8, 724, 0.25, 0.25, 4.0, { seg: false });
    const dockK = PF.texMat(
      "sp_dock",
      PF.signTex("sp_dock", ["LOADING DOCK 3"], "stencil", 512, 128, {
        bg: "#5a4a38",
        fg: "#e8e0c8",
      }),
    );
    b.quad(dockK, MX1 + 0.24, 4.4, 724, 2.6, 0.65, { ry: HP });
    b.cyl("lamp_warm", MX1 + 0.7, 4.3, 725.9, 0.12, 0.12, 0.25, 8, {
      hSeg: 1,
      noAO: true,
    });
    PF.glow(V3(MX1 + 0.7, 4.4, 725.9), 0xffc880, 1.6, null, {
      intensity: 1.0,
      flicker: 0.4,
    });
    anchors.market_door = PF.anchor(MDX, 0, MZ0 - 2.2, 0);
    anchors.market_door_x = MDX;
    anchors.dock_door = PF.anchor(MX1 + 2.2, 0, 724, -HP);

    // ---- plaza dressing: nests, stalls, lamp posts, kiosk, carts, bodies ------------
    anchors.clutches.push(nest(b, 214, 0, 708, 1.6, 12, null, 71));
    anchors.clutches.push(nest(b, 188, 0, 700, 1.2, 8, null, 72));
    anchors.clutches.push(nest(b, 244.5, 0, 700, 1.1, 7, null, 73));
    D.stall(b, 196, 704, PI, 3.4, 2.2, {
      goods: "junk",
      sign: "FRESH FISH",
      seed: 11,
    });
    D.stall(b, 226, 707, 0.3, 3.0, 2.0, {
      goods: "bottles",
      sign: "OYSTERS 2 SCRIP",
      seed: 12,
    });
    for (const [x, z] of [
      [180, 697],
      [200, 711],
      [224, 697],
      [238, 711],
      [190, 740],
      [214, 740],
    ])
      PF.lampPost(b, x, 0, z, false);
    for (const [x, z, a] of [
      [210, 703, 0.4],
      [219, 710, 2.2],
      [185, 707, -1.1],
      [236, 704, 1.5],
    ])
      PF.skeleton(b, x, 0.06, z, a);
    // fishing nets over barrels & crates, lobster pots
    for (const [x, z] of [
      [232, 700],
      [178, 710],
      [246, 745],
    ]) {
      PF.barrel(b, x, 0, z, {});
      PF.barrel(b, x + 0.7, 0, z + 0.3, {});
      b.box("net", x + 0.4, 0.95, z + 0.15, 1.8, 0.05, 1.4, {
        rz: 0.2,
        rx: 0.1,
        seg: false,
      });
      for (let k = 0; k < 3; k++)
        b.box("rotten", x - 1.2 - k * 0.2, 0, z + k * 0.7, 0.8, 0.5, 0.6, {
          seg: false,
        });
    }
    // the SOUTH STREET SEAPORT arch sign at the west entrance
    for (const z of [697, 711]) {
      b.box("iron", 172, 0, z, 0.35, 5.8, 0.35, { seg: false });
      PF.col(172, z, 0.4, 0.4, 0, 5.8, 0, { walkable: false });
    }
    b.box("iron", 172, 5.6, 704, 0.3, 0.3, 14.6, { seg: false });
    const ssK = PF.texMat(
      "sp_arch",
      PF.signTex("sp_arch", ["SOUTH STREET SEAPORT"], "enamel", 1024, 128, {
        bg: "#1c3a5a",
        fg: "#e8d8a8",
      }),
    );
    b.quad(ssK, 172.18, 4.8, 704, 11, 1.4, { ry: -HP });
    b.quad(ssK, 171.82, 4.8, 704, 11, 1.4, { ry: HP });

    // ---- Titanic Memorial Lighthouse ---------------------------------------
    {
      const lx = 180,
        lz = 746;
      b.box("granite", lx, 0, lz, 3.2, 1.2, 3.2, { seg: false, grime: 0.6 });
      b.cyl("white_paint", lx, 1.2, lz, 0.95, 1.25, 7.4, 12, {
        hSeg: 3,
        grime: 0.6,
      });
      b.cyl("iron", lx, 8.6, lz, 1.3, 1.3, 0.2, 12, { hSeg: 1 });
      PF.railing(
        b,
        Array.from({ length: 13 }, (_, i) => [
          lx + Math.cos((i / 12) * TAU) * 1.25,
          lz + Math.sin((i / 12) * TAU) * 1.25,
        ]),
        8.8,
        0.8,
        "iron",
      );
      b.cyl("glass_dark", lx, 8.8, lz, 0.75, 0.75, 1.4, 10, { hSeg: 1 });
      b.cyl("copper", lx, 10.2, lz, 0.1, 1.0, 1.1, 10, { hSeg: 1 });
      b.sphere("copper", lx, 11.4, lz, 0.2, { ws: 6, hs: 5 });
      PF.col(lx, lz, 3.2, 3.2, 0, 8.6, 0, { walkable: false });
      const tk = PF.texMat(
        "sp_titanic",
        PF.signTex(
          "sp_titanic",
          ["TITANIC MEMORIAL", "APRIL 15, 1912"],
          "bronze",
          512,
          192,
        ),
      );
      b.quad(tk, lx, 0.6, lz - 1.62, 1.6, 0.6, { ry: PI });
    }
    // benches & wreck of a sightseeing bus on the promenade
    for (const [x, z] of [
      [195, 747],
      [205, 747],
      [225, 747],
    ])
      PF.bench(b, x, 0, z, PI);
    anchors.bus = PF.anchor(212, 0, 744, HP);

    // ---- FDR Drive fragment (elevated), broken in the middle ----------------
    const VX0 = 238.5,
      VX1 = 249.5,
      VY = 8.5;
    for (const [z0, z1] of [
      [site.z0, 709],
      [723, site.z1],
    ]) {
      b.boxMM("concrete", VX0, VY - 1.0, z0, VX1, VY, z1, { grime: 0.6 });
      b.boxMM("concrete_dark", VX0, VY - 1.5, z0, VX0 + 0.8, VY - 1.0, z1, {
        seg: false,
      });
      b.boxMM("concrete_dark", VX1 - 0.8, VY - 1.5, z0, VX1, VY - 1.0, z1, {
        seg: false,
      });
      b.boxMM("asphalt", VX0 + 0.4, VY, z0, VX1 - 0.4, VY + 0.05, z1, {
        grime: 0.4,
      });
      for (const x of [VX0 + 0.3, VX1 - 0.3])
        b.boxMM("concrete", x - 0.3, VY, z0, x + 0.3, VY + 0.9, z1, {
          seg: false,
          grime: 0.5,
        });
      PF.colMM(VX0, VY - 1.0, z0, VX1, VY, z1);
    }
    for (let z = site.z0 + 3; z < site.z1; z += 11) {
      if (z > 707 && z < 725) continue;
      for (const x of [VX0 + 1.4, VX1 - 1.4]) {
        b.box("concrete_dark", x, 0, z, 1.0, VY - 1.0, 1.0, {
          seg: false,
          grime: 0.6,
        });
        PF.col(x, z, 1.0, 1.0, 0, VY - 1, 0, { walkable: false });
      }
      b.box(
        "concrete_dark",
        (VX0 + VX1) / 2,
        VY - 2.2,
        z,
        VX1 - VX0 - 1,
        1.2,
        1.2,
        { seg: false },
      );
    }
    // broken ends: rebar, hanging slab, a car teetering over the gap
    for (const [z, dir] of [
      [709, 1],
      [723, -1],
    ]) {
      for (let i = 0; i < 12; i++) {
        const x = VX0 + 0.5 + i * 0.9;
        b.beam(
          "rust",
          V3(x, VY - 0.5, z),
          V3(
            x + (r() - 0.5) * 0.4,
            VY - 0.6 - r() * 1.2,
            z + dir * (0.8 + r() * 1.5),
          ),
          0.04,
          0.04,
        );
      }
    }
    b.box("concrete", 243, VY - 5.5, 713, 9, 0.9, 6, {
      rx: 0.9,
      seg: false,
      grime: 0.6,
    });
    D.rubble(b, 244, 0, 716, 1.6, 10, 55);
    PF.col(244, 716, 6, 6, 0, 1.4, 0, { surface: "rubble" });
    anchors.fdr_car = PF.anchor(244, VY, 708.4, 0);

    // ---- PIERS ---------------------------------------------------------------
    const s16 = shoreX(P16.z1),
      s17 = shoreX(P17.z0);
    pier(b, s16 - 1, P16.x1, P16.z0, P16.z1, 0.3, { holes: 4 });
    pier(b, s17 - 1, P17.x1, P17.z0, P17.z1, 0.3, { holes: 2 });
    for (const [z0, z1] of [[P16.z0, P16.z1]])
      PF.railing(
        b,
        [
          [P16.x1, z0],
          [P16.x1, z1],
        ],
        0.3,
        1.0,
        "iron",
        { collide: true },
      );
    // Pier 17 pavilion: glass & green steel, gabled roof, the PIER 17 sign
    {
      const x0 = 275,
        x1 = 309,
        z0 = 683,
        z1 = 699,
        H = 9.5;
      b.boxMM("paint_teal", x0, 0.3, z0, x1, 0.8, z1, {
        seg: false,
        grime: 0.6,
      });
      for (let x = x0; x <= x1 + 0.01; x += 3.4)
        for (const z of [z0, z1])
          b.box("paint_teal", x, 0.8, z, 0.3, H - 0.5, 0.3, {
            seg: false,
            grime: 0.5,
            c: 0x6a9a8a,
          });
      for (let z = z0; z <= z1 + 0.01; z += 4)
        for (const x of [x0, x1])
          b.box("paint_teal", x, 0.8, z, 0.3, H - 0.5, 0.3, {
            seg: false,
            grime: 0.5,
            c: 0x6a9a8a,
          });
      for (const y of [4.8, H]) {
        b.boxMM("paint_teal", x0, y, z0 - 0.15, x1, y + 0.3, z0 + 0.15, {
          seg: false,
          c: 0x6a9a8a,
        });
        b.boxMM("paint_teal", x0, y, z1 - 0.15, x1, y + 0.3, z1 + 0.15, {
          seg: false,
          c: 0x6a9a8a,
        });
      }
      for (let x = x0 + 1.7; x < x1; x += 3.4)
        for (const [z, ry] of [
          [z0 - 0.02, PI],
          [z1 + 0.02, 0],
        ])
          for (const y of [2.8, 7.2])
            b.quad(r() < 0.45 ? "glass_broken" : "pane", x, y, z, 3.0, 3.8, {
              ry,
              noAO: true,
            });
      for (let z = z0 + 2; z < z1; z += 4)
        for (const [x, ry] of [
          [x0 - 0.02, -HP],
          [x1 + 0.02, HP],
        ])
          for (const y of [2.8, 7.2])
            b.quad(r() < 0.45 ? "glass_broken" : "pane", x, y, z, 3.6, 3.8, {
              ry,
              noAO: true,
            });
      b.boxMM(
        "concrete_dark",
        x0 + 0.2,
        4.6,
        z0 + 0.2,
        x1 - 0.2,
        4.8,
        z1 - 0.2,
        { seg: false },
      );
      const sh = new THREE.Shape();
      sh.moveTo(z0 - 0.6, 0);
      sh.lineTo(z1 + 0.6, 0);
      sh.lineTo((z0 + z1) / 2, 3.2);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: x1 - x0 + 1.2,
        bevelEnabled: false,
      });
      g.rotateY(-HP);
      b.add("copper", g, { m: PF.m4(x1 + 0.6, H + 0.3, 0), grime: 0.5 });
      PF.colMM(x0, 0.3, z0, x1, H + 3, z1, { walkable: false });
      const p17 = PF.texMat(
        "sp_p17",
        PF.signTex("sp_p17", ["PIER 17"], "enamel", 512, 160, {
          bg: "#1c3a5a",
          fg: "#f0f0e0",
        }),
      );
      b.quad(p17, x0 - 0.05, H + 1.2, (z0 + z1) / 2, 5, 1.6, { ry: -HP });
      b.quad(p17, x1 + 0.35, H + 1.2, (z0 + z1) / 2, 5, 1.6, { ry: HP });
    }
    // pier nest by the Peking gangway
    anchors.clutches.push(nest(b, 309, 0.3, 723, 1.3, 10, null, 74));

    // ---- THE PEKING -----------------------------------------------------------
    peking(b, anchors, r);
    // ---- THE AMBROSE -----------------------------------------------------------
    ambrose(b, anchors, r);

    b.build(root);
    return anchors;
  }

  function peking(b, anchors, r) {
    const S = PK;
    hull(b, "hull_black", S, { nu: 18, nv: 40 });
    // red boot-top band just above the waterline + white sheer stripe (amidships runs)
    for (const s of [-1, 1]) {
      b.box(
        "hull_red",
        (S.x0 + S.x1) / 2 - 3,
        -1.25,
        S.zc + s * (S.hb - 0.3),
        (S.x1 - S.x0) * 0.62,
        0.6,
        0.2,
        { seg: false, grime: 0.4 },
      );
      b.box(
        "hull_white",
        (S.x0 + S.x1) / 2 - 3,
        S.top - 0.4,
        S.zc + s * (S.hb + 0.02),
        (S.x1 - S.x0) * 0.66,
        0.18,
        0.08,
        { seg: false, grime: 0.3 },
      );
      // painted gun-ports band (the old square-rigger look)
      for (let i = 0; i < 14; i++)
        b.quad(
          "hull_white",
          S.x0 + 12 + i * 3.1,
          S.top - 1.2,
          S.zc + s * (S.hb + 0.05),
          0.9,
          0.7,
          { ry: s > 0 ? 0 : PI, grime: 0.3, noAO: true },
        );
    }
    // decks: main (4.0), poop (aft, 5.8) and forecastle (bow, 5.8)
    deck(b, "deck_wood", S, S.deck, 0.15, true);
    const poopX = S.x0 + 11,
      fcX = S.x1 - 11;
    b.boxMM(
      "deck_wood",
      S.x0 + 0.4,
      S.deck,
      S.zc - S.hb * 0.72 + 0.2,
      poopX,
      S.deck + 1.8,
      S.zc + S.hb * 0.72 - 0.2,
      { grime: 0.5 },
    );
    PF.colMM(
      S.x0 + 0.4,
      S.deck,
      S.zc - S.hb * 0.8,
      poopX,
      S.deck + 1.8,
      S.zc + S.hb * 0.8,
      { surface: "wood" },
    );
    b.boxMM(
      "hull_white",
      poopX - 0.05,
      S.deck,
      S.zc - S.hb + 0.3,
      poopX + 0.05,
      S.deck + 1.8,
      S.zc + S.hb - 0.3,
      { seg: false },
    );
    b.boxMM(
      "deck_wood",
      fcX,
      S.deck,
      S.zc - S.hb + 0.35,
      S.x1 - 4,
      S.deck + 1.8,
      S.zc + S.hb - 0.35,
      { grime: 0.5 },
    );
    PF.colMM(
      fcX,
      S.deck,
      S.zc - S.hb + 0.35,
      S.x1 - 4,
      S.deck + 1.8,
      S.zc + S.hb - 0.35,
      { surface: "wood" },
    );
    b.boxMM(
      "hull_white",
      fcX - 0.05,
      S.deck,
      S.zc - S.hb + 0.35,
      fcX + 0.05,
      S.deck + 1.8,
      S.zc + S.hb - 0.35,
      { seg: false },
    );
    // ladders up to the poop and forecastle (steps ≤ 0.35)
    PF.stairs(
      b,
      "deck_wood",
      poopX + 2.2,
      S.zc - 2.5,
      -HP,
      1.2,
      2.0,
      S.deck,
      S.deck + 1.8,
      { base: S.deck },
    );
    PF.stairs(
      b,
      "deck_wood",
      poopX + 2.2,
      S.zc + 2.5,
      -HP,
      1.2,
      2.0,
      S.deck,
      S.deck + 1.8,
      { base: S.deck },
    );
    PF.stairs(
      b,
      "deck_wood",
      fcX - 2.2,
      S.zc - 2.3,
      HP,
      1.2,
      2.0,
      S.deck,
      S.deck + 1.8,
      { base: S.deck },
    );
    PF.stairs(
      b,
      "deck_wood",
      fcX - 2.2,
      S.zc + 2.3,
      HP,
      1.2,
      2.0,
      S.deck,
      S.deck + 1.8,
      { base: S.deck },
    );
    // bulwarks with the gangway gap (north side, amidships)
    bulwark(b, S, S.deck, 1.1, [[0.42, 0.47, -1]]);
    // raised-deck rails
    // break-deck rails with gaps where the ladders land (the gaps used to be amidships, so the rails blocked the
    // ladder tops and the poop / forecastle could not be climbed from the main deck)
    for (const [a0, a1] of [
      [-S.hb * 0.7, -3.15],
      [-1.85, 1.85],
      [3.15, S.hb * 0.7],
    ])
      PF.railing(
        b,
        [
          [poopX, S.zc + a0],
          [poopX, S.zc + a1],
        ],
        S.deck + 1.8,
        0.9,
        "mahogany",
        { collide: true },
      );
    for (const [a0, a1] of [
      [-S.hb + 0.5, -2.95],
      [-1.65, 1.65],
      [2.95, S.hb - 0.5],
    ])
      PF.railing(
        b,
        [
          [fcX, S.zc + a0],
          [fcX, S.zc + a1],
        ],
        S.deck + 1.8,
        0.9,
        "mahogany",
        { collide: true },
      );
    // deckhouse amidships, skylights, the big wheel aft, capstans, cargo hatches (fore = door)
    b.boxMM(
      "hull_white",
      288,
      S.deck,
      S.zc - 2.2,
      296,
      S.deck + 2.4,
      S.zc + 2.2,
      { grime: 0.5 },
    );
    b.boxMM(
      "mahogany",
      287.8,
      S.deck + 2.4,
      S.zc - 2.4,
      296.2,
      S.deck + 2.55,
      S.zc + 2.4,
      { seg: false },
    );
    for (let x = 289; x < 296; x += 1.6)
      for (const s of [-1, 1])
        b.quad("glass_dark", x, S.deck + 1.4, S.zc + s * 2.21, 0.6, 0.6, {
          ry: s > 0 ? 0 : PI,
          noAO: true,
        });
    PF.colMM(288, S.deck, S.zc - 2.2, 296, S.deck + 2.55, S.zc + 2.2, {
      walkable: false,
    });
    b.box("mahogany", S.x0 + 8.8, S.deck + 1.8, S.zc + 2.4, 2.2, 0.6, 1.6, {
      seg: false,
    });
    b.box("glass_dark", S.x0 + 8.8, S.deck + 2.4, S.zc + 2.4, 2.0, 0.3, 1.4, {
      rx: 0.2,
      seg: false,
    });
    PF.col(S.x0 + 8.8, S.zc + 2.4, 2.2, 1.6, S.deck + 1.8, S.deck + 2.7, 0, {
      walkable: false,
    });
    // the wheel (double wheel on the poop)
    for (const dx of [-0.35, 0.35]) {
      const wg = new THREE.TorusGeometry(0.75, 0.05, 6, 20);
      wg.rotateY(HP);
      b.add("mahogany", wg, { m: PF.m4(S.x0 + 2.2 + dx, S.deck + 3.1, S.zc) });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.beam(
          "mahogany",
          V3(S.x0 + 2.2 + dx, S.deck + 3.1, S.zc),
          V3(
            S.x0 + 2.2 + dx,
            S.deck + 3.1 + Math.sin(a) * 1.0,
            S.zc + Math.cos(a) * 1.0,
          ),
          0.05,
          0.05,
          {},
        );
      }
    }
    b.box("mahogany", S.x0 + 2.2, S.deck + 1.8, S.zc, 0.9, 0.9, 0.4, {
      seg: false,
    });
    PF.col(S.x0 + 2.2, S.zc, 1.2, 1.4, S.deck + 1.8, S.deck + 3.5, 0, {
      walkable: false,
    });
    for (const x of [284, 310]) {
      b.cyl("iron", x, S.deck, S.zc, 0.35, 0.45, 0.9, 10, { hSeg: 1 });
      b.cyl("iron", x, S.deck + 0.9, S.zc, 0.5, 0.35, 0.15, 10, { hSeg: 1 });
      PF.col(x, S.zc, 1.0, 1.0, S.deck, S.deck + 1.0, 0, { walkable: false });
    }
    for (const [x, w] of [
      [301, 3.2],
      [280, 3.0],
    ]) {
      b.boxMM(
        "mahogany",
        x - w / 2,
        S.deck,
        S.zc - 1.6,
        x + w / 2,
        S.deck + 0.7,
        S.zc + 1.6,
        { seg: false, grime: 0.5 },
      );
      b.boxMM(
        "tent",
        x - w / 2 + 0.1,
        S.deck + 0.7,
        S.zc - 1.5,
        x + w / 2 - 0.1,
        S.deck + 0.78,
        S.zc + 1.5,
        { seg: false, grime: 0.7 },
      );
      PF.colMM(
        x - w / 2,
        S.deck,
        S.zc - 1.6,
        x + w / 2,
        S.deck + 0.78,
        S.zc + 1.6,
        { surface: "wood" },
      );
    }
    // the fore hatch (door into the 'tween deck) and aft companionway (on the poop)
    b.boxMM(
      "mahogany",
      314,
      S.deck,
      S.zc - 1.2,
      317,
      S.deck + 1.9,
      S.zc + 1.2,
      { seg: false, grime: 0.5 },
    );
    b.box("rotten", 313.95, S.deck, S.zc, 0.08, 1.7, 1.0, { seg: false });
    PF.colMM(314, S.deck, S.zc - 1.2, 317, S.deck + 1.9, S.zc + 1.2, {
      walkable: false,
    });
    anchors.fore_hatch = PF.anchor(312.4, S.deck, S.zc + 1.8, HP); // beside the hatch house, looking aft down the deck (clear of the capstan)
    b.boxMM(
      "mahogany",
      S.x0 + 3.6,
      S.deck + 1.8,
      S.zc - 1.0,
      S.x0 + 5.6,
      S.deck + 3.6,
      S.zc + 1.0,
      { seg: false, grime: 0.5 },
    );
    b.box("rotten", S.x0 + 5.65, S.deck + 1.8, S.zc, 0.08, 1.6, 0.9, {
      seg: false,
    });
    PF.colMM(
      S.x0 + 3.6,
      S.deck + 1.8,
      S.zc - 1.0,
      S.x0 + 5.6,
      S.deck + 3.6,
      S.zc + 1.0,
      { walkable: false },
    );
    anchors.aft_hatch = PF.anchor(S.x0 + 6.4, S.deck + 1.8, S.zc, -HP); // on the poop, looking forward along the ship
    // nameboards & port of registry
    hullName(
      b,
      "PEKING",
      S.x1 - 6,
      S.top - 0.6,
      S.zc - S.hb * wf(0.9) - 0.06,
      PI - 0.15,
      4.4,
      0.8,
    );
    hullName(
      b,
      "PEKING",
      S.x1 - 6,
      S.top - 0.6,
      S.zc + S.hb * wf(0.9) + 0.06,
      0.15,
      4.4,
      0.8,
    );
    hullName(b, "PEKING", S.x0 - 0.05, S.top - 0.3, S.zc, -HP, 4.0, 0.75);
    hullName(b, "HAMBURG", S.x0 - 0.05, S.top - 1.1, S.zc, -HP, 3.0, 0.55);
    // bowsprit + jibboom
    b.rod(
      "mahogany",
      V3(S.x1 - 4, S.top + 0.4, S.zc),
      V3(S.x1 + 12, S.top + 4.0, S.zc),
      0.35,
      8,
      { r2: 0.12 },
    );
    // ---- the rig: four masts, yards, furled sails, shrouds, stays ----
    const masts = [
      { x: 318, sq: true },
      { x: 304, sq: true },
      { x: 290, sq: true },
      { x: 276, sq: false },
    ];
    const top = S.deck + 38;
    for (const m of masts) {
      const h = m.sq ? 38 : 33;
      b.cyl("mahogany", m.x, S.deck, S.zc, 0.32, 0.42, 17, 10, {
        hSeg: 3,
        grime: 0.4,
      });
      b.cyl("mahogany", m.x, S.deck + 16.5, S.zc, 0.24, 0.3, 12, 8, {
        hSeg: 2,
        grime: 0.4,
      });
      b.cyl("mahogany", m.x, S.deck + 28, S.zc, 0.12, 0.2, h - 28, 8, {
        hSeg: 2,
        grime: 0.4,
      });
      b.boxMM(
        "mahogany",
        m.x - 1.2,
        S.deck + 16,
        S.zc - 1.8,
        m.x + 1.2,
        S.deck + 16.3,
        S.zc + 1.8,
        { seg: false },
      ); // top
      b.boxMM(
        "mahogany",
        m.x - 0.7,
        S.deck + 27.6,
        S.zc - 1.2,
        m.x + 0.7,
        S.deck + 27.8,
        S.zc + 1.2,
        { seg: false },
      ); // crosstrees
      PF.col(m.x, S.zc, 0.9, 0.9, S.deck, S.deck + 16, 0, { walkable: false });
      if (m.sq) {
        const yards = [
          [11.5, 23],
          [15.5, 20],
          [19.5, 19],
          [23.5, 17],
          [27, 15.5],
          [31, 12.5],
          [34.5, 10],
        ];
        yards.forEach(([yy, L], i) => {
          const y = S.deck + yy,
            skew = (i % 2 ? 0.05 : -0.04) + (m.x === 304 ? 0.12 : 0);
          const a = V3(
              m.x - 0.4 + (Math.sin(skew) * L) / 2,
              y,
              S.zc - (Math.cos(skew) * L) / 2,
            ),
            c = V3(
              m.x - 0.4 - (Math.sin(skew) * L) / 2,
              y,
              S.zc + (Math.cos(skew) * L) / 2,
            );
          b.rod("mahogany", a, c, 0.16, 6, { r2: 0.16 });
          // furled sail along the yard (grey-white bundle), some sails hanging torn
          if (i === 1 && m.x === 290) {
            tornSail(b, m.x - 0.6, y, S.zc, L * 0.9, 4.2);
          } else
            b.rod(
              "linen",
              V3(a.x, a.y - 0.25, a.z),
              V3(c.x, c.y - 0.25, c.z),
              0.26,
              6,
              { r2: 0.26 },
            );
          // lifts & braces
          b.beam("iron", V3(m.x, y + 3.5, S.zc), a, 0.03, 0.03, { noAO: true });
          b.beam("iron", V3(m.x, y + 3.5, S.zc), c, 0.03, 0.03, { noAO: true });
        });
      } else {
        // jigger: spanker gaff & boom
        b.rod(
          "mahogany",
          V3(m.x - 0.3, S.deck + 3.2, S.zc),
          V3(m.x - 13, S.deck + 4.0, S.zc),
          0.18,
          6,
        );
        b.rod(
          "mahogany",
          V3(m.x - 0.3, S.deck + 15, S.zc),
          V3(m.x - 11, S.deck + 20, S.zc),
          0.14,
          6,
        );
        b.rod(
          "linen",
          V3(m.x - 0.6, S.deck + 3.6, S.zc),
          V3(m.x - 12.5, S.deck + 4.4, S.zc),
          0.3,
          6,
        );
      }
      // shrouds from the rails to the top (both sides) + ratline hints
      for (const s of [-1, 1]) {
        for (let k = 0; k < 5; k++) {
          const hx = m.x - 1.4 + k * 0.7;
          b.beam(
            "iron",
            V3(hx, S.top + 0.3, S.zc + s * (S.hb + 0.1)),
            V3(m.x, S.deck + 16, S.zc + s * 1.6),
            0.035,
            0.035,
            { noAO: true },
          );
        }
        b.beam(
          "iron",
          V3(m.x, S.deck + 16.3, S.zc + s * 1.6),
          V3(m.x, S.deck + 27.6, S.zc + s * 1.1),
          0.03,
          0.03,
          { noAO: true },
        );
        b.beam(
          "iron",
          V3(m.x - 0.8, S.deck + 16.3, S.zc + s * 1.7),
          V3(m.x, S.deck + 27.6, S.zc + s * 1.1),
          0.03,
          0.03,
          { noAO: true },
        );
        for (let y = S.deck + 2; y < S.deck + 15; y += 0.9) {
          const t = (y - S.top - 0.3) / (S.deck + 16 - S.top - 0.3);
          const zz = S.zc + s * (S.hb + 0.1 + (1.6 - S.hb - 0.1) * t);
          b.beam(
            "rope",
            V3(m.x - 1.4 + t * 1.4, y, zz),
            V3(m.x + 1.4 - t * 1.4, y, zz),
            0.02,
            0.02,
            { noAO: true },
          );
        }
      }
    }
    // stays between the mastheads and down to the bowsprit
    for (let i = 0; i < masts.length - 1; i++)
      b.beam(
        "iron",
        V3(masts[i + 1].x, S.deck + 30, S.zc),
        V3(masts[i].x, S.deck + 16.5, S.zc),
        0.04,
        0.04,
        { noAO: true },
      );
    b.beam(
      "iron",
      V3(318, S.deck + 30, S.zc),
      V3(S.x1 + 11, S.top + 3.8, S.zc),
      0.04,
      0.04,
      { noAO: true },
    );
    b.beam(
      "iron",
      V3(318, S.deck + 16.5, S.zc),
      V3(S.x1 + 6, S.top + 2.3, S.zc),
      0.05,
      0.05,
      { noAO: true },
    );
    b.beam(
      "iron",
      V3(318, S.deck + 36, S.zc),
      V3(S.x1 + 12, S.top + 4, S.zc),
      0.03,
      0.03,
      { noAO: true },
    );
    void top;
    // gangway from Pier 16 (y 0.3) up to the main deck through the bulwark gap (north side, v≈0.445)
    {
      const gx = S.x0 + 0.445 * (S.x1 - S.x0),
        zS = S.zc - S.hb * wf(0.445);
      const zP = P16.z1 - 0.8;
      // ramp along x on the pier edge from (gx + 9, 0.3) up to (gx + 0.8, 4.0), then a bridge plank across to the deck
      PF.stepPath(
        gx + 9.5,
        zP,
        -HP,
        1.4,
        8.7,
        (t) => 0.3 + (S.deck - 0.3) * t,
        { maxRise: 0.3, thick: 0.3 },
      );
      b.beam(
        "deck_wood",
        V3(gx + 9.5, 0.3, zP),
        V3(gx + 0.8, S.deck, zP),
        1.4,
        0.12,
        { twist: 0 },
      );
      for (const s of [-1, 1])
        b.beam(
          "iron",
          V3(gx + 9.5, 1.3, zP + s * 0.7),
          V3(gx + 0.8, S.deck + 1.0, zP + s * 0.7),
          0.04,
          0.04,
          {},
        );
      b.boxMM(
        "deck_wood",
        gx - 0.6,
        S.deck - 0.15,
        zP - 0.7,
        gx + 0.8,
        S.deck,
        zS + 0.6,
        { seg: false },
      );
      PF.colMM(gx - 0.6, S.deck - 0.3, zP - 0.7, gx + 0.8, S.deck, zS + 0.6, {
        surface: "wood",
      });
      anchors.gangway = PF.anchor(gx + 11, 0.3, zP, HP);
    }
    // deck clutter: coiled ropes, a dinghy on chocks, barrels, a shellback nest on the fo'c'sle
    for (const [x, z] of [
      [298, S.zc - 3.2],
      [285, S.zc + 3.1],
      [308, S.zc + 3.0],
    ])
      b.cyl("rope", x, S.deck, z, 0.45, 0.45, 0.25, 12, { hSeg: 1 });
    anchors.clutches.push(
      nest(b, S.x1 - 7, S.deck + 1.8, S.zc + 0.5, 1.2, 9, null, 75),
    );
    for (const [x, z, a] of [
      [300, S.zc - 2.5, 0.8],
      [293, S.zc + 3, 2.9],
    ])
      PF.skeleton(b, x, S.deck + 0.02, z, a);
    anchors.peking_deck = PF.anchor(300, S.deck, S.zc, 0);
  }

  /** Round-arched opening shape w × h. */
  function roundArch(w, h) {
    const s = new THREE.Shape(),
      r = w / 2,
      sp = h - r;
    s.moveTo(-r, 0);
    s.lineTo(r, 0);
    s.lineTo(r, sp);
    s.absarc(0, sp, r, 0, PI, false);
    s.lineTo(-r, 0);
    return s;
  }
  /** A ship's ladder up to a lit deck hatch (visual; the hatch is a load door). ry: facing of the climber. */
  function ladder(b, x, y, z, h, ry) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (const sg of [-1, 1])
      b.beam(
        "oak",
        V3(x + c * sg * 0.35 - s * 0.3, y, z - s * sg * 0.35 - c * 0.3),
        V3(x + c * sg * 0.35 + s * 0.15, y + h, z - s * sg * 0.35 + c * 0.15),
        0.07,
        0.07,
        {},
      );
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      b.beam(
        "oak",
        V3(
          x - c * 0.35 + s * (-0.3 + 0.45 * t),
          y + h * t,
          z + s * 0.35 + c * (-0.3 + 0.45 * t),
        ),
        V3(
          x + c * 0.35 + s * (-0.3 + 0.45 * t),
          y + h * t,
          z - s * 0.35 + c * (-0.3 + 0.45 * t),
        ),
        0.05,
        0.05,
        {},
      );
    }
    b.quad("lamp_blue", x + s * 0.2, y + h + 0.17, z + c * 0.2, 1.1, 1.1, {
      rx: HP,
      noAO: true,
    });
    PF.glow(V3(x + s * 0.2, y + h, z + c * 0.2), 0xd8e4ff, 1.4, null, {
      intensity: 0.8,
    });
  }
  /** A torn, sagging square sail hanging from a yard (double-sided, alpha-tested rags). */
  function tornSail(b, x, y, zc, w, h) {
    const tex = PF.canvasTex(
      "pf_sp_sail",
      256,
      256,
      (ctx, W, H) => {
        ctx.clearRect(0, 0, W, H);
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#cfc6b0");
        g.addColorStop(1, "#8a826c");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(60,50,40,0.4)";
        ctx.lineWidth = 2;
        for (let x = 0; x < W; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "destination-out";
        const r = PF.rng(5);
        for (let i = 0; i < 9; i++) {
          ctx.beginPath();
          const cx = r() * W,
            cy = H * (0.3 + r() * 0.7);
          ctx.moveTo(cx, cy);
          for (let k = 0; k < 7; k++)
            ctx.lineTo(cx + (r() - 0.5) * 90, cy + (r() - 0.3) * 90);
          ctx.fill();
        }
        for (let x = 0; x < W; x += 6) {
          ctx.fillRect(x, H - r() * 60, 6, 60);
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
    const k = PF.texMat("sp_sail", tex, {
      transparent: true,
      side: THREE.DoubleSide,
      rough: 1,
    });
    const g = new THREE.PlaneGeometry(w, h, 6, 4);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const yy = p.getY(i),
        xx = p.getX(i);
      p.setZ(
        i,
        Math.sin((0.5 - yy / h) * PI) * 1.4 + Math.cos((xx / w) * PI) * 0.3,
      );
    }
    g.computeVertexNormals();
    b.add(k, g, {
      m: PF.m4(x, y - h / 2 - 0.2, zc, HP),
      uv: "keep",
      grime: 0.3,
      noAO: true,
    });
  }

  function ambrose(b, anchors, r) {
    const S = AM;
    hull(b, "hull_red", S, { nu: 14, nv: 28 });
    deck(b, "deck_wood", S, S.deck, 0.12, true);
    bulwark(b, S, S.deck, 0.9, [[0.5, 0.58, 1]], "hull_white", "iron");
    for (const s of [-1, 1])
      hullName(
        b,
        "AMBROSE",
        (S.x0 + S.x1) / 2,
        S.top - 1.6,
        S.zc + s * (S.hb + 0.06),
        s > 0 ? 0 : PI,
        9,
        1.6,
      );
    hullName(
      b,
      "No. 87",
      S.x1 - 4,
      S.top - 0.9,
      S.zc - S.hb * wf(0.85) - 0.06,
      PI - 0.2,
      2.2,
      0.5,
    );
    // deckhouse + wheelhouse, funnel, the light mast with its lantern, foremast
    b.boxMM(
      "hull_white",
      288,
      S.deck,
      S.zc - 1.9,
      298,
      S.deck + 2.4,
      S.zc + 1.9,
      { grime: 0.5 },
    );
    b.boxMM(
      "hull_white",
      289,
      S.deck + 2.4,
      S.zc - 1.5,
      293,
      S.deck + 4.4,
      S.zc + 1.5,
      { grime: 0.5 },
    );
    for (let x = 289.6; x < 293; x += 0.9)
      b.quad("glass_dark", x, S.deck + 3.6, S.zc - 1.51, 0.6, 0.8, {
        ry: PI,
        noAO: true,
      });
    PF.colMM(288, S.deck, S.zc - 1.9, 298, S.deck + 4.4, S.zc + 1.9, {
      walkable: false,
    });
    b.cyl("paint_cream", 295.5, S.deck + 2.4, S.zc, 0.55, 0.6, 3.2, 12, {
      hSeg: 1,
      c: 0xd8b830,
    });
    b.cyl("hull_black", 295.5, S.deck + 5.6, S.zc, 0.56, 0.56, 0.6, 12, {
      hSeg: 1,
    });
    b.cyl("mahogany", 286, S.deck, S.zc, 0.2, 0.25, 12, 8, { hSeg: 2 });
    b.cyl("iron", 286, S.deck + 10, S.zc, 0.9, 0.9, 0.12, 12, { hSeg: 1 });
    PF.railing(
      b,
      Array.from({ length: 13 }, (_, i) => [
        286 + Math.cos((i / 12) * TAU) * 0.9,
        S.zc + Math.sin((i / 12) * TAU) * 0.9,
      ]),
      S.deck + 10.1,
      0.6,
      "iron",
    );
    b.cyl("lamp_warm", 286, S.deck + 10.1, S.zc, 0.5, 0.5, 1.0, 10, {
      hSeg: 1,
      noAO: true,
    });
    b.cyl("hull_black", 286, S.deck + 11.1, S.zc, 0.1, 0.6, 0.6, 10, {
      hSeg: 1,
    });
    PF.glow(V3(286, S.deck + 10.6, S.zc), 0xffd070, 4.5, null, {
      intensity: 1.6,
      flicker: 0.05,
    });
    PF.col(286, S.zc, 0.6, 0.6, S.deck, S.deck + 10, 0, { walkable: false });
    b.cyl("mahogany", 302, S.deck, S.zc, 0.16, 0.2, 8, 8, { hSeg: 1 });
    for (const s of [-1, 1]) {
      b.beam(
        "iron",
        V3(284, S.top, S.zc + s * S.hb),
        V3(286, S.deck + 9.8, S.zc),
        0.03,
        0.03,
        { noAO: true },
      );
      b.beam(
        "iron",
        V3(302, S.top, S.zc + s * S.hb * 0.8),
        V3(302, S.deck + 7.5, S.zc),
        0.03,
        0.03,
        { noAO: true },
      );
    }
    // gangway from Pier 16 (south side of the lightship is the pier's north edge)
    {
      const gx = S.x0 + 0.54 * (S.x1 - S.x0),
        zS = S.zc + S.hb * wf(0.54),
        zP = P16.z0 + 0.8;
      PF.stepPath(
        gx,
        zP,
        PI,
        1.2,
        zP - zS - 0.4,
        (t) => 0.3 + (S.deck - 0.3) * t,
        { maxRise: 0.3, thick: 0.3 },
      );
      b.beam(
        "deck_wood",
        V3(gx, 0.3, zP),
        V3(gx, S.deck, zS + 0.4),
        1.2,
        0.1,
        {},
      );
      anchors.ambrose_gangway = PF.anchor(gx, 0.3, zP + 1.2, 0);
    }
    anchors.ambrose_locker = PF.anchor(299.5, S.deck, S.zc - 1.2, 0);
  }

  // ===================================================================
  // INTERIOR (two sub-areas)
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
    const subShip = PF.subRoot(cell, "ship", (p) => p.x < ox + 2);
    const subMarket = PF.subRoot(cell, "market", (p) => p.x > ox - 2);
    const r = PF.rng("sp_int");

    // ===================== SHIP =====================
    const HD = -6.2; // hold floor
    const SX0 = -100,
      SX1 = -36; // stern .. bow (local)
    const hw = (x) => {
      const v = (x - SX0) / (SX1 - SX0);
      return 4.4 * wf(v, 0.7);
    };
    const L1 = [];
    for (let x = -96; x <= -40; x += 7)
      L1.push({
        x: X(x),
        y: oy + 1.9,
        z: Z(0),
        color: 0xffc070,
        r: 8,
        i: 0.55,
      });
    L1.push({
      x: X(-95),
      y: oy + 2.4,
      z: Z(-2.6),
      color: 0xffd090,
      r: 9,
      i: 0.85,
    }); // saloon (brass lamp by the settee)
    L1.push({
      x: X(-91),
      y: oy + 2.2,
      z: Z(2.4),
      color: 0xffc880,
      r: 7,
      i: 0.55,
    }); // saloon: the salvagers' hurricane lamp on the chart table
    L1.push({
      x: X(-96),
      y: oy + 3.4,
      z: Z(0),
      color: 0xc8d8ff,
      r: 6,
      i: 0.28,
    }); // skylight
    for (let x = -90; x <= -42; x += 8)
      L1.push({
        x: X(x),
        y: oy + HD + 3,
        z: Z(0),
        color: 0x8090a8,
        r: 9,
        i: 0.42,
      });
    L1.push({
      x: X(-66),
      y: oy + HD + 1,
      z: Z(0),
      color: 0x9aff60,
      r: 11,
      i: 0.9,
    }); // the hatchery glow
    L1.push({ x: X(-66), y: oy + 1, z: Z(0), color: 0xc8e0ff, r: 6, i: 0.4 }); // light through the collapsed deck
    L1.push({
      x: X(-50),
      y: oy + HD + 3,
      z: Z(0),
      color: 0xd8e0ff,
      r: 7,
      i: 0.45,
    }); // fore hatch shaft
    L1.push({
      x: X(-80),
      y: oy + HD + 3,
      z: Z(0),
      color: 0xd8e0ff,
      r: 7,
      i: 0.45,
    }); // aft hatch shaft
    for (const [x, z] of [
      [-90, 2.6],
      [-80, -2.8],
      [-50, 2.8],
      [-42, -2.6],
      [-58, -3],
    ])
      L1.push({
        x: X(x),
        y: oy + HD + 1.8,
        z: Z(z),
        color: 0xffb060,
        r: 8,
        i: 0.75,
      }); // salvagers' work lamps
    const b = PF.batch("seaport_ship");
    b.ground = oy + HD;
    b.aoH = 2.5;
    b.setLights(L1, 0x708090, 0.24);
    // hull shell (inside view): side planking following the hull plan, ribs, deck beams
    for (let x = SX0; x < SX1; x += 2) {
      const w0 = hw(x),
        w1 = hw(x + 2),
        wm = Math.min(w0, w1);
      for (const s of [-1, 1]) {
        const len = Math.hypot(2, w1 - w0),
          ry = Math.atan2(-s * (w1 - w0), 2);
        b.box(
          "mahogany",
          X(x + 1),
          oy + HD - 0.2,
          Z((s * (w0 + w1)) / 2 + s * 0.15),
          len + 0.05,
          8.9,
          0.3,
          { ry, seg: true, segLen: 3, grime: 0.6, c: 0x8a7a6a },
        );
        PF.colWall(
          X(x),
          Z(s * (w0 + 0.15)),
          X(x + 2),
          Z(s * (w1 + 0.15)),
          0.3,
          oy + HD - 0.5,
          oy + 2.8,
          { walkable: false },
        );
      }
      // ribs (curved frames) every 2 m
      for (const s of [-1, 1]) {
        const w = w0;
        b.beam(
          "oak",
          P(x, HD, s * (w - 0.2)),
          P(x, HD + 3.5, s * (w - 0.05)),
          0.25,
          0.3,
          { grime: 0.5 },
        );
        b.beam(
          "oak",
          P(x, HD + 3.5, s * (w - 0.05)),
          P(x, 2.5, s * (w - 0.1)),
          0.25,
          0.3,
          { grime: 0.5 },
        );
        b.beam(
          "oak",
          P(x, HD, s * (w - 0.2)),
          P(x, HD + 0.2, s * (w * 0.4)),
          0.25,
          0.3,
          { grime: 0.5 },
        );
      }
      b.box("oak", X(x), oy - 0.7, Z(0), 0.3, 0.3, wm * 2, {
        seg: false,
        grime: 0.5,
      }); // 'tween deck beams (under)
      b.box("oak", X(x), oy + 2.3, Z(0), 0.25, 0.3, wm * 2, {
        seg: false,
        grime: 0.5,
      }); // main deck beams (over)
    }
    // stern & bow end walls
    b.boxMM(
      "mahogany",
      X(SX0 - 0.4),
      oy + HD,
      Z(-4.4),
      X(SX0),
      oy + 2.8,
      Z(4.4),
      { grime: 0.5 },
    );
    PF.colMM(X(SX0 - 0.4), oy + HD, Z(-4.4), X(SX0), oy + 2.8, Z(4.4), {
      walkable: false,
    });
    b.boxMM(
      "mahogany",
      X(SX1 - 0.2),
      oy + HD,
      Z(-1.5),
      X(SX1 + 0.2),
      oy + 2.8,
      Z(1.5),
      { grime: 0.5 },
    );
    PF.colMM(X(SX1 - 0.4), oy + HD, Z(-1.5), X(SX1 + 0.2), oy + 2.8, Z(1.5), {
      walkable: false,
    });
    // main deck overhead (ceiling of the 'tween deck)
    b.boxMM("deck_wood", X(SX0), oy + 2.6, Z(-4.4), X(SX1), oy + 2.8, Z(4.4), {
      seg: false,
      grime: 0.6,
    });
    // hold floor (with the flooded trough amidships) + 'tween deck floor with its openings
    const holdF = (x0, x1, y) => {
      b.boxMM(
        "deck_wood",
        X(x0),
        oy + y - 0.4,
        Z(-4.3),
        X(x1),
        oy + y,
        Z(4.3),
        { grime: 0.7 },
      );
      PF.colMM(X(x0), oy + y - 0.4, Z(-4.3), X(x1), oy + y, Z(4.3), {
        surface: "wood",
      });
    };
    holdF(-97, -76, HD);
    holdF(-56, -38, HD);
    holdF(-76, -56, HD - 0.7);
    b.boxMM(
      "goo",
      X(-76),
      oy + HD - 0.35,
      Z(-4.2),
      X(-56),
      oy + HD - 0.3,
      Z(4.2),
      { seg: false, noAO: true, grime: 0 },
    );
    for (const [x0, x1] of [
      [-76.4, -76],
      [-56, -55.6],
    ])
      b.boxMM("oak", X(x0), oy + HD - 0.7, Z(-4.2), X(x1), oy + HD, Z(4.2), {
        seg: false,
      });
    PF.stairs(b, "oak", X(-75), Z(0), -HP, 3.0, 1.0, oy + HD - 0.7, oy + HD, {
      base: oy + HD - 0.8,
    });
    PF.stairs(b, "oak", X(-57), Z(0), HP, 3.0, 1.0, oy + HD - 0.7, oy + HD, {
      base: oy + HD - 0.8,
    });
    PF.safe("rad", () =>
      G.world.addRadSource({
        x: X(-66),
        y: oy + HD - 0.3,
        z: Z(0),
        radius: 7,
        strength: 2.2,
      }),
    );
    // 'tween deck floor: holes at the fore hatch (x -52..-48), aft hatch (x -82..-78) and the collapse (x -70..-62)
    const tween = (x0, x1) => {
      b.boxMM("deck_wood", X(x0), oy - 0.4, Z(-4.3), X(x1), oy, Z(4.3), {
        grime: 0.6,
      });
      PF.colMM(X(x0), oy - 0.4, Z(-4.3), X(x1), oy, Z(4.3), {
        surface: "wood",
      });
    };
    tween(-100, -84);
    tween(-78, -70);
    tween(-62, -54);
    tween(-48, -36);
    for (const [x0, x1] of [
      [-84, -78],
      [-54, -48],
    ]) {
      b.boxMM("deck_wood", X(x0), oy - 0.4, Z(-4.3), X(x1), oy, Z(-1.6), {
        seg: false,
      });
      b.boxMM("deck_wood", X(x0), oy - 0.4, Z(1.6), X(x1), oy, Z(4.3), {
        seg: false,
      });
      PF.colMM(X(x0), oy - 0.4, Z(-4.3), X(x1), oy, Z(-1.6), {
        surface: "wood",
      });
      PF.colMM(X(x0), oy - 0.4, Z(1.6), X(x1), oy, Z(4.3), { surface: "wood" });
    }
    // hatch coamings + railings around the openings
    for (const [x0, x1] of [
      [-84, -78],
      [-54, -48],
    ]) {
      PF.railing(
        b,
        [
          [X(x0), Z(-1.6)],
          [X(x1), Z(-1.6)],
        ],
        oy,
        0.9,
        "oak",
        { collide: true },
      );
      PF.railing(
        b,
        [
          [X(x0), Z(1.6)],
          [X(x1), Z(1.6)],
        ],
        oy,
        0.9,
        "oak",
        { collide: true },
      );
    }
    // steep companion stairs through the hatches: fore (hold x -54 → 'tween x -48), aft (hold x -78 → 'tween x -84)
    PF.stairs(b, "oak", X(-54), Z(0), HP, 3.0, 6.0, oy + HD, oy, {
      base: oy + HD - 0.2,
    });
    PF.stairs(b, "oak", X(-78), Z(0), -HP, 3.0, 6.0, oy + HD, oy, {
      base: oy + HD - 0.2,
    });
    // collapsed midships deck: broken planks hanging down, railing of salvage timber
    for (let i = 0; i < 9; i++)
      b.box(
        "deck_wood",
        X(-69.5 + i * 0.9),
        oy - 1.8 - r() * 1.2,
        Z((r() - 0.5) * 5),
        0.8,
        0.1,
        3 + r() * 2,
        { rx: (r() - 0.5) * 0.8, rz: 0.6 + r() * 0.5, seg: false, grime: 0.7 },
      );
    for (const x of [-70.1, -61.9])
      PF.railing(
        b,
        [
          [X(x), Z(-4.2)],
          [X(x), Z(4.2)],
        ],
        oy,
        1.0,
        "rotten",
        { collide: true },
      );
    anchors.collapse = A(-72, 0, 0, -HP);
    // ----- 'tween deck compartments -----
    // FO'C'SLE (x -48..-36): arrival from the fore hatch, bunks, sea chests, the galley stove
    for (let i = 0; i < 4; i++)
      for (const s of [-1, 1]) {
        const x = -46.5 + i * 2.2;
        const w = hw(x) - 0.6;
        for (const y of [0.3, 1.4]) {
          b.box("oak", X(x), oy + y, Z(s * (w - 0.5)), 2.0, 0.1, 0.9, {
            seg: false,
          });
          b.box(
            "linen",
            X(x),
            oy + y + 0.1,
            Z(s * (w - 0.5)),
            1.9,
            0.12,
            0.85,
            { seg: false, c: 0x9a9080, grime: 0.7 },
          );
        }
        PF.col(X(x), Z(s * (w - 0.5)), 2.0, 0.9, oy, oy + 1.6, 0, {
          walkable: false,
        });
      }
    b.box("iron", X(-41.5), oy, Z(2.2), 1.4, 1.0, 1.0, {
      seg: false,
      grime: 0.6,
    });
    b.cyl("iron", X(-41.5), oy + 1.0, Z(2.2), 0.12, 0.12, 1.6, 6, { hSeg: 1 });
    PF.col(X(-41.5), Z(2.2), 1.4, 1.0, oy, oy + 1.0, 0, { walkable: false });
    for (let i = 0; i < 3; i++)
      b.cyl("iron", X(-41.8 + i * 0.4), oy + 1.0, Z(2.4), 0.15, 0.12, 0.2, 8, {
        hSeg: 1,
      });
    ladder(b, X(-38.6), oy, Z(0), 2.6, HP);
    anchors.fore = A(-44, 0, 0, HP);
    // CREW BERTHS (x -60..-52): hammocks, lockers, the bosun's skeleton
    for (let i = 0; i < 5; i++)
      for (const s of [-1, 1]) {
        const x = -60 + i * 1.8;
        b.beam("linen", P(x, 1.7, s * 0.7), P(x, 1.3, s * 3.2), 0.6, 0.08, {
          grime: 0.7,
        });
      }
    PF.skeleton(b, X(-57), oy + 0.02, Z(1.5), 2.1);
    anchors.berths = A(-56, 0, -2, 0);
    // SAIL LOCKER (x -78..-70): rolled canvas, coils of rope, a carpenter's bench
    for (let i = 0; i < 6; i++) {
      const g = new THREE.CylinderGeometry(0.35, 0.35, 3.5, 10);
      g.rotateX(HP);
      b.add("linen", g, {
        m: PF.m4(
          X(-77 + (i % 3) * 0.75),
          oy + 0.35 + Math.floor(i / 3) * 0.65,
          Z(-2.2),
        ),
        grime: 0.7,
      });
    }
    PF.colMM(X(-77.5), oy, Z(-4), X(-75.2), oy + 1.2, Z(-0.4), {
      walkable: false,
    });
    for (let i = 0; i < 4; i++)
      b.cyl("rope", X(-73 + i * 0.9), oy, Z(2.8), 0.4, 0.4, 0.3, 12, {
        hSeg: 1,
      });
    b.box("oak", X(-72), oy, Z(-3.4), 2.6, 0.9, 0.8, { seg: false });
    PF.col(X(-72), Z(-3.4), 2.6, 0.8, oy, oy + 0.9, 0, { walkable: false });
    anchors.sail_locker = A(-74, 0, 0, 0);
    // AFT: officers' passage (x -92..-82) + CAPTAIN'S SALOON (x -100..-92)
    PF.wall(
      b,
      "mahogany",
      "z",
      Z(-4.4),
      Z(4.4),
      X(-92.2),
      X(-91.9),
      oy,
      oy + 2.6,
      [{ c: Z(0), w: 1.4, y0: oy, h: 2.2 }],
    );
    b.boxMM("mahogany", X(-99.9), oy, Z(-4.3), X(-92.2), oy + 1.0, Z(-4.1), {
      seg: false,
    }); // wainscot
    b.boxMM("mahogany", X(-99.9), oy, Z(4.1), X(-92.2), oy + 1.0, Z(4.3), {
      seg: false,
    });
    b.boxMM(
      "carpet",
      X(-99.9),
      oy + 0.01,
      Z(-3.8),
      X(-92.3),
      oy + 0.03,
      Z(3.8),
      { seg: false },
    );
    b.box("mahogany", X(-96), oy, Z(0), 3.2, 0.8, 1.6, {
      seg: false,
      grime: 0.4,
    }); // chart table
    PF.col(X(-96), Z(0), 3.2, 1.6, oy, oy + 0.8, 0, { walkable: false });
    const chartK = PF.texMat(
      "sp_chart",
      PF.canvasTex(
        "pf_sp_chart",
        512,
        256,
        (ctx, w, h) => {
          ctx.fillStyle = "#d8ccaa";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#5a6a8a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(40, 200);
          ctx.bezierCurveTo(120, 60, 300, 240, 470, 50);
          ctx.stroke();
          ctx.fillStyle = "#6a7a5a";
          ctx.beginPath();
          ctx.ellipse(120, 120, 60, 40, 0.3, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(380, 180, 80, 50, -0.2, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#3a2a1a";
          ctx.font = "italic 20px Georgia";
          ctx.fillText("Cape Horn — 1929", 300, 30);
          for (let i = 0; i < 20; i++) {
            ctx.fillStyle = "rgba(80,60,30," + Math.random() * 0.3 + ")";
            ctx.beginPath();
            ctx.arc(
              Math.random() * w,
              Math.random() * h,
              4 + Math.random() * 20,
              0,
              TAU,
            );
            ctx.fill();
          }
        },
        { clamp: true },
      ),
      { rough: 0.9 },
    );
    b.quad(chartK, X(-96), oy + 0.81, Z(0), 3.0, 1.4, { rx: -HP, grime: 0.2 });
    PF.codeReadable(
      V3(X(-95.4), oy + 1.0, Z(-0.3)),
      "Chart of Cape Horn",
      "Under a coffee ring, pencilled beside the Horn in the captain's hand: \"55°58' S — SAFE 5558. A sailor never forgets the Horn.\"",
      "pf_lk_sp_captain_safe",
    );
    for (let i = 0; i < 4; i++)
      b.quad("lamp_blue", X(-99.85), oy + 1.6, Z(-3 + i * 2), 0.9, 0.9, {
        ry: HP,
        noAO: true,
      }); // stern windows
    b.boxMM(
      "glass_dark",
      X(-97.5),
      oy + 2.62,
      Z(-1),
      X(-94.5),
      oy + 2.7,
      Z(1),
      { seg: false },
    );
    b.quad("lamp_blue", X(-96), oy + 2.58, Z(0), 2.8, 1.8, {
      rx: HP,
      noAO: true,
    }); // skylight
    for (const s of [-1, 1]) {
      b.box("velvet", X(-96), oy, Z(s * 3.4), 4.0, 0.5, 0.9, { seg: false });
      b.box("velvet", X(-96), oy + 0.5, Z(s * 3.8), 4.0, 0.6, 0.2, {
        seg: false,
      });
      PF.col(X(-96), Z(s * 3.4), 4.0, 0.9, oy, oy + 0.5, 0, {
        surface: "carpet",
      });
    }
    D.painting(b, 0, X(-92.35), oy + 1.6, Z(-2.5), 1.2, 0.8, -HP, {
      frame: "gilt",
    });
    b.cyl("brass", X(-99.7), oy + 1.7, Z(3), 0.25, 0.25, 0.08, 16, {
      hSeg: 1,
      rz: HP,
    }); // barometer
    b.cyl("iron", X(-96), oy + 2.1, Z(0), 0.01, 0.01, 0.5, 3, { hSeg: 1 });
    b.cyl("lamp_warm", X(-96), oy + 1.95, Z(0), 0.12, 0.14, 0.2, 8, {
      hSeg: 1,
      noAO: true,
    });
    PF.glow(P(-96, 1.95, 0), 0xffc070, 1.2, subShip, {
      intensity: 1.1,
      flicker: 0.15,
    });
    PF.skeleton(b, X(-94.5), oy + 0.52, Z(3.3), PI); // the last captain, at rest on his settee
    anchors.saloon = A(-95, 0, -2, 0);
    anchors.captain_safe = A(-99.5, 0.4, -3.2, HP);
    anchors.captain_log = A(-96.4, 0.82, 0.3, 0);
    // officers' passage (x -92..-82): cabins as partitions with curtains, the aft companionway up
    for (const s of [-1, 1])
      b.boxMM(
        "mahogany",
        X(-89.05),
        oy,
        Z(s * 1.4),
        X(-88.95),
        oy + 2.6,
        Z(s * 4.3),
        { seg: false },
      );
    PF.colMM(X(-89.1), oy, Z(1.4), X(-88.9), oy + 2.6, Z(4.3), {
      walkable: false,
    });
    PF.colMM(X(-89.1), oy, Z(-4.3), X(-88.9), oy + 2.6, Z(-1.4), {
      walkable: false,
    });
    for (const [x, s] of [
      [-90.5, 1],
      [-90.5, -1],
    ]) {
      b.box("oak", X(x), oy + 0.35, Z(s * 3.2), 2.0, 0.08, 0.8, { seg: false });
      b.box("linen", X(x), oy + 0.43, Z(s * 3.2), 1.9, 0.12, 0.75, {
        seg: false,
      });
      PF.col(X(x), Z(s * 3.2), 2.0, 0.8, oy, oy + 0.55, 0, { surface: "wood" });
    }
    // aft companionway: a ladder up to the poop-deck hatch
    ladder(b, X(-86.8), oy, Z(-3.4), 2.6, -HP);
    anchors.companion = A(-86.8, 0, -3.4, -HP);
    anchors.aft_arrive = A(-87.2, 0, -0.3, HP + 0.3); // between the cabin partitions, looking aft into the saloon
    // ----- THE HOLD: cargo, ballast, the hatchery -----
    for (let i = 0; i < 26; i++) {
      const x = -95 + r() * 55,
        s = r() < 0.5 ? -1 : 1,
        z = s * (1.8 + r() * 1.6);
      if (x > -77 && x < -55) continue;
      if (r() < 0.5) {
        b.box("sandbag", X(x), oy + HD, Z(z), 1.2, 0.5, 0.7, {
          ry: r() * 0.4,
          seg: false,
          grime: 0.7,
        });
        b.box("sandbag", X(x + 0.1), oy + HD + 0.5, Z(z), 1.1, 0.45, 0.65, {
          ry: r() * 0.4,
          seg: false,
        });
        PF.col(X(x), Z(z), 1.2, 0.8, oy + HD, oy + HD + 0.95, 0, {
          walkable: false,
        });
      } else
        D.crates(b, X(x), oy + HD, Z(z), 1 + ((r() * 3) | 0), 900 + i, true);
    }
    for (let i = 0; i < 12; i++)
      b.rock(
        "rubble",
        X(-94 + i * 1.3),
        oy + HD,
        Z((r() - 0.5) * 3),
        0.35 + r() * 0.3,
        { flat: 0.6 },
      ); // ballast
    // the salvage crew's work lamps: caged bulbs on crates, cables snaking to a dead generator
    for (const [x, z] of [
      [-90, 2.6],
      [-80, -2.8],
      [-50, 2.8],
      [-42, -2.6],
      [-58, -3],
    ]) {
      b.box("crate", X(x), oy + HD, Z(z), 0.6, 0.5, 0.6, { seg: false });
      b.cyl("iron", X(x), oy + HD + 0.5, Z(z), 0.03, 0.03, 1.1, 4, { hSeg: 1 });
      b.sphere("lamp_warm", X(x), oy + HD + 1.7, Z(z), 0.12, { ws: 6, hs: 5 });
      b.add("iron", new THREE.TorusGeometry(0.15, 0.015, 3, 8), {
        m: PF.m4(X(x), oy + HD + 1.7, Z(z), 0, HP),
      });
      PF.glow(P(x, HD + 1.7, z), 0xffb060, 1.6, subShip, {
        intensity: 1.1,
        flicker: x === -58 ? 0.6 : 0.1,
      });
    }
    b.box("paint_orange", X(-86), oy + HD, Z(-3.0), 1.4, 0.9, 0.8, {
      seg: false,
      grime: 0.7,
    });
    D.cable(
      b,
      [
        P(-86, HD + 0.1, -2.6),
        P(-80, HD + 0.05, -2.8),
        P(-66, HD + 0.2, -3.6),
        P(-58, HD + 0.1, -3),
        P(-50, HD + 0.1, 2.8),
      ],
      0.05,
    );
    // the hatchery: mud mounds, dozens of glowing eggs, a skeleton — Cal's body with his tape reel
    const hatch = [];
    hatch.push(nest(b, X(-70), oy + HD - 0.7, Z(-1.6), 2.2, 22, subShip, 81));
    hatch.push(nest(b, X(-64), oy + HD - 0.7, Z(1.8), 1.9, 18, subShip, 82));
    hatch.push(nest(b, X(-60), oy + HD - 0.7, Z(-2.0), 1.5, 14, subShip, 83));
    PF.skeleton(b, X(-73.5), oy + HD + 0.02, Z(2.8), 0.6);
    anchors.cal = A(-73.2, HD + 0.05, 2.4, 0);
    anchors.nest = A(-66, HD - 0.7, 0, 0);
    anchors.boss = A(-64, HD - 0.7, 0, HP);
    anchors.spawn1 = A(-86, HD, 0, 0);
    anchors.spawn2 = A(-58, HD - 0.7, 1, 0);
    anchors.spawn3 = A(-45, HD, -1, 0);
    anchors.hold_fore = A(-46, HD, 0, -HP);
    anchors.hold_aft = A(-86, HD, 0, HP);
    const gShip = b.build(subShip, { lodDistInt: 300 });
    gShip.name = "seaport_ship";

    // ===================== MARKET =====================
    const MH = 7.2;
    const L2 = [];
    for (let x = 24; x <= 56; x += 8)
      for (const z of [-5, 4])
        L2.push({
          x: X(x),
          y: oy + 5,
          z: Z(z),
          color: 0xc8d4e0,
          r: 10,
          i: 0.4,
        });
    L2.push({
      x: X(40),
      y: oy + 5.4,
      z: Z(-8),
      color: 0xffd090,
      r: 8,
      i: 0.55,
    }); // counting-house
    L2.push({ x: X(23), y: oy + 2.2, z: Z(1), color: 0x90b8ff, r: 6, i: 0.5 }); // cold store
    L2.push({ x: X(58), y: oy + 2.4, z: Z(2), color: 0xffd8a0, r: 6, i: 0.4 }); // dock
    const bm = PF.batch("seaport_market");
    bm.ground = oy;
    bm.aoH = 3;
    bm.setLights(L2, 0x8a94a0, 0.1);
    const Wm = (key, ax, a0, a1, f0, f1, y0, y1, gaps) =>
      PF.wall(
        bm,
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
        { grime: 0.55 },
      );
    bm.boxMM("concrete", X(20), oy - 0.4, Z(-10), X(60), oy, Z(10), {
      grime: 0.7,
    });
    PF.colMM(X(20), oy - 0.4, Z(-10), X(60), oy, Z(10));
    Wm("brick", "x", 19.4, 60.6, 10, 10.6, 0, MH, [
      { c: 40, w: 3.6, y0: 0, h: 3.8 },
    ]);
    Wm("brick", "x", 19.4, 60.6, -10.6, -10, 0, MH);
    Wm("brick", "z", -10.6, 10.6, 19.4, 20, 0, MH);
    Wm("brick", "z", -10.6, 10.6, 60, 60.6, 0, MH, [
      { c: 2, w: 3.0, y0: 0, h: 3.4 },
    ]);
    // roof: trusses, corrugated sheets with holes, clerestory light shafts
    for (let x = 22; x <= 58; x += 4) {
      bm.beam("iron", P(x, MH, -10), P(x, MH + 3.2, 0), 0.2, 0.2);
      bm.beam("iron", P(x, MH, 10), P(x, MH + 3.2, 0), 0.2, 0.2);
      bm.beam("iron", P(x, MH, -10), P(x, MH, 10), 0.18, 0.18);
      for (const z of [-5, 5])
        bm.beam("iron", P(x, MH, z), P(x, MH + 1.6, z * 0.5 * 1.0), 0.08, 0.08);
    }
    for (const s of [-1, 1]) {
      for (let x = 20; x < 60; x += 4) {
        if (r() < 0.18) continue; // holes in the roof
        bm.box(
          "corrugated",
          X(x + 2),
          oy + MH + 1.6 - 0.02,
          Z(s * 5),
          4.1,
          0.06,
          10.6,
          { rx: s * -0.31, seg: false, grime: 0.7 },
        );
      }
    }
    for (let x = 24; x < 58; x += 8) {
      bm.quad("lamp_blue", X(x), oy + MH + 1.4, Z(0), 3, 2.2, {
        rx: HP,
        noAO: true,
      });
    }
    // fish stalls: three rows of counters with ice troughs, scales, hooks, signs
    const stallRow = (z, dir) => {
      for (let i = 0; i < 4; i++) {
        const x = 32 + i * 6.5;
        bm.box("tile_sub", X(x), oy, Z(z), 5.0, 0.95, 1.4, {
          seg: false,
          grime: 0.6,
        });
        bm.box("vault_steel", X(x), oy + 0.95, Z(z), 5.1, 0.1, 1.5, {
          seg: false,
        });
        // a bed of grey slush (the ice melted in 1967) with rows of old fish laid head-to-tail, some just bones
        bm.box("slush", X(x), oy + 1.0, Z(z), 4.8, 0.06, 1.2, {
          seg: false,
          grime: 0.8,
        });
        for (let k = 0; k < 12; k++) {
          const fx = x - 2.1 + (k % 6) * 0.8 + r() * 0.2,
            fz = z + (k < 6 ? -0.3 : 0.3) + (r() - 0.5) * 0.12,
            fr = 0.075 + r() * 0.03;
          if (r() < 0.25) {
            bm.beam(
              "bone",
              P(fx - 0.25, 1.08, fz),
              P(fx + 0.25, 1.08, fz),
              0.012,
              0.012,
            );
            continue;
          }
          bm.sphere(
            r() < 0.6 ? "fish" : "fish_dark",
            X(fx),
            oy + 1.07,
            Z(fz),
            fr,
            { ws: 10, hs: 6, sx: 3.4, sy: 0.5, sz: 0.85 },
          );
          bm.box(
            "fish_dark",
            X(fx + fr * 3.6),
            oy + 1.07,
            Z(fz),
            0.02,
            0.1,
            0.14,
            { seg: false },
          ); // tail
        }
        bm.box("iron", X(x), oy + 2.6, Z(z - dir * 0.7), 5.0, 0.08, 0.08, {
          seg: false,
        });
        for (let k = 0; k < 5; k++)
          bm.beam(
            "iron",
            P(x - 2 + k, 2.6, z - dir * 0.7),
            P(x - 2 + k, 2.2, z - dir * 0.7),
            0.02,
            0.02,
          );
        PF.col(X(x), Z(z), 5.0, 1.4, oy, oy + 1.05, 0, { walkable: false });
        if (r() < 0.5) {
          bm.cyl("brass", X(x + 1.5), oy + 1.05, Z(z), 0.2, 0.2, 0.05, 10, {
            hSeg: 1,
          });
          bm.box("brass", X(x + 1.5), oy + 1.1, Z(z), 0.05, 0.4, 0.05, {
            seg: false,
          });
        }
      }
    };
    stallRow(-2.2, 1);
    stallRow(3.5, -1);
    const stallNames = [
      "BIG ANDY'S — FLUKE",
      "CODFATHER",
      "THE CLAM SHACK",
      "MURPHY & SONS",
      "FRESH EELS",
    ];
    stallNames.slice(0, 4).forEach((t, i) => {
      const k = PF.texMat(
        "sp_stall" + i,
        PF.signTex("sp_stall" + i, [t], "enamel", 512, 96, {
          bg: ["#1c3a5a", "#5a1c14", "#1c4a2a", "#4a3a1c", "#2a2a4a"][i],
          fg: "#f0e8c8",
        }),
      );
      bm.quad(k, X(32 + i * 6.5), oy + 3.0, Z(-1.5), 3.2, 0.6, {});
    });
    // overturned crates, puddles, shellback shells, a dead fishmonger, nets
    for (let i = 0; i < 10; i++) {
      const cx = 28 + r() * 26;
      if (Math.abs(cx - 40) < 3.5) continue;
      D.crates(
        bm,
        X(cx),
        oy,
        Z(7.2 + r() * 1.8),
        1 + ((r() * 2) | 0),
        700 + i,
        true,
      );
    }
    for (let i = 0; i < 5; i++)
      bm.quad(
        "goo",
        X(24 + r() * 32),
        oy + 0.01,
        Z(-8 + r() * 16),
        2 + r() * 2,
        1 + r() * 2,
        { rx: -HP, uv: "box", noAO: true, grime: 0 },
      );
    for (const [x, z] of [
      [33, 6.5],
      [51, -6.5],
    ])
      bm.rock("hull_red", X(x), oy + 0.3, Z(z), 0.7, { flat: 0.45, detail: 1 });
    PF.skeleton(bm, X(46), oy + 0.02, Z(0.8), 1.2);
    nest(bm, X(52), oy, Z(7), 1.2, 9, subMarket, 91);
    // cold store (x 20..26, z -4..6)
    Wm("tile_sub", "z", -4, 6, 26, 26.3, 0, 3.2, [
      { c: 1, w: 1.4, y0: 0, h: 2.4 },
    ]);
    Wm("tile_sub", "x", 20, 26.3, -4.3, -4, 0, 3.2);
    Wm("tile_sub", "x", 20, 26.3, 6, 6.3, 0, 3.2);
    bm.boxMM("tile_sub", X(20), oy + 3.2, Z(-4.3), X(26.3), oy + 3.4, Z(6.3), {
      seg: false,
    });
    bm.box("vault_steel", X(26.5), oy, Z(2.1), 0.15, 2.4, 1.3, {
      ry: -0.9,
      seg: false,
    });
    for (let i = 0; i < 6; i++)
      bm.beam(
        "iron",
        P(21 + (i % 3) * 1.6, 3.1, -2 + Math.floor(i / 3) * 5),
        P(21 + (i % 3) * 1.6, 1.4, -2 + Math.floor(i / 3) * 5),
        0.03,
        0.03,
      );
    for (let i = 0; i < 4; i++)
      bm.box("linen", X(21 + i * 1.3), oy + 0.8, Z(-2), 0.5, 1.3, 0.3, {
        seg: false,
        c: 0xa89080,
      }); // hanging carcass sacks
    PF.skeleton(bm, X(23.5), oy + 0.02, Z(4), 0.3);
    anchors.cold_store = A(23, 0, 1, 0);
    // counting-house mezzanine (y 3.8) along the north wall: iron stair at the west end, offices behind glass
    const MZ = 3.8;
    bm.boxMM(
      "diamond",
      X(28),
      oy + MZ - 0.25,
      Z(-10),
      X(60),
      oy + MZ,
      Z(-6.8),
      { grime: 0.5 },
    );
    PF.colMM(X(28), oy + MZ - 0.25, Z(-10), X(60), oy + MZ, Z(-6.8), {
      surface: "metal",
    });
    for (let x = 30; x <= 58; x += 4) {
      bm.box("iron", X(x), oy, Z(-6.9), 0.2, MZ - 0.25, 0.2, { seg: false });
      PF.col(X(x), Z(-6.9), 0.25, 0.25, oy, oy + MZ, 0, { walkable: false });
    }
    PF.railing(
      bm,
      [
        [X(28.2), Z(-6.8)],
        [X(59.8), Z(-6.8)],
      ],
      oy + MZ,
      1.0,
      "iron",
      { collide: true },
    );
    PF.stairs(bm, "diamond", X(27), Z(-1.2), PI, 1.4, 5.4, oy, oy + MZ, {
      base: oy - 0.1,
    });
    bm.boxMM(
      "diamond",
      X(26.3),
      oy + MZ - 0.25,
      Z(-10),
      X(28),
      oy + MZ,
      Z(-6.6),
      { seg: false },
    );
    PF.colMM(X(26.3), oy + MZ - 0.25, Z(-10), X(28), oy + MZ, Z(-6.6), {
      surface: "metal",
    });
    // office partitions with glass
    for (const x of [36, 44, 52]) {
      bm.boxMM(
        "mahogany",
        X(x - 0.05),
        oy + MZ,
        Z(-10),
        X(x + 0.05),
        oy + MZ + 2.8,
        Z(-8.2),
        { seg: false },
      );
      PF.colMM(
        X(x - 0.05),
        oy + MZ,
        Z(-10),
        X(x + 0.05),
        oy + MZ + 2.8,
        Z(-8.2),
        { walkable: false },
      );
    }
    for (let x = 28.5; x < 60; x += 2) {
      if (Math.abs(x - 48.5) < 1.2) continue;
      bm.quad(
        x > 44 && x < 52 ? "planks" : "glass_dark",
        X(x),
        oy + MZ + 1.6,
        Z(-8.2),
        1.9,
        2.0,
        { noAO: true },
      );
    }
    bm.boxMM(
      "mahogany",
      X(28),
      oy + MZ + 2.8,
      Z(-10),
      X(60),
      oy + MZ + 2.95,
      Z(-8.1),
      { seg: false },
    );
    for (let x = 28; x < 60; x += 2)
      bm.box("mahogany", X(x), oy + MZ, Z(-8.2), 0.1, 2.8, 0.1, { seg: false });
    PF.colMM(X(28), oy + MZ, Z(-8.3), X(47.8), oy + MZ + 2.8, Z(-8.1), {
      walkable: false,
    });
    PF.colMM(X(49.2), oy + MZ, Z(-8.3), X(60), oy + MZ + 2.8, Z(-8.1), {
      walkable: false,
    });
    // Lottie's barricaded office door (x 48.5) — scripted
    const barricade = new THREE.Group();
    {
      const gb = PF.batch("sp_barricade");
      for (let i = 0; i < 4; i++)
        gb.box("planks", 0, 0.3 + i * 0.6, 0, 1.6, 0.3, 0.08, {
          rz: i % 2 ? 0.2 : -0.2,
          seg: false,
        });
      gb.box("rotten", 0, 0, 0.1, 1.4, 2.3, 0.08, { seg: false });
      gb.build(barricade);
    }
    barricade.position.set(X(48.5), oy + MZ, Z(-8.15));
    subMarket.add(barricade);
    const bcol = { c: null };
    const applyBar = () => {
      const open = !!PF.flag("sp_lottie_door");
      barricade.visible = !open;
      if (!open && !bcol.c)
        bcol.c = PF.col(X(48.5), Z(-8.2), 1.4, 0.3, oy + MZ, oy + MZ + 2.8, 0, {
          walkable: false,
        });
      if (open && bcol.c) {
        G.world.removeCollider(bcol.c);
        bcol.c = null;
      }
    };
    applyBar();
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "sp_lottie_door") applyBar();
    });
    PF.onReset.push(() => {
      if (bcol.c) {
        G.world.removeCollider(bcol.c);
        bcol.c = null;
      }
      applyBar();
    });
    PF.use({
      pos: P(48.5, MZ + 1.3, -8.0),
      radius: 0.9,
      range: 2.6,
      label: "Barricaded Office",
      verb: () => (PF.flag("sp_lottie_door") ? "Examine" : "Knock"),
      onInteract() {
        if (PF.flag("sp_lottie_door")) {
          G.notify("Lottie's office. The barricade is down.");
          return;
        }
        PF.sfx("melee_hit", P(48.5, MZ + 1, -8.2), { volume: 0.5 });
        PF.say(
          "pf_sp_lottie",
          "Who's there? You're not a crab. Crabs don't knock. ...Hang on.",
          4,
        );
        PF.setFlag("sp_lottie_door", true);
        PF.q.advance("pf_deep", "find", "talk");
      },
    });
    // Lottie's office interior: cot, map of the Peking on the wall, rifle rack, canned food
    bm.box("iron", X(50.5), oy + MZ + 0.35, Z(-9.3), 2.0, 0.06, 0.8, {
      seg: false,
    });
    bm.box("linen", X(50.5), oy + MZ + 0.41, Z(-9.3), 1.9, 0.12, 0.75, {
      seg: false,
    });
    const plan = PF.texMat(
      "sp_plan",
      PF.signTex(
        "sp_plan",
        [
          "PEKING — HOLD PLAN",
          "FORE HATCH → DOWN",
          "NEST AMIDSHIPS!!",
          "CAPTAIN'S SAFE AFT",
        ],
        "engraved",
        512,
        320,
        { bg: "#d8d0b8", fg: "#1a2a4a" },
      ),
    );
    bm.quad(plan, X(46), oy + MZ + 1.7, Z(-9.96), 1.4, 0.9, {});
    anchors.lottie = A(47, MZ, -9.2, 0);
    anchors.lottie_stall = A(45, 0, 5.4, PI);
    bm.box("rust", X(40), oy, Z(10.25), 3.7, 3.9, 0.12, {
      seg: false,
      grime: 0.6,
    });
    bm.box("rust", X(60.2), oy, Z(2), 0.12, 3.5, 3.1, {
      seg: false,
      grime: 0.6,
    });
    anchors.mezz = A(40, MZ, -7.6, PI);
    // loading dock (east): pallets, a forklift wreck, the back door to South Street
    bm.boxMM("concrete_dark", X(56), oy, Z(-1), X(60), oy + 0.9, Z(5), {
      seg: false,
    });
    PF.colMM(X(56), oy, Z(-1), X(60), oy + 0.9, Z(5), { surface: "concrete" });
    PF.stairs(bm, "concrete_dark", X(54.2), Z(2), HP, 3, 1.8, oy, oy + 0.9, {
      base: oy - 0.1,
    }); // rises EAST onto the platform (was built facing away from it)
    bm.box("paint_orange", X(57.5), oy + 0.9, Z(-0.2), 1.2, 1.5, 2.0, {
      seg: false,
      grime: 0.7,
    });
    bm.box("iron", X(57.5), oy + 0.9, Z(1.2), 1.0, 2.6, 0.1, { seg: false });
    PF.col(X(57.5), Z(0.3), 1.3, 2.4, oy + 0.9, oy + 2.4, 0, {
      walkable: false,
    });
    anchors.dock = A(58.4, 0.9, 2.8, -HP);
    anchors.market = A(40, 0, 8, 0);
    anchors.spawn4 = A(30, 0, 0.6, 0);
    anchors.spawn5 = A(50, 0, 0.6, 0);
    anchors.spawn6 = A(44, 0, 7, 0);
    anchors.loot1 = A(23, 0, -2.5, 0);
    anchors.loot2 = A(-96, 0, 2, 0);
    anchors.loot3 = A(-44, 0, 2.6, 0);
    const gM = bm.build(subMarket, { lodDistInt: 300 });
    gM.name = "seaport_market";

    anchors.entrance = A(40, 0, 8.6, 0);
    anchors.ship_entrance = A(-44, 0, 0.8, -HP);
    // triggers
    PF.trigger(
      {
        x0: X(-77),
        x1: X(-55),
        y0: oy + HD - 2,
        y1: oy + HD + 2,
        z0: Z(-4.5),
        z1: Z(4.5),
      },
      () => {
        G.notify(
          "The hold stinks of brine and rot. The eggs pulse with a sickly green light.",
        );
        PF.q.advance("pf_deep", ["find", "talk", "ship"], "nest");
      },
      { cond: () => !PF.flag("sp_nest") },
    );
    PF.trigger(
      {
        x0: X(-48),
        x1: X(-36),
        y0: oy - 1,
        y1: oy + 2.5,
        z0: Z(-4.5),
        z1: Z(4.5),
      },
      () => {
        PF.q.advance("pf_deep", ["talk"], "ship");
      },
      {
        cond: () => PF.q.active("pf_deep") && PF.q.stage("pf_deep") === "talk",
      },
    );
    return anchors;
  }

  // ===================================================================
  // CONTENT
  // ===================================================================
  // ---- locks: the captain's safe (combination pencilled on the chart in the saloon) ----
  const SP_LOCKS = (PF.spLocks = {
    captain: PF.regLock({
      id: "pf_lk_sp_captain_safe",
      label: "Captain's Safe (PEKING)",
      code: "5558",
      kind: "safe",
      hint: "Pencilled at Cape Horn on the chart in the captain's saloon.",
    }),
  });
  PF.item({
    id: "pf_reel_cal",
    type: "tape",
    name: "Tape reel: Cal Brennan",
    title: "Cal Brennan — Salvage Log",
    text: "[Water dripping. Heavy breathing.]\n\nCAL: Lot, if you get this — the hold's not full of nitrate. It's full of eggs. Hundreds. The big one sleeps on them like a hen. Mick and Dash are... Mick and Dash are gone.\n\n[Clicking, very close.]\n\nCAL: I'm wedged behind the ballast. It can't reach me. It's just waiting. Burn the nest, Lot. Burn the whole damned hold. And sell the captain's safe — the combination's pencilled on his chart, by the Horn, under the coffee stain. Love you, kid. Tell Nan I'm sorry about the omelette.\n\n[Recording ends.]",
  });
  PF.item({
    id: "pf_note_captain",
    type: "note",
    name: "Captain's Log — PEKING",
    title: "Log of the Barque PEKING — Museum Ship, South St.",
    text: 'Mar 4, 1967. Museum closed for the "civil defense drill." Volunteers sent home. I stayed aboard; a ship should never be left unwatched.\n\nMar 5, Sunday. The sky to the north, over the Bronx, turned white. The ship rolled like she was rounding the Horn again. Every mast held. Magnificent girl.\n\nMar 12. The river is warm and wrong. Things are coming up out of it.\n\n[Much later, shakier hand.] They have taken the hold. I have taken the saloon. We have an arrangement. I will not go down, and they will not come up. The safe combination is written where a sailor would look: the Horn.',
  });
  PF.item({
    id: "pf_old_salt",
    build() {
      const base = PF.live("items") ? G.items.get("sawed_off_shotgun") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 8) * 1.35),
              critChance: 1.5,
              spread: (base.weapon.spread || 0.1) * 0.8,
              condDecay: (base.weapon.condDecay || 0.003) * 0.6,
            })
          : undefined;
      return {
        id: "pf_old_salt",
        type: w ? "weapon" : "misc",
        name: "Old Salt",
        weight: 4,
        value: 850,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: "The Peking captain's sawed-off, its stock carved with the names of every port she ever made. Tighter spread, harder hits — and shellbacks seem to hate it personally.",
        weapon: w,
      };
    },
  });

  // --- dialogue: Lottie Brennan ---
  PF.dialogue("pf_dlg_lottie", {
    start: () => {
      if (PF.q.active("pf_deep") && PF.q.stage("pf_deep") === "report")
        return "report";
      if (PF.q.complete("pf_deep")) return "after";
      return PF.flag("sp_met") ? "again" : "first";
    },
    nodes: {
      first: {
        text: "Easy with that thing. I'm Lottie Brennan — Brennan Salvage, what's left of it. Me and my brother Cal and three idiots took a job clearing the Peking for scrap. The shellbacks had other plans. I ran. Cal didn't make it out of the hold. I've been sitting behind this door for four days listening to them click.",
        onEnter() {
          PF.setFlag("sp_met", true);
          if (!PF.q.started("pf_deep"))
            PF.q.start("pf_deep", { stage: "talk" });
        },
        responses: [
          {
            text: "I'll go aboard and look for Cal.",
            action: () => PF.q.advance("pf_deep", ["find", "talk"], "ship"),
            next: "go",
          },
          { text: "What's in it for me?", next: "pay" },
          {
            text: "[Medicine 30] You're bleeding. Let me see that arm.",
            check: { skill: "medicine", value: 30 },
            next: "arm",
            failNext: "arm_fail",
            cond: () => !PF.flag("sp_arm"),
          },
          { text: "Not my problem." },
        ],
      },
      pay: {
        text: "Two hundred scrip — the job's whole advance. And there's a safe in the captain's saloon, aft. Cal said he'd found the combination. Whatever's in it, it's yours. Just... bring him back to me. Or what's left.",
        responses: [
          {
            text: "Deal.",
            action: () => PF.q.advance("pf_deep", ["find", "talk"], "ship"),
            next: "go",
          },
          { text: "I'll think about it." },
        ],
      },
      arm: {
        text: "Ow — careful — okay. That's... that's actually better. You're handy. [She flexes her fingers.] Here, take these. I'm not going anywhere with one working arm anyway.",
        onEnter() {
          PF.setFlag("sp_arm", true);
          PF.inv.add("ammo_12ga", 12);
          PF.xp(40, "Treated Lottie");
        },
        responses: [
          {
            text: "I'll find your brother.",
            action: () => PF.q.advance("pf_deep", ["find", "talk"], "ship"),
            next: "go",
          },
        ],
      },
      arm_fail: {
        text: "Ow! No — stop — I'll live. Probably. Just... go find Cal.",
        responses: [
          {
            text: "Right.",
            action: () => PF.q.advance("pf_deep", ["find", "talk"], "ship"),
            next: "go",
          },
        ],
      },
      go: {
        text: "Board from Pier 16 — the gangway's still up. Fore hatch takes you below. The middle of the 'tween deck caved in; you'll have to go down into the hold to get aft. That's where the nest is. That's where the big one sleeps. Burn it all if you can.",
        responses: [{ text: "I'll be back." }],
      },
      again: {
        text: () =>
          PF.flag("sp_nest")
            ? "The clicking stopped. I heard it stop. Is it — tell me."
            : "Still here. Still listening to them click. Find Cal. Please.",
        responses: [{ text: "Working on it." }],
      },
      report: {
        text: () =>
          PF.flag("sp_cal")
            ? "You found him. [She takes the tape reel and holds it for a long time without playing it.] Four days behind a pile of ballast. He waited for me. Stubborn as our dad."
            : "The nest is gone? Really gone? And Cal... you didn't find him. That means he's still down there somewhere. Or it means nothing. I'll look. Later.",
        responses: [
          {
            text: "I'm sorry, Lottie.",
            action: () => finishDeep(),
            next: "thanks",
          },
          {
            text: "[Persuasion 50] Cal's money doesn't change hands for free. Make it three hundred.",
            check: { skill: "persuasion", value: 50 },
            action: () => {
              PF.inv.addScrip(100);
              finishDeep();
              PF.standing(-10, "Haggled with a grieving sister");
            },
            next: "thanks_cold",
            failNext: "thanks",
          },
        ],
      },
      thanks: {
        text: "I'm going to reopen the market. Brennan Salvage & Fish. Cal always wanted a shop that didn't move. Come by — I'll trade fair. For you, fairer.",
        responses: [{ text: "I will." }],
      },
      thanks_cold: {
        text: "Fine. Take it. [She counts the scrip into your hand one by one.] Market reopens tomorrow. Your prices will be... standard.",
        responses: [{ text: "Business is business." }],
      },
      after: {
        text: "Brennan Salvage & Fish. Open for business, rain or crabs. What do you need?",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "How's the market?", next: "market" },
          { text: "Take care, Lottie." },
        ],
      },
      market: {
        text: "Folks from Fraunces come down for fish again. Nan buys every egg I find. Somebody even fixed the lamp on the Ambrose — you can see it from the bridge at night. It's almost like a port again.",
        responses: [{ text: "Glad to hear it." }],
      },
    },
  });
  function finishDeep() {
    PF.inv.remove("pf_reel_cal", 1);
    PF.setFlag("sp_market", true);
    PF.q.done("pf_deep");
    PF.news(
      "Good news from the South Street Seaport: the fish market is open again, under new management. Brennan Salvage & Fish — the only shop in town where the merchandise used to try to eat you.",
    );
    // Lottie heads down to her new stall
    const a = PF.getNpc("pf_sp_lottie"),
      st = PF.anchorOf("seaport", "lottie_stall");
    if (a && st && a.moveTo) {
      try {
        a.home = { x: st.x, z: st.z, r: 2 };
        a.moveTo(st.x, st.z);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // --- dialogue: the hatchery (actor-less) ---
  PF.dialogue("pf_dlg_nest", {
    start: "root",
    nodes: {
      root: {
        speaker: "Shellback Hatchery",
        text: () =>
          PF.flag("sp_harvest")
            ? "The mounds are picked over now. What's left is pulsing, warm and very much alive."
            : "Mounds of river mud crusted with shell, and dozens of leathery eggs the size of footballs, each one glowing faintly green. Something inside the nearest one twitches.",
        responses: [
          {
            text: "Harvest some eggs first. (6 Shellback Eggs)",
            cond: () => !PF.flag("sp_harvest"),
            action: () => {
              PF.setFlag("sp_harvest", true);
              PF.inv.add("pf_shellback_egg", 6);
              PF.sfx("pickup");
            },
            next: "root",
          },
          {
            text: "Smash every egg and burn the nest.",
            action: () => destroyNest(),
            next: null,
          },
          { text: "Leave it." },
        ],
      },
    },
  });
  function destroyNest() {
    if (PF.flag("sp_nest")) return;
    PF.setFlag("sp_nest", true);
    PF.sfx("melee_hit");
    PF.sfx("shellback_click", null, { volume: 0.9, pitch: 1.4 });
    try {
      if (PF.live("fx")) {
        const a = PF.anchorOf("seaport", "nest");
        if (a) {
          G.fx.fire(a.clone().setY(a.y + 0.4), 1.2);
          G.fx.flash(a.clone().setY(a.y + 1), 0x90ff40, 3, 0.6);
        }
      }
    } catch (e) {
      /* optional */
    }
    G.notify(
      "You stamp, smash and burn the hatchery. The clicking in the dark goes very quiet.",
    );
    PF.xp(200, "Destroyed the Peking hatchery");
    PF.standing(15, "Destroyed a shellback hatchery");
    PF.q.advance("pf_deep", ["find", "talk", "ship", "nest"], "report");
    // a last brood of hatchlings bursts out
    const n = PF.anchorOf("seaport", "nest");
    if (n && PF.live("actors"))
      for (let i = 0; i < 3; i++)
        PF.safe("hatch", () => {
          const a = G.actors.spawn({
            type: "shellback",
            name: "Shellback Hatchling",
            faction: "creatures",
            level: 2,
            pos: { x: n.x + (i - 1) * 1.6, y: n.y + 0.2, z: n.z + 1.5 },
            hp: 18,
            ai: "wander",
            noRespawn: true,
          });
          if (a && a.char && a.char.root) a.char.root.scale.setScalar(0.45);
        });
  }
  PF.spDestroyNest = destroyNest;

  PF.quest({
    id: "pf_deep",
    name: "Low Tide",
    giver: "Lottie Brennan",
    location: "South Street Seaport",
    desc: "Lottie Brennan's salvage crew went into the hold of the tall ship Peking at the South Street Seaport. The shellbacks got them. Her brother Cal never came out.",
    stages: [
      {
        id: "find",
        text: "Find Lottie Brennan in the Fulton Fish Market at the South Street Seaport.",
        markers: () => {
          const a = PF.anchorOf("seaport", "exterior_entrance");
          return [
            {
              x: a ? a.x : 204,
              z: a ? a.z + 1 : 712,
              label: "Fulton Fish Market",
            },
          ];
        },
      },
      {
        id: "talk",
        text: "Talk to Lottie Brennan.",
        markers: () => [{ npc: "pf_sp_lottie", label: "Lottie Brennan" }],
      },
      {
        id: "ship",
        text: "Board the Peking from Pier 16 and search the hold for Cal.",
        markers: () => {
          const g = PF.anchorOf("seaport", "gangway");
          return [
            {
              x: g ? g.x : 300,
              z: g ? g.z : 729,
              label: "The Peking — Gangway",
            },
          ];
        },
      },
      {
        id: "sp_cal",
        text: "(Optional) Find out what happened to Cal Brennan.",
        sideObjective: true,
        optional: true,
        doneIf: () => !!PF.flag("sp_cal"),
        markers: () => {
          const a = PF.anchorOf("seaport", "cal");
          return a && !PF.flag("sp_cal")
            ? [{ x: a.x, z: a.z, y: a.y, label: "Cal", interior: "seaport" }]
            : [];
        },
      },
      {
        id: "nest",
        text: "Destroy the shellback hatchery in the Peking's hold.",
        markers: () => {
          const a = PF.anchorOf("seaport", "nest");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Hatchery",
                  interior: "seaport",
                },
              ]
            : [];
        },
      },
      {
        id: "report",
        text: "Return to Lottie Brennan in the fish market.",
        markers: () => [{ npc: "pf_sp_lottie", label: "Lottie Brennan" }],
      },
    ],
    rewards: { xp: 400, scrip: 200, standing: 30 },
  });
  G.events.on("itemAdded", (id) => {
    if (id === "pf_reel_cal") {
      PF.setFlag("sp_cal", true);
      try {
        if (PF.live("quests") && G.quests.refresh) G.quests.refresh("pf_deep");
      } catch (e) {
        /* optional */
      }
    }
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
  PF.addBuilder(
    "seaport",
    function (PF2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PF.cell("seaport");
      const int = buildInterior(cell, ext);
      // doors: market (plaza) ↔ hall; dock (east) ↔ loading dock; Peking fore hatch ↔ fo'c'sle; aft companionway ↔ poop
      PF.door({
        id: "pf_sp_market_in",
        pos: V3(ext.market_door.x, 1.6, 713.3),
        label: "Fulton Fish Market",
        verb: "Enter",
        radius: 1.8,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_market_out",
        pos: V3(int.entrance.x, int.entrance.y + 1.6, int.entrance.z + 1.3),
        label: "Fulton Street",
        verb: "Exit",
        radius: 1.5,
        target: { x: ext.market_door.x, y: 0.05, z: ext.market_door.z, yaw: 0 },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_dock_in",
        pos: V3(232.4, 1.6, 724),
        label: "Fish Market Loading Dock",
        verb: "Enter",
        radius: 1.5,
        target: {
          x: int.dock.x + 0.2,
          y: int.dock.y + 0.05,
          z: int.dock.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_dock_out",
        pos: V3(int.dock.x + 1.3, int.dock.y + 1.4, int.dock.z - 0.8),
        label: "South Street",
        verb: "Exit",
        radius: 1.3,
        target: { x: ext.dock_door.x, y: 0.05, z: ext.dock_door.z, yaw: -HP },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_fore_in",
        pos: V3(313.7, PK.deck + 1.2, PK.zc),
        label: "Peking — Forecastle Hatch",
        verb: "Enter",
        radius: 1.2,
        target: {
          x: int.ship_entrance.x,
          y: int.ship_entrance.y + 0.05,
          z: int.ship_entrance.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_fore_out",
        pos: V3(
          int.ship_entrance.x + 5.4,
          int.ship_entrance.y + 1.3,
          int.ship_entrance.z - 0.8,
        ),
        label: "Peking — Main Deck",
        verb: "Climb to",
        radius: 1.2,
        target: {
          x: ext.fore_hatch.x,
          y: ext.fore_hatch.y + 0.05,
          z: ext.fore_hatch.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_aft_out",
        pos: V3(int.companion.x, int.companion.y + 1.3, int.companion.z),
        label: "Peking — Poop Deck",
        verb: "Climb to",
        radius: 1.2,
        target: {
          x: ext.aft_hatch.x,
          y: ext.aft_hatch.y + 0.05,
          z: ext.aft_hatch.z,
          yaw: -HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_aft_in",
        pos: V3(PK.x0 + 5.8, PK.deck + 1.8 + 1.0, PK.zc),
        label: "Peking — Captain's Saloon",
        verb: "Enter",
        radius: 1.2,
        target: {
          x: int.aft_arrive.x,
          y: int.aft_arrive.y + 0.05,
          z: int.aft_arrive.z,
          yaw: int.aft_arrive.yaw,
        },
        sound: "door_open",
      });

      const all = Object.assign({}, int, {
        exterior_entrance: ext.market_door,
        gangway: ext.gangway,
        peking_deck: ext.peking_deck,
        ambrose: ext.ambrose_gangway,
      });
      all.npc1 = int.lottie;
      all.merchant = int.lottie_stall;
      PF.register("seaport", root, all, {
        interiorRoot: cell.root,
        interiorKey: "seaport",
      });

      // the hatchery interaction (hold)
      PF.use({
        pos: V3(int.nest.x, int.nest.y + 0.8, int.nest.z),
        radius: 2.2,
        range: 3.4,
        label: "Shellback Hatchery",
        verb: () => (PF.flag("sp_nest") ? "Examine" : "Destroy"),
        onInteract() {
          if (PF.flag("sp_nest")) {
            G.notify(
              "Smashed shells and scorched mud. Nothing will hatch here again.",
            );
            return;
          }
          if (PF.live("dialogue") && G.dialogue.start)
            G.dialogue.start("pf_dlg_nest", null, {
              name: "Shellback Hatchery",
            });
          else destroyNest();
        },
      });
      // exterior egg clutches: harvest 2 eggs each (once per game)
      (ext.clutches || []).forEach((c, i) => {
        PF.use({
          pos: V3(c.x, c.y + 0.5, c.z),
          radius: 1.3,
          range: 2.8,
          label: "Shellback Egg Clutch",
          verb: () =>
            (PF.flag("sp_clutch") || []).indexOf(i) >= 0
              ? "Examine"
              : "Harvest",
          onInteract() {
            const got = (PF.flag("sp_clutch") || []).slice();
            if (got.indexOf(i) >= 0) {
              G.notify("Empty shells. Something already ate well here.");
              return;
            }
            got.push(i);
            PF.setFlag("sp_clutch", got);
            PF.inv.add("pf_shellback_egg", 2);
            PF.sfx("pickup");
            PF.sfx("shellback_click", V3(c.x, c.y, c.z), { volume: 0.7 });
          },
        });
      });
      // props & pickups
      PF.prop("safe", {
        x: int.captain_safe.x,
        y: int.captain_safe.y,
        z: int.captain_safe.z,
        yaw: HP,
        lock: SP_LOCKS.captain,
        items: [
          ["pf_old_salt", 1],
          ["ammo_12ga", 24],
          ["scrip", 180],
          ["gold_bar", 1],
        ],
        id: "pf_sp_captain_safe",
        name: "Captain's Safe",
      });
      PF.prop("footlocker", {
        x: int.berths.x - 3,
        y: 0 + int.berths.y,
        z: int.berths.z - 1.5,
        yaw: 0,
        loot: "footlocker",
        id: "pf_sp_seachest1",
        name: "Sea Chest",
      });
      PF.prop("footlocker", {
        x: int.fore.x + 1.5,
        y: int.fore.y,
        z: int.fore.z + 2.6,
        yaw: PI,
        loot: "footlocker",
        id: "pf_sp_seachest2",
        name: "Sea Chest",
      });
      PF.prop("crate", {
        x: int.hold_aft.x + 3,
        y: int.hold_aft.y,
        z: int.hold_aft.z - 3,
        kind: "plain",
        loot: "crate",
        id: "pf_sp_holdcrate",
      });
      PF.prop("ammo_box", {
        x: int.sail_locker.x + 2,
        y: int.sail_locker.y,
        z: int.sail_locker.z + 1.5,
        loot: "ammo_box",
        id: "pf_sp_ammo",
      });
      PF.prop("fridge", {
        x: int.cold_store.x - 1.5,
        y: int.cold_store.y,
        z: int.cold_store.z + 3.5,
        yaw: HP,
        loot: "cooler",
        id: "pf_sp_coldbox",
        name: "Walk-in Freezer Shelf",
      });
      PF.prop("cash_register", {
        x: int.market.x - 5,
        y: 1.05 + int.market.y,
        z: int.market.z - 4.5,
        yaw: PI,
        loot: "cash_register",
        id: "pf_sp_register",
      });
      PF.prop("footlocker", {
        x: int.dock.x - 1.5,
        y: int.dock.y,
        z: int.dock.z + 1.6,
        yaw: -HP,
        loot: "toolbox",
        id: "pf_sp_docktools",
        name: "Dock Toolbox",
      });
      PF.prop("footlocker", {
        x: ext.ambrose_locker.x,
        y: ext.ambrose_locker.y,
        z: ext.ambrose_locker.z,
        yaw: 0,
        loot: "ammo_box",
        id: "pf_sp_ambrose",
        name: "Lightship Locker",
      });
      PF.pickup("pf_reel_cal", 1, V3(int.cal.x, int.cal.y, int.cal.z));
      PF.pickup(
        "pf_note_captain",
        1,
        V3(int.captain_log.x, int.captain_log.y, int.captain_log.z),
      );
      PF.pickup(
        "pf_shellback_egg",
        2,
        V3(int.nest.x + 3.5, int.nest.y + 0.3, int.nest.z + 2.8),
      );
      PF.pickup(
        "rally_tonic",
        1,
        V3(int.cold_store.x + 1, int.cold_store.y + 0.05, int.cold_store.z - 3),
      );
      // NPCs: Lottie (friendly), the hatchery guardian + shellbacks aboard
      PF.npc({
        id: "pf_sp_lottie",
        type: "human",
        name: "Lottie Brennan",
        outfit: "survivor",
        gender: "f",
        faction: "settlers",
        level: 6,
        pos: { x: int.lottie.x, y: int.lottie.y, z: int.lottie.z },
        yaw: 0,
        ai: "guard",
        home: { x: int.lottie.x, z: int.lottie.z, r: 1.5 },
        dialogue: "pf_dlg_lottie",
        essential: true,
        voice: "settler",
        seed: 7101,
        weapon: "hunting_rifle",
        merchant: {
          scrip: 350,
          stock: [
            ["shellback_meat", 4],
            ["shellback_cakes", 3],
            ["ammo_12ga", 30],
            ["ammo_308", 20],
            ["scrap_metal", 6],
            ["purified_water", 4],
            ["rally_tonic", 1],
          ],
          restock: 3,
        },
        barks: [
          "Crabs don't knock. You knock. Good.",
          "Cal would've liked you.",
          "Mind the wet floor. And the dry floor. The floor in general.",
        ],
        after: (a) => {
          if (PF.flag("sp_market")) {
            const st = PF.anchorOf("seaport", "lottie_stall");
            if (st) {
              try {
                a.pos.set(st.x, st.y, st.z);
                a.home = { x: st.x, z: st.z, r: 2 };
              } catch (e) {
                /* ignore */
              }
            }
          }
        },
      });
      PF.npc({
        id: "pf_sp_barnacle",
        type: "shellback",
        name: "Old Barnacle",
        faction: "creatures",
        level: 11,
        pos: { x: int.boss.x, y: int.boss.y, z: int.boss.z },
        yaw: int.boss.yaw,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 6 },
        hp: 320,
        seed: 7102,
        xp: 120,
        after: (a) => {
          try {
            if (a.char && a.char.root) a.char.root.scale.setScalar(1.35);
          } catch (e) {
            /* cosmetic */
          }
        },
      });
      PF.npc({
        id: "pf_sp_lurk1",
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 6,
        pos: { x: int.spawn1.x, y: int.spawn1.y, z: int.spawn1.z },
        ai: "wander",
        home: { x: int.spawn1.x, z: int.spawn1.z, r: 6 },
        seed: 7103,
      });
      PF.npc({
        id: "pf_sp_lurk2",
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 6,
        pos: { x: int.spawn2.x, y: int.spawn2.y, z: int.spawn2.z },
        ai: "wander",
        home: { x: int.spawn2.x, z: int.spawn2.z, r: 5 },
        seed: 7104,
      });
      PF.npc({
        id: "pf_sp_lurk3",
        type: "shellback",
        name: "Softshell Shellback",
        faction: "creatures",
        level: 3,
        pos: { x: int.spawn3.x, y: int.spawn3.y, z: int.spawn3.z },
        ai: "wander",
        home: { x: int.spawn3.x, z: int.spawn3.z, r: 5 },
        seed: 7105,
      });
      // exterior: shellbacks on the Peking's deck and around the plaza nest
      PF.npc({
        id: "pf_sp_deck1",
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 5,
        pos: {
          x: ext.peking_deck.x + 5,
          y: ext.peking_deck.y,
          z: ext.peking_deck.z + 2.8,
        },
        ai: "wander",
        home: { x: ext.peking_deck.x + 5, z: ext.peking_deck.z + 2.8, r: 6 },
        seed: 7106,
      });
      PF.npc({
        id: "pf_sp_plaza1",
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 5,
        pos: { x: 214, y: 0, z: 705 },
        ai: "wander",
        home: { x: 214, z: 705, r: 10 },
        seed: 7107,
      });
    },
    40,
  );
})();
