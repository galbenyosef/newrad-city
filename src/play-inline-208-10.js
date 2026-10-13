// play-inline-208 10 — int
// Lines 3847-4253 of readable/play-inline-208.pretty.js (statement-aligned).
  PF.addBuilder(
    "seaport",
    function (PF2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PF.cell("seaport");
      const int = buildInterior(cell, ext);
      // doors: market (plaza) ↔ hall; dock (east) ↔ loading dock; Peking fore hatch ↔ fo'c'sle; aft companionway ↔ poop
      PF.door({
        id: "pf_sp_market_in",
        pos: V3(ext.market_door.x, 1.6, 713.3),
        label: "Fulton Fish Market",
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
        id: "pf_sp_market_out",
        pos: V3(int.entrance.x, int.entrance.y + 1.6, int.entrance.z + 1.3),
        label: "Fulton Street",
        verb: "Exit",
        radius: 1.5,
        target: { x: ext.market_door.x, y: 0.05, z: ext.market_door.z, yaw: 0 },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_dock_in",
        pos: V3(232.4, 1.6, 724),
        label: "Fish Market Loading Dock",
        verb: "Enter",
        radius: 1.5,
        target: {
          x: int.dock.x + 0.2,
          y: int.dock.y + 0.05,
          z: int.dock.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_dock_out",
        pos: V3(int.dock.x + 1.3, int.dock.y + 1.4, int.dock.z - 0.8),
        label: "South Street",
        verb: "Exit",
        radius: 1.3,
        target: { x: ext.dock_door.x, y: 0.05, z: ext.dock_door.z, yaw: -HP },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_fore_in",
        pos: V3(313.7, PK.deck + 1.2, PK.zc),
        label: "Peking — Forecastle Hatch",
        verb: "Enter",
        radius: 1.2,
        target: {
          x: int.ship_entrance.x,
          y: int.ship_entrance.y + 0.05,
          z: int.ship_entrance.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_fore_out",
        pos: V3(
          int.ship_entrance.x + 5.4,
          int.ship_entrance.y + 1.3,
          int.ship_entrance.z - 0.8,
        ),
        label: "Peking — Main Deck",
        verb: "Climb to",
        radius: 1.2,
        target: {
          x: ext.fore_hatch.x,
          y: ext.fore_hatch.y + 0.05,
          z: ext.fore_hatch.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_aft_out",
        pos: V3(int.companion.x, int.companion.y + 1.3, int.companion.z),
        label: "Peking — Poop Deck",
        verb: "Climb to",
        radius: 1.2,
        target: {
          x: ext.aft_hatch.x,
          y: ext.aft_hatch.y + 0.05,
          z: ext.aft_hatch.z,
          yaw: -HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pf_sp_aft_in",
        pos: V3(PK.x0 + 5.8, PK.deck + 1.8 + 1.0, PK.zc),
        label: "Peking — Captain's Saloon",
        verb: "Enter",
        radius: 1.2,
        target: {
          x: int.aft_arrive.x,
          y: int.aft_arrive.y + 0.05,
          z: int.aft_arrive.z,
          yaw: int.aft_arrive.yaw,
        },
        sound: "door_open",
      });

      const all = Object.assign({}, int, {
        exterior_entrance: ext.market_door,
        gangway: ext.gangway,
        peking_deck: ext.peking_deck,
        ambrose: ext.ambrose_gangway,
      });
      all.npc1 = int.lottie;
      all.merchant = int.lottie_stall;
      PF.register("seaport", root, all, {
        interiorRoot: cell.root,
        interiorKey: "seaport",
      });

      // the hatchery interaction (hold)
      PF.use({
        pos: V3(int.nest.x, int.nest.y + 0.8, int.nest.z),
        radius: 2.2,
        range: 3.4,
        label: "Shellback Hatchery",
        verb: () => (PF.flag("sp_nest") ? "Examine" : "Destroy"),
        onInteract() {
          if (PF.flag("sp_nest")) {
            G.notify(
              "Smashed shells and scorched mud. Nothing will hatch here again.",
            );
            return;
          }
          if (PF.live("dialogue") && G.dialogue.start)
            G.dialogue.start("pf_dlg_nest", null, {
              name: "Shellback Hatchery",
            });
          else destroyNest();
        },
      });
      // exterior egg clutches: harvest 2 eggs each (once per game)
      (ext.clutches || []).forEach((c, i) => {
        PF.use({
          pos: V3(c.x, c.y + 0.5, c.z),
          radius: 1.3,
          range: 2.8,
          label: "Shellback Egg Clutch",
          verb: () =>
            (PF.flag("sp_clutch") || []).indexOf(i) >= 0
              ? "Examine"
              : "Harvest",
          onInteract() {
            const got = (PF.flag("sp_clutch") || []).slice();
            if (got.indexOf(i) >= 0) {
              G.notify("Empty shells. Something already ate well here.");
              return;
            }
            got.push(i);
            PF.setFlag("sp_clutch", got);
            PF.inv.add("pf_shellback_egg", 2);
            PF.sfx("pickup");
            PF.sfx("shellback_click", V3(c.x, c.y, c.z), { volume: 0.7 });
          },
        });
      });
      // props & pickups
      PF.prop("safe", {
        x: int.captain_safe.x,
        y: int.captain_safe.y,
        z: int.captain_safe.z,
        yaw: HP,
        lock: SP_LOCKS.captain,
        items: [
          ["pf_old_salt", 1],
          ["ammo_12ga", 24],
          ["scrip", 180],
          ["gold_bar", 1],
        ],
        id: "pf_sp_captain_safe",
        name: "Captain's Safe",
      });
      PF.prop("footlocker", {
        x: int.berths.x - 3,
        y: 0 + int.berths.y,
        z: int.berths.z - 1.5,
        yaw: 0,
        loot: "footlocker",
        id: "pf_sp_seachest1",
        name: "Sea Chest",
      });
      PF.prop("footlocker", {
        x: int.fore.x + 1.5,
        y: int.fore.y,
        z: int.fore.z + 2.6,
        yaw: PI,
        loot: "footlocker",
        id: "pf_sp_seachest2",
        name: "Sea Chest",
      });
      PF.prop("crate", {
        x: int.hold_aft.x + 3,
        y: int.hold_aft.y,
        z: int.hold_aft.z - 3,
        kind: "plain",
        loot: "crate",
        id: "pf_sp_holdcrate",
      });
      PF.prop("ammo_box", {
        x: int.sail_locker.x + 2,
        y: int.sail_locker.y,
        z: int.sail_locker.z + 1.5,
        loot: "ammo_box",
        id: "pf_sp_ammo",
      });
      PF.prop("fridge", {
        x: int.cold_store.x - 1.5,
        y: int.cold_store.y,
        z: int.cold_store.z + 3.5,
        yaw: HP,
        loot: "cooler",
        id: "pf_sp_coldbox",
        name: "Walk-in Freezer Shelf",
      });
      PF.prop("cash_register", {
        x: int.market.x - 5,
        y: 1.05 + int.market.y,
        z: int.market.z - 4.5,
        yaw: PI,
        loot: "cash_register",
        id: "pf_sp_register",
      });
      PF.prop("footlocker", {
        x: int.dock.x - 1.5,
        y: int.dock.y,
        z: int.dock.z + 1.6,
        yaw: -HP,
        loot: "toolbox",
        id: "pf_sp_docktools",
        name: "Dock Toolbox",
      });
      PF.prop("footlocker", {
        x: ext.ambrose_locker.x,
        y: ext.ambrose_locker.y,
        z: ext.ambrose_locker.z,
        yaw: 0,
        loot: "ammo_box",
        id: "pf_sp_ambrose",
        name: "Lightship Locker",
      });
      PF.pickup("pf_reel_cal", 1, V3(int.cal.x, int.cal.y, int.cal.z));
      PF.pickup(
        "pf_note_captain",
        1,
        V3(int.captain_log.x, int.captain_log.y, int.captain_log.z),
      );
      PF.pickup(
        "pf_shellback_egg",
        2,
        V3(int.nest.x + 3.5, int.nest.y + 0.3, int.nest.z + 2.8),
      );
      PF.pickup(
        "rally_tonic",
        1,
        V3(int.cold_store.x + 1, int.cold_store.y + 0.05, int.cold_store.z - 3),
      );
      // NPCs: Lottie (friendly), the hatchery guardian + shellbacks aboard
      PF.npc({
        id: "pf_sp_lottie",
        type: "human",
        name: "Lottie Brennan",
        outfit: "survivor",
        gender: "f",
        faction: "settlers",
        level: 6,
        pos: { x: int.lottie.x, y: int.lottie.y, z: int.lottie.z },
        yaw: 0,
        ai: "guard",
        home: { x: int.lottie.x, z: int.lottie.z, r: 1.5 },
        dialogue: "pf_dlg_lottie",
        essential: true,
        voice: "settler",
        seed: 7101,
        weapon: "hunting_rifle",
        merchant: {
          scrip: 350,
          stock: [
            ["shellback_meat", 4],
            ["shellback_cakes", 3],
            ["ammo_12ga", 30],
            ["ammo_308", 20],
            ["scrap_metal", 6],
            ["purified_water", 4],
            ["rally_tonic", 1],
          ],
          restock: 3,
        },
        barks: [
          "Crabs don't knock. You knock. Good.",
          "Cal would've liked you.",
          "Mind the wet floor. And the dry floor. The floor in general.",
        ],
        after: (a) => {
          if (PF.flag("sp_market")) {
            const st = PF.anchorOf("seaport", "lottie_stall");
            if (st) {
              try {
                a.pos.set(st.x, st.y, st.z);
                a.home = { x: st.x, z: st.z, r: 2 };
              } catch (e) {
                /* ignore */
              }
            }
          }
        },
      });
      PF.npc({
        id: "pf_sp_barnacle",
        type: "shellback",
        name: "Old Barnacle",
        faction: "creatures",
        level: 11,
        pos: { x: int.boss.x, y: int.boss.y, z: int.boss.z },
        yaw: int.boss.yaw,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 6 },
        hp: 320,
        seed: 7102,
        xp: 120,
        after: (a) => {
          try {
            if (a.char && a.char.root) a.char.root.scale.setScalar(1.35);
          } catch (e) {
            /* cosmetic */
          }
        },
      });
      PF.npc({
        id: "pf_sp_lurk1",
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 6,
        pos: { x: int.spawn1.x, y: int.spawn1.y, z: int.spawn1.z },
        ai: "wander",
        home: { x: int.spawn1.x, z: int.spawn1.z, r: 6 },
        seed: 7103,
      });
      PF.npc({
        id: "pf_sp_lurk2",
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 6,
        pos: { x: int.spawn2.x, y: int.spawn2.y, z: int.spawn2.z },
        ai: "wander",
        home: { x: int.spawn2.x, z: int.spawn2.z, r: 5 },
        seed: 7104,
      });
      PF.npc({
        id: "pf_sp_lurk3",
        type: "shellback",
        name: "Softshell Shellback",
        faction: "creatures",
        level: 3,
        pos: { x: int.spawn3.x, y: int.spawn3.y, z: int.spawn3.z },
        ai: "wander",
        home: { x: int.spawn3.x, z: int.spawn3.z, r: 5 },
        seed: 7105,
      });
      // exterior: shellbacks on the Peking's deck and around the plaza nest
      PF.npc({
        id: "pf_sp_deck1",
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 5,
        pos: {
          x: ext.peking_deck.x + 5,
          y: ext.peking_deck.y,
          z: ext.peking_deck.z + 2.8,
        },
        ai: "wander",
        home: { x: ext.peking_deck.x + 5, z: ext.peking_deck.z + 2.8, r: 6 },
        seed: 7106,
      });
      PF.npc({
        id: "pf_sp_plaza1",
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 5,
        pos: { x: 214, y: 0, z: 705 },
        ai: "wander",
        home: { x: 214, z: 705, r: 10 },
        seed: 7107,
      });
    },
    40,
  );
