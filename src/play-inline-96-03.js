// play-inline-96 03 — math
// Lines 690-1031 of readable/play-inline-96.pretty.js (statement-aligned).
  function cryoPod(x, z, yaw, opts) {
    opts = opts || {};
    const R = 0.62,
      H = 2.35,
      Y0 = 0.32;
    M.pushXF(M.mtx(x, 0, z, yaw));
    const steel = b("metal_painted"),
      steelDS = b("metal_painted@ds");
    // plinth
    M.cyl(steel, 0, 0, 0, 0.82, 0.78, Y0, 16, {
      capTop: true,
      c: [0.42, 0.45, 0.47],
    });
    // back shell (half cylinder, behind: local -z side → angles π..2π) + dome
    M.cyl(steelDS, 0, Y0, 0, R, R, H, 14, {
      a0: Math.PI,
      a1: Math.PI * 2,
      c: [0.78, 0.8, 0.8],
    });
    M.cyl(steel, 0, Y0 + H, 0, R, 0.18, 0.42, 14, {
      capTop: true,
      c: [0.72, 0.74, 0.74],
    });
    // inner padding (grey-white, quilted look by vertex tint) and a head rest
    M.cyl(b("fabric@ds"), 0, Y0 + 0.1, -0.02, R - 0.06, R - 0.06, H - 0.2, 10, {
      a0: Math.PI * 1.08,
      a1: Math.PI * 1.92,
      c: [0.78, 0.8, 0.82],
    });
    M.box(b("fabric"), -0.2, Y0 + 1.75, -0.5, 0.2, Y0 + 2.0, -0.38, {
      s: 1,
      c: [0.85, 0.86, 0.88],
    });
    // orange collar ring + side rails
    M.cyl(steel, 0, Y0 + H - 0.22, 0, R + 0.04, R + 0.04, 0.16, 18, {
      c: C_ORANGE,
    });
    M.cyl(steel, 0, Y0 + 0.02, 0, R + 0.05, R + 0.05, 0.12, 18, {
      c: C_ORANGE,
    });
    for (const sx of [-1, 1])
      M.box(steel, sx * R - 0.05, Y0, -0.05, sx * R + 0.05, Y0 + H, 0.05, {
        s: 1,
        c: C_STEEL,
      });
    // front glass (half cylinder, +z side → angles 0..π); open pods have it swung 100° aside
    const glass = b(opts.dead ? "glass_dirty" : "glass_dirty@window");
    const gc = opts.dead ? [0.62, 0.7, 0.74] : [0.85, 0.95, 1.0];
    if (opts.open) {
      M.pushXF(M.mtx(R, 0, 0, -1.75));
      M.cyl(glass, -R, Y0 + 0.05, 0, R - 0.02, R - 0.02, H - 0.1, 12, {
        a0: 0.12,
        a1: Math.PI - 0.12,
        c: gc,
      });
      M.popXF();
    } else if (opts.cracked) {
      M.cyl(glass, 0, Y0 + 0.05, 0, R - 0.02, R - 0.02, H * 0.45, 12, {
        a0: 0.12,
        a1: Math.PI - 0.12,
        c: gc,
      });
    } else {
      M.cyl(glass, 0, Y0 + 0.05, 0, R - 0.02, R - 0.02, H - 0.1, 12, {
        a0: 0.12,
        a1: Math.PI - 0.12,
        c: gc,
      });
      // frost bloom on the inside of the glass (pale plate, upper half)
      M.cyl(
        b("concrete@ds"),
        0,
        Y0 + 1.1 + (opts.dead ? -0.4 : 0.3),
        0,
        R - 0.05,
        R - 0.05,
        opts.dead ? 1.0 : 0.6,
        10,
        { a0: 0.3, a1: Math.PI - 0.3, c: C_FROST },
      );
    }
    // the sleeper inside (closed, dead pods): a dark shape behind the frost
    if (!opts.empty && !opts.open) {
      const fb = b("fabric");
      M.cyl(fb, 0, Y0 + 0.15, -0.12, 0.17, 0.2, 1.3, 8, {
        c: [0.32, 0.34, 0.36],
      });
      M.cyl(fb, 0, Y0 + 1.45, -0.12, 0.2, 0.14, 0.3, 8, {
        c: [0.32, 0.34, 0.36],
      });
      M.cyl(b("bone"), 0, Y0 + 1.75, -0.14, 0.11, 0.1, 0.24, 8, {
        capTop: true,
        c: opts.dead ? [0.55, 0.53, 0.5] : [0.7, 0.62, 0.55],
      });
    }
    // control box with the status lamp at the foot, coolant lines up the back
    M.box(steel, -0.28, Y0, 0.62, 0.28, Y0 + 0.55, 0.8, {
      s: 1,
      c: [0.4, 0.43, 0.45],
    });
    M.box(
      b(opts.dead ? "neon_red@lampr" : "emissive_window@lamp"),
      -0.07,
      Y0 + 0.38,
      0.801,
      0.07,
      Y0 + 0.48,
      0.81,
      { s: 1 },
    );
    M.box(
      b("emissive_window@lampw"),
      -0.2,
      Y0 + 0.12,
      0.801,
      0.0,
      Y0 + 0.28,
      0.81,
      { s: 1 },
    );
    const top = (opts.ceilY || 5.5) - 0.02;
    for (const sx of [-0.25, 0.25])
      M.pipe(
        b("metal_painted"),
        sx,
        Y0 + H + 0.2,
        -0.45,
        sx * 1.6,
        top,
        -0.75,
        0.05,
        6,
        { c: sx < 0 ? [0.55, 0.72, 0.85] : C_ORANGE },
      );
    // number stencil on the plinth front
    M.box(steel, -0.15, 0.08, 0.79, 0.15, 0.24, 0.8, {
      s: 1,
      c: [0.92, 0.9, 0.82],
    });
    M.popXF();
    // collider: closed pods are solid; open pods keep the back shell + side rails (you can stand in the doorway)
    if (opts.open) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      const L2W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
      const pts = [L2W(0, -0.45), L2W(-0.62, -0.05), L2W(0.62, -0.05)];
      for (const [px, pz] of pts)
        CB(px - 0.22, 0, pz - 0.22, px + 0.22, Y0 + H, pz + 0.22);
      CB(x - 0.82, 0, z - 0.82, x + 0.82, Y0 - 0.02, z + 0.82, {
        surface: "metal",
      }); // the plinth step (walkable)
    } else {
      footCB(x, z, yaw, 1.5, 1.5, Y0 + H + 0.4);
    }
    if (opts.cracked) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      puddle(x + s * 1.3, z + c * 1.3, 1.1);
      const gb = b("glass_dirty");
      const rr = M.rng("shards" + x + z);
      for (let i = 0; i < 9; i++) {
        const px = x + s * rr.range(0.8, 1.8) + rr.range(-0.6, 0.6),
          pz = z + c * rr.range(0.8, 1.8) + rr.range(-0.6, 0.6);
        M.box(gb, px - 0.1, 0.005, pz - 0.06, px + 0.1, 0.02, pz + 0.06, {
          s: 1,
          c: [0.8, 0.9, 0.95],
        });
      }
    }
  }

  // -------------------------------------------------------------------
  // Mainframe bank: tall cabinet with two tape reels behind glass and
  // rows of indicator lamps (CUSTODIAN)
  // -------------------------------------------------------------------
  function mainframe(x, z, yaw, rr) {
    M.pushXF(M.mtx(x, 0, z, yaw));
    const mb = b("metal_painted");
    M.box(mb, -0.55, 0, -0.4, 0.55, 2.3, 0.4, { s: 1, c: [0.72, 0.72, 0.68] });
    M.box(mb, -0.5, 1.15, 0.401, 0.5, 2.15, 0.41, {
      s: 1,
      c: [0.12, 0.13, 0.14],
    }); // smoked window
    for (const rx of [-0.24, 0.24]) {
      M.pushXF(M.mtx(rx, 1.65, 0.42, 0, Math.PI / 2));
      M.cyl(mb, 0, 0, 0, 0.2, 0.2, 0.03, 16, {
        capTop: true,
        capBot: true,
        c: [0.55, 0.56, 0.58],
      });
      M.cyl(mb, 0, 0.03, 0, 0.06, 0.06, 0.02, 8, {
        capTop: true,
        c: [0.2, 0.2, 0.2],
      });
      M.popXF();
    }
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 8; i++) {
        const k = rr();
        const key =
          k < 0.12
            ? "neon_red@lampr"
            : k < 0.5
              ? "emissive_window@lamp"
              : k < 0.75
                ? "emissive_window@lampw"
                : null;
        if (key)
          M.box(
            b(key),
            -0.42 + i * 0.12,
            0.72 + row * 0.12,
            0.401,
            -0.36 + i * 0.12,
            0.78 + row * 0.12,
            0.412,
            { s: 1 },
          );
      }
    M.box(mb, -0.5, 0.15, 0.401, 0.5, 0.6, 0.41, { s: 1, c: [0.5, 0.52, 0.5] }); // kick panel
    M.popXF();
    footCB(x, z, yaw, 1.1, 0.8, 2.3);
  }

  // -------------------------------------------------------------------
  // The blast door: two steel leaves (separate meshes) that slide apart
  // into wall pockets. Keypad lock via G.locks ('q_cryo_blast_door').
  // -------------------------------------------------------------------
  const BD = { z: -24.3, w: 1.8, h: 3.0, T: 0.32 };
  const blast = {
    state: "closed",
    t: 0,
    leaves: [],
    cols: [],
    locked: false,
    message: "",
    sndT: -1,
  };
  M.blastDoor = blast;
  function buildBlastDoor() {
    for (const side of [-1, 1]) {
      const g = new M.GeoBuf();
      const w = BD.w,
        h = BD.h,
        T = BD.T;
      M.box(g, -w / 2, 0, -T / 2, w / 2, h, T / 2, {
        s: 1.5,
        c: [0.52, 0.54, 0.55],
        skip: 0,
      });
      // raised panels + rivet rows on both faces
      for (const fz of [-1, 1]) {
        const zz = fz * (T / 2 + 0.01);
        for (const [y0, y1] of [
          [0.15, 1.35],
          [1.65, 2.85],
        ])
          M.box(
            g,
            -w / 2 + 0.12,
            y0,
            Math.min(zz, zz + fz * 0.04),
            w / 2 - 0.12,
            y1,
            Math.max(zz, zz + fz * 0.04),
            { s: 1, c: [0.46, 0.48, 0.49] },
          );
        // hazard chevrons along the meeting edge (orange / black)
        const ex = side < 0 ? w / 2 : -w / 2,
          dir = side < 0 ? -1 : 1;
        for (let i = 0; i < 10; i++) {
          const y0 = i * 0.3,
            col = i % 2 ? [0.08, 0.08, 0.08] : C_ORANGE;
          M.quad(
            g,
            [ex, y0, zz + fz * 0.05],
            [ex + dir * 0.35, y0 + 0.15, zz + fz * 0.05],
            [ex + dir * 0.35, y0 + 0.45, zz + fz * 0.05],
            [ex, y0 + 0.3, zz + fz * 0.05],
            [0, 0, fz],
            [0, 0, 1, 0, 1, 1, 0, 1],
            col,
          );
        }
        // stencilled "C-9" band
        M.box(
          g,
          -w / 2 + 0.2,
          1.42,
          Math.min(zz, zz + fz * 0.03),
          w / 2 - 0.2,
          1.58,
          Math.max(zz, zz + fz * 0.03),
          { s: 1, c: [0.85, 0.83, 0.76] },
        );
      }
      const mat = new THREE.MeshStandardMaterial({
        map: M.mat("metal_painted").map || null,
        vertexColors: true,
        roughness: 0.5,
        metalness: 0.45,
      });
      mat.userData.shared = true;
      const mesh = new THREE.Mesh(g.toGeometry(), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      M.roots.cryoDyn = M.roots.cryoDyn || new THREE.Group();
      M.roots.cryoDyn.add(mesh);
      blast.leaves.push({ mesh, side });
    }
    applyBlastPose(0);
    blast.addCol = () => {
      if (blast.cols.length) return;
      blast.cols.push(
        G.world.addBox(
          O.x - BD.w,
          O.y || 0,
          O.z + BD.z - BD.T / 2,
          O.x + BD.w,
          (O.y || 0) + BD.h,
          O.z + BD.z + BD.T / 2,
          { tag: "blast_door", surface: "metal" },
        ),
      );
    };
    blast.remCol = () => {
      for (const c of blast.cols) G.world.removeCollider(c);
      blast.cols.length = 0;
    };
    blast.addCol();
  }
  function applyBlastPose(t) {
    const k = M.smooth(0, 1, t);
    for (const L of blast.leaves)
      L.mesh.position.set(
        O.x + L.side * (BD.w / 2 + k * (BD.w - 0.05)),
        O.y || 0,
        O.z + BD.z,
      );
  }
  const blastSndPos = () =>
    new THREE.Vector3(O.x, (O.y || 0) + 1.5, O.z + BD.z);
