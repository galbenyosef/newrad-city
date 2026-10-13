// play-inline-445 06 — color
// Lines 1319-1492 of readable/play-inline-445.pretty.js (statement-aligned).
  D("vendor_table", (k, r, v) => {
    v = v % 2;
    const T = new X.Kit(81);
    const legs = { color: 0x3a3a36, rust: 0.6 };
    T.boxB("wood", 1.8, 0.04, 0.75, 0, 0.72, 0, {
      color: 0x6a5a44,
      grime: 0.5,
    });
    for (const s of [-1, 1]) {
      T.seg("metal", [s * 0.8, 0.72, -0.33], [s * 0.8, 0, 0.33], 0.014, legs);
      T.seg("metal", [s * 0.8, 0.72, 0.33], [s * 0.8, 0, -0.33], 0.014, legs);
    }
    const cloth = pick(r, [0x2a4a7a, 0x7a2a2a, 0x3a5a3a]);
    T.boxB("fabric", 1.86, 0.02, 0.8, 0, 0.76, 0, { color: cloth, grime: 0.6 });
    T.box("fabric", 1.86, 0.4, 0.02, 0, 0.58, -0.41, {
      color: cloth,
      grime: 0.6,
      rx: 0.03,
    }); // skirt toward the customer
    // 1964 World's Fair souvenirs: steel Unisphere globes on tripod stands, bronze medallions on cards,
    // Statues of Liberty, a watch board, sunglasses spinner
    for (let i = 0; i < 6; i++) {
      const x = -0.75 + (i % 3) * 0.14,
        z = -0.2 + ((i / 3) | 0) * 0.16;
      if (i % 2 === 0) {
        T.cyl("plain", 0.04, 0.045, 0.02, x, 0.79, z, {
          seg: 8,
          color: 0x1a1a18,
        });
        T.cyl("metal", 0.006, 0.006, 0.05, x, 0.82, z, {
          seg: 4,
          color: 0x8a8a84,
        });
        T.sphere("metal", 0.045, x, 0.89, z, {
          wseg: 8,
          hseg: 6,
          color: 0xb8bcc0,
          rust: 0.2,
        });
        T.torus("metal", 0.052, 0.004, x, 0.89, z, {
          rx: PI / 2 - 0.4,
          rseg: 3,
          tseg: 12,
          color: 0x9a9c9e,
        });
      } else {
        T.box("fabric", 0.09, 0.12, 0.005, x, 0.83, z, {
          rx: -0.3,
          color: 0x1a3a6a,
        });
        T.cyl("metal", 0.03, 0.03, 0.006, x, 0.84, z - 0.01, {
          rx: PI / 2 - 0.3,
          seg: 10,
          color: 0xa87a3a,
          rust: 0.3,
        });
      }
    }
    for (let i = 0; i < 5; i++) {
      const x = -0.25 + i * 0.1,
        z = -0.15 + (i % 2) * 0.12,
        col = { color: 0x5a8a78, rust: 0.2, grime: 0.4 };
      T.cyl(
        "metal",
        0.025,
        0.03,
        0.03,
        x,
        0.795,
        z,
        Object.assign({ seg: 6 }, col),
      );
      T.cyl(
        "metal",
        0.012,
        0.022,
        0.16,
        x,
        0.89,
        z,
        Object.assign({ seg: 6 }, col),
      );
      T.seg("metal", [x + 0.012, 0.95, z], [x + 0.02, 1.02, z], 0.005, col);
    }
    T.box("fabric", 0.5, 0.36, 0.02, 0.5, 0.97, 0.18, {
      rx: -0.35,
      color: 0x141414,
      grime: 0.3,
    });
    for (let i = 0; i < 12; i++)
      T.cyl(
        "metal",
        0.018,
        0.018,
        0.01,
        0.34 + (i % 4) * 0.1,
        0.9 + ((i / 4) | 0) * 0.09,
        0.14 - ((i / 4) | 0) * 0.03,
        { rx: PI / 2 - 0.35, seg: 8, color: 0xc8b060, rust: 0.3 },
      );
    T.seg("metal", [0.82, 0.78, -0.18], [0.82, 1.2, -0.18], 0.01, legs);
    for (let i = 0; i < 4; i++) {
      const a = (i * PI) / 2;
      T.box(
        "plain",
        0.1,
        0.03,
        0.02,
        0.82 + Math.cos(a) * 0.06,
        0.95 + (i % 2) * 0.12,
        -0.18 + Math.sin(a) * 0.06,
        { ry: -a, color: 0x101010 },
      );
    }
    // cardboard "$1 ANY ITEM" sign (plain card with a red stripe; the hand-lettered plank sign reads too scavenged)
    T.box("fabric", 0.42, 0.28, 0.01, -0.45, 0.93, 0.3, {
      rx: -0.2,
      color: 0xb89a6a,
      grime: 0.5,
    });
    T.box("fabric", 0.36, 0.05, 0.012, -0.45, 0.97, 0.296, {
      rx: -0.2,
      color: 0xa02018,
    });
    if (v === 0) k.include(T, {});
    else k.include(T, { y: 0.35, z: 0.1, rx: 0.5, rz: 0.12 }); // legs folded under one end
    // stock boxes & a lawn chair behind the table (vendor side, +Z)
    for (let i = 0; i < 2 + v; i++)
      k.boxB(
        "fabric",
        0.5,
        0.35,
        0.4,
        -0.5 + i * 0.55,
        0,
        0.75 + (r() - 0.5) * 0.1,
        { ry: (r() - 0.5) * 0.4, color: 0x9a7e56, grime: 0.55 },
      );
    const ch = new X.Kit(83),
      fr = { color: 0xa8a8a0, rust: 0.5 };
    for (const s of [-1, 1]) {
      ch.seg("metal", [s * 0.25, 0, -0.25], [s * 0.25, 0.42, 0.05], 0.012, fr);
      ch.seg("metal", [s * 0.25, 0, 0.2], [s * 0.25, 0.8, 0.3], 0.012, fr);
    }
    for (let i = 0; i < 4; i++)
      ch.box("fabric", 0.5, 0.012, 0.06, 0, 0.42, -0.2 + i * 0.08, {
        color: i % 2 ? 0x2a6a4a : 0xd8d0b0,
        grime: 0.5,
      });
    for (let i = 0; i < 5; i++)
      ch.box("fabric", 0.5, 0.06, 0.012, 0, 0.47 + i * 0.07, 0.07 + i * 0.045, {
        rx: -0.45,
        color: i % 2 ? 0x2a6a4a : 0xd8d0b0,
        grime: 0.5,
      });
    k.include(ch, { x: 0.55, z: 1.0, ry: PI + (r() - 0.5) * 0.4 });
    if (v === 1)
      for (let i = 0; i < 6; i++)
        k.sphere("metal", 0.045, (r() - 0.5) * 1.8, 0.045, -0.5 - r() * 0.6, {
          wseg: 6,
          hseg: 5,
          color: 0xb8bcc0,
          rust: 0.3,
        });
    k.meta.collider = { w: 1.9, d: 0.8, h: 0.8 };
    k.meta.container = {
      name: "Souvenir Stand",
      loot: "props_vendor",
      defLoot: "junk_common",
    };
    k.meta.interactY = 0.85;
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });
