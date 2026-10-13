// play-inline-207 09 — int
// Lines 3786-4281 of readable/play-inline-207.pretty.js (statement-aligned).
  PF.addBuilder(
    "fraunces_tavern",
    function (PF2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PF.cell("fraunces_tavern");
      const int = buildInterior(cell, ext);
      PF.door({
        id: "pf_ft_enter",
        pos: V3(100, 1.8, TZ0 - 0.2),
        label: "Fraunces Tavern",
        verb: "Enter",
        radius: 1.2,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: int.entrance.yaw || 0,
        },
        sound: "door_open",
      });
      // smugglers' tunnel loop: cellar ↔ courtyard bulkhead
      PF.door({
        id: "pf_ft_bulk_in",
        pos: V3(99, 0.8, TZ1 + 1.2),
        label: "Fraunces Cellar",
        verb: "Enter",
        radius: 1.2,
        target: {
          x: int.tunnel.x,
          y: int.tunnel.y + 0.05,
          z: int.tunnel.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_ft_bulk_out",
        pos: V3(int.tunnel.x, int.tunnel.y + 1.2, int.tunnel.z + 1.2),
        label: "Tavern Courtyard",
        verb: "Exit",
        radius: 1.1,
        target: { x: ext.bulkhead.x, y: 0.05, z: ext.bulkhead.z, yaw: PI },
        sound: "door_open",
      });
      const all = Object.assign({}, int, {
        exterior_entrance: ext.door,
        courtyard: ext.court,
        bulkhead: ext.bulkhead,
        guard1: ext.guard,
      });
      all.npc1 = int.bartender;
      all.npc2 = int.cook;
      all.npc3 = int.vane;
      all.merchant = int.bartender;
      all.loot1 = int.cellar_stash;
      all.loot2 = int.attic;
      all.loot3 = int.owner_safe;
      all.spawn1 = int.cellar;
      all.spawn2 = int.attic;
      all.spawn3 = int.taproom;
      all.spawn4 = int.gallery;
      all.spawn5 = int.guest;
      all.spawn6 = int.tunnel;
      PF.register("fraunces_tavern", root, all, {
        interiorRoot: cell.root,
        interiorKey: "fraunces_tavern",
      });

      // props: containers, beds, radio, the tricorn display case (owned), pickups
      PF.prop("safe", {
        x: int.owner_safe.x,
        y: int.owner_safe.y,
        z: int.owner_safe.z,
        yaw: -HP,
        lock: FT_LOCKS.strongbox,
        items: [
          ["scrip", 260],
          ["gold_bar", 1],
          ["old_dollars", 20],
          ["pf_shellback_omelette", 1],
        ],
        id: "pf_ft_strongbox",
        name: "Whitlock Strongbox",
        owner: "settlers",
      });
      PF.prop("footlocker", {
        x: int.cellar_stash.x,
        y: int.cellar_stash.y,
        z: int.cellar_stash.z,
        yaw: HP,
        lock: FT_LOCKS.cache,
        loot: "raider_stash",
        id: "pf_ft_cellar_stash",
        name: "Smugglers' Cache",
      });
      PF.codeReadable(
        V3(
          int.cellar_stash.x + 0.3,
          int.cellar_stash.y + 1.4,
          int.cellar_stash.z + 1.0,
        ),
        "Chalk on the Cellar Wall",
        'A liberty-cap doodle and "S.o.L. CACHE — 1765" (the Stamp Act year; the Sons are nothing if not on-theme).',
        FT_LOCKS.cache.id,
      );
      PF.prop("footlocker", {
        x: int.attic.x - 3.5,
        y: int.attic.y,
        z: int.attic.z - 3.6,
        yaw: 0,
        loot: "luggage",
        id: "pf_ft_attic_trunk",
        name: "Attic Trunk",
      });
      PF.prop("radio", {
        x: int.attic_radio.x,
        y: int.attic_radio.y,
        z: int.attic_radio.z,
        yaw: PI,
        id: "pf_ft_radio",
      });
      PF.prop("bed", {
        x: int.room_bed.x,
        y: int.room_bed.y - 0.6,
        z: int.room_bed.z,
        yaw: 0,
        id: "pf_ft_bed",
        owner: "settlers",
      });
      PF.prop("cash_register", {
        x: int.bartender.x + 1.8,
        y: 1.18 + int.bartender.y,
        z: int.bartender.z + 0.95,
        yaw: PI,
        id: "pf_ft_register",
        owner: "settlers",
        loot: "cash_register",
      });
      PF.prop("footlocker", {
        x: int.tricorn_case.x,
        y: int.tricorn_case.y - 0.9,
        z: int.tricorn_case.z,
        yaw: 0,
        lock: FT_LOCKS.tricorn,
        items: [["pf_tricorn", 1]],
        id: "pf_ft_tricorn_case",
        name: 'Display Case: "Tricorn Hat, c. 1780"',
        owner: "settlers",
      });
      PF.prop("fridge", {
        x: int.kitchen.x + 2.3,
        y: int.kitchen.y,
        z: int.kitchen.z + 0.7,
        yaw: -HP,
        loot: "fridge",
        id: "pf_ft_icebox",
        owner: "settlers",
      });
      PF.pickup(
        "pf_reel_sons",
        1,
        V3(int.attic_radio.x + 0.5, int.attic_radio.y, int.attic_radio.z),
      );
      PF.pickup(
        "pf_grog",
        2,
        V3(int.cellar.x - 1, int.cellar.y + 0.05, int.cellar.z + 2),
      );
      // NPCs
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      PF.npc({
        id: "pf_ft_hollis",
        type: "human",
        name: "Tobin Drummond",
        outfit: "merchant",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(int.bartender),
        yaw: 0,
        ai: "guard",
        home: { x: int.bartender.x, z: int.bartender.z, r: 1.8 },
        dialogue: "pf_dlg_hollis",
        essential: true,
        voice: "merchant",
        seed: 6101,
        weapon: "none",
        merchant: {
          scrip: 500,
          stock: [
            ["pf_grog", 8],
            ["beer", 6],
            ["whiskey", 3],
            ["purified_water", 6],
            ["fizzo_cola", 4],
            ["prairie_root_beer", 3],
            ["golden_plain_jerky", 4],
            ["franks_and_beans", 3],
            ["rally_tonic", 2],
          ],
          restock: 3,
        },
        barks: [
          "What'll it be?",
          "Rumours are free. Grog is five.",
          "Wipe your boots. Please. Anybody. Ever.",
        ],
      });
      PF.npc({
        id: "pf_ft_nan",
        type: "human",
        name: "Nan Whitlock",
        outfit: "survivor_layers",
        gender: "f",
        burn: "R",
        faction: "settlers",
        level: 5,
        pos: pos(int.cook),
        yaw: 0,
        ai: "guard",
        home: { x: int.cook.x, z: int.cook.z, r: 2 },
        dialogue: "pf_dlg_nan",
        essential: true,
        voice: "settler",
        seed: 6102,
        weapon: "none",
        merchant: {
          scrip: 250,
          stock: [
            ["pf_shellback_omelette", 2],
            ["shellback_meat", 3],
            ["pigeon_on_a_stick", 3],
            ["frank_in_a_bun", 2],
            ["purified_water", 3],
          ],
          restock: 3,
        },
        barks: [
          "Mind the stove, it bites.",
          "Edmund liked his eggs runny.",
          "Eat something, you're all bones.",
        ],
      });
      PF.npc({
        id: "pf_ft_vane",
        type: "human",
        name: "Mortimer Vane",
        outfit: "merchant",
        gender: "m",
        faction: "settlers",
        level: 5,
        pos: pos(int.vane),
        yaw: PI,
        ai: "guard",
        home: { x: int.vane.x, z: int.vane.z, r: 0.8 },
        dialogue: "pf_dlg_vane",
        essential: true,
        voice: "settler",
        seed: 6103,
        weapon: "none",
        barks: [
          "Buy low. Die rich.",
          "The market always recovers. Eventually. Mostly.",
          "Have you seen the gold under Liberty Street? No. Nobody has.",
        ],
      });
      PF.npc({
        id: "pf_ft_gw",
        type: "patrolman",
        name: "GW-1776",
        faction: "settlers",
        hostile: false,
        level: 4,
        pos: pos(int.docent),
        yaw: HP,
        ai: "guard",
        home: { x: int.docent.x, z: int.docent.z, r: 1.5 },
        dialogue: "pf_dlg_gw",
        essential: true,
        voice: "patrolman",
        seed: 6104,
        barks: [
          "PLEASE DO NOT TOUCH THE EXHIBITS.",
          "HUZZAH.",
          "THE GIFT SHOP IS CLOSED UNTIL FURTHER NOTICE.",
        ],
        after: (a) => {
          try {
            if (a.char && a.char.root) {
              const hat = tricornMesh();
              const head = a.char.parts && a.char.parts.head;
              (head || a.char.root).add(hat);
              if (!head) hat.position.y = 1.95;
              else hat.position.y = 0.28;
            }
          } catch (e) {
            /* cosmetic */
          }
        },
      });
      PF.npc({
        id: "pf_ft_sal",
        type: "human",
        name: "Sal the Fiddler",
        outfit: "survivor",
        gender: "m",
        faction: "settlers",
        level: 3,
        pos: pos(int.fiddler),
        yaw: HP,
        ai: "guard",
        home: { x: int.fiddler.x, z: int.fiddler.z, r: 0.5 },
        voice: "settler",
        seed: 6105,
        weapon: "none",
        barks: [
          "No requests.",
          "[He saws out a jig that is at least 30% in tune.]",
          'This one\'s called "The Crab Took My Boat".',
        ],
      });
      PF.npc({
        id: "pf_ft_lou",
        type: "human",
        name: "Dockhand Lou",
        outfit: "settler",
        gender: "m",
        faction: "settlers",
        level: 3,
        pos: pos(int.patron),
        yaw: PI,
        ai: "guard",
        home: { x: int.patron.x, z: int.patron.z, r: 0.6 },
        voice: "settler",
        seed: 6106,
        weapon: "none",
        barks: [
          "Crabs got the whole pier. The whole pier!",
          "Lottie's still out there. Tough as a boot, that one.",
          "Buy me a grog and I'll tell you about the Peking.",
        ],
      });
      PF.npc({
        id: "pf_ft_birdie",
        type: "human",
        name: "Birdie",
        outfit: "leather_armor",
        gender: "f",
        faction: "settlers",
        level: 7,
        pos: pos(ext.guard),
        yaw: PI,
        ai: "guard",
        home: { x: ext.guard.x, z: ext.guard.z, r: 1.2 },
        weapon: "combat_shotgun",
        voice: "guard",
        seed: 6107,
        barks: [
          "Guns stay on your hip in there.",
          "Fraunces is open. Behave.",
          "Nan made omelettes. Don't tell Tobin I told you.",
        ],
      });
      PF.npc({
        id: "pf_ft_trader",
        type: "human",
        name: "Quartermaster Ybarra",
        outfit: "survivor",
        gender: "f",
        faction: "settlers",
        level: 5,
        pos: pos(ext.merchant2),
        yaw: 0,
        ai: "guard",
        home: { x: ext.merchant2.x, z: ext.merchant2.z, r: 1.2 },
        voice: "merchant",
        seed: 6108,
        weapon: "pistol_10mm",
        merchant: {
          scrip: 400,
          stock: [
            ["ammo_10mm", 60],
            ["ammo_12ga", 24],
            ["ammo_556", 40],
            ["frag_grenade", 2],
            ["rally_tonic", 2],
            ["scrap_metal", 5],
            ["duct_tape", 3],
          ],
          restock: 3,
        },
        barks: ["Scrap, ammo, sundries.", "Cash or scrip. Scrip preferred."],
      });
      // courtyard settlers: the tower watch, the gardener, the cook at the spit
      PF.npc({
        id: "pf_ft_pike",
        type: "human",
        name: "Watchman Doyle",
        outfit: "leather_armor",
        gender: "m",
        faction: "settlers",
        level: 8,
        pos: pos(ext.tower),
        yaw: PI,
        ai: "guard",
        home: { x: ext.tower.x, z: ext.tower.z, r: 0.7 },
        weapon: "hunting_rifle",
        voice: "guard",
        seed: 6109,
        barks: [
          "Quiet night. Hate quiet nights.",
          "Saw lights on the Peking again. Nobody's on the Peking.",
          "Birdie's got the door. I've got everything else.",
          "Keep your head down past Wall Street.",
        ],
      });
      PF.npc({
        id: "pf_ft_dilly",
        type: "human",
        name: "Dilly Nwosu",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 3,
        pos: pos(ext.garden),
        yaw: PI,
        ai: "guard",
        home: { x: ext.garden.x, z: ext.garden.z, r: 1.5 },
        voice: "settler",
        seed: 6110,
        weapon: "none",
        dialogue: "pf_dlg_dilly",
        merchant: {
          scrip: 120,
          stock: [
            ["gnarlberry", 6],
            ["purified_water", 3],
            ["dirty_water", 4],
          ],
          restock: 2,
        },
        barks: [
          "Purifier water, spud mash and spite. That's the secret.",
          "Step on my beds and I'll plant you in one.",
          "Plums are ripe. Five scrip. Four if you smile.",
        ],
      });
      PF.npc({
        id: "pf_ft_cookie",
        type: "human",
        name: "Cookie",
        outfit: "survivor",
        gender: "m",
        faction: "settlers",
        level: 4,
        pos: pos(ext.cook_fire),
        yaw: PI,
        ai: "guard",
        home: { x: ext.cook_fire.x, z: ext.cook_fire.z, r: 0.8 },
        voice: "settler",
        seed: 6111,
        weapon: "none",
        merchant: {
          scrip: 150,
          stock: [
            ["ox_steak", 3],
            ["shellback_cakes", 2],
            ["ox_meat", 2],
          ],
          restock: 2,
        },
        barks: [
          "Ox haunch. Mostly ox.",
          "Turn the spit, turn the spit...",
          "Nan does eggs. I do meat. We don't talk about the burrow rat incident.",
        ],
      });
      PF.readable(
        V3(ext.jobs_board.x, 1.5, ext.jobs_board.z + 1.1),
        "Jobs Board",
        "HELP WANTED: Lottie Brennan hasn't come back from the Seaport fish market. Her crew's gone too. Ask Tobin. · REV. PENHALLOW at Trinity needs a steady hand for \"a quiet job below the church.\" · BUYING SHELLBACK EGGS, 20 scrip each — Nan, kitchen. · DISCREET PROFESSIONAL wanted for a banking matter. Ask for Mr. Vane, upstairs. · LOST DOG, answers to Patches. No reward, sorry. · NO PILLS, NO DOPE IN THE YARD. — Birdie",
      );
      // chimney smoke
      PF.onInitDone.push(() => {
        try {
          if (PF.live("fx") && G.fx.smoke && PF.smokeAt)
            G.fx.smoke(PF.smokeAt.clone(), 0.6);
        } catch (e) {
          /* optional */
        }
      });
    },
    30,
  );

  /** A small felt tricorn for GW-1776's head. */
