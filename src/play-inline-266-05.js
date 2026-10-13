// play-inline-266 05 — prop
// Lines 1239-1329 of readable/play-inline-266.pretty.js (statement-aligned).
  function dressInterior(S) {
    const UY = 4.4;
    S.prop("terminal", -8.2, 0.78, 3.9, PI, {
      terminalId: "ues_gracie_mayor",
      mount: "bare",
    });
    S.prop("terminal", 13.9, 0.8, 11.9, -HP, {
      terminalId: "ues_gracie_rolls",
      mount: "bare",
    });
    S.prop("safe", -4.0, 1.1, 1.2, HP, {
      loot: "safe",
      locked: 0,
      lock: P.LOCKS.gracie_treasury,
      owner: "settlers",
      name: "City Treasury",
      items: [["scrip", 250]],
    });
    S.prop("file_cabinet", -11.5, 0, 6.3, -HP, {
      loot: "file_cabinet",
      owner: "settlers",
      name: "Municipal Records",
    });
    S.prop("first_aid", -11.8, UY + 1.3, 12.2, -HP, { owner: "settlers" });
    S.prop("fridge", 11.3, 0, 13.2, HP, {
      loot: "fridge",
      owner: "settlers",
      name: "Canteen Icebox",
    });
    S.prop("cash_register", 9.6, 1.12, 4.1, 0, { owner: "settlers" });
    S.pickup("ues_note_gracie_minutes", 1, -7.4, 0.8, 3.95);
    S.pickup("ues_reel_gracie_1967", 1, -9.9, 1.02, 10.3);
    S.pickup("purified_water", 2, 10.6, 1.12, 8.2);
  }

  P.addBuilder(
    "gracie_mansion",
    function () {
      const EX = buildExterior(),
        E = EX.S;
      const I = buildInterior();
      dressInterior(I);
      I.build({ interior: true });
      P.addInterior("gracie_mansion", I.root);
      const O = P.I("gracie_mansion");
      E.door(
        EX.doorX - 0.2,
        EX.FY + 1.3,
        EX.doorZ,
        "Gracie Mansion",
        { x: O.x, y: O.y, z: O.z + 12.4, yaw: 0 },
        {
          radius: 1.6,
          onEnter: () => P.safe("disc", () => G.discover("gracie_mansion")),
        },
      );
      I.door(
        0,
        1.4,
        13.75,
        "Carl Schurz Park",
        { x: EX.doorX - 4.4, y: 0, z: EX.doorZ + 1.5, yaw: HP },
        { verb: "Exit", radius: 1.4 },
      ); // just off the front steps, clear of the flagpole (300.5, -782)
      // back (river) door → the veranda
      I.door(
        0,
        1.4,
        0.25,
        "Veranda",
        { x: 320.9, y: EX.FY, z: EX.doorZ, yaw: -HP },
        { verb: "Exit", radius: 1.4 },
      );
      E.door(
        320.15,
        EX.FY + 1.3,
        EX.doorZ,
        "Gracie Mansion",
        { x: O.x, y: O.y, z: O.z + 1.6, yaw: PI },
        { radius: 1.4 },
      );
      P.register("gracie_mansion", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "gracie_mansion",
        anchors: Object.assign({}, E.anchors, I.anchors),
        noCombatBoss: true,
      });
    },
    30,
  );
