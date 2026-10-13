// play-inline-426 05 — yaw
// Lines 1578-1923 of readable/play-inline-426.pretty.js (statement-aligned).
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function spawn(ctx) {
    const A = ctx.anchors,
      S = PV,
      disc = S.flag("es_discount") ? 0.85 : 1.0;
    const general = K.stock(
      [
        ["scrap_metal", 12],
        ["duct_tape", 4],
        ["tuff_bond", 2],
        ["scrap_electronics", 4],
        ["dry_cell", 2],
      ],
      "merchant_general",
      5,
    );
    const junk = K.stock(
      [
        ["tin_can", 6],
        ["scrap_metal", 8],
        ["gas_igniter", 2],
        ["relay_board", 1],
        ["vacuum_tube", 3],
      ],
      "junk_valuable",
      4,
    );
    const arms = K.stock(
      [
        ["ammo_10mm", 50],
        ["ammo_12ga", 24],
        ["ammo_556", 30],
        ["ammo_308", 16],
        ["sawed_off_shotgun", 1],
        ["hunting_rifle", 1],
        ["lead_pipe", 1],
        ["combat_knife", 1],
      ],
      "merchant_arms",
      5,
    );
    const cloth = K.stock(
      [
        ["leather_armor", 1],
        ["merc_outfit", 1],
        ["drifter_coat", 2],
        ["biker_leathers", 1],
      ],
      "apparel_common",
      4,
    );
    const bar = K.stock(
      [
        ["ph2_es_coffee", 8],
        ["beer", 6],
        ["purified_water", 5],
        ["shellback_cakes", 4],
        ["ox_meat", 3],
        ["fizzo_cola", 4],
      ],
      "merchant_food",
      4,
    );
    if (A.hattie)
      PV.spawnActor(ctx, {
        id: "ph2_hattie",
        type: "human",
        gender: "f",
        outfit: "merchant",
        hair: "bun",
        hairColor: 0x9a968e,
        name: "Hattie Szabo",
        faction: "settlers",
        level: 12,
        essential: true,
        age: 0.75,
        pos: v(A.hattie),
        yaw: A.hattie.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.2,
        dialogue: "ph2_dlg_hattie",
        merchant: {
          scrip: 1100,
          stock: general,
          restock: 2,
          priceMult: 1.0 * disc,
        },
        barks: [
          "Weigh it or leave it.",
          "A pound is a pound.",
          "Scale's balanced.",
          "No raider scrip in my market.",
        ],
      });
    if (A.moth)
      PV.spawnActor(ctx, {
        id: "ph2_moth",
        type: "human",
        gender: "m",
        outfit: "survivor",
        hair: "mohawk",
        name: "Moth",
        faction: "settlers",
        level: 5,
        pos: v(A.moth),
        yaw: A.moth.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: {
          scrip: 300,
          stock: junk,
          restock: 2,
          priceMult: 1.05 * disc,
        },
        barks: [
          "Junk's just treasure that hasn't met the right person.",
          "Every screw has a story.",
          "Don't touch the toaster. It knows things.",
        ],
      });
    if (A.boomer)
      PV.spawnActor(ctx, {
        id: "ph2_boomer",
        type: "human",
        gender: "m",
        outfit: "combat_armor",
        hair: "buzz",
        beard: "full",
        name: '"Boomer" Reyes',
        faction: "settlers",
        level: 9,
        pos: v(A.boomer),
        yaw: A.boomer.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: {
          scrip: 600,
          stock: arms,
          restock: 2,
          priceMult: 1.1 * disc,
        },
        barks: [
          "Guns, ammo, bad advice.",
          "That rifle's older than your grandma's grandma. Shoots straighter too.",
          "No live fire in the market.",
        ],
      });
    if (A.dolores)
      PV.spawnActor(ctx, {
        id: "ph2_dolores",
        type: "human",
        gender: "f",
        outfit: "leather_armor",
        hair: "long",
        name: "Dolores Fisk",
        faction: "settlers",
        level: 7,
        pos: v(A.dolores),
        yaw: A.dolores.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: {
          scrip: 450,
          stock: cloth,
          restock: 2,
          priceMult: 1.05 * disc,
        },
        barks: [
          "Oxhide, double-stitched.",
          "That coat's got holes. Bullet holes. Yours, I hope not.",
          "Try it on. Mirror's cracked, you look great.",
        ],
      });
    if (A.bean)
      PV.spawnActor(ctx, {
        id: "ph2_bean",
        type: "human",
        gender: "m",
        outfit: "settler",
        hair: "short",
        name: "Bean Okonkwo",
        faction: "settlers",
        level: 6,
        skinTone: 0.85,
        pos: v(A.bean),
        yaw: A.bean.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.2,
        dialogue: "ph2_dlg_bean",
        merchant: { scrip: 350, stock: bar, restock: 1, priceMult: 1.0 * disc },
        barks: [
          "Fresh roast!",
          "Chicory, potato and hope.",
          "Mind the drum, it's hot.",
        ],
      });
    if (A.pike && !S.flag("es_pike_dead"))
      PV.spawnActor(ctx, {
        id: "ph2_pike",
        type: "human",
        gender: "m",
        outfit: "survivor",
        hair: "balding",
        beard: "full",
        name: "Gaffney",
        faction: "settlers",
        level: 8,
        pos: v(A.pike),
        yaw: A.pike.yaw || 0,
        ai: "sit",
        home: "here",
        homeR: 0.5,
        dialogue: "ph2_dlg_pike",
        weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
        noRespawn: true,
        onDeath: () => {
          S.setFlag("es_pike_dead", true);
          if (
            K.q.active("ph2_honest_weight") &&
            K.q.stage("ph2_honest_weight") !== "cellar"
          )
            K.q.set("ph2_honest_weight", "report");
          else if (PV.esSync) PV.esSync();
        },
        barks: [
          "Sleep days, walk nights.",
          "Nothing ever happens.",
          "[snoring]",
        ],
      });
    // guards: street, door, roof
    [
      ["ph2_es_guard1", "guard1", "Market Guard", "m"],
      ["ph2_es_guard2", "guard2", "Market Guard", "f"],
      ["ph2_es_guard3", "guard3", "Roof Watch", "m"],
    ].forEach(([id, an, name, g], i) => {
      const a = A[an];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: g,
        outfit: i === 2 ? "combat_armor" : "leather_armor",
        hair: "short",
        name,
        faction: "settlers",
        level: 8,
        pos: v(a),
        yaw: a.yaw || 0,
        ai: i === 2 ? "static" : "guard",
        home: "here",
        homeR: i === 2 ? 0.5 : 5,
        weapon: K.itemExists(i === 2 ? "hunting_rifle" : "10mm_pistol")
          ? i === 2
            ? "hunting_rifle"
            : "10mm_pistol"
          : undefined,
        barks: [
          "Fights outside the barricade.",
          "Market's open.",
          "Hattie's in the Scale House.",
          "Watch your pockets. Watch everybody's pockets.",
        ],
      });
    });
    // shoppers / idlers
    [
      ["ph2_es_s1", "shop1", "Scavenger", "f"],
      ["ph2_es_s2", "shop2", "Scavenger", "m"],
      ["ph2_es_s3", "shop3", "Settler", "m"],
    ].forEach(([id, an, name, g]) => {
      const a = A[an];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: g,
        outfit: g === "f" ? "settler" : "survivor",
        hair: g === "f" ? "ponytail" : "short",
        name,
        faction: "settlers",
        level: 4,
        pos: v(a),
        yaw: a.yaw || 0,
        ai: an === "shop3" ? "sit" : "wander",
        home: "here",
        homeR: an === "shop3" ? 0.4 : 5,
        barks: [
          "How much for the toaster?",
          "Hattie's scale is honest, they say.",
          "Bridge is out again.",
          "Smells like coffee in here. Real coffee.",
        ],
      });
    });
  }

  PV.define({
    id: "empire_stores",
    name: "Empire Stores",
    interior: "empire_stores",
    order: 30,
    build(ctx) {
      exterior(ctx);
      const Z1 = ES.Z1;
      const wa = (name, x, y, z, yaw) => {
        const p = new THREE.Vector3(x, y, z);
        p.yaw = yaw || 0;
        ctx.anchors[name] = p;
        return p;
      };
      wa("guard1", 486, 0, Z1 + 3.2, PI);
      wa("guard2", 530, 0, Z1 + 2.4, -HP);
      if (ES.sniper) wa("guard3", ES.sniper.x, ES.sniper.y, ES.sniper.z, PI);
      wa("shop1", 480, 0, Z1 + 5.5, 0);
      wa("shop2", 500, 0, Z1 + 5.2, 0);
      if (PV.esInterior) PV.esInterior(ctx);
      const wl = (type, x, y, z, yaw, o) =>
        K.loot(
          ctx,
          type,
          x,
          y,
          z,
          yaw || 0,
          Object.assign({ world: true }, o || {}),
        );
      wl("barrel", 488, 0, Z1 + 5, 0, { burning: true, container: false });
      wl("barrel", 509, 0, Z1 + 5.2, 0, { burning: true, container: false });
      wl("fizzo_machine", 495.6, 0, Z1 + 0.5, 0);
      wl("dumpster", 474.5, 0, ES.Z0 - 4, PI, { loot: "dumpster" });
      wl("crate", ES.yard ? ES.yard.x1 - 1.4 : 515, 0, 598, 0.3, {
        kind: "plain",
        loot: "crate",
      });
    },
    data,
    spawn,
  });
