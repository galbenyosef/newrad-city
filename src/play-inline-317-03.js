// play-inline-317 03 — tint
// Lines 123-693 of readable/play-inline-317.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "dn_ext", grime: 0.45, seg: 2 });
    const r = K.rng("dn_ext");
    const x0 = DX0,
      x1 = DX1,
      z0 = DZ0,
      z1 = DZ1,
      L = x1 - x0,
      D = z1 - z0;
    // concrete pad + patio
    b.boxMM("concrete", x0 - 3, 0, z0 - 2, x1 + 3, 0.12, 77.5, {
      tint: [0.62, 0.6, 0.56],
      faces: "nsewt",
    });
    b.col(x0 - 3, -0.3, z0 - 2, x1 + 3, 0.12, 77.5, { tag: "floor" });
    // plinth (brick skirt) under the car
    b.boxMM("brick_red", x0 + 0.6, 0.12, z0 + 0.1, x1 - 0.6, 0.55, z1 - 0.1, {
      tint: [0.55, 0.36, 0.3],
    });
    // the shell: straight sides + end walls with rounded corners (radius RC); bands of
    // fluted stainless skirt, black enamel, ribbon windows, fluted fascia with a black stripe
    const RC = 1.3;
    const BANDS = [
      ["steel_flute", 0.55, 1.35, [1, 1, 1], 0],
      ["paint_black", 1.35, 1.5, [0.12, 0.12, 0.12], 0.01],
      ["glass", 1.5, 2.6, [0.35, 0.4, 0.42], 0],
      ["steel_flute", 2.6, 3.4, [1, 1, 1], 0],
      ["paint_black", 2.75, 3.25, [0.1, 0.1, 0.1], 0.02],
    ];
    const wall = (ax, az, bx, bz, nx, nz, windows) => {
      for (const [mat, ya, yb, tint, off] of BANDS) {
        if (mat === "glass" && !windows) {
          b.quadN(
            "paint_black",
            [ax + nx * off, ya, az + nz * off],
            [bx + nx * off, ya, bz + nz * off],
            [bx + nx * off, yb, bz + nz * off],
            [ax + nx * off, yb, az + nz * off],
            [nx, 0, nz],
            { tint: [0.12, 0.12, 0.12] },
          );
          continue;
        }
        b.quadN(
          mat,
          [ax + nx * off, ya, az + nz * off],
          [bx + nx * off, ya, bz + nz * off],
          [bx + nx * off, yb, bz + nz * off],
          [ax + nx * off, yb, az + nz * off],
          [nx, 0, nz],
          { tint, grime: 0.3 },
        );
      }
      for (const y of [0.8, 1.05, 2.68, 3.32])
        b.beam(
          "chrome",
          ax + nx * 0.04,
          y,
          az + nz * 0.04,
          bx + nx * 0.04,
          y,
          bz + nz * 0.04,
          0.05,
          0.04,
          { tint: [0.9, 0.92, 0.94] },
        );
      if (windows) {
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.max(1, Math.round(len / 1.9));
        for (let k = 0; k <= n; k++) {
          const t = k / n,
            px = ax + (bx - ax) * t,
            pz = az + (bz - az) * t;
          b.boxMM(
            "chrome",
            px - 0.05,
            1.5,
            pz - 0.05,
            px + 0.05,
            2.6,
            pz + 0.05,
            { tint: [0.85, 0.87, 0.9] },
          );
        }
        b.glow(
          (ax + bx) / 2 + nx * 0.4,
          2.0,
          (az + bz) / 2 + nz * 0.4,
          [0.9, 0.7, 0.4],
          4,
        );
      }
    };
    wall(x0 + RC, z1, x1 - RC, z1, 0, 1, true);
    wall(x1 - RC, z0, x0 + RC, z0, 0, -1, true);
    wall(x0, z0 + RC, x0, z1 - RC, -1, 0, true);
    wall(x1, z1 - RC, x1, z0 + RC, 1, 0, false);
    for (const [cx, cz, a0] of [
      [x0 + RC, z0 + RC, HP],
      [x1 - RC, z0 + RC, 0],
      [x1 - RC, z1 - RC, -HP],
      [x0 + RC, z1 - RC, PI],
    ]) {
      for (const [mat, ya, yb, tint, off] of BANDS)
        b.cyl(mat, cx, ya, cz, RC + off, RC + off, yb - ya, 8, {
          arc0: a0,
          arc: HP,
          top: false,
          tint:
            mat === "glass" ? tint : mat === "paint_black" ? tint : [1, 1, 1],
        });
      for (const y of [0.8, 1.05, 2.68, 3.32])
        b.cyl("chrome", cx, y - 0.02, cz, RC + 0.04, RC + 0.04, 0.04, 8, {
          arc0: a0,
          arc: HP,
          top: false,
          tint: [0.9, 0.92, 0.94],
        });
    }
    b.col(x0 + 0.4, 0, z0, x1 - 0.4, 3.4, z1, { tag: "building" });
    // barrel roof (monitor clerestory)
    const RW = D / 2 + 0.2,
      n = 10;
    for (let k = 0; k < n; k++) {
      const a0 = (PI * k) / n,
        a1 = (PI * (k + 1)) / n;
      const za = DCZ + Math.cos(a0) * RW,
        ya = 3.4 + Math.sin(a0) * 0.9,
        zb = DCZ + Math.cos(a1) * RW,
        yb = 3.4 + Math.sin(a1) * 0.9;
      b.quadN(
        "metal_dark",
        [x0 + 1.2, ya, za],
        [x1 - 1.2, ya, za],
        [x1 - 1.2, yb, zb],
        [x0 + 1.2, yb, zb],
        [0, Math.sin((a0 + a1) / 2), Math.cos((a0 + a1) / 2)],
        { tint: [0.35, 0.36, 0.38] },
      );
    }
    for (const xe of [x0 + 1.2, x1 - 1.2])
      for (let k = 0; k < n; k++) {
        const a0 = (PI * k) / n,
          a1 = (PI * (k + 1)) / n;
        b.quadN(
          "metal_dark",
          [xe, 3.4, DCZ],
          [xe, 3.4 + Math.sin(a0) * 0.9, DCZ + Math.cos(a0) * RW],
          [xe, 3.4 + Math.sin(a1) * 0.9, DCZ + Math.cos(a1) * RW],
          [xe, 3.4, DCZ],
          [xe < DCX ? -1 : 1, 0, 0],
          { tint: [0.3, 0.3, 0.32] },
        );
      }
    // name band on the fascia (both long sides)
    b.plate("art", DCX, 3.0, z1 + 0.06, 0, 1, 9, 0.5, nameBand());
    b.plate("art", DCX, 3.0, z0 - 0.06, 0, -1, 9, 0.5, nameBand());
    // glass-block vestibule (front centre)
    {
      const vx0 = DCX - 1.6,
        vx1 = DCX + 1.6,
        vz1 = z1 + 2.2;
      b.boxMM("glass", vx0, 0.12, z1, vx0 + 0.25, 2.8, vz1, {
        tint: [0.6, 0.7, 0.72],
      });
      b.boxMM("glass", vx1 - 0.25, 0.12, z1, vx1, 2.8, vz1, {
        tint: [0.6, 0.7, 0.72],
      });
      for (let y = 0.4; y < 2.8; y += 0.28) {
        b.beam("steel", vx0 - 0.01, y, z1, vx0 - 0.01, y, vz1, 0.02, 0.02);
        b.beam("steel", vx1 + 0.01, y, z1, vx1 + 0.01, y, vz1, 0.02, 0.02);
      }
      b.boxMM("stainless", vx0 - 0.1, 2.8, z1, vx1 + 0.1, 3.15, vz1 + 0.15, {
        tint: [0.85, 0.87, 0.9],
      });
      b.boxMM("stainless", vx0 + 0.25, 0.12, vz1 - 0.1, vx1 - 0.25, 2.5, vz1, {
        tint: [0.8, 0.82, 0.85],
      });
      b.plate("glass_dark", DCX, 1.45, vz1 + 0.01, 0, 1, 1.4, 2.0, null, {
        tint: [0.3, 0.33, 0.34],
      });
      b.beam(
        "chrome",
        DCX - 0.5,
        1.1,
        vz1 + 0.06,
        DCX + 0.5,
        1.1,
        vz1 + 0.06,
        0.04,
        0.04,
      );
      b.plate(
        "art",
        DCX,
        2.97,
        vz1 + 0.16,
        0,
        1,
        3.2,
        0.3,
        K.signCell("dn_open", "OPEN 24 HOURS · SINCE 1946", 512, 48, {
          bg: "#101010",
          fg: "#f0f0e0",
          font: "Arial, sans-serif",
        }),
      );
      for (const s of [0, 1])
        b.boxMM(
          "concrete",
          vx0,
          0.12,
          vz1 + s * 0.35,
          vx1,
          0.12 + (2 - s) * 0.18,
          vz1 + (s + 1) * 0.35,
          { tint: [0.6, 0.58, 0.55] },
        );
      b.col(vx0, 0, z1, vx0 + 0.25, 2.8, vz1, {});
      b.col(vx1 - 0.25, 0, z1, vx1, 2.8, vz1, {});
      b.col(vx0 + 0.25, 0, vz1 - 0.1, vx1 - 0.25, 2.5, vz1, {});
      K.anchor(ctx, "door", DCX, 0.12, vz1 + 0.9, false);
    }
    // ROOFTOP SIGN: "EMPIRE" cabinet + miniature Empire State Building
    {
      const sx = DCX,
        sz = DCZ,
        sy = 4.3;
      for (const dx of [-3.4, 3.4])
        b.beam("steel", sx + dx, 3.4, sz, sx + dx, sy + 0.2, sz, 0.18, 0.18);
      b.boxMM(
        "paint_black",
        sx - 4.2,
        sy,
        sz - 0.35,
        sx + 4.2,
        sy + 1.8,
        sz + 0.35,
        { tint: [0.08, 0.08, 0.08] },
      );
      b.boxMM("chrome", sx - 4.3, sy - 0.08, sz - 0.4, sx + 4.3, sy, sz + 0.4, {
        tint: [0.85, 0.87, 0.9],
      });
      b.boxMM(
        "chrome",
        sx - 4.3,
        sy + 1.8,
        sz - 0.4,
        sx + 4.3,
        sy + 1.88,
        sz + 0.4,
        { tint: [0.85, 0.87, 0.9] },
      );
      const em = K.neonCell("dn_empire", "EMPIRE", 768, 160, {
        color: "#f4f4ff",
        font: '"Arial Black", Impact, sans-serif',
        core: "#ffffff",
      });
      const emArt = K.signCell("dn_empire_day", "EMPIRE", 768, 160, {
        bg: "#0c0c0c",
        fg: "#e8e8e0",
        font: '"Arial Black", Impact, sans-serif',
        weather: true,
      });
      for (const nz of [-1, 1]) {
        b.plate("art", sx, sy + 0.9, sz + nz * 0.36, 0, nz, 8.2, 1.7, emArt);
        b.plate("neon", sx, sy + 0.9, sz + nz * 0.37, 0, nz, 8.0, 1.6, em, {
          tint: [0.8, 0.8, 0.85],
        });
        b.glow(sx, sy + 0.9, sz + nz * 1.4, [0.8, 0.85, 1.0], 6);
      }
      // the miniature Empire State Building on top of the sign
      const ey = sy + 1.88,
        ex = sx,
        ez = sz;
      const tiers = [
        [1.6, 1.0, 1.3],
        [1.2, 1.0, 1.0],
        [0.9, 0.9, 0.75],
        [0.62, 0.55, 0.5],
        [0.44, 0.4, 0.34],
      ];
      let y = ey;
      for (const [w, h, d] of tiers) {
        b.box("limestone", ex, y, ez, w, h, d, {
          tint: [0.92, 0.9, 0.86],
          grime: 0.2,
        });
        y += h;
      }
      b.cyl("chrome", ex, y, ez, 0.14, 0.1, 0.5, 8);
      b.cyl("chrome", ex, y + 0.5, ez, 0.06, 0.02, 0.9, 6);
      b.geo("lamp", K.sphereGeo(), {
        x: ex,
        y: y + 1.45,
        z: ez,
        s: 0.07,
        tint: [1, 0.2, 0.1],
      });
      b.glow(ex, y + 1.45, ez, [1, 0.2, 0.1], 1.4);
      for (let k = 0; k < 4; k++) {
        const yy = ey + 0.3 + k * 0.9;
        b.plate("lamp", ex, yy, ez + 0.66 - k * 0.06, 0, 1, 0.08, 0.5, null, {
          tint: [0.95, 0.85, 0.55],
        });
      }
      b.glow(ex, ey + 2.2, ez, [0.9, 0.8, 0.55], 2.5);
    }
    // KITCHEN ANNEX (brick, east end) + smokestack
    b.boxMM("brick_brown", x1 - 0.6, 0.12, z0 - 0.5, x1 + 5.5, 3.6, z1 - 1.5, {
      tint: [0.7, 0.55, 0.46],
    });
    b.col(x1 - 0.6, 0, z0 - 0.5, x1 + 5.5, 3.6, z1 - 1.5, {});
    b.boxMM("metal_dark", x1 - 0.8, 3.6, z0 - 0.7, x1 + 5.7, 3.8, z1 - 1.3, {
      tint: [0.3, 0.3, 0.3],
    });
    b.cyl("rust", x1 + 4, 3.8, z0 + 1.2, 0.35, 0.35, 3.2, 10);
    b.cyl("rust", x1 + 4, 7.0, z0 + 1.2, 0.5, 0.2, 0.4, 10);
    K.window(b, x1 + 5.5, 1.9, z0 + 3, 1, 0, 1.2, 1.2, {
      state: "boarded",
      surround: "brick_brown",
      surroundTint: [0.55, 0.42, 0.36],
    });
    b.boxMM("metal_dark", x1 + 1.5, 0.12, z1 - 1.52, x1 + 2.6, 2.3, z1 - 1.45, {
      tint: [0.4, 0.42, 0.4],
    }); // back door
    // the cellar bulkhead (slanted doors) by the annex — this is where the back steps come out
    b.quadN(
      "metal_dark",
      [x1 + 1, 0.12, z0 - 3.2],
      [x1 + 3.2, 0.12, z0 - 3.2],
      [x1 + 3.2, 0.9, z0 - 0.6],
      [x1 + 1, 0.9, z0 - 0.6],
      [0, 0.95, -0.3],
      { tint: [0.35, 0.3, 0.26] },
    );
    b.boxMM("concrete", x1 + 0.9, 0.12, z0 - 3.3, x1 + 1.0, 0.9, z0 - 0.5, {});
    b.boxMM("concrete", x1 + 3.2, 0.12, z0 - 3.3, x1 + 3.3, 0.9, z0 - 0.5, {});
    b.col(x1 + 0.9, 0, z0 - 3.3, x1 + 3.3, 0.9, z0 - 0.5, {});
    b.beam(
      "rust",
      x1 + 2.1,
      0.5,
      z0 - 3.1,
      x1 + 2.1,
      0.92,
      z0 - 0.8,
      0.04,
      0.04,
    );
    b.plate(
      "decal",
      x1 + 2.1,
      0.55,
      z0 - 1.9,
      0,
      1,
      1.2,
      0.6,
      K.tag("KEEP OUT - GUS", "#e8e040", 256, 96),
    );
    // tall pole sign with a clock at the corner
    {
      const px = x0 - 1.8,
        pz = 76.8;
      b.pipe("chrome", px, 0, pz, px, 7.2, pz, 0.12, 8);
      b.boxMM("paint_black", px - 1.6, 5.2, pz - 0.2, px + 1.6, 6.6, pz + 0.2, {
        tint: [0.1, 0.1, 0.1],
      });
      b.plate(
        "neon",
        px,
        5.9,
        pz + 0.21,
        0,
        1,
        3.0,
        1.2,
        K.neonCell("dn_eat", "EAT", 384, 160, {
          color: "#ff3a28",
          font: '"Arial Black", sans-serif',
        }),
      );
      b.plate(
        "neon",
        px,
        5.9,
        pz - 0.21,
        0,
        -1,
        3.0,
        1.2,
        K.neonCell("dn_eat", "EAT", 384, 160, {
          color: "#ff3a28",
          font: '"Arial Black", sans-serif',
        }),
      );
      b.glow(px, 5.9, pz + 0.8, [1, 0.25, 0.15], 3.6);
      b.cyl("chrome", px, 7.2, pz, 0.8, 0.8, 0.25, 16);
      b.plate(
        "art",
        px,
        7.6,
        pz + 0.14,
        0,
        1,
        1.2,
        1.2,
        K.paint("art", "dn_clock", 128, 128, (x, X, Y, W, H) => {
          x.clearRect(X, Y, W, H);
          x.fillStyle = "#f0ece0";
          x.beginPath();
          x.arc(X + W / 2, Y + H / 2, W * 0.46, 0, 6.3);
          x.fill();
          x.strokeStyle = "#111";
          x.lineWidth = 6;
          x.stroke();
          x.lineWidth = 4;
          x.beginPath();
          x.moveTo(X + W / 2, Y + H / 2);
          x.lineTo(X + W / 2 + 24, Y + H / 2 - 22);
          x.moveTo(X + W / 2, Y + H / 2);
          x.lineTo(X + W / 2 - 4, Y + H / 2 + 34);
          x.stroke();
          x.fillStyle = "#c81e1e";
          x.font = "bold 14px Arial";
          x.textAlign = "center";
          x.fillText("EMPIRE", X + W / 2, Y + H * 0.35);
        }),
        {},
      );
      b.col(px - 0.2, 0, pz - 0.2, px + 0.2, 7.2, pz + 0.2, {});
    }
    // patio: umbrella tables (one blown over), a Fizzo cooler
    for (const [tx, tz, fallen] of [
      [x0 + 1, 75, false],
      [x1 - 2, 75.2, false],
      [x1 + 3.5, 74.5, true],
    ]) {
      b.cyl("metal", tx, 0.12, tz, 0.6, 0.6, 0.04, 12, {
        tint: [0.4, 0.5, 0.45],
      });
      b.pipe("metal", tx, 0.12, tz, tx, 0.84, tz, 0.04, 6);
      b.cyl("metal", tx, 0.84, tz, 0.55, 0.55, 0.04, 12, {
        tint: [0.5, 0.6, 0.55],
      });
      if (!fallen) {
        b.pipe("steel", tx, 0.84, tz, tx, 2.5, tz, 0.025, 4);
        b.cyl("fabric", tx, 2.1, tz, 1.4, 0.05, 0.4, 8, {
          tint: r() < 0.5 ? [0.8, 0.3, 0.25] : [0.85, 0.82, 0.7],
        });
      } else {
        b.cyl("fabric", tx + 1.4, 0.12, tz + 0.4, 1.4, 0.05, 0.4, 8, {
          tint: [0.8, 0.3, 0.25],
        });
      }
      b.col(tx - 0.55, 0, tz - 0.55, tx + 0.55, 0.88, tz + 0.55, {
        tag: "furniture",
      });
    }
    // back yard: fence, tents, a Fizzo truck
    {
      const yz0 = 48,
        yz1 = z0 - 2.5;
      const fence = (ax, az, bx, bz) => {
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.ceil(len / 1.4);
        for (let k = 0; k < n; k++) {
          const t0 = k / n,
            t1 = (k + 1) / n,
            h = 1.9 + r() * 0.5,
            mat = r() < 0.5 ? "corrugated" : "wood_rotten";
          const X0 = ax + (bx - ax) * t0,
            Z0 = az + (bz - az) * t0,
            X1 = ax + (bx - ax) * t1,
            Z1 = az + (bz - az) * t1;
          b.quadN(
            mat,
            [X0, 0, Z0],
            [X1, 0, Z1],
            [X1, h, Z1],
            [X0, h, Z0],
            [(bz - az) / len, 0, (ax - bx) / len],
            { tint: [0.7 + r() * 0.2, 0.66, 0.6] },
          );
          b.quadN(
            mat,
            [X0, 0, Z0],
            [X1, 0, Z1],
            [X1, h, Z1],
            [X0, h, Z0],
            [(az - bz) / len, 0, (bx - ax) / len],
            { tint: [0.6, 0.56, 0.5] },
          );
        }
        b.col(
          Math.min(ax, bx) - 0.1,
          0,
          Math.min(az, bz) - 0.1,
          Math.max(ax, bx) + 0.1,
          2.2,
          Math.max(az, bz) + 0.1,
          { tag: "fence" },
        );
      };
      fence(-261, yz0, -219, yz0);
      fence(-261, yz0, -261, yz1);
      fence(-219, yz0, -219, yz1 - 3);
      for (const [tx, tz, yaw] of [
        [-256, 52.5, 0.2],
        [-249, 51.8, -0.1],
      ]) {
        const c = Math.cos(yaw),
          s = Math.sin(yaw);
        const P = (lx, ly, lz) => [
          tx + lx * c + lz * s,
          ly,
          tz - lx * s + lz * c,
        ];
        b.quadN(
          "fabric",
          P(-1.4, 0, -1.2),
          P(-1.4, 0, 1.2),
          P(0, 1.6, 1.2),
          P(0, 1.6, -1.2),
          [-c, 0.8, s],
          { tint: [0.55, 0.52, 0.4] },
        );
        b.quadN(
          "fabric",
          P(1.4, 0, 1.2),
          P(1.4, 0, -1.2),
          P(0, 1.6, -1.2),
          P(0, 1.6, 1.2),
          [c, 0.8, -s],
          { tint: [0.5, 0.48, 0.36] },
        );
        b.ocol(tx, tz, 2.8, 2.4, 0, 1.6, yaw, { tag: "tent" });
      }
      b.cyl("rust", -252.5, 0, 55.5, 0.35, 0.35, 0.8, 10); // cook fire barrel
      b.glow(-252.5, 1.1, 55.5, [1, 0.5, 0.2], 1.4);
      K.anchor(ctx, "yard", -245, 0, 54, false);
    }
    b.burn(x0 + 3, 2, z1, 3, 0.5);
    b.burn(x1 - 5, 3.2, z0, 4, 0.4);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_diner_ext";
    K.loot(ctx, "car", -226, 0, 75, 0.2, {
      world: true,
      kind: "sedan",
      wreck: true,
    });
    K.loot(ctx, "car", -255, 0, 58, 0.1, {
      world: true,
      kind: "fizzo_truck",
      stripped: true,
    });
    K.loot(ctx, "fizzo_machine", x0 + 2.5, 0.12, 73.2, PI, {
      world: true,
      loot: "fizzo_machine",
    });
    K.loot(ctx, "trash_can", x1 + 1.2, 0.12, 73.6, 0, {
      world: true,
      loot: "trash_can",
    });
    K.skel(ctx, x1 + 3.5, 0.12, 75.8, 1.2, "sitting", { world: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
