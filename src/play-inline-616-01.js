// play-inline-616 01 — def
// Lines 16-311 of readable/play-inline-616.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._uix;

  let C = null; // active session {c, w}

  // ---- container item access (Map | array | object) ----
  function cItems(c) {
    const it = c.items;
    if (!it) return [];
    if (it instanceof Map) return Array.from(it.entries());
    if (Array.isArray(it))
      return it.map((e) =>
        Array.isArray(e) ? [e[0], e[1]] : [e.id, e.count || e.n || 1],
      );
    if (typeof it === "object") return Object.keys(it).map((k) => [k, it[k]]);
    return [];
  }
  function cCount(c, id) {
    let n = 0;
    for (const e of cItems(c)) if (e[0] === id) n += e[1];
    return n;
  }
  function cRawAdd(c, id, n) {
    if (!c.items) c.items = new Map();
    const it = c.items;
    if (it instanceof Map) it.set(id, (it.get(id) || 0) + n);
    else if (Array.isArray(it)) {
      const e = it.find((x) => (Array.isArray(x) ? x[0] : x.id) === id);
      if (e) {
        if (Array.isArray(e)) e[1] += n;
        else e.count = (e.count || 1) + n;
      } else it.push([id, n]);
    } else it[id] = (it[id] || 0) + n;
  }
  function cRawRemove(c, id, n) {
    const it = c.items;
    if (!it) return;
    if (it instanceof Map) {
      const v = (it.get(id) || 0) - n;
      if (v > 0) it.set(id, v);
      else it.delete(id);
    } else if (Array.isArray(it)) {
      for (let i = it.length - 1; i >= 0 && n > 0; i--) {
        const e = it[i];
        const eid = Array.isArray(e) ? e[0] : e.id;
        if (eid !== id) continue;
        const have = Array.isArray(e) ? e[1] : e.count || 1;
        const k = Math.min(n, have);
        n -= k;
        if (have - k <= 0) it.splice(i, 1);
        else if (Array.isArray(e)) e[1] = have - k;
        else e.count = have - k;
      }
    } else {
      const v = (it[id] || 0) - n;
      if (v > 0) it[id] = v;
      else delete it[id];
    }
  }

  /** Move n of id from container → player. Uses container.take when present, repairs whatever it didn't do. */
  function doTake(c, id, n, noSteal) {
    const cBefore = cCount(c, id),
      iBefore = X.invCount(id);
    if (typeof c.take === "function") {
      try {
        c.take(id, n, { silent: true, noSteal: !!noSteal });
      } catch (e) {
        G.reportError("container:take", e);
      }
    }
    let removed = cBefore - cCount(c, id);
    if (removed <= 0) {
      cRawRemove(c, id, n);
      removed = cBefore - cCount(c, id);
    }
    const gained = X.invCount(id) - iBefore;
    if (gained < removed) X.invAdd(id, removed - gained);
    return removed;
  }
  /** Move n of id from player → container. */
  function doPut(c, id, n) {
    const cBefore = cCount(c, id),
      iBefore = X.invCount(id);
    try {
      if (
        X.live("inventory") &&
        G.inventory.isEquipped &&
        G.inventory.isEquipped(id) &&
        iBefore <= n
      )
        G.inventory.unequip(id);
    } catch (e) {
      /* ignore */
    }
    if (typeof c.put === "function") {
      try {
        c.put(id, n);
      } catch (e) {
        G.reportError("container:put", e);
      }
    }
    let added = cCount(c, id) - cBefore;
    if (added <= 0) {
      cRawAdd(c, id, n);
      added = n;
    }
    const lost = iBefore - X.invCount(id);
    if (lost < added) X.invRemove(id, added - lost);
    return added;
  }

  function isOwned(c) {
    if (c && typeof c.isOwned === "function") {
      try {
        return !!c.isOwned();
      } catch (e) {
        /* fall through */
      }
    }
    return !!(
      c &&
      c.owner &&
      c.owner !== "player" &&
      c.owner !== "none" &&
      !c.playerOwned
    );
  }
  /** rpg-made containers (G.containers.create) run their own steal checks, sounds and open events. */
  const managed = (c) =>
    !!(c && typeof c.rollNow === "function" && typeof c.take === "function");

  // ---- theft ----
  function witnesses(owner) {
    const out = [];
    if (!X.live("actors")) return out;
    try {
      const P = G.player,
        eye = P.eye;
      const range = P.sneaking ? 9 : 22;
      const list = G.actors.list() || [];
      for (const a of list) {
        if (!a || a.dead || !a.pos) continue;
        if (a.faction !== owner && !(a.owner && a.owner === owner)) continue;
        const d = Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z);
        if (d > range) continue;
        const head = { x: a.pos.x, y: a.pos.y + 1.6, z: a.pos.z };
        if (
          G.world.lineOfSight(
            new window.THREE.Vector3(head.x, head.y, head.z),
            eye,
            { ignoreTags: ["actor", "interactable_self"] },
          )
        )
          out.push(a);
      }
    } catch (e) {
      G.reportError("container:witness", e);
    }
    return out;
  }
  /** Standing lost for a haul worth v Scrip (small thefts still cost something). */
  function theftStanding(v) {
    return -Math.max(1, Math.min(15, Math.round(v / 25)));
  }
  /**
   * Theft from a plain (non-rpg) owned container. Standing is not charged per stack: the value is
   * pooled on the session and charged once when the container closes (settleTheft). The witness
   * check runs per take until someone has seen you — then the session is "caught" and no further
   * notifications / hostility spam happen.
   */
  function onSteal(c, id, n, totalValue) {
    const def = X.itemDef(id);
    const v = totalValue !== undefined ? totalValue : (def.value || 1) * n;
    if (C && C.c === c) {
      C.stolenVal = (C.stolenVal || 0) + v;
      C.stolenN = (C.stolenN || 0) + n;
    } else X.standing(theftStanding(v), "Stealing"); // no session (shouldn't happen) → charge now
    const seen = C && C.caught ? [] : witnesses(c.owner);
    if (seen.length) {
      C && C.w && C.w.flash("You were caught stealing!", true);
      G.notify("You were caught stealing!");
      X.sfx("stealth_detected", { volume: 0.8 }, "sneak_detected");
      for (const a of seen) {
        try {
          if (a.setHostile) a.setHostile(true);
          if (a.say) a.say("Thief!");
        } catch (e) {
          /* ignore */
        }
      }
      C && (C.caught = true);
    }
    G.events.emit("itemStolen", id, n, c.owner, seen.length > 0);
  }

  // ---- entries ----
  function leftEntries() {
    // Scrip and the hero's own kit (the goggles) never show up as storable items
    return X.sortEntries(
      X.invList().filter((e) => !X.isCurrency(e.id) && !X.isKit(e.id, e.def)),
    );
  }
  function rightEntries() {
    const owned = isOwned(C.c);
    const cond = (id) => {
      try {
        return typeof C.c.condition === "function" &&
          C.c.conds &&
          C.c.conds.has &&
          C.c.conds.has(id)
          ? C.c.condition(id)
          : null;
      } catch (e) {
        return null;
      }
    };
    return X.sortEntries(
      cItems(C.c)
        .filter((e) => e[1] > 0)
        .map(([id, n]) => ({
          id,
          count: n,
          def: X.itemDef(id),
          condition: cond(id),
          steal: owned,
        })),
    );
  }

  async function activate(side, e, all) {
    if (!C || !e || C.busy) return;
    let n = 1;
    if (side === 0 && e.def && e.def.quest) {
      C.w.flash("You can't store quest items.", true);
      X.sfx("ui_error", { volume: 0.5 });
      return;
    }
    if (e.count > 1) {
      if (
        all ||
        X.isCurrency(e.id) ||
        (e.def && e.def.type === "ammo" && side === 1)
      )
        n = e.count;
      else {
        C.busy = true;
        const verb =
          side === 1
            ? e.steal
              ? "Steal"
              : "Take"
            : isPick(C.c)
              ? "Plant"
              : "Store";
        const chanceFn =
          isPick(C.c) && side === 1
            ? (k) => "Chance to succeed: " + pickChance(C.c, e.def, k) + "%"
            : null;
        n = await C.w.askQty(
          e.count,
          verb + " how many " + (e.def.name || e.id) + "?",
          chanceFn,
        );
        C.busy = false;
        if (!C || !n) return;
      }
    }
    if (side === 1) {
      const got = doTake(C.c, e.id, n);
      if (got > 0) {
        if (X.isCurrency(e.id))
          X.sfx("pickup_scrip", { volume: 0.6 }, "pickup");
        else
          X.sfx(
            e.def.type === "weapon"
              ? "pickup_weapon"
              : e.def.type === "apparel"
                ? "pickup_armor"
                : "pickup",
            { volume: 0.6 },
          );
        if (e.steal && !managed(C.c)) onSteal(C.c, e.id, got);
        G.events.emit("containerTake", C.c, e.id, got);
      }
    } else {
      const put = doPut(C.c, e.id, n);
      if (put > 0) {
        X.sfx("ui_click", { volume: 0.5 });
        G.events.emit("containerPut", C.c, e.id, put);
      }
    }
    if (C) C.w.render();
  }

