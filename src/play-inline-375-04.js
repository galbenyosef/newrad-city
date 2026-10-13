// play-inline-375 04 — the
// Lines 1761-1856 of readable/play-inline-375.pretty.js (statement-aligned).
  P.interiorBuilders.helmsley = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("helmsley");
    const W = (x, y, z, yaw) => ({ x: O.x + x, y: O.y + y, z: O.z + z, yaw });
    E.door(
      EX.LOBBY_X,
      1.6,
      EX.SZ + 0.45,
      "New York Central Building",
      W(0, 0, 29.6, 0),
      {
        radius: 2.0,
        onEnter: () => P.safe("disc", () => G.discover("helmsley")),
      },
    );
    // the lobby doors open onto the cross street in this layout (47th St), not Park Avenue: ask the layout for its name
    const street =
      P.safe("street", () => G.LAYOUT.streetNameAt(EX.LOBBY_X, EX.SZ + 9)) ||
      "47th Street";
    I.door(
      0,
      1.6,
      31.0,
      street,
      { x: EX.LOBBY_X, y: 0, z: EX.SZ + 1.8, yaw: PI },
      { verb: "Exit", radius: 1.6 },
    );
    // express elevator F3 <-> crown (powered: the Continuity keep it running)
    I.door(
      -11.6,
      F3 + 1.5,
      -2,
      "Express Elevator — Crown",
      W(0, CRY, -5.4, PI),
      { verb: "Ride", radius: 1.5, sound: "door_open" },
    );
    I.door(
      0,
      CRY + 1.5,
      -6.6,
      "Express Elevator — 3rd Floor",
      W(-10.6, F3, -2, -HP),
      { verb: "Ride", radius: 1.5 },
    );
    // crown terrace (exterior, ~100 m up) <-> relay room
    I.door(
      0,
      CRY + 1.4,
      6.6,
      "Crown Terrace",
      { x: 242.2, y: EX.CY, z: EX.TZ1 - 1.0, yaw: -HP },
      { verb: "Go Out", radius: 1.4, sound: "door_open" },
    );
    E.door(240, EX.CY + 1.3, EX.DZ1 + 0.1, "Relay Room", W(2.6, CRY, 5.2, 0), {
      radius: 1.3,
    }); // beside the relay console (x ±1.6), not facing into it
    // freight elevator relay room -> lobby (the way back down); from the lobby it needs the relay unlocked
    const fr = I.door(
      -8.6,
      CRY + 1.5,
      0,
      "Freight Elevator — Lobby",
      W(-5.25, 0, -4.2, PI),
      { verb: "Ride", radius: 1.5 },
    );
    // one-way: the car is parked at the crown until the player rides it down from there (not a lock)
    const fl = P.barDoor(
      I.door(
        -5.25,
        1.5,
        -5.6,
        "Freight Elevator — Crown",
        W(-7.6, CRY, 0, -HP),
        { id: "m3_helms_freight", verb: "Ride", radius: 1.4 },
      ),
      {
        lockText: "Called from the crown only",
        message:
          "The freight car is parked at the top. The call button is dead.",
      },
    );
    const frOpen = fr.onInteract;
    fr.onInteract = function () {
      fl.unbar(true);
      frOpen.call(this);
    };
    P.helmsDoors = { freightLobby: fl };
    P.register("helmsley", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "helmsley",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { freight: fl },
    });
  };
