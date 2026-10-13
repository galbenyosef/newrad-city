// play-inline-180 04 — box
// Lines 377-647 of readable/play-inline-180.pretty.js (statement-aligned).
  function gearGeo(R, teeth, depth) {
    const sh = new THREE.Shape();
    const n = teeth * 4;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * PI * 2,
        r = i % 4 < 2 ? R : R * 0.9;
      const px = Math.cos(a) * r,
        py = Math.sin(a) * r;
      if (i === 0) sh.moveTo(px, py);
      else sh.lineTo(px, py);
    }
    const spokes = 6;
    for (let s = 0; s < spokes; s++) {
      const a0 = (s / spokes) * PI * 2 + 0.18,
        a1 = ((s + 1) / spokes) * PI * 2 - 0.18,
        r0 = R * 0.25,
        r1 = R * 0.72;
      const hole = new THREE.Path();
      hole.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0);
      hole.absarc(0, 0, r1, a0, a1, false);
      hole.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0);
      hole.absarc(0, 0, r0, a1, a0, true);
      sh.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: false,
      curveSegments: 4,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
  /**
   * Round 2: the Home Office annex's street storey was a blank 4 m marble band on 23rd / 24th St and the
   * Park Avenue South face. Now it reads as the real building's ground floor: granite plinth, rusticated
   * marble piers on a ~4.3 m rhythm, tall bronze-framed plate-glass bays (some smashed, some boarded by the
   * robots' security detail), transom bars, a projecting cornice, and a boarded side entrance with a lamp
   * pair. All merged into the exterior builder (no new draw calls).
   */
  function annexGround(b, glows, x0, z0, x1, z1, marble, marble2) {
    const H = 4.1,
      P = 0.42; // storey height, pier projection
    b.box(
      "granite",
      (x0 + x1) / 2,
      0,
      (z0 + z1) / 2,
      x1 - x0 + 0.7,
      0.55,
      z1 - z0 + 0.7,
      { faces: "nsewt", tint: 0x8e8a82 },
    );
    b.box(
      "marble_t",
      (x0 + x1) / 2,
      H,
      (z0 + z1) / 2,
      x1 - x0 + 1.0,
      0.45,
      z1 - z0 + 1.0,
      { faces: "nsewtb", tint: marble },
    );
    b.box(
      "marble_t",
      (x0 + x1) / 2,
      H + 0.45,
      (z0 + z1) / 2,
      x1 - x0 + 0.7,
      0.18,
      z1 - z0 + 0.7,
      { faces: "nsewt", tint: 0xc8c4b8 },
    );
    // faces: [start x, start z, unit u (along), outward normal, length]
    const faces = [
      { ox: x0, oz: z0, ux: 1, uz: 0, nx: 0, nz: -1, L: x1 - x0, key: "n" },
      { ox: x0, oz: z1, ux: 1, uz: 0, nx: 0, nz: 1, L: x1 - x0, key: "s" },
      { ox: x1, oz: z0, ux: 0, uz: 1, nx: 1, nz: 0, L: z1 - z0, key: "e" },
    ];
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (const f of faces) {
      const n = Math.max(3, Math.round(f.L / 4.3)),
        step = f.L / n;
      const yaw = Math.atan2(f.nx, f.nz); // BP.box yaw: local +z → outward normal
      for (let i = 0; i <= n; i++) {
        // rusticated piers (stacked blocks with shadow joints)
        const u = i * step,
          px = f.ox + f.ux * u + f.nx * (0.2 + P / 2),
          pz = f.oz + f.uz * u + f.nz * (0.2 + P / 2);
        for (let k = 0; k < 5; k++)
          b.box("marble_t", px, 0.55 + k * 0.71, pz, 0.95, 0.66, P, {
            yaw,
            tint: k % 2 ? marble : marble2,
          });
      }
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) * step,
          cx = f.ox + f.ux * u,
          cz = f.oz + f.uz * u;
        const at = (d) => [cx + f.nx * d, cz + f.nz * d];
        const side = f.key === "e" && i === Math.floor(n / 2); // side entrance mid-way along Park Ave South
        const bw = step - 1.1;
        // bronze frame + transom bar
        let q = at(0.24);
        b.box("bronze", q[0], 0.55, q[1], bw, 0.12, 0.1, {
          yaw,
          tint: 0x5a4428,
        });
        q = at(0.24);
        b.box("bronze", q[0], 3.0, q[1], bw, 0.14, 0.12, {
          yaw,
          tint: 0x5a4428,
        });
        for (const e of [-1, 1]) {
          const ex = cx + f.ux * e * (bw / 2 + 0.05) + f.nx * 0.24,
            ez = cz + f.uz * e * (bw / 2 + 0.05) + f.nz * 0.24;
          b.box("bronze", ex, 0.55, ez, 0.12, 3.2, 0.12, {
            yaw,
            tint: 0x5a4428,
          });
        }
        const r = rnd();
        const g = at(0.215);
        if (side) {
          b.box("bronze", g[0], 0.55, g[1], 2.4, 2.45, 0.08, {
            yaw,
            tint: 0x6a5030,
          });
          for (let k = 0; k < 4; k++)
            b.box(
              "wood_rotten",
              g[0] + f.nx * 0.06,
              0.8 + k * 0.55,
              g[1] + f.nz * 0.06,
              2.6,
              0.24,
              0.05,
              { yaw, tint: 0x7a6248 },
            );
          const lamp = at(0.7);
          for (const e of [-1.7, 1.7]) {
            const lx = lamp[0] + f.ux * e,
              lz = lamp[1] + f.uz * e;
            b.geo("lamp_amber", T.sphereLo, {
              x: lx,
              y: 2.9,
              z: lz,
              s: 0.16,
              grime: 0.3,
            });
            glows.add(lx + f.nx * 0.1, 2.9, lz + f.nz * 0.1, 0xffc878, "s");
          }
        } else if (r < 0.22) {
          // boarded
          for (let k = 0; k < 4; k++)
            b.box(
              "wood_rotten",
              g[0] + f.nx * 0.05,
              0.8 + k * 0.6,
              g[1] + f.nz * 0.05,
              bw,
              0.28,
              0.05,
              { yaw, tint: 0x7a6248, rz: ((k % 2) - 0.5) * 0.06 },
            );
          b.box("black", g[0], 0.67, g[1], bw, 2.33, 0.02, { yaw, grime: 0 });
        } else {
          // plate glass reads as a dark void (the glass material mirrors the sky and looked like pale shutters)
          b.box("black", g[0], 0.67, g[1], bw, 2.33, 0.02, { yaw, grime: 0 });
          if (r < 0.5)
            for (let k = 0; k < 3; k++) {
              const sx = g[0] + f.ux * (k - 1) * bw * 0.3 + f.nx * 0.03,
                sz = g[1] + f.uz * (k - 1) * bw * 0.3 + f.nz * 0.03;
              b.geo("glass_broken", T.cone4, {
                x: sx,
                y: 0.67 + 0.15,
                z: sz,
                sx: 0.25,
                sy: 0.35 + k * 0.1,
                sz: 0.02,
                ry: yaw,
                grime: 0.3,
              });
            } // jagged shards in the frame
          else {
            const d = at(0.25);
            b.box("bronze", d[0], 1.85, d[1], bw, 0.05, 0.04, {
              yaw,
              tint: 0x5a4428,
            });
          } // intact: horizontal glazing bar
        }
        b.box("black", g[0], 3.14, g[1], bw, 0.72, 0.02, { yaw, grime: 0 }); // transom lights
        if (!side)
          for (const e of [-1, 1]) {
            const mx = g[0] + (f.ux * e * bw) / 6,
              mz = g[1] + (f.uz * e * bw) / 6;
            b.box(
              "bronze",
              mx + f.nx * 0.02,
              3.14,
              mz + f.nz * 0.02,
              0.06,
              0.72,
              0.04,
              { yaw, tint: 0x5a4428 },
            );
          }
      }
    }
    // the piers stand 0.62 m proud of the block collider: one skin box so nobody walks into them
    K.colBox(x0 - 0.62, 0, z0 - 0.62, x1 + 0.62, H, z1 + 0.62, {
      surface: "concrete",
    });
  }
  /** Round 2: arched plate-glass windows on the campanile base's side faces (the real tower's arcaded base). */
  function towerBaseWindows(b, TX0, TX1, TZ0, TZ1, tcz, marble) {
    const tcx = (TX0 + TX1) / 2;
    for (const f of [
      { z: TZ0 - 0.3, nz: -1 },
      { z: TZ1 + 0.3, nz: 1 },
    ]) {
      const yaw = f.nz > 0 ? 0 : PI;
      for (const du of [-7.5, 0, 7.5]) {
        const x = tcx + du,
          z = f.z + f.nz * 0.01;
        b.box("black", x, 0.6, z, 3.2, 4.8, 0.02, { yaw, grime: 0 });
        b.box("glass", x, 0.8, z + f.nz * 0.03, 2.9, 4.4, 0.02, {
          yaw,
          grime: 0.4,
        });
        b.geo("marble_t", new THREE.TorusGeometry(1.75, 0.28, 4, 12, PI), {
          x,
          y: 5.4,
          z: z + f.nz * 0.02,
          ry: yaw,
          tint: marble,
        });
        b.box("marble_t", x - 1.95, 0, z + f.nz * 0.12, 0.45, 5.4, 0.3, {
          yaw,
          tint: marble,
        });
        b.box("marble_t", x + 1.95, 0, z + f.nz * 0.12, 0.45, 5.4, 0.3, {
          yaw,
          tint: marble,
        });
        for (const e of [-0.72, 0, 0.72])
          b.box("bronze", x + e, 0.8, z + f.nz * 0.05, 0.06, 4.4, 0.04, {
            yaw,
            tint: 0x5a4428,
          });
        for (const y of [2.2, 3.7])
          b.box("bronze", x, y, z + f.nz * 0.05, 2.9, 0.06, 0.04, {
            yaw,
            tint: 0x5a4428,
          });
        b.box("marble_t", x, 0.45, z + f.nz * 0.15, 3.4, 0.2, 0.35, {
          yaw,
          tint: marble,
        }); // sill
      }
    }
  }

