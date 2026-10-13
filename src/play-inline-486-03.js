// play-inline-486 03 — out
// Lines 239-543 of readable/play-inline-486.pretty.js (statement-aligned).
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
