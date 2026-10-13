// play-inline-373 04 — anchors
// Lines 2176-2234 of readable/play-inline-373.pretty.js (statement-aligned).
  P.interiorBuilders.club_52 = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("club_52");
    E.door(
      EX.DOOR_X,
      1.5,
      EX.FZ + 0.25,
      '"52" Club',
      { x: O.x, y: O.y, z: O.z + 23.3, yaw: 0 },
      {
        radius: 1.6,
        onEnter: () => P.safe("disc", () => G.discover("club_52")),
      },
    );
    const ea = E.anchors.exterior_entrance,
      ha = E.anchors.cellar_hatch;
    I.door(
      0,
      1.4,
      24.65,
      EX.street || "42nd Street",
      { x: ea.x, y: 0, z: ea.z + 0.1, yaw: PI },
      { verb: "Exit", radius: 1.5 },
    );
    // No. 19's sidewalk hatch: barred from below until you come up that way
    const hatch = P.barDoor(
      E.door(
        EX.HATCH_X,
        0.6,
        EX.FZ + 1.2,
        "Cellar Hatch",
        { x: O.x + 27.4, y: O.y, z: O.z + 3.2, yaw: 0 },
        { id: "m3_club52_hatch", radius: 1.3, verb: "Open" },
      ),
      {
        lockText: "Bolted from below",
        message: "The steel doors are bolted from below.",
        unbarMessage:
          "You shove back the bolts and heave the hatch doors open.",
      },
    );
    I.door(
      27.4,
      1.9,
      4.0,
      "Sidewalk Hatch",
      { x: ha.x, y: 0, z: ha.z, yaw: PI },
      { verb: "Climb Out", radius: 1.3, onEnter: () => hatch.unbar() },
    );
    P.club52Doors = { hatch };
    P.register("club_52", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "club_52",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { hatch },
    });
  };
