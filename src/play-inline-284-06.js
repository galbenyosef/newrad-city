// play-inline-284 06 — root
// Lines 1592-1638 of readable/play-inline-284.pretty.js (statement-aligned).
  P.addBuilder(
    "port_authority",
    () => {
      const E = buildExterior();
      const I = buildInterior();
      I.build({ interior: true, lod: 60 });
      P.addInterior("port_authority", I.root);
      const O = P.I("port_authority");
      E.door(
        X1 + 0.8,
        1.5,
        DOOR_Z,
        "Port Authority Bus Terminal",
        { x: O.x + 28.4, y: O.y + LIFT + 0.05, z: O.z, yaw: HP },
        { id: "pt_pa_in" },
      );
      I.door(
        29.6,
        1.5,
        0,
        "Eighth Avenue",
        { x: X1 + 2.4, y: 0.1, z: DOOR_Z, yaw: -HP },
        { verb: "Exit", id: "pt_pa_out" },
      );
      P.register("port_authority", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "port_authority",
        anchors: Object.assign({}, E.anchors, I.anchors),
        name: "Port Authority Bus Terminal",
      });
      // irradiated seepage in the baggage room
      try {
        const O2 = O;
        G.world.addRadSource({
          x: O2.x + 26,
          y: O2.y + LIFT - 4.5,
          z: O2.z - 5.7,
          radius: 4,
          strength: 3,
        });
      } catch (e) {
        /* optional */
      }
    },
    30,
  );
