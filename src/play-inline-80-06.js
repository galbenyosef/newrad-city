// play-inline-80 06 — beam
// Lines 1442-1738 of readable/play-inline-80.pretty.js (statement-aligned).
  function buildNavyYard() {
    const L = G.LAYOUT;
    // freighter moored (and half sunk) off the Brooklyn shore
    const shore = M.shoreX(L.BROOKLYN, 770, -1);
    if (shore !== null) {
      const cx = shore - 22,
        cz = 770;
      const b = M.buf("rust", cx, cz, "mid");
      M.setXF(M.mtx(cx, -3.2, cz, 0.04, 0.02, -0.09));
      hull(b, 90, 15, 10, {
        c: [0.55, 0.3, 0.22],
        ct: [0.35, 0.33, 0.3],
        cd: [0.5, 0.42, 0.36],
      });
      // superstructure aft
      M.box(b, -6, 0.4, -40, 6, 9, -28, { s: 3, c: [0.8, 0.78, 0.72] });
      M.box(b, -4, 9, -38, 4, 12, -31, { s: 3, c: [0.75, 0.72, 0.68] });
      M.cyl(b, 0, 12, -34, 1.4, 1.2, 5, 10, { c: [0.35, 0.18, 0.15] });
      // cargo hatches & containers
      const cb = M.buf("corrugated", cx, cz, "mid");
      const cc = [
        [0.6, 0.25, 0.2],
        [0.25, 0.4, 0.55],
        [0.7, 0.55, 0.25],
        [0.35, 0.5, 0.35],
      ];
      for (let k = 0; k < 7; k++) {
        const zz = -20 + k * 7.5;
        if (k === 4) continue;
        const layers = 1 + (k % 3);
        for (let y = 0; y < layers; y++)
          M.box(cb, -5, 0.4 + y * 2.6, zz - 3, 5, 3 + y * 2.6, zz + 3, {
            s: 2.5,
            c: cc[(k + y) % 4],
          });
      }
      // cargo cranes (booms)
      for (const zz of [-12, 12]) {
        M.cyl(b, 0, 0.4, zz, 0.5, 0.4, 10, 8, { c: [0.7, 0.6, 0.3] });
        M.beam(b, 0, 9, zz, 6, 4, zz + 8, 0.35, 0.35, { c: [0.7, 0.6, 0.3] });
      }
      M.setXF(null);
      M.ocol(cx, cz, 16, 92, -10, 5, 0.04, { tag: "ship", surface: "metal" });
    }
    // gantry cranes on the yard
    for (const [x, z] of [
      [505, 720],
      [540, 812],
    ]) {
      const b = M.buf("rust", x, z, "mid");
      const H = 34,
        span = 18;
      const col = [0.72, 0.55, 0.32];
      for (const sx of [-span / 2, span / 2])
        for (const sz of [-4, 4]) {
          M.beam(
            b,
            x + sx,
            0,
            z + sz,
            x + sx * 0.9,
            H,
            z + sz * 0.8,
            0.8,
            0.8,
            { c: col },
          );
          M.box3(x + sx - 0.5, 0, z + sz - 0.5, x + sx + 0.5, H, z + sz + 0.5, {
            tag: "crane",
            surface: "metal",
          });
        }
      for (const sx of [-span / 2, span / 2]) {
        M.beam(b, x + sx, 3, z - 4, x + sx, 3, z + 4, 0.6, 0.6, { c: col });
        M.beam(
          b,
          x + sx,
          0.5,
          z - 4,
          x + sx * 0.9,
          H * 0.6,
          z + 3.2,
          0.3,
          0.3,
          { c: col },
        );
      }
      // main girder extending out over the water (west)
      M.box(b, x - span / 2 - 32, H, z - 2, x + span / 2 + 10, H + 3, z + 2, {
        s: 3,
        c: col,
      });
      M.box(b, x - 4, H + 3, z - 2.5, x + 4, H + 7, z + 2.5, {
        s: 3,
        c: [0.6, 0.6, 0.55],
      });
      for (let k = -span / 2 - 30; k < span / 2 + 10; k += 4)
        M.beam(b, x + k, H, z - 2, x + k + 4, H + 3, z - 2, 0.2, 0.2, {
          c: col,
        });
      // trolley & cable hook
      M.box(b, x - 26, H - 1.5, z - 1.5, x - 22, H, z + 1.5, {
        s: 2,
        c: [0.4, 0.4, 0.4],
      });
      M.pipe(b, x - 24, H - 1.5, z, x - 24, H - 14, z, 0.06, 4, {
        c: [0.2, 0.2, 0.2],
      });
      M.box(b, x - 24.6, H - 15.2, z - 0.6, x - 23.4, H - 14, z + 0.6, {
        s: 1,
        c: [0.7, 0.6, 0.2],
      });
    }
    // container stacks
    const cb = M.buf("corrugated", 620, 760);
    const cc = [
      [0.6, 0.25, 0.2],
      [0.25, 0.4, 0.55],
      [0.7, 0.55, 0.25],
      [0.35, 0.5, 0.35],
      [0.5, 0.5, 0.48],
    ];
    const r = M.rng("containers");
    for (const [x0, z0] of [
      [590, 700],
      [640, 850],
    ]) {
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 3; j++) {
          const h = r.int(1, 3);
          const x = x0 + i * 3.2,
            z = z0 + j * 13;
          if (L.rectOverlapsSite(x - 1.5, z - 6.5, x + 1.5, z + 6.5, 2))
            continue;
          for (let y = 0; y < h; y++)
            M.box(
              cb,
              x - 1.25,
              SY + y * 2.6,
              z - 6,
              x + 1.25,
              SY + 2.55 + y * 2.6,
              z + 6,
              { s: 2.5, c: cc[r.int(0, 4)] },
            );
          M.box3(x - 1.25, 0, z - 6, x + 1.25, SY + h * 2.6, z + 6, {
            tag: "container",
            surface: "metal",
          });
        }
    }
  }

  // -------------------------------------------------------------------
  // Sunken boats around the harbour
  // -------------------------------------------------------------------
  function buildBoats() {
    const L = G.LAYOUT;
    const boats = [
      // x, z, yaw, len, beam, depth, sink, roll, pitch, type
      [-395, -560, 1.2, 22, 6, 3.5, 1.6, 0.35, 0.1, "tug"],
      [-380, 420, -0.4, 30, 9, 3, 2.2, -0.2, 0.18, "ferry"],
      [385, -200, 2.4, 18, 5, 3, 1.4, 0.5, 0.05, "tug"],
      [372, 820, 0.2, 40, 9, 4, 2.6, 0.12, 0.08, "tallship"],
      [-470, 1150, 0.8, 16, 5, 3, 1.2, 0.3, 0.2, "tug"],
      [420, 300, 1.7, 26, 8, 2.5, 1.8, -0.25, 0.06, "barge"],
      [-250, 1080, 2.2, 20, 6, 3, 1.5, 0.4, -0.12, "tug"],
      [455, 560, 3.0, 14, 4.5, 2.5, 1.0, 0.6, 0.1, "tug"],
    ];
    for (const [
      x,
      z,
      yaw,
      len,
      beam,
      depth,
      sink,
      roll,
      pitch,
      type,
    ] of boats) {
      if (L.isLand(x, z)) continue;
      const b = M.buf(
        type === "tallship" ? "wood_rotten" : "rust",
        x,
        z,
        "mid",
      );
      M.setXF(M.mtx(x, -1.2 - sink, z, yaw, pitch, roll));
      const col =
        type === "tug"
          ? [0.55, 0.25, 0.2]
          : type === "ferry"
            ? [0.75, 0.55, 0.3]
            : type === "tallship"
              ? [0.45, 0.35, 0.25]
              : [0.45, 0.4, 0.35];
      hull(b, len, beam, depth, {
        c: col,
        ct: M.mulc(col, 1.3),
        cd: [0.5, 0.45, 0.4],
      });
      if (type === "tug") {
        M.box(b, -beam * 0.3, 0.4, -len * 0.2, beam * 0.3, 3.2, len * 0.15, {
          s: 2,
          c: [0.85, 0.8, 0.72],
        });
        M.box(b, -beam * 0.25, 3.2, -len * 0.12, beam * 0.25, 4.6, len * 0.08, {
          s: 2,
          c: [0.8, 0.75, 0.7],
        });
        M.cyl(b, 0, 3.2, -len * 0.22, 0.6, 0.55, 2.5, 8, {
          c: [0.2, 0.2, 0.2],
        });
      } else if (type === "ferry") {
        M.box(b, -beam * 0.45, 0.4, -len * 0.4, beam * 0.45, 3.4, len * 0.35, {
          s: 2.5,
          c: [0.8, 0.62, 0.35],
        });
        M.box(b, -beam * 0.4, 3.4, -len * 0.3, beam * 0.4, 5.6, len * 0.25, {
          s: 2.5,
          c: [0.85, 0.7, 0.45],
        });
      } else if (type === "tallship") {
        for (const mz of [-12, 2, 14]) {
          const h = mz === 2 ? 26 : 22;
          M.cyl(b, 0, 0.4, mz, 0.35, 0.2, h, 8, { c: [0.35, 0.28, 0.2] });
          for (const yh of [h * 0.45, h * 0.7, h * 0.9])
            M.beam(b, -5 + yh * 0.05, yh, mz, 5 - yh * 0.05, yh, mz, 0.2, 0.2, {
              c: [0.35, 0.28, 0.2],
            });
          if (mz !== 14)
            M.pipe(b, 0, h, mz, 0, 1, mz + 12, 0.03, 3, {
              c: [0.15, 0.15, 0.12],
            });
        }
        M.pipe(b, 0, 0.4, len / 2, 0, 5, len / 2 + 9, 0.25, 6, {
          c: [0.35, 0.28, 0.2],
        }); // bowsprit
      } else {
        const cc = [
          [0.6, 0.25, 0.2],
          [0.25, 0.4, 0.55],
          [0.5, 0.5, 0.48],
        ];
        for (let k = 0; k < 3; k++)
          M.box(
            b,
            -3.5,
            0.4,
            -len * 0.35 + k * 7,
            3.5,
            3,
            -len * 0.35 + k * 7 + 6,
            { s: 2.5, c: cc[k] },
          );
      }
      M.setXF(null);
    }
  }

  // -------------------------------------------------------------------
  // Far skyline filler outside the playable area (no colliders)
  // -------------------------------------------------------------------
  function farBlock(b, bt, x0, z0, x1, z1, h, style, v) {
    const tile = M.facadeTile();
    const c = [0.78, 0.78, 0.76];
    const sides = [
      [x0, z0, x1, z0],
      [x1, z0, x1, z1],
      [x1, z1, x0, z1],
      [x0, z1, x0, z0],
    ];
    for (const s of sides) {
      const l = Math.hypot(s[2] - s[0], s[3] - s[1]);
      M.wall(
        b,
        s[0],
        s[1],
        s[2],
        s[3],
        0,
        h,
        0,
        l / tile.w,
        0,
        h / tile.h,
        M.mulc(c, 0.7),
        c,
      );
    }
    M.box(bt, x0, h, z0, x1, h + 0.6, z1, {
      s: 4,
      c: [0.6, 0.6, 0.58],
      skip: 8,
    });
  }
