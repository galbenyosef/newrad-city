// play-inline-496 03 — add
// Lines 681-805 of readable/play-inline-496.pretty.js (statement-aligned).
  M.riot_gas_grenade = function () {
    const b = P.builder();
    // grey canister, blue band, stencil, perforated top, spoon & pin
    b.add(GEO.cylY(0.026, 0.09, 16), "tan", { tint: [0.7, 0.72, 0.72] });
    b.add(GEO.cylY(0.0262, 0.016, 16), "enamelBlue", { p: [0, 0.018, 0] });
    b.box("white", 0.0008, 0.024, 0.02, [0.0262, -0.012, 0], { bevel: 0 });
    b.add(GEO.cylY(0.022, 0.006, 14), "darksteel", { p: [0, 0.048, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.add(GEO.cylY(0.0028, 0.007, 6), "darksteel", {
        p: [Math.cos(a) * 0.013, 0.049, Math.sin(a) * 0.013],
        tint: 0.2,
      });
    }
    b.cyl("steel", 0.009, 0.016, [0, 0.058, 0], {
      r: [Math.PI / 2, 0, 0],
      seg: 12,
    }); // fuze
    b.box("steel", 0.012, 0.06, 0.004, [0, 0.03, 0.03], {
      bevel: 0.001,
      r: [0.12, 0, 0],
    }); // spoon
    b.add(GEO.torus(0.009, 0.0015, 4, 12), "steel", {
      p: [0.013, 0.061, 0],
      r: [0, Math.PI / 2, 0],
    }); // pin ring
    return thrownInst("riot_gas_grenade", b);
  };
  M.molotov = function (skin, world) {
    const b = P.builder();
    // brown root-beer bottle (tinted glass), a paper label, a rag stuffed in the neck
    b.add(
      GEO.latheY(
        [
          [0.0, -0.06],
          [0.026, -0.058],
          [0.028, -0.05],
          [0.028, 0.02],
          [0.024, 0.032],
          [0.012, 0.05],
          [0.011, 0.075],
          [0.0, 0.076],
        ],
        16,
      ),
      "glass",
      { tint: [0.9, 0.5, 0.25] },
    );
    b.add(
      GEO.latheY(
        [
          [0.0, -0.055],
          [0.025, -0.054],
          [0.025, 0.012],
          [0.0, 0.013],
        ],
        14,
      ),
      "amberRubber",
      { tint: [0.55, 0.35, 0.15] },
    ); // the fuel inside
    b.add(GEO.cylY(0.0284, 0.03, 16), "white", {
      p: [0, -0.02, 0],
      tint: [1.0, 0.9, 0.7],
    }); // label
    b.box("red", 0.0006, 0.012, 0.02, [0.0286, -0.02, 0], {
      bevel: 0,
      r: [0, 0, 0],
    });
    b.add(
      GEO.hose(
        [
          [0.0, 0.07, 0.0],
          [0.004, 0.09, 0.004],
          [-0.006, 0.105, 0.01],
          [0.004, 0.118, 0.006],
        ],
        0.0055,
        10,
        6,
      ),
      "cloth",
      { tint: 0.8 },
    );
    const inst = thrownInst("molotov", b);
    if (!world) {
      // the lit rag (flickers in onFrame)
      const flame = new THREE.Group();
      flame.position.set(0.002, 0.125, 0.006);
      inst.root.add(flame);
      const fb = P.builder();
      fb.sphere("glowAmber", 0.007, [0, 0, 0], { ws: 8, hs: 6 });
      fb.add(GEO.cyl(0.005, 0.02, 8, 0.0005), "glowWhite", {
        p: [0, 0.008, 0],
        r: [-Math.PI / 2, 0, 0],
      });
      flame.add(fb.build());
      inst.parts.flame = flame;
      inst.cfg.onFrame = (m, dt, V) => {
        const t = V.time,
          k = 0.85 + Math.sin(t * 31) * 0.15 + Math.sin(t * 53) * 0.1;
        m.parts.flame.scale.set(k, k * 1.3, k);
      };
    }
    return inst;
  };
  M.frag_mine = function () {
    const b = P.builder();
    b.add(GEO.cylY(0.05, 0.022, 20), "olive", {});
    b.add(GEO.cylY(0.03, 0.008, 18), "darksteel", { p: [0, 0.014, 0] });
    b.add(GEO.torus(0.05, 0.004, 4, 20), "darksteel", {
      r: [Math.PI / 2, 0, 0],
    });
    b.sphere("glowRed", 0.005, [0.03, 0.013, 0.0]);
    for (let i = 0; i < 6; i++)
      b.box(
        "steel",
        0.006,
        0.004,
        0.012,
        [Math.cos(i) * 0.045, 0.012, Math.sin(i) * 0.045],
        { bevel: 0.001, r: [0, -i, 0] },
      );
    return thrownInst("frag_mine", b, {});
  };
