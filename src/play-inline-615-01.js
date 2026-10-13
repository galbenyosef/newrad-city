// play-inline-615 01 — actor
// Lines 13-353 of readable/play-inline-615.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._uix;

  let B = null; // active session

  // ---- merchant stock helpers (actor.merchant = {scrip, stock:[[id,n]]}) ----
  function merch(actor) {
    if (!actor) return null;
    if (!actor.merchant) {
      // Not a trader: never turn the actor into one. Use a session-only view built from whatever
      // they carry (a quest may still open barter with them) and throw it away on close.
      if (B && B.actor === actor && B.tmpMerch) return B.tmpMerch;
      const stock = [];
      let purse = 0;
      try {
        const inv = actor.inventory;
        const push = (id, n) => {
          n = Number(n) || 0;
          if (!id || n <= 0) return;
          if (X.isCurrency(id)) purse += n;
          else stock.push([id, n]);
        };
        if (Array.isArray(inv))
          inv.forEach((e) =>
            Array.isArray(e)
              ? push(e[0], e[1])
              : e && push(e.id, e.count || e.n || 1),
          );
        else if (inv instanceof Map) inv.forEach((n, id) => push(id, n));
        else if (inv && typeof inv === "object")
          Object.keys(inv).forEach((id) => push(id, inv[id]));
      } catch (e) {
        /* ignore — empty view */
      }
      const view = { scrip: purse, stock, _temp: true };
      if (B && B.actor === actor) B.tmpMerch = view;
      return view;
    }
    const m = actor.merchant;
    if (!Array.isArray(m.stock)) {
      if (m.stock instanceof Map) m.stock = Array.from(m.stock.entries());
      else if (m.stock && typeof m.stock === "object")
        m.stock = Object.keys(m.stock).map((k) => [k, m.stock[k]]);
      else m.stock = [];
    }
    if (typeof X.purse(m) !== "number")
      X.setPurse(m, 200 + (actor.level || 1) * 40);
    return m;
  }
  /** Does this item wear (weapons / armour)? */
  function wears(def) {
    return !!(
      def &&
      (def.hasCondition ||
        ((X.weaponBlock(def) || def.type === "apparel") &&
          def.hasCondition !== false))
    );
  }
  /**
   * Merchant stock condition per item id (0-1). Traders in the Ruins sell used gear: the first time
   * an item is seen it gets a stable, merchant-specific condition between 40% and 95%.
   */
  function mCond(m, id, actor) {
    const def = X.itemDef(id);
    if (!wears(def)) return null;
    if (!m.conds) m.conds = {};
    if (typeof m.conds[id] !== "number") {
      const h = G.util.hashStr(
        String((actor && (actor.id || actor.name)) || "merchant") + ":" + id,
      );
      const mix = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0; // spread similar ids apart
      m.conds[id] = 0.4 + (((mix ^ (mix >>> 13)) % 1000) / 1000) * 0.55;
    }
    return m.conds[id];
  }
  /** Blend condition when the player sells a worn item into the merchant's stack. */
  function mMergeCond(m, id, n, cond) {
    if (cond == null || !wears(X.itemDef(id))) return;
    if (!m.conds) m.conds = {};
    const have = mCount(m, id);
    const prev = typeof m.conds[id] === "number" ? m.conds[id] : cond;
    m.conds[id] = have > 0 ? (prev * have + cond * n) / (have + n) : cond;
  }
  function mCount(m, id) {
    let n = 0;
    for (const e of m.stock) if (e[0] === id) n += e[1];
    return n;
  }
  function mAdd(m, id, n) {
    const e = m.stock.find((s) => s[0] === id);
    if (e) e[1] += n;
    else m.stock.push([id, n]);
  }
  function mRemove(m, id, n) {
    for (let i = m.stock.length - 1; i >= 0 && n > 0; i--) {
      const e = m.stock[i];
      if (e[0] !== id) continue;
      const k = Math.min(n, e[1]);
      e[1] -= k;
      n -= k;
      if (e[1] <= 0) m.stock.splice(i, 1);
    }
  }

  // ---- prices ----
  function unitBuy(def, cond) {
    try {
      if (X.live("rpg") && G.rpg.priceBuy) {
        const p = G.rpg.priceBuy(
          def,
          B && B.actor,
          cond == null ? undefined : cond,
        );
        if (typeof p === "number" && isFinite(p))
          return Math.max(1, Math.round(p));
      }
    } catch (e) {
      /* fallback */
    }
    const sk = X.skill("trade");
    return Math.max(
      1,
      Math.round(
        (def.value || 1) * (1.55 - sk / 250 - (X.attr("presence") - 5) * 0.02),
      ),
    );
  }
  function unitSell(def, cond) {
    try {
      if (X.live("rpg") && G.rpg.priceSell) {
        const p = G.rpg.priceSell(
          def,
          B && B.actor,
          cond == null ? undefined : cond,
        );
        if (typeof p === "number" && isFinite(p))
          return Math.max(0, Math.round(p));
      }
    } catch (e) {
      /* fallback */
    }
    const sk = X.skill("trade");
    return Math.max(
      def.value > 0 ? 1 : 0,
      Math.floor(
        (def.value || 0) * (0.35 + sk / 300 + (X.attr("presence") - 5) * 0.015),
      ),
    );
  }

  function sellable(e) {
    if (!e || X.isCurrency(e.id) || X.isKit(e.id, e.def)) return false;
    const d = e.def;
    if (
      d &&
      (d.quest ||
        d.noSell ||
        d.type === "note" ||
        d.type === "tape" ||
        d.type === "key" ||
        (d.text && d.title))
    )
      return false;
    return true;
  }

  function totals() {
    let sell = 0,
      buy = 0,
      wIn = 0,
      wOut = 0;
    B.sellMarks.forEach((n, id) => {
      const d = X.itemDef(id);
      sell += unitSell(d, B.conds[id]) * n;
      wOut += (d.weight || 0) * n;
    });
    const m = merch(B.actor);
    B.buyMarks.forEach((n, id) => {
      const d = X.itemDef(id);
      buy += unitBuy(d, mCond(m, id, B.actor)) * n;
      wIn += (d.weight || 0) * n;
    });
    return { sell, buy, balance: sell - buy, wIn, wOut };
  }

  function leftEntries() {
    return X.sortEntries(
      X.invList()
        .filter(sellable)
        .map((e) =>
          Object.assign({}, e, { marked: B.sellMarks.get(e.id) || 0 }),
        ),
    );
  }
  function rightEntries() {
    const m = merch(B.actor);
    const agg = new Map();
    for (const s of m.stock)
      if (s[1] > 0 && !X.isCurrency(s[0]))
        agg.set(s[0], (agg.get(s[0]) || 0) + s[1]);
    return X.sortEntries(
      Array.from(agg.entries()).map(([id, n]) => ({
        id,
        count: n,
        def: X.itemDef(id),
        condition: mCond(m, id, B.actor),
        marked: B.buyMarks.get(id) || 0,
      })),
    );
  }

  async function activate(side, e, all) {
    if (!B || !e || B.busy) return;
    const marks = side === 0 ? B.sellMarks : B.buyMarks;
    const cur = marks.get(e.id) || 0;
    if (cur > 0) {
      marks.delete(e.id);
      X.sfx("ui_back", { volume: 0.4 });
      B.w.render();
      return;
    } // unmark
    let n = 1;
    if (e.count > 1) {
      if (all) n = e.count;
      else {
        B.busy = true;
        const price =
          side === 0
            ? unitSell(e.def, e.condition)
            : unitBuy(e.def, e.condition);
        n = await B.w.askQty(
          e.count,
          (side === 0 ? "Sell how many " : "Buy how many ") +
            (e.def.name || e.id) +
            "?",
          (q) => q + " × " + price + " = <b>" + q * price + "</b> Scrip",
        );
        B.busy = false;
        if (!B || !n) return;
      }
    }
    marks.set(e.id, n);
    if (side === 0) B.conds[e.id] = e.condition;
    X.sfx("ui_select", { volume: 0.45 });
    B.w.render();
  }

  async function accept() {
    if (!B || B.busy) return;
    const t = totals();
    if (!B.sellMarks.size && !B.buyMarks.size) {
      B.w.flash("Nothing to trade.", true);
      X.sfx("ui_error", { volume: 0.5 });
      return;
    }
    const m = merch(B.actor);
    const mine = X.scrip(),
      theirs = X.purse(m) || 0;
    if (t.balance < 0 && mine < -t.balance) {
      B.w.flash("You don't have enough Scrip.", true);
      X.sfx("ui_error", { volume: 0.6 });
      return;
    }
    let payout = t.balance;
    if (t.balance > 0 && theirs < t.balance) {
      B.busy = true;
      const ok = await G.ui.confirm(
        ((B.actor && B.actor.name) || "The merchant") +
          " only has " +
          theirs +
          " Scrip.\nAccept " +
          theirs +
          " Scrip for the lot?",
      );
      B.busy = false;
      if (!B || !ok) return;
      payout = theirs;
    }
    // ---- execute ----
    const sold = [],
      bought = [];
    B.sellMarks.forEach((n, id) => {
      try {
        if (
          X.live("inventory") &&
          G.inventory.isEquipped &&
          G.inventory.isEquipped(id) &&
          X.invCount(id) <= n
        )
          G.inventory.unequip(id);
      } catch (e) {
        /* ignore */
      }
      mMergeCond(m, id, n, B.conds[id]);
      X.invRemove(id, n);
      mAdd(m, id, n);
      sold.push([id, n]);
    });
    B.buyMarks.forEach((n, id) => {
      const cond = mCond(m, id, B.actor);
      mRemove(m, id, n);
      if (cond != null && X.live("inventory")) {
        // keep the merchant's wear on the bought item (inventory blends it into the player's stack)
        try {
          G.inventory.add(id, n, { silent: true, cond });
        } catch (e) {
          G.reportError("barter:add", e);
        }
      } else X.invAdd(id, n);
      if (m.conds && !mCount(m, id)) delete m.conds[id];
      bought.push([id, n]);
    });
    if (payout) {
      X.addScrip(payout);
      X.setPurse(m, (X.purse(m) || 0) - payout);
    }
    B.sellMarks.clear();
    B.buyMarks.clear();
    X.sfx("trade_done", { volume: 0.8 }, "barter_trade");
    B.w.flash(
      payout >= 0
        ? "Trade complete. +" + payout + " Scrip"
        : "Trade complete. " + payout + " Scrip",
    );
    B.w.render();
    // Trade grows by use: roughly one point of practice per 50 Scrip moved
    X.useSkill(
      "trade",
      Math.max(1, Math.round((t.sell + t.buy) / 50)),
      "trade",
    );
    G.events.emit("barterDone", B.actor, {
      bought,
      sold,
      balance: payout,
      value: t.sell + t.buy,
    });
    if (!X.live("inventory")) G.events.emit("inventoryChanged");
  }

