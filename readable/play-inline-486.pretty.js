/* src/rpg/95_selftest.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — SELF-TEST / ECONOMY AUDIT
 * Runs only with `?rpgtest` in the URL (appended to a smoke run, e.g.
 * index.html?smoke=1&rpgtest=1). A few frames after newGame it:
 *   - validates every item def (type, value, weight, aid effects, apparel DR)
 *   - rolls every loot table at player levels 1/6/12/20 and reports the mean
 *     value / scrip / ammo / Rally Tonics per roll (economy balance)
 *   - checks barter price curves (Trade 15 → 100), use-based skill growth, levelling
 *   - round-trips the rpg save block (attributes, Talents, effects, habits,
 *     inventory + per-unit condition, merchants) and diffs the result
 * Failures go to G.reportError (so the smoke lists them); the report is put
 * in G.rpg._selftest and in a hidden <pre id="rpg-selftest"> (RPGTEST_BEGIN…END).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G.QS || !G.QS.has("rpgtest")) return;

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
  function auditFeatures(rep) {
    const R = G.rpg,
      inv = G.inventory,
      out = {};
    const P0 = G.player;
    if (P0) {
      // Rally Tonic: nothing instant, heals across ~7 s, mends limbs, sways the aim while it works, then settles
      P0.hp = Math.max(1, P0.maxHp - 80);
      const h0 = P0.hp;
      const st = R._state();
      const leg0 = st.limbs.leftLeg;
      st.limbs.leftLeg = 0;
      inv.add("rally_tonic", 1, { silent: true });
      inv.use("rally_tonic");
      const inst = Math.round(P0.hp - h0);
      R._updateEffects(3.5);
      R._updateSway(0.5);
      R._updateSway(0.5);
      const mid = Math.round(P0.hp - h0),
        sway = R.swayAmount();
      R._updateEffects(5);
      const end = Math.round(P0.hp - h0);
      for (let i = 0; i < 20; i++) R._updateSway(0.5);
      out.tonic = {
        inst,
        mid,
        end,
        sway: Math.round(sway * 100) / 100,
        swayAfter: R.swayAmount(),
        leg: Math.round(st.limbs.leftLeg),
      };
      if (inst > 0)
        fail("Rally Tonic healed instantly " + JSON.stringify(out.tonic));
      if (!(mid > 0 && end > mid && end >= 15))
        fail("Rally Tonic did not heal over time " + JSON.stringify(out.tonic));
      if (!(sway > 0.1))
        fail("Rally Tonic did not sway " + JSON.stringify(out.tonic));
      if (out.tonic.swayAfter > 0.01)
        fail("Rally Tonic sway did not settle " + JSON.stringify(out.tonic));
      if (!(st.limbs.leftLeg > 0))
        fail(
          "Rally Tonic did not mend a crippled leg " +
            JSON.stringify(out.tonic),
        );
      st.limbs.leftLeg = leg0;
      // Prussian Blue: rads leave gradually over a minute
      P0.rads = 300;
      const r0 = P0.rads;
      inv.add("prussian_blue", 1, { silent: true });
      inv.use("prussian_blue");
      const rInst = r0 - P0.rads;
      R._updateEffects(10);
      const r10 = r0 - P0.rads;
      R._updateEffects(55);
      const rEnd = r0 - P0.rads;
      out.prussian = {
        inst: Math.round(rInst),
        at10s: Math.round(r10),
        end: Math.round(rEnd),
      };
      if (rInst > 1 || !(r10 > 5 && r10 < rEnd * 0.4) || rEnd < 80)
        fail("Prussian Blue rad flush " + JSON.stringify(out.prussian));
      P0.rads = 0;
      P0.hp = P0.maxHp;
    }
    // use-based growth: practising Medicine raises it
    const m0 = R.skillBase("medicine");
    for (let i = 0; i < 40; i++) R.practice("medicine", 1, "test");
    out.practice = { before: m0, after: R.skillBase("medicine") };
    if (!(out.practice.after > m0))
      fail("practice did not raise medicine " + JSON.stringify(out.practice));
    // levelling: one Talent per level, an attribute point every second level
    const s0 = { t: R.talentPoints(), a: R.attrPoints(), l: R.level };
    R.addXP(R.xpForLevel(R.level + 2) - R.xp, "test");
    out.levelup = {
      from: s0,
      to: { t: R.talentPoints(), a: R.attrPoints(), l: R.level },
    };
    if (
      R.talentPoints() - s0.t !== R.level - s0.l ||
      R.attrPoints() - s0.a !== 1
    )
      fail("level-up grants " + JSON.stringify(out.levelup));
    out.talents = R.talentList().length;
    if (out.talents < 35) fail("only " + out.talents + " selectable talents");
    const d = G.items.get("rally_tonic");
    out.prices = {
      plain: [
        R.priceBuy(d, { merchant: {} }),
        R.priceSell(d, { merchant: {} }),
      ],
      posh: [
        R.priceBuy(d, { merchant: { priceMult: 1.4 } }),
        R.priceSell(d, { merchant: { priceMult: 1.4 } }),
      ],
      member: [
        R.priceBuy(d, { merchant: { markup: 0.85 } }),
        R.priceSell(d, { merchant: { markup: 0.85 } }),
      ],
      fence: [
        R.priceBuy(d, { merchant: { sellMult: 1.2 } }),
        R.priceSell(d, { merchant: { sellMult: 1.2 } }),
      ],
    };
    if (!(
      out.prices.posh[0] > out.prices.plain[0] &&
      out.prices.posh[1] <= out.prices.plain[1]
    ))
      fail("priceMult ignored " + JSON.stringify(out.prices));
    if (!(out.prices.member[0] < out.prices.plain[0])) fail("markup ignored");
    if (!(out.prices.fence[1] > out.prices.plain[1])) fail("sellMult ignored");
    // covers exist for every skill manual
    const COV = (G.items._art && G.items._art.COVERS) || {};
    const coverOf = (m) => (/^manual_/.test(m) ? "sb_" + m.slice(7) : null);
    const miss = G.items
      .all()
      .filter((x) => x.book && !COV[coverOf(x.mesh || "")])
      .map((x) => x.id);
    out.coverless = miss;
    if (miss.length) fail("manuals without a cover: " + miss.join(","));
    if (R.merchants)
      out.cats = {
        robo: R.merchants.classify([
          ["scrap_electronics", 8],
          ["relay_board", 4],
          ["dry_cell", 5],
          ["vacuum_tube", 6],
          ["conductor", 5],
          ["ammo_dry_cell", 20],
          ["gyrojet_pistol", 1],
        ]),
        pawn: R.merchants.classify([
          ["gold_bar", 1],
          ["old_dollars", 8],
          ["souvenir_paperweight", 1],
          ["souvenir_statue", 2],
          ["stock_certificate", 3],
          ["typewriter", 1],
          ["microscope", 1],
        ]),
      };
    // drinking from a fixture: heals a little, costs rads
    const P = G.player;
    if (P) {
      P.hp = Math.max(1, P.maxHp - 40);
      const hp0 = P.hp,
        r0 = P.rads || 0;
      R.drinkWater("toilet");
      out.water = {
        hp: Math.round(P.hp - hp0),
        rads: Math.round((P.rads || 0) - r0),
      };
      if (!(out.water.hp > 0 && out.water.rads > 0))
        fail("drinkWater " + JSON.stringify(out.water));
      P.rads = r0;
      P.hp = P.maxHp;
    }
    // vendor repair: a 75-skill trader fixes a 30% armour to 75% for scrip
    if (R.merchants && R.merchants.repairQuote) {
      const vendor = { merchant: { scrip: 300, stock: [], repairSkill: 75 } };
      inv.add("leather_armor", 1, { silent: true, cond: 0.3 });
      inv.addScrip(500, { silent: true });
      const q = R.merchants.repairQuote("leather_armor", vendor);
      const done = q && R.merchants.repair("leather_armor", vendor);
      out.repair = {
        quote: q,
        cond: inv.condition("leather_armor"),
        vendorScrip: vendor.merchant.scrip,
      };
      if (!done || Math.abs(inv.condition("leather_armor") - 0.75) > 0.01)
        fail("vendor repair " + JSON.stringify(out.repair));
      inv.remove("leather_armor", 1);
    }
    // Hardcore: ammo weighs something, Rally Tonic still never heals instantly
    {
      const w0 = inv.weight();
      inv.add("ammo_10mm", 100, { silent: true });
      const wN = inv.weight();
      R.setHardcore(true);
      const wH = inv.weight();
      const P2 = G.player;
      let inst = null;
      if (P2) {
        inv.add("rally_tonic", 1, { silent: true });
        P2.hp = Math.max(1, P2.maxHp - 60);
        const h0 = P2.hp;
        inv.use("rally_tonic");
        inst = Math.round(P2.hp - h0);
      }
      R.setHardcore(false);
      inv.remove("ammo_10mm", 100);
      out.hardcore = { w0, normal: wN, hardcore: wH, tonicInstantHeal: inst };
      if (!(wH > wN && Math.abs(wN - w0) < 0.05))
        fail("hardcore ammo weight " + JSON.stringify(out.hardcore));
      if (inst !== null && inst > 0)
        fail("hardcore Rally Tonic healed instantly");
      if (P2) P2.hp = P2.maxHp;
    }
    rep.features = out;
  }

  function run() {
    const rep = { t: Date.now() };
    const steps = [
      auditItems,
      auditLoot,
      auditBarter,
      auditMerchants,
      auditFeatures,
      roundTrip,
    ];
    if (G.rpg._selftestExtra) steps.push(...G.rpg._selftestExtra);
    for (const f of steps) {
      try {
        f(rep);
      } catch (e) {
        fail(f.name + ": " + ((e && e.stack) || e));
      }
    }
    G.rpg._selftest = rep;
    const pre = document.createElement("pre");
    pre.id = "rpg-selftest";
    pre.style.display = "none";
    pre.textContent = "RPGTEST_BEGIN" + JSON.stringify(rep) + "RPGTEST_END";
    document.body.appendChild(pre);
  }

  /**
   * ?rpgtest=gallery[&gids=a,b,c | &gpage=N] — screenshot helper: lays out item models on a slab
   * in front of the camera (shot mode: pitch ≈ -0.75). 8 per row, 0.5 m apart.
   */
  function gallery() {
    const THREE = window.THREE,
      P = G.player;
    let ids = (G.QS.get("gids") || "")
      .split(",")
      .filter((x) => x && G.items.get(x));
    if (!ids.length) {
      const all = G.items
        .all()
        .filter(
          (d) => d.type !== "key" && d.type !== "note" && d.type !== "tape",
        );
      const pg = Number(G.QS.get("gpage") || 0);
      ids = all.slice(pg * 24, pg * 24 + 24).map((d) => d.id);
    }
    const fx = -Math.sin(P.yaw),
      fz = -Math.cos(P.yaw),
      rx = Math.cos(P.yaw),
      rz = -Math.sin(P.yaw);
    const y0 = P.pos.y - 0.75;
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.1, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x4a4640, roughness: 0.9 }),
    );
    slab.position.set(P.pos.x + fx * 1.2, y0 - 0.05, P.pos.z + fz * 1.2);
    slab.rotation.y = P.yaw;
    G.scene.add(slab);
    ids.forEach((id, i) => {
      const c = i % 8,
        r = Math.floor(i / 8);
      const s = (c - 3.5) * (0.26 + r * 0.07),
        d = 0.55 + r * 0.36;
      G.items.spawnPickup(
        id,
        1,
        { x: P.pos.x + fx * d + rx * s, y: y0, z: P.pos.z + fz * d + rz * s },
        { keepY: true, noSave: true, yaw: P.yaw + 0.4 },
      );
    });
    G.rpg._gallery = ids;
  }

  G.registerModule({
    name: "rpg_selftest",
    order: 41,
    update() {
      if (done && !done2 && G.QS.get("rpgtest") !== "gallery") {
        // phase 2: once the smoke run stands at Times Square, audit the live vendors (the Neon)
        const P = G.player;
        if (P && Math.hypot(P.pos.x + 40, P.pos.z + 262) < 80) {
          if (++tsFrames === 25) {
            done2 = true;
            const rep2 = {};
            try {
              auditMerchants(rep2);
            } catch (e) {
              fail("auditMerchants2: " + e);
            }
            const pre = document.createElement("pre");
            pre.id = "rpg-selftest-2";
            pre.style.display = "none";
            pre.textContent =
              "RPGTEST2_BEGIN" + JSON.stringify(rep2) + "RPGTEST2_END";
            document.body.appendChild(pre);
          }
        }
      }
      if (done || !armed) return;
      if (--armed > 0) return;
      done = true;
      if (G.QS.get("rpgtest") === "gallery") gallery();
      else run();
    },
  });
})();
