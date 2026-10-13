// play-inline-268 05 — info
// Lines 1656-1783 of readable/play-inline-268.pretty.js (statement-aligned).
  function dressInterior(S, info) {
    const BY = info.BY,
      UY = info.UY,
      DZ0 = info.DZ0;
    S.prop("terminal", -15, UY + 0.8, 20.9, 0, {
      terminalId: "ues_armory_orders",
      mount: "bare",
    });
    S.prop("terminal", -33.5, BY + 1.05, 14.3, PI, {
      terminalId: "ues_armory_range",
      mount: "bare",
    });
    S.prop("ammo_box", 26, 0, DZ0 + 3, 0, {
      loot: "weapon_crate",
      name: "Seventh Regiment Weapons Locker",
      items: [
        ["assault_rifle", 1],
        ["ammo_556", 120],
        ["frag_grenade", 4],
        ["missile_launcher", 1],
        ["ammo_missile", 4],
      ],
    });
    S.prop("ammo_box", 30, 0, DZ0 + 3, 0, {
      loot: "ammo_box",
      name: "Ammunition Crate",
    });
    S.prop("ammo_box", 34, 0, DZ0 + 3, 0, {
      loot: "ammo_box",
      name: "Ammunition Crate",
    });
    S.prop("footlocker", -12, UY, 29.3, 0, {
      loot: "raider_boss",
      locked: 0,
      lock: P.LOCKS.armory_footlocker,
      name: "Major Callahan's Footlocker",
    });
    S.prop("safe", -23.7, UY + 1.2, 16, -HP, {
      loot: "safe",
      locked: 0,
      lock: P.LOCKS.armory_safe,
      name: "Regimental Safe",
    });
    S.prop("ammo_box", -1, 0, 20.2, 0, { loot: "ammo_box" });
    S.prop("first_aid", -39.7, BY + 1.3, 26, -HP, { loot: "first_aid" });
    S.prop("locker", -39.3, BY, 12, -HP, { loot: "locker" });
    S.prop("toolbox", 19.8, 0.9, 22.6, PI, { loot: "toolbox" });
    S.prop("workbench", 15, 0, 28.8, 0, {});
    S.prop("footlocker", 22.8, UY, 25.2, HP, { loot: "footlocker" });
    S.prop("crate", -33, 0, -44, 0.3, {
      loot: "raider_stash",
      kind: "army",
      name: "Seventh Supply Crate",
    });
    S.prop("radio", -17.2, UY + 0.85, 21.3, 0, {});
    S.pickup("ues_note_armory_orders", 1, -13.8, UY + 0.83, 21.6);
    S.pickup("ues_reel_armory_1977", 1, -35.5, BY + 1.07, 14.4);
    S.pickup("ues_voting_machine", 1, 19.5, UY + 0.82, 21);
    S.pickup("ues_painting_francis", 1, -8.8, UY + 0.02, 22);
    S.pickup("ues_note_armory_moss", 1, -3.5, 0.95, -18.5);
    S.pickup("ues_key_armory_cage", 1, -11.0, UY + 0.84, 22.8); // on the Major's desk in the Board of Officers Room
    S.pickup("ammo_10mm", 24, -1.2, 0.95, 20.2);
  }

  P.addBuilder(
    "park_ave_armory",
    function () {
      const EX = buildExterior(),
        E = EX.S;
      const info = buildInterior(),
        I = info.S;
      dressInterior(I, info);
      I.build({ interior: true });
      P.addInterior("park_ave_armory", I.root);
      const O = P.I("park_ave_armory"),
        OY = O.y + LIFT;
      E.door(
        EX.doorX - 0.2,
        1.8,
        EX.doorZ,
        "Park Avenue Armory",
        { x: O.x, y: OY, z: O.z + 27.6, yaw: 0 },
        {
          radius: 2.2,
          onEnter: () => P.safe("disc", () => G.discover("park_ave_armory")),
        },
      );
      I.door(
        0,
        1.8,
        29.6,
        "Park Avenue",
        { x: EX.doorX - 1.8, y: 0, z: EX.doorZ, yaw: HP },
        { verb: "Exit", radius: 1.8 },
      );
      // the cache cage gate (the key lies on Major Callahan's desk upstairs)
      I.door(
        info.CX0 + 3,
        1.4,
        info.CZ1 + 0.3,
        "Regimental Armoury",
        { x: O.x + info.CX0 + 3, y: OY, z: O.z + info.CZ1 - 1.2, yaw: 0 },
        {
          verb: "Open",
          radius: 1.3,
          lock: P.lockReg(P.LOCKS.armory_cage),
          id: "ues_armory_cage_in",
          sound: "door_open",
        },
      );
      I.door(
        info.CX0 + 3,
        1.4,
        info.CZ1 - 1.0,
        "Drill Hall",
        { x: O.x + info.CX0 + 3, y: OY, z: O.z + info.CZ1 + 1.4, yaw: PI },
        { verb: "Leave", radius: 1.0 },
      );
      P.register("park_ave_armory", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "park_ave_armory",
        anchors: Object.assign({}, E.anchors, I.anchors),
        noCombatBoss: true,
      });
    },
    40,
  );
