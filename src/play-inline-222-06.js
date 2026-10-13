// play-inline-222 06 — home
// Lines 1142-1428 of readable/play-inline-222.pretty.js (statement-aligned).
  function spawnEllis() {
    const P = (n, dx, dz) => OUT("ellis_island", n, dx, dz);
    const townsfolk = {
      type: "human",
      outfit: "survivor_layers",
      faction: "settlers",
      hostile: false,
    };
    let p;
    p = P("registrar");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_augustine",
          name: "Registrar Augustine Vell",
          outfit: "merchant",
          gender: "m",
          pos: p,
          ai: "guard",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_augustine",
          level: 8,
          barks: [
            "Next! Step up to the desk.",
            "Twelve million people. And now, you.",
            "Everyone gets registered. Everyone gets soup.",
          ],
        }),
      );
    p = P("merchant");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_tomas",
          name: 'Tomas "Customs" Kowalczyk',
          outfit: "merchant",
          gender: "m",
          pos: p,
          ai: "merchant",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_tomas",
          merchant: {
            scrip: 450,
            restock: 3,
            stock: [
              ["rally_tonic", 3],
              ["prussian_blue", 2],
              ["iodine_tabs", 2],
              ["purified_water", 4],
              ["ammo_10mm", 60],
              ["ammo_12ga", 24],
              ["ammo_308", 20],
              ["pistol_10mm", 1],
              ["hunting_rifle", 1],
              ["sawed_off_shotgun", 1],
              ["leather_armor", 1],
              ["metal_armor", 1],
              ["frag_grenade", 3],
              ["scrap_metal", 5],
              ["fizzo_cola", 3],
            ],
          },
          barks: [
            "Declare your goods! Kidding.",
            "Harbor salvage, fresh off the seabed!",
          ],
        }),
      );
    p = P("doctor");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_doc_tran",
          name: "Doc Minh Tran",
          outfit: "doctor",
          gender: "f",
          pos: p,
          ai: "merchant",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_doc",
          merchant: {
            scrip: 350,
            restock: 3,
            stock: [
              ["rally_tonic", 6],
              ["rally_tonic_extra", 1],
              ["prussian_blue", 4],
              ["iodine_tabs", 3],
              ["morphine_syrette", 1],
              ["field_surgery_kit", 1],
              ["purified_water", 3],
            ],
          },
          barks: [
            "Next patient.",
            "If it hurts, don't do that.",
            "Keep your fingers where I can see them. All of them.",
          ],
        }),
      );
    p = P("cook");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_rosaria",
          name: "Mama Rosaria",
          outfit: "settler",
          gender: "f",
          pos: p,
          ai: "merchant",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_rosaria",
          merchant: {
            scrip: 150,
            restock: 2,
            stock: [
              ["shellback_chowder", 3],
              ["shellback_cakes", 3],
              ["golden_plain_jerky", 2],
              ["franks_and_beans", 2],
              ["purified_water", 4],
              ["dirty_water", 4],
              ["beer", 2],
            ],
          },
          barks: ["Soup! Five scrip! Love is free!", "You call that eating?"],
        }),
      );
    p = P("porter");
    if (p)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_sal",
          name: "Porter Sal",
          outfit: "settler",
          gender: "m",
          pos: p,
          ai: "guard",
          home: home(p, 2),
          essential: true,
          dialogue: "ph_dlg_sal",
          barks: [
            "Baggage check!",
            "Claim ticket? No? Nobody ever has the ticket.",
          ],
        }),
      );
    const gp1 = P("guard1"),
      gp2 = P("guard2");
    if (gp1)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_guard1",
          name: "Registry Guard",
          outfit: "leather_armor",
          gender: "m",
          pos: gp1,
          ai: "guard",
          home: home(gp1, 2),
          dialogue: "ph_dlg_ellis_guard",
          weapon: "hunting_rifle",
          level: 7,
          barks: ["Welcome to the Registry. Keep it holstered."],
        }),
      );
    if (gp2)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_guard2",
          name: "Registry Guard",
          outfit: "combat_armor",
          gender: "f",
          pos: gp2,
          ai: "guard",
          home: home(gp2, 2),
          dialogue: "ph_dlg_ellis_guard",
          weapon: "pistol_10mm",
          level: 7,
          barks: ["Papers? Kidding. Mostly."],
        }),
      );
    const gg1 = P("gate1"),
      gg2 = P("gate2");
    if (gg1)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_gate1",
          name: "Registry Gatekeeper",
          outfit: "combat_armor",
          gender: "m",
          pos: gg1,
          ai: "guard",
          home: home(gg1, 2),
          dialogue: "ph_dlg_ellis_guard",
          weapon: "hunting_rifle",
          level: 8,
          barks: [
            "Welcome to America. Again.",
            "Registrar's upstairs. Mind the stairs, they're older than me.",
          ],
        }),
      );
    if (gg2)
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_gate2",
          name: "Registry Gatekeeper",
          outfit: "leather_armor",
          gender: "f",
          pos: gg2,
          ai: "guard",
          home: home(gg2, 2),
          dialogue: "ph_dlg_ellis_guard",
          weapon: "pistol_10mm",
          level: 8,
          barks: ["Keep your weapon down on the island."],
        }),
      );
    const names = [
      "Old Tom",
      "Greta Lindqvist",
      "Inga Lindqvist",
      "Dutch",
      "Moss",
      "Father Pat",
    ];
    ["npc1", "npc2", "npc3", "npc4", "npc5", "npc6"].forEach((n, i) => {
      const pp = P(n);
      if (!pp) return;
      spawn(
        Object.assign({}, townsfolk, {
          id: "ph_ellis_res" + i,
          name: names[i],
          outfit: i % 2 ? "settler" : "survivor_layers",
          gender: i % 3 ? "f" : "m",
          pos: pp,
          ai: "wander",
          home: home(pp, 5),
          dialogue: "ph_dlg_resident",
          level: 4,
        }),
      );
    });
    // Nadia at home (after the rescue)
    if (PH.flag("nadia_freed")) {
      const np = P("npc7");
      if (np) {
        PH.setFlag("nadia_home");
        spawn(
          Object.assign({}, townsfolk, {
            id: "ph_nadia",
            name: "Nadia Osei",
            outfit: "settler",
            gender: "f",
            pos: np,
            ai: "guard",
            home: home(np, 3),
            essential: true,
            dialogue: "ph_dlg_nadia",
            barks: ["Dawn run leaves at six. Don't be late."],
          }),
        );
      }
    }
    // the quarantine ward's Maniacs
    if (!PH.flag("quarantine_cleared"))
      ["maniac1", "maniac2", "maniac3"].forEach((n, i) => {
        const fp = P(n);
        if (!fp) return;
        spawn({
          id: "ph_ellis_maniac" + i,
          type: "maniac",
          name: ["Beppe", "Old Marta", "The Kowalski Boy"][i],
          faction: "maniacs",
          hostile: true,
          level: 6,
          pos: fp,
          ai: "guard",
          home: home(fp, 4),
          noRespawn: true,
        });
      });
  }
