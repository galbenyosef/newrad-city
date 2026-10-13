// play-inline-246 05 — int
// Lines 1553-1725 of readable/play-inline-246.pretty.js (statement-aligned).
  PR.addBuilder(
    "smallpox_hospital",
    function (PR2, site, root) {
      const ext = buildExterior(root);
      const cell = PR.cell("smallpox_hospital");
      const int = buildInterior(cell, ext);
      PR.door({
        id: "pr_ren_enter",
        pos: V3(PV.x0 - 0.5, 1.9, DOOR.z),
        label: "Renwick Smallpox Hospital",
        verb: "Enter",
        radius: 1.6,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: -HP,
        },
      });
      const all = Object.assign({}, int, { exterior_entrance: ext.entrance });
      PR.register("smallpox_hospital", root, all, {
        interiorRoot: cell.root,
        interiorKey: "smallpox_hospital",
      });
      PR.renAnchors = int;
      const Pp = (a, dy) => ({
        x: a.x,
        y: a.y + (dy || 0),
        z: a.z,
        yaw: a.yaw || 0,
      });
      PR.prop(
        "terminal",
        Object.assign(Pp(int.nurse_terminal), {
          terminalId: "pr_ren_nurse",
          id: "pr_ren_term_nurse",
          mount: "bare",
        }),
      );
      PR.prop(
        "terminal",
        Object.assign(Pp(int.morgue_terminal), {
          terminalId: "pr_ren_morgue",
          id: "pr_ren_term_morgue",
          mount: "bare",
        }),
      );
      PR.prop(
        "terminal",
        Object.assign(Pp(int.lab_terminal), {
          terminalId: "pr_ren_lab",
          id: "pr_ren_term_lab",
          mount: "bare",
        }),
      );
      PR.prop(
        "locker",
        Object.assign(Pp(int.nurse_locker), {
          id: "pr_ren_nlocker",
          name: "Nurse Pell's Locker",
          items: [
            ["pr_ren_quarantine_key", 1],
            ["rally_tonic", 1],
            ["iodine_tabs", 1],
            ["pr_note_ren_nurse", 1],
          ],
        }),
      );
      PR.prop(
        "footlocker",
        Object.assign(Pp(int.cell_loot), {
          id: "pr_ren_cellfoot",
          loot: "footlocker",
        }),
      );
      PR.prop(
        "locker",
        Object.assign(Pp(int.lab_locker), {
          id: "pr_ren_lablocker",
          locked: 0,
          lock: PR.LOCKS.ren_lab_locker,
          name: "Hazard Suit Locker",
          items: [
            ["pr_ren_gasmask", 1],
            ["prussian_blue", 2],
            ["iodine_tabs", 2],
            ["rally_tonic", 2],
            ["ammo_gyrojet", 12],
          ],
        }),
      );
      PR.prop(
        "first_aid",
        Object.assign(Pp(int.loot4, 1.2), {
          id: "pr_ren_aid",
          loot: "medical_cabinet",
        }),
      );
      PR.prop("ammo_box", {
        x: int.hall.x - 1.5,
        y: int.hall.y,
        z: int.hall.z - 3,
        yaw: 0,
        id: "pr_ren_ammo",
        loot: "ammo_box",
      });
      PR.pickup(
        "pr_note_renwick_orders",
        1,
        V3(int.hall.x - 1.5, int.hall.y + 1.02, int.hall.z - 3.8),
      );
      PR.pickup(
        "pr_reel_variola",
        1,
        V3(int.morgue.x + 3.5, int.morgue.y + 1.28, int.morgue.z + 1.8),
      );
      PR.pickup(
        "pr_kagent_sample",
        1,
        V3(int.sample.x, int.sample.y, int.sample.z),
      );
      PR.npc({
        id: "pr_ren_matron",
        type: "lurcher",
        name: "The Matron",
        faction: "creatures",
        level: 10,
        pos: Pp(int.boss),
        yaw: 0,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 6 },
        seed: 1856,
        hp: 260,
        xp: 180,
        noRespawn: true,
        variant: 2,
      });
      PR.npc({
        id: "pr_ren_centaur1",
        type: "lurcher",
        name: "Lurcher",
        faction: "creatures",
        level: 7,
        pos: Pp(int.cellar),
        ai: "wander",
        home: { x: int.cellar.x, z: int.cellar.z, r: 6 },
        seed: 1857,
      });
      PR.npc({
        id: "pr_ren_centaur2",
        type: "lurcher",
        name: "Lurcher",
        faction: "creatures",
        level: 7,
        pos: Pp(int.ward),
        ai: "wander",
        home: { x: int.ward.x, z: int.ward.z, r: 6 },
        seed: 1858,
      });
      PR.npc({
        id: "pr_ren_roach1",
        type: "giant_roach",
        name: "Giant roach",
        faction: "creatures",
        level: 3,
        pos: Pp(int.iso_room),
        ai: "wander",
        home: { x: int.iso_room.x, z: int.iso_room.z, r: 4 },
        seed: 1859,
      });
    },
    20,
  );
