// play-inline-274 06 — anchors
// Lines 2525-2581 of readable/play-inline-274.pretty.js (statement-aligned).
  P.addBuilder(
    "ansonia",
    function () {
      const E = buildExterior();
      const I = buildInterior();
      const O = P.I("ansonia");
      const iw = (n) => I.anchors[n];
      const ent = iw("entrance"),
        roofIn = iw("roof_access");
      const ext = E.anchors.exterior_entrance,
        roof = E.anchors.roof_door;
      E.door(
        X1 + 1.2,
        1.4,
        ZC,
        "The Ansonia",
        { x: ent.x, y: ent.y, z: ent.z, yaw: HP },
        {
          radius: 1.6,
          id: "uw_ans_front",
          onEnter: () => P.safe("disc", () => G.discover("ansonia")),
        },
      );
      I.door(
        29.6,
        1.4,
        0,
        "Central Park West",
        { x: ext.x + 1.4, y: 0, z: ext.z, yaw: -HP },
        { verb: "Exit", radius: 1.4, id: "uw_ans_front_in" },
      );
      I.door(
        8.6,
        13.5 + 1.3,
        0,
        "Roof — Stokes Farm",
        { x: roof.x, y: roof.y, z: roof.z, yaw: 0 },
        { radius: 1.1, id: "uw_ans_roof_up" },
      );
      E.door(
        XC,
        DECK + 1.2,
        Z1 - 11.1,
        "The Ansonia — Stairwell",
        { x: roofIn.x, y: roofIn.y, z: roofIn.z, yaw: HP },
        { radius: 1.3, id: "uw_ans_roof_down" },
      );
      P.register("ansonia", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "ansonia",
        anchors: Object.assign({}, E.anchors, I.anchors),
      });
      void O;
    },
    10,
  );
