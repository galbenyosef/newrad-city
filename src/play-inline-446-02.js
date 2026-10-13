// play-inline-446 02 — the
// Lines 341-685 of readable/play-inline-446.pretty.js (statement-aligned).
  function tankHull(r, v, OL) {
    const k = new X.Kit(45);
    const burnt = v === 1;
    const ol = {
      color: burnt ? BURNT : OL,
      rust: burnt ? 0.95 : 0.3,
      grime: 0.36,
    };
    const dark = { color: burnt ? 0x161412 : 0x22231e, rust: 0.5, grime: 0.25 };
    const trk = {
      color: burnt ? 0x1a1816 : TRACK,
      rust: burnt ? 1 : 0.7,
      grime: 0.3,
    };
    // lower hull tub between the tracks, the sloped glacis in front of it (same width)
    k.box("metal", 2.1, 0.82, 5.5, 0, 0.81, 0.45, dark);
    k.extrude(
      "metal",
      [
        [-3.5, 0.55],
        [-3.3, 0.45],
        [-2.2, 0.45],
        [-2.2, 1.5],
      ],
      2.1,
      Object.assign({ ry: -PI / 2 }, ol),
    );
    // upper hull over the tracks: side profile (z, y) extruded across the full 3.3 m — glacis continues
    // up to the flat deck, raked rear plate; the tracks run underneath it
    k.extrude(
      "metal",
      [
        [-2.583, 1.22],
        [-2.2, 1.5],
        [2.95, 1.55],
        [3.2, 1.22],
      ],
      3.3,
      Object.assign({ ry: -PI / 2 }, ol),
    );
    k.box("metal", 2.1, 0.8, 0.08, 0, 0.8, 3.18, ol); // rear plate
    // driver's hatch + periscopes at the top of the glacis, engine deck grilles behind the turret
    k.cyl(
      "metal",
      0.3,
      0.3,
      0.06,
      -0.55,
      1.56,
      -2.05,
      Object.assign({ seg: 10 }, ol),
    );
    for (let i = 0; i < 3; i++)
      k.box("glass", 0.16, 0.06, 0.03, -0.9 + i * 0.3, 1.6, -2.28, {
        color: burnt ? 0x121110 : 0x3a4a48,
      });
    for (let i = 0; i < 7; i++)
      k.box("metal", 2.2, 0.03, 0.08, 0, 1.57, 1.3 + i * 0.22, dark);
    k.box("metal", 0.9, 0.22, 0.5, 0.9, 1.66, 2.55, ol); // air filter box
    // headlight clusters with brush guards, tow shackles, the front plate star
    for (const sd of [-1, 1]) {
      k.cyl("metal", 0.1, 0.1, 0.14, sd * 1.3, 1.36, -2.62, {
        rx: PI / 2,
        seg: 8,
        color: 0x2a2a26,
      });
      k.cyl(burnt ? "plain" : "glass", 0.08, 0.08, 0.02, sd * 1.3, 1.36, -2.7, {
        rx: PI / 2,
        seg: 8,
        color: burnt ? 0x0c0b0a : 0xa0a090,
      });
      k.torus("metal", 0.14, 0.015, sd * 1.3, 1.36, -2.7, {
        arc: PI,
        rseg: 3,
        tseg: 6,
        color: 0x2a2a26,
      });
      k.torus("metal", 0.1, 0.03, sd * 0.7, 0.72, -3.42, {
        ry: PI / 2,
        rseg: 4,
        tseg: 8,
        color: 0x2a2622,
        rust: 0.8,
      });
    }
    if (!burnt) {
      k.quad("army_star", 0.6, 0.6, 0, 1.04, -2.87, {
        mat: "trim",
        rx: -0.94,
        ry: PI,
        grime: 0.35,
      });
      for (const sd of [-1, 1])
        if (!(v === 2 && sd > 0))
          k.quad("army_door", 1.2, 0.3, sd * 1.725, 0.98, -1.45, {
            mat: "trim",
            ry: (sd * PI) / 2,
            grime: 0.35,
          });
    }
    // exhaust grilles on the rear plate, a tow cable coiled on the deck
    k.box("metal", 1.6, 0.35, 0.05, 0, 1.12, 3.25, dark);
    k.torus("metal", 0.32, 0.03, -1.1, 1.6, 1.9, {
      rx: PI / 2,
      rseg: 4,
      tseg: 12,
      color: 0x3a3228,
      rust: 0.8,
    });
    // running gear, per side: 6 road wheels, drive sprocket (rear) & idler (front), return rollers,
    // the track belt (top run with grousers, ground run, wrapped ends) and the armour skirt over it
    for (const sd of [-1, 1]) {
      const tx = sd * 1.37;
      const thrown = v === 2 && sd > 0;
      for (let i = 0; i < 6; i++) {
        const wz = -2.15 + i * 0.86;
        // one cylinder per wheel (rubber-rimmed look baked by colour: dark rim, olive disc) + a hub
        const bare = thrown || burnt;
        k.cyl("metal", 0.34, 0.34, 0.42, tx, 0.4, wz, {
          rz: PI / 2,
          seg: 9,
          colorFn: (x, y, z) =>
            Math.hypot(y - 0.4, z - wz) > 0.27 && !bare
              ? C.rubber
              : burnt
                ? 0x1c1a18
                : 0x3a3c30,
          rust: bare ? 0.85 : 0.5,
        });
        k.cyl("metal", 0.1, 0.1, 0.46, tx, 0.4, wz, {
          rz: PI / 2,
          seg: 6,
          color: 0x2a2a26,
          rust: 0.7,
        });
      }
      for (const ez of [-2.95, 2.95])
        k.cyl("metal", 0.36, 0.36, 0.4, tx, 0.62, ez, {
          rz: PI / 2,
          seg: 10,
          color: 0x2e2c28,
          rust: 0.8,
        });
      if (!thrown) {
        k.box("metal", 0.56, 0.07, 5.9, tx, 1.08, 0, trk); // top run
        k.box("metal", 0.56, 0.07, 4.9, tx, 0.04, 0, trk); // ground run
        for (let i = 0; i < 13; i++)
          k.box("metal", 0.58, 0.04, 0.1, tx, 1.13, -2.8 + i * 0.466, trk); // grousers
        for (const ez of [-1, 1])
          for (let j = 0; j < 4; j++) {
            // wrap round sprocket / idler
            const a = -PI / 2 + ((j + 0.5) / 4) * PI,
              R = 0.46;
            k.box(
              "metal",
              0.56,
              0.07,
              0.4,
              tx,
              0.6 + Math.sin(a) * R,
              ez * (2.95 + Math.cos(a) * R * 0.95),
              {
                rx: ez * a,
                color: trk.color,
                rust: trk.rust,
                grime: trk.grime,
              },
            );
          }
      }
      // skirt (fender) over the top run; the thrown side has lost its skirt plates
      k.box("metal", 0.66, 0.05, 6.3, tx + sd * 0.02, 1.22, -0.05, ol);
      if (!thrown)
        for (let i = 0; i < 4; i++)
          if (!(burnt && i === 2))
            k.box(
              "metal",
              0.04,
              0.42,
              1.5,
              sd * 1.7,
              0.98,
              -2.2 + i * 1.5,
              Object.assign({ rz: sd * 0.03 }, ol),
            );
    }
    if (v === 2) {
      // the belt that came off: lying unrolled on the road ahead of the right-hand track, links crumpled
      const links = 26;
      for (let i = 0; i < links; i++) {
        const z = -3.2 - i * 0.25,
          x = 1.45 + Math.sin(i * 0.35) * 0.35 + i * 0.03;
        const kink = i > 18 ? (i - 18) * 0.12 : 0;
        k.box(
          "metal",
          0.56,
          0.06,
          0.24,
          x,
          0.04 + (i > 20 ? Math.min(0.5, kink * 0.8) : 0),
          z + kink * 0.2,
          {
            ry: Math.sin(i * 0.35) * 0.3,
            rx: kink * 0.6,
            color: TRACK,
            rust: 0.75,
            grime: 0.3,
          },
        );
        k.box(
          "metal",
          0.6,
          0.035,
          0.08,
          x,
          0.085 + (i > 20 ? Math.min(0.5, kink * 0.8) : 0),
          z + kink * 0.2,
          {
            ry: Math.sin(i * 0.35) * 0.3,
            rx: kink * 0.6,
            color: TRACK,
            rust: 0.75,
          },
        );
      }
    }
    return k;
  }
  D("army_tank", (k, r, v) => {
    v = v % 3;
    const OL = pick(r, OLIVES);
    const burnt = v === 1;
    k.include(tankHull(r, v, OL));
    const tur = tankTurret(r, burnt, OL);
    const cols = [{ w: 3.3, d: 6.9, h: 1.55, cz: -0.1 }];
    if (v === 1) {
      // turret blown off its ring: lying upside-down and tilted beside the hull, gun in the air
      k.include(tur, {
        x: 2.9,
        y: 1.02,
        z: 1.1,
        ry: -2.3,
        rz: PI - 0.28,
        rx: 0.2,
      });
      k.meta.turret = {
        x: 2.9,
        y: 1.02,
        z: 1.1,
        ry: -2.3,
        rz: PI - 0.28,
        rx: 0.2,
      };
      k.cyl("plain", 1.0, 1.0, 0.03, 0, 1.56, -0.2, {
        seg: 16,
        color: 0x0a0908,
        ao: [1, 1],
      }); // empty turret ring
      k.torus("metal", 1.02, 0.06, 0, 1.56, -0.2, {
        rx: PI / 2,
        rseg: 4,
        tseg: 16,
        color: 0x1a1612,
        rust: 1,
      });
      cols.push({ w: 2.4, d: 2.8, h: 1.1, cx: 3.2, cz: 1.4 });
      // scorch round the hull
      k.cyl("concrete", 1, 1, 0.02, 0, 0.012, 0, {
        seg: 14,
        s: [2.9, 1, 4.6],
        color: 0x1c1a17,
        grime: 0.4,
        ao: [1, 1],
      });
    } else {
      const trav =
        v === 2
          ? -1.25 + (r() - 0.5) * 0.3
          : (r() < 0.5 ? -1 : 1) * (0.25 + r() * 0.45);
      k.include(tur, {
        x: 0,
        y: 1.55,
        z: -0.2,
        ry: trav,
        rx: v === 2 ? 0.03 : -0.02,
      });
      k.meta.turret = {
        x: 0,
        y: 1.55,
        z: -0.2,
        ry: trav,
        rx: v === 2 ? 0.03 : -0.02,
        rz: 0,
      };
      cols.push({ w: 2.3, d: 2.9, h: 0.9, y0: 1.55, cz: 0 });
      // what the crew left on the engine deck
      k.abox("crate_army", 0.8, 0.45, 0.55, -0.7, 1.78, 2.3, { ry: 0.2 });
      jerrycan(k, 1.45, 1.26, 2.9, 0, 0x3e4430);
    }
    k.meta.colliders = cols;
    k.meta.surface = "metal";
    // detail in the medium tier (190 m, no shadow pass); a ~90-tri stand-in carries the silhouette and the
    // shadow out to the long-range tier's 700 m (it sits inside the detailed hull, so it never shows up close)
    k.meta.tier = "medium";
    k.meta.farProxy = "army_tank_far";
    k.meta.color = OL;
    k.meta.container = burnt ? null : { name: "Army Tank", loot: "ammo_box" };
    k.meta.interactY = 1.4;
    k.meta.size = [3.4, 7.0, 2.6];
  });

  // Long-range stand-in: lower tub, deck, turret block and gun, matching the detailed variant's traverse.
  D("army_tank_far", (k, r, v) => {
    v = v % 3;
    const det = X.proto("army_tank", v).meta;
    const burnt = v === 1;
    const ol = { color: burnt ? BURNT : det.color, grime: 0.2, ao: [0.7, 1.4] };
    k.box("metal", 1.9, 0.8, 5.3, 0, 0.8, 0.3, ol);
    k.box("metal", 3.0, 0.3, 4.9, 0, 1.36, 0.45, ol);
    k.box("metal", 2.6, 0.6, 5.0, 0, 0.5, 0, {
      color: TRACK,
      grime: 0.2,
      ao: [0.6, 1],
    });
    const t = new X.Kit(59);
    t.box("metal", 1.5, 0.5, 2.0, 0, 0.26, 0.3, ol);
    t.cyl(
      "metal",
      0.1,
      0.1,
      4.0,
      0,
      0.44,
      -3.4,
      Object.assign({ rx: PI / 2, seg: 5 }, ol),
    );
    k.include(t, det.turret);
    k.meta.collider = null;
    k.meta.tier = "large";
  });

  // ------------------------------------------------------------------
  // ARMY CHECKPOINT: booth at the origin (front -Z faces the traffic),
  // boom pivot beside it, the arm reaching across +X over one lane.
  // ------------------------------------------------------------------
