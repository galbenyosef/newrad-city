// play-inline-449 03 — color
// Lines 559-896 of readable/play-inline-449.pretty.js (statement-aligned).
  D("file_cabinet", (k, r, v) => {
    // four-drawer steel filing cabinet: rounded carcass on a recessed plinth, drawer fronts with pull handles
    // and label holders (typed cards), a lock plug at the top; the odd drawer yanked out with folders in it
    const o = {
      color: [0x6a6e66, 0x5a6a5a, 0x8a8270][v % 3],
      rust: 0.3,
      grime: 0.3,
    };
    const n = 4;
    k.boxB("metal", 0.44, 0.06, 0.6, 0, 0, 0.02, { color: 0x2a2a28 }); // plinth
    k.cbox(
      "metal",
      0.48,
      1.29,
      0.65,
      0,
      0.06 + 0.645,
      0,
      Object.assign({ bevel: 0.02 }, o),
    );
    k.cyl("metal", 0.014, 0.014, 0.02, 0.17, 1.3, -0.33, {
      rx: PI / 2,
      seg: 8,
      color: 0xb8b4a4,
    }); // lock plug
    for (let i = 0; i < n; i++) {
      const open = r() < 0.2 ? 0.28 : 0;
      const dy = 1.17 - i * 0.31;
      k.cbox("metal", 0.44, 0.285, 0.03, 0, dy, -0.335 - open, {
        bevel: 0.008,
        color: 0x5a5e56,
        rust: 0.22,
      });
      k.box("metal", 0.16, 0.022, 0.035, 0, dy + 0.06, -0.36 - open, {
        color: C.chrome,
      }); // pull
      for (const sx of [-0.07, 0.07])
        k.box("metal", 0.012, 0.03, 0.03, sx, dy + 0.06, -0.35 - open, {
          color: C.chrome,
        });
      k.box("metal", 0.11, 0.05, 0.006, 0, dy + 0.1, -0.352 - open, {
        color: 0x9a9a90,
      }); // label frame
      k.box("plain", 0.095, 0.035, 0.004, 0, dy + 0.1, -0.356 - open, {
        color: 0xe8e0c8,
      });
      if (open) {
        k.boxB("metal", 0.4, 0.24, open, 0, dy - 0.12, -0.33 - open / 2, o);
        for (let f = 0; f < 6; f++)
          k.box(
            "plain",
            0.36,
            0.2 + r() * 0.04,
            0.012,
            0,
            dy - 0.03,
            -0.35 - open + 0.03 + f * 0.04,
            {
              rx: (r() - 0.5) * 0.3,
              color: [0xc8b078, 0xd8c890, 0xb89868][(r() * 3) | 0],
            },
          );
      }
    }
    if (r() < 0.3)
      k.box("plain", 0.22, 0.012, 0.3, 0.05, 1.356, 0.05, {
        ry: 0.3,
        color: 0xe0d8c0,
      }); // papers on top
    k.meta.collider = { w: 0.5, d: 0.66, h: 1.35 };
    k.meta.container = { name: "Filing Cabinet", loot: "file_cabinet" };
    k.meta.interactY = 1.0;
    k.meta.tier = "small";
  });

  // ---------------- dresser (wooden chest of drawers) ----------------
  // v0 plain walnut chest with a mirror on a harp frame, v1 no mirror (lamp + doily on top), v2 painted
  // nursery white with a drawer pulled out. Container-capable (loot table `dresser`).
  D("dresser", (k, r, v) => {
    const wood = {
      color: [0x5a3a22, 0x6a4a2a, 0xc8c0b0][v % 3],
      rust: 0,
      grime: 0.3,
    };
    const dark = { color: v % 3 === 2 ? 0x9a948a : 0x3a2414, grime: 0.3 };
    const W = 1.1,
      H = 0.86,
      Dd = 0.48;
    k.boxB("wood", W - 0.06, 0.08, Dd - 0.04, 0, 0, 0.02, dark); // plinth
    k.cbox(
      "wood",
      W,
      H - 0.1,
      Dd,
      0,
      0.08 + (H - 0.1) / 2,
      0,
      Object.assign({ bevel: 0.012 }, wood),
    ); // carcass
    k.cbox(
      "wood",
      W + 0.04,
      0.03,
      Dd + 0.03,
      0,
      H + 0.005,
      0,
      Object.assign({ bevel: 0.008 }, dark),
    ); // top
    const rows = [
      [0.68, 2],
      [0.47, 1],
      [0.27, 1],
    ];
    let n = 0;
    for (const [dy, cols] of rows) {
      for (let c = 0; c < cols; c++) {
        const w = cols === 2 ? W / 2 - 0.06 : W - 0.08,
          x = cols === 2 ? (c ? 1 : -1) * (W / 4) : 0;
        const open = (v % 3 === 2 && n === 2) || r() < 0.12 ? 0.18 : 0;
        k.cbox(
          "wood",
          w,
          0.17,
          0.025,
          x,
          dy,
          -Dd / 2 - 0.006 - open,
          Object.assign({ bevel: 0.006 }, wood),
        );
        for (const hx of cols === 2 ? [0] : [-0.25, 0.25])
          k.box("metal", 0.09, 0.018, 0.03, x + hx, dy, -Dd / 2 - 0.03 - open, {
            color: 0xb8a060,
          });
        if (open) {
          k.boxB(
            "wood",
            w - 0.04,
            0.14,
            open,
            x,
            dy - 0.07,
            -Dd / 2 - open / 2,
            wood,
          );
          k.box(
            "fabric",
            w - 0.1,
            0.03,
            open - 0.04,
            x,
            dy + 0.02,
            -Dd / 2 - open / 2,
            { color: [0xb0a090, 0x8a7a9a, 0xd0c8b8][(r() * 3) | 0] },
          );
        }
        n++;
      }
    }
    if (v % 3 === 0) {
      // harp-frame mirror standing on the back edge
      for (const sx of [-0.42, 0.42])
        k.box("wood", 0.04, 0.6, 0.04, sx, H + 0.32, Dd / 2 - 0.05, dark);
      k.cbox(
        "wood",
        0.8,
        0.62,
        0.03,
        0,
        H + 0.4,
        Dd / 2 - 0.05,
        Object.assign({ bevel: 0.01 }, dark),
      );
      k.box("glass", 0.72, 0.54, 0.008, 0, H + 0.4, Dd / 2 - 0.068, {
        color: 0x8a9298,
      });
    } else {
      k.box("fabric", 0.4, 0.004, 0.3, 0.1, H + 0.024, 0, {
        ry: r() * 0.5,
        color: 0xe8e0d0,
      }); // doily
      k.cyl("plain", 0.05, 0.07, 0.22, -0.3, H + 0.13, 0.05, {
        seg: 10,
        color: 0xc8b890,
      }); // lamp base
      k.cyl("fabric", 0.08, 0.13, 0.14, -0.3, H + 0.3, 0.05, {
        seg: 12,
        color: 0xe0d0a8,
      }); // shade
    }
    k.meta.collider = { w: W, d: Dd + 0.04, h: H };
    k.meta.container = { name: "Dresser", loot: "dresser" };
    k.meta.interactY = 0.7;
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });

  // ---------------- lockers (bank of v+1) ----------------
  // Steel lockers (bank): per bay a door with louvre vents top & bottom, a lift latch, number plate and
  // two hinges; a kick base and top cap run the whole bank. Some doors hang open on a hook & a shelf.
  D("locker", (k, r, v) => {
    const n = Math.max(1, (v % 4) + 1),
      W = 0.42;
    const col = [0x4a6a7a, 0x6a6e66, 0x7a5a3a, 0x5a6a4e][(r() * 4) | 0];
    const o = { color: col, rust: 0.35, grime: 0.3 };
    const blk = { color: 0x141413 };
    k.boxB("metal", n * W, 0.08, 0.48, 0, 0, 0.01, {
      color: 0x2a2a28,
      rust: 0.4,
    }); // kick base
    k.boxB("metal", n * W + 0.02, 0.04, 0.52, 0, 1.84, 0, o); // top cap
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * W;
      k.boxB("metal", W - 0.01, 1.76, 0.5, x, 0.08, 0, o);
      const open = r() < 0.25;
      const door = new X.Kit(61);
      door.box("metal", W - 0.05, 1.68, 0.02, 0, 0, 0, o);
      for (const vy of [0.62, -0.62])
        for (let s2 = 0; s2 < 5; s2++)
          door.box(
            "plain",
            W * 0.46,
            0.012,
            0.012,
            0,
            vy + (s2 - 2) * 0.035,
            -0.014,
            blk,
          );
      door.box("metal", 0.035, 0.14, 0.03, W / 2 - 0.08, 0, -0.02, {
        color: C.chrome,
      }); // lift latch
      door.box("plain", 0.08, 0.045, 0.006, 0, 0.42, -0.012, {
        color: 0xc8c0a0,
      }); // number plate
      for (const hy of [0.62, -0.62])
        door.cyl("metal", 0.012, 0.012, 0.08, -W / 2 + 0.03, hy, 0, {
          seg: 6,
          color: 0x3a3a36,
        });
      if (open) {
        // dark interior, a shelf and a hook with something left hanging
        k.box("plain", W - 0.06, 1.66, 0.01, x, 0.98, 0.23, {
          color: 0x1a1a18,
          ao: [1, 1],
        });
        k.box("metal", W - 0.06, 0.02, 0.44, x, 1.55, 0, o);
        if (r() < 0.6)
          k.box("plain", 0.2, 0.6, 0.06, x, 1.05, 0.1, {
            color: [0x5a5a44, 0x3a3a4a, 0x6a4a3a][(r() * 3) | 0],
            rz: 0.05,
          });
        const sw = 1.1 + r() * 0.5; // door swung open about its left hinge
        const wd = W - 0.05,
          hx = x - W / 2 + 0.025;
        k.include(door, {
          x: hx + (wd / 2) * Math.cos(sw),
          y: 0.98,
          z: -0.255 - (wd / 2) * Math.sin(sw),
          ry: sw,
        });
      } else k.include(door, { x, y: 0.98, z: -0.255 });
    }
    k.meta.collider = { w: n * W, d: 0.52, h: 1.88 };
    k.meta.container = { name: "Locker", loot: "locker" };
    k.meta.interactY = 1.1;
    k.meta.tier = "small";
  });

  // ---------------- footlocker ----------------
  D("footlocker", (k, r, v) => {
    // Army footlocker: plywood/steel trunk with a lid band, riveted corner guards, a hasp (an open padlock hangs from it on v2),
    // rope-and-leather end handles and a stencilled U.S. plate
    const o = {
      color: v === 1 ? 0x2a3a5a : C.armyGreen,
      rust: 0.3,
      grime: 0.35,
    };
    const brass = { color: 0x8a7a50, rust: 0.4 };
    k.cbox(
      "metal",
      0.9,
      0.36,
      0.48,
      0,
      0.18,
      0,
      Object.assign({ bevel: 0.02 }, o),
    );
    k.cbox(
      "metal",
      0.92,
      0.09,
      0.5,
      0,
      0.405,
      0,
      Object.assign({ bevel: 0.02 }, o),
    ); // lid
    k.box("metal", 0.93, 0.03, 0.51, 0, 0.36, 0, brass); // lid band
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        for (const yy of [0.03, 0.42])
          k.box("metal", 0.07, 0.07, 0.07, sx * 0.44, yy, sz * 0.23, brass); // corner guards
    for (const sx of [-1, 1]) {
      k.torus("metal", 0.06, 0.012, sx * 0.462, 0.24, 0, {
        ry: PI / 2,
        arc: PI,
        rz: PI,
        rseg: 3,
        tseg: 6,
        color: 0x4a3a2a,
      }); // end handles
      k.box("metal", 0.012, 0.04, 0.14, sx * 0.456, 0.3, 0, brass);
    }
    k.box("metal", 0.08, 0.12, 0.02, 0, 0.35, -0.255, brass); // hasp
    if (v === 2) {
      k.box("metal", 0.07, 0.07, 0.03, 0.03, 0.25, -0.275, {
        rz: 0.5,
        color: 0x6a6a60,
        rust: 0.4,
      });
      k.torus("metal", 0.022, 0.006, 0.0, 0.3, -0.27, {
        rz: 0.9,
        rseg: 3,
        tseg: 6,
        arc: PI,
        color: 0xa8a8a0,
      });
    }
    k.quad("white", 0.3, 0.08, 0, 0.19, -0.243, { ry: PI, color: 0xd8d0b8 });
    k.meta.collider = { w: 0.92, d: 0.5, h: 0.45 };
    k.meta.container = { name: "Footlocker", loot: "footlocker" };
    k.meta.interactY = 0.4;
    k.meta.tier = "small";
  });

  // ---------------- toolbox ----------------
