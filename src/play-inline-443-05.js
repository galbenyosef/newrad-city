// play-inline-443 05 — color
// Lines 1226-1485 of readable/play-inline-443.pretty.js (statement-aligned).
  D("dumpster", (k, r, v) => {
    const cols = [0x2e4a32, 0x3a4a6a, 0x6a5a2a];
    const o = { color: cols[v % 3], rust: 0.5 + r() * 0.3 };
    // trapezoid body: wider at the top toward the front (-z)
    k.loft(
      "metal",
      [
        { z: -0.8, wb: 0.95, wt: 0.95, yb: 0.12, yt: 1.2, n: 12 },
        { z: 0.75, wb: 0.95, wt: 0.95, yb: 0.12, yt: 1.2, n: 12 },
      ],
      Object.assign({ seg: 12 }, o),
    );
    k.box("metal", 1.94, 0.08, 0.12, 0, 1.2, -0.84, o); // lip
    // lids: one closed (plastic), one flipped open
    k.box("plain", 0.95, 0.05, 1.6, -0.48, 1.26, -0.02, {
      color: 0x1a1a1a,
      rz: 0.03,
    });
    if (v !== 1)
      k.box("plain", 0.95, 1.6, 0.05, 0.48, 2.02, 0.78, {
        color: 0x1a1a1a,
        rx: 0.18,
      });
    else
      k.box("plain", 0.95, 0.05, 1.6, 0.48, 1.26, -0.02, { color: 0x1a1a1a });
    // side fork pockets, wheels
    for (const s of [-1, 1])
      k.box("metal", 0.1, 0.18, 1.5, s * 1.0, 0.75, 0, o);
    for (const sx of [-0.8, 0.8])
      for (const sz of [-0.6, 0.6])
        k.cyl("plain", 0.07, 0.07, 0.05, sx, 0.07, sz, {
          rz: PI / 2,
          seg: 8,
          color: 0x1a1a1a,
        });
    // overflowing trash
    for (let i = 0; i < 3; i++)
      k.sphere("fabric", 0.3, (r() - 0.2) * 0.8, 1.25, (r() - 0.5) * 0.9, {
        s: [1, 0.55, 1],
        color: 0x22221e,
        wseg: 7,
        hseg: 5,
      });
    k.meta.collider = { w: 2.0, d: 1.65, h: 1.3 };
    k.meta.container = { name: "Dumpster", loot: "dumpster" };
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });

  // ---------------- mattress ----------------
  D("mattress", (k, r, v) => {
    const kk = v === 1 ? new X.Kit(71) : k;
    kk.cbox("fabric", 1.0, 0.2, 1.95, 0, 0.1, 0, {
      bevel: 0.07,
      color: 0xc8bca0,
      grime: 0.45,
      colorFn: (x, y, z) =>
        X.noise3(x * 3, 0, z * 3) > 0.62 ? 0x8a6a40 : 0xc8bca0,
    });
    if (v === 1) k.include(kk, { y: 0.95, z: 0.3, rx: -1.35 }); // leaning against a wall
    k.meta.tier = "small";
  });

  // ---------------- baby pram (a classic of the Ruins) ----------------
  D("pram", (k, r, v) => {
    const o = {
      color: [0x2a3a5a, 0x5a2a2a, 0x3a3a3a][(r() * 3) | 0],
      rust: 0.3,
    };
    const kk = v === 1 ? new X.Kit(81) : k;
    kk.sphere(
      "paint",
      0.42,
      0,
      0.62,
      0,
      Object.assign(
        {
          s: [0.55, 0.55, 1],
          phiStart: PI / 2,
          phiLength: PI / 2,
          wseg: 12,
          hseg: 5,
        },
        o,
      ),
    );
    kk.sphere(
      "fabric",
      0.4,
      0,
      0.65,
      0.18,
      Object.assign(
        {
          s: [0.55, 0.8, 0.6],
          phiLength: PI / 2,
          wseg: 10,
          hseg: 4,
          thetaStart: 0,
        },
        { color: 0x2a2a2a },
      ),
    );
    for (const sx of [-0.25, 0.25])
      for (const sz of [-0.3, 0.3]) {
        kk.torus("plain", 0.14, 0.02, sx, 0.15, sz, {
          ry: PI / 2,
          color: 0x1a1a1a,
          tseg: 12,
          rseg: 4,
        });
        kk.seg("metal", [sx, 0.15, sz], [sx * 0.8, 0.45, sz * 0.6], 0.012, {
          color: 0x8a8a84,
        });
      }
    kk.seg("metal", [0, 0.6, -0.4], [0, 1.0, -0.65], 0.015, {
      color: 0x8a8a84,
    });
    kk.seg("metal", [-0.2, 1.0, -0.65], [0.2, 1.0, -0.65], 0.015, {
      color: 0x8a8a84,
    });
    if (v === 1) k.include(kk, { y: 0.2, rz: PI / 2 - 0.2 });
    k.meta.tier = "small";
  });

  // ---------------- luggage (evacuation debris) ----------------
  D("luggage", (k, r, v) => {
    const n = 2 + ((r() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const w = 0.5 + r() * 0.3,
        h = 0.18 + r() * 0.1,
        d = 0.35 + r() * 0.15;
      const col = [0x6a4a2a, 0x3a3a5a, 0x5a1a1a, 0xa89878, 0x2a4a3a][
        (r() * 5) | 0
      ];
      k.cbox(
        "fabric",
        w,
        h,
        d,
        (r() - 0.5) * 0.9,
        h / 2 + (i > 2 ? 0.25 : 0),
        (r() - 0.5) * 0.7,
        { ry: r() * 3, bevel: 0.03, color: col },
      );
    }
    if (r() < 0.5)
      k.cbox("fabric", 0.4, 0.5, 0.2, 0.6, 0.25, 0.3, {
        ry: 0.5,
        rz: 0.3,
        bevel: 0.04,
        color: 0x8a6a4a,
      });
    k.meta.tier = "small";
  });

  // =====================================================================
  // SKELETONS — posed from a joint table so the same builder produces
  // lying, sitting, slumped, curled, reaching and child skeletons.
  // Joint positions are in skeleton-local metres (y up, -z = facing).
  // =====================================================================
  const POSES = {
    // on its back, arms at sides, head toward -z
    lying: {
      head: [0, 0.1, -0.78],
      neck: [0, 0.08, -0.62],
      chest: [0, 0.12, -0.38],
      pelvis: [0, 0.1, 0.05],
      lSh: [-0.2, 0.1, -0.52],
      lEl: [-0.26, 0.06, -0.24],
      lHa: [-0.28, 0.05, 0.02],
      rSh: [0.2, 0.1, -0.52],
      rEl: [0.28, 0.06, -0.25],
      rHa: [0.35, 0.05, -0.05],
      lHi: [-0.12, 0.09, 0.08],
      lKn: [-0.16, 0.07, 0.5],
      lFo: [-0.2, 0.06, 0.92],
      rHi: [0.12, 0.09, 0.08],
      rKn: [0.2, 0.07, 0.48],
      rFo: [0.3, 0.05, 0.9],
    },
    // sitting against a wall at +z, legs forward toward -z, head slumped
    sitting: {
      head: [0.05, 0.78, -0.02],
      neck: [0.02, 0.7, 0.1],
      chest: [0, 0.52, 0.14],
      pelvis: [0, 0.12, 0.12],
      lSh: [-0.2, 0.62, 0.14],
      lEl: [-0.28, 0.35, 0.05],
      lHa: [-0.25, 0.1, -0.2],
      rSh: [0.2, 0.62, 0.14],
      rEl: [0.3, 0.35, 0.02],
      rHa: [0.2, 0.2, -0.15],
      lHi: [-0.12, 0.1, 0.08],
      lKn: [-0.18, 0.35, -0.3],
      lFo: [-0.2, 0.05, -0.7],
      rHi: [0.12, 0.1, 0.08],
      rKn: [0.16, 0.08, -0.42],
      rFo: [0.2, 0.05, -0.85],
    },
    // face down, one arm reaching forward
    reaching: {
      head: [0, 0.11, -0.8],
      neck: [0, 0.1, -0.64],
      chest: [0, 0.13, -0.4],
      pelvis: [0, 0.12, 0.05],
      lSh: [-0.2, 0.1, -0.54],
      lEl: [-0.3, 0.07, -0.85],
      lHa: [-0.3, 0.05, -1.15],
      rSh: [0.2, 0.1, -0.54],
      rEl: [0.35, 0.07, -0.35],
      rHa: [0.3, 0.05, -0.1],
      lHi: [-0.12, 0.1, 0.08],
      lKn: [-0.2, 0.08, 0.5],
      lFo: [-0.3, 0.05, 0.9],
      rHi: [0.12, 0.1, 0.08],
      rKn: [0.15, 0.07, 0.5],
      rFo: [0.12, 0.25, 0.8],
    },
    // curled on its side (fetal)
    curled: {
      head: [-0.05, 0.18, -0.55],
      neck: [0, 0.16, -0.42],
      chest: [0.02, 0.18, -0.22],
      pelvis: [0, 0.16, 0.12],
      lSh: [-0.05, 0.28, -0.35],
      lEl: [-0.1, 0.24, -0.6],
      lHa: [-0.05, 0.14, -0.72],
      rSh: [0.05, 0.08, -0.35],
      rEl: [0.1, 0.05, -0.55],
      rHa: [0.12, 0.04, -0.7],
      lHi: [-0.04, 0.24, 0.12],
      lKn: [-0.08, 0.26, -0.28],
      lFo: [-0.04, 0.2, 0.1],
      rHi: [0.04, 0.08, 0.12],
      rKn: [0.08, 0.06, -0.26],
      rFo: [0.1, 0.05, 0.12],
    },
    // seated on a bench/chair (seat 0.45), leaning back
    seated: {
      head: [0, 1.12, 0.06],
      neck: [0, 1.02, 0.14],
      chest: [0, 0.82, 0.18],
      pelvis: [0, 0.5, 0.12],
      lSh: [-0.2, 0.94, 0.18],
      lEl: [-0.26, 0.68, 0.14],
      lHa: [-0.22, 0.5, -0.1],
      rSh: [0.2, 0.94, 0.18],
      rEl: [0.3, 0.7, 0.14],
      rHa: [0.32, 0.5, -0.05],
      lHi: [-0.12, 0.48, 0.1],
      lKn: [-0.14, 0.5, -0.32],
      lFo: [-0.16, 0.04, -0.4],
      rHi: [0.12, 0.48, 0.1],
      rKn: [0.2, 0.48, -0.3],
      rFo: [0.26, 0.04, -0.36],
    },
  };
  /** Add a skeleton to kit k. pose name, transform {x,y,z,ry, s (scale), tilt}. */
