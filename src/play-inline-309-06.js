// play-inline-309 06 — root
// Lines 1501-1557 of readable/play-inline-309.pretty.js (statement-aligned).
  P.addBuilder(
    "new_york_life",
    function () {
      const EX = buildExterior(),
        ES = EX.S;
      const I = buildInterior();
      const O = P.I("new_york_life");
      P.addInterior("new_york_life", I.root);
      NL.extRoot = ES.root;
      ES.door(
        EX.doorX,
        1.6,
        EX.doorZ + 0.5,
        "New York Life Building",
        { x: O.x, y: O.y, z: O.z + 17.8, yaw: 0 },
        {
          id: "pe_nyl_front",
          radius: 2.0,
          onEnter: () => P.safe("disc", () => G.discover("new_york_life")),
        },
      );
      I.door(
        0,
        1.6,
        19.6,
        "23rd Street",
        { x: EX.doorX, y: 0, z: EX.doorZ + 2.8, yaw: PI },
        { id: "pe_nyl_front_in", verb: "Exit", radius: 1.8 },
      );
      // maintenance lift: attic → lobby (always); lobby → attic only once ridden down (80_content locks it)
      NL.liftDown = I.door(
        NL.liftTopLocal.x,
        NL.liftTopLocal.y,
        NL.liftTopLocal.z,
        "Maintenance Lift (Lobby)",
        {
          x: O.x + NL.liftBottomLocal.x - 1.0,
          y: O.y,
          z: O.z + NL.liftBottomLocal.z,
          yaw: HP,
        },
        {
          id: "pe_nyl_lift_down",
          verb: "Ride",
          radius: 1.3,
          sound: "door_open",
        },
      );
      P.register("new_york_life", {
        root: ES.root,
        interiorRoot: I.root,
        interiorKey: "new_york_life",
        anchors: Object.assign({}, ES.anchors, I.anchors),
      });
    },
    30,
  );
