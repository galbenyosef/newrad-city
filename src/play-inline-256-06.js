// play-inline-256 06 — int
// Lines 1634-2234 of readable/play-inline-256.pretty.js (statement-aligned).
  PF.addBuilder(
    KEY,
    function (PF2, site, root) {
      const ext = PF.buildQueensboroExterior(root);
      const cell = PF.cell(KEY);
      const int = buildInterior(cell);
      // power-dependent extra glows (brighter market once the generator runs)
      for (const [x, y, z] of [
        [-12, 4.6, 0],
        [4, 4.6, 0],
        [20, 4.6, 0],
        [-20, 4.6, -4],
        [12, 4.6, 4],
        [15.4, -1.2, -36],
        [-6, -1.5, -35],
      ]) {
        powerGlows.push(
          PF.glow(W(x, y, z), 0xffe0a0, 3.0, cell.root, { intensity: 0.9 }),
        );
      }
      PF.onInitDone.push(applyPower);
      // doors: street ↔ hall; deck kiosk ↔ tower landing; river hatch ↔ pier landing
      PF.door({
        id: "pbr_bm_in",
        pos: V3(ext.market_door.x, 1.6, -423.4),
        label: "Bridgemarket",
        verb: "Enter",
        radius: 1.8,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_bm_out",
        pos: W(-4, 1.6, 7.6),
        label: "59th Street",
        verb: "Exit",
        radius: 1.6,
        target: {
          x: ext.market_door.x,
          y: 0.05,
          z: ext.market_door.z,
          yaw: PI,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_bm_deck_in",
        pos: V3(ext.deck_hatch.x - 1.2, 23.3, ext.deck_hatch.z),
        label: "Bridgemarket — Stairs Down",
        verb: "Enter",
        radius: 1.3,
        target: {
          x: int.deck_door.x - 0.8,
          y: int.deck_door.y + 0.05,
          z: int.deck_door.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_bm_deck_out",
        pos: W(-25.1, 9.3, -3.9),
        label: "Queensboro Bridge — Upper Deck",
        verb: "Climb to",
        radius: 1.3,
        target: {
          x: ext.deck_hatch.x,
          y: ext.deck_hatch.y + 0.05,
          z: ext.deck_hatch.z,
          yaw: -HP,
        },
        sound: "door_open",
      });
      // one-way: the river hatch is bolted from inside until the player climbs out that way (not a lock)
      const hatchIn = PF.barDoor(
        PF.door({
          id: "pbr_bm_hatch_in",
          pos: V3(345.2, 1.5, -442.9),
          label: "Pier Works — Service Hatch",
          verb: "Enter",
          radius: 1.3,
          target: {
            x: int.river_hatch.x - 0.6,
            y: int.river_hatch.y + 0.05,
            z: int.river_hatch.z,
            yaw: HP,
          },
          sound: "door_open",
        }),
        {
          lockText: "Bolted from inside",
          message: "The service hatch is bolted from the inside.",
        },
      );
      PF.door({
        id: "pbr_bm_hatch_out",
        pos: W(32.1, -4.6, -35.8),
        label: "East River Landing",
        verb: "Climb to",
        radius: 1.3,
        target: {
          x: ext.pier_hatch.x,
          y: ext.pier_hatch.y + 0.05,
          z: ext.pier_hatch.z,
          yaw: HP,
        },
        sound: "door_open",
        onEnter: () => {
          if (hatchIn && hatchIn.unbar) hatchIn.unbar();
        },
      });

      const all = Object.assign({}, int, {
        exterior_entrance: ext.market_door,
        deck_hatch: ext.deck_hatch,
        ramp_foot: ext.ramp_foot,
        ramp_top: ext.ramp_top,
        deck_mid: ext.deck_mid,
        broken_end: ext.broken_end,
        island_stair: ext.island_stair,
        pier_hatch: ext.pier_hatch,
      });
      PF.register(KEY, root, all, {
        interiorRoot: cell.root,
        interiorKey: KEY,
      });

      // interactions: generator panel, storeroom gate
      PF.use({
        pos: W(11.5, -4.6, -30.1),
        radius: 1.1,
        range: 2.6,
        label: "Tidal Governor 3",
        verb: () => (PF.flag("bm_power") ? "Examine" : "Repair"),
        onInteract() {
          if (PF.live("dialogue") && G.dialogue.start)
            G.dialogue.start("pbr_dlg_generator", null, {
              name: "Tidal Governor 3",
            });
          else if (PF.inv.count("pbr_bm_fuse") > 0) {
            PF.inv.remove("pbr_bm_fuse", 1);
            powerOn("fuse");
          } else G.notify("The governor fuse is blown.");
        },
      });
      buildStoreGate(cell, int);

      // props & pickups
      PF.prop("terminal", {
        x: int.terminal.x,
        y: int.terminal.y,
        z: int.terminal.z,
        yaw: 0,
        terminalId: "pbr_bm_ledger",
        id: "pbr_bm_term_ledger",
      });
      PF.prop("terminal", {
        x: int.gen_terminal.x,
        y: int.gen_terminal.y,
        z: int.gen_terminal.z,
        yaw: PI,
        terminalId: "pbr_bm_governor",
        id: "pbr_bm_term_gov",
      });
      PF.prop("safe", {
        x: int.loot3.x,
        y: int.loot3.y,
        z: int.loot3.z,
        yaw: HP,
        locked: 0,
        lock: PF.LOCKS.bm_safe,
        owner: "settlers",
        items: [
          ["scrip", 220],
          ["rally_tonic", 2],
          ["pbr_bm_storekey", 1],
          ["old_dollars", 6],
        ],
        id: "pbr_bm_ruth_safe",
        name: "Mayor's Safe",
      });
      PF.prop("footlocker", {
        x: int.loot1.x,
        y: int.loot1.y,
        z: int.loot1.z,
        yaw: 0,
        loot: "footlocker",
        owner: "settlers",
        id: "pbr_bm_store1",
        name: "Market Stores",
      });
      PF.prop("ammo_box", {
        x: int.loot1.x + 1.4,
        y: int.loot1.y,
        z: int.loot1.z + 0.4,
        loot: "ammo_box",
        owner: "settlers",
        id: "pbr_bm_store2",
      });
      PF.prop("footlocker", {
        x: int.loot2.x,
        y: int.loot2.y,
        z: int.loot2.z,
        yaw: 0,
        loot: "footlocker",
        owner: "settlers",
        id: "pbr_bm_bunk1",
        name: "Watchman's Footlocker",
      });
      PF.prop("first_aid", {
        x: O.x - 23.6,
        y: O.y + 1.4,
        z: O.z - 5.5,
        yaw: -HP,
        loot: "first_aid",
        owner: "settlers",
        id: "pbr_bm_clinic_kit",
      });
      PF.prop("toolbox", {
        x: int.loot4.x,
        y: int.loot4.y,
        z: int.loot4.z,
        yaw: PI,
        loot: "toolbox",
        id: "pbr_bm_gen_tools",
        name: "Five Boroughs Toolbox",
      });
      PF.prop("cash_register", {
        x: O.x + 21.6,
        y: O.y + 1.16,
        z: O.z - 3.1,
        yaw: PI,
        loot: "cash_register",
        owner: "settlers",
        id: "pbr_bm_register",
      });
      PF.prop("fizzo_machine", {
        x: O.x + 1.5,
        y: O.y,
        z: O.z + 7.2,
        yaw: PI,
        id: "pbr_bm_fizzo",
      });
      PF.prop("file_cabinet", {
        x: O.x - 39.3,
        y: O.y + 8,
        z: O.z + 5.5,
        yaw: HP,
        loot: "file_cabinet",
        owner: "settlers",
        id: "pbr_bm_files",
      });
      PF.pickup(
        "pbr_reel_dutch",
        1,
        V3(int.dutch.x + 0.5, int.dutch.y + 0.15, int.dutch.z + 0.3),
      );
      PF.pickup(
        "pbr_bm_fuse",
        1,
        V3(int.dutch.x + 0.7, int.dutch.y + 0.2, int.dutch.z + 0.6),
      );
      PF.pickup(
        "pbr_note_guastavino",
        1,
        V3(O.x - 33.2, O.y + 8.82, O.z + 3.0),
      );
      PF.pickup("rally_tonic", 1, V3(O.x + 20.4, O.y - 5.9, O.z - 41.2));
      PF.pickup("shellback_meat", 2, V3(O.x - 29, O.y - 6.2, O.z - 36));

      // NPCs — residents (friendly) and the Pier Works shellbacks
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      PF.npc({
        id: "pbr_bm_ruth",
        type: "human",
        name: "Ruth Adebayo",
        outfit: "merchant",
        gender: "f",
        skinTone: 0.85,
        faction: "settlers",
        level: 8,
        pos: pos(int.npc_ruth),
        yaw: PI,
        ai: "guard",
        home: { x: int.npc_ruth.x, z: int.npc_ruth.z, r: 2 },
        dialogue: "pbr_dlg_ruth",
        essential: true,
        voice: "settler",
        seed: 5901,
        weapon: "pistol_10mm",
        barks: [
          "The vaults held. We'll hold.",
          "Rent is due Thursday. Every Thursday.",
          "Mind the tiles.",
        ],
      });
      PF.npc({
        id: "pbr_bm_sol",
        type: "human",
        name: "Morty Weintraub",
        outfit: "survivor_layers",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(int.npc_sol),
        yaw: 0,
        ai: "merchant",
        home: { x: int.npc_sol.x, z: int.npc_sol.z, r: 1 },
        dialogue: "pbr_dlg_sol",
        essential: true,
        voice: "settler",
        seed: 5902,
        merchant: {
          scrip: 420,
          stock: [
            ["purified_water", 6],
            ["fizzo_cola", 4],
            ["golden_plain_jerky", 5],
            ["franks_and_beans", 4],
            ["scrap_metal", 12],
            ["duct_tape", 3],
            ["prussian_blue", 1],
            ["ammo_10mm", 40],
            ["scrap_metal", 5],
            ["dry_cell", 2],
          ],
          restock: 3,
        },
        barks: [
          "Everything must go! Mostly because of the smell.",
          "Twenty-two years in traffic. Worth it.",
          "Sundries! Get your sundries!",
        ],
      });
      PF.npc({
        id: "pbr_bm_hattie",
        type: "human",
        name: "Doc Hattie Lin",
        outfit: "doctor",
        gender: "f",
        skinTone: 0.35,
        faction: "settlers",
        level: 6,
        pos: pos(int.npc_hattie),
        yaw: 0,
        ai: "merchant",
        home: { x: int.npc_hattie.x, z: int.npc_hattie.z, r: 1.5 },
        dialogue: "pbr_dlg_hattie",
        essential: true,
        voice: "settler",
        seed: 5903,
        merchant: {
          scrip: 300,
          stock: [
            ["rally_tonic", 5],
            ["prussian_blue", 3],
            ["iodine_tabs", 3],
            ["morphine_syrette", 2],
            ["field_surgery_kit", 1],
            ["purified_water", 3],
          ],
          restock: 3,
        },
        barks: [
          "Next!",
          "Keep pressure on that.",
          "If it's glowing, don't touch it. If it's you, see me.",
        ],
      });
      PF.npc({
        id: "pbr_bm_benny",
        type: "human",
        name: 'Lou "Two-Tone" Mazur',
        outfit: "settler",
        gender: "m",
        faction: "settlers",
        level: 5,
        pos: pos(int.npc_benny),
        yaw: PI,
        ai: "merchant",
        home: { x: int.npc_benny.x, z: int.npc_benny.z, r: 1.5 },
        dialogue: "pbr_dlg_benny",
        essential: true,
        voice: "settler",
        seed: 5904,
        merchant: {
          scrip: 260,
          stock: [
            ["beer", 8],
            ["whiskey", 2],
            ["fizzo_cola", 6],
            ["prairie_root_beer", 4],
            ["shellback_cakes", 6],
            ["shellback_chowder", 3],
            ["coney_dog", 3],
            ["bodega_pretzel", 4],
          ],
          restock: 2,
        },
        barks: [
          "Order up!",
          "The Span: where the bridge meets your mouth.",
          "Shellback cakes! Fresher than they look!",
        ],
      });
      PF.npc({
        id: "pbr_bm_kowalski",
        type: "human",
        name: "Wanda Kowalski",
        outfit: "combat_armor",
        gender: "f",
        skinTone: 0.2,
        faction: "settlers",
        level: 9,
        pos: pos(int.npc_kowalski),
        yaw: PI,
        ai: "merchant",
        home: { x: int.npc_kowalski.x, z: int.npc_kowalski.z, r: 1 },
        dialogue: "pbr_dlg_kowalski",
        essential: true,
        voice: "settler",
        seed: 5905,
        weapon: "combat_shotgun",
        merchant: {
          scrip: 500,
          stock: [
            ["pistol_10mm", 1],
            ["hunting_rifle", 1],
            ["combat_shotgun", 1],
            ["ammo_10mm", 60],
            ["ammo_12ga", 30],
            ["ammo_308", 20],
            ["ammo_44", 18],
            ["frag_grenade", 3],
            ["combat_knife", 1],
            ["leather_armor", 1],
          ],
          restock: 3,
        },
        barks: [
          "Look, don't touch. Touch, buy.",
          'Kowalski\'s: we put the "arms" in "armistice".',
        ],
      });
      PF.npc({
        id: "pbr_bm_moss",
        type: "human",
        name: "Moss",
        outfit: "leather_armor",
        gender: "m",
        skinTone: 0.6,
        faction: "settlers",
        level: 7,
        pos: pos(int.guard1),
        yaw: PI,
        ai: "guard",
        home: { x: int.guard1.x, z: int.guard1.z, r: 2 },
        dialogue: "pbr_dlg_guard",
        voice: "settler",
        seed: 5906,
        weapon: "hunting_rifle",
        barks: [
          "Stairs are closed. Well — they're open. Nobody's using them.",
          "Hear that clicking?",
        ],
      });
      PF.npc({
        id: "pbr_bm_watch1",
        type: "human",
        name: "Bridgemarket Watch",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 6,
        pos: pos(int.guard2),
        yaw: PI,
        ai: "guard",
        home: { x: int.guard2.x, z: int.guard2.z, r: 3 },
        voice: "settler",
        seed: 5907,
        weapon: "pistol_10mm",
        barks: [
          "Welcome to Bridgemarket. Keep your hands where Kowalski can see them.",
        ],
      });
      PF.npc({
        id: "pbr_bm_watch2",
        type: "human",
        name: "Ramp Sentry",
        outfit: "leather_armor",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(ext.guard1),
        yaw: ext.guard1.yaw,
        ai: "guard",
        home: { x: ext.guard1.x, z: ext.guard1.z, r: 3 },
        voice: "settler",
        seed: 5908,
        weapon: "hunting_rifle",
        barks: [
          "Toll's five scrip. Kidding. Mostly.",
          "Bridge is out past the island. Don't say nobody told you.",
        ],
      });
      PF.npc({
        id: "pbr_bm_watch3",
        type: "human",
        name: "Deck Sentry",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 6,
        pos: pos(ext.guard2),
        yaw: ext.guard2.yaw,
        ai: "guard",
        home: { x: ext.guard2.x, z: ext.guard2.z, r: 3 },
        voice: "settler",
        seed: 5909,
        weapon: "hunting_rifle",
        barks: ["Nice view, huh? Used to be nicer."],
      });
      // Pier Works
      const lurk = (id, name, a, lvl, hp) =>
        PF.npc({
          id,
          type: "shellback",
          name,
          faction: "creatures",
          level: lvl,
          pos: pos(a),
          yaw: a.yaw || 0,
          ai: "wander",
          home: { x: a.x, z: a.z, r: 5 },
          seed: id.length * 97 + lvl,
          hp,
        });
      lurk("pbr_bm_lurk1", "Shellback", int.spawn1, 5);
      lurk("pbr_bm_lurk2", "Shellback", int.spawn2, 5);
      lurk("pbr_bm_lurk3", "Softshell Shellback", int.spawn3, 3);
      lurk("pbr_bm_lurk4", "Shellback", int.spawn5, 6);
      PF.npc({
        id: "pbr_bm_snapper",
        type: "shellback",
        name: "Old Snapper",
        faction: "creatures",
        level: 10,
        pos: pos(int.boss),
        yaw: int.boss.yaw,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 6 },
        hp: 300,
        seed: 5920,
        xp: 110,
        after: (a) => {
          try {
            if (a.char && a.char.root) a.char.root.scale.setScalar(1.4);
          } catch (e) {
            /* cosmetic */
          }
        },
      });

      // arriving in the Pier Works advances the quest
      PF.trigger(
        {
          x0: W(-30, 0, 0).x,
          x1: W(33, 0, 0).x,
          y0: O.y - 7.5,
          y1: O.y - 3,
          z0: O.z - 47,
          z1: O.z - 26,
        },
        () => {
          PF.q.advance("pbr_current", ["talk", "works"], "fix");
          G.notify(
            "The Pier Works. Ankle-deep water, dead pumps — and the clicking is much louder down here.",
          );
        },
        { cond: () => !PF.flag("bm_power") },
      );
      // Dutch's tape reel and spare fuse lie in the Pier Works (west end, x -26): finding either means you got down there
      G.events.on("itemAdded", (id) => {
        if (
          (id === "pbr_reel_dutch" || id === "pbr_bm_fuse") &&
          !PF.flag("bm_power")
        )
          PF.q.advance("pbr_current", ["talk", "works"], "fix");
      });
    },
    10,
  );

  // -------------------------------------------------------------------
  // Storeroom gate: iron bars that lift once unlocked (the stores key from the market safe) — owned by the market
  // -------------------------------------------------------------------
