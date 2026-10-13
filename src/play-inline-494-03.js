// play-inline-494 03 — add
// Lines 527-735 of readable/play-inline-494.pretty.js (statement-aligned).
  M.flamer = function (skin) {
    const root = new THREE.Group();
    root.name = "flamer";
    const lib = skin === "liberty";
    const body = lib ? "copper" : "olive";
    const trim = lib ? "gold" : "darksteel";
    const b = P.builder();
    const A = 0.3,
      by = 0.085;
    R().pistolGrip(b, "rubber", A, { top: 0.04, w: 0.03 });
    // main body tube + valve block
    b.cyl(body, 0.03, 0.34, [0, by, -0.12], {
      seg: 18,
      tint: lib ? [0.45, 0.75, 0.6] : 1,
    });
    b.box(trim, 0.05, 0.05, 0.08, [0, by - 0.005, 0.03], { bevel: 0.006 });
    b.add(GEO.cylX(0.016, 0.07, 14), "red", { p: [0, by + 0.035, 0.03] }); // valve wheel hub
    b.add(GEO.torus(0.022, 0.004, 5, 16), "red", {
      p: [0.036, by + 0.035, 0.03],
      r: [0, Math.PI / 2, 0],
    });
    // fuel canister under the body (the "magazine")
    // nozzle: heat shield with slots + flared tip
    b.add(
      GEO.lathe(
        [
          [0.03, 0.0],
          [0.036, 0.01],
          [0.036, 0.12],
          [0.03, 0.13],
        ],
        18,
      ),
      trim,
      { p: [0, by, -0.29] },
    );
    for (let i = 0; i < 6; i++)
      b.box("darksteel", 0.074, 0.006, 0.008, [0, by, -0.305 - i * 0.017], {
        bevel: 0.001,
      });
    if (lib) {
      // torch crown: gilded flame petals around the tip
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.profile(
          "gold",
          [
            [0, 0],
            [0.03, 0.006],
            [0.05, 0.0],
            [0.03, -0.004],
          ],
          0.004,
          {
            bevel: 0.001,
            r: [0, 0, a],
            p: [Math.cos(a) * 0.03, by + Math.sin(a) * 0.03, -0.43],
          },
        );
      }
      b.add(GEO.torus(0.034, 0.005, 6, 20), "gold", { p: [0, by, -0.42] });
    } else {
      b.add(
        GEO.lathe(
          [
            [0.012, 0.0],
            [0.02, 0.02],
            [0.026, 0.04],
          ],
          16,
        ),
        "darksteel",
        { p: [0, by, -0.42] },
      );
    }
    // pilot light arm under the nozzle
    b.cyl("steel", 0.004, 0.14, [0, by - 0.036, -0.35], { seg: 8 });
    b.cyl("darksteel", 0.007, 0.016, [0, by - 0.036, -0.425], { seg: 10 });
    // front handle (vertical)
    b.profile(
      "rubber",
      raked(
        [
          [-0.015, -0.07],
          [0.015, -0.07],
          [0.016, 0.0],
          [-0.016, 0.0],
        ],
        0.1,
      ).map((p) => [p[0] + 0.2, p[1] + by - 0.025]),
      0.028,
      { bevel: 0.004 },
    );
    // hoses from the canister to the valve
    b.add(
      GEO.hose(
        [
          [0.02, by - 0.02, 0.05],
          [0.04, by - 0.06, 0.02],
          [0.03, by - 0.08, -0.06],
        ],
        0.006,
        14,
        6,
      ),
      "rubber",
    );
    // shoulder rest
    b.box(trim, 0.04, 0.06, 0.16, [0, by - 0.005, 0.15], { bevel: 0.008 });
    b.box("rubber", 0.045, 0.07, 0.02, [0, by - 0.005, 0.235], {
      bevel: 0.006,
    });
    // warning plate
    b.box(lib ? "white" : "yellow", 0.0008, 0.02, 0.05, [0.0302, by, -0.08], {
      bevel: 0,
    });
    root.add(b.build());
    // fuel tank (part)
    const tb = P.builder();
    tb.cyl(lib ? "copper" : "red", 0.03, 0.18, [0, 0, 0], {
      seg: 18,
      tint: lib ? [0.45, 0.75, 0.6] : 1,
    });
    tb.add(
      GEO.lathe(
        [
          [0.03, 0.09],
          [0.022, 0.105],
          [0.008, 0.11],
        ],
        16,
      ),
      lib ? "gold" : "red",
      {},
    );
    tb.add(
      GEO.lathe(
        [
          [0.008, -0.11],
          [0.022, -0.105],
          [0.03, -0.09],
        ],
        16,
      ),
      lib ? "gold" : "red",
      {},
    );
    for (const z of [-0.05, 0.05])
      tb.add(GEO.torus(0.031, 0.003, 4, 18), "darksteel", { p: [0, 0, z] });
    tb.box("white", 0.0008, 0.03, 0.06, [0.0305, 0, 0], { bevel: 0 });
    const tank = P.part(root, tb, null, "tank");
    tank.position.set(-0.032, by - 0.055, -0.13);
    tank.userData.rest = null;
    // pilot flame (flickering additive blob)
    const pilot = new THREE.Group();
    pilot.position.set(0, by - 0.036, -0.436);
    root.add(pilot);
    const pb = P.builder();
    pb.sphere("glowAmber", 0.006, [0, 0, 0], { ws: 8, hs: 6 });
    pb.add(GEO.cyl(0.0045, 0.016, 8, 0.0005), "glowWhite", {
      p: [0, 0.0, -0.008],
      r: [-0.6, 0, 0],
    });
    pilot.add(pb.build());
    const trigger = R().triggerPart(root, [0, 0.035, -0.036]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.45]),
      sight: P.socket(root, "sight", [0, by + 0.05, 0.03]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, by - 0.06, -0.2],
        [0, 0.99, -0.1],
        [-0.85, 0, 0.45],
      ),
      magGrip: R().leftUnder(tank, "magGrip", [-0.02, -0.03, 0.0], 1.4),
    };
    return {
      root,
      parts: { tank, trigger, pilot },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.15, -0.28], r: [0.02, 0.05, 0] },
        adsDist: 0.3,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "cell",
          part: "tank",
          grip: "magGrip",
          axis: [-0.3, -1, 0],
          out: 0.06,
          away: [-0.06, -0.3, 0.06],
          speed: 1,
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
        idleGlow: { color: 0xffa040, i: 0.12, at: "muzzle" },
        onFrame(m, dt, V) {
          const t = V.time;
          const s = 0.9 + Math.sin(t * 37) * 0.15 + Math.sin(t * 61) * 0.1;
          m.parts.pilot.scale.set(s, s, s * 1.2);
          m.parts.pilot.visible = !(P.state.cur && P.state.cur.mag <= 0);
        },
      },
    };
  };
