// play-inline-157 04 — anchors
// Lines 982-1011 of readable/play-inline-157.pretty.js (statement-aligned).
  P.interiorBuilders.carnegie_hall = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("carnegie_hall");
    E.door(
      EX.doorX,
      1.6,
      EX.doorZ + 0.8,
      "Carnegie Hall",
      { x: O.x, y: O.y, z: O.z + 28, yaw: 0 },
      {
        radius: 1.8,
        onEnter: () => P.safe("disc", () => G.discover("carnegie_hall")),
      },
    );
    I.door(
      0,
      1.5,
      29.6,
      "57th Street",
      { x: EX.doorX, y: 0, z: EX.doorZ + 3.2, yaw: PI },
      { verb: "Exit", radius: 1.6 },
    );
    P.register("carnegie_hall", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "carnegie_hall",
      anchors: Object.assign({}, E.anchors, I.anchors),
    });
  };
