// play-inline-413 03 — tint
// Lines 47-898 of readable/play-inline-413.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "dm_ext", grime: 0.3 });
    const r = K.rng("dm_ext");
    const { X1, Z1, FX, FZ, AC, DA, GF } = DM;
    const bs = [0.95, 0.72, 0.58],
      tan = [0.95, 0.86, 0.7],
      trim = [1.02, 0.84, 0.7];
    const H = 16.0,
      floors = [GF, GF + 3.4, GF + 6.8];

    // ---- walls: west + north flats, rounded corner, east + south ----
    const wallPair = (ax, az, bx, bz, nx, nz) => {
      K.fwall(b, "brownstone", ax, az, bx, bz, 0, GF, nx, nz, { tint: bs });
      K.fwall(b, "brick_tan", ax, az, bx, bz, GF, H - GF, nx, nz, {
        tint: tan,
      });
    };
    wallPair(FX, AC.z, FX, Z1, -1, 0);
    wallPair(AC.x, FZ, X1, FZ, 0, -1);
    wallPair(X1, FZ, X1, Z1, 1, 0);
    wallPair(FX, Z1, X1, Z1, 0, 1);
    K.ringWall(b, "brownstone", AC.x, AC.z, AC.r, 0, GF, HP, PI, 12, false, {
      tint: bs,
      col: false,
    });
    K.ringWall(b, "brick_tan", AC.x, AC.z, AC.r, GF, H, HP, PI, 12, false, {
      tint: tan,
      col: false,
    });
    b.face("concrete_dark", FX, H, Z1, 1, 0, 0, 0, 0, -1, X1 - FX, Z1 - FZ, {
      uv: "top",
      tint: [0.4, 0.38, 0.36],
    });
    b.col(FX, 0, AC.z, X1, H, Z1, { tag: "building" });
    b.col(AC.x, 0, FZ, X1, H, Z1, { tag: "building" });
    // rounded corner: eight thin slabs whose outer faces sit on the curve (no invisible wall in front of the portico)
    // (ocol yaw = t aligns the collider's width with the radial direction (cos t, −sin t))
    for (let k = 0; k < 8; k++) {
      const t = HP + ((k + 0.5) / 8) * HP,
        p = arcP(t, AC.r - 0.6);
      b.ocol(p[0], p[1], 1.2, (2 * Math.PI * AC.r) / 32 + 0.1, 0, H, t, {
        tag: "building",
      });
    }
    for (let k = 0; k < 3; k++) {
      const t = HP + ((k + 0.5) / 3) * HP,
        p = arcP(t, AC.r * 0.55);
      b.ocol(p[0], p[1], 3.2, 3.2, 0, H, t, { tag: "building" });
    }
    // belt courses (brownstone) at each floor + the cornice + parapet, following the curve
    const band = (y, h, d) => {
      b.boxMM("brownstone", FX - d, y, AC.z, FX, y + h, Z1, {
        tint: trim,
        faces: "wtb",
      });
      b.boxMM("brownstone", AC.x, y, FZ - d, X1, y + h, FZ, {
        tint: trim,
        faces: "ntb",
      });
      b.boxMM("brownstone", X1, y, FZ, X1 + d, y + h, Z1, {
        tint: trim,
        faces: "etb",
      });
      K.ringWall(
        b,
        "brownstone",
        AC.x,
        AC.z,
        AC.r + d,
        y,
        y + h,
        HP,
        PI,
        12,
        false,
        { tint: trim, col: false },
      );
      K.annulus(b, "brownstone", AC.x, y + h, AC.z, AC.r, AC.r + d, 12, true, {
        a0: HP,
        arc: HP,
        tint: trim,
      });
      K.annulus(b, "brownstone", AC.x, y, AC.z, AC.r, AC.r + d, 12, false, {
        a0: HP,
        arc: HP,
        tint: trim,
      });
    };
    band(GF - 0.35, 0.45, 0.3);
    band(GF + 3.4 - 0.15, 0.25, 0.15);
    band(GF + 6.8 - 0.15, 0.25, 0.15);
    band(H - 1.2, 0.9, 0.7);
    band(H - 0.3, 0.3, 0.2);
    // ---- ground floor: tall arched windows glowing warm (the only lit windows on the street) ----
    const lit = {
      state: "lit",
      surround: "brownstone",
      surroundTint: trim,
      sillMat: "brownstone",
      trimTint: trim,
    };
    DM.winLit = [];
    for (let k = 0; k < 4; k++) {
      const z = AC.z + 2.6 + k * 3.8;
      K.archWin(
        b,
        FX,
        0.9,
        z,
        -1,
        0,
        2.0,
        3.6,
        Object.assign({ keystone: true }, lit),
      );
      DM.winLit.push([FX - 0.8, 2.6, z]);
    }
    for (let k = 0; k < 5; k++) {
      const x = AC.x + 2.2 + k * 3.8;
      if (x > X1 - 1.5) break;
      K.archWin(
        b,
        x,
        0.9,
        FZ,
        0,
        -1,
        2.0,
        3.6,
        Object.assign({ keystone: true }, lit),
      );
      DM.winLit.push([x, 2.6, FZ - 0.8]);
    }
    for (const t of [DA - 0.52, DA + 0.52]) {
      const p = arcP(t, AC.r);
      K.archWin(
        b,
        p[0],
        0.9,
        p[1],
        Math.cos(t),
        -Math.sin(t),
        1.6,
        3.6,
        Object.assign({ keystone: true }, lit),
      );
    }
    // green canvas awnings over the north windows
    for (let k = 0; k < 4; k++) {
      const x = AC.x + 2.2 + k * 3.8;
      if (x > X1 - 1.5) break;
      b.quadN(
        "fabric",
        [x - 1.3, 4.7, FZ],
        [x + 1.3, 4.7, FZ],
        [x + 1.3, 4.0, FZ - 1.2],
        [x - 1.3, 4.0, FZ - 1.2],
        [0, 0.6, -1],
        { tint: [0.2, 0.36, 0.26] },
      );
      b.quadN(
        "fabric",
        [x - 1.3, 4.0, FZ - 1.2],
        [x + 1.3, 4.0, FZ - 1.2],
        [x + 1.3, 3.75, FZ - 1.22],
        [x - 1.3, 3.75, FZ - 1.22],
        [0, 0, -1],
        { tint: [0.85, 0.8, 0.66] },
      );
    }
    // pedimented brownstone hood over a 2nd-floor window (x,z on the wall, facing nx,nz)
    const hood = (x, yb, z, nx, nz) => {
      const rx = nz,
        rz = -nx,
        yaw = Math.atan2(nx, nz),
        y0 = yb + 2.0 + 0.32,
        hw = 0.95,
        o = 0.2;
      b.box("brownstone", x + nx * 0.14, y0, z + nz * 0.14, 2.0, 0.14, 0.28, {
        yaw,
        tint: trim,
        faces: "nsewtb",
      });
      K.tri(
        b,
        "brownstone",
        [x - rx * hw + nx * o, y0 + 0.14, z - rz * hw + nz * o],
        [x + rx * hw + nx * o, y0 + 0.14, z + rz * hw + nz * o],
        [x + nx * o, y0 + 0.62, z + nz * o],
        [nx, 0, nz],
        { tint: trim },
      );
      for (const e of [-1, 1])
        b.beam(
          "brownstone",
          x + rx * e * hw + nx * (o + 0.04),
          y0 + 0.12,
          z + rz * e * hw + nz * (o + 0.04),
          x + nx * (o + 0.04),
          y0 + 0.66,
          z + nz * (o + 0.04),
          0.14,
          0.1,
          { tint: trim.map((v) => v * 1.04) },
        );
      for (const e of [-1, 1])
        b.box(
          "brownstone",
          x + rx * e * 0.85 + nx * 0.1,
          y0 - 0.34,
          z + rz * e * 0.85 + nz * 0.1,
          0.14,
          0.34,
          0.2,
          { yaw, tint: trim },
        ); // consoles
    };
    // brownstone quoins on the flat-wall corners (alternating long / short blocks)
    const quoin = (x, z, ax, az, bx, bz) => {
      for (let k = 0, y = GF; y < H - 1.3; k++, y += 0.5) {
        const la = k % 2 ? 0.5 : 0.9,
          lb = k % 2 ? 0.9 : 0.5;
        b.boxMM(
          "brownstone",
          Math.min(x, x + ax * la),
          y + 0.03,
          Math.min(z, z + az * la),
          Math.max(x, x + ax * la) + (ax ? 0 : 0.06 * Math.abs(bx)),
          y + 0.47,
          Math.max(z, z + az * la) + (az ? 0 : 0.06 * Math.abs(bz)),
          { tint: trim.map((v) => v * 0.97), faces: "nsewtb" },
        );
        b.boxMM(
          "brownstone",
          Math.min(x, x + bx * lb),
          y + 0.03,
          Math.min(z, z + bz * lb),
          Math.max(x, x + bx * lb),
          y + 0.47,
          Math.max(z, z + bz * lb),
          { tint: trim.map((v) => v * 0.97), faces: "nsewtb" },
        );
      }
    };
    quoin(X1 + 0.05, FZ - 0.05, -1, 0, 0, 1);
    quoin(X1 + 0.05, Z1 + 0.05, -1, 0, 0, -1);
    quoin(FX - 0.05, Z1 + 0.05, 1, 0, 0, -1);
    // cornice brackets (paired consoles under the deep cornice band), also round the curve
    for (let x = AC.x + 0.8; x < X1 - 0.3; x += 1.2)
      b.box("brownstone", x, H - 1.75, FZ - 0.28, 0.2, 0.55, 0.56, {
        tint: trim.map((v) => v * 0.95),
      });
    for (let z = AC.z + 0.8; z < Z1 - 0.3; z += 1.2)
      b.box("brownstone", FX - 0.28, H - 1.75, z, 0.56, 0.55, 0.2, {
        tint: trim.map((v) => v * 0.95),
      });
    for (let z = FZ + 0.8; z < Z1 - 0.3; z += 1.2)
      b.box("brownstone", X1 + 0.28, H - 1.75, z, 0.56, 0.55, 0.2, {
        tint: trim.map((v) => v * 0.95),
      });
    for (let k = 0; k < 7; k++) {
      const t = HP + ((k + 0.5) / 7) * HP,
        p = arcP(t, AC.r + 0.28);
      b.box("brownstone", p[0], H - 1.75, p[1], 0.2, 0.55, 0.56, {
        yaw: t + HP,
        tint: trim.map((v) => v * 0.95),
      });
    }
    // the roof: chimney stacks, the kitchen exhaust hood (soot down the back), a water tank, a skylight over the dining room
    for (const [cx, cz, ch] of [
      [X1 - 1.2, Z1 - 3, 3.2],
      [FX + 2.5, Z1 - 1.2, 2.6],
      [X1 - 1.2, FZ + 6, 2.2],
    ]) {
      b.boxMM("brick_red", cx - 0.6, H, cz - 0.9, cx + 0.6, H + ch, cz + 0.9, {
        tint: [0.62, 0.42, 0.34],
        faces: "nsewt",
      });
      b.boxMM(
        "brownstone",
        cx - 0.7,
        H + ch,
        cz - 1.0,
        cx + 0.7,
        H + ch + 0.18,
        cz + 1.0,
        { tint: trim, faces: "nsewtb" },
      );
      for (const dz of [-0.45, 0, 0.45])
        b.cyl("brick_red", cx, H + ch + 0.18, cz + dz, 0.12, 0.1, 0.35, 8, {
          tint: [0.8, 0.5, 0.38],
        });
    }
    {
      const hx = 158,
        hz = 878.5;
      b.boxMM("steel", hx - 1.1, H, hz - 0.8, hx + 1.1, H + 1.1, hz + 0.8, {
        tint: [0.45, 0.46, 0.46],
        faces: "nsewt",
      });
      b.cyl("steel", hx, H + 1.1, hz, 0.35, 0.35, 1.6, 10, {
        tint: [0.42, 0.42, 0.42],
      });
      b.cyl("steel", hx, H + 2.7, hz, 0.6, 0.1, 0.35, 10, {
        tint: [0.4, 0.4, 0.4],
      });
      b.plate(
        "decal",
        X1 + 0.02,
        H - 2.2,
        hz,
        1,
        0,
        2.2,
        4.2,
        K.decal("scorch", 88),
        { off: 0.02 },
      );
      b.glow(hx, H + 3.4, hz, [0.2, 0.2, 0.2], 3.0);
    }
    {
      const tx = 146,
        tz = 877;
      for (const [dx, dz] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ])
        b.beam(
          "wood_dark",
          tx + dx * 1.1,
          H,
          tz + dz * 1.1,
          tx + dx * 1.0,
          H + 2.4,
          tz + dz * 1.0,
          0.14,
          0.14,
          { tint: [0.3, 0.24, 0.18] },
        );
      b.cyl("wood", tx, H + 2.4, tz, 1.45, 1.4, 2.6, 14, {
        tint: [0.5, 0.36, 0.24],
      });
      for (let k = 0; k < 3; k++)
        b.cyl("black_iron", tx, H + 2.7 + k * 0.9, tz, 1.47, 1.47, 0.06, 14);
      b.cyl("wood_dark", tx, H + 5.0, tz, 1.55, 0.1, 0.9, 14, {
        tint: [0.28, 0.22, 0.18],
      });
    }
    {
      const sx = 146.5,
        sz = 868.5;
      b.boxMM("black_iron", sx - 2, H, sz - 1.5, sx + 2, H + 0.3, sz + 1.5, {
        tint: [0.25, 0.25, 0.25],
        faces: "nsewt",
      });
      b.quadN(
        "glass",
        [sx - 1.9, H + 0.3, sz - 1.4],
        [sx + 1.9, H + 0.3, sz - 1.4],
        [sx + 1.9, H + 1.1, sz],
        [sx - 1.9, H + 1.1, sz],
        [0, 1, -0.6],
        { tint: [0.5, 0.45, 0.35] },
      );
      b.quadN(
        "glass",
        [sx - 1.9, H + 0.3, sz + 1.4],
        [sx + 1.9, H + 0.3, sz + 1.4],
        [sx + 1.9, H + 1.1, sz],
        [sx - 1.9, H + 1.1, sz],
        [0, 1, 0.6],
        { tint: [0.5, 0.45, 0.35] },
      );
      b.glow(sx, H + 1.4, sz, [0.5, 0.35, 0.15], 3.5);
    }
    b.pipe(
      "black_iron",
      FX + 1,
      H + 0.3,
      Z1 - 4,
      X1 - 2,
      H + 0.3,
      Z1 - 4,
      0.06,
      5,
    );
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        FX + 3 + r() * (X1 - FX - 6),
        H + 0.012,
        FZ + 3 + r() * (Z1 - FZ - 6),
        3 + r() * 3,
        3 + r() * 2,
        r() * 3,
        K.decal(k % 2 ? "grime" : "puddle", 140 + k),
      );
    // ---- upper floors: sash windows, some lit (the private rooms), flower boxes ----
    for (const y of floors) {
      for (let k = 0; k < 4; k++) {
        const z = AC.z + 2.6 + k * 3.8,
          u = r();
        K.sash(b, FX, y + 0.8, z, -1, 0, 1.2, 2.0, {
          state: u < 0.15 ? "lit" : "glass",
          litTint: [0.5, 0.3, 0.13],
          drapes: true,
          cols: 2,
          rows: 2,
          surround: "brownstone",
          surroundTint: trim,
          lintel: 0.28,
        });
        if (y === floors[0]) hood(FX, y + 0.8, z, -1, 0);
      }
      for (let k = 0; k < 5; k++) {
        const x = AC.x + 2.2 + k * 3.8,
          u = r();
        if (x > X1 - 1.5) break;
        K.sash(b, x, y + 0.8, FZ, 0, -1, 1.2, 2.0, {
          state: u < 0.15 ? "lit" : "glass",
          litTint: [0.5, 0.3, 0.13],
          drapes: true,
          cols: 2,
          rows: 2,
          surround: "brownstone",
          surroundTint: trim,
          lintel: 0.28,
        });
        if (y === floors[0]) hood(x, y + 0.8, FZ, 0, -1);
        if (y === floors[0]) {
          b.boxMM(
            "wood_dark",
            x - 0.75,
            y + 0.55,
            FZ - 0.35,
            x + 0.75,
            y + 0.8,
            FZ,
            { tint: [0.3, 0.22, 0.15] },
          );
          for (let f = 0; f < 5; f++)
            b.geo("flat", K.sphereGeo(), {
              x: x - 0.6 + f * 0.3,
              y: y + 0.9,
              z: FZ - 0.18,
              s: 0.12,
              tint: r.pick([
                [0.7, 0.2, 0.2],
                [0.8, 0.7, 0.3],
                [0.3, 0.5, 0.25],
              ]),
            });
        }
      }
      for (const t of [DA - 0.5, DA, DA + 0.5]) {
        const p = arcP(t, AC.r);
        K.sash(b, p[0], y + 0.8, p[1], Math.cos(t), -Math.sin(t), 1.1, 2.0, {
          state: t === DA && y === floors[0] ? "lit" : "glass",
          litTint: [0.5, 0.3, 0.13],
          drapes: true,
          cols: 2,
          rows: 2,
          surround: "brownstone",
          surroundTint: trim,
          lintel: 0.28,
        });
        if (y === floors[0])
          hood(p[0], y + 0.8, p[1], Math.cos(t), -Math.sin(t));
      }
    }
    // ---- THE PORTICO on the corner ----
    const pr0 = AC.r,
      pr1 = AC.r + 3.1,
      pa0 = DA - 0.5,
      pa1 = DA + 0.5;
    // raised porch floor (marble) + two curved steps
    for (let k = 0; k < 3; k++) {
      const rr = pr1 + 0.9 - k * 0.45,
        y = 0.17 * (k + 1);
      K.annulus(b, "marble_white", AC.x, y, AC.z, pr0, rr, 10, true, {
        a0: pa0 - 0.08 + k * 0.02,
        arc: pa1 - pa0 + 0.16 - k * 0.04,
        tint: [0.88, 0.86, 0.82],
      });
      K.ringWall(
        b,
        "marble_white",
        AC.x,
        AC.z,
        rr,
        y - 0.17,
        y,
        pa0 - 0.08 + k * 0.02,
        pa1 + 0.08 - k * 0.02,
        10,
        false,
        { col: false, tint: [0.8, 0.78, 0.74] },
      );
      for (let s = 0; s < 4; s++) {
        const t = pa0 + ((s + 0.5) / 4) * (pa1 - pa0),
          p = arcP(t, (pr0 + rr) / 2);
        b.ocol(p[0], p[1], rr - pr0 + 0.2, 1.8, 0, y, -t, {
          tag: "floor",
          surface: "concrete",
        });
      }
    }
    // the red carpet up the steps to the door
    {
      const p0 = arcP(DA, pr1 + 1.2),
        p1 = arcP(DA, pr0 + 0.05),
        ux = Math.cos(DA),
        uz = -Math.sin(DA),
        px = -uz * 0.6,
        pz = ux * 0.6;
      b.quadN(
        "velvet",
        [p0[0] - px, 0.52, p0[1] - pz],
        [p0[0] + px, 0.52, p0[1] + pz],
        [p1[0] + px, 0.52, p1[1] + pz],
        [p1[0] - px, 0.52, p1[1] - pz],
        [0, 1, 0],
        { tint: [0.55, 0.08, 0.08], grime: 0.1 },
      );
    }
    // the Pompeii columns (marble, Ionic) and the curved balcony they carry
    DM.cols = [];
    for (const t of [DA - 0.3, DA + 0.3]) {
      const p = arcP(t, pr1 - 0.55);
      DM.cols.push(p);
      K.column(b, p[0], 0.51, p[1], 0.36, GF - 0.51, {
        kind: "ionic",
        mat: "marble_white",
        tint: [0.92, 0.9, 0.85],
      });
      b.col(p[0] - 0.4, 0.5, p[1] - 0.4, p[0] + 0.4, GF, p[1] + 0.4, {
        tag: "column",
        walkable: false,
      });
    }
    K.annulus(b, "brownstone", AC.x, GF, AC.z, pr0, pr1, 10, false, {
      a0: pa0,
      arc: pa1 - pa0,
      tint: trim,
    });
    K.annulus(b, "marble_white", AC.x, GF + 0.55, AC.z, pr0, pr1, 10, true, {
      a0: pa0,
      arc: pa1 - pa0,
      tint: [0.88, 0.86, 0.82],
    });
    K.ringWall(
      b,
      "brownstone",
      AC.x,
      AC.z,
      pr1,
      GF,
      GF + 0.55,
      pa0,
      pa1,
      10,
      false,
      { col: false, tint: trim },
    );
    for (const t of [pa0, pa1]) {
      const p = arcP(t, pr0),
        q = arcP(t, pr1);
      b.quadN(
        "brownstone",
        [p[0], GF, p[1]],
        [q[0], GF, q[1]],
        [q[0], GF + 0.55, q[1]],
        [p[0], GF + 0.55, p[1]],
        [
          Math.cos(t + (t === pa0 ? -HP : HP)),
          0,
          -Math.sin(t + (t === pa0 ? -HP : HP)),
        ],
        { tint: trim },
      );
    }
    // gilt name on the balcony fascia (flat panel tangent to the arc) + a brass rail on top
    {
      const p = arcP(DA, pr1 + 0.03),
        nx = Math.cos(DA),
        nz = -Math.sin(DA);
      K.letters(b, p[0], GF + 0.28, p[1], nx, nz, 3.2, 0.5, "DELMONICO'S", {
        fg: "#e8c060",
        font: 'Georgia, "Times New Roman", serif',
        off: 0.02,
        shadow: true,
        weather: false,
      });
    }
    for (let k = 0; k < 10; k++) {
      const t0 = pa0 + (k / 10) * (pa1 - pa0),
        t1 = pa0 + ((k + 1) / 10) * (pa1 - pa0),
        p = arcP(t0, pr1 - 0.1),
        q = arcP(t1, pr1 - 0.1);
      K.railing(b, p[0], p[1], q[0], q[1], GF + 0.55, {
        mat: "brass",
        handMat: "brass",
        h: 0.95,
        step: 0.18,
        col: false,
      });
    }
    // the door: mahogany & bevelled glass, brass kick plates, fanlight, lamps either side
    {
      const p = arcP(DA, pr0 + 0.02),
        nx = Math.cos(DA),
        nz = -Math.sin(DA),
        yaw = Math.atan2(nx, nz),
        rx = nz,
        rz = -nx;
      b.box("mahogany", p[0], 0.5, p[1], 2.4, 3.3, 0.12, {
        yaw,
        tint: [0.45, 0.18, 0.1],
      });
      for (const s of [-0.55, 0.55]) {
        b.plate(
          "lamp",
          p[0] + rx * s + nx * 0.07,
          2.35,
          p[1] + rz * s + nz * 0.07,
          nx,
          nz,
          0.7,
          1.5,
          null,
          { tint: [0.85, 0.55, 0.28] },
        );
        b.plate(
          "flat",
          p[0] + rx * s + nx * 0.075,
          0.8,
          p[1] + rz * s + nz * 0.075,
          nx,
          nz,
          0.8,
          0.4,
          null,
          { tint: [0.8, 0.62, 0.3] },
        );
      }
      b.plate(
        "lamp",
        p[0] + nx * 0.07,
        4.2,
        p[1] + nz * 0.07,
        nx,
        nz,
        2.0,
        0.6,
        null,
        { tint: [0.8, 0.52, 0.26] },
      );
      b.glow(p[0] + nx * 0.8, 2.4, p[1] + nz * 0.8, [0.7, 0.42, 0.18], 3.2);
      for (const s of [-1.9, 1.9]) {
        const lx = p[0] + rx * s + nx * 0.35,
          lz = p[1] + rz * s + nz * 0.35;
        b.beam(
          "black_iron",
          p[0] + rx * s,
          3.2,
          p[1] + rz * s,
          lx,
          3.2,
          lz,
          0.05,
          0.05,
        );
        b.cyl("glass", lx, 2.8, lz, 0.16, 0.2, 0.42, 6, {
          tint: [0.95, 0.75, 0.45],
        });
        b.geo("lamp", K.sphereGeo(), {
          x: lx,
          y: 2.98,
          z: lz,
          s: 0.08,
          tint: [1, 0.75, 0.4],
        });
        b.cyl("black_iron", lx, 3.22, lz, 0.22, 0.03, 0.15, 6);
        b.glow(lx, 2.98, lz, [1, 0.62, 0.28], 2.2);
      }
    }
    // velvet ropes & brass stanchions flanking the carpet
    {
      const ux = Math.cos(DA),
        uz = -Math.sin(DA),
        px = -uz,
        pz = ux;
      for (const s of [-1.1, 1.1]) {
        const pts = [0, 1.3, 2.6].map((d) => {
          const p = arcP(DA, pr1 + 0.5 - d);
          return [p[0] + px * s, p[1] + pz * s];
        });
        pts.forEach((q, i) => {
          const y0 = i === 0 ? 0 : 0.52;
          b.cyl("brass", q[0], y0, q[1], 0.04, 0.04, 0.95, 6);
          b.geo("brass", K.sphereGeo(), {
            x: q[0],
            y: y0 + 0.97,
            z: q[1],
            s: 0.06,
          });
          b.cyl("brass", q[0], y0, q[1], 0.16, 0.12, 0.04, 8);
        });
        for (let i = 0; i < 2; i++) {
          const a = pts[i],
            c = pts[i + 1],
            ya = (i === 0 ? 0 : 0.52) + 0.88,
            yc = 0.52 + 0.88,
            m = [(a[0] + c[0]) / 2, (ya + yc) / 2 - 0.18, (a[1] + c[1]) / 2];
          b.pipe("velvet", a[0], ya, a[1], m[0], m[1], m[2], 0.025, 5, {
            tint: [0.6, 0.06, 0.08],
          });
          b.pipe("velvet", m[0], m[1], m[2], c[0], yc, c[1], 0.025, 5, {
            tint: [0.6, 0.06, 0.08],
          });
        }
      }
      void ux;
    }
    // HELP WANTED sandwich board, planters, areaway railings, scrubbed pavement
    {
      const p = arcP(DA - 0.62, pr1 + 1.3);
      const hw = K.signCell(
        "dm_help",
        "DELMONICO'S\n~ Est. 1837 ~\nNOW SEATING\nMembers & Guests\n\nHELP WANTED\nDishwasher · Porter\nInquire Within",
        256,
        320,
        {
          bg: "#1e2a22",
          fg: "#e8dcb8",
          font: "Georgia, serif",
          border: "#b89040",
        },
      );
      const yaw = Math.atan2(Math.cos(DA), -Math.sin(DA));
      for (const s of [-1, 1]) {
        const tilt = 0.18;
        b.quadN(
          "art",
          [p[0] - 0.4 * Math.cos(yaw), 0, p[1] + 0.4 * Math.sin(yaw)],
          [p[0] + 0.4 * Math.cos(yaw), 0, p[1] - 0.4 * Math.sin(yaw)],
          [p[0] + 0.4 * Math.cos(yaw), 1.1, p[1] - 0.4 * Math.sin(yaw)],
          [p[0] - 0.4 * Math.cos(yaw), 1.1, p[1] + 0.4 * Math.sin(yaw)],
          [s * Math.sin(yaw), tilt, s * Math.cos(yaw)],
          { rect: hw, grime: 0 },
        );
      }
    }
    for (const t of [DA - 0.72, DA + 0.72]) {
      const p = arcP(t, AC.r + 1.6);
      b.box("brownstone", p[0], 0, p[1], 1.1, 0.7, 1.1, {
        yaw: -t,
        tint: trim,
      });
      for (let f = 0; f < 6; f++)
        b.geo("flat", K.sphereGeo(), {
          x: p[0] + (r() - 0.5) * 0.7,
          y: 0.8 + r() * 0.2,
          z: p[1] + (r() - 0.5) * 0.7,
          s: 0.14 + r() * 0.08,
          tint: r.pick([
            [0.25, 0.45, 0.2],
            [0.7, 0.2, 0.25],
            [0.3, 0.5, 0.22],
          ]),
        });
      b.col(p[0] - 0.55, 0, p[1] - 0.55, p[0] + 0.55, 0.7, p[1] + 0.55, {
        tag: "furniture",
      });
    }
    // cast-iron areaway railing along the site edge (gap for the portico)
    const rail = (ax, az, bx, bz) =>
      K.railing(b, ax, az, bx, bz, 0, {
        mat: "black_iron",
        handMat: "black_iron",
        h: 1.0,
        step: 0.14,
      });
    rail(DM.X0 + 0.25, 866.5, DM.X0 + 0.25, Z1 - 0.3);
    rail(146.5, DM.Z0 + 0.25, X1 - 0.3, DM.Z0 + 0.25);
    b.face(
      "sidewalk",
      DM.X0,
      0.015,
      Z1,
      1,
      0,
      0,
      0,
      0,
      -1,
      FX - DM.X0,
      Z1 - DM.Z0,
      { uv: "top", tint: [0.92, 0.9, 0.86], grime: 0.1 },
    );
    b.face("sidewalk", FX, 0.015, FZ, 1, 0, 0, 0, 0, -1, X1 - FX, FZ - DM.Z0, {
      uv: "top",
      tint: [0.92, 0.9, 0.86],
      grime: 0.1,
    });
    // service door on the east side (the staff entrance where Walt went in), with a bell and a crate of empties
    b.boxMM("paint_green", X1, 0, 876, X1 + 0.1, 2.4, 877.4, {
      tint: [0.2, 0.3, 0.22],
    });
    b.plate(
      "art",
      X1 + 0.11,
      2.75,
      876.7,
      1,
      0,
      1.2,
      0.3,
      K.signCell("dm_staff", "STAFF ENTRANCE", 256, 56, {
        bg: "#e8dcb8",
        fg: "#1e2a22",
        font: "Georgia, serif",
      }),
      { off: 0.01 },
    );
    b.glow(X1 + 0.5, 2.9, 876.7, [0.8, 0.6, 0.3], 1.2);

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_delmonicos_ext";
    {
      const p = arcP(DM.DA, pr1 + 1.6);
      K.anchor(ctx, "porter", p[0] + 1.3, 0, p[1] - 1.3, false);
    }
    K.anchor(ctx, "mae", 149, 0, 858.9, false);
    K.anchor(ctx, "walt_home", 150.5, 0, 858.9, false);
    K.loot(ctx, "crate", X1 + 0.8, 0, 878.6, 0.3, {
      world: true,
      kind: "plain",
      loot: "drinks",
      name: "Crate of Empties",
    });
    K.loot(ctx, "trash_can", X1 + 0.7, 0, 874.6, 0, {
      world: true,
      loot: "trash_can",
    });
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
