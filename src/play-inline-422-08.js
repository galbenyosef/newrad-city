// play-inline-422 08 — yaw
// Lines 2245-2593 of readable/play-inline-422.pretty.js (statement-aligned).
  function spawn(ctx) {
    const A = ctx.anchors,
      S = PV;
    const guns = K.stock(
      [
        ["ammo_10mm", 60],
        ["ammo_556", 40],
        ["ammo_12ga", 30],
        ["ammo_308", 20],
        ["10mm_pistol", 1],
        ["hunting_rifle", 1],
        ["combat_shotgun", 1],
        ["frag_grenade", 3],
      ],
      "merchant_arms",
      4,
    );
    const general = K.stock(
      [
        ["purified_water", 6],
        ["ox_meat", 4],
        ["rally_tonic", 3],
        ["prussian_blue", 2],
        ["scrap_metal", 10],
        ["duct_tape", 3],
      ],
      "merchant_general",
      4,
    );
    const bar = K.stock(
      [
        ["ph2_ferry_grog", 8],
        ["ph2_harbor_chowder", 6],
        ["beer", 6],
        ["whiskey", 2],
        ["fizzo_cola", 5],
        ["purified_water", 4],
        ["shellback_cakes", 4],
      ],
      "merchant_food",
      3,
    );
    const doc = K.stock(
      [
        ["rally_tonic", 6],
        ["prussian_blue", 4],
        ["iodine_tabs", 3],
        ["morphine_syrette", 2],
        ["bull_tabs", 1],
      ],
      "merchant_doctor",
      4,
    );
    if (A.rosa)
      PV.spawnActor(ctx, {
        id: "ph2_rosa",
        type: "human",
        gender: "f",
        outfit: "merchant",
        hair: "long",
        name: "Big Bertha Sorensen",
        faction: "settlers",
        level: 10,
        essential: true,
        pos: v(A.rosa),
        yaw: A.rosa.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.5,
        dialogue: "ph2_dlg_rosa",
        merchant: { scrip: 900, stock: general, restock: 2, priceMult: 1.0 },
        weapon: K.itemExists("10mm_pistol") ? "10mm_pistol" : undefined,
        barks: [
          "Scrip talks.",
          "Oxen have right of way!",
          "Dockage is due at sundown.",
          "Two-Horn's late again.",
        ],
      });
    if (A.brass)
      PV.spawnActor(ctx, {
        id: "ph2_brass",
        type: "human",
        gender: "m",
        outfit: "survivor",
        hair: "short",
        beard: "full",
        name: '"Brass" Kowalski',
        faction: "settlers",
        level: 8,
        pos: v(A.brass),
        yaw: A.brass.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: { scrip: 500, stock: guns, restock: 2, priceMult: 1.1 },
        barks: [
          "Brass, powder and lead. Pick two.",
          "No test-firing indoors!",
          "Ammo's cheaper than regret.",
        ],
      });
    if (A.doc)
      PV.spawnActor(ctx, {
        id: "ph2_doc",
        type: "human",
        gender: "m",
        outfit: "doctor",
        hair: "bald",
        name: "Doc Ferris",
        faction: "settlers",
        level: 7,
        pos: v(A.doc),
        yaw: A.doc.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: { scrip: 400, stock: doc, restock: 2, priceMult: 1.1 },
        barks: [
          "Stitches, tonic, sympathy. Two out of three are for sale.",
          "Boil your water.",
          "That's not a rash. That's a shellback bite.",
        ],
      });
    if (A.tilly)
      PV.spawnActor(ctx, {
        id: "ph2_tilly",
        type: "human",
        gender: "f",
        outfit: "settler",
        hair: "bun",
        name: "Tilly Ahn",
        faction: "settlers",
        level: 6,
        pos: v(A.tilly),
        yaw: A.tilly.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.2,
        dialogue: "ph2_dlg_tilly",
        merchant: {
          scrip: 350,
          stock: bar,
          restock: 1,
          priceMult: S.flag("wh_pumps") ? 0.8 : 1.0,
        },
        barks: [
          "Mind the puddles.",
          "Last call is whenever the boat tips.",
          "Grog, chowder, or a bad decision?",
        ],
      });
    if (A.gus)
      PV.spawnActor(ctx, {
        id: "ph2_gus",
        type: "human",
        gender: "m",
        outfit: "settler",
        hair: "short",
        beard: "full",
        hairColor: 0xb0aca0,
        name: "Gus Bellamy",
        faction: "settlers",
        level: 6,
        essential: true,
        pos: v(A.gus),
        yaw: A.gus.yaw || 0,
        ai: "guard",
        home: "here",
        homeR: 1.2,
        dialogue: "ph2_dlg_gus",
        barks: S.flag("wh_pumps")
          ? [
              "Hear her hum!",
              "Dry as a sermon.",
              "Mind the governor, it's a DUGGAN.",
            ]
          : [
              "Pump. Pump. Pump.",
              "She's drinking the harbour again.",
              "Governor, governor, my kingdom for a governor.",
            ],
      });
    // caravan guards on the apron & tower (world anchors)
    const gw = K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      gw2 = K.itemExists("10mm_pistol") ? "10mm_pistol" : undefined;
    [
      ["ph2_wh_guard1", "guard1", "Caravan Guard", gw],
      ["ph2_wh_guard2", "guard2", "Caravan Guard", gw2],
      ["ph2_wh_guard3", "guard3", "Tower Watch", gw],
    ].forEach(([id, an, name, w], i) => {
      const a = A[an];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: i === 1 ? "f" : "m",
        outfit: i === 2 ? "combat_armor" : "leather_armor",
        hair: "short",
        name,
        faction: "settlers",
        level: 7,
        pos: v(a),
        yaw: a.yaw || 0,
        ai: i === 2 ? "static" : "guard",
        home: "here",
        homeR: i === 2 ? 0.5 : 4,
        weapon: w,
        barks: [
          "Keep it holstered on the boardwalk.",
          "Welcome to Whitehall.",
          "Shellbacks came up by Pier A last night.",
          "Bertha's in the waiting room.",
        ],
      });
    });
    // caravaneers resting on the waiting-room benches / at the campfire
    [
      ["ph2_wh_c1", "sit1", "Caravaneer", "m"],
      ["ph2_wh_c2", "sit2", "Caravaneer", "f"],
      ["ph2_wh_c3", "fire1", "Pack Driver", "m"],
    ].forEach(([id, an, name, g]) => {
      const a = A[an];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: g,
        outfit: "survivor",
        hair: g === "f" ? "ponytail" : "short",
        name,
        faction: "settlers",
        level: 4,
        pos: v(a),
        yaw: a.yaw || 0,
        ai: "sit",
        home: "here",
        homeR: 0.4,
        barks: [
          "My feet hurt.",
          "Three days from the Bronx. Three.",
          "Ever see an ox swim? Don't.",
          "Bertha charges for air, I swear.",
        ],
      });
    });
    // the fare-bot (Patrolman) still at its ticket window
    if (A.farebot)
      PV.spawnActor(ctx, {
        id: "ph2_farebot",
        type: "patrolman",
        name: "Fare-Bot",
        faction: "settlers",
        level: 4,
        pos: v(A.farebot),
        yaw: A.farebot.yaw || 0,
        ai: "static",
        home: "here",
        homeR: 0.3,
        barks: [
          "Fare: five cents. Exact change, please.",
          "The next ferry to St. George departs in... [ERROR]",
          "Please stand clear of the closing doors.",
          "Thank you for riding the Staten Island Ferry.",
        ],
      });
    // pack oxen in the pen (ambient_life's pack ox, if present)
    K.safe("pack_ox", () => {
      if (
        G.isStub("ambient") ||
        !G.ambient ||
        typeof G.ambient.packOx !== "function" ||
        !A.pen
      )
        return;
      for (let i = 0; i < 2; i++) {
        const p = {
          x: A.pen.x + (i ? 1.4 : -1.2),
          y: WH.AY,
          z: A.pen.z + (i ? -1 : 1.1),
        };
        G.ambient.packOx({
          pos: p,
          yaw: i * 2,
          variant: i + 1,
          pack: i === 0,
          ai: "wander",
          name: i ? "Ox" : "Pack Ox",
          home: { x: A.pen.x, z: A.pen.z, r: 2.4 },
        });
      }
    });
  }

  PV.define({
    id: "whitehall_terminal",
    name: "Whitehall Ferry Terminal",
    interior: "whitehall_terminal",
    order: 10,
    build(ctx) {
      exterior(ctx);
      const { AY, Z0 } = WH;
      // world anchors on the apron (for NPCs / markers)
      const wa = (name, lx, ly, lz, lyaw) => {
        const p = F.w(lx, ly, lz);
        p.yaw = F.pyaw(lyaw || 0);
        ctx.anchors[name] = p;
        return p;
      };
      wa("guard1", -3, AY, 3, 0);
      wa("guard2", 8, AY, 9, PI);
      wa("guard3", 18.6, AY + 4.2, 1.2, 0);
      wa(
        "fire1",
        4.6 + Math.cos(2.0) * 2.3,
        AY + 0.45,
        5.2 + Math.sin(2.0) * 2.3,
        -2.0 - HP,
      );
      wa("pen", -16.9, AY, 5.2, 0);
      wa("rack1", -12, AY, 34.3, PI);
      WH.campfire = F.w(4.6, AY, 5.2);
      if (PV.whInterior) PV.whInterior(ctx);
      // props on the apron: campfire, burning barrels, Fizzo machine
      const wl = (type, lx, lz, lyaw, o) => {
        const p = F.w(lx, AY, lz);
        K.loot(
          ctx,
          type,
          p.x,
          p.y,
          p.z,
          F.pyaw(lyaw || 0),
          Object.assign({ world: true }, o || {}),
        );
      };
      wl("campfire", 4.6, 5.2, 0, { pot: true });
      wl("barrel", -5.8, 12.4, 0, { burning: true, container: false });
      wl("barrel", 16.2, 1.8, 0, { burning: true, container: false });
      wl("fizzo_machine", 2.8, Z0 - 0.6, PI);
      wl("crate", -18.4, 12.2, 0.3, { kind: "plain", loot: "crate" });
      wl("footlocker", 19.6, 13.6, -HP, { loot: "footlocker" });
    },
    data,
    spawn,
    update(dt, realDt, ctx) {
      if (PV.whUpdate) PV.whUpdate(dt, realDt, ctx);
    },
  });
