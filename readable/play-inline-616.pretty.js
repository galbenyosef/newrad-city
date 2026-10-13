/* src/ui_interact/22_container.js */
/* =====================================================================
 * NEW RAD CITY — ui_interact / 22_container.js
 * G.ui.openContainer(container) — container transfer screen (goggle style).
 *  Left: your inventory (store).  Right: container contents (take).
 *  E take/store one stack (quantity chooser for stacks), SHIFT = all,
 *  R = Take All (closes), TAB/ESC close.
 *  Owned containers show red [STEAL]; theft costs Standing and witnesses
 *  of the owner's faction turn hostile. Locked containers are routed
 *  through G.locks first: container.lock = {id, key?, code?, passcode?}.
 * Container API expected (rpg): {name, items: Map id→count, lock?, owner,
 *   take(id,n), put(id,n), takeAll()} — handled defensively (arrays, plain
 *   objects, missing methods all work).
 * ===================================================================== */
(function () {
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

  function takeAll() {
    if (!C || C.busy) return;
    if (isPick(C.c)) {
      C.w.flash("Take one thing at a time. Carefully.", true);
      X.sfx("ui_error", { volume: 0.4 });
      return;
    }
    const items = cItems(C.c).filter((e) => e[1] > 0);
    if (!items.length) {
      close();
      return;
    }
    const owned = isOwned(C.c);
    let stolenVal = 0,
      stolenN = 0;
    if (typeof C.c.takeAll === "function" && !owned) {
      const before = items.map(([id]) => [id, X.invCount(id), cCount(C.c, id)]);
      try {
        C.c.takeAll();
      } catch (e) {
        G.reportError("container:takeAll", e);
      }
      // repair: anything that left the container but didn't reach the player (or never left)
      for (const [id, inv0, c0] of before) {
        const removed = c0 - cCount(C.c, id),
          gained = X.invCount(id) - inv0;
        if (removed <= 0) doTake(C.c, id, cCount(C.c, id));
        else if (gained < removed) X.invAdd(id, removed - gained);
      }
    } else {
      // Owned: one theft event for the whole haul (one Standing hit / witness check / notification),
      // not one per stack. rpg containers get a single stealCheck with the total value.
      const batch = owned && managed(C.c);
      for (const [id, n] of items) {
        const got = doTake(C.c, id, n, batch);
        if (owned && got) {
          stolenVal += (X.itemDef(id).value || 1) * got;
          stolenN += got;
        }
      }
      if (batch && stolenN) {
        try {
          if (X.live("containers") && G.containers.stealCheck)
            G.containers.stealCheck(C.c.owner, stolenVal, {
              pos: C.c.pos,
              name: C.c.name || "items",
              container: C.c,
            });
        } catch (e) {
          G.reportError("container:stealCheck", e);
        }
      }
    }
    if (owned && stolenN && !managed(C.c))
      onSteal(C.c, items[0][0], stolenN, stolenVal);
    X.sfx("pickup", { volume: 0.7 });
    G.events.emit("containerTakeAll", C.c);
    close();
  }

  /** Row right-hand side: weight (dim) + value. */
  function rt(e) {
    const w = e.def.weight || 0;
    return (
      '<span class="wg">' +
      X.fmtNum(w) +
      '</span><span class="pr">' +
      Math.round(e.def.value || 0) +
      "</span>"
    );
  }

  // ---- pickpocketing (sneak + activate an unaware NPC) ----
  // The victim's pockets are a container flagged `pickpocket` (combat/10_actors.js Actor.pickpocket rolls
  // the detection in c.onTake). Every item shows its chance of lifting it unnoticed, there is
  // no Take All, and storing becomes planting.
  const isPick = (c) => !!(c && c.pickpocket);
  /** Chance (0-100) to steal n of an item unnoticed. Uses the container's own estimator when it has one,
   *  else mirrors combat's roll: caught = 6% + value/260 + weight×2.5% − Stealth/260 (3..95%). */
  function pickChance(c, def, n) {
    n = n || 1;
    try {
      if (typeof c.stealChance === "function") {
        const v = c.stealChance(def.id, n);
        if (typeof v === "number" && isFinite(v))
          return Math.round(X.clamp(v <= 1 ? v * 100 : v, 0, 100));
      }
    } catch (e) {
      /* estimate below */
    }
    const value = (def.value || 1) * n;
    const caught = X.clamp(
      0.06 + value / 260 + (def.weight || 0) * 0.025 - X.skill("stealth") / 260,
      0.03,
      0.95,
    );
    return Math.round((1 - caught) * 100);
  }
  function pickRt(e) {
    const p = pickChance(C.c, e.def, 1);
    return (
      '<span class="wg">' +
      X.fmtNum(e.def.weight || 0) +
      '</span><span class="pr pick' +
      (p < 50 ? " bad" : p < 75 ? " hard" : "") +
      '">' +
      p +
      "%</span>"
    );
  }

  function footer() {
    const w = X.invWeight(),
      max = X.carryMax();
    const owned = isOwned(C.c);
    if (isPick(C.c)) {
      const nm = String((C.c.actor && C.c.actor.name) || C.c.name || "Someone");
      return (
        "<span>WG " +
        X.fmtNum(w) +
        "/" +
        Math.round(max) +
        '<span class="ui-wbar' +
        (w > max ? " over" : "") +
        '"><i style="width:' +
        Math.min(100, (w / max) * 100) +
        '%"></i></span></span>' +
        "<span>SCRIP " +
        X.scrip() +
        '</span><span class="big bal-neg">' +
        X.esc(nm.toUpperCase()) +
        " IS UNAWARE</span>"
      );
    }
    return (
      "<span>WG " +
      X.fmtNum(w) +
      "/" +
      Math.round(max) +
      '<span class="ui-wbar' +
      (w > max ? " over" : "") +
      '"><i style="width:' +
      Math.min(100, (w / max) * 100) +
      '%"></i></span></span>' +
      "<span>SCRIP " +
      X.scrip() +
      "</span>" +
      (owned
        ? '<span class="big bal-neg">OWNED: ' +
          X.esc(X.ownerName(C.c.owner).toUpperCase()) +
          "</span>"
        : '<span class="big">' +
          X.esc((C.c.name || "Container").toUpperCase()) +
          "</span>")
    );
  }

  const screen = {
    id: "container",
    onKey(code, e) {
      if (!C) return false;
      if (C.w.qtyOpen) return C.w.qtyOpen.onKey(code);
      if (C.busy) return true;
      const K = X.K;
      if (K.up(code)) C.w.move(-1);
      else if (K.down(code)) C.w.move(1);
      else if (K.left(code)) C.w.switchCol(0);
      else if (K.right(code)) C.w.switchCol(1);
      else if (
        code === "Enter" ||
        code === "NumpadEnter" ||
        code === "KeyE" ||
        code === "Space"
      )
        activate(C.w.focus, C.w.current(), e && e.shiftKey);
      else if (code === "KeyR") takeAll();
      else if (code === "Escape" || code === "Tab") close();
      return true;
    },
  };

  /** Charge the pooled Standing loss for everything stolen this session, once. */
  function settleTheft(s) {
    if (s && s.stolenVal > 0) {
      X.standing(theftStanding(s.stolenVal), "Stealing");
      s.stolenVal = 0;
    }
  }
  function close() {
    if (!C) return;
    const s = C;
    C = null;
    settleTheft(s);
    X.popScreen(screen);
    s.w.destroy();
    X.sfx("container_close", { volume: 0.6 });
    try {
      if (s.c.onClose) s.c.onClose(s.c);
    } catch (e) {
      G.reportError("container:onClose", e);
    }
    G.events.emit("containerClosed", s.c);
    X.returnToPlay("container");
  }

  function open(c, opts) {
    opts = opts || {};
    if (!c) return false;
    if (C) close();
    // ---- locks (G.locks: key / keypad code / teletype passcode) ----
    if (!opts.force && c.lock && c.lock.id && !G.locks.isOpen(c.lock.id)) {
      G.locks.open(
        Object.assign({ kind: "container", label: c.name }, c.lock),
        () => setTimeout(() => open(c, { force: true }), 0),
      );
      return false;
    }
    try {
      if (typeof c.rollNow === "function") c.rollNow();
    } catch (e) {
      G.reportError("container:roll", e);
    }
    C = { c, busy: false };
    const owned = isOwned(c);
    const pick = isPick(c);
    const who = pick
      ? String((c.actor && c.actor.name) || c.name || "Someone").replace(
          /^(the )?(body|corpse|remains) of /i,
          "",
        )
      : "";
    C.w = X.createXfer({
      title: pick ? "PICKPOCKET" : c.name || "Container",
      cats: false,
      startFocus: 1,
      subtitle: () =>
        pick
          ? '<span style="color:var(--uix-bad)">[STEALTH ' +
            Math.round(X.skill("stealth")) +
            "] Getting caught turns " +
            X.esc(who) +
            " hostile</span>"
          : owned
            ? '<span style="color:var(--uix-bad)">[STEAL] Owned by ' +
              X.esc(X.ownerName(c.owner)) +
              "</span>"
            : "",
      cols: [
        {
          title: () => X.esc(X.heroName()).toUpperCase(),
          info: () => "",
          entries: leftEntries,
          right: rt,
          empty: "Your pockets are empty",
        },
        {
          title: () =>
            X.esc((pick ? who : c.name || "Container").toUpperCase()) +
            (owned ? ' <span style="color:var(--uix-bad)">[STEAL]</span>' : ""),
          info: () => (pick ? "CHANCE" : ""),
          entries: rightEntries,
          right: pick ? pickRt : rt,
          empty: pick ? "Nothing worth taking" : "Empty",
        },
      ],
      footer,
      keys: pick
        ? "<span><b>E</b>Steal / Plant</span><span><b>SHIFT+E</b>Whole stack</span><span><b>A/D</b>Column</span><span><b>TAB</b>Close</span>"
        : "<span><b>E</b>" +
          (owned ? "Steal" : "Take") +
          " / Store</span><span><b>SHIFT+E</b>Whole stack</span><span><b>R</b>" +
          (owned ? "Steal All" : "Take All") +
          "</span><span><b>A/D</b>Column</span><span><b>TAB</b>Close</span>",
      onActivate: activate,
    });
    X.pushScreen(screen);
    if (G.state !== "container") G.setState("container");
    if (!managed(c)) {
      X.sfx("container_open", { volume: 0.6 });
      try {
        if (c.onOpen) c.onOpen(c);
      } catch (e) {
        G.reportError("container:onOpen", e);
      }
      G.events.emit("containerOpened", c);
    }
    return true;
  }

  G.ui.openContainer = open;
  G.ui.closeContainer = close;
  X.container = {
    open,
    close,
    isOpen: () => !!C,
    onState(s) {
      if (C && s !== "container") {
        const w = C.w;
        settleTheft(C);
        C = null;
        X.popScreen(screen);
        w.destroy();
      }
    },
    reset() {
      if (C) {
        X.popScreen(screen);
        C.w.destroy();
        C = null;
      }
    },
  };
})();
