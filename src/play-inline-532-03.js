// play-inline-532 03 — def
// Lines 702-1030 of readable/play-inline-532.pretty.js (statement-aligned).
  X.modWeaponRows = function () {
    const out = [];
    const P = X.wpnData();
    if (!X.invReal() || !P || !P.MODS) return out;
    let weapons = [];
    try {
      weapons = G.inventory.list("weapon") || [];
    } catch (e) {
      return out;
    }
    const shop = Array.isArray(P.WORKSHOP) ? P.WORKSHOP : [];
    for (const w of weapons) {
      const wd = w.def && w.def.weapon;
      if (
        !wd ||
        wd.reloadType === "throw" ||
        wd.reloadType === "melee" ||
        w.id === "unarmed"
      )
        continue;
      const fit = Object.keys(P.MODS).filter(
        (m) => P.MODS[m].fits && P.MODS[m].fits.indexOf(w.id) >= 0,
      );
      const installed = X.modsOf(w.id);
      const mods = fit.map((m) => {
        const inst = installed.indexOf(m) >= 0,
          have = X.count(m);
        let can = false;
        try {
          can = !inst && G.weapons.canInstallMod(w.id, m);
        } catch (e) {
          can = false;
        }
        const e = shop.find((x) => x.makes === m) || null;
        const craft = e
          ? X.recipes("workbench", "workshop").find((r) => r.key === e.id) ||
            null
          : null;
        let why = "";
        if (inst) why = "Installed.";
        else if (!can)
          why =
            "Another " +
            (P.MODS[m].kind === "scope"
              ? "scope"
              : P.MODS[m].kind === "extMag"
                ? "magazine"
                : "mod") +
            " already fills that slot.";
        else if (!have && !craft) why = "You don't have this mod.";
        else if (!have && X.blocker(craft, 1))
          why = "Not carried. Workshop: " + X.blocker(craft, 1);
        return {
          id: m,
          name: X.name(m),
          kind: P.MODS[m].kind,
          effect: P.MODS[m].effect || "",
          installed: inst,
          have,
          can: can && (have > 0 || (craft && !X.blocker(craft, 1))),
          why,
          craft,
        };
      });
      out.push({
        wid: w.id,
        def: w.def,
        count: w.count,
        equipped: !!w.equipped,
        mods,
        nInst: installed.length,
      });
    }
    // equipped first, then guns that take mods, then the rest
    out.sort(
      (a, b) =>
        b.equipped - a.equipped ||
        (b.mods.length > 0) - (a.mods.length > 0) ||
        a.def.name.localeCompare(b.def.name),
    );
    return out;
  };
  /** Weapon stat block as the player has it now, and with `modId` added (null = same). */
  X.modPreview = function (wid, modId) {
    const P = X.wpnData();
    let def = null;
    try {
      def = G.weapons.getDef(wid);
    } catch (e) {
      def = null;
    }
    if (!def || !def.weapon || !P) return null;
    let cur = def;
    try {
      if (P.moddedDef) cur = P.moddedDef(def) || def;
    } catch (e) {
      cur = def;
    }
    const now = Object.assign({}, cur.weapon);
    let next = null;
    if (modId && P.MODS[modId] && X.modsOf(wid).indexOf(modId) < 0) {
      next = Object.assign({}, now);
      try {
        P.MODS[modId].apply(next);
      } catch (e) {
        next = null;
      }
    }
    return { def, now, next, cond: X.weaponCond(wid) };
  };
  /**
   * How condition scales a gun: damage and spread. Prefers weapons' own numbers
   * (G.weapons.condStats(id, cond) → {damage, spread} multipliers) and falls back to the
   * current combat / weapons formulas.
   */
  X.condMults = function (wid, c) {
    try {
      if (X.wpnReal() && typeof G.weapons.condStats === "function") {
        const r = G.weapons.condStats(wid, c);
        if (r && isFinite(r.damage) && isFinite(r.spread))
          return { damage: r.damage, spread: r.spread };
      }
    } catch (e) {
      /* ignore */
    }
    return { damage: 0.6 + 0.4 * c, spread: 1 + (1 - c) * 1.2 };
  };
  X.weaponCond = (wid) => {
    try {
      if (X.wpnReal() && typeof G.weapons.condition === "function") {
        const c = G.weapons.condition(wid);
        if (isFinite(c)) return Math.max(0, Math.min(1, c));
      }
    } catch (e) {
      /* ignore */
    }
    const d = X.def(wid);
    return d && d.hasCondition ? X.condOf(wid) : 1;
  };
  /** Install a mod from the MODIFY view (builds it at the workshop first when not carried). */
  X.installModRow = function (wrow, m) {
    if (!wrow || !m) return { ok: false, reason: "Nothing selected." };
    if (m.installed) return { ok: false, reason: "Already installed." };
    if (!m.can) return { ok: false, reason: m.why || "Can't install that." };
    if (!(X.count(m.id) > 0) && m.craft) {
      const r = X.craft(m.craft, 1, "workbench");
      if (!r.ok) return r;
    }
    return X.installMod({ wid: wrow.wid, modId: m.id, installed: false });
  };
  X.canInstall = function (row) {
    if (!row || row.installed) return false;
    try {
      return (
        X.wpnReal() &&
        G.weapons.canInstallMod(row.wid, row.modId) &&
        X.count(row.modId) > 0
      );
    } catch (e) {
      return false;
    }
  };
  X.installMod = function (row) {
    if (!X.wpnReal() || typeof G.weapons.installMod !== "function")
      return { ok: false, reason: "Weapon mods unavailable." };
    let res;
    try {
      res = G.weapons.installMod(row.wid, row.modId);
    } catch (e) {
      G.reportError("crafting:installMod", e);
      res = { ok: false, reason: "Error." };
    }
    if (res && res.ok) {
      X.S.stats.modded++;
      X.sfxSeq([
        [0, "gear_rattle", { volume: 0.4 }],
        [0.3, "ui_equip", { volume: 0.5 }],
      ]);
    }
    return res || { ok: false, reason: "Failed." };
  };

  // ------------------------------------------------------------------
  // Repair
  // ------------------------------------------------------------------
  const KIT = "cr_weapon_repair_kit";
  const isThrown = (d) =>
    d && d.type === "weapon" && d.weapon && d.weapon.reloadType === "throw";
  X.condOf = (id) => {
    try {
      return X.invReal() ? G.inventory.condition(id) || 0 : 0;
    } catch (e) {
      return 0;
    }
  };
  X.repairCap = () => {
    try {
      return X.invReal() && G.inventory.repairCap ? G.inventory.repairCap() : 1;
    } catch (e) {
      return 1;
    }
  };
  /** Rows: weapons & apparel you carry that track condition. */
  X.repairRows = function () {
    const rows = [];
    if (!X.invReal()) return rows;
    let list = [];
    try {
      list = G.inventory.list(["weapon", "apparel"]) || [];
    } catch (e) {
      return rows;
    }
    for (const e of list) {
      const d = e.def;
      if (!d || !d.hasCondition || isThrown(d)) continue;
      rows.push({
        id: e.id,
        def: d,
        count: e.count,
        equipped: !!e.equipped,
        cond: X.condOf(e.id),
      });
    }
    rows.sort(
      (a, b) =>
        b.equipped - a.equipped ||
        (a.def.type === b.def.type ? 0 : a.def.type === "weapon" ? -1 : 1) ||
        a.cond - b.cond ||
        a.def.name.localeCompare(b.def.name),
    );
    return rows;
  };
  /** Kit gain (better with Mechanics). */
  X.kitGain = () => 0.2 + (X.skill("mechanics") / 100) * 0.25;
  /** Repair methods for one row: [{key, label, can, why, gain, donor?}] */
  X.repairMethods = function (row) {
    const out = [];
    if (!row) return out;
    const cur = X.condOf(row.id),
      cap = X.repairCap();
    // 1) cannibalise a spare of the same item
    let can = false,
      gain = 0,
      why = "";
    try {
      can = !!G.inventory.canRepair(row.id);
      gain = can && G.inventory.repairGain ? G.inventory.repairGain(row.id) : 0;
    } catch (e) {
      can = false;
    }
    if (!can)
      why =
        row.count < 2
          ? "Needs a second " + row.def.name + "."
          : cur >= cap - 0.01
            ? "Your Mechanics skill limits you to " +
              Math.round(cap * 100) +
              "%."
            : "Can't repair.";
    out.push({
      key: "dup",
      label: "Combine with a spare " + row.def.name,
      can,
      why,
      gain,
      donor: row.id,
    });
    // 2) similar weapons (same family) as donors
    if (
      row.def.type === "weapon" &&
      X.wpnReal() &&
      typeof G.weapons.canRepairWith === "function"
    ) {
      let weapons = [];
      try {
        weapons = G.inventory.list("weapon") || [];
      } catch (e) {
        weapons = [];
      }
      for (const w of weapons) {
        if (w.id === row.id || isThrown(w.def)) continue;
        let ok = false;
        try {
          ok = G.weapons.canRepairWith(row.id, w.id);
        } catch (e) {
          ok = false;
        }
        if (!ok) continue;
        const dc = X.condOf(w.id);
        const g = Math.max(
          0.05,
          dc * (0.25 + (0.6 * X.skill("mechanics")) / 100),
        );
        const capW = Math.min(1, 0.6 + (X.skill("mechanics") / 100) * 0.4);
        const real = Math.max(0, Math.min(capW, cur + g) - cur);
        out.push({
          key: "sim:" + w.id,
          label:
            "Cannibalise " + w.def.name + (w.equipped ? " (equipped)" : ""),
          can: real > 0.001 && !w.equipped,
          why: w.equipped
            ? "Unequip it first."
            : real <= 0.001
              ? "Your Mechanics skill limits you to " +
                Math.round(capW * 100) +
                "%."
              : "",
          gain: real,
          donor: w.id,
        });
      }
    }
    // 3) Gunsmith Kit
    if (row.def.type === "weapon") {
      const have = X.count(KIT);
      const g = Math.max(0, Math.min(1, cur + X.kitGain()) - cur);
      out.push({
        key: "kit",
        label: "Use a Gunsmith Kit" + (have ? " (" + have + ")" : ""),
        can: have > 0 && g > 0.001,
        why: !have
          ? "You have no Gunsmith Kits."
          : "Already in perfect condition.",
        gain: g,
      });
    }
    return out;
  };
  /** Apply a repair method. Returns {ok, gain, cond} | {ok:false, reason}. */
