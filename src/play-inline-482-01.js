// play-inline-482 01 — stock
// Lines 30-354 of readable/play-inline-482.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  // A merchant's purse lives in merchant.scrip; content not yet converted may still use the old field.
  const purse = (m) => (m && typeof m.scrip === "number" ? m.scrip : undefined);
  const setPurse = (m, v) => {
    if (m) m.scrip = v;
  };

  const RECS = new Map(); // actor id -> record (stable-id vendors; persisted)
  const TEMP = new WeakMap(); // actor -> record (unnamed vendors; session only)
  let pending = null; // saved state waiting for its actors to spawn
  let sweepT = 0;

  const day = () => (G.time && G.time.day) || 1;
  const live = (name) => {
    try {
      return !G.isStub(name);
    } catch (e) {
      return false;
    }
  };
  const copyStock = (s) =>
    Array.isArray(s)
      ? s
          .filter((e) => Array.isArray(e) && e[0] && e[1] > 0)
          .map((e) => [e[0], Math.round(e[1])])
      : [];

  function normStock(m) {
    if (Array.isArray(m.stock)) return m.stock;
    if (m.stock instanceof Map) m.stock = Array.from(m.stock.entries());
    else if (m.stock && typeof m.stock === "object")
      m.stock = Object.keys(m.stock).map((k) => [k, m.stock[k]]);
    else m.stock = [];
    return m.stock;
  }
  function countOf(stock, id) {
    let n = 0;
    for (const e of stock) if (e[0] === id) n += e[1];
    return n;
  }
  function addTo(stock, id, n) {
    const e = stock.find((s) => s[0] === id);
    if (e) e[1] += n;
    else stock.push([id, n]);
  }

  // ------------------------------------------------------------------
  // Vendor category → leveled extras table
  // ------------------------------------------------------------------
  const ENERGY_AMMO = /gyrojet|dry_cell|rig_battery/; // Continuity tech: gyrojet rockets, batteries
  /**
   * Vendor category from what they sell (vendors restock from lists that match their trade).
   * Adds two specialist trades on top of the basic types: 'tech' (robot parts / gyrojets & batteries, e.g.
   * the Neon's Robo-Shop) and 'valuables' (pawn shops, fences). `merchant.cat` overrides.
   */
  function classify(stock, m) {
    if (m && typeof m.cat === "string" && EXTRA[m.cat]) return m.cat;
    const c = {
      weapon: 0,
      ammo: 0,
      apparel: 0,
      medical: 0,
      chem: 0,
      food: 0,
      drink: 0,
      junk: 0,
      books: 0,
      other: 0,
    };
    let tech = 0,
      valuables = 0;
    for (const e of stock) {
      const d = G.items.get(e[0]);
      if (!d) continue;
      const tags = d.tags || [];
      const has = (t) => tags.indexOf(t) >= 0;
      if (
        has("electronic") ||
        (d.type === "ammo" && ENERGY_AMMO.test(d.id)) ||
        (d.type === "weapon" &&
          d.weapon &&
          ENERGY_AMMO.test(String(d.weapon.ammo || "")))
      )
        tech += 1;
      if (
        has("valuable") ||
        has("souvenir") ||
        has("collectible") ||
        ((d.type === "junk" || d.type === "misc") &&
          !has("electronic") &&
          (d.value || 0) >= 12)
      )
        valuables += 1;
      if (d.book) c.books += 1;
      else if (d.type === "weapon") c.weapon += 1;
      else if (d.type === "ammo") c.ammo += 1;
      else if (d.type === "apparel") c.apparel += 1;
      else if (d.type === "aid") {
        if (
          has("chem") &&
          !/rally_tonic|prussian_blue|iodine_tabs|blood_pack|field_surgery_kit|root_poultice/.test(
            d.id,
          )
        )
          c.chem += 1;
        else if (has("drink") || has("alcohol")) c.drink += 1;
        else if (has("food")) c.food += 1;
        else c.medical += 1;
      } else if (d.type === "junk" || has("junk")) c.junk += 1;
      else c.other += 1;
    }
    const total = stock.length || 1;
    if (tech / total >= 0.45) return "tech";
    if (valuables / total >= 0.45) return "valuables";
    let best = "general",
      bn = 0;
    for (const k in c)
      if (c[k] > bn) {
        bn = c[k];
        best = k;
      }
    if (bn / total < 0.34) best = "general";
    return best;
  }
  const EXTRA = {
    weapon: [
      ["merchant_arms", 2],
      ["weapon_crate", 1],
    ],
    ammo: [["ammo_box", 2]],
    apparel: [
      ["armor_random", 1],
      ["apparel_common", 1],
      ["hats", 1],
    ],
    medical: [["merchant_doctor", 2]],
    chem: [["chems", 2]],
    food: [["merchant_food", 2]],
    drink: [["drinks", 2]],
    junk: [
      ["junk_valuable", 1],
      ["electronics", 1],
      ["junk_common", 1],
    ],
    books: [["books", 3]],
    tech: [
      ["merchant_tech", 2],
      ["electronics", 1],
    ],
    valuables: [
      ["junk_valuable", 2],
      ["books", 1],
      ["hats", 1],
    ],
    general: [["merchant_general", 3]],
    other: [
      ["junk_valuable", 1],
      ["merchant_general", 1],
    ],
  };

  /**
   * Roll this reset's leveled extras. Count grows with the player's level (1 → 2 → 3 → 4).
   * Several rolls feed a candidate pool; items already on the base list are skipped (extras
   * should be something new), and for gear vendors higher levels favour the pricier rolls
   * (an arms dealer stocks better guns as you level).
   */
  function rollExtras(rec) {
    const lvl = (G.rpg && G.rpg.level) || 1;
    const budget = 1 + Math.min(3, Math.floor(lvl / 6));
    const pool = new Map();
    const tables = EXTRA[rec.cat] || EXTRA.general;
    for (let pass = 0; pass < 4 && pool.size < budget * 3; pass++) {
      for (const t of tables) {
        if (!G.items.hasLootTable(t[0])) continue;
        for (const e of G.items.rollLoot(t[0], lvl)) {
          const d = G.items.get(e[0]);
          if (
            !d ||
            e[0] === "scrip" ||
            d.quest ||
            d.medallion ||
            d.type === "key" ||
            d.type === "note" ||
            d.type === "tape"
          )
            continue;
          if (countOf(rec.base.stock, e[0]) > 0 || pool.has(e[0])) continue;
          pool.set(e[0], [
            e[0],
            d.type === "weapon" || d.type === "apparel" ? 1 : Math.max(1, e[1]),
            d.value || 0,
          ]);
        }
      }
    }
    let cands = Array.from(pool.values());
    const gear =
      rec.cat === "weapon" ||
      rec.cat === "apparel" ||
      rec.cat === "ammo" ||
      rec.cat === "general" ||
      rec.cat === "tech";
    if (gear) {
      // value-biased shuffle: at level 1 nearly random, by level ~20 the best rolls win
      const bias = Math.min(1, lvl / 20);
      const maxV = Math.max(1, ...cands.map((c) => c[2]));
      cands = cands
        .map((c) => [
          c,
          (1 - bias) * Math.random() +
            bias * (c[2] / maxV) +
            Math.random() * 0.15,
        ])
        .sort((p, q) => q[1] - p[1])
        .map((x) => x[0]);
    } else {
      for (let k = cands.length - 1; k > 0; k--) {
        const r = Math.floor(Math.random() * (k + 1));
        const tmp = cands[k];
        cands[k] = cands[r];
        cands[r] = tmp;
      }
    }
    return cands.slice(0, budget).map((c) => [c[0], c[1]]);
  }

  // ------------------------------------------------------------------
  // Records
  // ------------------------------------------------------------------
  function keyOf(a) {
    return a && a.stableId && a.id ? String(a.id) : null;
  }
  function recOf(a) {
    const k = keyOf(a);
    return k ? RECS.get(k) : TEMP.get(a);
  }

  function newRec(a) {
    const m = a.merchant;
    const stock = copyStock(normStock(m));
    const rec = {
      id: keyOf(a),
      actor: a,
      base: {
        scrip:
          typeof purse(m) === "number" ? purse(m) : 200 + (a.level || 1) * 40,
        stock,
      },
      every: Math.max(1, Number(m.restock) || 3),
      day: day(),
      extras: [], // ids given as leveled extras at the last reset
      sold: {}, // id -> n the player sold since the last reset
      cat: classify(stock, m),
    };
    return rec;
  }

  /** Items in a live stock that neither the base list, the extras nor player sales explain → quest additions: fold into base. */
  function absorbQuestAdditions(rec, stock) {
    for (const e of stock) {
      const id = e[0];
      if (countOf(rec.base.stock, id) > 0) continue;
      if (rec.extras.indexOf(id) >= 0) continue;
      const soldN = rec.sold[id] || 0;
      const extra = e[1] - soldN;
      if (extra > 0) rec.base.stock.push([id, extra]);
    }
  }

  function writeState(a, st) {
    const m = a.merchant;
    const sc = st.scrip;
    if (typeof sc === "number") setPurse(m, sc);
    if (Array.isArray(st.stock)) m.stock = copyStock(st.stock);
    if (st.conds && typeof st.conds === "object")
      m.conds = Object.assign({}, st.conds);
  }

  function barterWith(a) {
    try {
      return (
        live("barter") &&
        G.barter.isOpen &&
        G.barter.isOpen() &&
        G.state === "barter" &&
        a._rpgBarterOpen
      );
    } catch (e) {
      return false;
    }
  }

  /** Vendor reset. */
  function restock(rec, a, force) {
    const m = a.merchant;
    const stock = normStock(m);
    absorbQuestAdditions(rec, stock);
    const next = [];
    for (const e of rec.base.stock) {
      const d = G.items.get(e[0]);
      if (!d) continue;
      let n = e[1];
      // consumables / ammo wobble ±30% so shelves don't look frozen; singles (guns, armour) stay put
      if (n >= 3) n = Math.max(1, Math.round(n * (0.7 + Math.random() * 0.6)));
      next.push([e[0], n]);
    }
    rec.extras = [];
    for (const e of rollExtras(rec)) {
      addTo(next, e[0], e[1]);
      rec.extras.push(e[0]);
    }
    m.stock = next;
    setPurse(m, rec.base.scrip);
    if (m.conds) {
      for (const id of Object.keys(m.conds))
        if (countOf(rec.base.stock, id) === 0) delete m.conds[id];
    }
    rec.sold = {};
    rec.day = day();
    if (!force) G.events.emit("merchantRestocked", a);
  }

  /** Called for every live vendor by the sweep. */
