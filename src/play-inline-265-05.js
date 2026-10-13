// play-inline-265 05 — info
// Lines 1588-1710 of readable/play-inline-265.pretty.js (statement-aligned).
  function dressInterior(S, info) {
    const BY = info.BY,
      UY = info.UY;
    S.prop("terminal", 13.3, UY + 0.78, 15.2, -HP, {
      terminalId: "ues_coop_decorator",
      mount: "bare",
    });
    S.prop("safe", 8.6, UY, 18.4, -HP, {
      loot: "safe",
      locked: 0,
      lock: P.LOCKS.coop_safe,
      name: "Carnegie's Safe",
      items: [
        ["ues_streamliner", 1],
        ["scrip", 180],
      ],
    });
    S.prop("footlocker", 19.6, UY, 24.8, 0, {
      loot: "raider_stash",
      name: "The Decorator's Footlocker",
    });
    S.prop("footlocker", -23.2, UY, 24.8, -HP, { loot: "footlocker" });
    S.prop("footlocker", -12.8, UY, 25.0, 0, { loot: "footlocker" });
    S.prop("ammo_box", -19.8, 0, 25.2, 0, { loot: "ammo_box" });
    S.prop("first_aid", -8.4, 1.4, 20.6, HP, {});
    S.prop("toolbox", 24.5, BY, info.CZ0 + 12, HP, { loot: "toolbox" });
    S.prop("file_cabinet", 21.5, 0, 5.2, HP, {
      loot: "file_cabinet",
      name: "Registrar's Cabinet",
    });
    S.prop("workbench", -10, 0, 25.3, 0, {});
    S.prop("radio", 12.4, 0.8, 18.6, 0, {});
    S.pickup("ues_note_coop_curator", 1, -12.2, 1.02, 13.9);
    S.pickup("ues_reel_coop_carnegie", 1, 13.4, UY + 0.79, 14.6);
    S.pickup("ues_note_coop_ransom", 1, 12.6, BY + 0.05, info.CZ0 + 6);
    S.pickup("rush", 1, -18.2, 0.92, 21.6);
    S.pickup("rage", 1, -16.6, 0.92, 21.8);
    S.pickup("rally_tonic", 1, 21.2, UY + 0.02, 24.6);
  }

  P.addBuilder(
    "cooper_hewitt",
    function () {
      const EX = buildExterior(),
        E = EX.S;
      const info = buildInterior(),
        I = info.S;
      dressInterior(I, info);
      I.build({ interior: true });
      P.addInterior("cooper_hewitt", I.root);
      const O = P.I("cooper_hewitt"),
        OY = O.y + LIFT;
      E.door(
        EX.doorX - 0.2,
        EX.B0 + 1.5,
        EX.doorZ,
        "Carnegie Mansion",
        { x: O.x, y: OY, z: O.z + 24.8, yaw: 0 },
        {
          radius: 1.8,
          onEnter: () => P.safe("disc", () => G.discover("cooper_hewitt")),
        },
      );
      I.door(
        0,
        1.5,
        26.7,
        "Fifth Avenue",
        { x: EX.doorX - 3.8, y: 0, z: EX.doorZ, yaw: HP },
        { verb: "Exit", radius: 1.6 },
      );
      // cellar hatch (back yard) ↔ coal cellar — a way out that skips the house
      const hatch = P.barDoor(
        E.door(
          EX.cellar.x,
          0.6,
          EX.cellar.z,
          "Carnegie Mansion — Coal Cellar",
          { x: info.hatchW.x, y: info.hatchW.y, z: info.hatchW.z, yaw: HP },
          { radius: 1.6, id: "ues_coop_hatch_out" },
        ),
        {
          lockText: "Bolted from below",
          message: "The cellar hatch is bolted from below.",
          unbarMessage: "You leave the cellar hatch unbolted behind you.",
        },
      );
      I.door(
        info.hatch.x,
        info.hatch.y,
        info.hatch.z,
        "Back Yard",
        { x: EX.cellar.x + 2.3, y: 0, z: EX.cellar.z, yaw: -HP },
        { verb: "Exit", radius: 1.5, onEnter: () => hatch.unbar() },
      );
      // Otis elevator between the Great Hall and the gallery (a shortcut)
      const up = I.anchors.elevator_up,
        dn = I.anchors.elevator_down;
      I.door(
        6.4 - 1.05,
        1.5,
        20.4 - 1.05,
        "Otis Elevator (Up)",
        { x: up.x, y: up.y, z: up.z, yaw: up.yaw },
        { verb: "Ride", radius: 1.0, sound: "door_open" },
      );
      I.door(
        6.4 - 1.05,
        6.0 + 1.5,
        20.4 - 1.9,
        "Otis Elevator (Down)",
        { x: dn.x, y: dn.y, z: dn.z, yaw: dn.yaw },
        { verb: "Ride", radius: 1.0, sound: "door_open" },
      );
      P.register("cooper_hewitt", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "cooper_hewitt",
        anchors: Object.assign({}, E.anchors, I.anchors),
      });
    },
    20,
  );
