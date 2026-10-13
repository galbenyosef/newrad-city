// play-inline-264 06 — root
// Lines 2180-2218 of readable/play-inline-264.pretty.js (statement-aligned).
  P.addBuilder(
    "frick",
    function () {
      const EX = buildExterior(),
        E = EX.S;
      const I = buildInterior();
      buildBasement(I);
      dressInterior(I);
      I.build({ interior: true });
      P.addInterior("frick", I.root);
      const O = P.I("frick");
      E.door(
        EX.doorX,
        1.9,
        EX.doorZ + 0.3,
        "The Frick Collection",
        { x: O.x, y: O.y + LIFT, z: O.z + 21.8, yaw: 0 },
        {
          radius: 1.8,
          onEnter: () => P.safe("disc", () => G.discover("frick")),
        },
      );
      I.door(
        0,
        1.6,
        23.7,
        "Fifth Avenue",
        { x: EX.doorX, y: 0.46, z: EX.doorZ + 2.4, yaw: PI },
        { verb: "Exit", radius: 1.6 },
      );
      P.register("frick", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "frick",
        anchors: Object.assign({}, E.anchors, I.anchors),
      });
    },
    10,
  );
