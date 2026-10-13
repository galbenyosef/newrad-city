// play-inline-497 02 — add
// Lines 368-689 of readable/play-inline-497.pretty.js (statement-aligned).
  M.rivet_gun = function (skin, world) {
    const root = new THREE.Group();
    root.name = "rivet_gun";
    const b = P.builder();
    const A = 0.42,
      by = 0.072;
    // grip: a cast D-handle-ish grip with friction tape
    R().pistolGrip(b, "gunmetal", A, { w: 0.03, top: 0.04, grooves: false });
    for (let i = 0; i < 4; i++) {
      const q = raked([[0, -0.04 + i * 0.014]], A)[0];
      b.add(GEO.torus(0.0185, 0.0026, 4, 14), "tape", {
        p: [0, q[1], -q[0]],
        r: [PI / 2 - A, 0, 0],
        s: [0.85, 1, 1.2],
        tint: 0.55,
      });
    }
    // body: a fat cylinder (the piston chamber), banded, with the exhaust ports at the back
    b.cyl("gunmetal", 0.03, 0.17, [0, by, -0.02], { seg: 20, wear: 1 });
    for (const z of [0.05, -0.02, -0.09])
      b.add(GEO.torus(0.0305, 0.0032, 5, 20), "darksteel", { p: [0, by, z] });
    b.add(GEO.cyl(0.026, 0.02, 18), "darksteel", { p: [0, by, 0.075] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      b.add(GEO.cyl(0.004, 0.006, 6), "darksteel", {
        p: [Math.cos(a) * 0.016, by + Math.sin(a) * 0.016, 0.086],
        tint: 0.2,
      });
    }
    // the rivet set (nozzle) with the hot-plate heater coil round it
    b.cyl("steel", 0.011, 0.12, [0, by, -0.165], { seg: 14, wear: 1.2 });
    b.tube("darksteel", 0.016, 0.009, 0.014, [0, by, -0.225], { seg: 16 });
    {
      const pts = [];
      for (let k = 0; k <= 120; k++) {
        const t = k / 120,
          a = t * PI * 2 * 9;
        pts.push([
          Math.cos(a) * 0.016,
          by + Math.sin(a) * 0.016,
          -0.12 - t * 0.08,
        ]);
      }
      b.add(GEO.hose(pts, 0.0022, 200, 4), "copper");
    }
    b.box("darksteel", 0.012, 0.03, 0.01, [0, by - 0.028, -0.12], {
      bevel: 0.002,
    }); // heater terminal block
    b.add(
      GEO.hose(
        [
          [0, by - 0.03, -0.12],
          [0, by - 0.045, -0.06],
          [0, by - 0.04, 0.0],
        ],
        0.003,
        10,
        6,
      ),
      "red",
    );
    // thumb-lever throttle on top of the grip, and the iron sights (a notch and a bead)
    b.box("steel", 0.01, 0.006, 0.04, [0, by + 0.034, 0.03], {
      bevel: 0.002,
      r: [0.2, 0, 0],
    });
    for (const sx of [-0.0045, 0.0045])
      b.box("darksteel", 0.004, 0.01, 0.006, [sx, by + 0.035, 0.06], {
        bevel: 0.001,
      });
    b.box("darksteel", 0.003, 0.012, 0.006, [0, by + 0.016, -0.2], {
      bevel: 0.001,
    });
    // air bottle slung under the body + its hose into the grip butt
    b.cyl("red", 0.022, 0.16, [0, by - 0.06, -0.08], { seg: 16, wear: 1 });
    b.add(
      GEO.lathe(
        [
          [0.022, 0],
          [0.012, -0.012],
          [0.0, -0.015],
        ],
        16,
      ),
      "red",
      { p: [0, by - 0.06, -0.16] },
    );
    b.cyl("brass", 0.006, 0.016, [0, by - 0.06, 0.008], { seg: 10 });
    for (const z of [-0.04, -0.12])
      b.add(GEO.torus(0.0225, 0.0025, 4, 16), "darksteel", {
        p: [0, by - 0.06, z],
      });
    b.add(
      GEO.hose(
        [
          [0, by - 0.06, 0.016],
          [0.012, by - 0.08, 0.05],
          [0.01, -0.07, 0.04],
        ],
        0.0045,
        12,
        6,
      ),
      "rubber",
    );
    // fore handle (side bar) for the left hand
    b.add(GEO.cylY(0.0125, 0.09, 12), "woodLight", {
      p: [-0.05, by - 0.01, -0.1],
      r: [0, 0, 0.2],
    });
    b.box("darksteel", 0.03, 0.012, 0.016, [-0.03, by, -0.1], { bevel: 0.002 });
    root.add(b.build());
    // the cherry-red rivet in the nozzle (hidden while empty)
    const hb = P.builder();
    hb.cyl("glowAmber", 0.0055, 0.016, [0, by, -0.236], {
      seg: 10,
      tint: [1, 0.55, 0.3],
    });
    hb.sphere("glowAmber", 0.0085, [0, by, -0.246], {
      ws: 10,
      hs: 6,
      s: [1, 1, 0.6],
      tint: [1, 0.6, 0.3],
    });
    const round = P.part(root, hb, null, "round");
    // rivet strip magazine on the right flank (part)
    const mb = P.builder();
    mb.box("blued", 0.012, 0.04, 0.1, [0.038, by + 0.004, -0.04], {
      bevel: 0.002,
      wear: 1.2,
    });
    for (let i = 0; i < 6; i++)
      mb.sphere("rust", 0.006, [0.046, by + 0.012, -0.08 + i * 0.016], {
        ws: 8,
        hs: 5,
        s: [0.6, 1, 1],
      });
    const mag = P.part(root, mb, null, "mag");
    const trigger = R().triggerPart(root, [0, 0.035, -0.03]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.25]),
      sight: P.socket(root, "sight", [0, by + 0.04, 0.06]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.05, by - 0.01, -0.1],
        [0, 0.98, -0.2],
        [-0.9, 0, 0.4],
      ),
      magGrip: P.handSocket(
        mag,
        "magGrip",
        [0.05, by, -0.04],
        [0, 0, -1],
        [0.9, -0.3, 0],
      ),
    };
    return {
      root,
      parts: { round, mag, trigger },
      sockets,
      cfg: {
        hip: { p: [0.13, -0.15, -0.33], r: [0.0, 0.08, 0] },
        adsDist: 0.28,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "mag",
          axis: [1, -0.3, 0],
          out: 0.06,
          away: [0.04, -0.34, 0.06],
          tilt: { p: [-0.02, -0.01, 0.03], r: [0.1, -0.25, -0.5] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: { p: [-0.03, -0.05, 0.04], r: [-0.45, 0.6, 0.45] },
        idleGlow: { color: 0xff6a20, i: 0.18, at: "muzzle" },
        onFrame(m) {
          m.parts.round.visible = !(P.state.cur && P.state.cur.mag <= 0);
        },
      },
    };
  };

  // ------------------------------------------------------------------
  // GLOWKEEPER CENSER — turned wooden handle with brass ferrules, a short
  // chain, and a pierced brass censer (little sun-disc cut-outs) glowing
  // with crater ash. The head sways on its chain (onFrame).
  // ------------------------------------------------------------------
  M.glowkeeper_censer = function (skin, world) {
    const root = new THREE.Group();
    root.name = "glowkeeper_censer";
    const b = P.builder();
    b.add(
      GEO.latheY(
        [
          [0.0, -0.13],
          [0.018, -0.128],
          [0.02, -0.11],
          [0.0145, -0.095],
          [0.014, 0.08],
          [0.017, 0.1],
          [0.0, 0.105],
        ],
        14,
      ),
      "wood",
      { tint: 0.8 },
    );
    for (const y of [-0.1, 0.09])
      b.add(
        GEO.latheY(
          [
            [0.0175, y - 0.012],
            [0.019, y],
            [0.0175, y + 0.012],
          ],
          14,
        ),
        "brass",
        {},
      );
    b.add(GEO.torus(0.012, 0.003, 5, 12), "brass", {
      p: [0, 0.118, 0],
      r: [0, PI / 2, 0],
    }); // top ring
    // a gilt sun disc on the pommel
    b.add(GEO.cylY(0.022, 0.004, 18), "gold", { p: [0, -0.134, 0] });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      b.box(
        "gold",
        0.012,
        0.003,
        0.004,
        [Math.cos(a) * 0.026, -0.134, Math.sin(a) * 0.026],
        { bevel: 0, r: [0, -a, 0] },
      );
    }
    root.add(b.build());
    // chain + censer (part, pivots at the top ring and sways)
    const head = new THREE.Group();
    head.name = "head";
    head.position.set(0, 0.12, 0);
    root.add(head);
    const hb = P.builder();
    for (let i = 0; i < 9; i++)
      hb.add(GEO.torus(0.008, 0.0018, 4, 10), "brass", {
        p: [0, 0.012 + i * 0.013, 0],
        r: [0, ((i % 2) * PI) / 2, 0],
        s: [0.8, 1.2, 1],
      });
    const cy = 0.18;
    hb.add(
      GEO.latheY(
        [
          [0.0, -0.045],
          [0.022, -0.042],
          [0.038, -0.025],
          [0.042, 0.0],
          [0.036, 0.022],
          [0.02, 0.036],
          [0.008, 0.044],
          [0.0, 0.046],
        ],
        18,
      ),
      "brass",
      { p: [0, cy, 0], wear: 1.2 },
    );
    hb.add(GEO.torus(0.042, 0.003, 5, 22), "gold", {
      p: [0, cy, 0],
      r: [PI / 2, 0, 0],
    });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * PI * 2;
      for (const yy of [-0.018, 0.016])
        hb.add(GEO.cylX(0.0045, 0.006, 8), "darksteel", {
          p: [Math.cos(a) * 0.039, cy + yy, Math.sin(a) * 0.039],
          r: [0, -a, 0],
          tint: 0.15,
        });
    }
    hb.cyl("brass", 0.006, 0.014, [0, cy + 0.05, 0], {
      seg: 8,
      r: [PI / 2, 0, 0],
    });
    hb.sphere("glowAmber", 0.033, [0, cy, 0], {
      ws: 12,
      hs: 8,
      tint: [1, 0.75, 0.45],
    }); // the glowing ash inside
    head.add(hb.build());
    head.userData.rest = {
      p: head.position.clone(),
      q: head.quaternion.clone(),
    };
    return {
      root,
      parts: { head },
      sockets: {
        rightHand: rightOnHandle(root, -0.01),
        muzzle: P.socket(root, "muzzle", [0, 0.3, 0]),
      },
      cfg: {
        hip: { p: [0.16, -0.2, -0.34], r: [-0.6, 0.2, -0.2] },
        rightPose: "grip",
        leftPose: "fist",
        leftFree: null,
        sprint: { p: [0.0, -0.08, 0.06], r: [-0.4, 0.2, 0.2] },
        block: { p: [-0.1, 0.1, 0.04], r: [0.5, 0.3, 1.1] },
        idleGlow: { color: 0xffa040, i: 0.3, at: "muzzle" },
        onFrame(m, dt, V) {
          const h = m.parts.head,
            t = V.time,
            swing = P.action && P.action.name === "melee" ? 2.2 : 1;
          h.rotation.x = 0.35 + Math.sin(t * 2.1) * 0.12 * swing;
          h.rotation.z = Math.sin(t * 1.7 + 1) * 0.1 * swing;
        },
      },
    };
  };
