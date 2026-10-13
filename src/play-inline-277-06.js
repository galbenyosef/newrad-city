// play-inline-277 06 — def
// Lines 1099-1426 of readable/play-inline-277.pretty.js (statement-aligned).
  function defineQuests() {
    const q = Q();
    if (!q) return;
    const mk = (poi, name, label) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label }] : [];
    };
    P.safe("quest:gardens", () =>
      q.define({
        id: "uw_gardens",
        name: "The Hanging Gardens",
        giver: "Adeline Crandall",
        location: "The San Remo",
        desc: "The San Remo commune has soil, water and sun in its penthouse conservatory — but nothing to plant. Adeline Crandall believes W.E.D. Stokes's old-world heirloom seed bank is still on the rooftop farm of the Ansonia.",
        stages: [
          {
            id: "talk",
            text: "Speak with Adeline Crandall in the San Remo penthouse.",
            markers: mk("san_remo", "adeline", "Adeline Crandall"),
          },
          {
            id: "seeds",
            text: () =>
              has("uw_seed_bank")
                ? "Bring the seed bank to Adeline Crandall at the San Remo."
                : "Recover the Stokes seed bank from the rooftop farm of the Ansonia (roof access: top of the grand spiral stair).",
            markers: () =>
              has("uw_seed_bank")
                ? mk("san_remo", "adeline", "Adeline Crandall")()
                : P.inCell("ansonia")
                  ? mk("ansonia", "roof_access", "Roof Access")()
                  : mk("ansonia", "seedbank", "Stokes Seed Bank")(),
          },
          {
            id: "return",
            text: "Bring the seed bank to Adeline Crandall at the San Remo.",
            markers: mk("san_remo", "adeline", "Adeline Crandall"),
          },
        ],
        rewards: {
          xp: 400,
          scrip: 100,
          items: [
            ["rally_tonic", 2],
            ["purified_water", 4],
          ],
          standing: 15,
        },
      }),
    );
    P.safe("quest:window", () =>
      q.define({
        id: "uw_window",
        name: "Window Shopping",
        giver: "Birdie",
        location: "Bellamy's",
        desc: "Birdie Finch, the San Remo's sniper, can't leave her tower. Her brother Toby was dragged into Bellamy's by the Mannequins, a raider gang led by the self-styled Window Dresser.",
        stages: [
          {
            id: "find",
            text: "Find Toby Finch inside Bellamy's (third floor, stockroom).",
            markers: () =>
              P.inCell("bellamys")
                ? mk("bellamys", "cage", "Toby Finch")()
                : mk("bellamys", "exterior_entrance", "Bellamy's")(),
          },
          {
            id: "free",
            text: "Free Toby from the stockroom cage (Average lock, the Window Dresser's key, or the manager's terminal).",
            markers: mk("bellamys", "cage_door", "Hold Cage"),
          },
          {
            id: "report",
            text: "Tell Birdie on the San Remo's north tower that Toby is free.",
            markers: () => {
              const a = actor("uw_birdie");
              return a
                ? [
                    {
                      npc: "uw_birdie",
                      label: "Birdie",
                      x: a.pos.x,
                      z: a.pos.z,
                    },
                  ]
                : mk("san_remo", "birdie", "Birdie")();
            },
          },
        ],
        rewards: {
          xp: 450,
          items: [
            ["uw_crows_nest", 1],
            ["ammo_308", 30],
          ],
          standing: 25,
        },
      }),
    );
  }

  // ==================================================================
  // NPCs
  // ==================================================================
  const NPCS = [
    {
      id: "uw_adeline",
      poi: "san_remo",
      at: "adeline",
      type: "human",
      name: "Adeline Crandall",
      outfit: "settler",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_uw_adeline",
      level: 7,
      barks: [
        "Beans. Everything comes back to beans.",
        "Welcome to the San Remo.",
      ],
    },
    {
      id: "uw_mercer",
      poi: "san_remo",
      at: "mercer",
      type: "human",
      name: "Mercer",
      outfit: "merchant",
      gender: "m",
      ai: "merchant",
      dialogue: "dlg_uw_mercer",
      level: 6,
      weapon: "combat_shotgun",
      merchant: {
        scrip: 650,
        table: "merchant_general",
        extra: [
          ["ammo_10mm", 60],
          ["ammo_308", 30],
          ["ammo_12ga", 24],
          ["rally_tonic", 3],
          ["purified_water", 6],
          ["frag_grenade", 3],
          ["scrap_metal", 10],
        ],
      },
    },
    {
      id: "uw_halloway",
      poi: "san_remo",
      at: "doc",
      type: "human",
      name: "Doc Halloway",
      outfit: "doctor",
      gender: "f",
      ai: "merchant",
      dialogue: "dlg_uw_doc",
      level: 6,
      merchant: {
        scrip: 400,
        table: "merchant_doctor",
        extra: [
          ["rally_tonic", 6],
          ["prussian_blue", 4],
          ["iodine_tabs", 4],
          ["morphine_syrette", 2],
        ],
      },
    },
    {
      id: "uw_gus",
      poi: "san_remo",
      at: "gus",
      type: "human",
      name: "Augie",
      outfit: "settler",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_uw_gus",
      level: 8,
      faction: "settlers",
      barks: ["Wipe your feet.", "Evening.", "Elevator's behind me."],
    },
    {
      id: "uw_nia",
      poi: "san_remo",
      at: "nia",
      type: "human",
      name: "Nia",
      outfit: "settler",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_uw_nia",
      level: 4,
    },
    {
      id: "uw_settler1",
      poi: "san_remo",
      at: "npc1",
      type: "human",
      name: "Commune Settler",
      outfit: "settler",
      gender: "m",
      ai: "sit",
      dialogue: "dlg_uw_settler",
      level: 3,
      barks: ["Pigeon again.", "Evening."],
    },
    {
      id: "uw_settler2",
      poi: "san_remo",
      at: "npc2",
      type: "human",
      name: "Commune Cook",
      outfit: "settler",
      gender: "f",
      ai: "guard",
      dialogue: "dlg_uw_settler",
      level: 3,
      barks: ["Soup's on. It's pigeon.", "Who took my ladle?"],
    },
    {
      id: "uw_settler3",
      poi: "san_remo",
      at: "npc3",
      type: "human",
      name: "Lobby Guard",
      outfit: "drifter",
      gender: "m",
      ai: "guard",
      dialogue: "dlg_uw_settler",
      level: 5,
      weapon: "hunting_rifle",
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
  const hasItem = (id) => {
    try {
      return !G.isStub("items") && !!G.items.get(id);
    } catch (e) {
      return false;
    }
  };
  function spawnNPC(def, where) {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return null;
    const ex = actor(def.id);
    if (ex && !ex.removed && !ex.dead) return ex;
    const a = where || A(def.poi, def.at);
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
      home: { x: a.x, z: a.z, r: def.ai === "guard" ? 2.0 : 1.0 },
      dialogue: def.dialogue,
      essential: def.essential !== false,
      hostile: false,
      noRespawn: true,
    };
    if (def.outfit) sd.outfit = def.outfit;
    if (def.gender) sd.gender = def.gender;
    if (def.barks) sd.barks = def.barks;
    if (def.holdPos) sd.holdPos = true;
    if (def.weapon && hasItem(def.weapon)) sd.weapon = def.weapon;
    else if (def.ai === "guard" || def.ai === "sit") sd.weapon = "none";
    if (def.merchant)
      sd.merchant = {
        scrip: def.merchant.scrip,
        stock: stockFor(def.merchant),
        restock: 3,
      };
    return P.safe("spawn:" + def.id, () => G.actors.spawn(sd));
  }
  function spawnBirdie() {
    const a = spawnNPC({
      id: "uw_birdie",
      poi: "san_remo",
      at: "birdie",
      type: "human",
      name: "Birdie",
      outfit: "drifter",
      gender: "f",
      ai: "guard",
      holdPos: true,
      dialogue: "dlg_uw_birdie",
      level: 9,
      weapon: "sniper_rifle",
      barks: [
        "Keep low.",
        "Movement on Seventy-Second.",
        "Three bangs, pause, three bangs...",
      ],
    });
    if (a) {
      try {
        a.sight = Math.max(a.sight || 0, 140);
        a.accuracy = Math.max(a.accuracy || 1, 1.6);
      } catch (e) {
        /* */
      }
    }
  }
