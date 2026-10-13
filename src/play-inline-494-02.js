// play-inline-494 02 — bevel
// Lines 298-526 of readable/play-inline-494.pretty.js (statement-aligned).
  M.gyrojet_carbine = function (skin) {
    const root = new THREE.Group();
    root.name = "gyrojet_carbine";
    const tick = skin === "ticker";
    const metal = "blued",
      trim = tick ? "brass" : "darksteel",
      wood = "wood";
    const b = P.builder();
    const A = 0.32,
      by = 0.074,
      rp = P.roundPts;
    R().pistolGrip(b, tick ? "gripWood" : "gripWood", A, {
      top: 0.04,
      w: 0.028,
    });
    // receiver: long rounded slab
    b.profile(
      metal,
      rp(
        [
          [-0.07, 0.036],
          [0.2, 0.036],
          [0.21, 0.046],
          [0.21, 0.098],
          [0.19, 0.106],
          [-0.05, 0.106],
          [-0.07, 0.094],
        ],
        [0.005, 0.005, 0.006, 0.01, 0.01, 0.01, 0.008],
        3,
      ),
      0.03,
      { bevel: 0.004, bseg: 2, wear: 0.7 },
    );
    for (const sd of [-1, 1]) {
      b.box(trim, 0.0008, 0.008, 0.2, [sd * 0.0152, 0.084, -0.06], {
        bevel: 0,
      }); // trim line
      b.rivets(
        "steel",
        [
          [0, 0.05, 0.03],
          [0, 0.05, -0.15],
          [0, 0.092, -0.17],
        ],
        0.0018,
        sd * 0.0154,
      );
    }
    // loading-port cover on top (the box magazine is topped up through it in the field)
    b.box(trim, 0.012, 0.004, 0.08, [0, 0.109, -0.08], { bevel: 0.001 });
    R().triggerGuard(b, metal, 0.012, 0.064, 0.036, 0.026);
    // rear peep sight
    b.box("darksteel", 0.018, 0.012, 0.012, [0, 0.112, 0.03], {
      bevel: 0.0015,
    });
    b.add(GEO.torus(0.0056, 0.0018, 6, 16), "darksteel", {
      p: [0, 0.124, 0.03],
    });
    // barrel inside a perforated jacket
    const z0 = -0.21,
      z1 = -0.56,
      jr = 0.0175;
    b.tube("gunmetal", 0.0098, 0.006, z0 - z1, [0, by, (z0 + z1) / 2], {
      seg: 14,
    });
    b.tube(metal, jr, jr * 0.86, 0.3, [0, by, z0 - 0.15], {
      seg: 20,
      wear: 0.6,
    });
    vents(b, jr, by, z0 - 0.01, z0 - 0.29, 14, [0.9, 0.0, -0.9]);
    for (const z of [z0 - 0.002, z0 - 0.3])
      b.add(GEO.torus(jr * 1.02, 0.0024, 6, 20), trim, { p: [0, by, z] });
    b.tube(trim, 0.0125, 0.006, 0.012, [0, by, z1 + 0.006], { seg: 16 }); // muzzle crown
    b.box("darksteel", 0.003, 0.022, 0.006, [0, by + 0.019, z1 + 0.02], {
      bevel: 0.0008,
    }); // front post
    b.add(GEO.torus(0.0095, 0.0016, 5, 16, PI), "darksteel", {
      p: [0, by + 0.022, z1 + 0.02],
    });
    // walnut forend under the jacket (left hand)
    b.profile(
      wood,
      rp(
        [
          [0.21, 0.04],
          [0.42, 0.048],
          [0.43, 0.056],
          [0.42, 0.066],
          [0.21, 0.066],
        ],
        [0, 0.004, 0.004, 0.004, 0],
        2,
      ),
      0.032,
      { bevel: 0.004 },
    );
    // stock: walnut with a cheek line and a rubber pad
    b.profile(
      wood,
      rp(
        [
          [-0.07, 0.098],
          [-0.07, 0.036],
          [-0.12, 0.02],
          [-0.31, 0.004],
          [-0.33, 0.004],
          [-0.33, 0.104],
          [-0.3, 0.11],
          [-0.12, 0.1],
        ],
        [0, 0.004, 0.01, 0.006, 0, 0, 0.006, 0.01],
        3,
      ),
      0.038,
      { bevel: 0.006 },
    );
    b.profile(
      "rubber",
      [
        [-0.33, 0.006],
        [-0.345, 0.006],
        [-0.345, 0.104],
        [-0.33, 0.104],
      ],
      0.04,
      { bevel: 0.004 },
    );
    R().swivel(b, 0, 0.004, 0.27);
    if (tick) {
      // parade bands round the stock and a brass butt plate
      const bands = [
        ["red", 0.16],
        ["white", 0.19],
        ["enamelBlue", 0.22],
      ];
      for (const [mt, z] of bands)
        b.box(mt, 0.0396, 0.11, 0.012, [0, 0.056, z], { bevel: 0.001 });
      b.profile(
        "brass",
        [
          [-0.344, 0.004],
          [-0.348, 0.004],
          [-0.348, 0.106],
          [-0.344, 0.106],
        ],
        0.041,
        { bevel: 0.0015 },
      );
    }
    root.add(b.build());
    // streamers (Ticker-Tape): paper strips tied to the muzzle band, flutter in onFrame
    let streamers = null;
    if (tick) {
      streamers = new THREE.Group();
      streamers.name = "streamers";
      streamers.position.set(0, by - 0.016, z0 - 0.3);
      root.add(streamers);
      const cols = ["white", "red", "white", "enamelBlue", "white"];
      cols.forEach((mt, i) => {
        const sb = P.builder();
        sb.box(
          mt,
          0.0006,
          0.06 + (i % 3) * 0.015,
          0.008,
          [0, -0.03 - (i % 3) * 0.007, 0],
          { bevel: 0 },
        );
        const g = sb.build();
        g.position.set((i - 2) * 0.006, 0, (i % 2) * 0.004);
        g.userData.ph = i * 1.3;
        streamers.add(g);
      });
    }
    const trigger = R().triggerPart(
      root,
      [0, 0.03, -0.036],
      tick ? "brass" : "steel",
    );
    const mb = C.boxMag("darksteel", 0.022, 0.1, 0.04, 0.0, {
      plate: tick ? "brass" : "steel",
      round: "steel",
    });
    const mag = P.part(root, mb, null, "mag");
    mag.children[0].position.set(0, 0.04, -0.066);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, z1 - 0.002]),
      sight: P.socket(root, "sight", [0, 0.124, 0.03]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: R().leftUnder(root, "leftHand", [0, by - 0.028, -0.3], -0.35),
      magGrip: R().leftUnder(mag, "magGrip", [0, -0.08, -0.08], 1.2),
    };
    return {
      root,
      parts: streamers ? { trigger, mag, streamers } : { trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.11, -0.13, -0.25], r: [0.02, 0.05, 0] },
        adsDist: 0.16,
        rightPose: "trigger",
        leftPose: "support",
        reload: {
          type: "mag",
          axis: [0, -1, 0],
          out: 0.07,
          away: [-0.03, -0.35, 0.05],
          tilt: { p: [-0.02, -0.02, 0.03], r: [0.12, 0.25, 0.55] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
        onFrame: tick
          ? (m, dt, V) => {
              const t = V.time,
                gust = V.shotT < 0.3 ? 1 - V.shotT / 0.3 : 0;
              for (const s of m.parts.streamers.children)
                s.rotation.x =
                  0.25 + Math.sin(t * 5 + s.userData.ph) * 0.18 + gust * 0.9;
            }
          : undefined,
      },
    };
  };

  // ------------------------------------------------------------------
  // FLAMER — fuel canister, pilot light, twin grips.
  // skin 'liberty' = Lady Liberty's Torch (verdigris copper, gilded flame crown)
  // ------------------------------------------------------------------
