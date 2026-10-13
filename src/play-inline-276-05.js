// play-inline-276 05 — anchors
// Lines 1850-1885 of readable/play-inline-276.pretty.js (statement-aligned).
  P.addBuilder(
    "bellamys",
    function () {
      const E = buildExterior();
      const I = buildInterior();
      const ia = I.anchors,
        ea = E.anchors;
      E.door(
        XC,
        1.5,
        Z1 + 1.9,
        "Bellamy's",
        { x: ia.entrance.x, y: ia.entrance.y, z: ia.entrance.z, yaw: 0 },
        {
          radius: 1.8,
          id: "uw_bl_front",
          onEnter: () => P.safe("disc", () => G.discover("bellamys")),
        },
      );
      I.door(
        0,
        1.4,
        17.4,
        "59th Street",
        { x: ea.exterior_entrance.x, y: 0, z: ea.exterior_entrance.z, yaw: PI },
        { verb: "Exit", radius: 1.5, id: "uw_bl_front_in" },
      );
      P.register("bellamys", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "bellamys",
        anchors: Object.assign({}, E.anchors, I.anchors),
      });
    },
    30,
  );
