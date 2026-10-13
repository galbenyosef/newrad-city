// play-inline-307 06 — root
// Lines 1812-1866 of readable/play-inline-307.pretty.js (statement-aligned).
  P.addBuilder(
    "tudor_city",
    function () {
      const EX = buildExterior(),
        ES = EX.S;
      const I = buildInterior();
      const O = P.I("tudor_city");
      P.addInterior("tudor_city", I.root);
      TC.extRoot = ES.root;
      ES.door(
        EX.doorX - 0.2,
        TY + 1.6,
        EX.doorZ,
        "Tudor Tower",
        { x: O.x, y: O.y, z: O.z + 16.2, yaw: 0 },
        {
          id: "pe_tc_front",
          radius: 1.8,
          onEnter: () => P.safe("disc", () => G.discover("tudor_city")),
        },
      );
      I.door(
        0,
        1.5,
        17.7,
        "Tudor City Terrace",
        { x: EX.doorX - 2.4, y: TY, z: EX.doorZ, yaw: HP },
        { id: "pe_tc_front_in", verb: "Exit", radius: 1.8 },
      );
      // penthouse ⇄ the real roof (with the neon sign)
      I.door(
        TC.roofHatchLocal.x,
        TC.roofHatchLocal.y,
        TC.roofHatchLocal.z,
        "Roof (the Tudor City sign)",
        { x: 316.2, y: ATOP, z: -168, yaw: 0 },
        { id: "pe_tc_roof_in", verb: "Climb to", radius: 1.4 },
      );
      ES.door(
        EX.roofDoor.x,
        EX.roofDoor.y,
        EX.roofDoor.z,
        "Tudor Tower — Penthouse",
        { x: O.x - 20.7, y: O.y + F3, z: O.z - 12.2, yaw: PI },
        { id: "pe_tc_roof", radius: 1.4 },
      );
      P.register("tudor_city", {
        root: ES.root,
        interiorRoot: I.root,
        interiorKey: "tudor_city",
        anchors: Object.assign({}, ES.anchors, I.anchors),
      });
    },
    20,
  );
