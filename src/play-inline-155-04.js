// play-inline-155 04 — math
// Lines 805-874 of readable/play-inline-155.pretty.js (statement-aligned).
  function colCorinth(S, x, y, z, h) {
    const b = S.b;
    b.box("marble_dark", x - 0.55, y, z - 0.55, x + 0.55, y + 0.5, z + 0.55, {
      seg: false,
    });
    b.cyl("marble", x, y + 0.5, z, 0.36, 0.42, h - 1.4, 16, { hSeg: 3 });
    b.cyl("gold", x, y + h - 0.9, z, 0.55, 0.38, 0.6, 12);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      b.box(
        "gold",
        x + Math.cos(a) * 0.45 - 0.06,
        y + h - 0.95,
        z + Math.sin(a) * 0.45 - 0.06,
        x + Math.cos(a) * 0.45 + 0.06,
        y + h - 0.45,
        z + Math.sin(a) * 0.45 + 0.06,
        { seg: false, ry: a },
      );
    }
    b.box(
      "marble",
      x - 0.65,
      y + h - 0.3,
      z - 0.65,
      x + 0.65,
      y + h,
      z + 0.65,
      { seg: false },
    );
    S.col(x - 0.45, y, z - 0.45, x + 0.45, y + h, z + 0.45, {
      walkable: false,
    });
  }
  P.colCorinth = colCorinth;

  // ===================================================================
  // Street <-> interior doors & registration — called by 30_plaza.js's builder right
  // after buildExterior() (E = its site context).
  // ===================================================================
  P.interiorBuilders.plaza_hotel = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("plaza_hotel");
    E.door(
      97.1,
      2.6,
      EX.DOOR_Z,
      "The Plaza Hotel",
      { x: O.x, y: O.y, z: O.z + 31.5, yaw: 0 },
      {
        radius: 1.6,
        onEnter: () => P.safe("disc", () => G.discover("plaza_hotel")),
      },
    );
    I.door(
      0,
      1.5,
      34.2,
      "Fifth Avenue",
      { x: 100.5, y: 0, z: EX.DOOR_Z, yaw: -HP },
      { verb: "Exit", radius: 1.6 },
    );
    P.register("plaza_hotel", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "plaza_hotel",
      anchors: Object.assign({}, E.anchors, I.anchors),
    });
  };
