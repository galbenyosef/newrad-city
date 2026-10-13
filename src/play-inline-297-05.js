// play-inline-297 05 — int
// Lines 1845-2029 of readable/play-inline-297.pretty.js (statement-aligned).
  PM.addBuilder(
    "algonquin",
    function (PM2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PM.cell("algonquin");
      const int = buildInterior(cell);
      const O = cell.origin;
      PM.door({
        id: "pm2_alg_enter",
        pos: V3((AX0 + AX1) / 2, 1.6, FZ + 0.2),
        label: "The Algonquin Hotel",
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
      PM.door({
        id: "pm2_alg_exit",
        pos: int.exit_door,
        label: "44th Street",
        verb: "Exit",
        radius: 1.4,
        target: { x: ext.door.x, y: 0.05, z: ext.door.z, yaw: PI },
        sound: "door_open",
      });
      // Room 207 (Matilda's hideout): Case's spare key
      PM.swingDoor({
        id: "pm2_alg_207",
        x: int.room207_door.x,
        y: int.room207_door.y,
        z: int.room207_door.z + 0.05,
        ry: 0,
        w: 1.2,
        h: 2.3,
        t: 0.08,
        key: "oak",
        lock: PM.LOCKS.alg_207,
        label: "Room 207",
        parent: cell.root,
        openAngle: 1.5,
      });
      // the rental room and the storeroom have ordinary doors
      PM.swingDoor({
        id: "pm2_alg_203",
        x: O.x - 0.3,
        y: O.y + F2,
        z: O.z - 1.25,
        ry: 0,
        w: 1.2,
        h: 2.3,
        key: "oak",
        label: "Room 203",
        parent: cell.root,
        openAngle: 1.5,
      });
      PM.swingDoor({
        id: "pm2_alg_204",
        x: O.x + 0.9,
        y: O.y + F2,
        z: O.z + 1.3,
        ry: PI,
        w: 1.2,
        h: 2.3,
        key: "oak",
        lock: PM.LOCKS.alg_204,
        label: "Room 204 — Storage (Rex Hadley)",
        parent: cell.root,
        openAngle: 1.5,
      });

      const all = Object.assign({}, int, {
        exterior_entrance: ext.door,
        guard1: ext.guard,
        guard2: ext.guard2,
      });
      all.npc1 = int.manager;
      all.npc2 = int.bartender;
      all.npc3 = int.seat_crane;
      all.npc4 = int.archivist;
      all.npc5 = int.doctor;
      all.npc6 = int.merchant;
      all.loot1 = int.store;
      all.loot2 = int.couple;
      all.loot3 = int.writer;
      // (friendly settlement — spawn anchors only used if something hostile is ever sent here)
      all.spawn1 = int.lobby;
      all.spawn2 = int.oakroom;
      all.spawn3 = int.table;
      all.spawn4 = int.corridor;
      all.spawn5 = int.library;
      all.spawn6 = int.rental;
      PM.register("algonquin", root, all, {
        interiorRoot: cell.root,
        interiorKey: "algonquin",
      });

      // containers & props
      PM.prop("cash_register", {
        x: O.x + 3.8,
        y: O.y + 1.16,
        z: O.z + 1.6,
        yaw: PI,
        loot: "cash_register",
        items: [["pm2_alg_key204", 1]],
        owner: "settlers",
        id: "pm2_alg_register",
        name: "Front Desk Register",
      });
      PM.prop("footlocker", {
        x: int.store.x - 1,
        y: int.store.y,
        z: int.store.z + 2.5,
        yaw: PI,
        loot: "crate",
        items: [["pm2_note_rex", 1]],
        owner: "settlers",
        id: "pm2_alg_store_crate",
        name: "Rex's Stock",
      });
      PM.prop("safe", {
        x: int.store.x + 1.2,
        y: int.store.y,
        z: int.store.z + 2.4,
        yaw: PI,
        locked: 0,
        lock: PM.LOCKS.alg_safe,
        loot: "wall_safe",
        owner: "settlers",
        id: "pm2_alg_store_safe",
        name: "Rex's Strongbox",
      });
      PM.prop("footlocker", {
        x: int.couple.x + 1.2,
        y: int.couple.y,
        z: int.couple.z - 3.4,
        yaw: 0,
        loot: "luggage",
        id: "pm2_alg_couple_trunk",
        name: "Steamer Trunk",
      });
      PM.prop("desk", {
        x: int.writer.x + 2.4,
        y: int.writer.y,
        z: int.writer.z + 1.9,
        yaw: -HP,
        loot: "desk",
        id: "pm2_alg_writer_desk",
        name: "Writing Desk",
      });
      PM.prop("first_aid", {
        x: int.doctor.x + 1.5,
        y: int.doctor.y + 1.2,
        z: int.doctor.z + 3.1,
        yaw: PI,
        loot: "medical_cabinet",
        owner: "settlers",
        id: "pm2_alg_clinic_cab",
        name: "Medicine Cabinet",
      });
      PM.prop("fridge", {
        x: O.x + 19.4,
        y: O.y,
        z: O.z + 9.3,
        yaw: -HP,
        loot: "cooler",
        owner: "settlers",
        id: "pm2_alg_bar_icebox",
        name: "Bar Icebox",
      });
      PM.prop("radio", {
        x: O.x + 17.2,
        y: O.y + 1.16,
        z: O.z + 7.9,
        yaw: -HP,
        id: "pm2_alg_radio",
        name: "Bar Radio",
      });
    },
    20,
  );
