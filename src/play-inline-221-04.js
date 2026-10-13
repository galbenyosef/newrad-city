// play-inline-221 04 — box
// Lines 682-883 of readable/play-inline-221.pretty.js (statement-aligned).
  function fireStation(b, x, y, z, ry) {
    const P = (lx, lz) => W2(x, z, ry, lx, lz);
    let [px, pz] = P(0, 0.02);
    b.box("paint_red", px, y, pz, 1.0, 1.25, 0.04, {
      ry,
      seg: false,
      grime: 0.45,
    });
    [px, pz] = P(0.05, 0.2);
    b.add("canvas", new THREE.TorusGeometry(0.3, 0.09, 6, 16), {
      m: PH.m4(px, y + 0.72, pz, ry),
      c: 0xc0a878,
    });
    b.cyl("paint_red", px, y + 0.72, pz, 0.12, 0.12, 0.34, 10, {
      ry,
      rx: HP,
      hSeg: 1,
    });
    [px, pz] = P(-0.38, 0.12);
    b.rod("paint_red", V(px, y + 0.1, pz), V(px, y + 1.2, pz), 0.05, 6);
    b.add("paint_red", new THREE.TorusGeometry(0.11, 0.018, 5, 12), {
      m: PH.m4(px, y + 1.05, pz + 0, ry, HP, 0),
    });
    [px, pz] = P(0.35, 0.16);
    b.rod("bronze", V(px, y + 0.2, pz), V(px, y + 0.62, pz), 0.035, 6, {
      r2: 0.018,
    });
    [px, pz] = P(0, 0.03);
    label(b, "FIRE STATION", px, y + 1.45, pz, ry, 0.9);
  }
  /** Sound-powered phone box with handset on its hook. */
  function phone(b, x, y, z, ry) {
    const [px, pz] = W2(x, z, ry, 0, 0.08);
    b.box("navy", px, y - 0.2, pz, 0.28, 0.4, 0.14, { ry, seg: false });
    const [hx, hz] = W2(x, z, ry, 0.05, 0.17);
    b.box("black", hx, y - 0.12, hz, 0.06, 0.26, 0.06, { ry, seg: false });
    const [cx, cz] = W2(x, z, ry, -0.1, 0.16);
    b.cyl("chrome", cx, y + 0.08, cz, 0.04, 0.04, 0.03, 8, {
      ry,
      rx: HP,
      hSeg: 1,
    });
  }
  /** Gauge board: grey panel with six dial gauges (white faces, black needles) and a tag line. */
  function gauges(b, x, y, z, ry, n) {
    n = n || 6;
    const [px, pz] = W2(x, z, ry, 0, 0.03);
    b.box("panel", px, y - 0.35, pz, n * 0.26 + 0.2, 0.7, 0.05, {
      ry,
      seg: false,
    });
    for (let i = 0; i < n; i++) {
      const lx = -((n - 1) * 0.26) / 2 + i * 0.26,
        ly = (i % 2) * 0.22 - 0.1;
      const [gx, gz] = W2(x, z, ry, lx, 0.08);
      b.cyl("chrome", gx, y + ly, gz, 0.1, 0.1, 0.05, 12, {
        ry,
        rx: HP,
        hSeg: 1,
      });
      const [fx, fz] = W2(x, z, ry, lx, 0.107);
      b.cyl("paint_white", fx, y + ly, fz, 0.082, 0.082, 0.005, 12, {
        ry,
        rx: HP,
        hSeg: 1,
        noAO: true,
      });
      const [nx, nz] = W2(x, z, ry, lx, 0.113);
      b.box("black", nx, y + ly - 0.005, nz, 0.012, 0.075, 0.004, {
        ry,
        rz: -1.2 + i * 0.5,
        seg: false,
        noAO: true,
      });
    }
  }
  /** Damage-control locker (red cabinet, collider) + optional shoring timber stack beside it. */
  function dcLocker(b, x, z, y, ry, shoring) {
    const [px, pz] = W2(x, z, ry, 0, 0.24);
    b.box("paint_red", px, y, pz, 0.95, 1.7, 0.46, {
      ry,
      seg: false,
      grime: 0.5,
    });
    const [dx, dz] = W2(x, z, ry, 0, 0.475);
    b.box("iron", dx, y + 0.2, dz, 0.02, 1.3, 0.02, { ry, seg: false });
    const [hx, hz] = W2(x, z, ry, 0.3, 0.5);
    b.box("chrome", hx, y + 0.9, hz, 0.04, 0.16, 0.04, { ry, seg: false });
    PH.col(px, pz, 0.95, 0.46, y, y + 1.7, ry, { walkable: false });
    const [lx, lz] = W2(x, z, ry, 0, 0.48);
    label(b, "DAMAGE CONTROL", lx, y + 1.45, lz, ry, 0.8);
    if (shoring) {
      for (let i = 0; i < 7; i++) {
        const [sx, sz] = W2(
          x,
          z,
          ry,
          -2.0 + (i % 3) * 0.12,
          0.2 + (i % 4) * 0.17,
        );
        b.box("wood", sx, y + ((i / 4) | 0) * 0.16, sz, 2.4, 0.15, 0.15, {
          ry,
          seg: false,
          grime: 0.6,
        });
      }
      const [sx, sz] = W2(x, z, ry, -2.0, 0.45);
      PH.col(sx, sz, 2.6, 0.75, y, y + 0.32, ry, {});
    }
  }
  /** Cabin door opening: jambs, head, coaming and an open steel leaf swung into the cabin. side = +1 (cabin toward +z) / -1. */
  function cabinDoor(b, x, y, zWall, side) {
    for (const s of [-1, 1])
      b.box("navy_dark", x + s * 0.6, y, zWall, 0.1, 2.15, 0.22, {
        seg: false,
      });
    b.box("navy_dark", x, y + 2.1, zWall, 1.3, 0.12, 0.22, { seg: false });
    b.box("navy_dark", x, y, zWall, 1.1, 0.08, 0.24, { seg: false });
    const hx = x - 0.55,
      a = 1.25; // hinge on the aft jamb, leaf ~70° open
    const cx = hx + Math.cos(a) * 0.52,
      cz = zWall + side * Math.sin(a) * 0.52;
    b.box("navy", cx, y + 0.04, cz, 1.04, 2.0, 0.05, {
      ry: -side * a,
      seg: false,
      grime: 0.5,
    });
    const kx = hx + Math.cos(a) * 0.92,
      kz = zWall + side * Math.sin(a) * 0.92;
    b.cyl("chrome", kx, y + 1.0, kz, 0.03, 0.03, 0.12, 6, {
      ry: -side * a,
      rx: HP,
      hSeg: 1,
    });
  }
  /** Floor litter: cans, bottles, paper, rags, a cardboard box or two. */
  function litter(b, x0, z0, x1, z1, y, n, seed) {
    const r = PH.rng("lit" + seed);
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0),
        z = z0 + r() * (z1 - z0),
        t = r();
      if (t < 0.3) {
        const lay = r() < 0.6;
        b.cyl("metal", x, lay ? y + 0.035 : y, z, 0.034, 0.034, 0.11, 7, {
          hSeg: 1,
          rz: lay ? HP : 0,
          ry: r() * 3,
          c: [0xc04030, 0xd0c8a0, 0x7090a0][(r() * 3) | 0],
        });
      } else if (t < 0.5) {
        const lay = r() < 0.5;
        b.cyl(
          r() < 0.5 ? "glass" : "paint_green",
          x,
          lay ? y + 0.045 : y,
          z,
          0.03,
          0.045,
          0.24,
          7,
          { hSeg: 1, rz: lay ? HP : 0, ry: r() * 3 },
        );
      } else if (t < 0.8)
        b.box("paper", x, y + 0.003, z, 0.21, 0.004, 0.28, {
          ry: r() * 3,
          seg: false,
          noAO: true,
        });
      else if (t < 0.93)
        b.box("fabric", x, y, z, 0.5, 0.06, 0.35, {
          ry: r() * 3,
          seg: false,
          c: [0x5a4a3a, 0x3a4a3a, 0x6a3a2a][(r() * 3) | 0],
        });
      else
        b.box("cardboard", x, y, z, 0.45, 0.3, 0.35, {
          ry: r() * 3,
          seg: false,
        });
    }
  }
  const decalKey = {};
  function decal(b, name, x, y, z, size, rot, wallRy) {
    if (decalKey[name] === undefined)
      decalKey[name] =
        PH.extMat("decal_" + name, () =>
          G.mats.decal ? G.mats.decal(name) : null,
        ) || null;
    const k = decalKey[name];
    if (!k) return;
    if (wallRy === undefined)
      b.quad(k, x, y + 0.012, z, size, size, { ry: rot || 0, rx: -HP });
    else {
      const [qx, qz] = W2(x, z, wallRy, 0, 0.015);
      b.quad(k, qx, y, qz, size, size, { ry: wallRy, rz: rot || 0 });
    }
  }

  // =====================================================================
  // THE PASS
  // =====================================================================
