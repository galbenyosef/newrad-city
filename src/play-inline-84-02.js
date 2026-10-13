// play-inline-84 02 — the
// Lines 151-457 of readable/play-inline-84.pretty.js (statement-aligned).
  function buildRotorcraft() {
    const P = PIECES.rotorcraft,
      r = M.rng("rotorcraft");
    const x = P.x,
      z = P.z;
    const yaw = 0.62,
      pitch = -0.11,
      roll = 0.38; // nose down into the knoll, rolled onto its port side
    const VS = 1.4; // model units → metres (a tandem-rotor troop carrier is long)
    const hull = M.buf("metal_painted", x, z, "main"),
      det = M.buf("metal_painted", x, z, "detail");
    const rust = M.buf("rust", x, z, "main"),
      glass = M.buf("glass_dirty", x, z, "main");
    const blades = M.buf("metal_painted", x, z, "detail");
    const OL = [0.5, 0.52, 0.45],
      OLD = [0.26, 0.27, 0.24],
      BL = [0.3, 0.3, 0.28]; // military olive-grey, soot at the burn, blade grey
    const hc = (t, a) => {
      const burn =
        M.smooth(0.55, 0.9, t) * 0.5 + (Math.sin(a) < -0.3 ? 0.18 : 0);
      return M.mixc(
        M.mulc(OL, 0.85 + 0.2 * M.hash(t * 40, a * 9, 3)),
        OLD,
        burn,
      );
    };
    M.pushXF(M.mtx(x, 1.05 * VS, z, yaw, pitch, roll, VS));
    // fuselage: rounded glazed nose → one long slab-sided cabin → tail swept up under the aft rotor pylon
    const secs = [
      { z: -6.4, w: 1.0, h: 1.0, y: -0.2, e: 2.4 },
      { z: -5.8, w: 2.0, h: 1.9, y: -0.1, e: 2.8 },
      { z: -4.9, w: 2.6, h: 2.5, y: 0.05, e: 3.6 },
      { z: -3.8, w: 2.8, h: 2.7, y: 0.1, e: 5 },
      { z: 3.6, w: 2.8, h: 2.7, y: 0.1, e: 5 },
      { z: 5.2, w: 2.6, h: 2.2, y: 0.45, e: 4.4 },
      { z: 6.4, w: 2.2, h: 1.5, y: 0.85, e: 3.6 },
    ];
    loft(hull, secs, { seg: 14, c: hc });
    loftCap(hull, secs[0], -1, M.mulc(OL, 0.7), 14);
    loftCap(rust, secs[secs.length - 1], 1, [0.4, 0.3, 0.24], 14); // the open tail where the ramp tore away
    // cockpit glazing: dark panes wrapped round the nose
    for (const sd of [-1, 1]) {
      M.quad(
        glass,
        [sd * 0.98, 0.0, -5.7],
        [sd * 1.3, 0.1, -4.8],
        [sd * 1.2, 0.95, -4.8],
        [sd * 0.85, 0.75, -5.7],
        [sd, 0.4, -0.5],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.18, 0.2, 0.2],
      );
    }
    M.quad(
      glass,
      [-0.85, 0.75, -5.7],
      [0.85, 0.75, -5.7],
      [0.95, 1.15, -4.8],
      [-0.95, 1.15, -4.8],
      [0, 0.8, -0.6],
      [0, 0, 1, 0, 1, 1, 0, 1],
      [0.12, 0.14, 0.14],
    );
    // a row of small cabin windows down both flanks
    for (const sd of [-1, 1])
      for (let zz = -2.6; zz < 3.2; zz += 1.15) {
        M.quad(
          glass,
          [sd * 1.43, 0.35, zz],
          [sd * 1.43, 0.35, zz + 0.5],
          [sd * 1.43, 0.85, zz + 0.5],
          [sd * 1.43, 0.85, zz],
          [sd, 0, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.14, 0.16, 0.16],
        );
      }
    // open crew door (forward, starboard): dark hole + the slid-back door panel
    M.quad(
      M.buf("rubber", x, z, "main"),
      [1.44, -0.8, -3.6],
      [1.44, -0.8, -2.4],
      [1.44, 0.95, -2.4],
      [1.44, 0.95, -3.6],
      [1, 0, 0],
      [0, 0, 1, 0, 1, 1, 0, 1],
      [0.35, 0.35, 0.35],
    );
    M.box(det, 1.46, -0.85, -2.5, 1.58, 1.0, -1.3, {
      s: 1,
      c: M.mulc(OL, 0.9),
      skip: 0,
    });
    // riveted frame bands over the cabin roof
    for (const zz of [-3.4, -1.2, 1.0, 3.2])
      M.beam(det, -1.42, 1.42, zz, 1.42, 1.42, zz, 0.06, 0.04, { c: OLD });
    // long fuel sponsons along the lower flanks (the port one crushed flat into the ground)
    M.box(hull, 1.3, -1.1, -1.6, 1.9, -0.35, 3.4, {
      s: 2,
      c: M.mulc(OL, 0.88),
      skip: 0,
    });
    M.box(rust, -1.75, -1.15, -1.2, -1.3, -0.75, 3.0, {
      s: 1,
      c: [0.45, 0.36, 0.3],
      skip: 0,
    });
    // forward rotor: a low pylon over the cockpit, hub, one blade bent down over the flank, two snapped stubs
    M.box(hull, -0.5, 1.3, -5.0, 0.5, 1.95, -3.6, {
      s: 1,
      c: M.mulc(OL, 0.85),
      skip: 0,
    });
    M.cyl(rust, 0, 1.95, -4.4, 0.32, 0.26, 0.55, 10, {
      c: [0.45, 0.38, 0.32],
      capTop: true,
    });
    M.beam(blades, 0, 2.45, -4.4, 2.6, 2.35, -5.3, 0.34, 0.06, {
      c: BL,
      skip: 0,
    });
    M.beam(blades, 2.6, 2.35, -5.3, 4.6, 0.7, -6.1, 0.34, 0.06, {
      c: BL,
      skip: 0,
    }); // bent down past the nose
    M.beam(blades, 0, 2.45, -4.4, -1.5, 2.6, -3.3, 0.34, 0.06, {
      c: BL,
      skip: 0,
    });
    M.beam(blades, 0, 2.45, -4.4, -0.5, 2.5, -6.1, 0.34, 0.06, {
      c: BL,
      skip: 0,
    });
    // aft rotor: the tall pylon over the tail, hub, two drooping blades, one snapped
    M.box(hull, -0.75, 1.2, 3.4, 0.75, 3.0, 6.2, {
      s: 2,
      c: M.mulc(OL, 0.9),
      skip: 0,
    });
    M.box(det, -0.6, 3.0, 4.0, 0.6, 3.25, 5.9, { s: 1, c: OLD, skip: 0 });
    M.cyl(rust, 0, 3.25, 5.2, 0.32, 0.26, 0.55, 10, {
      c: [0.45, 0.38, 0.32],
      capTop: true,
    });
    M.beam(blades, 0, 3.75, 5.2, -2.8, 3.5, 6.3, 0.34, 0.06, {
      c: BL,
      skip: 0,
    });
    M.beam(blades, -2.8, 3.5, 6.3, -5.4, 1.3, 7.3, 0.34, 0.06, {
      c: BL,
      skip: 0,
    }); // drooped to the port side
    M.beam(blades, 0, 3.75, 5.2, 0.6, 3.4, 7.2, 0.34, 0.06, { c: BL, skip: 0 });
    M.beam(blades, 0.6, 3.4, 7.2, 1.0, 1.4, 8.0, 0.34, 0.06, {
      c: BL,
      skip: 0,
    }); // folded down over the tail
    M.beam(blades, 0, 3.75, 5.2, 2.2, 3.9, 4.3, 0.34, 0.06, { c: BL, skip: 0 }); // snapped stub
    // landing-gear struts (two pairs) with the tyres burst flat
    for (const sd of [-1, 1])
      for (const zz of [-3.2, 2.6]) {
        M.beam(rust, sd * 0.95, -1.15, zz, sd * 1.15, -1.55, zz, 0.12, 0.12, {
          c: [0.35, 0.33, 0.3],
        });
        M.box(
          M.buf("rubber", x, z, "main"),
          sd * 1.15 - 0.15,
          -1.75,
          zz - 0.4,
          sd * 1.15 + 0.15,
          -1.45,
          zz + 0.4,
          { s: 1, c: [0.3, 0.3, 0.3], skip: 0 },
        );
      }
    M.popXF();
    // ---- ground: gouged trench behind it, the torn-off rotor gearbox, scattered panels, scorch ----
    const ca = Math.cos(yaw),
      sa = Math.sin(yaw);
    const L = (lx, lz) => [
      x + (lx * ca + lz * sa) * VS,
      z + (-lx * sa + lz * ca) * VS,
    ];
    const mk = M.buf("my/markings", x, z, "fine");
    for (let i = 0; i < 5; i++) {
      const p = L(r.range(-1, 1), 8 + i * 3.2);
      M.decal(
        mk,
        p[0],
        0.06,
        p[1],
        3.2,
        3.6,
        yaw + r.range(-0.2, 0.2),
        M.MARK.DIRT,
        [0.8, 0.7, 0.6],
      );
    }
    for (let i = 0; i < 3; i++) {
      const p = L(r.range(-3, 3), r.range(-4, 4));
      M.decal(
        mk,
        p[0],
        0.07,
        p[1],
        r.range(4, 7),
        r.range(4, 7),
        r() * 6,
        M.MARK.SCORCH,
        [0.9, 0.9, 0.9],
      );
    }
    // a rotor gearbox housing torn out of a pylon, lying on its side
    const np = L(-6.5, 5.5);
    M.pushXF(M.mtx(np[0], 0.55, np[1], yaw + 1.2, Math.PI / 2 - 0.2, 0));
    M.cyl(
      M.buf("metal_painted", x, z, "main"),
      0,
      -1.3,
      0,
      0.6,
      0.45,
      2.6,
      10,
      { c: [0.3, 0.31, 0.28], capTop: true, capBot: true },
    );
    M.popXF();
    M.ocol(np[0], np[1], 3, 1.4, 0, 1.1, yaw + 1.2, {
      tag: "wreck",
      surface: "metal",
    });
    // a rotor blade stuck in the dirt, loose hull panels, a crate of spilled ammo cans
    const bp = L(4, -8);
    M.beam(
      M.buf("metal_painted", x, z, "detail"),
      bp[0],
      -0.3,
      bp[1],
      bp[0] + 1.2,
      3.4,
      bp[1] + 0.6,
      0.36,
      0.06,
      { c: BL, skip: 0 },
    );
    for (let i = 0; i < 9; i++) {
      const p = L(r.range(-7, 7), r.range(-7, 9));
      if (Math.abs(p[0] - x) < 2.5 && Math.abs(p[1] - z) < 5) continue;
      M.obox(
        M.buf("metal_painted", x, z, "detail"),
        p[0],
        0.05,
        p[1],
        r.range(0.5, 1.4),
        0.04,
        r.range(0.4, 1.1),
        r() * 6,
        {
          c: M.mulc(OL, r.range(0.6, 1)),
          s: 1,
          pitch: r.range(-0.2, 0.2),
          roll: r.range(-0.3, 0.3),
        },
      );
    }
    const cp = L(3.2, 3.5);
    M.obox(
      M.buf("metal_painted", x, z, "detail"),
      cp[0],
      0.25,
      cp[1],
      0.9,
      0.5,
      0.6,
      yaw + 0.3,
      { c: [0.3, 0.34, 0.24], s: 1 },
    );
    M.obox(
      M.buf("metal_painted", x, z, "detail"),
      cp[0] + 0.7,
      0.15,
      cp[1] + 0.4,
      0.4,
      0.3,
      0.25,
      yaw + 1.1,
      { c: [0.32, 0.36, 0.26], s: 1 },
    );
    // the pilot didn't make it far
    const sk = L(3.6, -1.8);
    if (M.skeleton) M.skeleton(sk[0], sk[1], yaw + 2.4, r, false);
    // colliders: forward cabin, aft cabin + tall rotor pylon
    const hp = L(0, -2.6),
      tp = L(0, 3.8);
    M.ocol(hp[0], hp[1], 3.0 * VS, 7.6 * VS, 0, 2.6 * VS, yaw, {
      tag: "wreck",
      surface: "metal",
    });
    M.ocol(tp[0], tp[1], 3.0 * VS, 5.2 * VS, 0, 3.6 * VS, yaw, {
      tag: "wreck",
      surface: "metal",
    });
  }

  // -------------------------------------------------------------------
  // 2. Cleopatra's Needle
  // -------------------------------------------------------------------
