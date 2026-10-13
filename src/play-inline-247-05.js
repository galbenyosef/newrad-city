// play-inline-247 05 — home
// Lines 947-1003 of readable/play-inline-247.pretty.js (statement-aligned).
  PR.npc({
    id: "pr_keeper",
    type: "human",
    name: "Old Mac",
    outfit: "survivor_layers",
    gender: "m",
    faction: "settlers",
    level: 6,
    pos: { x: 397.4, y: 0, z: -706.6 },
    yaw: PI,
    ai: "guard",
    home: { x: 397.4, z: -706.6, r: 2.2 },
    dialogue: "pr_dlg_keeper",
    essential: true,
    voice: "settler",
    seed: 1872,
    weapon: "none",
    merchant: {
      scrip: 350,
      stock: [
        ["purified_water", 6],
        ["dirty_water", 4],
        ["shellback_meat", 4],
        ["roach_meat", 3],
        ["prussian_blue", 2],
        ["iodine_tabs", 2],
        ["rally_tonic", 3],
        ["scrap_metal", 6],
        ["ammo_10mm", 40],
        ["ammo_12ga", 16],
        ["dry_cell", 2],
        ["scrap_metal", 5],
      ],
      restock: 3,
    },
    barks: [
      "Light's on. Boats know there's rocks.",
      "Round and round, up at the Octagon. Every night.",
      "Don't go in the Pox House after dark. Or during the day.",
      "Bring the skiff back, whoever took it.",
    ],
    after: (a) => {
      try {
        const k = PR.anchorOf("roosevelt_island", "keeper");
        if (k) {
          a.pos.set(k.x, k.y, k.z);
          a.yaw = k.yaw;
          if (a.home) {
            a.home.x = k.x;
            a.home.z = k.z;
          }
        }
      } catch (e) {
        /* */
      }
    },
  });
