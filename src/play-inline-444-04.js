// play-inline-444 04 — box
// Lines 939-1260 of readable/play-inline-444.pretty.js (statement-aligned).
  D("army_truck", (k, r, v) => {
    v = v % 3;
    const burnt = v === 2;
    const OL = burnt ? 0x2a2622 : pick(r, [0x4a5236, 0x535a3c, 0x464c34]);
    const ol = { color: OL, rust: burnt ? 0.9 : 0.35, grime: 0.35 };
    const dark = { color: burnt ? 0x1a1816 : 0x22231e, rust: 0.4, grime: 0.2 };
    const dy = v >= 1 ? -0.08 : 0;
    // chassis & rails
    k.box("metal", 1.0, 0.24, 6.7, 0, 0.78 + dy, 0.2, dark);
    k.box(
      "metal",
      2.3,
      0.22,
      0.22,
      0,
      0.72 + dy,
      -3.6,
      Object.assign({}, ol, { color: burnt ? 0x2a2622 : 0x3a3e2c }),
    ); // bumper
    for (const s of [-1, 1])
      k.box("metal", 0.14, 0.14, 0.3, s * 0.8, 0.72 + dy, -3.82, dark); // tow hooks
    // bonnet with louvres, grille guard, headlamps on the fenders
    k.cbox(
      "metal",
      1.34,
      0.72,
      1.7,
      0,
      1.3 + dy,
      -2.65,
      Object.assign({ bevel: 0.05 }, ol),
    );
    for (let i = 0; i < 5; i++)
      for (const s of [-1, 1])
        k.box(
          "metal",
          0.02,
          0.05,
          0.5,
          s * 0.675,
          1.35 + dy + i * 0.06 - 0.12,
          -2.6,
          dark,
        );
    k.box("metal", 1.2, 0.72, 0.05, 0, 1.25 + dy, -3.52, dark);
    for (let i = 0; i < 7; i++)
      k.box("metal", 0.05, 0.72, 0.07, -0.51 + i * 0.17, 1.25 + dy, -3.56, ol);
    for (const s of [-1, 1]) {
      k.box(
        "metal",
        0.5,
        0.06,
        1.6,
        s * 0.93,
        1.02 + dy,
        -2.7,
        Object.assign({ rx: 0.05 }, ol),
      ); // flat army fenders
      k.box("metal", 0.06, 0.34, 1.5, s * 1.17, 0.86 + dy, -2.7, ol);
      k.cyl("metal", 0.11, 0.11, 0.12, s * 0.9, 1.2 + dy, -3.45, {
        rx: PI / 2,
        seg: 10,
        color: burnt ? 0x2a2620 : 0x8a8a78,
      });
      k.cyl("glass", 0.085, 0.085, 0.02, s * 0.9, 1.2 + dy, -3.52, {
        rx: PI / 2,
        seg: 10,
        color: burnt ? 0x141210 : 0x9a9a88,
      });
    }
    k.quad("army_star", 0.62, 0.62, 0, 1.67 + dy, -2.6, {
      mat: "trim",
      rx: -PI / 2,
      grime: 0.3,
    });
    // cab: open-sided with a canvas/steel roof, split windscreen
    k.box("metal", 2.1, 0.9, 1.35, 0, 1.4 + dy, -1.2, ol); // cab tub
    k.box(
      "metal",
      2.1,
      0.08,
      1.4,
      0,
      2.55 + dy,
      -1.25,
      burnt ? dark : { color: 0x5a5a44, grime: 0.4 },
    ); // roof
    for (const s of [-1, 1]) {
      k.seg(
        "metal",
        [s * 1.02, 1.85 + dy, -1.88],
        [s * 1.02, 2.52 + dy, -1.88],
        0.035,
        dark,
      );
      k.seg(
        "metal",
        [s * 1.02, 1.85 + dy, -0.55],
        [s * 1.02, 2.52 + dy, -0.55],
        0.035,
        dark,
      );
      k.quad("army_door", 0.9, 0.23, s * 1.056, 1.55 + dy, -1.2, {
        mat: "trim",
        ry: (s * PI) / 2,
        grime: 0.3,
      });
      k.box("metal", 0.04, 0.05, 0.3, s * 1.25, 2.1 + dy, -1.85, dark); // mirror arm
      k.box("glass", 0.03, 0.26, 0.18, s * 1.38, 2.1 + dy, -1.85, {
        color: 0x3a4040,
      });
    }
    k.box("metal", 2.0, 0.06, 0.06, 0, 1.87 + dy, -1.88, dark);
    for (const s of [-1, 1])
      if (!(burnt && s > 0))
        k.box("glass", 0.92, 0.6, 0.03, s * 0.49, 2.18 + dy, -1.88, {
          rx: 0.05,
          color: burnt ? 0x121210 : 0x2a3634,
        });
    k.box("fabric", 1.8, 0.55, 0.2, 0, 1.95 + dy, -0.7, {
      color: burnt ? 0x151412 : 0x3a3a2c,
    }); // seat back
    // cargo bed: wooden slat sides on steel, tailgate
    k.box("wood", 2.3, 0.12, 4.2, 0, 1.2 + dy, 1.55, {
      color: burnt ? 0x1c1a17 : 0x4a4234,
      grime: 0.4,
    });
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++)
        k.box("wood", 0.06, 0.14, 4.2, s * 1.14, 1.38 + dy + i * 0.19, 1.55, {
          color: burnt ? 0x191713 : 0x4e5438,
          grime: 0.45,
        });
      for (let i = 0; i < 5; i++)
        k.box(
          "metal",
          0.07,
          0.62,
          0.07,
          s * 1.15,
          1.55 + dy,
          -0.45 + i * 1.0,
          dark,
        );
    }
    k.box("wood", 2.3, 0.6, 0.08, 0, 1.55 + dy, 3.63, {
      color: burnt ? 0x191713 : 0x4e5438,
      grime: 0.45,
    });
    k.quad("army_door", 1.3, 0.3, 0, 1.55 + dy, 3.68, {
      mat: "trim",
      grime: 0.35,
    });
    if (v === 0) {
      // canvas cover over bows: half-round shell + front cap + dark interior
      const cv = {
        color: pick(r, [0x5c5c44, 0x66624a, 0x55563e]),
        grime: 0.45,
        ao: [0.7, 1.2],
        aoY0: 1.2,
      };
      k.box("fabric", 2.28, 0.8, 4.1, 0, 2.12 + dy, 1.55, cv);
      k.cyl(
        "fabric",
        1.14,
        1.14,
        4.1,
        0,
        2.52 + dy,
        1.55,
        Object.assign(
          {
            rx: PI / 2,
            thetaStart: PI / 2,
            thetaLength: PI,
            seg: 10,
            s: [1, 1, 0.42],
            open: true,
          },
          cv,
        ),
      );
      k.box("fabric", 2.1, 0.9, 0.04, 0, 2.3 + dy, -0.44, cv);
      k.box("plain", 2.1, 1.1, 0.04, 0, 2.05 + dy, 3.5, {
        color: 0x121210,
        ao: [1, 1],
      }); // shadowed opening
      for (let i = 0; i < 3; i++)
        k.seg(
          "fabric",
          [-1.0 + i, 1.72 + dy, 3.6],
          [-0.9 + i + r() * 0.2, 1.4 + dy, 3.62],
          0.02,
          cv,
        ); // tie-down flaps
    } else {
      // bare bows (and tattered canvas rags on the torn one)
      for (let i = 0; i < 5; i++)
        k.torus("metal", 1.1, 0.025, 0, 1.75 + dy, -0.35 + i * 0.95, {
          arc: PI,
          s: [1, 0.72, 1],
          rseg: 4,
          tseg: 10,
          color: burnt ? 0x1a1816 : 0x3a3e2c,
          rz: (r() - 0.5) * (burnt ? 0.25 : 0.05),
        });
      if (!burnt) {
        for (let i = 0; i < 2; i++)
          k.box(
            "fabric",
            1.0 + r() * 0.6,
            0.02,
            0.9 + r() * 0.6,
            (r() - 0.5) * 1.0,
            2.45 + dy,
            0.2 + i * 2.2,
            {
              rz: (r() - 0.5) * 0.8,
              rx: (r() - 0.5) * 0.3,
              color: 0x5c5c44,
              grime: 0.5,
            },
          );
        // army crates & a jerrycan left in the bed
        for (let i = 0; i < 4; i++)
          k.abox(
            "crate_army",
            0.9,
            0.5,
            0.6,
            ((i % 2) - 0.5) * 1.1,
            1.52 + dy + (i > 2 ? 0.5 : 0),
            0.4 + ((i / 2) | 0) * 1.3,
            { ry: (r() - 0.5) * 0.3 },
          );
        k.boxB("metal", 0.35, 0.45, 0.16, 0.7, 1.26 + dy, 2.9, {
          color: 0x3a4028,
          rust: 0.4,
        });
      }
    }
    // spare wheel behind the cab, jerrycans on the running board
    k.torus("plain", 0.42, 0.14, 0, 1.95 + dy, -0.3, {
      rseg: 6,
      tseg: 12,
      color: burnt ? 0x121110 : C.rubber,
      grime: 0.2,
    });
    for (const s of [-1, 1])
      k.boxB("metal", 0.16, 0.45, 0.35, s * 1.18, 0.62 + dy, -0.2, {
        color: burnt ? 0x221f1c : 0x3e4430,
        rust: 0.4,
      });
    // wheels: front pair + tandem rear (big, knobbly; burnt → bare rims)
    for (const wz of [-2.7, 1.25, 2.55])
      for (const s of [-1, 1]) {
        if (burnt) {
          k.cyl("metal", 0.36, 0.36, 0.26, s * 1.0, 0.38, wz, {
            rz: PI / 2,
            seg: 10,
            color: 0x2a221c,
            rust: 1,
          });
          continue;
        }
        k.cyl("plain", 0.52, 0.52, 0.3, s * 1.0, 0.52 + dy, wz, {
          rz: PI / 2,
          seg: 12,
          color: C.rubber,
          grime: 0.25,
          ao: [1, 1],
        });
        k.cyl("metal", 0.26, 0.26, 0.32, s * 1.0, 0.52 + dy, wz, {
          rz: PI / 2,
          seg: 8,
          color: OL,
          rust: 0.6,
        });
      }
    k.meta.collider = { w: 2.4, d: 7.4, h: v === 0 ? 3.0 : 2.5, cz: 0 };
    k.meta.surface = "metal";
    // detail in the medium tier (no shadow pass); a ~70-tri stand-in in the long-range tier carries the
    // silhouette + shadow to 700 m (inside the detailed body, so it never shows up close)
    k.meta.tier = "medium";
    k.meta.farProxy = "army_truck_far";
    k.meta.color = OL;
    k.meta.container = burnt ? null : { name: "Army Truck", loot: "ammo_box" };
    k.meta.interactY = 1.3;
    k.meta.size = [2.4, 7.4, 3.0];
  });

  D("army_truck_far", (k, r, v) => {
    v = v % 3;
    const det = X.proto("army_truck", v).meta;
    const burnt = v === 2,
      dy = v >= 1 ? -0.08 : 0;
    const ol = {
      color: burnt ? 0x2a2622 : det.color,
      grime: 0.2,
      ao: [0.7, 1.4],
    };
    k.box("metal", 1.25, 0.66, 1.6, 0, 1.3 + dy, -2.65, ol); // bonnet
    k.box("metal", 2.0, 0.8, 1.25, 0, 1.4 + dy, -1.2, ol); // cab (below the open windows)
    k.box("metal", 2.2, 0.6, 4.0, 0, 1.5 + dy, 1.55, ol); // bed
    if (v === 0)
      k.box("metal", 2.1, 1.1, 3.9, 0, 2.35 + dy, 1.55, {
        color: 0x5c5c44,
        grime: 0.2,
      });
    k.box("metal", 1.9, 0.7, 6.4, 0, 0.5, 0.1, {
      color: 0x1c1c1a,
      grime: 0.1,
      ao: [1, 1],
    }); // running gear
    k.meta.collider = null;
    k.meta.tier = "large";
  });

  // ------------------------------------------------------------------
  // SQUATTER'S LEAN-TO. Back (+Z) against a wall, open toward -Z.
  // v % 6 → sign text, v % 3 === 2 → cold camp (no fire).
  // ------------------------------------------------------------------
