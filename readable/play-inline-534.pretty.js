/* src/crafting/40_reloading.js */
/* =====================================================================
 * NEW RAD CITY — CRAFTING · 40_reloading.js
 * RELOADING BENCH.
 *   - components: lead, smokeless powder, three primer sizes, a spent case
 *     per calibre, dead lantern batteries
 *   - HAND LOAD  (case + primer + powder + lead → a round, Mechanics-gated)
 *   - BREAK DOWN (any cartridge → its components; no skill needed)
 *   - RECYCLE    (dead lantern batteries + a dry cell → charged ones, Electronics)
 *   - brass recovery: firing a gun leaves its spent case in your pockets,
 *     firing the siren horn usually leaves a dead lantern battery
 *   - the bench itself: an original procedural press/powder-measure bench,
 *     merged meshes, colliders, one interactable, LOD'd; placed at the
 *     settlements' gun stalls (validated open ground).
 * Opens the shared crafting screen as station 'reloading'.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.crafting;
  const X = C._;

  // ------------------------------------------------------------------
  // Items. Components are worth nothing on their own at a vendor: a round
  // must never break down into more scrip than it cost (that was an
  // infinite-money loop).
  // ------------------------------------------------------------------
  const PRIMER_MESH = "scrap"; // small brass bits on the ground
  const CM = (id, name, value, mesh, desc) => ({
    id,
    name,
    type: "misc",
    weight: 0,
    value,
    tags: ["component", "reloading"],
    mesh,
    icon: "misc",
    noLoot: true,
    desc,
  });
  X.ITEM_DEFS.push(
    CM(
      "cr_lead",
      "Lead",
      0,
      "junk_metal",
      "Soft grey slugs cut from pipe, fishing weights and the occasional old-world toy soldier. The business end of every hand-loaded round.",
    ),
    CM(
      "cr_powder",
      "Smokeless Powder",
      0,
      "can_paint",
      "A scoop of nitrocellulose flakes. Keep it dry, keep it away from campfires, keep it away from Earl.",
    ),
    CM(
      "cr_primer_pistol",
      "Small Pistol Primer",
      0,
      PRIMER_MESH,
      "A tiny brass cup with a dab of priming compound. Strike it and it wakes the powder up.",
    ),
    CM(
      "cr_primer_rifle",
      "Large Rifle Primer",
      0,
      PRIMER_MESH,
      "A hotter, harder primer for rifle cartridges. Old-world military surplus, still crisp.",
    ),
    CM(
      "cr_primer_shot",
      "Shotshell Primer",
      0,
      PRIMER_MESH,
      "A battery-cup primer for shotgun hulls.",
    ),
    CM(
      "cr_case_32",
      ".32 Case",
      0,
      "scrap",
      "A spent .32 brass case. With a new primer, some powder and a slug it could be a bullet again.",
    ),
    CM(
      "cr_case_10mm",
      "10mm Case",
      0,
      "scrap",
      "A spent 10mm brass case, still smelling of the last firefight.",
    ),
    CM(
      "cr_case_44",
      ".44 Magnum Case",
      0,
      "scrap",
      "A long, heavy .44 case. Handloaders love these; so do scavengers.",
    ),
    CM(
      "cr_case_556",
      "5.56mm Case",
      0,
      "scrap",
      "A bottlenecked 5.56mm case with a U.S. Army headstamp.",
    ),
    CM(
      "cr_case_308",
      ".308 Case",
      0,
      "scrap",
      "A full-length .308 rifle case. Resize it, prime it, fill it, seat it.",
    ),
    CM(
      "cr_hull_12ga",
      "12 Ga. Hull",
      0,
      "scrap",
      "An empty red plastic shotgun hull with a brass head. Reloadable, if you have the primers.",
    ),
    CM(
      "cr_drained_dry_cell",
      "Dead Lantern Battery",
      0,
      "battery",
      "A lantern battery run flat by one siren shriek. The zinc can is fine; it just needs a charge from a fresh dry cell.",
    ),
  );

  // Cartridge → components (hand load consumes these, break down returns them).
  // rep = Mechanics needed to hand-load it (null = can't be hand-loaded, only broken down).
  // art = real cartridge dimensions (mm) for the blueprint (X.cartridgeArt).
  X.AMMO_PARTS = {
    ammo_32: {
      casing: "cr_case_32",
      primer: "cr_primer_pistol",
      powder: 1,
      lead: 1,
      rep: 15,
      art: {
        len: 23.6,
        oal: 32,
        dia: 8.6,
        rim: 9.9,
        nose: "round",
        label: ".32 S&W LONG",
      },
    },
    ammo_10mm: {
      casing: "cr_case_10mm",
      primer: "cr_primer_pistol",
      powder: 2,
      lead: 1,
      rep: 25,
      art: {
        len: 25.2,
        oal: 32,
        dia: 10.8,
        neck: 10.6,
        nose: "flat",
        label: "10MM AUTO",
      },
    },
    ammo_44: {
      casing: "cr_case_44",
      primer: "cr_primer_pistol",
      powder: 3,
      lead: 2,
      rep: 45,
      art: {
        len: 32.6,
        oal: 40.6,
        dia: 11.6,
        rim: 13.1,
        nose: "flat",
        label: ".44 MAGNUM",
      },
    },
    ammo_556: {
      casing: "cr_case_556",
      primer: "cr_primer_rifle",
      powder: 3,
      lead: 1,
      rep: 35,
      art: {
        len: 44.7,
        oal: 57.4,
        dia: 9.6,
        neck: 6.4,
        shoulder: 36.5,
        nose: "spire",
        label: "5.56X45MM",
      },
    },
    ammo_308: {
      casing: "cr_case_308",
      primer: "cr_primer_rifle",
      powder: 4,
      lead: 2,
      rep: 50,
      art: {
        len: 51.2,
        oal: 71.1,
        dia: 11.9,
        neck: 8.7,
        shoulder: 40.5,
        nose: "spire",
        label: ".308 WIN",
      },
    },
    ammo_12ga: {
      casing: "cr_hull_12ga",
      primer: "cr_primer_shot",
      powder: 2,
      lead: 3,
      rep: 30,
      art: {
        len: 62,
        oal: 64,
        dia: 18.5,
        rim: 20.5,
        shot: true,
        label: '12 GA 2-3/4"',
      },
    },
    ammo_5mm: {
      casing: null,
      primer: "cr_primer_rifle",
      powder: 1,
      lead: 1,
      rep: null,
      art: {
        len: 30,
        oal: 40,
        dia: 7.4,
        neck: 5.4,
        shoulder: 22,
        nose: "spire",
        label: "5MM CASELESS",
      },
    },
  };
  // Battery ammo → the dead battery it leaves behind, and the chance per shot.
  X.DRAINED = { ammo_dry_cell: ["cr_drained_dry_cell", 0.7] };
  X.CASE_CHANCE = 0.8;

  // ------------------------------------------------------------------
  // Recipes (station 'reloading'; `gives` = several outputs, `label` = row name)
  // ------------------------------------------------------------------
  const partsOf = (a) => {
    const p = [];
    if (a.casing) p.push([a.casing, 1]);
    p.push([a.primer, 1], ["cr_powder", a.powder], ["cr_lead", a.lead]);
    return p;
  };
  for (const ammo in X.AMMO_PARTS) {
    const a = X.AMMO_PARTS[ammo],
      cal = ammo.slice(5);
    if (X.cartridgeArt && X.ART) {
      X.ART["hl_" + cal] = X.cartridgeArt(a.art, "load");
      X.ART["bd_" + cal] = X.cartridgeArt(
        a.art,
        a.casing ? "explode" : "explode_nc",
      );
    }
    if (a.rep !== null) {
      X.RECIPES.push({
        id: "cr_hl_" + cal,
        station: "reloading",
        tab: "handload",
        makes: ammo,
        n: 1,
        parts: partsOf(a),
        req: { mechanics: a.rep },
        xp: 0,
        art: "hl_" + cal,
        note: a.art.shot
          ? "Punch a new primer into the brass head, drop the powder, seat a wad, pour the shot and fold the crimp shut."
          : "Resize the case, seat a new primer, throw a charge of powder and press a cast slug home.",
      });
    }
    X.RECIPES.push({
      id: "cr_bd_" + cal,
      station: "reloading",
      tab: "breakdown",
      makes: ammo,
      n: 1,
      parts: [[ammo, 1]],
      gives: partsOf(a),
      req: {},
      xp: 0,
      art: "bd_" + cal,
      breakdown: true,
      note: a.art.shot
        ? "Slit the crimp, pour out the buckshot and the powder, punch out the primer and keep the hull."
        : "Pull the bullet, dump the powder, punch out the primer" +
          (a.casing
            ? " and keep the case."
            : ". The 5mm case is too thin to reload."),
    });
  }
  X.RECIPES.push({
    id: "cr_rc_dry_cell",
    station: "reloading",
    tab: "recycle",
    makes: "ammo_dry_cell",
    n: 4,
    parts: [
      ["cr_drained_dry_cell", 4],
      ["dry_cell", 1],
    ],
    req: { electronics: 30 },
    xp: 6,
    art: "recharge",
    note: "Wire four dead lantern batteries in parallel across a fresh dry cell and bleed the charge back in.",
  });
  X.TABS.reloading = [
    ["handload", "HAND LOAD"],
    ["breakdown", "BREAK DOWN"],
    ["recycle", "RECYCLE"],
  ];
  X.STATION_TITLE.reloading = "RELOADING BENCH";
  X.STATION_SKILLS = {
    workbench: ["mechanics", "electronics", "medicine"],
    campfire: ["survival", "medicine"],
    reloading: ["mechanics", "electronics"],
  };

  // Searchable "Reloading Supplies" crate at every bench (restocks every 3 days).
  X.defineSupplyLoot = function () {
    try {
      if (G.isStub("items") || typeof G.items.defineLootTable !== "function")
        return false;
      if (G.items.hasLootTable && G.items.hasLootTable("cr_reloading_supplies"))
        return true;
      G.items.defineLootTable("cr_reloading_supplies", {
        rolls: [
          {
            chance: 1,
            picks: [2, 3],
            entries: [
              { id: "cr_primer_pistol", w: 3, n: [5, 12] },
              { id: "cr_primer_rifle", w: 2.2, n: [4, 9] },
              { id: "cr_primer_shot", w: 1.5, n: [3, 8] },
              { id: "cr_powder", w: 3, n: [8, 18] },
              { id: "cr_lead", w: 3, n: [6, 14] },
            ],
          },
          {
            chance: 0.7,
            picks: [1, 2],
            entries: [
              { id: "cr_case_10mm", w: 2, n: [4, 10] },
              { id: "cr_case_556", w: 1.4, n: [3, 8] },
              { id: "cr_case_308", w: 1, n: [2, 6] },
              { id: "cr_case_44", w: 0.8, n: [2, 6] },
              { id: "cr_hull_12ga", w: 1.2, n: [3, 7] },
              { id: "cr_case_32", w: 1.2, n: [4, 10] },
            ],
          },
          {
            chance: 0.25,
            picks: [1, 1],
            entries: [
              { id: "cr_drained_dry_cell", w: 2, n: [1, 4] },
              { id: "dry_cell", w: 0.6, n: 1 },
            ],
          },
        ],
      });
      return true;
    } catch (e) {
      G.reportError("crafting:supplyLoot", e);
      return false;
    }
  };

  // ------------------------------------------------------------------
  // Brass recovery: spent cases / drained cells collect as you shoot.
  // Accumulated and added silently in one batch per second; anything still
  // pending when the game is saved rides along in the crafting save.
  // ------------------------------------------------------------------
  const pendingBrass = {};
  let brassT = 0,
    brassAny = false;
  let rngS = 0x2f6e2b1;
  const rnd = () => {
    rngS = (rngS * 1664525 + 1013904223) >>> 0;
    return rngS / 4294967296;
  };
  G.events.on("weaponFired", (def) => {
    try {
      const w = def && def.weapon;
      if (!w || !w.ammo) return;
      const a = X.AMMO_PARTS[w.ammo];
      let id = null;
      if (a && a.casing) {
        if (rnd() < X.CASE_CHANCE) id = a.casing;
      } else if (X.DRAINED[w.ammo]) {
        const d = X.DRAINED[w.ammo];
        if (rnd() < d[1]) id = d[0];
      }
      if (!id) return;
      pendingBrass[id] = (pendingBrass[id] || 0) + 1;
      brassAny = true;
    } catch (e) {
      /* ignore */
    }
  });
  X.flushBrass = function (realDt, now) {
    if (!brassAny) return;
    if (!now) {
      brassT -= realDt;
      if (brassT > 0) return;
    }
    brassT = 1;
    if (!X.invReal()) return;
    brassAny = false;
    let cases = 0,
      cells = 0;
    for (const id in pendingBrass) {
      const n = pendingBrass[id];
      delete pendingBrass[id];
      if (n > 0 && X.def(id)) {
        try {
          G.inventory.add(id, n, { silent: true });
        } catch (e) {
          continue;
        }
        if (/^cr_drained/.test(id)) cells += n;
        else cases += n;
      }
    }
    // one-time hint the first time spent brass (or a drained cell) lands in your pockets
    const tips = X.S.tips || (X.S.tips = {});
    const hint =
      cases && !tips.brass ? "brass" : cells && !tips.cells ? "cells" : null;
    if (hint) {
      tips[hint] = 1;
      try {
        G.notify(
          hint === "brass"
            ? "You pocket your spent cases. Hand-load them into new rounds at a Reloading Bench."
            : "You keep the dead batteries. A Reloading Bench can recharge them with a dry cell.",
          { kind: "skill", icon: "wrench" },
        );
      } catch (e) {
        /* ignore */
      }
    }
  };
  X.pendingBrass = () => Object.assign({}, pendingBrass);
  X.restoreBrass = function (d) {
    for (const k in pendingBrass) delete pendingBrass[k];
    brassAny = false;
    brassT = 0;
    for (const id in d || {}) {
      const n = d[id] | 0;
      if (n > 0 && X.def(id)) {
        pendingBrass[id] = n;
        brassAny = true;
      }
    }
  };
  G.events.on("reset", () => {
    for (const k in pendingBrass) delete pendingBrass[k];
    brassAny = false;
    brassT = 0;
  });

  // ------------------------------------------------------------------
  // The bench model (original design: a pine bench with a red cast-iron
  // single-stage press, a powder measure, a beam scale, loading block,
  // powder cans and ammo boxes on a pegboard shelf).
  // ------------------------------------------------------------------
  let MODEL = null;
  function uvScale(g, su, sv) {
    const uv = g.attributes.uv;
    if (!uv) return g;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    return g;
  }
  function buildModel() {
    if (MODEL) return MODEL;
    const U = G.util;
    const wood = [],
      metal = [];
    const box = (arr, col, w, h, d, x, y, z, ry, rx, rz, tex) => {
      const g = uvScale(
        new THREE.BoxGeometry(w, h, d),
        tex ? Math.max(w, d) / tex : 1,
        tex ? Math.max(h, 0.1) / tex : 1,
      );
      arr.push(
        U.bake(
          U.paint(g, col),
          { x, y: y + h / 2, z },
          ry || 0,
          1,
          rx || 0,
          rz || 0,
        ),
      );
    };
    const cyl = (arr, col, r0, r1, h, x, y, z, seg, rx, rz) => {
      arr.push(
        U.bake(
          U.paint(new THREE.CylinderGeometry(r0, r1, h, seg || 10, 1), col),
          { x, y: y + (rx || rz ? 0 : h / 2), z },
          0,
          1,
          rx || 0,
          rz || 0,
        ),
      );
    };
    const ball = (arr, col, r, x, y, z) => {
      arr.push(
        U.bake(
          U.paint(new THREE.SphereGeometry(r, 10, 7), col),
          { x, y, z },
          0,
          1,
        ),
      );
    };
    const W = 0x94704a,
      WD = 0x7a5a3a,
      WL = 0x604630;
    // --- bench: top, apron, legs, stretchers, lower shelf
    box(wood, W, 1.74, 0.07, 0.76, 0, 0.84, 0, 0, 0, 0, 1.2);
    box(wood, WD, 1.7, 0.12, 0.03, 0, 0.72, -0.36, 0, 0, 0, 1.2);
    for (const sx of [-0.8, 0.8])
      for (const sz of [-0.32, 0.32])
        box(wood, WL, 0.09, 0.84, 0.09, sx, 0, sz, 0, 0, 0, 1.2);
    box(wood, WD, 1.62, 0.035, 0.66, 0, 0.18, 0, 0, 0, 0, 1.2);
    for (const sz of [-0.32, 0.32])
      box(wood, WL, 1.6, 0.07, 0.04, 0, 0.1, sz, 0, 0, 0, 1.2);
    // --- back riser: two posts, pegboard, shelf
    for (const sx of [-0.84, 0.84])
      box(wood, WL, 0.06, 1.0, 0.06, sx, 0.91, 0.34, 0, 0, 0, 1.2);
    box(wood, 0x7e6a4a, 1.66, 0.82, 0.025, 0, 0.94, 0.36, 0, 0, 0, 0.8); // pegboard
    box(wood, W, 1.72, 0.035, 0.24, 0, 1.46, 0.25, 0, 0, 0, 1.2);
    // --- single-stage press (left front, bolted to the bench edge)
    const RED = 0x8e2a1c,
      STEEL = 0x8a8e90,
      DARK = 0x2e3032,
      BRASS = 0xd2a64e;
    const px = -0.52,
      pz = -0.24,
      top = 0.91;
    box(metal, RED, 0.16, 0.03, 0.15, px, top, pz); // base plate
    box(metal, RED, 0.07, 0.34, 0.06, px, top + 0.03, pz + 0.05); // C-frame spine
    box(metal, RED, 0.08, 0.06, 0.16, px, top + 0.34, pz - 0.01); // top arm
    cyl(metal, DARK, 0.02, 0.02, 0.1, px, top + 0.25, pz - 0.05, 14); // die
    cyl(metal, STEEL, 0.017, 0.017, 0.16, px, top + 0.04, pz - 0.05, 12); // ram
    box(metal, DARK, 0.05, 0.02, 0.05, px, top + 0.2, pz - 0.05); // shell holder
    // lever arm swinging out to the right & down, black ball knob
    // (pivot at the frame, raised 30° like a press between strokes)
    cyl(
      metal,
      STEEL,
      0.011,
      0.011,
      0.36,
      px + 0.2,
      top + 0.29,
      pz - 0.05,
      8,
      0,
      -1.05,
    );
    ball(metal, DARK, 0.03, px + 0.355, top + 0.38, pz - 0.05);
    // --- powder measure on a post
    const mx = -0.18,
      mz = -0.16;
    cyl(metal, STEEL, 0.012, 0.012, 0.3, mx, top, mz, 8);
    box(metal, RED, 0.06, 0.05, 0.06, mx, top + 0.3, mz);
    cyl(metal, 0xb89a58, 0.042, 0.042, 0.14, mx, top + 0.35, mz, 14); // amber hopper
    cyl(metal, DARK, 0.046, 0.046, 0.015, mx, top + 0.49, mz, 14);
    cyl(metal, STEEL, 0.008, 0.012, 0.05, mx, top + 0.25, mz, 8); // drop tube
    box(metal, STEEL, 0.1, 0.012, 0.012, mx + 0.06, top + 0.32, mz); // metering handle
    // --- beam scale
    const sx0 = 0.12,
      sz0 = -0.18;
    box(metal, 0x3a4a3e, 0.2, 0.04, 0.1, sx0, top, sz0);
    box(metal, STEEL, 0.012, 0.08, 0.012, sx0 - 0.06, top + 0.04, sz0);
    box(
      metal,
      STEEL,
      0.22,
      0.006,
      0.012,
      sx0 + 0.01,
      top + 0.12,
      sz0,
      0,
      0,
      0.04,
    );
    cyl(metal, STEEL, 0.035, 0.03, 0.01, sx0 - 0.08, top + 0.09, sz0, 12);
    // --- loading block full of brass
    const bx = 0.46,
      bz = -0.18;
    box(wood, 0xa07c52, 0.22, 0.035, 0.14, bx, top, bz);
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 4; j++) {
        if ((i * 7 + j * 3) % 11 === 0) continue;
        cyl(
          metal,
          BRASS,
          0.007,
          0.007,
          0.045,
          bx - 0.085 + i * 0.034,
          top + 0.03,
          bz - 0.05 + j * 0.034,
          6,
        );
      }
    // loose cases & slugs spilled on the top
    for (let i = 0; i < 7; i++)
      cyl(
        metal,
        i % 3 ? BRASS : 0x6a6e70,
        0.007,
        0.007,
        0.04,
        0.2 + i * 0.05,
        top + 0.007,
        -0.02 + (i % 2) * 0.05,
        6,
        Math.PI / 2,
        i * 0.9,
      );
    // --- shelf: powder cans, primer trays, ammo boxes
    const st = 1.495;
    cyl(metal, 0x9a2a20, 0.055, 0.055, 0.16, -0.66, st, 0.25, 12);
    cyl(metal, 0x262626, 0.05, 0.05, 0.13, -0.53, st, 0.26, 12);
    cyl(metal, 0x9a2a20, 0.055, 0.055, 0.16, -0.41, st, 0.24, 12);
    box(metal, 0x5a6a3a, 0.2, 0.1, 0.14, -0.16, st, 0.25, 0.1);
    box(metal, 0x5a6a3a, 0.2, 0.1, 0.14, -0.15, st + 0.1, 0.25, -0.06);
    box(metal, 0x2a4a7a, 0.16, 0.08, 0.11, 0.1, st, 0.26, 0.2);
    box(metal, 0xc8a040, 0.1, 0.03, 0.07, 0.3, st, 0.24);
    box(metal, 0xc8a040, 0.1, 0.03, 0.07, 0.3, st + 0.03, 0.24, 0.3);
    box(metal, 0x7a1a14, 0.24, 0.12, 0.16, 0.6, st, 0.25, -0.12);
    // hanging tools on the pegboard
    box(metal, STEEL, 0.03, 0.22, 0.015, -0.7, 1.05, 0.33, 0, 0, 0.1);
    box(metal, 0x1e1e1e, 0.2, 0.02, 0.015, -0.3, 1.2, 0.33, 0, 0, -0.2);
    box(metal, STEEL, 0.02, 0.18, 0.015, 0.05, 1.08, 0.33);
    cyl(metal, STEEL, 0.05, 0.05, 0.015, 0.45, 1.18, 0.335, 14, Math.PI / 2);
    // under-shelf: ammo can and a lead-ingot stack
    box(metal, 0x4a5a32, 0.28, 0.18, 0.14, -0.45, 0.215, 0.05, 0.2);
    for (let i = 0; i < 3; i++)
      box(
        metal,
        0x6a6e72,
        0.16,
        0.035,
        0.05,
        0.4,
        0.215 + i * 0.036,
        0.06 + (i % 2) * 0.03,
        i * 0.3,
      );
    cyl(metal, 0x8a8478, 0.08, 0.08, 0.16, 0.12, 0.215, 0.1, 10); // coffee can of slugs
    // --- dressing: military ammo crate beside the bench (the searchable "Reloading Supplies"),
    //     a second crate on top, a three-legged shop stool and a hurricane lantern on the shelf.
    const CR = 0x6e6a44,
      CRD = 0x55523a;
    const kx = 1.28,
      kz = -0.02;
    box(wood, CR, 0.62, 0.36, 0.42, kx, 0, kz, 0.06, 0, 0, 0.9);
    for (const sx of [-0.25, 0.25])
      box(
        wood,
        CRD,
        0.05,
        0.37,
        0.44,
        kx + sx * Math.cos(0.06),
        0,
        kz - sx * Math.sin(0.06),
        0.06,
      );
    box(wood, CRD, 0.64, 0.035, 0.44, kx, 0.36, kz, 0.06, 0, 0, 0.9); // lid
    box(metal, 0x2e3032, 0.12, 0.03, 0.03, kx, 0.26, kz - 0.225, 0.06); // rope-handle cleat
    box(metal, 0xd8d0b0, 0.3, 0.07, 0.004, kx - 0.04, 0.12, kz - 0.215, 0.06); // stencil plate ("CAL .30")
    box(
      wood,
      CR,
      0.46,
      0.26,
      0.3,
      kx + 0.03,
      0.395,
      kz + 0.02,
      -0.18,
      0,
      0,
      0.9,
    ); // smaller crate on top
    box(
      wood,
      CRD,
      0.47,
      0.03,
      0.31,
      kx + 0.03,
      0.655,
      kz + 0.02,
      -0.18,
      0,
      0,
      0.9,
    );
    box(metal, 0x4a5a32, 0.26, 0.15, 0.12, kx - 0.02, 0.685, kz + 0.02, 0.4); // ammo can on top of it
    box(metal, 0x2a2c2a, 0.1, 0.02, 0.03, kx - 0.02, 0.835, kz + 0.02, 0.4);
    // stool (front left, pushed half under the bench)
    const tx = -0.42,
      tz = -0.62;
    cyl(wood, WD, 0.17, 0.17, 0.04, tx, 0.6, tz, 14);
    for (let i = 0; i < 3; i++) {
      const aa = (i / 3) * Math.PI * 2 + 0.4;
      cyl(
        wood,
        WL,
        0.018,
        0.022,
        0.64,
        tx + Math.cos(aa) * 0.1,
        0.3,
        tz + Math.sin(aa) * 0.1,
        6,
        Math.sin(aa) * 0.16,
        -Math.cos(aa) * 0.16,
      );
    }
    cyl(wood, WL, 0.012, 0.012, 0.22, tx, 0.22, tz, 5, 0, Math.PI / 2);
    // lantern (shelf, right end): base, cage, cap, bail handle — the glass is its own glowing mesh
    const lx = 0.74,
      lz = 0.22,
      ly = 1.495;
    cyl(metal, 0x7a2a1a, 0.06, 0.065, 0.05, lx, ly, lz, 12);
    for (let i = 0; i < 4; i++) {
      const aa = (i / 4) * Math.PI * 2 + 0.785;
      cyl(
        metal,
        0x3a3a38,
        0.004,
        0.004,
        0.13,
        lx + Math.cos(aa) * 0.047,
        ly + 0.05,
        lz + Math.sin(aa) * 0.047,
        4,
      );
    }
    cyl(metal, 0x7a2a1a, 0.03, 0.058, 0.04, lx, ly + 0.18, lz, 12);
    cyl(
      metal,
      0x3a3a38,
      0.004,
      0.004,
      0.12,
      lx,
      ly + 0.25,
      lz,
      4,
      0,
      Math.PI / 2,
    );
    const glass = [
      U.bake(
        U.paint(
          new THREE.CylinderGeometry(0.036, 0.042, 0.12, 12, 1),
          0xffffff,
        ),
        { x: lx, y: ly + 0.11, z: lz },
        0,
        1,
      ),
    ];
    MODEL = {
      wood: U.mergeGeometries(wood),
      metal: U.mergeGeometries(metal),
      glass: U.mergeGeometries(glass),
      crate: { x: kx, z: kz, w: 0.66, d: 0.46, h: 0.84 },
    };
    wood.length = 0;
    metal.length = 0;
    return MODEL;
  }
  let MATS = null;
  function mats() {
    if (MATS) return MATS;
    const tx = (fn, n) => {
      try {
        if (G.isStub("tex")) return null;
        const t = G.tex[fn](n);
        return t && t.isTexture ? t : null;
      } catch (e) {
        return null;
      }
    };
    // pine: the colour comes from the vertex tints (per board); the plank texture only lends its grain
    // relief through the normal map (its albedo is dark, stained floorboard — wrong for a bench top)
    const w = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.78,
      metalness: 0,
      normalMap: tx("normal", "wood_planks"),
    });
    if (w.normalMap) w.normalScale.set(0.7, 0.7);
    // painted / cast / brass parts: moderately metallic, polished enough that the brass and the red press catch light
    const m = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.38,
      metalness: 0.55,
    });
    // lantern glass: a warm emissive, turned up at night (X.benchTick)
    const g = new THREE.MeshStandardMaterial({
      color: 0xffe0a0,
      roughness: 0.2,
      metalness: 0,
      emissive: 0xffa040,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.92,
    });
    // benches under a roof (Grand Central concourse, a trading post) keep the lantern lit all day
    const gi = g.clone();
    gi.emissiveIntensity = 2.2;
    w.userData.shared = true;
    m.userData.shared = true;
    g.userData.shared = true;
    gi.userData.shared = true;
    return (MATS = { wood: w, metal: m, glass: g, glassIn: gi });
  }
  let glowT = 0;
  /** Lantern glow follows the time of day (cheap: one shared material, twice a second). */
  X.benchTick = function (realDt) {
    if (!MATS || !X.reloadBenches.length) return;
    glowT -= realDt;
    if (glowT > 0) return;
    glowT = 0.5;
    const h = (G.time && G.time.hour) || 12;
    const night =
      h < 6 || h > 19.5
        ? 1
        : h < 7.5
          ? (7.5 - h) / 1.5
          : h > 18
            ? (h - 18) / 1.5
            : 0;
    MATS.glass.emissiveIntensity = 0.45 + night * 2.2;
  };

  // ------------------------------------------------------------------
  // Placement: reloading benches live where gun people work:
  // next to a settlement's gun merchant or armoury, backed against a wall,
  // with open floor in front. Each entry: [site, anchor names, fallback x/z,
  // search radius min/max, note]. The anchor is read from landmarks/POIs at
  // initDone (static world); the bench keeps >= 2 m clear of it (an NPC
  // or a stall usually stands there).
  // ------------------------------------------------------------------
  X.RELOAD_BENCHES = [
    // pin (optional): a hand-checked spot {x, z, k (yaw = k·π/2)} tried first; still validated like any other
    [
      "grand_central",
      ["merchant1", "guns", "merchant4"],
      { x: 224, z: -255 },
      3,
      9,
      "Grand Central Market (gun stall)",
      { x: 229.1, z: -243.72, k: 2 },
    ],
    [
      "times_square",
      ["repairman", "butcher", "plaza"],
      { x: -56, z: -257 },
      2.5,
      12,
      "The Neon (repair cart)",
    ],
    [
      "rockefeller",
      ["workbench", "armory", "quartermaster"],
      { x: 77, z: -337 },
      2.2,
      9,
      "Iron Covenant outpost armoury",
    ],
    [
      "flatiron",
      ["merchant1", "merchant2", "entrance"],
      { x: 146, z: 90 },
      3,
      11,
      "Flatiron Trading Post",
    ],
  ];
  X.reloadBenches = [];
  function anchorOf(site, names) {
    for (const n of names) {
      let v = null;
      try {
        if (
          !G.isStub("landmarks") &&
          G.landmarks &&
          typeof G.landmarks.getAnchor === "function"
        )
          v = G.landmarks.getAnchor(site, n);
      } catch (e) {
        v = null;
      }
      if (!v) {
        try {
          if (
            G.pois &&
            !G.pois.__stub &&
            typeof G.pois.getAnchor === "function"
          )
            v = G.pois.getAnchor(site, n);
        } catch (e) {
          v = null;
        }
      }
      if (v && isFinite(v.x) && isFinite(v.z)) {
        // a stall's customer spot tells which way the counter faces: keep that corridor free
        let cu = null;
        try {
          if (!G.isStub("landmarks") && G.landmarks.getAnchor)
            cu = G.landmarks.getAnchor(site, n + "_customer");
        } catch (e) {
          cu = null;
        }
        let face = null;
        if (cu && isFinite(cu.x)) {
          const fx = cu.x - v.x,
            fz = cu.z - v.z,
            l = Math.hypot(fx, fz);
          if (l > 0.3) face = [fx / l, fz / l];
        }
        return {
          x: v.x,
          y: isFinite(v.y) ? v.y : null,
          z: v.z,
          name: n,
          face,
          eye: cu && isFinite(cu.x) ? { x: cu.x, z: cu.z } : null,
        };
      }
    }
    return null;
  }
  // axis rays from a candidate spot: +x, -x, +z, -z (the street grid is axis-aligned)
  const AX = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const _o = new THREE.Vector3(),
    _d = new THREE.Vector3();
  function rayDist(x, y, z, dx, dz, max, heights) {
    let best = max;
    for (const hy of heights || [0.35, 0.95, 1.55]) {
      let h = null;
      try {
        h = G.world.raycast(_o.set(x, y + hy, z), _d.set(dx, 0, dz), max, {
          ignoreTags: ["actor", "foliage"],
        });
      } catch (e) {
        h = null;
      }
      if (h && h.dist < best) best = h.dist;
    }
    return best;
  }
  // yaw k·π/2 → [front, back, right, left] as indices into AX (front = local −Z, right = local +X)
  const YAW_DIRS = [
    [3, 2, 0, 1],
    [1, 0, 3, 2],
    [2, 3, 1, 0],
    [0, 1, 2, 3],
  ];
  /**
   * Best bench spot near an anchor: on flat ground at the anchor's level, back to a wall (≤ 1.8 m),
   * ≥ 2.2 m of open floor in front, room for the crate on its right. Returns {x, y, z, yaw, score} | null.
   */
  X.benchSpot = function (ax, ay, az, rMin, rMax, face, pin, eye) {
    const ex = eye ? eye.x : ax,
      ez = eye ? eye.z : az; // line-of-sight origin (a stall's customer spot)
    // never in front of the merchant's counter (the customers' corridor, 3.4 m wide, 6 m deep)
    const blocks = (x, z) => {
      if (!face) return false;
      const dx = x - ax,
        dz = z - az,
        fwd = dx * face[0] + dz * face[1],
        lat = Math.abs(dx * face[1] - dz * face[0]);
      return fwd > -0.5 && fwd < 6 && lat < 3.4;
    };
    const interior = ax > 4000 || az > 4000;
    const ground = (x, z) => {
      const gy = X.groundAt(
        x,
        z,
        1.2,
        ay !== null ? ay + 2.2 : undefined,
        interior,
      );
      return gy === null || (ay !== null && Math.abs(gy - ay) > 0.8)
        ? null
        : gy;
    };
    const rays = (x, y, z) => AX.map(([dx, dz]) => rayDist(x, y, z, dx, dz, 6));
    // indoors/outdoors must match the anchor's (a street-side anchor never puts the bench inside a hollow shell)
    const _upv = new THREE.Vector3(0, 1, 0);
    const roofed = (x, y, z) => {
      try {
        return !!G.world.raycast(_o.set(x, y + 2.4, z), _upv, 70, {
          ignoreTags: ["actor", "foliage"],
        });
      } catch (e) {
        return false;
      }
    };
    const anchorRoofed = roofed(
      ax,
      ay !== null ? ay : X.groundAt(ax, az) || 0,
      az,
    );
    /** Full check of a final spot: returns a scored candidate or null. */
    const why = (m) => {
      if (pin) X.pinWhy = m;
      return null;
    };
    const judge = (x, z, k, r) => {
      if (blocks(x, z) || Math.hypot(x - ax, z - az) < 1.8)
        return why("blocks");
      const y = ground(x, z);
      if (y === null) return why("ground");
      if (!interior && roofed(x, y, z) !== anchorRoofed) return why("roof");
      // in sight of the anchor: the floor in front of the bench is reachable/visible from the merchant's spot
      // (rejects spots behind a wall, e.g. inside a hollow building shell next to the street)
      if (!pin) {
        const [fx, fz] = AX[YAW_DIRS[k][0]];
        const tx = x + fx * 1.3 - ex,
          tz = z + fz * 1.3 - ez,
          tl = Math.hypot(tx, tz);
        const ay0 = (ay !== null ? ay : y) + 1.2;
        let h = null;
        try {
          h = G.world.raycast(
            _o.set(ex, ay0, ez),
            new THREE.Vector3(tx / tl, 0, tz / tl),
            tl,
            { ignoreTags: ["actor", "foliage"] },
          );
        } catch (e) {
          h = null;
        }
        if (h && h.dist < tl - 0.2) return why("no line of sight");
      }
      // the crate end (local +X) must be on the same floor too
      const [rx, rz] = AX[YAW_DIRS[k][2]];
      if (ground(x + rx * 1.3, z + rz * 1.3) === null)
        return why("crate ground");
      const D = rays(x, y, z);
      const [f, bk, rt, lf] = YAW_DIRS[k].map((j) => D[j]);
      if (bk < 0.42 || f < 2.4 || rt < 1.7 || lf < 1.0)
        return why(
          "rays " + [f, bk, rt, lf].map((v) => v.toFixed(2)).join("/"),
        );
      // backed by a real wall (hits behind both ends of the bench), not a post or a stall corner
      const [bx, bz] = AX[YAW_DIRS[k][1]];
      // the whole footprint must be free: back and front rays from both ends of the bench (and the crate)
      const b1 = rayDist(x + rx * 0.82, y, z + rz * 0.82, bx, bz, 2),
        b2 = rayDist(x - rx * 0.82, y, z - rz * 0.82, bx, bz, 2);
      const b3 = rayDist(x + rx * 1.55, y, z + rz * 1.55, bx, bz, 2);
      if (Math.min(b1, b2) < 0.42 || b3 < 0.3)
        return why(
          "back ends " + [b1, b2, b3].map((v) => v.toFixed(2)).join("/"),
        );
      const f1 = rayDist(x + rx * 0.82, y, z + rz * 0.82, -bx, -bz, 1.6),
        f2 = rayDist(x - rx * 0.82, y, z - rz * 0.82, -bx, -bz, 1.6);
      const f3 = rayDist(x + rx * 1.55, y, z + rz * 1.55, -bx, -bz, 1);
      if (Math.min(f1, f2) < 1.2 || f3 < 0.4)
        return why(
          "front ends " + [f1, f2, f3].map((v) => v.toFixed(2)).join("/"),
        );
      // ...and tall (a wall, not a table or a stall counter): both ends still hit at 2.2 m
      const wide =
        bk <= 1.2 &&
        b1 < bk + 0.35 &&
        b2 < bk + 0.35 &&
        rayDist(x + rx * 0.82, y, z + rz * 0.82, bx, bz, 2, [2.2]) <
          bk + 0.45 &&
        rayDist(x - rx * 0.82, y, z - rz * 0.82, bx, bz, 2, [2.2]) < bk + 0.45;
      const score =
        (bk <= 1.2 ? 2 : 0) +
        (wide ? 5 : 0) +
        Math.min(f, 6) * 0.45 +
        Math.min(rt - 1.7, 1.5) * 0.4 +
        Math.min(lf - 1.0, 1.5) * 0.4 -
        Math.max(0, r - rMin) * 0.18;
      return { x, y, z, yaw: (k * Math.PI) / 2, score, back: bk, wide };
    };
    if (pin) {
      const c = judge(pin.x, pin.z, pin.k, rMin);
      if (c) {
        c.pinned = true;
        return c;
      }
    }
    pin = null;
    let best = null;
    const seen = new Set();
    for (let r = rMin; r <= rMax + 0.01; r += 1.5) {
      const n = Math.max(8, Math.ceil((Math.PI * 2 * r) / 1.4));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + r * 0.37;
        let px = ax + Math.cos(a) * r,
          pz = az + Math.sin(a) * r;
        if (blocks(px, pz)) continue;
        const gy = ground(px, pz);
        if (gy === null) continue;
        const D = rays(px, gy, pz);
        for (let k = 0; k < 4; k++) {
          const [f, bk, rt, lf] = YAW_DIRS[k].map((j) => D[j]);
          if (f < 2.4 || bk < 0.42 || rt + lf < 2.85) continue;
          const [rx, rz] = AX[YAW_DIRS[k][2]],
            [bx, bz] = AX[YAW_DIRS[k][1]];
          // centre in a gap (crate side needs 0.7 m more), then back up to a wall ~12 cm off it
          let x = px,
            z = pz;
          if (rt < 3 || lf < 3) {
            const sl = Math.max(-1.6, Math.min(1.6, (rt - lf - 0.7) / 2));
            x += rx * sl;
            z += rz * sl;
          }
          if (bk <= 2.4) {
            const sh = bk - 0.78;
            x += bx * sh;
            z += bz * sh;
          } // ~40 cm off the collider (visible walls, wainscots and facade relief sit in front of it)
          const key = Math.round(x * 4) + "," + Math.round(z * 4) + "," + k;
          if (seen.has(key)) continue;
          seen.add(key);
          const c = judge(x, z, k, r);
          if (c && (!best || c.score > best.score)) best = c;
        }
      }
    }
    return best;
  };
  X.spawnReloadBenches = function () {
    if (
      X.reloadBenches.length ||
      !G.scene ||
      !G.world ||
      !G.world.addInteractable
    )
      return;
    X.defineSupplyLoot();
    X.RELOAD_BENCHES.forEach(([site, names, fb, rMin, rMax, note, pin], i) => {
      try {
        const an = anchorOf(site, names);
        const ax = an ? an.x : fb.x,
          az = an ? an.z : fb.z,
          ay = an ? an.y : null;
        let s = X.benchSpot(
          ax,
          ay,
          az,
          rMin,
          rMax,
          an ? an.face : null,
          pin,
          an ? an.eye : null,
        );
        if (!s && an) s = X.benchSpot(fb.x, null, fb.z, 0, rMax);
        if (!s) {
          if (G.warnings)
            G.warnings.push(
              "crafting: no spot for reloading bench (" + note + ")",
            );
          return;
        }
        const rec = placeBench(
          s.x,
          s.y,
          s.z,
          s.yaw,
          note,
          i,
          an ? an.name : "fallback",
        );
        rec.fit = {
          score: +s.score.toFixed(2),
          back: +s.back.toFixed(2),
          wide: s.wide,
          pinned: !!s.pinned,
          pinWhy: pin && !s.pinned ? X.pinWhy : undefined,
        };
        X.reloadBenches.push(rec);
      } catch (e) {
        G.reportError("crafting:reloadBench", e);
      }
    });
  };
  const _up = new THREE.Vector3(0, 1, 0);
  const local = (x, y, z, lx, ly, lz, yaw) =>
    new THREE.Vector3(lx, ly, lz)
      .applyAxisAngle(_up, yaw)
      .add(new THREE.Vector3(x, y, z));
  function placeBench(x, y, z, yaw, note, idx, anchor) {
    const M = buildModel(),
      mt = mats();
    const grp = new THREE.Group();
    grp.name = "cr_reloading_bench";
    let indoor = false;
    try {
      indoor = !!G.world.raycast(new THREE.Vector3(x, y + 2.4, z), _up, 70, {
        ignoreTags: ["actor", "foliage"],
      });
    } catch (e) {
      indoor = false;
    }
    const a = new THREE.Mesh(M.wood, mt.wood),
      b = new THREE.Mesh(M.metal, mt.metal),
      c = new THREE.Mesh(M.glass, indoor ? mt.glassIn : mt.glass);
    for (const m of [a, b, c]) {
      m.castShadow = m !== c;
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      grp.add(m);
    }
    grp.position.set(x, y, z);
    grp.rotation.y = yaw;
    grp.updateMatrixWorld(true);
    G.scene.add(grp);
    if (G.world.addLOD) G.world.addLOD(grp, 85);
    try {
      G.world.addCollider(x, z, 1.78, 0.8, y, y + 0.9, yaw, {
        tag: "prop",
        surface: "wood",
      });
    } catch (e) {
      /* ignore */
    }
    const cp = local(x, y, z, M.crate.x, 0, M.crate.z, yaw);
    try {
      G.world.addCollider(
        cp.x,
        cp.z,
        M.crate.w,
        M.crate.d,
        y,
        y + M.crate.h,
        yaw,
        { tag: "prop", surface: "wood" },
      );
    } catch (e) {
      /* ignore */
    }
    // interact point: bench top, front edge (local (0, 1.0, -0.2))
    const ip = local(x, y, z, 0, 1.0, -0.2, yaw);
    const it = G.world.addInteractable({
      pos: ip,
      radius: 0.8,
      range: 2.6,
      priority: 0.5,
      label: "Reloading Bench",
      verb: "Use",
      onInteract: () => {
        C.open("reloading");
      },
    });
    // the crate beside it: a restocking "Reloading Supplies" container (rpg containers)
    let box = null;
    try {
      if (
        !G.isStub("containers") &&
        G.containers &&
        typeof G.containers.create === "function" &&
        G.items.hasLootTable &&
        G.items.hasLootTable("cr_reloading_supplies")
      ) {
        const bp = local(x, y, z, M.crate.x, 0.05, M.crate.z - 0.12, yaw);
        box = G.containers.create({
          id: "cr_rsupply_" + idx,
          pos: { x: bp.x, y: bp.y, z: bp.z },
          model: false,
          name: "Reloading Supplies",
          kind: "ammo_box",
          loot: "cr_reloading_supplies",
          respawn: true,
          level: 1,
          radius: 0.45,
        });
      }
    } catch (e) {
      G.reportError("crafting:supplyCrate", e);
      box = null;
    }
    return {
      x,
      y,
      z,
      yaw,
      note,
      anchor,
      obj: grp,
      interactable: it,
      container: box,
    };
  }
})();
