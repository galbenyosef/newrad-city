// play-inline-282 06 — door
// Lines 2527-2582 of readable/play-inline-282.pretty.js (statement-aligned).
  P.addBuilder(
    "ed_sullivan",
    () => {
      const E = buildExterior();
      const I = buildInterior();
      I.build({ interior: true, lod: 60 });
      P.addInterior("ed_sullivan", I.root);
      const O = P.I("ed_sullivan");
      // doors: main entrance (Eighth Avenue) + stage door (53rd Street) ⇄ interior
      E.door(
        X1 + 0.7,
        1.4,
        DOOR_Z,
        "Ed Sullivan Theater",
        { x: O.x + 34.4, y: O.y + LIFT + 0.05, z: O.z, yaw: HP },
        { id: "pt_es_main_in" },
      );
      E.door(
        STAGE_DOOR_X,
        1.2,
        Z1 + 0.5,
        "Ed Sullivan Theater — Stage Door",
        { x: O.x - 26, y: O.y + LIFT - 1.0 + 0.05, z: O.z + 14.4, yaw: 0 },
        { id: "pt_es_stage_in" },
      );
      // one-way: the stage door is bolted from inside until the player leaves that way (not a lock)
      const stageIn = P.barDoor(E.doors[E.doors.length - 1], {
        lockText: "Bolted from inside",
        message: "The stage door is bolted from the inside.",
      });
      I.door(
        35.6,
        1.4,
        0,
        "Eighth Avenue",
        { x: X1 + 2.6, y: 0.1, z: DOOR_Z, yaw: -HP },
        { verb: "Exit", id: "pt_es_main_out" },
      );
      I.door(
        -26,
        -1.0 + 1.2,
        15.5,
        "53rd Street",
        { x: STAGE_DOOR_X, y: 0.1, z: Z1 + 2.6, yaw: PI },
        { verb: "Exit", id: "pt_es_stage_out", onEnter: () => stageIn.unbar() },
      );
      P.register("ed_sullivan", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "ed_sullivan",
        anchors: Object.assign({}, E.anchors, I.anchors),
        name: "Ed Sullivan Theater",
      });
    },
    10,
  );
