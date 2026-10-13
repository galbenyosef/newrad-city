// play-inline-161 07 — def
// Lines 1802-2140 of readable/play-inline-161.pretty.js (statement-aligned).
  const NPCS = [
    // Plaza
    {
      id: "pu_pemberton",
      poi: "plaza_hotel",
      at: "concierge",
      type: "human",
      name: "Pemberton",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_pu_pemberton",
      level: 6,
      barks: [
        "Welcome to The Plaza.",
        "Rooms available. Standards non-negotiable.",
      ],
    },
    {
      id: "pu_constance",
      poi: "plaza_hotel",
      at: "constance",
      type: "human",
      name: "Lady Constance",
      outfit: "merchant",
      gender: "f",
      ai: "sit",
      dialogue: "dlg_pu_constance",
      level: 8,
      barks: [
        "Dinner is at eight.",
        "One simply does not discuss radiation.",
        "Pemberton! My tea has a mutation in it.",
      ],
    },
    {
      id: "pu_ferdinand",
      poi: "plaza_hotel",
      at: "bartender",
      type: "human",
      name: "Ferdinand",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_pu_ferdinand",
      level: 5,
      merchant: {
        scrip: 420,
        table: "merchant_food",
        extra: [
          ["whiskey", 4],
          ["scotch", 3],
          ["vodka", 3],
          ["wine", 4],
          ["beer", 6],
          ["fizzo_cola", 5],
          ["purified_water", 5],
        ],
      },
    },
    {
      id: "pu_hortense",
      poi: "plaza_hotel",
      at: "hortense",
      type: "human",
      name: "Madame Hortense",
      outfit: "merchant",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_pu_hortense",
      level: 5,
      merchant: {
        scrip: 600,
        table: null,
        extra: [
          ["old_world_formalwear", 2],
          ["top_hat", 1],
          ["fedora", 2],
          ["bowler_hat", 1],
          ["old_world_spring_dress", 2],
          ["stockbroker_suit", 1],
          ["old_world_businesswear", 2],
          ["sunglasses", 1],
          ["reading_glasses", 1],
        ],
      },
    },
    {
      id: "pu_anton",
      poi: "plaza_hotel",
      at: "chef",
      type: "human",
      name: "Chef Gaston",
      outfit: "settler",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_pu_anton",
      level: 5,
      merchant: {
        scrip: 300,
        table: "merchant_food",
        extra: [
          ["ruins_omelet", 2],
          ["ox_steak", 2],
          ["shellback_cakes", 3],
          ["pigeon_on_a_stick", 4],
        ],
      },
    },
    {
      id: "pu_social1",
      poi: "plaza_hotel",
      at: "npc1",
      type: "human",
      name: "Mrs. Pennington-Smythe",
      outfit: "merchant",
      gender: "f",
      ai: "sit",
      dialogue: "dlg_pu_socialite",
      level: 4,
      faction: "settlers",
    },
    {
      id: "pu_social2",
      poi: "plaza_hotel",
      at: "npc2",
      type: "human",
      name: "Colonel Ashby (ret.)",
      outfit: "merchant",
      gender: "m",
      ai: "sit",
      dialogue: "dlg_pu_socialite",
      level: 6,
    },
    {
      id: "pu_social3",
      poi: "plaza_hotel",
      at: "npc4",
      type: "human",
      name: "Bunny Fairchild",
      outfit: "merchant",
      gender: "f",
      ai: "sit",
      dialogue: "dlg_pu_socialite",
      level: 3,
    },
    {
      id: "pu_social4",
      poi: "plaza_hotel",
      at: "npc3",
      type: "human",
      name: "Society Violinist",
      outfit: "merchant",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pu_socialite",
      level: 3,
    },
    {
      id: "pu_winthrop",
      poi: "plaza_hotel",
      at: "doorman",
      type: "patrolman",
      name: "Winthrop",
      ai: "guard",
      dialogue: "dlg_pu_winthrop",
      level: 6,
      voice: "patrolman",
    },
    // Carnegie
    {
      id: "pu_bell",
      poi: "carnegie_hall",
      at: "maestro",
      type: "human",
      name: "Maestro Bell",
      outfit: "merchant",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_pu_bell",
      level: 7,
      barks: [
        "Allegro! Allegro!",
        "From the top, and this time with FEELING.",
        "Twenty-two years late. Still, fashionably.",
      ],
    },
    {
      id: "pu_rudy",
      poi: "carnegie_hall",
      at: "pianist",
      type: "human",
      name: 'Rudy "Keys" Lomax',
      outfit: "settler",
      gender: "m",
      burn: "R",
      ai: "sit",
      dialogue: "dlg_pu_rudy",
      level: 6,
      faction: "settlers",
    },
    {
      id: "pu_clara",
      poi: "carnegie_hall",
      at: "violinist",
      type: "human",
      name: "Clara",
      outfit: "settler",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_pu_clara",
      level: 5,
      weapon: "pistol_10mm",
    },
    {
      id: "pu_cellist",
      poi: "carnegie_hall",
      at: "cellist",
      type: "human",
      name: "Consort Cellist",
      outfit: "settler",
      gender: "m",
      ai: "sit",
      dialogue: "dlg_pu_clara",
      level: 4,
    },
    {
      id: "pu_stagehand",
      poi: "carnegie_hall",
      at: "stagehand",
      type: "valet",
      name: "Stagehand",
      ai: "guard",
      dialogue: "dlg_pu_stagehand",
      level: 7,
      voice: "valet_m",
    },
    {
      id: "pu_ophelia",
      poi: "carnegie_hall",
      at: "vendor",
      type: "human",
      name: "Ophelia",
      outfit: "merchant",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_pu_ophelia",
      level: 5,
      merchant: {
        scrip: 500,
        table: "merchant_general",
        extra: [
          ["rally_tonic", 3],
          ["ammo_10mm", 40],
          ["purified_water", 4],
        ],
      },
    },
    // Dakota
    {
      id: "pu_agnes",
      poi: "dakota",
      at: "agnes",
      type: "human",
      name: "Mrs. Hollister",
      outfit: "survivor_layers",
      gender: "f",
      burn: "L",
      ai: "sit",
      dialogue: "dlg_pu_agnes",
      level: 5,
      faction: "settlers",
      barks: ["Tea, dear?", "Mind the Van Rensselaers on the stairs."],
    },
  ];
  C.NPCS = NPCS;
  function stockFor(m) {
    const out = [];
    const ok = (id) => {
      try {
        return !G.isStub("items") && !!G.items.get(id);
      } catch (e) {
        return false;
      }
    };
    if (m.table) {
      try {
        const r = G.items.rollLoot(m.table, 8);
        if (Array.isArray(r))
          for (const e of r) if (ok(e[0])) out.push([e[0], e[1]]);
      } catch (e) {
        /* */
      }
    }
    for (const e of m.extra || []) if (ok(e[0])) out.push([e[0], e[1]]);
    return out;
  }
  function spawnNPC(def) {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return null;
    const ex = actor(def.id);
    if (ex && !ex.removed) return ex;
    const a = A(def.poi, def.at);
    if (!a) return null;
    const sd = {
      id: def.id,
      type: def.type,
      name: def.name,
      faction: def.faction || "settlers",
      level: def.level || 5,
      pos: { x: a.x, y: a.y, z: a.z },
      yaw: a.yaw || 0,
      ai: def.ai || "guard",
      home: { x: a.x, z: a.z, r: def.ai === "guard" ? 2.5 : 1.2 },
      dialogue: def.dialogue,
      essential: def.essential !== false,
      hostile: false,
      noRespawn: true,
    };
    if (def.outfit) sd.outfit = def.outfit;
    if (def.gender) sd.gender = def.gender;
    if (def.burn) sd.burn = def.burn;
    if (def.barks) sd.barks = def.barks;
    if (def.voice) sd.voice = def.voice;
    if (def.weapon) {
      try {
        if (!G.isStub("items") && G.items.get(def.weapon))
          sd.weapon = def.weapon;
      } catch (e) {
        /* */
      }
    }
    if (def.merchant)
      sd.merchant = {
        scrip: def.merchant.scrip,
        stock: stockFor(def.merchant),
        restock: 3,
      };
    return P.safe("spawn:" + def.id, () => G.actors.spawn(sd));
  }
