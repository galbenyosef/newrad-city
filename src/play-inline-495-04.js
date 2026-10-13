// play-inline-495 04 — box
// Lines 844-966 of readable/play-inline-495.pretty.js (statement-aligned).
  M._ammo = function (id) {
    P.buildingWorld = true;
    const b = P.builder();
    const L = AMMO_LOOK[id] || {
      box: [0.08, 0.04, 0.06],
      band: "red",
      col: "tan",
    };
    if (id === "ammo_missile") P.buildMissile(b, [0, 0.04, 0], 0.9);
    else if (id === "ammo_recoilless")
      P.buildRecoillessRound(b, [0, 0.046, 0], 1.0);
    else if (L.can) {
      const s = L.big ? 1.4 : 1;
      b.box(L.col, 0.08 * s, 0.1 * s, 0.14 * s, [0, 0.05 * s, 0], {
        bevel: 0.006,
      });
      b.box("darksteel", 0.084 * s, 0.012, 0.144 * s, [0, 0.1 * s, 0], {
        bevel: 0.003,
      });
      b.box("darksteel", 0.03, 0.008, 0.06, [0, 0.108 * s, 0], {
        bevel: 0.002,
      });
      b.box("yellow", 0.0008, 0.02, 0.07, [0.0405 * s, 0.05 * s, 0], {
        bevel: 0,
      });
    } else if (L.battery) {
      // square six-volt lantern battery: grey can, red label band, two spring terminals
      b.box("tan", 0.068, 0.11, 0.068, [0, 0.055, 0], {
        bevel: 0.006,
        tint: [0.75, 0.78, 0.8],
      });
      b.box("red", 0.0692, 0.04, 0.0692, [0, 0.06, 0], { bevel: 0.002 });
      for (const x of [-0.016, 0.016]) {
        b.cyl("steel", 0.003, 0.012, [x, 0.117, 0], { seg: 8 });
        b.add(GEO.torus(0.005, 0.0012, 4, 10), "steel", {
          p: [x, 0.126, 0],
          r: [Math.PI / 2, 0, 0],
        });
      }
    } else if (L.keg) {
      // a nail-keg of rivets: wooden keg, iron hoops, rivet heads on top
      b.add(
        GEO.latheY(
          [
            [0.0, 0.0],
            [0.045, 0.0],
            [0.052, 0.04],
            [0.045, 0.08],
            [0.0, 0.08],
          ],
          14,
        ),
        "woodLight",
        {},
      );
      for (const y of [0.01, 0.07])
        b.add(GEO.torus(0.047, 0.0025, 4, 14), "rust", {
          p: [0, y, 0],
          r: [Math.PI / 2, 0, 0],
        });
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9;
        b.sphere(
          "rust",
          0.007,
          [
            Math.cos(a) * 0.022 * ((i % 2) + 0.5),
            0.082,
            Math.sin(a) * 0.022 * ((i % 2) + 0.5),
          ],
          { ws: 6, hs: 4 },
        );
      }
    } else if (L.tube) {
      b.cyl("yellow", 0.012, 0.09, [0, 0.012, 0], { seg: 12 });
      b.cyl("red", 0.0125, 0.02, [0, 0.012, -0.04], { seg: 12 });
    } else if (L.fuel) {
      b.cyl("red", 0.045, 0.2, [0, 0.045, 0], { seg: 16 });
      b.add(
        GEO.lathe(
          [
            [0.045, 0.1],
            [0.02, 0.12],
            [0.01, 0.13],
          ],
          16,
        ),
        "red",
        { p: [0, 0.045, 0] },
      );
      b.box("white", 0.0008, 0.04, 0.08, [0.0455, 0.045, 0], { bevel: 0 });
    } else {
      const [w, h, d] = L.box;
      b.box(L.col, w, h, d, [0, h / 2, 0], { bevel: 0.003 });
      b.box(L.band, w * 1.01, h * 0.35, d * 1.01, [0, h * 0.5, 0], {
        bevel: 0.001,
      });
      b.box("white", w * 0.5, 0.001, d * 0.4, [0, h + 0.0005, 0], { bevel: 0 });
      if (L.rockets)
        for (let i = 0; i < 4; i++) {
          b.cyl("steel", 0.0062, 0.032, [-0.024 + i * 0.016, h + 0.007, 0.0], {
            seg: 10,
            r: [Math.PI / 2, 0, 0],
          });
          b.sphere("steel", 0.0062, [-0.024 + i * 0.016, h + 0.007, -0.016], {
            ws: 8,
            hs: 6,
          });
        }
      if (L.shells)
        for (let i = 0; i < 3; i++) {
          b.cyl("red", 0.0105, 0.05, [-0.02 + i * 0.022, h + 0.011, 0.0], {
            seg: 10,
          });
          b.cyl("brass", 0.011, 0.014, [-0.02 + i * 0.022, h + 0.011, 0.032], {
            seg: 10,
          });
        }
    }
    const grp = b.build(true);
    P.buildingWorld = false;
    return grp;
  };
