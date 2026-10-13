// play-inline-245 05 — int
// Lines 2733-3009 of readable/play-inline-245.pretty.js (statement-aligned).
  PR.addBuilder(
    "roosevelt_octagon",
    function (PR2, site, root) {
      const ext = buildExterior(root);
      const cell = PR.cell("roosevelt_octagon");
      const int = buildInterior(cell, ext);
      PR.door({
        id: "pr_oct_enter",
        pos: V3(C.x - APO - 0.4, 1.9, C.z),
        label: "The Octagon",
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
      PR.register("roosevelt_octagon", root, all, {
        interiorRoot: cell.root,
        interiorKey: "roosevelt_octagon",
      });
      PR.octAnchors = int;
      const Pp = (a, dy) => ({
        x: a.x,
        y: a.y + (dy || 0),
        z: a.z,
        yaw: a.yaw || 0,
      });
      // terminals, containers, notes, tape reels, unique
      PR.prop(
        "terminal",
        Object.assign(Pp(int.nurse_terminal), {
          terminalId: "pr_oct_nurse",
          id: "pr_oct_term_nurse",
        }),
      );
      PR.prop(
        "terminal",
        Object.assign(Pp(int.office_terminal), {
          terminalId: "pr_oct_harrow",
          id: "pr_oct_term_harrow",
          mount: "bare",
        }),
      );
      PR.prop(
        "first_aid",
        Object.assign(Pp(int.nurse_aid), {
          id: "pr_oct_aid",
          loot: "first_aid",
        }),
      );
      PR.prop(
        "locker",
        Object.assign(Pp(int.hydro_locker), {
          id: "pr_oct_hlocker",
          loot: "locker",
        }),
      );
      PR.prop("footlocker", {
        x: int.ward_bed.x + 1.2,
        y: int.ward_bed.y,
        z: int.ward_bed.z + 1.4,
        yaw: HP,
        id: "pr_oct_foot1",
        loot: "footlocker",
      });
      PR.prop(
        "safe",
        Object.assign(Pp(int.office_safe), {
          id: "pr_oct_osafe",
          locked: 0,
          lock: PR.LOCKS.oct_office_safe,
          name: "Superintendent's Safe",
          items: [
            ["scrip", 85],
            ["focus_pills", 2],
            ["morphine_syrette", 1],
            ["pr_note_harrow_letter", 1],
          ],
        }),
      );
      PR.prop("file_cabinet", {
        x: int.records.x - 5.9,
        y: int.records.y,
        z: int.records.z + 5,
        yaw: HP,
        id: "pr_oct_files1",
        loot: "file_cabinet",
      });
      PR.prop("file_cabinet", {
        x: int.records.x + 5.9,
        y: int.records.y,
        z: int.records.z - 4,
        yaw: -HP,
        id: "pr_oct_files2",
        loot: "file_cabinet",
      });
      PR.prop(
        "footlocker",
        Object.assign(Pp(int.cell6), {
          id: "pr_oct_cell6_stash",
          name: "Patient's Hoard",
          locked: 0,
          items: [
            ["rally_tonic", 3],
            ["prussian_blue", 2],
            ["scrip", 60],
            ["scrap_metal", 4],
            ["ammo_10mm", 24],
          ],
        }),
      );
      PR.prop(
        "first_aid",
        Object.assign(Pp(int.treatment_cabinet), {
          id: "pr_oct_tcab",
          loot: "medical_cabinet",
        }),
      );
      PR.prop(
        "safe",
        Object.assign(Pp(int.dome_safe), {
          id: "pr_oct_dsafe",
          locked: 0,
          lock: PR.LOCKS.oct_dome_safe,
          name: "Superintendent's Strongbox",
          items: [
            ["scrip", 140],
            ["rally_tonic", 2],
            ["rally_tonic_extra", 1],
            ["old_dollars", 6],
          ],
        }),
      );
      PR.prop("ammo_box", {
        x: int.dome.x - 1,
        y: int.dome.y,
        z: int.dome.z + 2.5,
        yaw: -HP,
        id: "pr_oct_ammo",
        loot: "ammo_box",
      });
      PR.pickup(
        "pr_note_admission",
        1,
        V3(
          int.admissions.x + 0.6,
          int.admissions.y + 0.01,
          int.admissions.z + 0.1,
        ),
      );
      PR.pickup(
        "pr_reel_nell1",
        1,
        V3(int.ward_bed.x + 0.2, int.ward_bed.y + 0.05, int.ward_bed.z + 1.2),
      );
      PR.pickup(
        "pr_oct_office_key",
        1,
        V3(int.nurse_desk.x, int.nurse_desk.y + 0.01, int.nurse_desk.z),
      );
      PR.pickup(
        "pr_note_hydro",
        1,
        V3(int.hydro.x + 5.2, 0.98, int.hydro.z + 9),
      );
      PR.pickup(
        "pr_orbitoclast",
        1,
        V3(int.orbitoclast.x, int.orbitoclast.y, int.orbitoclast.z),
      );
      PR.pickup(
        "pr_reel_nell2",
        1,
        V3(int.lodge_tape.x, int.lodge_tape.y, int.lodge_tape.z),
      );
      PR.pickup(
        "pr_reel_nell3",
        1,
        V3(int.treatment_tape.x, int.treatment_tape.y, int.treatment_tape.z),
      );
      PR.pickup(
        "pr_note_harrow_final",
        1,
        V3(int.dome_bag.x, int.dome_bag.y, int.dome_bag.z),
      );
      PR.pickup(
        "pr_oct_master_key",
        1,
        V3(int.dome_bag.x + 0.4, int.dome_bag.y, int.dome_bag.z + 0.5),
      );
      // the office door (locked, key from the night-nurse station)
      PR.gate({
        x: int.office.x,
        y: int.office.y,
        z: int.office.z + 3.55,
        w: 2.2,
        h: 2.8,
        ry: 0,
        flag: "oct_office",
        label: "Superintendent's Office",
        lock: PR.LOCKS.oct_office,
        parent: cell.root,
        bars: false,
        key: "oak",
      });
      // the Superintendent (named Maniac Bruiser) + a few Maniacs placed by hand (combat adds the location's spawns)
      PR.npc({
        id: "pr_oct_harrow",
        type: "maniac_bruiser",
        name: "The Superintendent",
        faction: "maniacs",
        level: 10,
        pos: Pp(int.boss),
        yaw: int.boss.yaw,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 6 },
        seed: 1839,
        loot: "maniac_bruiser",
        xp: 150,
        noRespawn: true,
        barks: [
          "[a long, dragging moan that rises at the end like a question]",
          "[he hums the same three notes, round and round]",
          "[a scream that might once have been a patient's name]",
        ],
      });
      PR.npc({
        id: "pr_oct_maniac1",
        type: "maniac",
        name: "Maniac Patient",
        faction: "maniacs",
        level: 6,
        pos: Pp(int.ward),
        ai: "wander",
        home: { x: int.ward.x, z: int.ward.z, r: 8 },
        seed: 1840,
      });
      PR.npc({
        id: "pr_oct_maniac2",
        type: "maniac",
        name: "Maniac Orderly",
        faction: "maniacs",
        level: 7,
        pos: Pp(int.dayroom),
        ai: "wander",
        home: { x: int.dayroom.x, z: int.dayroom.z, r: 7 },
        seed: 1841,
      });
      PR.npc({
        id: "pr_oct_maniac3",
        type: "maniac",
        name: "Maniac Patient",
        faction: "maniacs",
        level: 6,
        pos: Pp(int.lodge),
        ai: "wander",
        home: { x: int.lodge.x, z: int.lodge.z, r: 8 },
        seed: 1842,
      });
      PR.npc({
        id: "pr_oct_maniac4",
        type: "maniac",
        name: "Maniac Nurse",
        faction: "maniacs",
        level: 7,
        pos: Pp(int.treatment),
        ai: "wander",
        home: { x: int.treatment.x, z: int.treatment.z, r: 6 },
        seed: 1843,
      });
    },
    10,
  );
