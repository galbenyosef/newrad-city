// play-inline-442 04 — color
// Lines 970-1241 of readable/play-inline-442.pretty.js (statement-aligned).
  D("planter", (k, r, v) => {
    if (v === 0) {
      // concrete planter + dead shrub
      k.cbox("concrete", 1.3, 0.62, 1.3, 0, 0.31, 0, {
        bevel: 0.05,
        color: 0xb8b2a4,
      });
      k.box("concrete", 1.14, 0.04, 1.14, 0, 0.58, 0, { color: 0x4a3a2a });
      X.deadTree(k, r, 0, 0, 1.6, 2);
      for (let i = 0; i < 3; i++)
        k.quad("paper", 0.14, 0.1, (r() - 0.5) * 0.9, 0.61, (r() - 0.5) * 0.9, {
          rx: -PI / 2,
          rz: r() * 3,
        });
      k.meta.collider = { w: 1.3, d: 1.3, h: 0.62 };
      k.meta.tier = "small";
    } else if (v === 1) {
      // tree pit with iron guard + tall dead tree
      k.box("concrete", 1.2, 0.03, 1.2, 0, 0.015, 0, { color: 0x3a2e22 });
      const g = { color: 0x2a2c28, rust: 0.4 };
      for (let i = 0; i < 4; i++) {
        const a = (i * PI) / 2;
        const x0 = Math.cos(a) * 0.6,
          z0 = Math.sin(a) * 0.6;
        const x1 = Math.cos(a + PI / 2) * 0.6,
          z1 = Math.sin(a + PI / 2) * 0.6;
        k.seg("metal", [x0, 0.45, z0], [x1, 0.45, z1], 0.015, g);
        k.seg("metal", [x0, 0, z0], [x0, 0.45, z0], 0.015, g);
      }
      X.deadTree(k, r, 0, 0, 4.5 + r() * 2, 2);
      k.meta.collider = { w: 0.4, d: 0.4, h: 2 };
      k.meta.tier = "medium";
    } else {
      // stump
      k.cyl("wood", 0.22, 0.28, 0.5, 0, 0.25, 0, { seg: 8, color: 0x6a5a4a });
      k.meta.tier = "small";
    }
  });

  // ---------------- sidewalk subway grate ----------------
  D("grate", (k) => {
    k.quad("grate", 1.1, 2.2, 0, 0.025, 0, { rx: -PI / 2, color: 0xaaaaaa });
    k.box("metal", 1.2, 0.04, 0.06, 0, 0.02, 1.12, { color: 0x4a4a40 });
    k.box("metal", 1.2, 0.04, 0.06, 0, 0.02, -1.12, { color: 0x4a4a40 });
    k.meta.tier = "small";
  });

  // ---------------- Fizzo Cola machine ----------------
  // A tall, square-shouldered upright: a black kick plinth on levelling feet, a red body with a white
  // side band, an arched lamp crown across the top, the glass-front door (printed: racked bottles,
  // selection column, delivery flap) in a chrome frame with a long pull handle, and a chrome
  // bottle-opener plate with its cap catcher bolted beside the flap.
  // variant 0/1: upright (Fizzo Cola / Fizzo Blue door), 2: knocked over on its back
  D("fizzo_machine", (k, r, v) => {
    const kk = v === 2 ? new X.Kit(21) : k;
    const red = { color: C.fizzoRed, rust: 0.25 + r() * 0.2, tint: true };
    const chrome = { color: C.chrome, rust: 0.15, grime: 0.2 };
    const blk = { color: 0x1a1a1a, rust: 0.2 };
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        kk.cyl("metal", 0.03, 0.035, 0.05, sx * 0.4, 0.025, sz * 0.3, {
          seg: 6,
          color: 0x2a2a28,
        });
    kk.boxB("metal", 0.9, 0.12, 0.7, 0, 0.04, 0, blk);
    kk.cbox(
      "metal",
      0.94,
      1.6,
      0.74,
      0,
      0.96,
      0,
      Object.assign({ bevel: 0.025 }, red),
    );
    for (const s of [-1, 1])
      kk.box("metal", 0.012, 0.16, 0.66, s * 0.472, 1.25, 0, {
        color: 0xece4d4,
        rust: 0.2,
      }); // white side band
    // arched crown across the top (axis front-to-back) with a lamp strip on its face
    kk.cyl(
      "metal",
      0.47,
      0.47,
      0.74,
      0,
      1.76,
      0,
      Object.assign(
        {
          rx: PI / 2,
          seg: 16,
          thetaStart: PI / 2,
          thetaLength: PI,
          s: [1, 1, 0.42],
        },
        red,
      ),
    );
    kk.box("glow", 0.62, 0.05, 0.02, 0, 1.86, -0.375, { color: 0xfff0d8 });
    kk.box("metal", 0.94, 0.03, 0.76, 0, 1.765, 0, chrome);
    // door: printed glass front inside a chrome frame, long pull handle on the right
    kk.quad(
      v === 1 ? "fizzo_front_b" : "fizzo_front",
      0.8,
      1.56,
      -0.02,
      0.98,
      -0.374,
      { ry: PI, color: 0xffffff },
    );
    kk.box("metal", 0.84, 0.025, 0.02, -0.02, 1.77, -0.375, chrome);
    kk.box("metal", 0.84, 0.025, 0.02, -0.02, 0.2, -0.375, chrome);
    for (const fx of [-0.44, 0.4])
      kk.box("metal", 0.025, 1.57, 0.02, fx, 0.98, -0.375, chrome);
    kk.box("metal", 0.03, 0.5, 0.03, 0.43, 1.12, -0.4, chrome);
    for (const hy of [0.88, 1.36])
      kk.box("metal", 0.03, 0.03, 0.04, 0.43, hy, -0.385, chrome);
    // bottle-opener plate + cap catcher beside the delivery flap
    kk.box("metal", 0.1, 0.07, 0.015, 0.33, 0.47, -0.384, chrome);
    kk.box("metal", 0.04, 0.012, 0.02, 0.33, 0.455, -0.395, blk);
    kk.boxB("metal", 0.12, 0.08, 0.08, 0.33, 0.28, -0.41, {
      color: 0x6a6a64,
      rust: 0.4,
    });
    if (v === 2) {
      k.include(kk, { y: 0.37, z: 0.9, rx: -PI / 2 });
      for (let i = 0; i < 6; i++)
        k.cyl(
          "glass",
          0.03,
          0.032,
          0.26,
          (r() - 0.5) * 1.4,
          0.03,
          -0.5 - r() * 0.8,
          { rz: PI / 2, ry: r() * 6, color: 0x4a1a10, seg: 6 },
        );
      k.meta.collider = { w: 0.95, d: 1.9, h: 0.8, cz: 0.9 };
    } else {
      k.meta.collider = { w: 0.95, d: 0.8, h: 2.0 };
      k.meta.glows = [
        {
          x: 0,
          y: 1.6,
          z: -0.55,
          color: 0xff6a50,
          size: 2.4,
          flicker: r() < 0.4 ? 0.5 : 0,
        },
      ];
    }
    k.meta.container = { name: "Fizzo Cola Machine", loot: "fizzo_machine" };
    k.meta.tier = "medium";
  });

  // ---------------- Office of Civil Defense information kiosk (shelters + 1967 enrolment) ----------------
  // A grey-white enamel pylon on a round concrete foot with an orange band and a leaflet pocket, a slanted
  // lectern head carrying the printed face with its amber teletype screen, and the snowflake roundel
  // of the Office of Civil Defense on a short mast.
  D("ocd_kiosk", (k, r) => {
    const wht = { color: C.ocdGrey, rust: 0.18, grime: 0.35 },
      org = { color: C.ocdOrange, rust: 0.2, grime: 0.3 };
    k.cyl("concrete", 0.5, 0.55, 0.12, 0, 0.06, 0, {
      seg: 16,
      color: 0x8a8880,
    });
    k.cbox(
      "metal",
      0.56,
      1.16,
      0.46,
      0,
      0.7,
      0.04,
      Object.assign({ bevel: 0.05 }, wht),
    );
    k.box("metal", 0.58, 0.08, 0.48, 0, 1.04, 0.04, org);
    k.box("metal", 0.58, 0.04, 0.48, 0, 0.2, 0.04, org);
    k.box(
      "metal",
      0.34,
      0.2,
      0.05,
      0,
      0.62,
      -0.21,
      Object.assign({ rx: 0.15 }, wht),
    );
    for (let i = 0; i < 3; i++)
      k.box(
        "plain",
        0.24,
        0.16,
        0.004,
        -0.02 + i * 0.02,
        0.7,
        -0.236 + i * 0.006,
        { rx: 0.15, color: 0xe8e2cc },
      );
    k.cbox(
      "metal",
      0.95,
      0.95,
      0.4,
      0,
      1.75,
      0.02,
      Object.assign({ bevel: 0.06, rx: 0.18 }, wht),
    );
    k.quad("ocd_kiosk", 0.78, 0.8, 0, 1.75, -0.19, { ry: PI, rx: -0.18 });
    k.box("screen", 0.6, 0.25, 0.01, 0, 1.833, -0.185, {
      rx: 0.18,
      uvFn: screenUV("ocd_kiosk", 0.11, 0.89, 0.44, 0.77),
      ao: [1, 1],
      grime: 0,
    });
    k.box(
      "metal",
      0.97,
      0.06,
      0.42,
      0,
      2.2,
      0.1,
      Object.assign({ rx: 0.18 }, org),
    );
    // roundel mast
    k.cyl("metal", 0.03, 0.03, 0.3, 0, 2.38, 0.1, { seg: 8, color: 0x5a5a56 });
    k.cyl(
      "metal",
      0.29,
      0.29,
      0.05,
      0,
      2.78,
      0.1,
      Object.assign({ rx: PI / 2, seg: 20 }, org),
    );
    k.quad("longwinter_logo", 0.48, 0.48, 0, 2.78, 0.07, { ry: PI });
    k.quad("longwinter_logo", 0.48, 0.48, 0, 2.78, 0.13, {});
    k.meta.glows = [
      { x: 0, y: 1.85, z: -0.35, color: 0xffb347, size: 1.8, flicker: 0.3 },
    ];
    k.meta.collider = { w: 1.0, d: 0.8, h: 2.2 };
    k.meta.tier = "medium";
  });
  /** uvFn mapping a sub-rectangle (fractions) of an atlas region onto a box's -Z face (screens). */
  function screenUV(region, fu0, fu1, fv0, fv1) {
    return (g) => {
      const R = X.atlasRegion(region);
      const u0 = X.lerp(R.u0, R.u1, fu0),
        u1 = X.lerp(R.u0, R.u1, fu1),
        v0 = X.lerp(R.v0, R.v1, fv0),
        v1 = X.lerp(R.v0, R.v1, fv1);
      const uv = g.attributes.uv,
        p = g.attributes.position;
      g.computeBoundingBox();
      const bb = g.boundingBox;
      for (let i = 0; i < uv.count; i++) {
        const fx = (p.getX(i) - bb.min.x) / Math.max(1e-4, bb.max.x - bb.min.x),
          fy = (p.getY(i) - bb.min.y) / Math.max(1e-4, bb.max.y - bb.min.y);
        uv.setXY(i, X.lerp(u1, u0, fx), X.lerp(v0, v1, fy));
      }
    };
  }
  X.screenUV = screenUV;

  // ---------------- freestanding billboard frame ----------------
  // variant 0: street-level twin pole (6x3 face at 4.5 m), 1: big rooftop-style (12x5 on lattice), 2: leaning/damaged
  // The brand face itself is a separate mesh (see scatter/spawn) placed at meta.face.
