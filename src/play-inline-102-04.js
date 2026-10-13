// play-inline-102 04 — tally
// Lines 1242-1355 of readable/play-inline-102.pretty.js (statement-aligned).
  M.buildSubway = function () {
    const L = G.LAYOUT;
    const I = L.INTERIORS && L.INTERIORS.subway;
    if (I) S = I.origin;
    if (M.buildSubwayEntrances) M.buildSubwayEntrances(); // street stairwells (60_subway.js)
    M.pushXF(M.mtx(S.x, S.y || 0, S.z, 0));
    buildInterior();
    M.popXF();
    const W = {};
    for (const k in A)
      W[k] = new THREE.Vector3(
        S.x + A[k][0],
        (S.y || 0) + A[k][1],
        S.z + A[k][2],
      );
    M.anchors.subway = W;
    // doors: each street entrance → mezzanine; the mezzanine exit returns to the entrance the player came
    // down (the exit target is re-aimed on every entry; after a load inside the station it is the first one)
    const e0 = M.subwayEntrances[0];
    const exitTarget = {
      x: e0.outside.x,
      y: e0.outside.y,
      z: e0.outside.z,
      yaw: -Math.PI / 2,
    };
    for (const e of M.subwayEntrances) {
      G.world.addDoor({
        pos: e.door,
        label: "42nd Street Subway",
        verb: "Enter",
        radius: 1.3,
        target: {
          x: W.arrival.x,
          y: W.arrival.y,
          z: W.arrival.z,
          yaw: Math.PI,
        },
        sound: "door_open",
        onEnter: () => {
          exitTarget.x = e.outside.x;
          exitTarget.y = e.outside.y;
          exitTarget.z = e.outside.z;
        },
      });
    }
    G.world.addDoor({
      pos: new THREE.Vector3(W.arrival.x, W.arrival.y + 1.2, W.arrival.z - 1.2),
      label: "42nd Street (Times Square)",
      verb: "Exit to",
      radius: 1.6,
      target: exitTarget,
      sound: "door_open",
    });
    // entrance anchors on the street
    M.anchors.subway.entrance = e0.outside.clone();
  };

  // -------------------------------------------------------------------
  // Token booth safe (G.locks). The interior runtime spawns the booth safe at anchor 'booth' and should give it
  // `lock: M.SUBWAY_BOOTH_LOCK`; the code is on the token clerk's tally card on the mezzanine floor (learn on pickup).
  // -------------------------------------------------------------------
  M.SUBWAY_BOOTH_LOCK = {
    id: "map_subway_booth_safe",
    label: "Times Sq – 42 St token booth safe",
    code: "1904",
    hint: "The token clerk's tally card, on the mezzanine floor in front of the booth.",
  };
  const TALLY = {
    id: "map_note_token_tally",
    name: "Token Clerk's Tally Card",
    title: "N.Y.C. TRANSIT AUTHORITY — BOOTH R-151 DAILY TALLY",
    text: "MAR 5 1967 — booth opened 6:40 A.M. Tokens on hand: 1,200.\nSafe combination changed per Supervisor memo: 1-9-0-4 (the year the line opened — he thinks he is clever).\n9:52 — tunnel doors sealed by order. Riders demanding refunds.\nNo refunds.\n\n(below, shakier:)\nStill in the booth. They keep knocking on the glass. Not opening it.",
    at: [-1.2, MZ, 2.7],
  };
  G.on("initDone", () => {
    try {
      if (G.locks && !G.isStub("locks") && G.locks.register)
        G.locks.register(M.SUBWAY_BOOTH_LOCK);
      if (G.isStub("items") || !G.items.define) return;
      if (!(G.items.get && G.items.get(TALLY.id))) {
        G.items.define({
          id: TALLY.id,
          type: "note",
          name: TALLY.name,
          title: TALLY.title,
          text: TALLY.text,
          weight: 0,
          value: 0,
          learn: M.SUBWAY_BOOTH_LOCK.id,
          onRead: () => {
            try {
              if (G.locks && !G.isStub("locks") && G.locks.learn)
                G.locks.learn(M.SUBWAY_BOOTH_LOCK.id, TALLY.name);
            } catch (e) {
              /* optional */
            }
          },
        });
      }
      if (G.items.spawnPickup)
        G.items.spawnPickup(
          TALLY.id,
          1,
          new THREE.Vector3(
            S.x + TALLY.at[0],
            (S.y || 0) + TALLY.at[1] + 0.02,
            S.z + TALLY.at[2],
          ),
          { static: true, keepY: true, yaw: 0.6 },
        );
    } catch (e) {
      G.reportError("map:subway booth note", e);
    }
  });
