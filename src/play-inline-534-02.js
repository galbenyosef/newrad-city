// play-inline-534 02 — pendingbrass
// Lines 329-482 of readable/play-inline-534.pretty.js (statement-aligned).
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
