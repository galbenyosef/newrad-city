// play-inline-532 02 — row
// Lines 366-701 of readable/play-inline-532.pretty.js (statement-aligned).
  X.findRecipe = function (key) {
    for (const st of Object.keys(X.TABS))
      for (const [tab] of X.TABS[st]) {
        if (tab === "modify" || tab === "repair") continue;
        const r = X.recipes(st, tab).find((x) => x.key === key);
        if (r) return Object.assign({ station: st, tab }, r);
      }
    return null;
  };

  /** First unmet skill gate → {skill, value} | null */
  X.unmetReq = function (row) {
    for (const k in row.req || {})
      if (X.skill(k) < row.req[k]) return { skill: k, value: row.req[k] };
    return null;
  };
  /** How many times the row can be built right now (0 = none), capped. */
  X.maxTimes = function (row, cap) {
    if (!X.invReal()) return 0;
    let m = cap || 10;
    for (const [id, n] of row.parts)
      m = Math.min(m, Math.floor(X.count(id) / Math.max(1, n)));
    return Math.max(0, m);
  };
  /** Why a row can't be built (string) or null. */
  X.blocker = function (row, times) {
    times = times || 1;
    if (!X.invReal()) return "No inventory.";
    if (row.kind === "schem" && !(row.copies > 0))
      return "You don't know this schematic.";
    const u = X.unmetReq(row);
    if (u)
      return (
        "Requires " + (X.SKILL_NAMES[u.skill] || u.skill) + " " + u.value + "."
      );
    for (const [id, n] of row.parts)
      if (X.count(id) < n * times) return "Missing components.";
    return null;
  };

  /**
   * Build a row `times` times. Returns {ok, made, n} | {ok:false, reason}.
   * Weapons-owned rows go through G.weapons.craft (it notifies, plays sound and gives XP itself).
   */
  X.WPN_BATCH = 10; // weapons-owned recipes build one unit per G.weapons.craft call
  X.craft = function (row, times, station) {
    times = Math.max(1, times | 0 || 1);
    const why = X.blocker(row, times);
    if (why) return { ok: false, reason: why };
    if (row.src === "wpn") {
      if (!X.wpnReal()) return { ok: false, reason: "Unavailable." };
      times = Math.min(times, X.WPN_BATCH);
      let made = 0,
        last = null,
        fail = null;
      // G.weapons.craft notifies and plays its own sounds once per unit: for a batch, mute those
      // (restored in finally) and post one summary + one set of bench sounds instead.
      const quiet = times > 1;
      const n0 = G.notify,
        sp = G.sfx && G.sfx.play;
      if (quiet) {
        G.notify = function () {
          return null;
        };
        if (sp)
          G.sfx.play = function () {
            return null;
          };
      }
      try {
        for (let i = 0; i < times; i++) {
          let res = null;
          try {
            res = G.weapons.craft(row.wpnId);
          } catch (e) {
            G.reportError("crafting:wpnCraft", e);
          }
          if (!res || !res.ok) {
            fail = (res && res.reason) || "Failed.";
            break;
          }
          made += res.n || 1;
          last = res;
        }
      } finally {
        if (quiet) {
          G.notify = n0;
          if (sp) G.sfx.play = sp;
        }
      }
      if (!made) return { ok: false, reason: fail || "Failed." };
      X.S.stats.crafted += made;
      if (quiet) {
        try {
          G.notify(
            X.name((last && last.made) || row.makes) +
              " (" +
              made +
              ") crafted.",
            { kind: "item", id: row.makes, count: made },
          );
        } catch (e) {
          /* ignore */
        }
      }
      X.craftFeedback(row, station || "workbench");
      return { ok: true, made: (last && last.made) || row.makes, n: made };
    }
    // our recipes: take the parts, then hand over the product
    for (const [id, n] of row.parts) {
      try {
        G.inventory.remove(id, n * times, { silent: true });
      } catch (e) {
        G.reportError("crafting:remove " + id, e);
        return { ok: false, reason: "Inventory error." };
      }
    }
    const total = (row.n || 1) * times;
    const def = X.def(row.makes);
    const st = station || row.station || "workbench";
    if (row.gives) {
      // break-down style recipe: several outputs
      for (const [id, n] of row.gives) {
        try {
          G.inventory.add(id, n * times, { silent: true });
        } catch (e) {
          G.reportError("crafting:add " + id, e);
        }
      }
      X.S.stats.brokenDown = (X.S.stats.brokenDown || 0) + times;
      try {
        G.notify(
          X.name(row.makes) +
            (times > 1 ? " (" + times + ")" : "") +
            " broken down.",
          { kind: "item", id: row.makes },
        );
      } catch (e) {
        /* ignore */
      }
      X.craftFeedback(row, st);
      G.events.emit("itemCrafted", row.makes, 0, {
        station: st,
        recipe: row.key,
        breakdown: times,
      });
      return { ok: true, made: row.makes, n: times, broken: true };
    }
    const opts = { silent: true };
    if (def && def.hasCondition)
      opts.cond = row.cond !== null && row.cond !== undefined ? row.cond : 1;
    try {
      G.inventory.add(row.makes, total, opts);
    } catch (e) {
      G.reportError("crafting:add " + row.makes, e);
    }
    X.addXP((row.xp || 0) * times, st === "campfire" ? "Cooking" : "Crafting");
    const S = X.S.stats;
    S.crafted += total;
    if (row.tab === "cooking" || (st === "campfire" && row.tab !== "remedies"))
      S.cooked += total;
    if (row.tab === "chemistry" || row.tab === "remedies") S.chems += total;
    if (st === "reloading") S.handloaded = (S.handloaded || 0) + total;
    try {
      G.notify(
        X.name(row.makes) +
          (total > 1 ? " (" + total + ")" : "") +
          (st === "campfire" && row.tab === "cooking"
            ? " cooked."
            : " crafted."),
        { kind: "item", id: row.makes, count: total },
      );
    } catch (e) {
      /* ignore */
    }
    X.craftFeedback(row, st);
    G.events.emit("itemCrafted", row.makes, total, {
      station: st,
      recipe: row.key,
    });
    return { ok: true, made: row.makes, n: total };
  };
  /** Station-specific sound: hammer & ratchet, sizzle, glassware. */
  X.craftFeedback = function (row, station) {
    if (station === "reloading") {
      // press stroke: primer seat, powder throw, bullet seat
      X.sfxSeq([
        [0, "reload", { volume: 0.45, pitch: 1.35 }],
        [0.16, "gear_rattle", { volume: 0.3, pitch: 1.4 }],
        [0.34, "machinery_clank", { volume: 0.35, pitch: 1.5 }],
      ]);
    } else if (station === "campfire") {
      X.sfxSeq([
        [0, "steam_hiss", { volume: 0.35, pitch: 0.6 }],
        [0.25, "fire_loop", { volume: 0.3 }],
        [0.55, row.tab === "remedies" ? "drink" : "eat", { volume: 0.35 }],
      ]);
    } else if (row.tab === "chemistry") {
      X.sfxSeq([
        [0, "drip", { volume: 0.5, pitch: 1.2 }],
        [0.18, "ui_select", { volume: 0.4, pitch: 0.8 }],
        [0.4, "hum_electric", { volume: 0.25, pitch: 1.6 }],
      ]);
    } else {
      X.sfxSeq([
        [0, "machinery_clank", { volume: 0.5 }],
        [0.2, "gear_rattle", { volume: 0.45 }],
        [0.45, "reload", { volume: 0.5, pitch: 0.75 }],
      ]);
    }
  };
  // looping recipes used as feedback (fire_loop / hum_electric) are stopped ~0.9 s later by X.tickSounds
  const loopHandles = [];
  const _play = X.sfx;
  X.sfx = function (name, o) {
    const h = _play(name, o);
    if (h && (name === "fire_loop" || name === "hum_electric"))
      loopHandles.push({ h, t: performance.now() + 900 });
    return h;
  };
  X.tickSounds = function () {
    if (!loopHandles.length) return;
    const now = performance.now();
    for (let i = loopHandles.length - 1; i >= 0; i--) {
      if (now >= loopHandles[i].t) {
        try {
          loopHandles[i].h.stop && loopHandles[i].h.stop(0.2);
        } catch (e) {
          /* ignore */
        }
        loopHandles.splice(i, 1);
      }
    }
  };

  // ------------------------------------------------------------------
  // Schematic learning (our two schematics; weapons learns its own)
  // ------------------------------------------------------------------
  X.onItemAdded = function (id, n) {
    const s = X.SCHEM[id];
    if (!s) return;
    const add = Math.max(1, n | 0 || 1);
    const before = X.S.schem[id] | 0;
    const now = Math.min(3, before + add);
    X.S.schem[id] = now;
    pendingLearn.push([id, add]);
    const what = X.name(s.makes);
    let msg;
    if (!before)
      msg = "Schematic learned: " + what + ". Build it at any workbench.";
    else if (now > before)
      msg =
        what +
        " schematic " +
        now +
        "/3: " +
        (s.perCopy === "count"
          ? "you now build " + now + " per batch."
          : "crafted condition improved.");
    else
      msg =
        "You already know everything this " +
        what +
        " schematic can teach you.";
    try {
      G.notify(msg, { kind: "skill", icon: "wrench" });
    } catch (e) {
      /* ignore */
    }
    X.sfx(X.hasSfx("ui_confirm") ? "ui_confirm" : "ui_select", { volume: 0.5 });
    G.events.emit("schematicLearned", id, now);
  };
  X.flushLearned = function () {
    if (!pendingLearn.length || !X.invReal()) return;
    const list = pendingLearn.splice(0);
    for (const [id, n] of list) {
      try {
        const c = X.count(id);
        if (c > 0) G.inventory.remove(id, Math.min(n, c), { silent: true });
      } catch (e) {
        /* ignore */
      }
    }
  };
  X.clearPending = () => {
    pendingLearn.length = 0;
  };

  // ------------------------------------------------------------------
  // Weapon mods
  // ------------------------------------------------------------------
  const modInfo = (id) => {
    const d = X.def(id);
    return d && d.mod && Array.isArray(d.mod.fits) ? d.mod : null;
  };
  X.modsOf = (wid) => {
    try {
      return X.wpnReal() && G.weapons.modsOf ? G.weapons.modsOf(wid) || [] : [];
    } catch (e) {
      return [];
    }
  };
  /** Rows: every (mod item you carry × owned weapon it fits) plus every installed mod on an owned weapon. */
  X.modRows = function () {
    const rows = [];
    if (!X.invReal()) return rows;
    let weapons = [],
      misc = [];
    try {
      weapons = G.inventory.list("weapon") || [];
      misc = G.inventory.list("misc") || [];
    } catch (e) {
      return rows;
    }
    const mods = misc.filter((e) => modInfo(e.id));
    for (const w of weapons) {
      const installed = X.modsOf(w.id);
      for (const mid of installed)
        rows.push({ modId: mid, wid: w.id, installed: true });
      for (const m of mods) {
        if (installed.indexOf(m.id) >= 0) continue;
        if (modInfo(m.id).fits.indexOf(w.id) < 0) continue;
        rows.push({ modId: m.id, wid: w.id, installed: false, have: m.count });
      }
    }
    rows.sort(
      (a, b) =>
        X.name(a.wid).localeCompare(X.name(b.wid)) ||
        (a.installed === b.installed ? 0 : a.installed ? 1 : -1),
    );
    return rows;
  };
  /**
   * "Modify" view: one row per carried weapon that takes mods.
   * {wid, def, mods:[{id, name, installed, have, can, why, craft}]}  craft = workshop row (build & install) or null
   */
