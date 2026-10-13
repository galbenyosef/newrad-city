// play-inline-296 06 — int
// Lines 2473-2774 of readable/play-inline-296.pretty.js (statement-aligned).
  PM.addBuilder(
    "moma",
    function (PM2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PM.cell("moma");
      const int = buildInterior(cell);
      const O = cell.origin;
      // doors: street ↔ lobby; freight elevator dock ↔ storage
      PM.door({
        id: "pm2_moma_enter",
        pos: V3(162, 1.5, FZ - 1.4),
        label: "Museum of Modern Art",
        verb: "Enter",
        radius: 1.5,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      // fix the interior exit target now that the exterior anchor exists
      PM.door({
        id: "pm2_moma_exit",
        pos: V3(O.x, O.y + 1.4, O.z + 11.2),
        label: "53rd Street",
        verb: "Exit",
        radius: 1.4,
        target: { x: ext.door.x, y: 0.05, z: ext.door.z, yaw: PI },
        sound: "door_open",
      });
      PM.door({
        id: "pm2_moma_freight_up",
        pos: V3(O.x - 29.2, O.y + 1.4, O.z - 18),
        label: "Freight Elevator — Storage (3)",
        verb: "Ride",
        radius: 1.2,
        target: {
          x: int.storage_elevator.x + 0.6,
          y: int.storage_elevator.y + 0.05,
          z: int.storage_elevator.z,
          yaw: -HP,
        },
        sound: "door_open",
      });
      PM.door({
        id: "pm2_moma_freight_down",
        pos: V3(O.x - 29.2, O.y + F3 + 1.4, O.z - 18),
        label: "Freight Elevator — Loading Dock (1)",
        verb: "Ride",
        radius: 1.2,
        target: {
          x: int.dock_elevator.x + 0.6,
          y: int.dock_elevator.y + 0.05,
          z: int.dock_elevator.z,
          yaw: -HP,
        },
        sound: "door_open",
      });
      // Collection Storage door (the registrar's key — the Critic wears it — or the curators' teletype release)
      PM.swingDoor({
        id: "pm2_moma_storage",
        x: O.x - 22.3,
        y: O.y + F3,
        z: O.z - 5.0,
        ry: 0,
        w: 2.5,
        h: 3.1,
        t: 0.12,
        key: "vault_dark",
        lock: PM.LOCKS.moma_storage,
        label: "Collection Storage",
        parent: cell.root,
        slide: 2.4,
        openAngle: 1,
      });
      // exterior-side door to the garden from the dock is an opening (same cell) — nothing to add.
      const all = Object.assign({}, int, {
        exterior_entrance: ext.door,
        front: ext.front,
      });
      all.spawn1 = int.atrium;
      all.spawn2 = int.atomic;
      all.spawn3 = int.mezz;
      all.spawn4 = int.salon;
      all.spawn5 = int.design;
      all.spawn6 = int.garden;
      all.loot1 = int.storage_safe;
      all.loot2 = int.cafe;
      all.loot3 = int.offices;
      all.terminal = int.curator_terminal;
      PM.register("moma", root, all, {
        interiorRoot: cell.root,
        interiorKey: "moma",
      });

      // containers, terminal, pickups
      const Q = (a, dx, dy, dz) => ({
        x: a.x + (dx || 0),
        y: a.y + (dy || 0),
        z: a.z + (dz || 0),
      });
      PM.prop(
        "terminal",
        Object.assign(Q(int.curator_terminal, 0, 0, 0), {
          yaw: PI,
          terminalId: "pm2_term_moma_curator",
          id: "pm2_moma_term",
          name: "Curator's Terminal",
        }),
      );
      PM.prop(
        "safe",
        Object.assign(Q(int.storage_safe, 0.3, 0.9, 0), {
          yaw: -HP,
          locked: 0,
          lock: PM.LOCKS.moma_safe,
          items: [
            ["scrip", 180],
            ["old_dollars", 12],
            ["book_popular_circuits", 1],
            ["rally_tonic", 2],
          ],
          loot: "wall_safe",
          id: "pm2_moma_safe",
          name: "Registrar's Safe",
        }),
      );
      PM.prop(
        "footlocker",
        Object.assign(Q(int.storage, 3.5, 0, -9.5), {
          yaw: 0,
          loot: "weapon_crate",
          id: "pm2_moma_crate",
          name: "Art Handler's Crate",
        }),
      );
      PM.prop("cash_register", {
        x: O.x - 5.2,
        y: O.y + 1.16,
        z: O.z + 4.3,
        yaw: PI,
        loot: "cash_register",
        id: "pm2_moma_register",
        name: "Ticket Register",
      });
      PM.prop("fridge", {
        x: O.x + 22.8,
        y: O.y,
        z: O.z - 21.4,
        yaw: 0,
        loot: "fridge",
        id: "pm2_moma_fridge",
        name: "Café Fridge",
      });
      PM.prop("first_aid", {
        x: O.x + 11.8,
        y: O.y + 1.4,
        z: O.z + 3,
        yaw: -HP,
        loot: "first_aid",
        id: "pm2_moma_aid",
        name: "First Aid Box",
      });
      PM.prop("footlocker", {
        x: O.x + 26,
        y: O.y + F2,
        z: O.z + 9,
        yaw: -HP,
        loot: "raider_stash",
        id: "pm2_moma_salon_stash",
        name: "Critics' Stash",
      });
      PM.prop("footlocker", {
        x: O.x + 10.5,
        y: O.y,
        z: O.z + 0.4,
        yaw: PI,
        loot: "luggage",
        id: "pm2_moma_coats",
        name: "Lost & Found",
      });
      PM.prop("ammo_box", {
        x: O.x + 17,
        y: O.y + 0.9,
        z: O.z - 45,
        yaw: 0,
        loot: "ammo_box",
        id: "pm2_moma_garden_ammo",
        name: "Ammo Box",
      });
      PM.pickup(
        "pm2_nocturne",
        1,
        V3(int.nocturne.x, int.nocturne.y, int.nocturne.z),
      );
      PM.pickup("pm2_note_guard", 1, V3(O.x - 2.9, O.y + 0.05, O.z + 7.1));
      PM.pickup(
        "pm2_note_review",
        1,
        V3(O.x + 29.3, O.y + F2 + 0.05, O.z + 4.8),
      );
      PM.pickup(
        "pm2_reel_audio",
        1,
        V3(O.x - 29.3, O.y + F2 + 0.05, O.z - 17.4),
      );
      PM.pickup("rally_tonic", 1, V3(O.x - 17.7, O.y + F3 + 0.05, O.z + 8.2));

      // hostiles: the Critic (boss, garden) and his "fellow critics" (combat adds the location's generic spawns)
      const MUT = {
        type: "brute",
        faction: "brutes",
        hostile: true,
        ai: "guard",
        noRespawn: true,
      };
      const at = (a, dx, dz) => ({
        x: a.x + (dx || 0),
        y: a.y + 0.05,
        z: a.z + (dz || 0),
      });
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_critic",
          name: "The Critic",
          level: 12,
          hp: 460,
          dr: 10,
          pos: at(int.boss),
          yaw: 0,
          home: { x: int.boss.x, z: int.boss.z, r: 9 },
          weapon: "fire_axe",
          inventory: [
            ["pm2_critics_beret", 1],
            ["pm2_moma_key", 1],
            ["scrip", 60],
          ],
          when: () => !PM.flag("moma_critic_dead"),
          barks: [
            "CRITIC NOT IMPRESSED.",
            "YOU. STAND STILL. CRITIC MAKE YOU INTO ART.",
            "TOO MUCH SMOOTH. NOT ENOUGH SQUISH.",
            "HUMAN ART BAD. NEEDS MORE RED.",
            "ONE STAR!",
          ],
          onDeath: () => {
            PM.setFlag("moma_critic_dead", true);
            PM.news(
              'Word from Midtown: the Brute who called himself "The Critic" has given his final review at the Museum of Modern Art.',
            );
          },
        }),
      );
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_brush",
          name: "Brushstroke",
          level: 8,
          pos: at(int.salon, 1, 2),
          home: { x: int.salon.x, z: int.salon.z, r: 7 },
          barks: ["BRUSHSTROKE PAINT WITH YOU.", "RED IS BEST COLOUR."],
        }),
      );
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_easel",
          name: "Easel",
          level: 8,
          pos: at(int.design, -2, 1),
          home: { x: int.design.x, z: int.design.z, r: 7 },
          weapon: "hunting_rifle",
          barks: ["EASEL SEE YOU.", "CAR IS ART? CAR IS CAR."],
        }),
      );
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_docent",
          name: "Docent",
          level: 7,
          pos: at(int.atrium, 2, 0),
          home: { x: int.atrium.x, z: int.atrium.z, r: 10 },
          barks: [
            "WELCOME TO MUSEUM. YOU ARE EXHIBIT NOW.",
            "NO FLASH PHOTOGRAPHY!",
          ],
        }),
      );
      PM.npc(
        Object.assign({}, MUT, {
          id: "pm2_moma_gallerist",
          name: "Gallerist",
          level: 7,
          pos: at(int.garden, -6, -4),
          home: { x: int.garden.x - 6, z: int.garden.z - 4, r: 8 },
          barks: ["GALLERY CLOSED. FOREVER."],
        }),
      );
    },
    10,
  );
