// play-inline-258 05 — int
// Lines 1100-1473 of readable/play-inline-258.pretty.js (statement-aligned).
  PF.addBuilder(
    KEY,
    function (PF2, site, root) {
      const ext = PF.buildManhattanExterior(root);
      const cell = PF.cell(KEY);
      const int = buildInterior(cell);
      PF.door({
        id: "pbr_mb_in",
        pos: V3(ext.anchorage_door.x, 1.5, 587.2),
        label: "Manhattan Bridge Anchorage",
        verb: "Enter",
        radius: 1.6,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_mb_out",
        pos: W(0, 1.5, 21.4),
        label: "Canal Street",
        verb: "Exit",
        radius: 1.5,
        target: {
          x: ext.anchorage_door.x,
          y: 0.05,
          z: ext.anchorage_door.z,
          yaw: PI,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_mb_deck_in",
        pos: V3(290.4, 21.3, 583),
        label: "South Cable Housing",
        verb: "Enter",
        radius: 1.3,
        target: {
          x: int.deck_door.x - 1.0,
          y: int.deck_door.y + 0.05,
          z: int.deck_door.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_mb_deck_out",
        pos: W(24.0, 21.3, 11.4),
        label: "Manhattan Bridge — Deck",
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

      const all = Object.assign({}, int, {
        exterior_entrance: ext.anchorage_door,
        plaza: ext.plaza,
        arch: ext.arch,
        deck_mid: ext.deck_mid,
        deck_hatch: ext.deck_hatch,
        brooklyn_foot: ext.brooklyn_foot,
      });
      PF.register(KEY, root, all, {
        interiorRoot: cell.root,
        interiorKey: KEY,
      });

      // cages: interact at the door side (east face)
      for (const c of [int.cage1, int.cage2]) {
        PF.use({
          pos: V3(c.x + 1.3, c.y + 1.2, c.z),
          radius: 0.9,
          range: 2.4,
          label: "Cage",
          verb: () => (PF.flag("mb_freed") ? "Empty" : "Unlock"),
          locked: () =>
            PF.flag("mb_freed") ||
            PF.inv.count("pbr_mb_cagekey") > 0 ||
            PF.lockIsOpen(PF.LOCKS.mb_cage.id)
              ? null
              : "Padlocked",
          enabled: () => !PF.flag("mb_freed"),
          onInteract() {
            PF.mbOpenCage();
          },
        });
      }
      // removable cage-door colliders
      const doors = [];
      const closeDoors = () => {
        if (doors.length) return;
        for (const c of [int.cage1, int.cage2])
          doors.push(
            PF.col(c.x + 1.25, c.z, 0.2, 2.5, c.y - 0.1, c.y + 2.6, 0, {
              walkable: false,
              surface: "metal",
            }),
          );
      };
      const openDoors = () => {
        for (const d of doors.splice(0)) {
          try {
            G.world.removeCollider(d);
          } catch (e) {
            /* core */
          }
        }
      };
      closeDoors();
      PF.flagWatch.push((k) => {
        if (k === "*" || k === "mb_freed") {
          if (PF.flag("mb_freed")) openDoors();
          else closeDoors();
        }
      });
      PF.onReset.push(() => closeDoors());

      // props & pickups
      PF.prop("terminal", {
        x: int.terminal.x,
        y: int.terminal.y,
        z: int.terminal.z,
        yaw: -HP,
        terminalId: "pbr_mb_inspect",
        id: "pbr_mb_term",
      });
      PF.prop("footlocker", {
        x: int.loot3.x,
        y: int.loot3.y,
        z: int.loot3.z,
        yaw: PI,
        locked: 0,
        lock: PF.LOCKS.mb_hoard,
        items: [
          ["pbr_blue_steel", 1],
          ["scrip", 160],
          ["ammo_12ga", 18],
          ["rage", 1],
          ["frag_grenade", 2],
        ],
        id: "pbr_mb_hoard",
        name: "Ironjaw's Hoard",
      });
      PF.prop("footlocker", {
        x: int.loot1.x,
        y: int.loot1.y,
        z: int.loot1.z,
        yaw: HP,
        loot: "raider_stash",
        id: "pbr_mb_trophy1",
        name: "Wagon Strongbox",
      });
      PF.prop("ammo_box", {
        x: int.loot2.x,
        y: int.loot2.y,
        z: int.loot2.z,
        loot: "ammo_box",
        id: "pbr_mb_trophy2",
      });
      PF.prop("locker", {
        x: int.loot4.x,
        y: int.loot4.y,
        z: int.loot4.z,
        yaw: -HP,
        loot: "locker",
        id: "pbr_mb_locker",
        name: "Inspector's Locker",
      });
      PF.prop("first_aid", {
        x: O.x + 24.1,
        y: O.y + 1.6,
        z: O.z + 7.8,
        yaw: -HP,
        loot: "first_aid",
        id: "pbr_mb_firstaid",
      });
      PF.pickup("pbr_note_menu", 1, W(-22.8, 0.98, -10.2));
      PF.pickup("pbr_reel_conductor", 1, V3(336.9, 20.05, 572.1));
      PF.pickup("rally_tonic", 1, W(-16.5, 0.05, 9.4));
      PF.pickup("ammo_10mm", 24, W(-24.4, 0.05, 8.2));
      PF.pickup("focus_pills", 1, W(3.8, -5.95, -44.9));

      // NPCs: Ironjaw (boss) + named Brutes; the captives; Tomas's later market stall
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      PF.npc({
        id: "pbr_mb_ironjaw",
        type: "brute",
        name: "Ironjaw",
        faction: "brutes",
        level: 11,
        pos: pos(int.boss),
        yaw: 0,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 7 },
        hp: 460,
        dr: 8,
        weapon: "fire_axe",
        seed: 6101,
        xp: 150,
        inventory: [
          ["pbr_mb_cagekey", 1],
          ["scrip", 45],
        ],
        barks: [
          "BIG DAY SOON!",
          "IRONJAW EAT GOOD TONIGHT!",
          "YOU NOT ON MENU. YOU ARE MENU.",
        ],
        after: (a) => {
          try {
            if (a.char && a.char.root) a.char.root.scale.setScalar(1.22);
          } catch (e) {
            /* cosmetic */
          }
        },
      });
      PF.npc({
        id: "pbr_mb_gristle",
        type: "brute",
        name: "Gristle",
        faction: "brutes",
        level: 8,
        pos: pos(int.larder),
        yaw: HP,
        ai: "guard",
        home: { x: int.larder.x, z: int.larder.z, r: 4 },
        weapon: "lead_pipe",
        seed: 6102,
        barks: ["Skinny one talk too much. Tenderize!"],
      });
      PF.npc({
        id: "pbr_mb_lookout",
        type: "brute",
        name: "Brute Lookout",
        faction: "brutes",
        level: 8,
        pos: pos(int.spawn3),
        yaw: HP,
        ai: "guard",
        home: { x: int.spawn3.x, z: int.spawn3.z, r: 3 },
        weapon: "hunting_rifle",
        seed: 6103,
      });
      PF.npc({
        id: "pbr_mb_door1",
        type: "brute",
        name: "Brute",
        faction: "brutes",
        level: 7,
        pos: pos(ext.guard1),
        yaw: PI,
        ai: "guard",
        home: { x: ext.guard1.x, z: ext.guard1.z, r: 6 },
        weapon: "assault_rifle",
        seed: 6104,
      });
      PF.npc({
        id: "pbr_mb_tomas",
        type: "human",
        name: "Tomas Ybarra",
        outfit: "merchant",
        gender: "m",
        skinTone: 0.55,
        faction: "settlers",
        hostile: false,
        level: 5,
        pos: pos(int.cage1),
        yaw: -HP,
        ai: "static",
        home: { x: int.cage1.x, z: int.cage1.z, r: 0.3 },
        dialogue: "pbr_dlg_tomas_cage",
        essential: true,
        voice: "settler",
        seed: 6110,
        barks: [
          "Psst! Over here!",
          "I can pay! Eventually!",
          "Big Day is NOT a holiday.",
        ],
        when: () => !PF.flag("mb_freed"),
      });
      PF.npc({
        id: "pbr_mb_minh",
        type: "human",
        name: "Minh Dao",
        outfit: "drifter",
        gender: "f",
        skinTone: 0.4,
        faction: "settlers",
        hostile: false,
        level: 5,
        pos: pos(int.cage2),
        yaw: -HP,
        ai: "static",
        home: { x: int.cage2.x, z: int.cage2.z, r: 0.3 },
        dialogue: "pbr_dlg_minh_cage",
        essential: true,
        voice: "settler",
        seed: 6111,
        barks: ["Get. Us. OUT.", "Come closer, big ugly. I dare you."],
        when: () => !PF.flag("mb_freed"),
      });
      const tp = PF.anchor(7400 + 10.5, BASE, 800 + 5.2, PI); // Bridgemarket, south aisle by the scrap stall
      PF.npc({
        id: "pbr_mb_tomas_market",
        type: "human",
        name: "Tomas Ybarra",
        outfit: "merchant",
        gender: "m",
        skinTone: 0.55,
        faction: "settlers",
        level: 5,
        pos: pos(tp),
        yaw: PI,
        ai: "merchant",
        home: { x: tp.x, z: tp.z, r: 1.2 },
        dialogue: "pbr_dlg_tomas_market",
        essential: true,
        voice: "settler",
        seed: 6112,
        merchant: {
          scrip: 380,
          stock: [
            ["ox_steak", 3],
            ["purified_water", 5],
            ["rally_tonic", 2],
            ["ammo_556", 30],
            ["ammo_10mm", 40],
            ["assault_rifle", 1],
            ["biker_leathers", 1],
            ["scrap_electronics", 3],
          ],
          restock: 3,
        },
        barks: [
          "Canal Street Trade wagon Company! Slightly chewed, fully open!",
          "Never again under that arch. Never again.",
        ],
        when: () =>
          !!PF.flag("mb_freed") ||
          (PF.q.active("pbr_anchor") && PF.q.stage("pbr_anchor") === "report"),
      });

      // entering the vaults: the quest finds its target; a warning bark
      PF.trigger(
        {
          x0: O.x - 30,
          x1: O.x + 30,
          y0: O.y - 2,
          y1: O.y + 30,
          z0: O.z - 20,
          z1: O.z + 23,
        },
        () => {
          if (PF.q.active("pbr_anchor"))
            PF.q.advance("pbr_anchor", ["find"], "free");
          G.notify(
            "The anchorage stinks of smoke and meat. Somewhere to the west, someone is whispering for help.",
          );
        },
        { cond: () => !PF.flag("mb_freed") },
      );
    },
    20,
  );
