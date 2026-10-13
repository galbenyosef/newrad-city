// play-inline-100 02 — wallz
// Lines 372-667 of readable/play-inline-100.pretty.js (statement-aligned).
  function boardedWindow(K, x, y, z, nx, nz, w, h) {
    const T = M.DUNGEON_T / 2 + 0.01;
    const px = x + nx * T,
      pz = z + nz * T;
    K.plate("glass_dirty", px, y, pz, nx, nz, w, h, null, [0.2, 0.2, 0.18]);
    const rx = nz,
      rz = -nx;
    for (let i = 0; i < 4; i++) {
      const yy = y - h / 2 + 0.2 + (i * (h - 0.3)) / 3 + K.r.range(-0.05, 0.05);
      K.obox(
        "wood_planks",
        px + nx * 0.04,
        yy,
        pz + nz * 0.04,
        Math.abs(rx) * (w + 0.3) + Math.abs(nx) * 0.03,
        0.18,
        Math.abs(rz) * (w + 0.3) + Math.abs(nz) * 0.03,
        0,
        {
          roll: Math.abs(nz) > 0 ? K.r.range(-0.08, 0.08) : 0,
          pitch: Math.abs(nx) > 0 ? K.r.range(-0.08, 0.08) : 0,
          c: [0.55, 0.46, 0.34],
          s: 1,
        },
      );
    }
    // daylight slits: faint additive glow planes in front of the gaps
    const uv = M.lightUV(0);
    M.quad(
      K.b("my/lightfx"),
      [px - (rx * w) / 2 + nx * 0.06, y - h / 2, pz - (rz * w) / 2 + nz * 0.06],
      [px + (rx * w) / 2 + nx * 0.06, y - h / 2, pz + (rz * w) / 2 + nz * 0.06],
      [
        px + (rx * w) / 2 + nx * 1.6,
        y - h / 2 - 1.6,
        pz + (rz * w) / 2 + nz * 1.6,
      ],
      [
        px - (rx * w) / 2 + nx * 1.6,
        y - h / 2 - 1.6,
        pz - (rz * w) / 2 + nz * 1.6,
      ],
      [0, 1, 0],
      [uv[0], uv[3], uv[2], uv[3], uv[2], uv[1], uv[0], uv[1]],
      [0.05, 0.05, 0.04],
    );
  }
  /** Cast-iron loft column. */
  function column(K, x, y, z, h, o) {
    o = o || {};
    K.cyl(o.mat || "metal_painted", x, y, z, 0.16, 0.14, h, 8, {
      c: o.c || [0.3, 0.33, 0.3],
    });
    K.cyl(o.mat || "metal_painted", x, y, z, 0.24, 0.24, 0.3, 8, {
      c: o.c || [0.3, 0.33, 0.3],
      capTop: true,
    });
    K.cyl(o.mat || "metal_painted", x, y + h - 0.35, z, 0.16, 0.3, 0.35, 8, {
      c: o.c || [0.3, 0.33, 0.3],
    });
    K.col(x - 0.2, y, z - 0.2, x + 0.2, y + h, z + 0.2, {
      tag: "column",
      surface: "metal",
    });
  }
  /** Mail slots panel on a wall. */
  function mailboxes(K, x, y, z, nx, nz, cols, rows) {
    const rx = nz,
      rz = -nx,
      T = M.DUNGEON_T / 2;
    const W = cols * 0.28,
      H = rows * 0.34;
    K.plate(
      "bronze",
      x + nx * (T + 0.02),
      y + H / 2,
      z + nz * (T + 0.02),
      nx,
      nz,
      W + 0.1,
      H + 0.1,
      null,
      [0.6, 0.48, 0.3],
    );
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const cx = x + rx * (-W / 2 + 0.14 + i * 0.28),
          cz = z + rz * (-W / 2 + 0.14 + i * 0.28);
        const open = K.r() < 0.25;
        K.plate(
          open ? "glass_dirty" : "metal_panel",
          cx + nx * (T + 0.035),
          y + 0.17 + j * 0.34,
          cz + nz * (T + 0.035),
          nx,
          nz,
          0.24,
          0.3,
          null,
          open ? [0.05, 0.05, 0.05] : [0.55, 0.45, 0.3],
        );
      }
  }
  /** Radiator under a window. */
  function radiator(K, x, y, z, yaw) {
    for (let i = 0; i < 8; i++) {
      const [px, pz] = K.rot(x, z, yaw, -0.5 + i * 0.14, 0);
      K.obox("metal_painted", px, y + 0.4, pz, 0.08, 0.7, 0.18, yaw, {
        c: [0.5, 0.48, 0.42],
        s: 1,
      });
    }
    K.ocol(x, z, 1.2, 0.2, y, y + 0.8, yaw, {
      tag: "furniture",
      surface: "metal",
    });
  }
  /** Kitchenette along a wall: counter, sink, stove; the fridge is a props container. */
  function kitchenette(K, x0, x1, wallZ, dir, y) {
    const z0 = Math.min(wallZ, wallZ + dir * 0.62),
      z1 = Math.max(wallZ, wallZ + dir * 0.62);
    K.counter(x0, z0, x1 - 0.9, z1, y, {
      h: 0.92,
      top: "tile_floor",
      topC: [0.75, 0.74, 0.68],
      c: [0.55, 0.62, 0.55],
      mat: "metal_painted",
    });
    K.box(
      "metal_panel",
      x0 + 0.5,
      y + 0.8,
      z0 + 0.1,
      x0 + 1.0,
      y + 0.93,
      z1 - 0.1,
      [0.6, 0.6, 0.58],
      0.5,
    );
    K.box(
      "metal_painted",
      x1 - 0.85,
      y,
      z0,
      x1 - 0.1,
      y + 0.92,
      z1,
      [0.72, 0.7, 0.62],
      1,
    );
    for (const dx of [-0.6, -0.35])
      for (const dz of [0.2, 0.42])
        K.cyl(
          "metal_painted",
          x1 + dx,
          y + 0.92,
          z0 + (dir > 0 ? dz : 0.62 - dz),
          0.09,
          0.09,
          0.02,
          8,
          { c: [0.15, 0.15, 0.15] },
        );
    K.col(x1 - 0.85, y, z0, x1 - 0.1, y + 0.92, z1, {
      tag: "furniture",
      surface: "metal",
    });
    // cupboards above
    K.box(
      "wood_planks",
      x0,
      y + 1.5,
      dir > 0 ? wallZ : wallZ - 0.35,
      x1 - 0.9,
      y + 2.2,
      dir > 0 ? wallZ + 0.35 : wallZ,
      [0.55, 0.5, 0.4],
      1,
    );
  }
  /** Apartment room with living area, bed & kitchenette (room rect r; entry side given). */
  function apartment(K, R, o) {
    o = o || {};
    const y = R.y,
      r = K.r;
    const cx = (R.x0 + R.x1) / 2,
      cz = (R.z0 + R.z1) / 2;
    const west = o.bedSide === "w";
    const bx = west ? R.x0 + 1.2 : R.x1 - 1.2;
    K.bed(bx, y, R.z0 + 1.4, 0, { double: r() < 0.6 });
    K.table(cx, y, cz + 0.5, r() * 0.3, 1.2, 0.8, { c: [0.45, 0.35, 0.25] });
    K.chair(cx - 0.8, y, cz + 0.5, HP, {
      c: [0.4, 0.3, 0.2],
      knocked: r() < 0.4,
    });
    K.sofa(west ? R.x1 - 1.6 : R.x0 + 1.6, y, R.z1 - 1.1, 0, {});
    kitchenette(
      K,
      west ? R.x1 - 3.8 : R.x0 + 0.3,
      west ? R.x1 - 0.3 : R.x0 + 3.8,
      R.z0 + M.DUNGEON_T / 2,
      1,
      y,
    );
    // TV set, rug, pictures
    const tvx = west ? R.x1 - 1.6 : R.x0 + 1.6;
    K.box(
      "wood_planks",
      tvx - 0.45,
      y,
      R.z1 - 3.2,
      tvx + 0.45,
      y + 0.75,
      R.z1 - 2.6,
      [0.5, 0.35, 0.22],
      1,
    );
    K.box(
      "glass_dirty",
      tvx - 0.3,
      y + 0.25,
      R.z1 - 2.6,
      tvx + 0.3,
      y + 0.62,
      R.z1 - 2.58,
      [0.1, 0.12, 0.1],
      1,
    );
    K.col(tvx - 0.45, y, R.z1 - 3.2, tvx + 0.45, y + 0.75, R.z1 - 2.6, {
      tag: "furniture",
      surface: "wood",
    });
    K.box(
      "fabric",
      cx - 1.3,
      y + 0.005,
      cz - 0.6,
      cx + 1.3,
      y + 0.02,
      cz + 1.6,
      r.pick([
        [0.45, 0.2, 0.15],
        [0.25, 0.3, 0.4],
        [0.5, 0.42, 0.3],
      ]),
      0.5,
      8,
    );
    K.litter(R.x0, R.z0, R.x1, R.z1, y, 10);
    K.light(r() < 0.5 ? "bulb" : "dead", cx, y + R.h, cz, { floor: y });
    // the fridge is a container (props)
    K.loot("fridge", west ? R.x1 - 4.4 : R.x0 + 4.4, y, R.z0 + 0.55, PI, {
      loot: "fridge",
    });
  }
  /** Office cubicle grid in a rect (rows along x). */
  function cubicles(K, x0, z0, x1, z1, y, o) {
    o = o || {};
    const r = K.r;
    const cw = 2.6,
      cd = 2.6;
    for (let x = x0; x + cw <= x1 + 0.01; x += cw)
      for (let z = z0; z + cd * 2 <= z1 + 0.01; z += cd * 2 + 1.6) {
        // a back-to-back pair of cubicles
        if (r() < 0.12) {
          K.rubbleMound(x + cw / 2, y, z + cd, 1.4, 0.5);
          continue;
        }
        K.partition(x, z + cd, x + cw, z + cd, y, 1.45);
        K.partition(x, z, x, z + cd * 2, y, 1.45);
        if (x + cw * 2 > x1 + 0.01)
          K.partition(x + cw, z, x + cw, z + cd * 2, y, 1.45);
        for (const [dz, yaw] of [
          [0.5, 0],
          [cd * 2 - 0.5, PI],
        ]) {
          const top = K.desk(x + cw / 2, y, z + dz, yaw, {
            w: 1.6,
            d: 0.7,
            monitor: r() < 0.7 ? "right" : false,
          });
          void top;
          K.chair(
            x + cw / 2 + r.range(-0.3, 0.3),
            y,
            z + dz + (yaw === 0 ? 0.9 : -0.9),
            yaw + r.range(-0.6, 0.6),
            { knocked: r() < 0.25 },
          );
        }
      }
  }

  // ===================================================================
  // 1. Kessler & Sons Garment Lofts — raiders
  // ===================================================================
