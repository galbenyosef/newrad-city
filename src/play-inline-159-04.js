// play-inline-159 04 — door
// Lines 774-831 of readable/play-inline-159.pretty.js (statement-aligned).
  P.interiorBuilders.tiffany = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("tiffany");
    E.door(
      EX.X0 - 0.6,
      1.6,
      EX.DZ,
      "Tiffany & Co.",
      { x: O.x, y: O.y + FLOOR_Y, z: O.z + 27.6, yaw: 0 },
      {
        radius: 1.8,
        onEnter: () => P.safe("disc", () => G.discover("tiffany")),
      },
    );
    I.door(
      0,
      1.5,
      29.6,
      "Fifth Avenue",
      { x: EX.X0 - 3.4, y: 0, z: EX.DZ, yaw: HP },
      { verb: "Exit", radius: 1.6 },
    );
    // service entrance: barred from inside until you leave that way
    const svc = P.barDoor(
      E.door(
        149.5,
        1.4,
        -373.7,
        "Tiffany & Co. — Service Entrance",
        { x: O.x + 18.4, y: O.y + FLOOR_Y - 5, z: O.z - 10.8, yaw: HP },
        { id: "pu_tiffany_service", radius: 1.3 },
      ),
      {
        message: "The service door is bolted from the inside.",
        lockText: "Bolted from the inside",
        unbarMessage: "You slide back the bolts on the service door.",
      },
    );
    I.door(
      19.6,
      -5 + 1.4,
      -10.8,
      "57th Street",
      { x: 149.5, y: 0, z: -371.0, yaw: PI },
      { verb: "Exit", radius: 1.3, onEnter: () => svc.unbar() },
    );
    // exterior service door visual
    const b = E.b;
    void b;
    P.register("tiffany", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "tiffany",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { svc },
    });
  };
