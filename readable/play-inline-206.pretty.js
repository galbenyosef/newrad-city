/* src/poi_financial/20_fedreserve.js */
/* =====================================================================
 * NEW RAD CITY — POI FINANCIAL — FEDERAL RESERVE BANK OF NEW YORK
 * Exterior (site x 50..110, z 766..799): the Florentine-palazzo fortress on
 * Liberty Street — rusticated sandstone base with iron-grilled arched
 * windows, Yellin wrought-iron cage lanterns, small fortress windows,
 * arcaded loggia under a deep bracketed cornice; security turrets,
 * dead heist crews and a burnt armoured car at the gate.
 * Interior (INTERIORS.federal_reserve, lifted 30 m so the vault stays above
 * the cell's y=0 ground): banking hall with teller cages, security
 * checkpoint + security office, records room, elevator lobby, the vault
 * elevator five levels down, laser-grid checkpoint, barracks, vault control
 * room, the Vault Sentinel's antechamber, the ROTATING CYLINDER DOOR, the
 * gold vault (thousands of bars, 48 compartments) and the vault office;
 * the loop back up is the emergency egress stairwell (five sub-basements).
 * Quest "The Gold Standard" (Mortimer Vane at Fraunces Tavern).
 * Locks (G.locks): FED_LOCKS below; every key / code / passcode is placed
 * in this building (or, for the override card, also with Vane).
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

  const BX0 = 52,
    BX1 = 108,
    BZ0 = 768,
    BZ1 = 797; // building footprint
  const H_BASE = 12,
    H_SHAFT = 34,
    H_LOG = 39.5,
    H_TOP = 41.6;
  const BASE = 30; // interior lift (see header)
  const VY = -25; // vault level (local)

  Object.assign(PF.flagDefaults, {
    fed_power: false, // vault elevator powered
    fed_gate: false, // ground checkpoint gate open
    fed_grid: true, // laser grid active
    fed_turrets: true, // security turrets active
    fed_alarm: false, // alarm tripped (robots alerted)
    fed_vault: false, // cylinder door open
    fed_warden_off: false, // Vault Sentinel in maintenance mode
    fed_egress: false, // egress door unbolted (ground side)
    fed_ledger: false, // ledger picked up
    fed_turrets_off: false, // turrets switched off at the security terminal
    fed_warden_dead: false,
  });

  // ---- locks: keys, codes and passcodes (the unlock for each is placed in this building) ----
  const FED_LOCKS = (PF.fedLocks = {
    gate: PF.regLock({
      id: "pf_lk_fed_gate",
      label: "Checkpoint Gate",
      code: "5107",
      kind: "gate",
      hint: "Card taped inside the guard booth window (security office side) — or raise it from the security terminal.",
    }),
    records: PF.regLock({
      id: "pf_lk_fed_records",
      label: "Records Room",
      code: "3906",
      kind: "door",
      hint: "The Chief of Security's memo on the security office desk.",
    }),
    security: PF.regLock({
      id: "pf_lk_fed_security",
      label: "Ground Security Teletype",
      key: "pf_fed_keycard",
      kind: "terminal",
      hint: "The Chief of Security's keycard, by his remains in the records room.",
    }),
    vault: PF.regLock({
      id: "pf_lk_fed_vault_term",
      label: "Level V Vault Control Teletype",
      key: "pf_fed_override",
      kind: "terminal",
      hint: "The override card: the Sergeant's safe in the Level V barracks, or Mortimer Vane.",
    }),
    barracks: PF.regLock({
      id: "pf_lk_fed_barracks_safe",
      label: "Sergeant's Safe",
      code: "8112",
      kind: "safe",
      hint: "The gin rummy scoreboard on the barracks wall.",
    }),
    office: PF.regLock({
      id: "pf_lk_fed_office_term",
      label: "Vault Manager's Teletype",
      passcode: "NANETTE",
      kind: "terminal",
      hint: "The Vault Manager's note on his desk.",
    }),
    officeSafe: PF.regLock({
      id: "pf_lk_fed_office_safe",
      label: "Vault Manager's Safe",
      code: "0915",
      kind: "safe",
      hint: "The Vault Manager's personal log on his teletype.",
    }),
  });
  PF.keyFrom(
    "pf_fed_override",
    "Sergeant's Safe (Level V barracks); Mortimer Vane (Fraunces Tavern)",
  );
  PF.keyFrom("pf_fed_reserve_key", "Vault Manager's Safe (Level V office)");

  /** Round (semicircular) arch shape w × h (springs at h - w/2). */
  function roundShape(w, h) {
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
  /** Round-arched opening on a wall face: dark glass/void, voussoirs, keystone, optional grille. */
  function archWindow(b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    b.add(opts.glass || "glass_dark", PF.shapeGeo(roundShape(w, h), 12), {
      m: PF.m4(x + s * 0.01, y, z + c * 0.01, ry),
      uv: "keep",
      grime: 0.1,
      noAO: true,
    });
    const r = w / 2,
      sp = h - r,
      vk = opts.frame || "fed_stone";
    const N = 9;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * PI,
        a1 = ((i + 1) / N) * PI,
        am = (a0 + a1) / 2,
        rr = r + 0.3;
      const p = P(Math.cos(am) * rr, sp + Math.sin(am) * rr, 0.12);
      b.box(
        i === N >> 1 ? "fed_rust" : vk,
        p.x,
        p.y - 0.28,
        p.z,
        rr * (a1 - a0) + 0.02,
        i === N >> 1 ? 0.8 : 0.62,
        0.3,
        { ry, rz: am - HP, seg: false, grime: 0.5 },
      );
    }
    for (const sg of [-1, 1]) {
      const p = P(sg * (r + 0.25), 0, 0.1);
      b.box(vk, p.x, y, p.z, 0.45, sp, 0.3, { ry, seg: false, grime: 0.5 });
    }
    const sl = P(0, -0.2, 0.2);
    b.box(vk, sl.x, y - 0.25, sl.z, w + 0.9, 0.25, 0.5, { ry, seg: false });
    if (opts.grille) {
      const n = Math.max(3, Math.round(w / 0.28));
      for (let i = 1; i < n; i++) {
        const lx = -r + (i * w) / n;
        const top = sp + Math.sqrt(Math.max(0, r * r - lx * lx));
        const a = P(lx, 0, 0.16),
          bb = P(lx, top - 0.05, 0.16);
        b.beam("iron", a, bb, 0.05, 0.05, { grime: 0.3 });
      }
      for (const yy of [h * 0.3, h * 0.6]) {
        const a = P(-r, yy, 0.17),
          bb = P(r, yy, 0.17);
        b.beam("iron", a, bb, 0.045, 0.06, {});
      }
      if (opts.scroll) {
        const cc = P(0, sp, 0.18);
        b.add("iron", new THREE.TorusGeometry(r * 0.55, 0.035, 4, 16, PI), {
          m: PF.m4(cc.x, cc.y, cc.z, ry),
        });
      }
    }
  }
  /** Samuel Yellin-style wrought-iron cage lantern on a scrolled bracket. */
  function yellinLantern(b, x, y, z, ry, lit, parent) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    // bracket: horizontal arm + scrolled brace + curl
    b.beam("iron", P(0, 0.6, 0), P(0, 0.6, 1.25), 0.1, 0.1, {});
    b.beam("iron", P(0, -0.6, 0), P(0, 0.55, 1.0), 0.07, 0.07, {});
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const p = P(0, 0.2 + Math.sin(a) * 0.18, 0.55 + Math.cos(a) * 0.18);
      b.box("iron", p.x, p.y, p.z, 0.04, 0.06, 0.06, { ry, seg: false });
    }
    const cx = P(0, 0, 1.3);
    b.cyl("iron", cx.x, cx.y + 0.5, cx.z, 0.06, 0.06, 0.12, 6, { hSeg: 1 });
    // cage: octagonal crown, bars, bowl
    b.cyl("iron", cx.x, cx.y - 0.95, cx.z, 0.34, 0.12, 0.3, 8, { hSeg: 1 });
    b.cyl("iron", cx.x, cx.y + 0.15, cx.z, 0.08, 0.42, 0.35, 8, { hSeg: 1 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      b.beam(
        "iron",
        V3(cx.x + Math.cos(a) * 0.36, cx.y - 0.66, cx.z + Math.sin(a) * 0.36),
        V3(cx.x + Math.cos(a) * 0.4, cx.y + 0.15, cx.z + Math.sin(a) * 0.4),
        0.03,
        0.03,
        {},
      );
    }
    for (const yy of [-0.66, -0.25, 0.15])
      b.add("iron", new THREE.TorusGeometry(0.39, 0.025, 3, 8), {
        m: PF.m4(cx.x, cx.y + yy, cx.z, 0, HP),
      });
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * TAU;
      b.cyl(
        "iron",
        cx.x + Math.cos(a) * 0.42,
        cx.y + 0.5,
        cx.z + Math.sin(a) * 0.42,
        0.001,
        0.05,
        0.3,
        4,
        { hSeg: 1 },
      );
    }
    b.cyl(
      lit ? "lamp_warm" : "glass_broken",
      cx.x,
      cx.y - 0.62,
      cx.z,
      0.3,
      0.3,
      0.72,
      8,
      { hSeg: 1, noAO: true, grime: 0 },
    );
    if (lit)
      PF.glow(V3(cx.x, cx.y - 0.25, cx.z), 0xffb860, 2.2, parent || null, {
        intensity: 1.3,
        flicker: 0.35,
      });
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function buildExterior(site, root) {
    const b = PF.batch("fed_ext");
    b.ground = 0;
    b.aoH = 5;
    const r = PF.rng("fedreserve");
    const anchors = {};
    const CXm = (BX0 + BX1) / 2;
    // paving apron
    b.boxMM("granite", site.x0, -0.1, site.z0, site.x1, 0.06, site.z1, {
      grime: 0.55,
      segLen: 5,
    });
    // plinth + rusticated base
    b.boxMM(
      "granite_dark",
      BX0 - 0.35,
      0,
      BZ0 - 0.35,
      BX1 + 0.35,
      0.9,
      BZ1 + 0.35,
      { grime: 0.6 },
    );
    K.prismBands(
      b,
      "fed_rust",
      [
        [BX0, BZ0],
        [BX1, BZ0],
        [BX1, BZ1],
        [BX0, BZ1],
      ],
      0.9,
      H_BASE,
      5.6,
      { grime: 0.55 },
    );
    // rustication bands (deep horizontal joints read as shadow lines)
    for (let y = 1.8; y < H_BASE; y += 1.2) {
      for (const [x0, z0, x1, z1] of [
        [BX0 - 0.12, BZ0 - 0.12, BX1 + 0.12, BZ0],
        [BX0 - 0.12, BZ1, BX1 + 0.12, BZ1 + 0.12],
        [BX0 - 0.12, BZ0, BX0, BZ1],
        [BX1, BZ0, BX1 + 0.12, BZ1],
      ]) {
        b.boxMM("fed_rust", x0, y, z0, x1, y + 0.95, z1, {
          grime: 0.5,
          segLen: 8,
        });
      }
    }
    // upper walls (smooth sandstone) and quoins
    K.prismBands(
      b,
      "fed_stone",
      [
        [BX0 + 0.4, BZ0 + 0.4],
        [BX1 - 0.4, BZ0 + 0.4],
        [BX1 - 0.4, BZ1 - 0.4],
        [BX0 + 0.4, BZ1 - 0.4],
      ],
      H_BASE,
      H_SHAFT,
      5.5,
      { grime: 0.5 },
    );
    b.boxMM(
      "fed_rust",
      BX0 - 0.2,
      H_BASE - 0.1,
      BZ0 - 0.2,
      BX1 + 0.2,
      H_BASE + 0.7,
      BZ1 + 0.2,
      { grime: 0.4 },
    ); // belt course
    for (const [qx, qz] of [
      [BX0 + 0.4, BZ0 + 0.4],
      [BX1 - 0.4, BZ0 + 0.4],
      [BX1 - 0.4, BZ1 - 0.4],
      [BX0 + 0.4, BZ1 - 0.4],
    ]) {
      for (let y = H_BASE + 0.7, k = 0; y < H_SHAFT - 0.5; y += 1.4, k++) {
        const long = k % 2 === 0;
        const sx = qx < CXm ? 1 : -1,
          sz = qz < 782 ? 1 : -1;
        b.box(
          "fed_rust",
          qx + sx * (long ? 0.9 : 0.55) - sx * 0.05,
          y,
          qz - sz * 0.12,
          long ? 1.9 : 1.2,
          1.25,
          0.34,
          { seg: false, grime: 0.5 },
        );
        b.box(
          "fed_rust",
          qx - sx * 0.12,
          y,
          qz + sz * (long ? 0.55 : 0.9) - sz * 0.05,
          0.34,
          1.25,
          long ? 1.2 : 1.9,
          { seg: false, grime: 0.5 },
        );
      }
    }
    PF.colMM(BX0 - 0.4, 0, BZ0 - 0.4, BX1 + 0.4, H_TOP, BZ1 + 0.4, {
      walkable: false,
    });

    // ground-floor arched windows with iron grilles (all four faces), the entrance bay on Liberty Street (north)
    const faces = [
      { ax: "x", fixed: BZ0 - 0.13, ry: PI, a0: BX0, a1: BX1 }, // north (Liberty St)
      { ax: "x", fixed: BZ1 + 0.13, ry: 0, a0: BX0, a1: BX1 }, // south (Maiden Lane)
      { ax: "z", fixed: BX0 - 0.13, ry: -HP, a0: BZ0, a1: BZ1 }, // west (Nassau)
      { ax: "z", fixed: BX1 + 0.13, ry: HP, a0: BZ0, a1: BZ1 }, // east (William)
    ];
    for (const f of faces) {
      const len = f.a1 - f.a0,
        n = Math.floor(len / 6.2);
      const start = f.a0 + (len - (n - 1) * 6.2) / 2;
      for (let i = 0; i < n; i++) {
        const a = start + i * 6.2;
        if (f.ry === PI && Math.abs(a - CXm) < 4) continue; // entrance bay
        const x = f.ax === "x" ? a : f.fixed,
          z = f.ax === "x" ? f.fixed : a;
        archWindow(b, x, 2.2, z, f.ry, 2.3, 5.6, {
          grille: true,
          scroll: true,
          glass: r() < 0.2 ? "glass_broken" : "glass_dark",
        });
        // small mezzanine window above
        const c = Math.cos(f.ry),
          s = Math.sin(f.ry);
        b.quad("glass_dark", x + s * 0.02, 9.6, z + c * 0.02, 1.1, 1.3, {
          ry: f.ry,
          noAO: true,
        });
        for (let k = 1; k < 4; k++)
          b.box(
            "iron",
            x + s * 0.1 + c * (-0.55 + k * 0.275),
            8.95,
            z + c * 0.1 - s * (-0.55 + k * 0.275),
            0.04,
            1.3,
            0.04,
            { seg: false },
          );
      }
    }
    // upper windows: small, deep-set, in a disciplined grid (fortress-like)
    K.polyWindows(
      b,
      [
        [BX0 + 0.4, BZ0 + 0.4],
        [BX1 - 0.4, BZ0 + 0.4],
        [BX1 - 0.4, BZ1 - 0.4],
        [BX0 + 0.4, BZ1 - 0.4],
      ],
      {
        y0: H_BASE + 2.0,
        floors: 7,
        floorH: 3.0,
        w: 1.15,
        h: 1.6,
        spacing: 3.1,
        inset: 0.03,
        frameKey: "fed_rust",
        sill: true,
        lintel: true,
        broken: 0.22,
        boarded: 0.04,
        seed: 77,
        margin: 2.4,
      },
    );
    // blast damage: blown-out window cluster + scorch on the east face
    for (let i = 0; i < 5; i++)
      b.quad(
        "glass_broken",
        BX1 - 0.25 + 0.02,
        22 + r() * 8,
        776 + r() * 8,
        1.6 + r(),
        1.8 + r(),
        { ry: HP, noAO: true },
      );
    b.rock("rubble", BX1 + 1.2, 0, 779, 1.4, { flat: 0.5 });
    b.rock("rubble", BX1 + 0.8, 0, 783, 1.0, { flat: 0.5 });
    // LOGGIA: recessed arcade on columns under the cornice
    b.boxMM(
      "fed_stone",
      BX0 + 1.6,
      H_SHAFT,
      BZ0 + 1.6,
      BX1 - 1.6,
      H_LOG,
      BZ1 - 1.6,
      { grime: 0.4 },
    ); // recessed wall
    b.boxMM(
      "shadow" in PF.MAT_DEFS ? "shadow" : "glass_dark",
      BX0 + 1.58,
      H_SHAFT + 0.3,
      BZ0 + 1.58,
      BX1 - 1.58,
      H_LOG - 0.8,
      BZ1 - 1.58,
      { seg: false, noAO: true },
    );
    b.boxMM(
      "fed_rust",
      BX0 - 0.1,
      H_SHAFT - 0.4,
      BZ0 - 0.1,
      BX1 + 0.1,
      H_SHAFT + 0.25,
      BZ1 + 0.1,
      { grime: 0.4 },
    ); // loggia floor slab / string
    for (const f of faces) {
      const len = f.a1 - f.a0,
        n = Math.floor((len - 1) / 3.0);
      const start = f.a0 + (len - n * 3.0) / 2;
      const c = Math.cos(f.ry),
        s = Math.sin(f.ry);
      for (let i = 0; i <= n; i++) {
        const a = start + i * 3.0;
        const x = f.ax === "x" ? a : f.fixed - s * 0.6,
          z = f.ax === "x" ? f.fixed - c * 0.6 : a;
        b.cyl("fed_stone", x, H_SHAFT + 0.25, z, 0.22, 0.26, 3.4, 10, {
          hSeg: 1,
        });
        b.box("fed_stone", x, H_SHAFT + 3.65, z, 0.7, 0.3, 0.7, { seg: false });
        if (i < n) {
          const mx = f.ax === "x" ? a + 1.5 : x,
            mz = f.ax === "x" ? z : a + 1.5;
          const arch = new THREE.Shape();
          arch.moveTo(-1.5, 0);
          arch.lineTo(1.5, 0);
          arch.lineTo(1.5, 1.6);
          arch.lineTo(-1.5, 1.6);
          arch.closePath();
          const hole = new THREE.Path();
          hole.moveTo(-1.28, 0);
          hole.lineTo(1.28, 0);
          hole.lineTo(1.28, 0.2);
          hole.absarc(0, 0.2, 1.28, 0, PI, false);
          hole.lineTo(-1.28, 0);
          arch.holes.push(hole);
          const g = new THREE.ExtrudeGeometry(arch, {
            depth: 0.5,
            bevelEnabled: false,
          });
          g.translate(0, 0, -0.25);
          b.add("fed_stone", g, {
            m: PF.m4(mx, H_SHAFT + 3.95, mz, f.ry),
            grime: 0.4,
          });
        }
      }
    }
    // deep bracketed cornice
    b.boxMM(
      "fed_stone",
      BX0 - 1.6,
      H_LOG,
      BZ0 - 1.6,
      BX1 + 1.6,
      H_LOG + 0.5,
      BZ1 + 1.6,
      { grime: 0.45 },
    );
    b.boxMM(
      "fed_stone",
      BX0 - 1.9,
      H_LOG + 0.5,
      BZ0 - 1.9,
      BX1 + 1.9,
      H_LOG + 1.2,
      BZ1 + 1.9,
      { grime: 0.45 },
    );
    b.boxMM(
      "tar",
      BX0 - 1.5,
      H_LOG + 1.2,
      BZ0 - 1.5,
      BX1 + 1.5,
      H_TOP + 0.1,
      BZ1 + 1.5,
      { grime: 0.5 },
    );
    for (const f of faces) {
      const len = f.a1 - f.a0,
        n = Math.floor(len / 1.2);
      const c = Math.cos(f.ry),
        s = Math.sin(f.ry);
      for (let i = 0; i <= n; i++) {
        if (r() < 0.05) continue; // missing brackets
        const a = f.a0 + (i * len) / n;
        const x = f.ax === "x" ? a : f.fixed + s * 0.8,
          z = f.ax === "x" ? f.fixed + c * 0.8 : a;
        b.box(
          "fed_stone",
          x,
          H_LOG - 0.8,
          z,
          f.ax === "x" ? 0.3 : 1.6,
          0.85,
          f.ax === "x" ? 1.6 : 0.3,
          { seg: false, grime: 0.35 },
        );
      }
    }
    // a bitten-off corner of the cornice (shell hit)
    b.rock("fed_stone", BX1 + 1, H_LOG + 0.4, BZ0 - 1, 1.2, { flat: 0.7 });
    // roof clutter: water tank, antenna mast with a red beacon, AC housings, collapsed skylight
    b.cyl("rotten", BX0 + 8, H_TOP, BZ0 + 8, 2.2, 2.2, 3.4, 14, { hSeg: 2 });
    b.cyl("rotten", BX0 + 8, H_TOP + 3.4, BZ0 + 8, 0.2, 2.4, 1.2, 14, {
      hSeg: 1,
    });
    for (const [dx, dz] of [
      [-1.5, -1.5],
      [1.5, -1.5],
      [-1.5, 1.5],
      [1.5, 1.5],
    ])
      b.box("rust", BX0 + 8 + dx, H_TOP - 0.1, BZ0 + 8 + dz, 0.2, 0.2, 0.2, {
        seg: false,
      });
    b.cyl("iron", BX1 - 10, H_TOP, BZ1 - 8, 0.08, 0.2, 9, 5, { hSeg: 2 });
    b.sphere("lamp_red", BX1 - 10, H_TOP + 9.1, BZ1 - 8, 0.18, {
      ws: 6,
      hs: 4,
    });
    PF.glow(V3(BX1 - 10, H_TOP + 9.1, BZ1 - 8), 0xff3020, 1.4, null, {
      intensity: 1.4,
      flicker: 0.6,
    });
    for (let i = 0; i < 4; i++)
      b.box("panel", BX0 + 20 + i * 5, H_TOP, BZ1 - 6, 2.4, 1.6, 1.8, {
        seg: false,
      });

    // ---- the Liberty Street entrance ----------------------------------
    const ex = CXm,
      ez = BZ0 - 0.13;
    // portal block: a real 1.1 m deep round-arched RECESS (U-shaped extrusion), so the entrance reads as a doorway
    // from down the street instead of a flat black arch
    {
      const AW = 2.2,
        SP = 5.0; // half-width of the opening, springing height
      const sh = new THREE.Shape();
      sh.moveTo(-4.4, 0);
      sh.lineTo(-AW, 0);
      sh.lineTo(-AW, SP);
      sh.absarc(0, SP, AW, PI, 0, true);
      sh.lineTo(AW, 0);
      sh.lineTo(4.4, 0);
      sh.lineTo(4.4, 10.5);
      sh.lineTo(-4.4, 10.5);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 1.1,
        bevelEnabled: false,
        curveSegments: 14,
      });
      b.add("fed_rust", g, { m: PF.m4(ex, 0, ez - 0.9, 0), grime: 0.5 });
      PF.colMM(ex - 4.4, 0, ez - 0.9, ex - AW, 10.5, ez + 0.2, {
        walkable: false,
      });
      PF.colMM(ex + AW, 0, ez - 0.9, ex + 4.4, 10.5, ez + 0.2, {
        walkable: false,
      });
      // granite threshold + worn step in the recess
      b.boxMM("granite_dark", ex - AW, 0, ez - 0.9, ex + AW, 0.14, ez + 0.05, {
        grime: 0.7,
      });
      // fanlight: dark glazing above the transom, radial iron grille, bronze transom bar
      const fan = new THREE.Shape();
      fan.moveTo(-AW, 4.45);
      fan.lineTo(AW, 4.45);
      fan.lineTo(AW, SP);
      fan.absarc(0, SP, AW, 0, PI, false);
      fan.lineTo(-AW, 4.45);
      b.add("glass_dark", PF.shapeGeo(fan, 14), {
        m: PF.m4(ex, 0, ez - 0.02, PI),
        uv: "keep",
        noAO: true,
      });
      b.boxMM("bronze", ex - AW, 4.35, ez - 0.2, ex + AW, 4.6, ez, {
        seg: false,
        grime: 0.5,
      });
      for (let i = 0; i <= 8; i++) {
        const a = (i / 8) * PI;
        b.beam(
          "iron",
          V3(ex + Math.cos(a) * 0.35, SP + Math.sin(a) * 0.35, ez - 0.08),
          V3(ex + Math.cos(a) * AW, SP + Math.sin(a) * AW, ez - 0.08),
          0.045,
          0.045,
          {},
        );
        if (i < 8) {
          const a2 = ((i + 1) / 8) * PI;
          b.beam(
            "iron",
            V3(ex + Math.cos(a) * 1.2, SP + Math.sin(a) * 1.2, ez - 0.08),
            V3(ex + Math.cos(a2) * 1.2, SP + Math.sin(a2) * 1.2, ez - 0.08),
            0.04,
            0.04,
            {},
          );
        }
      }
      for (const x of [-1.4, -0.7, 0, 0.7, 1.4])
        b.beam(
          "iron",
          V3(ex + x, 4.6, ez - 0.08),
          V3(ex + x, SP, ez - 0.08),
          0.04,
          0.04,
          {},
        );
      b.cyl("bronze", ex, SP - 0.05, ez - 0.1, 0.35, 0.35, 0.12, 12, {
        hSeg: 1,
        rx: HP,
      });
      // the lit vestibule seen through the gap of the forced leaf (painted interior card: warm lamp, marble floor,
      // the silhouette of the revolving drum) — the one warm light on a dead facade says "the way in is here"
      const vestK = PF.texMat(
        "fed_vest_card",
        PF.canvasTex(
          "pf_fed_vest_card",
          256,
          512,
          (ctx, w, h) => {
            ctx.fillStyle = "#120d08";
            ctx.fillRect(0, 0, w, h);
            const gl = ctx.createRadialGradient(
              w * 0.5,
              h * 0.42,
              10,
              w * 0.5,
              h * 0.5,
              h * 0.55,
            );
            gl.addColorStop(0, "rgba(255,196,120,0.95)");
            gl.addColorStop(0.35, "rgba(160,104,52,0.75)");
            gl.addColorStop(1, "rgba(20,14,8,0)");
            ctx.fillStyle = gl;
            ctx.fillRect(0, 0, w, h);
            // marble floor in perspective
            ctx.fillStyle = "#6a5a44";
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(w, h);
            ctx.lineTo(w * 0.72, h * 0.66);
            ctx.lineTo(w * 0.28, h * 0.66);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(30,22,14,0.8)";
            ctx.lineWidth = 2;
            for (let i = 0; i <= 6; i++) {
              const t = i / 6;
              ctx.beginPath();
              ctx.moveTo(w * t, h);
              ctx.lineTo(w * (0.28 + 0.44 * t), h * 0.66);
              ctx.stroke();
            }
            for (const t of [0.72, 0.8, 0.9]) {
              ctx.beginPath();
              ctx.moveTo(0, h * t + (1 - t) * 0);
              ctx.lineTo(w, h * t);
              ctx.stroke();
            }
            // side walls
            ctx.fillStyle = "rgba(40,30,20,0.85)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(w * 0.28, h * 0.2);
            ctx.lineTo(w * 0.28, h * 0.66);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(w, 0);
            ctx.lineTo(w * 0.72, h * 0.2);
            ctx.lineTo(w * 0.72, h * 0.66);
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();
            // revolving drum silhouette + hanging lamp
            ctx.fillStyle = "rgba(18,12,8,0.9)";
            ctx.fillRect(w * 0.36, h * 0.3, w * 0.28, h * 0.03);
            ctx.fillRect(w * 0.36, h * 0.62, w * 0.28, h * 0.03);
            for (const x of [0.37, 0.5, 0.62])
              ctx.fillRect(w * x, h * 0.3, 5, h * 0.34);
            ctx.fillRect(w * 0.5 - 1, 0, 2, h * 0.16);
            ctx.fillStyle = "#ffe0a0";
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.18, 9, 0, TAU);
            ctx.fill();
          },
          { clamp: true },
        ),
        { emissive: 0.85, rough: 0.9 },
      );
      b.quad(vestK, ex + 1.12, 0.14 + 4.25 / 2, ez - 0.015, 2.1, 4.25, {
        ry: PI,
        noAO: true,
      });
      // bronze double doors: the west leaf shut, the east leaf forced and hanging open onto the street
      const leaf = (hx, dir, ang) => {
        const M = PF.m4(hx, 0.14, ez - 0.1, ang);
        const add = (key, gw, gh, gd, lx, ly, lz, o) =>
          b.add(
            key,
            new THREE.BoxGeometry(gw, gh, gd),
            Object.assign(
              { m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(lx, ly, lz)) },
              o || {},
            ),
          );
        const cx = dir * 1.07;
        add("bronze", 2.12, 4.2, 0.12, cx, 2.1, 0, { grime: 0.6 });
        for (const [py, ph] of [
          [0.95, 1.3],
          [2.45, 1.3],
          [3.65, 0.7],
        ])
          add("bronze", 1.55, ph, 0.05, cx, py, -0.08, { grime: 0.45 });
        for (const [py, ph] of [
          [0.95, 1.3],
          [2.45, 1.3],
        ])
          add("gilt", 1.25, ph - 0.3, 0.02, cx, py, -0.11, { grime: 0.7 });
        add("bronze", 0.08, 0.5, 0.08, dir * 1.95, 2.0, -0.14); // pull bar
      };
      leaf(ex - AW + 0.05, 1, 0); // west leaf, closed
      leaf(ex + AW - 0.05, -1, -0.38); // east leaf, swung out ~22 degrees
      PF.glow(V3(ex + 1.1, 1.6, ez - 0.25), 0xffb060, 2.2, null, {
        intensity: 0.9,
        flicker: 0.1,
      });
    }
    for (let i = 0; i < 11; i++) {
      // voussoirs
      const a = ((i + 0.5) / 11) * PI,
        rr = 2.2 + 0.55;
      b.box(
        i === 5 ? "fed_stone" : "fed_rust",
        ex + Math.cos(a) * rr,
        5.0 + Math.sin(a) * rr - 0.4,
        ez - 1.0,
        0.85,
        i === 5 ? 1.2 : 0.8,
        0.35,
        { rz: a - HP, seg: false, grime: 0.4 },
      );
    }
    // massive iron gates, one leaf hanging open
    const gate = (x0, ry) => {
      const M = PF.m4(x0, 0, ez - 1.2, ry);
      for (let i = 0; i < 9; i++)
        b.add("iron", new THREE.BoxGeometry(0.06, 5.2, 0.06), {
          m: new THREE.Matrix4().multiplyMatrices(
            M,
            PF.m4(0.12 + i * 0.24, 2.6, 0),
          ),
        });
      for (const y of [0.3, 2.0, 3.6, 5.1])
        b.add("iron", new THREE.BoxGeometry(2.2, 0.1, 0.08), {
          m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(1.1, y, 0)),
        });
      for (let i = 0; i < 4; i++)
        b.add("iron", new THREE.TorusGeometry(0.22, 0.03, 4, 12), {
          m: new THREE.Matrix4().multiplyMatrices(
            M,
            PF.m4(0.35 + i * 0.5, 2.8, 0),
          ),
        });
    };
    gate(ex - 2.2, 0.0);
    gate(ex + 2.2, PI - 1.1);
    PF.colMM(ex - 2.2, 0, ez - 1.25, ex - 0.1, 5.3, ez - 1.1, {
      walkable: false,
    });
    // engraved name band + seal
    const nameK = PF.texMat(
      "fed_name",
      PF.signTex(
        "fed_name",
        ["FEDERAL RESERVE BANK OF NEW YORK"],
        "engraved",
        1024,
        96,
        { bg: "#b8a888", fg: "#3a3020" },
      ),
    );
    b.quad(nameK, ex, 11.3, BZ0 - 0.24, 16, 1.2, { ry: PI });
    const sealK = PF.texMat(
      "fed_seal",
      PF.canvasTex(
        "pf_fed_seal",
        256,
        256,
        (ctx, w) => {
          ctx.fillStyle = "#6a6250";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 2, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#2a261c";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 14, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#3a3428";
          ctx.font = "bold 20px Georgia";
          ctx.textAlign = "center";
          const t = "FEDERAL RESERVE SYSTEM ★ NEW YORK ★ ";
          for (let i = 0; i < t.length; i++) {
            const a = (i / t.length) * TAU - HP;
            ctx.save();
            ctx.translate(
              w / 2 + Math.cos(a) * (w / 2 - 34),
              w / 2 + Math.sin(a) * (w / 2 - 34),
            );
            ctx.rotate(a + HP);
            ctx.fillText(t[i], 0, 6);
            ctx.restore();
          }
          // eagle (stylised)
          ctx.fillStyle = "#2a261c";
          ctx.beginPath();
          ctx.moveTo(w / 2, w * 0.3);
          ctx.lineTo(w * 0.72, w * 0.46);
          ctx.lineTo(w * 0.62, w * 0.5);
          ctx.lineTo(w * 0.56, w * 0.7);
          ctx.lineTo(w / 2, w * 0.64);
          ctx.lineTo(w * 0.44, w * 0.7);
          ctx.lineTo(w * 0.38, w * 0.5);
          ctx.lineTo(w * 0.28, w * 0.46);
          ctx.closePath();
          ctx.fill();
        },
        { clamp: true },
      ),
      { rough: 0.6 },
    );
    b.add(sealK, new THREE.CircleGeometry(1.2, 24), {
      m: PF.m4(ex, 8.9, ez - 1.03, PI),
      uv: "keep",
      noAO: true,
    });
    // Yellin lanterns: flanking the entrance, and at the building corners
    yellinLantern(b, ex - 4.2, 5.0, ez - 0.9, PI, true, null);
    yellinLantern(b, ex + 4.2, 5.0, ez - 0.9, PI, false, null);
    for (const [x, z, ry] of [
      [BX0 + 1.2, BZ0 - 0.1, PI],
      [BX1 - 1.2, BZ0 - 0.1, PI],
      [BX0 + 1.2, BZ1 + 0.1, 0],
      [BX1 - 1.2, BZ1 + 0.1, 0],
    ])
      yellinLantern(b, x, 6.2, z, ry, false, null);
    // security post: sandbag emplacements, concertina wire, warning signs, the dead heist crew
    PF.sandbags(b, ex - 7.5, BZ0 - 3.6, ex - 4.8, BZ0 - 3.6, 4, {});
    PF.sandbags(b, ex + 4.8, BZ0 - 3.6, ex + 7.5, BZ0 - 3.6, 4, {});
    for (let i = 0; i < 16; i++) {
      const x = site.x0 + 1 + i * 1.3;
      b.add("iron", new THREE.TorusGeometry(0.4, 0.015, 3, 10), {
        m: PF.m4(x, 0.42, site.z0 + 0.6, HP + 0.2 * Math.sin(i)),
        noAO: true,
      });
    }
    const warnK = PF.texMat(
      "fed_warn",
      PF.signTex(
        "fed_warn",
        ["WARNING", "FEDERAL PROPERTY", "LETHAL FORCE AUTHORIZED"],
        "enamel",
        512,
        320,
        { bg: "#b8a028", fg: "#1a1a14" },
      ),
    );
    for (const x of [ex - 9.5, ex + 9.5]) {
      b.box("iron", x, 0, BZ0 - 2.4, 0.08, 1.4, 0.08, { seg: false });
      b.quad(warnK, x, 1.8, BZ0 - 2.45, 1.4, 0.88, { ry: PI });
    }
    for (const [x, z, a] of [
      [ex - 2.8, BZ0 - 5.2, 0.4],
      [ex + 1.5, BZ0 - 6.4, 2.1],
      [ex + 6.3, BZ0 - 1.5, -0.8],
      [ex - 6.8, BZ0 - 1.4, 1.2],
    ])
      PF.skeleton(b, x, 0.07, z, a);
    D.papers(b, ex, 0.07, BZ0 - 4, 5, 26, 404); // scattered bank notes
    D.rubble(b, BX0 + 2, 0, BZ1 + 1.2, 1.0, 6, 41);
    anchors.entrance = PF.anchor(ex, 0, BZ0 - 3.0, 0); // on the Liberty St sidewalk, facing away from the portal
    anchors.turret1 = PF.anchor(ex - 6.2, 1.2, BZ0 - 3.0, PI);
    anchors.turret2 = PF.anchor(ex + 6.2, 1.2, BZ0 - 3.0, PI);
    anchors.armored_car = PF.anchor(ex - 14, 0, site.z0 - 1.6, HP);
    b.build(root);
    return anchors;
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
    const r = PF.rng("fed_int");
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
    const floor = (key, x0, z0, x1, z1, y, t, o) => {
      b.boxMM(
        key,
        X(x0),
        oy + y - (t || 0.5),
        Z(z0),
        X(x1),
        oy + y,
        Z(z1),
        o || { grime: 0.5 },
      );
      PF.colMM(X(x0), oy + y - (t || 0.5), Z(z0), X(x1), oy + y, Z(z1));
    };
    const ceil = (key, x0, z0, x1, z1, y, o) =>
      b.boxMM(
        key,
        X(x0),
        oy + y,
        Z(z0),
        X(x1),
        oy + y + 0.4,
        Z(z1),
        o || { seg: false, grime: 0.3 },
      );

    // ---------------- lights ----------------
    const L = [];
    // banking hall: soft coffer bounce (high, wide), the two chandeliers still on emergency power, grey daylight
    // falling through the clerestory lunettes on both side walls, and a warm pool in the vestibule.
    for (let x = -12; x <= 12; x += 8)
      for (let z = 2; z <= 18; z += 8)
        L.push({
          x: X(x),
          y: oy + 9.5,
          z: Z(z),
          color: 0xffe8c0,
          r: 17,
          i: 0.42,
        });
    for (const [x, z] of [
      [8, 5],
      [-8, 16],
    ])
      L.push({
        x: X(x),
        y: oy + 8.2,
        z: Z(z),
        color: 0xffd8a0,
        r: 12,
        i: 0.95,
      });
    for (const sx of [-1, 1])
      for (let i = 0; i < 6; i++)
        L.push({
          x: X(sx * 13.5),
          y: oy + 7.5,
          z: Z(0.5 + i * 3.6),
          color: 0xb8c8d8,
          r: 9,
          i: 0.4,
        });
    L.push({ x: X(0), y: oy + 6.5, z: Z(0), color: 0xffe0b0, r: 10, i: 0.55 }); // over the clock & frieze
    L.push({ x: X(0), y: oy + 4.2, z: Z(24), color: 0xfff0d8, r: 10, i: 0.75 });
    L.push({ x: X(0), y: oy + 3, z: Z(-6), color: 0xff4030, r: 7, i: 0.55 }); // checkpoint red
    L.push({ x: X(9), y: oy + 2.6, z: Z(-7), color: 0x60ff90, r: 7, i: 0.55 }); // security office CRTs
    L.push({ x: X(-9), y: oy + 3, z: Z(-7), color: 0xd8e0ff, r: 7, i: 0.35 }); // records
    L.push({ x: X(0), y: oy + 3, z: Z(-14), color: 0xffe0b0, r: 8, i: 0.5 }); // elevator lobby
    L.push({
      x: X(10),
      y: oy + 2.6,
      z: Z(-14),
      color: 0xffe0b0,
      r: 7,
      i: 0.35,
    });
    for (let y = -22; y <= -2; y += 5)
      L.push({
        x: X(19),
        y: oy + y + 2.5,
        z: Z(-18),
        color: 0xff6040,
        r: 8,
        i: 0.45,
      }); // stair emergency lights
    // vault level
    L.push({
      x: X(0),
      y: oy + VY + 3,
      z: Z(-14),
      color: 0xffe0b0,
      r: 8,
      i: 0.5,
    });
    for (let z = -38; z <= -20; z += 6)
      L.push({
        x: X(0),
        y: oy + VY + 3,
        z: Z(z),
        color: 0xd0e0ff,
        r: 7,
        i: 0.5,
      });
    L.push({
      x: X(-7),
      y: oy + VY + 2.6,
      z: Z(-29),
      color: 0xffd8a0,
      r: 7,
      i: 0.4,
    });
    L.push({
      x: X(6),
      y: oy + VY + 2.6,
      z: Z(-29),
      color: 0x60ff90,
      r: 7,
      i: 0.6,
    });
    for (const [x, z] of [
      [-6, -44],
      [6, -44],
      [-6, -55],
      [6, -55],
    ])
      L.push({
        x: X(x),
        y: oy + VY + 6,
        z: Z(z),
        color: 0xd8e4ff,
        r: 11,
        i: 0.45,
      });
    L.push({
      x: X(0),
      y: oy + VY + 3,
      z: Z(-58),
      color: 0xff3020,
      r: 9,
      i: 0.5,
    });
    for (let x = -14; x <= 14; x += 7)
      for (let z = -88; z <= -66; z += 7)
        L.push({
          x: X(x),
          y: oy + VY + 4.2,
          z: Z(z),
          color: 0xffe0a8,
          r: 9,
          i: 0.52,
        });
    L.push({
      x: X(0),
      y: oy + VY + 2.6,
      z: Z(-95),
      color: 0xffd090,
      r: 7,
      i: 0.6,
    });
    L.push({
      x: X(12),
      y: oy + VY + 2.5,
      z: Z(-34),
      color: 0xff6040,
      r: 8,
      i: 0.35,
    });
    L.push({
      x: X(25),
      y: oy - 15 + 2.4,
      z: Z(-19),
      color: 0xffb070,
      r: 7,
      i: 0.5,
    });
    const b = PF.batch("fed_int");
    b.ground = oy + VY;
    b.aoH = 3;
    b.setLights(L, 0x9098a8, 0.13);

    // =========================== GROUND FLOOR ===========================
    // vestibule x -5..5, z 20..28
    floor("marble", -5, 20, 5, 28.6, 0);
    W("fed_stone", "x", -5.6, 5.6, 28, 28.6, 0, 6, [
      { c: 0, w: 3.0, y0: 0, h: 3.6 },
    ]);
    PF.exitDoor(b, X(0), oy, Z(28.2), PI, 3.0, 3.6, {
      key: "bronze",
      frame: "bronze",
    }); // the street doors, daylight in the lites
    W("fed_stone", "z", 20, 28.6, -5.6, -5, 0, 6);
    W("fed_stone", "z", 20, 28.6, 5, 5.6, 0, 6);
    ceil("plaster_w", -5, 20, 5, 28, 5.6);
    // revolving door drum (wrecked) and bronze doors
    b.cyl("bronze", X(0), oy, Z(25.5), 1.4, 1.4, 0.15, 16, { hSeg: 1 });
    b.cyl("bronze", X(0), oy + 3.0, Z(25.5), 1.4, 1.4, 0.25, 16, { hSeg: 1 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.4;
      b.box(
        "glass_broken",
        X(Math.cos(a) * 0.65),
        oy + 0.15,
        Z(25.5 + Math.sin(a) * 0.65),
        1.3,
        2.8,
        0.04,
        { ry: -a, seg: false },
      );
    }
    b.box("bronze", X(0), oy + 0.15, Z(25.5), 0.12, 2.85, 0.12, { seg: false });
    PF.col(X(0), Z(25.5), 0.3, 0.3, oy, oy + 3, 0, { walkable: false });
    anchors.entrance = A(0, 0, 23.4, 0); // in front of the wrecked revolving drum, looking straight through the arch into the banking hall
    PF.door({
      id: "pf_fed_exit",
      pos: P(0, 1.6, 27.8),
      label: "Liberty Street",
      verb: "Exit",
      radius: 1.5,
      target: { x: ext.entrance.x, y: 0.05, z: ext.entrance.z, yaw: 0 },
      sound: "door_open",
    }); // face north, away from the portal
    const vestSign = PF.texMat(
      "fed_vest",
      PF.signTex(
        "fed_vest",
        ["ALL VISITORS MUST", "PRESENT IDENTIFICATION", "AT THE SECURITY DESK"],
        "enamel",
        512,
        256,
        { bg: "#1e2a24", fg: "#d8c890" },
      ),
    );
    b.quad(vestSign, X(4.95), oy + 2.2, Z(23), 1.6, 0.8, { ry: -HP });

    // banking hall x -16..16, z -2..20, H 12
    floor("marble_floor", -16, -2, 16, 20, 0);
    W("fed_stone", "x", -16.6, 16.6, 20, 20.6, 0, 12, [
      { c: 0, w: 4, y0: 0, h: 4.4 },
    ]);
    W("fed_stone", "z", -2.6, 20.6, -16.6, -16, 0, 12);
    W("fed_stone", "z", -2.6, 20.6, 16, 16.6, 0, 12);
    // coffered ceiling
    ceil("plaster_w", -16, -2, 16, 20, 12);
    for (let x = -16; x <= 16; x += 4)
      b.box("fed_stone", X(x), oy + 11.2, Z(9), 0.6, 0.8, 22, {
        seg: false,
        grime: 0.2,
      });
    for (let z = -2; z <= 20; z += 4)
      b.box("fed_stone", X(0), oy + 11.2, Z(z), 32, 0.8, 0.6, {
        seg: false,
        grime: 0.2,
      });
    for (let x = -14; x <= 14; x += 4)
      for (let z = 0; z <= 18; z += 4)
        b.box("gilt", X(x), oy + 11.95, Z(z), 0.5, 0.05, 0.5, { seg: false });
    // Florentine blind arcade on the side walls + clerestory lunettes
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const z = 0.5 + i * 3.6;
        b.box("fed_rust", X(sx * 15.7), oy, Z(z - 1.8), 0.7, 7.6, 0.8, {
          seg: false,
          grime: 0.4,
        });
        archWindow(
          b,
          X(sx * 15.95),
          oy + 1.2,
          Z(z),
          sx > 0 ? -HP : HP,
          2.2,
          5.6,
          { glass: "wallpaper_g", frame: "fed_stone" },
        );
        b.add("lamp_blue", PF.shapeGeo(roundShape(2.0, 1.6), 8), {
          m: PF.m4(X(sx * 15.97), oy + 8.6, Z(z), sx > 0 ? -HP : HP),
          uv: "keep",
          noAO: true,
        });
      }
      b.box("fed_rust", X(sx * 15.7), oy, Z(19.3), 0.7, 7.6, 0.8, {
        seg: false,
      });
    }
    // teller line (z 1.4..2.2) with brass grille cages, gap for the staff gate at x -1..1
    for (const [x0, x1] of [
      [-15.4, -1.2],
      [1.2, 15.4],
    ]) {
      b.boxMM("marble_dark", X(x0), oy, Z(1.4), X(x1), oy + 1.15, Z(2.2), {
        grime: 0.4,
      });
      b.boxMM(
        "marble",
        X(x0 - 0.05),
        oy + 1.15,
        Z(1.3),
        X(x1 + 0.05),
        oy + 1.25,
        Z(2.3),
        { seg: false },
      );
      PF.colMM(X(x0), oy, Z(1.4), X(x1), oy + 2.8, Z(2.2), { walkable: false });
      for (let x = x0 + 0.1; x < x1; x += 0.16)
        b.box("brass", X(x), oy + 1.25, Z(1.8), 0.025, 1.5, 0.025, {
          seg: false,
          grime: 0.2,
        });
      b.boxMM("brass", X(x0), oy + 2.7, Z(1.72), X(x1), oy + 2.8, Z(1.88), {
        seg: false,
      });
      for (let x = x0 + 1.4; x < x1 - 0.5; x += 2.8) {
        b.boxMM(
          "marble",
          X(x - 0.35),
          oy + 1.25,
          Z(1.5),
          X(x + 0.35),
          oy + 1.6,
          Z(2.1),
          { seg: false },
        ); // teller window gap frame
        const plate = PF.texMat(
          "fed_teller",
          PF.signTex("fed_teller", ["TELLER"], "enamel", 256, 64, {
            bg: "#1e2a24",
            fg: "#d8c890",
          }),
        );
        b.quad(plate, X(x), oy + 2.45, Z(2.3), 0.7, 0.18, {});
      }
    }
    // staff gate (half door, swung open)
    b.box("mahogany", X(-0.3), oy, Z(1.0), 0.06, 1.1, 1.2, {
      ry: 0.6,
      seg: false,
    });
    // behind the counter: desks, coin counters, a dead teller-bot
    for (let x = -13; x <= 13; x += 5.2) {
      if (Math.abs(x) < 2) continue;
      b.box("mahogany", X(x), oy, Z(-0.6), 1.6, 0.78, 0.8, {
        seg: false,
        grime: 0.5,
      });
      D.monitor(b, X(x + 0.3), oy + 0.78, Z(-0.7), 0, false);
      PF.col(X(x), Z(-0.6), 1.6, 0.8, oy, oy + 0.8, 0, { walkable: false });
    }
    // check-writing islands + the eagle seal mosaic
    for (const [x, z] of [
      [-7, 9],
      [7, 9],
      [-7, 15],
      [7, 15],
    ]) {
      b.box("marble_dark", X(x), oy, Z(z), 3.4, 1.05, 1.2, {
        seg: false,
        grime: 0.4,
      });
      b.box("marble", X(x), oy + 1.05, Z(z), 3.6, 0.08, 1.4, { seg: false });
      b.cyl("brass", X(x), oy + 1.13, Z(z), 0.04, 0.04, 0.5, 5, { hSeg: 1 });
      b.sphere("lamp_warm", X(x), oy + 1.65, Z(z), 0.12, { ws: 6, hs: 4 });
      PF.col(X(x), Z(z), 3.6, 1.4, oy, oy + 1.13, 0, { walkable: false });
      D.papers(b, X(x), oy + 1.14, Z(z), 1.0, 5, x * 7 + z);
    }
    const eagleK = PF.texMat(
      "fed_eagle_floor",
      PF.canvasTex(
        "pf_fed_eagle_floor",
        512,
        512,
        (ctx, w) => {
          ctx.fillStyle = "#c8b890";
          ctx.fillRect(0, 0, w, w);
          ctx.fillStyle = "#6a2a1c";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 6, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#d8c8a0";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 40, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#2a2a3a";
          const cx = w / 2;
          for (const sg of [-1, 1]) {
            // spread wings: stacked feather strokes
            for (let f = 0; f < 7; f++) {
              ctx.beginPath();
              ctx.moveTo(cx + sg * 30, 230 + f * 6);
              ctx.quadraticCurveTo(
                cx + sg * (90 + f * 12),
                150 + f * 14,
                cx + sg * (175 - f * 8),
                150 + f * 28,
              );
              ctx.lineTo(cx + sg * (160 - f * 8), 175 + f * 28);
              ctx.quadraticCurveTo(
                cx + sg * (80 + f * 10),
                190 + f * 14,
                cx + sg * 30,
                262 + f * 5,
              );
              ctx.closePath();
              ctx.fill();
            }
          }
          ctx.beginPath();
          ctx.ellipse(cx, 255, 40, 70, 0, 0, TAU);
          ctx.fill(); // body
          ctx.beginPath();
          ctx.arc(cx, 165, 26, 0, TAU);
          ctx.fill(); // head
          ctx.beginPath();
          ctx.moveTo(cx + 20, 160);
          ctx.lineTo(cx + 44, 172);
          ctx.lineTo(cx + 20, 178);
          ctx.fill(); // beak
          ctx.beginPath();
          ctx.moveTo(cx - 40, 320);
          ctx.lineTo(cx, 360);
          ctx.lineTo(cx + 40, 320);
          ctx.fill(); // tail
          ctx.fillStyle = "#8a2a20";
          ctx.fillRect(cx - 26, 225, 52, 56); // shield
          ctx.fillStyle = "#d8c8a0";
          for (let k = 0; k < 4; k++)
            ctx.fillRect(cx - 22 + k * 12, 240, 6, 38);
          ctx.fillStyle = "#26345a";
          ctx.fillRect(cx - 26, 225, 52, 15);
          ctx.strokeStyle = "#2a2a3a";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx - 90, 300);
          ctx.lineTo(cx - 40, 285);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 40, 285);
          ctx.lineTo(cx + 95, 305);
          ctx.stroke();
          ctx.fillStyle = "#a88838";
          ctx.font = "bold 30px Georgia";
          ctx.textAlign = "center";
          ctx.fillText("IN GOLD WE TRUST", w / 2, w - 70);
          for (let i = 0; i < 2500; i++) {
            ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.25 + ")";
            ctx.fillRect(Math.random() * w, Math.random() * w, 3, 3);
          }
        },
        { clamp: true },
      ),
      { rough: 0.5 },
    );
    b.quad(eagleK, X(0), oy + 0.02, Z(12), 6, 6, { rx: -HP, grime: 0.3 });
    // chandeliers (iron rings with dead bulbs), two still glowing on emergency power
    for (const [x, z, lit] of [
      [-8, 5, false],
      [8, 5, true],
      [-8, 16, true],
      [8, 16, false],
    ]) {
      b.cyl("iron", X(x), oy + 8.4, Z(z), 0.02, 0.02, 3.6, 3, { hSeg: 1 });
      b.add("brass", new THREE.TorusGeometry(1.1, 0.06, 5, 18), {
        m: PF.m4(X(x), oy + 8.4, Z(z), 0, HP),
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.sphere(
          lit ? "lamp_warm" : "glass_broken",
          X(x + Math.cos(a) * 1.1),
          oy + 8.55,
          Z(z + Math.sin(a) * 1.1),
          0.08,
          { ws: 5, hs: 4 },
        );
      }
      if (lit)
        PF.glow(P(x, 8.5, z), 0xffe0b0, 2.6, root, {
          intensity: 0.9,
          flicker: 0.1,
        });
    }
    // the centre chandelier came down: bent ring on the floor, chain coiled beside it, shattered bulbs & plaster
    b.add("brass", new THREE.TorusGeometry(1.1, 0.06, 5, 18), {
      m: PF.m4(X(0.4), oy + 0.12, Z(9.6), 0.3, HP - 0.18, 0.1),
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      b.sphere(
        "glass_broken",
        X(0.4 + Math.cos(a) * 1.1),
        oy + 0.12 + Math.sin(a) * 0.19,
        Z(9.6 + Math.sin(a) * 1.08),
        0.08,
        { ws: 5, hs: 4 },
      );
    }
    b.cyl("iron", X(0), oy + 8.4, Z(10), 0.02, 0.02, 3.6, 3, { hSeg: 1 });
    b.beam("iron", P(-0.9, 0.05, 11.2), P(-2.4, 0.05, 12.6), 0.05, 0.05);
    D.rubble(b, X(1.6), oy, Z(8.4), 0.45, 6, 4471);
    for (let i = 0; i < 14; i++)
      b.box(
        "gilt",
        X(-1.5 + ((i * 37) % 30) / 10),
        oy + 0.02,
        Z(8 + ((i * 53) % 36) / 10),
        0.5,
        0.05,
        0.5,
        { ry: i, rx: (i % 3) * 0.2, seg: false },
      ); // fallen coffer rosettes
    // north wall: the Florentine blind arcade continues, pilasters, the great clock over the checkpoint & the name frieze
    for (const x of [-15.3, -11.4, -4, 4, 11.4, 15.3])
      b.box("fed_rust", X(x), oy, Z(-1.65), 0.8, 7.6, 0.7, {
        seg: false,
        grime: 0.4,
      });
    for (const x of [-13.35, -6.3, 6.3, 13.35])
      archWindow(b, X(x), oy + 1.2, Z(-1.96), 0, 2.4, 5.6, {
        glass: "wallpaper_g",
        frame: "fed_stone",
      });
    b.boxMM("fed_rust", X(-16), oy + 7.6, Z(-2), X(16), oy + 8.1, Z(-1.55), {
      seg: false,
      grime: 0.3,
    });
    b.boxMM("fed_stone", X(-16), oy + 10.3, Z(-2), X(16), oy + 10.7, Z(-1.6), {
      seg: false,
      grime: 0.3,
    });
    const friezeK = PF.texMat(
      "fed_frieze",
      PF.signTex(
        "fed_frieze",
        ["FEDERAL RESERVE BANK OF NEW YORK"],
        "engraved",
        2048,
        128,
        { bg: "#b8a888", fg: "#3a3020" },
      ),
    );
    b.quad(friezeK, X(0), oy + 9.2, Z(-1.97), 22, 1.3, { grime: 0.3 });
    const clockK = PF.texMat(
      "fed_clock",
      PF.canvasTex(
        "pf_fed_clock",
        512,
        512,
        (ctx, w) => {
          const c = w / 2;
          ctx.fillStyle = "#6a5a38";
          ctx.fillRect(0, 0, w, w);
          ctx.fillStyle = "#e8dcc0";
          ctx.beginPath();
          ctx.arc(c, c, c - 22, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#a88838";
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.arc(c, c, c - 20, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#2a2418";
          ctx.font = "bold 44px Georgia";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const RN = [
            "XII",
            "I",
            "II",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
          ];
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU - HP;
            ctx.fillText(
              RN[i],
              c + Math.cos(a) * (c - 80),
              c + Math.sin(a) * (c - 80),
            );
          }
          // stopped at 9:47, the moment the bombs fell
          const hand = (a, len, wd) => {
            ctx.lineWidth = wd;
            ctx.beginPath();
            ctx.moveTo(c, c);
            ctx.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
            ctx.stroke();
          };
          ctx.strokeStyle = "#1a1610";
          hand(((9 + 47 / 60) / 12) * TAU - HP, 120, 14);
          hand((47 / 60) * TAU - HP, 185, 8);
          ctx.fillStyle = "#1a1610";
          ctx.beginPath();
          ctx.arc(c, c, 14, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "rgba(30,20,10,0.6)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(c - 40, 70);
          ctx.lineTo(c + 10, 190);
          ctx.lineTo(c - 20, 260);
          ctx.stroke(); // crack
          for (let i = 0; i < 1600; i++) {
            ctx.fillStyle = "rgba(40,30,10," + Math.random() * 0.22 + ")";
            ctx.fillRect(Math.random() * w, Math.random() * w, 3, 3);
          }
        },
        { clamp: true },
      ),
      { rough: 0.6 },
    );
    b.cyl("bronze", X(0), oy + 5.6, Z(-1.75), 1.35, 1.35, 0.3, 24, {
      hSeg: 1,
      rx: HP,
    });
    b.quad(clockK, X(0), oy + 5.6, Z(-1.58), 2.4, 2.4, { grime: 0.2 });
    b.boxMM("bronze", X(-0.9), oy + 6.95, Z(-1.9), X(0.9), oy + 7.3, Z(-1.5), {
      seg: false,
    }); // eagle perch
    b.box("bronze", X(0), oy + 7.3, Z(-1.7), 0.5, 0.7, 0.35, { seg: false });
    for (const sg of [-1, 1])
      b.box("bronze", X(sg * 0.7), oy + 7.45, Z(-1.7), 1.0, 0.12, 0.25, {
        rz: sg * -0.35,
        seg: false,
      });
    // bank notes everywhere: the last crew tore open a cash cart in the middle of the hall
    for (const [x, z, rr, n] of [
      [-3, 13, 3.2, 70],
      [5, 4, 2.4, 40],
      [-10, 4, 2, 26],
      [11, 15, 2.2, 30],
      [0, -1, 1.5, 18],
    ]) {
      const rn = PF.rng("fed_notes" + x + z);
      for (let i = 0; i < n; i++) {
        const a = rn() * TAU,
          d = Math.sqrt(rn()) * rr;
        b.box(
          "money",
          X(x + Math.cos(a) * d),
          oy + 0.012 + rn() * 0.02,
          Z(z + Math.sin(a) * d),
          0.16,
          0.004,
          0.07,
          { ry: rn() * TAU, rx: (rn() - 0.5) * 0.2, seg: false, noAO: true },
        );
      }
    }
    // cash cart tipped on its side (the wheels stick out sideways), lid torn off
    b.box("vault_steel", X(-3.4), oy, Z(13.4), 1.6, 0.8, 0.9, {
      ry: 0.5,
      seg: false,
      grime: 0.6,
    });
    for (const dx of [-0.6, 0.6])
      for (const dy of [0.15, 0.65]) {
        const c5 = Math.cos(0.5),
          s5 = Math.sin(0.5);
        b.cyl(
          "tire",
          X(-3.4 + dx * c5 - 0.5 * s5),
          oy + dy,
          Z(13.4 - dx * s5 - 0.5 * c5),
          0.12,
          0.12,
          0.08,
          8,
          { hSeg: 1, rx: HP, ry: 0.5 },
        );
      }
    b.box("vault_steel", X(-4.6), oy + 0.02, Z(14.6), 1.5, 0.05, 0.85, {
      ry: 1.2,
      rx: 0.08,
      seg: false,
      grime: 0.6,
    });
    PF.col(X(-3.4), Z(13.4), 1.0, 1.7, oy, oy + 0.9, 0.5, { walkable: false });
    // the guards' last stand: sandbags & an overturned desk across the checkpoint arch, spent brass, a riot shield
    for (let i = 0; i < 9; i++) {
      const x = -3.6 + i * 0.9;
      if (Math.abs(x) < 1.0) continue;
      b.box("sandbag", X(x), oy + (i % 2) * 0.02, Z(0.2), 0.85, 0.32, 0.5, {
        ry: ((i % 3) - 1) * 0.08,
        seg: false,
        grime: 0.6,
      });
      b.box("sandbag", X(x + 0.4), oy + 0.32, Z(0.25), 0.8, 0.3, 0.48, {
        ry: 0.1,
        seg: false,
        grime: 0.6,
      });
    }
    PF.colMM(X(-3.9), oy, Z(-0.05), X(-1.0), oy + 0.62, Z(0.45), {
      walkable: false,
    });
    PF.colMM(X(1.0), oy, Z(-0.05), X(4.2), oy + 0.62, Z(0.45), {
      walkable: false,
    });
    D.chair(b, X(-2.2), oy, Z(0.9), 1.2, true, "mahogany");
    for (let i = 0; i < 24; i++)
      b.cyl(
        "brass",
        X(-2.5 + ((i * 29) % 50) / 10),
        oy + 0.015,
        Z(0.8 + ((i * 17) % 20) / 10),
        0.006,
        0.006,
        0.03,
        4,
        { hSeg: 1, rz: HP, ry: i },
      );
    b.box("glass_dark", X(2.3), oy + 0.05, Z(1.0), 0.6, 0.04, 1.0, {
      ry: 0.3,
      rz: 0.2,
      seg: false,
    });
    PF.skeleton(b, X(-1.6), oy + 0.02, Z(-0.4), 0.2);
    // wreckage: toppled robot, raider corpses (they got this far)
    b.rock("rubble", X(-11), oy, Z(12), 1.1, { flat: 0.5 });
    for (const [x, z, a] of [
      [3, 16, 0.6],
      [-4.5, 6, 2.4],
      [11.5, 11, -1.2],
    ])
      PF.skeleton(b, X(x), oy + 0.02, Z(z), a);
    D.papers(b, X(0), oy + 0.01, Z(6), 9, 40, 99);
    anchors.hall = A(0, 0, 10, 0);
    anchors.spawn1 = A(-10, 0, 14, 0);
    anchors.spawn2 = A(10, 0, 6, 0);
    anchors.spawn3 = A(0, 0, -6, 0);

    // ---- checkpoint 1 (x -4..4, z -10..-2): detector arches, booth, locked gate ----
    floor("terrazzo", -4, -10, 4, -2, 0);
    W("fed_stone", "x", -16.6, 16.6, -2.6, -2, 0, 12, [
      { c: 0, w: 3.6, y0: 0, h: 3.4 },
      { c: 9, w: 1.4, y0: 0, h: 2.4 },
      { c: -9, w: 1.4, y0: 0, h: 2.4 },
    ]);
    W("fed_stone", "z", -12, -2.6, -4.6, -4, 0, 4.5);
    W("fed_stone", "z", -12, -2.6, 4, 4.6, 0, 4.5, [
      { c: -6, w: 2.6, y0: 1.0, h: 1.5 },
    ]); // booth window
    ceil("panel", -4, -10, 4, -2, 4.2);
    for (const z of [-4.2, -6.6]) {
      for (const sx of [-1, 1])
        b.box("paint_cream", X(sx * 1.1), oy, Z(z), 0.3, 2.3, 0.6, {
          seg: false,
          grime: 0.5,
        });
      b.box("paint_cream", X(0), oy + 2.3, Z(z), 2.5, 0.3, 0.6, { seg: false });
      PF.col(X(-1.1), Z(z), 0.3, 0.6, oy, oy + 2.3, 0, { walkable: false });
      PF.col(X(1.1), Z(z), 0.3, 0.6, oy, oy + 2.3, 0, { walkable: false });
    }
    b.quad("glass_dark", X(4.02), oy + 1.75, Z(-6), 2.6, 1.5, {
      ry: -HP,
      noAO: true,
    });
    for (const x of [-3, 3]) {
      b.box("rust", X(x), oy, Z(-8.2), 1.6, 1.0, 0.4, { seg: false });
      PF.col(X(x), Z(-8.2), 1.6, 0.4, oy, oy + 1, 0, { walkable: false });
    } // turnstiles (walled)
    const cpK = PF.texMat(
      "fed_cp",
      PF.signTex(
        "fed_cp",
        ["SECURITY CHECKPOINT", "AUTHORIZED PERSONNEL ONLY"],
        "enamel",
        512,
        160,
        { bg: "#7a1c14", fg: "#f0e0c0" },
      ),
    );
    b.quad(cpK, X(0), oy + 3.7, Z(-2.66), 3.2, 1.0, { ry: PI });
    b.quad(cpK, X(0), oy + 3.7, Z(-2.0 + 0.04), 3.2, 1.0, {});
    // checkpoint gate (bars) at z -9.6 — scripted open/close
    const cpGate = barGate(root, X(0), oy, Z(-9.6), 3.6, 3.2, "fed_gate", 0, {
      lock: FED_LOCKS.gate,
      label: "Checkpoint Gate",
    });
    PF.codeReadable(
      P(4.9, 1.6, -6),
      "Card in the Booth Window",
      '"GATE KEYPAD 5107. Do NOT give this to the robots. — R.O."',
      FED_LOCKS.gate.id,
    );
    void cpGate;
    anchors.checkpoint = A(0, 0, -5, 0);
    anchors.turret_cp = A(0, 3.2, -9.9, 0);

    // ---- security office (x 4.6..14, z -11.4..-2.6) ----
    floor("tile_floor", 4.6, -11.4, 16, -2.6, 0);
    W("fed_stone", "z", -12, -2.6, 16, 16.6, 0, 4.5);
    W("fed_stone", "x", 4.6, 16.6, -12, -11.4, 0, 4.5);
    ceil("panel", 4.6, -11.4, 16, -2.6, 4.2);
    // CRT wall + desk
    for (let i = 0; i < 6; i++)
      D.monitor(
        b,
        X(7 + (i % 3) * 0.7),
        oy + 1.2 + Math.floor(i / 3) * 0.5,
        Z(-11.1),
        0,
        i !== 4,
      );
    b.boxMM("panel", X(6.3), oy, Z(-11.4), X(9.6), oy + 1.2, Z(-10.6), {
      seg: false,
    });
    PF.colMM(X(6.3), oy, Z(-11.4), X(9.6), oy + 1.2, Z(-10.6), {
      walkable: false,
    });
    b.box("mahogany", X(12), oy, Z(-8), 2.2, 0.78, 1.0, { seg: false });
    PF.col(X(12), Z(-8), 2.2, 1.0, oy, oy + 0.8, 0, { walkable: false });
    D.chair(b, X(12), oy, Z(-7.1), PI, false, "panel");
    D.fluoro(b, X(10), oy + 3.8, Z(-7), 0, 2.2, true, oy + 4.2);
    anchors.sec_terminal = A(8, 0, -9.8, 0);
    anchors.sec_lockers = A(15.6, 0, -5, -HP);
    anchors.sec_desk = A(12, 0.8, -8, 0);
    anchors.loot1 = A(15.2, 0, -10.6, 0);

    // ---- records room (x -16..-4.6, z -11.4..-2.6), keypad door (code in the Chief's memo) ----
    floor("planks", -16, -11.4, -4.6, -2.6, 0);
    W("fed_stone", "z", -12, -2.6, -16.6, -16, 0, 4.5);
    W("fed_stone", "x", -16.6, -4.6, -12, -11.4, 0, 4.5);
    ceil("panel", -16, -11.4, -4.6, -2.6, 4.2);
    for (let i = 0; i < 6; i++) {
      b.box("panel", X(-15.3), oy, Z(-10.6 + i * 1.3), 0.8, 1.5, 1.0, {
        seg: false,
        grime: 0.5,
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "iron",
          X(-14.88),
          oy + 0.2 + k * 0.35,
          Z(-10.6 + i * 1.3),
          0.02,
          0.05,
          0.3,
          { seg: false },
        );
    }
    PF.colMM(X(-15.8), oy, Z(-11.2), X(-14.8), oy + 1.5, Z(-3.2), {
      walkable: false,
    });
    b.box("mahogany", X(-9), oy, Z(-8.5), 2.4, 0.78, 1.2, { seg: false });
    PF.col(X(-9), Z(-8.5), 2.4, 1.2, oy, oy + 0.8, 0, { walkable: false });
    D.papers(b, X(-9), oy + 0.02, Z(-6), 4, 30, 71);
    for (let i = 0; i < 4; i++)
      b.box(
        "paper",
        X(-9 + (r() - 0.5) * 2),
        oy + 0.8,
        Z(-8.5 + (r() - 0.5) * 0.9),
        0.3,
        0.02,
        0.22,
        { ry: r() * 3, seg: false },
      );
    PF.skeleton(b, X(-7), oy + 0.02, Z(-9.8), 1.9); // the Chief of Security
    anchors.chief = A(-7, 0, -9.8, 0);
    D.fluoro(b, X(-10), oy + 3.8, Z(-7), 0, 2.2, false, oy + 4.2);
    doorBlock(
      root,
      X(-9),
      oy,
      Z(-2.3),
      1.4,
      2.4,
      FED_LOCKS.records,
      "Records Room",
      "fed_records",
    );

    // ---- elevator lobby (x -4..4, z -18..-10) + back corridor to the egress stair ----
    floor("terrazzo", -4, -18, 4, -10, 0);
    W("fed_stone", "x", -4.6, 4.6, -18.6, -18, 0, 5);
    W("fed_stone", "z", -18.6, -10, -4.6, -4, 0, 5, [
      { c: -14, w: 1.8, y0: 0, h: 2.8 },
    ]); // elevator door (west)
    W("fed_stone", "z", -18.6, -12, 4, 4.6, 0, 5, [
      { c: -14, w: 2.2, y0: 0, h: 2.8 },
    ]); // to back corridor
    ceil("panel", -4, -18, 4, -10, 4.6);
    elevatorFront(b, X(-3.98), oy, Z(-14), HP, "VAULT");
    b.box("planks", X(-3.9), oy + 0.4, Z(-16.6), 0.1, 2.2, 1.6, {
      rz: 0.1,
      seg: false,
    }); // boarded second car
    const oooK = PF.texMat(
      "fed_ooo",
      PF.signTex("fed_ooo", ["OUT OF ORDER"], "raider", 256, 96, {
        bg: "#c8c0a8",
        fg: "#1a1a1a",
      }),
    );
    b.quad(oooK, X(-3.82), oy + 1.6, Z(-16.6), 1.1, 0.4, { ry: HP });
    anchors.elevator_up = A(-2.6, 0, -14, -HP);
    // back corridor x 4.6..16, z -16..-12.6
    floor("terrazzo", 4.6, -16, 16, -12, 0);
    W("fed_stone", "x", 4.6, 16, -16.6, -16, 0, 4);
    ceil("panel", 4.6, -16, 16, -12, 3.6);
    D.fluoro(b, X(10), oy + 3.3, Z(-14), HP, 2.0, true, oy + 3.6);

    // ============================ ELEVATOR ============================
    // (a load door pair: the car ride is a fade; the shaft is five levels deep)
    // vault level elevator lobby at the same x/z, VY below
    floor("terrazzo", -4, -18, 4, -10, VY);
    W("vault_dark", "x", -4.6, 4.6, -10, -9.4, VY, VY + 5);
    W("vault_dark", "z", -18.6, -9.4, -4.6, -4, VY, VY + 5, [
      { c: -14, w: 1.8, y0: VY, h: 2.8 },
    ]);
    W("vault_dark", "z", -18.6, -9.4, 4, 4.6, VY, VY + 5);
    W("vault_dark", "x", -4.6, 4.6, -18.6, -18, VY, VY + 5, [
      { c: 0, w: 3.0, y0: VY, h: 3.0 },
    ]);
    ceil("panel", -4, -18, 4, -10, VY + 4.6);
    elevatorFront(b, X(-3.98), oy + VY, Z(-14), HP, "VAULT");
    const lvK = PF.texMat(
      "fed_lv",
      PF.signTex(
        "fed_lv",
        ["LEVEL V — VAULT", "SECURITY CLEARANCE REQUIRED BEYOND THIS POINT"],
        "enamel",
        1024,
        160,
        { bg: "#1e2a24", fg: "#e0c870" },
      ),
    );
    b.quad(lvK, X(0), oy + VY + 3.6, Z(-10.06), 4.4, 0.7, { ry: PI });
    anchors.elevator_down = A(-2.6, VY, -14, -HP);
    const elev = (from, to, label) =>
      PF.use({
        pos: P(-3.7, (from === "up" ? 0 : VY) + 1.5, -14),
        radius: 1.1,
        range: 2.8,
        label,
        verb: () => (PF.flag("fed_power") ? "Ride" : "Call"),
        locked: () => (PF.flag("fed_power") ? null : "No power"),
        onInteract() {
          if (!PF.flag("fed_power")) {
            PF.sfx("door_locked");
            G.notify(
              "The call button is dead. The vault elevator has no power — the security office should control it.",
            );
            return;
          }
          PF.sfx("hum_electric", null, { volume: 0.6 });
          G.fadeTransition(() => {
            const a =
              to === "down" ? anchors.elevator_down : anchors.elevator_up;
            G.player.teleport(a.x, a.y + 0.05, a.z, a.yaw);
            if (to === "down") {
              PF.q.advance(
                "pf_gold",
                ["meet", "enter", "power", "descend"],
                "door",
              );
              PF.sfx("door_open");
            }
          }, 1.2);
        },
      });
    elev("up", "down", "Vault Elevator (Level V)");
    elev("down", "up", "Vault Elevator (Ground Floor)");

    // ============================ VAULT LEVEL ============================
    // checkpoint 2 corridor x -2.5..2.5, z -40..-18 (laser grid at z -25.5)
    floor("vault_dark", -2.5, -40, 2.5, -18, VY);
    W("vault_dark", "z", -40, -18, -3.1, -2.5, VY, VY + 4, [
      { c: -30, w: 1.6, y0: VY, h: 2.6 },
    ]);
    W("vault_dark", "z", -40, -18, 2.5, 3.1, VY, VY + 4, [
      { c: -30, w: 1.6, y0: VY, h: 2.6 },
    ]);
    ceil("vault_dark", -2.5, -40, 2.5, -18, VY + 3.6);
    for (let z = -38; z <= -20; z += 3) {
      b.box("vault_steel", X(-2.45), oy + VY, Z(z), 0.1, 3.6, 0.4, {
        seg: false,
      });
      b.box("vault_steel", X(2.45), oy + VY, Z(z), 0.1, 3.6, 0.4, {
        seg: false,
      });
    }
    for (let z = -38; z <= -20; z += 6)
      D.fluoro(b, X(0), oy + VY + 3.3, Z(z), HP, 1.6, z !== -32, oy + VY + 3.6);
    // yellow/black hazard stripes at the grid
    const hazK = PF.texMat(
      "fed_haz",
      PF.canvasTex("pf_fed_haz", 256, 64, (ctx, w, h) => {
        ctx.fillStyle = "#d8b020";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#141414";
        for (let x = -h; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, h);
          ctx.lineTo(x + 20, h);
          ctx.lineTo(x + 20 + h, 0);
          ctx.lineTo(x + h, 0);
          ctx.fill();
        }
      }),
      { rough: 0.8 },
    );
    b.quad(hazK, X(0), oy + VY + 0.01, Z(-25.5), 5, 0.6, { rx: -HP });
    for (const sx of [-1, 1]) {
      b.box("vault_steel", X(sx * 2.3), oy + VY, Z(-25.5), 0.3, 2.4, 0.4, {
        seg: false,
      });
      b.box(
        "lamp_red",
        X(sx * 2.14),
        oy + VY + 2.2,
        Z(-25.5),
        0.04,
        0.12,
        0.12,
        { seg: false },
      );
    }
    // laser beams (dynamic group, toggled)
    const grid = new THREE.Group();
    grid.name = "pf_fed_grid";
    {
      const gb = PF.batch("fed_grid");
      for (const y of [0.35, 0.75, 1.15, 1.55, 1.95])
        gb.box("laser", 0, y, 0, 4.3, 0.025, 0.025, {
          seg: false,
          noAO: true,
          grime: 0,
        });
      for (const x of [-1.2, 0, 1.2])
        gb.box("laser", x, 0.1, 0, 0.025, 2.1, 0.025, {
          seg: false,
          noAO: true,
          grime: 0,
        });
      gb.build(grid, { noLOD: true, castShadow: false });
      grid.position.set(X(0), oy + VY, Z(-25.5));
      root.add(grid);
    }
    PF.glow(P(0, VY + 1.2, -25.5), 0xff2010, 2.4, grid, {
      intensity: 1.2,
      flicker: 0.2,
    });
    anchors.laser_grid = A(0, VY, -25.5, 0);
    anchors.turret_vault = A(0, VY + 3.1, -39.6, 0);

    // barracks (west, x -12..-3.1, z -36..-24)
    floor("tile_floor", -12, -36, -3.1, -24, VY);
    W("vault_dark", "x", -12.6, -3.1, -36.6, -36, VY, VY + 3.6);
    W("vault_dark", "x", -12.6, -3.1, -24, -23.4, VY, VY + 3.6);
    W("vault_dark", "z", -36.6, -23.4, -12.6, -12, VY, VY + 3.6);
    ceil("panel", -12, -36, -3.1, -24, VY + 3.4);
    for (let i = 0; i < 3; i++) {
      const z = -34.5 + i * 3.2;
      for (const y of [0.35, 1.5]) {
        b.box("iron", X(-10.8), oy + VY + y, Z(z), 2.0, 0.06, 0.9, {
          seg: false,
        });
        b.box("army", X(-10.8), oy + VY + y + 0.06, Z(z), 1.9, 0.14, 0.85, {
          seg: false,
        });
      }
      for (const dz of [-0.42, 0.42])
        for (const dx of [-0.95, 0.95])
          b.box("iron", X(-10.8 + dx), oy + VY, Z(z + dz), 0.05, 2.0, 0.05, {
            seg: false,
          });
      PF.col(X(-10.8), Z(z), 2.0, 0.9, oy + VY, oy + VY + 2.0, 0, {
        walkable: false,
      });
    }
    for (let i = 0; i < 5; i++)
      b.box("army", X(-4.0), oy + VY, Z(-34.8 + i * 0.7), 0.6, 1.9, 0.62, {
        seg: false,
        grime: 0.5,
      });
    PF.colMM(X(-4.3), oy + VY, Z(-35.2), X(-3.7), oy + VY + 1.9, Z(-31.5), {
      walkable: false,
    });
    b.box("panel", X(-7.5), oy + VY, Z(-26), 1.6, 0.76, 0.9, { seg: false });
    D.chair(b, X(-7.5), oy + VY, Z(-26.8), 0.3, true, "panel");
    const cardK = PF.texMat(
      "fed_cards",
      PF.signTex(
        "fed_cards",
        [
          "GIN RUMMY — RUNNING SCORE",
          "PVT. KOWALCZYK 8,114",
          "SGT. BELL 8,112",
          "THE ROBOTS: DO NOT PLAY",
        ],
        "engraved",
        512,
        256,
        { bg: "#d8d0b8", fg: "#2a2418" },
      ),
    );
    b.quad(cardK, X(-3.16), oy + VY + 1.8, Z(-27), 1.2, 0.6, { ry: -HP });
    PF.codeReadable(
      P(-3.5, VY + 1.6, -27),
      "Gin Rummy Scoreboard",
      'SGT. BELL 8,112 — and pencilled under it, in the Sergeant\'s hand: "SAFE = MY SCORE. NOBODY ELSE CAN REMEMBER IT ANYWAY."',
      FED_LOCKS.barracks.id,
    );
    PF.skeleton(b, X(-6.5), oy + VY + 0.02, Z(-28.8), 0.8);
    D.fluoro(b, X(-7.5), oy + VY + 3.1, Z(-30), 0, 2.0, true, oy + VY + 3.4);
    anchors.barracks = A(-7.5, VY, -30, HP);
    anchors.barracks_safe = A(-11.7, VY, -25.2, HP);
    anchors.spawn4 = A(-7.5, VY, -32, 0);

    // vault control room (east, x 3.1..9.4, z -36..-24)
    floor("tile_floor", 3.1, -36, 9.4, -24, VY);
    W("vault_dark", "x", 3.1, 10, -36.6, -36, VY, VY + 3.6);
    W("vault_dark", "x", 3.1, 10, -24, -23.4, VY, VY + 3.6);
    W("vault_dark", "z", -36.6, -23.4, 9.4, 10, VY, VY + 3.6);
    ceil("panel", 3.1, -36, 9.4, -24, VY + 3.4);
    for (let i = 0; i < 9; i++)
      D.monitor(
        b,
        X(5 + (i % 3) * 0.7),
        oy + VY + 1.1 + Math.floor(i / 3) * 0.48,
        Z(-35.7),
        0,
        i % 4 !== 1,
      );
    b.boxMM("panel", X(4.2), oy + VY, Z(-36), X(7.6), oy + VY + 1.1, Z(-35.1), {
      seg: false,
    });
    PF.colMM(X(4.2), oy + VY, Z(-36), X(7.6), oy + VY + 1.1, Z(-35.1), {
      walkable: false,
    });
    // big status board (vault door schematic)
    const schK = PF.texMat(
      "fed_schem",
      PF.canvasTex("pf_fed_schem", 512, 256, (ctx, w, h) => {
        ctx.fillStyle = "#120a02";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#ffb347";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(150, 130, 80, 0, TAU);
        ctx.stroke();
        ctx.strokeRect(126, 60, 48, 140);
        ctx.font = "bold 18px monospace";
        ctx.fillStyle = "#ffc870";
        ctx.fillText("CYLINDER DOOR — 90 TONS", 260, 50);
        ctx.fillText("STATUS: SEALED", 260, 90);
        ctx.fillText("FRAME: 140 TONS", 260, 130);
        ctx.fillText("ROTATION: 90 DEG", 260, 170);
        ctx.fillText("SENTINEL: ACTIVE", 260, 210);
        for (let y = 0; y < h; y += 3) {
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(0, y, w, 1);
        }
      }),
      { emissive: 1.0, noShadow: true },
    );
    b.quad(schK, X(9.38), oy + VY + 1.9, Z(-30), 2.8, 1.4, {
      ry: -HP,
      noAO: true,
    });
    PF.skeleton(b, X(6), oy + VY + 0.02, Z(-27), 2.5); // the vault manager
    D.chair(b, X(6.2), oy + VY, Z(-34.4), PI, false, "panel");
    anchors.vault_terminal = A(6.3, VY, -34.9, 0);
    anchors.control = A(6, VY, -30, 0);
    anchors.spawn5 = A(0, VY, -22, 0);

    // ---- antechamber x -10..10, z -60..-40 (H 8) ----
    floor("vault_dark", -10, -60, 10, -40, VY);
    W("vault_steel", "x", -10.6, 10.6, -40, -39.4, VY, VY + 8, [
      { c: 0, w: 5, y0: VY, h: 3.6 },
    ]);
    W("vault_steel", "z", -60, -39.4, -10.6, -10, VY, VY + 8);
    W("vault_steel", "z", -60, -39.4, 10, 10.6, VY, VY + 8, [
      { c: -45, w: 1.6, y0: VY, h: 2.6 },
    ]);
    ceil("vault_dark", -10, -60, 10, -40, VY + 8);
    for (let x = -9; x <= 9; x += 3)
      b.box("vault_dark", X(x), oy + VY + 7.4, Z(-50), 0.4, 0.6, 20, {
        seg: false,
      });
    for (const sx of [-1, 1])
      for (let z = -58; z <= -42; z += 4)
        b.box("vault_steel", X(sx * 9.8), oy + VY, Z(z), 0.4, 8, 0.8, {
          seg: false,
          grime: 0.3,
        });
    for (const [x, z] of [
      [-6, -44],
      [6, -44],
      [-6, -55],
      [6, -55],
    ]) {
      b.box("lamp_warm", X(x), oy + VY + 7.2, Z(z), 1.8, 0.12, 0.5, {
        seg: false,
        noAO: true,
      });
      PF.glow(P(x, VY + 7.1, z), 0xe8f0ff, 2.2, root, { intensity: 0.8 });
    }
    // the cylinder door frame (north wall z -60..-63)
    W("vault_steel", "x", -10.6, 10.6, -63.6, -60, VY, VY + 8, [
      { c: 0, w: 4.4, y0: VY, h: 4.2 },
    ]);
    b.boxMM(
      "vault_dark",
      X(-2.4),
      oy + VY,
      Z(-63.6),
      X(2.4),
      oy + VY + 0.1,
      Z(-60),
      { seg: false },
    );
    // frame ring around the cylinder cavity
    b.add("vault_steel", new THREE.TorusGeometry(2.25, 0.35, 8, 28), {
      m: PF.m4(X(0), oy + VY + 2.0, Z(-59.9), 0, 0),
    });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      b.cyl(
        "chrome",
        X(Math.cos(a) * 2.25),
        oy + VY + 2.0 + Math.sin(a) * 2.25,
        Z(-59.6),
        0.12,
        0.12,
        0.25,
        8,
        { hSeg: 1, rx: HP },
      );
    }
    // the 140-ton frame the cylinder turns in: stepped steel jambs & head, rivet rows, hydraulic locking rams,
    // hazard-striped sweep on the floor, stencilled level plate
    for (const [x0, x1, y0, y1] of [
      [-3.6, -2.2, 0, 4.2],
      [2.2, 3.6, 0, 4.2],
      [-3.6, 3.6, 4.2, 5.6],
    ]) {
      b.boxMM(
        "vault_steel",
        X(x0),
        oy + VY + y0,
        Z(-60.05),
        X(x1),
        oy + VY + y1,
        Z(-59.7),
        { grime: 0.3 },
      );
      b.boxMM(
        "vault_dark",
        X(x0 + 0.15),
        oy + VY + y0 + (y0 ? 0.15 : 0),
        Z(-59.72),
        X(x1 - 0.15),
        oy + VY + y1 - 0.15,
        Z(-59.6),
        { seg: false, grime: 0.4 },
      );
    }
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      for (const sx of [-1, 1])
        b.sphere(
          "chrome",
          X(sx * 3.35),
          oy + VY + 0.3 + t * 5.0,
          Z(-59.62),
          0.06,
          { ws: 5, hs: 3 },
        );
      b.sphere("chrome", X(-3.3 + t * 6.6), oy + VY + 5.38, Z(-59.62), 0.06, {
        ws: 5,
        hs: 3,
      });
    }
    for (const sx of [-1, 1]) {
      b.cyl("vault_dark", X(sx * 5.0), oy + VY, Z(-59.6), 0.42, 0.42, 5.2, 12, {
        hSeg: 2,
        grime: 0.4,
      });
      PF.col(X(sx * 5.0), Z(-59.6), 0.9, 0.9, oy + VY, oy + VY + 6.6, 0, {
        walkable: false,
        surface: "metal",
      });
      b.cyl(
        "chrome",
        X(sx * 5.0),
        oy + VY + 5.2,
        Z(-59.6),
        0.18,
        0.18,
        1.4,
        10,
        { hSeg: 1 },
      );
      b.box(
        "vault_steel",
        X(sx * 5.0),
        oy + VY + 6.5,
        Z(-59.75),
        1.2,
        0.5,
        0.5,
        { seg: false },
      );
      for (const y of [0.6, 4.6])
        b.box(
          "vault_steel",
          X(sx * 5.0),
          oy + VY + y,
          Z(-59.85),
          1.1,
          0.3,
          0.4,
          { seg: false },
        );
      b.beam(
        "rust",
        P(sx * 5.0, VY + 3.2, -59.2),
        P(sx * 3.0, VY + 3.2, -59.55),
        0.08,
        0.08,
        {},
      ); // hydraulic line
    }
    b.quad(hazK, X(0), oy + VY + 0.012, Z(-59.1), 7.2, 0.9, {
      rx: -HP,
      noAO: true,
    });
    b.quad(hazK, X(0), oy + VY + 0.012, Z(-55.6), 7.2, 0.5, {
      rx: -HP,
      noAO: true,
    });
    const lv5K = PF.texMat(
      "fed_level5",
      PF.signTex(
        "fed_level5",
        [
          "VAULT LEVEL V",
          "80 FT BELOW LIBERTY STREET",
          "COUNTERWEIGHTED ROTATING DOOR — STAND CLEAR",
        ],
        "stencil",
        512,
        192,
        { bg: "#2a2c2c", fg: "#d8d0b0" },
      ),
    );
    b.quad(lv5K, X(-6.9), oy + VY + 2.4, Z(-59.95), 2.4, 0.9, {});
    const vK = PF.texMat(
      "fed_vaultsign",
      PF.signTex("fed_vaultsign", ["GOLD VAULT"], "enamel", 512, 128, {
        bg: "#1a1a1a",
        fg: "#e0c060",
      }),
    );
    b.quad(vK, X(0), oy + VY + 6.3, Z(-59.95), 3.2, 0.8, {});
    // alarm beacons (rotating red lights when the alarm is tripped)
    const beacons = [];
    for (const [x, z] of [
      [-9.6, -41],
      [9.6, -41],
      [-9.6, -59],
      [9.6, -59],
      [0, -39.6],
    ]) {
      b.cyl("iron", X(x), oy + VY + 6, Z(z), 0.18, 0.2, 0.2, 8, { hSeg: 1 });
      const bc = PF.mesh(
        "lamp_red",
        new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8),
      );
      bc.position.set(X(x), oy + VY + 6.35, Z(z));
      root.add(bc);
      bc.visible = false;
      beacons.push(bc);
      const gl = PF.glow(P(x, VY + 6.4, z), 0xff2010, 2.8, root, {
        intensity: 1.6,
        flicker: 0.9,
      });
      beacons.push(gl);
    }
    // gantry & cable clutter, a crate barricade the last crew built
    D.crates(b, X(-6), oy + VY, Z(-47), 2, 5, true);
    D.crates(b, X(-4.8), oy + VY, Z(-46.2), 1, 6, true);
    PF.sandbags(b, X(-7.6), Z(-48.4), X(-3.6), Z(-48.4), 3, { y: oy + VY });
    for (const [x, z, a] of [
      [-5, -50, 0.7],
      [-2.2, -44.8, 2.9],
      [3.8, -52, -0.5],
    ])
      PF.skeleton(b, X(x), oy + VY + 0.02, Z(z), a);
    anchors.antechamber = A(0, VY, -48, 0);
    anchors.boss = A(0, VY, -53.5, PI);
    anchors.spawn6 = A(6, VY, -50, 0);

    // ---- maintenance passage x 10.6..14, z -46..-12.6 → egress stair ----
    floor("vault_dark", 10.6, -46, 14, -12.6, VY);
    W("vault_dark", "z", -46.6, -16, 14, 14.6, VY, VY + 3.2);
    W("vault_dark", "x", 10, 14.6, -46.6, -46, VY, VY + 3.2);
    W("vault_dark", "z", -39.4, -12, 10, 10.6, VY, VY + 3.2);
    W("vault_dark", "x", 10, 16, -12.6, -12, VY, VY + 3.2);
    ceil("panel", 10.6, -46, 14, -12.6, VY + 3);
    for (let z = -44; z <= -14; z += 7) {
      b.cyl("rust", X(13.6), oy + VY + 2.6, Z(z), 0.14, 0.14, 7, 8, {
        hSeg: 2,
        rx: HP,
      });
      D.fluoro(
        b,
        X(12.3),
        oy + VY + 2.8,
        Z(z),
        HP,
        1.4,
        z % 14 === 0,
        oy + VY + 3,
      );
    }
    floor("vault_dark", 14, -16, 16, -12.6, VY); // stub to the shaft door
    W("vault_dark", "x", 14, 16, -16.6, -16, VY, VY + 3.2);
    anchors.passage = A(12.3, VY, -30, 0);

    // ---- EGRESS STAIRWELL (x 16..22, z -24..-12), vault (VY) → ground (0) ----
    const SX0 = 16.6,
      SX1 = 21.4,
      SZ0 = -23.4,
      SZ1 = -12.6,
      LZ0 = -21.8,
      LZ1 = -14.2,
      FW = 2.0;
    W("fed_stone", "z", -24, -12, 16, 16.6, VY, 4, [
      { c: -13.4, w: 1.4, y0: VY, h: 2.5 },
      { c: -13.4, w: 1.4, y0: 0, h: 2.5 },
    ]);
    W("fed_stone", "z", -24, -12, 21.4, 22, VY, 4, [
      { c: -13.4, w: 1.3, y0: -15, h: 2.5 },
    ]);
    W("fed_stone", "x", 16, 22, -24, -23.4, VY, 4);
    W("fed_stone", "x", 16, 22, -12.6, -12, VY, 4);
    ceil("concrete_dark", 16.6, -23.4, 21.4, -12.6, 3.6);
    floor("concrete", SX0, SZ1 - 1.6, SX1, SZ1, VY);
    const lv = [];
    for (let y = VY; y <= 0.01; y += 2.5) lv.push(y);
    for (let i = 0; i < lv.length - 1; i++) {
      const y0 = lv[i],
        y1 = lv[i + 1];
      const north = i % 2 === 0; // bottom landing is south; first flight climbs north
      if (north)
        PF.stairs(
          b,
          "concrete",
          X(SX0 + FW / 2),
          Z(LZ1),
          PI,
          FW,
          LZ1 - LZ0,
          oy + y0,
          oy + y1,
          { base: oy + y0 - 0.3 },
        );
      else
        PF.stairs(
          b,
          "concrete",
          X(SX1 - FW / 2),
          Z(LZ0),
          0,
          FW,
          LZ1 - LZ0,
          oy + y0,
          oy + y1,
          { base: oy + y0 - 0.3 },
        );
      const lz0 = north ? SZ0 : LZ1,
        lz1 = north ? LZ0 : SZ1;
      b.boxMM(
        "concrete",
        X(SX0),
        oy + y1 - 0.3,
        Z(lz0),
        X(SX1),
        oy + y1,
        Z(lz1),
        { grime: 0.6 },
      );
      PF.colMM(X(SX0), oy + y1 - 0.3, Z(lz0), X(SX1), oy + y1, Z(lz1));
      // level signs on the landings
      if (!north && y1 < -0.1) {
        const lvl = Math.round(-y1 / 5);
        const sk = PF.texMat(
          "fed_b" + lvl,
          PF.signTex(
            "fed_b" + lvl,
            [
              "SUB-BASEMENT B" + lvl,
              lvl === 3 ? "CURRENCY DESTRUCTION" : "SEALED — FLOODING",
            ],
            "enamel",
            256,
            128,
            { bg: "#1e2a24", fg: "#e0d8b8" },
          ),
        );
        b.quad(sk, X(21.35), oy + y1 + 1.8, Z(-13.4), 1.0, 0.5, { ry: -HP });
      }
    }
    b.boxMM(
      "concrete",
      X(SX0 + FW + 0.05),
      oy + VY,
      Z(LZ0),
      X(SX1 - FW - 0.05),
      oy + 0.2,
      Z(LZ1),
      { grime: 0.6 },
    );
    PF.colMM(
      X(SX0 + FW + 0.05),
      oy + VY,
      Z(LZ0),
      X(SX1 - FW - 0.05),
      oy + 0.2,
      Z(LZ1),
      { walkable: false },
    );
    for (let y = VY + 2.4; y < 0; y += 5) {
      b.box("lamp_red", X(19), oy + y, Z(-23.35), 0.3, 0.15, 0.08, {
        seg: false,
        noAO: true,
      });
      PF.glow(P(19, y, -23.2), 0xff5030, 0.9, root, {
        intensity: 0.8,
        flicker: 0.4,
      });
    }
    // sealed sub-basement doors (rubble / chained)
    for (const y of [-5, -10, -20]) {
      b.box("rust", X(16.7), oy + y, Z(-13.4), 0.1, 2.4, 1.4, { seg: false });
      b.rock("rubble", X(17.3), oy + y, Z(-13.8), 0.5, { flat: 0.5 });
    }
    // B3: currency incinerator room (x 22..28, z -24..-14) off the east wall at y -15
    floor("concrete", 22, -20, 28, -12, -15);
    W("fed_stone", "x", 22, 28.6, -20.6, -20, -15, -11);
    W("fed_stone", "x", 22, 28.6, -12, -11.4, -15, -11);
    W("fed_stone", "z", -20.6, -11.4, 28, 28.6, -15, -11);
    ceil("concrete_dark", 22, -20, 28, -12, -11.4);
    b.box("rust", X(26.3), oy - 15, Z(-17.5), 2.4, 2.6, 2.6, {
      seg: false,
      grime: 0.7,
    });
    b.cyl("rust", X(26.3), oy - 12.4, Z(-17.5), 0.4, 0.4, 1.0, 8, { hSeg: 1 });
    b.box("fire", X(25.05), oy - 14.4, Z(-17.5), 0.05, 0.6, 0.9, {
      seg: false,
    });
    PF.col(X(26.3), Z(-17.5), 2.4, 2.6, oy - 15, oy - 12.4, 0, {
      walkable: false,
    });
    D.papers(b, X(24.3), oy - 14.98, Z(-15.5), 1.5, 30, 303);
    const incK = PF.texMat(
      "fed_inc",
      PF.signTex(
        "fed_inc",
        ["UNFIT CURRENCY", "DESTRUCTION LOG", "$1,140,000,000 — MAR 4"],
        "engraved",
        512,
        256,
        { bg: "#b8b0a0", fg: "#2a2418" },
      ),
    );
    b.quad(incK, X(22.04), oy - 13.2, Z(-18), 1.2, 0.6, { ry: HP });
    anchors.b3 = A(24.2, -15, -17.5, 0);
    // top of the stair: bolted door onto the ground-floor back corridor
    boltDoor(root, X(16.3), oy, Z(-13.4), anchors);
    // vault-level door into the stair (from the passage) — open steel door frame
    b.box("vault_steel", X(16.3), oy + VY + 2.5, Z(-13.4), 0.6, 0.3, 1.8, {
      seg: false,
    });
    const exK = PF.texMat(
      "fed_egress",
      PF.signTex(
        "fed_egress",
        ["EMERGENCY EGRESS", "STAIR TO GROUND"],
        "enamel",
        512,
        128,
        { bg: "#1c5a2a", fg: "#f0f0e0" },
      ),
    );
    b.quad(exK, X(15.9), oy + VY + 3.0, Z(-13.4), 1.4, 0.35, { ry: -HP });
    anchors.egress_bottom = A(18.8, VY, -13.4, 0);

    // ============================ THE GOLD VAULT ============================
    const VZ0 = -92,
      VZ1 = -63.6;
    floor("vault_dark", -18, VZ0, 18, VZ1, VY);
    W("vault_steel", "x", -18.6, 18.6, VZ0 - 0.6, VZ0, VY, VY + 5, [
      { c: 0, w: 2.2, y0: VY, h: 2.6 },
    ]);
    W("vault_steel", "z", VZ0 - 0.6, VZ1, -18.6, -18, VY, VY + 5);
    W("vault_steel", "z", VZ0 - 0.6, VZ1, 18, 18.6, VY, VY + 5);
    W("vault_steel", "x", -18.6, -10.6, -63.6, -63, VY, VY + 5);
    W("vault_steel", "x", 10.6, 18.6, -63.6, -63, VY, VY + 5);
    floor("vault_dark", -2.4, -63.6, 2.4, -60, VY);
    ceil("vault_dark", -18, VZ0, 18, VZ1, VY + 5);
    for (let x = -16; x <= 16; x += 4)
      b.box(
        "vault_steel",
        X(x),
        oy + VY + 4.7,
        Z((VZ0 + VZ1) / 2),
        0.3,
        0.3,
        VZ1 - VZ0,
        { seg: false },
      );
    // caged ceiling lamps over the aisles (baked light above) + warm glow sprites
    for (const x of [-12, 0, 12])
      for (let z = -88; z <= -66; z += 7) {
        b.box("lamp_warm", X(x), oy + VY + 4.45, Z(z), 0.5, 0.1, 0.5, {
          seg: false,
          noAO: true,
        });
        b.box("iron", X(x), oy + VY + 4.55, Z(z), 0.62, 0.05, 0.62, {
          seg: false,
        });
        if (x === 0)
          PF.glow(P(x, VY + 4.3, z), 0xffd890, 1.6, root, { intensity: 0.75 }); // sprites on the main aisle only (draw calls)
      }
    // compartments: rows of 3 m cages. Row faces: west wall row (front x -14, facing +x), block A (-10..-2), block B (2..10), east row (front x 14)
    const rows = [
      { back: -18, front: -14, dir: 1 },
      { back: -6, front: -10, dir: -1 },
      { back: -6, front: -2, dir: 1 },
      { back: 6, front: 2, dir: -1 },
      { back: 6, front: 10, dir: 1 },
      { back: 18, front: 14, dir: -1 },
    ];
    const comps = [];
    let num = 1;
    // compartments with an open cage door and a lootable bullion crate inside (lock = the crate's G.locks spec)
    const COMPS_LOOT = {
      1: { n: 6, name: "Compartment 001 (forced open)" },
      46: { n: 6, name: "Compartment 046 (forced open)" },
      12: {
        n: 10,
        name: "Bullion Crate — Compartment 012",
        lock: PF.regLock({
          id: "pf_lk_fed_comp012",
          label: "Bullion Crate — Compartment 012",
          code: "4825",
          kind: "container",
          hint: "Bullion Inventory on the Level V vault-control teletype.",
        }),
      },
      30: {
        n: 14,
        name: "Bullion Crate — Compartment 030",
        lock: PF.regLock({
          id: "pf_lk_fed_comp030",
          label: "Bullion Crate — Compartment 030",
          code: "9361",
          kind: "container",
          hint: "Compartment audit on the Vault Manager's teletype.",
        }),
      },
      24: {
        n: 20,
        name: "Bullion Crate — Compartment 024 (RESERVE)",
        lock: PF.regLock({
          id: "pf_lk_fed_comp024",
          label: "Reserve Crate — Compartment 024",
          key: "pf_fed_reserve_key",
          kind: "container",
          hint: "The reserve key is in the Vault Manager's safe.",
        }),
      },
      26: {
        n: 4,
        name: "Bullion Crate — Compartment 026",
        lock: PF.regLock({
          id: "pf_lk_fed_comp026",
          label: "Bullion Crate — Compartment 026",
          code: "2604",
          kind: "container",
          hint: "Brass tag wired to the cage of compartment 026.",
        }),
      },
    };
    PF.fedSpecial = COMPS_LOOT;
    for (const row of rows) {
      for (let k = 0; k < 8; k++) {
        const z0 = VZ0 + 1 + k * 3.1,
          z1 = z0 + 3.0,
          zc = (z0 + z1) / 2;
        const xa = Math.min(row.back, row.front),
          xb = Math.max(row.back, row.front);
        comps.push({
          xa,
          xb,
          zc,
          z0,
          z1,
          front: row.front,
          dir: row.dir,
          num: num++,
          last: k === 7,
        });
      }
    }
    for (const c of comps) {
      const sp = COMPS_LOOT[c.num];
      const divider = (zz) => {
        b.boxMM(
          "vault_steel",
          X(c.xa),
          oy + VY,
          Z(zz - 0.05),
          X(c.xb),
          oy + VY + 3.2,
          Z(zz + 0.05),
          { seg: false, grime: 0.3 },
        );
        PF.colMM(
          X(c.xa),
          oy + VY,
          Z(zz - 0.06),
          X(c.xb),
          oy + VY + 3.2,
          Z(zz + 0.06),
          { walkable: false },
        );
      };
      divider(c.z0);
      if (c.last) divider(c.z1);
      b.boxMM(
        "vault_steel",
        X(c.xa),
        oy + VY + 3.2,
        Z(c.z0),
        X(c.xb),
        oy + VY + 3.3,
        Z(c.z1),
        { seg: false },
      );
      for (const yy of [3.1])
        b.box("iron", X(c.front), oy + VY + yy, Z(c.zc), 0.06, 0.08, 3.0, {
          seg: false,
        });
      if (sp) {
        // the cage door hangs open: bars on a swung leaf, frame posts only
        const hx = X(c.front),
          hz = Z(c.z0 + 0.1);
        const M = PF.m4(hx, oy + VY, hz, c.dir > 0 ? -1.2 : PI + 1.2);
        for (let i = 0; i < 14; i++)
          b.add("iron", new THREE.BoxGeometry(0.04, 3.0, 0.04), {
            m: new THREE.Matrix4().multiplyMatrices(
              M,
              PF.m4(0.1 + i * 0.2, 1.5, 0),
            ),
          });
        for (const yy of [0.2, 1.5, 2.9])
          b.add("iron", new THREE.BoxGeometry(2.8, 0.07, 0.05), {
            m: new THREE.Matrix4().multiplyMatrices(M, PF.m4(1.4, yy, 0)),
          });
        if (!sp.lock) {
          b.rock(
            "rubble",
            X(c.front + c.dir * 0.8),
            oy + VY,
            Z(c.zc + 0.8),
            0.25,
            { flat: 0.6 },
          );
          b.box(
            "brass",
            X(c.front + c.dir * 0.5),
            oy + VY + 0.02,
            Z(c.zc - 1.0),
            0.2,
            0.06,
            0.15,
            { ry: 0.7, seg: false },
          );
        }
        c.open = true;
        continue;
      }
      for (let zz = c.z0 + 0.2; zz < c.z1; zz += 0.2)
        b.box("iron", X(c.front), oy + VY, Z(zz), 0.04, 3.2, 0.04, {
          seg: false,
          grime: 0.1,
        });
      for (const yy of [0.1, 1.6])
        b.box("iron", X(c.front), oy + VY + yy, Z(c.zc), 0.06, 0.08, 3.0, {
          seg: false,
        });
      PF.colMM(
        X(c.front - 0.08),
        oy + VY,
        Z(c.z0),
        X(c.front + 0.08),
        oy + VY + 3.2,
        Z(c.z1),
        { walkable: false },
      );
      b.box(
        "brass",
        X(c.front + c.dir * 0.06),
        oy + VY + 1.2,
        Z(c.zc + 0.9),
        0.05,
        0.25,
        0.18,
        { seg: false },
      ); // padlock hasp
    }
    PF.fedComps = comps;
    // the last back wall of each double block
    for (const x of [-6, 6])
      b.boxMM(
        "vault_steel",
        X(x - 0.06),
        oy + VY,
        Z(VZ0 + 1),
        X(x + 0.06),
        oy + VY + 3.3,
        Z(VZ0 + 1 + 8 * 3.1),
        { seg: false },
      );
    // number plates
    const numTex = PF.canvasTex(
      "pf_fed_nums",
      512,
      512,
      (ctx) => {
        ctx.fillStyle = "#20201c";
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = "#e8d8a0";
        ctx.font = "bold 34px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < 64; i++)
          ctx.fillText(
            String(i + 1).padStart(3, "0"),
            (i % 8) * 64 + 32,
            Math.floor(i / 8) * 64 + 32,
          );
      },
      { clamp: true },
    );
    const numK = PF.texMat("fed_nums", numTex, { rough: 0.6 });
    for (const c of comps) {
      const i = c.num - 1,
        u0 = (i % 8) / 8,
        v0 = 1 - (Math.floor(i / 8) + 1) / 8;
      b.quad(
        numK,
        X(c.front + c.dir * 0.09),
        oy + VY + 2.75,
        Z(c.zc),
        0.36,
        0.36,
        {
          ry: c.dir > 0 ? HP : -HP,
          uvRect: [u0, v0, u0 + 1 / 8, v0 + 1 / 8],
          grime: 0.1,
          noAO: true,
        },
      );
    }
    // cross aisle: scales table, bullion carts, counting table
    b.box("marble_dark", X(-9), oy + VY, Z(-65.5), 3.4, 0.9, 1.2, {
      seg: false,
    });
    b.cyl("brass", X(-9), oy + VY + 0.9, Z(-65.5), 0.12, 0.2, 1.3, 8, {
      hSeg: 1,
    });
    b.box("brass", X(-9), oy + VY + 2.2, Z(-65.5), 2.4, 0.08, 0.1, {
      rz: 0.08,
      seg: false,
    });
    for (const sx of [-1, 1]) {
      b.cyl(
        "brass",
        X(-9 + sx * 1.15),
        oy + VY + 1.5,
        Z(-65.5),
        0.4,
        0.35,
        0.08,
        12,
        { hSeg: 1 },
      );
      b.beam(
        "brass",
        P(-9 + sx * 1.15, VY + 2.2 + sx * -0.09, -65.5),
        P(-9 + sx * 1.15, VY + 1.58, -65.5),
        0.015,
        0.015,
      );
    }
    PF.col(X(-9), Z(-65.5), 3.4, 1.2, oy + VY, oy + VY + 0.9, 0, {
      walkable: false,
    });
    for (const [x, z, a] of [
      [8, -65.6, 0.2],
      [4.5, -66, -0.4],
    ]) {
      b.box("vault_steel", X(x), oy + VY + 0.35, Z(z), 1.8, 0.1, 0.9, {
        ry: a,
        seg: false,
      });
      for (const dx of [-0.7, 0.7])
        for (const dz of [-0.3, 0.3])
          b.cyl(
            "tire",
            X(x + dx * Math.cos(a) + dz * Math.sin(a)),
            oy + VY,
            Z(z - dx * Math.sin(a) + dz * Math.cos(a)),
            0.12,
            0.12,
            0.08,
            8,
            { hSeg: 1, rz: HP },
          );
      PF.col(X(x), Z(z), 1.9, 1.0, oy + VY, oy + VY + 0.9, a, {
        walkable: false,
      });
    }
    anchors.vault = A(0, VY, -70, 0);
    anchors.scales = A(-9, VY, -66.8, 0);

    // ---- vault office (x -6..6, z -99..-92.6) ----
    floor("carpet", -6, -99, 6, VZ0 - 0.6, VY);
    W("vault_steel", "x", -6.6, 6.6, -99.6, -99, VY, VY + 3.6);
    W("vault_steel", "z", -99.6, VZ0 - 0.6, -6.6, -6, VY, VY + 3.6);
    W("vault_steel", "z", -99.6, VZ0 - 0.6, 6, 6.6, VY, VY + 3.6);
    ceil("plaster_w", -6, -99, 6, VZ0 - 0.6, VY + 3.4);
    b.box("mahogany", X(0), oy + VY, Z(-96.5), 2.6, 0.8, 1.2, { seg: false });
    PF.col(X(0), Z(-96.5), 2.6, 1.2, oy + VY, oy + VY + 0.8, 0, {
      walkable: false,
    });
    D.chair(b, X(0), oy + VY, Z(-97.6), 0, false, "velvet");
    // display case for the Gold Standard pistol
    b.box("mahogany", X(-4.4), oy + VY, Z(-96), 1.2, 0.9, 0.7, { seg: false });
    b.box("glass_dark", X(-4.4), oy + VY + 0.9, Z(-96), 1.2, 0.35, 0.7, {
      seg: false,
    });
    PF.col(X(-4.4), Z(-96), 1.2, 0.7, oy + VY, oy + VY + 1.25, 0, {
      walkable: false,
    });
    for (let i = 0; i < 3; i++)
      D.painting(
        b,
        4 + i,
        X(-3 + i * 3),
        oy + VY + 2.0,
        Z(-98.95),
        1.0,
        0.8,
        0,
        { frame: "gilt" },
      );
    b.box("lamp_warm", X(0), oy + VY + 3.2, Z(-95.8), 0.4, 0.08, 0.4, {
      seg: false,
      noAO: true,
    });
    PF.glow(P(0, VY + 3.1, -95.8), 0xffd8a0, 1.2, root, { intensity: 0.9 });
    anchors.office = A(0, VY, -94, PI);
    anchors.ledger = A(0.5, VY + 0.82, -96.4, 0);
    anchors.pistol = A(-4.4, VY + 0.92, -96, 0);
    anchors.office_terminal = A(3.9, VY, -98.3, 0);
    anchors.office_safe = A(5.7, VY + 1.0, -95.5, -HP);

    const g = b.build(root, { lodDistInt: 400 });
    g.name = "fed_interior";

    // ---------------- gold bars (one instanced draw call) ----------------
    goldBars(root, comps, X, Z, oy + VY, anchors);
    // ---------------- the cylinder door ----------------
    cylinderDoor(root, X(0), oy + VY, Z(-61.4), anchors);

    // ---------------- dynamic systems ----------------
    const applyAlarm = () => {
      const on = !!PF.flag("fed_alarm");
      for (const bc of beacons) if (bc) bc.visible = on;
    };
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "fed_alarm") applyAlarm();
      if (k === "*" || k === "fed_grid") grid.visible = !!PF.flag("fed_grid");
    });
    PF.onReset.push(() => {
      grid.visible = true;
      for (const bc of beacons) if (bc) bc.visible = false;
    });
    let hitCD = 0,
      spin = 0;
    PF.updaters.push((dt) => {
      const p = G.player.pos;
      // laser grid: crossing it while active burns and trips the alarm
      if (hitCD > 0) hitCD -= dt;
      if (
        PF.flag("fed_grid") &&
        hitCD <= 0 &&
        Math.abs(p.x - X(0)) < 2.6 &&
        Math.abs(p.z - Z(-25.5)) < 0.45 &&
        p.y > oy + VY - 0.5 &&
        p.y < oy + VY + 2.2
      ) {
        hitCD = 1.2;
        try {
          G.player.damage(28, { type: "energy", source: "laser_grid" });
        } catch (e) {
          /* ignore */
        }
        PF.sfx("laser_impact", P(0, VY + 1.2, -25.5));
        PF.sfx("gun_laser", P(0, VY + 1.2, -25.5), { volume: 0.6 });
        try {
          G.fx.sparks(V3(p.x, p.y + 1.0, p.z));
        } catch (e) {
          /* optional */
        }
        tripAlarm();
      }
      if (PF.flag("fed_alarm")) {
        spin += dt;
        for (const bc of beacons) if (bc && bc.isMesh) bc.rotation.y = spin * 6;
      }
    });
    return anchors;
  }

  /** Alarm: siren, beacons, every robot in the cell turns on the player. */
  function tripAlarm() {
    if (PF.flag("fed_alarm")) return;
    PF.setFlag("fed_alarm", true);
    PF.sfx("cryo_alarm", null, { volume: 0.8 });
    PF.sfx("alarm", null, { volume: 0.5 });
    G.notify("ALARM! Vault security has been alerted.");
    try {
      const c = PF.cells.federal_reserve;
      for (const a of G.actors.list())
        if (
          !a.dead &&
          a.faction === "robots" &&
          Math.abs(a.pos.x - c.origin.x) < 170 &&
          Math.abs(a.pos.z - c.origin.z) < 170
        ) {
          if (a.setHostile) a.setHostile(true);
        }
    } catch (e) {
      /* ignore */
    }
    try {
      if (!PF.flag("fed_turrets_off") && PF.live("props"))
        G.props.setTurrets("pf_fed_vault", "hostile");
    } catch (e) {
      /* optional */
    }
  }
  PF.fedTripAlarm = tripAlarm;

  /** Bar gate (checkpoint) bound to a flag; opens from the security terminal or with its keypad code (opts.lock). */
  function barGate(root, x, y, z, w, h, flag, ry, opts) {
    const grp = new THREE.Group();
    const gb = PF.batch("fed_bargate_" + flag);
    const n = Math.round(w / 0.2);
    for (let i = 0; i <= n; i++)
      gb.box("iron", -w / 2 + (i * w) / n, 0, 0, 0.05, h, 0.05, {
        seg: false,
        grime: 0.2,
      });
    for (const yy of [0.15, h * 0.5, h - 0.1])
      gb.box("iron", 0, yy, 0, w, 0.08, 0.08, { seg: false });
    gb.build(grp);
    grp.position.set(x, y, z);
    grp.rotation.y = ry || 0;
    root.add(grp);
    const col = { c: null };
    const apply = () => {
      const open = !!PF.flag(flag);
      grp.position.y = y + (open ? h - 0.3 : 0);
      if (!open && !col.c)
        col.c = PF.col(x, z, w, 0.3, y, y + h, ry || 0, { walkable: false });
      if (open && col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
    };
    apply();
    PF.flagWatch.push((k) => {
      if (k === "*" || k === flag) apply();
    });
    PF.onReset.push(() => {
      if (col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
      grp.position.y = y;
      apply();
    });
    PF.use({
      pos: V3(x, y + 1.3, z),
      radius: 1.2,
      range: 2.6,
      label: opts.label,
      verb: () => (PF.flag(flag) ? "Examine" : "Open"),
      locked: () => (PF.flag(flag) ? null : "Keypad"),
      onInteract() {
        if (PF.flag(flag)) {
          G.notify("The gate is raised.");
          return;
        }
        const ok = () => {
          PF.setFlag(flag, true);
          PF.sfx("door_open", V3(x, y + 1, z));
        };
        PF.lockOpen(opts.lock, ok);
      },
    });
    return grp;
  }
  /** Simple lockable door slab (a gap with a closed leaf); stays open once unlocked. lock: G.locks spec. */
  function doorBlock(root, x, y, z, w, h, lock, label, flag) {
    PF.flagDefaults[flag] = false;
    const leaf = PF.mesh("mahogany", new THREE.BoxGeometry(w, h, 0.12));
    leaf.position.set(x, y + h / 2, z);
    root.add(leaf);
    const col = { c: null };
    const apply = () => {
      const open = !!PF.flag(flag);
      leaf.rotation.y = open ? 1.4 : 0;
      leaf.position.x = x + (open ? -w * 0.45 : 0);
      leaf.position.z = z + (open ? w * 0.45 : 0);
      if (!open && !col.c)
        col.c = PF.col(x, z, w, 0.3, y, y + h, 0, { walkable: false });
      if (open && col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
    };
    apply();
    PF.flagWatch.push((k) => {
      if (k === "*" || k === flag) apply();
    });
    PF.onReset.push(() => {
      if (col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
      apply();
    });
    PF.use({
      pos: V3(x, y + 1.2, z),
      radius: 0.9,
      range: 2.4,
      label,
      verb: () => (PF.flag(flag) ? "Close" : "Open"),
      locked: () => (PF.flag(flag) ? null : "Keypad"),
      onInteract() {
        if (PF.flag(flag)) return;
        const ok = () => {
          PF.setFlag(flag, true);
          PF.sfx("door_open", V3(x, y + 1, z));
        };
        PF.lockOpen(lock, ok);
      },
    });
  }
  /** The egress door at the top of the stairwell: bolted from the stair side. */
  function boltDoor(root, x, y, z) {
    const leaf = PF.mesh("vault_steel", new THREE.BoxGeometry(0.12, 2.5, 1.4));
    leaf.position.set(x, y + 1.25, z);
    root.add(leaf);
    const col = { c: null };
    const apply = () => {
      const open = !!PF.flag("fed_egress");
      leaf.rotation.y = open ? 1.5 : 0;
      leaf.position.x = x - (open ? 0.7 : 0);
      leaf.position.z = z + (open ? 0.7 : 0);
      if (!open && !col.c)
        col.c = PF.col(x, z, 0.3, 1.4, y, y + 2.5, 0, { walkable: false });
      if (open && col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
    };
    apply();
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "fed_egress") apply();
    });
    PF.onReset.push(() => {
      if (col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
      apply();
    });
    PF.use({
      pos: V3(x, y + 1.3, z),
      radius: 0.9,
      range: 2.6,
      label: "Emergency Egress Door",
      verb: () =>
        PF.flag("fed_egress")
          ? "Examine"
          : G.player.pos.x > x
            ? "Unbolt"
            : "Open",
      locked: () =>
        !PF.flag("fed_egress") && G.player.pos.x <= x
          ? "Barred from the other side"
          : null,
      onInteract() {
        if (PF.flag("fed_egress")) {
          G.notify("The egress door is propped open. A quick way back down.");
          return;
        }
        if (G.player.pos.x > x) {
          PF.setFlag("fed_egress", true);
          PF.sfx("door_open", V3(x, y + 1, z));
          G.notify(
            "You knock the crash bar free. Daylight — well, lobby light — beyond.",
          );
        } else {
          PF.sfx("door_locked");
          G.notify("The door is barred from the stairwell side.");
        }
      },
    });
  }
  /** Elevator doors: brass art-deco frame, sliding doors, floor dial. */
  function elevatorFront(b, x, y, z, ry, label) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    for (const sg of [-1, 1]) {
      const p = P(sg * 1.05, 0, 0.05);
      b.box("brass", p.x, y, p.z, 0.25, 3.0, 0.2, { ry, seg: false });
    }
    const t = P(0, 0, 0.05);
    b.box("brass", t.x, y + 2.8, t.z, 2.4, 0.35, 0.2, { ry, seg: false });
    for (const sg of [-1, 1]) {
      const p = P(sg * 0.45, 0, 0.0);
      b.box("bronze", p.x, y, p.z, 0.88, 2.78, 0.06, {
        ry,
        seg: false,
        grime: 0.4,
      });
    }
    const d = P(0, 0, 0.08);
    b.cyl("brass", d.x, y + 3.45, d.z, 0.4, 0.4, 0.06, 16, {
      hSeg: 1,
      thetaLen: PI,
      rx: HP,
      ry: ry + HP,
    });
    const pk = P(1.45, 0, 0.1);
    b.box("brass", pk.x, y + 1.2, pk.z, 0.2, 0.4, 0.06, { ry, seg: false });
    b.sphere("lamp_warm", pk.x, y + 1.3, pk.z, 0.04, { ws: 5, hs: 4 });
    void label;
  }

  // ===================================================================
  // Gold bars: instanced brick-pattern stacks in most compartments
  // ===================================================================
  function goldBars(root, comps, X, Z, y0, anchors) {
    const r = PF.rng("goldbars");
    const geo = new THREE.BoxGeometry(0.26, 0.085, 0.13);
    // trapezoid-ish bar: pinch the top face
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++)
      if (p.getY(i) > 0) {
        p.setX(i, p.getX(i) * 0.86);
        p.setZ(i, p.getZ(i) * 0.8);
      }
    geo.computeVertexNormals();
    // no env map in interiors → keep metalness moderate and push a warm emissive so the gold reads as GOLD
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf0c050,
      metalness: 0.55,
      roughness: 0.32,
      emissive: 0x9a6410,
      emissiveIntensity: 0.75,
    });
    mat.userData.shared = true;
    const mats = [];
    const m4 = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      e = new THREE.Euler(),
      sc = new THREE.Vector3(1, 1, 1),
      pos = new THREE.Vector3();
    const empty = new Set([3, 9, 14, 22, 27, 35, 40, 44]);
    PF.fedEmpty = empty;
    for (const c of comps) {
      if (empty.has(c.num)) continue;
      const stacks = 1 + (r() < 0.6 ? 1 : 0);
      for (let s = 0; s < stacks; s++) {
        const cx = (c.xa + c.xb) / 2 + (c.dir > 0 ? -0.5 : 0.5) * 0.6,
          cz = c.zc + (stacks === 2 ? (s ? 0.75 : -0.75) : 0);
        const layers = 4 + Math.floor(r() * 5);
        for (let L = 0; L < layers; L++) {
          const alongZ = L % 2 === 1;
          const nx = alongZ ? 7 : 4,
            nz = alongZ ? 4 : 8;
          for (let i = 0; i < nx; i++)
            for (let k = 0; k < nz; k++) {
              if (L === layers - 1 && r() < 0.35) continue;
              pos.set(
                X(cx + (i - (nx - 1) / 2) * (alongZ ? 0.14 : 0.27)),
                y0 + 0.2 + L * 0.086 + 0.0425,
                Z(cz + (k - (nz - 1) / 2) * (alongZ ? 0.27 : 0.14)),
              );
              e.set(0, alongZ ? HP : 0, 0);
              q.setFromEuler(e);
              mats.push(new THREE.Matrix4().compose(pos, q, sc));
            }
        }
        // pallet under the stack
      }
    }
    // loose bars on the carts, the scales and the counting table
    for (const [x, z, n] of [
      [8, -65.6, 20],
      [4.5, -66, 14],
    ])
      for (let i = 0; i < n; i++) {
        pos.set(
          X(x + ((i % 5) - 2) * 0.28),
          y0 + 0.45 + Math.floor(i / 10) * 0.086,
          Z(z + ((Math.floor(i / 5) % 2) - 0.5) * 0.15),
        );
        e.set(0, 0, 0);
        q.setFromEuler(e);
        mats.push(new THREE.Matrix4().compose(pos, q, sc));
      }
    const im = new THREE.InstancedMesh(geo, mat, mats.length);
    for (let i = 0; i < mats.length; i++) im.setMatrixAt(i, mats[i]);
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = false;
    im.receiveShadow = true;
    im.computeBoundingSphere && im.computeBoundingSphere();
    im.frustumCulled = false;
    im.name = "pf_fed_goldbars";
    root.add(im);
    // pallets (one merged batch)
    const pb = PF.batch("fed_pallets");
    for (const c of comps) {
      if (empty.has(c.num)) continue;
      const cx = (c.xa + c.xb) / 2 + (c.dir > 0 ? -0.3 : 0.3);
      pb.box("oak", X(cx), y0, Z(c.zc), 1.4, 0.2, 2.8, {
        seg: false,
        grime: 0.5,
      });
    }
    pb.build(root, { noLOD: true });
    PF.fedBarCount = mats.length;
    void anchors;
  }

  // ===================================================================
  // The 90-ton rotating cylinder door
  // ===================================================================
  function cylinderDoor(root, x, y, z) {
    const grp = new THREE.Group();
    grp.name = "pf_fed_cylinder";
    const R = 1.95,
      H = 3.9,
      SW = 0.75; // radius, height, half slot width
    const gb = PF.batch("fed_cyl");
    // two thick "D" halves separated by the slot (slot runs along local Z when open)
    for (const sg of [-1, 1]) {
      const sh = new THREE.Shape();
      const a0 = Math.asin(SW / R);
      sh.moveTo(sg * SW, -Math.sqrt(R * R - SW * SW));
      sh.absarc(
        0,
        0,
        R,
        sg > 0 ? -HP + a0 : HP + a0,
        sg > 0 ? HP - a0 : PI * 1.5 - a0,
        false,
      );
      sh.lineTo(sg * SW, -Math.sqrt(R * R - SW * SW));
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: H,
        bevelEnabled: false,
        curveSegments: 20,
      });
      g.rotateX(-HP);
      gb.add("vault_steel", g, { m: PF.m4(0, 0, 0), grime: 0.25 });
    }
    // bolt heads & rim bands
    for (const yy of [0.15, H - 0.15])
      gb.add("chrome", new THREE.TorusGeometry(R + 0.02, 0.06, 4, 32), {
        m: PF.m4(0, yy, 0, 0, HP),
      });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      if (Math.abs(Math.cos(a)) * R < SW + 0.1) continue;
      gb.sphere(
        "chrome",
        Math.cos(a) * (R + 0.02),
        H / 2,
        Math.sin(a) * (R + 0.02),
        0.08,
        { ws: 5, hs: 4 },
      );
    }
    // horizontal reinforcing bands and a stencilled weight plate on the drum
    for (const yy of [0.9, 1.9, 2.9])
      gb.add(
        "vault_dark",
        new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.14, 32, 1, true),
        { m: PF.m4(0, yy, 0) },
      );
    for (const sg of [-1, 1]) {
      gb.box("brass", sg * (SW + 0.3), 1.2, 0, 0.1, 0.5, 1.2, { seg: false });
      gb.cyl("chrome", sg * (R - 0.05), 1.95, 0, 0.18, 0.18, 0.12, 12, {
        hSeg: 1,
        rz: HP,
      });
    }
    // the slot floor + lintel plate
    gb.box("vault_dark", 0, 0, 0, SW * 2, 0.08, R * 2 - 0.2, { seg: false });
    gb.box("vault_steel", 0, 2.8, 0, SW * 2, H - 2.8, R * 2 - 0.3, {
      seg: false,
    });
    gb.build(grp, { noLOD: true });
    grp.position.set(x, y, z);
    root.add(grp);
    // colliders: closed = solid disc; open = two slabs beside the slot
    const cols = [];
    const setCols = (open) => {
      for (const c of cols) G.world.removeCollider(c);
      cols.length = 0;
      if (!open)
        cols.push(
          PF.col(x, z, R * 2, R * 2, y, y + H, 0, {
            walkable: false,
            surface: "metal",
          }),
        );
      else
        for (const sg of [-1, 1])
          cols.push(
            PF.col(
              x + sg * (SW + (R - SW) / 2),
              z,
              R - SW,
              R * 2,
              y,
              y + H,
              0,
              { walkable: false, surface: "metal" },
            ),
          );
    };
    // closed: slot runs east-west (rotation 90°); open: slot north-south (rotation 0)
    let ang = HP,
      target = HP,
      moving = false;
    const apply = (instant) => {
      target = PF.flag("fed_vault") ? 0 : HP;
      if (instant) {
        ang = target;
        grp.rotation.y = ang;
        setCols(!!PF.flag("fed_vault"));
      }
    };
    apply(true);
    PF.flagWatch.push((k) => {
      if (k === "*") apply(true);
      else if (k === "fed_vault") {
        apply(false);
        moving = true;
        setCols(false);
        PF.sfx("cryo_door", V3(x, y + 2, z), { volume: 1.0 });
        try {
          G.player.shake(0.25, 5.5);
        } catch (e) {
          /* ignore */
        }
      }
    });
    PF.onReset.push(() => {
      ang = HP;
      target = HP;
      grp.rotation.y = HP;
      setCols(false);
      moving = false;
    });
    PF.updaters.push((dt) => {
      if (!moving) return;
      const d = target - ang,
        step = dt * (HP / 6); // 6 seconds for the quarter turn
      if (Math.abs(d) <= step) {
        ang = target;
        moving = false;
        setCols(!!PF.flag("fed_vault"));
        if (PF.flag("fed_vault")) {
          PF.q.advance(
            "pf_gold",
            ["meet", "enter", "power", "descend", "door"],
            "ledger",
          );
          G.notify(
            "The cylinder door grinds into alignment. The Gold Vault is open.",
          );
        }
      } else ang += Math.sign(d) * step;
      grp.rotation.y = ang;
    });
  }

  // ===================================================================
  // CONTENT
  // ===================================================================
  PF.item({
    id: "pf_fed_keycard",
    type: "key",
    name: "Fed Security Keycard",
    weight: 0,
    value: 25,
    desc: 'A laminated keycard: "CHIEF OF SECURITY — ALL AREAS, GROUND FLOOR". The photo has been bitten off.',
  });
  PF.item({
    id: "pf_fed_override",
    type: "key",
    name: "Vault Override Card",
    weight: 0,
    value: 50,
    desc: "A gold-edged override card for the Level V vault control system. It still smells faintly of cigars.",
  });
  PF.item({
    id: "pf_reserve_ledger",
    type: "misc",
    name: "Reserve Ledger",
    weight: 2,
    value: 10,
    quest: true,
    desc: 'A leather-bound bullion ledger: every bar in the vault, every owner, every country. The last page is a transfer order dated March 5, 1967, marked "EXPEDITE — O.C.D. / LONG WINTER".',
  });
  PF.item({
    id: "pf_reel_heist",
    type: "tape",
    name: 'Tape reel: "Liberty Street Job"',
    title: 'Crew Recording — "Gus" Madigan',
    text: "[Wind. Whispering.]\n\nGUS: Okay, listen up. Front door's got turrets, lobby's got bolts-for-brains. Security office controls the elevator — that's the only way down to Level Five. Five floors of dirt and then the cylinder. Ninety tons. Turns like a lazy Susan when you ask it nice from the control room.\n\nVOICE 2: And the Sentinel?\n\nGUS: Big, tank-treaded, twin machine guns, very polite. We don't fight the Sentinel. We shut it off from the control room, or we run.\n\nVOICE 2: The control room wants a card. We ain't got a — \n\nGUS: Then we find the override card. Old Vane at the tavern swears there's one in the barracks safe.\n\n[A turret spins up nearby.]\n\nGUS: ...Run. RUN —\n\n[Recording ends.]",
  });
  PF.item({
    id: "pf_note_chief",
    type: "note",
    name: "Chief of Security's Memo",
    title: "MEMO — Ground Floor Security, 4 Mar 1967",
    text: 'To all ground-floor staff:\n\nEffective immediately the VAULT ELEVATOR is on SECURITY OFFICE POWER ONLY. Nobody rides without my say-so. That includes Civil Defense "auditors."\n\nThe security terminal takes MY keycard and nothing else. It is not "gold." Stop asking.\n\nThe records room keypad is now 3-9-0-6. Nobody but me needs in there.\n\nIf the sirens go: seal the checkpoint, power down the car, and for God\'s sake do not let anyone take the ledger.\n\n— R. Ostrowski, Chief of Security',
    learn: "pf_lk_fed_records",
  });
  PF.item({
    id: "pf_note_manager",
    type: "note",
    name: "Vault Manager's Note",
    title: "To whoever opens the vault",
    text: "If you are reading this you got past the Sentinel, which means you are either very clever or very well armed. Either way: congratulations.\n\nThe gold is real. All of it. Five hundred thousand bars at the last count, the property of forty-odd nations that no longer exist. Take what you can carry. You will find it is not very much. Gold is heavy. That is rather the point of gold.\n\nThe ledger in my desk is the only thing here worth more than the bullion. The Office of Civil Defense wanted it very badly. I would rather they didn't get it.\n\nThe office teletype answers to my wife's name, NANETTE. She would be mortified.\n\n— E. Whitlock, Vault Manager, Level V",
    learn: "pf_lk_fed_office_term",
  });
  PF.item({
    id: "pf_fed_reserve_key",
    type: "key",
    name: "Reserve Compartment Key",
    weight: 0,
    value: 0,
    desc: "A long steel key with a red enamel tag: COMPARTMENT 024 — RESERVE — MANAGER ONLY.",
  });
  PF.item({
    id: "pf_gold_standard",
    build() {
      const base = PF.live("items") ? G.items.get("pistol_10mm") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 12) * 1.6),
              critChance: 1.8,
              critMult: 1.6,
              skin: "gold",
              condDecay: (base.weapon.condDecay || 0.002) * 0.5,
              spread: (base.weapon.spread || 0.03) * 0.75,
            })
          : undefined;
      return {
        id: "pf_gold_standard",
        type: w ? "weapon" : "misc",
        name: "The Gold Standard",
        weight: 3,
        value: 1500,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: 'A presentation 10mm pistol plated in 24-karat gold, from the Vault Manager\'s display case. Engraved on the slide: "BACKED BY THE FULL FAITH AND CREDIT." Hits hard, criticals often, and never tarnishes.',
        weapon: w,
      };
    },
  });

  // --- terminals ---
  PF.terminal("pf_fed_security", {
    title: "FEDERAL RESERVE — GROUND SECURITY",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — FRBNY PHYSICAL SECURITY v4.0",
    lock: FED_LOCKS.security,
    entries: [
      {
        title: () =>
          PF.flag("fed_power")
            ? "Vault Elevator: ONLINE"
            : "Restore Power: Vault Elevator",
        action: () => {
          if (!PF.flag("fed_power")) {
            PF.setFlag("fed_power", true);
            PF.q.advance("pf_gold", ["meet", "enter", "power"], "descend");
            return "Vault elevator power restored. Car standing by at GROUND.";
          }
          return "Vault elevator already online.";
        },
      },
      {
        title: () =>
          PF.flag("fed_gate")
            ? "Checkpoint Gate: OPEN"
            : "Open Checkpoint Gate",
        action: () => {
          PF.setFlag("fed_gate", true);
          return "Checkpoint gate raised.";
        },
      },
      {
        title: () =>
          PF.flag("fed_turrets_off")
            ? "Turrets: OFFLINE"
            : "Deactivate Perimeter & Checkpoint Turrets",
        action: () => {
          PF.setFlag("fed_turrets_off", true);
          try {
            G.props.setTurrets("pf_fed_security", "off");
            G.props.setTurrets("pf_fed_vault", "off");
          } catch (e) {
            /* ignore */
          }
          return "All security turrets placed in standby.";
        },
      },
      {
        title: () =>
          PF.flag("fed_grid")
            ? "Disable Level V Beam Grid"
            : "Level V Beam Grid: OFFLINE",
        action: () => {
          PF.setFlag("fed_grid", false);
          return "Checkpoint 2 photoelectric beam grid disabled.";
        },
      },
      {
        title: "Incident Log",
        text: 'MAR 5 1967 (SUN) 09:31 — AIR RAID SIRENS. PROTOCOL OMEGA ENGAGED.\n09:47 — DETONATION, NORTH. Seismic alarm, all vaults.\n09:52 — Sunday duty staff evacuated to Level V shelter. Civil Defense "auditors" refused entry at gunpoint.\n10:14 — Chief Ostrowski: elevator on office power.\nMAR 1971 — Unauthorized entry (raiders, 6). Resolved by turrets.\nAUG 1978 — Unauthorized entry (raiders, 11). Resolved by turrets.\nNOV 1988 — Unauthorized entry ("Madigan crew", 4). 3 resolved. 1 reached Level V. Status unknown.',
      },
    ],
  });
  PF.terminal("pf_fed_vault", {
    title: "LEVEL V — VAULT CONTROL",
    header:
      "KESTREL TELETYPE CORP. — MODEL 40 — BULLION VAULT CONTROL (CLASS A)",
    lock: FED_LOCKS.vault,
    entries: [
      {
        title: () =>
          PF.flag("fed_vault")
            ? "Cylinder Door: OPEN"
            : "Rotate Cylinder Door to OPEN",
        action: () => {
          if (!PF.flag("fed_vault")) {
            PF.setFlag("fed_vault", true);
            return "ROTATION SEQUENCE INITIATED. STAND CLEAR OF THE CYLINDER.";
          }
          return "Door is open.";
        },
      },
      {
        title: () =>
          PF.flag("fed_warden_off")
            ? "VAULT SENTINEL: MAINTENANCE MODE"
            : "Place VAULT SENTINEL in Maintenance Mode",
        action: () => {
          PF.setFlag("fed_warden_off", true);
          wardenOff();
          return "SENTINEL UNIT 01: MAINTENANCE MODE. Weapons safed. Have a nice day.";
        },
      },
      {
        title: () =>
          PF.flag("fed_grid")
            ? "Disable Checkpoint Beam Grid"
            : "Beam Grid: OFFLINE",
        action: () => {
          PF.setFlag("fed_grid", false);
          return "Beam grid disabled.";
        },
      },
      {
        title: () => (PF.flag("fed_alarm") ? "Silence Alarm" : "Alarm: quiet"),
        cond: () => !!PF.flag("fed_alarm"),
        action: () => {
          PF.setFlag("fed_alarm", false);
          return "Alarm silenced. (The robots are still angry.)";
        },
      },
      {
        title: "Bullion Inventory (summary)",
        text: () =>
          "COMPARTMENTS: 122 (48 ON THIS LEVEL)\nBARS ON HAND: " +
          (PF.fedBarCount || 0) +
          ' visible, ~500,000 total\nLAST AUDIT: MAR 3 1967\nLAST WITHDRAWAL: "OCD LONG WINTER/EXPEDITE" — NOT EXECUTED.\n\nOPEN-CAGE CRATES: 001 (forced), 046 (forced), 012 (comb. 4825), 024 (RESERVE — MANAGER\'S KEY), 026 (comb. on tag), 030 (see manager).',
        learn: "pf_lk_fed_comp012",
      },
    ],
  });
  PF.terminal("pf_fed_office", {
    title: "VAULT MANAGER — E. WHITLOCK",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — PERSONAL",
    lock: FED_LOCKS.office,
    entries: [
      {
        title: "Telegram from the Office of Civil Defense",
        text: 'WESTERN UNION — SAT MAR 4 1967 1105 EST\nMR. WHITLOCK, FEDERAL RESERVE BANK OF NEW YORK\n\nIN ANTICIPATION OF CERTAIN FUTURE DEVELOPMENTS THE OFFICE OF CIVIL DEFENSE REQUESTS IMMEDIATE TRANSFER OF BULLION HELD UNDER ACCOUNT LW-9 TO SECURE STORAGE BENEATH THE MUNICIPAL BUILDING. OUR AUDITORS ARRIVE TOMORROW MORNING. ALSO REQUEST COPY OF RESERVE LEDGER. FOR OUR RECORDS. NO PUBLIC NOTICE.\n\nM. DEPUTY DIRECTOR OCD\n\n[Pencilled under it in Whitlock\'s hand: "On a Sunday? Refuse until Monday."]',
      },
      { title: "Reply (unsent)", text: "No.\n\n— E.W." },
      {
        title: "Compartment Audit",
        text: "CMPT 030 — 14 bars, foreign account, CLOSED. Crate combination 9361 (dual control; second officer deceased).",
        learn: "pf_lk_fed_comp030",
      },
      {
        title: "Personal Log",
        text: "The staff went down into the shelter level and did not come up. I stayed in the office. The Sentinel brings me coffee. It does not know the coffee ran out in '68. Neither, officially, do I.\n\nThe safe is still set to our wedding day, 0-9-1-5. Nan made me promise never to change it. I kept the reserve key in there, and her ring on the desk where I can see it.",
        learn: "pf_lk_fed_office_safe",
      },
    ],
  });
  function wardenOff() {
    const a = PF.getNpc("pf_fed_warden");
    if (!a || a.dead) return;
    try {
      a.setHostile(false);
    } catch (e) {
      /* ignore */
    }
    a.name = "Vault Sentinel (Maintenance)";
    try {
      if (a.stop) a.stop();
    } catch (e) {
      /* ignore */
    }
  }

  // --- quest ---
  PF.quest({
    id: "pf_gold",
    name: "The Gold Standard",
    giver: "Mortimer Vane",
    location: "Federal Reserve Bank",
    desc: "Mortimer Vane, an old bond man who once worked the trading floors, wants the Reserve Ledger out of the gold vault under the Federal Reserve Bank on Liberty Street. Whatever gold I carry out is mine.",
    stages: [
      {
        id: "meet",
        text: "Talk to Mortimer Vane at Fraunces Tavern.",
        markers: () => [{ npc: "pf_ft_vane", label: "Mortimer Vane" }],
      },
      {
        id: "enter",
        text: "Get inside the Federal Reserve Bank on Liberty Street.",
        markers: () => [{ x: 80, z: 764, label: "Federal Reserve Bank" }],
      },
      {
        id: "power",
        text: "Restore power to the vault elevator from the ground-floor security office.",
        markers: () => {
          const a = PF.anchorOf("federal_reserve", "sec_terminal");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Security Terminal",
                  interior: "federal_reserve",
                },
              ]
            : [];
        },
      },
      {
        id: "descend",
        text: "Ride the vault elevator down to Level V.",
        markers: () => {
          const a = PF.anchorOf("federal_reserve", "elevator_up");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Vault Elevator",
                  interior: "federal_reserve",
                },
              ]
            : [];
        },
      },
      {
        id: "door",
        text: "Open the vault's cylinder door from the Level V control room.",
        markers: () => {
          const a = PF.anchorOf("federal_reserve", "vault_terminal");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z + 1.0,
                  y: a.y,
                  label: "Vault Control",
                  interior: "federal_reserve",
                },
              ]
            : []; /* in front of the wall-mounted terminal */
        },
      },
      {
        id: "fed_warden",
        text: "(Optional) Deal with the Vault Sentinel.",
        sideObjective: true,
        optional: true,
        doneIf: () =>
          !!PF.flag("fed_warden_off") || !!PF.flag("fed_warden_dead"),
      },
      {
        id: "ledger",
        text: "Recover the Reserve Ledger from the vault manager's office.",
        markers: () => {
          const a = PF.anchorOf("federal_reserve", "ledger");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Reserve Ledger",
                  interior: "federal_reserve",
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: () =>
          "Bring the Reserve Ledger to Mortimer Vane at Fraunces Tavern." +
          (PF.inv.count("gold_bar")
            ? " (You are carrying " +
              PF.inv.count("gold_bar") +
              " gold bar" +
              (PF.inv.count("gold_bar") > 1 ? "s" : "") +
              ".)"
            : ""),
        markers: () => [{ npc: "pf_ft_vane", label: "Mortimer Vane" }],
      },
    ],
    rewards: { xp: 500, scrip: 250 },
  });
  // ledger pickup → stage
  G.events.on("itemAdded", (id) => {
    if (id === "pf_reserve_ledger") {
      PF.setFlag("fed_ledger", true);
      PF.q.advance(
        "pf_gold",
        ["meet", "enter", "power", "descend", "door", "ledger"],
        "return",
      );
      if (!PF.q.started("pf_gold")) {
        PF.q.start("pf_gold", { stage: "return" });
      }
    }
    if (id === "pf_reel_heist" && !PF.q.started("pf_gold"))
      PF.q.start("pf_gold", { stage: "meet" });
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "pf_fed_warden") PF.setFlag("fed_warden_dead", true);
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
  PF.addBuilder(
    "federal_reserve",
    function (PF2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PF.cell("federal_reserve");
      const int = buildInterior(cell, ext);
      PF.door({
        id: "pf_fed_enter",
        pos: V3(80, 1.6, BZ0 - 0.9),
        label: "Federal Reserve Bank",
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
      const all = Object.assign({}, int, {
        exterior_entrance: ext.entrance,
        turret1: ext.turret1,
        turret2: ext.turret2,
      });
      all.loot2 = int.b3;
      all.loot3 = PF.anchor(
        int.office.x + 3.5,
        int.office.y,
        int.office.z - 2,
        0,
      );
      PF.register("federal_reserve", root, all, {
        interiorRoot: cell.root,
        interiorKey: "federal_reserve",
      });

      // enter the building → quest
      const c = cell.origin;
      PF.trigger(
        { x0: c.x - 20, x1: c.x + 20, z0: c.z - 5, z1: c.z + 30 },
        () => {
          PF.q.advance("pf_gold", ["meet", "enter"], "power");
        },
        {
          cond: () =>
            PF.q.active("pf_gold") &&
            ["meet", "enter"].indexOf(PF.q.stage("pf_gold")) >= 0,
        },
      );

      // turrets (robots faction): perimeter pair + checkpoint + Level V corridor
      for (const [a, grp, id] of [
        [ext.turret1, "pf_fed_security", "pf_fed_t1"],
        [ext.turret2, "pf_fed_security", "pf_fed_t2"],
        [int.turret_cp, "pf_fed_security", "pf_fed_t3"],
        [int.turret_vault, "pf_fed_vault", "pf_fed_t4"],
      ]) {
        PF.prop("turret", {
          x: a.x,
          y: a.y,
          z: a.z,
          yaw: a.yaw,
          faction: "robots",
          hostile: true,
          terminalId: grp,
          id,
          hp: 120,
          damage: 6,
          range: 32,
        });
      }
      // terminals, containers, notes, unique
      PF.prop("terminal", {
        x: int.sec_terminal.x,
        y: int.sec_terminal.y,
        z: int.sec_terminal.z,
        yaw: 0,
        terminalId: "pf_fed_security",
        id: "pf_fed_term_sec",
      });
      PF.prop("terminal", {
        x: int.vault_terminal.x,
        y: int.vault_terminal.y,
        z: int.vault_terminal.z - 0.35,
        yaw: 0,
        terminalId: "pf_fed_vault",
        id: "pf_fed_term_vault",
        mount: "bare",
      });
      PF.prop("terminal", {
        x: int.office_terminal.x,
        y: int.office_terminal.y,
        z: int.office_terminal.z,
        yaw: 0,
        terminalId: "pf_fed_office",
        id: "pf_fed_term_office",
      });
      PF.prop("locker", {
        x: int.sec_lockers.x,
        y: int.sec_lockers.y,
        z: int.sec_lockers.z,
        yaw: -HP,
        loot: "locker",
        id: "pf_fed_locker1",
      });
      PF.prop("ammo_box", {
        x: int.loot1.x,
        y: int.loot1.y,
        z: int.loot1.z,
        yaw: PI,
        loot: "ammo_box",
        id: "pf_fed_ammo1",
      });
      PF.prop("safe", {
        x: int.barracks_safe.x,
        y: int.barracks_safe.y + 0.9,
        z: int.barracks_safe.z,
        yaw: HP,
        lock: FED_LOCKS.barracks,
        items: [
          ["pf_fed_override", 1],
          ["scrip", 120],
          ["rally_tonic", 2],
        ],
        id: "pf_fed_barracks_safe",
        name: "Sergeant's Safe",
      });
      PF.prop("footlocker", {
        x: int.barracks.x - 3.3,
        y: int.barracks.y,
        z: int.barracks.z - 5,
        yaw: HP,
        loot: "footlocker",
        id: "pf_fed_foot1",
      });
      PF.prop("footlocker", {
        x: int.barracks.x - 3.3,
        y: int.barracks.y,
        z: int.barracks.z - 1.8,
        yaw: HP,
        loot: "weapon_crate",
        id: "pf_fed_foot2",
      });
      PF.prop("safe", {
        x: int.office_safe.x,
        y: int.office_safe.y,
        z: int.office_safe.z,
        yaw: -HP,
        lock: FED_LOCKS.officeSafe,
        items: [
          ["gold_bar", 4],
          ["scrip", 300],
          ["old_dollars", 12],
          ["pf_fed_reserve_key", 1],
        ],
        id: "pf_fed_office_safe",
        name: "Vault Manager's Safe",
      });
      PF.prop("file_cabinet", {
        x: int.chief.x - 5.6,
        y: int.chief.y,
        z: int.chief.z + 6.4,
        yaw: HP,
        loot: "file_cabinet",
        id: "pf_fed_files",
      });
      PF.prop("first_aid", {
        x: int.control.x + 3.2,
        y: int.control.y + 1.4,
        z: int.control.z + 4,
        yaw: -HP,
        id: "pf_fed_firstaid",
      });
      PF.prop("crate", {
        x: int.b3.x - 1,
        y: int.b3.y,
        z: int.b3.z + 3,
        kind: "army",
        loot: "ammo_box",
        id: "pf_fed_b3crate",
      });
      PF.pickup(
        "pf_fed_keycard",
        1,
        V3(int.chief.x + 0.4, int.chief.y + 0.08, int.chief.z + 0.3),
      );
      PF.pickup(
        "pf_note_chief",
        1,
        V3(int.sec_desk.x - 0.4, int.sec_desk.y + 0.02, int.sec_desk.z),
      );
      PF.pickup(
        "pf_reel_heist",
        1,
        V3(
          int.antechamber.x - 4.6,
          int.antechamber.y + 0.1,
          int.antechamber.z - 1.5,
        ),
      );
      PF.pickup(
        "pf_note_manager",
        1,
        V3(int.ledger.x - 1.0, int.ledger.y, int.ledger.z + 0.1),
      );
      PF.pickup(
        "pf_reserve_ledger",
        1,
        V3(int.ledger.x, int.ledger.y, int.ledger.z),
      );
      PF.pickup(
        "pf_whitlock_ring",
        1,
        V3(int.ledger.x + 0.75, int.ledger.y, int.ledger.z + 0.25),
      );
      PF.pickup(
        "pf_gold_standard",
        1,
        V3(int.pistol.x, int.pistol.y + 0.05, int.pistol.z),
      );
      // lootable bullion crates inside the open compartments
      const O = cell.origin,
        oy = O.y + BASE + VY;
      for (const c of PF.fedComps || []) {
        const sp = PF.fedSpecial[c.num];
        if (!sp) continue;
        PF.prop("footlocker", {
          x: O.x + c.front - c.dir * 0.75,
          y: oy,
          z: O.z + c.zc + 0.2,
          yaw: c.dir > 0 ? -HP : HP,
          lock: sp.lock || undefined,
          items: [["gold_bar", sp.n]],
          id: "pf_fed_comp_" + c.num,
          name: sp.name,
        });
        if (c.num === 26)
          PF.codeReadable(
            V3(O.x + c.front + c.dir * 0.1, oy + 1.3, O.z + c.zc + 0.9),
            "Brass Tag on Cage 026",
            "CMPT 026 · 4 BARS · CRATE COMB. 2604 · CHECKED 03/03/67",
            sp.lock.id,
          );
      }
      // named robots on Level V (the ground floor is populated by combat's location spawns)
      PF.npc({
        id: "pf_fed_warden",
        type: "bulwark",
        name: "Vault Sentinel",
        faction: "robots",
        level: 12,
        pos: { x: int.boss.x, y: int.boss.y, z: int.boss.z },
        yaw: int.boss.yaw,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 7 },
        seed: 5201,
        loot: "bulwark",
        xp: 200,
        barks: [
          "HALT. THIS VAULT IS CLOSED FOR THE WEEKEND.",
          "YOUR WITHDRAWAL HAS BEEN DECLINED.",
          "INSUFFICIENT FUNDS. INSUFFICIENT LIFE.",
        ],
        after: (a) => {
          if (PF.flag("fed_warden_off")) wardenOff();
        },
      });
      PF.npc({
        id: "pf_fed_guard1",
        type: "patrolman",
        name: "Vault Guard Patrolman",
        faction: "robots",
        level: 9,
        pos: { x: int.spawn4.x, y: int.spawn4.y, z: int.spawn4.z },
        ai: "guard",
        home: { x: int.spawn4.x, z: int.spawn4.z, r: 4 },
        seed: 5202,
      });
      PF.npc({
        id: "pf_fed_guard2",
        type: "patrolman",
        name: "Vault Guard Patrolman",
        faction: "robots",
        level: 9,
        pos: { x: int.spawn5.x, y: int.spawn5.y, z: int.spawn5.z },
        ai: "guard",
        home: { x: int.spawn5.x, z: int.spawn5.z, r: 3 },
        seed: 5203,
      });
      PF.npc({
        id: "pf_fed_handy",
        type: "valet",
        name: "Valet-M (Bullion Detail)",
        faction: "robots",
        level: 10,
        pos: { x: int.vault.x, y: int.vault.y, z: int.vault.z - 8 },
        ai: "wander",
        home: { x: int.vault.x, z: int.vault.z - 8, r: 12 },
        seed: 5204,
        barks: [
          "Keep your hands where I can see them, sport!",
          "Gold is a MANDATORY no-touch zone!",
        ],
      });
    },
    20,
  );
})();
