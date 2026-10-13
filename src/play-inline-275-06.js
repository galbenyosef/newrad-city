// play-inline-275 06 — door
// Lines 1483-1582 of readable/play-inline-275.pretty.js (statement-aligned).
  P.addBuilder(
    "san_remo",
    function () {
      const E = buildExterior();
      const I = buildInterior();
      const O = P.I("san_remo");
      const ia = I.anchors,
        ea = E.anchors;
      E.door(
        X1 + 1.1,
        1.5,
        ZC,
        "The San Remo",
        { x: ia.entrance.x, y: ia.entrance.y, z: ia.entrance.z, yaw: 0 },
        {
          radius: 1.6,
          id: "uw_sr_front",
          onEnter: () => P.safe("disc", () => G.discover("san_remo")),
        },
      );
      I.door(
        0,
        1.4,
        15.8,
        "Central Park West",
        {
          x: ea.exterior_entrance.x,
          y: 0,
          z: ea.exterior_entrance.z,
          yaw: -HP,
        },
        { verb: "Exit", radius: 1.4, id: "uw_sr_front_in" },
      );
      I.door(
        -2.2,
        1.4,
        -5.6,
        "Elevator — Penthouse Commune",
        {
          x: ia.penthouse_arrive.x,
          y: ia.penthouse_arrive.y,
          z: ia.penthouse_arrive.z,
          yaw: 0,
        },
        {
          verb: "Ride",
          radius: 1.4,
          id: "uw_sr_elev_up",
          sound: "hum_electric",
        },
      );
      I.door(
        0,
        PY + 1.4,
        21.6,
        "Elevator — Lobby",
        { x: ia.elevator_lobby.x, y: 0, z: ia.elevator_lobby.z, yaw: PI },
        {
          verb: "Ride",
          radius: 1.4,
          id: "uw_sr_elev_down",
          sound: "hum_electric",
        },
      );
      I.door(
        20.3,
        PY + 4 + 1.3,
        -10.5,
        "North Tower — Lookout",
        {
          x: ea.tower_arrive.x,
          y: ea.tower_arrive.y,
          z: ea.tower_arrive.z,
          yaw: PI,
        },
        { radius: 1.3, id: "uw_sr_tower_up" },
      );
      E.door(
        ea.tower_hatch.x,
        ea.tower_hatch.y + 0.6,
        ea.tower_hatch.z,
        "Hatch — Commune Stair",
        {
          x: ia.tower_stair_top.x,
          y: ia.tower_stair_top.y,
          z: ia.tower_stair_top.z,
          yaw: -HP,
        },
        { verb: "Climb Down", radius: 1.3, id: "uw_sr_tower_down" },
      );
      P.register("san_remo", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "san_remo",
        anchors: Object.assign({}, E.anchors, I.anchors),
      });
      void O;
    },
    20,
  );
