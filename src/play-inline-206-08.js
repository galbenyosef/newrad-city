// play-inline-206 08 — int
// Lines 3910-4217 of readable/play-inline-206.pretty.js (statement-aligned).
  PF.addBuilder(
    "federal_reserve",
    function (PF2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PF.cell("federal_reserve");
      const int = buildInterior(cell, ext);
      PF.door({
        id: "pf_fed_enter",
        pos: V3(80, 1.6, BZ0 - 0.9),
        label: "Federal Reserve Bank",
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
      const all = Object.assign({}, int, {
        exterior_entrance: ext.entrance,
        turret1: ext.turret1,
        turret2: ext.turret2,
      });
      all.loot2 = int.b3;
      all.loot3 = PF.anchor(
        int.office.x + 3.5,
        int.office.y,
        int.office.z - 2,
        0,
      );
      PF.register("federal_reserve", root, all, {
        interiorRoot: cell.root,
        interiorKey: "federal_reserve",
      });

      // enter the building → quest
      const c = cell.origin;
      PF.trigger(
        { x0: c.x - 20, x1: c.x + 20, z0: c.z - 5, z1: c.z + 30 },
        () => {
          PF.q.advance("pf_gold", ["meet", "enter"], "power");
        },
        {
          cond: () =>
            PF.q.active("pf_gold") &&
            ["meet", "enter"].indexOf(PF.q.stage("pf_gold")) >= 0,
        },
      );

      // turrets (robots faction): perimeter pair + checkpoint + Level V corridor
      for (const [a, grp, id] of [
        [ext.turret1, "pf_fed_security", "pf_fed_t1"],
        [ext.turret2, "pf_fed_security", "pf_fed_t2"],
        [int.turret_cp, "pf_fed_security", "pf_fed_t3"],
        [int.turret_vault, "pf_fed_vault", "pf_fed_t4"],
      ]) {
        PF.prop("turret", {
          x: a.x,
          y: a.y,
          z: a.z,
          yaw: a.yaw,
          faction: "robots",
          hostile: true,
          terminalId: grp,
          id,
          hp: 120,
          damage: 6,
          range: 32,
        });
      }
      // terminals, containers, notes, unique
      PF.prop("terminal", {
        x: int.sec_terminal.x,
        y: int.sec_terminal.y,
        z: int.sec_terminal.z,
        yaw: 0,
        terminalId: "pf_fed_security",
        id: "pf_fed_term_sec",
      });
      PF.prop("terminal", {
        x: int.vault_terminal.x,
        y: int.vault_terminal.y,
        z: int.vault_terminal.z - 0.35,
        yaw: 0,
        terminalId: "pf_fed_vault",
        id: "pf_fed_term_vault",
        mount: "bare",
      });
      PF.prop("terminal", {
        x: int.office_terminal.x,
        y: int.office_terminal.y,
        z: int.office_terminal.z,
        yaw: 0,
        terminalId: "pf_fed_office",
        id: "pf_fed_term_office",
      });
      PF.prop("locker", {
        x: int.sec_lockers.x,
        y: int.sec_lockers.y,
        z: int.sec_lockers.z,
        yaw: -HP,
        loot: "locker",
        id: "pf_fed_locker1",
      });
      PF.prop("ammo_box", {
        x: int.loot1.x,
        y: int.loot1.y,
        z: int.loot1.z,
        yaw: PI,
        loot: "ammo_box",
        id: "pf_fed_ammo1",
      });
      PF.prop("safe", {
        x: int.barracks_safe.x,
        y: int.barracks_safe.y + 0.9,
        z: int.barracks_safe.z,
        yaw: HP,
        lock: FED_LOCKS.barracks,
        items: [
          ["pf_fed_override", 1],
          ["scrip", 120],
          ["rally_tonic", 2],
        ],
        id: "pf_fed_barracks_safe",
        name: "Sergeant's Safe",
      });
      PF.prop("footlocker", {
        x: int.barracks.x - 3.3,
        y: int.barracks.y,
        z: int.barracks.z - 5,
        yaw: HP,
        loot: "footlocker",
        id: "pf_fed_foot1",
      });
      PF.prop("footlocker", {
        x: int.barracks.x - 3.3,
        y: int.barracks.y,
        z: int.barracks.z - 1.8,
        yaw: HP,
        loot: "weapon_crate",
        id: "pf_fed_foot2",
      });
      PF.prop("safe", {
        x: int.office_safe.x,
        y: int.office_safe.y,
        z: int.office_safe.z,
        yaw: -HP,
        lock: FED_LOCKS.officeSafe,
        items: [
          ["gold_bar", 4],
          ["scrip", 300],
          ["old_dollars", 12],
          ["pf_fed_reserve_key", 1],
        ],
        id: "pf_fed_office_safe",
        name: "Vault Manager's Safe",
      });
      PF.prop("file_cabinet", {
        x: int.chief.x - 5.6,
        y: int.chief.y,
        z: int.chief.z + 6.4,
        yaw: HP,
        loot: "file_cabinet",
        id: "pf_fed_files",
      });
      PF.prop("first_aid", {
        x: int.control.x + 3.2,
        y: int.control.y + 1.4,
        z: int.control.z + 4,
        yaw: -HP,
        id: "pf_fed_firstaid",
      });
      PF.prop("crate", {
        x: int.b3.x - 1,
        y: int.b3.y,
        z: int.b3.z + 3,
        kind: "army",
        loot: "ammo_box",
        id: "pf_fed_b3crate",
      });
      PF.pickup(
        "pf_fed_keycard",
        1,
        V3(int.chief.x + 0.4, int.chief.y + 0.08, int.chief.z + 0.3),
      );
      PF.pickup(
        "pf_note_chief",
        1,
        V3(int.sec_desk.x - 0.4, int.sec_desk.y + 0.02, int.sec_desk.z),
      );
      PF.pickup(
        "pf_reel_heist",
        1,
        V3(
          int.antechamber.x - 4.6,
          int.antechamber.y + 0.1,
          int.antechamber.z - 1.5,
        ),
      );
      PF.pickup(
        "pf_note_manager",
        1,
        V3(int.ledger.x - 1.0, int.ledger.y, int.ledger.z + 0.1),
      );
      PF.pickup(
        "pf_reserve_ledger",
        1,
        V3(int.ledger.x, int.ledger.y, int.ledger.z),
      );
      PF.pickup(
        "pf_whitlock_ring",
        1,
        V3(int.ledger.x + 0.75, int.ledger.y, int.ledger.z + 0.25),
      );
      PF.pickup(
        "pf_gold_standard",
        1,
        V3(int.pistol.x, int.pistol.y + 0.05, int.pistol.z),
      );
      // lootable bullion crates inside the open compartments
      const O = cell.origin,
        oy = O.y + BASE + VY;
      for (const c of PF.fedComps || []) {
        const sp = PF.fedSpecial[c.num];
        if (!sp) continue;
        PF.prop("footlocker", {
          x: O.x + c.front - c.dir * 0.75,
          y: oy,
          z: O.z + c.zc + 0.2,
          yaw: c.dir > 0 ? -HP : HP,
          lock: sp.lock || undefined,
          items: [["gold_bar", sp.n]],
          id: "pf_fed_comp_" + c.num,
          name: sp.name,
        });
        if (c.num === 26)
          PF.codeReadable(
            V3(O.x + c.front + c.dir * 0.1, oy + 1.3, O.z + c.zc + 0.9),
            "Brass Tag on Cage 026",
            "CMPT 026 · 4 BARS · CRATE COMB. 2604 · CHECKED 03/03/67",
            sp.lock.id,
          );
      }
      // named robots on Level V (the ground floor is populated by combat's location spawns)
      PF.npc({
        id: "pf_fed_warden",
        type: "bulwark",
        name: "Vault Sentinel",
        faction: "robots",
        level: 12,
        pos: { x: int.boss.x, y: int.boss.y, z: int.boss.z },
        yaw: int.boss.yaw,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 7 },
        seed: 5201,
        loot: "bulwark",
        xp: 200,
        barks: [
          "HALT. THIS VAULT IS CLOSED FOR THE WEEKEND.",
          "YOUR WITHDRAWAL HAS BEEN DECLINED.",
          "INSUFFICIENT FUNDS. INSUFFICIENT LIFE.",
        ],
        after: (a) => {
          if (PF.flag("fed_warden_off")) wardenOff();
        },
      });
      PF.npc({
        id: "pf_fed_guard1",
        type: "patrolman",
        name: "Vault Guard Patrolman",
        faction: "robots",
        level: 9,
        pos: { x: int.spawn4.x, y: int.spawn4.y, z: int.spawn4.z },
        ai: "guard",
        home: { x: int.spawn4.x, z: int.spawn4.z, r: 4 },
        seed: 5202,
      });
      PF.npc({
        id: "pf_fed_guard2",
        type: "patrolman",
        name: "Vault Guard Patrolman",
        faction: "robots",
        level: 9,
        pos: { x: int.spawn5.x, y: int.spawn5.y, z: int.spawn5.z },
        ai: "guard",
        home: { x: int.spawn5.x, z: int.spawn5.z, r: 3 },
        seed: 5203,
      });
      PF.npc({
        id: "pf_fed_handy",
        type: "valet",
        name: "Valet-M (Bullion Detail)",
        faction: "robots",
        level: 10,
        pos: { x: int.vault.x, y: int.vault.y, z: int.vault.z - 8 },
        ai: "wander",
        home: { x: int.vault.x, z: int.vault.z - 8, r: 12 },
        seed: 5204,
        barks: [
          "Keep your hands where I can see them, sport!",
          "Gold is a MANDATORY no-touch zone!",
        ],
      });
    },
    20,
  );
