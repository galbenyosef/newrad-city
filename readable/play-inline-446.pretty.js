/* src/props/28_military.js */
/* =====================================================================
 * props / 28_military.js — THE ARMY THAT HELD THE LINE ON MARCH 5th.
 *   army_tank       — old-world US Army main battle tank (olive drab, cast
 *                     rounded turret, long 90 mm gun with a fume extractor,
 *                     commander's cupola with a .50 cal, searchlight,
 *                     stowage bins, bedrolls & jerrycans, skirted tracks on
 *                     six road wheels). v0 abandoned (turret traversed,
 *                     hatches open — lootable), v1 burnt out with the turret
 *                     blown off and lying upside-down beside the hull, v2
 *                     track thrown (the belt unrolled across the road, the
 *                     road wheels bare, the gun swung onto a building).
 *   army_checkpoint — sheet-metal guard booth with a HALT / CHECKPOINT board,
 *                     roof searchlight and sandbag skirt + a striped boom
 *                     barrier across one lane. v0 boom down, v1 boom snapped
 *                     (the stub up, the arm on the asphalt).
 *   mg_nest         — horseshoe of sandbags (3 courses) round a .50 cal on
 *                     its tripod, ammo cans and spent brass.
 *   searchlight     — Army tripod searchlight: v0 standing (aimed at the
 *                     sky), v1 knocked over, lens smashed.
 * Local frame as everywhere in props: y = 0 ground, the FRONT faces -Z.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;
  const pick = (r, a) => a[(r() * a.length) | 0];

  const OLIVES = [0x4a5236, 0x505838, 0x464e34];
  const BURNT = 0x26221e;
  const TRACK = 0x2a2724;

  // ------------------------------------------------------------------
  // .50 cal heavy machine gun (receiver + barrel + handles), local: barrel along -Z
  // ------------------------------------------------------------------
  function heavyMG(k, x, y, z, ry, rx, burnt) {
    const s = new X.Kit(41);
    const gm = {
      color: burnt ? 0x1c1a18 : 0x2a2a28,
      rust: burnt ? 0.9 : 0.45,
      grime: 0.3,
    };
    s.box("metal", 0.16, 0.16, 0.62, 0, 0, 0.05, gm); // receiver
    s.cyl(
      "metal",
      0.032,
      0.032,
      1.05,
      0,
      0.01,
      -0.8,
      Object.assign({ rx: PI / 2, seg: 6 }, gm),
    ); // barrel
    s.cyl(
      "metal",
      0.05,
      0.05,
      0.3,
      0,
      0.01,
      -0.42,
      Object.assign({ rx: PI / 2, seg: 8 }, gm),
    ); // perforated jacket
    s.cyl(
      "metal",
      0.045,
      0.04,
      0.08,
      0,
      0.01,
      -1.32,
      Object.assign({ rx: PI / 2, seg: 6 }, gm),
    ); // flash hider
    for (const sd of [-1, 1])
      s.seg("metal", [sd * 0.06, 0, 0.38], [sd * 0.07, -0.02, 0.5], 0.018, gm); // spade grips
    s.box("metal", 0.14, 0.12, 0.2, 0.15, -0.04, 0.02, {
      color: burnt ? 0x1c1a18 : 0x3a4028,
      rust: 0.4,
    }); // ammo can
    for (let i = 0; i < 5; i++)
      s.box(
        "chrome",
        0.022,
        0.03,
        0.09,
        0.09 - i * 0.022,
        -0.02 - i * 0.012,
        0.02,
        { color: burnt ? 0x2a2420 : 0xa08040 },
      ); // belt
    k.include(s, { x, y, z, ry: ry || 0, rx: rx || 0 });
  }
  function sandbag(k, r, x, y, z, ry, burnt) {
    k.sphere("fabric", 0.34, x, y + 0.1, z, {
      s: [1.1, 0.34, 0.58],
      ry: ry + (r() - 0.5) * 0.15,
      color: burnt ? 0x3a342c : pick(r, [0xa89870, 0x9a8a62, 0x8a7c58]),
      wseg: 6,
      hseg: 4,
      grime: 0.25,
    });
  }
  function jerrycan(k, x, y, z, ry, col) {
    k.boxB("metal", 0.34, 0.46, 0.16, x, y, z, {
      ry,
      color: col,
      rust: 0.45,
      grime: 0.3,
    });
    k.box("metal", 0.12, 0.04, 0.04, x, y + 0.49, z, { ry, color: 0x22231e });
  }

  // ------------------------------------------------------------------
  // TANK. Hull 6.8 m long, 3.3 m over the tracks, deck at 1.55 m; turret
  // ring at z = -0.2. Built in sub-kits so the turret can traverse / come off.
  // ------------------------------------------------------------------
  function tankTurret(r, burnt, OL) {
    const t = new X.Kit(43);
    const ol = {
      color: burnt ? BURNT : OL,
      rust: burnt ? 0.95 : 0.32,
      grime: 0.36,
    };
    const dark = { color: burnt ? 0x161412 : 0x22231e, rust: 0.5, grime: 0.25 };
    // cast turret: a squashed dome stretched fore-aft, with a bustle behind and a heavy mantlet in front
    t.lathe(
      "metal",
      [
        [0, 0],
        [1.02, 0],
        [1.14, 0.16],
        [1.12, 0.46],
        [0.9, 0.74],
        [0.5, 0.86],
        [0, 0.88],
      ],
      0,
      0,
      0.1,
      Object.assign({ seg: 16, s: [1, 1, 1.32] }, ol),
    );
    t.cbox(
      "metal",
      1.7,
      0.62,
      0.9,
      0,
      0.36,
      1.45,
      Object.assign({ bevel: 0.1 }, ol),
    ); // bustle
    t.cbox(
      "metal",
      1.05,
      0.56,
      0.42,
      0,
      0.42,
      -1.36,
      Object.assign({ bevel: 0.08 }, ol),
    ); // mantlet
    // the 90 mm gun: tube, fume-extractor bulge two thirds out, muzzle brake
    t.cyl(
      "metal",
      0.115,
      0.13,
      4.3,
      0,
      0.44,
      -3.55,
      Object.assign({ rx: PI / 2, seg: 10 }, ol),
    );
    t.cyl(
      "metal",
      0.17,
      0.17,
      0.62,
      0,
      0.44,
      -3.3,
      Object.assign({ rx: PI / 2, seg: 10 }, ol),
    );
    t.cyl(
      "metal",
      0.16,
      0.16,
      0.34,
      0,
      0.44,
      -5.72,
      Object.assign({ rx: PI / 2, seg: 10 }, dark),
    );
    t.box("metal", 0.36, 0.08, 0.2, 0, 0.44, -5.72, dark);
    t.cyl("plain", 0.1, 0.1, 0.02, 0, 0.44, -5.9, {
      rx: PI / 2,
      seg: 8,
      color: 0x0a0908,
      ao: [1, 1],
    }); // bore
    // coaxial MG port + sight box on the mantlet
    t.cyl(
      "metal",
      0.03,
      0.03,
      0.3,
      0.36,
      0.34,
      -1.62,
      Object.assign({ rx: PI / 2, seg: 6 }, dark),
    );
    t.box("metal", 0.24, 0.2, 0.3, -0.62, 0.8, -0.6, ol);
    t.box("glass", 0.2, 0.1, 0.02, -0.62, 0.84, -0.76, {
      color: burnt ? 0x121110 : 0x3a4a48,
    });
    // commander's cupola (right) with the hatch flung open and the .50 cal on its ring
    t.cyl(
      "metal",
      0.36,
      0.4,
      0.3,
      0.45,
      0.98,
      0.35,
      Object.assign({ seg: 12 }, ol),
    );
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.45;
      t.box(
        "glass",
        0.1,
        0.06,
        0.02,
        0.45 + Math.sin(a) * 0.37,
        1.0,
        0.35 - Math.cos(a) * 0.37,
        { ry: -a, color: burnt ? 0x121110 : 0x4a5a58 },
      );
    }
    t.cyl("plain", 0.3, 0.3, 0.02, 0.45, 1.14, 0.35, {
      seg: 12,
      color: 0x0c0b0a,
      ao: [1, 1],
    }); // open hatch: dark inside
    t.cyl(
      "metal",
      0.32,
      0.32,
      0.06,
      0.45,
      1.36,
      0.72,
      Object.assign({ rx: -1.35, seg: 12 }, ol),
    ); // lid standing up
    if (!burnt || r() < 0.4)
      heavyMG(
        t,
        0.45,
        1.42,
        0.05,
        (r() - 0.5) * 0.8,
        burnt ? 0.25 : -0.12,
        burnt,
      );
    // loader's hatch (left) half open
    t.cyl(
      "metal",
      0.28,
      0.28,
      0.05,
      -0.45,
      0.9,
      0.5,
      Object.assign({ seg: 10, rx: -0.5 }, ol),
    );
    // searchlight on the left cheek, stowage bins on the bustle, antennas
    t.cyl(
      "metal",
      0.17,
      0.17,
      0.32,
      -0.95,
      0.9,
      -0.95,
      Object.assign({ rx: PI / 2, seg: 10 }, dark),
    );
    t.cyl(burnt ? "plain" : "glass", 0.14, 0.14, 0.02, -0.95, 0.9, -1.12, {
      rx: PI / 2,
      seg: 10,
      color: burnt ? 0x0c0b0a : 0x9aa8a0,
    });
    for (const sd of [-1, 1])
      t.box(
        "metal",
        0.34,
        0.42,
        1.0,
        sd * 1.03,
        0.4,
        1.35,
        Object.assign({ bevel: 0.03 }, ol),
      );
    t.box("metal", 1.72, 0.06, 0.86, 0, 0.7, 1.45, dark); // bustle rack
    if (!burnt) {
      for (let i = 0; i < 2; i++)
        t.cyl("fabric", 0.16, 0.16, 1.2, (i - 0.5) * 0.36, 0.86, 1.75, {
          rz: PI / 2,
          seg: 8,
          color: pick(r, [0x5c5a44, 0x4e5038, 0x6a6048]),
          grime: 0.4,
        }); // bedrolls
      jerrycan(t, 0.55, 0.73, 1.2, 0.1, 0x3e4430);
      t.box("fabric", 0.9, 0.12, 0.7, -0.3, 0.8, 1.2, {
        color: 0x5a5840,
        grime: 0.5,
        rz: 0.08,
      }); // tarp bundle
    }
    t.seg(
      "metal",
      [-0.62, 0.72, 1.7],
      [-0.72 + (r() - 0.5) * 0.3, 3.1, 1.95],
      0.012,
      { color: 0x1a1a18 },
    );
    t.seg("metal", [0.62, 0.72, 1.7], [0.9, 2.3, 2.5], 0.012, {
      color: 0x1a1a18,
    }); // bent whip
    // markings: star on each cheek + a turret number
    if (!burnt)
      for (const sd of [-1, 1])
        t.quad("army_star", 0.55, 0.55, sd * 1.155, 0.42, 0.25, {
          mat: "trim",
          ry: (sd * PI) / 2,
          grime: 0.35,
        });
    return t;
  }
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
  D("army_checkpoint", (k, r, v) => {
    v = v % 2;
    const OL = pick(r, OLIVES);
    const ol = { color: OL, rust: 0.45, grime: 0.4 };
    const mp = {
      color: pick(r, [0xcfc8b2, 0xc4bea8, 0xd6cfb8]),
      rust: 0.4,
      grime: 0.45,
    }; // MP white upper works
    const dark = { color: 0x22231e, rust: 0.5, grime: 0.3 };
    // booth: olive corrugated lower walls, white-painted window band & header, overhanging roof
    const W = 1.7,
      H = 2.5;
    k.box("concrete", W + 0.3, 0.15, W + 0.3, 0, 0.075, 0, {
      color: 0x9a968a,
      grime: 0.45,
    });
    for (const [x, z, ry] of [
      [0, -W / 2, 0],
      [0, W / 2, PI],
      [-W / 2, 0, PI / 2],
      [W / 2, 0, -PI / 2],
    ]) {
      const s = new X.Kit(47);
      s.box(
        "metal",
        W,
        1.0,
        0.05,
        0,
        0.65,
        0,
        Object.assign({ segs: [8, 1, 1] }, ol),
      ); // lower panel
      for (let i = 0; i < 9; i++)
        s.box("metal", 0.035, 1.0, 0.07, -W / 2 + 0.1 + i * 0.19, 0.65, 0, ol); // corrugation ribs
      s.box("metal", W, 0.35, 0.05, 0, H - 0.25, 0, mp); // header
      s.box("metal", W, 0.06, 0.08, 0, 1.17, 0, mp); // sill
      const broken = ry === PI / 2 && v === 1;
      if (ry !== PI)
        s.box(broken ? "plain" : "glass", W - 0.2, 0.9, 0.02, 0, 1.62, 0, {
          color: broken ? 0x0c0b0a : 0x2a3432,
          ao: [1, 1],
        });
      else s.box("metal", W, 0.9, 0.05, 0, 1.62, 0, mp);
      for (const e of [-1, 1])
        s.box(
          "metal",
          0.07,
          H - 0.1,
          0.07,
          e * (W / 2 - 0.03),
          (H - 0.1) / 2 + 0.15,
          0,
          mp,
        );
      k.include(s, { x, z, ry });
    }
    k.box(
      "metal",
      W + 0.5,
      0.08,
      W + 0.5,
      0,
      H + 0.04,
      0,
      Object.assign({ rz: 0.02 }, mp),
    ); // roof
    k.box("metal", W + 0.52, 0.1, 0.04, 0, H - 0.01, -W / 2 - 0.25, {
      color: 0xa82418,
      rust: 0.35,
      grime: 0.4,
    }); // red fascia
    k.box("plain", W - 0.1, 0.02, W - 0.1, 0, 0.16, 0, {
      color: 0x121110,
      ao: [1, 1],
    }); // dark floor
    k.box("wood", 1.2, 0.05, 0.4, 0, 1.05, -0.55, {
      color: 0x4a3e30,
      grime: 0.5,
    }); // counter inside
    // CHECKPOINT board over the window, facing the traffic; a stencilled plate on the side
    k.quad("checkpoint_sign", 1.5, 0.75, 0, H + 0.48, -W / 2 - 0.06, {
      ry: PI,
      grime: 0.3,
    });
    k.box("metal", 1.56, 0.8, 0.04, 0, H + 0.48, -W / 2 - 0.02, dark);
    k.quad("army_door", 1.2, 0.3, W / 2 + 0.03, 0.8, 0, {
      mat: "trim",
      ry: PI / 2,
      grime: 0.35,
    });
    // roof searchlight
    k.cyl("metal", 0.05, 0.05, 0.3, -0.5, H + 0.23, 0.4, {
      seg: 6,
      color: 0x2a2a26,
    });
    k.cyl("metal", 0.2, 0.2, 0.34, -0.5, H + 0.46, 0.4, {
      rx: PI / 2 - 0.35,
      ry: 0.6,
      seg: 10,
      color: OL,
      rust: 0.5,
    });
    k.cyl("glass", 0.17, 0.17, 0.02, -0.5 - 0.1, H + 0.53, 0.25, {
      rx: PI / 2 - 0.35,
      ry: 0.6,
      seg: 10,
      color: 0x8a948c,
    });
    // sandbag skirt along the traffic side
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 4; i++)
        sandbag(
          k,
          r,
          -0.8 + i * 0.52 + (row % 2) * 0.26,
          row * 0.18,
          -W / 2 - 0.45,
          0,
          false,
        );
    // boom barrier: pedestal with counterweight, striped arm over the lane
    const px = W / 2 + 0.55,
      py = 1.0,
      AL = 3.8;
    k.box("metal", 0.34, 1.0, 0.34, px, 0.5, -0.2, {
      color: 0xc8b048,
      rust: 0.5,
      grime: 0.4,
    });
    k.box("concrete", 0.6, 0.12, 0.6, px, 0.06, -0.2, { color: 0x9a968a });
    const armStripes = (s, len, o) => {
      const n = Math.round(len / 0.5);
      for (let i = 0; i < n; i++)
        s.box(
          "metal",
          len / n,
          0.1,
          0.08,
          -len / 2 + ((i + 0.5) * len) / n,
          0,
          0,
          Object.assign(
            { color: i % 2 ? 0xd8d0c0 : 0xa82418, rust: 0.3, grime: 0.35 },
            o || {},
          ),
        );
    };
    const cw = new X.Kit(49);
    if (v === 0) {
      k.box("metal", 0.5, 0.26, 0.2, px - 0.45, py, -0.2, dark); // counterweight
      armStripes(cw, AL, {});
      cw.box("metal", 0.08, 0.06, 0.1, AL / 2, -0.05, 0, dark);
      k.include(cw, { x: px + AL / 2 - 0.2, y: py, z: -0.2, rz: -0.02 });
      // the rest post the arm drops onto
      k.box("metal", 0.1, 0.9, 0.1, px + AL - 0.1, 0.45, -0.2, {
        color: 0xc8b048,
        rust: 0.5,
      });
    } else {
      // snapped: the stub still up at 70°, the arm lying across the lane
      const stub = new X.Kit(51);
      armStripes(stub, 1.3, {});
      stub.box("metal", 0.5, 0.26, 0.2, -0.9, 0, 0, dark);
      k.include(stub, { x: px + 0.22, y: py + 0.62, z: -0.2, rz: 1.2 });
      const arm = new X.Kit(53);
      armStripes(arm, AL - 1.4, {});
      k.include(arm, {
        x: px + 2.4,
        y: 0.06,
        z: -0.5 + (r() - 0.5) * 0.4,
        ry: 0.25,
        rx: 0.02,
      });
    }
    k.meta.collider = { w: W + 0.3, d: W + 0.3, h: H + 0.1 };
    k.meta.surface = "metal";
    k.meta.tier = "medium";
    k.meta.container = { name: "Checkpoint Footlocker", loot: "ammo_box" };
    k.meta.interactY = 1.1;
    k.meta.interactZ = -W / 2 - 0.2; // searched through the front window, over the counter
    k.meta.glows = [];
  });

  // ------------------------------------------------------------------
  // MACHINE-GUN NEST: horseshoe of sandbags opening toward +Z (behind),
  // the gun on its tripod over the parapet facing -Z.
  // ------------------------------------------------------------------
  D("mg_nest", (k, r, v) => {
    v = v % 2;
    const R = 1.45;
    for (let row = 0; row < 3; row++) {
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = -PI * 0.62 + ((i + (row % 2) * 0.5) / (n - 1)) * PI * 1.24;
        if (v === 1 && row === 2 && i === 2) continue; // shot-out gap
        sandbag(k, r, Math.sin(a) * R, row * 0.17, -Math.cos(a) * R, -a, false);
      }
    }
    // tripod + gun over the front parapet
    const g = { color: 0x2a2a28, rust: 0.5, grime: 0.3 };
    for (const a of [0, 2.1, -2.1])
      k.seg(
        "metal",
        [0, 0.72, -0.6],
        [Math.sin(a) * 0.55, 0.02, -0.6 + Math.cos(a) * 0.5],
        0.02,
        g,
      );
    if (v === 0) heavyMG(k, 0, 0.82, -0.75, (r() - 0.5) * 0.5, -0.06, false);
    else heavyMG(k, 0.3, 0.12, 0.2, 1.4, 0, false); // knocked off its mount
    // ammo cans, spent brass, a helmet
    for (let i = 0; i < 3; i++)
      k.box(
        "metal",
        0.28,
        0.18,
        0.14,
        -0.6 + i * 0.32,
        0.09,
        0.35 + (r() - 0.5) * 0.2,
        { ry: (r() - 0.5) * 0.6, color: 0x3a4028, rust: 0.45 },
      );
    for (let i = 0; i < 14; i++)
      k.cyl(
        "chrome",
        0.012,
        0.012,
        0.1,
        (r() - 0.5) * 1.4,
        0.015,
        (r() - 0.3) * 1.2,
        { rz: PI / 2, ry: r() * 6, seg: 4, color: 0x9a7a3a },
      );
    k.sphere("metal", 0.15, 0.55, 0.05, 0.1, {
      phiLength: PI / 2,
      wseg: 8,
      hseg: 4,
      color: 0x3e4430,
      rust: 0.4,
      rx: 0.3 + PI,
    });
    k.meta.colliders = [
      { w: 1.2, d: 0.6, h: 0.55, cz: -R + 0.2 },
      { w: 0.6, d: 1.4, h: 0.55, cx: -R + 0.25, cz: -0.3 },
      { w: 0.6, d: 1.4, h: 0.55, cx: R - 0.25, cz: -0.3 },
    ];
    k.meta.surface = "dirt";
    k.meta.tier = "medium";
    k.meta.container = { name: "Ammo Can", loot: "ammo_box" };
    k.meta.interactY = 0.2;
  });

  // ------------------------------------------------------------------
  // SEARCHLIGHT on a tripod (v0 standing, aimed skyward; v1 knocked over).
  // ------------------------------------------------------------------
  D("searchlight", (k, r, v) => {
    v = v % 2;
    const OL = pick(r, OLIVES);
    const s = new X.Kit(55);
    const g = { color: 0x2a2a26, rust: 0.55, grime: 0.3 };
    for (const a of [0, 2.1, -2.1])
      s.seg(
        "metal",
        [0, 1.3, 0],
        [Math.sin(a) * 0.7, 0, Math.cos(a) * 0.7],
        0.03,
        g,
      );
    s.cyl("metal", 0.06, 0.06, 0.3, 0, 1.42, 0, { seg: 8, color: 0x2a2a26 });
    s.torus("metal", 0.4, 0.03, 0, 1.9, 0, {
      arc: PI,
      rseg: 4,
      tseg: 8,
      color: 0x2a2a26,
      rz: PI,
    }); // yoke
    const lamp = new X.Kit(57);
    lamp.cyl("metal", 0.36, 0.3, 0.6, 0, 0, 0, {
      rx: PI / 2,
      seg: 14,
      color: OL,
      rust: 0.45,
      grime: 0.35,
    });
    lamp.cyl("metal", 0.38, 0.38, 0.06, 0, 0, -0.3, {
      rx: PI / 2,
      seg: 14,
      color: 0x2a2a26,
    });
    lamp.cyl(v === 1 ? "plain" : "glass", 0.33, 0.33, 0.02, 0, 0, -0.33, {
      rx: PI / 2,
      seg: 14,
      color: v === 1 ? 0x0c0b0a : 0x9aa8a8,
    });
    lamp.box("metal", 0.3, 0.14, 0.12, 0, 0.3, 0.1, g);
    s.include(lamp, { y: 1.9, rx: 0.55 });
    if (v === 0) k.include(s);
    else {
      k.include(s, { y: 0.3, rz: PI / 2 - 0.15, x: 1.1 });
      for (let i = 0; i < 6; i++)
        k.box(
          "glass",
          0.08 + r() * 0.1,
          0.01,
          0.06 + r() * 0.08,
          2.4 + (r() - 0.5) * 0.8,
          0.01,
          (r() - 0.5) * 0.8,
          { ry: r() * 3, color: 0x9aa8a8 },
        );
    }
    k.meta.collider = v === 0 ? { w: 0.8, d: 0.8, h: 2.1 } : null;
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });
})();
