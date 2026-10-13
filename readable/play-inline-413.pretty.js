/* src/poi_fidi3/30_delmonicos.js */
/* =====================================================================
 * NEW RAD CITY — poi_fidi3 / 30_delmonicos.js
 * DELMONICO'S (Beaver & South William) — a friendly settlement that is
 * far too clean: the members-only dining club of THE GILDED FORK SOCIETY.
 *
 * EXTERIOR (site x 136..164, z 858..882; Beaver St north, Nassau west):
 *   the 1891 building — brownstone ground floor with tall arched windows
 *   glowing warm, tan-brick upper floors, the ROUNDED CORNER with the
 *   portico on the two marble columns "brought from Pompeii", a curved
 *   balcony with the gilt DELMONICO'S name, gas lamps, a red carpet and
 *   velvet ropes, scrubbed pavement, iron areaway railings, green
 *   awnings, flower boxes — and a hand-lettered HELP WANTED board.
 * INTERIOR → 31_delmonicos_interior.js.
 * Quest: "An Acquired Taste" (standing) — Mae Tully's husband Walt took the
 *   dishwasher job two weeks ago. Free him from the larder (good), join
 *   the Society at table (evil), or talk the Society out of its menu.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const DM = (PV.dm = {
    X0: 136,
    X1: 164,
    Z0: 858,
    Z1: 882,
    FX: 138,
    FZ: 860, // west face x, north face z
    AC: { x: 144, z: 866, r: 6 }, // rounded-corner arc centre
    DA: (3 * PI) / 4, // door angle on the arc (faces the Beaver/Nassau corner)
    GF: 5.2, // ground-floor height
  });
  const arcP = (t, r) => [DM.AC.x + Math.cos(t) * r, DM.AC.z - Math.sin(t) * r];
  DM.arcP = arcP;
  {
    const p = arcP(DM.DA, DM.AC.r + 0.45);
    DM.door = new THREE.Vector3(p[0], 0.51 + 1.3, p[1]);
  }

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
  function data() {
    K.defineItem({
      id: "pf3_dm_key",
      type: "key",
      name: "Delmonico's Cold Storage Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A brass key on a butcher's-twine loop. The tag reads COLD STORAGE — STAFF ONLY — NO GUESTS.",
    });
    K.defineItem({
      id: "pf3_dm_steak",
      type: "aid",
      name: "Delmonico Steak (Chef's Special)",
      weight: 0.5,
      value: 60,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 60, duration: 300, attrs: { grit: 1 } },
      desc: "A thick, perfectly marbled cut, pan-seared, finished with butter. It is not ox. You know it is not ox.",
    });
    K.defineItem({
      id: "pf3_dm_newberg",
      type: "aid",
      name: "Lobster Newberg (Shellback)",
      weight: 0.5,
      value: 25,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 30, stamina: 10 },
      desc: "Invented here in 1876, allegedly. The lobster is a shellback. The sherry is real.",
    });
    K.defineItem({
      id: "pf3_dm_alaska",
      type: "aid",
      name: "Baked Alaska",
      weight: 0.5,
      value: 30,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 15, stamina: 25 },
      desc: "Meringue, cake and something frozen, flambéed at the table by a robot. Named for the purchase of Alaska, and kept on the menu through every war since.",
    });
    K.defineItem({
      id: "pf3_dm_benedict",
      type: "aid",
      name: "Eggs Benedict",
      weight: 0.4,
      value: 18,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 25 },
      desc: "Poached eggs (stinger), ham (mystery), hollandaise (miraculous). Another Delmonico's invention.",
    });
    K.defineItem({
      id: "pf3_dm_ring",
      type: "misc",
      name: "Gilded Fork Signet Ring",
      weight: 0,
      value: 300,
      tags: ["valuable", "unique"],
      desc: 'Heavy gold, engraved with a fork crossed over a knife and the motto OMNES EDUNT — "everyone eats." Members wear it on the right hand, so that it shows when they cut.',
    });
    K.defineItem({
      id: "pf3_dm_penny",
      type: "misc",
      name: "Walt's Lucky Penny",
      weight: 0,
      value: 5,
      tags: ["unique"],
      desc: "A 1943 steel penny, drilled and threaded on a string. Walt says it saved his life once. Mae says it did it twice.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pf3_taste",
        name: "An Acquired Taste",
        giver: "Mae Tully",
        location: "Delmonico's",
        desc: "Mae Tully's husband Walt took a dishwasher job at Delmonico's, the fine-dining club on Beaver Street. That was two weeks ago.",
        stages: [
          {
            id: "find",
            text: "Look for Walt Tully at Delmonico's.",
            markers: [{ npc: "pf3_lorenzo", label: "Maître d'" }],
          },
          {
            id: "cellar",
            text: "Find out what is behind the kitchen's cold-storage door.",
            markers: [
              () => {
                const a = PV.anchor("delmonicos", "coldstore");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Cold Storage",
                      interior: "delmonicos",
                    }
                  : null;
              },
            ],
          },
          {
            id: "free",
            text: "Get Walt out of the larder.",
            markers: [{ npc: "pf3_walt", label: "Walt" }],
          },
          {
            id: "return",
            text: "Tell Mae that Walt is safe.",
            markers: [{ npc: "pf3_mae", label: "Mae" }],
          },
        ],
        rewards: { xp: 300 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const S = PV;
    const toCellar = () => {
      if (q.active("pf3_taste") && q.stage("pf3_taste") === "find")
        q.set("pf3_taste", "cellar");
    };
    G.dialogue.register("pf3_dlg_mae", {
      start: () => {
        if (S.flag("dm_walt_free") && q.active("pf3_taste")) return "reunion";
        if (q.done("pf3_taste"))
          return S.flag("dm_walt_eaten") ? "widow" : "after";
        if (q.active("pf3_taste")) return "again";
        return "hello";
      },
      nodes: {
        hello: {
          speaker: "Mae Tully",
          text: '[A thin woman in a patched coat, watching the portico like it might bite.] Excuse me — you look like you can take care of yourself. My husband Walt took the dishwasher job in there. "HELP WANTED." Two weeks ago. He said they pay in real food. He hasn\'t come home.',
          responses: [
            {
              text: "I'll go in and look for him.",
              next: "yes",
              action: () => q.start("pf3_taste"),
            },
            { text: "Maybe he just likes the job.", next: "likes" },
            { text: "Why don't you go in yourself?", next: "why" },
            { text: "Not my problem.", end: true },
          ],
        },
        likes: {
          speaker: "Mae Tully",
          text: "Walt? Walt has never liked a job in his life. He liked me, and his lucky penny, and sleeping in. He'd have come home.",
          responses: [
            {
              text: "I'll look for him.",
              next: "yes",
              action: () => q.start("pf3_taste"),
            },
            { text: "Sorry.", end: true },
          ],
        },
        why: {
          speaker: "Mae Tully",
          text: 'I did. The robot at the door said "members and guests only, madam," and the man with the tiny moustache looked at me like — like he was measuring me. For a coat. Or something.',
          responses: [
            {
              text: "I'll go in.",
              next: "yes",
              action: () => q.start("pf3_taste"),
            },
            { text: "Sorry.", end: true },
          ],
        },
        yes: {
          speaker: "Mae Tully",
          text: "Thank you. He's a big lug, red beard, sings when he washes. If he's in there, you'll hear him. If you don't hear him... [She stops.] Just find him.",
          responses: [{ text: "I will.", end: true }],
        },
        again: {
          speaker: "Mae Tully",
          text: "Anything? Did you see him? Did you hear him singing?",
          responses: [{ text: "Still looking.", end: true }],
        },
        reunion: {
          speaker: "Mae Tully",
          text: () =>
            "[Walt is here — filthy, shaking, alive. Mae has her arms around him and isn't letting go.] You found him. They had him in a CAGE? In a — oh god, those people. Those PEOPLE. Here — it's all we have. And his lucky penny. He wants you to have it. Says his luck's used up; you'll need it more.",
          onEnter: () => {
            if (q.active("pf3_taste")) {
              K.scrip(80);
              K.give("pf3_dm_penny", 1);
              K.give("rally_tonic", 2);
              K.standing(50, "Rescued Walt Tully");
              q.complete("pf3_taste");
            }
          },
          responses: [{ text: "Get him somewhere safe.", end: true }],
        },
        after: {
          speaker: "Mae Tully",
          text: () =>
            S.flag("dm_reformed")
              ? "They're serving ox now, I hear. I still won't eat there. Walt says the hollandaise was good, though. I hit him."
              : "Walt still wakes up screaming. But he wakes up. Thank you.",
          responses: [{ text: "Take care, Mae.", end: true }],
        },
        widow: {
          speaker: "Mae Tully",
          text: "Still no word. I'll wait. Somebody has to wait.",
          responses: [
            { text: "[Say nothing]", end: true },
            { text: "He's not coming back, Mae.", end: true, standing: 5 },
          ],
        },
      },
    });
    G.dialogue.register("pf3_dlg_lorenzo", {
      start: () => {
        if (S.flag("dm_reformed")) return "reformed";
        if (S.flag("dm_member")) return "member";
        if (S.flag("dm_walt_free") || S.flag("dm_seen_larder")) return "knows";
        return S.flag("dm_met_lorenzo") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Lorenzo Delmonico",
          onEnter: () => S.setFlag("dm_met_lorenzo", true),
          text: "Good evening, and welcome to Delmonico's — New York's first restaurant, since 1837, and, one might argue, its last. I am Lorenzo Delmonico, seventh of the name. Do you have a reservation?",
          responses: [
            {
              text: "I'm looking for a man named Walt Tully.",
              next: "walt",
              cond: () => q.active("pf3_taste"),
            },
            { text: "I'm hungry. What's on the menu?", next: "menu" },
            { text: "What is this place?", next: "history" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Lorenzo Delmonico",
          text: "Back again. The kitchen is at your disposal — within reason. Everything is within reason at Delmonico's.",
          responses: [
            { text: "Let's see the menu.", barter: true, end: true },
            {
              text: "About Walt Tully.",
              next: "walt",
              cond: () =>
                q.active("pf3_taste") && q.stage("pf3_taste") === "find",
            },
            { text: "Tell me about the Society.", next: "society" },
            { text: "Goodbye.", end: true },
          ],
        },
        menu: {
          speaker: "Lorenzo Delmonico",
          text: "Everything you know was invented here. The Delmonico steak. Lobster Newberg. Eggs Benedict. Baked Alaska. We still serve them all — adapted, shall we say, to local ingredients. The Chef's Special is reserved for members.",
          responses: [
            { text: "Show me what you have.", barter: true, end: true },
            { text: "Members?", next: "society" },
          ],
        },
        history: {
          speaker: "Lorenzo Delmonico",
          text: "The Delmonico brothers opened the first true restaurant in America on this corner — a menu! Tablecloths! Choice! — and fed presidents, robber barons and Charles Dickens. When the bombs fell, the members of the Gilded Fork Society were at their Sunday brunch. They simply... never left. We have kept up standards. Someone must.",
          responses: [
            { text: "The Gilded Fork Society?", next: "society" },
            { text: "Goodbye.", end: true },
          ],
        },
        society: {
          speaker: "Lorenzo Delmonico",
          text: "A dining club. Old families — old money, when money meant anything. They believe civilisation is simply the refusal to eat with one's hands. Membership is by invitation. And by... appetite.",
          responses: [
            { text: "Appetite for what?", next: "appetite" },
            { text: "Goodbye.", end: true },
          ],
        },
        appetite: {
          speaker: "Lorenzo Delmonico",
          text: "[His smile does not move.] For the finer things.",
          responses: [{ text: "Right.", end: true }],
        },
        walt: {
          speaker: "Lorenzo Delmonico",
          onEnter: toCellar,
          text: "Mr. Tully. Our dishwasher. He... resigned. Most of our staff resign, eventually. Chef Bastien handled his severance. Is there anything else? The Colonel's soup is getting cold.",
          responses: [
            {
              text: "[Senses 6] Your eyes just went to the kitchen door.",
              check: { attr: "senses", value: 6 },
              next: "tell",
              failNext: "tell_fail",
            },
            { text: "I'll ask the Chef.", end: true },
          ],
        },
        tell: {
          speaker: "Lorenzo Delmonico",
          text: "[A long pause.] The kitchen is staff only, and the cold storage beneath it doubly so. The Chef keeps the key. I am sure there is nothing down there to interest a guest.",
          responses: [{ text: "I'm sure.", end: true }],
        },
        tell_fail: {
          speaker: "Lorenzo Delmonico",
          text: "Good evening.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        knows: {
          speaker: "Lorenzo Delmonico",
          text: "[He folds his hands.] You have been below stairs. I can see it in how you look at the tables. Well. What happens now is a matter of taste.",
          responses: [
            {
              text: "[Persuasion 70] This ends tonight. Serve ox, or the whole city hears what you serve instead.",
              check: { skill: "persuasion", value: 70 },
              next: "reform",
              failNext: "reform_fail",
            },
            {
              text: "[Trade 50] Silence is expensive. How much is mine worth?",
              check: { skill: "trade", value: 50 },
              next: "hush",
              failNext: "hush_fail",
              cond: () => !S.flag("dm_hush"),
            },
            { text: "You're all monsters. [Attack]", next: "fight" },
            { text: "Nothing. For now.", end: true },
          ],
        },
        reform: {
          speaker: "Lorenzo Delmonico",
          text: "[He looks out over the dining room for a long time. At the Colonel. At the Judge. At the empty chair.] ...Very well. A hundred and fifty years, we adapted to every fashion. We shall adapt to one more. Ox Wellington, from tomorrow. The members will complain. The members always complain.",
          onEnter: () => {
            S.setFlag("dm_reformed", true);
            K.standing(40, "Reformed the Gilded Fork Society");
            K.xp(200, "An Acquired Taste: the menu changes");
            if (
              q.active("pf3_taste") &&
              !S.flag("dm_walt_free") &&
              !S.flag("dm_walt_eaten")
            )
              q.set("pf3_taste", "free");
          },
          responses: [{ text: "See that they do.", end: true }],
        },
        reform_fail: {
          speaker: "Lorenzo Delmonico",
          text: "The city? My dear guest, the Ruins eat whatever they can catch. We simply use cutlery.",
          responses: [
            { text: "Then I'll deal with you myself. [Attack]", next: "fight" },
            { text: "We'll see.", end: true },
          ],
        },
        hush: {
          speaker: "Lorenzo Delmonico",
          onEnter: () => {
            S.setFlag("dm_hush", true);
            K.scrip(300);
            K.standing(-40, "Took the Society's hush money");
          },
          text: "Three hundred scrip, and a standing table. [He counts it out without looking.] A pleasure doing business with a realist.",
          responses: [{ text: "Pleasure's mine.", end: true }],
        },
        hush_fail: {
          speaker: "Lorenzo Delmonico",
          text: "Worth? Very little, I'm afraid. People go missing every day. The ones who talk go missing faster.",
          responses: [{ text: "...", end: true }],
        },
        fight: {
          speaker: "Lorenzo Delmonico",
          text: "How terribly rude. — Gentlemen. Dessert.",
          onEnter: () => PV.dmHostile && PV.dmHostile(),
          responses: [{ text: "[Fight]", end: true }],
        },
        member: {
          speaker: "Lorenzo Delmonico",
          text: "Your table is ready, as always. The Chef has something special.",
          responses: [
            { text: "Let's see the menu.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        reformed: {
          speaker: "Lorenzo Delmonico",
          text: "Ox Wellington tonight. It is... adequate. The Colonel wept. Welcome back.",
          responses: [
            { text: "Let's see the menu.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    G.dialogue.register("pf3_dlg_anton", {
      start: () =>
        S.flag("dm_member")
          ? "member"
          : S.flag("dm_reformed")
            ? "reformed"
            : S.flag("dm_seen_larder") && !S.flag("dm_walt_free")
              ? "deal"
              : "hello",
      nodes: {
        hello: {
          speaker: "Chef Bastien",
          text: "[A tall man in spotless whites, sharpening a knife that is already sharp.] Guests do not come into my kitchen. You are in my kitchen. So either you are lost, or you are staff, or you are an ingredient. Which?",
          responses: [
            {
              text: "Where's Walt Tully?",
              next: "walt",
              cond: () => q.active("pf3_taste"),
            },
            { text: "What's in cold storage?", next: "cold" },
            {
              text: "[Persuasion 60] Mr. Delmonico sent me for the cold-storage key. Inventory.",
              check: { skill: "persuasion", value: 60 },
              next: "key",
              failNext: "key_fail",
              cond: () => !K.has("pf3_dm_key"),
            },
            { text: "Just lost.", end: true },
          ],
        },
        walt: {
          speaker: "Chef Bastien",
          onEnter: () => {
            if (q.active("pf3_taste") && q.stage("pf3_taste") === "find")
              q.set("pf3_taste", "cellar");
          },
          text: "The dishwasher. Big fellow. Sang. [He tests the edge on his thumbnail.] He is... resting. In cold storage. Stacking inventory.",
          responses: [{ text: "Then I'll go say hello.", next: "cold" }],
        },
        cold: {
          speaker: "Chef Bastien",
          text: "Cold storage is locked, the key is on my belt, and my belt is on me. Hock is down there, and Hock does not like visitors. Good night.",
          responses: [{ text: "Good night.", end: true }],
        },
        key: {
          speaker: "Chef Bastien",
          onEnter: () => K.give("pf3_dm_key", 1),
          text: "Inventory. Of course. [He unhooks the key without looking at you.] Tell Hock the Colonel wants the rib. He'll know.",
          responses: [{ text: "Will do.", end: true }],
        },
        key_fail: {
          speaker: "Chef Bastien",
          text: "Mr. Delmonico has never sent anyone for anything. He rings a bell. Out.",
          responses: [{ text: "Going.", end: true }],
        },
        deal: {
          speaker: "Chef Bastien",
          text: "[He sets the knife down, which is somehow worse.] So. You have seen my larder. Let me offer you a perspective, friend. Everyone in the Ruins eats. The only question anyone has ever asked is: who is at the table, and who is on it. You could be at the table.",
          responses: [
            { text: "I'm listening.", next: "offer" },
            { text: "I'm getting Walt out of there.", next: "no" },
          ],
        },
        offer: {
          speaker: "Chef Bastien",
          text: "Membership. A ring, a seat, three hundred scrip from the Society's purse — and tonight's special, which is, of course, Mr. Tully. You keep your mouth shut. You eat. You become one of us. The Ruins will never feed you so well again.",
          responses: [
            {
              text: "[Join the Gilded Fork Society] ...Pass the salt.",
              next: "join",
            },
            { text: "No. Walt's coming with me.", next: "no" },
          ],
        },
        join: {
          speaker: "Chef Bastien",
          text: "[He smiles for the first time. It is a very good smile.] Welcome to the table. Omnes edunt — everyone eats. Your ring. Your scrip. And — [the silver cloche comes up] — your supper.",
          onEnter: () => {
            S.setFlag("dm_member", true);
            S.setFlag("dm_walt_eaten", true);
            K.give("pf3_dm_ring", 1);
            K.scrip(300);
            K.give("pf3_dm_steak", 2);
            K.standing(-150, "Joined the Gilded Fork Society");
            K.safe("walt", () => {
              const w = G.actors.get && G.actors.get("pf3_walt");
              if (w && G.actors.remove) G.actors.remove(w);
            });
            if (q.active("pf3_taste")) q.complete("pf3_taste");
          },
          responses: [{ text: "[Eat]", end: true }],
        },
        no: {
          speaker: "Chef Bastien",
          text: "Pity. Hock! — We have a guest who wants to see the larder.",
          onEnter: () => PV.dmHockHostile && PV.dmHockHostile(),
          responses: [{ text: "[Leave]", end: true }],
        },
        member: {
          speaker: "Chef Bastien",
          text: "Brother. The rib is especially good tonight.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        reformed: {
          speaker: "Chef Bastien",
          text: "Ox. OX! A hundred and fifty years of tradition and I am cooking a draught animal. [He cooks it anyway, beautifully.]",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pf3_dlg_walt", {
      start: () => (S.flag("dm_cage_open") ? "open" : "caged"),
      nodes: {
        caged: {
          speaker: "Walt Tully",
          text: "[A big red-bearded man in a filthy apron, gripping the bars.] You're — you're not Hock. Oh thank God. Please. Did Mae send you? They've been... they took Hector on Tuesday. They took the Portuguese kid before that. They weigh me every morning.",
          responses: [
            {
              text: "Mae sent me. Hold on — I'll get this cage open.",
              next: "hold",
              action: () => {
                if (K.q.active("pf3_taste")) K.q.set("pf3_taste", "free");
              },
            },
            { text: "Where's the key?", next: "key" },
          ],
        },
        key: {
          speaker: "Walt Tully",
          learn: "pf3_lk_dm_cage",
          text: "Hock's got one. The Chef's got one. And the padlock's got a dial on it too — Hock spins it every morning before he weighs me. Four... two... one... nine. I've had a lot of time to watch. Just hurry. He comes down at supper.",
          responses: [{ text: "Hold on.", end: true }],
        },
        hold: {
          speaker: "Walt Tully",
          text: "Hurry. Please.",
          responses: [{ text: "Hang on.", end: true }],
        },
        open: {
          speaker: "Walt Tully",
          text: "It's open — it's OPEN. I know the back way: the service stairs come up by the staff entrance. I'll find Mae. [He grips your hand in both of his.] I won't forget this. Not ever.",
          responses: [
            {
              text: "Go. Now.",
              end: true,
              action: () => PV.dmFreeWalt && PV.dmFreeWalt(),
            },
          ],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  const SOCIETY = [
    "pf3_lorenzo",
    "pf3_anton",
    "pf3_hock",
    "pf3_dm_d1",
    "pf3_dm_d2",
    "pf3_dm_d3",
    "pf3_dm_d4",
    "pf3_dm_d5",
    "pf3_dm_waiter",
  ];
  function spawn(ctx) {
    const A = ctx.anchors,
      S = PV;
    const stock = K.stock(
      [
        ["pf3_dm_newberg", 4],
        ["pf3_dm_alaska", 3],
        ["pf3_dm_benedict", 5],
        ["wine", 4],
        ["scotch", 2],
        ["whiskey", 2],
        ["purified_water", 4],
      ],
      "merchant_food",
      4,
    );
    if (S.flag("dm_member")) stock.push(["pf3_dm_steak", 3]);
    PV.spawnActor(ctx, {
      id: "pf3_lorenzo",
      type: "human",
      gender: "m",
      outfit: "dj",
      hair: "slick",
      beard: "moustache",
      name: "Lorenzo Delmonico",
      faction: "settlers",
      level: 8,
      pos: v(A.maitre),
      yaw: A.maitre.yaw || 0,
      ai: "merchant",
      home: "here",
      homeR: 1.2,
      dialogue: "pf3_dlg_lorenzo",
      merchant: { scrip: 600, stock, restock: 2, priceMult: 1.4 },
      barks: [
        "Welcome to Delmonico's.",
        "Your table will be ready momentarily.",
        "Jackets are, regrettably, no longer required.",
        "The Chef's special is for members only.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pf3_anton",
      type: "human",
      gender: "m",
      outfit: "lab_coat",
      hair: "short",
      name: "Chef Bastien",
      faction: "settlers",
      level: 10,
      pos: v(A.chef),
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 2.5,
      dialogue: "pf3_dlg_anton",
      inventory: [["pf3_dm_key", 1]],
      weapon: K.itemExists("combat_knife") ? "combat_knife" : undefined,
      barks: [
        "Mise en place!",
        "The sauce is everything.",
        "More salt. Always more salt.",
        "Hock! The Colonel wants the rib.",
      ],
    });
    if (!S.flag("dm_hock_dead"))
      PV.spawnActor(ctx, {
        id: "pf3_hock",
        type: "human",
        gender: "m",
        outfit: "settler",
        hair: "bald",
        beard: "full",
        name: "Hock",
        faction: "settlers",
        level: 11,
        hp: 220,
        scale: 1.12,
        pos: v(A.hock),
        yaw: 0,
        ai: "guard",
        home: "here",
        homeR: 3,
        inventory: [["pf3_dm_key", 1]],
        noRespawn: true,
        weapon: K.itemExists("hunting_knife")
          ? "hunting_knife"
          : K.itemExists("combat_knife")
            ? "combat_knife"
            : undefined,
        barks: [
          "...",
          "Heavy one today.",
          "Chef says the rib.",
          "[humming a lullaby, off-key]",
        ],
        onDeath: () => S.setFlag("dm_hock_dead", true),
      });
    const diners = [
      ["pf3_dm_d1", "Mrs. Van Duyn", "f"],
      ["pf3_dm_d2", "The Judge", "m"],
      ["pf3_dm_d3", "Colonel Whitcombe", "m"],
      ["pf3_dm_d4", "Miss Fenwick", "f"],
      ["pf3_dm_d5", "Mr. Astor-Pryce", "m"],
    ];
    const dbarks = [
      [
        "Too much salt again. Bastien is getting sentimental.",
        "Have you tried the special? No? Oh, you must.",
        "My grandmother dined here with Mark Twain. He was delicious company.",
      ],
      [
        "Order. Order in the dining room.",
        "The sentence is the special.",
        "Pass the horseradish.",
      ],
      [
        "In Korea we ate far worse, young man.",
        "Is it the rib tonight? Splendid.",
        "Waiter! More claret.",
      ],
      [
        "One simply cannot get good help.",
        "He had such lovely strong arms.",
        "Is that a new guest? How... fresh.",
      ],
      [
        "Money? My dear, we ARE the money.",
        "Everyone eats. Omnes edunt.",
        "The Baked Alaska, and something to cleanse the palate.",
      ],
    ];
    diners.forEach(([id, name, g], i) => {
      const a = A["diner" + (i + 1)];
      if (a)
        PV.spawnActor(ctx, {
          id,
          type: "human",
          gender: g,
          outfit: i % 2 ? "dj" : "doctor",
          hair: g === "f" ? "long" : "slick",
          name,
          faction: "settlers",
          level: 6,
          pos: v(a),
          yaw: a.yaw || 0,
          ai: "sit",
          home: "here",
          homeR: 0.3,
          age: 0.4 + i * 0.1,
          barks: S.flag("dm_reformed")
            ? ["Ox. How... rustic.", "I suppose one adapts."]
            : dbarks[i],
        });
    });
    PV.spawnActor(ctx, {
      id: "pf3_dm_waiter",
      type: "valet",
      name: "Jeeves",
      faction: "settlers",
      level: 6,
      pos: v(A.waiter),
      ai: "wander",
      home: "here",
      homeR: 6,
      barks: [
        "May I top up your glass, sir?",
        "The Baked Alaska will be flambéed tableside.",
        "Very good, madam.",
        "Your coat, sir? Your... everything, sir?",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pf3_dm_porter",
      type: "valet",
      name: "Porter-Bot",
      faction: "settlers",
      level: 6,
      pos: v(A.porter),
      yaw: PI * 0.25,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      barks: [
        "Members and guests only.",
        "Welcome to Delmonico's. Please wipe your feet. And your weapon.",
        "Now seating. Now hiring.",
      ],
    });
    // Mae waits outside; Walt is either in his cage, home with Mae, or... not.
    PV.spawnActor(ctx, {
      id: "pf3_mae",
      type: "human",
      gender: "f",
      outfit: "survivor",
      name: "Mae Tully",
      faction: "settlers",
      level: 3,
      essential: true,
      pos: v(A.mae),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 1.2,
      dialogue: "pf3_dlg_mae",
      barks: [
        "Walt? ...No.",
        "Two weeks. It's been two weeks.",
        "Real food, he said.",
      ],
    });
    if (!S.flag("dm_walt_eaten")) {
      const home = !!S.flag("dm_walt_free");
      PV.spawnActor(ctx, {
        id: "pf3_walt",
        type: "human",
        gender: "m",
        outfit: "settler",
        hair: "short",
        beard: "full",
        hairColor: 0x8a3a1a,
        name: "Walt Tully",
        faction: "settlers",
        level: 3,
        essential: true,
        pos: v(home ? A.walt_home : A.walt),
        yaw: home ? PI : 0,
        ai: home ? "guard" : "static",
        home: "here",
        homeR: home ? 1.5 : 0.3,
        dialogue: "pf3_dlg_walt",
        barks: home
          ? [
              "Never again. Never, ever again.",
              "I'm gonna wash dishes at home. For free. Forever.",
            ]
          : [
              "Help! Somebody!",
              "[singing, badly, to keep from crying]",
              "They weigh me every morning...",
            ],
      });
    }
    PV.dmHostile = () => {
      for (const id of SOCIETY) {
        const a = G.actors.get && G.actors.get(id);
        if (a && !a.dead && a.setHostile) a.setHostile(true);
      }
    };
    PV.dmHockHostile = () => {
      const a = G.actors.get && G.actors.get("pf3_hock");
      if (a && !a.dead && a.setHostile) a.setHostile(true);
    };
    PV.dmFreeWalt = () => {
      if (S.flag("dm_walt_free")) return;
      S.setFlag("dm_walt_free", true);
      PV.dmHockHostile();
      G.fadeTransition(() => {
        K.safe("walt", () => {
          const w = G.actors.get && G.actors.get("pf3_walt");
          if (w && G.actors.remove) G.actors.remove(w);
        });
        const h = A.walt_home;
        PV.spawnActor(ctx, {
          id: "pf3_walt",
          type: "human",
          gender: "m",
          outfit: "settler",
          hair: "short",
          beard: "full",
          hairColor: 0x8a3a1a,
          name: "Walt Tully",
          faction: "settlers",
          level: 3,
          essential: true,
          pos: v(h),
          yaw: PI,
          ai: "guard",
          home: "here",
          homeR: 1.5,
          dialogue: "pf3_dlg_walt",
          barks: ["Never again.", "Mae... Mae..."],
        });
      });
      K.notify("Walt slips out through the service stairs.");
      if (K.q.active("pf3_taste")) K.q.set("pf3_taste", "return");
    };
  }

  // Society retaliates when you shoot one of them inside the dining room
  G.events.on("actorDamaged", (actor, amount, info) => {
    if (
      !actor ||
      !actor.id ||
      !/^pf3_(lorenzo|anton|hock|dm_d\d|dm_waiter)$/.test(actor.id)
    )
      return;
    if (info && info.source === "player") {
      if (actor.id === "pf3_hock") PV.dmHockHostile && PV.dmHockHostile();
      else PV.dmHostile && PV.dmHostile();
    }
  });
  G.events.on("actorDamaged", (actor, amount, info) => {
    if (!actor || actor.faction !== "raiders" || !actor.pos) return;
    const it = G.LAYOUT.INTERIORS.federal_hall;
    if (!it) return;
    if (
      Math.abs(actor.pos.x - it.origin.x) < 150 &&
      Math.abs(actor.pos.z - it.origin.z) < 150 &&
      PV.vossHostile
    )
      PV.vossHostile();
  });

  PV.define({
    id: "delmonicos",
    name: "Delmonico's",
    interior: "delmonicos",
    order: 30,
    build(ctx) {
      exterior(ctx);
      if (PV.dmInterior) PV.dmInterior(ctx);
    },
    data,
    spawn,
    reset() {
      PV.dmHostile = PV.dmHockHostile = PV.dmFreeWalt = null;
    },
    update(dt, realDt, ctx) {
      if (PV.dmUpdate) PV.dmUpdate(dt, realDt, ctx);
    },
  });
})();
