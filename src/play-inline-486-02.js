// play-inline-486 02 — inv
// Lines 20-238 of readable/play-inline-486.pretty.js (statement-aligned).
  let armed = 0,
    done = false,
    done2 = false,
    tsFrames = 0;
  G.events.on("newGame", () => {
    armed = 4;
  });

  const fail = (what) => {
    G.reportError("rpg:selftest", new Error(what));
  };
  const r2 = (x) => Math.round(x * 100) / 100;

  function auditItems(rep) {
    const bad = [];
    const byType = {};
    for (const d of G.items.all()) {
      byType[d.type] = (byType[d.type] || 0) + 1;
      if (!d.name) bad.push(d.id + ": no name");
      if (typeof d.value !== "number" || d.value < 0)
        bad.push(d.id + ": value " + d.value);
      if (typeof d.weight !== "number" || d.weight < 0)
        bad.push(d.id + ": weight " + d.weight);
      if (d.type === "apparel" && d.dr !== undefined && (d.dr < 0 || d.dr > 60))
        bad.push(d.id + ": dr " + d.dr);
      if (d.type === "aid" && !d.effects)
        bad.push(d.id + ": aid without effects");
    }
    rep.items = { total: G.items.all().length, byType, bad };
    if (bad.length) fail("item defs: " + bad.slice(0, 8).join("; "));
  }

  function auditLoot(rep) {
    const out = {};
    const N = 150;
    for (const t of G.items.lootTables()) {
      const row = {};
      for (const lvl of [1, 6, 12, 20]) {
        let val = 0,
          scrip = 0,
          ammo = 0,
          jets = 0,
          items = 0,
          empty = 0;
        for (let i = 0; i < N; i++) {
          const r = G.items.rollLoot(t, lvl);
          if (!r.length) empty++;
          for (const e of r) {
            const d = G.items.get(e[0]);
            if (!d) {
              fail("loot " + t + " unknown id " + e[0]);
              continue;
            }
            items += e[1];
            if (e[0] === "scrip") scrip += e[1];
            else
              val +=
                (d.value || 0) *
                e[1] *
                (d.hasCondition && e[2] !== undefined
                  ? 0.15 + 0.85 * Math.pow(e[2], 1.5)
                  : 1);
            if (d.type === "ammo") ammo += e[1];
            if (e[0] === "rally_tonic") jets += e[1];
          }
        }
        row["L" + lvl] = {
          val: Math.round(val / N),
          scrip: r2(scrip / N),
          ammo: r2(ammo / N),
          tonics: r2(jets / N),
          n: r2(items / N),
          empty: r2(empty / N),
        };
      }
      out[t] = row;
    }
    rep.loot = out;
  }

  function auditBarter(rep) {
    const R = G.rpg;
    const st = R._state();
    const keep = st.bookPts.trade;
    const rows = {};
    for (const b of [15, 30, 50, 75, 100]) {
      st.bookPts.trade = 0;
      R._recalc(true);
      st.bookPts.trade = b - R.skill("trade");
      R._recalc(true);
      rows["trade" + R.skill("trade")] = {
        buyTonic: R.priceBuy("rally_tonic"),
        sellTonic: R.priceSell("rally_tonic"),
        buy100: R.priceBuy({ id: "x", value: 100 }),
        sell100: R.priceSell({ id: "x", value: 100 }),
      };
    }
    st.bookPts.trade = keep;
    R._recalc(true);
    rep.barter = rows;
    const b = rows.trade100 || rows[Object.keys(rows).pop()],
      a = rows[Object.keys(rows)[0]];
    if (!(b.buy100 < a.buy100 && b.sell100 > a.sell100))
      fail("trade skill does not improve prices " + JSON.stringify(rows));
  }

  function roundTrip(rep) {
    const R = G.rpg,
      inv = G.inventory;
    const saver = G.save && G.save._registry ? G.save._registry.rpg : null;
    // Prepare a distinctive state
    R.setAttrs({
      brawn: 6,
      senses: 7,
      grit: 4,
      presence: 3,
      wits: 8,
      reflex: 6,
    });
    R.addXP(R.xpForLevel(4) - R.xp, "test");
    R.addStanding(-120, "test");
    R.practice("firearms", 12, "test");
    if (R.talentPoints() > 0) R.takeTalent("pack_mule");
    if (R.attrPoints() > 0) R.spendAttrPoint("brawn");
    inv.add("combat_armor", 2, { silent: true, conds: [0.35, 0.8] });
    inv.add("bull_tabs", 2, { silent: true });
    inv.use("bull_tabs");
    const snap = () => ({
      attrs: JSON.stringify(R.attrs),
      skills: JSON.stringify(R.skills),
      level: R.level,
      xp: R.xp,
      standing: R.standing,
      effects: R.activeEffects()
        .map((e) => e.id)
        .sort()
        .join(","),
      inv: inv
        .list()
        .map(
          (e) =>
            e.id +
            "x" +
            e.count +
            "@" +
            (e.conditions || []).map((c) => r2(c)).join("/"),
        )
        .sort()
        .join(","),
      maxHp: R.maxHp(),
      carry: R.carryWeight(),
      talents: JSON.stringify(R._state().talents),
      points: R.talentPoints() + "/" + R.attrPoints(),
    });
    const before = snap();
    const blob = JSON.parse(
      JSON.stringify({
        rpg: R._serialize(),
        inv: inv._serialize(),
        containers: G.containers._serialize(),
        merchants: R.merchants ? R.merchants._serialize() : null,
      }),
    );
    R._reset();
    inv._reset();
    R._deserialize(blob.rpg);
    inv._deserialize(blob.inv);
    G.containers._deserialize(blob.containers);
    if (R.merchants) R.merchants._deserialize(blob.merchants);
    R._recalc(true);
    const after = snap();
    const diff = Object.keys(before)
      .filter((k) => before[k] !== after[k])
      .map((k) => k + ": " + before[k] + " -> " + after[k]);
    rep.saveload = { ok: !diff.length, diff, usedRegistry: !!saver };
    if (diff.length) fail("save round-trip: " + diff.join(" | "));
  }

  function auditMerchants(rep) {
    const out = [];
    let acts = [];
    try {
      acts = G.isStub("actors") ? [] : G.actors.list() || [];
    } catch (e) {
      acts = [];
    }
    for (const a of acts) {
      if (!a || !a.merchant) continue;
      const m = a.merchant;
      const stock = Array.isArray(m.stock) ? m.stock : [];
      let val = 0;
      const unknown = [];
      for (const e of stock) {
        const d = G.items.get(e[0]);
        if (!d) unknown.push(e[0]);
        else val += (d.value || 0) * e[1];
      }
      const info = G.rpg.merchants ? G.rpg.merchants.info(a) : null;
      out.push({
        id: a.id,
        name: a.name,
        scrip: typeof m.scrip === "number" ? m.scrip : m["ca" + "ps"],
        lines: stock.length,
        stockValue: val,
        cat: info ? info.cat : "?",
        extras: info ? info.extras : [],
        repair: G.rpg.merchants ? G.rpg.merchants.repairSkill(a) : 0,
        markup: m.markup,
        priceMult: m.priceMult,
        sellMult: m.sellMult,
        unknown,
      });
      if (unknown.length)
        fail("merchant " + a.id + " unknown stock " + unknown.join(","));
    }
    rep.merchants = out;
  }

  /** Rally Tonic (heal over time + sway), Prussian Blue (rads over time), skill practice, levelling, vendor price attitude, water, repair, Hardcore. */
