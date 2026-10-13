// play-inline-283 06 — root
// Lines 1729-1762 of readable/play-inline-283.pretty.js (statement-aligned).
  P.addBuilder(
    "lyceum_theatre",
    () => {
      const E = buildExterior();
      const I = buildInterior();
      I.build({ interior: true, lod: 60 });
      P.addInterior("lyceum_theatre", I.root);
      const O = P.I("lyceum_theatre");
      E.door(
        DOOR_X,
        1.5,
        Z1 + 0.9,
        "Lyceum Theatre",
        { x: O.x, y: O.y + LIFT + 0.05, z: O.z + 28.4, yaw: 0 },
        { id: "pt_ly_in" },
      );
      I.door(
        0,
        1.5,
        29.7,
        "West 45th Street",
        { x: DOOR_X, y: 0.1, z: Z1 + 3.2, yaw: PI },
        { verb: "Exit", id: "pt_ly_out" },
      );
      P.register("lyceum_theatre", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "lyceum_theatre",
        anchors: Object.assign({}, E.anchors, I.anchors),
        name: "Lyceum Theatre",
      });
    },
    20,
  );
